import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { ERROR_401_DEFAULT, ERROR_403_DEFAULT, ERROR_404_DEFAULT, ERROR_500_DEFAULT } from '@/const/messages';
  
  interface ErrorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    error: {
      status?: number;
      message?: string;
    };
  }
  
  const getErrorMessage = (status?: number, message?: string) => {
    if (message) return message;
    
    switch (status) {
      case 401:
        return ERROR_401_DEFAULT();
      case 403:
        return ERROR_403_DEFAULT();
      case 404:
        return ERROR_404_DEFAULT();
      case 500:
        return ERROR_500_DEFAULT();
      default:
        return 'An unexpected error occurred';
    }
  };
  
  export function ErrorDialog({ open, onOpenChange, error }: ErrorDialogProps) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error {error.status}</DialogTitle>
            <DialogDescription className="text-destructive">
              {getErrorMessage(error.status, error.message)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }