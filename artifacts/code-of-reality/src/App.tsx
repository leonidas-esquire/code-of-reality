import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { AuthProvider } from "@/components/auth-provider";

// Pages
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import OnboardingPage from "@/pages/onboarding";
import PhasesPage from "@/pages/phases";
import ChapterPage from "@/pages/chapter";
import AssessmentPage from "@/pages/assessment";
import IntentionsPage from "@/pages/intentions";
import IdentityPage from "@/pages/identity";
import JournalPage from "@/pages/journal";
import SessionsPage from "@/pages/sessions";
import CommunityPage from "@/pages/community";
import AnalyticsPage from "@/pages/analytics";
import AiCoachPage from "@/pages/ai-coach";
import AchievementsPage from "@/pages/achievements";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/">
        <Layout>
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/phases" component={PhasesPage} />
            <Route path="/chapters/:id" component={ChapterPage} />
            <Route path="/assessment" component={AssessmentPage} />
            <Route path="/intentions" component={IntentionsPage} />
            <Route path="/identity" component={IdentityPage} />
            <Route path="/journal" component={JournalPage} />
            <Route path="/sessions" component={SessionsPage} />
            <Route path="/community" component={CommunityPage} />
            <Route path="/analytics" component={AnalyticsPage} />
            <Route path="/ai-coach" component={AiCoachPage} />
            <Route path="/achievements" component={AchievementsPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
