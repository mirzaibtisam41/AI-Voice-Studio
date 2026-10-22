'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  formatCredits,
  formatSignedCredits,
  simulateWork,
} from '@/features/admin/shared/adminFormat';
import { cn } from '@/lib/utils';

function AdjustCreditsForm({ user, onSubmit, onCancel }) {
  const [direction, setDirection] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const numericAmount = Math.max(0, Math.floor(Number(amount) || 0));
  const delta = direction === 'add' ? numericAmount : -numericAmount;
  const nextBalance = user.credits + delta;
  const invalidBalance = nextBalance < 0;
  const canSubmit =
    numericAmount > 0 && reason.trim().length > 0 && !invalidBalance;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    simulateWork(() => {
      setSaving(false);
      onSubmit(delta, reason.trim());
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Adjustment direction"
        className="grid grid-cols-2 gap-2"
      >
        {[
          { value: 'add', label: 'Add credits', Icon: Plus },
          { value: 'remove', label: 'Remove credits', Icon: Minus },
        ].map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={direction === value}
            onClick={() => setDirection(value)}
            className={cn(
              'flex h-10 items-center justify-center gap-2 rounded-lg border text-[13px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              direction === value
                ? 'border-brand/60 bg-brand-tint text-brand'
                : 'bg-field text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <Field
        id="adjust-amount"
        label="Amount (credits)"
        error={invalidBalance ? 'Balance cannot go below zero.' : undefined}
      >
        <Input
          id="adjust-amount"
          type="number"
          min="1"
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="5000"
          className="font-mono"
          aria-invalid={invalidBalance || undefined}
        />
      </Field>
      <Field
        id="adjust-reason"
        label="Reason"
        hint="Required. Visible in the audit log."
      >
        <Textarea
          id="adjust-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Refund for failed job job_8f27b0"
          rows={3}
        />
      </Field>
      <div className="grid grid-cols-3 gap-2 rounded-xl border bg-field/60 p-3 text-center">
        <div>
          <p className="text-[11px] text-ink-3">Current</p>
          <p className="font-mono text-[13px]">{formatCredits(user.credits)}</p>
        </div>
        <div>
          <p className="text-[11px] text-ink-3">Change</p>
          <p
            className={cn(
              'font-mono text-[13px]',
              delta > 0 && 'text-success',
              delta < 0 && 'text-danger',
            )}
          >
            {formatSignedCredits(delta)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-ink-3">New balance</p>
          <p
            className={cn(
              'font-mono text-[13px] font-semibold',
              invalidBalance && 'text-danger',
            )}
          >
            {formatCredits(nextBalance)}
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || saving}>
          {saving ? <Spinner /> : null}
          Confirm adjustment
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AdjustCreditsDialog({ user, onOpenChange, onSubmit }) {
  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent>
        {user ? (
          <>
            <div className="flex flex-col gap-1.5 pr-6">
              <DialogTitle>Adjust credits</DialogTitle>
              <DialogDescription>
                {user.name} · {user.email}
              </DialogDescription>
            </div>
            <AdjustCreditsForm
              key={user.id}
              user={user}
              onSubmit={onSubmit}
              onCancel={() => onOpenChange(false)}
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
