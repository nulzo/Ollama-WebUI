import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Database, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { KnowledgeCard } from '@/features/knowledge/components/knowledge-card';
import { KnowledgeForm } from '@/features/knowledge/components/knowledge-form';
import { KnowledgeViewer } from '@/features/knowledge/components/knowledge-viewer';
import { Knowledge } from '@/features/knowledge/knowledge';
import { 
  useKnowledgeList, 
  useCreateKnowledge, 
  useUpdateKnowledge, 
  useDeleteKnowledge, 
  useUploadKnowledge 
} from '@/features/knowledge/api';
import { Head } from '@/components/helmet';

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: knowledgeList } = useKnowledgeList();
  const createKnowledge = useCreateKnowledge();
  const updateKnowledge = useUpdateKnowledge();
  const deleteKnowledge = useDeleteKnowledge();
  const uploadKnowledge = useUploadKnowledge();

  const filteredKnowledge =
    knowledgeList?.data && knowledgeList?.data?.length > 0
      ? knowledgeList?.data?.filter(knowledge =>
          knowledge.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleCreateKnowledge = () => {
    setSelectedKnowledge(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditKnowledge = (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge);
    setIsCreateDialogOpen(true);
  };

  const handleViewKnowledge = (knowledge: Knowledge) => {
    setSelectedKnowledge(knowledge);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (values.file) {
        // File upload
        await uploadKnowledge.mutateAsync({
          file: values.file,
          name: values.name,
        });
        toast({
          title: 'Knowledge uploaded',
          description: 'The file was successfully uploaded and processed.',
        });
      } else if (selectedKnowledge) {
        // Update existing knowledge
        await updateKnowledge.mutateAsync({
          knowledgeId: selectedKnowledge.id,
          data: values,
        });
        toast({
          title: 'Knowledge updated',
          description: 'The knowledge was successfully updated.',
        });
      } else {
        // Create new knowledge
        await createKnowledge.mutateAsync({
          data: values,
        });
        toast({
          title: 'Knowledge created',
          description: 'The knowledge was successfully created.',
        });
      }
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error saving knowledge:', error);
      toast({
        title: 'Error',
        description: 'Failed to save knowledge.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (knowledge: Knowledge) => {
    try {
      await deleteKnowledge.mutateAsync({ knowledgeId: knowledge.id });
      toast({
        title: 'Knowledge deleted',
        description: 'The knowledge was successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete knowledge.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Head title="Knowledge Base" description="Manage your knowledge base for RAG" />
      
      <div className="flex-1 overflow-auto">
        <div className="px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-bold text-4xl">Knowledge Base</h1>
              <p className="text-muted-foreground text-lg">
                Upload documents or add text to create a knowledge base for your AI to reference
              </p>
            </div>
            <Button onClick={handleCreateKnowledge} className="gap-2">
              <Plus className="size-4" />
              Add Knowledge
            </Button>
          </div>

          <div className="relative mb-8">
            <Input
              type="text"
              placeholder="Search knowledge..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="top-1/2 left-3 absolute size-4 text-muted-foreground -translate-y-1/2 transform" />
          </div>

          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredKnowledge && filteredKnowledge?.length > 0 ? (
              filteredKnowledge?.map(knowledge => (
                <KnowledgeCard
                  key={knowledge.id}
                  knowledge={knowledge}
                  onEdit={handleEditKnowledge}
                  onDelete={() => handleDelete(knowledge)}
                  onView={() => handleViewKnowledge(knowledge)}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col justify-center items-center bg-transparent p-6 border border-muted-foreground border-dashed rounded-lg"
              >
                <div className="flex flex-col justify-center items-center">
                  <Database className="mb-4 size-12 text-muted-foreground" />
                  <h3 className="mx-auto mb-4 font-semibold text-muted-foreground text-lg text-center">No knowledge found</h3>
                  <div className="mx-auto mb-4 text-muted-foreground text-sm text-center">
                    Upload documents or add text to create a knowledge base for your AI to reference.
                  </div>
                  <Button onClick={handleCreateKnowledge} className="gap-2">
                    <Plus className="size-4" />
                    Add Knowledge
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedKnowledge ? 'Edit Knowledge' : 'Add Knowledge'}</DialogTitle>
          </DialogHeader>
          <KnowledgeForm
            knowledge={selectedKnowledge as Knowledge}
            onSubmit={handleSubmit}
            isUploading={!selectedKnowledge}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Knowledge</DialogTitle>
          </DialogHeader>
          {selectedKnowledge && <KnowledgeViewer knowledge={selectedKnowledge} />}
        </DialogContent>
      </Dialog>
    </div>
  );
} 