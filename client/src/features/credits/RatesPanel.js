import { Panel } from '@/components/ui/Panel';
import {
  CREDITS_PER_MINUTE,
  TTS_CHARACTERS_PER_CREDIT,
} from '@/constants/pricing';

const RATES = [
  {
    feature: 'Text to Speech',
    rate: `1 credit / ${TTS_CHARACTERS_PER_CREDIT} characters`,
  },
  {
    feature: 'Speech to Text',
    rate: `${CREDITS_PER_MINUTE.speechToText} credit / minute`,
  },
  {
    feature: 'Real-time & voice agents',
    rate: `${CREDITS_PER_MINUTE.realtime} credits / minute`,
  },
  {
    feature: 'Voice Transformation',
    rate: `${CREDITS_PER_MINUTE.voiceTransformation} credits / minute`,
  },
  {
    feature: 'Audio Enhancement',
    rate: `${CREDITS_PER_MINUTE.enhancement} credit / minute`,
  },
];

export function RatesPanel() {
  return (
    <Panel
      title="What credits cost"
      description="This is a free demo. Every account gets its credits once at signup."
    >
      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
        {RATES.map((item) => (
          <li
            key={item.feature}
            className="flex flex-col gap-1 rounded-xl border bg-field/60 px-4 py-3"
          >
            <span className="text-[12.5px] text-muted-foreground">
              {item.feature}
            </span>
            <span className="font-mono text-[13px] font-semibold text-brand">
              {item.rate}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
