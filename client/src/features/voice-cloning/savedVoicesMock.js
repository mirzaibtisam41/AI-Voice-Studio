export const SAVED_VOICES = [
  {
    id: 'clone-narrator',
    name: 'My Narrator Voice',
    samples: 3,
    quality: 92,
    status: 'ready',
    color: 'brand',
  },
  {
    id: 'clone-cohost',
    name: 'Podcast Co-host',
    samples: 2,
    quality: 78,
    status: 'ready',
    color: 'teal',
  },
];

export const CLONE_COLORS = ['blue', 'amber', 'success', 'brand', 'teal'];

export const MIN_SAMPLES = 2;
export const MAX_SAMPLES = 5;

export function sampleQuality(name) {
  let state = 7;

  for (const char of name) {
    state = (state * 31 + char.charCodeAt(0)) >>> 0;
  }

  return 76 + (state % 22);
}
