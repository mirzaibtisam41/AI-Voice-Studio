'use client';

import Link from 'next/link';
import { Check, Star, X } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow } from '@/components/ui/table';
import {
  useGetPlatformSettingsQuery,
  useListAiCapabilitiesQuery,
  useListAiModelsQuery,
} from '@/features/admin/adminApi';
import { MODEL_STATUSES } from '@/features/admin/models/ModelStatusSelect';
import {
  AdminCell,
  AdminTable,
  TableStateRows,
} from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { formatCredits, formatUnit } from '@/features/admin/shared/adminFormat';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const LEGEND = [
  {
    label: 'Enabled (credits per unit)',
    Icon: Check,
    className: 'bg-success/12 text-success',
  },
  { label: 'Default model', Icon: Star, className: 'bg-brand-tint text-brand' },
  { label: 'Not enabled', Icon: X, className: 'bg-field text-ink-3' },
];

function CapabilityCell({ entry, capabilityLabel, model }) {
  if (!entry?.enabled) {
    return (
      <span
        className="mx-auto flex size-7 items-center justify-center rounded-full text-ink-3"
        aria-label={`${model.name}: ${capabilityLabel} not enabled`}
        role="img"
      >
        <X className="size-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'mx-auto inline-flex h-7 items-center gap-1 rounded-full px-2.5 font-mono text-[11.5px] font-medium',
        entry.isDefault
          ? 'bg-brand-tint text-brand'
          : 'bg-success/12 text-success',
      )}
      aria-label={`${model.name}: ${capabilityLabel} enabled at ${entry.creditsPerUnit} credits${entry.isDefault ? ', default model' : ''}`}
      role="img"
    >
      {entry.isDefault ? (
        <Star className="size-3.5 fill-current" aria-hidden="true" />
      ) : (
        <Check className="size-3.5" aria-hidden="true" />
      )}
      {entry.creditsPerUnit}
    </span>
  );
}

function LimitsPanel() {
  const { data: settings, isLoading, error } = useGetPlatformSettingsQuery();
  const limits = settings
    ? [
        [
          'Text to Speech',
          'Max characters per request',
          settings.ttsMaxCharacters,
        ],
        ['Speech to Text', 'Max upload size (MB)', settings.uploadMaxMegabytes],
        [
          'Real-time & voice agents',
          'Max session length (minutes)',
          settings.realtimeMaxMinutes,
        ],
        [
          'Agent test chat',
          'Max messages per chat',
          settings.agentChatMaxMessages,
        ],
      ]
    : [];

  return (
    <Panel
      title="Limits per capability"
      description="Applied to every account. Edit them in platform settings."
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/settings">Edit limits</Link>
        </Button>
      }
    >
      {isLoading ? <Skeleton className="h-24 w-full" /> : null}
      {error ? <FormAlert>{getErrorMessage(error)}</FormAlert> : null}
      {limits.length ? (
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {limits.map(([capability, label, value]) => (
            <div key={capability} className="rounded-xl border bg-field/60 p-3">
              <dt className="text-[12.5px] font-medium">{capability}</dt>
              <dd className="mt-1 flex items-baseline justify-between gap-2">
                <span className="text-[11.5px] text-ink-3">{label}</span>
                <span className="font-mono text-[13px]">
                  {formatCredits(value)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Panel>
  );
}

export function CapabilitiesView() {
  const capabilitiesQuery = useListAiCapabilitiesQuery();
  const modelsQuery = useListAiModelsQuery({ page: 1, limit: 100 });
  const capabilities = capabilitiesQuery.data ?? [];
  const models = modelsQuery.data?.items ?? [];
  const isLoading = capabilitiesQuery.isLoading || modelsQuery.isLoading;
  const error = capabilitiesQuery.error ?? modelsQuery.error;
  const columns = [
    'Capability',
    ...models.map((model) => ({
      key: model.id,
      label: (
        <span className="flex flex-col items-center gap-0.5 py-1">
          <span className="font-mono">{model.providerModelId}</span>
          <span
            className={cn(
              'text-[10px] font-normal',
              MODEL_STATUSES[model.status]?.className,
            )}
          >
            {MODEL_STATUSES[model.status]?.label ?? model.status}
          </span>
        </span>
      ),
      className: 'text-center normal-case tracking-normal',
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Model capabilities">
        <ul className="flex flex-wrap items-center gap-3">
          {LEGEND.map(({ label, Icon, className }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
            >
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full',
                  className,
                )}
              >
                <Icon className="size-3" aria-hidden="true" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </AdminPageHeader>

      <AdminTable
        columns={columns}
        tableClassName={cn(
          models.length > 4 ? 'min-w-[860px]' : 'min-w-[560px]',
        )}
      >
        <TableStateRows
          colSpan={columns.length}
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && models.length === 0}
          empty="No models yet."
        />
        {models.length
          ? capabilities.map((capability) => (
              <TableRow key={capability.code}>
                <AdminCell className="whitespace-nowrap">
                  <p className="text-[13px] font-medium">{capability.label}</p>
                  <p className="text-[11px] text-ink-3">
                    Credits {formatUnit(capability.unit)}
                  </p>
                </AdminCell>
                {models.map((model) => (
                  <AdminCell key={model.id} className="text-center">
                    <CapabilityCell
                      entry={model.capabilities.find(
                        (item) => item.code === capability.code,
                      )}
                      capabilityLabel={capability.label}
                      model={model}
                    />
                  </AdminCell>
                ))}
              </TableRow>
            ))
          : null}
      </AdminTable>
      <p className="text-[12px] text-ink-3">
        Rates and defaults are edited per model on the{' '}
        <Link href="/admin/models" className="text-brand hover:underline">
          AI models
        </Link>{' '}
        page.
      </p>

      <LimitsPanel />
    </div>
  );
}
