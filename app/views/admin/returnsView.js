import { db } from '../../services/db.js';
import { computeLateFine } from '../../services/fines.js';

export function renderAdminReturns() {
  const root = document.getElementById('app');
  const txs = db.listTransactions().filter(t => t.status === 'issued');
  const books = db.listBooks();
  const users = db.listUsers();
  const rows = txs.map(t => {
    const b = books.find(x => x.id === t.bookId);
    const u = users.find(x => x.id === t.userId);
    const pending = computeLateFine(t.dueAt, Date.now());
    const mailSub = encodeURIComponent('Library Reminder');
    const mailBody = encodeURIComponent(`Dear ${u?.name || 'Student'},\n\nThis is a reminder to return the book '${b?.title}'. Pending fine (if overdue): ₹${pending}.\n\nRegards, Library`);
    return `<tr>
      <td>${u?.name || u?.email}</td>
      <td>${b?.title}</td>
      <td>${new Date(t.issuedAt).toLocaleDateString()}</td>
      <td>${new Date(t.dueAt).toLocaleDateString()}</td>
      <td>₹${pending}</td>
      <td class="nowrap">
        <button data-return="${t.id}">Return</button>
        <button data-missing="${t.id}" class="contrast">Mark Missing</button>
        <a href="mailto:${u?.email}?subject=${mailSub}&body=${mailBody}" class="secondary" title="Email Reminder">Email</a>
      </td>
    </tr>`;
  }).join('');

  root.innerHTML = `
    <article>
      <h2>Returns & Missing</h2>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Student</th><th>Book</th><th>Issued</th><th>Due</th><th>Pending Fine</th><th></th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6" class="center muted">No active issues</td></tr>'}</tbody>
        </table>
      </div>
    </article>
  `;

  root.querySelectorAll('button[data-return]').forEach(btn => btn.addEventListener('click', () => {
    try { db.returnBook(btn.dataset.return); renderAdminReturns(); } catch (e) { alert(e.message); }
  }));
  root.querySelectorAll('button[data-missing]').forEach(btn => btn.addEventListener('click', () => {
    if (!confirm('Mark as missing?')) return;
    try { db.markMissing(btn.dataset.missing); renderAdminReturns(); } catch (e) { alert(e.message); }
  }));
}


