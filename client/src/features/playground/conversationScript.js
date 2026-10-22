export const CONVERSATION_SCRIPT = [
  {
    speaker: 'user',
    text: 'Hi! I need help planning the launch of our new mobile app next month.',
  },
  {
    speaker: 'agent',
    text: 'Happy to help. Who is the launch for, and what is the one thing you want people to do on day one?',
  },
  {
    speaker: 'user',
    text: 'Small business owners. We want them to sign up for the free trial.',
  },
  {
    speaker: 'agent',
    text: 'Great. I would start with a waitlist page two weeks out, then a short demo video and an email sequence of three messages.',
  },
  {
    speaker: 'user',
    text: 'What should go in the first email?',
  },
  {
    speaker: 'agent',
    text: 'Lead with the problem you solve, show one screenshot, and end with a single button to join the trial. Keep it under 120 words.',
  },
  {
    speaker: 'user',
    text: 'And how do we measure if the launch worked?',
  },
  {
    speaker: 'agent',
    text: 'Track trial sign-ups, activation within 48 hours, and week-one retention. Set a target for each before launch day.',
  },
];

export const RESPONSE_STYLES = ['Concise', 'Balanced', 'Detailed'];

export const DEFAULT_INSTRUCTIONS =
  'You are a friendly assistant for AI Voice Studio. Keep answers short.';

export const REALTIME_MODEL = 'gpt-realtime-2.1-mini';
