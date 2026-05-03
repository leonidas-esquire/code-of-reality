import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("cor_token"));
  }, []);

  return <>{children}</>;
}
