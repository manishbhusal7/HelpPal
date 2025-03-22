import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface IncomeMonitoringCardProps {
  userId: number | undefined;
}

export default function IncomeMonitoringCard({ userId }: IncomeMonitoringCardProps) {
  const { data: incomeSummary, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/income/summary`],
    enabled: !!userId,
  });

  if (isLoading || !incomeSummary) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-neutral-200 rounded"></div>
          <div className="h-5 w-16 bg-neutral-200 rounded-full"></div>
        </div>
        
        <div className="flex-1">
          <div className="h-4 w-40 bg-neutral-200 rounded mb-4"></div>
          <div className="h-32 bg-neutral-200 rounded"></div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="h-3 w-20 bg-neutral-200 rounded mb-1"></div>
              <div className="h-4 w-24 bg-neutral-200 rounded"></div>
            </div>
            <div>
              <div className="h-3 w-20 bg-neutral-200 rounded mb-1"></div>
              <div className="h-4 w-24 bg-neutral-200 rounded"></div>
            </div>
            <div>
              <div className="h-3 w-20 bg-neutral-200 rounded mb-1"></div>
              <div className="h-4 w-24 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { lastDeposit, nextExpected } = incomeSummary;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Income Monitoring</h2>
        <div className="text-xs font-medium text-success-500 px-2 py-1 bg-green-50 rounded-full">Normal</div>
      </div>
      
      <div className="flex-1">
        <div className="text-sm text-neutral-500 mb-4">Monthly Income Pattern</div>
        <div className="h-32 overflow-hidden">
          <svg viewBox="0 0 300 120" className="w-full h-full">
            <path d="M0,100 L20,90 L40,95 L60,80 L80,85 L100,75 L120,70 L140,65 L160,60 L180,55 L200,50 L220,45 L240,40 L260,45 L280,40 L300,35" fill="none" stroke="#1976D2" strokeWidth="2" />
            <path d="M0,100 L20,90 L40,95 L60,80 L80,85 L100,75 L120,70 L140,65 L160,60 L180,55 L200,50 L220,45 L240,40 L260,45 L280,40 L300,35" fill="url(#gradient)" fillOpacity="0.2" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1976D2" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1976D2" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="text-xs text-neutral-500">Last Deposit</div>
            <div className="text-sm font-semibold text-neutral-900">{lastDeposit ? formatDate(lastDeposit.date) : "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Amount</div>
            <div className="text-sm font-semibold text-neutral-900">{lastDeposit ? formatCurrency(lastDeposit.amount) : "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Next Expected</div>
            <div className="text-sm font-semibold text-neutral-900">{nextExpected ? formatDate(nextExpected.date) : "N/A"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
