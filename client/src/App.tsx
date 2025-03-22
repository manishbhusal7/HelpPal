import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

import Dashboard from "@/pages/Dashboard";
import CreditScore from "@/pages/CreditScore";
import Accounts from "@/pages/Accounts";
import Simulator from "@/pages/Simulator";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // For simplicity, we'll auto-login to the demo user
  useEffect(() => {
    const loginUser = async () => {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'johndoe',
            password: 'password123'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to login');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        toast({
          title: "Login Failed",
          description: "Could not log in to demo account",
          variant: "destructive",
        });
      }
    };
    
    loginUser();
  }, [toast]);

  // Get the current page title from the location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/credit-score":
        return "Credit Score";
      case "/accounts":
        return "Accounts";
      case "/simulator":
        return "Simulator";
      case "/alerts":
        return "Alerts";
      case "/settings":
        return "Settings";
      default:
        return "Credit Guardian";
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title={getPageTitle()} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          user={user}
        />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6 lg:p-8">
          <Switch>
            <Route path="/" component={() => <Dashboard userId={user?.id} />} />
            <Route path="/credit-score" component={() => <CreditScore userId={user?.id} />} />
            <Route path="/accounts" component={() => <Accounts userId={user?.id} />} />
            <Route path="/simulator" component={() => <Simulator userId={user?.id} />} />
            <Route path="/alerts" component={() => <Alerts userId={user?.id} />} />
            <Route path="/settings" component={() => <Settings userId={user?.id} />} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
