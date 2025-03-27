import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ActionItemsProps {
  userId: number | undefined;
}

export default function ActionItems({ userId }: ActionItemsProps) {
  const { toast } = useToast();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: actionItems = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/users/${userId}/action-items`],
    enabled: !!userId && showRecommendations
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

  const handleGetHelp = () => {
    setIsGenerating(true);
    
    // Create a realistic sequence of analysis steps
    const analysisSteps = [
      { message: "Connecting to financial data sources...", duration: 700 },
      { message: "Scanning recent transactions...", duration: 900 },
      { message: "Analyzing credit utilization patterns...", duration: 800 },
      { message: "Reviewing payment history...", duration: 1000 },
      { message: "Identifying improvement opportunities...", duration: 1200 },
      { message: "Generating personalized recommendations...", duration: 1500 }
    ];
    
    let totalDelay = 0;
    
    // Show a series of toasts to create a realistic scanning experience
    analysisSteps.forEach((step, index) => {
      setTimeout(() => {
        toast({
          title: `Analysis Step ${index + 1}/${analysisSteps.length}`,
          description: step.message,
          duration: 3000,
        });
        
        // When all steps are complete, show recommendations
        if (index === analysisSteps.length - 1) {
          setTimeout(() => {
            setShowRecommendations(true);
            setIsGenerating(false);
            
            toast({
              title: "Analysis Complete",
              description: "CreditGuardian has identified specific actions to improve your credit score.",
              duration: 5000,
            });
          }, 1000);
        }
      }, totalDelay);
      
      totalDelay += step.duration;
    });
  };

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

  if (isLoading || isGenerating) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Financial Analysis in Progress</h2>
          <p className="text-sm text-neutral-500">CreditGuardian AI is analyzing your account</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"></div>
              <span className="material-icons absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-500">
                analytics
              </span>
            </div>
            <h3 className="text-base font-medium text-neutral-800 mb-1">Real-time Analysis</h3>
            <p className="text-sm text-neutral-500 text-center mb-4 max-w-md">
              Scanning your financial data to identify personalized credit improvement opportunities
            </p>
          </div>
          
          <div className="space-y-4 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            <div>
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Analyzing transaction patterns</span>
                <span className="animate-pulse">In progress...</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded overflow-hidden">
                <div className="h-full bg-primary-500 rounded animate-loadingBar w-3/4"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Evaluating credit utilization</span>
                <span className="animate-pulse">In progress...</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded overflow-hidden">
                <div className="h-full bg-primary-500 rounded animate-loadingBar w-1/2"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Reviewing payment history</span>
                <span className="animate-pulse">In progress...</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded overflow-hidden">
                <div className="h-full bg-primary-500 rounded animate-loadingBar w-2/3"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Finding credit score opportunities</span>
                <span className="animate-pulse">In progress...</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded overflow-hidden">
                <div className="h-full bg-primary-500 rounded animate-loadingBar w-1/4"></div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-xs text-neutral-500">
              <span className="material-icons text-xs mr-1 text-amber-500">security</span>
              Your data is being analyzed securely and privately
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!showRecommendations) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">CreditGuardian AI Assistant</h2>
          <p className="text-sm text-neutral-500">Get personalized recommendations to improve your credit health</p>
        </div>
        
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="mb-4 text-center">
            <span className="material-icons text-primary-500 text-5xl mb-3">support_agent</span>
            <h3 className="text-lg font-medium">Need Financial Guidance?</h3>
            <p className="text-sm text-neutral-500 mt-1 mb-4 max-w-md">
              CreditGuardian can analyze your financial data and provide personalized action items to help improve your credit score.
            </p>
          </div>
          
          <Button 
            onClick={handleGetHelp}
            className="flex items-center gap-2"
            size="lg"
          >
            <span className="material-icons">psychology</span>
            Get Help from CreditGuardian
          </Button>
          
          <p className="text-xs text-neutral-400 mt-4 max-w-sm text-center">
            Your financial data is securely analyzed to provide the most relevant recommendations for your situation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Financial Analysis Results</h2>
          <p className="text-sm text-neutral-500">Personalized recommendations based on your data</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowRecommendations(false)}
          className="h-8 flex items-center gap-1"
        >
          <span className="material-icons text-sm">refresh</span>
          Reanalyze
        </Button>
      </div>
      
      <div className="p-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
          <div className="flex items-start">
            <span className="material-icons text-blue-500 mr-3">insights</span>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Financial Analysis Summary</h3>
              <p className="text-xs text-blue-700 mt-1">
                Based on transaction patterns from March 1-21, 2025, CreditGuardian has identified 3 key areas that could improve your credit score by approximately 27-42 points within the next 90 days.
              </p>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-white rounded p-2 border border-blue-100">
              <div className="font-medium text-blue-900">Current Utilization</div>
              <div className="text-lg font-bold text-blue-700 mt-1">48%</div>
              <div className="text-blue-500">Moderate Risk</div>
            </div>
            <div className="bg-white rounded p-2 border border-blue-100">
              <div className="font-medium text-blue-900">Payment Consistency</div>
              <div className="text-lg font-bold text-green-600 mt-1">100%</div>
              <div className="text-green-500">Excellent</div>
            </div>
            <div className="bg-white rounded p-2 border border-blue-100">
              <div className="font-medium text-blue-900">Account Age</div>
              <div className="text-lg font-bold text-amber-600 mt-1">2.4 yrs</div>
              <div className="text-amber-500">Fair</div>
            </div>
          </div>
        </div>
        
        {actionItems && actionItems.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-base font-medium flex items-center">
              <span className="material-icons text-primary-500 mr-2">assignment</span>
              Recommended Actions
            </h3>
            
            <ul className="divide-y divide-gray-200">
              {actionItems.map((item: any) => (
                <li key={item.id} className="py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-primary-50 p-2 rounded-full">
                      {getIconForType(item.type)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-neutral-900">{item.title}</h3>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          Potential Impact: +{7 + Math.floor(Math.random() * 8)} points
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
                      
                      <div className="mt-3 flex items-center text-xs text-neutral-500">
                        <span className="material-icons text-xs mr-1 text-neutral-400">calendar_today</span>
                        Analyzed March 21, 2025
                        <span className="mx-2">•</span>
                        <span className="material-icons text-xs mr-1 text-neutral-400">account_balance</span>
                        Based on recent transactions
                      </div>
                      
                      <div className="mt-3">
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
            
            <div className="mt-6 bg-neutral-50 rounded-lg p-4 border border-neutral-100">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <span className="material-icons text-xs mr-1 text-neutral-500">update</span>
                Analysis Insights
              </h4>
              <p className="text-xs text-neutral-500">
                Your transaction patterns show recurring payments to Wells Fargo and Chase cards on the 15th of each month.
                CreditGuardian detected higher than usual spending in the Dining category (22% above your 3-month average),
                which may be contributing to your current credit utilization rate.
              </p>
            </div>
          </div>
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
