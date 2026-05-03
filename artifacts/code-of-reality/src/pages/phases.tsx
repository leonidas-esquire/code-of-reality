import { useListPhases, useGetCurrentPhase } from "@workspace/api-client-react";
import { E8Visualization } from "@/components/e8-visualization";
import { Hexagon, Lock, Unlock } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function PhasesPage() {
  const { data: phases, isLoading: phasesLoading } = useListPhases();
  const { data: currentPhase, isLoading: currentLoading } = useGetCurrentPhase();

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <E8Visualization />
      </div>

      <div className="z-10 flex flex-col gap-6 relative">
        <header className="mb-8">
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Ascension Pathway</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">The 8 Stages of Transformation</p>
        </header>

        {phasesLoading || currentLoading ? (
          <div className="flex items-center justify-center h-64 font-mono text-primary/50 uppercase tracking-widest">
            Synchronizing with reality matrix...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {phases?.map((phase) => {
              const isCurrent = currentPhase?.phase === phase.phase;
              const isCompleted = phase.isCompleted;
              const isLocked = !phase.isUnlocked;

              return (
                <div 
                  key={phase.phase}
                  className={cn(
                    "sacred-border p-6 clip-corners flex flex-col relative transition-all duration-500",
                    isCurrent ? "bg-primary/20 border-primary/50 shadow-[0_0_30px_var(--primary)_inset]" : 
                    isCompleted ? "bg-secondary/10 border-secondary/30" : 
                    "bg-card/40 border-border/20 opacity-70 grayscale",
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 border border-primary/50 flex items-center justify-center clip-corners bg-background/50">
                      <span className="font-serif text-xl text-primary">{phase.phase}</span>
                    </div>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : isCompleted ? (
                      <Hexagon className="w-4 h-4 text-secondary fill-secondary/20" />
                    ) : (
                      <Unlock className="w-4 h-4 text-primary" />
                    )}
                  </div>

                  <h3 className={cn(
                    "font-serif text-xl tracking-wide mb-2",
                    isCurrent ? "text-primary" : isCompleted ? "text-secondary" : "text-muted-foreground"
                  )}>
                    {phase.name}
                  </h3>
                  
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-6 flex-1 line-clamp-3">
                    {phase.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex justify-between font-mono text-[10px] text-primary/70 uppercase mb-2">
                      <span>Coherence</span>
                      <span>{phase.percentComplete}%</span>
                    </div>
                    <div className="h-1 w-full bg-primary/10">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          isCompleted ? "bg-secondary" : "bg-primary"
                        )}
                        style={{ width: `${phase.percentComplete}%` }}
                      />
                    </div>
                    
                    {!isLocked && (
                      <Link 
                        href={`/chapters/${phase.phase}`}
                        className="mt-4 block w-full text-center py-2 border border-primary/30 hover:bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest transition-colors clip-corners"
                      >
                        {isCompleted ? "Review Matrix" : "Enter Matrix"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
