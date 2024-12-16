'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Settings, User, Bot, ChevronUp, ChevronDown, ImageIcon, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const samplers = [
  'Euler a',
  'Euler',
  'LMS',
  'Heun',
  'DPM',
  'DPM2 a',
  'DPM++ 2S a',
  'DPM++ 2M',
  'DPM ++ SDE',
  'DPM fast',
  'DPM adaptive',
  'LMS Karras',
  'DPM2 a Karras',
  'DPM++ 2S a Karras',
  'DPM++ 2M Karras',
  'DPM++ SDE Karras',
  'DDIM',
  'PLMS',
  'UniPC',
];

interface Message {
  type: 'user' | 'bot';
  content: string;
  negativePrompt?: string;
  image?: string;
  referenceImage?: string;
}

export function DiffusionRoute() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Advanced settings
  const [steps, setSteps] = useState(50);
  const [seed, setSeed] = useState(-1);
  const [samplerName, setSamplerName] = useState('Euler a');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [cfgScale, setCfgScale] = useState(7);
  const [restoreFaces, setRestoreFaces] = useState(false);
  const [enableHr, setEnableHr] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');
    setMessages(prev => [
      ...prev,
      { type: 'user', content: input, negativePrompt, referenceImage: referenceImage || undefined },
    ]);
    setInput('');
    setNegativePrompt('');
    setReferenceImage(null);

    try {
      // Replace this with your actual API call
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          negative_prompt: negativePrompt,
          steps,
          seed,
          sampler_name: samplerName,
          width,
          height,
          cfg_scale: cfgScale,
          restore_faces: restoreFaces,
          enable_hr: enableHr,
          reference_image: referenceImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { type: 'bot', content: input, negativePrompt, image: data.image },
      ]);
    } catch (err) {
      setError('An error occurred while generating the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 bg-background">
        <h1 className="text-2xl font-bold">AI Image Generator</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Advanced Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Customize your image generation parameters.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    className="col-span-2"
                    value={width}
                    onChange={e => setWidth(Number(e.target.value))}
                    min={64}
                    max={2048}
                    step={64}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    className="col-span-2"
                    value={height}
                    onChange={e => setHeight(Number(e.target.value))}
                    min={64}
                    max={2048}
                    step={64}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="steps">Steps</Label>
                  <Input
                    id="steps"
                    type="number"
                    className="col-span-2"
                    value={steps}
                    onChange={e => setSteps(Number(e.target.value))}
                    min={1}
                    max={150}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="seed">Seed</Label>
                  <Input
                    id="seed"
                    type="number"
                    className="col-span-2"
                    value={seed}
                    onChange={e => setSeed(Number(e.target.value))}
                    min={-1}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="cfgScale">CFG Scale</Label>
                  <Slider
                    id="cfgScale"
                    min={0}
                    max={30}
                    step={0.1}
                    value={[cfgScale]}
                    onValueChange={value => setCfgScale(value[0])}
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="sampler">Sampler</Label>
                  <Select value={samplerName} onValueChange={setSamplerName} className="col-span-2">
                    <SelectTrigger id="sampler">
                      <SelectValue placeholder="Select a sampler" />
                    </SelectTrigger>
                    <SelectContent>
                      {samplers.map(sampler => (
                        <SelectItem key={sampler} value={sampler}>
                          {sampler}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="restoreFaces"
                    checked={restoreFaces}
                    onCheckedChange={setRestoreFaces}
                  />
                  <Label htmlFor="restoreFaces">Restore Faces</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="enableHr" checked={enableHr} onCheckedChange={setEnableHr} />
                  <Label htmlFor="enableHr">Enable High Res</Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      <ScrollArea className="flex-grow p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <p className="text-sm font-medium">Prompt: {message.content}</p>
                {message.negativePrompt && (
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    Negative: {message.negativePrompt}
                  </p>
                )}
                {message.referenceImage && (
                  <img
                    src={message.referenceImage}
                    alt="Reference image"
                    className="mt-2 rounded-lg max-w-full h-auto max-h-48 object-contain"
                  />
                )}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Generated image"
                    className="mt-2 rounded-lg max-w-full h-auto"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <footer className="p-4 bg-background">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="pr-10 min-h-[100px] resize-none overflow-hidden"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {referenceImage && (
            <div className="relative inline-block">
              <img
                src={referenceImage}
                alt="Reference"
                className="mt-2 rounded-lg max-w-full h-auto max-h-48 object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => setReferenceImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowNegativePrompt(!showNegativePrompt)}
            >
              {showNegativePrompt ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide Negative Prompt
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show Negative Prompt
                </>
              )}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </Button>
          </div>
          {showNegativePrompt && (
            <Textarea
              value={negativePrompt}
              onChange={e => setNegativePrompt(e.target.value)}
              placeholder="Describe what you don't want in the image..."
              className="w-full resize-none"
            />
          )}
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </footer>
    </div>
  );
}
