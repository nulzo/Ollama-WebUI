import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Code, Info, Play, Copy, CheckCircle2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from '@/components/theme/theme-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useCreateTool, useUpdateTool, useTool } from '@/features/tools/api';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ToolEditorProps {
  toolId?: string;
  onClose?: () => void;
}

// Example templates for different languages
const FUNCTION_TEMPLATES = {
  python: `def get_weather(city: str, units: str = "metric") -> str:
    """
    Get the current weather for a city.
    
    Args:
        city: The name of the city to get weather for
        units: The units to use (metric or imperial)
        
    Returns:
        A string with the weather information
        
    Examples:
        >>> get_weather("London", "metric")
        "Current weather in London: 15°C, Cloudy"
    """
    # In a real implementation, you would call a weather API
    # This is just a mock example
    return f"Current weather in {city}: 15°C, Cloudy"`,

  javascript: `/**
 * Calculate the distance between two points.
 * 
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} - The distance between the points
 * 
 * @example
 * // Returns 5
 * calculateDistance(0, 0, 3, 4)
 */
function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}`,

  typescript: `/**
 * Search for products in a catalog.
 * 
 * @param {string} query - The search query
 * @param {string} category - Product category to filter by
 * @param {number} limit - Maximum number of results to return
 * @returns {Array<object>} - Array of matching products
 * 
 * @example
 * // Returns array of phone products
 * searchProducts("iphone", "electronics", 5)
 */
function searchProducts(query: string, category: string, limit: number = 10): object[] {
  // In a real implementation, you would search a database
  // This is just a mock example
  return [
    { id: 1, name: "Example Product", price: 99.99 }
  ];
}`
};

