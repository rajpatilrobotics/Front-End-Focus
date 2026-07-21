import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Landing from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import TrustAndSafety from '@/pages/trust';
import CaseLayout from '@/pages/case/layout';
import { CaseProvider } from '@/context/CaseContext';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/cases" component={Dashboard} />
      <Route path="/trust" component={TrustAndSafety} />
      <Route path="/case/:id/*?" component={CaseLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CaseProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </CaseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
