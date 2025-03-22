import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreditScoreSimulatorProps {
  userId: number | undefined;
}

export default function CreditScoreSimulator({ userId }: CreditScoreSimulatorProps) {
  const { toast } = useToast();
  
  // Get user data for current credit score
  const { data: user } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  
  // State for simulator inputs
  const [payDownDebt, setPayDownDebt] = useState(0);
  const [newCreditCard, setNewCreditCard] = useState(false);
  const [onTimePayments, setOnTimePayments] = useState(1);
  const [potentialScore, setPotentialScore] = useState(0);
  
  // Save simulation mutation
  const saveMutation = useMutation({
    mutationFn: async (simulationData: any) => {
      return apiRequest('POST', `/api/users/${userId}/simulations`, simulationData);
    },
    onSuccess: () => {
      toast({
        title: "Simulation Saved",
        description: "Your credit score simulation has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/simulations`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save simulation.",
        variant: "destructive",
      });
    }
  });
  
  // Calculate potential score based on inputs
  useEffect(() => {
    if (!user) return;
    
    let baseScore = user.creditScore;
    let newScore = baseScore;
    
    // Effect of paying down debt (max +25 points)
    const debtReductionEffect = Math.floor(payDownDebt / 500) * 5;
    newScore += Math.min(debtReductionEffect, 25);
    
    // Effect of opening new credit card (-5 points)
    if (newCreditCard) {
      newScore -= 5;
    }
    
    // Effect of on-time payments (+5 points per month, max +30)
    const paymentEffect = Math.min(onTimePayments * 5, 30);
    newScore += paymentEffect;
    
    // Cap score at 850
    newScore = Math.min(newScore, 850);
    
    setPotentialScore(newScore);
  }, [user, payDownDebt, newCreditCard, onTimePayments]);
  
  const handleSaveSimulation = () => {
    if (!userId || !user) return;
    
    saveMutation.mutate({
      userId,
      baseScore: user.creditScore,
      potentialScore,
      payDownDebt,
      newCreditCard,
      onTimePayments
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Credit Score Simulator</h2>
        <p className="text-sm text-neutral-500">See how different actions could affect your credit score</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Pay Down Credit Card Debt</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  value={payDownDebt} 
                  onChange={(e) => setPayDownDebt(parseInt(e.target.value))}
                  className="slider w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer" 
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-neutral-500">$0</span>
                <span className="text-xs font-medium text-primary-600">${payDownDebt.toLocaleString()}</span>
                <span className="text-xs text-neutral-500">$10,000</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Open New Credit Card</label>
              <div className="flex items-center gap-4">
                <button 
                  className={`border rounded-md py-2 px-4 text-sm font-medium w-1/2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    !newCreditCard 
                      ? "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50" 
                      : "bg-neutral-50 border-neutral-300 text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={() => setNewCreditCard(false)}
                >
                  No
                </button>
                <button 
                  className={`border rounded-md py-2 px-4 text-sm font-medium w-1/2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    newCreditCard 
                      ? "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50" 
                      : "bg-neutral-50 border-neutral-300 text-neutral-500 hover:bg-neutral-100"
                  }`}
                  onClick={() => setNewCreditCard(true)}
                >
                  Yes
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Make On-Time Payments</label>
              <select 
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                value={onTimePayments}
                onChange={(e) => setOnTimePayments(parseInt(e.target.value))}
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
          </div>
          
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-neutral-500">Current Score</div>
                <div className="text-3xl font-bold text-neutral-900">{user?.creditScore || "---"}</div>
              </div>
              <div className="h-12 w-12 flex items-center justify-center">
                <span className="material-icons text-4xl text-primary-500">arrow_forward</span>
              </div>
              <div>
                <div className="text-sm text-neutral-500">Potential Score</div>
                <div className={`text-3xl font-bold ${
                  potentialScore > (user?.creditScore || 0) 
                    ? "text-success-700" 
                    : potentialScore < (user?.creditScore || 0) 
                      ? "text-danger-700" 
                      : "text-primary-700"
                }`}>
                  {potentialScore || "---"}
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">Score Factors</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className={`material-icons ${payDownDebt > 0 ? "text-success-500" : "text-neutral-300"} mr-2`}>
                    {payDownDebt > 0 ? "add_circle" : "remove_circle"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Reduced credit utilization</p>
                    <p className="text-xs text-neutral-500">Paying down balances generally improves your credit score</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className={`material-icons ${newCreditCard ? "text-danger-500" : "text-neutral-300"} mr-2`}>
                    {newCreditCard ? "remove_circle" : "remove_circle"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">New credit inquiry</p>
                    <p className="text-xs text-neutral-500">A hard inquiry can temporarily lower your score</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="material-icons text-success-500 mr-2">add_circle</span>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Consistent payment history</p>
                    <p className="text-xs text-neutral-500">On-time payments strengthen your credit profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleSaveSimulation}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save Simulation"}
          </button>
        </div>
      </div>
    </div>
  );
}
