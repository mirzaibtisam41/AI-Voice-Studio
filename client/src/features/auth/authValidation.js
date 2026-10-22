const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (value) => value.length >= 8,
  },
  { id: 'number', label: 'One number', test: (value) => /\d/.test(value) },
  {
    id: 'letter',
    label: 'One letter',
    test: (value) => /[a-z]/i.test(value),
  },
];

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

export function emailError(value) {
  if (!value.trim()) return 'Enter your email address';
  if (!isValidEmail(value)) return 'Enter a valid email address';

  return null;
}

export function nameError(value) {
  if (value.trim().length < 2) return 'Name must be at least 2 characters';

  return null;
}

export function isStrongPassword(value) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function newPasswordErrors({ password, confirm }) {
  return {
    password: isStrongPassword(password)
      ? null
      : 'Password does not meet the requirements',
    confirm: confirm === password ? null : 'Passwords do not match',
  };
}
