import { useMemo, useState } from 'react'
import { HeartCrack, Search, PlusCircle, X, Send, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useModels } from '@/features/models/api/get-models'
import { useModel } from '@/features/models/api/get-model'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Skeleton } from '@/components/ui/skeleton'

interface ModelsResponse {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

interface ModelDetailsResponse {
  license: string;
  modelfile: string;
  parameters: string;
  template: string;
  system: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  model_info: {
    [key: string]: string | number | boolean | null;
  };
  modified_at: string;
}

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
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [selectedModel, setSelectedModel] = useState(null)
  const [filterFamily, setFilterFamily] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [temperature, setTemperature] = useState(0.7)
  const [newTag, setNewTag] = useState('')
  const [customTags, setCustomTags] = useState([])
  const itemsPerPage = 8

  const { isLoading, data: modelList } = useModels();
  const { data: selectedModelDetails, isLoading: isLoadingDetails } = useModel({
    id: selectedModel?.name ?? '',
    queryConfig: {
      enabled: !!selectedModel
    }
  });

  const handleEdit = (model) => {
    setSelectedModel(model);
    setCustomTags(model.details.families || []);
    setTemperature(0.7);
  }

  const handleAddTag = () => {
    if (newTag && !customTags.includes(newTag)) {
      setCustomTags(prev => [...prev, newTag]);
      setNewTag('');
    }
  }

  const handleRemoveTag = (tag) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
  }

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    return modelList?.models
      ?.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterFamily === 'all' || model.details.family === filterFamily)
      )
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'size') return b.size - a.size
        if (sortBy === 'modified') return new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime()
        return 0
      });
  }, [modelList?.models, searchTerm, filterFamily, sortBy]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  // Paginate models
  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedModels?.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedModels, currentPage])

  const totalPages = Math.ceil((filteredAndSortedModels?.length || 0) / itemsPerPage)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mt-16 text-start">Model Store</h1>
      <h3 className="text-lg mb-8 text-start text-muted-foreground">Browse and download models for your AI applications.</h3>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-secondary/15">
          <CardHeader className="pb-4">
            <CardTitle>Available Models</CardTitle>
            <CardDescription>Select a model to edit its parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 stroke-muted-foreground size-4" />
                <Input
                  type="text"
                  placeholder="Search models..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="modified">Last Modified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Model Family</Label>
                <Select value={filterFamily} onValueChange={setFilterFamily}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Families</SelectItem>
                    <SelectItem value="llama">Llama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-full flex flex-col">
              <div className="space-y-2 flex-1 overflow-auto">
                {isLoading ? (
                  // Skeleton loading state
                  Array.from({ length: 5 }).map((_, idx) => (
                    <motion.div
                      key={`skeleton-${idx}`}
                      custom={idx}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="h-[52px] p-4 rounded-lg bg-secondary/15 backdrop-blur-sm flex items-center"
                    >
                      <Skeleton className="w-full h-4" />
                    </motion.div>
                  ))
                ) : paginatedModels?.length === 0 ? (
                  <div className="flex justify-center items-center flex-col gap-2 p-4">
                    <p className="text-muted-foreground">No models found</p>
                    <HeartCrack className="text-primary/50 size-5" />
                  </div>
                ) : (
                  paginatedModels?.map((model, index) => (
                    <motion.div
                      key={model.name}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleEdit(model)}
                      className="group h-[52px] px-4 rounded-lg border border-secondary/50 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/30 backdrop-blur-sm cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-between hover:shadow-sm"
                    >
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className="text-sm font-semibold text-primary whitespace-nowrap">
                          {model.name.split('/')[0]}
                        </span>
                        <span className="text-sm text-muted-foreground truncate">
                          {model.name.split('/').slice(1).join('/')}
                        </span>
                      </div>
                      <Edit className="w-3 h-3 text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))
                )}
              </div>

              {filteredAndSortedModels?.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle>
              {selectedModel ? 'Edit Model Parameters' : 'Model Details'}
            </CardTitle>
            <CardDescription>
              {selectedModel 
                ? `Customize the settings for ${selectedModel.name}`
                : 'Select a model from the list to view its details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[calc(100%-7rem)] overflow-auto">
            {selectedModel ? (
              isLoadingDetails ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name">Model Name</Label>
                    <Input
                      id="name"
                      value={selectedModel.name}
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="temperature">Temperature: {temperature.toFixed(2)}</Label>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[temperature]}
                      onValueChange={([value]) => setTemperature(value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="modelfile">Modelfile</Label>
                    <Textarea
                      id="modelfile"
                      className="font-mono"
                      value={selectedModelDetails?.modelfile || ''}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parameters">Parameters</Label>
                    <Textarea
                      id="parameters"
                      className="font-mono"
                      value={selectedModelDetails?.parameters || ''}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template">Template</Label>
                    <Textarea
                      id="template"
                      className="font-mono"
                      value={selectedModelDetails?.template || ''}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {customTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-sm">
                          {tag}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 h-auto p-0"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a new tag"
                      />
                      <Button type="button" onClick={handleAddTag} size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Model Details</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {selectedModelDetails?.details &&
                        Object.entries(selectedModelDetails.details).map(([key, value]) => (
                          <div key={key}>
                            <Label className="capitalize text-xs text-muted-foreground">
                              {key.replace(/_/g, ' ')}
                            </Label>
                            <Input
                              value={Array.isArray(value) ? value.join(', ') : value?.toString() || ''}
                              readOnly
                              className="font-mono text-sm"
                            />
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  <Button type="submit">Save Changes</Button>
                </form>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a model from the list to view and edit its details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}