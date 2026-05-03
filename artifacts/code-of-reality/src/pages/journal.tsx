import { useListJournalEntries } from "@workspace/api-client-react";
import { BookOpen, Edit3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function JournalPage() {
  const { data: entries, isLoading } = useListJournalEntries();

  return (
    <div className="flex flex-col gap-6 h-full">
      <header className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-4xl text-primary uppercase tracking-widest mb-2">Chronicle</h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Personal Reflection Matrix</p>
        </div>
        <Button 
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest"
        >
          <Edit3 className="w-4 h-4 mr-2" /> New Entry
        </Button>
      </header>

      <div className="sacred-border bg-card/60 backdrop-blur-md p-6 clip-corners flex-1">
        {isLoading ? (
          <div className="h-full flex items-center justify-center font-mono text-primary/50 text-xs uppercase tracking-widest">
            Decrypting archives...
          </div>
        ) : entries?.length ? (
          <div className="grid grid-cols-1 gap-4">
            {entries.map(entry => (
              <div key={entry.id} className="border border-primary/20 bg-background/40 p-5 group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center text-primary/70">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      {format(new Date(entry.createdAt!), 'yyyy.MM.dd // HH:mm')}
                    </span>
                  </div>
                  {entry.sentimentScore && (
                    <span className="font-mono text-[10px] text-accent uppercase px-2 py-0.5 border border-accent/30 bg-accent/10">
                      Resonance: {entry.sentimentScore.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="font-serif text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {entry.tags.map(tag => (
                      <span key={tag} className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <BookOpen className="w-12 h-12 text-primary/20 mb-4" />
            <span className="font-mono text-primary/50 text-xs uppercase tracking-widest">Archive is empty</span>
            <span className="font-mono text-[10px] text-muted-foreground mt-2 uppercase">Record your first observation</span>
          </div>
        )}
      </div>
    </div>
  );
}
