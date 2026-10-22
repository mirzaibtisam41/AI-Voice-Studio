'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { FormAlert } from '@/components/ui/FormAlert';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  useGetAiModelQuery,
  useListAiCapabilitiesQuery,
  useSaveAiModelCapabilityMutation,
  useSetAiModelCapabilityDefaultMutation,
  useUpdateAiModelMutation,
} from '@/features/admin/adminApi';
import { ModelStatusSelect } from '@/features/admin/models/ModelStatusSelect';
import { formatUnit } from '@/features/admin/shared/adminFormat';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

const MAX_CREDITS_PER_UNIT = 10000;

export function CapabilityRateEditor({ model, capability, compact = false }) {
  const [enabled, setEnabled] = useState(capability.enabled);
  const [rate, setRate] = useState(
    capability.creditsPerUnit ? String(capability.creditsPerUnit) : '',
  );
  const [saveCapability, saveState] = useSaveAiModelCapabilityMutation();
  const [setDefault, defaultState] = useSetAiModelCapabilityDefaultMutation();
  const numericRate = Number(rate);
  const rateValid =
    rate === '' ||
    (Number.isInteger(numericRate) &&
      numericRate >= 1 &&
      numericRate <= MAX_CREDITS_PER_UNIT);
  const dirty =
    enabled !== capability.enabled ||
    (rate === '' ? null : numericRate) !== capability.creditsPerUnit;
  const canSave = dirty && rateValid && (!enabled || rate !== '');
  const error = saveState.error ?? defaultState.error;
  const inputId = `rate-${model.id}-${capability.code}`;

  async function handleSave() {
    if (!canSave) return;

    try {
      await saveCapability({
        id: model.id,
        code: capability.code,
        enabled,
        creditsPerUnit: rate === '' ? null : numericRate,
      }).unwrap();
      defaultState.reset();
      toast.success(`${capability.label} rate saved for ${model.name}`);
    } catch {
      return;
    }
  }

  async function handleMakeDefault() {
    try {
      await setDefault({ id: model.id, code: capability.code }).unwrap();
      saveState.reset();
      toast.success(`${model.name} is now the default for ${capability.label}`);
    } catch {
      return;
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-3.5',
        capability.isDefault ? 'border-brand/50 bg-brand-tint/40' : 'bg-card',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[13px] font-semibold">{capability.label}</p>
            {capability.isDefault ? (
              <StatusBadge tone="brand" dot={false}>
                Default
              </StatusBadge>
            ) : null}
          </div>
          <p className="text-[11.5px] text-ink-3">
            Credits {formatUnit(capability.unit)}
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label={`${capability.label} enabled for ${model.name}`}
        />
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Field
          id={inputId}
          label={compact ? 'Rate' : 'Credits per unit'}
          className="w-32"
          error={rateValid ? undefined : `1 to ${MAX_CREDITS_PER_UNIT}`}
        >
          <Input
            id={inputId}
            type="number"
            min="1"
            max={MAX_CREDITS_PER_UNIT}
            step="1"
            inputMode="numeric"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            placeholder="—"
            className={cn('h-9 font-mono', dirty && 'border-brand/60')}
            aria-invalid={!rateValid || undefined}
          />
        </Field>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canSave || saveState.isLoading}
        >
          {saveState.isLoading ? <Spinner /> : null}
          Save
        </Button>
        {capability.isDefault ? null : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMakeDefault}
            disabled={
              !capability.enabled ||
              !capability.creditsPerUnit ||
              dirty ||
              defaultState.isLoading
            }
            title={
              capability.enabled
                ? undefined
                : 'Enable and price this capability first'
            }
          >
            {defaultState.isLoading ? <Spinner /> : <Star />}
            Make default
          </Button>
        )}
      </div>
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
    </div>
  );
}

function ModelDetailsForm({ model }) {
  const [name, setName] = useState(model.name);
  const [description, setDescription] = useState(model.description ?? '');
  const [updateModel, { isLoading, error }] = useUpdateAiModelMutation();
  const dirty =
    name.trim() !== model.name ||
    (description.trim() || null) !== (model.description || null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!dirty || !name.trim()) return;

    try {
      await updateModel({
        id: model.id,
        name: name.trim(),
        description: description.trim() || null,
      }).unwrap();
      toast.success('Model details saved');
    } catch {
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <FormAlert>{error ? getErrorMessage(error) : null}</FormAlert>
      <Field id="model-edit-name" label="Display name">
        <Input
          id="model-edit-name"
          value={name}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field id="model-edit-description" label="Description">
        <Textarea
          id="model-edit-description"
          rows={2}
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!dirty || !name.trim() || isLoading}
        >
          {isLoading ? <Spinner /> : null}
          Save details
        </Button>
      </div>
    </form>
  );
}

function orderedCapabilities(model, capabilities) {
  if (!capabilities) return model.capabilities;

  return capabilities.map((capability) => {
    const entry = model.capabilities.find(
      (item) => item.code === capability.code,
    );

    return {
      enabled: false,
      creditsPerUnit: null,
      isDefault: false,
      ...entry,
      ...capability,
    };
  });
}

function ModelPricing({ modelId }) {
  const { data: capabilities } = useListAiCapabilitiesQuery();
  const { data: model, isLoading, error } = useGetAiModelQuery(modelId);

  if (isLoading || error) {
    return (
      <div className="flex flex-col gap-3 p-5">
        <SheetTitle className="sr-only">Model rates</SheetTitle>
        {error ? (
          <FormAlert>{getErrorMessage(error)}</FormAlert>
        ) : (
          <>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-64 w-full" />
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <SheetHeader className="border-b p-5">
        <SheetTitle>{model.name}</SheetTitle>
        <SheetDescription className="font-mono text-[12px]">
          {model.provider?.name ?? 'Unknown provider'} · {model.providerModelId}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-5 px-5 pb-6">
        <section className="flex items-center justify-between gap-3 rounded-xl border bg-field/60 p-3.5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold">Status</p>
            <p className="text-[11.5px] text-ink-3">
              Only active models can serve requests or be a default.
            </p>
          </div>
          <ModelStatusSelect model={model} />
        </section>
        <section className="flex flex-col gap-2.5">
          <div>
            <h3 className="text-[13px] font-semibold">Capability pricing</h3>
            <p className="text-[12px] text-ink-3">
              Set what users pay in credits. The default model of each
              capability sets the public rate.
            </p>
          </div>
          {orderedCapabilities(model, capabilities).map((capability) => (
            <CapabilityRateEditor
              key={`${capability.code}-${capability.enabled}-${capability.creditsPerUnit}`}
              model={model}
              capability={capability}
            />
          ))}
        </section>
        <section className="flex flex-col gap-2.5">
          <h3 className="text-[13px] font-semibold">Details</h3>
          <ModelDetailsForm key={model.id} model={model} />
        </section>
      </div>
    </>
  );
}

export function ModelPricingSheet({ modelId, onOpenChange }) {
  return (
    <Sheet open={Boolean(modelId)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {modelId ? <ModelPricing modelId={modelId} /> : null}
      </SheetContent>
    </Sheet>
  );
}
