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
  Mic,
  Podcast,
  Radio,
  Sparkles,
  Boxes,
  WandSparkles,
} from 'lucide-react';

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Use cases', href: '#use-cases' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export const HERO_STATS = [
  { value: '13', label: 'voices' },
  { value: '50+', label: 'languages' },
  { value: '<300ms', label: 'realtime latency' },
  { value: '25 MB', label: 'uploads' },
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
    description: 'Turn scripts into natural speech with 13 expressive voices.',
  },
  {
    icon: FileText,
    title: 'Speech to Text',
    description: 'Accurate transcripts with speakers, timestamps and language.',
  },
  {
    icon: Mic,
    title: 'Voice Cloning',
    description:
      'Record a minute of audio and create a voice that sounds like you.',
  },
  {
    icon: WandSparkles,
    title: 'Voice Transformation',
    description: 'Re-voice any recording while keeping its timing and emotion.',
  },
  {
    icon: Radio,
    title: 'Real-Time Playground',
    description:
      'Talk to the model live and tune voices with instant feedback.',
  },
  {
    icon: Bot,
    title: 'AI Voice Agents',
    description: 'Build agents that answer calls, guide users and take action.',
  },
  {
    icon: Sparkles,
    title: 'Audio Enhancement',
    description: 'Remove noise and echo and level loudness in one click.',
  },
  {
    icon: Library,
    title: 'Audio Library',
    description: 'Every file you generate, searchable and ready to download.',
  },
  {
    icon: CreditCard,
    title: 'Credits & Billing',
    description: 'One balance for every tool, with clear per-job pricing.',
  },
];

export const TRANSCRIPT_LINES = [
  {
    speaker: 'Maya',
    time: '00:02',
    text: 'Thanks for joining. Let’s walk through the launch plan.',
    tone: 'text-brand',
  },
  {
    speaker: 'Daniel',
    time: '00:07',
    text: 'Sure. The voiceovers are ready in English and Spanish.',
    tone: 'text-teal',
  },
  {
    speaker: 'Maya',
    time: '00:13',
    text: 'Great, let’s add French and German before Friday.',
    tone: 'text-brand',
  },
];

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
      'Paste a script, import a document or drop in an audio file up to 25 MB.',
  },
  {
    title: 'Pick a voice',
    description:
      'Choose from 13 built-in voices or your own clone, then set speed and style.',
  },
  {
    title: 'Generate and refine',
    description:
      'Preview in seconds, adjust pronunciation and regenerate only what changed.',
  },
  {
    title: 'Export and share',
    description:
      'Download MP3 or WAV, or share a link straight from your audio library.',
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
    description: 'Voice agents that resolve calls around the clock.',
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
    description: 'Transcripts, show notes and clean audio.',
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

export const YEARLY_DISCOUNT = 0.2;

export const PLANS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    credits: '10,000',
    description: 'Try every tool with no card required.',
    features: [
      '10,000 credits once',
      'Text to speech and transcription',
      '13 built-in voices',
      'Community support',
    ],
    cta: 'Start free',
  },
  {
    name: 'Creator',
    monthlyPrice: 12,
    credits: '150,000',
    description: 'For solo creators publishing every week.',
    features: [
      '150,000 credits per month',
      'Commercial use license',
      '1 custom voice clone',
      'Audio enhancement',
    ],
    cta: 'Choose Creator',
  },
  {
    name: 'Pro',
    monthlyPrice: 39,
    credits: '500,000',
    description: 'For teams shipping audio in production.',
    features: [
      '500,000 credits per month',
      '5 custom voice clones',
      'Real-time playground and agents',
      'Priority support',
    ],
    cta: 'Choose Pro',
    popular: true,
  },
  {
    name: 'Scale',
    monthlyPrice: null,
    credits: 'Custom',
    description: 'Volume pricing, SSO and dedicated support.',
    features: [
      'Custom credit volume',
      'Unlimited voice clones',
      'SSO and audit logs',
      'Dedicated success manager',
    ],
    cta: 'Contact sales',
  },
];

export const TOP_UP_PACKS = [
  { size: 'S', credits: '50,000', price: 9 },
  { size: 'M', credits: '150,000', price: 24, popular: true },
  { size: 'L', credits: '400,000', price: 59 },
  { size: 'XL', credits: '1,000,000', price: 129 },
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
      'Our support agent answers the phone in under a second and hands off cleanly. Call wait times dropped by half.',
    name: 'Tomás Reyes',
    role: 'Support Lead, Brightlane',
    initials: 'TR',
  },
  {
    quote:
      'One credit balance for TTS, transcription and agents made budgeting simple. Finance finally stopped asking questions.',
    name: 'Priya Nair',
    role: 'Product Manager, Kitewave',
    initials: 'PN',
  },
];

export const FAQS = [
  {
    question: 'How do credits work?',
    answer:
      'Every tool draws from one balance. Text to speech costs 1 credit per character, transcription 5 credits per minute and real-time conversations 20 credits per minute. You always see the estimated cost before you generate.',
  },
  {
    question: 'Can I use the audio commercially?',
    answer:
      'Yes. Audio created on any paid plan can be used in commercial projects, including ads, courses, apps and podcasts. Free plan audio is for personal and evaluation use.',
  },
  {
    question: 'Which languages are supported?',
    answer:
      'Speech generation and transcription support more than 50 languages, and transcription detects the spoken language automatically.',
  },
  {
    question: 'Do I need consent to clone a voice?',
    answer:
      'Yes. You can only clone your own voice or a voice you have written permission to use. Every clone requires a recorded consent statement before it is created.',
  },
  {
    question: 'What happens to my data?',
    answer:
      'Your uploads and generated audio are private to your workspace, encrypted at rest and never used to train models. You can delete any file at any time.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Cancel from the billing page and your plan stays active until the end of the billing period. Unused top-up credits never expire.',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Text to Speech', href: '#features' },
      { label: 'Speech to Text', href: '#features' },
      { label: 'Voice Agents', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
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
      { label: 'Voice consent', href: '#' },
    ],
  },
];
