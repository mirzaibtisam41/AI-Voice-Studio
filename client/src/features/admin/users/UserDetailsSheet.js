'use client';

import { toast } from 'sonner';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { FormAlert } from '@/components/ui/FormAlert';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetAdminUserQuery,
  useGetAdminUserWalletQuery,
  useUpdateUserRoleMutation,
} from '@/features/admin/adminApi';
import {
  CREDIT_TRANSACTION_LABELS,
  formatCredits,
  formatSignedCredits,
} from '@/features/admin/shared/adminFormat';
import { USER_STATUSES } from '@/features/admin/users/userStatuses';
import { getErrorMessage } from '@/lib/apiError';
import { formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

function DetailStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border bg-card p-3">
      <p className="text-[11.5px] text-ink-3">{label}</p>
      <p className="mt-1 truncate font-mono text-[15px] font-semibold">
        {value}
      </p>
    </div>
  );
}

function RoleSelect({ user, isSelf }) {
  const [updateRole, { isLoading }] = useUpdateUserRoleMutation();

  async function handleChange(role) {
    if (role === user.role) return;

    try {
      await updateRole({ userId: user.id, role }).unwrap();
      toast.success(
        `${user.name} is now ${role === 'admin' ? 'an admin' : 'a user'}`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3">
      <div className="min-w-0">
        <Label htmlFor="user-role">Role</Label>
        <p className="text-[11.5px] text-ink-3">
          {isSelf
            ? 'You cannot change your own role.'
            : 'Admins can open this console.'}
        </p>
      </div>
      <Select
        value={user.role}
        onValueChange={handleChange}
        disabled={isSelf || isLoading}
      >
        <SelectTrigger id="user-role" className="h-9 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function TransactionList({ userId }) {
  const { data, isLoading, error } = useGetAdminUserWalletQuery(userId);

  if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;
  if (error) return <FormAlert>{getErrorMessage(error)}</FormAlert>;
  if (!data.transactions.length) {
    return <p className="text-[12.5px] text-ink-3">No transactions yet.</p>;
  }

  return (
    <ul className="divide-y rounded-xl border bg-card">
      {data.transactions.map((transaction) => (
        <li
          key={transaction.id}
          className="flex items-center justify-between gap-3 px-3 py-2.5"
        >
          <div className="min-w-0">
            <p className="truncate text-[12.5px]">
              {transaction.reason ??
                CREDIT_TRANSACTION_LABELS[transaction.type] ??
                transaction.type}
            </p>
            <p className="text-[11px] text-ink-3">
              {CREDIT_TRANSACTION_LABELS[transaction.type] ?? transaction.type}{' '}
              · {formatDateTime(transaction.createdAt)}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 font-mono text-[12.5px]',
              transaction.amount > 0 ? 'text-success' : 'text-muted-foreground',
            )}
          >
            {formatSignedCredits(transaction.amount)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function UserDetails({ userId, isSelf, onAdjust }) {
  const { data, isLoading, error } = useGetAdminUserQuery(userId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <SheetTitle className="sr-only">Loading user</SheetTitle>
        <Skeleton className="h-11 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <SheetTitle className="sr-only">User details</SheetTitle>
        <FormAlert>{getErrorMessage(error)}</FormAlert>
      </div>
    );
  }

  const { user, balance, activeSessions, usage } = data;
  const status = USER_STATUSES[user.status] ?? USER_STATUSES.active;

  return (
    <>
      <SheetHeader className="flex-row items-center gap-3 border-b p-5">
        <UserAvatar name={user.name} className="size-11 text-[13px]" />
        <div className="min-w-0">
          <SheetTitle className="truncate">{user.name}</SheetTitle>
          <SheetDescription className="truncate text-[12.5px]">
            {user.email}
          </SheetDescription>
        </div>
      </SheetHeader>
      <div className="flex flex-col gap-5 px-5 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
          {user.emailVerifiedAt ? (
            <StatusBadge tone="info" dot={false}>
              Email verified
            </StatusBadge>
          ) : null}
          <span className="text-[12px] text-ink-3">
            Joined {formatDate(user.createdAt)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <DetailStat label="Credit balance" value={formatCredits(balance)} />
          <DetailStat
            label="Credits used (all time)"
            value={formatCredits(usage.creditsUsed)}
          />
          <DetailStat
            label="Completed generations"
            value={formatCredits(usage.generations)}
          />
          <DetailStat label="Active sessions" value={activeSessions} />
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12.5px]">
          <dt className="text-ink-3">User ID</dt>
          <dd className="truncate text-right font-mono">{user.id}</dd>
          <dt className="text-ink-3">Last sign-in</dt>
          <dd className="text-right">
            {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
          </dd>
        </dl>
        <RoleSelect user={user} isSelf={isSelf} />
        <Button
          variant="outline"
          onClick={() => onAdjust({ ...user, balance })}
        >
          Adjust credits
        </Button>
        <section className="flex flex-col gap-2">
          <h3 className="text-[13px] font-semibold">Recent transactions</h3>
          <TransactionList userId={user.id} />
        </section>
      </div>
    </>
  );
}

export function UserDetailsSheet({ userId, isSelf, onOpenChange, onAdjust }) {
  return (
    <Sheet open={Boolean(userId)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {userId ? (
          <UserDetails userId={userId} isSelf={isSelf} onAdjust={onAdjust} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
