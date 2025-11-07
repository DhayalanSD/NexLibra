import { db } from '../../services/db.js';

export function renderAdminMissing() {
  const root = document.getElementById('app');
  const books = db.listBooks();
  const users = db.listUsers();
  const txs = db.listTransactions().filter(t => t.status === 'missing');

  const rows = txs.map(t => {
    const b = books.find(x => x.id === t.bookId);
    const u = users.find(x => x.id === t.userId);
    const fine = (t.fines?.late || 0) + (t.fines?.replacement || 0);
    return `<tr>
      <td>${b?.title || '-'}</td>
      <td>${b?.author || '-'}</td>
      <td>${b?.dept || '-'}</td>
      <td>${u?.name || u?.email || '-'}</td>
      <td>₹${b?.price ?? '-'}</td>
      <td>₹${fine}</td>
      <td>${new Date(t.fines?.computedAt || t.issuedAt).toLocaleDateString()}</td>
    </tr>`;
  }).join('');

  const missingOnlyRows = books.filter(b => b.status === 'missing' && !txs.some(t => t.bookId === b.id)).map(b => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.dept}</td>
      <td>₹${b.price}</td>
      <td>-</td>
      <td>-</td>
    </tr>
  `).join('');

  root.innerHTML = `
    <article>
      <h2>Missing Books</h2>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Title</th><th>Author</th><th>Dept</th><th>Student</th><th>Price</th><th>Total Fine</th><th>Marked On</th></tr></thead>
          <tbody>
            ${rows || ''}
            ${missingOnlyRows || ''}
            ${(!rows && !missingOnlyRows) ? '<tr><td colspan="7" class="center muted">No missing books</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </article>
  `;
}


