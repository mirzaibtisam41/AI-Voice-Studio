'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge, Tag } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TableRow } from '@/components/ui/table';
import { Chip } from '@/components/ui/ChoiceChips';
import { AdminCell, AdminTable } from '@/features/admin/shared/AdminTable';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import { simulateWork } from '@/features/admin/shared/adminFormat';
import { cn } from '@/lib/utils';
import {
  ADMIN_MODELS,
  CAPABILITY_LABELS,
  CAPABILITY_TAGS,
  DEFAULT_MODELS,
} from '@/mocks/adminModels';

const COLUMNS = ['Model', 'Provider', 'Capabilities', 'Default for', 'Status'];

function DefaultDot({ capability, active, disabled, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onSelect}
      title={
        disabled
          ? 'Enable the model to make it a default'
          : `Default ${CAPABILITY_LABELS[capability]} model`
      }
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11.5px] transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        active
          ? 'border-brand/60 bg-brand-tint text-brand'
          : 'bg-field text-muted-foreground hover:text-foreground',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-3 items-center justify-center rounded-full border',
          active ? 'border-brand' : 'border-ink-3',
        )}
      >
        {active ? <span className="size-1.5 rounded-full bg-brand" /> : null}
      </span>
      {capability}
    </button>
  );
}

function AddModelForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [modelId, setModelId] = useState('');
  const [capabilities, setCapabilities] = useState([]);
  const [saving, setSaving] = useState(false);
  const canSubmit = name.trim() && modelId.trim() && capabilities.length > 0;

  function toggleCapability(capability) {
    setCapabilities((current) =>
      current.includes(capability)
        ? current.filter((item) => item !== capability)
        : [...current, capability],
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    simulateWork(() => {
      setSaving(false);
      onCreate({
        id: modelId.trim(),
        name: name.trim(),
        providerModelId: modelId.trim(),
        provider: 'OpenAI',
        capabilities: CAPABILITY_TAGS.filter((tag) =>
          capabilities.includes(tag),
        ),
        enabled: false,
        status: 'active',
        note: 'Added manually',
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field id="model-name" label="Display name">
        <Input
          id="model-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="GPT Realtime 2.2 mini"
        />
      </Field>
      <Field
        id="model-id"
        label="Provider model ID"
        hint="Exactly as the OpenAI API expects it."
      >
        <Input
          id="model-id"
          value={modelId}
          onChange={(event) => setModelId(event.target.value)}
          placeholder="gpt-realtime-2.2-mini"
          className="font-mono"
        />
      </Field>
      <div className="flex flex-col gap-2">
        <Label id="model-capabilities-label">Capabilities</Label>
        <div
          role="group"
          aria-labelledby="model-capabilities-label"
          className="flex flex-wrap gap-2"
        >
          {CAPABILITY_TAGS.map((capability) => (
            <Chip
              key={capability}
              selected={capabilities.includes(capability)}
              onClick={() => toggleCapability(capability)}
            >
              {capability}
            </Chip>
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || saving}>
          {saving ? <Spinner /> : null}
          Add model
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModelsView() {
  const [models, setModels] = useState(ADMIN_MODELS);
  const [defaults, setDefaults] = useState(DEFAULT_MODELS);
  const [adding, setAdding] = useState(false);
  const enabledCount = models.filter((model) => model.enabled).length;

  function handleToggle(model, enabled) {
    const defaultFor = Object.entries(defaults)
      .filter(([, id]) => id === model.id)
      .map(([capability]) => capability);

    if (!enabled && defaultFor.length) {
      toast.error(
        `${model.providerModelId} is the default for ${defaultFor.join(', ')}. Pick another default first.`,
      );
      return;
    }

    setModels((current) =>
      current.map((item) =>
        item.id === model.id ? { ...item, enabled } : item,
      ),
    );
    toast.success(
      `${model.providerModelId} ${enabled ? 'enabled' : 'disabled'}`,
    );
  }

  function handleSetDefault(capability, model) {
    if (defaults[capability] === model.id) return;
    setDefaults((current) => ({ ...current, [capability]: model.id }));
    toast.success(
      `${model.providerModelId} is now the default for ${CAPABILITY_LABELS[capability]}`,
    );
  }

  function handleCreate(model) {
    setModels((current) => [...current, model]);
    setAdding(false);
    toast.success(`${model.providerModelId} added (disabled)`);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="AI model management"
        count={`${enabledCount} of ${models.length} enabled`}
      >
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus />
          Add model
        </Button>
      </AdminPageHeader>

      <AdminTable columns={COLUMNS} tableClassName="min-w-[860px]">
        {models.map((model) => {
          const deprecated = model.status === 'deprecated';

          return (
            <TableRow key={model.id}>
              <AdminCell>
                <p className="text-[13px] font-semibold">{model.name}</p>
                <p className="font-mono text-[11.5px] text-ink-3">
                  {model.providerModelId}
                </p>
              </AdminCell>
              <AdminCell className="text-muted-foreground">
                {model.provider}
              </AdminCell>
              <AdminCell>
                <div className="flex flex-wrap gap-1.5">
                  {model.capabilities.map((capability) => (
                    <Tag key={capability}>{capability}</Tag>
                  ))}
                </div>
              </AdminCell>
              <AdminCell>
                <div className="flex flex-wrap gap-1.5">
                  {model.capabilities.map((capability) => (
                    <DefaultDot
                      key={capability}
                      capability={capability}
                      active={defaults[capability] === model.id}
                      disabled={!model.enabled || deprecated}
                      onSelect={() => handleSetDefault(capability, model)}
                    />
                  ))}
                </div>
              </AdminCell>
              <AdminCell>
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={model.enabled}
                    disabled={deprecated}
                    onCheckedChange={(enabled) => handleToggle(model, enabled)}
                    aria-label={`${model.providerModelId} enabled`}
                  />
                  {deprecated ? (
                    <span className="flex flex-col gap-0.5">
                      <StatusBadge tone="warning">Deprecated</StatusBadge>
                      <span className="text-[11px] whitespace-nowrap text-ink-3">
                        {model.note}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[12px] whitespace-nowrap text-ink-3">
                      {model.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
              </AdminCell>
            </TableRow>
          );
        })}
      </AdminTable>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <div className="flex flex-col gap-1.5 pr-6">
            <DialogTitle>Add model</DialogTitle>
            <DialogDescription>
              Register an OpenAI model. It starts disabled.
            </DialogDescription>
          </div>
          {adding ? (
            <AddModelForm
              onCreate={handleCreate}
              onCancel={() => setAdding(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
