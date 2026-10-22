export const CURRENT_WALLET_BALANCE = 412000;

const TRANSACTION_ENTRIES = [
  {
    id: 'txn_015',
    date: '2026-10-21T16:12:00',
    description: 'Launch narration v2',
    feature: 'Text to Speech',
    type: 'usage',
    credits: -1240,
  },
  {
    id: 'txn_014',
    date: '2026-10-21T10:05:00',
    description: 'Podcast ep. 42 raw',
    feature: 'Speech to Text',
    type: 'usage',
    credits: -310,
  },
  {
    id: 'txn_013',
    date: '2026-10-20T14:30:00',
    description: 'Support agent — 38 calls',
    feature: 'Voice Agents',
    type: 'usage',
    credits: -24800,
  },
  {
    id: 'txn_012',
    date: '2026-10-19T13:43:00',
    description: 'Customer onboarding VO',
    feature: 'Text to Speech',
    type: 'usage',
    credits: -12150,
  },
  {
    id: 'txn_011',
    date: '2026-10-18T09:20:00',
    description: 'Refund — failed generation',
    feature: 'Text to Speech',
    type: 'refund',
    credits: 860,
  },
  {
    id: 'txn_010',
    date: '2026-10-18T09:12:00',
    description: 'Q3 earnings dub (ES)',
    feature: 'Text to Speech',
    type: 'usage',
    credits: -860,
  },
  {
    id: 'txn_009',
    date: '2026-10-16T11:00:00',
    description: 'Top-up M — 150,000 credits',
    feature: 'Billing',
    type: 'topup',
    credits: 150000,
  },
  {
    id: 'txn_008',
    date: '2026-10-15T17:45:00',
    description: 'Playground sessions',
    feature: 'Real-time',
    type: 'usage',
    credits: -11600,
  },
  {
    id: 'txn_007',
    date: '2026-10-12T14:02:00',
    description: 'Interview with J. Alvarez',
    feature: 'Enhancement',
    type: 'usage',
    credits: -420,
  },
  {
    id: 'txn_006',
    date: '2026-10-08T10:18:00',
    description: 'Course module 3 narration',
    feature: 'Text to Speech',
    type: 'usage',
    credits: -48400,
  },
  {
    id: 'txn_005',
    date: '2026-10-06T16:05:00',
    description: 'IVR agent — 12 calls',
    feature: 'Voice Agents',
    type: 'usage',
    credits: -12785,
  },
  {
    id: 'txn_004',
    date: '2026-10-05T13:20:00',
    description: 'Training module FR',
    feature: 'Text to Speech',
    type: 'usage',
    credits: -36200,
  },
  {
    id: 'txn_003',
    date: '2026-10-03T09:00:00',
    description: 'Top-up L — 400,000 credits',
    feature: 'Billing',
    type: 'topup',
    credits: 400000,
  },
  {
    id: 'txn_002',
    date: '2026-09-22T09:45:00',
    description: 'Standup recap',
    feature: 'Speech to Text',
    type: 'usage',
    credits: -95,
  },
  {
    id: 'txn_001',
    date: '2026-09-14T08:30:00',
    description: 'Signup bonus',
    feature: 'Billing',
    type: 'bonus',
    credits: 10000,
  },
];

function withBalances(entries, latestBalance) {
  let balance = latestBalance;

  return entries.map((entry) => {
    const row = { ...entry, balanceAfter: balance };
    balance -= entry.credits;

    return row;
  });
}

export const TRANSACTIONS = withBalances(
  TRANSACTION_ENTRIES,
  CURRENT_WALLET_BALANCE,
);

export const TRANSACTION_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'usage', label: 'Usage' },
  { value: 'topup', label: 'Top-ups' },
  { value: 'refund', label: 'Refunds' },
];

export function filterTransactions(transactions, filter) {
  if (filter === 'all') return transactions;
  if (filter === 'topup') {
    return transactions.filter(
      (transaction) =>
        transaction.type === 'topup' || transaction.type === 'bonus',
    );
  }

  return transactions.filter((transaction) => transaction.type === filter);
}
