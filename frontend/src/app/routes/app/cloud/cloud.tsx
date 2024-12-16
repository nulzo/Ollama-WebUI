import { useState } from 'react';
import { Search, Download, Clock, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import modelsData from '@/features/cloud/data/models.json';
import { motion } from 'framer-motion';

const ALL_SIZES = 'all_sizes';
const ALL_CAPABILITIES = 'all_capabilities';
const SORT_OPTIONS = {
  RECENT: 'recent',
  DOWNLOADS: 'downloads',
  NAME: 'name',
} as const;

type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];

const getRelativeTimeString = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now.getTime() - past.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    return `Updated ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Updated ${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `Updated ${months} month${months === 1 ? '' : 's'} ago`;
  }
};

export function CloudRoute() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState(ALL_SIZES);
  const [capabilityFilter, setCapabilityFilter] = useState(ALL_CAPABILITIES);
  const [selectedModel, setSelectedModel] = useState<(typeof modelsData)[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(SORT_OPTIONS.RECENT);
  const modelsPerPage = 6;

  // Filter models based on search and filters
  const filteredModels = modelsData
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
          return Number(b.pulls) - Number(a.pulls);
        case SORT_OPTIONS.NAME:
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

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

  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);
  const startIndex = (currentPage - 1) * modelsPerPage;
  const displayedModels = filteredModels.slice(startIndex, startIndex + modelsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mt-16 text-start">Model Store</h1>
      <h3 className="text-lg mb-8 text-start text-muted-foreground">
        Browse and download models for your AI applications.
      </h3>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 stroke-muted-foreground size-4" />
          <Input
            type="text"
            placeholder="Search models..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SIZES}>All Sizes</SelectItem>
            {Array.from(new Set(modelsData.flatMap(m => m.sizes)))
              .sort()
              .map(size => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Capability Filter */}
        <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Capability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CAPABILITIES}>All Capabilities</SelectItem>
            {Array.from(new Set(modelsData.flatMap(m => m.capabilities)))
              .sort()
              .map(capability => (
                <SelectItem key={capability} value={capability}>
                  {capability}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SORT_OPTIONS.RECENT}>
              <span className="flex items-center gap-2">
                <Clock className="size-4" />
                Most Recent
              </span>
            </SelectItem>
            <SelectItem value={SORT_OPTIONS.DOWNLOADS}>
              <span className="flex items-center gap-2">
                <ArrowDownToLine className="size-4" />
                Most Downloads
              </span>
            </SelectItem>
            <SelectItem value={SORT_OPTIONS.NAME}>
              <span className="flex items-center gap-2">
                <Search className="size-4" />
                Name
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {displayedModels.map(model => (
          <div
            key={model.name}
            className="bg-secondary rounded-lg shadow-md p-6 flex flex-col h-[300px] max-h-[300px] transition-shadow duration-300 overflow-y-auto"
          >
            <h2 className="text-xl font-semibold whitespace-nowrap truncate">{model.name}</h2>
            <div className="flex flex-wrap gap-2 mb-2 mt-1">
              {model.capabilities.map(capability => (
                <Badge key={capability} variant="default" className="text-xs">
                  {capability}
                </Badge>
              ))}
              {model.sizes.map(size => (
                <Badge key={size} variant="outline" className="text-xs border-primary text-primary">
                  {size}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4 flex-grow overflow-y-auto">
              {model.description}
            </p>
            <div className="flex w-full justify-between">
              <p className="text-xs text-muted-foreground mb-2 flex gap-1 items-center">
                <Clock className="size-3" />
                {getRelativeTimeString(model.published)}
              </p>
              <p className="text-xs text-muted-foreground mb-2 flex gap-1 items-center">
                <ArrowDownToLine className="size-3" />
                {model.pulls} downloads
              </p>
            </div>
            <Button onClick={() => setSelectedModel(model)} className="w-full">
              Learn More
            </Button>
          </div>
        ))}
      </div>

      {/* Add pagination controls */}
      {filteredModels?.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="ghost"
            className="gap-1 text-xs"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          {getPageNumbers(currentPage, totalPages).map((pageNum, idx) =>
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                onClick={() => setCurrentPage(Number(pageNum))}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            )
          )}

          <Button
            variant="ghost"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="gap-1 text-xs"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Update the dialog content */}
      <Dialog open={selectedModel !== null} onOpenChange={open => !open && setSelectedModel(null)}>
        <DialogContent className="sm:max-w-[600px] overflow-hidden">
          <motion.div>
            {selectedModel && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedModel.name}</DialogTitle>
                  <DialogDescription>
                    <p className="mb-4">{selectedModel.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedModel.capabilities.map(capability => (
                        <Badge key={capability} variant="default">
                          {capability}
                        </Badge>
                      ))}
                      {selectedModel.sizes.map(size => (
                        <Badge
                          key={size}
                          variant="outline"
                          className="border-primary bg-primary/10 text-primary"
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">
                        {getRelativeTimeString(selectedModel.published)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <a
                          href={selectedModel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          View on Ollama Library →
                        </a>
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => setSelectedModel(null)} variant="outline">
                    Close
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" /> Download Model
                  </Button>
                </DialogFooter>
              </>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
