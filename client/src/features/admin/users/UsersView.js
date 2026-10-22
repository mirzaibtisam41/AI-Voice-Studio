'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/features/admin/shared/ConfirmDialog';
import {
  AdminCell,
  AdminTable,
  EmptyTableRow,
  PaginationFooter,
  usePagination,
} from '@/features/admin/shared/AdminTable';
import {
  AdminPageHeader,
  FilterSelect,
  SearchField,
} from '@/features/admin/shared/AdminToolbar';
import {
  formatCredits,
  formatSignedCredits,
} from '@/features/admin/shared/adminFormat';
import { AdjustCreditsDialog } from '@/features/admin/users/AdjustCreditsDialog';
import { UserDetailsSheet } from '@/features/admin/users/UserDetailsSheet';
import { formatDate } from '@/lib/format';
import { ADMIN_PLANS, ADMIN_USERS, USER_STATUSES } from '@/mocks/adminUsers';

const PLAN_OPTIONS = [
  { value: 'all', label: 'All plans' },
  ...ADMIN_PLANS.map((plan) => ({ value: plan, label: plan })),
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(USER_STATUSES).map(([value, status]) => ({
    value,
    label: status.label,
  })),
];

const COLUMNS = [
  'User',
  'Plan',
  'Credits',
  'Status',
  'Joined',
  { key: 'actions', label: 'Actions', srOnly: true },
];

export function UsersView() {
  const [users, setUsers] = useState(ADMIN_USERS);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState('all');
  const [adjustingId, setAdjustingId] = useState(null);
  const [suspendingId, setSuspendingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const term = query.trim().toLowerCase();
  const filtered = users.filter(
    (user) =>
      (plan === 'all' || user.plan === plan) &&
      (status === 'all' || user.status === status) &&
      `${user.name} ${user.email}`.toLowerCase().includes(term),
  );
  const pagination = usePagination(filtered, 8);
  const adjustingUser = users.find((user) => user.id === adjustingId) ?? null;
  const suspendingUser = users.find((user) => user.id === suspendingId);
  const viewingUser = users.find((user) => user.id === viewingId) ?? null;

  function updateUser(id, changes) {
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, ...changes } : user)),
    );
  }

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      pagination.setPage(1);
    };
  }

  function handleAdjust(delta) {
    updateUser(adjustingUser.id, { credits: adjustingUser.credits + delta });
    toast.success(
      `${formatSignedCredits(delta)} credits applied to ${adjustingUser.name}`,
    );
    setAdjustingId(null);
  }

  function handleSuspend() {
    updateUser(suspendingUser.id, { status: 'suspended' });
    toast.success(`${suspendingUser.name} suspended`);
    setSuspendingId(null);
  }

  function handleUnsuspend(user) {
    updateUser(user.id, { status: 'active' });
    toast.success(`${user.name} reactivated`);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Users"
        count={`${filtered.length} ${filtered.length === 1 ? 'user' : 'users'}`}
      >
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Search users..."
        />
        <FilterSelect
          label="Filter by plan"
          value={plan}
          onChange={changeFilter(setPlan)}
          options={PLAN_OPTIONS}
          className="sm:w-36"
        />
        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          options={STATUS_OPTIONS}
          className="sm:w-36"
        />
      </AdminPageHeader>

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[760px]"
        footer={<PaginationFooter pagination={pagination} />}
      >
        {pagination.pageItems.length ? (
          pagination.pageItems.map((user) => {
            const userStatus = USER_STATUSES[user.status];
            const suspended = user.status === 'suspended';

            return (
              <TableRow key={user.id}>
                <AdminCell>
                  <button
                    type="button"
                    onClick={() => setViewingId(user.id)}
                    className="flex min-w-0 items-center gap-3 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <UserAvatar name={user.name} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold hover:underline">
                        {user.name}
                      </span>
                      <span className="block truncate text-[12px] text-ink-3">
                        {user.email}
                      </span>
                    </span>
                  </button>
                </AdminCell>
                <AdminCell>
                  <Tag>{user.plan}</Tag>
                </AdminCell>
                <AdminCell className="font-mono text-[12.5px]">
                  {formatCredits(user.credits)}
                </AdminCell>
                <AdminCell>
                  <StatusBadge tone={userStatus.tone}>
                    {userStatus.label}
                  </StatusBadge>
                </AdminCell>
                <AdminCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(user.joinedAt)}
                </AdminCell>
                <AdminCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdjustingId(user.id)}
                      aria-label={`Adjust credits for ${user.name}`}
                    >
                      Adjust
                    </Button>
                    {suspended ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsuspend(user)}
                        aria-label={`Unsuspend ${user.name}`}
                      >
                        Unsuspend
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSuspendingId(user.id)}
                        aria-label={`Suspend ${user.name}`}
                        className="bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger"
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                </AdminCell>
              </TableRow>
            );
          })
        ) : (
          <EmptyTableRow colSpan={COLUMNS.length}>
            No users match these filters.
          </EmptyTableRow>
        )}
      </AdminTable>

      <AdjustCreditsDialog
        user={adjustingUser}
        onOpenChange={(open) => {
          if (!open) setAdjustingId(null);
        }}
        onSubmit={handleAdjust}
      />
      <ConfirmDialog
        open={Boolean(suspendingUser)}
        onOpenChange={(open) => {
          if (!open) setSuspendingId(null);
        }}
        title={`Suspend ${suspendingUser?.name ?? 'user'}?`}
        description="They will be signed out and blocked from generating audio until reactivated. Their credits are kept."
        confirmLabel="Suspend user"
        onConfirm={handleSuspend}
      />
      <UserDetailsSheet
        user={viewingUser}
        onOpenChange={(open) => {
          if (!open) setViewingId(null);
        }}
      />
    </div>
  );
}
