const REPLIES = [
  {
    keywords: ['refund', 'money back'],
    reply:
      'This is a free demo, so nothing is ever charged. If a run failed, its credits go back to your balance automatically.',
  },
  {
    keywords: ['bill', 'invoice', 'charge', 'payment', 'card', 'subscription'],
    reply:
      'There are no subscriptions or payments. Every credit you use is listed under Credits in your account.',
  },
  {
    keywords: ['password', 'log in', 'login', 'sign in', 'locked'],
    reply:
      'No problem. Use “Forgot password” on the sign-in page and we will email you a reset link. It expires after 30 minutes.',
  },
  {
    keywords: ['price', 'pricing', 'plan', 'cost', 'credit'],
    reply:
      'Every account starts with 50 free credits. Text to speech uses 1 credit per 100 characters, transcription 1 credit per minute and real-time conversations 3 credits per minute.',
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
  'Thanks for the question. I can help with credits, passwords, voices and bookings — could you tell me a bit more?';

export function findAgentReply(message) {
  const text = message.toLowerCase();
  const match = REPLIES.find(({ keywords }) =>
    keywords.some((keyword) => new RegExp(`\\b${keyword}`, 'i').test(text)),
  );

  return match?.reply ?? FALLBACK_REPLY;
}
