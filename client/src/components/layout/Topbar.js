'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { BrandMark } from '@/components/layout/BrandMark';
import { CreditPill } from '@/components/layout/CreditPill';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import {
  ADMIN_NAV,
  STUDIO_NAV,
  findActiveNavItem,
} from '@/constants/navigation';

const TITLES = {
  '/app/text-to-speech': 'Text to Speech Studio',
  '/app/speech-to-text': 'Speech to Text Studio',
  '/admin/users': 'User Management',
  '/admin/models': 'AI Model Management',
};

export function Topbar({ admin = false }) {
  const pathname = usePathname();
  const active = findActiveNavItem(admin ? ADMIN_NAV : STUDIO_NAV, pathname);
  const title = active ? (TITLES[active.href] ?? active.label) : '';

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
      <Link
        href={admin ? '/admin' : '/app'}
        className="lg:hidden"
        aria-label="Home"
      >
        <BrandMark admin={admin} />
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold">
        {title}
      </h1>
      <div className="flex items-center gap-1.5">
        <CreditPill admin={admin} />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon-sm"
          asChild
          className="hidden sm:inline-flex"
        >
          <Link
            href={admin ? '/admin/settings' : '/app/settings'}
            aria-label="Settings"
            title="Settings"
          >
            <Settings />
          </Link>
        </Button>
        <span className="ml-1 flex">
          <UserMenu />
        </span>
      </div>
    </header>
  );
}
