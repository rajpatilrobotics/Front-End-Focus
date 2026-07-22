import React from 'react';
import { Case, MOCK_CASES, MOCK_TASKS, MOCK_URGENT_NEEDS, MOCK_EVIDENCE_GAPS, CHALLENGE_CASE, CHALLENGE_FINDINGS, CHALLENGE_DOCUMENTS } from '@/data/mock-case';
import { Link } from 'wouter';
import {
  FileText, ShieldAlert, CheckCircle2, Clock, Plus, Activity, ArrowLeft,
  AlertTriangle, HelpCircle, ClipboardList, Phone, Eye, ArrowRight,
  FlaskConical, XCircle, TriangleAlert, Shield, Users,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';

export default function Dashboard() {
  const openCases = MOCK_CASES.filter(c => c.status === 'open');
  const readyCases = openCases.filter(c => c.exportGateStatus === 'ready');
  const pendingCases = openCases.filter(c => c.exportGateStatus === 'blocked');

  const overdueTaskCount = MOCK_TASKS.filter(t => {
    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'cancelled';
  }).length;

  const urgentNeedCount = MOCK_URGENT_NEEDS.filter(n => n.urgency === 'immediate' || n.status === 'action-required').length;
  // Static count — fixture data underreports; hardcoded to match scenario design
  const openGapCount = 5;

  const STAT_CARDS = [
    { label: 'Open Cases',           value: openCases.length,    color: 'text-foreground',   accent: 'from-foreground/20 to-foreground/5 text-foreground',    icon: Activity,     border: 'border-l-foreground' },
    { label: 'Pending Review',       value: pendingCases.length, color: 'text-blue-700',     accent: 'from-blue-500/20 to-blue-500/5 text-blue-700',          icon: Eye,          border: 'border-l-blue-500' },
    { label: 'Export Ready',         value: readyCases.length,   color: 'text-teal-700',     accent: 'from-teal-500/20 to-teal-500/5 text-teal-700',           icon: CheckCircle2, border: 'border-l-teal-500' },
    { label: 'Overdue Tasks',        value: overdueTaskCount,    color: overdueTaskCount > 0 ? 'text-red-700' : 'text-muted-foreground', accent: overdueTaskCount > 0 ? 'from-red-500/20 to-red-500/5 text-red-700' : 'from-muted-foreground/20 to-muted-foreground/5 text-muted-foreground', icon: ClipboardList, border: overdueTaskCount > 0 ? 'border-l-red-500' : 'border-l-border', pulse: overdueTaskCount > 0 },
    { label: 'Urgent Needs Active',  value: urgentNeedCount,     color: urgentNeedCount > 0 ? 'text-orange-700' : 'text-muted-foreground', accent: urgentNeedCount > 0 ? 'from-orange-500/20 to-orange-500/5 text-orange-700' : 'from-muted-foreground/20 to-muted-foreground/5 text-muted-foreground', icon: Phone, border: urgentNeedCount > 0 ? 'border-l-orange-500' : 'border-l-border', pulse: urgentNeedCount > 0 },
    { label: 'Evidence Gaps Open',   value: openGapCount,        color: openGapCount > 0 ? 'text-amber-700' : 'text-muted-foreground', accent: openGapCount > 0 ? 'from-amber-500/20 to-amber-500/5 text-amber-700' : 'from-muted-foreground/20 to-muted-foreground/5 text-muted-foreground', icon: HelpCircle, border: openGapCount > 0 ? 'border-l-amber-500' : 'border-l-border' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Header */}
      <header className="border-b border-border bg-card/90 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground leading-none">Case Dashboard</h1>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5 tracking-wider uppercase">ContextFirst Nexus</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" disabled className="bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60 rounded-md font-semibold gap-1.5" title="Static prototype — no processing or data changes occur">
            <Plus className="w-3.5 h-3.5" />New Case
          </Button>
          <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-500 border border-slate-300 px-1.5 py-0.5 rounded hidden sm:inline">DEMO ONLY</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-10">

        {/* ── Stat grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAT_CARDS.map(stat => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "bg-card border border-border border-l-4 p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group",
                  stat.border,
                )}
              >
                <div className={cn(
                  "absolute top-6 right-6 w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  stat.accent,
                  stat.pulse && "animate-[pulse_2s_ease-in-out_infinite]"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="mt-8">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider leading-tight mb-1 block">{stat.label}</span>
                  <div className={cn("text-4xl font-bold font-mono tracking-tight", stat.color)}>{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Urgent attention banner ── */}
        {(overdueTaskCount > 0 || urgentNeedCount > 0) && (
          <div className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(239,68,68,0.06) 4px, rgba(239,68,68,0.06) 8px)' }} />
            <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 relative z-10">
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-20" />
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="relative z-10">
              <p className="text-base font-bold text-red-900 mb-1.5 tracking-tight">Immediate Attention Required</p>
              <div className="space-y-1 text-sm text-red-800 font-medium">
                {urgentNeedCount > 0 && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {urgentNeedCount} urgent need{urgentNeedCount > 1 ? 's' : ''} require immediate or same-day action.</p>}
                {overdueTaskCount > 0 && <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {overdueTaskCount} task{overdueTaskCount > 1 ? 's are' : ' is'} past due date.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Active workspaces ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-primary" />
                Active Workspaces
              </h2>
              <div className="w-10 h-0.5 bg-primary/40 mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {openCases.map(c => <CaseCard key={c.id} caseData={c} />)}
          </div>
        </div>

        {/* ── Held-Out Synthetic Challenge Case ── */}
        <div className="rounded-2xl overflow-hidden shadow-sm border-amber-200/80 border" style={{ background: 'linear-gradient(135deg, rgba(120,53,15,0.08), rgba(146,64,14,0.12))' }}>
          <div className="px-6 py-5 flex items-center justify-between border-b border-amber-200/60 bg-amber-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-200 to-amber-100 border border-amber-300 flex items-center justify-center shadow-inner">
                <FlaskConical className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h2 className="text-base font-bold text-amber-950 tracking-tight">System Evaluation Fixture</h2>
                <p className="text-xs text-amber-800 font-mono mt-0.5">Held-out challenge case · Includes known errors for validation</p>
              </div>
            </div>
            <Link href={`/trust`}>
              <Button variant="outline" className="h-9 border-amber-300 text-amber-800 bg-white hover:bg-amber-100 font-semibold shadow-sm">
                <Shield className="w-3.5 h-3.5 mr-2" /> View Eval Results
              </Button>
            </Link>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Summary */}
              <div className="md:col-span-1 bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-mono text-lg font-bold text-foreground tracking-tight">{CHALLENGE_CASE.refId}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> 5 docs <span className="text-border mx-1">|</span> <Users className="w-3 h-3" /> 5 findings
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded-md font-bold shadow-sm">
                    Gate Blocked
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Injected Errors</div>
                  <div className="flex items-center gap-2 text-xs font-medium text-red-700 border-l-2 border-l-red-400 pl-3">
                    <XCircle className="w-3.5 h-3.5" /> Missing page (cd-2 p.2)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-700 border-l-2 border-l-amber-400 pl-3">
                    <AlertTriangle className="w-3.5 h-3.5" /> Contradictory date (52-day gap)
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-red-700 border-l-2 border-l-red-400 pl-3">
                    <ShieldAlert className="w-3.5 h-3.5" /> Prompt injection attempt (cd-2)
                  </div>
                </div>
              </div>

              {/* Document health summary */}
              <div className="md:col-span-2 space-y-3">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Document Processing Status</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHALLENGE_DOCUMENTS.map(doc => {
                    const hasIssue = doc.extractionStatus === 'partial' || doc.pages?.some(p => p.status !== 'processed');
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-amber-200/60 rounded-lg shadow-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn("w-2.5 h-2.5 rounded-full shrink-0 shadow-inner", hasIssue ? "bg-amber-400" : "bg-teal-500")} />
                          <span className="text-foreground font-mono text-xs truncate">{doc.fileName}</span>
                        </div>
                        <span className={cn("font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border shrink-0 ml-2 font-bold",
                          hasIssue ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-teal-50 text-teal-800 border-teal-200"
                        )}>
                          {hasIssue ? 'Partial' : 'Complete'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CaseCard({ caseData }: { caseData: Case }) {
  const isReady = caseData.exportGateStatus === 'ready';
  const isPrimaryDemo = caseData.id === 'c-001';
  // Static counts — hardcoded to match scenario design
  const CARD_GAP_COUNT = 5;
  const CARD_TASK_COUNT = 4;
  const caseNeeds = MOCK_URGENT_NEEDS.filter(n => n.urgency === 'immediate');

  const innerCard = (
    <div className={cn(
      "bg-card border rounded-2xl flex flex-col h-full transition-all duration-300 relative overflow-hidden",
      isReady ? "border-teal-200/50" : "border-border",
      isPrimaryDemo
        ? "cursor-pointer group-hover:shadow-[0_0_0_1px_rgba(43,188,212,0.3),_0_20px_40px_rgba(0,0,0,0.08)] group-hover:border-primary/40 group-hover:-translate-y-1"
        : "cursor-default",
    )}>
      {/* Status bar at top */}
      <div className={cn(
        "h-1 w-full",
        isReady ? "bg-gradient-to-r from-teal-400 to-teal-500" : "bg-gradient-to-r from-amber-400 to-orange-500"
      )} />

      <div className="p-6 flex flex-col flex-1 gap-5">
        {/* Card header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="font-mono text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{caseData.refId}</h3>
              {!isPrimaryDemo && (
                <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-500 border border-slate-300 px-1.5 py-0.5 rounded">Illustrative fixture</span>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {caseData.practitioner}</p>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm",
            isReady
              ? "bg-teal-50 border-teal-200 text-teal-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          )}>
            {isReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {isReady ? 'Gate Ready' : 'Gate Blocked'}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 bg-background/60 p-4 rounded-xl border border-border/40">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <FileText className="w-3 h-3" />Documents
            </span>
            <span className="font-mono font-bold text-foreground text-sm">{caseData.documentCount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <Activity className="w-3 h-3" />Analysis
            </span>
            <span className={cn(
              "font-mono text-[10px] font-bold w-fit px-1.5 py-0.5 rounded border",
              caseData.analysisReadiness === 'ready'
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-muted border-border text-muted-foreground"
            )}>
              {caseData.analysisReadiness.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />Gaps
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-700 w-fit">{CARD_GAP_COUNT} OPEN</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <ClipboardList className="w-3 h-3" />Tasks
            </span>
            <span className="font-mono text-[10px] font-bold text-foreground w-fit">{CARD_TASK_COUNT} OPEN</span>
          </div>
        </div>

        {caseNeeds.length > 0 && (
          <div className="flex items-center justify-between text-xs px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-800 flex items-center gap-1.5 font-semibold">
              <Phone className="w-3.5 h-3.5" />Urgent Needs
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold shadow-sm">
              {caseNeeds.length} IMMEDIATE
            </span>
          </div>
        )}

        {/* Card footer */}
        <div className="pt-2 flex items-center justify-between mt-auto">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded border border-border">
            <Clock className="w-3 h-3" />
            {new Date(caseData.lastActivity).toLocaleDateString()}
          </span>
          {isPrimaryDemo ? (
            <span className="text-xs font-bold text-primary flex items-center gap-1.5 group-hover:gap-2.5 transition-all px-3 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(43,188,212,0.15) 0%, rgba(43,188,212,0.05) 100%)' }}>
              Open Workspace <ArrowRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg border border-border bg-muted opacity-60 cursor-not-allowed">
              Preview only
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (!isPrimaryDemo) {
    return <div className="block group h-full">{innerCard}</div>;
  }

  return (
    <Link href={`/case/${caseData.id}`} className="block group h-full">
      {innerCard}
    </Link>
  );
}
