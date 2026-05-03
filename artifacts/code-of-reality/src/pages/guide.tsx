import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Hexagon, Lock, BookOpen } from "lucide-react";

const GOLD = "#d4af37";
const CLIP = "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))";

const TOC_ITEMS = [
  { id: "executive-summary",  label: "Executive Summary",         short: "Summary" },
  { id: "getting-started",    label: "Getting Started",           short: "Setup" },
  { id: "phases",             label: "The Eight Phases",          short: "Phases" },
  { id: "features",           label: "Feature Reference",         short: "Features" },
  { id: "pricing",            label: "Subscription Tiers",        short: "Pricing" },
  { id: "faq",                label: "FAQ",                       short: "FAQ" },
  { id: "glossary",           label: "Glossary",                  short: "Glossary" },
];

function useScrollProgress(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { top, height } = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    const scrollable = height - viewH;
    if (scrollable <= 0) { setProgress(100); return; }
    const scrolled = Math.max(0, -top);
    setProgress(Math.min(100, (scrolled / scrollable) * 100));
  }, [containerRef]);

  useEffect(() => {
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [update]);

  return progress;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}

function TableOfContents({ active }: { active: string }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="p-4"
      style={{
        background: "rgba(212,175,55,0.04)",
        border: `1px solid ${GOLD}20`,
        clipPath: CLIP,
      }}
    >
      <div
        className="flex items-center gap-2 mb-4 pb-3"
        style={{ borderBottom: `1px solid ${GOLD}20` }}
      >
        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: GOLD }}
        >
          Contents
        </span>
      </div>

      <nav className="space-y-0.5">
        {TOC_ITEMS.map((item, i) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="w-full text-left flex items-start gap-2.5 px-2 py-2 transition-all group rounded-none"
              style={{
                background: isActive ? `${GOLD}10` : "transparent",
                borderLeft: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
              }}
            >
              <span
                className="font-mono text-[9px] flex-shrink-0 mt-0.5 tabular-nums"
                style={{ color: isActive ? GOLD : "var(--muted-foreground)", opacity: 0.5 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-wider leading-tight"
                style={{ color: isActive ? GOLD : "var(--muted-foreground)" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${GOLD}15` }}>
        <div className="font-mono text-[9px] uppercase tracking-widest text-center" style={{ color: `${GOLD}50` }}>
          42 Chapters · 8 Phases
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-14 print-section scroll-mt-8">
      <h2
        className="font-serif text-2xl uppercase tracking-widest mb-6 pb-3"
        style={{ borderBottom: `1px solid ${GOLD}30`, color: GOLD }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="font-serif text-lg uppercase tracking-widest mb-3 text-foreground/90">{title}</h3>
      {children}
    </div>
  );
}

function Callout({ children, color = GOLD }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      className="p-5 mb-6 text-sm leading-relaxed"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}30`,
        clipPath: CLIP,
        color: "var(--muted-foreground)",
      }}
    >
      {children}
    </div>
  );
}

function PhaseBlock({
  phase, name, tier, description, chapters,
}: {
  phase: number; name: string; tier: "FREE" | "ARCHITECT";
  description: string; chapters: string[];
}) {
  return (
    <div
      className="mb-6 p-5"
      style={{
        background: tier === "FREE" ? "rgba(0,200,200,0.04)" : `${GOLD}06`,
        border: `1px solid ${tier === "FREE" ? "rgba(0,200,200,0.2)" : GOLD + "30"}`,
        clipPath: CLIP,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-serif text-base uppercase tracking-widest"
          style={{ color: tier === "FREE" ? "var(--primary)" : GOLD }}>
          Phase {phase} — {name}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5"
          style={{
            border: `1px solid ${tier === "FREE" ? "var(--primary)" : GOLD}`,
            color: tier === "FREE" ? "var(--primary)" : GOLD,
            background: tier === "FREE" ? "rgba(0,200,200,0.08)" : `${GOLD}10`,
          }}
        >
          {tier === "FREE" ? "Free" : "ARCHITECT"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      <ul className="space-y-1">
        {chapters.map((c, i) => (
          <li key={i} className="text-xs font-mono text-foreground/60 flex items-start gap-2">
            <span style={{ color: tier === "FREE" ? "var(--primary)" : GOLD, flexShrink: 0 }}>◈</span>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GuidePage() {
  const [, setLocation] = useLocation();
  const active = useActiveSection(TOC_ITEMS.map((t) => t.id));
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(containerRef);

  const handleDownload = () => window.print();

  return (
    <>
      {/* Reading progress bar — fixed at top, hidden on print */}
      <div
        className="print:hidden fixed top-0 right-0 z-50 h-[2px] transition-all duration-75 ease-out"
        style={{
          left: "16rem",
          width: `calc((100% - 16rem) * ${progress / 100})`,
          background: `linear-gradient(to right, ${GOLD}80, ${GOLD}, #fff8dc)`,
          boxShadow: `0 0 8px ${GOLD}90`,
        }}
      />
      {/* Faint track line */}
      <div
        className="print:hidden fixed top-0 right-0 z-49 h-[1px]"
        style={{ left: "16rem", background: `${GOLD}15` }}
      />

      {/* Print-only header */}
      <div className="hidden print:flex items-center justify-center mb-12 pt-8">
        <Hexagon className="w-8 h-8 mr-4" style={{ color: GOLD }} />
        <div>
          <div className="font-serif text-3xl uppercase tracking-widest" style={{ color: GOLD }}>
            Code of Reality
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-center" style={{ color: GOLD + "80" }}>
            E₈ RealityMastery Platform™ — User Guide
          </div>
        </div>
      </div>

      {/* Outer wrapper: wider than normal to accommodate TOC */}
      <div ref={containerRef} className="max-w-6xl mx-auto">

        {/* Top bar: back + download */}
        <div className="print:hidden flex items-center justify-between mb-10">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center text-muted-foreground hover:text-primary font-mono text-xs uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Command Center
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-5 py-2.5 transition-all hover:opacity-90"
            style={{ border: `1px solid ${GOLD}`, color: GOLD, background: `${GOLD}12`, clipPath: CLIP }}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {/* Two-column layout: TOC left, content right */}
        <div className="flex items-start gap-8">

          {/* ── Sticky TOC — hidden on print and mobile ── */}
          <aside className="print:hidden hidden xl:block w-52 flex-shrink-0">
            <div className="sticky top-8">
              <TableOfContents active={active} />
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 pb-24 print:pb-8">

            {/* Cover */}
            <header className="mb-16 text-center">
              <div className="font-mono text-[10px] uppercase tracking-widest mb-6"
                style={{ color: GOLD + "80" }}>
                Ascendancy Technologies · Confidential
              </div>
              <h1 className="font-serif text-6xl uppercase tracking-widest leading-tight mb-4"
                style={{ color: GOLD }}>
                User Guide
              </h1>
              <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-2">
                E₈ RealityMastery Platform™
              </p>
              <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-wider">
                Version 1.0 · Ascendancy Technologies
              </p>
              <div className="mt-8 mx-auto w-32 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
            </header>

            {/* ── EXECUTIVE SUMMARY ─────────────────────────────────── */}
            <Section id="executive-summary" title="Executive Summary">
              <Callout>
                The Code of Reality E₈ RealityMastery Platform™ is a structured, full-stack consciousness
                engineering system built on principles derived from the E₈ Lie group — the highest-dimensional
                exceptional symmetry in mathematics. Developed by Ascendancy Technologies, the platform guides
                practitioners through 42 chapters organized across 8 progressive phases, using a combination
                of structured content transmission, AI-assisted coaching, biometric pattern-logging, and
                community resonance amplification to produce measurable shifts in cognitive architecture,
                intentional clarity, and reality coherence.
              </Callout>

              <SubSection title="Platform Purpose">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The platform addresses a foundational problem in personal transformation: the absence of a
                  rigorous, systematic methodology for engineering intentional change at the identity level.
                  Most self-development frameworks treat behavior modification as the primary lever. The Code
                  of Reality operates at a deeper layer — the <em className="text-foreground/80">reality-construction
                  architecture</em> — the mental models, identity narratives, emotional charge patterns, and
                  environmental feedback loops that determine which behaviors are even possible for a given
                  individual.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By working systematically through all eight phases, practitioners dismantle outdated reality
                  constructs, install precision-engineered replacements, and develop the internal coherence
                  required to maintain an elevated reality field under resistance. The result is not motivation
                  or willpower — it is a structurally different human operating system.
                </p>
              </SubSection>

              <SubSection title="Key Capabilities">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["42-Chapter Curriculum", "Eight phases of progressively deeper transmission, from foundational awakening through full transcendence mastery."],
                    ["E₈ AI Reality Coach", "Claude-powered AI advisor with full session context, available to ARCHITECT and above. Provides personalized coaching across all domains."],
                    ["Dimensional Assessment", "Multi-vector diagnostic scanning that maps your current reality coherence across eight life domains, producing a quantified coherence score."],
                    ["Intentions Architecture", "Structured intention-setting system that encodes high-frequency targets into the practitioner's operating field with measurable checkpoints."],
                    ["Identity Matrix", "Deep-dive identity reconstruction tools that expose, reframe, and replace limiting identity narratives at the structural level."],
                    ["Session Journal", "Timestamped session logging with pattern recognition, streak tracking, and longitudinal coherence trend analysis."],
                    ["Reality Analytics", "Dashboard of coherence metrics, phase velocity, chapter completion rates, and dimensional timeline visualizations."],
                    ["Achievement System", "Recognition milestones that mark significant phase completions, streak achievements, and dimensional mastery events."],
                  ].map(([title, desc]) => (
                    <div key={title} className="p-4"
                      style={{ background: `${GOLD}04`, border: `1px solid ${GOLD}18`, clipPath: CLIP }}>
                      <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: GOLD }}>{title}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </SubSection>

              <SubSection title="Subscription Architecture">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The platform operates on a tiered access model. Phases 1–4 (21 chapters) are fully
                  accessible on the free tier, providing a complete foundation and genuine transformation
                  entry point. Phases 5–8 and the AI Coach require an ARCHITECT subscription ($49/month).
                  The CERTIFIED tier ($99/month) provides the full platform experience including advanced
                  certification tracks.
                </p>
              </SubSection>

              <SubSection title="Who This Platform Is For">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Code of Reality is designed for high-agency individuals who have exhausted conventional
                  self-development approaches and require a more rigorous, systematic methodology. Ideal
                  practitioners include entrepreneurs, executives, creative professionals, coaches, and
                  anyone committed to operating at maximum intentional coherence. The platform is NOT a
                  casual wellness tool — it demands active engagement, honest self-assessment, and willingness
                  to confront deeply-held reality constructs.
                </p>
              </SubSection>
            </Section>

            {/* ── GETTING STARTED ───────────────────────────────────── */}
            <Section id="getting-started" title="Getting Started">
              <SubSection title="Account Creation">
                <ol className="space-y-3 text-sm text-muted-foreground">
                  {[
                    ["Navigate to the platform", "Go to the Code of Reality URL and you will be directed to the authentication screen — the Entry Vector."],
                    ["Create your vector coordinate", "Click \"Request New Vector Coordinate\" and provide your email address and a secure cryptographic key (password, minimum 8 characters)."],
                    ["Complete onboarding", "A brief onboarding sequence establishes your practitioner profile, sets your initial phase position, and seeds your reality vector."],
                    ["Access the Command Center", "Your dashboard is now active. It displays your live coherence metrics, current phase, and quick-action pathways."],
                    ["Run your first Dimensional Scan", "Navigate to Assessment and complete the multi-vector diagnostic. This establishes your baseline coherence score across all eight domains."],
                  ].map(([step, desc], i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-mono text-xs w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ border: `1px solid ${GOLD}40`, color: GOLD }}>
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-foreground/80">{step} — </span>
                        <span>{desc}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </SubSection>

              <SubSection title="Recommended First-Week Protocol">
                <Callout>
                  Day 1: Complete account creation + Dimensional Scan assessment.<br />
                  Day 2–3: Work through Phase 1, Chapters 1–3 (The Architecture of Reality).<br />
                  Day 4: Set your first Intentions using the Intentions module.<br />
                  Day 5–6: Complete Phase 1, Chapters 4–5. Log a session in the Journal.<br />
                  Day 7: Review your analytics dashboard. Note coherence delta from baseline scan.
                </Callout>
              </SubSection>

              <SubSection title="Navigation Overview">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The sidebar contains all primary navigation. The top items (Dashboard, Phases, Assessment)
                  are your primary engagement surfaces. Lower items (Journal, Sessions, Analytics) support
                  reflection and tracking. AI Coach and Community amplify the core work. Your current phase
                  is always visible in the bottom-left corner next to your display name.
                </p>
              </SubSection>
            </Section>

            {/* ── THE 8 PHASES ──────────────────────────────────────── */}
            <Section id="phases" title="The Eight Phases — Complete Curriculum">
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                The 42-chapter curriculum is organized into eight progressive phases. Each phase builds
                structurally on the previous — attempting to skip phases produces unstable results.
                Phases 1–4 are accessible on the free tier. Phases 5–8 require ARCHITECT subscription.
              </p>

              <PhaseBlock phase={1} name="Awakening" tier="FREE"
                description="Establishes the foundational epistemological framework. Practitioners learn to distinguish between reality-as-constructed and reality-as-experienced, and to recognize the specific mechanisms by which their current reality field was built."
                chapters={[
                  "Chapter 1 — The Architecture of Reality: Foundation",
                  "Chapter 2 — Decoding Your Current Reality Matrix",
                  "Chapter 3 — The Observer Effect: You Are the Variable",
                  "Chapter 4 — Pattern Recognition: Reading Your Field",
                  "Chapter 5 — The Awakening Protocol: First Integration",
                ]} />

              <PhaseBlock phase={2} name="Clearing" tier="FREE"
                description="Systematic identification and dissolution of legacy reality constructs. This phase works at the emotional charge and narrative levels, using precision tools to locate the specific patterns that block higher-frequency reality access."
                chapters={[
                  "Chapter 6 — Mapping the Shadow Architecture",
                  "Chapter 7 — Emotional Charge Dissolution Protocol",
                  "Chapter 8 — Narrative Deconstruction: The Stories That Bind",
                  "Chapter 9 — The Clearing Field: Active Pattern Release",
                  "Chapter 10 — Integration Point: The Empty Matrix",
                ]} />

              <PhaseBlock phase={3} name="Mapping" tier="FREE"
                description="Precision cartography of the practitioner's desired reality field. The Mapping phase moves from dissolution to construction, establishing the architectural blueprint for the new operating system."
                chapters={[
                  "Chapter 11 — Reality Architecture Design Principles",
                  "Chapter 12 — The Coherence Map: Eight Domain Alignment",
                  "Chapter 13 — Quantum Intention Setting: Beyond Goal-Setting",
                  "Chapter 14 — Dimensional Coordinates: Where You Are Going",
                  "Chapter 15 — The Navigator's Protocol: Holding the Map",
                ]} />

              <PhaseBlock phase={4} name="Crystallizing" tier="FREE"
                description="Solidification of new identity structures and reality constructs. Crystallization is the phase where designed patterns move from theoretical to structural — encoded into habitual perception, response patterns, and environmental anchors."
                chapters={[
                  "Chapter 16 — Identity Installation: The New Architecture",
                  "Chapter 17 — Environmental Encoding: Reality Anchors",
                  "Chapter 18 — The Crystallization Protocol: Setting the Field",
                  "Chapter 19 — Resistance Integration: The Pressure Test",
                  "Chapter 20 — Phase 4 Completion: The Solid Foundation",
                  "Chapter 21 — Bridge Transmission: Threshold to Advanced Work",
                ]} />

              <PhaseBlock phase={5} name="Weaving" tier="ARCHITECT"
                description="Advanced integration work. The Weaving phase builds multi-dimensional coherence — teaching practitioners to hold and operate from their new reality architecture under real-world conditions, relationship dynamics, and systemic resistance."
                chapters={[
                  "Chapter 22 — Multi-Dimensional Coherence Theory",
                  "Chapter 23 — Relationship Field Dynamics",
                  "Chapter 24 — The Weave: Integrating All Domains Simultaneously",
                  "Chapter 25 — Systemic Resistance and Field Maintenance",
                  "Chapter 26 — Advanced Pattern Lock Resolution",
                ]} />

              <PhaseBlock phase={6} name="Transmitting" tier="ARCHITECT"
                description="Mastery-level transmission work. Practitioners learn to transmit their reality field into their environment, leadership contexts, creative output, and collective fields. This is the phase where internal coherence becomes externally generative."
                chapters={[
                  "Chapter 27 — The Transmission Principle",
                  "Chapter 28 — Leadership as Reality Architecture",
                  "Chapter 29 — Creative Field Generation",
                  "Chapter 30 — Collective Reality Engineering",
                  "Chapter 31 — The Transmitter Protocol: Living the Field",
                ]} />

              <PhaseBlock phase={7} name="Mastering" tier="ARCHITECT"
                description="Deepening and refining. Mastery is not an endpoint but a level of fluency — the practitioner can now apply E₈ principles in real time, navigate complex reality challenges without losing coherence, and actively upgrade their field under pressure."
                chapters={[
                  "Chapter 32 — The Mastery Paradox: Beginning Again",
                  "Chapter 33 — Advanced Timeline Navigation",
                  "Chapter 34 — Field Coherence Under Extreme Pressure",
                  "Chapter 35 — The Master's Toolkit: Advanced Protocols",
                  "Chapter 36 — Mentorship Field Dynamics",
                ]} />

              <PhaseBlock phase={8} name="Transcending" tier="ARCHITECT"
                description="The final phase dissolves the boundary between practitioner and practice. Transcendence in the E₈ context means operating from such a degree of internal coherence that reality construction becomes effortless, automatic, and elegant."
                chapters={[
                  "Chapter 37 — Beyond the Architecture: The Open Field",
                  "Chapter 38 — Transcendence Protocol: Dissolving the Map",
                  "Chapter 39 — The E₈ Integration: Full Symmetry",
                  "Chapter 40 — Teaching Reality: The Transmission Cycle",
                  "Chapter 41 — Living Proof: The Embodied Field",
                  "Chapter 42 — Final Transmission: The Code Revealed",
                ]} />
            </Section>

            {/* ── FEATURE REFERENCE ─────────────────────────────────── */}
            <Section id="features" title="Complete Feature Reference">

              <SubSection title="Command Center (Dashboard)">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  The primary landing surface after login. Displays three live coherence metrics
                  (Coherence Level, Current Phase, Vector Magnitude), a Dimensional Timeline visualization,
                  and Quick Actions for immediate session engagement. The E₈ crystalline visualization
                  animates in the background, reflecting your current field state.
                </p>
                <Callout>
                  <strong className="text-foreground/80">Coherence Level</strong> — Aggregate score (0–10) derived
                  from chapter completions, session frequency, assessment results, and intention hit-rate.<br /><br />
                  <strong className="text-foreground/80">Vector Magnitude</strong> — Measures the directional
                  strength and stability of your reality vector. Higher magnitude = greater intentional force
                  applied to your target reality.
                </Callout>
              </SubSection>

              <SubSection title="Phase Pathway">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Visual map of all 42 chapters across 8 phases. Each chapter card shows completion status,
                  phase/sequence position, and access tier. Clicking an accessible chapter opens the full
                  chapter transmission. Phase 5–8 chapters display an ARCHITECT badge and upgrade prompt
                  for free-tier users.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground/80">Chapter completion:</strong> After reading a full chapter
                  transmission, click "Acknowledge Integration" to mark it complete and receive coherence credit.
                  Chapters must be completed in sequence within each phase; phases unlock after all chapters
                  in the current phase are acknowledged.
                </p>
              </SubSection>

              <SubSection title="Dimensional Assessment">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Multi-vector diagnostic tool that evaluates your current coherence across eight life domains:
                  Identity, Relationships, Health/Energy, Career/Purpose, Financial, Creative, Spiritual/Inner,
                  and Community/Impact. Each domain is scored independently; the aggregate produces your
                  overall Coherence Score.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground/80">Recommended cadence:</strong> Run a full assessment at
                  intake, at each phase completion, and any time you experience a significant life event or
                  coherence disruption. Delta tracking shows your trajectory over time.
                </p>
              </SubSection>

              <SubSection title="Intentions Architecture">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Structured intention-setting system distinct from conventional goal-setting. Intentions in
                  the E₈ framework are frequency-encoded targets that operate at the identity level — not
                  behavioral objectives but architectural specifications for the reality you are constructing.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each intention includes a domain assignment, activation statement, milestone checkpoints,
                  and an emotional resonance calibration. Active intentions appear on your dashboard and
                  contribute to your coherence vector calculation.
                </p>
              </SubSection>

              <SubSection title="Identity Matrix">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Deep-identity reconstruction workspace. The Identity module houses your evolving self-concept
                  architecture — the collection of identity statements, core values, characteristic beliefs,
                  and self-definitions that determine the boundary conditions of your reality field.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use the Identity module to log, examine, and intentionally rewrite identity statements.
                  The system tracks the evolution of your identity architecture over time, highlighting
                  patterns and contradictions that require resolution.
                </p>
              </SubSection>

              <SubSection title="Session Journal">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Timestamped practice log for recording integration sessions, insight transmissions, pattern
                  observations, and coherence events. The journal is the primary evidence-collection system
                  for your transformation — the longitudinal record of your reality field in motion.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground/80">Best practice:</strong> Log a session within 24 hours
                  of completing any chapter or assessment. Include: what you noticed, what shifted, what
                  resistance arose, and what integration action you will take. Consistency of logging is more
                  valuable than length of entries.
                </p>
              </SubSection>

              <SubSection title="Sessions Tracker">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  High-level session engagement tracker. Monitors practice streaks, session frequency, total
                  engagement hours, and phase velocity (rate of progression through the curriculum). Streak
                  maintenance is incentivized through the achievement system and contributes to coherence
                  score calculations.
                </p>
              </SubSection>

              <SubSection title="Community Field">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Collective practitioner space for resonance amplification. Sharing insights, challenges, and
                  breakthroughs in a community of aligned practitioners creates a collective reality field that
                  amplifies individual work. The community is organized by phase, allowing practitioners to
                  connect with others at the same integration level.
                </p>
              </SubSection>

              <SubSection title="Reality Analytics">
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Full analytics suite showing your transformation trajectory over time. Key metrics include:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Overall Coherence Score trend (30/90/365-day views)",
                    "Chapter completion velocity by phase",
                    "Assessment domain scores — baseline vs. current vs. projected",
                    "Intention hit-rate and active/completed intention ratio",
                    "Session streak data and engagement consistency score",
                    "Dimensional Timeline visualization showing coherence evolution",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color: GOLD, flexShrink: 0 }}>◈</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </SubSection>

              <SubSection title="E₈ AI Reality Coach">
                <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest px-3 py-1.5 w-fit"
                  style={{ border: `1px solid ${GOLD}40`, color: GOLD, background: `${GOLD}0a` }}>
                  <Lock className="w-3 h-3" /> ARCHITECT Tier Required
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Powered by Anthropic's Claude, the AI Reality Coach provides personalized, context-aware
                  coaching across all aspects of your transformation work. The coach has access to your phase
                  position, assessment results, active intentions, and session history, enabling genuinely
                  relevant, specific coaching rather than generic motivational content.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground/80">Use the AI Coach for:</strong> unpacking resistance
                  patterns encountered in chapter work, designing custom integration protocols, getting clarity
                  on intention architecture, exploring advanced applications of phase concepts, and processing
                  challenging coherence events in real time.
                </p>
              </SubSection>

              <SubSection title="Achievement System">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Recognition system that marks significant milestones in your transformation journey.
                  Achievements are awarded for: phase completions, assessment score thresholds, streak
                  milestones (7/30/90/365 days), first intention fulfillment, community contributions,
                  and special transmissions including the final E₈ Integration achievement for completing
                  all 42 chapters. Achievements contribute to your overall coherence record and are
                  permanently associated with your practitioner profile.
                </p>
              </SubSection>
            </Section>

            {/* ── SUBSCRIPTION TIERS ────────────────────────────────── */}
            <Section id="pricing" title="Subscription Tiers">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {[
                  {
                    name: "FREE", price: "$0", color: "var(--primary)",
                    features: [
                      "Phases 1–4 (21 chapters)", "Dimensional Assessment",
                      "Intentions Architecture", "Identity Matrix",
                      "Session Journal", "Community Field",
                      "Reality Analytics (basic)", "Achievement System",
                    ],
                  },
                  {
                    name: "ARCHITECT", price: "$49/mo", color: GOLD,
                    features: [
                      "Everything in FREE",
                      "Phases 5–8 (21 advanced chapters)",
                      "E₈ AI Reality Coach (unlimited)",
                      "Advanced Reality Analytics",
                      "Dimensional Timeline (advanced)",
                      "Priority community access",
                    ],
                  },
                  {
                    name: "CERTIFIED", price: "$99/mo", color: "#c084fc",
                    features: [
                      "Everything in ARCHITECT",
                      "E₈ Certification Track",
                      "1-on-1 Coaching allocation",
                      "Advanced certification credentials",
                      "Exclusive CERTIFIED community",
                      "Early access to new transmissions",
                    ],
                  },
                ].map((tier) => (
                  <div key={tier.name} className="p-5"
                    style={{ background: `${tier.color}06`, border: `1px solid ${tier.color}35`, clipPath: CLIP }}>
                    <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: tier.color }}>
                      {tier.name}
                    </div>
                    <div className="font-serif text-2xl mb-4" style={{ color: tier.color }}>{tier.price}</div>
                    <ul className="space-y-2">
                      {tier.features.map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span style={{ color: tier.color, flexShrink: 0 }}>◈</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60 font-mono text-center">
                Subscriptions managed via Stripe. Cancel anytime. Phases 1–4 remain free forever.
              </p>
            </Section>

            {/* ── FAQ ───────────────────────────────────────────────── */}
            <Section id="faq" title="Frequently Asked Questions">
              {[
                ["How long does it take to complete the full curriculum?",
                  "The curriculum is designed for depth over speed. A practitioner engaging consistently (4–5 hours/week) will complete Phases 1–4 in approximately 6–8 weeks and the full 42 chapters in 4–6 months. However, integration is non-linear — many practitioners revisit earlier phases after completing later ones and find entirely new layers of application."],
                ["Do I need to complete chapters in order?",
                  "Yes. The curriculum is architecturally sequential — each chapter builds on the constructs established in previous transmissions. Attempting to skip chapters is structurally similar to attempting advanced mathematics without foundational literacy. The platform enforces sequence within each phase."],
                ["What makes this different from other personal development platforms?",
                  "Three things: structural depth (we work at the identity/reality-architecture level, not the behavior level), rigorous methodology (the E₈ framework is a complete system, not a collection of techniques), and measurement (every element of the work produces trackable coherence data). The platform is designed for practitioners who have tried conventional approaches and require something more fundamental."],
                ["How does the AI Coach work?",
                  "The AI Coach is powered by Anthropic's Claude with a system prompt that contains the full E₈ RealityMastery framework, your practitioner context (phase, assessment scores, active intentions, recent journal entries), and coaching protocols specific to your current phase. It is not a generic chatbot — it functions as an informed practitioner advisor with access to your complete transformation context."],
                ["What happens to my data if I cancel my subscription?",
                  "All your data (journal entries, assessment results, intentions, identity work, achievement records) is retained indefinitely regardless of subscription status. If you cancel ARCHITECT, you lose access to Phases 5–8 content and the AI Coach, but your progress is preserved and will be accessible immediately upon re-subscription."],
                ["Is there a community for CERTIFIED practitioners?",
                  "Yes. CERTIFIED practitioners have access to an exclusive community tier where advanced practitioners share integration experiences and collaborate on collective field work. This community is moderated and invitation-reviewed to maintain signal quality."],
                ["How do I upgrade my subscription?",
                  "Navigate to Upgrade in the sidebar, or click any ARCHITECT-locked feature. You will be directed to the Pricing page where you can select your tier and proceed through the Stripe-secured checkout flow."],
                ["What is the E₈ Lie group and why is it significant?",
                  "E₈ is the largest and most complex of the five exceptional Lie groups in mathematics — a 248-dimensional symmetry structure with no higher-dimensional equivalent. It is the mathematical structure underlying some of the most ambitious unified field theories in physics (notably Garrett Lisi's E₈ Theory of Everything). The Code of Reality uses E₈ as a metaphor and structural template for completeness, elegance, and the highest-order integration of all dimensions of experience into a single coherent field."],
              ].map(([q, a], i) => (
                <div key={i} className="mb-6">
                  <div className="p-4" style={{ background: `${GOLD}08`, borderLeft: `2px solid ${GOLD}60` }}>
                    <p className="font-mono text-xs uppercase tracking-wider text-foreground/90">{q}</p>
                  </div>
                  <div className="p-4 text-sm text-muted-foreground leading-relaxed"
                    style={{ background: "rgba(255,255,255,0.02)", borderLeft: "2px solid rgba(255,255,255,0.05)" }}>
                    {a}
                  </div>
                </div>
              ))}
            </Section>

            {/* ── GLOSSARY ──────────────────────────────────────────── */}
            <Section id="glossary" title="Glossary of Terms">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  ["Coherence Score", "Aggregate metric (0–10) measuring the alignment, stability, and directional strength of your reality field across all domains."],
                  ["Reality Vector", "The directional force of your intentional field — the combined magnitude and direction of your active intentions and identity architecture."],
                  ["Vector Magnitude", "The numerical strength of your reality vector. High magnitude indicates strong, consistent intentional force applied to a clear target reality."],
                  ["Pattern Lock", "A self-reinforcing reality construct that resists change because it is structurally integrated across multiple domains simultaneously."],
                  ["Dimensional Scan", "Full multi-domain assessment producing domain-specific coherence scores and an overall baseline coherence reading."],
                  ["Integration", "The process of internalizing and embodying a chapter transmission at the identity level, not merely understanding it intellectually."],
                  ["Transmission", "A chapter in the Code of Reality curriculum. Transmissions are designed to operate at multiple layers: conceptual, emotional, and structural."],
                  ["Phase Velocity", "The rate at which a practitioner progresses through the phases. High velocity is not always optimal — integration depth matters more than speed."],
                  ["Reality Architecture", "The complete structure of constructs, narratives, beliefs, identity statements, and environmental patterns that determine an individual's experienced reality."],
                  ["E₈ Integration", "The highest achievement state in the platform — completion of all 42 chapters with full structural coherence across all eight domains."],
                  ["Coherence Event", "A significant real-world experience (positive or disruptive) that provides data about the current state of your reality field."],
                  ["Acknowledgment", "The act of marking a chapter complete after full integration. Acknowledgment triggers coherence credit and phase progression tracking."],
                ].map(([term, def]) => (
                  <div key={term} className="border-b border-border/10 pb-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: GOLD }}>{term}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{def}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Footer */}
            <footer className="text-center pt-8 border-t border-border/20">
              <div className="mx-auto w-16 h-px mb-6"
                style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
                Code of Reality E₈ RealityMastery Platform™ · Ascendancy Technologies · All Rights Reserved
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/25 mt-2 uppercase tracking-wider">
                This document is confidential and intended solely for registered practitioners.
              </p>
            </footer>

          </div>{/* end main content */}
        </div>{/* end two-column */}
      </div>{/* end outer wrapper */}
    </>
  );
}
