import { useListAchievements } from "@workspace/api-client-react";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useListAchievements();

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Hall of Coherence</h1>
        <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Architectural Milestones</p>
      </header>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center font-mono text-primary/50 uppercase tracking-widest">
          Accessing secure records...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements?.map((achievement) => (
            <div 
              key={achievement.id}
              className={cn(
                "sacred-border p-6 clip-corners flex items-start gap-4 transition-all duration-300",
                achievement.isEarned 
                  ? "bg-card/60 border-secondary/30 backdrop-blur-md" 
                  : "bg-background/40 border-border/20 grayscale opacity-60"
              )}
            >
              <div className={cn(
                "w-12 h-12 flex items-center justify-center border clip-corners shrink-0",
                achievement.isEarned 
                  ? "border-secondary text-secondary bg-secondary/10 shadow-[0_0_15px_var(--secondary)_inset]" 
                  : "border-muted-foreground text-muted-foreground bg-muted/10"
              )}>
                {achievement.isEarned ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>
              
              <div>
                <h3 className={cn(
                  "font-serif text-lg tracking-wide mb-1",
                  achievement.isEarned ? "text-secondary" : "text-muted-foreground"
                )}>
                  {achievement.name}
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3 leading-relaxed">
                  {achievement.description}
                </p>
                
                {achievement.isEarned && achievement.earnedAt && (
                  <div className="font-mono text-[9px] text-secondary/70 uppercase">
                    Crystallized: {format(new Date(achievement.earnedAt), 'yyyy.MM.dd')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
