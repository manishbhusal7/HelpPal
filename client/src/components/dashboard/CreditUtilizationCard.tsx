import { useQuery } from "@tanstack/react-query";

interface CreditUtilizationCardProps {
  userId: number | undefined;
}

export default function CreditUtilizationCard({ userId }: CreditUtilizationCardProps) {
  const { data: utilization, isLoading: isLoadingUtilization } = useQuery({
    queryKey: [`/api/users/${userId}/credit-utilization`],
    enabled: !!userId,
  });

  const { data: creditCards, isLoading: isLoadingCards } = useQuery({
    queryKey: [`/api/users/${userId}/credit-cards`],
    enabled: !!userId,
  });

  const isLoading = isLoadingUtilization || isLoadingCards;

  if (isLoading || !utilization) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-neutral-200 rounded"></div>
          <div className="h-5 w-16 bg-neutral-200 rounded-full"></div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-16 bg-neutral-200 rounded"></div>
            <div className="h-4 w-8 bg-neutral-200 rounded"></div>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full mb-6"></div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                <div className="h-4 w-8 bg-neutral-200 rounded"></div>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                <div className="h-4 w-8 bg-neutral-200 rounded"></div>
              </div>
              <div className="w-full h-2 bg-neutral-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status styles mapping
  const statusStyles = {
    high: "text-xs font-medium text-warning-500 px-2 py-1 bg-orange-50 rounded-full",
    moderate: "text-xs font-medium text-accent-500 px-2 py-1 bg-amber-50 rounded-full",
    good: "text-xs font-medium text-success-500 px-2 py-1 bg-green-50 rounded-full",
    none: "text-xs font-medium text-neutral-500 px-2 py-1 bg-neutral-50 rounded-full"
  };

  const statusText = {
    high: "High",
    moderate: "Moderate",
    good: "Good",
    none: "No Data"
  };

  // Function to determine bar color
  const getBarColor = (utilization: number) => {
    if (utilization > 50) return "bg-accent-600"; // High (warning)
    if (utilization > 30) return "bg-accent-500"; // Moderate (caution)
    return "bg-secondary-500"; // Good (success)
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Credit Utilization</h2>
        <div className={statusStyles[utilization.status as keyof typeof statusStyles]}>
          {statusText[utilization.status as keyof typeof statusText]}
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-neutral-500">Overall</span>
          <span className="text-sm font-semibold text-neutral-900">{utilization.overall}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-100 rounded-full mb-6">
          <div 
            className={`${getBarColor(utilization.overall)} h-2 rounded-full`} 
            style={{ width: `${utilization.overall}%` }}
          ></div>
        </div>
        
        {creditCards && creditCards.map((card: any) => (
          <div className="mb-4" key={card.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="material-icons text-neutral-400 mr-2">credit_card</span>
                <span className="text-sm text-neutral-700">{card.name}</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900">{card.utilization}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 rounded-full">
              <div 
                className={`${getBarColor(card.utilization)} h-2 rounded-full`}
                style={{ width: `${card.utilization}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 text-xs text-primary-600 flex items-center cursor-pointer hover:underline">
          <span>View all accounts</span>
          <span className="material-icons text-sm ml-1">chevron_right</span>
        </div>
      </div>
    </div>
  );
}
