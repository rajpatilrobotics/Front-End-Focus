import React from 'react';
import { Case, MOCK_CASES, MOCK_TASKS, MOCK_URGENT_NEEDS, MOCK_EVIDENCE_GAPS } from '@/data/mock-case';
import { Link } from 'wouter';
import {
  FileText, ShieldAlert, CheckCircle2, Clock, Plus, Activity, ArrowLeft,
  AlertTriangle, HelpCircle, ClipboardList, Phone, Eye, Users
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
    { label: 'Open Cases',          value: openCases.length,    color: 'text-foreground',   icon: Activity },
    { label: 'Pending Review',      value: pendingCases.length, color: 'text-amber-600',    icon: Eye },
    { label: 'Export Ready',        value: readyCases.length,   color: 'text-teal-600',     icon: CheckCircle2 },
    { label: 'Overdue Tasks',       value: overdueTaskCount,    color: overdueTaskCount > 0 ? 'text-red-600' : 'text-muted-foreground', icon: ClipboardList },
    { label: 'Urgent Needs Active', value: urgentNeedCount,     color: urgentNeedCount > 0 ? 'text-red-600' : 'text-muted-foreground', icon: Phone },
    { label: 'Evidence Gaps Open',  value: openGapCount,        color: openGapCount > 0 ? 'text-amber-600' : 'text-muted-foreground', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center border border-border">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Case Dashboard</h1>
            <p className="text-xs text-muted-foreground font-mono">ContextFirst Nexus · Synthetic Fixture</p>
          </div>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />New Case
        </Button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Stat grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border p-4 rounded-md flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider leading-tight">{stat.label}</span>
                  <Icon className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
                <span className={cn("text-2xl font-semibold", stat.color)}>{stat.value}</span>
              </div>
            );
          })}
        </div>

        {/* Urgent attention banner */}
        {(overdueTaskCount > 0 || urgentNeedCount > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">Attention required</p>
              <div className="space-y-0.5 text-sm text-red-700">
                {urgentNeedCount > 0 && <p>· {urgentNeedCount} urgent need{urgentNeedCount > 1 ? 's' : ''} require immediate or same-day action.</p>}
                {overdueTaskCount > 0 && <p>· {overdueTaskCount} task{overdueTaskCount > 1 ? 's are' : ' is'} past due date.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Active workspaces */}
        <div>
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Active Workspaces</h2>
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
      <div className="bg-card border border-border hover:border-foreground/25 hover:shadow-md transition-all p-5 rounded-md flex flex-col h-full gap-4 cursor-pointer shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-mono text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{caseData.refId}</h3>
            <p className="text-sm text-muted-foreground mt-1">{caseData.practitioner}</p>
          </div>
          <div className={cn(
            "p-1.5 rounded-sm border",
            isReady ? "bg-teal-50 border-teal-200 text-teal-600" : "bg-muted border-border text-muted-foreground"
          )}>
            {isReady ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" />Documents</span>
            <span className="font-mono text-foreground">{caseData.documentCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" />Analysis</span>
            <span className={cn(
              "font-mono text-xs px-2 py-0.5 rounded-sm border",
              caseData.analysisReadiness === 'ready'
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-muted border-border text-muted-foreground"
            )}>
              {caseData.analysisReadiness.toUpperCase()}
            </span>
          </div>
          {caseNeeds.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600 flex items-center gap-2"><Phone className="w-4 h-4" />Urgent Needs</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm border bg-red-50 border-red-200 text-red-700">
                {caseNeeds.length} IMMEDIATE
              </span>
            </div>
          )}
          {caseGaps.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><HelpCircle className="w-4 h-4" />Evidence Gaps</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm border bg-amber-50 border-amber-200 text-amber-700">
                {caseGaps.length} OPEN
              </span>
            </div>
          )}
          {caseTasks.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><ClipboardList className="w-4 h-4" />Tasks</span>
              <span className="font-mono text-foreground">{caseTasks.length} open</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{new Date(caseData.lastActivity).toLocaleDateString()}</span>
          <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Open Workspace →</span>
        </div>
      </div>
    </Link>
  );
}
