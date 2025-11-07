import { initRouter } from './router.js';
import { ensureSeeded } from './data/seed.js';
import { getSession } from './services/auth.js';
import { scanDueSoon, listForUser, markAllRead } from './services/notifications.js';
import { toast } from './components/toast.js';

// Bootstrapping
async function bootstrap() {
  await ensureSeeded();
  initTheme();
  // background reminder scan
  scanDueSoon(2);
  setInterval(() => scanDueSoon(2), 60000);
  // show student popups on load
  const s = getSession();
  if (s?.role === 'student') {
    const notices = listForUser(s.userId).filter(n => !n.read);
    notices.slice(-3).forEach(n => toast(n.message));
    markAllRead(s.userId);
  }
  initRouter();
}

bootstrap();

function initTheme() {
  const KEY = 'nexlibra:theme';
  const saved = localStorage.getItem(KEY);
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    // reflect current state
    btn.checked = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      btn.checked = next === 'dark';
    });
  }
}


