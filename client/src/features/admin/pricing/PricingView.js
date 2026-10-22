'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow } from '@/components/ui/table';
import {
  useGetPlatformSettingsQuery,
  useListAiCapabilitiesQuery,
  useListAiModelsQuery,
  useSaveAiModelCapabilityMutation,
  useUpdatePlatformSettingsMutation,
} from '@/features/admin/adminApi';
import {
  AdminCell,
  AdminTable,
  TableStateRows,
} from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { formatCredits, formatUnit } from '@/features/admin/shared/adminFormat';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const COLUMNS = [
  'Feature',
  'Unit',
  'Default model',
  'Credits per unit',
  'Other enabled models',
];

const MAX_CREDITS_PER_UNIT = 10000;
const MAX_SIGNUP_CREDITS = 100000;

function RateInput({ capability, model, entry }) {
  const [rate, setRate] = useState(String(entry.creditsPerUnit ?? ''));
  const [saveCapability, { isLoading, error }] =
    useSaveAiModelCapabilityMutation();
  const numericRate = Number(rate);
  const valid =
    Number.isInteger(numericRate) &&
    numericRate >= 1 &&
    numericRate <= MAX_CREDITS_PER_UNIT;
  const dirty = valid && numericRate !== entry.creditsPerUnit;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!dirty || isLoading) return;

    try {
      await saveCapability({
        id: model.id,
        code: capability.code,
        enabled: true,
        creditsPerUnit: numericRate,
      }).unwrap();
      toast.success(
        `${capability.label} now costs ${numericRate} ${numericRate === 1 ? 'credit' : 'credits'} ${formatUnit(capability.unit)}`,
      );
    } catch (saveError) {
      toast.error(getErrorMessage(saveError));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="number"
        min="1"
        max={MAX_CREDITS_PER_UNIT}
        step="1"
        inputMode="numeric"
        value={rate}
        onChange={(event) => setRate(event.target.value)}
        aria-label={`${capability.label} credits ${formatUnit(capability.unit)}`}
        aria-invalid={(!valid && rate !== '') || Boolean(error) || undefined}
        className={cn(
          'h-8 w-24 font-mono',
          dirty && 'border-brand/60',
          !valid && 'border-danger/60',
        )}
      />
      <Button type="submit" size="sm" disabled={!dirty || isLoading}>
        {isLoading ? <Spinner /> : null}
        Save
      </Button>
    </form>
  );
}

function SignupCreditsCard() {
  const { data: settings, isLoading, error } = useGetPlatformSettingsQuery();

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <Gift className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold">Signup bonus</h3>
          <p className="text-[12.5px] text-ink-3">
            Free credits granted to every new account.
          </p>
        </div>
      </div>
      {isLoading ? <Skeleton className="h-16 w-full" /> : null}
      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {settings ? (
        <SignupCreditsForm
          key={settings.signupCredits}
          current={settings.signupCredits}
        />
      ) : null}
    </section>
  );
}

function SignupCreditsForm({ current }) {
  const [value, setValue] = useState(String(current));
  const [updateSettings, { isLoading, error }] =
    useUpdatePlatformSettingsMutation();
  const numeric = Number(value);
  const valid =
    value !== '' &&
    Number.isInteger(numeric) &&
    numeric >= 0 &&
    numeric <= MAX_SIGNUP_CREDITS;
  const dirty = valid && numeric !== current;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!dirty || isLoading) return;

    try {
      await updateSettings({ signupCredits: numeric }).unwrap();
      toast.success(`New accounts now get ${formatCredits(numeric)} credits`);
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
      <div className="flex items-end gap-2">
        <Field
          id="signup-bonus"
          label="Credits on signup"
          className="flex-1"
          error={
            valid || value === ''
              ? undefined
              : `0 to ${formatCredits(MAX_SIGNUP_CREDITS)}`
          }
        >
          <Input
            id="signup-bonus"
            type="number"
            min="0"
            max={MAX_SIGNUP_CREDITS}
            step="1"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="font-mono"
          />
        </Field>
        <Button type="submit" disabled={!dirty || isLoading}>
          {isLoading ? <Spinner /> : null}
          Save
        </Button>
      </div>
    </form>
  );
}

export function PricingView() {
  const capabilitiesQuery = useListAiCapabilitiesQuery();
  const modelsQuery = useListAiModelsQuery({ page: 1, limit: 100 });
  const capabilities = capabilitiesQuery.data ?? [];
  const models = modelsQuery.data?.items ?? [];
  const isLoading = capabilitiesQuery.isLoading || modelsQuery.isLoading;
  const error = capabilitiesQuery.error ?? modelsQuery.error;

  const rows = capabilities.map((capability) => {
    const enabled = models
      .map((model) => ({
        model,
        entry: model.capabilities.find((item) => item.code === capability.code),
      }))
      .filter(({ entry }) => entry?.enabled);

    return {
      capability,
      defaultRow: enabled.find(({ entry }) => entry.isDefault) ?? null,
      others: enabled.filter(({ entry }) => !entry.isDefault),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Credit pricing" />

      <div className="grid gap-4 md:grid-cols-2">
        <SignupCreditsCard />
        <section className="flex flex-col gap-2 rounded-2xl border bg-card p-4 text-[12.5px] text-ink-3 sm:p-5">
          <h3 className="text-[14px] font-semibold text-foreground">
            How rates work
          </h3>
          <p>
            Each feature is charged at the rate of its default model. The rate
            you save here is what users see on the credits page and pay per
            request.
          </p>
          <p>
            To switch defaults or price other models, open{' '}
            <Link href="/admin/models" className="text-brand hover:underline">
              AI models
            </Link>
            .
          </p>
        </section>
      </div>

      <AdminTable columns={COLUMNS} tableClassName="min-w-[820px]">
        <TableStateRows
          colSpan={COLUMNS.length}
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && rows.length === 0}
          empty="No capabilities found."
        />
        {rows.map(({ capability, defaultRow, others }) => (
          <TableRow key={capability.code}>
            <AdminCell className="font-medium whitespace-nowrap">
              {capability.label}
            </AdminCell>
            <AdminCell className="whitespace-nowrap text-muted-foreground">
              {formatUnit(capability.unit)}
            </AdminCell>
            <AdminCell>
              {defaultRow ? (
                <>
                  <p className="text-[13px]">{defaultRow.model.name}</p>
                  <p className="font-mono text-[11.5px] text-ink-3">
                    {defaultRow.model.providerModelId}
                  </p>
                </>
              ) : (
                <span className="text-[12.5px] text-warning">
                  No default model
                </span>
              )}
            </AdminCell>
            <AdminCell>
              {defaultRow ? (
                <RateInput
                  key={`${defaultRow.model.id}-${defaultRow.entry.creditsPerUnit}`}
                  capability={capability}
                  model={defaultRow.model}
                  entry={defaultRow.entry}
                />
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/models">Choose a default</Link>
                </Button>
              )}
            </AdminCell>
            <AdminCell className="text-[12.5px] text-muted-foreground">
              {others.length
                ? others
                    .map(
                      ({ model, entry }) =>
                        `${model.name} (${entry.creditsPerUnit})`,
                    )
                    .join(', ')
                : '—'}
            </AdminCell>
          </TableRow>
        ))}
      </AdminTable>
    </div>
  );
}
