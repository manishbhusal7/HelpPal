import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

// Sample debt data
const initialDebtItems = [
  { 
    id: 1, 
    name: "Credit Card A", 
    balance: 5000, 
    interestRate: 19.99, 
    minPayment: 120, 
    selected: true,
    company: "Chase"
  },
  { 
    id: 2, 
    name: "Credit Card B", 
    balance: 2500, 
    interestRate: 21.99, 
    minPayment: 75, 
    selected: true,
    company: "Bank of America"
  },
  { 
    id: 3, 
    name: "Auto Loan", 
    balance: 12000, 
    interestRate: 6.5, 
    minPayment: 345, 
    selected: true,
    company: "Toyota Financial"
  },
  { 
    id: 4, 
    name: "Personal Loan", 
    balance: 8000, 
    interestRate: 10.75, 
    minPayment: 230, 
    selected: true,
    company: "SoFi"
  }
];

// Success rates for interest rate negotiations
const negotiationSuccessRates = {
  "Chase": 65,
  "Bank of America": 59,
  "Capital One": 72,
  "Discover": 78,
  "Toyota Financial": 43,
  "SoFi": 51,
  "Wells Fargo": 61,
  "Other": 55
};

interface DebtItem {
  id: number;
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
  selected: boolean;
  company: string;
}

