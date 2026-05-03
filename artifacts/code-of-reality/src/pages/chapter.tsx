import { useGetChapter, useMarkChapterComplete } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Book, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChapterPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { data: chapter, isLoading } = useGetChapter(id || "", { query: { enabled: !!id } });
  const completeMutation = useMarkChapterComplete();

  const handleComplete = () => {
    completeMutation.mutate({ data: { chapterId: id! } }, {
      onSuccess: () => {
        setLocation("/phases");
      }
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full font-mono text-primary uppercase">Decrypting matrix data...</div>;
  }

  if (!chapter) {
    return <div className="text-center font-mono text-destructive uppercase mt-20">Chapter data corrupted or inaccessible.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button 
        onClick={() => setLocation("/phases")}
        className="flex items-center text-muted-foreground hover:text-primary font-mono text-xs uppercase transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Return to Pathway
      </button>

      <header className="mb-12 text-center">
        <div className="inline-block px-3 py-1 border border-primary/30 bg-primary/10 font-mono text-[10px] text-primary uppercase tracking-widest mb-6">
          Phase {chapter.phase} // Sequence {chapter.sequence}
        </div>
        <h1 className="font-serif text-5xl text-foreground uppercase tracking-widest leading-tight">
          {chapter.title}
        </h1>
      </header>

      <article className="prose prose-invert prose-p:font-serif prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:font-serif prose-headings:uppercase prose-headings:tracking-widest max-w-none mb-16">
        <div className="sacred-border bg-card/40 p-8 clip-corners mb-12">
          <p className="text-xl text-primary/90 m-0 font-medium italic">
            {chapter.openingParagraph}
          </p>
        </div>

        <div className="whitespace-pre-wrap text-foreground/80">
          {chapter.summary}
        </div>

        {chapter.quotables && chapter.quotables.length > 0 && (
          <div className="my-12 space-y-6">
            <h3 className="text-primary border-b border-primary/20 pb-2 inline-block">Key Transmissions</h3>
            {chapter.quotables.map((quote, i) => (
              <blockquote key={i} className="border-l-2 border-primary pl-6 py-2 text-xl text-foreground italic bg-primary/5">
                "{quote}"
              </blockquote>
            ))}
          </div>
        )}
      </article>

      <div className="flex justify-center border-t border-border/30 pt-12">
        <Button 
          onClick={handleComplete}
          disabled={completeMutation.isPending}
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest py-6 px-12"
        >
          {completeMutation.isPending ? "Integrating..." : "Acknowledge Integration"}
          <CheckCircle className="w-5 h-5 ml-3" />
        </Button>
      </div>
    </div>
  );
}
