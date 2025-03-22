import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subMonths } from "date-fns";

interface CreditScoreProps {
  userId: number | undefined;
}

export default function CreditScore({ userId }: CreditScoreProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId
  });

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Loading Credit Score</h2>
          <p className="text-sm text-neutral-500">Please wait...</p>
        </div>
      </div>
    );
  }

  // Generate mock historical data for the chart
  const generateHistoricalData = () => {
    const currentScore = user.creditScore;
    const now = new Date();
    
    // Generate data for the last 12 months with some realistic variations
    return Array.from({ length: 12 }).map((_, i) => {
      const month = subMonths(now, 11 - i);
      
      // Calculate a score that trends toward the current score with some random variations
      const baseScore = i === 11 ? currentScore : currentScore - 20 + Math.floor(i * 2);
      const randomVariation = Math.floor(Math.random() * 15) - 5; // -5 to +10
      const score = Math.max(300, Math.min(850, baseScore + randomVariation));
      
      return {
        month: format(month, 'MMM yyyy'),
        score
      };
    });
  };

  const historicalData = generateHistoricalData();

  const creditScoreRanges = [
    { range: "300-579", label: "Poor", color: "bg-red-500" },
    { range: "580-669", label: "Fair", color: "bg-amber-500" },
    { range: "670-739", label: "Good", color: "bg-lime-500" },
    { range: "740-799", label: "Very Good", color: "bg-green-500" },
    { range: "800-850", label: "Excellent", color: "bg-emerald-500" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Credit Score</CardTitle>
            <CardDescription>Current score and details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <svg className="w-48 h-48" viewBox="0 0 100 100">
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
                    strokeDasharray={251.2} 
                    strokeDashoffset={(1 - (user.creditScore - 300) / 550) * 251.2}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-neutral-900">{user.creditScore}</span>
                  <span className="text-sm text-neutral-500">out of 850</span>
                </div>
              </div>
              
              <div className="w-full mt-4">
                <div className="flex w-full h-2 mb-2 overflow-hidden rounded-full">
                  {creditScoreRanges.map((range, index) => (
                    <div key={index} className={`${range.color} flex-1`}></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>300</span>
                  <span>850</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Score Breakdown</CardTitle>
            <CardDescription>Factors affecting your credit score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Payment History</span>
                  <span className="text-sm font-medium text-success-500">Excellent</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-success-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">You've made consistent on-time payments</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Credit Utilization</span>
                  <span className="text-sm font-medium text-warning-500">Fair</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Your credit utilization is higher than recommended</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Credit Age</span>
                  <span className="text-sm font-medium text-success-500">Good</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-success-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Average account age is 5 years 3 months</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Account Mix</span>
                  <span className="text-sm font-medium text-secondary-500">Very Good</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-secondary-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">You have a good mix of credit types</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Recent Inquiries</span>
                  <span className="text-sm font-medium text-success-500">Excellent</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-success-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">No recent credit inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Credit Score History</CardTitle>
          <CardDescription>Your score over the last 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <svg viewBox="0 0 800 300" className="w-full h-full">
              {/* X and Y axis */}
              <line x1="50" y1="250" x2="750" y2="250" stroke="#E1E4E8" strokeWidth="1" />
              <line x1="50" y1="50" x2="50" y2="250" stroke="#E1E4E8" strokeWidth="1" />
              
              {/* Score ranges background */}
              <rect x="50" y="50" width="700" height="40" fill="#EF4444" fillOpacity="0.1" />
              <rect x="50" y="90" width="700" height="40" fill="#F59E0B" fillOpacity="0.1" />
              <rect x="50" y="130" width="700" height="40" fill="#84CC16" fillOpacity="0.1" />
              <rect x="50" y="170" width="700" height="40" fill="#22C55E" fillOpacity="0.1" />
              <rect x="50" y="210" width="700" height="40" fill="#10B981" fillOpacity="0.1" />
              
              {/* Score ranges labels */}
              <text x="40" y="60" fontSize="10" textAnchor="end" fill="#6B7280">850</text>
              <text x="40" y="100" fontSize="10" textAnchor="end" fill="#6B7280">800</text>
              <text x="40" y="140" fontSize="10" textAnchor="end" fill="#6B7280">740</text>
              <text x="40" y="180" fontSize="10" textAnchor="end" fill="#6B7280">670</text>
              <text x="40" y="220" fontSize="10" textAnchor="end" fill="#6B7280">580</text>
              <text x="40" y="260" fontSize="10" textAnchor="end" fill="#6B7280">300</text>
              
              {/* Data points and line */}
              {historicalData.map((point, i) => {
                const x = 80 + i * 60;
                // Map score from 300-850 to 250-50 on the y-axis (inverted for SVG)
                const y = 250 - ((point.score - 300) / 550) * 200;
                
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#1976D2" />
                    {i > 0 && (
                      <line 
                        x1={80 + (i-1) * 60} 
                        y1={250 - ((historicalData[i-1].score - 300) / 550) * 200} 
                        x2={x} 
                        y2={y} 
                        stroke="#1976D2" 
                        strokeWidth="2" 
                      />
                    )}
                    <text x={x} y="270" fontSize="10" textAnchor="middle" fill="#6B7280">
                      {point.month}
                    </text>
                    <text x={x} y={y - 10} fontSize="10" textAnchor="middle" fill="#374151">
                      {point.score}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
