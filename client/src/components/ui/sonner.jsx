'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner } from 'sonner';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';

const TOAST_DURATION_MS = 6000;
const VISIBLE_TOASTS = 3;

function Toaster({ ...props }) {
  const theme = useResolvedTheme();

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      offset={20}
      duration={TOAST_DURATION_MS}
      visibleToasts={VISIBLE_TOASTS}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--border-radius': 'var(--radius)',
      }}
      {...props}
    />
  );
}

export { Toaster };
