import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

interface CreditUtilizationCardProps {
  userId: number | undefined;
}

interface CreditUtilization {
  overall: number;
  status: 'high' | 'moderate' | 'good' | 'none';
}

interface CreditCard {
  id: number;
  userId: number;
  name: string;
  balance: number;
  limit: number;
  utilization: number;
}

export default function CreditUtilizationCard({ userId }: CreditUtilizationCardProps) {
  const { data: utilization, isLoading: isLoadingUtilization } = useQuery<CreditUtilization>({
    queryKey: [`/api/users/${userId}/credit-utilization`],
    enabled: !!userId,
  });

  const { data: creditCards, isLoading: isLoadingCards } = useQuery<CreditCard[]>({
    queryKey: [`/api/users/${userId}/credit-cards`],
    enabled: !!userId,
  });

  const isLoading = isLoadingUtilization || isLoadingCards;

  if (isLoading || !utilization) {
    return (
      <Card className="shadow-md card-hover border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-5 w-20 bg-neutral-200 rounded-full animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse"></div>
              <div className="h-4 w-8 bg-neutral-200 rounded animate-pulse"></div>
            </div>
            <div className="w-full h-3 bg-neutral-200 rounded-full mb-6 animate-pulse"></div>
            
            <div className="space-y-6">
              {[1, 2].map((item) => (
                <div key={item}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-neutral-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-full h-3 bg-neutral-200 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status configuration
  const statusConfig = {
    high: {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      icon: "warning",
      text: "High Risk",
      description: "Consider paying down cards"
    },
    moderate: {
      color: "text-amber-500",
      bgColor: "bg-amber-100",
      icon: "info",
      text: "Moderate",
      description: "Room for improvement"
    },
    good: {
      color: "text-success",
      bgColor: "bg-success/10",
      icon: "check_circle",
      text: "Good",
      description: "Keep it up!"
    },
    none: {
      color: "text-neutral-500",
      bgColor: "bg-neutral-100",
      icon: "help_outline",
      text: "No Data",
      description: "Add your accounts"
    }
  };

  // Get status configuration
  const status = statusConfig[utilization?.status || 'none' as keyof typeof statusConfig];

  // Function to determine bar color and style
  const getBarStyles = (utilizationValue: number) => {
    if (utilizationValue > 50) {
      return {
        color: "from-amber-400 to-destructive",
        width: `${utilizationValue}%`,
        animation: utilizationValue > 70 ? "pulse 2s infinite" : ""
      };
    }
    if (utilizationValue > 30) {
      return {
        color: "from-amber-300 to-amber-500",
        width: `${utilizationValue}%`,
        animation: ""
      };
    }
    return {
      color: "from-secondary to-success",
      width: `${utilizationValue}%`,
      animation: ""
    };
  };

  return (
    <Card className="shadow-md card-hover border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center">
            <span className="material-icons mr-2 text-primary">insights</span>
            Credit Utilization
          </CardTitle>
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}>
            <span className="material-icons text-xs mr-1">{status.icon}</span>
            {status.text}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-sm font-medium text-neutral-700">Overall Utilization</span>
              <div className="ml-2 relative group">
                <span className="material-icons text-xs text-neutral-400 cursor-help">help_outline</span>
                <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 w-48 p-2 bg-black text-white text-xs rounded shadow-lg z-10">
                  Experts recommend keeping utilization below 30% to maintain a good credit score.
                </div>
              </div>
            </div>
            <div className="text-lg font-bold">
              <span className={utilization?.overall && utilization.overall > 50 ? "text-destructive" : utilization?.overall && utilization.overall > 30 ? "text-amber-500" : "text-success"}>
                {utilization?.overall || 0}%
              </span>
            </div>
          </div>
          
          <div className="relative w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${getBarStyles(utilization?.overall || 0).color}`} 
              style={{ 
                width: getBarStyles(utilization?.overall || 0).width,
                animation: getBarStyles(utilization?.overall || 0).animation
              }}
            ></div>
            
            {/* Indicator marks for good utilization threshold */}
            <div className="absolute top-0 bottom-0 left-[30%] border-l border-dashed border-neutral-400 z-10">
              <div className="absolute top-4 -left-3 text-[10px] text-neutral-500">30%</div>
            </div>
          </div>
          
          <p className="text-xs text-neutral-500 mt-1 italic">
            {status.description}
          </p>
        </div>
        
        <div className="space-y-5">
          <h3 className="text-sm font-medium text-neutral-500 mb-3">Individual Cards</h3>
          
          {creditCards && creditCards.map((card: any) => (
            <div key={card.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                    <span className="material-icons text-neutral-600">credit_card</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-neutral-800">{card.name}</span>
                    <div className="flex items-center text-xs text-neutral-500">
                      <span>${card.balance.toLocaleString()}</span>
                      <span className="mx-1">of</span>
                      <span>${card.limit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  card.utilization > 50 ? "text-destructive" : 
                  card.utilization > 30 ? "text-amber-500" : 
                  "text-success"
                }`}>
                  {card.utilization}%
                </span>
              </div>
              
              <div className="relative w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${getBarStyles(card.utilization).color}`} 
                  style={{ 
                    width: getBarStyles(card.utilization).width,
                    animation: getBarStyles(card.utilization).animation
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-5 pt-3 border-t border-neutral-100">
          <Link href="/accounts" className="text-xs font-medium text-primary flex items-center hover:underline">
            <span>View all accounts</span>
            <span className="material-icons text-sm ml-1">chevron_right</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
