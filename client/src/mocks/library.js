export const LIBRARY_ITEMS = [
  {
    id: 'lib_launch_v2',
    title: 'Launch narration v2',
    type: 'generated',
    durationSeconds: 73,
    sizeBytes: 943718,
    createdAt: '2026-10-21T16:12:00',
    favorite: true,
    voiceId: 'marin',
  },
  {
    id: 'lib_podcast_42',
    title: 'Podcast ep. 42 raw',
    type: 'uploaded',
    durationSeconds: 3724,
    sizeBytes: 59768832,
    createdAt: '2026-10-21T10:05:00',
    favorite: false,
  },
  {
    id: 'lib_onboarding_vo',
    title: 'Customer onboarding VO',
    type: 'generated',
    durationSeconds: 148,
    sizeBytes: 2369536,
    createdAt: '2026-10-19T13:43:00',
    favorite: false,
    voiceId: 'coral',
  },
  {
    id: 'lib_q3_dub_es',
    title: 'Q3 earnings dub (ES)',
    type: 'generated',
    durationSeconds: 412,
    sizeBytes: 6592512,
    createdAt: '2026-10-18T09:12:00',
    favorite: true,
    voiceId: 'cedar',
  },
  {
    id: 'lib_support_call',
    title: 'Support call sample',
    type: 'transcription',
    durationSeconds: 386,
    sizeBytes: 6176768,
    createdAt: '2026-10-17T15:28:00',
    favorite: false,
  },
  {
    id: 'lib_course_m3',
    title: 'Course module 3 narration',
    type: 'generated',
    durationSeconds: 1265,
    sizeBytes: 20240384,
    createdAt: '2026-10-15T11:40:00',
    favorite: false,
    voiceId: 'ballad',
  },
  {
    id: 'lib_alvarez',
    title: 'Interview with J. Alvarez',
    type: 'transcription',
    durationSeconds: 2290,
    sizeBytes: 36634624,
    createdAt: '2026-10-12T14:02:00',
    favorite: true,
  },
  {
    id: 'lib_summer_ad',
    title: 'Ad read — summer promo',
    type: 'generated',
    durationSeconds: 31,
    sizeBytes: 495616,
    createdAt: '2026-10-10T17:55:00',
    favorite: false,
    voiceId: 'ash',
  },
  {
    id: 'lib_walkthrough_en',
    title: 'Product walkthrough EN',
    type: 'uploaded',
    durationSeconds: 534,
    sizeBytes: 8544256,
    createdAt: '2026-10-08T10:18:00',
    favorite: false,
  },
  {
    id: 'lib_narrator_voice',
    title: 'Brand narrator voice',
    type: 'voice',
    durationSeconds: 62,
    sizeBytes: 1992294,
    createdAt: '2026-10-07T09:30:00',
    favorite: true,
  },
  {
    id: 'lib_training_fr',
    title: 'Training module FR',
    type: 'generated',
    durationSeconds: 918,
    sizeBytes: 14688256,
    createdAt: '2026-10-05T13:20:00',
    favorite: false,
    voiceId: 'sage',
  },
  {
    id: 'lib_standup',
    title: 'Standup recap',
    type: 'transcription',
    durationSeconds: 1104,
    sizeBytes: 17664000,
    createdAt: '2026-10-03T09:45:00',
    favorite: false,
  },
  {
    id: 'lib_ivr_greeting',
    title: 'IVR greeting new',
    type: 'generated',
    durationSeconds: 18,
    sizeBytes: 288768,
    createdAt: '2026-10-02T16:05:00',
    favorite: false,
    voiceId: 'shimmer',
  },
  {
    id: 'lib_host_voice',
    title: 'Podcast host voice',
    type: 'voice',
    durationSeconds: 95,
    sizeBytes: 3040870,
    createdAt: '2026-10-01T12:00:00',
    favorite: false,
  },
];

export const LIBRARY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'generated', label: 'Generated' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'transcription', label: 'Transcriptions' },
  { value: 'voice', label: 'Voices' },
];

export const LIBRARY_SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'longest', label: 'Longest' },
  { value: 'name', label: 'Name A–Z' },
];

const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  longest: (a, b) => b.durationSeconds - a.durationSeconds,
  name: (a, b) => a.title.localeCompare(b.title),
};

export function getRecentLibraryItems(count = 5) {
  return [...LIBRARY_ITEMS].sort(SORTERS.newest).slice(0, count);
}

export function queryLibraryItems(
  items,
  { type = 'all', search = '', sort = 'newest', favoritesOnly = false },
) {
  const term = search.trim().toLowerCase();

  return items
    .filter((item) => type === 'all' || item.type === type)
    .filter((item) => !favoritesOnly || item.favorite)
    .filter((item) => !term || item.title.toLowerCase().includes(term))
    .sort(SORTERS[sort] ?? SORTERS.newest);
}
