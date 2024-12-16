import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { AnimatePresence } from 'framer-motion';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <div className="right-0 sm:right-0 bottom-0 sm:bottom-0 z-[100] fixed flex sm:flex-col flex-col-reverse p-4 w-full md:max-w-[420px] max-h-screen">
        <AnimatePresence mode="sync" initial={false}>
          {toasts.map(({ id, title, description, action, duration, ...props }) => (
            <Toast key={id} duration={duration} {...props}>
              <div className="gap-1 grid">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {action}
              <ToastClose />
            </Toast>
          ))}
        </AnimatePresence>
      </div>
      <ToastViewport />
    </ToastProvider>
  );
}
