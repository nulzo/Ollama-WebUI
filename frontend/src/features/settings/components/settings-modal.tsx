import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile } from './user-profile';
import { ProviderSettingsSection } from '@/features/settings/components/provider-settings';
import { GeneralSettingsSection } from '@/features/settings/components/general-settings';
import { PrivacySettingsSection } from '@/features/settings/components/privacy-settings';
import { ExportSettingsSection } from '@/features/settings/components/export-settings';
import { User, Settings2, Server, Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-[80vw] h-[600px]">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 min-h-0 items-start h-full"
        >
          {/* Sidebar */}
          <div className="justify-start items-start w-[180px]">
            <TabsList className="flex flex-col space-y-1 bg-transparent h-full justify-start p-2 mt-6">
              <TabsTrigger value="profile" className="justify-start gap-2 px-4 py-2 w-full">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="general" className="justify-start gap-2 px-4 py-2 w-full">
                <Settings2 className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="providers" className="justify-start gap-2 px-4 py-2 w-full">
                <Server className="w-4 h-4" />
                Providers
              </TabsTrigger>
              <TabsTrigger value="privacy" className="justify-start gap-2 px-4 py-2 w-full">
                <Shield className="w-4 h-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="export" className="justify-start gap-2 px-4 py-2 w-full">
                <Download className="w-4 h-4" />
                Export
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="flex flex-col flex-1 h-full min-h-0">
            <div className="flex-1 p-6 overflow-y-auto">
              <TabsContent value="profile" className="mt-0 h-full">
                <UserProfile />
              </TabsContent>
              <TabsContent value="general" className="mt-0 h-full">
                <GeneralSettingsSection />
              </TabsContent>
              <TabsContent value="providers" className="mt-0 h-full">
                <ProviderSettingsSection />
              </TabsContent>
              <TabsContent value="privacy" className="mt-0 h-full">
                <PrivacySettingsSection />
              </TabsContent>
              <TabsContent value="export" className="mt-0 h-full">
                <ExportSettingsSection />
              </TabsContent>
            </div>
            <div className="flex justify-end gap-2 bg-background p-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
