'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  LANGUAGES,
  OUTPUT_FORMATS,
  THEME_OPTIONS,
} from '@/features/settings/settingsOptions';
import {
  useGetMySettingsQuery,
  useGetSettingsVoiceOptionsQuery,
  useUpdateMySettingsMutation,
} from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';
import { applyTheme, readTheme } from '@/lib/theme';

const NO_VOICE = 'none';

function SelectField({ id, label, value, onChange, options, disabled, hint }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
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

function voiceLabel(voice) {
  const details = [voice.accent, voice.gender].filter(Boolean).join(' ');
  const tags = voice.tags?.length ? `, ${voice.tags.join(', ')}` : '';

  return details ? `${voice.name} · ${details}${tags}` : voice.name;
}

function toForm(settings) {
  return {
    defaultVoiceCode: settings.defaultVoiceCode ?? NO_VOICE,
    defaultFormat: settings.defaultFormat,
    defaultLanguage: settings.defaultLanguage,
  };
}

function StudioDefaultsForm({ settings }) {
  const [saved, setSaved] = useState(() => toForm(settings));
  const [form, setForm] = useState(saved);
  const [error, setError] = useState('');
  const { data: voices = [], isLoading: isLoadingVoices } =
    useGetSettingsVoiceOptionsQuery();
  const [updateSettings, { isLoading }] = useUpdateMySettingsMutation();
  const isChanged = Object.keys(form).some((key) => form[key] !== saved[key]);

  const voiceOptions = [
    { value: NO_VOICE, label: 'No default' },
    ...voices.map((voice) => ({ value: voice.code, label: voiceLabel(voice) })),
  ];

  if (
    form.defaultVoiceCode !== NO_VOICE &&
    !voices.some((voice) => voice.code === form.defaultVoiceCode)
  ) {
    voiceOptions.push({
      value: form.defaultVoiceCode,
      label: `${form.defaultVoiceCode} (not available)`,
    });
  }

  const languageOptions = LANGUAGES.some(
    (language) => language.value === form.defaultLanguage,
  )
    ? LANGUAGES
    : [
        ...LANGUAGES,
        { value: form.defaultLanguage, label: form.defaultLanguage },
      ];

  const update = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    setError('');

    try {
      const updated = await updateSettings({
        defaultVoiceCode:
          form.defaultVoiceCode === NO_VOICE ? null : form.defaultVoiceCode,
        defaultFormat: form.defaultFormat,
        defaultLanguage: form.defaultLanguage,
      }).unwrap();
      const next = toForm(updated);

      setSaved(next);
      setForm(next);
      toast.success('Preferences saved');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <>
      <FormAlert>{error}</FormAlert>
      <SelectField
        id="pref-voice"
        label="Default voice"
        value={form.defaultVoiceCode}
        onChange={update('defaultVoiceCode')}
        options={voiceOptions}
        disabled={isLoadingVoices}
      />
      <SelectField
        id="pref-format"
        label="Default output format"
        value={form.defaultFormat}
        onChange={update('defaultFormat')}
        options={OUTPUT_FORMATS}
      />
      <SelectField
        id="pref-language"
        label="Default language"
        value={form.defaultLanguage}
        onChange={update('defaultLanguage')}
        options={languageOptions}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!isChanged || isLoading}>
          {isLoading ? <Spinner /> : null}
          {isLoading ? 'Saving...' : 'Save preferences'}
        </Button>
      </div>
    </>
  );
}

function StudioDefaultsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-label="Loading preferences">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function PreferenceSettings() {
  const { data: settings, isLoading, error, refetch } = useGetMySettingsQuery();
  const [theme, setTheme] = useState(readTheme);

  const handleThemeChange = (value) => {
    setTheme(value);
    applyTheme(value);
  };

  let defaults;

  if (isLoading) {
    defaults = <StudioDefaultsSkeleton />;
  } else if (!settings) {
    defaults = (
      <EmptyState
        title="Could not load your preferences"
        description={getErrorMessage(error)}
        action={
          <Button variant="outline" size="sm" onClick={refetch}>
            Try again
          </Button>
        }
      />
    );
  } else {
    defaults = <StudioDefaultsForm settings={settings} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Studio defaults"
        description="Used when you start a new generation."
      >
        {defaults}
      </Panel>

      <Panel
        title="Appearance"
        description="Theme changes apply right away on this device."
      >
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
