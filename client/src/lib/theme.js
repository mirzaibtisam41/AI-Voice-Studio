const DEFAULT_THEME = 'dark';
const THEME_KEY = 'avs-theme';

export const THEME_CHOICES = ['dark', 'light', 'system'];

export const THEME_INIT_SCRIPT = `(function(){var root=document.documentElement;try{var theme=localStorage.getItem('${THEME_KEY}')||'${DEFAULT_THEME}';var resolved=theme==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):theme;root.dataset.theme=resolved==='light'?'light':'dark';}catch(e){root.dataset.theme='${DEFAULT_THEME}';}})();`;

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

export function readTheme() {
  const theme = readStorage(THEME_KEY);

  return THEME_CHOICES.includes(theme) ? theme : DEFAULT_THEME;
}

export function applyTheme(theme) {
  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  document.documentElement.dataset.theme =
    resolved === 'light' ? 'light' : 'dark';
  writeStorage(THEME_KEY, theme);
}
