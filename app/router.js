import { getSession } from './services/auth.js';
import { renderLogin } from './views/loginView.js';
import { renderAdminDashboard } from './views/admin/dashboardView.js';
import { renderAdminBooks } from './views/admin/booksView.js';
import { renderAdminIssue } from './views/admin/issueView.js';
import { renderAdminReturns } from './views/admin/returnsView.js';
import { renderAdminReports } from './views/admin/reportsView.js';
import { renderStudentsList } from './views/admin/studentsView.js';
import { renderAdminMissing } from './views/admin/missingView.js';
import { renderStudentDashboard } from './views/student/dashboardView.js';
import { renderStudentSearch } from './views/student/searchView.js';
import { renderStudentProfile } from './views/student/profileView.js';

const appEl = () => document.getElementById('app');

const routes = {
  '#/login': () => renderLogin(),
  '#/admin': guard('admin', () => renderAdminDashboard()),
  '#/admin/books': guard('admin', () => renderAdminBooks()),
  '#/admin/issue': guard('admin', () => renderAdminIssue()),
  '#/admin/returns': guard('admin', () => renderAdminReturns()),
  '#/admin/missing': guard('admin', () => renderAdminMissing()),
  '#/admin/reports': guard('admin', () => renderAdminReports()),
  '#/admin/students': guard('admin', () => renderStudentsList()),
  '#/student': guard('student', () => renderStudentDashboard()),
  '#/student/search': guard('student', () => renderStudentSearch()),
  '#/student/profile': guard('student', () => renderStudentProfile()),
};

function guard(role, handler) {
  return () => {
    const session = getSession();
    if (!session || session.role !== role) {
      location.hash = '#/login';
      return renderLogin();
    }
    return handler();
  };
}

function handleRoute() {
  const hash = location.hash || '#/login';
  const match = routes[hash];
  if (match) return match();
  appEl().innerHTML = `<article><h3>Not Found</h3><p>Route ${hash} not found.</p></article>`;
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}


