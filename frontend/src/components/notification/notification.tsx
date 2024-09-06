import { Notification } from '@/components/notification/main.tsx';
import { useNotifications } from '@/components/notification/notification-store.ts';

export const Notifications = () => {
  const { notifications, dismissNotification } = useNotifications();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed top-0 left-0 right-0 inset-0 z-50 flex flex-col items-end space-y-4 px-4 py-6 sm:items-start sm:p-6"
    >
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
};