export default function DebtPayoffStrategies() {
  const [debtItems, setDebtItems] = useState<DebtItem[]>(initialDebtItems);
  const [monthlyPayment, setMonthlyPayment] = useState<string>("1000");
  const [activeStrategy, setActiveStrategy] = useState<string>("snowball");
  const [isAddingDebt, setIsAddingDebt] = useState<boolean>(false);
  const [newDebt, setNewDebt] = useState<DebtItem>({
    id: 0,
    name: "",
    balance: 0,
    interestRate: 0,
    minPayment: 0,
    selected: true,
    company: ""
  });
  
  const { toast } = useToast();
  
  // Calculate total debt
  const totalDebt = debtItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.balance, 0);
  
  // Calculate monthly minimum payments
  const totalMinPayment = debtItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.minPayment, 0);
  
  const handleToggleDebtSelection = (id: number) => {
    setDebtItems(debtItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };
  
  const handleAddDebt = () => {
    if (!newDebt.name || newDebt.balance <= 0 || newDebt.interestRate <= 0 || newDebt.minPayment <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields with valid values.",
        variant: "destructive"
      });
      return;
    }
    
    const newId = Math.max(...debtItems.map(item => item.id), 0) + 1;
    setDebtItems([...debtItems, { ...newDebt, id: newId }]);
    setNewDebt({
      id: 0,
      name: "",
      balance: 0,
      interestRate: 0,
      minPayment: 0,
      selected: true,
      company: ""
    });
    setIsAddingDebt(false);
    
    toast({
      title: "Debt Added",
      description: `${newDebt.name} has been added to your debt list.`
    });
  };
  
  const handleRemoveDebt = (id: number) => {
    setDebtItems(debtItems.filter(item => item.id !== id));
    
    toast({
      title: "Debt Removed",
      description: "The debt item has been removed from your list."
    });
  };
  
  // Function to calculate payoff data for visualization
  const calculatePayoffData = () => {
    if (debtItems.filter(item => item.selected).length === 0) return [];
    
    const selectedDebts = [...debtItems.filter(item => item.selected)];
    const monthlyAllocation = parseFloat(monthlyPayment) || 0;
    
    if (monthlyAllocation <= totalMinPayment) return [];
    
    let remainingAllocation = monthlyAllocation;
    let months = 0;
    let totalPaid = 0;
    let interestPaid = 0;
    let principalPaid = 0;
    let remainingBalances = selectedDebts.map(debt => debt.balance);
    const payoffData = [];
    
    // Sort based on strategy
    if (activeStrategy === "snowball") {
      selectedDebts.sort((a, b) => a.balance - b.balance);
    } else if (activeStrategy === "avalanche") {
      selectedDebts.sort((a, b) => b.interestRate - a.interestRate);
    }
    
    while (remainingBalances.some(balance => balance > 0) && months < 120) {
      months++;
      remainingAllocation = monthlyAllocation;
      
      // Pay minimum on all debts first
      selectedDebts.forEach((debt, i) => {
        if (remainingBalances[i] > 0) {
          const minPayment = Math.min(debt.minPayment, remainingBalances[i]);
          remainingAllocation -= minPayment;
          
          // Calculate interest
          const monthlyInterest = (debt.interestRate / 100 / 12) * remainingBalances[i];
          interestPaid += monthlyInterest;
          
          // Update remaining balance
          if (minPayment > monthlyInterest) {
            const principalPortion = minPayment - monthlyInterest;
            principalPaid += principalPortion;
            remainingBalances[i] -= principalPortion;
          } else {
            // Minimum payment doesn't cover interest
            remainingBalances[i] += (monthlyInterest - minPayment);
          }
        }
      });
      
      // Apply remaining allocation to highest priority debt
      for (let i = 0; i < selectedDebts.length; i++) {
        if (remainingBalances[i] > 0 && remainingAllocation > 0) {
          const extraPayment = Math.min(remainingAllocation, remainingBalances[i]);
          remainingAllocation -= extraPayment;
          principalPaid += extraPayment;
          remainingBalances[i] -= extraPayment;
          
          if (remainingBalances[i] <= 0) {
            remainingBalances[i] = 0;
          }
          
          if (remainingAllocation <= 0) break;
        }
      }
      
      totalPaid = principalPaid + interestPaid;
      
      // Store data for chart
      if (months % 6 === 0 || remainingBalances.every(balance => balance === 0)) {
        payoffData.push({
          month: months,
          remainingDebt: remainingBalances.reduce((sum, balance) => sum + balance, 0),
          interestPaid,
          principalPaid,
          totalPaid
        });
      }
      
      // Break if all debts are paid off
      if (remainingBalances.every(balance => balance === 0)) break;
    }
    
    return payoffData;
  };
  
  const payoffData = calculatePayoffData();
  const monthsToPayoff = payoffData.length > 0 ? payoffData[payoffData.length - 1].month : 0;
  const totalInterestPaid = payoffData.length > 0 ? payoffData[payoffData.length - 1].interestPaid : 0;
  
  // Data for comparison chart
  const comparisonData = [
    {
      name: "Snowball",
      months: 42,
      interest: 4800,
      motivation: 9.5
    },
    {
      name: "Avalanche",
      months: 40,
      interest: 4200,
      motivation: 7.5
    },
    {
      name: "Debt Consolidation",
      months: 36,
      interest: 3600,
      motivation: 8.0
    }
  ];
  
  const handleNegotiateRates = () => {
    // Simulate negotiation results
    const updatedDebtItems = debtItems.map(item => {
      if (item.selected) {
        const successRate = negotiationSuccessRates[item.company as keyof typeof negotiationSuccessRates] || 
                           negotiationSuccessRates.Other;
        const success = Math.random() * 100 < successRate;
        
        if (success) {
          const reduction = 2 + Math.random() * 3; // 2-5% reduction
          const newRate = Math.max(item.interestRate - reduction, 0);
          return { ...item, interestRate: parseFloat(newRate.toFixed(2)) };
        }
      }
      return item;
    });
    
    const reducedCount = updatedDebtItems.filter((item, i) => 
      item.interestRate !== debtItems[i].interestRate
    ).length;
    
    setDebtItems(updatedDebtItems);
    
    if (reducedCount > 0) {
      toast({
        title: "Negotiation Successful",
        description: `Interest rates reduced for ${reducedCount} debt items!`,
      });
    } else {
      toast({
        title: "Negotiation Unsuccessful",
        description: "No interest rates were successfully reduced. Try again later.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debt Payoff Planner</CardTitle>
          <CardDescription>
            Analyze and optimize your debt payoff strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Debt list */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Debt</h3>
                {isAddingDebt ? (
                  <Button variant="ghost" onClick={() => setIsAddingDebt(false)}>
                    Cancel
                  </Button>
                ) : (
                  <Button onClick={() => setIsAddingDebt(true)}>
                    <span className="material-icons mr-2">add</span>
                    Add Debt
                  </Button>
                )}
              </div>
              
              {/* Add debt form */}
              {isAddingDebt && (
                <Card className="mb-4 p-4 border border-neutral-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <Input 
                        placeholder="Credit Card, Loan, etc."
                        value={newDebt.name}
                        onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Company/Bank</label>
                      <Input 
                        placeholder="Chase, Bank of America, etc."
                        value={newDebt.company}
                        onChange={(e) => setNewDebt({ ...newDebt, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Balance ($)</label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={newDebt.balance > 0 ? newDebt.balance : ""}
                        onChange={(e) => setNewDebt({ ...newDebt, balance: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={newDebt.interestRate > 0 ? newDebt.interestRate : ""}
                        onChange={(e) => setNewDebt({ ...newDebt, interestRate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Minimum Payment ($)</label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={newDebt.minPayment > 0 ? newDebt.minPayment : ""}
                        onChange={(e) => setNewDebt({ ...newDebt, minPayment: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddDebt}>Add Debt</Button>
                  </div>
                </Card>
              )}
              
              {/* Debt list table */}
              {debtItems.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th className="w-10 pl-4 py-3 text-left"></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Debt</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Balance</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Min. Payment</th>
                        <th className="w-14 px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {debtItems.map((debt) => (
                        <tr key={debt.id} className={!debt.selected ? "bg-neutral-50" : ""}>
                          <td className="pl-4 py-3 whitespace-nowrap">
                            <Checkbox 
                              checked={debt.selected}
                              onCheckedChange={() => handleToggleDebtSelection(debt.id)}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium">{debt.name}</div>
                            <div className="text-sm text-neutral-500">{debt.company}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            ${debt.balance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            {debt.interestRate}%
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            ${debt.minPayment}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0" 
                              onClick={() => handleRemoveDebt(debt.id)}
                            >
                              <span className="material-icons text-neutral-500">delete</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 bg-neutral-50 rounded-md">
                  <div className="material-icons text-4xl text-neutral-300 mb-2">account_balance</div>
                  <h3 className="text-lg font-medium text-neutral-500">No debt items added</h3>
                  <p className="text-neutral-400 mt-1">Add your debts to get started</p>
                </div>
              )}
            </div>
            
            {/* Payment and Strategy Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="p-4 border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Debt Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-neutral-600">Total Debt</span>
                      <span className="font-medium">${totalDebt.toLocaleString()}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-neutral-600">Minimum Monthly Payment</span>
                      <span className="font-medium">${totalMinPayment.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Monthly Payment Budget</label>
                    <Input
                      type="number"
                      value={monthlyPayment}
                      onChange={(e) => setMonthlyPayment(e.target.value)}
                      className="mb-2"
                    />
                    {parseFloat(monthlyPayment) < totalMinPayment && (
                      <div className="text-sm text-red-500 flex items-center">
                        <span className="material-icons text-sm mr-1">warning</span>
                        Payment must be at least the minimum (${totalMinPayment})
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Button 
                      className="w-full"
                      onClick={handleNegotiateRates}
                    >
                      <span className="material-icons mr-2">support_agent</span>
                      Negotiate Lower Rates
                    </Button>
                    <p className="text-xs text-neutral-500 mt-2">
                      Our automated system will contact your creditors to negotiate lower interest rates on your behalf
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Payoff Strategy</h3>
                
                <Tabs defaultValue="snowball" onValueChange={setActiveStrategy}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="snowball" className="flex-1">Snowball</TabsTrigger>
                    <TabsTrigger value="avalanche" className="flex-1">Avalanche</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="snowball">
                    <div className="space-y-3">
                      <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-100" variant="outline">
                        Recommended for Beginners
                      </Badge>
                      <p className="text-sm">
                        The <strong>Debt Snowball</strong> method focuses on paying off your smallest debts first, 
                        regardless of interest rate. This creates quick wins and helps build motivation.
                      </p>
                      <div className="pl-4 border-l-2 border-primary-100 text-sm">
                        <p className="font-medium text-primary-700">Key Benefits:</p>
                        <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                          <li>Psychological wins keep you motivated</li>
                          <li>Reduces the number of monthly bills faster</li>
                          <li>Simple to understand and implement</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="avalanche">
                    <div className="space-y-3">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100" variant="outline">
                        Mathematically Optimal
                      </Badge>
                      <p className="text-sm">
                        The <strong>Debt Avalanche</strong> method focuses on paying off debts with the highest interest 
                        rates first. This minimizes the total interest you'll pay over time.
                      </p>
                      <div className="pl-4 border-l-2 border-blue-100 text-sm">
                        <p className="font-medium text-blue-700">Key Benefits:</p>
                        <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                          <li>Minimizes total interest paid</li>
                          <li>Mathematically the most efficient approach</li>
                          <li>Can result in faster overall payoff</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Strategy comparison */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Strategy Comparison</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={comparisonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "months") return [`${value} months`, "Time to payoff"];
                          if (name === "interest") return [`$${value}`, "Interest paid"];
                          return [value, name];
                        }}
                      />
                      <Bar dataKey="months" fill="#8884d8" name="months" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payoff visualization */}
      {payoffData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payoff Projection</CardTitle>
            <CardDescription>
              {activeStrategy === "snowball" 
                ? "Debt Snowball Method: Paying smallest balances first" 
                : "Debt Avalanche Method: Paying highest interest rates first"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="text-sm text-neutral-500 mb-1">Time to Debt Freedom</div>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold">{monthsToPayoff}</span>
                    <span className="text-neutral-700 ml-1">months</span>
                  </div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="text-sm text-neutral-500 mb-1">Total Interest Paid</div>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold">${Math.round(totalInterestPaid).toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="text-sm text-neutral-500 mb-1">Debt-Free Date</div>
                  <div className="flex items-end">
                    <span className="text-2xl font-bold">
                      {new Date(Date.now() + monthsToPayoff * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payoffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    label={{ value: 'Months', position: 'insideBottomRight', offset: -10 }} 
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value / 1000}k`}
                    label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === "remainingDebt") return [`$${Math.round(value as number).toLocaleString()}`, "Remaining Debt"];
                      if (name === "interestPaid") return [`$${Math.round(value as number).toLocaleString()}`, "Interest Paid"];
                      if (name === "principalPaid") return [`$${Math.round(value as number).toLocaleString()}`, "Principal Paid"];
                      return [value, name];
                    }}
                    labelFormatter={(month) => `Month ${month}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="remainingDebt" 
                    name="Remaining Debt" 
                    stroke="#ff0000" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="interestPaid" 
                    name="Interest Paid" 
                    stroke="#ff9900" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="principalPaid" 
                    name="Principal Paid" 
                    stroke="#00aa00" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="text-sm text-neutral-500">
                Projection based on your current debt and payment strategy
              </div>
              <Button>
                <span className="material-icons mr-2">save</span>
                Save This Plan
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}