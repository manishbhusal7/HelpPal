import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AlertsProps {
  userId: number | undefined;
}

export default function Alerts({ userId }: AlertsProps) {
  const { toast } = useToast();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/notifications`],
    enabled: !!userId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/notifications/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/notifications`] });
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would be a separate API endpoint
      // For now, we'll mark each notification as read individually
      if (!notifications) return null;
      
      const unreadNotifications = notifications.filter((notification: any) => !notification.isRead);
      const promises = unreadNotifications.map((notification: any) => 
        apiRequest('PATCH', `/api/notifications/${notification.id}/read`, {})
      );
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/notifications`] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "warning":
        return <span className="material-icons text-accent-500">warning</span>;
      case "success":
        return <span className="material-icons text-success-500">check_circle</span>;
      case "info":
      default:
        return <span className="material-icons text-primary-500">info</span>;
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case "warning":
        return <Badge variant="outline" className="bg-orange-50 text-accent-500 border-accent-200">Warning</Badge>;
      case "success":
        return <Badge variant="outline" className="bg-green-50 text-success-500 border-success-200">Success</Badge>;
      case "info":
      default:
        return <Badge variant="outline" className="bg-blue-50 text-primary-500 border-primary-200">Info</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Alerts</h2>
          <p className="text-sm text-neutral-500">Please wait...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications ? notifications.filter((n: any) => !n.isRead).length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Notifications & Alerts</h1>
          <p className="text-neutral-500">Stay informed about changes to your credit profile</p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            variant="outline"
          >
            {markAllAsReadMutation.isPending ? "Marking..." : "Mark All as Read"}
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {notifications && notifications.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification: any) => (
                    <li key={notification.id} className="p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIconForType(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <p className={`text-sm font-medium ${notification.isRead ? 'text-neutral-600' : 'text-neutral-900'}`}>
                                {notification.message}
                              </p>
                              {!notification.isRead && (
                                <span className="inline-block h-2 w-2 rounded-full bg-primary-500"></span>
                              )}
                            </div>
                            {getBadgeForType(notification.type)}
                          </div>
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
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div className="py-12 text-center bg-white rounded-lg shadow">
              <span className="material-icons text-neutral-400 text-4xl mb-2">notifications_off</span>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">No Notifications</h3>
              <p className="text-sm text-neutral-500">You don't have any notifications yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="unread">
          {notifications && notifications.filter((n: any) => !n.isRead).length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                  {notifications
                    .filter((notification: any) => !notification.isRead)
                    .map((notification: any) => (
                      <li key={notification.id} className="p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIconForType(notification.type)}
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-neutral-900">
                                  {notification.message}
                                </p>
                                <span className="inline-block h-2 w-2 rounded-full bg-primary-500"></span>
                              </div>
                              {getBadgeForType(notification.type)}
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-neutral-500">{getTimeAgo(notification.createdAt)}</span>
                              <button 
                                className="text-xs text-primary-600 hover:text-primary-700"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                disabled={markAsReadMutation.isPending}
                              >
                                Mark as read
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div className="py-12 text-center bg-white rounded-lg shadow">
              <span className="material-icons text-success-500 text-4xl mb-2">task_alt</span>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">All Caught Up!</h3>
              <p className="text-sm text-neutral-500">You don't have any unread notifications.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you want to receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-900">Credit Score Alerts</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Credit score changes</span>
                  <span className="text-xs text-neutral-500">Get notified when your credit score changes</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Score milestones</span>
                  <span className="text-xs text-neutral-500">Alerts when you reach a new credit score range</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-900">Credit Utilization Alerts</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Utilization threshold alerts</span>
                  <span className="text-xs text-neutral-500">Alert when utilization exceeds 30%</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Payment reminders</span>
                  <span className="text-xs text-neutral-500">Receive reminders before payment due dates</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-neutral-900">Income Monitoring</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Income changes</span>
                  <span className="text-xs text-neutral-500">Alert when your income pattern changes</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Missed income alerts</span>
                  <span className="text-xs text-neutral-500">Notify when expected income is not detected</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
