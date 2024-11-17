import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Mock data for Ollama models
const models = [
  { id: 1, name: 'GPT-4', family: 'GPT', size: 'Large', capabilities: ['Text Generation', 'Question Answering'], description: 'Advanced language model with broad capabilities.' },
  { id: 2, name: 'BERT', family: 'BERT', size: 'Medium', capabilities: ['Text Classification', 'Named Entity Recognition'], description: 'Bidirectional encoder for natural language understanding.' },
  { id: 3, name: 'T5-Small', family: 'T5', size: 'Small', capabilities: ['Translation', 'Summarization'], description: 'Compact model for various text-to-text tasks.' },
  { id: 4, name: 'RoBERTa', family: 'BERT', size: 'Large', capabilities: ['Sentiment Analysis', 'Text Classification'], description: 'Optimized version of BERT with improved training methodology.' },
  { id: 5, name: 'DALL-E Mini', family: 'DALL-E', size: 'Small', capabilities: ['Image Generation'], description: 'Compact model for generating images from text descriptions.' },
  { id: 6, name: 'CodeBERT', family: 'BERT', size: 'Medium', capabilities: ['Code Understanding', 'Code Generation'], description: 'Specialized model for programming language tasks.' },
]

export default function Component() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')
  const [familyFilter, setFamilyFilter] = useState('')
  const [capabilityFilter, setCapabilityFilter] = useState('')
  const [selectedModel, setSelectedModel] = useState<typeof models[0] | null>(null)

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (sizeFilter === '' || model.size === sizeFilter) &&
    (familyFilter === '' || model.family === familyFilter) &&
    (capabilityFilter === '' || model.capabilities.includes(capabilityFilter))
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Ollama Model Hub</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search models..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sizes</SelectItem>
            <SelectItem value="Small">Small</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Large">Large</SelectItem>
          </SelectContent>
        </Select>
        <Select value={familyFilter} onValueChange={setFamilyFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Family" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Families</SelectItem>
            <SelectItem value="GPT">GPT</SelectItem>
            <SelectItem value="BERT">BERT</SelectItem>
            <SelectItem value="T5">T5</SelectItem>
            <SelectItem value="DALL-E">DALL-E</SelectItem>
          </SelectContent>
        </Select>
        <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Capability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Capabilities</SelectItem>
            <SelectItem value="Text Generation">Text Generation</SelectItem>
            <SelectItem value="Question Answering">Question Answering</SelectItem>
            <SelectItem value="Text Classification">Text Classification</SelectItem>
            <SelectItem value="Translation">Translation</SelectItem>
            <SelectItem value="Summarization">Summarization</SelectItem>
            <SelectItem value="Image Generation">Image Generation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map(model => (
          <div key={model.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">{model.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{model.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{model.size}</Badge>
              <Badge variant="secondary">{model.family}</Badge>
              {model.capabilities.map(capability => (
                <Badge key={capability} variant="outline">{capability}</Badge>
              ))}
            </div>
            <Button onClick={() => setSelectedModel(model)} className="w-full">
              Learn More
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={selectedModel !== null} onOpenChange={(open) => !open && setSelectedModel(null)}>
        <DialogContent>
          {selectedModel && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedModel.name}</DialogTitle>
                <DialogDescription>
                  <p className="mb-4">{selectedModel.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{selectedModel.size}</Badge>
                    <Badge variant="secondary">{selectedModel.family}</Badge>
                    {selectedModel.capabilities.map(capability => (
                      <Badge key={capability} variant="outline">{capability}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Additional information about the model, its performance, and use cases could be displayed here.
                  </p>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}