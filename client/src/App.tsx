import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PublicHome from "./pages/PublicHome";
import PublicDashboard from "./pages/PublicDashboard";
import Dashboard from "./pages/Dashboard";
import LgpdConsent from "./pages/LgpdConsent";
import AdminFeatureBlocks from "./pages/AdminFeatureBlocks";
import Favorites from "./pages/Favorites";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicHome} />
      <Route path="/login" component={Login} />
      <Route path="/explore" component={PublicDashboard} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/lgpd-consent" component={LgpdConsent} />
      <Route path="/admin/feature-blocks" component={AdminFeatureBlocks} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
