'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateAiModelStatusMutation } from '@/features/admin/adminApi';
import { ConfirmDialog } from '@/features/admin/shared/ConfirmDialog';
import { getErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

export const MODEL_STATUSES = {
  draft: {
    label: 'Draft',
    tone: 'neutral',
    className: 'text-muted-foreground',
  },
  active: { label: 'Active', tone: 'success', className: 'text-success' },
  disabled: { label: 'Disabled', tone: 'neutral', className: 'text-ink-3' },
  deprecated: {
    label: 'Deprecated',
    tone: 'warning',
    className: 'text-warning',
  },
};

export function ModelStatusSelect({ model, className }) {
  const [updateStatus, { isLoading }] = useUpdateAiModelStatusMutation();
  const [pendingStatus, setPendingStatus] = useState(null);
  const defaultLabels = model.capabilities
    .filter((capability) => capability.isDefault)
    .map((capability) => capability.label);

  function handleSelect(status) {
    if (status === model.status) return;
    if (status !== 'active' && defaultLabels.length) {
      setPendingStatus(status);
      return;
    }
    changeStatus(status);
  }

  async function changeStatus(status) {
    try {
      await updateStatus({ id: model.id, status }).unwrap();
      toast.success(
        `${model.name} is now ${MODEL_STATUSES[status].label.toLowerCase()}`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <StatusPicker
        model={model}
        className={className}
        disabled={isLoading}
        onSelect={handleSelect}
      />
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
        title={`Make ${model.name} ${MODEL_STATUSES[pendingStatus]?.label.toLowerCase() ?? ''}?`}
        description={`${model.name} is the default model for ${defaultLabels.join(', ')}. If no other active model can take over, these features become unavailable to users until you choose a new default.`}
        confirmLabel="Change status"
        onConfirm={() => {
          const status = pendingStatus;

          setPendingStatus(null);
          changeStatus(status);
        }}
      />
    </>
  );
}

function StatusPicker({ model, className, disabled, onSelect }) {
  return (
    <Select value={model.status} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger
        aria-label={`${model.name} status`}
        className={cn(
          'h-8 w-32 text-[12.5px]',
          MODEL_STATUSES[model.status]?.className,
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(MODEL_STATUSES).map(([value, status]) => (
          <SelectItem key={value} value={value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
