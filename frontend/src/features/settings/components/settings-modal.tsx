import { useCallback, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile } from './user-profile';
import { ProviderSettingsSection } from '@/features/settings/components/provider-settings';
import { GeneralSettingsSection } from '@/features/settings/components/general-settings';
import { PrivacySettingsSection } from '@/features/settings/components/privacy-settings';
import { ExportSettingsSection } from '@/features/settings/components/export-settings';
import { User, Settings2, Server, Shield, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsFormsProvider, useSettingsForms } from './form-context';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SaveActiveButton({ activeTab }: { activeTab: string }) {
  const { submitForm } = useSettingsForms();
  
  const handleSubmit = useCallback(() => {
    submitForm(activeTab);
  }, [submitForm, activeTab]);
  
  return (
    <Button type="button" onClick={handleSubmit}>
      Save Changes
    </Button>
  );
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 rounded-xl min-w-[60%] max-w-4xl h-[600px]">
        <SettingsFormsProvider>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full">
            {/* Sidebar */}
            <div className="w-[200px]">
              <TabsList className="flex flex-col justify-start space-y-1 bg-transparent mt-4 p-2 w-full h-full">
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

            {/* Main Content Area */}
            <div className="flex flex-col flex-1">
              {/* Fixed Header */}
              <div className="bg-background p-6 w-fit">
                <TabsContent value="profile" className="m-0">
                  <h2 className="font-medium text-lg">Profile Settings</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage your profile information and preferences
                  </p>
                </TabsContent>
                <TabsContent value="general" className="m-0">
                  <h2 className="font-medium text-lg">General Settings</h2>
                  <p className="text-muted-foreground text-sm">
                    Customize your application preferences
                  </p>
                </TabsContent>
                <TabsContent value="providers" className="m-0">
                  <h2 className="font-medium text-lg">Provider Settings</h2>
                  <p className="text-muted-foreground text-sm">
                    Configure your AI provider connections
                  </p>
                </TabsContent>
                <TabsContent value="privacy" className="m-0">
                  <h2 className="font-medium text-lg">Privacy Settings</h2>
                  <p className="text-muted-foreground text-sm">
                    Manage your privacy and security preferences
                  </p>
                </TabsContent>
                <TabsContent value="export" className="m-0">
                  <h2 className="font-medium text-lg">Export Data</h2>
                  <p className="text-muted-foreground text-sm">Export your data and settings</p>
                </TabsContent>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
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
              </div>

              {/* Fixed Footer */}
              <div className="flex justify-end gap-2 bg-background p-4 rounded-full">
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <SaveActiveButton activeTab={activeTab} />
              </div>
            </div>
          </Tabs>
        </SettingsFormsProvider>
      </DialogContent>
    </Dialog>
  );
}
