'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Field } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  AdminCell,
  AdminTable,
  PaginationFooter,
  usePagination,
} from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import {
  formatCredits,
  formatSignedCredits,
  simulateWork,
} from '@/features/admin/shared/adminFormat';
import { cn } from '@/lib/utils';
import { ADMIN_USERS } from '@/mocks/adminUsers';
import {
  ADJUSTMENT_REASONS,
  ADMIN_EMAIL,
  WALLET_ADJUSTMENTS,
} from '@/mocks/adminWallet';

const COLUMNS = ['Time', 'Admin', 'User', 'Amount', 'Reason', 'Note'];

const DIRECTION_OPTIONS = [
  { value: 'add', label: '+ Add' },
  { value: 'remove', label: '− Remove' },
];

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatLogTime(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function WalletAdjustmentsView() {
  const [users, setUsers] = useState(ADMIN_USERS);
  const [history, setHistory] = useState(WALLET_ADJUSTMENTS);
  const [userId, setUserId] = useState('');
  const [direction, setDirection] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const pagination = usePagination(history, 8);

  const selectedUser = users.find((user) => user.id === userId);
  const numericAmount = Math.max(0, Math.floor(Number(amount) || 0));
  const delta = direction === 'add' ? numericAmount : -numericAmount;
  const nextBalance = selectedUser ? selectedUser.credits + delta : 0;
  const overdraw = Boolean(selectedUser) && nextBalance < 0;
  const canSubmit =
    selectedUser && numericAmount > 0 && reason && !overdraw && !saving;

  function resetForm() {
    setAmount('');
    setReason('');
    setNote('');
    setDirection('add');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    simulateWork(() => {
      const entry = {
        id: `adj_${Date.now().toString(36)}`,
        time: formatLogTime(new Date()),
        admin: ADMIN_EMAIL,
        userId: selectedUser.id,
        userName: selectedUser.name,
        amount: delta,
        reason,
        note: note.trim() || '—',
      };
      setUsers((current) =>
        current.map((user) =>
          user.id === selectedUser.id
            ? { ...user, credits: user.credits + delta }
            : user,
        ),
      );
      setHistory((current) => [entry, ...current]);
      pagination.setPage(1);
      setSaving(false);
      resetForm();
      toast.success(
        `${formatSignedCredits(delta)} credits applied to ${selectedUser.name}`,
      );
    }, 1000);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Wallet adjustments"
        count={`${history.length} adjustments`}
      />
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel
          title="New adjustment"
          description="Credit or debit a user wallet. Logged with your account."
          className="self-start"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field id="adjust-user" label="User">
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger id="adjust-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} · {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <ChoiceChips
              label="Adjustment direction"
              options={DIRECTION_OPTIONS}
              value={direction}
              onChange={setDirection}
            />
            <Field
              id="adjust-amount-input"
              label="Amount (credits)"
              error={overdraw ? 'Balance cannot go below zero.' : undefined}
            >
              <Input
                id="adjust-amount-input"
                type="number"
                min="1"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="5000"
                className="font-mono"
                aria-invalid={overdraw || undefined}
              />
            </Field>
            <Field id="adjust-reason-select" label="Reason">
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="adjust-reason-select">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_REASONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="adjust-note" label="Note" hint="Optional context.">
              <Textarea
                id="adjust-note"
                rows={2}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="e.g. Refund for job_8f27b0"
              />
            </Field>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-xl border bg-field/60 px-3 py-2.5 text-[12.5px]">
                <span className="text-ink-3">
                  {formatCredits(selectedUser.credits)} →
                </span>
                <span
                  className={cn(
                    'font-mono font-semibold',
                    overdraw && 'text-danger',
                  )}
                >
                  {formatCredits(nextBalance)} credits
                </span>
              </div>
            ) : null}
            <Button type="submit" disabled={!canSubmit}>
              {saving ? <Spinner /> : null}
              Apply adjustment
            </Button>
          </form>
        </Panel>

        <AdminTable
          columns={COLUMNS}
          tableClassName="min-w-[760px]"
          className="self-start"
          footer={<PaginationFooter pagination={pagination} />}
        >
          {pagination.pageItems.map((entry) => (
            <TableRow key={entry.id}>
              <AdminCell className="font-mono text-[12px] whitespace-nowrap text-ink-3">
                {entry.time}
              </AdminCell>
              <AdminCell className="text-[12.5px] text-muted-foreground">
                {entry.admin}
              </AdminCell>
              <AdminCell className="whitespace-nowrap">
                {entry.userName}
              </AdminCell>
              <AdminCell
                className={cn(
                  'font-mono text-[12.5px] whitespace-nowrap',
                  entry.amount > 0 ? 'text-success' : 'text-danger',
                )}
              >
                {formatSignedCredits(entry.amount)}
              </AdminCell>
              <AdminCell>{entry.reason}</AdminCell>
              <AdminCell className="max-w-64 truncate text-[12.5px] text-ink-3">
                {entry.note}
              </AdminCell>
            </TableRow>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
