import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import CheckoutPage from "./pages/CheckoutPage";
import FuneralHomeDashboard from "./pages/FuneralHomeDashboard";
import FamilyDashboard from "./pages/FamilyDashboard";
import MemorialEditPage from "./pages/MemorialEditPage";
import PublicMemorialPage from "./pages/PublicMemorialPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import MemorialsPage from "./pages/MemorialsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/forgot-password"} component={ForgotPasswordPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/checkout"} component={CheckoutPage} />
      <Route path={"/dashboard/funeral-home"} component={FuneralHomeDashboard} />
      <Route path={"/dashboard/family"} component={FamilyDashboard} />
      <Route path={"/memorial/edit/:id"} component={MemorialEditPage} />
      <Route path={"/memoriais"} component={MemorialsPage} />
      <Route path={"/m/:slug"} component={PublicMemorialPage} />
      <Route path={"/accept-invitation/:token"} component={AcceptInvitationPage} />
      {/* Admin Routes */}
      <Route path={"/admin/login"} component={AdminLoginPage} />
      <Route path={"/admin"} component={AdminDashboard} />
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
