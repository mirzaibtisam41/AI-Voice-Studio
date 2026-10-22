'use client';

import Link from 'next/link';

import { Zap } from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';

export function CreditPill({ admin = false }) {
  const { balance } = useBalance();
  const value = admin ? 0 : balance;

  return (
    <Link
      href={admin ? '/admin/wallet-adjustments' : '/app/credits'}
      title={`${value.toLocaleString()} credits`}
      className="inline-flex h-7 items-center gap-1 rounded-full bg-brand-tint px-2.5 font-mono text-[12px] font-semibold text-brand transition-colors hover:bg-brand/20"
    >
      <Zap className="size-3" aria-hidden="true" />
      {value.toLocaleString()}
      <span className="sr-only">credits</span>
    </Link>
  );
}
