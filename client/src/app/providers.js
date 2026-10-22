'use client';

import { SessionBoot } from '@/features/auth/SessionBoot';
import { StoreProvider } from '@/store/StoreProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }) {
  return (
    <StoreProvider>
      <SessionBoot />
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </StoreProvider>
  );
}
