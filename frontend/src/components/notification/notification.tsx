import { useNotifications } from '@/components/notification/notification-store.ts';
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"

export const Notifications = () => {
  const { notifications, dismissNotification } = useNotifications();
  const { toast } = useToast()

  return (
    <div
      aria-live="assertive"
      className="top-0 right-0 left-0 z-50 fixed inset-0 flex flex-col items-end sm:items-start space-y-4 px-4 py-6 sm:p-6 pointer-events-none"
    >
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
    </div>
  );
};
