import React from 'react';
import { Case, MOCK_CASES } from '@/data/mock-case';
import { Link } from 'wouter';
import { FileText, ShieldAlert, CheckCircle2, Clock, Plus, Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const openCases = MOCK_CASES.filter(c => c.status === 'open');
  const readyCases = openCases.filter(c => c.exportGateStatus === 'ready');
  const pendingCases = openCases.filter(c => c.exportGateStatus === 'blocked');

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
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-md flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Total Open Cases</span>
            <span className="text-3xl font-semibold text-foreground">{openCases.length}</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-md flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Pending Review</span>
            <span className="text-3xl font-semibold text-foreground">{pendingCases.length}</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-md flex flex-col gap-1 shadow-sm">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Export Ready</span>
            <span className="text-3xl font-semibold text-teal-600">{readyCases.length}</span>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Active Workspaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openCases.map(c => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function CaseCard({ caseData }: { caseData: Case }) {
  const isReady = caseData.exportGateStatus === 'ready';

  return (
    <Link href={`/case/${caseData.id}`} className="block group">
      <div className="bg-card border border-border hover:border-foreground/25 hover:shadow-md transition-all p-5 rounded-md flex flex-col h-full gap-4 cursor-pointer shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-mono text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{caseData.refId}</h3>
            <p className="text-sm text-muted-foreground mt-1">Assigned to: {caseData.practitioner}</p>
          </div>
          <div className={cn(
            "p-1.5 rounded-sm border",
            isReady ? "bg-teal-50 border-teal-200 text-teal-600" : "bg-muted border-border text-muted-foreground"
          )}>
            {isReady ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
        </div>
        
        <div className="flex-1 mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</span>
            <span className="font-mono text-foreground">{caseData.documentCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Analysis</span>
            <span className={cn(
              "font-mono text-xs px-2 py-0.5 rounded-sm border",
              caseData.analysisReadiness === 'ready'
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-muted border-border text-muted-foreground"
            )}>
              {caseData.analysisReadiness.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Last active: {new Date(caseData.lastActivity).toLocaleDateString()}</span>
          <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">Open Workspace &rarr;</span>
        </div>
      </div>
    </Link>
  );
}
