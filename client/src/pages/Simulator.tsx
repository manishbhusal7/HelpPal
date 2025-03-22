import CreditScoreSimulator from "@/components/simulator/CreditScoreSimulator";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
} from "@/components/ui/card";
import { format } from "date-fns";

interface SimulatorProps {
  userId: number | undefined;
}

export default function Simulator({ userId }: SimulatorProps) {
  const { data: simulations, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/simulations`],
    enabled: !!userId
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Credit Score Simulator</h1>
        <p className="text-neutral-500">See how different financial actions could impact your credit score.</p>
      </div>
      
      <CreditScoreSimulator userId={userId} />
      
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Saved Simulations</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <p className="text-sm text-neutral-500">Loading saved simulations...</p>
            </div>
          </div>
        ) : simulations && simulations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((simulation: any) => (
              <Card key={simulation.id}>
                <CardHeader>
                  <CardTitle className="text-base">Simulation from {formatDate(simulation.createdAt)}</CardTitle>
                  <CardDescription>
                    {simulation.potentialScore > simulation.baseScore 
                      ? `+${simulation.potentialScore - simulation.baseScore} points` 
                      : simulation.potentialScore < simulation.baseScore
                        ? `-${simulation.baseScore - simulation.potentialScore} points`
                        : "No change"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-500">Base Score</span>
                      <span className="text-sm font-medium">{simulation.baseScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-500">Potential Score</span>
                      <span className={`text-sm font-medium ${
                        simulation.potentialScore > simulation.baseScore 
                          ? "text-success-600" 
                          : simulation.potentialScore < simulation.baseScore
                            ? "text-danger-600"
                            : ""
                      }`}>
                        {simulation.potentialScore}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-neutral-100">
                      <h4 className="text-sm font-medium mb-2">Actions Taken:</h4>
                      <ul className="text-xs text-neutral-600 space-y-1">
                        {simulation.payDownDebt > 0 && (
                          <li className="flex items-center">
                            <span className="material-icons text-success-500 mr-1 text-sm">add_circle</span>
                            Pay down debt: ${simulation.payDownDebt.toLocaleString()}
                          </li>
                        )}
                        {simulation.newCreditCard && (
                          <li className="flex items-center">
                            <span className="material-icons text-danger-500 mr-1 text-sm">remove_circle</span>
                            Open new credit card
                          </li>
                        )}
                        {simulation.onTimePayments > 0 && (
                          <li className="flex items-center">
                            <span className="material-icons text-success-500 mr-1 text-sm">add_circle</span>
                            Make on-time payments: {simulation.onTimePayments} month{simulation.onTimePayments > 1 ? 's' : ''}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-lg shadow">
            <span className="material-icons text-neutral-400 text-4xl mb-2">history</span>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No Saved Simulations</h3>
            <p className="text-sm text-neutral-500">Use the simulator above and save your results to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
