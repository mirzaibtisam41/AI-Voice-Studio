'use client';

import { Check, CircleAlert, X } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AdminCell, AdminTable } from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { cn } from '@/lib/utils';
import {
  ADMIN_MODELS,
  CAPABILITY_LIMITS,
  CAPABILITY_MATRIX,
} from '@/mocks/adminModels';

const COLUMNS = [
  'Capability',
  ...ADMIN_MODELS.map((model) => ({
    key: model.id,
    label: model.providerModelId,
    className: 'text-center normal-case font-mono tracking-normal',
  })),
];

const LEGEND = [
  { label: 'Supported', Icon: Check, className: 'bg-success/12 text-success' },
  {
    label: 'Limited',
    Icon: CircleAlert,
    className: 'bg-warning/12 text-warning',
  },
  { label: 'Not supported', Icon: X, className: 'bg-field text-ink-3' },
];

function SupportCell({ cell, capability, model }) {
  if (cell.support === 'yes') {
    return (
      <span
        className="mx-auto flex size-7 items-center justify-center rounded-full bg-success/12 text-success"
        aria-label={`${model}: ${capability} supported`}
        role="img"
      >
        <Check className="size-4" aria-hidden="true" />
      </span>
    );
  }

  if (cell.support === 'limited') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="mx-auto flex h-7 items-center gap-1 rounded-full bg-warning/12 px-2.5 text-[11.5px] font-medium text-warning outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label={`${model}: ${capability} limited. ${cell.note}`}
          >
            <CircleAlert className="size-3.5" aria-hidden="true" />
            limited
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-56">{cell.note}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span
      className="mx-auto flex size-7 items-center justify-center rounded-full text-ink-3"
      aria-label={`${model}: ${capability} not supported`}
      role="img"
    >
      <X className="size-4" aria-hidden="true" />
    </span>
  );
}

export function CapabilitiesView() {
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

      <AdminTable columns={COLUMNS} tableClassName="min-w-[860px]">
        {CAPABILITY_MATRIX.map((row) => (
          <TableRow key={row.id}>
            <AdminCell className="text-[13px] font-medium whitespace-nowrap">
              {row.label}
            </AdminCell>
            {ADMIN_MODELS.map((model) => (
              <AdminCell key={model.id} className="text-center">
                <SupportCell
                  cell={row.cells[model.id]}
                  capability={row.label}
                  model={model.providerModelId}
                />
              </AdminCell>
            ))}
          </TableRow>
        ))}
      </AdminTable>

      <section className="flex flex-col gap-3">
        <h2 className="text-[14px] font-semibold">Limits per capability</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CAPABILITY_LIMITS.map((capability) => (
            <Panel key={capability.id} title={capability.label}>
              <dl className="flex flex-col divide-y">
                {capability.limits.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <dt className="text-[12.5px] text-ink-3">{label}</dt>
                    <dd className="text-right font-mono text-[12.5px]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
