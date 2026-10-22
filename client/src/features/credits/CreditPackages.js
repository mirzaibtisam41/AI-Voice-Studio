'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { Panel } from '@/components/ui/Panel';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CREDIT_PACKAGES,
  formatPrice,
  pricePerThousand,
} from '@/features/credits/packageCatalog';
import { creditsAdded } from '@/features/credits/walletSlice';
import { cn } from '@/lib/utils';

const PURCHASE_DELAY_MS = 1000;

function PackageCard({ creditPackage, onPurchase }) {
  return (
    <div
      className={cn(
        'relative flex min-w-0 flex-col gap-4 rounded-2xl border bg-field/40 p-4',
        creditPackage.popular && 'border-brand/70 bg-brand-tint/40',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold">{creditPackage.name}</p>
        {creditPackage.popular ? (
          <Badge tone="brand">Most popular</Badge>
        ) : null}
      </div>
      <div>
        <p className="font-serif text-[26px] leading-none font-semibold tracking-tight">
          {creditPackage.credits.toLocaleString()}
        </p>
        <p className="mt-1 text-[12px] text-ink-3">credits</p>
      </div>
      <div className="mt-auto flex items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[18px] font-semibold">
            {formatPrice(creditPackage.price)}
          </p>
          <p className="font-mono text-[11px] text-ink-3">
            {pricePerThousand(creditPackage)} / 1k
          </p>
        </div>
        <Button
          size="sm"
          variant={creditPackage.popular ? 'default' : 'outline'}
          onClick={() => onPurchase(creditPackage)}
          aria-label={`Purchase ${creditPackage.name}`}
        >
          Purchase
        </Button>
      </div>
    </div>
  );
}

export function CreditPackages({ onPurchased }) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleOpenChange = (open) => {
    if (!open && !isPurchasing) setSelected(null);
  };

  const handleConfirm = () => {
    const creditPackage = selected;

    setIsPurchasing(true);
    timerRef.current = window.setTimeout(() => {
      dispatch(creditsAdded(creditPackage.credits));
      onPurchased(creditPackage);
      toast.success(
        `${creditPackage.credits.toLocaleString()} credits added to your balance`,
      );
      setIsPurchasing(false);
      setSelected(null);
    }, PURCHASE_DELAY_MS);
  };

  return (
    <Panel
      title="Credit packages"
      description="One-time top-ups. Credits never expire."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CREDIT_PACKAGES.map((creditPackage) => (
          <PackageCard
            key={creditPackage.id}
            creditPackage={creditPackage}
            onPurchase={setSelected}
          />
        ))}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={handleOpenChange}>
        <DialogContent>
          <div className="flex flex-col gap-1">
            <DialogTitle>Confirm purchase</DialogTitle>
            <DialogDescription>
              Credits are added to your balance right away.
            </DialogDescription>
          </div>
          {selected ? (
            <dl className="flex flex-col gap-2 rounded-xl border bg-field/60 p-3.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Package</dt>
                <dd className="font-medium">{selected.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Credits</dt>
                <dd className="font-mono">
                  {selected.credits.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t pt-2">
                <dt className="font-medium">Total</dt>
                <dd className="font-mono font-semibold">
                  {formatPrice(selected.price)}
                </dd>
              </div>
            </dl>
          ) : null}
          <p className="flex items-center gap-2 text-[12.5px] text-ink-3">
            <Info className="size-4 shrink-0" aria-hidden="true" />
            Payments are in demo mode. No card will be charged.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isPurchasing}>
              {isPurchasing ? <Spinner /> : null}
              {isPurchasing
                ? 'Processing...'
                : `Pay ${selected ? formatPrice(selected.price) : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
