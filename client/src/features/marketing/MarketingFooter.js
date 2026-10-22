import Link from 'next/link';
import { BrandMark, BrandName } from '@/components/layout/BrandMark';
import { FOOTER_COLUMNS } from '@/features/marketing/landingContent';

const BOTTOM_LINKS = ['Terms', 'Privacy', 'Cookies'];

export function MarketingFooter() {
  return (
    <footer className="border-t px-4 pt-14 pb-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="flex max-w-xs flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 self-start">
              <BrandMark />
              <BrandName />
            </Link>
            <p className="text-[13.5px] text-muted-foreground">
              Every voice your product needs — speech, transcription, real-time
              conversations and voice agents in one studio.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-[13px] font-semibold">{column.title}</h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t pt-6 text-[12.5px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AI Voice Studio. All rights reserved.</p>
          <ul className="flex gap-5">
            {BOTTOM_LINKS.map((label) => (
              <li key={label}>
                <a href="#" className="transition-colors hover:text-foreground">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
