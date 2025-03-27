import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActionItemsProps {
  userId: number | undefined;
}

export default function ActionItems({ userId }: ActionItemsProps) {
  const { toast } = useToast();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChatbox, setShowChatbox] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', text: string}>>([
    {
      type: 'ai',
      text: "Hello Alex! I'm your CreditGuardian AI assistant. I've analyzed your financial data and I'm ready to help you improve your credit score. How can I assist you today?"
    }
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
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

  // Scroll to the bottom of the chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle sending a message in the chatbox
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    
    // Clear input field
    setUserMessage("");
    
    // Simulate AI thinking with a loading message
    setTimeout(() => {
      generateAIResponse(userMessage);
    }, 800);
  };
  
  // Generate an AI response based on the user message
  const generateAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    let response = "";
    
    // Personalized responses based on common credit score questions
    if (lowerMessage.includes("improve") && lowerMessage.includes("credit")) {
      response = "Based on your financial data, I recommend these 3 key actions to improve your credit score:\n\n" +
        "1. Reduce your Visa Signature card utilization from 73% to under 30%. This could add 15-25 points to your score within 60 days.\n\n" +
        "2. Continue your perfect payment record. Your consistent on-time payments have already added 12 points over the last 6 months.\n\n" +
        "3. Maintain your older accounts. Your Chase Freedom card is your oldest account at 3.2 years and contributes positively to your credit history length.";
    } 
    else if (lowerMessage.includes("utilization") || (lowerMessage.includes("credit") && lowerMessage.includes("card"))) {
      response = "Your current credit utilization is 48% overall, which is in the 'moderate risk' category.\n\n" +
        "Card breakdown:\n" +
        "• Visa Signature: 73% utilized ($4,750 of $6,500 limit) - HIGH\n" +
        "• Chase Freedom: 23% utilized ($2,980 of $13,000 limit) - GOOD\n\n" +
        "Recommendation: Transfer at least $2,800 from your Visa Signature to your Chase Freedom card to balance utilization rates. This could improve your score by 15-25 points in the next statement cycle.";
    }
    else if (lowerMessage.includes("dining") || lowerMessage.includes("restaurant") || lowerMessage.includes("spending")) {
      response = "I've noticed your dining/restaurant spending has increased 22% in the last 30 days compared to your 3-month average.\n\n" +
        "Recent transactions include:\n" +
        "• Mar 18: Cheesecake Factory - $78.45\n" +
        "• Mar 15: Starbucks (3 visits) - $16.85\n" +
        "• Mar 10: Local Bistro - $124.30\n\n" +
        "This increased spending is directly affecting your Visa Signature card utilization. Consider using your Chase Freedom card for dining in the next 30 days to balance your utilization.";
    }
    else if (lowerMessage.includes("payment") || lowerMessage.includes("history")) {
      response = "Your payment history is excellent! You have:\n\n" +
        "• 36 consecutive on-time payments\n" +
        "• No late payments in your history\n" +
        "• Consistent payment amounts above the minimum required\n\n" +
        "Your payment history accounts for about 35% of your credit score calculation and is your strongest category. This excellent behavior has contributed approximately +42 points to your overall score.";
    }
    else if (lowerMessage.includes("credit age") || lowerMessage.includes("account age")) {
      response = "Your credit accounts have the following ages:\n\n" +
        "• Chase Freedom: 3.2 years\n" +
        "• Visa Signature: 1.6 years\n\n" +
        "Your average account age is 2.4 years, which is in the 'Fair' category. Credit history length typically accounts for about 15% of your credit score.\n\n" +
        "Recommendation: Maintain all current accounts in good standing, as closing your oldest account would negatively impact your score.";
    }
    else if (lowerMessage.includes("score")) {
      response = "Your credit score timeline:\n\n" +
        "• 3 months ago: 715 (Good)\n" +
        "• Current: 736 (Good)\n" +
        "• Potential in 90 days: 778 (Very Good)\n\n" +
        "Recent changes:\n" +
        "• Payment History: +2 points\n" +
        "• Credit Age: +5 points\n" +
        "• Credit Mix: No change\n" +
        "• Credit Utilization: -3 points\n\n" +
        "By following all our recommendations, you could improve by approximately 27-42 points within 90 days.";
    }
    else {
      response = "I'd be happy to help with that, Alex. Based on your recent credit activity, your score has improved by 7 points in the last 30 days to 736, placing you in the 'Good' category.\n\n" +
        "Your biggest opportunity is reducing your Visa Signature card utilization from 73% to under 30%, which could add 15-25 points to your score.\n\n" +
        "Is there a specific aspect of your credit you'd like me to analyze in more detail? You can ask about utilization, payment history, account age, or specific recommendations.";
    }
    
    // Add AI response to chat
    setChatMessages(prev => [...prev, { type: 'ai', text: response }]);
  };

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
            // Show the chatbox by default after analysis is complete
            setShowChatbox(true);
            
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
            
            <div className="mt-4 mb-6 bg-neutral-50 rounded-lg p-4 border border-neutral-100 max-w-lg mx-auto text-left">
              <h4 className="text-sm font-medium text-neutral-800 mb-2 flex items-center">
                <span className="material-icons text-amber-500 mr-2">tips_and_updates</span>
                How CreditGuardian Helps You
              </h4>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li className="flex items-start">
                  <span className="material-icons text-xs text-green-500 mr-1 mt-0.5">check_circle</span>
                  <span>Analyzes your recent transaction history and credit card usage patterns</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-xs text-green-500 mr-1 mt-0.5">check_circle</span>
                  <span>Identifies your current credit score factors and opportunities for improvement</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-xs text-green-500 mr-1 mt-0.5">check_circle</span>
                  <span>Provides specific, actionable recommendations tailored to your financial situation</span>
                </li>
                <li className="flex items-start">
                  <span className="material-icons text-xs text-green-500 mr-1 mt-0.5">check_circle</span>
                  <span>Estimates potential credit score improvements for each recommendation</span>
                </li>
              </ul>
            </div>
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
          <h2 className="text-lg font-semibold text-neutral-900">Credit Score Analysis</h2>
          <p className="text-sm text-neutral-500">Personalized recommendations to improve your credit health</p>
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
        {/* Credit Score Overview */}
        <div className="bg-gradient-to-r from-blue-500 to-primary-600 p-5 rounded-lg text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">Your Credit Score</h3>
              <p className="text-xs opacity-90">Last updated: March 21, 2025</p>
            </div>
            <div className="flex items-center">
              <span className="material-icons mr-1">trending_up</span>
              <span className="text-xs">+7 pts (30 days)</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xs mb-1">3 Months Ago</div>
              <div className="text-2xl font-bold">715</div>
              <div className="text-xs mt-1">Good</div>
            </div>
            
            <div className="flex-1 px-4">
              <div className="h-0.5 bg-white/30 relative mx-4">
                <div className="absolute h-8 border-l border-white -top-4 left-0"></div>
                <div className="absolute h-8 border-l border-white -top-4 right-0"></div>
                <div className="absolute h-8 border-l border-white -top-4" style={{ left: "58%" }}></div>
                <div className="absolute top-1 -mt-8 text-xs" style={{ left: "56%" }}>
                  <span className="material-icons text-xs text-white/80">arrow_downward</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs mb-1">Current</div>
              <div className="text-3xl font-bold">736</div>
              <div className="text-xs mt-1">Good</div>
            </div>
            
            <div className="flex-1 px-4">
              <div className="h-0.5 bg-white/30 relative mx-4">
                <div className="absolute h-8 border-l border-white/60 -top-4 left-0"></div>
                <div className="absolute h-8 border-l border-white/60 -top-4 right-0" style={{ right: "0%" }}></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs mb-1">Potential</div>
              <div className="text-2xl font-bold">778</div>
              <div className="text-xs mt-1">Very Good</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20 text-xs">
            <div className="font-medium">Credit Category Changes Since Last Analysis:</div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center">
                <span className="material-icons text-green-300 mr-1">arrow_upward</span>
                <span>Payment History: +2 pts</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-green-300 mr-1">arrow_upward</span>
                <span>Credit Age: +5 pts</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-amber-300 mr-1">remove</span>
                <span>Credit Mix: No change</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-red-300 mr-1">arrow_downward</span>
                <span>Credit Utilization: -3 pts</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => setShowChatbox(!showChatbox)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <span className="material-icons text-sm">
                  {showChatbox ? "expand_less" : "chat"}
                </span>
                {showChatbox ? "Hide AI Chat" : "Chat with CreditGuardian AI"}
              </Button>
            </div>
          </div>
        </div>
        
        {/* AI Chatbox */}
        {showChatbox && (
          <div className="fixed bottom-0 right-0 md:right-6 md:bottom-6 w-full md:w-96 bg-white rounded-t-lg md:rounded-lg shadow-xl border border-neutral-200 z-20 overflow-hidden transition-all duration-300 ease-in-out">
            <div className="border-b border-neutral-200 px-4 py-3 flex justify-between items-center bg-gradient-to-r from-blue-500 to-primary-600 text-white">
              <div className="flex items-center">
                <span className="material-icons mr-2">support_agent</span>
                <div>
                  <h3 className="text-sm font-medium">CreditGuardian AI</h3>
                  <p className="text-xs opacity-80">Personalized credit advice</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChatbox(false)}
                className="text-white hover:text-white/80"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="p-4 h-80 overflow-y-auto flex flex-col space-y-4 bg-neutral-50"
            >
              {chatMessages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 ${
                      message.type === 'user' 
                        ? 'message-user bg-primary-500 text-white'
                        : 'message-ai bg-white shadow-sm border border-neutral-200'
                    }`}
                  >
                    <p 
                      className={`text-sm whitespace-pre-line ${
                        message.type === 'user' ? 'text-white' : 'text-neutral-800'
                      }`}
                    >
                      {message.text}
                    </p>
                    
                    {message.type === 'ai' && index === chatMessages.length - 1 && (
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-primary-500 font-medium mr-auto">
                          CreditGuardian AI
                        </span>
                        
                        <button 
                          className="text-xs text-neutral-500 hover:text-primary-500 p-1"
                          onClick={() => {
                            // Copy text to clipboard
                            navigator.clipboard.writeText(message.text);
                            toast({
                              title: "Copied to clipboard",
                              duration: 2000,
                            });
                          }}
                        >
                          <span className="material-icons text-sm">content_copy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-neutral-200 bg-white">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask about your credit score..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={!userMessage.trim()}
                  className="h-10 w-10 rounded-full"
                >
                  <span className="material-icons">send</span>
                </Button>
              </form>
            </div>
          </div>
        )}
        
        {/* Analysis Summary */}
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
          
          <div className="mt-4 bg-white p-3 rounded border border-blue-100">
            <h4 className="text-xs font-medium text-blue-900 mb-2">Account-Specific Insights</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span>Visa Signature (Wells Fargo)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-neutral-600">Utilization: <span className="font-medium text-amber-600">73%</span></div>
                  <div className="text-neutral-600">Balance: <span className="font-medium">$4,750</span></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Chase Freedom</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-neutral-600">Utilization: <span className="font-medium text-green-600">23%</span></div>
                  <div className="text-neutral-600">Balance: <span className="font-medium">$2,980</span></div>
                </div>
              </div>
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
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <span className="material-icons text-xs mr-1 text-neutral-500">update</span>
                Transaction Analysis Insights
              </h4>
              
              <div className="space-y-3">
                <p className="text-xs text-neutral-500">
                  <span className="font-medium">Payment Patterns:</span> Your transaction history shows recurring payments to Wells Fargo and Chase cards on the 15th of each month.
                </p>
                
                <p className="text-xs text-neutral-500">
                  <span className="font-medium">Spending Analysis:</span> CreditGuardian detected higher than usual spending in the Dining category (22% above your 3-month average),
                  which may be contributing to your current credit utilization rate.
                </p>
                
                <p className="text-xs text-neutral-500">
                  <span className="font-medium">Account Behavior:</span> Your Wells Fargo Visa Signature card shows a recent balance increase of 12% since February, while
                  your Chase Freedom card has maintained a steady balance level over the last 60 days.
                </p>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-100">
                <div className="flex items-start">
                  <span className="material-icons text-amber-500 mr-2">tips_and_updates</span>
                  <div>
                    <h5 className="text-xs font-medium text-amber-800">Credit Score Tip</h5>
                    <p className="text-xs text-amber-700 mt-1">
                      Reducing your Visa Signature card utilization from 73% to under 30% could improve your credit score by approximately 15-25 points.
                      Consider transferring part of this balance to your Chase Freedom card which has a lower utilization rate.
                    </p>
                  </div>
                </div>
              </div>
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
