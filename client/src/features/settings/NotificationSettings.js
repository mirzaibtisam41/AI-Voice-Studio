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
  readNotifications,
  saveNotifications,
} from '@/features/settings/settingsOptions';
import { useSimulatedAction } from '@/features/settings/useSimulatedAction';

const NOTIFICATION_ROWS = [
  {
    key: 'generationFinished',
    label: 'Generation finished',
    description: 'Email me when a long generation or transcription is ready.',
  },
  {
    key: 'lowBalance',
    label: 'Low credit balance',
    description: 'Warn me before my balance runs out.',
  },
  {
    key: 'weeklySummary',
    label: 'Weekly usage summary',
    description: 'A Monday digest of credits spent per feature.',
  },
  {
    key: 'productUpdates',
    label: 'Product updates',
    description: 'New voices, models and studio features.',
  },
];

export function NotificationSettings() {
  const [saved, setSaved] = useState(readNotifications);
  const [settings, setSettings] = useState(saved);
  const { isRunning, run } = useSimulatedAction(800);
  const threshold = Number(settings.lowBalanceThreshold);
  const thresholdError =
    settings.lowBalance && (!Number.isFinite(threshold) || threshold < 1000)
      ? 'Enter at least 1,000 credits.'
      : undefined;
  const isChanged = Object.keys(settings).some(
    (key) => String(settings[key]) !== String(saved[key]),
  );

  const update = (key) => (value) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const handleSave = () =>
    run(() => {
      const next = { ...settings, lowBalanceThreshold: threshold };

      saveNotifications(next);
      setSaved(next);
      setSettings(next);
      toast.success('Notification settings saved');
    });

  return (
    <Panel title="Notifications" description="Choose what we email you about.">
      <div className="flex flex-col gap-5">
        {NOTIFICATION_ROWS.map((row) => (
          <div key={row.key} className="flex flex-col gap-3">
            <ToggleRow
              id={`notify-${row.key}`}
              label={row.label}
              description={row.description}
              checked={settings[row.key]}
              onChange={update(row.key)}
            />
            {row.key === 'lowBalance' && settings.lowBalance ? (
              <Field
                id="notify-threshold"
                label="Alert when balance falls below"
                error={thresholdError}
                className="rounded-xl border bg-field/50 p-3"
              >
                <Input
                  id="notify-threshold"
                  type="number"
                  inputMode="numeric"
                  min={1000}
                  step={1000}
                  value={settings.lowBalanceThreshold}
                  onChange={(event) =>
                    update('lowBalanceThreshold')(event.target.value)
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
        <ToggleRow
          id="notify-security"
          label="Security alerts"
          description="Sign-ins from new devices and password changes. Always on."
          checked
          disabled
          onChange={() => {}}
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isChanged || Boolean(thresholdError) || isRunning}
        >
          {isRunning ? <Spinner /> : null}
          {isRunning ? 'Saving...' : 'Save notifications'}
        </Button>
      </div>
    </Panel>
  );
}
