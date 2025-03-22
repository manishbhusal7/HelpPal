import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addMonths } from "date-fns";

interface CreditScoreSimulatorProps {
  userId: number | undefined;
}

export default function CreditScoreSimulator({ userId }: CreditScoreSimulatorProps) {
  const { toast } = useToast();
  const [simulationMode, setSimulationMode] = useState<"simple" | "advanced">("simple");
  
  // Get user data for current credit score and credit cards for utilization
  const { data: user } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  
  const { data: creditCards } = useQuery({
    queryKey: [`/api/users/${userId}/credit-cards`],
    enabled: !!userId,
  });
  
  const { data: utilization } = useQuery({
    queryKey: [`/api/users/${userId}/credit-utilization`],
    enabled: !!userId,
  });
  
  // State for simulator inputs - advanced mode
  const [payDownDebt, setPayDownDebt] = useState(0);
  const [newCreditCard, setNewCreditCard] = useState(false);
  const [onTimePayments, setOnTimePayments] = useState(1);
  const [missedPayments, setMissedPayments] = useState(0);
  const [potentialScore, setPotentialScore] = useState(0);
  const [closeOldAccount, setCloseOldAccount] = useState(false);
  
  // State for simulator inputs - simple mode
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [simpleRecommendation, setSimpleRecommendation] = useState<{
    action: string;
    description: string;
    impact: number;
    timeframe: string;
    details: string;
  } | null>(null);
  
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
  
  // Calculate potential score based on inputs - advanced mode
  useEffect(() => {
    if (!user) return;
    
    let baseScore = user.creditScore;
    let newScore = baseScore;
    
    // Effect of paying down debt (max +25 points)
    const debtReductionEffect = Math.floor(payDownDebt / 400) * 5;
    newScore += Math.min(debtReductionEffect, 30);
    
    // Effect of opening new credit card (-5 to -10 points depending on credit score)
    if (newCreditCard) {
      newScore -= user.creditScore > 720 ? 5 : 10;
    }
    
    // Effect of on-time payments (+5 points per month, max +30)
    const paymentEffect = Math.min(onTimePayments * 5, 30);
    newScore += paymentEffect;
    
    // Effect of missed payments (negative impact)
    if (missedPayments > 0) {
      // Missed payments have severe impact on scores
      newScore -= Math.min(missedPayments * 40, 100);
    }
    
    // Effect of closing old account (negative impact on credit history length)
    if (closeOldAccount) {
      newScore -= 15;
    }
    
    // Cap score at 850 and minimum at 300
    newScore = Math.min(Math.max(newScore, 300), 850);
    
    setPotentialScore(newScore);
  }, [user, payDownDebt, newCreditCard, onTimePayments, missedPayments, closeOldAccount]);
  
  // Generate simple recommendations based on current credit profile
  useEffect(() => {
    if (!user || !utilization || !creditCards || !selectedAction) return;
    
    let recommendation = null;
    const overallUtilization = utilization.overall;
    const highestUtilizationCard = creditCards.reduce(
      (prev, current) => (prev.utilization > current.utilization) ? prev : current, 
      { utilization: 0 }
    );
    
    switch (selectedAction) {
      case "reduce_utilization":
        // Calculate how much to pay to get below 30% utilization
        if (overallUtilization > 30) {
          const totalBalance = creditCards.reduce((sum, card) => sum + card.balance, 0);
          const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
          const targetBalance = totalLimit * 0.3;
          const amountToPay = Math.ceil((totalBalance - targetBalance) / 100) * 100;
          const estimatedImpact = Math.floor(amountToPay / 500) * 5 + 10;
          
          recommendation = {
            action: "Reduce Credit Utilization",
            description: `Your credit usage is ${overallUtilization.toFixed(0)}%. Pay $${amountToPay.toLocaleString()} to drop below 30% and raise your score by +${estimatedImpact} points.`,
            impact: estimatedImpact,
            timeframe: "within 30 days",
            details: `Reducing your overall utilization from ${overallUtilization.toFixed(0)}% to below 30% can significantly improve your credit score.`
          };
        } else if (highestUtilizationCard.utilization > 50) {
          // If any individual card has high utilization
          const card = highestUtilizationCard;
          const targetBalance = card.limit * 0.3;
          const amountToPay = Math.ceil((card.balance - targetBalance) / 100) * 100;
          
          recommendation = {
            action: "Balance High-Utilization Card",
            description: `Your ${card.name} is at ${card.utilization.toFixed(0)}% utilization. Pay $${amountToPay.toLocaleString()} to reach 30% and improve your score by +15 points.`,
            impact: 15,
            timeframe: "within 30 days",
            details: "Even if your overall utilization is good, high utilization on individual cards can hurt your score."
          };
        } else {
          recommendation = {
            action: "Maintain Low Utilization",
            description: "Your current utilization is good! Maintain it below 30% for best results.",
            impact: 0,
            timeframe: "ongoing",
            details: "Consistently keeping your credit utilization below 30% is optimal for your credit score."
          };
        }
        break;
        
      case "payment_history":
        if (user.creditScore < 700) {
          recommendation = {
            action: "Improve Payment History",
            description: "Make all payments on time for the next 6 months without exception to raise your score by +30 points.",
            impact: 30,
            timeframe: "6 months",
            details: "Payment history is the most important factor in your credit score. Setting up automatic payments can help ensure you never miss a due date."
          };
        } else {
          recommendation = {
            action: "Maintain Perfect Payment History",
            description: "Continue your streak of on-time payments for all accounts to gradually improve your score by +5 points.",
            impact: 5,
            timeframe: "ongoing",
            details: "Your good payment history is helping your score. Keep it up!"
          };
        }
        break;
        
      case "credit_mix":
        recommendation = {
          action: "Diversify Credit Mix",
          description: "Consider adding a different type of credit account to your profile to gain +15 points over time.",
          impact: 15,
          timeframe: "within 3-6 months",
          details: "Having a mix of credit types (credit cards, loans, etc.) can help improve your score, but only apply for new credit if you need it."
        };
        break;
        
      case "debt_payoff":
        const totalDebt = creditCards.reduce((sum, card) => sum + card.balance, 0);
        if (totalDebt > 2000) {
          const payoffAmount = Math.min(totalDebt * 0.3, 3000);
          const scoreImpact = Math.floor(payoffAmount / 1000) * 5 + 10;
          recommendation = {
            action: "Reduce Overall Debt",
            description: `Paying off $${payoffAmount.toLocaleString()} of your total debt can boost your score by +${scoreImpact} points in 2-3 months.`,
            impact: scoreImpact,
            timeframe: "2-3 months",
            details: "Reducing your overall debt burden improves your debt-to-income ratio and can significantly impact your credit worthiness."
          };
        } else {
          recommendation = {
            action: "Maintain Low Debt Levels",
            description: "Your current debt level is manageable. Keep up the good work!",
            impact: 0,
            timeframe: "ongoing",
            details: "Having low debt levels is positive for your credit health and overall financial wellness."
          };
        }
        break;
    }
    
    setSimpleRecommendation(recommendation);
  }, [user, utilization, creditCards, selectedAction]);
  
  const handleSaveSimulation = () => {
    if (!userId || !user) return;
    
    if (simulationMode === "advanced") {
      saveMutation.mutate({
        userId,
        baseScore: user.creditScore,
        potentialScore,
        payDownDebt,
        newCreditCard,
        onTimePayments,
        // Additional fields can be added to the schema if needed
      });
    } else if (simpleRecommendation) {
      // For simple mode, calculate the potential score
      const newScore = user.creditScore + simpleRecommendation.impact;
      
      saveMutation.mutate({
        userId,
        baseScore: user.creditScore,
        potentialScore: Math.min(newScore, 850),
        payDownDebt: selectedAction === "reduce_utilization" ? 1000 : 0,
        newCreditCard: selectedAction === "credit_mix",
        onTimePayments: selectedAction === "payment_history" ? 6 : 1,
      });
    }
  };
  
  const getTimeframeDate = (timeframe: string): string => {
    const now = new Date();
    if (timeframe === "within 30 days") {
      return format(addMonths(now, 1), 'MMM d, yyyy');
    } else if (timeframe === "6 months") {
      return format(addMonths(now, 6), 'MMM d, yyyy');
    } else if (timeframe === "within 3-6 months") {
      return format(addMonths(now, 4), 'MMM d, yyyy');
    } else if (timeframe === "2-3 months") {
      return format(addMonths(now, 2), 'MMM d, yyyy');
    }
    return "ongoing";
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Credit Score Simulator</h2>
        <p className="text-sm text-neutral-500">See how different actions could affect your credit score</p>
      </div>
      
      <div className="p-6">
        <Tabs value={simulationMode} onValueChange={(value) => setSimulationMode(value as "simple" | "advanced")}>
          <TabsList className="mb-6">
            <TabsTrigger value="simple">Simple Recommendations</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Simulator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <h3 className="text-sm font-medium text-neutral-700 mb-4">Choose an Action to Simulate</h3>
                <div className="space-y-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAction === "reduce_utilization" 
                        ? "border-primary-500 bg-primary-50" 
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                    onClick={() => setSelectedAction("reduce_utilization")}
                  >
                    <div className="flex items-center">
                      <span className="material-icons text-primary-500 mr-2">credit_card</span>
                      <h4 className="font-medium">Reduce Credit Utilization</h4>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Pay down credit card balances to lower utilization ratio</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAction === "payment_history" 
                        ? "border-primary-500 bg-primary-50" 
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                    onClick={() => setSelectedAction("payment_history")}
                  >
                    <div className="flex items-center">
                      <span className="material-icons text-primary-500 mr-2">calendar_today</span>
                      <h4 className="font-medium">Improve Payment History</h4>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">See how consistent on-time payments affect your score</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAction === "credit_mix" 
                        ? "border-primary-500 bg-primary-50" 
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                    onClick={() => setSelectedAction("credit_mix")}
                  >
                    <div className="flex items-center">
                      <span className="material-icons text-primary-500 mr-2">account_balance</span>
                      <h4 className="font-medium">Diversify Credit Mix</h4>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">Add different types of credit accounts to your profile</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAction === "debt_payoff" 
                        ? "border-primary-500 bg-primary-50" 
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                    onClick={() => setSelectedAction("debt_payoff")}
                  >
                    <div className="flex items-center">
                      <span className="material-icons text-primary-500 mr-2">trending_down</span>
                      <h4 className="font-medium">Debt Paydown Strategy</h4>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">See how paying down debt can improve your score</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                {simpleRecommendation ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-neutral-500">Current Score</div>
                        <div className="text-3xl font-bold text-neutral-900">{user?.creditScore || "---"}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="material-icons text-primary-500 text-2xl">arrow_forward</span>
                        <span className="text-xs text-success-600 font-medium">+{simpleRecommendation.impact} pts</span>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-500">Potential Score</div>
                        <div className="text-3xl font-bold text-success-700">
                          {Math.min((user?.creditScore || 0) + simpleRecommendation.impact, 850)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-5 border border-primary-200">
                      <h3 className="text-lg font-semibold text-primary-800 mb-2">Recommended Action:</h3>
                      <p className="text-base text-primary-700 font-medium">{simpleRecommendation.description}</p>
                      
                      <div className="mt-4 flex items-center space-x-2">
                        <span className="material-icons text-primary-600">schedule</span>
                        <span className="text-sm text-primary-700">
                          Expected improvement: <strong>+{simpleRecommendation.impact} points</strong> {simpleRecommendation.timeframe}
                          {simpleRecommendation.timeframe !== "ongoing" && ` (by ${getTimeframeDate(simpleRecommendation.timeframe)})`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                      <h3 className="text-sm font-medium text-neutral-900 mb-2">Why This Works</h3>
                      <p className="text-sm text-neutral-600">{simpleRecommendation.details}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-10">
                      <span className="material-icons text-neutral-300 text-5xl mb-3">touch_app</span>
                      <h3 className="text-base font-medium text-neutral-700">Select an action to see recommendations</h3>
                      <p className="text-sm text-neutral-500 mt-1">Choose from the options on the left to get personalized advice</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {simpleRecommendation && (
              <div className="mt-6 flex justify-end">
                <button 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleSaveSimulation}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving..." : "Save Simulation"}
                </button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Pay Down Credit Card Debt</label>
                  <div className="flex items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max="10000" 
                      step="100"
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
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Miss Payments (Negative Impact)</label>
                  <select 
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                    value={missedPayments}
                    onChange={(e) => setMissedPayments(parseInt(e.target.value))}
                  >
                    <option value="0">None</option>
                    <option value="1">1 Payment</option>
                    <option value="2">2 Payments</option>
                    <option value="3">3+ Payments</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Close Oldest Credit Account</label>
                  <div className="flex items-center gap-4">
                    <button 
                      className={`border rounded-md py-2 px-4 text-sm font-medium w-1/2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        !closeOldAccount 
                          ? "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50" 
                          : "bg-neutral-50 border-neutral-300 text-neutral-500 hover:bg-neutral-100"
                      }`}
                      onClick={() => setCloseOldAccount(false)}
                    >
                      No
                    </button>
                    <button 
                      className={`border rounded-md py-2 px-4 text-sm font-medium w-1/2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        closeOldAccount 
                          ? "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50" 
                          : "bg-neutral-50 border-neutral-300 text-neutral-500 hover:bg-neutral-100"
                      }`}
                      onClick={() => setCloseOldAccount(true)}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm text-neutral-500">Current Score</div>
                    <div className="text-3xl font-bold text-neutral-900">{user?.creditScore || "---"}</div>
                  </div>
                  <div className="h-12 w-12 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <span className="material-icons text-4xl text-primary-500">arrow_forward</span>
                      {user && (
                        <span className={`text-xs font-medium ${
                          potentialScore > user.creditScore 
                            ? "text-success-600" 
                            : potentialScore < user.creditScore 
                              ? "text-danger-600" 
                              : "text-neutral-500"
                        }`}>
                          {potentialScore > user.creditScore ? "+" : ""}{potentialScore - user.creditScore} pts
                        </span>
                      )}
                    </div>
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
                
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-100 mb-4">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Score Factors</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className={`material-icons ${payDownDebt > 0 ? "text-success-500" : "text-neutral-300"} mr-2`}>
                        {payDownDebt > 0 ? "add_circle" : "circle"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Reduced credit utilization</p>
                        <p className="text-xs text-neutral-500">
                          {payDownDebt > 0 
                            ? `Paying down $${payDownDebt.toLocaleString()} could improve your score by +${Math.min(Math.floor(payDownDebt / 400) * 5, 30)} points` 
                            : "Paying down balances improves your credit utilization ratio"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className={`material-icons ${newCreditCard ? "text-danger-500" : "text-neutral-300"} mr-2`}>
                        {newCreditCard ? "remove_circle" : "circle"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">New credit inquiry</p>
                        <p className="text-xs text-neutral-500">
                          {newCreditCard 
                            ? `Opening a new card would temporarily lower your score by about ${user?.creditScore && user.creditScore > 720 ? "5" : "10"} points` 
                            : "A hard inquiry can temporarily lower your score"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className={`material-icons ${onTimePayments > 1 ? "text-success-500" : "text-neutral-300"} mr-2`}>
                        {onTimePayments > 1 ? "add_circle" : "circle"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Consistent payment history</p>
                        <p className="text-xs text-neutral-500">
                          {onTimePayments > 1 
                            ? `Making ${onTimePayments} months of on-time payments could add +${Math.min(onTimePayments * 5, 30)} points` 
                            : "On-time payments strengthen your credit profile"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className={`material-icons ${missedPayments > 0 ? "text-danger-500" : "text-neutral-300"} mr-2`}>
                        {missedPayments > 0 ? "remove_circle" : "circle"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Missed payments</p>
                        <p className="text-xs text-neutral-500">
                          {missedPayments > 0 
                            ? `Missing ${missedPayments} payment${missedPayments > 1 ? 's' : ''} could decrease your score by -${Math.min(missedPayments * 40, 100)} points` 
                            : "Late or missed payments can severely damage your credit score"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <span className={`material-icons ${closeOldAccount ? "text-danger-500" : "text-neutral-300"} mr-2`}>
                        {closeOldAccount ? "remove_circle" : "circle"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Credit age impact</p>
                        <p className="text-xs text-neutral-500">
                          {closeOldAccount 
                            ? "Closing your oldest account would reduce your average credit age (-15 points)" 
                            : "Keeping older accounts open helps maintain your credit history length"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 border border-neutral-100">
                  <div className="flex items-start">
                    <span className="material-icons text-primary-500 mr-2">lightbulb</span>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Timeline Insight</p>
                      <p className="text-xs text-neutral-600">
                        Utilization changes appear on your credit report within 30-45 days. Payment history and inquiries can take 30-60 days to fully impact your score. Keep in mind that negative items like missed payments can affect your score for up to 7 years.
                      </p>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
