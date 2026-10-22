'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { NoticeAlert } from '@/features/admin/shared/NoticeAlert';
import { simulateWork } from '@/features/admin/shared/adminFormat';
import {
  ADMIN_MODELS,
  CAPABILITY_LABELS,
  CAPABILITY_TAGS,
} from '@/mocks/adminModels';
import { PLATFORM_SETTINGS } from '@/mocks/adminSettings';

const NUMBER_FIELDS = [
  'signupCredits',
  'maxTtsCharacters',
  'maxUploadMb',
  'realtimeSessionMinutes',
];

function NumberField({ id, label, hint, value, onChange, suffix }) {
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-16 font-mono"
        />
        {suffix ? (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[12px] text-ink-3">
            {suffix}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

function toDraft(settings) {
  return {
    ...settings,
    ...Object.fromEntries(
      NUMBER_FIELDS.map((key) => [key, String(settings[key])]),
    ),
  };
}

export function PlatformSettingsView() {
  const [saved, setSaved] = useState(() => toDraft(PLATFORM_SETTINGS));
  const [draft, setDraft] = useState(() => toDraft(PLATFORM_SETTINGS));
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.supportEmail);
  const valid =
    draft.platformName.trim() &&
    emailValid &&
    Number(draft.signupCredits) >= 0 &&
    NUMBER_FIELDS.filter((key) => key !== 'signupCredits').every(
      (key) => Number(draft[key]) > 0,
    );

  function set(key) {
    return (value) => setDraft((current) => ({ ...current, [key]: value }));
  }

  function setDefaultModel(capability, modelId) {
    setDraft((current) => ({
      ...current,
      defaultModels: { ...current.defaultModels, [capability]: modelId },
    }));
  }

  function handleSave() {
    setSaving(true);
    simulateWork(() => {
      setSaved(draft);
      setSaving(false);
      toast.success('Platform settings saved');
    }, 1100);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Platform settings" />

      {saved.maintenanceMode ? (
        <NoticeAlert tone="warning">
          Maintenance mode is on. Users see the maintenance message and cannot
          start new generations.
        </NoticeAlert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="General" description="Shown in emails and the app shell.">
          <Field id="platform-name" label="Platform name">
            <Input
              id="platform-name"
              value={draft.platformName}
              onChange={(event) => set('platformName')(event.target.value)}
            />
          </Field>
          <Field
            id="support-email"
            label="Support email"
            error={emailValid ? undefined : 'Enter a valid email address.'}
          >
            <Input
              id="support-email"
              type="email"
              value={draft.supportEmail}
              onChange={(event) => set('supportEmail')(event.target.value)}
              aria-invalid={!emailValid || undefined}
            />
          </Field>
        </Panel>

        <Panel title="Signup" description="What new accounts receive.">
          <NumberField
            id="signup-credits"
            label="Signup credits"
            hint="Granted once, no card required."
            value={draft.signupCredits}
            onChange={set('signupCredits')}
            suffix="credits"
          />
          <ToggleRow
            id="require-verification"
            label="Require email verification"
            description="Credits unlock after the email is confirmed."
            checked={draft.requireEmailVerification}
            onChange={set('requireEmailVerification')}
          />
        </Panel>

        <Panel title="Limits" description="Applied to every account.">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <NumberField
              id="max-tts-characters"
              label="Max TTS characters"
              value={draft.maxTtsCharacters}
              onChange={set('maxTtsCharacters')}
              suffix="chars"
            />
            <NumberField
              id="max-upload"
              label="Max upload size"
              value={draft.maxUploadMb}
              onChange={set('maxUploadMb')}
              suffix="MB"
            />
            <NumberField
              id="realtime-minutes"
              label="Realtime session max"
              value={draft.realtimeSessionMinutes}
              onChange={set('realtimeSessionMinutes')}
              suffix="min"
            />
          </div>
        </Panel>

        <Panel
          title="Maintenance mode"
          description="Pause generation for all users."
        >
          <ToggleRow
            id="maintenance-mode"
            label="Enable maintenance mode"
            description="Running jobs finish; new ones are blocked."
            checked={draft.maintenanceMode}
            onChange={set('maintenanceMode')}
          />
          <Field id="maintenance-message" label="Message shown to users">
            <Textarea
              id="maintenance-message"
              rows={2}
              value={draft.maintenanceMessage}
              onChange={(event) =>
                set('maintenanceMessage')(event.target.value)
              }
            />
          </Field>
        </Panel>

        <Panel
          title="Default models"
          description="Used when a request does not pick a model."
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {CAPABILITY_TAGS.map((capability) => {
              const options = ADMIN_MODELS.filter(
                (model) =>
                  model.capabilities.includes(capability) &&
                  model.status !== 'deprecated',
              );

              return (
                <Field
                  key={capability}
                  id={`default-${capability}`}
                  label={CAPABILITY_LABELS[capability]}
                >
                  <Select
                    value={draft.defaultModels[capability]}
                    onValueChange={(value) =>
                      setDefaultModel(capability, value)
                    }
                  >
                    <SelectTrigger
                      id={`default-${capability}`}
                      className="font-mono text-[12.5px]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((model) => (
                        <SelectItem
                          key={model.id}
                          value={model.id}
                          className="font-mono text-[12.5px]"
                        >
                          {model.providerModelId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              );
            })}
          </div>
        </Panel>
      </div>

      {dirty ? (
        <div
          role="region"
          aria-label="Unsaved changes"
          className="sticky bottom-20 z-20 flex items-center justify-between gap-3 rounded-2xl border bg-popover px-4 py-3 shadow-lg lg:bottom-4"
        >
          <p className="text-[13px] text-muted-foreground">
            You have unsaved changes.
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDraft(saved)}
              disabled={saving}
            >
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!valid || saving}>
              {saving ? <Spinner /> : null}
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
