'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LANGUAGES,
  OUTPUT_FORMATS,
  THEME_OPTIONS,
  readPreferences,
  savePreferences,
} from '@/features/settings/settingsOptions';
import { useSimulatedAction } from '@/features/settings/useSimulatedAction';
import { applyTheme, readTheme } from '@/lib/theme';
import { ENABLED_VOICES } from '@/mocks/voices';

function SelectField({ id, label, value, onChange, options }) {
  return (
    <Field id={id} label={label}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

const VOICE_OPTIONS = ENABLED_VOICES.map((voice) => ({
  value: voice.id,
  label: `${voice.name} · ${voice.accent} ${voice.gender.toLowerCase()}, ${voice.style.toLowerCase()}`,
}));

export function PreferenceSettings() {
  const [saved, setSaved] = useState(readPreferences);
  const [preferences, setPreferences] = useState(saved);
  const [theme, setTheme] = useState(readTheme);
  const { isRunning, run } = useSimulatedAction(800);
  const isChanged = Object.keys(preferences).some(
    (key) => preferences[key] !== saved[key],
  );

  const update = (key) => (value) =>
    setPreferences((current) => ({ ...current, [key]: value }));

  const handleThemeChange = (value) => {
    setTheme(value);
    applyTheme(value);
  };

  const handleSave = () =>
    run(() => {
      savePreferences(preferences);
      setSaved(preferences);
      toast.success('Preferences saved');
    });

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Studio defaults"
        description="Used when you start a new generation."
      >
        <SelectField
          id="pref-voice"
          label="Default voice"
          value={preferences.voiceId}
          onChange={update('voiceId')}
          options={VOICE_OPTIONS}
        />
        <SelectField
          id="pref-format"
          label="Default output format"
          value={preferences.outputFormat}
          onChange={update('outputFormat')}
          options={OUTPUT_FORMATS}
        />
        <SelectField
          id="pref-language"
          label="Default language"
          value={preferences.language}
          onChange={update('language')}
          options={LANGUAGES}
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!isChanged || isRunning}>
            {isRunning ? <Spinner /> : null}
            {isRunning ? 'Saving...' : 'Save preferences'}
          </Button>
        </div>
      </Panel>

      <Panel title="Appearance" description="Theme changes apply right away.">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium">Theme</p>
          <ChoiceChips
            label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            onChange={handleThemeChange}
          />
        </div>
      </Panel>
    </div>
  );
}
