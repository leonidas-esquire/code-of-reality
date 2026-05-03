import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";

export default function BillingSuccessPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [status, setStatus] = useState<"syncing" | "done" | "error">("syncing");

  useEffect(() => {
    const token = localStorage.getItem("cor_token");
    if (!token) { setLocation("/auth"); return; }

    // Sync subscription tier from Stripe
    fetch("/api/billing/sync", { method: "POST", headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setStatus("done");
        setTimeout(() => setLocation("/phases"), 2500);
      })
      .catch(() => {
        setStatus("error");
        setTimeout(() => setLocation("/pricing"), 3000);
      });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center", padding: "2rem" }}>
        {status === "syncing" && (
          <>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.3em", color: "#00d4ff", textTransform: "uppercase", marginBottom: "1rem" }}>
              Activating Your Subscription
            </div>
            <div style={{ width: "48px", height: "48px", border: "1px solid #00d4ff", borderTop: "2px solid #00d4ff", borderRadius: "50%", margin: "0 auto 1.5rem", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#8888aa" }}>Synchronizing your reality field…</p>
          </>
        )}
        {status === "done" && (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✦</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", color: "#d4af37", marginBottom: "0.5rem" }}>
              Tier Activated
            </div>
            <p style={{ color: "#8888aa" }}>Your reality architecture has expanded. Redirecting to Phases…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ color: "#ff6b6b", marginBottom: "1rem" }}>Sync issue detected</div>
            <p style={{ color: "#8888aa" }}>Redirecting back to pricing…</p>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
