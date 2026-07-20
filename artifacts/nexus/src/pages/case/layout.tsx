import React from 'react';
import { Route, Switch, useRoute, Link, useLocation } from 'wouter';
import { MOCK_CASES } from '@/data/mock-case';
import {
  FileText, BrainCircuit, Network, Clock, ShieldAlert, History, ArrowLeft,
  Download, ShieldCheck, RotateCcw, CheckCircle2, AlertTriangle, Phone,
  HelpCircle, MessageSquare, ClipboardList, Users, Mic, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import CasePurpose from './purpose';
import CaseDocuments from './documents';
import CaseAnalysis from './analysis';
import CaseNexus from './nexus';
import CaseTimeline from './timeline';
import CaseExportGate from './export-gate';
import CaseAudit from './audit';
import CaseGaps from './gaps';
import CaseSafety from './safety';
import CaseServices from './services';
import CaseInterview from './interview';
import CaseTasks from './tasks';
import CaseNotes from './notes';

const PROGRESS_STEPS = [
  { key: 'purpose',   label: 'Purpose',   path: '/purpose' },
  { key: 'documents', label: 'Documents', path: '' },
  { key: 'analysis',  label: 'Analysis',  path: '/analysis' },
  { key: 'planning',  label: 'Planning',  path: '/gaps' },
  { key: 'review',    label: 'Review',    path: '/nexus' },
  { key: 'export',    label: 'Export',    path: '/export' },
];

type NavSection = {
  title: string;
  items: {
    path: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeStyle?: 'warn' | 'blocked' | 'default' | 'urgent';
  }[];
};

export default function CaseLayout() {
  const [match, params] = useRoute('/case/:id/*?');
  const [location, setLocation] = useLocation();
  const id = params?.id || 'c-001';
  const caseData = MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0];

  const currentPath = location.replace(`/case/${id}`, '') || '/';

  const getActiveStep = () => {
    if (currentPath === '/purpose') return 'purpose';
    if (currentPath === '' || currentPath === '/') return 'documents';
    if (currentPath.startsWith('/analysis')) return 'analysis';
    if (currentPath.startsWith('/gaps') || currentPath.startsWith('/safety') ||
        currentPath.startsWith('/interview') || currentPath.startsWith('/services') ||
        currentPath.startsWith('/tasks') || currentPath.startsWith('/notes')) return 'planning';
    if (currentPath.startsWith('/nexus') || currentPath.startsWith('/timeline')) return 'review';
    if (currentPath.startsWith('/export')) return 'export';
    return 'documents';
  };
  const activeStep = getActiveStep();

  const NAV_SECTIONS: NavSection[] = [
    {
      title: 'Intake',
      items: [
        { path: '/purpose', label: 'Purpose Brief', icon: CheckCircle2 },
        { path: '/', label: 'Documents', icon: FileText },
      ],
    },
    {
      title: 'Analysis',
      items: [
        { path: '/analysis',  label: 'Structured Analysis', icon: BrainCircuit, badge: '4 Pending',   badgeStyle: 'warn' },
        { path: '/safety',    label: 'Urgent Needs',        icon: Phone,         badge: '1 Immediate', badgeStyle: 'urgent' },
        { path: '/gaps',      label: 'Evidence Gaps',       icon: HelpCircle,    badge: '3 Open',      badgeStyle: 'warn' },
      ],
    },
    {
      title: 'Planning',
      items: [
        { path: '/interview', label: 'Interview Planner',  icon: Mic,          badge: '2 Pending', badgeStyle: 'default' },
        { path: '/services',  label: 'Services & Referrals', icon: Users,      badgeStyle: 'default' },
        { path: '/tasks',     label: 'Case Tasks',         icon: ClipboardList, badge: '5 Open',   badgeStyle: 'default' },
        { path: '/notes',     label: 'Notes & Journal',    icon: MessageSquare },
      ],
    },
    {
      title: 'Review',
      items: [
        { path: '/nexus',    label: 'Charge–Coercion Nexus', icon: Network },
        { path: '/timeline', label: 'Timeline',               icon: Clock },
      ],
    },
    {
      title: 'Export',
      items: [
        { path: '/export', label: 'Export Gate', icon: ShieldAlert, badge: 'Blocked', badgeStyle: 'blocked' },
      ],
    },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/') return currentPath === '' || currentPath === '/';
    return currentPath.startsWith(itemPath);
  };

  const getBadgeClass = (style?: string) => {
    switch (style) {
      case 'urgent':  return 'border-red-400/50 text-red-400 bg-red-500/10';
      case 'blocked': return 'border-amber-500/40 text-amber-400 bg-amber-500/10';
      case 'warn':    return 'border-blue-400/40 text-blue-300 bg-blue-500/10';
      default:        return 'border-sidebar-border text-sidebar-foreground/50 bg-sidebar-border/20';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Synthetic warning banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-800 shrink-0">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        Synthetic training fixture only — not real case data · providerTransmission: false
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col flex-shrink-0 z-20">

          {/* Sidebar top – branding */}
          <div className="h-14 flex items-center px-4 border-b border-sidebar-border gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            <Link href="/cases" className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          </div>

          {/* Case identity */}
          <div className="px-4 py-4 border-b border-sidebar-border">
            <p className="text-[10px] font-mono text-sidebar-foreground/35 uppercase tracking-widest mb-1.5">Active Case</p>
            <h2 className="font-mono text-sm font-bold text-sidebar-foreground truncate">{caseData.refId}</h2>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5 truncate">{caseData.practitioner}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-mono text-sidebar-foreground/40">{caseData.documentCount} DOCS</span>
              <span className="text-sidebar-foreground/25">·</span>
              <span className={cn(
                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border",
                caseData.exportGateStatus === 'ready'
                  ? "text-teal-400 border-teal-500/30 bg-teal-500/10"
                  : "text-amber-400 border-amber-500/30 bg-amber-500/10"
              )}>
                {caseData.exportGateStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1.5 overflow-y-auto">
            {NAV_SECTIONS.map(section => (
              <div key={section.title}>
                <div className="text-[9px] font-mono uppercase tracking-widest text-sidebar-foreground/25 px-3 pt-3 pb-1.5">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const active = isActive(item.path);
                    return (
                      <Link key={item.path} href={`/case/${id}${item.path === '/' ? '' : item.path}`}>
                        <div className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                          active
                            ? "bg-white/10 text-sidebar-foreground shadow-sm"
                            : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-sidebar-foreground"
                        )}>
                          <div className="flex items-center gap-2.5">
                            <item.icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-primary" : "")} />
                            <span className="truncate text-[13px]">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={cn(
                              "text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border shrink-0 ml-1",
                              getBadgeClass(item.badgeStyle)
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-2 border-t border-sidebar-border space-y-0.5">
            <Link href={`/case/${id}/audit`}>
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                currentPath === '/audit'
                  ? "bg-white/10 text-sidebar-foreground"
                  : "text-sidebar-foreground/40 hover:bg-white/5 hover:text-sidebar-foreground"
              )}>
                <History className="w-3.5 h-3.5" />
                Audit Trail
              </div>
            </Link>
            <button
              onClick={() => setLocation('/cases')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Case
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top header bar */}
          <header className="h-12 border-b border-border bg-card/90 backdrop-blur-sm flex items-center justify-between px-5 shrink-0 z-10">
            <div className="flex items-center gap-2.5">
              {caseData.exportGateStatus === 'ready' ? (
                <div className="flex items-center gap-1.5 text-sm text-teal-700 font-semibold">
                  <div className="w-5 h-5 rounded-md bg-teal-100 border border-teal-200 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                  </div>
                  Export Gate Ready
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-amber-700 font-semibold">
                  <div className="w-5 h-5 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center">
                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                  </div>
                  Export Gate Blocked
                </div>
              )}
            </div>
            <Button
              size="sm"
              disabled={caseData.exportGateStatus !== 'ready'}
              className={cn(
                "font-semibold rounded-lg h-8 text-xs gap-1.5",
                caseData.exportGateStatus === 'ready'
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60"
              )}
            >
              <Download className="w-3.5 h-3.5" />Create Handoff
            </Button>
          </header>

          {/* Progress stepper */}
          <div className="h-11 border-b border-border bg-background flex items-center px-5 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-0">
              {PROGRESS_STEPS.map((step, i) => {
                const active = step.key === activeStep;
                const stepOrder = PROGRESS_STEPS.map(s => s.key);
                const activeIdx = stepOrder.indexOf(activeStep);
                const stepIdx = stepOrder.indexOf(step.key);
                const completed = stepIdx < activeIdx;

                return (
                  <React.Fragment key={step.key}>
                    <Link href={`/case/${id}${step.path}`}>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                        active
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : completed
                            ? "text-teal-700 hover:bg-teal-50"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}>
                        {completed ? (
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        ) : (
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold",
                            active ? "border-primary bg-primary text-white" : "border-current opacity-50"
                          )}>
                            {i + 1}
                          </div>
                        )}
                        {step.label}
                      </div>
                    </Link>
                    {i < PROGRESS_STEPS.length - 1 && (
                      <div className={cn("w-4 h-px mx-0.5", completed ? "bg-teal-300" : "bg-border")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-hidden relative">
            <Switch>
              <Route path="/case/:id/purpose"    component={CasePurpose} />
              <Route path="/case/:id"            component={CaseDocuments} />
              <Route path="/case/:id/analysis"   component={CaseAnalysis} />
              <Route path="/case/:id/gaps"       component={CaseGaps} />
              <Route path="/case/:id/safety"     component={CaseSafety} />
              <Route path="/case/:id/interview"  component={CaseInterview} />
              <Route path="/case/:id/services"   component={CaseServices} />
              <Route path="/case/:id/tasks"      component={CaseTasks} />
              <Route path="/case/:id/notes"      component={CaseNotes} />
              <Route path="/case/:id/nexus"      component={CaseNexus} />
              <Route path="/case/:id/timeline"   component={CaseTimeline} />
              <Route path="/case/:id/export"     component={CaseExportGate} />
              <Route path="/case/:id/audit"      component={CaseAudit} />
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
