'use client';

import Link from 'next/link';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { cn } from '@/lib/utils';

export function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

function AgentSummary({ agent, voiceName }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-field/50 p-3 text-[13px]">
      <p>
        Testing <span className="font-medium">{agent.name}</span> with the{' '}
        {voiceName} voice and {agent.responseStyle} replies. Its instructions
        and knowledge are used for this call.
      </p>
      <Link href="/app/playground" className="text-[12.5px] text-brand">
        Use the playground without an agent
      </Link>
    </div>
  );
}

export function SessionSettings({
  options,
  agent,
  settings,
  onChange,
  disabled,
}) {
  const update = (key) => (value) => onChange({ ...settings, [key]: value });

  if (!options) {
    return (
      <Panel title="Session settings">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </Panel>
    );
  }

  const voiceName = (code) =>
    options.voices.find((voice) => voice.code === code)?.name ?? code;

  return (
    <Panel
      title="Session settings"
      description={
        disabled ? 'End the conversation to change settings.' : undefined
      }
    >
      {agent ? (
        <AgentSummary agent={agent} voiceName={voiceName(agent.voiceCode)} />
      ) : (
        <>
          <Field id="playground-voice" label="Agent voice">
            <Select
              value={settings.voiceCode}
              onValueChange={update('voiceCode')}
              disabled={disabled}
            >
              <SelectTrigger id="playground-voice">
                <SelectValue placeholder="Choose a voice" />
              </SelectTrigger>
              <SelectContent>
                {options.voices.map((voice) => (
                  <SelectItem key={voice.code} value={voice.code}>
                    {voice.name}
                    {voice.accent ? ` — ${voice.accent}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <fieldset
            disabled={disabled}
            className={cn(
              'flex flex-col gap-1.5',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            <legend className="mb-1.5 text-sm font-medium">
              Response style
            </legend>
            <ChoiceChips
              label="Response style"
              options={options.responseStyles.map((style) => ({
                value: style,
                label: capitalize(style),
              }))}
              value={settings.responseStyle}
              onChange={update('responseStyle')}
            />
          </fieldset>
          <Field
            id="playground-instructions"
            label="Instructions"
            hint="Leave empty to use a friendly general assistant."
          >
            <Textarea
              id="playground-instructions"
              rows={4}
              value={settings.instructions}
              maxLength={options.instructionsMaxLength}
              onChange={(event) => update('instructions')(event.target.value)}
              disabled={disabled}
              aria-describedby="playground-instructions-hint"
              className="disabled:opacity-60"
            />
          </Field>
        </>
      )}
      <ToggleRow
        id="playground-captions"
        label="Show live captions"
        description="Display the conversation as text while you talk."
        checked={settings.captions}
        onChange={update('captions')}
      />
    </Panel>
  );
}
