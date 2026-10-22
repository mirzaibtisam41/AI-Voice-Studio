'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { applyTheme } from '@/lib/theme';

export function ThemeToggle() {
  const theme = useResolvedTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => applyTheme(nextTheme)}
    >
      <Icon />
    </Button>
  );
}
