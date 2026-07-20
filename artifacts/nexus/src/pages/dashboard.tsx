import React from 'react';
import { Case, MOCK_CASES, MOCK_TASKS, MOCK_URGENT_NEEDS, MOCK_EVIDENCE_GAPS } from '@/data/mock-case';
import { Link } from 'wouter';
import {
  FileText, ShieldAlert, CheckCircle2, Clock, Plus, Activity, ArrowLeft,
  AlertTriangle, HelpCircle, ClipboardList, Phone, Eye, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const openCases = MOCK_CASES.filter(c => c.status === 'open');
  const readyCases = openCases.filter(c => c.exportGateStatus === 'ready');
  const pendingCases = openCases.filter(c => c.exportGateStatus === 'blocked');

  const overdueTaskCount = MOCK_TASKS.filter(t => {
    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'cancelled';
  }).length;

  const urgentNeedCount = MOCK_URGENT_NEEDS.filter(n => n.urgency === 'immediate' || n.status === 'action-required').length;
  const openGapCount = MOCK_EVIDENCE_GAPS.filter(g => g.status === 'open' || g.status === 'investigating').length;

  const STAT_CARDS = [
    { label: 'Open Cases',           value: openCases.length,    color: 'text-foreground',   accent: 'bg-foreground/8',    icon: Activity,     border: 'border-l-foreground/20' },
    { label: 'Pending Review',       value: pendingCases.length, color: 'text-amber-600',    accent: 'bg-amber-500/8',     icon: Eye,          border: 'border-l-amber-400' },
    { label: 'Export Ready',         value: readyCases.length,   color: 'text-teal-600',     accent: 'bg-teal-500/8',      icon: CheckCircle2, border: 'border-l-teal-500' },
    { label: 'Overdue Tasks',        value: overdueTaskCount,    color: overdueTaskCount > 0 ? 'text-red-600' : 'text-muted-foreground', accent: overdueTaskCount > 0 ? 'bg-red-500/8' : 'bg-muted/50', icon: ClipboardList, border: overdueTaskCount > 0 ? 'border-l-red-500' : 'border-l-border' },
    { label: 'Urgent Needs Active',  value: urgentNeedCount,     color: urgentNeedCount > 0 ? 'text-red-600' : 'text-muted-foreground', accent: urgentNeedCount > 0 ? 'bg-red-500/8' : 'bg-muted/50', icon: Phone, border: urgentNeedCount > 0 ? 'border-l-red-500' : 'border-l-border' },
    { label: 'Evidence Gaps Open',   value: openGapCount,        color: openGapCount > 0 ? 'text-amber-600' : 'text-muted-foreground', accent: openGapCount > 0 ? 'bg-amber-500/8' : 'bg-muted/50', icon: HelpCircle, border: openGapCount > 0 ? 'border-l-amber-400' : 'border-l-border' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Header */}
      <header className="border-b border-border bg-card/90 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-5 bg-border" />
          <div className="w-8 h-8 rounded-lg bg-primary/12 flex items-center justify-center border border-primary/20">
            <Activity className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground leading-tight">Case Dashboard</h1>
            <p className="text-[11px] text-muted-foreground font-mono leading-tight">ContextFirst Nexus · Synthetic Fixture</p>
          </div>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold gap-1.5 shadow-sm shadow-primary/20">
          <Plus className="w-3.5 h-3.5" />New Case
        </Button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">

        {/* ── Stat grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map(stat => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "bg-card border border-border border-l-4 p-4 rounded-xl flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow",
                  stat.border,
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider leading-tight">{stat.label}</span>
                  <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", stat.accent)}>
                    <Icon className={cn("w-3.5 h-3.5", stat.color)} />
                  </div>
                </div>
                <span className={cn("text-3xl font-bold font-mono", stat.color)}>{stat.value}</span>
              </div>
            );
          })}
        </div>

        {/* ── Urgent attention banner ── */}
        {(overdueTaskCount > 0 || urgentNeedCount > 0) && (
          <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800 mb-1">Attention required</p>
              <div className="space-y-0.5 text-sm text-red-700">
                {urgentNeedCount > 0 && <p>· {urgentNeedCount} urgent need{urgentNeedCount > 1 ? 's' : ''} require immediate or same-day action.</p>}
                {overdueTaskCount > 0 && <p>· {overdueTaskCount} task{overdueTaskCount > 1 ? 's are' : ' is'} past due date.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Active workspaces ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full" />
              Active Workspaces
            </h2>
            <span className="text-xs text-muted-foreground font-mono">{openCases.length} open</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openCases.map(c => <CaseCard key={c.id} caseData={c} />)}
          </div>
        </div>
      </main>
    </div>
  );
}

function CaseCard({ caseData }: { caseData: Case }) {
  const isReady = caseData.exportGateStatus === 'ready';
  const caseTasks = MOCK_TASKS.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const caseGaps = MOCK_EVIDENCE_GAPS.filter(g => g.status === 'open' || g.status === 'investigating');
  const caseNeeds = MOCK_URGENT_NEEDS.filter(n => n.urgency === 'immediate');

  return (
    <Link href={`/case/${caseData.id}`} className="block group">
      <div className={cn(
        "bg-card border border-border rounded-xl flex flex-col h-full cursor-pointer shadow-sm transition-all duration-200",
        "group-hover:shadow-lg group-hover:border-primary/25 group-hover:-translate-y-0.5",
      )}>
        {/* Status bar at top */}
        <div className={cn(
          "h-1 w-full rounded-t-xl",
          isReady ? "bg-gradient-to-r from-teal-400 to-teal-500" : "bg-gradient-to-r from-amber-400 to-amber-500"
        )} />

        <div className="p-5 flex flex-col flex-1 gap-4">
          {/* Card header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-mono text-base font-bold text-foreground group-hover:text-primary transition-colors">{caseData.refId}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{caseData.practitioner}</p>
            </div>
            <div className={cn(
              "px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5",
              isReady
                ? "bg-teal-50 border-teal-200 text-teal-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            )}>
              {isReady ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
              {isReady ? 'Ready' : 'Blocked'}
            </div>
          </div>

          {/* Metrics */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />Documents
              </span>
              <span className="font-mono font-semibold text-foreground">{caseData.documentCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />Analysis
              </span>
              <span className={cn(
                "font-mono text-[11px] px-2 py-0.5 rounded-md border font-semibold",
                caseData.analysisReadiness === 'ready'
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-muted border-border text-muted-foreground"
              )}>
                {caseData.analysisReadiness.toUpperCase()}
              </span>
            </div>
            {caseNeeds.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 flex items-center gap-2 font-medium">
                  <Phone className="w-3.5 h-3.5" />Urgent Needs
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md border bg-red-50 border-red-200 text-red-700 font-bold">
                  {caseNeeds.length} IMMEDIATE
                </span>
              </div>
            )}
            {caseGaps.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5" />Evidence Gaps
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md border bg-amber-50 border-amber-200 text-amber-700 font-bold">
                  {caseGaps.length} OPEN
                </span>
              </div>
            )}
            {caseTasks.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <ClipboardList className="w-3.5 h-3.5" />Tasks
                </span>
                <span className="font-mono text-foreground">{caseTasks.length} open</span>
              </div>
            )}
          </div>

          {/* Card footer */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Clock className="w-3 h-3" />
              {new Date(caseData.lastActivity).toLocaleDateString()}
            </span>
            <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Workspace <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
