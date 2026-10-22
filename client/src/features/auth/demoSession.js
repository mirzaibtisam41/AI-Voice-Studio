const SESSION_KEY = 'avs-demo-session';

export function readDemoSession() {
  try {
    const saved = window.sessionStorage.getItem(SESSION_KEY);

    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveDemoSession(user) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    return;
  }
}

export function clearDemoSession() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
}

export function buildDemoUser({ name, email }) {
  const fallbackName = email.split('@')[0];

  return {
    id: 'u_demo',
    name: name?.trim() || fallbackName,
    email: email.trim().toLowerCase(),
    role: 'admin',
    plan: 'Pro',
    joinedAt: '2025-11-02',
  };
}
