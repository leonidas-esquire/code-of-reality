import { useState } from "react";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hexagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      loginMutation.mutate({ data: { email, password } }, {
        onSuccess: (data) => {
          localStorage.setItem("cor_token", data.token);
          setLocation("/");
        },
        onError: (err: any) => {
          toast({ title: "Initiation Failed", description: err.message || "Invalid credentials", variant: "destructive" });
        }
      });
    } else {
      registerMutation.mutate({ data: { email, password, displayName } }, {
        onSuccess: (data) => {
          localStorage.setItem("cor_token", data.token);
          setLocation("/onboarding");
        },
        onError: (err: any) => {
          toast({ title: "Registration Failed", description: err.message || "Could not create entity", variant: "destructive" });
        }
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
      </div>

      <div className="z-10 w-full max-w-md p-8 sacred-border bg-card/80 backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 border border-primary flex items-center justify-center mb-4 clip-corners bg-primary/10">
            <Hexagon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl text-primary tracking-widest uppercase mb-2">Code of Reality</h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">E₈ RealityMastery Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="font-mono text-xs text-primary/80 uppercase">Designation</label>
              <Input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                className="bg-background/50 border-primary/30 font-mono text-sm focus-visible:ring-primary/50 rounded-none clip-corners"
                placeholder="Enter identity label"
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="font-mono text-xs text-primary/80 uppercase">Vector Coordinate (Email)</label>
            <Input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="bg-background/50 border-primary/30 font-mono text-sm focus-visible:ring-primary/50 rounded-none clip-corners"
              placeholder="operator@matrix.net"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs text-primary/80 uppercase">Cryptographic Key</label>
            <Input 
              type="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="bg-background/50 border-primary/30 font-mono text-sm focus-visible:ring-primary/50 rounded-none clip-corners"
              placeholder="••••••••"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary/20 hover:bg-primary/40 text-primary border border-primary rounded-none clip-corners font-mono uppercase tracking-widest py-6 mt-6"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {isLogin ? "Initialize Sequence" : "Establish Resonance"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors uppercase"
          >
            {isLogin ? "Request new vector coordinate" : "Already established resonance?"}
          </button>
        </div>
      </div>
    </div>
  );
}
