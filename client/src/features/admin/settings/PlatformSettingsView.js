'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from '@/features/admin/adminApi';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { NoticeAlert } from '@/features/admin/shared/NoticeAlert';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';

const NUMBER_LIMITS = {
  signupCredits: { min: 0, max: 100000 },
  ttsMaxCharacters: { min: 100, max: 20000 },
  uploadMaxMegabytes: { min: 1, max: 25 },
  realtimeMaxMinutes: { min: 1, max: 60 },
  agentChatMaxMessages: { min: 1, max: 100 },
};

const BOOLEAN_FIELDS = ['requireEmailVerification', 'maintenanceMode'];
const MAINTENANCE_MESSAGE_MAX = 300;

function toDraft(settings) {
  return {
    ...Object.fromEntries(
      Object.keys(NUMBER_LIMITS).map((key) => [key, String(settings[key])]),
    ),
    ...Object.fromEntries(BOOLEAN_FIELDS.map((key) => [key, settings[key]])),
    maintenanceMessage: settings.maintenanceMessage ?? '',
  };
}

function numberError(key, value) {
  const { min, max } = NUMBER_LIMITS[key];
  const numeric = Number(value);

  if (value === '' || !Number.isInteger(numeric))
    return 'Enter a whole number.';
  if (numeric < min || numeric > max) return `Between ${min} and ${max}.`;

  return null;
}

function buildChanges(saved, draft) {
  const changes = {};

  for (const key of Object.keys(NUMBER_LIMITS)) {
    if (draft[key] !== saved[key]) changes[key] = Number(draft[key]);
  }
  for (const key of BOOLEAN_FIELDS) {
    if (draft[key] !== saved[key]) changes[key] = draft[key];
  }
  if (draft.maintenanceMessage !== saved.maintenanceMessage) {
    changes.maintenanceMessage = draft.maintenanceMessage.trim();
  }

  return changes;
}

function NumberField({ id, label, hint, value, onChange, suffix, error }) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pr-16 font-mono"
          aria-invalid={Boolean(error) || undefined}
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

function SettingsForm({ settings }) {
  const saved = toDraft(settings);
  const [draft, setDraft] = useState(saved);
  const [updateSettings, { isLoading, error }] =
    useUpdatePlatformSettingsMutation();
  const serverFieldErrors = readFieldErrors(error);
  const changes = buildChanges(saved, draft);
  const dirty = Object.keys(changes).length > 0;
  const fieldErrors = Object.fromEntries(
    Object.keys(NUMBER_LIMITS).map((key) => [
      key,
      numberError(key, draft[key]) ?? serverFieldErrors[key],
    ]),
  );
  const messageTooLong =
    draft.maintenanceMessage.length > MAINTENANCE_MESSAGE_MAX;
  const valid =
    Object.values(fieldErrors).every((value) => !value) && !messageTooLong;

  function set(key) {
    return (value) => setDraft((current) => ({ ...current, [key]: value }));
  }

  function numberProps(key, id) {
    return {
      id,
      value: draft[key],
      onChange: set(key),
      error: fieldErrors[key] ?? undefined,
    };
  }

  async function handleSave() {
    if (!dirty || !valid) return;

    try {
      await updateSettings(changes).unwrap();
      toast.success('Platform settings saved');
    } catch {
      return;
    }
  }

  return (
    <>
      {settings.maintenanceMode ? (
        <NoticeAlert tone="warning">
          Maintenance mode is on. Users see the maintenance message and cannot
          start new generations.
        </NoticeAlert>
      ) : null}
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Signup" description="What new accounts receive.">
          <NumberField
            {...numberProps('signupCredits', 'signup-credits')}
            label="Signup credits"
            hint="Granted once to every new account."
            suffix="credits"
          />
          <ToggleRow
            id="require-verification"
            label="Require email verification"
            description="Users must confirm their email before generating."
            checked={draft.requireEmailVerification}
            onChange={set('requireEmailVerification')}
          />
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
          <Field
            id="maintenance-message"
            label="Message shown to users"
            hint={`${draft.maintenanceMessage.length}/${MAINTENANCE_MESSAGE_MAX} characters`}
            error={
              messageTooLong
                ? `At most ${MAINTENANCE_MESSAGE_MAX} characters.`
                : serverFieldErrors.maintenanceMessage
            }
          >
            <Textarea
              id="maintenance-message"
              rows={2}
              value={draft.maintenanceMessage}
              onChange={(event) =>
                set('maintenanceMessage')(event.target.value)
              }
              placeholder="We are upgrading the studio. Back shortly."
            />
          </Field>
        </Panel>

        <Panel
          title="Limits"
          description="Applied to every account."
          className="lg:col-span-2"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <NumberField
              {...numberProps('ttsMaxCharacters', 'max-tts-characters')}
              label="Max TTS characters"
              hint="100 to 20,000 per request."
              suffix="chars"
            />
            <NumberField
              {...numberProps('uploadMaxMegabytes', 'max-upload')}
              label="Max upload size"
              hint="1 to 25 MB."
              suffix="MB"
            />
            <NumberField
              {...numberProps('realtimeMaxMinutes', 'realtime-minutes')}
              label="Realtime session max"
              hint="1 to 60 minutes."
              suffix="min"
            />
            <NumberField
              {...numberProps('agentChatMaxMessages', 'agent-chat-messages')}
              label="Agent test chat max"
              hint="1 to 100 messages."
              suffix="msgs"
            />
          </div>
        </Panel>
      </div>
      <p className="text-[12px] text-ink-3">
        Default models and credit rates are managed on the{' '}
        <Link href="/admin/models" className="text-brand hover:underline">
          AI models
        </Link>{' '}
        and{' '}
        <Link href="/admin/pricing" className="text-brand hover:underline">
          credit pricing
        </Link>{' '}
        pages.
      </p>

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
              disabled={isLoading}
            >
              Discard
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!valid || isLoading}
            >
              {isLoading ? <Spinner /> : null}
              Save changes
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function PlatformSettingsView() {
  const { data: settings, isLoading, error } = useGetPlatformSettingsQuery();

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Platform settings" />
      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      ) : null}
      {settings ? (
        <SettingsForm key={settings.updatedAt} settings={settings} />
      ) : null}
    </div>
  );
}
