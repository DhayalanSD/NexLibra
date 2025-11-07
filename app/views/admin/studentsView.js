import { db } from '../../services/db.js';
import { computeLateFine } from '../../services/fines.js';
import { DEPARTMENTS } from '../../constants/departments.js';
import { hashPassword } from '../../services/auth.js';

export function renderStudentsList() {
  const root = document.getElementById('app');
  const users = db.listUsers().filter(u => u.role === 'student');
  const txs = db.listTransactions();
  const sections = DEPARTMENTS.map(d => {
    const group = users.filter(u => u.dept === d);
    const rows = group.map(s => {
      const active = txs.filter(t => t.userId === s.id && t.status === 'issued');
      const fines = active.reduce((sum, t) => sum + computeLateFine(t.dueAt, Date.now()), 0);
      return `<tr>
        <td>${s.studentId || '-'}</td>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${active.length}</td>
        <td>₹${fines}</td>
      </tr>`;
    }).join('');
    if (!rows) return '';
    return `
      <h4>${d}</h4>
      <div class="table-scroll">
        <table>
          <thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Active Issues</th><th>Outstanding Fines</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).join('');

  root.innerHTML = `
    <article>
      <header class="toolbar"><h2>Students</h2><button id="add-student">Add Student</button></header>
      ${sections || '<p class="center muted">No students</p>'}
    </article>
  `;
  document.getElementById('add-student').addEventListener('click', () => openForm());

  // inline edit buttons per department tables
  root.querySelectorAll('tbody tr').forEach(tr => {
    // enhance each row with edit button at the end if not present
    if (!tr.querySelector('button[data-edit]')) {
      const td = document.createElement('td');
      td.innerHTML = '<button class="secondary" data-edit>Edit</button>';
      tr.appendChild(td);
      const idCell = tr.children[0];
      const nameCell = tr.children[1];
      const emailCell = tr.children[2];
      const student = users.find(u => (u.studentId||'') === idCell.textContent && u.name === nameCell.textContent && u.email === emailCell.textContent);
      td.querySelector('button').addEventListener('click', () => openForm(student));
    }
  });

  async function openForm(student) {
    const isEdit = !!student;
    const html = `
      <form id="student-form" class="grid grid-2">
        <label>Student ID<input name="studentId" required value="${student?.studentId||''}" /></label>
        <label>Name<input name="name" required value="${student?.name||''}" /></label>
        <label>Email<input name="email" type="email" required value="${student?.email||''}" /></label>
        <label>Department<select name="dept" required>${DEPARTMENTS.map(d=>`<option ${student?.dept===d?'selected':''}>${d}</option>`).join('')}</select></label>
        <label>Username<input name="username" required value="${student?.username||''}" /></label>
        <label>Password<input name="password" type="password" ${isEdit?'':'required'} placeholder="${isEdit?'(leave blank to keep)':''}" /></label>
        <footer class="toolbar"><button type="submit">${isEdit?'Save':'Create'}</button><button type="button" class="secondary" id="cancel">Cancel</button></footer>
      </form>`;
    const wrapper = document.createElement('div'); wrapper.className='modal-backdrop'; wrapper.innerHTML = `<div class="modal"><h3>${isEdit?'Edit':'Add'} Student</h3>${html}</div>`; document.body.appendChild(wrapper);
    const form = wrapper.querySelector('#student-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      if (!payload.password) delete payload.password;
      try {
        if (isEdit) {
          const updates = { studentId: payload.studentId, name: payload.name, email: payload.email, dept: payload.dept, username: payload.username };
          if (payload.password) updates.passwordHash = await hashPassword(payload.password);
          db.updateUser(student.id, updates);
        } else {
          const newUser = { studentId: payload.studentId, name: payload.name, email: payload.email, dept: payload.dept, username: payload.username, passwordHash: await hashPassword(payload.password), role: 'student' };
          db.addUser(newUser);
        }
        wrapper.remove();
        renderStudentsList();
      } catch (err) { alert(err.message); }
    });
    wrapper.querySelector('#cancel').addEventListener('click', () => wrapper.remove());
  }
}


