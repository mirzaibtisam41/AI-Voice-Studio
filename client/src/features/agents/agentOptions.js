export const AGENT_STATUSES = {
  live: { tone: 'success', label: 'Live' },
  draft: { tone: 'neutral', label: 'Draft' },
  paused: { tone: 'warning', label: 'Paused' },
};

export const AGENT_RESPONSE_STYLES = [
  { value: 'concise', label: 'Concise' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'detailed', label: 'Detailed' },
];

export const AGENT_TOOLS = [
  {
    id: 'order_status',
    label: 'Look up order status',
    description: 'Checks where an order is using the order number.',
  },
  {
    id: 'support_ticket',
    label: 'Create support ticket',
    description: 'Opens a ticket for the support team with a summary.',
  },
  {
    id: 'book_meeting',
    label: 'Book a meeting',
    description: 'Finds a free slot on the team calendar and books it.',
  },
  {
    id: 'help_center',
    label: 'Search help center',
    description: 'Searches published help articles for an answer.',
  },
];

export const AGENT_LIMITS = {
  name: 80,
  description: 300,
  greeting: 300,
  instructionsMin: 20,
  instructions: 4000,
  knowledge: 8000,
};

export function findVoiceName(voices, code) {
  return voices?.find((voice) => voice.code === code)?.name ?? code;
}
