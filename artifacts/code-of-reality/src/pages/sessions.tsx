import { useListSessions, useGetSessionStats } from "@workspace/api-client-react";
import { Clock, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function SessionsPage() {
  const { data: sessions, isLoading: sessionsLoading } = useListSessions();
  const { data: stats, isLoading: statsLoading } = useGetSessionStats();

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Practice Matrix</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Session Telemetry & Analytics</p>
        </div>
        <Button 
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest"
        >
          <Activity className="w-4 h-4 mr-2" /> Log Session
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex flex-col items-center justify-center">
            <Zap className="w-8 h-8 text-accent mb-4" />
            <div className="text-6xl font-serif text-accent mb-2">
              {statsLoading ? "-" : stats?.streakDays || 0}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Consecutive Days
            </div>
          </div>
          
          <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners">
             <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-4">Total Time In-Matrix</h3>
             <div className="text-4xl font-serif text-primary mb-2">
                {statsLoading ? "--" : Math.floor((stats?.totalMinutes || 0) / 60)}<span className="text-xl text-primary/50">H</span> {(stats?.totalMinutes || 0) % 60}<span className="text-xl text-primary/50">M</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners">
          <h3 className="font-mono text-xs text-primary/80 uppercase tracking-widest mb-6 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Session History
          </h3>

          {sessionsLoading ? (
            <div className="h-64 flex items-center justify-center font-mono text-primary/50 text-xs uppercase">Retrieving logs...</div>
          ) : sessions?.length ? (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-border/20 bg-background/30 hover:bg-primary/5 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-primary/20 flex items-center justify-center bg-primary/5 clip-corners">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-foreground uppercase">{session.type}</div>
                      <div className="font-mono text-[9px] text-muted-foreground uppercase">Phase {session.phase}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-mono text-xs text-primary">{session.durationMinutes} MIN</div>
                    <div className="font-mono text-[9px] text-muted-foreground uppercase mt-1">
                      {format(new Date(session.createdAt!), 'MM.dd.yy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="font-mono text-xs text-muted-foreground uppercase">No sessions logged yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
