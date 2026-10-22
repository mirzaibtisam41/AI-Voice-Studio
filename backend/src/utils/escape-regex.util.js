export function escapeRegexUtil({ text }) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
