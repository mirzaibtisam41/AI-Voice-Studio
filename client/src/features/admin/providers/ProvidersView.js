'use client';

import { useState } from 'react';
import { Plus, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { Tag } from '@/components/ui/StatusBadge';
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
import { ConfirmDialog } from '@/features/admin/shared/ConfirmDialog';
import { AdminCell, AdminTable } from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { NoticeAlert } from '@/features/admin/shared/NoticeAlert';
import { simulateWork } from '@/features/admin/shared/adminFormat';
import { ADMIN_MODELS, ADMIN_PROVIDERS } from '@/mocks/adminModels';

const COLUMNS = [
  'Provider',
  'Code',
  'Capabilities',
  'Models',
  'Status',
  'API key',
];

const EMPTY_FORM = { name: '', code: '', baseUrl: '', apiKey: '' };

function randomKeySuffix() {
  return Math.random().toString(16).slice(2, 6);
}

function AddProviderForm({ takenCodes, onCreate, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const code = form.code.trim().toLowerCase();
  const codeTaken = takenCodes.includes(code);
  const canSubmit =
    form.name.trim() &&
    code &&
    !codeTaken &&
    form.baseUrl.trim() &&
    form.apiKey;

  function update(field) {
    return (event) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    simulateWork(() => {
      setSaving(false);
      onCreate({
        id: code,
        name: form.name.trim(),
        code,
        baseUrl: form.baseUrl.trim(),
        capabilities: [],
        enabled: false,
        keyLast4: form.apiKey.slice(-4),
      });
    }, 1100);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <NoticeAlert tone="warning">
        Only OpenAI is wired up in this build. New providers are saved but stay
        disabled until an adapter exists.
      </NoticeAlert>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="provider-name" label="Name">
          <Input
            id="provider-name"
            value={form.name}
            onChange={update('name')}
            placeholder="ElevenLabs"
          />
        </Field>
        <Field
          id="provider-code"
          label="Code"
          error={codeTaken ? 'Code already in use.' : undefined}
        >
          <Input
            id="provider-code"
            value={form.code}
            onChange={update('code')}
            placeholder="elevenlabs"
            className="font-mono"
          />
        </Field>
      </div>
      <Field id="provider-url" label="Base URL">
        <Input
          id="provider-url"
          type="url"
          value={form.baseUrl}
          onChange={update('baseUrl')}
          placeholder="https://api.example.com/v1"
          className="font-mono"
        />
      </Field>
      <Field id="provider-key" label="API key" hint="Stored encrypted.">
        <Input
          id="provider-key"
          type="password"
          autoComplete="off"
          value={form.apiKey}
          onChange={update('apiKey')}
          placeholder="sk-..."
          className="font-mono"
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || saving}>
          {saving ? <Spinner /> : null}
          Add provider
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ProvidersView() {
  const [providers, setProviders] = useState(ADMIN_PROVIDERS);
  const [adding, setAdding] = useState(false);
  const [rotatingId, setRotatingId] = useState(null);
  const [confirmRotateId, setConfirmRotateId] = useState(null);
  const confirmProvider = providers.find(
    (provider) => provider.id === confirmRotateId,
  );

  function updateProvider(id, changes) {
    setProviders((current) =>
      current.map((provider) =>
        provider.id === id ? { ...provider, ...changes } : provider,
      ),
    );
  }

  function handleToggle(provider, enabled) {
    updateProvider(provider.id, { enabled });
    toast.success(`${provider.name} ${enabled ? 'enabled' : 'disabled'}`);
  }

  function handleRotate() {
    const provider = confirmProvider;
    setConfirmRotateId(null);
    setRotatingId(provider.id);
    simulateWork(() => {
      updateProvider(provider.id, { keyLast4: randomKeySuffix() });
      setRotatingId(null);
      toast.success(`${provider.name} API key rotated`);
    }, 1400);
  }

  function handleCreate(provider) {
    setProviders((current) => [...current, provider]);
    setAdding(false);
    toast.success(`${provider.name} added (disabled)`);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="AI providers"
        count={`${providers.length} connected`}
      >
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus />
          Add provider
        </Button>
      </AdminPageHeader>

      <AdminTable columns={COLUMNS} tableClassName="min-w-[820px]">
        {providers.map((provider) => {
          const modelCount = ADMIN_MODELS.filter(
            (model) => model.provider === provider.name,
          ).length;

          return (
            <TableRow key={provider.id}>
              <AdminCell>
                <p className="text-[13px] font-semibold">{provider.name}</p>
                <p className="font-mono text-[11.5px] text-ink-3">
                  {provider.baseUrl}
                </p>
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px]">
                {provider.code}
              </AdminCell>
              <AdminCell>
                <div className="flex flex-wrap gap-1.5">
                  {provider.capabilities.length ? (
                    provider.capabilities.map((capability) => (
                      <Tag key={capability}>{capability}</Tag>
                    ))
                  ) : (
                    <span className="text-[12px] text-ink-3">None yet</span>
                  )}
                </div>
              </AdminCell>
              <AdminCell className="font-mono text-[12.5px]">
                {modelCount}
              </AdminCell>
              <AdminCell>
                <Switch
                  checked={provider.enabled}
                  onCheckedChange={(enabled) => handleToggle(provider, enabled)}
                  aria-label={`${provider.name} enabled`}
                />
              </AdminCell>
              <AdminCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12.5px] whitespace-nowrap">
                    sk-•••• {provider.keyLast4}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rotatingId === provider.id}
                    onClick={() => setConfirmRotateId(provider.id)}
                    aria-label={`Rotate ${provider.name} API key`}
                  >
                    {rotatingId === provider.id ? <Spinner /> : <RotateCw />}
                    Rotate
                  </Button>
                </div>
              </AdminCell>
            </TableRow>
          );
        })}
      </AdminTable>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-lg">
          <div className="flex flex-col gap-1.5 pr-6">
            <DialogTitle>Add provider</DialogTitle>
            <DialogDescription>
              Connect another AI provider for speech and agent models.
            </DialogDescription>
          </div>
          {adding ? (
            <AddProviderForm
              takenCodes={providers.map((provider) => provider.code)}
              onCreate={handleCreate}
              onCancel={() => setAdding(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(confirmProvider)}
        onOpenChange={(open) => {
          if (!open) setConfirmRotateId(null);
        }}
        title="Rotate API key?"
        description="The current key stops working immediately. In-flight jobs may fail and will be refunded automatically."
        confirmLabel="Rotate key"
        onConfirm={handleRotate}
      />
    </div>
  );
}
