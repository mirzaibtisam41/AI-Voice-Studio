import {
  Accessibility,
  AudioLines,
  Bot,
  Clapperboard,
  CreditCard,
  FileText,
  Gamepad2,
  GraduationCap,
  Headphones,
  Library,
  Megaphone,
  Podcast,
  Radio,
  Boxes,
} from 'lucide-react';

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Use cases', href: '#use-cases' },
  { label: 'Credits', href: '#credits' },
  { label: 'FAQ', href: '#faq' },
];

export const DEMO_VOICES = [
  { value: 'marin', label: 'Marin' },
  { value: 'cedar', label: 'Cedar' },
  { value: 'coral', label: 'Coral' },
  { value: 'ash', label: 'Ash' },
];

export const DEMO_TEXT =
  'Welcome to AI Voice Studio. Type anything you like and hear it spoken in a natural, expressive voice within seconds.';

export const DEMO_CHARACTER_LIMIT = 200;

export const FEATURES = [
  {
    icon: AudioLines,
    title: 'Text to Speech',
    description:
      'Turn scripts into natural speech with built-in voices, styles and speed control.',
  },
  {
    icon: FileText,
    title: 'Speech to Text',
    description:
      'Upload a recording and get a clean transcript with the detected language.',
  },
  {
    icon: Radio,
    title: 'Real-Time Playground',
    description:
      'Talk to the model live by voice and hear it answer instantly.',
  },
  {
    icon: Bot,
    title: 'AI Voice Agents',
    description:
      'Build voice agents with their own instructions, voice and greeting.',
  },
  {
    icon: Library,
    title: 'Audio Library',
    description: 'Every file you generate, searchable and ready to download.',
  },
  {
    icon: CreditCard,
    title: 'Credits',
    description: 'One balance for every tool, with a clear cost on every job.',
  },
];

export const TRANSCRIPT_TEXT =
  'Thanks for joining. Let’s walk through the launch plan. The voiceovers are ready in English and Spanish, and we’ll add French and German before Friday.';

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Hindi',
  'Urdu',
  'Arabic',
  'Japanese',
  'Korean',
  'Chinese',
  'Turkish',
  'Dutch',
];

export const STEPS = [
  {
    title: 'Write or upload',
    description:
      'Paste a script for speech, or drop in an audio file to transcribe.',
  },
  {
    title: 'Pick a voice',
    description: 'Choose a built-in voice, then set the style and speed.',
  },
  {
    title: 'Generate and refine',
    description:
      'Listen in seconds and tweak the text or settings until it sounds right.',
  },
  {
    title: 'Export and share',
    description:
      'Download MP3, WAV and more, or find it later in your audio library.',
  },
];

export const USE_CASES = [
  {
    icon: Clapperboard,
    title: 'Content creators',
    description: 'Voiceovers for videos, shorts and explainers.',
  },
  {
    icon: Boxes,
    title: 'Product teams',
    description: 'Add speech and voice input to your app.',
  },
  {
    icon: Headphones,
    title: 'Support teams',
    description: 'Voice agents that answer questions around the clock.',
  },
  {
    icon: GraduationCap,
    title: 'E-learning',
    description: 'Narrate courses in every language you teach.',
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    description: 'Localized ads and campaigns in a single afternoon.',
  },
  {
    icon: Podcast,
    title: 'Podcasters',
    description: 'Transcripts of every episode, ready to edit.',
  },
  {
    icon: Gamepad2,
    title: 'Game studios',
    description: 'Prototype character dialogue at scale.',
  },
  {
    icon: Accessibility,
    title: 'Accessibility',
    description: 'Make every article and document listenable.',
  },
];

export const TESTIMONIALS = [
  {
    quote:
      'We localized our entire video library into six languages in a week. The voices are good enough that viewers never ask.',
    name: 'Leah Okafor',
    role: 'Head of Content, Northfield Media',
    initials: 'LO',
  },
  {
    quote:
      'We set up a voice agent with our support playbook in an afternoon. Testing it in the browser felt like talking to a teammate.',
    name: 'Tomás Reyes',
    role: 'Support Lead, Brightlane',
    initials: 'TR',
  },
  {
    quote:
      'One credit balance for TTS, transcription and agents made it easy to try everything in a single afternoon.',
    name: 'Priya Nair',
    role: 'Product Manager, Kitewave',
    initials: 'PN',
  },
];

export const FAQS = [
  {
    question: 'How do credits work?',
    answer:
      'Every account gets free credits once at signup and every tool draws from that one balance. Each tool has its own rate, listed in the credits section above, and you always see the cost before you run anything.',
  },
  {
    question: 'Can I use the audio in my projects?',
    answer:
      'AI Voice Studio is a free demo project, so audio you create here is meant for trying things out, not for commercial use.',
  },
  {
    question: 'Which languages are supported?',
    answer:
      'Speech generation and transcription work in many languages. Transcription returns the text of your recording along with the languages it detected.',
  },
  {
    question: 'Which AI models power the studio?',
    answer:
      'Speech, transcription, real-time conversations and voice agents run on OpenAI models. The exact model behind each tool is listed next to its rate in the credits section.',
  },
  {
    question: 'What happens to my data?',
    answer:
      'Your uploads and generated audio are private to your account. Text and audio are sent to OpenAI only to produce your results, and you can delete any file at any time.',
  },
  {
    question: 'Do I ever have to pay?',
    answer:
      'No. There are no subscriptions, plans or card details. You get free credits once when you sign up, and that is all you need to try every tool.',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Text to Speech', href: '#features' },
      { label: 'Speech to Text', href: '#features' },
      { label: 'Voice Agents', href: '#features' },
      { label: 'Credits', href: '#credits' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Customers', href: '#testimonials' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API reference', href: '#' },
      { label: 'Status', href: '#' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Acceptable use', href: '#' },
    ],
  },
];
