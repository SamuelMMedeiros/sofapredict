import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import PublicHome from "./pages/PublicHome";
import Dashboard from "./pages/Dashboard";
import LgpdConsent from "./pages/LgpdConsent";
import AdminFeatureBlocks from "./pages/AdminFeatureBlocks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PublicHome} />
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
