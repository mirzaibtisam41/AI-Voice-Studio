'use client';

import Link from 'next/link';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { BrandMark, BrandName } from '@/components/layout/BrandMark';
import { GuestGuard } from '@/components/layout/GuestGuard';
import { cn } from '@/lib/utils';

function BrandLink({ className }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2.5 self-start rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
    >
      <BrandMark />
      <BrandName />
    </Link>
  );
}

function ShowcasePanel() {
  return (
    <aside className="relative hidden flex-col overflow-hidden border-r bg-linear-to-br from-sidebar via-card to-background p-10 lg:flex xl:p-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-56 size-155 rounded-full bg-[radial-gradient(circle,var(--brand-glow),transparent_65%)]"
      />
      <BrandLink className="relative" />
      <div className="relative my-auto flex max-w-md flex-col gap-5">
        <h2 className="font-serif text-[44px] leading-[1.08] font-medium tracking-tight text-balance">
          Every voice your product will ever need.
        </h2>
        <p className="text-[15px] text-muted-foreground">
          Text to speech, cloning, transcription and real-time agents — one
          console, one credit balance.
        </p>
        <AudioPlayer
          id="auth-sample"
          label="sample voice"
          duration={4}
          className="mt-4 bg-card/70 backdrop-blur"
        />
      </div>
      <p className="relative text-[12.5px] text-ink-3">
        Trusted by content, product and support teams worldwide.
      </p>
    </aside>
  );
}

export function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <GuestGuard>
      <div className="grid min-h-dvh lg:grid-cols-2">
        <ShowcasePanel />
        <main className="flex flex-col px-4 py-8 sm:px-6">
          <BrandLink className="lg:hidden" />
          <div className="mx-auto flex w-full max-w-95 flex-1 flex-col justify-center py-10">
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="font-serif text-3xl font-medium tracking-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-[14px] text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {children}
            {footer ? (
              <p className="mt-8 text-center text-[13.5px] text-muted-foreground">
                {footer}
              </p>
            ) : null}
          </div>
        </main>
      </div>
    </GuestGuard>
  );
}

export function AuthFooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="font-medium text-brand underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}
