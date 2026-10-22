'use client';

import { useState } from 'react';
import { Coins, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
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
  useCreateAiModelMutation,
  useListAiCapabilitiesQuery,
  useListAiModelsQuery,
  useListAiProvidersQuery,
} from '@/features/admin/adminApi';
import { ModelPricingSheet } from '@/features/admin/models/ModelPricingSheet';
import {
  MODEL_STATUSES,
  ModelStatusSelect,
} from '@/features/admin/models/ModelStatusSelect';
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
import { capabilityShortLabel } from '@/features/admin/shared/adminFormat';
import { useDebouncedValue } from '@/features/admin/shared/useDebouncedValue';
import { getErrorMessage, readFieldErrors } from '@/lib/apiError';

const PAGE_SIZE = 10;

const COLUMNS = [
  'Model',
  'Provider',
  'Capabilities & rates',
  'Default for',
  'Status',
  { key: 'actions', label: 'Actions', srOnly: true },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  ...Object.entries(MODEL_STATUSES).map(([value, status]) => ({
    value,
    label: status.label,
  })),
];

const SLUG_PATTERN = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
const PROVIDER_MODEL_ID_PATTERN = /^[A-Za-z0-9._:/-]+$/;

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function AddModelForm({ providers, onDone, onCancel }) {
  const [providerId, setProviderId] = useState(providers[0]?.id ?? '');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [providerModelId, setProviderModelId] = useState('');
  const [description, setDescription] = useState('');
  const [createModel, { isLoading, error }] = useCreateAiModelMutation();
  const fieldErrors = readFieldErrors(error);
  const effectiveSlug = slugTouched ? slug.trim() : toSlug(name);
  const slugInvalid =
    Boolean(effectiveSlug) && !SLUG_PATTERN.test(effectiveSlug);
  const modelIdInvalid =
    Boolean(providerModelId.trim()) &&
    !PROVIDER_MODEL_ID_PATTERN.test(providerModelId.trim());
  const canSubmit =
    providerId &&
    name.trim() &&
    effectiveSlug &&
    !slugInvalid &&
    providerModelId.trim() &&
    !modelIdInvalid;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isLoading) return;

    try {
      const model = await createModel({
        providerId,
        name: name.trim(),
        slug: effectiveSlug,
        providerModelId: providerModelId.trim(),
        description: description.trim() || null,
      }).unwrap();

      toast.success(`${model.name} added as a draft. Set its rates next.`);
      onDone(model);
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
      <Field id="model-provider" label="Provider">
        <Select value={providerId} onValueChange={setProviderId}>
          <SelectTrigger id="model-provider">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="model-name" label="Display name" error={fieldErrors.name}>
          <Input
            id="model-name"
            value={name}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder="GPT Realtime 2.2 mini"
          />
        </Field>
        <Field
          id="model-slug"
          label="Slug"
          error={
            slugInvalid
              ? 'Letters, numbers and single dashes only.'
              : fieldErrors.slug
          }
        >
          <Input
            id="model-slug"
            value={effectiveSlug}
            maxLength={100}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            placeholder="gpt-realtime-2-2-mini"
            className="font-mono"
          />
        </Field>
      </div>
      <Field
        id="model-id"
        label="Provider model ID"
        hint="Exactly as the provider API expects it."
        error={
          modelIdInvalid
            ? 'Letters, numbers and . _ : / - only.'
            : fieldErrors.providerModelId
        }
      >
        <Input
          id="model-id"
          value={providerModelId}
          maxLength={150}
          onChange={(event) => setProviderModelId(event.target.value)}
          placeholder="gpt-realtime-2.2-mini"
          className="font-mono"
        />
      </Field>
      <Field id="model-description" label="Description">
        <Textarea
          id="model-description"
          rows={2}
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || isLoading}>
          {isLoading ? <Spinner /> : null}
          Add model
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ModelsView() {
  const [query, setQuery] = useState('');
  const [providerId, setProviderId] = useState('all');
  const [status, setStatus] = useState('all');
  const [capability, setCapability] = useState('all');
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [pricingId, setPricingId] = useState(null);
  const search = useDebouncedValue(query.trim());
  const { data: providers } = useListAiProvidersQuery();
  const { data: capabilities } = useListAiCapabilitiesQuery();
  const { data, isLoading, isFetching, error } = useListAiModelsQuery({
    page,
    limit: PAGE_SIZE,
    search,
    providerId: providerId === 'all' ? undefined : providerId,
    status: status === 'all' ? undefined : status,
    capability: capability === 'all' ? undefined : capability,
  });
  const models = data?.items ?? [];

  const providerOptions = [
    { value: 'all', label: 'All providers' },
    ...(providers ?? []).map((provider) => ({
      value: provider.id,
      label: provider.name,
    })),
  ];
  const capabilityOptions = [
    { value: 'all', label: 'All capabilities' },
    ...(capabilities ?? []).map((item) => ({
      value: item.code,
      label: item.label,
    })),
  ];

  function changeFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="AI model management"
        count={data ? `${data.meta.total} models` : null}
      >
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          disabled={!providers?.length}
        >
          <Plus />
          Add model
        </Button>
      </AdminPageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={query}
          onChange={changeFilter(setQuery)}
          placeholder="Search models..."
        />
        <FilterSelect
          label="Filter by provider"
          value={providerId}
          onChange={changeFilter(setProviderId)}
          options={providerOptions}
        />
        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={changeFilter(setStatus)}
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          label="Filter by capability"
          value={capability}
          onChange={changeFilter(setCapability)}
          options={capabilityOptions}
          className="sm:w-52"
        />
      </div>

      <AdminTable
        columns={COLUMNS}
        tableClassName="min-w-[980px]"
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
          isEmpty={data && models.length === 0}
          empty="No models match these filters."
        />
        {models.map((model) => {
          const enabled = model.capabilities.filter((item) => item.enabled);
          const defaults = model.capabilities.filter((item) => item.isDefault);

          return (
            <TableRow key={model.id}>
              <AdminCell>
                <p className="text-[13px] font-semibold">{model.name}</p>
                <p className="font-mono text-[11.5px] text-ink-3">
                  {model.providerModelId}
                </p>
              </AdminCell>
              <AdminCell className="whitespace-nowrap text-muted-foreground">
                {model.provider?.name ?? '—'}
                {model.provider?.status === 'disabled' ? (
                  <span className="block text-[11px] text-warning">
                    Provider disabled
                  </span>
                ) : null}
              </AdminCell>
              <AdminCell>
                <div className="flex flex-wrap gap-1.5">
                  {enabled.length ? (
                    enabled.map((item) => (
                      <Tag key={item.code} className="gap-1">
                        {capabilityShortLabel(item.code)}
                        <span className="font-mono text-foreground">
                          {item.creditsPerUnit ?? '—'}
                        </span>
                      </Tag>
                    ))
                  ) : (
                    <span className="text-[12px] text-ink-3">
                      No capabilities yet
                    </span>
                  )}
                </div>
              </AdminCell>
              <AdminCell>
                <div className="flex flex-wrap gap-1.5">
                  {defaults.length ? (
                    defaults.map((item) => (
                      <StatusBadge key={item.code} tone="brand" dot={false}>
                        {capabilityShortLabel(item.code)}
                      </StatusBadge>
                    ))
                  ) : (
                    <span className="text-[12px] text-ink-3">—</span>
                  )}
                </div>
              </AdminCell>
              <AdminCell>
                <ModelStatusSelect model={model} />
              </AdminCell>
              <AdminCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPricingId(model.id)}
                  aria-label={`Edit rates for ${model.name}`}
                >
                  <Coins />
                  Rates
                </Button>
              </AdminCell>
            </TableRow>
          );
        })}
      </AdminTable>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-w-lg">
          <div className="flex flex-col gap-1.5 pr-6">
            <DialogTitle>Add model</DialogTitle>
            <DialogDescription>
              Models start as drafts. Enable and price a capability before
              activating it.
            </DialogDescription>
          </div>
          {adding && providers ? (
            <AddModelForm
              providers={providers}
              onDone={(model) => {
                setAdding(false);
                setPricingId(model.id);
              }}
              onCancel={() => setAdding(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <ModelPricingSheet
        modelId={pricingId}
        onOpenChange={(open) => {
          if (!open) setPricingId(null);
        }}
      />
    </div>
  );
}
