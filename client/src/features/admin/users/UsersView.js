'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { TableRow } from '@/components/ui/table';
import {
  useListAdminUsersQuery,
  useUpdateUserStatusMutation,
} from '@/features/admin/adminApi';
import { ConfirmDialog } from '@/features/admin/shared/ConfirmDialog';
import {
  AdminCell,
  AdminTable,
  PaginationFooter,
  TableStateRows,
  serverPagination,
} from '@/features/admin/shared/AdminTable';
import {
  AdminPageHeader,
  FilterSelect,
  SearchField,
} from '@/features/admin/shared/AdminToolbar';
import { formatCredits } from '@/features/admin/shared/adminFormat';
import { useDebouncedValue } from '@/features/admin/shared/useDebouncedValue';
import { AdjustCreditsDialog } from '@/features/admin/users/AdjustCreditsDialog';
import { UserDetailsSheet } from '@/features/admin/users/UserDetailsSheet';
import { USER_STATUSES } from '@/features/admin/users/userStatuses';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { getErrorMessage } from '@/lib/apiError';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(USER_STATUSES).map(([value, status]) => ({
    value,
    label: status.label,
  })),
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'user', label: 'Users' },
  { value: 'admin', label: 'Admins' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'balance', label: 'Highest balance' },
];

const COLUMNS = [
  'User',
  'Role',
  'Credits',
  'Status',
  'Joined',
  { key: 'actions', label: 'Actions', srOnly: true },
];

export function UsersView() {
  const currentUser = useSelector(selectCurrentUser);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [adjustingUser, setAdjustingUser] = useState(null);
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const search = useDebouncedValue(query.trim());

  const { data, isLoading, isFetching, error } = useListAdminUsersQuery({
    page,
    limit: PAGE_SIZE,
    search,
    status: status === 'all' ? undefined : status,
    role: role === 'all' ? undefined : role,
    sort,
  });
  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateUserStatusMutation();
  const users = data?.items ?? [];
  const total = data?.meta.total ?? 0;

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  async function changeStatus(user, nextStatus) {
    try {
      await updateStatus({ userId: user.id, status: nextStatus }).unwrap();
      toast.success(
        nextStatus === 'suspended'
          ? `${user.name} suspended`
          : `${user.name} reactivated`,
      );
    } catch (statusError) {
      toast.error(getErrorMessage(statusError));
    }
  }

  async function handleSuspend() {
    const user = suspendingUser;

    setSuspendingUser(null);
    await changeStatus(user, 'suspended');
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Users"
        count={data ? `${total} ${total === 1 ? 'user' : 'users'}` : null}
      >
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Search users..."
        />
        <FilterSelect
          label="Filter by role"
          value={role}
          onChange={changeFilter(setRole)}
          options={ROLE_OPTIONS}
          className="sm:w-32"
        />
        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          options={STATUS_OPTIONS}
          className="sm:w-36"
        />
        <FilterSelect
          label="Sort users"
          value={sort}
          onChange={changeFilter(setSort)}
          options={SORT_OPTIONS}
          className="sm:w-40"
        />
      </AdminPageHeader>

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[760px]"
        className={isFetching && !isLoading ? 'opacity-70' : undefined}
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
          isEmpty={data && users.length === 0}
          empty="No users match these filters."
        />
        {users.map((user) => {
          const userStatus = USER_STATUSES[user.status] ?? USER_STATUSES.active;
          const isSelf = currentUser?.id === user.id;

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
                      {isSelf ? (
                        <span className="ml-1.5 font-normal text-ink-3">
                          (you)
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[12px] text-ink-3">
                      {user.email}
                    </span>
                  </span>
                </button>
              </AdminCell>
              <AdminCell>
                {user.role === 'admin' ? (
                  <StatusBadge tone="brand" dot={false}>
                    Admin
                  </StatusBadge>
                ) : (
                  <Tag>User</Tag>
                )}
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px]">
                {formatCredits(user.balance)}
              </AdminCell>
              <AdminCell>
                <StatusBadge tone={userStatus.tone}>
                  {userStatus.label}
                </StatusBadge>
              </AdminCell>
              <AdminCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(user.createdAt)}
              </AdminCell>
              <AdminCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAdjustingUser(user)}
                    aria-label={`Adjust credits for ${user.name}`}
                  >
                    Adjust
                  </Button>
                  {isSelf ? null : user.status === 'active' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSuspendingUser(user)}
                      aria-label={`Suspend ${user.name}`}
                      className="bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger"
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatingStatus}
                      onClick={() => changeStatus(user, 'active')}
                      aria-label={`${user.status === 'suspended' ? 'Unsuspend' : 'Reactivate'} ${user.name}`}
                    >
                      {user.status === 'suspended' ? 'Unsuspend' : 'Reactivate'}
                    </Button>
                  )}
                </div>
              </AdminCell>
            </TableRow>
          );
        })}
      </AdminTable>

      <AdjustCreditsDialog
        user={adjustingUser}
        onOpenChange={(open) => {
          if (!open) setAdjustingUser(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(suspendingUser)}
        onOpenChange={(open) => {
          if (!open) setSuspendingUser(null);
        }}
        title={`Suspend ${suspendingUser?.name ?? 'user'}?`}
        description="They will be signed out and blocked from signing in until reactivated. Their credits are kept."
        confirmLabel="Suspend user"
        onConfirm={handleSuspend}
      />
      <UserDetailsSheet
        userId={viewingId}
        isSelf={viewingId === currentUser?.id}
        onOpenChange={(open) => {
          if (!open) setViewingId(null);
        }}
        onAdjust={(user) => setAdjustingUser(user)}
      />
    </div>
  );
}
