import { useNotifications } from '@/components/notification/notification-store.ts';
import { useToast } from "@/hooks/use-toast"
import { useEffect } from 'react';

export const Notifications = () => {
  const { notifications, dismissNotification } = useNotifications();
  const { toast } = useToast()

  useEffect(() => {
    notifications.forEach(notification => {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
        onOpenChange: (open) => {
          if (!open) dismissNotification(notification.id);
        },
      })
    });
  }, [notifications]);

  return null;
};