import { useQuery } from "@tanstack/react-query";

interface CreditScoreCardProps {
  userId: number | undefined;
}

export default function CreditScoreCard({ userId }: CreditScoreCardProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId
  });

  if (isLoading || !user) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-neutral-200 rounded"></div>
          <div className="h-5 w-16 bg-neutral-200 rounded-full"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 bg-neutral-200 rounded-full mb-4"></div>
          <div className="w-full flex justify-between mb-1">
            <div className="h-3 w-8 bg-neutral-200 rounded"></div>
            <div className="h-3 w-16 bg-neutral-200 rounded"></div>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { creditScore, creditScoreStatus } = user;
  
  // Calculate percentage for the circle
  const maxScore = 850;
  const scorePercentage = (creditScore / maxScore) * 100;
  const circumference = 2 * Math.PI * 40; // r=40
  const offset = circumference - (scorePercentage / 100) * circumference;

  // Map status to display values
  const statusColors: Record<string, string> = {
    poor: "text-xs font-medium text-danger-500 px-2 py-1 bg-red-50 rounded-full",
    fair: "text-xs font-medium text-accent-500 px-2 py-1 bg-orange-50 rounded-full",
    good: "text-xs font-medium text-secondary-500 px-2 py-1 bg-secondary-50 rounded-full",
    very_good: "text-xs font-medium text-secondary-500 px-2 py-1 bg-secondary-50 rounded-full",
    excellent: "text-xs font-medium text-secondary-500 px-2 py-1 bg-secondary-50 rounded-full"
  };

  const statusText: Record<string, string> = {
    poor: "Poor",
    fair: "Fair",
    good: "Good",
    very_good: "Very Good",
    excellent: "Excellent"
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Credit Score</h2>
        <div className={statusColors[creditScoreStatus]}>{statusText[creditScoreStatus]}</div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <svg className="w-36 h-36" viewBox="0 0 100 100">
            <circle 
              className="text-neutral-100" 
              strokeWidth="10" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50"
            />
            <circle 
              className="text-secondary-500" 
              strokeWidth="10" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-neutral-900">{creditScore}</span>
            <span className="text-sm text-neutral-500">out of {maxScore}</span>
          </div>
        </div>
        <div className="w-full flex justify-between mb-1">
          <span className="text-xs text-neutral-500">Poor</span>
          <span className="text-xs text-neutral-500">Excellent</span>
        </div>
        <div className="w-full h-2 bg-neutral-100 rounded overflow-hidden">
          <div 
            className="bg-gradient-to-r from-red-500 via-amber-500 to-green-500 h-full rounded" 
            style={{ width: `${scorePercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
