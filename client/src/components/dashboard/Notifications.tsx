import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface NotificationsProps {
  userId: number | undefined;
}

export default function Notifications({ userId }: NotificationsProps) {
  const { data: notifications, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/notifications`],
    enabled: !!userId
  });
  
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/notifications`] });
    }
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getIconForType = (type: string, isRead: boolean) => {
    if (isRead) {
      return <span className="material-icons text-neutral-400">notifications</span>;
    }
    
    switch (type) {
      case "warning":
        return <span className="material-icons text-accent-500">notifications</span>;
      case "success":
        return <span className="material-icons text-success-500">notifications</span>;
      case "info":
      default:
        return <span className="material-icons text-primary-500">notifications</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow animate-pulse">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="h-5 w-40 bg-neutral-200 rounded mb-2"></div>
          <div className="h-4 w-60 bg-neutral-200 rounded"></div>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-3">
                <div className="flex items-start">
                  <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 w-full bg-neutral-200 rounded mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 w-20 bg-neutral-200 rounded"></div>
                      <div className="h-3 w-24 bg-neutral-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <div className="h-4 w-36 bg-neutral-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Notifications</h2>
        <p className="text-sm text-neutral-500">Updates about your credit profile</p>
      </div>
      
      <div className="p-4">
        {notifications && notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.slice(0, 4).map((notification: any) => (
              <li key={notification.id} className="py-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getIconForType(notification.type, notification.isRead)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-neutral-900">{notification.message}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{getTimeAgo(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <button 
                          className="text-xs text-primary-600 hover:text-primary-700"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          Mark as read
                        </button>
                      )}
                      {notification.message.includes("report") && (
                        <button className="text-xs text-primary-600 hover:text-primary-700">
                          View report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-6 text-center">
            <span className="material-icons text-neutral-400 text-4xl mb-2">notifications_off</span>
            <p className="text-sm text-neutral-500">No notifications at this time.</p>
          </div>
        )}
        
        {notifications && notifications.length > 4 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-primary-600 hover:text-primary-700">
              View all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
