import { useGetAnalyticsSummary, useGetCurrentVector } from "@workspace/api-client-react";
import { E8Visualization } from "@/components/e8-visualization";
import { Hexagon, Activity, Network, Target, FileText } from "lucide-react";
import { Link } from "wouter";

export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsSummary();
  const { data: vector, isLoading: vectorLoading } = useGetCurrentVector();

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Background E8 Vis */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <E8Visualization />
      </div>

      <div className="z-10 flex flex-col gap-6 relative">
        <header className="mb-8">
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Command Center</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Global Reality Metrics</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Transformation Metrics */}
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex flex-col">
            <div className="flex items-center text-primary/80 mb-4">
              <Activity className="w-5 h-5 mr-2" />
              <h2 className="font-mono text-xs uppercase tracking-widest">Coherence Level</h2>
            </div>
            <div className="text-5xl font-serif text-primary mt-auto">
              {analyticsLoading ? "--" : analytics?.overallCoherenceScore?.toFixed(1) || "0.0"}
            </div>
            <div className="mt-4 h-1 w-full bg-primary/20">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${(analytics?.overallCoherenceScore || 0) * 10}%` }}
              />
            </div>
          </div>

          {/* Current Phase */}
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex flex-col">
            <div className="flex items-center text-secondary/80 mb-4">
              <Hexagon className="w-5 h-5 mr-2" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-secondary">Current Phase</h2>
            </div>
            <div className="text-5xl font-serif text-secondary mt-auto">
              {analyticsLoading ? "-" : analytics?.currentPhase || 1}
              <span className="text-lg text-secondary/50 ml-2">/ 8</span>
            </div>
            <div className="mt-4 font-mono text-xs text-secondary/70 uppercase">
              Transformation Stage
            </div>
          </div>

          {/* Reality Vector */}
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex flex-col">
            <div className="flex items-center text-accent/80 mb-4">
              <Network className="w-5 h-5 mr-2" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent">Vector Magnitude</h2>
            </div>
            <div className="text-5xl font-serif text-accent mt-auto">
              {vectorLoading ? "--" : vector?.magnitude?.toFixed(2) || "0.00"}
            </div>
            <div className="mt-4 font-mono text-xs text-accent/70 uppercase flex justify-between">
              <span>Stability</span>
              <span>{vector?.stability || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners">
            <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-4">Dimensional Timeline</h3>
            <div className="h-48 flex items-center justify-center border border-primary/20 bg-primary/5">
              <span className="font-mono text-xs text-primary/50 uppercase">Timeline visualization active</span>
            </div>
          </div>

          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners">
            <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/assessment" className="flex flex-col items-center justify-center p-4 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-colors clip-corners">
                <Target className="w-6 h-6 mb-2" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-center">Run Dimensional Scan</span>
              </Link>
              <Link href="/journal" className="flex flex-col items-center justify-center p-4 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-colors clip-corners">
                <Activity className="w-6 h-6 mb-2" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-center">Log Session</span>
              </Link>
              <Link
                href="/guide"
                className="col-span-2 flex items-center justify-center gap-3 p-4 transition-colors clip-corners"
                style={{
                  border: "1px solid rgba(212,175,55,0.4)",
                  background: "rgba(212,175,55,0.07)",
                  color: "#d4af37",
                }}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-mono text-[10px] uppercase tracking-widest">Platform User Guide</div>
                  <div className="font-mono text-[9px] uppercase tracking-wider opacity-60 mt-0.5">Read online or download PDF</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
