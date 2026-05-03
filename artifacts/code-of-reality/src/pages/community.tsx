import { useListThreads, useListThreadPosts, useCreateThread, useCreatePost, useGetPlanetaryResonance } from "@workspace/api-client-react";
import { MessageSquare, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function CommunityPage() {
  const { data: resonance, isLoading: resonanceLoading } = useGetPlanetaryResonance();
  const { data: threads, isLoading: threadsLoading } = useListThreads();

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Collective Matrix</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Planetary Resonance & Phase Forums</p>
        </div>
        <Button 
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 mr-2" /> Transmit Signal
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05)_0%,transparent_70%)]" />
            <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-6 flex items-center relative z-10">
              <Globe className="w-4 h-4 mr-2" />
              Planetary Resonance
            </h3>
            
            <div className="flex flex-col items-center justify-center py-4 relative z-10">
              <div className="text-6xl font-serif text-primary mb-2">
                {resonanceLoading ? "--" : resonance?.overallResonance?.toFixed(1) || "0.0"}
              </div>
              <div className="font-mono text-[10px] text-primary/70 uppercase tracking-widest px-3 py-1 border border-primary/30 bg-primary/10">
                {resonance?.resonanceLevel || "CALIBRATING"}
              </div>
            </div>

            <div className="mt-6 space-y-2 relative z-10">
              <div className="font-mono text-[9px] text-muted-foreground uppercase mb-2">Phase Distribution</div>
              {resonance?.collectivePhaseDistribution?.map((dist) => (
                <div key={dist.phase} className="flex items-center text-xs">
                  <span className="font-mono text-muted-foreground w-12">PHASE {dist.phase}</span>
                  <div className="flex-1 h-1 bg-primary/10 mx-2">
                    <div className="h-full bg-primary/50" style={{ width: `${dist.percentage}%` }} />
                  </div>
                  <span className="font-mono text-primary w-8 text-right">{dist.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners">
          <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-6 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Phase-Gated Transmissions
          </h3>

          {threadsLoading ? (
            <div className="h-64 flex items-center justify-center font-mono text-primary/50 text-xs uppercase">Receiving signals...</div>
          ) : threads?.length ? (
            <div className="space-y-4">
              {threads.map(thread => (
                <div key={thread.id} className="border border-border/20 bg-background/30 p-4 hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{thread.title}</h4>
                    <span className="font-mono text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 uppercase">
                      Phase {thread.phase}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">By: {thread.authorName}</span>
                      {thread.tags && thread.tags.length > 0 && (
                        <div className="flex gap-2">
                          {thread.tags.map(tag => (
                            <span key={tag} className="font-mono text-[9px] text-primary/60 uppercase">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground uppercase">
                      <span>{thread.postCount} Responses</span>
                      <span>{format(new Date(thread.lastActivityAt!), 'MM.dd.yy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="font-mono text-xs text-muted-foreground uppercase">No transmissions found in this phase vector.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
