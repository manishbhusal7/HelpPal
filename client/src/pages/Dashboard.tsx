import { useState } from "react";
import CreditScoreCard from "@/components/dashboard/CreditScoreCard";
import CreditUtilizationCard from "@/components/dashboard/CreditUtilizationCard";
import IncomeMonitoringCard from "@/components/dashboard/IncomeMonitoringCard";
import CreditScoreSimulator from "@/components/simulator/CreditScoreSimulator";
import ActionItems from "@/components/dashboard/ActionItems";
import Notifications from "@/components/dashboard/Notifications";
import AIChat from "@/components/dashboard/AIChat";
import { useQuery } from "@tanstack/react-query";

interface DashboardProps {
  userId: number | undefined;
}

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatarInitials: string;
  creditScore: number;
  creditScoreStatus: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Dashboard</h2>
          <p className="text-sm text-neutral-500">Please wait while we load your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, <span className="text-gradient">{user?.name || 'User'}</span>
            </h1>
            <p className="text-neutral-600 mb-4">
              Here's your financial health overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 bg-white shadow-sm rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <span className="material-icons text-primary mr-2 text-sm">refresh</span>
              Refresh Data
            </button>
            <button className="flex items-center px-4 py-2 bg-primary text-white shadow-sm rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <span className="material-icons mr-2 text-sm">add</span>
              Add Account
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <span className="material-icons text-primary">date_range</span>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Next Update</p>
            <p className="text-lg font-bold">March 29, 2025</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
            <span className="material-icons text-amber-500">show_chart</span>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Credit Trend</p>
            <p className="text-lg font-bold flex items-center">
              <span className="material-icons text-danger-500 text-sm mr-1">arrow_downward</span>
              Declining
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <span className="material-icons text-green-500">task_alt</span>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Action Items</p>
            <p className="text-lg font-bold">2 Pending</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreditScoreCard userId={userId} />
            <CreditUtilizationCard userId={userId} />
          </div>
          
          {/* Income Monitoring */}
          <IncomeMonitoringCard userId={userId} />
          
          {/* Credit Score Simulator */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
              <h2 className="text-lg font-bold flex items-center">
                <span className="material-icons mr-2 text-primary">trending_up</span>
                Credit Score Simulator
              </h2>
              <p className="text-sm text-neutral-600">See how different actions affect your credit score</p>
            </div>
            <div className="p-4">
              <CreditScoreSimulator userId={userId} />
            </div>
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Activity Feed */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
              <h2 className="text-lg font-bold flex items-center">
                <span className="material-icons mr-2 text-primary">notifications</span>
                Recent Notifications
              </h2>
            </div>
            <div className="p-4">
              <Notifications userId={userId} />
            </div>
          </div>
          
          {/* Action Items */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
              <h2 className="text-lg font-bold flex items-center">
                <span className="material-icons mr-2 text-primary">task_alt</span>
                Action Items
              </h2>
            </div>
            <div className="p-4">
              <ActionItems userId={userId} />
            </div>
          </div>
          
          {/* Tips */}
          <div className="bg-gradient-to-br from-primary/80 to-secondary/80 rounded-xl text-white p-5">
            <h3 className="font-bold mb-2 flex items-center">
              <span className="material-icons mr-2">tips_and_updates</span>
              Pro Tip
            </h3>
            <p className="text-sm">
              With your 78% utilization, paying down $2,500 on each card could boost your credit score by 35+ points 
              within 30-45 days of the payment being reported.
            </p>
            <button className="mt-3 bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center transition-colors">
              More Tips
              <span className="material-icons text-xs ml-1">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setAiMessage("Hi Alex! I've analyzed your financial data and noticed some concerning trends with your credit. Your score has dropped to 650, with 78% utilization and 2 late payments in the last year. Would you like some specific recommendations to improve your score?");
            setShowAIChat(true);
          }}
          className="rounded-full w-14 h-14 bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
        >
          <span className="material-icons text-2xl">smart_toy</span>
        </button>
        {!showAIChat && (
          <div className="absolute -top-10 -left-24 whitespace-nowrap bg-white rounded-full px-3 py-1 text-xs font-medium text-primary-700 shadow-md border border-neutral-100">
            Ask CreditGuardian AI
            <div className="absolute bottom-0 right-5 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-neutral-100"></div>
          </div>
        )}
      </div>

      {/* AI Chat Component */}
      <AIChat 
        isVisible={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialMessage={aiMessage}
      />
    </div>
  );
}
