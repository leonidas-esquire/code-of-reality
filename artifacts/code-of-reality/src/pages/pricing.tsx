import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetCurrentUser } from "@workspace/api-client-react";

interface Price {
  id: string;
  unitAmount: number;
  currency: string;
  recurring: { interval: string } | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Price[];
}

const TIER_ORDER: Record<string, number> = { FREE: 0, EXPLORER: 1, ARCHITECT: 2, CERTIFIED: 3 };

const ARCHITECT_FEATURES = [
  "Full access to Phases 5–8",
  "Weaving, Transmitting, Mastering, Transcending",
  "E₈ AI Reality Coach (unlimited sessions)",
  "Advanced pattern lock resolution",
  "Dimensional timeline analytics",
  "Intention constellation weaving",
  "Community forum full access",
];

const CERTIFIED_FEATURES = [
  "Everything in ARCHITECT",
  "E₈ Mastery Certification credential",
  "Private mastermind access",
  "1:1 reality architecture sessions",
  "Certified practitioner directory listing",
  "Early access to new tools & phases",
];

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const { data: user } = useGetCurrentUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentTier = user?.subscriptionTier ?? "FREE";
  const currentTierLevel = TIER_ORDER[currentTier] ?? 0;

  useEffect(() => {
    fetch("/api/billing/products")
      .then(r => r.json())
      .then(data => { setProducts(data.products ?? []); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  async function handleCheckout(priceId: string) {
    const token = localStorage.getItem("cor_token");
    if (!token) { setLocation("/auth"); return; }
    setCheckingOut(priceId);
    setError(null);
    try {
      const r = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ priceId }),
      });
      const data = await r.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.message ?? "Checkout failed"); setCheckingOut(null); }
    } catch {
      setError("Could not connect to billing service");
      setCheckingOut(null);
    }
  }

  async function handlePortal() {
    const token = localStorage.getItem("cor_token");
    if (!token) return;
    const r = await fetch("/api/billing/portal", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const data = await r.json();
    if (data.url) window.location.href = data.url;
  }

  function getProductPrice(product: Product): Price | null {
    return product.prices.find(p => p.recurring?.interval === "month") ?? product.prices[0] ?? null;
  }

  function getPriceDisplay(price: Price | null): string {
    if (!price) return "—";
    return `$${(price.unitAmount / 100).toFixed(0)}/mo`;
  }

  function getTierForProduct(product: Product): string {
    return product.metadata?.tier ?? "ARCHITECT";
  }

  const architectProduct = products.find(p => p.metadata?.tier === "ARCHITECT");
  const certifiedProduct = products.find(p => p.metadata?.tier === "CERTIFIED");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0", fontFamily: "'DM Sans', sans-serif", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.3em", color: "#00d4ff", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          E₈ REALITYMASTERY PLATFORM
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 300, margin: "0 0 1rem", background: "linear-gradient(135deg, #e8e8f0 0%, #d4af37 50%, #00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Unlock Your Full Reality
        </h1>
        <p style={{ color: "#8888aa", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
          Phases 5–8 represent the advanced territory of consciousness engineering. Choose your tier to continue the transformation.
        </p>
      </div>

      {/* Current tier badge */}
      {currentTier !== "FREE" && (
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.25rem", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: "2px", fontSize: "0.8rem", color: "#00d4ff", letterSpacing: "0.1em" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4ff", display: "inline-block" }} />
            Current Plan: {currentTier}
          </span>
          {currentTierLevel >= 2 && (
            <button onClick={handlePortal} style={{ marginLeft: "1rem", background: "none", border: "1px solid #444", color: "#8888aa", padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.8rem", borderRadius: "2px" }}>
              Manage Subscription
            </button>
          )}
        </div>
      )}

      {/* Free Phase Access Banner */}
      <div style={{ maxWidth: "820px", margin: "0 auto 2.5rem", padding: "1rem 1.5rem", background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)", clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.5rem" }}>✦</span>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#d4af37", letterSpacing: "0.1em", textTransform: "uppercase" }}>Free Forever: Phases 1–4</div>
            <div style={{ fontSize: "0.85rem", color: "#8888aa", marginTop: "0.2rem" }}>Awakening, Clearing, Mapping, and Crystallizing — the foundation of your reality architecture — remain permanently accessible at no cost.</div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", maxWidth: "820px", margin: "0 auto" }}>
        {/* ARCHITECT */}
        <PricingCard
          tier="ARCHITECT"
          name="E₈ ARCHITECT"
          tagline="Advanced Practitioner"
          price={loading ? "..." : getPriceDisplay(architectProduct ? getProductPrice(architectProduct) : null)}
          fallbackPrice="$49/mo"
          features={ARCHITECT_FEATURES}
          accentColor="#00d4ff"
          isCurrentTier={currentTier === "ARCHITECT"}
          isUpgrade={currentTierLevel < TIER_ORDER["ARCHITECT"]}
          isDowngrade={currentTierLevel > TIER_ORDER["ARCHITECT"]}
          priceId={architectProduct ? (getProductPrice(architectProduct)?.id ?? null) : null}
          onCheckout={handleCheckout}
          checkingOut={checkingOut}
          stripeReady={!loading && architectProduct !== undefined}
        />

        {/* CERTIFIED */}
        <PricingCard
          tier="CERTIFIED"
          name="E₈ CERTIFIED"
          tagline="Sovereign Reality Architect"
          price={loading ? "..." : getPriceDisplay(certifiedProduct ? getProductPrice(certifiedProduct) : null)}
          fallbackPrice="$99/mo"
          features={CERTIFIED_FEATURES}
          accentColor="#d4af37"
          isCurrentTier={currentTier === "CERTIFIED"}
          isUpgrade={currentTierLevel < TIER_ORDER["CERTIFIED"]}
          isDowngrade={false}
          priceId={certifiedProduct ? (getProductPrice(certifiedProduct)?.id ?? null) : null}
          onCheckout={handleCheckout}
          checkingOut={checkingOut}
          stripeReady={!loading && certifiedProduct !== undefined}
          highlighted
        />
      </div>

      {error && (
        <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#ff6b6b", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* E₈ geometry decoration */}
      <div style={{ textAlign: "center", marginTop: "4rem", opacity: 0.15 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 8;
            const x = 60 + 50 * Math.cos(a);
            const y = 60 + 50 * Math.sin(a);
            const x2 = 60 + 50 * Math.cos(a + Math.PI * 2 / 8 * 3);
            const y2 = 60 + 50 * Math.sin(a + Math.PI * 2 / 8 * 3);
            return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="#00d4ff" strokeWidth="0.5" />;
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 8;
            return <circle key={i} cx={60 + 50 * Math.cos(a)} cy={60 + 50 * Math.sin(a)} r="3" fill="#d4af37" />;
          })}
        </svg>
      </div>
    </div>
  );
}

interface PricingCardProps {
  tier: string;
  name: string;
  tagline: string;
  price: string;
  fallbackPrice: string;
  features: string[];
  accentColor: string;
  isCurrentTier: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  priceId: string | null;
  onCheckout: (priceId: string) => void;
  checkingOut: string | null;
  stripeReady: boolean;
  highlighted?: boolean;
}

function PricingCard({ tier, name, tagline, price, fallbackPrice, features, accentColor, isCurrentTier, isUpgrade, priceId, onCheckout, checkingOut, stripeReady, highlighted }: PricingCardProps) {
  const displayPrice = price === "..." ? price : (price === "—" ? fallbackPrice : price);
  const isCheckingOut = priceId && checkingOut === priceId;

  return (
    <div style={{
      background: highlighted ? `rgba(${accentColor === "#d4af37" ? "212,175,55" : "0,212,255"},0.04)` : "rgba(255,255,255,0.02)",
      border: `1px solid ${highlighted ? accentColor + "55" : "rgba(255,255,255,0.08)"}`,
      clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
      padding: "2rem",
      position: "relative",
    }}>
      {highlighted && (
        <div style={{ position: "absolute", top: "1rem", right: "1.5rem", fontSize: "0.65rem", letterSpacing: "0.2em", color: accentColor, textTransform: "uppercase", fontWeight: 600 }}>
          Most Powerful
        </div>
      )}

      <div style={{ marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.65rem", letterSpacing: "0.3em", color: accentColor, textTransform: "uppercase" }}>
          {tagline}
        </span>
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 400, margin: "0 0 1.5rem", color: "#e8e8f0" }}>
        {name}
      </h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "2.5rem", fontWeight: 200, color: accentColor, fontFamily: "'Cormorant Garamond', serif" }}>
          {displayPrice}
        </span>
        {!displayPrice.includes("...") && (
          <span style={{ fontSize: "0.8rem", color: "#8888aa", marginLeft: "0.5rem" }}>billed monthly</span>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.875rem", color: "#c8c8d8", lineHeight: 1.5 }}>
            <span style={{ color: accentColor, flexShrink: 0, marginTop: "1px" }}>◈</span>
            {f}
          </li>
        ))}
      </ul>

      {isCurrentTier ? (
        <div style={{ padding: "0.875rem", textAlign: "center", border: `1px solid ${accentColor}44`, color: accentColor, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Current Plan
        </div>
      ) : (
        <button
          onClick={() => priceId && onCheckout(priceId)}
          disabled={!!isCheckingOut || (!stripeReady && !priceId)}
          style={{
            width: "100%",
            padding: "0.875rem",
            background: isCheckingOut ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`,
            border: `1px solid ${accentColor}`,
            color: isCheckingOut ? "#8888aa" : accentColor,
            fontSize: "0.8rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: isCheckingOut ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
            clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          {isCheckingOut ? "Redirecting to Checkout…" : isUpgrade ? `Upgrade to ${tier}` : `Switch to ${tier}`}
        </button>
      )}
    </div>
  );
}
