export const AGENT_MODEL = 'gpt-realtime-2.1-mini';

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AGENT_RESPONSE_STYLES = ['Concise', 'Balanced', 'Detailed'];

export const AGENT_STATUSES = {
  live: { tone: 'success', label: 'Live' },
  draft: { tone: 'neutral', label: 'Draft' },
  paused: { tone: 'warning', label: 'Paused' },
};

export const AGENT_TOOLS = [
  {
    id: 'order-status',
    label: 'Look up order status',
    description: 'Checks where an order is using the order number.',
  },
  {
    id: 'support-ticket',
    label: 'Create support ticket',
    description: 'Opens a ticket for the support team with a summary.',
  },
  {
    id: 'book-meeting',
    label: 'Book a meeting',
    description: 'Finds a free slot on the team calendar and books it.',
  },
  {
    id: 'help-center',
    label: 'Search help center',
    description: 'Searches published help articles for an answer.',
  },
];

export const AGENTS = [
  {
    id: 'agent-support-concierge',
    name: 'Support Concierge',
    description: 'Answers billing, account and pricing questions 24/7.',
    voice: 'coral',
    status: 'live',
    sessions: 1284,
    weeklySessions: [168, 194, 212, 187, 203, 162, 158],
    avgDuration: 142,
    resolvedRate: 78,
    resolvedTrend: '+4% vs last month',
    intents: ['Billing', 'Password reset', 'Pricing', 'Refunds'],
    greeting: "Hi! I'm Support Concierge. How can I help today?",
    instructions:
      'You are the support concierge for AI Voice Studio. Answer billing, account and pricing questions in a warm, clear tone. Hand off to a human if the customer asks twice.',
    responseStyle: 'Balanced',
    tools: ['order-status', 'support-ticket', 'help-center'],
    knowledge:
      'Signup includes 10,000 free credits. Refunds are possible within 14 days for unused credits.',
  },
  {
    id: 'agent-booking-assistant',
    name: 'Booking Assistant',
    description: 'Books demos and onboarding calls with the sales team.',
    voice: 'verse',
    status: 'live',
    sessions: 512,
    weeklySessions: [74, 88, 81, 92, 79, 52, 46],
    avgDuration: 98,
    resolvedRate: 84,
    resolvedTrend: '+2% vs last month',
    intents: ['Book demo', 'Reschedule', 'Pricing', 'Team plans'],
    greeting: "Hi! I'm Booking Assistant. Want to book a demo or a call?",
    instructions:
      'You help visitors book a demo or onboarding call. Ask for their name, email and preferred time, then confirm the booking.',
    responseStyle: 'Concise',
    tools: ['book-meeting', 'help-center'],
    knowledge: 'Demos run Monday to Friday, 9am to 5pm, and last 30 minutes.',
  },
  {
    id: 'agent-onboarding-guide',
    name: 'Onboarding Guide',
    description: 'Walks new users through their first audio project.',
    voice: 'shimmer',
    status: 'draft',
    sessions: 88,
    weeklySessions: [9, 14, 12, 16, 15, 11, 11],
    avgDuration: 205,
    resolvedRate: 69,
    resolvedTrend: '-3% vs last month',
    intents: ['First project', 'Voices', 'Credits', 'Exports'],
    greeting: "Hi! I'm Onboarding Guide. Ready to make your first audio?",
    instructions:
      'You guide new users through creating their first text to speech project. Explain one step at a time and check they are ready before moving on.',
    responseStyle: 'Detailed',
    tools: ['help-center'],
    knowledge:
      'Text to speech costs 1 credit per character. Audio can be exported as MP3 or WAV.',
  },
];
