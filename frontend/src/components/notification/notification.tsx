import { useNotifications } from '@/components/notification/notification-store.ts';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const Notifications = () => {
  const { notifications, dismissNotification } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    notifications.forEach(notification => {
      const { dismiss } = toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
        duration: 5000,
        onOpenChange: open => {
          if (!open) {
            dismissNotification(notification.id);
          }
        },
      });

      // Set a timeout to dismiss the notification when the toast expires
      setTimeout(() => {
        dismiss();
        dismissNotification(notification.id);
      }, 6000);
    });
  }, [notifications, dismissNotification, toast]);

  return null;
};
