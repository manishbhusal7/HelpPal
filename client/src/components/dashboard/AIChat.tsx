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
    }
  }, [initialMessage, isVisible]);
  
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