import { Bot, Check, FileText, Mic } from 'lucide-react';
import { Waveform } from '@/components/audio/Waveform';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TRANSCRIPT_LINES } from '@/features/marketing/landingContent';
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
      <ul className="flex flex-col gap-4">
        {TRANSCRIPT_LINES.map((line) => (
          <li key={line.time} className="flex gap-3">
            <span className="w-11 shrink-0 pt-0.5 font-mono text-[11.5px] text-ink-3">
              {line.time}
            </span>
            <div className="min-w-0">
              <p className={cn('text-[12.5px] font-semibold', line.tone)}>
                {line.speaker}
              </p>
              <p className="text-[13.5px] text-muted-foreground">{line.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-2 border-t pt-4 font-mono text-[11.5px] text-ink-3">
        <span>English</span>
        <span aria-hidden="true">·</span>
        <span>2 speakers</span>
        <span aria-hidden="true">·</span>
        <span>12:48</span>
      </div>
    </MockCard>
  );
}

function CloningMock() {
  return (
    <MockCard
      icon={Mic}
      title="New voice clone"
      badge={<StatusBadge tone="brand">Recording</StatusBadge>}
    >
      <div className="flex flex-col items-center gap-5 py-2">
        <div className="relative flex size-20 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/40"
          />
          <span className="relative flex size-20 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_12px_40px_-10px_var(--brand-glow)]">
            <Mic className="size-8" aria-hidden="true" />
          </span>
        </div>
        <Waveform
          seed="clone-showcase"
          bars={40}
          progress={0.62}
          className="h-10 w-full"
        />
        <div className="w-full">
          <div className="mb-2 flex justify-between text-[12px]">
            <span className="text-muted-foreground">Sample quality</span>
            <span className="font-mono text-ink-3">0:38 / 1:00</span>
          </div>
          <div
            role="progressbar"
            aria-label="Recording progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={62}
            className="h-1.5 overflow-hidden rounded-full bg-field"
          >
            <div className="h-full w-[62%] rounded-full bg-brand" />
          </div>
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
          <span className="font-mono text-[11.5px] text-ink-3">240ms</span>
        </div>
      </div>
    </MockCard>
  );
}

const SHOWCASES = [
  {
    overline: 'Speech to text',
    title: 'Transcripts that read like a script',
    description:
      'Upload a recording and get a clean transcript with speakers, timestamps and the detected language, ready to edit or export.',
    points: [
      'Speaker labels and word-level timestamps',
      'Automatic language detection',
      'Export to TXT, SRT or VTT',
    ],
    Mock: TranscriptMock,
  },
  {
    overline: 'Voice cloning',
    title: 'Your voice, available on demand',
    description:
      'Record about a minute of clean audio and create a private voice you can use across text to speech and agents.',
    points: [
      'Guided recording with live quality checks',
      'Consent verification built in',
      'Private to your workspace',
    ],
    Mock: CloningMock,
  },
  {
    overline: 'Voice agents',
    title: 'Conversations that feel instant',
    description:
      'Real-time agents listen, think and answer in a natural voice with latency low enough to feel like a person on the line.',
    points: [
      'Sub-300ms responses with interruptions',
      'Custom instructions and knowledge',
      'Transcripts of every conversation',
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