export function ToolEditor({ toolId, onClose }: ToolEditorProps) {
  const { toast } = useToast();
  const { theme } = useTheme();
  const { data: tool, isLoading: isToolLoading } = toolId ? useTool({ toolId }) : { data: undefined, isLoading: false };
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();

  // Initialize with Python as the default language
  const [language, setLanguage] = useState<'python' | 'javascript' | 'typescript'>('python');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Initialize with the default template for the selected language
  const [editorContent, setEditorContent] = useState(() => FUNCTION_TEMPLATES.python);
  const [isEnabled, setIsEnabled] = useState(true);
  const [parameters, setParameters] = useState<any>({});
  const [returns, setReturns] = useState<any>({});
  const [docstring, setDocstring] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [previewArgs, setPreviewArgs] = useState('');
  const [previewResult, setPreviewResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  // Load existing tool data if editing
  useEffect(() => {
    if (tool) {
      setEditorContent(tool.function_content);
      setLanguage(tool.language);
      setName(tool.name);
      setDescription(tool.description);
      setIsEnabled(tool.is_enabled);
      setParameters(tool.parameters || {});
      setReturns(tool.returns || {});
      setDocstring(tool.docstring || '');
    }
  }, [tool]);

  // Update editor content when language changes (for new functions)
  useEffect(() => {
    if (!toolId && !tool) {
      setEditorContent(FUNCTION_TEMPLATES[language as keyof typeof FUNCTION_TEMPLATES]);
    }
  }, [language, toolId, tool]);

  // Update the useEffect that handles language changes
  useEffect(() => {
    // Only set default template for new functions (not when editing)
    if (!toolId) {
      const template = FUNCTION_TEMPLATES[language as keyof typeof FUNCTION_TEMPLATES] || '';
      console.log('Setting default template for language:', language, template);
      setEditorContent(template);
    }
  }, [language, toolId]);

  // Add a new useEffect to handle editor initialization
  useEffect(() => {
    // Set initial content when component mounts
    if (!toolId && !editorContent) {
      const template = FUNCTION_TEMPLATES[language as keyof typeof FUNCTION_TEMPLATES] || '';
      console.log('Setting initial template:', template);
      setEditorContent(template);
    }
  }, []);

  // Parse function content to extract parameters and docstring
  const parseFunction = useCallback((content: string) => {
    try {
      // Simple regex-based parsing for demonstration
      // In a production environment, you might want to use a proper parser
      
      // Extract function name
      const nameMatch = content.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (nameMatch && nameMatch[1]) {
        setName(nameMatch[1]);
      }
      
      // Extract parameters
      const paramsMatch = content.match(/def\s+[a-zA-Z0-9_]+\s*\((.*?)\)/);
      if (paramsMatch && paramsMatch[1]) {
        const paramsList = paramsMatch[1].split(',').map(p => p.trim()).filter(p => p);
        
        const extractedParams: Record<string, any> = {
          type: 'object',
          required: [],
          properties: {}
        };
        
        paramsList.forEach(param => {
          // Handle param with type annotation
          const paramParts = param.split(':').map(p => p.trim());
          const paramName = paramParts[0];
          
          if (paramName && !paramName.includes('=')) {
            extractedParams.required.push(paramName);
            
            let paramType = 'string';
            if (paramParts.length > 1) {
              // Map Python types to JSON schema types
              const typeMap: Record<string, string> = {
                'str': 'string',
                'int': 'integer',
                'float': 'number',
                'bool': 'boolean',
                'list': 'array',
                'dict': 'object',
              };
              
              // Extract the type name
              const typeMatch = paramParts[1].match(/([a-zA-Z0-9_]+)/);
              if (typeMatch && typeMatch[1] && typeMap[typeMatch[1]]) {
                paramType = typeMap[typeMatch[1]];
              }
            }
            
            extractedParams.properties[paramName] = { type: paramType };
          }
        });
        
        setParameters(extractedParams);

        // Generate preview arguments
        if (extractedParams.properties) {
          const args: Record<string, any> = {};
          Object.entries(extractedParams.properties).forEach(([key, value]: [string, any]) => {
            switch (value.type) {
              case 'string':
                args[key] = 'example';
                break;
              case 'integer':
                args[key] = 42;
                break;
              case 'number':
                args[key] = 3.14;
                break;
              case 'boolean':
                args[key] = true;
                break;
              case 'array':
                args[key] = [];
                break;
              case 'object':
                args[key] = {};
                break;
              default:
                args[key] = null;
            }
          });
          setPreviewArgs(JSON.stringify(args, null, 2));
          
          // Generate mock result based on return type
          if (returns.type) {
            switch (returns.type) {
              case 'string':
                setPreviewResult('"Example result"');
                break;
              case 'integer':
                setPreviewResult('42');
                break;
              case 'number':
                setPreviewResult('3.14');
                break;
              case 'boolean':
                setPreviewResult('true');
                break;
              case 'array':
                setPreviewResult('[]');
                break;
              case 'object':
                setPreviewResult('{}');
                break;
              default:
                setPreviewResult('null');
            }
          }
        }
      }
      
      // Extract docstring
      const docstringMatch = content.match(/"""([\s\S]*?)"""/);
      if (docstringMatch && docstringMatch[1]) {
        const extractedDocstring = docstringMatch[1].trim();
        setDocstring(extractedDocstring);
        
        // Try to extract description from docstring
        const firstLine = extractedDocstring.split('\n')[0].trim();
        if (firstLine) {
          setDescription(firstLine);
        }
      }
      
      // Extract return type
      const returnMatch = content.match(/def\s+[a-zA-Z0-9_]+\s*\(.*?\)\s*->\s*([a-zA-Z0-9_]+)/);
      if (returnMatch && returnMatch[1]) {
        const returnType = returnMatch[1].trim();
        const typeMap: Record<string, string> = {
          'str': 'string',
          'int': 'integer',
          'float': 'number',
          'bool': 'boolean',
          'list': 'array',
          'dict': 'object',
        };
        
        setReturns({
          type: typeMap[returnType] || 'string'
        });
      }
    } catch (error) {
      console.error('Error parsing function:', error);
    }
  }, [returns.type]);

  // Parse function when editor content changes
  useEffect(() => {
    if (editorContent) {
      parseFunction(editorContent);
    }
  }, [editorContent, parseFunction]);

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
        docstring,
        parameters,
        returns,
        is_enabled: isEnabled,
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

      // Call onClose if provided
      if (onClose) {
        onClose();
      }
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editorContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle editor ready state
  const handleEditorDidMount = () => {
    setEditorReady(true);
  };

  return (
    <Card className="w-full border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">
              {toolId ? 'Edit Function' : 'Create Function'}
            </CardTitle>
            <CardDescription>
              Define a function that can be called by AI models
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="is-enabled" 
              checked={isEnabled} 
              onCheckedChange={setIsEnabled} 
            />
            <Label htmlFor="is-enabled" className="text-sm">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="mb-2 block">
              Function Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="get_weather"
            />
          </div>
          <div>
            <Label htmlFor="language" className="mb-2 block">
              Language
            </Label>
            <Select value={language} onValueChange={value => setLanguage(value as any)}>
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

        <div>
          <Label htmlFor="description" className="mb-2 block">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Get the current weather for a city"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="editor" className="block">
              Function Code
            </Label>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="gap-1.5"
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy function code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="border rounded-md overflow-hidden">
            <Editor
              height="400px"
              language={language}
              value={editorContent}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              onChange={value => setEditorContent(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                renderLineHighlight: 'all',
                formatOnPaste: true,
                formatOnType: true,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 10,
                  horizontalScrollbarSize: 10,
                }
              }}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="editor" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {language}
              </Badge>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-2 text-xs ${isDragActive ? 'border-primary' : ''}`}
                >
                  <Upload className="w-3 h-3" />
                  {isDragActive ? 'Drop file' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
          
          <TabsContent value="editor" className="mt-0">
            <div className="border rounded-lg overflow-hidden h-[400px]">
              <Editor
                height="100%"
                language={language}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                value={editorContent}
                defaultValue={FUNCTION_TEMPLATES[language as keyof typeof FUNCTION_TEMPLATES]}
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
                onMount={handleEditorDidMount}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="border rounded-lg p-4 h-[400px] overflow-auto bg-muted/20">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">How the AI will call your function:</h3>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{`${name}(${Object.keys(parameters.properties || {}).join(', ')})`}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Example arguments:</h3>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{previewArgs || '{}'}</pre>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Expected return value:</h3>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                    <pre>{previewResult || 'null'}</pre>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Function Calling Tips
                  </h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use clear parameter names and types</li>
                    <li>• Include a detailed docstring with examples</li>
                    <li>• Return values that are easy for the AI to process</li>
                    <li>• Keep your function focused on a single task</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {toolId ? 'Update' : 'Create'} Function
        </Button>
      </CardFooter>
    </Card>
  );
}