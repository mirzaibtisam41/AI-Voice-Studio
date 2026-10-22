'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DangerZone } from '@/features/settings/DangerZone';
import { NotificationSettings } from '@/features/settings/NotificationSettings';
import { PreferenceSettings } from '@/features/settings/PreferenceSettings';
import { ProfileSettings } from '@/features/settings/ProfileSettings';
import { SecuritySettings } from '@/features/settings/SecuritySettings';

const SETTINGS_TABS = [
  { value: 'profile', label: 'Profile', content: ProfileSettings },
  { value: 'security', label: 'Security', content: SecuritySettings },
  { value: 'preferences', label: 'Preferences', content: PreferenceSettings },
  {
    value: 'notifications',
    label: 'Notifications',
    content: NotificationSettings,
  },
  { value: 'danger', label: 'Danger zone', content: DangerZone },
];

export function SettingsView() {
  return (
    <Tabs defaultValue="profile" className="mx-auto w-full max-w-[640px]">
      <TabsList aria-label="Settings sections">
        {SETTINGS_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {SETTINGS_TABS.map((tab) => {
        const Content = tab.content;

        return (
          <TabsContent key={tab.value} value={tab.value}>
            <Content />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
