const SESSION_KEY = 'avs-demo-session';
const WALLET_KEY = 'avs-demo-wallet';

function readJson(key) {
  try {
    const saved = window.sessionStorage.getItem(key);

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function remove(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    return;
  }
}

export function readDemoSession() {
  return readJson(SESSION_KEY);
}

export function saveDemoSession(user) {
  writeJson(SESSION_KEY, user);
}

export function readDemoWallet() {
  return readJson(WALLET_KEY);
}

export function saveDemoWallet(wallet) {
  writeJson(WALLET_KEY, wallet);
}

export function clearDemoSession() {
  remove(SESSION_KEY);
  remove(WALLET_KEY);
}

export function buildDemoUser({ name, email }) {
  const fallbackName = email.split('@')[0];

  return {
    id: 'u_demo',
    name: name?.trim() || fallbackName,
    email: email.trim().toLowerCase(),
    role: 'admin',
    joinedAt: new Date().toISOString(),
  };
}
