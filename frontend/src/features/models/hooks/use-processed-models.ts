import { useMemo, useState } from 'react';
import { useModels } from '../api/get-models';
import { StandardModel } from '../types/models';

export type SortKey =
  | 'provider'
  | 'name_asc'
  | 'name_desc'
  | 'context_asc'
  | 'context_desc'
  | 'price_asc'
  | 'price_desc';

export function useProcessedModels() {
  const { data: modelsData, isLoading } = useModels();
  const [sortKey, setSortKey] = useState<SortKey>('provider');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const formattedModels = useMemo(() => {
    if (!modelsData) return [];
    return Object.values(modelsData).flat();
  }, [modelsData]);

  const allProviders = useMemo(() => {
    const providers = new Set(formattedModels.map(m => m.provider));
    return Array.from(providers).sort();
  }, [formattedModels]);

  const processedModels = useMemo(() => {
    let models = formattedModels;

    if (selectedProviders.length > 0) {
      models = models.filter(model => selectedProviders.includes(model.provider));
    }

    if (search) {
      models = models.filter(
        model =>
          model.name.toLowerCase().includes(search.toLowerCase()) ||
          model.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    switch (sortKey) {
      case 'context_desc':
        models.sort((a, b) => (b.context_length || 0) - (a.context_length || 0));
        break;
      case 'context_asc':
        models.sort((a, b) => (a.context_length || 0) - (b.context_length || 0));
        break;
      case 'price_asc':
        models.sort((a, b) => (a.pricing?.prompt || 0) - (b.pricing?.prompt || 0));
        break;
      case 'price_desc':
        models.sort((a, b) => (b.pricing?.prompt || 0) - (a.pricing?.prompt || 0));
        break;
      case 'name_asc':
        models.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        models.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return models;
  }, [formattedModels, search, sortKey, selectedProviders]);

  const groupedModels = useMemo(() => {
    const groups = processedModels.reduce(
      (acc, model) => {
        const key = sortKey === 'provider' ? model.provider : 'All Models';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(model);
        return acc;
      },
      {} as Record<string, StandardModel[]>,
    );

    if (sortKey === 'provider') {
      for (const provider in groups) {
        groups[provider].sort((a, b) => a.name.localeCompare(b.name));
      }
      return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, StandardModel[]>);
    }

    return groups;
  }, [processedModels, sortKey]);

  return {
    isLoading,
    allProviders,
    groupedModels,
    sortKey,
    setSortKey,
    selectedProviders,
    setSelectedProviders,
    search,
    setSearch,
    formattedModels,
  };
} 