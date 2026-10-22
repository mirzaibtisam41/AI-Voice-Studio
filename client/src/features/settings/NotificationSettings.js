'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} from '@/features/settings/settingsApi';
import { getErrorMessage } from '@/lib/apiError';

const THRESHOLD_MAX = 10000;

const NOTIFICATION_ROWS = [
  {
    key: 'generationFinished',
    label: 'Generation finished',
    description: 'Email me when a long generation or transcription is ready.',
  },
  {
    key: 'lowCredits',
    label: 'Low credit balance',
    description: 'Warn me before my balance runs out.',
  },
  {
    key: 'weeklySummary',
    label: 'Weekly usage summary',
    description: 'A weekly digest of credits spent per feature.',
  },
  {
    key: 'productUpdates',
    label: 'Product updates',
    description: 'New voices, models and studio features.',
  },
];

function toForm(notifications) {
  return {
    generationFinished: Boolean(notifications?.generationFinished),
    lowCredits: Boolean(notifications?.lowCredits),
    lowCreditsThreshold: String(notifications?.lowCreditsThreshold ?? 0),
    weeklySummary: Boolean(notifications?.weeklySummary),
    productUpdates: Boolean(notifications?.productUpdates),
  };
}

function thresholdErrorFor(form) {
  if (!form.lowCredits) return undefined;

  const value = Number(form.lowCreditsThreshold);

  if (
    form.lowCreditsThreshold === '' ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > THRESHOLD_MAX
  ) {
    return `Enter a whole number from 0 to ${THRESHOLD_MAX.toLocaleString('en-US')}.`;
  }

  return undefined;
}

function NotificationsForm({ notifications }) {
  const [saved, setSaved] = useState(() => toForm(notifications));
  const [form, setForm] = useState(saved);
  const [error, setError] = useState('');
  const [updateSettings, { isLoading }] = useUpdateMySettingsMutation();
  const thresholdError = thresholdErrorFor(form);
  const isChanged = Object.keys(form).some((key) => form[key] !== saved[key]);

  const update = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    setError('');

    const payload = {
      generationFinished: form.generationFinished,
      lowCredits: form.lowCredits,
      weeklySummary: form.weeklySummary,
      productUpdates: form.productUpdates,
    };

    if (form.lowCredits) {
      payload.lowCreditsThreshold = Number(form.lowCreditsThreshold);
    }

    try {
      const updated = await updateSettings({
        notifications: payload,
      }).unwrap();
      const next = toForm(updated.notifications);

      setSaved(next);
      setForm(next);
      toast.success('Notification settings saved');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <>
      <FormAlert>{error}</FormAlert>
      <div className="flex flex-col gap-5">
        {NOTIFICATION_ROWS.map((row) => (
          <div key={row.key} className="flex flex-col gap-3">
            <ToggleRow
              id={`notify-${row.key}`}
              label={row.label}
              description={row.description}
              checked={form[row.key]}
              onChange={update(row.key)}
            />
            {row.key === 'lowCredits' && form.lowCredits ? (
              <Field
                id="notify-threshold"
                label="Alert when balance falls below (credits)"
                error={thresholdError}
                className="rounded-xl border bg-field/50 p-3"
              >
                <Input
                  id="notify-threshold"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={THRESHOLD_MAX}
                  step={1}
                  value={form.lowCreditsThreshold}
                  onChange={(event) =>
                    update('lowCreditsThreshold')(event.target.value)
                  }
                  aria-invalid={Boolean(thresholdError)}
                  aria-describedby={
                    thresholdError ? 'notify-threshold-error' : undefined
                  }
                  className="font-mono sm:w-48"
                />
              </Field>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isChanged || Boolean(thresholdError) || isLoading}
        >
          {isLoading ? <Spinner /> : null}
          {isLoading ? 'Saving...' : 'Save notifications'}
        </Button>
      </div>
    </>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-label="Loading notifications">
      {NOTIFICATION_ROWS.map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function NotificationSettings() {
  const { data: settings, isLoading, error, refetch } = useGetMySettingsQuery();

  let content;

  if (isLoading) {
    content = <NotificationsSkeleton />;
  } else if (!settings) {
    content = (
      <EmptyState
        title="Could not load your notification settings"
        description={getErrorMessage(error)}
        action={
          <Button variant="outline" size="sm" onClick={refetch}>
            Try again
          </Button>
        }
      />
    );
  } else {
    content = <NotificationsForm notifications={settings.notifications} />;
  }

  return (
    <Panel title="Notifications" description="Choose what we email you about.">
      {content}
    </Panel>
  );
}
