import { useState } from 'react';
import { Settings2, Server, Shield, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProviderSettings } from '@/features/settings/api/get-settings';
import { ProviderSettings } from '@/features/settings/components/provider-settings';
import { GeneralSettings } from '@/features/settings/components/general-settings';
import { PrivacySettings } from '@/features/settings/components/privacy-settings';
import { AdminSettings } from '@/features/settings/components/admin-settings';

interface UserSettingsModalProps {
  open: boolean;
  onOpenChange: () => void;
}

type SettingType = 'general' | 'providers' | 'privacy' | 'admin';
type ProviderType = 'ollama' | 'openai' | 'azure' | 'anthropic';

export const UserSettingsModal = ({ open, onOpenChange }: UserSettingsModalProps) => {
  const [selectedSetting, setSelectedSetting] = useState<SettingType>('general');
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [isProvidersExpanded, setIsProvidersExpanded] = useState(false);
  const { data: providerSettings } = useProviderSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[825px]">
        <div className="flex h-[600px]">
          {/* Settings Sidebar */}
          <div className="bg-secondary border-r border-border w-[200px] shrink-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-1 p-2">
              <Button
                variant={selectedSetting === 'general' ? 'secondary' : 'ghost'}
                className="justify-start gap-2"
                onClick={() => {
                  setSelectedSetting('general');
                  setSelectedProvider(null);
                }}
              >
                <Settings2 className="size-4" />
                General
              </Button>
              <Button
                variant={selectedSetting === 'providers' ? 'secondary' : 'ghost'}
                className="justify-start gap-2"
                onClick={() => {
                  setSelectedSetting('providers');
                  setIsProvidersExpanded(!isProvidersExpanded);
                }}
              >
                <Server className="size-4" />
                Providers
              </Button>
              <Button
                variant={selectedSetting === 'privacy' ? 'secondary' : 'ghost'}
                className="justify-start gap-2"
                onClick={() => {
                  setSelectedSetting('privacy');
                  setSelectedProvider(null);
                }}
              >
                <Shield className="size-4" />
                Privacy
              </Button>
              <Button
                variant={selectedSetting === 'admin' ? 'secondary' : 'ghost'}
                className="justify-start gap-2"
                onClick={() => {
                  setSelectedSetting('admin');
                  setSelectedProvider(null);
                }}
              >
                <Settings className="size-4" />
                Admin
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-col w-full h-full">
            <div className="flex-1 p-8 overflow-y-auto">
              {selectedSetting === 'general' && <GeneralSettings />}
              {selectedSetting === 'providers' && (
                <ProviderSettings
                  selectedProvider={selectedProvider}
                  providerSettings={providerSettings}
                />
              )}
              {selectedSetting === 'privacy' && <PrivacySettings />}
              {selectedSetting === 'admin' && <AdminSettings />}
            </div>

            {/* Footer Actions */}
            <div className="bg-background p-4 border-t border-border">
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={onOpenChange}>
                  Cancel
                </Button>
                <Button onClick={onOpenChange}>Update Settings</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
