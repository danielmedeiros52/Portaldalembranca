import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import FuneralHomeDashboard from "./pages/FuneralHomeDashboard";
import FamilyDashboard from "./pages/FamilyDashboard";
import MemorialEditPage from "./pages/MemorialEditPage";
import PublicMemorialPage from "./pages/PublicMemorialPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/dashboard/funeral-home"} component={FuneralHomeDashboard} />
      <Route path={"/dashboard/family"} component={FamilyDashboard} />
      <Route path={"/memorial/edit/:id"} component={MemorialEditPage} />
      <Route path={"/m/:slug"} component={PublicMemorialPage} />
      <Route path={"/accept-invitation/:token"} component={AcceptInvitationPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
