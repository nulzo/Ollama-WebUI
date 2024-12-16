import { useTools, useDeleteTool } from '@/features/tools/api';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export function ToolsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: tools } = useTools();
  const deleteTool = useDeleteTool();

  const handleDelete = async (toolId: string) => {
    try {
      await deleteTool.mutateAsync({ toolId });
      toast({
        title: 'Tool deleted',
        description: 'The tool was successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tool.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-12 w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-bold text-4xl">Functions</h1>
          <h3 className="text-lg text-muted-foreground">Manage your LLM function calls.</h3>
        </div>
        <Button onClick={() => navigate('/tools/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Function
        </Button>
      </div>

      <div className="grid gap-4">
        {tools?.results?.map(tool => (
          <div key={tool.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{tool.name}</h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <span className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                {tool.language}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/tools/${tool.id}`)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(tool.id)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
