import { useMemo, useState } from 'react'
import { HeartCrack, Search, SortAsc, SortDesc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useModels } from '@/features/models/api/get-models'
import { motion } from 'framer-motion'
import { useModel } from '@/features/models/api/get-model'
import { ChevronLeft, ChevronRight } from 'lucide-react'


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

const ModelCard = ({ model, onEdit }: { model: ModelsResponse, onEdit: (model: ModelsResponse) => void }) => (
  <motion.div
    className="bg-secondary rounded-lg shadow-md p-6 transition-shadow duration-300 overflow-y-auto"
    whileHover={{ scale: 1.00 }}
  >
    <h2 className="text-xl font-semibold whitespace-nowrap truncate">{model.name}</h2>
    <div className="flex flex-wrap gap-2 mb-2 mt-1">
      <Badge variant="outline" className="text-xs border-primary bg-primary/10 text-primary">{model.details.format}</Badge>
      <Badge variant="outline" className="text-xs border-primary bg-primary/10 text-primary">{model.details.family}</Badge>
      <Badge variant="outline" className="text-xs border-primary bg-primary/10 text-primary">{model.details.parameter_size}</Badge>
      <Badge variant="outline" className="text-xs border-primary bg-primary/10 text-primary">{model.details.quantization_level}</Badge>
    </div>
    <p className="text-sm mt-4">
      Size: {formatFileSize(model.size)}
    </p>
    <p className="text-sm text-muted-foreground mb-2">
      Modified: {new Date(model.modified_at).toLocaleDateString()}
    </p>
    <div className="flex justify-end mt-4">
      <Button onClick={() => onEdit(model)} className="w-full">
        Edit Agent
      </Button>
    </div>
  </motion.div>
);

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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { isLoading, data: modelList } = useModels();
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const { data: selectedModelDetails, isLoading: isLoadingDetails } = useModel({
    id: selectedModel?.name ?? '',
    queryConfig: {
      enabled: !!selectedModel
    }
  });

  const handleEdit = (model) => {
    setSelectedModel(model);
  }

  const closeModal = () => {
    setSelectedModel(null);
  }

  const handleEditModel = (model) => {
    setSelectedModel(model);
    setIsEditModalOpen(true);
  }

  const handleDeleteModel = (model) => {
    setSelectedModel(model);
    setIsDeleteDialogOpen(true);
  }

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3, '...', totalPages];
    }

    if (currentPage >= totalPages - 1) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage, '...', totalPages];
  };

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

  // Add pagination calculation
  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedModels?.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedModels, currentPage])

  const totalPages = Math.ceil((filteredAndSortedModels?.length || 0) / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mt-16 text-start">Fine-Tune Agents</h1>
      <h3 className="text-lg mb-8 text-start text-muted-foreground">Fine-tune your agents, customize existing models, or create your own.</h3>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 size-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="size">Size</SelectItem>
            <SelectItem value="modified">Last Modified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterFamily} onValueChange={setFilterFamily}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by family" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Families</SelectItem>
            <SelectItem value="llama">Llama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {paginatedModels?.length === 0 && (
        <div className="flex justify-center items-center h-64 flex-col gap-2">
          <p className="text-muted-foreground">No models found</p>
          <HeartCrack className="text-primary/50 size-5" />
        </div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {paginatedModels?.map((model) => (
          <ModelCard
            key={model.name}
            model={model}
            onEdit={handleEdit}
          />
        ))}
      </motion.div>

      {paginatedModels?.length > 0 && (

        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="ghost"
            className='gap-1 text-xs'
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          {getPageNumbers(currentPage, totalPages).map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2">...</span>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => setCurrentPage(Number(pageNum))}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            )
          ))}

          <Button
            variant="ghost"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className='gap-1 text-xs'
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{
          duration: 0.2,
          ease: "easeOut"
        }}
      >
        <Dialog open={!!selectedModel} onOpenChange={closeModal}>
          <DialogContent className="max-w-4xl overflow-auto max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedModel?.name}</DialogTitle>
              <DialogDescription>Model Details</DialogDescription>
            </DialogHeader>

            {isLoadingDetails ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="modelfile">Modelfile</Label>
                  <Textarea
                    id="modelfile"
                    className="h-48 font-mono text-sm"
                    value={selectedModelDetails?.modelfile || ''}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="parameters">Parameters</Label>
                  <Textarea
                    id="parameters"
                    className="h-48 font-mono text-sm"
                    value={selectedModelDetails?.parameters || ''}
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="template">Template</Label>
                  <Textarea
                    id="template"
                    className="h-32 font-mono text-sm"
                    value={selectedModelDetails?.template || ''}
                    readOnly
                  />
                </div>

                {/* Model Details Section */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Model Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedModelDetails?.details &&
                      Object.entries(selectedModelDetails.details).map(([key, value]) => (
                        <div key={key}>
                          <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
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

                {/* Model Info Section */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Model Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedModelDetails?.model_info &&
                      Object.entries(selectedModelDetails.model_info).map(([key, value]) => (
                        <div key={key}>
                          <Label className="capitalize">
                            {key.split('.').pop()?.replace(/_/g, ' ')}
                          </Label>
                          <Input
                            value={value?.toString() || ''}
                            readOnly
                            className="font-mono text-sm"
                          />
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={closeModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}