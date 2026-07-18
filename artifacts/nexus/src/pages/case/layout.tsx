import React from 'react';
import { Route, Switch, useRoute, Link, useLocation } from 'wouter';
import { MOCK_CASES } from '@/data/mock-case';
import { FileText, BrainCircuit, Network, Clock, ShieldAlert, History, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import CaseDocuments from './documents';
import CaseAnalysis from './analysis';
import CaseNexus from './nexus';
import CaseTimeline from './timeline';
import CaseExportGate from './export-gate';
import CaseAudit from './audit';

export default function CaseLayout() {
  const [match, params] = useRoute('/case/:id/*?');
  const [location] = useLocation();
  const id = params?.id || 'c-001';
  const caseData = MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0];
  
  const currentPath = location.replace(`/case/${id}`, '') || '/';
  
  const navItems = [
    { path: '/', label: 'Documents', icon: FileText },
    { path: '/analysis', label: 'Analysis', icon: BrainCircuit, badge: '3 Pending' },
    { path: '/nexus', label: 'Charge-Coercion Nexus', icon: Network },
    { path: '/timeline', label: 'Timeline', icon: Clock },
    { path: '/export', label: 'Export Gate', icon: ShieldAlert, badge: 'Blocked' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar — dark charcoal, uses sidebar-* tokens */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col flex-shrink-0 z-20">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <Link href="/" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-mono text-lg font-bold text-sidebar-foreground">{caseData.refId}</h2>
          <div className="flex items-center gap-2 mt-2 text-xs text-sidebar-foreground/50 font-mono">
            <span>{caseData.documentCount} DOCS</span>
            <span>&bull;</span>
            <span className={cn(
              caseData.exportGateStatus === 'ready' ? "text-teal-400" : "text-amber-400"
            )}>
              {caseData.exportGateStatus.toUpperCase()}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <Link key={item.path} href={`/case/${id}${item.path === '/' ? '' : item.path}`}>
                <div className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-sm text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-foreground" 
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}>
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm border",
                      item.badge === 'Blocked' 
                        ? "border-amber-500/40 text-amber-400 bg-amber-500/10" 
                        : "border-sidebar-border text-sidebar-foreground/70 bg-sidebar-border/30"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border mt-auto">
          <Link href={`/case/${id}/audit`}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors cursor-pointer",
              currentPath === '/audit' 
                ? "bg-sidebar-accent text-sidebar-foreground" 
                : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}>
              <History className="w-4 h-4" />
              Audit Trail
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            {caseData.exportGateStatus === 'ready' ? (
              <div className="flex items-center gap-2 text-sm text-teal-700 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Export Gate Ready
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
                <ShieldAlert className="w-4 h-4" />
                Export Gate Blocked: 4 Unresolved Items
              </div>
            )}
          </div>
          
          <Button 
            size="sm" 
            disabled={caseData.exportGateStatus !== 'ready'}
            className={cn(
              "font-medium rounded-sm",
              caseData.exportGateStatus === 'ready' 
                ? "bg-teal-600 hover:bg-teal-700 text-white" 
                : "bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-60"
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Create Handoff
          </Button>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <Switch>
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
  );
}
