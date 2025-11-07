import { logout, getSession } from '../../services/auth.js';

export function renderAdminDashboard() {
  const root = document.getElementById('app');
  const user = getSession();
  nav();
  root.innerHTML = `
    <article>
      <h2>Admin Dashboard</h2>
      <p>Welcome, ${user?.name || 'Admin'}.</p>
      <div class="grid grid-3">
        <a href="#/admin/books" role="button">Manage Books</a>
        <a href="#/admin/issue" role="button" class="secondary">Issue Books</a>
        <a href="#/admin/returns" role="button" class="secondary">Returns</a>
        <a href="#/admin/missing" role="button" class="secondary">Missing Books</a>
        <a href="#/admin/students" role="button" class="secondary">Students</a>
        <a href="#/admin/reports" role="button" class="secondary">Reports</a>
      </div>
    </article>
  `;
}

function nav() {
  const nav = document.getElementById('nav-actions');
  nav.innerHTML = `
    <li><a href="#/admin">Dashboard</a></li>
    <li><a href="#/login" id="logout">Logout</a></li>
  `;
  document.getElementById('logout').addEventListener('click', () => logout());
}


