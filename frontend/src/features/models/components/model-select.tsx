import {
  Check,
  ChevronsUpDown,
  Eye,
  Zap,
  Wrench,
  Link,
  ArrowDownUp,
  Filter,
  Search,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUp01,
  ArrowDown10,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useModels } from '@/features/models/api/get-models';
import React, { useMemo, useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StandardModel } from '../types/models';
import { useTheme } from '@/components/theme/theme-provider';
import { useProcessedModels, SortKey } from '../hooks/use-processed-models';

interface ModelSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

// New ProviderIcon component to load logos from LobeHub CDN
export const ProviderIcon = ({ provider, className }: { provider: string; className?: string }) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  const slugMap: Record<string, string> = {
    anthropic: 'anthropic',
    google: 'google',
    mistral: 'mistral',
    meta: 'meta',
    openai: 'openai',
    cohere: 'cohere',
    ollama: 'ollama',
    perplexity: 'perplexity',
    nvidia: 'nvidia',
    microsoft: 'microsoft',
    '01-ai': '01ai',
    deepseek: 'deepseek',
    qwen: 'qwen',
    nous: 'nous',
    openrouter: 'openrouter',
    'meta-llama': 'meta',
    'google-gemini': 'google',
  };

  const slug = slugMap[provider.toLowerCase()] || provider.toLowerCase().replace(/ /g, '-');

  // Icons in `/dark/` are light-colored (for dark backgrounds)
  // Icons in `/light/` are dark-colored (for light backgrounds)
  const iconUrl =
    theme === 'dark'
      ? `https://unpkg.com/@lobehub/icons-static-png@latest/dark/${slug}.png`
      : `https://unpkg.com/@lobehub/icons-static-png@latest/light/${slug}.png`;

  useEffect(() => {
    setImageError(false);
  }, [iconUrl]);

  if (imageError) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-md bg-muted/50',
          className
        )}
      >
        <span className="text-sm font-semibold text-muted-foreground">
          {provider.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      key={iconUrl}
      src={iconUrl}
      alt={`${provider} logo`}
      className={cn('h-full w-full object-contain', className)}
      onError={() => setImageError(true)}
    />
  );
};

// Format pricing for display, now returns an object
const formatPrice = (price: number): { amount: string; unit: string } | null => {
  if (price === 0) return { amount: 'Free', unit: '' };

  const pricePerMillion = price * 1_000_000;
  if (pricePerMillion > 0 && pricePerMillion < 10000) {
    return { amount: `$${pricePerMillion.toFixed(2)}`, unit: '/1M' };
  }

  const pricePerThousand = price * 1_000;
  if (pricePerThousand > 0 && pricePerThousand < 10000) {
    return { amount: `$${pricePerThousand.toFixed(2)}`, unit: '/1K' };
  }

  if (price) {
    return { amount: `$${price.toFixed(4)}`, unit: '/token' };
  }

  return null;
};

// Format context length for display
const formatContextLength = (length: number): string => {
  if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
  if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
  return length.toString();
};

const sortOptions: Record<
  SortKey,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  provider: { label: 'Provider', icon: ArrowDownUp },
  name_asc: { label: 'Name (A-Z)', icon: ArrowDownAZ },
  name_desc: { label: 'Name (Z-A)', icon: ArrowUpAZ },
  context_desc: { label: 'Context (High-Low)', icon: ArrowDownWideNarrow },
  context_asc: { label: 'Context (Low-High)', icon: ArrowUpNarrowWide },
  price_asc: { label: 'Price (Low-High)', icon: ArrowUp01 },
  price_desc: { label: 'Price (High-Low)', icon: ArrowDown10 },
};

interface ModelSelectHeaderProps {
  search: string;
  setSearch: (search: string) => void;
  sortKey: SortKey;
  setSortKey: (sortKey: SortKey) => void;
  allProviders: string[];
  selectedProviders: string[];
  setSelectedProviders: (providers: string[]) => void;
}

