import { db } from '../../services/db.js';
import { showModal } from '../../components/modal.js';
import { DEPARTMENTS } from '../../constants/departments.js';

export function renderAdminBooks() {
  const root = document.getElementById('app');
  const books = db.listBooks();
  const rows = books.map(b => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.dept}</td>
      <td class="nowrap">₹${b.price}</td>
      <td>${b.availableCopies}/${b.totalCopies}</td>
      <td>${b.status}</td>
      <td class="nowrap">
        <button data-edit="${b.id}" class="secondary">Edit</button>
        <button data-del="${b.id}" class="contrast">Delete</button>
      </td>
    </tr>
  `).join('');

  root.innerHTML = `
    <article>
      <header class="toolbar">
        <h2>Books</h2>
        <button id="add-book">Add Book</button>
      </header>
      <div class="table-scroll">
        <table>
          <thead>
            <tr><th>Title</th><th>Author</th><th>Dept</th><th>Price</th><th>Avail</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="7" class="center muted">No books</td></tr>'}</tbody>
        </table>
      </div>
    </article>
  `;

  document.getElementById('add-book').addEventListener('click', () => openForm());
  root.querySelectorAll('button[data-edit]').forEach(btn => btn.addEventListener('click', () => openForm(btn.dataset.edit)));
  root.querySelectorAll('button[data-del]').forEach(btn => btn.addEventListener('click', () => del(btn.dataset.del)));

  function openForm(id) {
    const book = id ? db.listBooks().find(b => b.id === id) : null;
    const title = book ? 'Edit Book' : 'Add Book';
    const formHtml = `
      <form id="book-form">
        <label>Title<input name="title" required value="${book?.title || ''}" /></label>
        <label>Author<input name="author" required value="${book?.author || ''}" /></label>
        <label>Department<select name="dept" required>
          ${DEPARTMENTS.map(d => `<option ${book?.dept===d?'selected':''}>${d}</option>`).join('')}
        </select></label>
        <label>Price<input name="price" type="number" min="0" required value="${book?.price || 0}" /></label>
        <label>Total Copies<input name="totalCopies" type="number" min="1" required value="${book?.totalCopies || 1}" /></label>
        <footer class="toolbar">
          <button type="submit">Save</button>
          <button type="button" class="secondary" id="cancel">Cancel</button>
        </footer>
      </form>`;
    const modal = showModal(title, formHtml);
    const form = modal.querySelector('#book-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.price = Number(payload.price);
      payload.totalCopies = Number(payload.totalCopies);
      if (book) {
        const delta = payload.totalCopies - book.totalCopies;
        db.updateBook(book.id, { ...payload, availableCopies: book.availableCopies + delta });
      } else {
        db.addBook(payload);
      }
      modal.remove();
      renderAdminBooks();
    });
    modal.querySelector('#cancel').addEventListener('click', () => modal.remove());
  }

  function del(id) {
    if (confirm('Delete this book?')) {
      db.deleteBook(id);
      renderAdminBooks();
    }
  }
}



