import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@/components/theme/theme-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useCreateTool, useUpdateTool, useTool } from '@/features/tools/api';
import { Textarea } from '@/components/ui/textarea';

interface ToolEditorProps {
  toolId?: string;
  onClose?: () => void;
}

export function ToolEditor({ toolId, onClose }: ToolEditorProps) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const { data: tool } = useTool({ toolId: toolId || '' });
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();

  const [language, setLanguage] = useState('python');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monacoTheme, setMonacoTheme] = useState('custom-light');
  const [editorContent, setEditorContent] = useState(DEFAULT_FUNCTION_TEMPLATE);

  // Load existing tool data if editing
  useEffect(() => {
    if (tool) {
      setEditorContent(tool.function_content);
      setLanguage(tool.language);
      setName(tool.name);
      setDescription(tool.description);
    }
  }, [tool]);

  const handleSave = async () => {
    try {
      if (!name || !editorContent || !language) {
        toast({
          title: 'Validation Error',
          description: 'All fields are required',
          variant: 'destructive',
        });
        return;
      }

      const formData = {
        name,
        description,
        function_content: editorContent,
        language: language as 'python' | 'javascript' | 'typescript',
        docstring: '',
        parameters: {},
        returns: {},
        is_enabled: true,
      };

      if (toolId) {
        await updateTool.mutateAsync({
          toolId,
          data: formData,
        });
      } else {
        await createTool.mutateAsync({
          data: formData,
        });
      }

      toast({
        title: `Function ${toolId ? 'updated' : 'created'}`,
        description: `The function was successfully ${toolId ? 'updated' : 'created'}.`,
      });

      onClose?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${toolId ? 'update' : 'create'} function.`,
        variant: 'destructive',
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Set language based on file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'py':
        setLanguage('python');
        break;
      case 'js':
        setLanguage('javascript');
        break;
      case 'ts':
        setLanguage('typescript');
        break;
    }

    // Read and set file contents
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setEditorContent(content);
        setName(file.name.split('.')[0]); // Set name to filename without extension
      }
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py'],
      'text/typescript': ['.ts'],
      'text/javascript': ['.js'],
    },
    multiple: false,
  });

  useEffect(() => {
    setMonacoTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');
  }, [theme]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter function name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter function description"
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label>Function Content</Label>
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 ${isDragActive ? 'border-primary' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {isDragActive ? 'Drop file here' : 'Upload'}
            </Button>
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden h-[400px]">
          <Editor
            height="100%"
            language={language}
            theme={monacoTheme}
            value={editorContent}
            onChange={value => setEditorContent(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              hideCursorInOverviewRuler: true,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 3,
                horizontalScrollbarSize: 3,
              },
              overviewRulerBorder: false,
              fontFamily: "'Geist Mono', monospace",
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {toolId ? 'Update' : 'Create'} Function
        </Button>
      </div>
    </div>
  );
}

const DEFAULT_FUNCTION_TEMPLATE = `def example_function(param1: str, param2: int) -> str:
    """
    Brief description of what the function does.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value

    Examples:
        >>> example_function("test", 123)
        "test 123"
    """
    return f"{param1} {param2}"`;