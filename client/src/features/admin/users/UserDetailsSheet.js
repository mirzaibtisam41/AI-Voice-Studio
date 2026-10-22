'use client';

import { UserAvatar } from '@/components/layout/UserAvatar';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  formatCredits,
  formatSignedCredits,
} from '@/features/admin/shared/adminFormat';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { USER_STATUSES, getUserTransactions } from '@/mocks/adminUsers';

function DetailStat({ label, value }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <p className="text-[11.5px] text-ink-3">{label}</p>
      <p className="mt-1 font-mono text-[15px] font-semibold">{value}</p>
    </div>
  );
}

export function UserDetailsSheet({ user, onOpenChange }) {
  const status = user ? USER_STATUSES[user.status] : null;

  return (
    <Sheet open={Boolean(user)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {user ? (
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
                <Tag>{user.plan} plan</Tag>
                <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                <span className="text-[12px] text-ink-3">
                  Joined {formatDate(user.joinedAt)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <DetailStat
                  label="Credit balance"
                  value={formatCredits(user.credits)}
                />
                <DetailStat
                  label="Used this month"
                  value={formatCredits(user.usageThisMonth)}
                />
                <DetailStat label="Sessions" value={user.sessions} />
                <DetailStat label="User ID" value={user.id} />
              </div>
              <section className="flex flex-col gap-2">
                <h3 className="text-[13px] font-semibold">
                  Recent transactions
                </h3>
                <ul className="divide-y rounded-xl border bg-card">
                  {getUserTransactions(user).map((transaction) => (
                    <li
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px]">
                          {transaction.label}
                        </p>
                        <p className="text-[11px] text-ink-3">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 font-mono text-[12.5px]',
                          transaction.amount > 0
                            ? 'text-success'
                            : 'text-muted-foreground',
                        )}
                      >
                        {formatSignedCredits(transaction.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
