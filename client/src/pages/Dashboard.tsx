import CreditScoreCard from "@/components/dashboard/CreditScoreCard";
import CreditUtilizationCard from "@/components/dashboard/CreditUtilizationCard";
import IncomeMonitoringCard from "@/components/dashboard/IncomeMonitoringCard";
import CreditScoreSimulator from "@/components/simulator/CreditScoreSimulator";
import ActionItems from "@/components/dashboard/ActionItems";
import Notifications from "@/components/dashboard/Notifications";

interface DashboardProps {
  userId: number | undefined;
}

export default function Dashboard({ userId }: DashboardProps) {
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Dashboard</h2>
          <p className="text-sm text-neutral-500">Please wait while we load your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Credit Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CreditScoreCard userId={userId} />
        <CreditUtilizationCard userId={userId} />
        <IncomeMonitoringCard userId={userId} />
      </div>

      {/* Credit Score Simulator */}
      <CreditScoreSimulator userId={userId} />

      {/* Action Items and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionItems userId={userId} />
        <Notifications userId={userId} />
      </div>
    </>
  );
}