function ModelSelectHeader({
  search,
  setSearch,
  sortKey,
  setSortKey,
  allProviders,
  selectedProviders,
  setSelectedProviders,
}: ModelSelectHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 border-b">
      <div className="relative flex-1">
        <CommandInput
          placeholder="Search models..."
          value={search}
          onValueChange={setSearch}
          className="h-9 w-full"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            {React.createElement(sortOptions[sortKey].icon, { className: 'h-4 w-4' })}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(sortOptions).map(([key, { label, icon: Icon }]) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={sortKey === key}
              onSelect={() => setSortKey(key as SortKey)}
              className="flex items-center gap-2"
            >
              <Icon className="size-3 text-muted-foreground" />
              <span>{label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative shrink-0">
            <Filter className="h-4 w-4" />
            {selectedProviders.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 justify-center rounded-full text-xs"
              >
                {selectedProviders.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Filter by Provider</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[250px]">
            {allProviders.map(provider => (
              <DropdownMenuCheckboxItem
                key={provider}
                checked={selectedProviders.includes(provider)}
                onSelect={e => {
                  e.preventDefault();
                  const newSelectedProviders = selectedProviders.includes(provider)
                    ? selectedProviders.filter(p => p !== provider)
                    : [...selectedProviders, provider];
                  setSelectedProviders(newSelectedProviders);
                }}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface ModelSelectListProps {
  groupedModels: Record<string, StandardModel[]>;
  value?: string;
  onValueChange: (value: string) => void;
  setOpen: (open: boolean) => void;
  setSearch: (search: string) => void;
}

function ModelSelectList({
  groupedModels,
  value,
  onValueChange,
  setOpen,
  setSearch,
}: ModelSelectListProps) {
  const capitalize = (s: string) => s?.charAt(0)?.toUpperCase() + s?.slice(1);

  return (
    <CommandList>
      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
        No models found.
      </CommandEmpty>
      <TooltipProvider delayDuration={100}>
        <div className="p-2">
          {Object.keys(groupedModels).map(provider => (
            <div key={provider} className="mb-2">
              <div className="flex gap-2 px-2 py-2 align-bottom items-baseline">
                <span className="font-semibold text-sm">{capitalize(provider)}</span>
                <span className="text-[10px] items-baseline align-bottom text-muted-foreground">
                  {groupedModels[provider].length} model
                  {groupedModels[provider].length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-1">
                {groupedModels[provider].map((model: StandardModel) => (
                  <CommandItem
                    key={model.id}
                    value={model.id}
                    className="p-0"
                    onSelect={() => {
                      onValueChange(model.id);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'relative flex items-center w-full p-2 rounded-lg cursor-pointer hover:bg-accent/50',
                            value === model.id && 'bg-accent text-accent-foreground'
                          )}
                        >
                          <div className="flex items-center w-full gap-2">
                            <div className="flex items-center justify-center size-6 bg-foreground p-1 rounded ml-2">
                              <ProviderIcon className="invert" provider={model.provider} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate" title={model.name}>
                                {model.name}
                              </p>
                            </div>

                            <div className="flex items-center shrink-0 gap-1 ml-auto">
                              {model.vision_enabled && (
                                <div
                                  className={cn(
                                    'p-1 rounded items-center flex justify-center',
                                    value === model.id
                                      ? 'bg-accent-foreground/10'
                                      : 'bg-accent'
                                  )}
                                >
                                  <Eye className="h-2 w-2 text-muted-foreground" />
                                </div>
                              )}

                              {model.tools_enabled && (
                                <div
                                  className={cn(
                                    'p-1 rounded items-center flex justify-center',
                                    value === model.id
                                      ? 'bg-accent-foreground/10'
                                      : 'bg-accent'
                                  )}
                                >
                                  <Wrench className="text-muted-foreground" />
                                </div>
                              )}

                              <div
                                className={cn(
                                  'text-xs font-semibold rounded px-1.5 py-0.5 items-center flex justify-center',
                                  value === model.id ? 'bg-accent-foreground/10' : 'bg-accent'
                                )}
                              >
                                {formatContextLength(
                                  model.context_length || model.max_input_tokens
                                )}
                              </div>

                              {model.pricing &&
                                (() => {
                                  const priceInfo = formatPrice(model.pricing.prompt);
                                  if (!priceInfo || !priceInfo.amount) return null;

                                  return (
                                    <div
                                      className={cn(
                                        'text-xs font-semibold rounded px-1.5 py-0.5 items-center flex justify-center',
                                        value === model.id
                                          ? 'bg-accent-foreground/10'
                                          : 'bg-accent'
                                      )}
                                    >
                                      {priceInfo.amount}
                                      <span className="text-muted-foreground/80 ml-0.5">
                                        {priceInfo.unit}
                                      </span>
                                    </div>
                                  );
                                })()}
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      {model.description && (
                        <TooltipContent side="right" align="start" className="max-w-xs z-50">
                          <div className="p-2">
                            <p className="font-semibold text-sm mb-1">{model.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {model.description}
                            </p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </CommandItem>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </CommandList>
  );
}

export function ModelSelect({ value, onValueChange, className }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const {
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
  } = useProcessedModels();

  if (isLoading) {
    return (
      <Button variant="ghost" className="w-full justify-start h-12" disabled>
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mr-2" />
          Loading models...
        </div>
      </Button>
    );
  }

  if (!formattedModels.length) {
    return (
      <Button variant="ghost" className="w-full justify-start h-12" disabled>
        No models available
      </Button>
    );
  }

  const selectedModel = formattedModels.find(model => model.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between w-full px-3 py-2 text-left font-normal', className)}
        >
          <div className="flex items-center min-w-0 flex-1">
            {selectedModel ? (
              <div className="flex items-center min-w-0 flex-1 gap-2">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-sm truncate">{selectedModel.name}</span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Select model...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[550px]" align="start" side="bottom">
        <Command shouldFilter={false} className="max-h-[500px]">
          <ModelSelectHeader
            search={search}
            setSearch={setSearch}
            sortKey={sortKey}
            setSortKey={setSortKey}
            allProviders={allProviders}
            selectedProviders={selectedProviders}
            setSelectedProviders={setSelectedProviders}
          />
          <ModelSelectList
            groupedModels={groupedModels}
            value={value}
            onValueChange={onValueChange}
            setOpen={setOpen}
            setSearch={setSearch}
          />
        </Command>
      </PopoverContent>
    </Popover>
  );
}
