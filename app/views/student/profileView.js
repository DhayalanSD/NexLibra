import { db } from '../../services/db.js';
import { getSession } from '../../services/auth.js';
import { computeLateFine } from '../../services/fines.js';

export function renderStudentProfile() {
  const root = document.getElementById('app');
  const session = getSession();
  const user = db.listUsers().find(u => u.id === session.userId);
  const books = db.listBooks();
  const txs = db.listTransactions().filter(t => t.userId === user.id);
  const active = txs.filter(t => t.status === 'issued');
  const history = txs.filter(t => t.status !== 'issued');

  const activeRows = active.map(t => {
    const b = books.find(x => x.id === t.bookId);
    const pending = computeLateFine(t.dueAt, Date.now());
    return `<tr><td>${b?.title}</td><td>${new Date(t.dueAt).toLocaleDateString()}</td><td>₹${pending}</td>
      <td class="nowrap"><button data-return="${t.id}">Return</button></td></tr>`;
  }).join('');

  const histRows = history.map(t => {
    const b = books.find(x => x.id === t.bookId);
    const total = (t.fines?.late || 0) + (t.fines?.replacement || 0);
    return `<tr><td>${b?.title}</td><td>${t.status}</td><td>₹${total}</td><td>${t.returnedAt?new Date(t.returnedAt).toLocaleDateString():'-'}</td></tr>`;
  }).join('');

  root.innerHTML = `
    <article>
      <h2>My Profile</h2>
      <p><strong>${user.name}</strong> • ${user.email} • ${user.dept || '-'}</p>
      <h3>Active Issues</h3>
      <div class="table-scroll"><table>
        <thead><tr><th>Book</th><th>Due</th><th>Pending Fine</th><th></th></tr></thead>
        <tbody>${activeRows || '<tr><td colspan="4" class="center muted">No active issues</td></tr>'}</tbody>
      </table></div>
      <h3>History</h3>
      <div class="table-scroll"><table>
        <thead><tr><th>Book</th><th>Status</th><th>Fines</th><th>Completed</th></tr></thead>
        <tbody>${histRows || '<tr><td colspan="4" class="center muted">No history</td></tr>'}</tbody>
      </table></div>
    </article>
  `;

  //root.querySelectorAll('button[data-return]').forEach(btn => btn.addEventListener('click', () => {
  //  try { db.returnBook(btn.dataset.return); renderStudentProfile(); } catch (e) { alert(e.message); }
  //}));
}



