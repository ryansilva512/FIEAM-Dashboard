import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardProvider, useDashboard } from "@/store/dashboard-context";

import ImportPage from "@/pages/Import";
import OverviewPage from "@/pages/Overview";
import TimeAnalysisPage from "@/pages/TimeAnalysis";
import ThemesPage from "@/pages/Themes";
import DetailsPage from "@/pages/Details";
import NotFound from "@/pages/not-found";

// Redirect logic wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data } = useDashboard();
  // If no data is present, force redirect to import
  if (data.length === 0) {
    return <Redirect to="/import" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/import" component={ImportPage} />
      
      {/* Protected Routes - require data */}
      <Route path="/overview">
        {() => <ProtectedRoute component={OverviewPage} />}
      </Route>
      <Route path="/time-analysis">
        {() => <ProtectedRoute component={TimeAnalysisPage} />}
      </Route>
      <Route path="/themes">
        {() => <ProtectedRoute component={ThemesPage} />}
      </Route>
      <Route path="/details">
        {() => <ProtectedRoute component={DetailsPage} />}
      </Route>

      {/* Default route redirect */}
      <Route path="/">
        {() => <Redirect to="/import" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DashboardProvider>
          <Toaster />
          <Router />
        </DashboardProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
