const REPLIES = [
  {
    keywords: ['refund', 'money back'],
    reply:
      'Unused credits can be refunded within 14 days of purchase. I can open a refund request for you — what is the email on the account?',
  },
  {
    keywords: ['bill', 'invoice', 'charge', 'payment', 'card'],
    reply:
      'You can find every invoice under Billing in your account. If a charge looks wrong, tell me the date and amount and I will check it.',
  },
  {
    keywords: ['password', 'log in', 'login', 'sign in', 'locked'],
    reply:
      'No problem. Use “Forgot password” on the sign-in page and we will email you a reset link. It expires after 30 minutes.',
  },
  {
    keywords: ['price', 'pricing', 'plan', 'cost', 'credit'],
    reply:
      'Every account starts with 10,000 free credits. Text to speech uses 1 credit per character and real-time conversations use 20 credits per minute.',
  },
  {
    keywords: ['book', 'meeting', 'demo', 'call', 'schedule'],
    reply:
      'Sure! I have openings tomorrow at 10:00 and 14:30. Which time works best for you?',
  },
  {
    keywords: ['order', 'shipping', 'delivery'],
    reply:
      'Happy to check that. Please share your order number and I will look up the latest status.',
  },
  {
    keywords: ['voice', 'voices'],
    reply:
      'There are several built-in voices, from warm narration to crisp corporate tones. You can preview them in the Text to Speech studio.',
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    reply: 'Hello! What can I help you with today?',
  },
  {
    keywords: ['thank'],
    reply: 'You are welcome! Is there anything else I can help with?',
  },
];

const FALLBACK_REPLY =
  'Thanks for the question. I can help with billing, passwords, pricing, refunds and bookings — could you tell me a bit more?';

export function findAgentReply(message) {
  const text = message.toLowerCase();
  const match = REPLIES.find(({ keywords }) =>
    keywords.some((keyword) => new RegExp(`\\b${keyword}`, 'i').test(text)),
  );

  return match?.reply ?? FALLBACK_REPLY;
}
