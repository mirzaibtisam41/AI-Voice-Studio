import { AudioLines, Bot, Check, FileText } from 'lucide-react';
import { Waveform } from '@/components/audio/Waveform';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { TRANSCRIPT_TEXT } from '@/features/marketing/landingContent';
import { Overline } from '@/features/marketing/SectionHeading';
import { cn } from '@/lib/utils';

function MockCard({ icon: Icon, title, badge, children }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[0_30px_80px_-50px_var(--brand-glow)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-tint text-brand">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <p className="text-[13.5px] font-semibold">{title}</p>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function TranscriptMock() {
  return (
    <MockCard
      icon={FileText}
      title="launch-sync.mp3"
      badge={<StatusBadge tone="success">Completed</StatusBadge>}
    >
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {TRANSCRIPT_TEXT}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4 font-mono text-[11.5px] text-ink-3">
        <span>Detected language</span>
        <Tag>English</Tag>
      </div>
    </MockCard>
  );
}

function SpeechMock() {
  return (
    <MockCard
      icon={AudioLines}
      title="product-intro.mp3"
      badge={<StatusBadge tone="success">Ready</StatusBadge>}
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-xl border bg-field/60 p-3 text-[13.5px] leading-relaxed text-muted-foreground">
          Meet the new dashboard: everything your team needs, in one calm place.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Tag>Marin</Tag>
          <Tag>Cheerful</Tag>
          <Tag>1.0× speed</Tag>
          <Tag>MP3</Tag>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-field/60 px-3 py-2.5">
          <Waveform
            seed="speech-showcase"
            bars={40}
            progress={0.4}
            className="h-8 flex-1"
          />
        </div>
      </div>
    </MockCard>
  );
}

function AgentMock() {
  return (
    <MockCard
      icon={Bot}
      title="Support agent"
      badge={<StatusBadge tone="success">Live</StatusBadge>}
    >
      <div className="flex flex-col gap-3">
        <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[13.5px] text-brand-foreground">
          Hi, I need to move my delivery to Thursday.
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-field px-4 py-2.5 text-[13.5px]">
          Of course. I&apos;ve moved it to Thursday between 9 and 12. Anything
          else I can help with?
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-xl border bg-field/60 px-3 py-2">
          <Waveform
            seed="agent-showcase"
            bars={32}
            animated
            className="h-6 flex-1"
            barClassName="bg-teal"
          />
        </div>
      </div>
    </MockCard>
  );
}

const SHOWCASES = [
  {
    overline: 'Text to speech',
    title: 'Scripts that speak for themselves',
    description:
      'Paste your text, pick a built-in voice and a speaking style, and get natural speech you can play, download and keep in your library.',
    points: [
      'Built-in voices with styles and speed control',
      'MP3, WAV, Opus, AAC or FLAC output',
      'See the credit cost before you generate',
    ],
    Mock: SpeechMock,
  },
  {
    overline: 'Speech to text',
    title: 'Transcripts in a few seconds',
    description:
      'Upload a recording and get a clean transcript with the languages that were spoken, ready to edit or export.',
    points: [
      'Automatic language detection',
      'Edit the transcript in place',
      'Export as TXT, SRT or VTT',
    ],
    Mock: TranscriptMock,
  },
  {
    overline: 'Voice agents',
    title: 'Conversations that feel natural',
    description:
      'Real-time agents listen and answer in a natural voice, following the instructions and knowledge you give them.',
    points: [
      'Custom instructions, greeting and knowledge',
      'Pick the voice each agent speaks with',
      'Test by chat before you talk to it live',
    ],
    Mock: AgentMock,
  },
];

export function ShowcaseSection() {
  return (
    <section aria-label="Product highlights" className="px-4 pb-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 sm:gap-28">
        {SHOWCASES.map((showcase, index) => {
          const { Mock } = showcase;

          return (
            <div
              key={showcase.title}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <div
                className={cn(
                  'flex flex-col gap-4',
                  index % 2 === 1 && 'lg:order-2',
                )}
              >
                <Overline>{showcase.overline}</Overline>
                <h2 className="font-serif text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl">
                  {showcase.title}
                </h2>
                <p className="text-[15px] text-muted-foreground">
                  {showcase.description}
                </p>
                <ul className="mt-2 flex flex-col gap-2.5">
                  {showcase.points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                        <Check
                          className="size-3"
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-[14px]">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Mock />
            </div>
          );
        })}
      </div>
    </section>
  );
}
