import React from 'react';
import { MOCK_CASES, MOCK_FINDINGS } from '@/data/mock-case';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileWarning, EyeOff, Lock, Network, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

export default function CaseExportGate() {
  const caseData = MOCK_CASES[0];
  const pendingFindings = MOCK_FINDINGS.filter(f => f.reviewStatus === 'pending');
  const unresolvedFindings = MOCK_FINDINGS.filter(f => f.supportStatus === 'unresolved');
  
  const isReady = caseData.exportGateStatus === 'ready';
  
  const blockers = [
    {
      id: 'b1',
      title: 'Unreviewed Consequential Items',
      count: pendingFindings.length,
      icon: AlertTriangle,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      link: '/analysis'
    },
    {
      id: 'b2',
      title: 'Unresolved Dependency Cascade Issues',
      count: unresolvedFindings.length,
      icon: Network,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      link: '/nexus'
    },
    {
      id: 'b3',
      title: 'Missing Critical Evidence Flags',
      count: 0,
      icon: FileWarning,
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      link: '/analysis'
    },
    {
      id: 'b4',
      title: 'Incomplete Masking Actions',
      count: 1,
      icon: EyeOff,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      link: '/'
    }
  ];

  const activeBlockers = blockers.filter(b => b.count > 0);

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Status Header */}
      <div className={cn(
        "px-8 py-10 border-b border-border transition-colors duration-500",
        isReady ? "bg-teal-50/50" : "bg-amber-50/30"
      )}>
        <div className="max-w-4xl mx-auto flex items-start gap-6">
          <div className={cn(
            "p-4 rounded-full border-2 shadow-md",
            isReady 
              ? "bg-teal-50 border-teal-300 text-teal-600" 
              : "bg-amber-50 border-amber-300 text-amber-600"
          )}>
            {isReady ? <ShieldCheck className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12" />}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isReady ? "Safe Export Ready" : "Export Gate Blocked"}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {isReady 
                ? "All safety checks passed. The case narrative is fully reviewed, sources are traceable, and sensitive data is masked."
                : `Cannot generate handoff. There are ${activeBlockers.length} active blockers preventing safe export.`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <section>
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Safety Checklist
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blockers.map(blocker => (
                <div key={blocker.id} className={cn(
                  "p-5 rounded-md border flex flex-col transition-all shadow-sm",
                  blocker.count > 0 
                    ? cn("bg-card", blocker.borderColor) 
                    : "bg-muted border-border opacity-60"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2 rounded-sm", blocker.count > 0 ? blocker.bgColor : "bg-muted")}>
                      <blocker.icon className={cn("w-5 h-5", blocker.count > 0 ? blocker.color : "text-muted-foreground/40")} />
                    </div>
                    {blocker.count > 0 ? (
                      <span className={cn("text-xl font-bold font-mono", blocker.color)}>{blocker.count}</span>
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  
                  <h3 className={cn("font-medium mb-1", blocker.count > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {blocker.title}
                  </h3>
                  
                  {blocker.count > 0 && (
                    <Link href={`/case/c-001${blocker.link}`}>
                      <div className="mt-auto pt-4 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors">
                        Resolve issues <ArrowRight className="w-3 h-3" />
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={cn("opacity-50 pointer-events-none transition-opacity", isReady && "opacity-100 pointer-events-auto")}>
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-4 border-b border-border pb-2">
              Handoff Generation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-6 rounded-md relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl" />
                <h3 className="text-lg font-bold text-foreground mb-2">Full Practitioner Handoff</h3>
                <p className="text-sm text-muted-foreground mb-6 min-h-[60px]">
                  Complete case narrative, full nexus graph, and all accepted evidence. Includes masked source documents.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={!isReady}>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Bundle (.zip)
                </Button>
              </div>

              <div className="bg-card border border-border p-6 rounded-md relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/50 rounded-full blur-3xl" />
                <h3 className="text-lg font-bold text-foreground mb-2">Minimum-Necessary Safe Share</h3>
                <p className="text-sm text-muted-foreground mb-6 min-h-[60px]">
                  Sanitized summary tailored for external partners. Removes raw citations and unverified claims.
                </p>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium" disabled={!isReady}>
                  <Download className="w-4 h-4 mr-2" />
                  Configure & Generate
                </Button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
