'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Menu, ShieldCheck } from 'lucide-react';
import { NavLink } from '@/components/layout/Sidebar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ADMIN_NAV,
  MOBILE_ADMIN_TABS,
  MOBILE_STUDIO_TABS,
  STUDIO_NAV,
  isNavItemActive,
} from '@/constants/navigation';
import { cn } from '@/lib/utils';

const TAB_CLASSES = 'flex flex-1 flex-col items-center gap-1 py-2 text-[11px]';

export function MobileNav({ admin = false }) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const items = admin ? ADMIN_NAV : STUDIO_NAV;
  const tabs = admin ? MOBILE_ADMIN_TABS : MOBILE_STUDIO_TABS;
  const isMoreActive = !tabs.some((tab) => isNavItemActive(tab, pathname));
  const switchItem = admin
    ? { label: 'Back to studio', href: '/app', icon: ArrowLeft, exact: true }
    : { label: 'Switch to Admin', href: '/admin', icon: ShieldCheck };

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isNavItemActive(tab, pathname);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                TAB_CLASSES,
                active ? 'text-brand' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen(true)}
          className={cn(
            TAB_CLASSES,
            isMoreActive ? 'text-brand' : 'text-muted-foreground',
          )}
        >
          <Menu className="size-5" aria-hidden="true" />
          More
        </button>
      </nav>

      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-0 rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
          <SheetHeader className="pb-2">
            <SheetTitle>
              {admin ? 'Admin Console' : 'AI Voice Studio'}
            </SheetTitle>
            <SheetDescription className="sr-only">All pages</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-1 overflow-y-auto px-3 pb-4">
            {items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isNavItemActive(item, pathname)}
                onNavigate={() => setIsMoreOpen(false)}
              />
            ))}
            <div className="my-2 border-t" />
            <NavLink
              item={switchItem}
              active={false}
              onNavigate={() => setIsMoreOpen(false)}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
