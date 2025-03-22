import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GroceryScanner from "@/components/grocery/GroceryScanner";
import DebtPayoffStrategies from "@/components/debt/DebtPayoffStrategies";

interface ToolsProps {
  userId: number | undefined;
}

export default function Tools({ userId }: ToolsProps) {
  const [activeTab, setActiveTab] = useState<string>("grocery");
  
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Tools</h2>
          <p className="text-sm text-neutral-500">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Financial Tools</h1>
        <p className="text-neutral-500">Powerful tools to help you save money and manage debt</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="grocery">Grocery Scanner</TabsTrigger>
          <TabsTrigger value="debt">Debt Payoff Strategies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grocery">
          <GroceryScanner />
        </TabsContent>
        
        <TabsContent value="debt">
          <DebtPayoffStrategies />
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Coming Soon</CardTitle>
          <CardDescription>
            More financial tools are in development and will be available in future updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
              <h3 className="flex items-center text-base font-medium text-primary-800 mb-2">
                <span className="material-icons text-primary-500 mr-2">receipt_long</span>
                Tax Savings Calculator
              </h3>
              <p className="text-sm text-primary-700">
                Estimate potential tax deductions and optimize your tax strategy throughout the year
              </p>
            </div>
            
            <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
              <h3 className="flex items-center text-base font-medium text-primary-800 mb-2">
                <span className="material-icons text-primary-500 mr-2">savings</span>
                Investment Portfolio Optimizer
              </h3>
              <p className="text-sm text-primary-700">
                Get personalized investment recommendations and optimize your portfolio allocation
              </p>
            </div>
            
            <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
              <h3 className="flex items-center text-base font-medium text-primary-800 mb-2">
                <span className="material-icons text-primary-500 mr-2">school</span>
                Education Loan Repayment Planner
              </h3>
              <p className="text-sm text-primary-700">
                Develop a personalized repayment strategy for student loans and explore forgiveness options
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}