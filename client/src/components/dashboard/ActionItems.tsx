import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ActionItemsProps {
  userId: number | undefined;
}

export default function ActionItems({ userId }: ActionItemsProps) {
  const { toast } = useToast();
  
  const { data: actionItems, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/action-items`],
    enabled: !!userId
  });
  
  const completeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/action-items/${id}/complete`, {});
    },
    onSuccess: () => {
      toast({
        title: "Action completed",
        description: "The action item has been marked as completed.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/action-items`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete the action item.",
        variant: "destructive"
      });
    }
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "warning":
        return <span className="material-icons text-accent-500">warning</span>;
      case "success":
        return <span className="material-icons text-success-500">check_circle</span>;
      case "info":
      default:
        return <span className="material-icons text-primary-500">lightbulb</span>;
    }
  };

  const getButtonStyleForType = (type: string, actionButton: string) => {
    if (actionButton === "View Details") {
      return "inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-neutral-700 bg-neutral-50 hover:bg-neutral-100";
    }
    return "inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-50 hover:bg-primary-100";
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-3">
                <div className="flex items-start">
                  <div className="h-6 w-6 bg-neutral-200 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 w-48 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-3 w-full bg-neutral-200 rounded mb-2"></div>
                    <div className="h-8 w-24 bg-neutral-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Recommended Actions</h2>
        <p className="text-sm text-neutral-500">Steps to improve your credit health</p>
      </div>
      
      <div className="p-4">
        {actionItems && actionItems.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {actionItems.map((item: any) => (
              <li key={item.id} className="py-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getIconForType(item.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-neutral-900">{item.title}</h3>
                    <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
                    <div className="mt-2">
                      <button 
                        className={getButtonStyleForType(item.type, item.actionButton)}
                        onClick={() => completeMutation.mutate(item.id)}
                        disabled={completeMutation.isPending}
                      >
                        {item.actionButton}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-6 text-center">
            <span className="material-icons text-neutral-400 text-4xl mb-2">check_circle</span>
            <p className="text-sm text-neutral-500">No action items at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
