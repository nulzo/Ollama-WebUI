import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StreamingErrorProps {
  error: string;
  onRetry: () => void;
}

export const StreamingError = ({ error, onRetry }: StreamingErrorProps) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p>{error}</p>
        <button 
          onClick={onRetry}
          className="text-sm underline mt-2"
        >
          Retry
        </button>
      </AlertDescription>
    </Alert>
  );
};