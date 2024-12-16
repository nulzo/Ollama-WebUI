import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Save } from 'lucide-react';
import Editor, { loader } from '@monaco-editor/react';
import { useTheme } from '@/components/theme/theme-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEditorTheme } from '@/style/editor-themes';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import { useCreateTool, useUpdateTool, useTool } from '@/features/tools/api';

const DEFAULT_FUNCTION_TEMPLATE = `# Ollama Function Calling requires Google-style docstrings for proper function parsing
# A Google-style docstring includes:
#   1. A brief description of the function
#   2. Args section describing each parameter
#   3. Returns section describing the return value
#   4. Optional: Raises section for exceptions
#   5. Optional: Examples section

def add_two_numbers(a: int, b: int) -> int:
    """
    Add two numbers together.

    Args:
        a: The first integer number to add
        b: The second integer number to add

    Returns:
        int: The sum of the two numbers

    Raises:
        TypeError: If either a or b are not integers

    Examples:
        >>> add_two_numbers(1, 2)
        3
        >>> add_two_numbers(10, 20)
        30
    """
    if not isinstance(a, int) or not isinstance(b, int):
        raise TypeError("Both arguments must be integers")
    
    return a + b`;

export function ToolEditor() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, color } = useTheme();
  const { data: tool } = useTool({ toolId: toolId || '' });
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();

  const [language, setLanguage] = useState('python');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [functionName, setFunctionName] = useState('');
  const [monacoTheme, setMonacoTheme] = useState('custom-light');
  const [editorContent, setEditorContent] = useState(DEFAULT_FUNCTION_TEMPLATE);

  // Load existing tool data if editing
  useEffect(() => {
    if (tool) {
      setEditorContent(tool.function_content);
      setLanguage(tool.language);
      setFunctionName(tool.name);
    }
  }, [tool]);

  const handleSave = async () => {
    try {
      if (!functionName) {
        toast({
          title: 'Validation Error',
          description: 'Function name is required',
          variant: 'destructive',
        });
        return;
      }

      const formData = {
        name: functionName,
        description: 'Function for LLM function calling',
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
        toast({
          title: 'Success',
          description: 'Function updated successfully',
        });
      } else {
        await createTool.mutateAsync({
          data: formData,
        });
        toast({
          title: 'Success',
          description: 'Function created successfully',
        });
      }

      setIsSaveDialogOpen(false);
      navigate('/tools');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save function',
        variant: 'destructive',
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Set the language based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'py':
          setLanguage('python');
          break;
        case 'ts':
          setLanguage('typescript');
          break;
        case 'js':
          setLanguage('javascript');
          break;
      }

      // Read and set file contents
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setEditorContent(content);
          setFunctionName(file.name.split('.')[0]); // Set function name to filename without extension
        }
      };
      reader.readAsText(file);
    }
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
    loader.init().then(monaco => {
      // Define both themes with the current color
      monaco.editor.defineTheme('custom-light', createEditorTheme(false, color));
      monaco.editor.defineTheme('custom-dark', createEditorTheme(true, color));

      // Set the current theme
      setMonacoTheme(theme === 'dark' ? 'custom-dark' : 'custom-light');
    });
  }, [theme, color]);

  return (
    <div className="p-12 w-full h-screen">
      <div className="flex flex-col w-full h-full">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="font-bold text-4xl">{toolId ? 'Edit Function' : 'Create Function'}</h1>
          <h3 className="text-lg text-muted-foreground">
            {toolId
              ? 'Modify an existing function'
              : 'Create a new function for LLM function calling'}
          </h3>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Controls bar */}
          <div className="flex justify-between items-center mb-4 gap-2">
            <div className="flex gap-2">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                </SelectContent>
              </Select>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button
                  variant="outline"
                  className={`gap-2 ${isDragActive ? 'border-primary' : ''}`}
                >
                  <Upload className="h-4 w-4" />
                  {isDragActive ? 'Drop file here' : 'Upload File'}
                  <span className="sr-only">Upload file</span>
                </Button>
              </div>
            </div>
            <Button className="gap-2" onClick={() => setIsSaveDialogOpen(true)}>
              <Save className="h-4 w-4" />
              Save Function
            </Button>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden rounded-lg border">
            <Editor
              height="100%"
              defaultLanguage="python"
              language={language}
              theme={monacoTheme}
              value={editorContent}
              onChange={value => setEditorContent(value || '')}
              options={{
                minimap: { enabled: true },
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
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Function Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Function</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="function-name">Function Name</Label>
            <Input
              id="function-name"
              value={functionName}
              onChange={e => setFunctionName(e.target.value)}
              placeholder="Enter function name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
