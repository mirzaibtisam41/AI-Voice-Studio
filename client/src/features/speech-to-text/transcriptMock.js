export const MOCK_AUDIO_SECONDS = 142;

export const TRANSCRIPT_FORMATS = ['TXT', 'SRT', 'VTT', 'DOCX'];

export const INITIAL_SPEAKERS = {
  A: 'Speaker A',
  B: 'Speaker B',
};

export const MOCK_SEGMENTS = [
  {
    id: 'seg-1',
    speaker: 'A',
    start: 0,
    text: "Okay, let's get started. The goal today is to lock the scope for the onboarding redesign before the sprint planning on Thursday.",
  },
  {
    id: 'seg-2',
    speaker: 'B',
    start: 12,
    text: 'Sounds good. I pulled the funnel numbers this morning. About 38 percent of new signups drop off before they generate their first audio.',
  },
  {
    id: 'seg-3',
    speaker: 'A',
    start: 24,
    text: 'That matches what support is hearing. People land in the studio and do not know which voice to pick or what a credit actually buys them.',
  },
  {
    id: 'seg-4',
    speaker: 'B',
    start: 37,
    text: 'Right. So the proposal is a three step checklist on the overview page. Pick a voice, paste a script, generate a sample with the free credits.',
  },
  {
    id: 'seg-5',
    speaker: 'A',
    start: 51,
    text: 'I like it. Can we prefill the script with something short so the first generation costs a single credit?',
  },
  {
    id: 'seg-6',
    speaker: 'B',
    start: 63,
    text: 'Yes, the current preview line is ninety seven characters, so that works. We would also show the estimated cost right above the button.',
  },
  {
    id: 'seg-7',
    speaker: 'A',
    start: 76,
    text: 'What about transcription? Half of the agency accounts only use speech to text and never touch the voices.',
  },
  {
    id: 'seg-8',
    speaker: 'B',
    start: 88,
    text: 'Good point. The checklist can branch on the use case they choose at signup. Transcription users get an upload step instead.',
  },
  {
    id: 'seg-9',
    speaker: 'A',
    start: 102,
    text: 'Great. Let us keep the engineering estimate under two weeks. Design can share the updated flows by Monday.',
  },
  {
    id: 'seg-10',
    speaker: 'B',
    start: 118,
    text: 'I will write up the success metric. Target is moving first generation completion from 62 to 75 percent within the first month.',
  },
];
