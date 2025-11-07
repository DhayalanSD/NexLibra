import { db } from '../../services/db.js';
import { DEPARTMENTS } from '../../constants/departments.js';

export function renderAdminIssue() {
  const root = document.getElementById('app');
  const students = db.listUsers().filter(u => u.role === 'student');
  const books = db.listBooks().filter(b => b.status === 'active' && b.availableCopies > 0);
  const booksSorted = [...books].sort((a,b)=> a.dept.localeCompare(b.dept) || a.title.localeCompare(b.title));
  root.innerHTML = `
    <article>
      <h2>Issue Book</h2>
      <form id="issue-form" class="grid grid-3">
        <label>Student<select name="userId" required>${students.map(s => `<option value="${s.id}">${s.name} (${s.email})</option>`).join('')}</select></label>
        <label>Book<select name="bookId" required>${booksSorted.map(b => `<option value="${b.id}">${b.dept} • ${b.title} [${b.availableCopies}]</option>`).join('')}</select></label>
        <label>Due Date<input type="date" name="due" required /></label>
        <div class="spacer"></div>
        <button type="submit">Issue</button>
      </form>
    </article>
  `;
  const form = document.getElementById('issue-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const userId = fd.get('userId');
    const bookId = fd.get('bookId');
    const due = new Date(`${fd.get('due')}T23:59:59`).getTime();
    try {
      db.issueBook({ userId, bookId, dueAt: due });
      alert('Issued');
      renderAdminIssue();
    } catch (err) {
      alert(err.message);
    }
  });
}


