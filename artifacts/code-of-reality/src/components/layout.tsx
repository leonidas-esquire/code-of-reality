import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogoutUser } from "@workspace/api-client-react";
import { 
  Network, 
  Activity, 
  Hexagon, 
  BookOpen, 
  Target, 
  User, 
  Book, 
  Clock, 
  MessageSquare, 
  BarChart, 
  Cpu, 
  Award,
  LogOut,
  Zap,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: Activity },
  { name: "Phases", href: "/phases", icon: Network },
  { name: "Assessment", href: "/assessment", icon: Hexagon },
  { name: "Intentions", href: "/intentions", icon: Target },
  { name: "Identity", href: "/identity", icon: User },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Sessions", href: "/sessions", icon: Clock },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "AI Coach", href: "/ai-coach", icon: Cpu },
  { name: "Achievements", href: "/achievements", icon: Award },
  { name: "Upgrade", href: "/pricing", icon: Zap },
  { name: "User Guide", href: "/guide", icon: FileText },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogoutUser();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("cor_token");
        window.location.href = "/auth";
      }
    });
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading reality matrix...</div>;
  }

  if (!user) {
    // If not logged in, just render children (auth page handles redirect)
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary selection:text-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/30 bg-card/50 backdrop-blur-md flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-border/30">
          <Hexagon className="w-6 h-6 text-primary mr-3" />
          <h1 className="font-serif text-lg tracking-widest text-primary uppercase">Code of Reality</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-mono tracking-wider uppercase transition-colors relative group",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_var(--primary)]" />
                )}
                <item.icon className="w-4 h-4 mr-4 opacity-70 group-hover:opacity-100" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border/30">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-none border border-primary/50 flex items-center justify-center mr-3 bg-primary/10">
              <span className="font-mono text-xs text-primary">{user.displayName?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono text-foreground truncate max-w-[120px]">{user.displayName}</span>
              <span className="text-[10px] text-primary/70 uppercase">Phase {user.currentPhase}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 w-full text-xs font-mono text-muted-foreground hover:text-destructive transition-colors uppercase"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Initiate Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col relative z-0">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
