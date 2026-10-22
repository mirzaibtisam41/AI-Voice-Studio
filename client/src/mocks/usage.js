export const MONTHLY_USAGE = {
  labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  values: [120000, 148000, 136000, 172000, 198000, 231000, 260000],
};

export const DAILY_USAGE = {
  labels: ['Sep 26', 'Oct 1', 'Oct 6', 'Oct 11', 'Oct 16', 'Oct 21'],
  values: [6200, 8400, 7100, 9800, 8900, 11200],
};

export const USAGE_RANGES = [
  { value: 'months', label: 'Last 7 months', data: MONTHLY_USAGE },
  { value: 'days', label: 'Last 30 days', data: DAILY_USAGE },
];

export const USAGE_BY_FEATURE = [
  { label: 'Text to Speech', value: 92400, color: 'brand' },
  { label: 'Speech to Text', value: 21600, color: 'blue' },
  { label: 'Real-time', value: 28800, color: 'teal' },
  { label: 'Agents', value: 37600, color: 'amber' },
  { label: 'Enhancement', value: 6000, color: 'success' },
];

export const MONTHLY_ALLOWANCE = 500000;

export const USED_THIS_MONTH = USAGE_BY_FEATURE.reduce(
  (sum, item) => sum + item.value,
  0,
);

export const OVERVIEW_STATS = {
  audioGenerated: 186,
  minutesTranscribed: 842,
  activeAgents: 3,
  draftAgents: 1,
};
