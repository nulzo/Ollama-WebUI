import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Clock, ArrowDownToLine, Check, AlertCircle, Loader2, Trash2, Info, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useAvailableModels, useDownloadModel, useDownloadStatus } from '@/features/models/api/download-model';
import { useModels } from '@/features/models/api/get-models';
import { useDeleteModel } from '@/features/models/api/delete-model';
import { formatBytes, getRelativeTimeString, formatDuration } from '@/lib/utils';
import { motion } from 'framer-motion';

const ALL_SIZES = 'all_sizes';
const ALL_CAPABILITIES = 'all_capabilities';
const SORT_OPTIONS = {
  RECENT: 'recent',
  DOWNLOADS: 'downloads',
  NAME: 'name',
} as const;

type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

export function DownloadModelsRoute() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState(ALL_SIZES);
  const [capabilityFilter, setCapabilityFilter] = useState(ALL_CAPABILITIES);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.RECENT);
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);
  const [downloadQueue, setDownloadQueue] = useState<string[]>([]);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const modelsPerPage = 8;

  // Fetch available models from Ollama library
  const { data: availableModels = [], isLoading: isLoadingModels, error: modelsError } = useAvailableModels();
  
  // Fetch installed models
  const { data: installedModels, refetch: refetchInstalledModels, error: installedModelsError } = useModels();
  
  // Download model mutation
  const { mutateAsync: downloadModelMutation, isPending: isStartingDownload, error: downloadError } = useDownloadModel();
  
  // Download status query
  const { data: downloadStatus, isLoading: isLoadingStatus, error: statusError } = useDownloadStatus(activeDownloadId);

  // Delete model mutation
  const { mutateAsync: deleteModelMutation, isPending: isDeletingModel, error: deleteError } = useDeleteModel();

  // Check if a model is already installed
  const isModelInstalled = (modelName: string) => {
    if (!installedModels?.ollama) return false;
    return installedModels.ollama.some(model => model.name === modelName);
  };

  // Get installed model details
  const getInstalledModelDetails = (modelName: string) => {
    if (!installedModels?.ollama) return null;
    return installedModels.ollama.find(model => model.name === modelName);
  };

  // Handle download button click
  const handleDownload = (model: any) => {
    // Add to queue if there's already an active download
    if (activeDownloadId) {
      setDownloadQueue(prev => [...prev, model.name]);
      toast({
        title: 'Added to download queue',
        description: `${model.name} has been added to the download queue.`,
      });
      return;
    }

    // Set loading state
    setActiveDownloadId('loading');
    
    // Start the download
    downloadModelMutation(model.name)
      .then((data) => {
        console.log('Download started with task ID:', data.task_id);
        setActiveDownloadId(data.task_id);
        toast({
          title: 'Download started',
          description: `Downloading ${model.name}...`,
        });
      })
      .catch((error) => {
        console.error('Download error:', error);
        setActiveDownloadId(null); // Reset active download on error
        toast({
          title: 'Download failed',
          description: error.message || 'Failed to start download',
          variant: 'destructive',
        });
      });
  };

  // Handle delete button click
  const handleDeleteClick = (model: any) => {
    setModelToDelete(model);
    setShowDeleteConfirm(true);
  };

  // Confirm model deletion
  const confirmDelete = () => {
    if (!modelToDelete) return;
    
    deleteModelMutation({ modelName: modelToDelete.name })
      .then(() => {
        toast({
          title: 'Model deleted',
          description: `${modelToDelete.name} has been successfully deleted.`,
        });
        refetchInstalledModels();
        setShowDeleteConfirm(false);
        setModelToDelete(null);
      })
      .catch((error: Error) => {
        toast({
          title: 'Deletion failed',
          description: error.message,
          variant: 'destructive',
        });
        setShowDeleteConfirm(false);
        setModelToDelete(null);
      });
  };

  // Process download queue
  const processQueue = () => {
    if (downloadQueue.length > 0 && !activeDownloadId) {
      const nextModel = downloadQueue[0];
      const newQueue = downloadQueue.slice(1);
      setDownloadQueue(newQueue);
      
      downloadModelMutation(nextModel)
        .then((data) => {
          setActiveDownloadId(data.task_id);
          toast({
            title: 'Download started',
            description: `Downloading ${nextModel}...`,
          });
        })
        .catch((error) => {
          toast({
            title: 'Download failed',
            description: error.message,
            variant: 'destructive',
          });
          // Process next in queue if this one failed
          setDownloadQueue(newQueue);
        });
    }
  };

  // Process queue when active download is completed
  useEffect(() => {
    if (!activeDownloadId && downloadQueue.length > 0) {
      const timer = setTimeout(() => {
        processQueue();
      }, 1000); // Small delay to ensure state is updated
      return () => clearTimeout(timer);
    }
  }, [activeDownloadId, downloadQueue.length]);

  // Reset active download when complete and process queue
  useEffect(() => {
    if (!downloadStatus) return;
    
    console.log('Download status updated:', downloadStatus);
    
    if (downloadStatus.status === 'success') {
      toast({
        title: 'Download complete',
        description: `${downloadStatus.model} has been successfully downloaded.`,
      });
      // Reset after a delay to show the success state
      const timer = setTimeout(() => {
        setActiveDownloadId(null);
        refetchInstalledModels();
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (downloadStatus.status === 'failed') {
      toast({
        title: 'Download failed',
        description: downloadStatus.error || 'An unknown error occurred',
        variant: 'destructive',
      });
      // Reset after a delay to show the error state
      const timer = setTimeout(() => {
        setActiveDownloadId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [downloadStatus, toast, refetchInstalledModels]);

  // Show error toast for API errors
  useEffect(() => {
    if (modelsError) {
      toast({
        title: 'Error loading models',
        description: modelsError.message,
        variant: 'destructive',
      });
    }
    
    if (installedModelsError) {
      toast({
        title: 'Error loading installed models',
        description: installedModelsError.message,
        variant: 'destructive',
      });
    }
    
    if (statusError) {
      toast({
        title: 'Error checking download status',
        description: statusError.message,
        variant: 'destructive',
      });
    }
    
    if (deleteError) {
      toast({
        title: 'Error deleting model',
        description: deleteError.message,
        variant: 'destructive',
      });
    }
  }, [modelsError, installedModelsError, statusError, deleteError, toast, activeDownloadId]);

  // Filter models based on search and filters
  const filteredModels = availableModels
    .filter(
      model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (sizeFilter === ALL_SIZES || model.sizes.includes(sizeFilter)) &&
        (capabilityFilter === ALL_CAPABILITIES || model.capabilities.includes(capabilityFilter))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.RECENT:
          return new Date(b.published).getTime() - new Date(a.published).getTime();
        case SORT_OPTIONS.DOWNLOADS:
          return Number(b.pulls.replace(/[^0-9.]/g, '')) - Number(a.pulls.replace(/[^0-9.]/g, ''));
        case SORT_OPTIONS.NAME:
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);
  const startIndex = (currentPage - 1) * modelsPerPage;
  const displayedModels = filteredModels.slice(startIndex, startIndex + modelsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = (currentPage: number, totalPages: number) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Group model sizes by base parameter size
  const groupModelSizes = (sizes: string[]) => {
    const baseGroups: Record<string, string[]> = {};
    
    sizes.forEach(size => {
      // Extract base size (e.g., "7b" from "7b-qwen-distill-fp16")
      const baseSizeMatch = size.match(/^(\d+\.?\d*b)/);
      const baseSize = baseSizeMatch ? baseSizeMatch[1] : size;
      
      if (!baseGroups[baseSize]) {
        baseGroups[baseSize] = [];
      }
      
      baseGroups[baseSize].push(size);
    });
    
    return baseGroups;
  };

  // Handle download with specific parameter size
  const handleDownloadWithSize = (model: any, specificSize: string) => {
    // If the size is already a full parameter specification (contains '-'), use it directly
    // Otherwise, it's a base size like "7b" and we should use the model name as is
    const modelNameWithSize = specificSize.includes('-') 
      ? `${model.name}:${specificSize}`
      : model.name;
    
    handleDownload({...model, name: modelNameWithSize});
    setSelectedSize(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-bold text-4xl">Download Models</h1>
          <p className="text-muted-foreground text-lg">
            Browse and download models from the Ollama library for your AI applications.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="hidden md:flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Download Queue Display */}
      {downloadQueue.length > 0 && (
        <div className="mb-8 p-4 bg-secondary rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Download Queue ({downloadQueue.length})</h3>
          <div className="flex flex-col gap-2">
            {downloadQueue.map((modelName, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                <span>{modelName}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setDownloadQueue(prev => prev.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-card border rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Models</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 stroke-muted-foreground size-4" />
              <Input
                type="text"
                placeholder="Search models..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Size Filter */}
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SIZES}>All Sizes</SelectItem>
                  {Array.from(new Set(availableModels.flatMap(m => 
                    // Only include base sizes (e.g., "7b") in the filter
                    m.sizes.filter(size => !size.includes('-') || size === "unknown")
                  )))
                    .sort((a, b) => {
                      // Sort numerically by parameter count
                      const getParamCount = (size: string) => {
                        if (size === "unknown") return 0;
                        const match = size.match(/^(\d+\.?\d*)b/);
                        return match ? parseFloat(match[1]) : 0;
                      };
                      return getParamCount(a) - getParamCount(b);
                    })
                    .map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Capability Filter */}
              <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Capability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CAPABILITIES}>All Capabilities</SelectItem>
                  {Array.from(new Set(availableModels.flatMap(m => m.capabilities)))
                    .sort()
                    .map(capability => (
                      <SelectItem key={capability} value={capability}>
                        {capability}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SORT_OPTIONS.RECENT}>Most Recent</SelectItem>
                  <SelectItem value={SORT_OPTIONS.DOWNLOADS}>Most Downloads</SelectItem>
                  <SelectItem value={SORT_OPTIONS.NAME}>Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoadingModels && (
        <div className="flex flex-col justify-center items-center h-64 bg-card border rounded-lg p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-xl font-medium">Loading models...</span>
          <p className="text-muted-foreground mt-2">Fetching available models from Ollama library</p>
        </div>
      )}

      {/* No results */}
      {!isLoadingModels && filteredModels.length === 0 && (
        <div className="flex flex-col justify-center items-center h-64 bg-card border rounded-lg p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No models found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchTerm('');
              setSizeFilter(ALL_SIZES);
              setCapabilityFilter(ALL_CAPABILITIES);
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Model Grid */}
      {!isLoadingModels && filteredModels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedModels.map((model) => {
            const isInstalled = isModelInstalled(model.name);
            const isDownloading = downloadStatus?.model === model.name && 
                                 ['pending', 'downloading', 'pulling manifest'].includes(downloadStatus.status);
            const isQueued = downloadQueue.includes(model.name);
            
            // Group sizes by base parameter count
            const sizeGroups = groupModelSizes(model.sizes);
            
            return (
              <motion.div
                key={model.name}
                className="relative flex flex-col bg-card border shadow-sm p-6 rounded-lg h-[340px] transition-shadow hover:shadow-md"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold whitespace-nowrap truncate">{model.name}</h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelDetails(true);
                    }}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2 mt-1">
                  {model.capabilities.slice(0, 2).map((capability: string) => (
                    <Badge key={capability} variant="default" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                  {model.capabilities.length > 2 && (
                    <Badge variant="default" className="text-xs">
                      +{model.capabilities.length - 2}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                  {model.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mt-1 mb-2">
                  {/* Show only base sizes (e.g., "7b") in the card */}
                  {Object.keys(sizeGroups).map((baseSize: string) => (
                    <Badge key={baseSize} variant="outline" className="text-xs">
                      {baseSize} 
                      {sizeGroups[baseSize].length > 1 && ` (${sizeGroups[baseSize].length} variants)`}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex w-full justify-between mt-auto mb-2">
                  <p className="text-xs text-muted-foreground flex gap-1 items-center">
                    <Clock className="size-3" />
                    {getRelativeTimeString(model.published)}
                  </p>
                  <p className="text-xs text-muted-foreground flex gap-1 items-center">
                    <ArrowDownToLine className="size-3" />
                    {model.pulls} downloads
                  </p>
                </div>
                
                {/* Download progress */}
                {isDownloading && downloadStatus && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{downloadStatus.status}</span>
                      <span>
                        {downloadStatus.total_size > 0 
                          ? `${formatBytes(downloadStatus.downloaded)} / ${formatBytes(downloadStatus.total_size)}`
                          : 'Preparing...'}
                      </span>
                    </div>
                    <Progress value={downloadStatus.progress} className="h-2" />
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>
                        {downloadStatus.elapsed_seconds && downloadStatus.downloaded > 0 && downloadStatus.total_size > 0 && (
                          <>
                            {formatBytes(downloadStatus.downloaded / downloadStatus.elapsed_seconds)}/s
                          </>
                        )}
                      </span>
                      <span>
                        {downloadStatus.elapsed_seconds && (
                          <>Elapsed: {formatDuration(downloadStatus.elapsed_seconds)}</>
                        )}
                      </span>
                      <span>
                        {downloadStatus.elapsed_seconds && downloadStatus.downloaded > 0 && downloadStatus.total_size > 0 && downloadStatus.progress < 100 && (
                          <>
                            ETA: {formatDuration(
                              (downloadStatus.total_size - downloadStatus.downloaded) / 
                              (downloadStatus.downloaded / downloadStatus.elapsed_seconds)
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-auto">
                  {isInstalled ? (
                    <>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDeleteClick(model)}
                        disabled={isDeletingModel}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                      <Button 
                        variant="default"
                        className="flex-1"
                        disabled
                      >
                        <Check className="mr-2 h-4 w-4" /> Installed
                      </Button>
                    </>
                  ) : isDownloading ? (
                    <Button 
                      className="w-full"
                      disabled
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading...
                    </Button>
                  ) : isQueued ? (
                    <Button 
                      className="w-full"
                      variant="secondary"
                      onClick={() => setDownloadQueue(prev => prev.filter(name => name !== model.name))}
                    >
                      <X className="mr-2 h-4 w-4" /> Remove from Queue
                    </Button>
                  ) : Object.keys(sizeGroups).length > 1 || 
                     (Object.keys(sizeGroups).length === 1 && 
                      sizeGroups[Object.keys(sizeGroups)[0]].length > 1) ? (
                    <Select 
                      onValueChange={(value) => {
                        handleDownloadWithSize(model, value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select parameter size" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(sizeGroups).map(([baseSize, variants]) => (
                          <SelectGroup key={baseSize}>
                            <SelectLabel>{baseSize}</SelectLabel>
                            {variants.map((variant: string) => (
                              <SelectItem key={variant} value={variant}>
                                {variant === baseSize ? 
                                  `${variant} (default)` : 
                                  variant.replace(baseSize + '-', '')} 
                                {model.size_estimates?.[variant] && ` (~${formatBytes(model.size_estimates[variant])})`}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Button 
                      onClick={() => {
                        // Use the first variant of the first base size
                        const baseSize = Object.keys(sizeGroups)[0];
                        const variant = sizeGroups[baseSize][0];
                        handleDownloadWithSize(model, variant);
                      }} 
                      className="w-full"
                      disabled={isStartingDownload}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                      {Object.keys(sizeGroups).length > 0 && 
                       sizeGroups[Object.keys(sizeGroups)[0]].length > 0 && 
                       model.size_estimates?.[sizeGroups[Object.keys(sizeGroups)[0]][0]] && 
                        ` (~${formatBytes(model.size_estimates[sizeGroups[Object.keys(sizeGroups)[0]][0]])})`}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 mb-8">
          <nav className="flex flex-wrap items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                // Scroll to top when changing page
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="h-9 w-9"
            >
              <span className="sr-only">Previous page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            {getPageNumbers(currentPage, totalPages).map((page, i) => (
              <Button
                key={i}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
                onClick={() => {
                  if (typeof page === 'number') {
                    setCurrentPage(page);
                    // Scroll to top when changing page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={typeof page !== 'number'}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                // Scroll to top when changing page
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Next page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </nav>
        </div>
      )}

      {/* Model Details Dialog */}
      <Dialog open={showModelDetails} onOpenChange={setShowModelDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedModel?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about this model
            </DialogDescription>
          </DialogHeader>
          
          {selectedModel && (
            <div className="py-4">
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedModel.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModel.capabilities.length > 0 ? (
                      selectedModel.capabilities.map((capability: string) => (
                        <Badge key={capability} variant="default" className="text-xs">
                          {capability}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None specified</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Available Parameter Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(groupModelSizes(selectedModel.sizes)).map((baseSize: string) => (
                      <Badge key={baseSize} variant="outline" className="text-xs border-primary text-primary">
                        {baseSize}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Available Variants</h4>
                <div className="bg-muted p-3 rounded-md">
                  {Object.entries(groupModelSizes(selectedModel.sizes)).map(([baseSize, variants]) => (
                    <div key={baseSize} className="mb-3 last:mb-0">
                      <h5 className="text-sm font-medium mb-1">{baseSize} Parameters</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {variants.map((variant: string) => (
                          <div key={variant} className="flex items-center justify-between bg-card p-2 rounded-md text-xs">
                            <span>
                              {variant === baseSize ? variant : variant.replace(baseSize + '-', '')}
                              {selectedModel.size_estimates?.[variant] && 
                                <span className="text-muted-foreground ml-1">
                                  (~{formatBytes(selectedModel.size_estimates[variant])})
                                </span>
                              }
                            </span>
                            {!isModelInstalled(selectedModel.name) && !downloadQueue.includes(selectedModel.name) && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => {
                                  handleDownloadWithSize(selectedModel, variant);
                                  setShowModelDetails(false);
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" /> Download
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Published</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedModel.published).toLocaleDateString()} 
                    ({getRelativeTimeString(selectedModel.published)})
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Downloads</h4>
                  <p className="text-sm text-muted-foreground">{selectedModel.pulls}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Model Link</h4>
                <a 
                  href={selectedModel.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                >
                  {selectedModel.link}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </a>
              </div>
              
              {isModelInstalled(selectedModel.name) && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-3">Installation Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {getInstalledModelDetails(selectedModel.name) && (
                      <>
                        <div>
                          <h5 className="text-xs font-medium mb-1">Model Size</h5>
                          <p className="text-sm text-muted-foreground">
                            {formatBytes(getInstalledModelDetails(selectedModel.name)?.size || 0)}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium mb-1">Installed On</h5>
                          <p className="text-sm text-muted-foreground">
                            {new Date(getInstalledModelDetails(selectedModel.name)?.modified_at || '').toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowModelDetails(false)} className="sm:order-1">
              Close
            </Button>
            {selectedModel && !isModelInstalled(selectedModel.name) && !downloadQueue.includes(selectedModel.name) && (
              <Select 
                onValueChange={(value) => {
                  handleDownloadWithSize(selectedModel, value);
                  setShowModelDetails(false);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px] sm:order-2">
                  <SelectValue placeholder="Download a variant" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(groupModelSizes(selectedModel.sizes)).map(([baseSize, variants]) => (
                    <SelectGroup key={baseSize}>
                      <SelectLabel>{baseSize}</SelectLabel>
                      {variants.map((variant: string) => (
                        <SelectItem key={variant} value={variant}>
                          {variant === baseSize ? 
                            `${variant} (default)` : 
                            variant.replace(baseSize + '-', '')} 
                          {selectedModel.size_estimates?.[variant] && ` (~${formatBytes(selectedModel.size_estimates[variant])})`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive">Delete Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this model? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {modelToDelete && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{modelToDelete.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{modelToDelete.description}</p>
                {getInstalledModelDetails(modelToDelete.name)?.size && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span>Size:</span>
                    <Badge variant="outline">
                      {formatBytes(getInstalledModelDetails(modelToDelete.name)?.size || 0)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              className="sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeletingModel}
              className="w-full sm:w-auto sm:order-2"
            >
              {isDeletingModel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 