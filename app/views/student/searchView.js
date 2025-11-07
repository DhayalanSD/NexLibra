import { db } from '../../services/db.js';
import { getSession } from '../../services/auth.js';
import { DEPARTMENTS } from '../../constants/departments.js';

export function renderStudentSearch() {
  const root = document.getElementById('app');
  const books = db.listBooks().filter(b => b.status === 'active');
  const fuse = new window.Fuse(books, { includeScore: true, threshold: 0.4, keys: ['title', 'author', 'dept'] });
  root.innerHTML = `
    <article>
      <h2>Search & Issue</h2>
      <form id="search-form" class="grid grid-3">
        <input name="q" placeholder="Title or Author" />
        <select name="dept">
          <option value="">All Departments</option>
          ${DEPARTMENTS.map(d => `<option>${d}</option>`).join('')}
        </select>
        <button type="submit">Search</button>
      </form>
      <form id="issue-preferences" class="grid grid-3" style="margin-top: .5rem">
        <label>Return by (max 10 days)
          <input type="date" name="due" required />
        </label>
      </form>
      <div class="table-scroll"><table>
        <thead><tr><th>Title</th><th>Author</th><th>Dept</th><th>Price</th><th>Avail</th><th></th></tr></thead>
        <tbody id="results"></tbody>
      </table></div>
    </article>
  `;

  const res = root.querySelector('#results');
  function render(list) {
    res.innerHTML = list.map(b => `<tr>
      <td>${b.title}</td><td>${b.author}</td><td>${b.dept}</td><td>₹${b.price}</td><td>${b.availableCopies}</td>
      <td><button data-issue="${b.id}" ${b.availableCopies<=0?'disabled':''}>Issue</button></td>
    </tr>`).join('') || '<tr><td colspan="6" class="center muted">No results</td></tr>';
    res.querySelectorAll('button[data-issue]').forEach(btn => btn.addEventListener('click', () => issue(btn.dataset.issue)));
  }
  // Sort by department then title
  const sorted = [...books].sort((a,b)=> a.dept.localeCompare(b.dept) || a.title.localeCompare(b.title));
  render(sorted);

  root.querySelector('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get('q')||'').toLowerCase();
    const dept = fd.get('dept');
    let filtered;
    if (q) {
      const res = fuse.search(q);
      filtered = res.map(r => r.item).filter(b => !dept || b.dept === dept);
    } else {
      filtered = books.filter(b => !dept || b.dept === dept);
    }
    const sortedF = [...filtered].sort((a,b)=> a.dept.localeCompare(b.dept) || a.title.localeCompare(b.title));
    render(sortedF);
  });

  function issue(bookId) {
    const session = getSession();
    const prefs = document.getElementById('issue-preferences');
    const dueStr = new FormData(prefs).get('due');
    if (!dueStr) { alert('Please select a return date up to 10 days.'); return; }
    const today = new Date(); today.setHours(0,0,0,0);
    const max = new Date(); max.setDate(max.getDate()+10); max.setHours(23,59,59,0);
    const due = new Date(`${dueStr}T23:59:59`);
    if (due < today || due > max) { alert('Return date must be within next 10 days.'); return; }
    const dueAt = due.getTime();
    try { db.issueBook({ userId: session.userId, bookId, dueAt }); alert('Issued'); renderStudentSearch(); } catch (e) { alert(e.message); }
  }
}


