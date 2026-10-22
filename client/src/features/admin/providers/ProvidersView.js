'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
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
import { Switch } from '@/components/ui/switch';
import { TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateAiProviderMutation,
  useDeleteAiProviderMutation,
  useListAiProvidersQuery,
  useUpdateAiProviderMutation,
  useUpdateAiProviderStatusMutation,
} from '@/features/admin/adminApi';
import { ConfirmDialog } from '@/features/admin/shared/ConfirmDialog';
import {
  AdminCell,
  AdminTable,
  TableStateRows,
} from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { NoticeAlert } from '@/features/admin/shared/NoticeAlert';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';

const COLUMNS = [
  'Provider',
  'Code',
  'Models',
  'Status',
  { key: 'actions', label: 'Actions', srOnly: true },
];

const CODE_PATTERN = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;

function ProviderForm({ provider, onDone, onCancel }) {
  const editing = Boolean(provider);
  const [name, setName] = useState(provider?.name ?? '');
  const [code, setCode] = useState(provider?.code ?? '');
  const [description, setDescription] = useState(provider?.description ?? '');
  const [createProvider, createState] = useCreateAiProviderMutation();
  const [updateProvider, updateState] = useUpdateAiProviderMutation();
  const { isLoading, error } = editing ? updateState : createState;
  const fieldErrors = readFieldErrors(error);
  const trimmedCode = code.trim().toLowerCase();
  const codeInvalid = Boolean(trimmedCode) && !CODE_PATTERN.test(trimmedCode);
  const canSubmit = name.trim() && (editing || (trimmedCode && !codeInvalid));

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isLoading) return;
    const body = {
      name: name.trim(),
      description: description.trim() || null,
    };

    try {
      if (editing) {
        await updateProvider({ id: provider.id, ...body }).unwrap();
        toast.success(`${body.name} updated`);
      } else {
        await createProvider({
          ...body,
          code: trimmedCode,
          status: 'disabled',
        }).unwrap();
        toast.success(`${body.name} added (disabled)`);
      }
      onDone();
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {editing ? null : (
        <NoticeAlert tone="warning">
          Only OpenAI is wired up in this build. New providers are saved but
          stay disabled until an adapter exists.
        </NoticeAlert>
      )}
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="provider-name" label="Name" error={fieldErrors.name}>
          <Input
            id="provider-name"
            value={name}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder="ElevenLabs"
          />
        </Field>
        <Field
          id="provider-code"
          label="Code"
          hint={editing ? 'The code cannot be changed.' : undefined}
          error={
            codeInvalid
              ? 'Letters, numbers and single dashes only.'
              : fieldErrors.code
          }
        >
          <Input
            id="provider-code"
            value={code}
            maxLength={50}
            disabled={editing}
            onChange={(event) => setCode(event.target.value)}
            placeholder="elevenlabs"
            className="font-mono"
          />
        </Field>
      </div>
      <Field
        id="provider-description"
        label="Description"
        error={fieldErrors.description}
      >
        <Textarea
          id="provider-description"
          rows={2}
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this provider is used for"
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || isLoading}>
          {isLoading ? <Spinner /> : null}
          {editing ? 'Save provider' : 'Add provider'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProvidersView() {
  const { data: providers, isLoading, error } = useListAiProvidersQuery();
  const [updateStatus] = useUpdateAiProviderStatusMutation();
  const [deleteProvider] = useDeleteAiProviderMutation();
  const [dialog, setDialog] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  async function handleToggle(provider, enabled) {
    setPendingId(provider.id);
    try {
      await updateStatus({
        id: provider.id,
        status: enabled ? 'active' : 'disabled',
      }).unwrap();
      toast.success(`${provider.name} ${enabled ? 'enabled' : 'disabled'}`);
    } catch (statusError) {
      toast.error(getErrorMessage(statusError));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete() {
    const provider = deleting;

    setDeleting(null);
    try {
      await deleteProvider(provider.id).unwrap();
      toast.success(`${provider.name} deleted`);
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="AI providers"
        count={providers ? `${providers.length} connected` : null}
      >
        <Button size="sm" onClick={() => setDialog({ provider: null })}>
          <Plus />
          Add provider
        </Button>
      </AdminPageHeader>

      <AdminTable columns={COLUMNS} tableClassName="min-w-[720px]">
        <TableStateRows
          colSpan={COLUMNS.length}
          isLoading={isLoading}
          error={error}
          isEmpty={providers?.length === 0}
          empty="No providers yet."
        />
        {providers?.map((provider) => {
          const active = provider.status === 'active';

          return (
            <TableRow key={provider.id}>
              <AdminCell>
                <p className="text-[13px] font-semibold">{provider.name}</p>
                <p className="max-w-80 truncate text-[11.5px] text-ink-3">
                  {provider.description || 'No description'}
                </p>
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px]">
                {provider.code}
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px]">
                {provider.modelsCount}
              </AdminCell>
              <AdminCell>
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={active}
                    disabled={pendingId === provider.id}
                    onCheckedChange={(enabled) =>
                      handleToggle(provider, enabled)
                    }
                    aria-label={`${provider.name} enabled`}
                  />
                  <span className="text-[12px] whitespace-nowrap text-ink-3">
                    {active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </AdminCell>
              <AdminCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDialog({ provider })}
                    aria-label={`Edit ${provider.name}`}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleting(provider)}
                    aria-label={`Delete ${provider.name}`}
                    className="text-danger hover:bg-danger/10 hover:text-danger"
                  >
                    Delete
                  </Button>
                </div>
              </AdminCell>
            </TableRow>
          );
        })}
      </AdminTable>

      <Dialog
        open={Boolean(dialog)}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <div className="flex flex-col gap-1.5 pr-6">
            <DialogTitle>
              {dialog?.provider ? 'Edit provider' : 'Add provider'}
            </DialogTitle>
            <DialogDescription>
              {dialog?.provider
                ? `Update the name and description of ${dialog.provider.name}.`
                : 'Register another AI provider for speech and agent models.'}
            </DialogDescription>
          </div>
          {dialog ? (
            <ProviderForm
              key={dialog.provider?.id ?? 'new'}
              provider={dialog.provider}
              onDone={() => setDialog(null)}
              onCancel={() => setDialog(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={`Delete ${deleting?.name ?? 'provider'}?`}
        description="Providers that still have models cannot be deleted. This cannot be undone."
        confirmLabel="Delete provider"
        onConfirm={handleDelete}
      />
    </div>
  );
}
