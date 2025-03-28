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

  // Generate historical data with realistic downward trend for a 650 score
  const generateHistoricalData = () => {
    const currentScore = user.creditScore; // 650
    const now = new Date();
    
    // Create a realistic declining trend from 678 nine months ago to current 650
    const scoreProgressions = [
      678, // 9 months ago (starting better)
      673, // 8 months ago
      676, // 7 months ago (small improvement)
      671, // 6 months ago
      665, // 5 months ago
      662, // 4 months ago
      658, // 3 months ago
      654, // 2 months ago
      652, // 1 month ago
      650, // Current score
      null, // Future projection (next month) - will be calculated
      null  // Future projection (2 months) - will be calculated
    ];
    
    // Add small random variations to make it look realistic
    return Array.from({ length: 12 }).map((_, i) => {
      const month = subMonths(now, 11 - i);
      
      let score;
      if (i < 10) {
        // Past and current scores with small variations
        const variation = Math.floor(Math.random() * 3) - 1; // -1 to +1
        score = scoreProgressions[i] + variation;
      } else {
        // Future projections with continued decline if no action taken
        const projectedScore = currentScore - (4 + Math.floor(Math.random() * 3)); // -4 to -6 points
        score = Math.max(580, projectedScore); // Don't let it drop below 580 too quickly
      }
      
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
                  <span className="text-sm font-medium text-warning-500">Fair</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: "68%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">You have 2 late payments in the last 12 months</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Credit Utilization</span>
                  <span className="text-sm font-medium text-danger-500">Poor</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-danger-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Your 78% utilization is significantly hurting your score</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Credit Age</span>
                  <span className="text-sm font-medium text-warning-500">Fair</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Average account age is 2 years 4 months</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Account Mix</span>
                  <span className="text-sm font-medium text-warning-500">Fair</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: "55%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Limited credit types affecting your score</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Recent Inquiries</span>
                  <span className="text-sm font-medium text-warning-500">Fair</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">3 credit inquiries in the last 6 months</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Collections Accounts</span>
                  <span className="text-sm font-medium text-danger-500">Poor</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full">
                  <div className="bg-danger-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">1 active collections account from 2019</p>
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
