import { getSession, logout } from '../../services/auth.js';

export function renderStudentDashboard() {
  const root = document.getElementById('app');
  const user = getSession();
  nav();
  root.innerHTML = `
    <article>
      <h2>Student Dashboard</h2>
      <p>Welcome, ${user?.name}.</p>
      <div class="grid grid-3">
        <a href="#/student/search" role="button">Search & Issue</a>
        <a href="#/student/profile" role="button" class="secondary">My Profile</a>
      </div>
    </article>
  `;
}

function nav() {
  const nav = document.getElementById('nav-actions');
  nav.innerHTML = `
    <li><a href="#/student">Dashboard</a></li>
    <li><a href="#/login" id="logout">Logout</a></li>
  `;
  document.getElementById('logout').addEventListener('click', () => logout());
}


