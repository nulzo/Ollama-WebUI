export interface ProviderSettings {
    provider_type: string;
    api_key?: string;
    endpoint?: string;
    organization_id?: string;
    is_enabled: boolean;
    default_model?: string;
}

export interface UserSettings {
    theme: string;
    default_provider: string;
    providers: ProviderSettings[];
}