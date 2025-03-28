import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subMonths } from "date-fns";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  TooltipProps,
  ReferenceLine,
  Label,
  ReferenceArea 
} from "recharts";

interface CreditScoreProps {
  userId: number | undefined;
}

// Define data interfaces
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatarInitials: string;
  creditScore: number;
  creditScoreStatus: string;
}

interface ScoreHistoryPoint {
  month: string;
  score: number;
}

interface ScoreRange {
  y1: number;
  y2: number;
  label: string;
  color: string;
}

export default function CreditScore({ userId }: CreditScoreProps) {
  const { data: user, isLoading } = useQuery<User>({
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
  const generateHistoricalData = (): ScoreHistoryPoint[] => {
    const currentScore = user.creditScore; // 650
    const now = new Date();
    
    // Create a realistic declining trend from 678 nine months ago to current 650
    const scoreProgressions: (number | null)[] = [
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
      
      let score: number;
      if (i < 10) {
        // Past and current scores with small variations
        const variation = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const baseScore = scoreProgressions[i] !== null ? scoreProgressions[i] as number : 650;
        score = baseScore + variation;
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

  // Define score range data for the chart
  const scoreRanges = [
    { y1: 800, y2: 850, label: "Excellent", color: "#10B981" }, // Emerald 
    { y1: 740, y2: 799, label: "Very Good", color: "#22C55E" }, // Green
    { y1: 670, y2: 739, label: "Good", color: "#84CC16" },      // Lime
    { y1: 580, y2: 669, label: "Fair", color: "#F59E0B" },      // Amber
    { y1: 300, y2: 579, label: "Poor", color: "#EF4444" }       // Red
  ];

  // Format tooltip for the chart
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-neutral-200">
          <p className="text-sm font-semibold">{data.month}</p>
          <p className="text-sm text-neutral-700">Score: <span className="font-medium">{data.score}</span></p>
          <p className="text-xs text-neutral-500 mt-1">
            {data.score >= 670 ? "Good standing" : data.score >= 580 ? "Action needed" : "Critical attention required"}
          </p>
        </div>
      );
    }
    return null;
  };

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
          <CardDescription>Your score over the last 12 months with future projection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historicalData}
                margin={{ top: 20, right: 5, left: 5, bottom: 30 }}
              >
                {/* Create background areas for each credit score range */}
                {scoreRanges.map((range, i) => (
                  <ReferenceArea
                    key={i}
                    y1={range.y1}
                    y2={range.y2}
                    fill={range.color}
                    fillOpacity={0.08}
                    strokeOpacity={0}
                  >
                    <Label
                      value={range.label}
                      position="insideRight"
                      fill={'#64748b'}
                      fontSize={11}
                      offset={5}
                    />
                  </ReferenceArea>
                ))}

                {/* Create the gradient for the area under the line */}
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                {/* Grid lines in the background */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                
                {/* X and Y axes */}
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={[300, 850]} 
                  ticks={[300, 580, 670, 740, 800, 850]} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickMargin={5}
                />

                {/* Current score reference line */}
                <ReferenceLine
                  y={user.creditScore}
                  stroke="#fb7185"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                >
                  <Label
                    value="Current: 650"
                    position="right"
                    fill="#fb7185"
                    fontSize={11}
                  />
                </ReferenceLine>

                {/* Tooltips and actual chart data */}
                <Tooltip content={<CustomTooltip />} />
                
                {/* Show data as an area chart with gradient */}
                <Area 
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  dot={{ r: 3, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-neutral-600">Historical Score</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-dashed border-rose-400 mr-2"></div>
              <span className="text-neutral-600">Current: {user.creditScore}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-400 mr-2"></div>
              <span className="text-neutral-600">Future Projection</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
