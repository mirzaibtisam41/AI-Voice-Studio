import { MobileNav } from '@/components/layout/MobileNav';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export function AppShell({ admin = false, children }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar admin={admin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar admin={admin} />
        <main className="w-full flex-1 px-4 pt-5 pb-24 md:px-6 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileNav admin={admin} />
    </div>
  );
}
