'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { cn } from '@/lib/utils';
import { ENABLED_VOICES } from '@/mocks/voices';
import { RESPONSE_STYLES } from '@/features/playground/conversationScript';

export function SessionSettings({ settings, onChange, disabled }) {
  const update = (key) => (value) => onChange({ ...settings, [key]: value });

  return (
    <Panel
      title="Session settings"
      description={
        disabled ? 'End the conversation to change settings.' : undefined
      }
    >
      <Field id="playground-voice" label="Agent voice">
        <Select
          value={settings.voice}
          onValueChange={update('voice')}
          disabled={disabled}
        >
          <SelectTrigger id="playground-voice">
            <SelectValue placeholder="Choose a voice" />
          </SelectTrigger>
          <SelectContent>
            {ENABLED_VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name} — {voice.accent}
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
        <legend className="mb-1.5 text-sm font-medium">Response style</legend>
        <ChoiceChips
          label="Response style"
          options={RESPONSE_STYLES}
          value={settings.style}
          onChange={update('style')}
        />
      </fieldset>
      <Field id="playground-instructions" label="Instructions">
        <Textarea
          id="playground-instructions"
          rows={4}
          value={settings.instructions}
          onChange={(event) => update('instructions')(event.target.value)}
          disabled={disabled}
          className="disabled:opacity-60"
        />
      </Field>
      <ToggleRow
        id="playground-captions"
        label="Show live captions"
        description="Display the conversation as text while you talk."
        checked={settings.captions}
        onChange={update('captions')}
        disabled={disabled}
      />
    </Panel>
  );
}
