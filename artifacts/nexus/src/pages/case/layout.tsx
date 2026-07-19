import React from 'react';
import { Route, Switch, useRoute, Link, useLocation } from 'wouter';
import { MOCK_CASES } from '@/data/mock-case';
import { FileText, BrainCircuit, Network, Clock, ShieldAlert, History, ArrowLeft, Download, ShieldCheck, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import CasePurpose from './purpose';
import CaseDocuments from './documents';
import CaseAnalysis from './analysis';
import CaseNexus from './nexus';
import CaseTimeline from './timeline';
import CaseExportGate from './export-gate';
import CaseAudit from './audit';

const PROGRESS_STEPS = [
  { key: 'purpose', label: 'Purpose', path: '/purpose' },
  { key: 'documents', label: 'Documents', path: '' },
  { key: 'review', label: 'Review', path: '/analysis' },
  { key: 'export', label: 'Export', path: '/export' },
];

export default function CaseLayout() {
  const [match, params] = useRoute('/case/:id/*?');
  const [location, setLocation] = useLocation();
  const id = params?.id || 'c-001';
  const caseData = MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0];

  const currentPath = location.replace(`/case/${id}`, '') || '/';

  // Determine active progress step
  const getActiveStep = () => {
    if (currentPath === '/purpose') return 'purpose';
    if (currentPath === '' || currentPath === '/') return 'documents';
    if (currentPath.startsWith('/analysis') || currentPath.startsWith('/nexus') || currentPath.startsWith('/timeline')) return 'review';
    if (currentPath.startsWith('/export')) return 'export';
    return 'documents';
  };
  const activeStep = getActiveStep();

  const navItems = [
    { path: '/purpose', label: 'Purpose Brief', icon: CheckCircle2 },
    { path: '/', label: 'Documents', icon: FileText },
    { path: '/analysis', label: 'Analysis', icon: BrainCircuit, badge: '3 Pending' },
    { path: '/nexus', label: 'Charge-Coercion Nexus', icon: Network },
    { path: '/timeline', label: 'Timeline', icon: Clock },
    { path: '/export', label: 'Export Gate', icon: ShieldAlert, badge: 'Blocked' },
  ];

  const handleReset = () => {
    setLocation('/cases');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Synthetic warning banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-800 shrink-0">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        Synthetic training fixture only — not real case data · providerTransmission: false
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 border-r border-sidebar-border bg-sidebar flex flex-col flex-shrink-0 z-20">
          <div className="h-12 flex items-center px-4 border-b border-sidebar-border">
            <Link href="/cases" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          <div className="p-4 border-b border-sidebar-border">
            <h2 className="font-mono text-base font-bold text-sidebar-foreground truncate">{caseData.refId}</h2>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-sidebar-foreground/50 font-mono">
              <span>{caseData.documentCount} DOCS</span>
              <span>&bull;</span>
              <span className={cn(
                caseData.exportGateStatus === 'ready' ? "text-teal-400" : "text-amber-400"
              )}>
                {caseData.exportGateStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
            {navItems.map(item => {
              const isActive = currentPath === item.path || (item.path !== '/' && item.path !== '' && currentPath.startsWith(item.path));
              const isPurpose = item.path === '/purpose';
              return (
                <Link key={item.path} href={`/case/${id}${item.path === '/' ? '' : item.path}`}>
                  <div className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-sm text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    isPurpose && "border border-sidebar-foreground/10"
                  )}>
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={cn(
                        "text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border shrink-0",
                        item.badge === 'Blocked'
                          ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                          : "border-sidebar-border text-sidebar-foreground/60 bg-sidebar-border/30"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-2.5 space-y-0.5 border-t border-sidebar-border">
            <Link href={`/case/${id}/audit`}>
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium transition-colors cursor-pointer",
                currentPath === '/audit'
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <History className="w-3.5 h-3.5" />
                Audit Trail
              </div>
            </Link>
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium text-sidebar-foreground/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Case
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top header */}
          <header className="h-12 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-5 shrink-0 z-10">
            <div className="flex items-center gap-3">
              {caseData.exportGateStatus === 'ready' ? (
                <div className="flex items-center gap-1.5 text-sm text-teal-700 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Export Gate Ready
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-amber-700 font-medium">
                  <ShieldAlert className="w-4 h-4" />
                  Export Gate Blocked
                </div>
              )}
            </div>

            <Button
              size="sm"
              disabled={caseData.exportGateStatus !== 'ready'}
              className={cn(
                "font-medium rounded-sm h-8 text-xs",
                caseData.exportGateStatus === 'ready'
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60"
              )}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Create Handoff
            </Button>
          </header>

          {/* Horizontal progress nav */}
          <div className="h-10 border-b border-border bg-background flex items-center px-5 shrink-0">
            <div className="flex items-center gap-0">
              {PROGRESS_STEPS.map((step, i) => {
                const isActive = step.key === activeStep;
                const stepOrder = ['purpose', 'documents', 'review', 'export'];
                const activeIdx = stepOrder.indexOf(activeStep);
                const stepIdx = stepOrder.indexOf(step.key);
                const isCompleted = stepIdx < activeIdx;

                return (
                  <React.Fragment key={step.key}>
                    <Link href={`/case/${id}${step.path}`}>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer",
                        isActive
                          ? "text-primary bg-primary/8"
                          : isCompleted
                            ? "text-teal-700"
                            : "text-muted-foreground hover:text-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        ) : (
                          <div className={cn(
                            "w-3 h-3 rounded-full border flex items-center justify-center text-[8px] font-bold",
                            isActive ? "border-primary bg-primary text-white" : "border-border"
                          )}>
                            {!isCompleted && <span>{i + 1}</span>}
                          </div>
                        )}
                        {step.label}
                      </div>
                    </Link>
                    {i < PROGRESS_STEPS.length - 1 && (
                      <div className={cn("w-6 h-px mx-0.5", isCompleted ? "bg-teal-300" : "bg-border")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-hidden relative">
            <Switch>
              <Route path="/case/:id/purpose" component={CasePurpose} />
              <Route path="/case/:id" component={CaseDocuments} />
              <Route path="/case/:id/analysis" component={CaseAnalysis} />
              <Route path="/case/:id/nexus" component={CaseNexus} />
              <Route path="/case/:id/timeline" component={CaseTimeline} />
              <Route path="/case/:id/export" component={CaseExportGate} />
              <Route path="/case/:id/audit" component={CaseAudit} />
              <Route>
                <div className="p-8 text-center text-muted-foreground font-mono">Select a section from the sidebar.</div>
              </Route>
            </Switch>
          </main>
        </div>
      </div>
    </div>
  );
}
