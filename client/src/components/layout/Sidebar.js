'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import { BrandMark, BrandName } from '@/components/layout/BrandMark';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useLogout } from '@/features/auth/useLogout';
import { ADMIN_NAV, STUDIO_NAV, isNavItemActive } from '@/constants/navigation';
import { cn } from '@/lib/utils';

const ITEM_CLASSES =
  'flex h-9 w-full items-center gap-3 rounded-lg border px-3 text-[13px] transition-colors';

const IDLE_CLASSES =
  'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground';

export function NavLink({ item, active, onNavigate }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={cn(
        ITEM_CLASSES,
        active ? 'border-brand/35 bg-brand-tint text-brand' : IDLE_CLASSES,
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({ admin = false }) {
  const pathname = usePathname();
  const user = useSelector(selectCurrentUser);
  const logout = useLogout();
  const items = admin ? ADMIN_NAV : STUDIO_NAV;

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <Link
        href={admin ? '/admin' : '/app'}
        className="flex h-16 shrink-0 items-center gap-2.5 border-b px-4"
      >
        <BrandMark admin={admin} />
        <BrandName admin={admin} />
      </Link>

      <nav
        aria-label={admin ? 'Admin' : 'Studio'}
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isNavItemActive(item, pathname)}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t p-3">
        {admin ? (
          <Link href="/app" className={cn(ITEM_CLASSES, IDLE_CLASSES)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to studio
          </Link>
        ) : (
          <>
            {user.role === 'admin' ? (
              <Link href="/admin" className={cn(ITEM_CLASSES, IDLE_CLASSES)}>
                <ShieldCheck className="size-4" aria-hidden="true" />
                Switch to Admin
              </Link>
            ) : null}
            <button
              type="button"
              onClick={logout}
              className={cn(ITEM_CLASSES, IDLE_CLASSES, 'text-left')}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
