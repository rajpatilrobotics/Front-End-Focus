import React from 'react';
import { Case, MOCK_CASES } from '@/data/mock-case';
import { Link } from 'wouter';
import { FileText, ShieldAlert, CheckCircle2, Clock, Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const openCases = MOCK_CASES.filter(c => c.status === 'open');
  const readyCases = openCases.filter(c => c.exportGateStatus === 'ready');
  const pendingCases = openCases.filter(c => c.exportGateStatus === 'blocked');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <Activity className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">ContextFirst Nexus</h1>
            <p className="text-xs text-zinc-500 font-mono">Forensic Legal Workspace</p>
          </div>
        </div>
        <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-white rounded-sm font-medium">
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-md flex flex-col gap-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Open Cases</span>
            <span className="text-3xl font-semibold text-zinc-100">{openCases.length}</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-md flex flex-col gap-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Pending Review</span>
            <span className="text-3xl font-semibold text-zinc-100">{pendingCases.length}</span>
          </div>
          <div className="bg-card border border-border p-4 rounded-md flex flex-col gap-1">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Export Ready</span>
            <span className="text-3xl font-semibold text-teal-400">{readyCases.length}</span>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-wider mb-4 border-b border-border pb-2">Active Workspaces</h2>
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
      <div className="bg-card border border-border hover:border-zinc-600 transition-colors p-5 rounded-md flex flex-col h-full gap-4 cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-mono text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">{caseData.refId}</h3>
            <p className="text-sm text-zinc-500 mt-1">Assigned to: {caseData.practitioner}</p>
          </div>
          <div className={cn(
            "p-1.5 rounded-sm border",
            isReady ? "bg-teal-950/30 border-teal-900/50 text-teal-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"
          )}>
            {isReady ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
        </div>
        
        <div className="flex-1 mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</span>
            <span className="font-mono text-zinc-300">{caseData.documentCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 flex items-center gap-2"><Activity className="w-4 h-4" /> Analysis</span>
            <span className={cn("font-mono text-xs px-2 py-0.5 rounded-sm border", caseData.analysisReadiness === 'ready' ? "bg-blue-950/30 border-blue-900/50 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-400")}>
              {caseData.analysisReadiness.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border mt-auto flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Last active: {new Date(caseData.lastActivity).toLocaleDateString()}</span>
          <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">Open Workspace &rarr;</span>
        </div>
      </div>
    </Link>
  );
}