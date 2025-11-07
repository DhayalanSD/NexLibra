import { storage } from './storage.js';
import { computeLateFine, computeMissingFine } from './fines.js';
import { uuid } from '../utils/uuid.js';
import { enqueue } from './notifications.js';

function save(key, value) { storage.set(key, value); }
function load(key) { return storage.get(key, []); }

export const db = {
  // Users
  listUsers() { return load('users'); },
  getUser(id) { return load('users').find(u => u.id === id); },
  addUser(user) {
    const users = load('users');
    if (user.username && users.some(u => (u.username||'').toLowerCase() === user.username.toLowerCase())) throw new Error('Username already exists');
    if (user.email && users.some(u => (u.email||'').toLowerCase() === user.email.toLowerCase())) throw new Error('Email already exists');
    if (user.studentId && users.some(u => (u.studentId||'').toLowerCase() === String(user.studentId).toLowerCase())) throw new Error('Student ID already exists');
    const newUser = { id: uuid(), role: 'student', dept: '', ...user };
    users.push(newUser);
    save('users', users);
    return newUser;
  },
  updateUser(id, updates) {
    const users = load('users');
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const next = { ...users[idx], ...updates };
    if (next.username && users.some((u,i)=> i!==idx && (u.username||'').toLowerCase() === next.username.toLowerCase())) throw new Error('Username already exists');
    if (next.email && users.some((u,i)=> i!==idx && (u.email||'').toLowerCase() === next.email.toLowerCase())) throw new Error('Email already exists');
    if (next.studentId && users.some((u,i)=> i!==idx && (u.studentId||'').toLowerCase() === String(next.studentId).toLowerCase())) throw new Error('Student ID already exists');
    users[idx] = next;
    save('users', users);
    return users[idx];
  },

  // Books
  listBooks() { return load('books'); },
  addBook(book) {
    const books = load('books');
    const newBook = { id: uuid(), availableCopies: book.totalCopies, status: 'active', ...book };
    books.push(newBook);
    save('books', books);
    audit('book.add', newBook.id);
    return newBook;
  },
  updateBook(id, updates) {
    const books = load('books');
    const idx = books.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Book not found');
    books[idx] = { ...books[idx], ...updates };
    if (books[idx].availableCopies > books[idx].totalCopies) {
      books[idx].availableCopies = books[idx].totalCopies;
    }
    save('books', books);
    audit('book.edit', id);
    return books[idx];
  },
  deleteBook(id) {
    const books = load('books');
    const next = books.filter(b => b.id !== id);
    save('books', next);
    audit('book.delete', id);
  },

  // Transactions
  listTransactions() { return load('transactions'); },
  listUserActiveIssues(userId) {
    return load('transactions').filter(t => t.userId === userId && t.status === 'issued');
  },
  issueBook({ userId, bookId, dueAt }) {
    const users = load('users');
    const books = load('books');
    const txs = load('transactions');
    const user = users.find(u => u.id === userId);
    const book = books.find(b => b.id === bookId);
    if (!user || !book) throw new Error('User or book not found');
    if (user.role !== 'student') throw new Error('Only students can be issued books');
    const active = txs.filter(t => t.userId === userId && t.status === 'issued').length;
    if (active >= 2) throw new Error('Borrow limit reached');
    if (book.availableCopies <= 0) throw new Error('No copies available');
    const tx = { id: uuid(), userId, bookId, issuedAt: Date.now(), dueAt, status: 'issued', fines: { late: 0, replacement: 0, computedAt: Date.now() } };
    txs.push(tx);
    book.availableCopies -= 1;
    save('transactions', txs);
    save('books', books);
    audit('book.issue', tx.id, userId);
    return tx;
  },
  returnBook(txId) {
    const txs = load('transactions');
    const books = load('books');
    const tx = txs.find(t => t.id === txId);
    if (!tx || tx.status !== 'issued') throw new Error('Transaction not found');
    const end = Date.now();
    const late = computeLateFine(tx.dueAt, end);
    tx.fines.late = late;
    tx.fines.computedAt = end;
    tx.status = 'returned';
    tx.returnedAt = end;
    const book = books.find(b => b.id === tx.bookId);
    if (book) book.availableCopies += 1;
    save('transactions', txs);
    save('books', books);
    audit('book.return', tx.id, tx.userId);
    if (late > 0) {
      enqueue({ userId: tx.userId, type: 'fine_added', txId: tx.id, message: `A late fine of ₹${late} was added on your returned book.` });
    }
    return tx;
  },
  markMissing(txId) {
    const txs = load('transactions');
    const books = load('books');
    const tx = txs.find(t => t.id === txId);
    if (!tx || tx.status !== 'issued') throw new Error('Transaction not found');
    const book = books.find(b => b.id === tx.bookId);
    const end = Date.now();
    const late = computeLateFine(tx.dueAt, end);
    const replacement = computeMissingFine(book?.price || 0, late);
    tx.fines.late = late;
    tx.fines.replacement = replacement;
    tx.fines.computedAt = end;
    tx.status = 'missing';
    if (book) book.status = 'missing';
    save('transactions', txs);
    save('books', books);
    audit('book.missing', tx.id, tx.userId);
    enqueue({ userId: tx.userId, type: 'book_missing', txId: tx.id, message: `Book marked missing. Replacement fine ₹${replacement} applied.` });
    return tx;
  },

  // Audit & Reports
  listAudit() { return load('audit'); },
  report(rangeStart, rangeEnd) {
    const audit = load('audit').filter(a => a.at >= rangeStart && a.at <= rangeEnd);
    const txs = load('transactions').filter(t => t.issuedAt >= rangeStart && (t.returnedAt || t.fines.computedAt || Date.now()) <= rangeEnd);
    const finesCollected = txs
      .filter(t => t.status !== 'issued')
      .reduce((sum, t) => sum + (t.fines?.late || 0) + (t.fines?.replacement || 0), 0);
    const counts = type => audit.filter(a => a.type === type).length;
    return {
      counts: {
        added: counts('book.add'), edited: counts('book.edit'), deleted: counts('book.delete'),
        issued: counts('book.issue'), returned: counts('book.return'), missing: counts('book.missing')
      },
      finesCollected,
      audit,
      txs,
    };
  },
};

function audit(type, refId, byUserId) {
  const events = load('audit');
  events.push({ id: uuid(), type, refId, byUserId: byUserId || null, at: Date.now() });
  save('audit', events);
}


