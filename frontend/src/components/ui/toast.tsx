// frontend/src/components/ui/toast.tsx
import * as React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:right-0 sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'relative flex justify-between items-center space-x-2 shadow-lg p-4 border rounded-lg w-full overflow-hidden pointer-events-auto group',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-success bg-success text-success-foreground',
        warning: 'border-yellow-500 bg-yellow-500 text-white',
        info: 'border-blue-500 bg-blue-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      duration?: number;
      onOpenChange?: (open: boolean) => void;
    }
>(({ className, variant, duration = 5000, onOpenChange, ...props }, ref) => {
  const [progress, setProgress] = React.useState(0);
  const progressRef = React.useRef<number>(0);
  const progressTimerRef = React.useRef<number>();

  React.useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;

      if (newProgress <= 0) {
        setProgress(0);
        onOpenChange?.(false);
        return;
      }

      progressRef.current = newProgress;
      setProgress(newProgress);
      progressTimerRef.current = window.requestAnimationFrame(updateProgress);
    };

    progressTimerRef.current = window.requestAnimationFrame(updateProgress);

    return () => {
      if (progressTimerRef.current) {
        window.cancelAnimationFrame(progressTimerRef.current);
      }
    };
  }, [duration, onOpenChange]);

  return (
    <ToastPrimitives.Root ref={ref} {...props} onOpenChange={onOpenChange} asChild>
      <motion.div
        layout
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.8 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 300,
        }}
        className={cn(toastVariants({ variant }), className, 'relative')}
      >
        {props.children}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-1 w-full bg-foreground/20",
            variant === 'destructive' && "bg-destructive-foreground/20",
            variant === 'success' && "bg-success/20",
            variant === 'warning' && "bg-yellow-100/20",
            variant === 'info' && "bg-blue-100/20"
          )}
        >
          <div
            className={cn(
              "h-full bg-foreground",
              variant === 'destructive' && "bg-destructive-foreground",
              variant === 'success' && "bg-success",
              variant === 'warning' && "bg-yellow-100",
              variant === 'info' && "bg-blue-100"
            )}
            style={{
              width: `${progress}%`,
              transition: 'width linear',
              transitionDuration: `${duration}ms`,
            }}
          />
        </div>
      </motion.div>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-hidden focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 hover:group-[.destructive]:border-destructive/30 hover:group-[.destructive]:bg-destructive hover:group-[.destructive]:text-destructive-foreground focus:group-[.destructive]:ring-destructive',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-hidden focus:ring-1 group-hover:opacity-100',
      'group-[.destructive]:text-red-300 hover:group-[.destructive]:text-red-50 focus:group-[.destructive]:ring-red-400 focus:group-[.destructive]:ring-offset-red-600',
      'group-[.success]:text-green-100 hover:group-[.success]:text-green-50 focus:group-[.success]:ring-green-400 focus:group-[.success]:ring-offset-green-600',
      'group-[.warning]:text-yellow-100 hover:group-[.warning]:text-yellow-50 focus:group-[.warning]:ring-yellow-400 focus:group-[.warning]:ring-offset-yellow-600',
      'group-[.info]:text-blue-100 hover:group-[.info]:text-blue-50 focus:group-[.info]:ring-blue-400 focus:group-[.info]:ring-offset-blue-600',
      className
    )}
    toast-close=""
    {...props}
  >
    <Cross2Icon className="w-4 h-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast> & {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
};

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
