import Link from 'next/link';
import { ArrowRight, Bot, FileText, Mic, Radio } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';

const QUICK_ACTIONS = [
  {
    title: 'Text to Speech',
    description: 'Turn a script into natural narration.',
    href: '/app/text-to-speech',
    icon: Mic,
  },
  {
    title: 'Speech to Text',
    description: 'Transcribe audio with speaker labels.',
    href: '/app/speech-to-text',
    icon: FileText,
  },
  {
    title: 'Real-Time Playground',
    description: 'Talk to the model live in your browser.',
    href: '/app/playground',
    icon: Radio,
  },
  {
    title: 'AI Voice Agents',
    description: 'Deploy agents that answer calls.',
    href: '/app/agents',
    icon: Bot,
  },
];

export function QuickActions() {
  return (
    <Panel title="Quick actions">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border bg-field/50 p-3.5 transition-colors outline-none hover:border-brand/40 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">
                  {action.title}
                </span>
                <span className="block truncate text-[12px] text-ink-3">
                  {action.description}
                </span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </Panel>
  );
}
