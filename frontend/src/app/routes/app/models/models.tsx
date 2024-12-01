import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModels } from '@/features/models/api/get-models';
import { OllamaModel } from '@/features/models/types/models';

const formatFileSize = (bytes: number): string => {
  if (!bytes) return 'Unknown';
  const gigabytes = bytes / (1024 * 1024 * 1024);
  const megabytes = bytes / (1024 * 1024);
  
  if (gigabytes >= 1) {
    return `${gigabytes.toFixed(2)} GB`;
  } else {
    return `${megabytes.toFixed(2)} MB`;
  }
};

export function ModelsRoute() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<'all' | 'ollama' | 'openai'>('all');
  const { data: modelsData, isLoading } = useModels({});

  const filteredModels = useMemo(() => {
    if (!modelsData) return { ollama: [], openai: [] };

    const filtered = {
      ollama: modelsData.ollama.models.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      openai: modelsData.openai.filter(model =>
        model.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };

    if (filterProvider === 'ollama') {
      return { ollama: filtered.ollama, openai: [] };
    } else if (filterProvider === 'openai') {
      return { ollama: [], openai: filtered.openai };
    }

    return filtered;
  }, [modelsData, searchTerm, filterProvider]);

  return (
    <div className="mx-auto px-4 py-8 container">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="font-bold text-4xl">Models</h1>
          <p className="mt-2 text-muted-foreground">
            Available models from different providers
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="top-2.5 left-2 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterProvider}
            onValueChange={(value: 'all' | 'ollama' | 'openai') => setFilterProvider(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="ollama">Ollama</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        ) : (
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Ollama Models */}
            {filteredModels.ollama.map((model: OllamaModel) => (
              <Card key={model.digest} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{model.details.format}</Badge>
                    <Badge variant="outline">{model.details.parameter_size}</Badge>
                    <Badge variant="outline">{model.details.quantization_level}</Badge>
                  </div>
                  <div className="space-y-2 text-muted-foreground text-sm">
                    <p>Size: {formatFileSize(model.size)}</p>
                    <p>Modified: {new Date(model.modified_at).toLocaleDateString()}</p>
                    <p>Family: {model.details.family}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* OpenAI Models */}
            {filteredModels.openai.map((model) => (
              <Card key={model.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{model.id}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-muted-foreground text-sm">
                    <p>Created: {new Date(model.created * 1000).toLocaleDateString()}</p>
                    <p>Owner: {model.owned_by}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}