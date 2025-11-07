import { login } from '../services/auth.js';

export function renderLogin() {
  const root = document.getElementById('app');
  root.innerHTML = `
    <article>
      <h2>Login</h2>
      <form id="login-form">
        <label>Email or Username<input name="identifier" required /></label>
        <label>Password<input type="password" name="password" required /></label>
        <button type="submit">Sign in</button>
      </form>
      <p class="muted">Admin: admin@nexlibra.local / admin123 <br>
Student: student1@college.edu / student123</p>
    </article>
  `;
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const identifier = fd.get('identifier');
    const password = fd.get('password');
    try {
      const session = await login(identifier, password);
      location.hash = session.role === 'admin' ? '#/admin' : '#/student';
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  });
}



