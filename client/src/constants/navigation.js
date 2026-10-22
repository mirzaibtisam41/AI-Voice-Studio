import {
  AudioLines,
  AudioWaveform,
  Bot,
  Boxes,
  CircleDollarSign,
  FileText,
  Gauge,
  LayoutGrid,
  Library,
  ListChecks,
  Mic,
  Radio,
  ScrollText,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
} from 'lucide-react';

export const STUDIO_NAV = [
  { label: 'Overview', href: '/app', icon: LayoutGrid, exact: true },
  { label: 'Text to Speech', href: '/app/text-to-speech', icon: Mic },
  { label: 'Speech to Text', href: '/app/speech-to-text', icon: FileText },
  { label: 'Real-Time Playground', href: '/app/playground', icon: Radio },
  { label: 'AI Voice Agents', href: '/app/agents', icon: Bot },
  { label: 'Audio Library', href: '/app/library', icon: Library },
  { label: 'Credits', href: '/app/credits', icon: Wallet },
  {
    label: 'Profile & Settings',
    href: '/app/settings',
    icon: Settings,
  },
];

export const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutGrid, exact: true },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'AI Providers', href: '/admin/providers', icon: Server },
  { label: 'AI Models', href: '/admin/models', icon: Boxes },
  {
    label: 'Model Capabilities',
    href: '/admin/capabilities',
    icon: ListChecks,
  },
  { label: 'Voice Catalog', href: '/admin/voices', icon: AudioLines },
  { label: 'Credit Pricing', href: '/admin/pricing', icon: CircleDollarSign },
  {
    label: 'Wallet Adjustments',
    href: '/admin/wallet-adjustments',
    icon: Gauge,
  },
  {
    label: 'Generation Monitoring',
    href: '/admin/generations',
    icon: AudioWaveform,
  },
  {
    label: 'Platform Settings',
    href: '/admin/settings',
    icon: SlidersHorizontal,
  },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
];

export const MOBILE_STUDIO_TABS = [
  { label: 'Home', href: '/app', icon: LayoutGrid, exact: true },
  { label: 'Speak', href: '/app/text-to-speech', icon: Mic },
  { label: 'Transcribe', href: '/app/speech-to-text', icon: FileText },
  { label: 'Library', href: '/app/library', icon: Library },
];

export const MOBILE_ADMIN_TABS = [
  { label: 'Overview', href: '/admin', icon: LayoutGrid, exact: true },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Models', href: '/admin/models', icon: Boxes },
  { label: 'Jobs', href: '/admin/generations', icon: AudioWaveform },
];

export function isNavItemActive(item, pathname) {
  if (item.exact) return pathname === item.href;

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function findActiveNavItem(items, pathname) {
  return items.find((item) => isNavItemActive(item, pathname)) ?? null;
}
