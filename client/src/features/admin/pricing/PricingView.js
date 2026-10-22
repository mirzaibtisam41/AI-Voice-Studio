'use client';

import { useState } from 'react';
import { Coins, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableRow } from '@/components/ui/table';
import { AdminCell, AdminTable } from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import {
  formatCredits,
  simulateWork,
} from '@/features/admin/shared/adminFormat';
import { cn } from '@/lib/utils';
import {
  CREDIT_VALUE_USD,
  PRICING_RULES,
  SIGNUP_BONUS_CREDITS,
} from '@/mocks/adminPricing';

const COLUMNS = [
  'Feature',
  'Unit',
  'Credits per unit',
  'Provider cost',
  'Revenue per unit',
  'Margin',
];

function buildSnapshot() {
  return {
    credits: Object.fromEntries(
      PRICING_RULES.map((rule) => [rule.id, String(rule.credits)]),
    ),
    creditValue: String(CREDIT_VALUE_USD),
    signupBonus: String(SIGNUP_BONUS_CREDITS),
  };
}

function formatSmallUsd(value) {
  if (!Number.isFinite(value)) return '—';
  const digits = value < 0.001 ? 6 : value < 1 ? 4 : 2;

  return `$${value.toFixed(digits).replace(/(\.\d*?[1-9])0+$/, '$1')}`;
}

function computeMargin(credits, creditValue, providerCost) {
  const revenue = credits * creditValue;
  if (!revenue) return null;

  return ((revenue - providerCost) / revenue) * 100;
}

function SettingCard({ icon: Icon, title, description, children }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold">{title}</h3>
          <p className="text-[12.5px] text-ink-3">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function PricingView() {
  const [saved, setSaved] = useState(buildSnapshot);
  const [draft, setDraft] = useState(buildSnapshot);
  const [saving, setSaving] = useState(false);
  const creditValue = Number(draft.creditValue);
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const valid =
    creditValue > 0 &&
    Number(draft.signupBonus) >= 0 &&
    Object.values(draft.credits).every((value) => Number(value) > 0);

  function setRuleCredits(id, value) {
    setDraft((current) => ({
      ...current,
      credits: { ...current.credits, [id]: value },
    }));
  }

  function handleSave() {
    setSaving(true);
    simulateWork(() => {
      setSaved(draft);
      setSaving(false);
      toast.success('Credit pricing saved');
    }, 1100);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Credit pricing">
        {dirty ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDraft(saved)}
            disabled={saving}
          >
            Discard
          </Button>
        ) : null}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!dirty || !valid || saving}
        >
          {saving ? <Spinner /> : null}
          Save changes
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <SettingCard
          icon={Coins}
          title="Credit value"
          description="What one credit is worth when computing margins."
        >
          <Field id="credit-value" label="1 credit equals (USD)">
            <Input
              id="credit-value"
              type="number"
              step="0.00001"
              min="0"
              value={draft.creditValue}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  creditValue: event.target.value,
                }))
              }
              className="font-mono"
            />
          </Field>
        </SettingCard>
        <SettingCard
          icon={Gift}
          title="Signup bonus"
          description="Free credits granted to every new account."
        >
          <Field
            id="signup-bonus"
            label="Credits on signup"
            hint={`Worth ${formatSmallUsd(Number(draft.signupBonus) * creditValue)} at the current credit value.`}
          >
            <Input
              id="signup-bonus"
              type="number"
              min="0"
              step="500"
              value={draft.signupBonus}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  signupBonus: event.target.value,
                }))
              }
              className="font-mono"
            />
          </Field>
        </SettingCard>
      </div>

      <AdminTable columns={COLUMNS} tableClassName="min-w-[820px]">
        {PRICING_RULES.map((rule) => {
          const value = draft.credits[rule.id];
          const edited = value !== saved.credits[rule.id];
          const margin = computeMargin(
            Number(value),
            creditValue,
            rule.providerCost,
          );

          return (
            <TableRow key={rule.id}>
              <AdminCell className="font-medium whitespace-nowrap">
                {rule.feature}
              </AdminCell>
              <AdminCell className="whitespace-nowrap text-muted-foreground">
                {rule.unit}
              </AdminCell>
              <AdminCell>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={value}
                  onChange={(event) =>
                    setRuleCredits(rule.id, event.target.value)
                  }
                  aria-label={`${rule.feature} credits ${rule.unit}`}
                  className={cn(
                    'h-8 w-24 font-mono',
                    edited && 'border-brand/60',
                  )}
                />
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px] whitespace-nowrap">
                {formatSmallUsd(rule.providerCost)}/{rule.costUnit}
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px] whitespace-nowrap text-muted-foreground">
                {formatSmallUsd(Number(value) * creditValue)}/{rule.costUnit}
              </AdminCell>
              <AdminCell
                className={cn(
                  'font-mono text-[12.5px] whitespace-nowrap',
                  margin === null && 'text-ink-3',
                  margin !== null && margin >= 30 && 'text-success',
                  margin !== null &&
                    margin >= 0 &&
                    margin < 30 &&
                    'text-warning',
                  margin !== null && margin < 0 && 'text-danger',
                )}
              >
                {margin === null ? '—' : `${Math.round(margin)}%`}
              </AdminCell>
            </TableRow>
          );
        })}
      </AdminTable>
      <p className="text-[12px] text-ink-3">
        Margin = (credits × credit value − provider cost) ÷ revenue. Signup
        bonus currently {formatCredits(Number(saved.signupBonus))} credits.
      </p>
    </div>
  );
}
