import { useState } from 'react';
import { useToast } from '@/hooks/use-toast.ts';

export function useClipboard({ timeout = 2000 } = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyTimeout, setCopyTimeout] = useState<number | null>(null);
  const { toast } = useToast();

  const handleCopyResult = (value: boolean) => {
    window.clearTimeout(copyTimeout!);
    setCopyTimeout(window.setTimeout(() => setCopied(false), timeout));
    setCopied(value);
    
    if (value) {
      toast({
        variant: "success",
        title: "Copied to clipboard",
        description: "Content has been copied successfully",
      });
    }
  };

  const copy = (valueToCopy: any) => {
    if ('clipboard' in navigator) {
      navigator.clipboard
        .writeText(valueToCopy)
        .then(() => handleCopyResult(true))
        .catch(err => {
          setError(err);
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "The content could not be copied to clipboard",
          });
        });
    } else {
      const err = new Error('useClipboard: navigator.clipboard is not supported');
      setError(err);
      toast({
        variant: "destructive",
        title: "Browser not supported",
        description: "Your browser doesn't support clipboard operations",
      });
    }
  };

  const reset = () => {
    setCopied(false);
    setError(null);
    window.clearTimeout(copyTimeout!);
  };

  return { copy, reset, error, copied };
}
