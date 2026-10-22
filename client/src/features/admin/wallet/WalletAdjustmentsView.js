'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { ChoiceChips } from '@/components/ui/ChoiceChips';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
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
  useAdjustUserCreditsMutation,
  useListAdminUsersQuery,
  useListCreditAdjustmentsQuery,
} from '@/features/admin/adminApi';
import {
  AdminCell,
  AdminTable,
  PaginationFooter,
  TableStateRows,
  serverPagination,
} from '@/features/admin/shared/AdminTable';
import {
  AdminPageHeader,
  SearchField,
} from '@/features/admin/shared/AdminToolbar';
import {
  createIdempotencyKey,
  formatCredits,
  formatLogTime,
  formatSignedCredits,
} from '@/features/admin/shared/adminFormat';
import { useDebouncedValue } from '@/features/admin/shared/useDebouncedValue';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;
const MAX_AMOUNT = 100000;

const COLUMNS = ['Time', 'Admin', 'User', 'Amount', 'Balance after', 'Reason'];

const DIRECTION_OPTIONS = [
  { value: 'add', label: '+ Add' },
  { value: 'remove', label: '− Remove' },
];

const ADJUSTMENT_REASONS = ['Goodwill', 'Refund', 'Promotion', 'Correction'];

function UserPicker({ selectedUser, onSelect }) {
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim());
  const { data, isFetching } = useListAdminUsersQuery(
    { search, limit: 6, page: 1 },
    { skip: !search || Boolean(selectedUser) },
  );

  if (selectedUser) {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-field/60 px-3 py-2.5">
        <UserAvatar name={selectedUser.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">
            {selectedUser.name}
          </p>
          <p className="truncate text-[12px] text-ink-3">
            {selectedUser.email}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Choose another user"
          onClick={() => {
            onSelect(null);
            setQuery('');
          }}
        >
          <X />
        </Button>
      </div>
    );
  }

  const users = search ? (data?.items ?? []) : [];

  return (
    <div className="flex flex-col gap-2">
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search by name or email..."
        label="Search users"
        className="sm:w-full"
      />
      {search ? (
        <ul
          aria-label="Matching users"
          className="flex max-h-60 flex-col overflow-y-auto rounded-xl border bg-card"
        >
          {isFetching && !users.length ? (
            <li className="flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-ink-3">
              <Spinner /> Searching...
            </li>
          ) : null}
          {!isFetching && !users.length ? (
            <li className="px-3 py-2.5 text-[12.5px] text-ink-3">
              No users match “{search}”.
            </li>
          ) : null}
          {users.map((user) => (
            <li key={user.id} className="border-b last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(user)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left outline-none hover:bg-accent focus-visible:bg-accent"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">
                    {user.name}
                  </span>
                  <span className="block truncate text-[11.5px] text-ink-3">
                    {user.email}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                  {formatCredits(user.balance)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AdjustmentForm() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [direction, setDirection] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    createIdempotencyKey('adjust'),
  );
  const [adjustCredits, { isLoading, error, reset }] =
    useAdjustUserCreditsMutation();

  const numericAmount = Math.max(0, Math.floor(Number(amount) || 0));
  const delta = direction === 'add' ? numericAmount : -numericAmount;
  const balance = selectedUser?.balance ?? 0;
  const nextBalance = balance + delta;
  const overdraw = Boolean(selectedUser) && nextBalance < 0;
  const tooLarge = numericAmount > MAX_AMOUNT;
  const canSubmit =
    selectedUser &&
    numericAmount > 0 &&
    !tooLarge &&
    reason &&
    !overdraw &&
    !isLoading;

  function selectUser(user) {
    setSelectedUser(user);
    reset();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    const fullReason = note.trim() ? `${reason}: ${note.trim()}` : reason;

    try {
      const result = await adjustCredits({
        userId: selectedUser.id,
        amount: delta,
        reason: fullReason,
        idempotencyKey,
      }).unwrap();

      toast.success(
        `${formatSignedCredits(result.transaction.amount)} credits applied to ${selectedUser.name}`,
      );
      setSelectedUser({ ...selectedUser, balance: result.balance });
      setAmount('');
      setReason('');
      setNote('');
      setDirection('add');
      setIdempotencyKey(createIdempotencyKey('adjust'));
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">User</span>
        <UserPicker selectedUser={selectedUser} onSelect={selectUser} />
      </div>
      <ChoiceChips
        label="Adjustment direction"
        options={DIRECTION_OPTIONS}
        value={direction}
        onChange={setDirection}
      />
      <Field
        id="adjust-amount-input"
        label="Amount (credits)"
        error={
          overdraw
            ? 'Balance cannot go below zero.'
            : tooLarge
              ? `At most ${formatCredits(MAX_AMOUNT)} credits per adjustment.`
              : undefined
        }
      >
        <Input
          id="adjust-amount-input"
          type="number"
          min="1"
          max={MAX_AMOUNT}
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="25"
          className="font-mono"
          aria-invalid={overdraw || tooLarge || undefined}
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
      <Field
        id="adjust-note"
        label="Note"
        hint="Optional context, saved with the reason."
      >
        <Textarea
          id="adjust-note"
          rows={2}
          maxLength={280}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. Compensation for a failed export"
        />
      </Field>
      {selectedUser ? (
        <div className="flex items-center justify-between rounded-xl border bg-field/60 px-3 py-2.5 text-[12.5px]">
          <span className="text-ink-3">{formatCredits(balance)} →</span>
          <span
            className={cn('font-mono font-semibold', overdraw && 'text-danger')}
          >
            {formatCredits(nextBalance)} credits
          </span>
        </div>
      ) : null}
      <Button type="submit" disabled={!canSubmit}>
        {isLoading ? <Spinner /> : null}
        Apply adjustment
      </Button>
    </form>
  );
}

export function WalletAdjustmentsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useListCreditAdjustmentsQuery({
    page,
    limit: PAGE_SIZE,
  });
  const adjustments = data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Wallet adjustments"
        count={data ? `${data.meta.total} adjustments` : null}
      />
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel
          title="New adjustment"
          description="Credit or debit a user wallet. Logged with your account."
          className="self-start"
        >
          <AdjustmentForm />
        </Panel>

        <AdminTable
          columns={COLUMNS}
          tableClassName="min-w-[760px]"
          className={cn('self-start', isFetching && !isLoading && 'opacity-70')}
          footer={
            <PaginationFooter
              pagination={serverPagination(data?.meta, setPage)}
            />
          }
        >
          <TableStateRows
            colSpan={COLUMNS.length}
            isLoading={isLoading}
            error={error}
            isEmpty={data && adjustments.length === 0}
            empty="No adjustments yet."
          />
          {adjustments.map((entry) => (
            <TableRow key={entry.id}>
              <AdminCell className="font-mono text-[12px] whitespace-nowrap text-ink-3">
                {formatLogTime(entry.createdAt)}
              </AdminCell>
              <AdminCell className="text-[12.5px] text-muted-foreground">
                {entry.admin?.email ?? 'system'}
              </AdminCell>
              <AdminCell className="whitespace-nowrap">
                <p className="text-[13px]">{entry.user?.name ?? '—'}</p>
                <p className="text-[11.5px] text-ink-3">{entry.user?.email}</p>
              </AdminCell>
              <AdminCell
                className={cn(
                  'font-mono text-[12.5px] whitespace-nowrap',
                  entry.amount > 0 ? 'text-success' : 'text-danger',
                )}
              >
                {formatSignedCredits(entry.amount)}
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px] text-muted-foreground">
                {formatCredits(entry.balanceAfter)}
              </AdminCell>
              <AdminCell className="max-w-64 truncate text-[12.5px]">
                {entry.reason}
              </AdminCell>
            </TableRow>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
