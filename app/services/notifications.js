import { storage } from './storage.js';
import { db } from './db.js';

function load() { return storage.get('notifications', []); }
function save(list) { storage.set('notifications', list); }

export function listForUser(userId) {
  return load().filter(n => n.userId === userId).sort((a,b)=> a.at - b.at);
}

export function markAllRead(userId) {
  const list = load();
  list.forEach(n => { if (n.userId === userId) n.read = true; });
  save(list);
}

export function enqueue({ userId, type, txId, message }) {
  const list = load();
  // prevent duplicates for the same tx/type
  if (txId && list.some(n => n.txId === txId && n.type === type)) return;
  list.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random(), userId, type, txId: txId || null, message, at: Date.now(), read: false });
  save(list);
}

export function scanDueSoon(days = 2) {
  const txs = db.listTransactions().filter(t => t.status === 'issued');
  const now = Date.now();
  const windowMs = days * 86400000;
  txs.forEach(t => {
    const delta = t.dueAt - now;
    if (delta > 0 && delta <= windowMs) {
      enqueue({ userId: t.userId, type: 'due_soon', txId: t.id, message: 'Return book within 2 days to avoid fine.' });
    }
  });
}


