const NS = 'nexlibra:';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(NS + key, JSON.stringify(value));
}

export const storage = {
  get(key, fallback) { return read(key, fallback); },
  set(key, value) { write(key, value); },
  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(NS))
      .forEach(k => localStorage.removeItem(k));
  },
};


