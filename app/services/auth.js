import { storage } from './storage.js';

export async function hashPassword(password) {
  try {
    if (crypto?.subtle) {
      const enc = new TextEncoder();
      const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
      const arr = Array.from(new Uint8Array(buf));
      return arr.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (_) { /* fall through to legacy */ }
  return legacyHash(password);
}

function legacyHash(str) {
  // Non-cryptographic fallback hash (for insecure contexts). DO NOT use in production.
  let h1 = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = (h1 + ((h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24))) >>> 0;
  }
  return ('00000000' + h1.toString(16)).slice(-8).repeat(8);
}

const SESSION_KEY = 'nexlibra:session';

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
}

export function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function login(identifier, password) {
  const users = storage.get('users', []);
  const ident = String(identifier).toLowerCase();
  const user = users.find(u => (u.email && u.email.toLowerCase() === ident) || (u.username && u.username.toLowerCase() === ident));
  if (!user) throw new Error('Invalid credentials');
  const hashed = await hashPassword(password);
  if (hashed !== user.passwordHash) throw new Error('Invalid credentials');
  const session = { userId: user.id, role: user.role, email: user.email, name: user.name };
  setSession(session);
  return session;
}

export function logout() { clearSession(); }


