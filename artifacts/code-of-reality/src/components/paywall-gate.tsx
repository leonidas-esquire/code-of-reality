import { useLocation } from "wouter";
import { useGetCurrentUser } from "@workspace/api-client-react";

const TIER_ORDER: Record<string, number> = { FREE: 0, EXPLORER: 1, ARCHITECT: 2, CERTIFIED: 3 };

const TIER_FEATURES: Record<string, string[]> = {
  ARCHITECT: [
    "Phases 5–8: Weaving, Transmitting, Mastering, Transcending",
    "E₈ AI Reality Coach — unlimited sessions",
    "Advanced pattern lock resolution tools",
    "Dimensional timeline deep analytics",
  ],
  CERTIFIED: [
    "Everything in ARCHITECT",
    "E₈ Mastery Certification credential",
    "Private mastermind groups",
    "1:1 reality architecture sessions",
  ],
};

interface PaywallGateProps {
  requiredTier: "ARCHITECT" | "CERTIFIED";
  featureDescription?: string;
  children: React.ReactNode;
}

export function PaywallGate({ requiredTier, featureDescription, children }: PaywallGateProps) {
  const { data: user, isLoading } = useGetCurrentUser();

  if (isLoading) return null;

  const currentTier = user?.subscriptionTier ?? "FREE";
  const currentLevel = TIER_ORDER[currentTier] ?? 0;
  const requiredLevel = TIER_ORDER[requiredTier] ?? 2;

  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return <PaywallOverlay requiredTier={requiredTier} featureDescription={featureDescription} currentTier={currentTier} />;
}

interface PaywallOverlayProps {
  requiredTier: "ARCHITECT" | "CERTIFIED";
  featureDescription?: string;
  currentTier: string;
}

function PaywallOverlay({ requiredTier, featureDescription, currentTier }: PaywallOverlayProps) {
  const [, setLocation] = useLocation();
  const accentColor = requiredTier === "CERTIFIED" ? "#d4af37" : "#00d4ff";
  const features = TIER_FEATURES[requiredTier] ?? [];

  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${accentColor}33`,
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        padding: "2.5rem",
        textAlign: "center",
      }}>
        {/* Lock icon */}
        <div style={{ marginBottom: "1.5rem" }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ margin: "0 auto" }}>
            <path d="M16 20V14C16 9.58 19.58 6 24 6C28.42 6 32 9.58 32 14V20" stroke={accentColor} strokeWidth="1.5" strokeLinecap="square" />
            <rect x="10" y="20" width="28" height="22" stroke={accentColor} strokeWidth="1.5" />
            <circle cx="24" cy="32" r="3" fill={accentColor} />
            <line x1="24" y1="35" x2="24" y2="38" stroke={accentColor} strokeWidth="1.5" />
          </svg>
        </div>

        <div style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: accentColor, textTransform: "uppercase", marginBottom: "0.75rem" }}>
          {requiredTier} Tier Required
        </div>

        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.75rem",
          fontWeight: 300,
          margin: "0 0 0.75rem",
          color: "#e8e8f0",
        }}>
          {featureDescription ?? "Advanced Territory"}
        </h2>

        <p style={{ color: "#8888aa", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.75rem" }}>
          This dimension requires {requiredTier === "ARCHITECT" ? "an" : "a"} <span style={{ color: accentColor }}>{requiredTier}</span> subscription.
          {currentTier !== "FREE" && " Upgrade to continue your transformation."}
        </p>

        {/* Feature list */}
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", textAlign: "left" }}>
          {features.map((f, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.8rem", color: "#c8c8d8", padding: "0.35rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: accentColor, flexShrink: 0 }}>◈</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => setLocation("/pricing")}
          style={{
            width: "100%",
            padding: "0.875rem",
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
            border: `1px solid ${accentColor}`,
            color: accentColor,
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          Upgrade to {requiredTier}
        </button>

        <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#555566" }}>
          Phases 1–4 remain free forever
        </div>
      </div>
    </div>
  );
}
