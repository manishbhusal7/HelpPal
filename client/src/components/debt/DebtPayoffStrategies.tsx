import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface DebtItem {
  id: number;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
  selected: boolean;
}

export default function DebtPayoffStrategies() {
  const [debtItems, setDebtItems] = useState<DebtItem[]>([
    { 
      id: 1, 
      name: "Credit Card 1", 
      balance: 5000, 
      interestRate: 18.9, 
      minPayment: 125,
      selected: true
    },
    { 
      id: 2, 
      name: "Credit Card 2", 
      balance: 2500, 
      interestRate: 22.5, 
      minPayment: 80,
      selected: true
    },
    { 
      id: 3, 
      name: "Personal Loan", 
      balance: 12000, 
      interestRate: 9.5, 
      minPayment: 250,
      selected: true
    }
  ]);
  
  const [newDebt, setNewDebt] = useState({
    name: "",
    balance: 0,
    interestRate: 0,
    minPayment: 0
  });
  
  const [monthlyPayment, setMonthlyPayment] = useState(500);
  const [currentStrategy, setCurrentStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationSteps, setNegotiationSteps] = useState<number | null>(null);
  
  const handleAddDebt = () => {
    if (!newDebt.name || newDebt.balance <= 0 || newDebt.interestRate <= 0 || newDebt.minPayment <= 0) {
      return;
    }
    
    setDebtItems([
      ...debtItems,
      {
        id: Math.max(0, ...debtItems.map(item => item.id)) + 1,
        name: newDebt.name,
        balance: newDebt.balance,
        interestRate: newDebt.interestRate,
        minPayment: newDebt.minPayment,
        selected: true
      }
    ]);
    
    setNewDebt({
      name: "",
      balance: 0,
      interestRate: 0,
      minPayment: 0
    });
  };
  
  const toggleDebtSelection = (id: number) => {
    setDebtItems(debtItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };
  
  const removeDebt = (id: number) => {
    setDebtItems(debtItems.filter(item => item.id !== id));
  };
  
  const startNegotiation = (id: number) => {
    setIsNegotiating(true);
    setNegotiationSteps(id);
  };
  
  const closeNegotiation = () => {
    setIsNegotiating(false);
    setNegotiationSteps(null);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate total debt
  const totalDebt = debtItems.reduce((sum, item) => sum + item.balance, 0);
  
  // Calculate minimum payment
  const totalMinPayment = debtItems.reduce((sum, item) => sum + item.minPayment, 0);
  
  // Calculate payoff time and total interest for both strategies
  const calculatePayoffPlans = () => {
    const selectedDebts = debtItems.filter(debt => debt.selected);
    
    // Sort debts by strategy
    const sortedDebtsAvalanche = [...selectedDebts].sort((a, b) => b.interestRate - a.interestRate);
    const sortedDebtsSnowball = [...selectedDebts].sort((a, b) => a.balance - b.balance);
    
    // Calculate payoff plans
    const avalanchePlan = calculatePayoffPlan(sortedDebtsAvalanche, monthlyPayment);
    const snowballPlan = calculatePayoffPlan(sortedDebtsSnowball, monthlyPayment);
    
    return {
      avalanche: avalanchePlan,
      snowball: snowballPlan
    };
  };
  
  const calculatePayoffPlan = (sortedDebts: DebtItem[], payment: number) => {
    // This is a simplified calculation for demonstration purposes
    // For a real implementation, a more complex amortization calculation would be used
    
    // Deep copy debts to avoid mutation
    const debts = sortedDebts.map(debt => ({...debt}));
    
    let months = 0;
    let totalInterestPaid = 0;
    
    // Calculate minimum payment total
    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
    
    // If payment is less than minimum payments, return error values
    if (payment < totalMinPayment) {
      return { months: -1, totalInterestPaid: -1 };
    }
    
    // Simulate payoff month by month
    let remainingDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    while (remainingDebt > 0 && months < 1000) { // Cap at 1000 months to prevent infinite loops
      months++;
      
      // Pay minimum on all debts
      let remainingPayment = payment;
      for (const debt of debts) {
        if (debt.balance <= 0) continue;
        
        // Calculate interest for this month
        const interest = (debt.balance * (debt.interestRate / 100)) / 12;
        totalInterestPaid += interest;
        
        // Add interest to balance
        debt.balance += interest;
        
        // Pay minimum
        const minPayment = Math.min(debt.minPayment, debt.balance);
        debt.balance -= minPayment;
        remainingPayment -= minPayment;
      }
      
      // Apply extra payment to first debt in sorted list that has remaining balance
      for (const debt of debts) {
        if (debt.balance > 0 && remainingPayment > 0) {
          const extraPayment = Math.min(remainingPayment, debt.balance);
          debt.balance -= extraPayment;
          remainingPayment -= extraPayment;
          break;
        }
      }
      
      // Recalculate remaining debt
      remainingDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    }
    
    return { months, totalInterestPaid };
  };
  
  const payoffPlans = calculatePayoffPlans();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <span className="material-icons text-primary-500 mr-2">account_balance</span>
            Debt Payoff Strategies
          </CardTitle>
          <CardDescription>
            Compare different strategies to pay off your debt faster and save money on interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
              <h3 className="text-base font-medium text-primary-800 mb-2">Your Debt Overview</h3>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm">
                  <div className="flex items-center mb-1">
                    <span className="w-32 text-neutral-600">Total Debt:</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(totalDebt)}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="w-32 text-neutral-600">Min. Monthly Payment:</span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(totalMinPayment)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32 text-neutral-600">Your Monthly Payment:</span>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={monthlyPayment}
                        onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                        className="w-24 h-8"
                        min={totalMinPayment}
                      />
                      <span className="text-xs text-neutral-500">
                        (Min: {formatCurrency(totalMinPayment)})
                      </span>
                    </div>
                  </div>
                </div>
                
                {totalDebt > 0 && (
                  <div className="flex flex-col items-center gap-1 bg-white p-3 rounded-lg border border-neutral-200">
                    <div className="text-sm text-neutral-600">Debt-Free Date</div>
                    <div className="text-lg font-bold text-primary-600">
                      {payoffPlans[currentStrategy].months === -1 
                        ? "Payment too low" 
                        : `${payoffPlans[currentStrategy].months} months`}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {payoffPlans[currentStrategy].months === -1 
                        ? "" 
                        : `${Math.floor(payoffPlans[currentStrategy].months / 12)} years, ${payoffPlans[currentStrategy].months % 12} months`}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-neutral-900 mb-3">Your Debts</h3>
              
              {debtItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-neutral-50 p-3 rounded-lg grid grid-cols-12 gap-2 text-sm font-medium text-neutral-600 hidden md:grid">
                    <div className="col-span-1"></div>
                    <div className="col-span-3">Name</div>
                    <div className="col-span-2">Balance</div>
                    <div className="col-span-2">Interest Rate</div>
                    <div className="col-span-2">Minimum Payment</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                  
                  {debtItems.map((debt) => (
                    <div key={debt.id} className={`border rounded-lg p-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-center ${debt.selected ? 'border-primary-200' : 'border-neutral-200 bg-neutral-50'}`}>
                      <div className="md:col-span-1 flex items-center justify-between md:justify-center">
                        <span className="md:hidden font-medium">Include</span>
                        <input 
                          type="checkbox" 
                          checked={debt.selected}
                          onChange={() => toggleDebtSelection(debt.id)}
                          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div className="md:col-span-3 flex items-center justify-between">
                        <span className="md:hidden font-medium">Name</span>
                        <span className="font-medium text-neutral-900">{debt.name}</span>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center justify-between">
                        <span className="md:hidden font-medium">Balance</span>
                        <span>{formatCurrency(debt.balance)}</span>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center justify-between">
                        <span className="md:hidden font-medium">Interest Rate</span>
                        <span>{debt.interestRate.toFixed(1)}%</span>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center justify-between">
                        <span className="md:hidden font-medium">Minimum Payment</span>
                        <span>{formatCurrency(debt.minPayment)}</span>
                      </div>
                      
                      <div className="md:col-span-2 flex items-center justify-between md:justify-start gap-2">
                        <span className="md:hidden font-medium">Actions</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2"
                            onClick={() => startNegotiation(debt.id)}
                          >
                            <span className="material-icons text-sm mr-1">call</span>
                            <span className="text-xs">Negotiate</span>
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                            onClick={() => removeDebt(debt.id)}
                          >
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-neutral-300 rounded-lg">
                  <span className="material-icons text-neutral-300 text-4xl mb-2">account_balance_wallet</span>
                  <h3 className="text-base font-medium text-neutral-700 mb-1">No debts added yet</h3>
                  <p className="text-sm text-neutral-500">Add your debts to see personalized payoff strategies</p>
                </div>
              )}
              
              <div className="mt-4">
                <details className="group">
                  <summary className="flex cursor-pointer items-center text-sm font-medium text-primary-600 hover:text-primary-700">
                    <span className="material-icons text-sm mr-1 group-open:rotate-180">expand_more</span>
                    Add a new debt
                  </summary>
                  <div className="mt-3 p-4 border border-neutral-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="debt-name">Debt Name</Label>
                        <Input 
                          id="debt-name" 
                          value={newDebt.name}
                          onChange={(e) => setNewDebt({...newDebt, name: e.target.value})}
                          placeholder="Credit Card, Loan, etc."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="debt-balance">Balance ($)</Label>
                        <Input 
                          id="debt-balance" 
                          type="number"
                          value={newDebt.balance || ''}
                          onChange={(e) => setNewDebt({...newDebt, balance: Number(e.target.value)})}
                          placeholder="5000"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="debt-interest">Interest Rate (%)</Label>
                        <Input 
                          id="debt-interest" 
                          type="number"
                          value={newDebt.interestRate || ''}
                          onChange={(e) => setNewDebt({...newDebt, interestRate: Number(e.target.value)})}
                          placeholder="19.99"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="debt-payment">Min. Payment ($)</Label>
                        <Input 
                          id="debt-payment" 
                          type="number"
                          value={newDebt.minPayment || ''}
                          onChange={(e) => setNewDebt({...newDebt, minPayment: Number(e.target.value)})}
                          placeholder="150"
                        />
                      </div>
                    </div>
                    
                    <Button className="mt-4" onClick={handleAddDebt}>
                      <span className="material-icons text-sm mr-1">add</span>
                      Add Debt
                    </Button>
                  </div>
                </details>
              </div>
            </div>
            
            {debtItems.filter(debt => debt.selected).length > 0 && (
              <div>
                <h3 className="text-base font-medium text-neutral-900 mb-3">Payoff Strategy Comparison</h3>
                
                <Tabs 
                  defaultValue="avalanche" 
                  value={currentStrategy}
                  onValueChange={(value) => setCurrentStrategy(value as "avalanche" | "snowball")}
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="avalanche">Debt Avalanche</TabsTrigger>
                    <TabsTrigger value="snowball">Debt Snowball</TabsTrigger>
                  </TabsList>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={currentStrategy === "avalanche" ? "border-primary-500" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Debt Avalanche</CardTitle>
                            <CardDescription>Pay highest interest rate first</CardDescription>
                          </div>
                          {payoffPlans.avalanche.totalInterestPaid < payoffPlans.snowball.totalInterestPaid && (
                            <Badge className="bg-success-50 text-success-600 border-success-200">
                              Best Savings
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Total Interest Paid:</span>
                            <span className="font-semibold text-neutral-900">
                              {payoffPlans.avalanche.totalInterestPaid === -1 
                                ? "N/A" 
                                : formatCurrency(payoffPlans.avalanche.totalInterestPaid)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Payoff Time:</span>
                            <span className="font-semibold text-neutral-900">
                              {payoffPlans.avalanche.months === -1 
                                ? "N/A" 
                                : `${payoffPlans.avalanche.months} months`}
                            </span>
                          </div>
                          
                          <div className="pt-2">
                            <p className="text-sm text-neutral-600 mb-2">How it works:</p>
                            <p className="text-sm text-neutral-500">
                              Prioritize debts with the highest interest rates while making minimum payments on all other debts. This mathematically saves the most money in interest.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant={currentStrategy === "avalanche" ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => setCurrentStrategy("avalanche")}
                        >
                          {currentStrategy === "avalanche" ? "Selected" : "Select This Strategy"}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className={currentStrategy === "snowball" ? "border-primary-500" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Debt Snowball</CardTitle>
                            <CardDescription>Pay smallest balance first</CardDescription>
                          </div>
                          {payoffPlans.snowball.months < payoffPlans.avalanche.months && (
                            <Badge className="bg-success-50 text-success-600 border-success-200">
                              Fastest Payoff
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Total Interest Paid:</span>
                            <span className="font-semibold text-neutral-900">
                              {payoffPlans.snowball.totalInterestPaid === -1 
                                ? "N/A" 
                                : formatCurrency(payoffPlans.snowball.totalInterestPaid)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Payoff Time:</span>
                            <span className="font-semibold text-neutral-900">
                              {payoffPlans.snowball.months === -1 
                                ? "N/A" 
                                : `${payoffPlans.snowball.months} months`}
                            </span>
                          </div>
                          
                          <div className="pt-2">
                            <p className="text-sm text-neutral-600 mb-2">How it works:</p>
                            <p className="text-sm text-neutral-500">
                              Focus on paying off the smallest debts first while making minimum payments on all other debts. This provides psychological wins and motivation as you eliminate debts.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant={currentStrategy === "snowball" ? "default" : "outline"} 
                          className="w-full"
                          onClick={() => setCurrentStrategy("snowball")}
                        >
                          {currentStrategy === "snowball" ? "Selected" : "Select This Strategy"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  {payoffPlans[currentStrategy].months > 0 && (
                    <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                      <h4 className="text-sm font-medium text-primary-800 mb-3">Payment Allocation for {currentStrategy === "avalanche" ? "Debt Avalanche" : "Debt Snowball"}</h4>
                      <div className="space-y-4">
                        {debtItems
                          .filter(debt => debt.selected)
                          .sort((a, b) => 
                            currentStrategy === "avalanche" 
                              ? b.interestRate - a.interestRate 
                              : a.balance - b.balance
                          )
                          .map((debt, index) => (
                            <div key={debt.id} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <span className="material-icons text-sm mr-1 text-primary-500">
                                    {index === 0 ? "priority_high" : "check_circle_outline"}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {debt.name} 
                                    {index === 0 && (
                                      <span className="ml-2 text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                                        Focus on this first
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-neutral-600">Balance: </span>
                                  <span className="font-medium">{formatCurrency(debt.balance)}</span>
                                  <span className="mx-1 text-neutral-300">|</span>
                                  <span className="text-neutral-600">Rate: </span>
                                  <span className="font-medium">{debt.interestRate}%</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="text-xs font-medium text-neutral-600 w-28">
                                  {index === 0 ? "Min + Extra" : "Min Payment"}
                                </div>
                                <Progress value={index === 0 ? 100 : 30} className="h-2" />
                                <div className="text-xs font-medium text-neutral-900 w-20 text-right">
                                  {index === 0 
                                    ? formatCurrency(debt.minPayment + (monthlyPayment - totalMinPayment)) 
                                    : formatCurrency(debt.minPayment)}
                                </div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isNegotiating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <span className="material-icons text-primary-500 mr-2">support_agent</span>
              Interest Rate Negotiation Assistant
            </CardTitle>
            <CardDescription>
              Follow these steps to potentially lower your interest rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {negotiationSteps !== null && (
                <div className="bg-white p-4 rounded-lg border border-neutral-200">
                  <h3 className="font-medium text-neutral-900 mb-4">
                    Negotiation Script for {debtItems.find(d => d.id === negotiationSteps)?.name}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                      <h4 className="text-sm font-medium text-primary-800 mb-2">Step 1: Preparation</h4>
                      <ul className="text-sm text-primary-700 list-disc pl-5 space-y-1">
                        <li>Gather your account information and have it ready</li>
                        <li>Review your payment history and credit score</li>
                        <li>Research competitive offers from other credit cards/lenders</li>
                        <li>Call the customer service number on the back of your card/statement</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                      <h4 className="text-sm font-medium text-primary-800 mb-2">Step 2: The Script</h4>
                      <div className="text-sm text-primary-700 space-y-3">
                        <p><strong>You:</strong> "Hello, my name is Manish Bhusal. I've been a customer for [X years/months] and I've had a good experience with [Company]. However, I've received several offers from other credit card companies with significantly lower interest rates. I'd like to keep my account with you, but I was hoping you could lower my interest rate to be more competitive."</p>
                        
                        <p><strong>If they say no:</strong> "I understand. Could you tell me what criteria you use to determine interest rates? I've been making regular payments and have improved my credit score. I'd appreciate it if you could review my account again."</p>
                        
                        <p><strong>If they offer a small reduction:</strong> "Thank you for that offer. I appreciate it, but I've received offers for rates around [X% - aim for 5-7% lower than your current rate]. Is there any way you could match that?"</p>
                        
                        <p><strong>If still no:</strong> "I'd really prefer to stay with your company, but I need to make the best financial decision. Could I speak with a supervisor who might have more authority to adjust my rate?"</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
                      <h4 className="text-sm font-medium text-primary-800 mb-2">Step 3: Closing</h4>
                      <div className="text-sm text-primary-700 space-y-2">
                        <p>If successful: Thank them and ask when the new rate will take effect.</p>
                        <p>If unsuccessful: Thank them for their time and consider:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Trying again in 3-6 months</li>
                          <li>Balance transfer to a card with a lower rate</li>
                          <li>Debt consolidation options</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="text-sm font-medium text-neutral-800 mb-2">Success Rate Statistics</h4>
                      <p className="text-sm text-neutral-600 mb-4">Users who follow this script report a <span className="font-medium text-success-600">65% success rate</span> in securing a lower interest rate, with an average reduction of 5.2 percentage points.</p>
                      
                      <Button onClick={closeNegotiation} className="w-full">
                        I'm Ready to Make the Call
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}