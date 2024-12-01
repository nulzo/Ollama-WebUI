import { ProviderSettings } from '@/features/settings/components/provider-settings';

export const SettingsRoute = () => {
    return (
        <div className="mx-auto py-8 container">
            <h1 className="mb-6 font-bold text-2xl">Provider Settings</h1>
            <ProviderSettings />
        </div>
    );
};