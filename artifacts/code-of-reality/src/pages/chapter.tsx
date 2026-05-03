import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Book, CheckCircle, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarkChapterComplete } from "@workspace/api-client-react";

interface ChapterData {
  id: string;
  phase: number;
  sequence: number;
  title: string;
  openingParagraph: string;
  summary: string;
  quotables?: string[];
  linkedToolIds?: string[];
  progress?: Record<string, unknown> | null;
  isUnlocked?: boolean;
  requiresSubscription?: boolean;
}

interface LockedChapterData {
  id: string;
  phase: number;
  sequence: number;
  title: string;
  isUnlocked: false;
  requiresSubscription: true;
}

type ChapterState =
  | { status: "loading" }
  | { status: "ok"; data: ChapterData }
  | { status: "locked"; data: LockedChapterData; requiredTier: string }
  | { status: "error"; message: string };

function useChapterWithPaywall(id: string | undefined) {
  const [state, setState] = useState<ChapterState>({ status: "loading" });

  useEffect(() => {
    if (!id) return;
    setState({ status: "loading" });
    const token = localStorage.getItem("cor_token");

    fetch(`/api/chapters/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        const body = await res.json();
        if (res.ok) {
          setState({ status: "ok", data: body as ChapterData });
        } else if (res.status === 403 && body.error === "SubscriptionRequired") {
          setState({
            status: "locked",
            data: body.chapter as LockedChapterData,
            requiredTier: body.requiredTier ?? "ARCHITECT",
          });
        } else if (res.status === 404) {
          setState({ status: "error", message: "Chapter not found." });
        } else {
          setState({ status: "error", message: body.message ?? "Failed to load chapter." });
        }
      })
      .catch(() => setState({ status: "error", message: "Could not connect to server." }));
  }, [id]);

  return state;
}

const PHASE_NAMES: Record<number, string> = {
  1: "Awakening", 2: "Clearing", 3: "Mapping", 4: "Crystallizing",
  5: "Weaving", 6: "Transmitting", 7: "Mastering", 8: "Transcending",
};

const TIER_UNLOCK_FEATURES = [
  "4 advanced phases: Weaving, Transmitting, Mastering, Transcending",
  "E₈ AI Reality Coach — unlimited sessions with Claude",
  "Advanced pattern lock resolution tools",
  "Dimensional timeline analytics",
];

export default function ChapterPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const state = useChapterWithPaywall(id);
  const completeMutation = useMarkChapterComplete();

  const handleComplete = () => {
    completeMutation.mutate(
      { data: { chapterId: id! } },
      { onSuccess: () => setLocation("/phases") }
    );
  };

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center h-full font-mono text-primary uppercase tracking-widest">
        Decrypting matrix data…
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="text-center font-mono text-destructive uppercase mt-20">
        {state.message}
      </div>
    );
  }

  if (state.status === "locked") {
    return <LockedChapterOverlay chapter={state.data} onBack={() => setLocation("/phases")} />;
  }

  const chapter = state.data;

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
            <h3 className="text-primary border-b border-primary/20 pb-2 inline-block">
              Key Transmissions
            </h3>
            {chapter.quotables.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-primary pl-6 py-2 text-xl text-foreground italic bg-primary/5"
              >
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
          {completeMutation.isPending ? "Integrating…" : "Acknowledge Integration"}
          <CheckCircle className="w-5 h-5 ml-3" />
        </Button>
      </div>
    </div>
  );
}

interface LockedChapterOverlayProps {
  chapter: LockedChapterData;
  onBack: () => void;
}

function LockedChapterOverlay({ chapter, onBack }: LockedChapterOverlayProps) {
  const [, setLocation] = useLocation();
  const phaseName = PHASE_NAMES[chapter.phase] ?? `Phase ${chapter.phase}`;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-muted-foreground hover:text-primary font-mono text-xs uppercase transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Return to Pathway
      </button>

      {/* Chapter header — visible even when locked */}
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 px-3 py-1 border border-yellow-500/30 bg-yellow-500/10 font-mono text-[10px] text-yellow-400 uppercase tracking-widest mb-6">
          <Lock className="w-3 h-3" />
          Phase {chapter.phase} — {phaseName} // Sequence {chapter.sequence}
        </div>
        <h1 className="font-serif text-5xl text-foreground/60 uppercase tracking-widest leading-tight">
          {chapter.title}
        </h1>
      </header>

      {/* Teaser block with fade overlay */}
      <div className="relative mb-8 overflow-hidden rounded-none">
        <div className="sacred-border bg-card/40 p-8 clip-corners">
          <p className="text-xl text-primary/40 m-0 font-medium italic select-none blur-[3px]">
            The architecture of this dimension holds the precise frequencies required to
            unlock the {phaseName.toLowerCase()} pattern within your reality field. Every word
            in this transmission has been encoded to resonate at the E₈ harmonic signature
            necessary for your next-level coherence integration…
          </p>
        </div>
        {/* Fade-to-lock gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, transparent 30%, var(--background) 85%)",
          }}
        />
      </div>

      {/* Paywall card */}
      <div
        className="relative mx-auto max-w-lg p-8 text-center"
        style={{
          background: "rgba(212,175,55,0.04)",
          border: "1px solid rgba(212,175,55,0.3)",
          clipPath:
            "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Sacred lock icon */}
        <div className="flex justify-center mb-5">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{
              border: "1px solid rgba(212,175,55,0.4)",
              clipPath:
                "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              background: "rgba(212,175,55,0.08)",
            }}
          >
            <Lock className="w-7 h-7 text-yellow-400/80" />
          </div>
        </div>

        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "#d4af37" }}
        >
          ARCHITECT Tier Required
        </div>

        <h2 className="font-serif text-2xl font-light text-foreground mb-3">
          Phase {chapter.phase}–8 Access
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          This chapter — and all remaining transmissions in{" "}
          <span style={{ color: "#d4af37" }}>Phases {chapter.phase} through 8</span> — unlock
          with an ARCHITECT subscription. Continue your transformation beyond the foundation.
        </p>

        {/* Feature list */}
        <ul
          className="text-left mb-7 space-y-2"
          style={{ borderTop: "1px solid rgba(212,175,55,0.15)", paddingTop: "1.25rem" }}
        >
          {TIER_UNLOCK_FEATURES.map((f, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-foreground/70">
              <span style={{ color: "#d4af37", flexShrink: 0, marginTop: 1 }}>◈</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => setLocation("/pricing")}
          style={{
            width: "100%",
            padding: "0.9rem",
            background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.3))",
            border: "1px solid #d4af37",
            color: "#d4af37",
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            clipPath:
              "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
            transition: "all 0.2s",
          }}
        >
          Unlock ARCHITECT — $49/mo
        </button>

        <p className="mt-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">
          Phases 1–4 remain free forever
        </p>
      </div>
    </div>
  );
}
