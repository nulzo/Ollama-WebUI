import { Info, CircleAlert, CircleX, CircleCheck, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect } from 'react';

const icons = {
  info: <Info className="size-4 text-blue-500" aria-hidden="true" />,
  success: <CircleCheck className="size-4 text-green-500" aria-hidden="true" />,
  warning: <CircleAlert className="size-4 text-yellow-500" aria-hidden="true" />,
  error: <CircleX className="size-4 text-red-500" aria-hidden="true" />,
};

const borders = {
  info: 'border border-blue-400',
  success: 'border border-green-500',
  warning: 'border border-yellow-500',
  error: 'border border-red-500',
};

export type NotificationProps = {
  notification: {
    id: string;
    type: keyof typeof icons;
    title: string;
    message?: string;
  };
  onDismiss: (id: string) => void;
};

export const Notification = ({
  notification: { id, type, title, message },
  onDismiss,
}: NotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);
  return (
    <div className="flex animate w-full flex-col items-center space-y-4 sm:items-end">
      <div
        className={`${borders[type]} pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-background/50 backdrop-blur transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full`}
      >
        <div className="p-4 relative" role="alert" aria-label={title}>
          <div className="flex items-start">
            <div className="shrink-0">{icons[type]}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold [&+div]:text-xs">{title}</p>
              <p className="text-sm opacity-90">{message}</p>
            </div>
            <div className="flex shrink-0 absolute right-2 top-2">
              <Button
                size="icon"
                variant="ghost"
                className="inline-flex rounded-md bg-background"
                onClick={() => {
                  onDismiss(id);
                }}
              >
                <span className="sr-only">Close</span>
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
