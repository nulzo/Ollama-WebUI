import { useNotifications } from '@/components/notification/notification-store.ts';
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"

export const Notifications = () => {
  const { notifications, dismissNotification } = useNotifications();
  const { toast } = useToast()

  return (
    <>
      {notifications.map(notification => (
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: notification.title,
              description: notification.message,
              action: (
                <ToastAction onClick={() => dismissNotification(notification.id)} altText="Close notification">Close</ToastAction>
              ),
            })
          }}
        >
          {notification.title}
        </Button>
      ))}
    </>
  );
};
