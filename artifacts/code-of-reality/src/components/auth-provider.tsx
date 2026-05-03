import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useLocation } from "wouter";

// Set the getter synchronously so it is in place before the very first
// API call fires on the initial render (a useEffect would be too late).
setAuthTokenGetter(() => localStorage.getItem("cor_token"));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If no token exists at all, send the user to /auth immediately.
    if (!localStorage.getItem("cor_token")) {
      setLocation("/auth");
    }
  }, [setLocation]);

  return <>{children}</>;
}
