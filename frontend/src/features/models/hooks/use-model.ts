import { useState, useEffect } from 'react';
import { settingsService } from '@/services/storage/client.ts';

export function useModel() {
    const [model, setModel] = useState<string>("");
    const [is_loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModel = async () => {
            const settings = await settingsService.fetchSettings();
            const default_model = settings?.default_model;
            setModel(default_model ?? "");
            setLoading(false);
        };
        fetchModel();
    }, []);

    return { model, is_loading, setModel };
}
