import { useGetIdentityGeometry, useGetCoherenceAudit } from "@workspace/api-client-react";
import { User, AlertTriangle, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IdentityPage() {
  const { data: geometry, isLoading: geomLoading } = useGetIdentityGeometry();
  const { data: audit, isLoading: auditLoading } = useGetCoherenceAudit();

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Identity Architecture</h1>
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Coherence Audit & Gap Analysis</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,47,190,0.1)_0%,transparent_70%)]" />
          
          <h3 className="absolute top-6 left-6 font-mono text-xs text-accent/80 uppercase tracking-widest flex items-center z-10">
            <User className="w-4 h-4 mr-2" />
            Current Construct
          </h3>

          {geomLoading ? (
            <div className="font-mono text-accent/50 uppercase text-xs tracking-widest animate-pulse">Rendering geometry...</div>
          ) : geometry ? (
            <div className="flex flex-col items-center z-10">
              <Hexagon className="w-32 h-32 text-accent/40 mb-6" strokeWidth={1} />
              <div className="text-center">
                <div className="text-5xl font-serif text-accent mb-2">{geometry.coherenceScore}</div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Global Coherence</div>
              </div>
              <div className="mt-6 px-4 py-1 border border-accent/30 bg-accent/10 font-mono text-[10px] text-accent uppercase tracking-widest">
                Shape Type: {geometry.shapeType || "AMORPHOUS"}
              </div>
            </div>
          ) : (
            <div className="font-mono text-muted-foreground text-xs uppercase text-center z-10">No identity geometry constructed.</div>
          )}
        </div>

        <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners">
          <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-6 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Coherence Gaps
          </h3>

          {auditLoading ? (
            <div className="font-mono text-primary/50 text-xs uppercase">Analyzing structural integrity...</div>
          ) : audit?.gaps?.length ? (
            <div className="space-y-4">
              {audit.gaps.map((gap, i) => (
                <div key={i} className="border border-border/30 bg-background/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-foreground uppercase tracking-wider">{gap.dimensionName}</span>
                    <span className={cn(
                      "font-mono text-[9px] uppercase px-2 py-0.5 border",
                      gap.severity === 'critical' ? "text-destructive border-destructive/50 bg-destructive/10" :
                      gap.severity === 'high' ? "text-orange-500 border-orange-500/50 bg-orange-500/10" :
                      "text-yellow-500 border-yellow-500/50 bg-yellow-500/10"
                    )}>
                      {gap.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex-1 text-center">
                      <div className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Identity</div>
                      <div className="font-mono text-sm text-primary">{gap.identityScore}</div>
                    </div>
                    <div className="flex-1 h-px bg-border relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] bg-background px-1 text-destructive">
                        Δ {gap.gapMagnitude}
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Intention</div>
                      <div className="font-mono text-sm text-accent">{gap.intentionScore}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-primary/20 bg-primary/5">
              <span className="font-mono text-xs text-primary/70 uppercase">Total structural coherence achieved. No gaps detected.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
