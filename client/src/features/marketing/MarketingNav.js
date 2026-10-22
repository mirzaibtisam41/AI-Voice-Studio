'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import { BrandMark, BrandName } from '@/components/layout/BrandMark';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AUTH_STATUS, selectAuthStatus } from '@/features/auth/authSlice';
import { NAV_LINKS } from '@/features/marketing/landingContent';

function NavActions({ isLoggedIn, onNavigate, stacked = false }) {
  if (isLoggedIn) {
    return (
      <Button asChild className={stacked ? 'w-full' : undefined}>
        <Link href="/app" onClick={onNavigate}>
          Open studio
          <ArrowRight />
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        asChild
        variant="ghost"
        className={stacked ? 'w-full' : undefined}
      >
        <Link href="/login" onClick={onNavigate}>
          Log in
        </Link>
      </Button>
      <Button asChild className={stacked ? 'w-full' : undefined}>
        <Link href="/register" onClick={onNavigate}>
          Get started
        </Link>
      </Button>
    </>
  );
}

export function MarketingNav() {
  const status = useSelector(selectAuthStatus);
  const isLoggedIn = status === AUTH_STATUS.LOGGED_IN;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <BrandMark />
          <BrandName />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-[13.5px] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NavActions isLoggedIn={isLoggedIn} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="gap-0">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2.5">
              <BrandMark />
              <BrandName />
            </SheetTitle>
            <SheetDescription className="sr-only">
              Site navigation
            </SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-[15px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 border-t p-4">
            <NavActions
              isLoggedIn={isLoggedIn}
              onNavigate={closeMenu}
              stacked
            />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
