import { useGetDimensionalTimeline, useGetAnalyticsSummary, useGetCurrentVector } from "@workspace/api-client-react";
import { BarChart, Activity, Hexagon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const { data: timeline, isLoading: timelineLoading } = useGetDimensionalTimeline();
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummary();
  const { data: vector } = useGetCurrentVector();

  const chartData = timeline?.dataPoints?.map(point => ({
    date: format(new Date(point.date), 'MMM dd'),
    score: point.overallScore,
    magnitude: point.vectorMagnitude,
  })) || [];

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Telemetry</h1>
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Transformation Trajectory Analysis</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners text-center">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Pattern Locks</div>
          <div className="text-4xl font-serif text-primary">{summaryLoading ? "-" : summary?.patternLocksResolved || 0}</div>
          <div className="font-mono text-[9px] text-primary/70 uppercase mt-2">Resolved</div>
        </div>
        <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners text-center">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Total Trans. Score</div>
          <div className="text-4xl font-serif text-accent">{summaryLoading ? "-" : summary?.totalTransformationScore || 0}</div>
          <div className="font-mono text-[9px] text-accent/70 uppercase mt-2">Cumulative</div>
        </div>
        <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners text-center">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Active Intentions</div>
          <div className="text-4xl font-serif text-secondary">{summaryLoading ? "-" : summary?.intentionsActive || 0}</div>
          <div className="font-mono text-[9px] text-secondary/70 uppercase mt-2">Standing Waves</div>
        </div>
        <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners text-center">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Vector Stability</div>
          <div className="text-4xl font-serif text-primary">{vector?.stability ? (vector.stability * 100).toFixed(0) : "0"}%</div>
          <div className="font-mono text-[9px] text-primary/70 uppercase mt-2">Coherence Margin</div>
        </div>
      </div>

      <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners mt-2">
        <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-6 flex items-center">
          <BarChart className="w-4 h-4 mr-2" />
          Dimensional Evolution Trajectory
        </h3>

        <div className="h-[400px] w-full">
          {timelineLoading ? (
            <div className="h-full flex items-center justify-center font-mono text-primary/50 text-xs uppercase">Computing trajectory...</div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="var(--font-mono)"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="var(--font-mono)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--primary)/0.5)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    borderRadius: '0',
                    textTransform: 'uppercase'
                  }} 
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  name="Coherence"
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="magnitude" 
                  name="Magnitude"
                  stroke="hsl(var(--accent))" 
                  fillOpacity={1} 
                  fill="url(#colorMag)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Activity className="w-12 h-12 text-primary/20 mb-4" />
              <span className="font-mono text-primary/50 text-xs uppercase tracking-widest">Insufficient data points</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
