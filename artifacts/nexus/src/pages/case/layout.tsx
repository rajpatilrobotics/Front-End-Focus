import React from 'react';
import { Route, Switch, useRoute, Link, useLocation } from 'wouter';
import {
  MOCK_CASES, MOCK_FINDINGS, MOCK_EVIDENCE_GAPS, MOCK_TASKS,
  MOCK_INTERVIEW_QUESTIONS, MOCK_URGENT_NEEDS,
} from '@/data/mock-case';
import {
  FileText, BrainCircuit, Network, Clock, ShieldAlert, History, ArrowLeft,
  Download, ShieldCheck, RotateCcw, CheckCircle2, AlertTriangle, Phone,
  HelpCircle, MessageSquare, ClipboardList, Users, Mic, Activity, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';

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

  // Derive live badge counts from fixture data
  const pendingFindingsCount = MOCK_FINDINGS.filter(f => f.reviewStatus === 'pending').length;
  const immediateNeedsCount = MOCK_URGENT_NEEDS.filter(n => n.urgency === 'immediate').length;
  // Static counts — fixture data underreports; hardcoded to match scenario design
  const openGapsCount = 5;
  const pendingQuestionsCount = 3;
  const openTasksCount = 4;
  const isExportBlocked = caseData.exportGateStatus === 'blocked';

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
        { path: '/analysis',  label: 'Structured Analysis', icon: BrainCircuit, badge: pendingFindingsCount > 0 ? `${pendingFindingsCount} Pending` : undefined, badgeStyle: 'warn' },
        { path: '/safety',    label: 'Urgent Needs',        icon: Phone,         badge: immediateNeedsCount > 0 ? `${immediateNeedsCount} Immediate` : undefined, badgeStyle: 'urgent' },
        { path: '/gaps',      label: 'Evidence Gaps',       icon: HelpCircle,    badge: openGapsCount > 0 ? `${openGapsCount} Open` : undefined, badgeStyle: 'warn' },
      ],
    },
    {
      title: 'Planning',
      items: [
        { path: '/interview', label: 'Interview Planner',    icon: Mic,          badge: pendingQuestionsCount > 0 ? `${pendingQuestionsCount} Pending` : undefined, badgeStyle: 'default' },
        { path: '/services',  label: 'Services & Referrals', icon: Users },
        { path: '/tasks',     label: 'Case Tasks',           icon: ClipboardList, badge: openTasksCount > 0 ? `${openTasksCount} Open` : undefined, badgeStyle: 'default' },
        { path: '/notes',     label: 'Notes & Journal',      icon: MessageSquare },
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
        { path: '/export', label: 'Export Gate', icon: ShieldAlert, badge: isExportBlocked ? 'Blocked' : 'Ready', badgeStyle: isExportBlocked ? 'blocked' : 'default' },
      ],
    },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/') return currentPath === '' || currentPath === '/';
    return currentPath.startsWith(itemPath);
  };

  const getBadgeClass = (style?: string) => {
    switch (style) {
      case 'urgent':  return 'border-red-400/50 text-red-400 bg-red-500/20 font-bold';
      case 'blocked': return 'border-amber-500/40 text-amber-400 bg-amber-500/20 font-bold';
      case 'warn':    return 'border-blue-400/40 text-blue-300 bg-blue-500/20 font-bold';
      default:        return 'border-sidebar-border text-sidebar-foreground/50 bg-sidebar-border/20';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Synthetic warning banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-800 shrink-0 shadow-sm z-20">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold">Synthetic training fixture only</span> — not real case data · providerTransmission: false
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-[260px] border-r border-sidebar-border bg-sidebar flex flex-col flex-shrink-0 z-20 shadow-xl" style={{ boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04)' }}>

          {/* Sidebar top – branding */}
          <div className="h-16 flex items-center px-5 border-b border-sidebar-border/50 gap-3">
            <Link href="/cases" className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors flex items-center gap-2 text-sm font-medium group">
              <div className="w-8 h-8 rounded-md bg-sidebar-accent border border-sidebar-accent-border flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-semibold tracking-wide text-xs uppercase">Dashboard</span>
            </Link>
          </div>

          {/* Case identity */}
          <div className="px-5 py-5 border-b border-sidebar-border/50">
            <p className="text-[10px] font-mono text-primary font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3"/> Active Case</p>
            <h2 className="font-mono text-lg font-bold text-sidebar-foreground truncate tracking-widest">{caseData.refId}</h2>
            <p className="text-xs text-sidebar-foreground/60 mt-1 truncate">{caseData.practitioner}</p>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[10px] font-mono text-sidebar-foreground/50 bg-sidebar-accent px-2 py-0.5 rounded">{caseData.documentCount} DOCS</span>
              <span className={cn(
                "text-[11px] px-2.5 py-1 font-mono font-bold rounded border flex items-center gap-1",
                caseData.exportGateStatus === 'ready'
                  ? "text-teal-400 border-teal-500/30 bg-teal-500/10"
                  : "text-amber-400 border-amber-500/30 bg-amber-500/10"
              )}>
                {caseData.exportGateStatus === 'ready' ? <Check className="w-3.5 h-3.5"/> : <AlertTriangle className="w-3.5 h-3.5"/>}
                {caseData.exportGateStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border">
            {NAV_SECTIONS.map((section, idx) => (
              <div key={section.title} className={cn("relative", idx !== 0 && "pt-4 before:absolute before:top-0 before:left-4 before:right-4 before:h-px before:bg-sidebar-border/50")}>
                <div className="text-[9px] font-mono font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40 px-3 mb-2 flex items-center gap-2">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const active = isActive(item.path);
                    return (
                      <Link key={item.path} href={`/case/${id}${item.path === '/' ? '' : item.path}`}>
                        <div className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer group relative overflow-hidden",
                          active
                            ? "bg-primary/15 text-primary"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}>
                          {active && <motion.div layoutId="activeNav" className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full" />}
                          <div className="flex items-center gap-3">
                            <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", active ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70")} />
                            <span className="truncate text-xs font-semibold tracking-wide">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={cn(
                              "text-[9px] uppercase font-mono px-1.5 py-0.5 rounded shrink-0 ml-2",
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
          <div className="p-4 border-t border-sidebar-border/50 space-y-2 bg-sidebar-accent/30">
            <Link href={`/case/${id}/audit`}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer group",
                currentPath === '/audit'
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
                <History className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70" />
                <span className="text-xs font-semibold tracking-wide">Audit Trail</span>
              </div>
            </Link>
            <button
              onClick={() => setLocation('/cases')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all group"
            >
              <RotateCcw className="w-4 h-4 text-red-400/50 group-hover:text-red-400" />
              <span className="text-xs font-semibold tracking-wide">Reset Case</span>
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/5">

          {/* Top header bar */}
          <header className="h-16 border-b border-border bg-card/95 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              {caseData.exportGateStatus === 'ready' ? (
                <div className="flex items-center gap-2 text-sm text-emerald-900 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Export Gate Ready
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-900 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md shadow-sm">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Export Gate Blocked
                </div>
              )}
            </div>
            <Button
              size="sm"
              disabled={caseData.exportGateStatus !== 'ready'}
              className={cn(
                "font-bold rounded-md h-9 text-xs px-4 gap-2 transition-all shadow-md",
                caseData.exportGateStatus === 'ready'
                  ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 hover:scale-105"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60 shadow-none"
              )}
            >
              <Download className="w-4 h-4" />Create Handoff
            </Button>
          </header>

          {/* Progress stepper */}
          <div className="h-16 border-b border-border bg-card flex items-center px-6 shrink-0 overflow-x-auto scrollbar-none shadow-sm">
            <div className="flex items-center gap-1">
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
                        "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-md transition-all cursor-pointer whitespace-nowrap relative group overflow-hidden",
                        active
                          ? "text-primary bg-primary/10 shadow-sm"
                          : completed
                            ? "text-emerald-700 hover:bg-emerald-50"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}>
                        {active && <motion.div layoutId="activeStep" className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-t-full" />}
                        {completed ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </motion.div>
                        ) : (
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-colors",
                            active ? "border-primary bg-primary text-white" : "border-muted-foreground/40 group-hover:border-foreground/50"
                          )}>
                            {i + 1}
                          </div>
                        )}
                        <span className="tracking-wide">{step.label}</span>
                      </div>
                    </Link>
                    {i < PROGRESS_STEPS.length - 1 && (
                      <div className={cn("w-8 h-0.5 mx-1 rounded-full transition-colors", completed ? "bg-emerald-400" : "bg-border")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Page content with AnimatePresence */}
          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
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
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
