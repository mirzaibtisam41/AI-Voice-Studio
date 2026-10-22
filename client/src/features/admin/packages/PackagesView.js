'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { ConfirmDialog } from '@/features/admin/shared/ConfirmDialog';
import { AdminPageHeader } from '@/features/admin/shared/AdminToolbar';
import {
  formatCredits,
  formatUsd,
  simulateWork,
} from '@/features/admin/shared/adminFormat';
import { cn } from '@/lib/utils';
import { CREDIT_PACKAGES } from '@/mocks/adminPricing';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function PackageForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [credits, setCredits] = useState(
    initial ? String(initial.credits) : '',
  );
  const [price, setPrice] = useState(initial ? String(initial.priceUsd) : '');
  const [popular, setPopular] = useState(initial?.popular ?? false);
  const [saving, setSaving] = useState(false);
  const creditsValue = Math.floor(Number(credits));
  const priceValue = Number(price);
  const canSubmit = name.trim() && creditsValue > 0 && priceValue > 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    simulateWork(() => {
      setSaving(false);
      onSave({
        name: name.trim(),
        credits: creditsValue,
        priceUsd: priceValue,
        popular,
      });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field id="package-name" label="Name">
        <Input
          id="package-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Creator"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="package-credits" label="Credits">
          <Input
            id="package-credits"
            type="number"
            min="1"
            step="1000"
            value={credits}
            onChange={(event) => setCredits(event.target.value)}
            placeholder="150000"
            className="font-mono"
          />
        </Field>
        <Field id="package-price" label="Price (USD)">
          <Input
            id="package-price"
            type="number"
            min="0.5"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="12.00"
            className="font-mono"
          />
        </Field>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="package-popular"
          checked={popular}
          onCheckedChange={(checked) => setPopular(checked === true)}
        />
        <Label htmlFor="package-popular">Mark as “Most popular”</Label>
      </div>
      {canSubmit ? (
        <p className="text-[12px] text-ink-3">
          {formatUsd((priceValue / creditsValue) * 1000, 3)} per 1,000 credits
        </p>
      ) : null}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit || saving}>
          {saving ? <Spinner /> : null}
          {initial ? 'Save package' : 'Create package'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PackageCard({ pkg, onToggle, onEdit, onDelete }) {
  return (
    <article
      className={cn(
        'relative flex flex-col gap-4 rounded-2xl border bg-card p-5',
        pkg.popular && 'border-brand/60',
        !pkg.active && 'opacity-70',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-field font-mono text-[12px] font-semibold">
            {pkg.size}
          </span>
          <div>
            <h3 className="text-[14px] font-semibold">{pkg.name}</h3>
            {pkg.popular ? (
              <StatusBadge tone="brand" dot={false} className="mt-0.5 h-5">
                Most popular
              </StatusBadge>
            ) : null}
          </div>
        </div>
        <Switch
          checked={pkg.active}
          onCheckedChange={(active) => onToggle(pkg, active)}
          aria-label={`${pkg.name} package active`}
        />
      </div>
      <div>
        <p className="font-serif text-[28px] leading-none font-semibold">
          {formatUsd(pkg.priceUsd)}
        </p>
        <p className="mt-1.5 font-mono text-[12.5px] text-muted-foreground">
          {formatCredits(pkg.credits)} credits
        </p>
        <p className="font-mono text-[11.5px] text-ink-3">
          {formatUsd((pkg.priceUsd / pkg.credits) * 1000, 3)} / 1k credits
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
        <span className="text-[12px] text-ink-3">
          {pkg.active ? 'Visible to users' : 'Hidden'}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(pkg.id)}
            aria-label={`Edit ${pkg.name}`}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(pkg.id)}
            aria-label={`Delete ${pkg.name}`}
            className="text-danger hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function PackagesView() {
  const [packages, setPackages] = useState(CREDIT_PACKAGES);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const editingPackage =
    editingId && editingId !== 'new'
      ? packages.find((pkg) => pkg.id === editingId)
      : null;
  const deletingPackage = packages.find((pkg) => pkg.id === deletingId);

  function withPopular(list, popularId) {
    return list.map((pkg) =>
      pkg.id === popularId ? pkg : { ...pkg, popular: false },
    );
  }

  function handleSave(values) {
    if (editingPackage) {
      const updated = packages.map((pkg) =>
        pkg.id === editingPackage.id ? { ...pkg, ...values } : pkg,
      );
      setPackages(
        values.popular ? withPopular(updated, editingPackage.id) : updated,
      );
      toast.success(`${values.name} updated`);
    } else {
      const id = `pkg_${Date.now().toString(36)}`;
      const created = {
        id,
        size: SIZES[Math.min(packages.length, SIZES.length - 1)],
        active: true,
        ...values,
      };
      const next = [...packages, created];
      setPackages(values.popular ? withPopular(next, id) : next);
      toast.success(`${values.name} package created`);
    }
    setEditingId(null);
  }

  function handleToggle(pkg, active) {
    setPackages((current) =>
      current.map((item) => (item.id === pkg.id ? { ...item, active } : item)),
    );
    toast.success(`${pkg.name} ${active ? 'activated' : 'hidden from users'}`);
  }

  function handleDelete() {
    setPackages((current) =>
      current.filter((pkg) => pkg.id !== deletingPackage.id),
    );
    toast.success(`${deletingPackage.name} deleted`);
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Credit packages"
        count={`${packages.filter((pkg) => pkg.active).length} active`}
      >
        <Button size="sm" onClick={() => setEditingId('new')}>
          <Plus />
          New package
        </Button>
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            onToggle={handleToggle}
            onEdit={setEditingId}
            onDelete={setDeletingId}
          />
        ))}
      </div>

      <Dialog
        open={Boolean(editingId)}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent>
          <div className="flex flex-col gap-1.5 pr-6">
            <DialogTitle>
              {editingPackage ? 'Edit package' : 'New package'}
            </DialogTitle>
            <DialogDescription>
              Packages are one-time credit purchases shown on the Credits page.
            </DialogDescription>
          </div>
          {editingId ? (
            <PackageForm
              key={editingId}
              initial={editingPackage}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deletingPackage)}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title={`Delete ${deletingPackage?.name ?? 'package'}?`}
        description="Users can no longer buy it. Past purchases and invoices are not affected."
        confirmLabel="Delete package"
        onConfirm={handleDelete}
      />
    </div>
  );
}
