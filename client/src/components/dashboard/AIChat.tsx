import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AIChatProps {
  isVisible: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export default function AIChat({ isVisible, onClose, initialMessage }: AIChatProps) {
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', text: string}>>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize with initial message if provided
  useEffect(() => {
    if (initialMessage && isVisible) {
      setChatMessages([{ type: 'ai', text: initialMessage }]);
      console.log("Setting initial AI message:", initialMessage);
    }
  }, [initialMessage, isVisible]);

  // For debugging
  useEffect(() => {
    console.log("AIChat visibility changed:", isVisible);
  }, [isVisible]);
  
  // Auto-scroll when messages change
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
      response = "Based on your financial data, I recommend these 3 urgent actions to improve your credit score:\n\n" +
        "1. Reduce your Visa Signature card utilization from 76% to under 30%. This alone could add 30-45 points to your score within 60-90 days.\n\n" +
        "2. Make all payments on time for the next 6 months. Your 2 late payments in the last year have dropped your score by approximately 60 points.\n\n" +
        "3. Work on resolving the collections account from 2019. Paying this off could add 15-25 points to your score, especially if you can negotiate a 'pay for delete' arrangement.";
    } 
    else if (lowerMessage.includes("utilization") || (lowerMessage.includes("credit") && lowerMessage.includes("card"))) {
      response = "Your current credit utilization is 78% overall, which is in the 'high risk' category and significantly hurting your score.\n\n" +
        "Card breakdown:\n" +
        "• Visa Signature: 76% utilized ($4,940 of $6,500 limit) - CRITICAL\n" +
        "• American Express: 80% utilized ($8,000 of $10,000 limit) - CRITICAL\n\n" +
        "Recommendation: Pay down at least $3,000 on each card to get below 50% utilization as a first step. This could improve your score by 25-40 points in the next statement cycle.";
    }
    else if (lowerMessage.includes("dining") || lowerMessage.includes("restaurant") || lowerMessage.includes("spending")) {
      response = "I've noticed your dining/restaurant spending has increased 42% in the last 30 days compared to your 3-month average, which is concerning given your high utilization.\n\n" +
        "Recent transactions include:\n" +
        "• Mar 24: Olive Garden - $96.75\n" +
        "• Mar 20: Starbucks (5 visits) - $32.45\n" +
        "• Mar 16: Applebee's - $115.20\n" +
        "• Mar 14: Food delivery apps - $86.93\n\n" +
        "This increased spending is directly contributing to your high credit utilization. Consider creating a strict dining budget of $200/month until your cards are below 50% utilization.";
    }
    else if (lowerMessage.includes("payment") || lowerMessage.includes("history")) {
      response = "Your payment history needs immediate attention:\n\n" +
        "• 2 late payments in the last 12 months (January and October)\n" +
        "• 65% of payments made on time in the past year\n" +
        "• 4 payments made just 1-3 days before due date (high risk)\n\n" +
        "Payment history accounts for about 35% of your credit score calculation, and your late payments have reduced your score by approximately 60 points. Setting up automatic payments could prevent further damage.";
    }
    else if (lowerMessage.includes("credit age") || lowerMessage.includes("account age")) {
      response = "Your credit accounts have the following ages:\n\n" +
        "• American Express: 2.8 years\n" +
        "• Visa Signature: 1.9 years\n\n" +
        "Your average account age is 2.35 years, which is in the 'Fair' category. Credit history length typically accounts for about 15% of your credit score.\n\n" +
        "Recommendation: Do not open any new credit accounts in the next 12 months, as this would lower your average age further. Maintain your existing accounts in good standing.";
    }
    else if (lowerMessage.includes("collection") || lowerMessage.includes("debt")) {
      response = "Your collections account from 2019:\n\n" +
        "• Original creditor: Regional Medical Center\n" +
        "• Current collector: Midland Credit Management\n" +
        "• Original amount: $1,240\n" +
        "• Current balance: $1,876 (with fees and interest)\n\n" +
        "This account is significantly impacting your score (-45 to -65 points). Contact the collector to negotiate a settlement for less than the full amount, and request a 'pay for delete' agreement where they remove the item from your credit report upon payment.";
    }
    else if (lowerMessage.includes("score")) {
      response = "Your credit score timeline:\n\n" +
        "• 9 months ago: 678 (Fair)\n" +
        "• 6 months ago: 671 (Fair)\n" +
        "• 3 months ago: 658 (Fair)\n" +
        "• Current: 650 (Fair)\n" +
        "• Projection if no action: ~644 in 30 days\n\n" +
        "Recent negative factors:\n" +
        "• Payment History: -18 points (late payment)\n" +
        "• Increased Credit Utilization: -12 points\n" +
        "• Recent Credit Inquiries: -8 points\n\n" +
        "By following our recommendations, you could improve by approximately 50-75 points within 6 months, potentially reaching 700+.";
    }
    else {
      response = "I'd be happy to help with that, Alex. Based on your recent credit activity, your score has dropped by 28 points over the last 9 months to 650, placing you in the 'Fair' category.\n\n" +
        "Your most urgent issues are your 78% credit utilization rate, two late payments in the last year, and an active collections account from 2019.\n\n" +
        "Is there a specific aspect of your credit you'd like me to analyze in more detail? You can ask about utilization, payment history, collections accounts, or specific recommendations.";
    }
    
    // Add AI response to chat
    setChatMessages(prev => [...prev, { type: 'ai', text: response }]);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-10rem)] bg-white rounded-lg shadow-xl border border-neutral-200 flex flex-col z-50 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons mr-2">psychology</span>
            <div>
              <h3 className="text-sm font-medium">CreditGuardian AI</h3>
              <p className="text-xs opacity-80">Financial Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50"
        ref={chatContainerRef}
      >
        {chatMessages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-white border border-neutral-200 text-neutral-800'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center mb-1">
                  <span className="material-icons text-sm text-primary-500 mr-1">assistant</span>
                  <span className="text-xs font-medium text-primary-600">CreditGuardian AI</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm">
                {message.text}
              </div>
              <div className="text-right mt-1">
                <span className="text-xs opacity-70">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <span className="material-icons text-primary-200 text-5xl mb-3">forum</span>
            <h4 className="text-sm font-medium text-neutral-600">Welcome to CreditGuardian AI</h4>
            <p className="text-xs text-neutral-500 mt-2">
              Ask me anything about your credit score, card utilization, or financial recommendations.
            </p>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-3 border-t border-neutral-200 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            size="icon"
            className="h-10 w-10 bg-primary-500 hover:bg-primary-600 text-white"
          >
            <span className="material-icons">send</span>
          </Button>
        </div>
        
        <div className="mt-2 flex justify-between items-center px-1">
          <div className="text-xs text-neutral-400 flex items-center">
            <span className="material-icons text-xs mr-1">shield</span>
            Secure Analysis
          </div>
          
          <div className="flex gap-2">
            <button className="text-neutral-400 hover:text-neutral-600">
              <span className="material-icons text-sm">help_outline</span>
            </button>
            <button className="text-neutral-400 hover:text-neutral-600">
              <span className="material-icons text-sm">settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}