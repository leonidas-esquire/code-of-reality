import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Set synchronously at module load — before any API call fires on first render.
setAuthTokenGetter(() => localStorage.getItem("cor_token"));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // No eager redirect here — let the Layout handle it after the user
  // fetch resolves, so an invalid/expired token gets cleared first.

  return <>{children}</>;
}
