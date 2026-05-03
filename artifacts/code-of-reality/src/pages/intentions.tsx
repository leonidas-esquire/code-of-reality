import { useState } from "react";
import { useListIntentions, useListConstellations, useCreateIntention } from "@workspace/api-client-react";
import { Target, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntentionsPage() {
  const { data: intentions, isLoading } = useListIntentions();
  const { data: constellations } = useListConstellations();
  const createMutation = useCreateIntention();
  
  return (
    <div className="flex flex-col gap-6 h-full">
      <header className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Intentionality Engine</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Quantum Vector Crystallization</p>
        </div>
        <Button 
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Intention
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners relative overflow-hidden">
          {/* Constellation View Mockup */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.1)_0%,transparent_70%)]" />
          <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-4 relative z-10">Harmonic Constellations</h3>
          
          <div className="h-[400px] flex items-center justify-center relative z-10">
            {constellations?.length ? (
              <div className="text-center font-mono text-primary/50 text-xs uppercase">Constellation map active</div>
            ) : (
              <div className="text-center flex flex-col items-center">
                <Target className="w-12 h-12 text-primary/20 mb-4" />
                <span className="font-mono text-primary/50 text-xs uppercase tracking-widest">No constellations crystallized</span>
                <span className="font-mono text-[10px] text-muted-foreground mt-2 uppercase">Create intentions to form geometric standing waves</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="sacred-border bg-card/60 backdrop-blur-md p-4 clip-corners">
            <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-4 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Active Vectors
            </h3>
            
            {isLoading ? (
              <div className="h-20 flex items-center justify-center font-mono text-[10px] text-primary/50 uppercase">Loading...</div>
            ) : intentions?.length ? (
              <div className="space-y-3">
                {intentions.map(intention => (
                  <div key={intention.id} className="border border-primary/20 bg-background/50 p-3 relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50" />
                    <div className="pl-2">
                      <h4 className="font-serif text-sm text-primary/90 truncate">{intention.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-mono text-[9px] text-muted-foreground uppercase">{intention.category}</span>
                        <span className="font-mono text-[9px] text-accent uppercase">Cryst: {intention.crystallizationScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <span className="font-mono text-[10px] text-muted-foreground uppercase">Zero active intentions</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
