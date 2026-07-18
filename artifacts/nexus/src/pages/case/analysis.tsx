import React, { useState } from 'react';
import { MOCK_FINDINGS, Finding } from '@/data/mock-case';
import { EvidenceNatureBadge, OriginBadge, SupportStatusBadge, ReviewStatusBadge } from '@/components/badges';
import { FileText, AlertTriangle, XCircle, ShieldAlert, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

export default function CaseAnalysis() {
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_FINDINGS[0].id);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [showCascadeModal, setShowCascadeModal] = useState(false);

  const selected = findings.find(f => f.id === selectedId);
  const pendingCount = findings.filter(f => f.reviewStatus === 'pending').length;

  const handleWithdraw = (id: string) => {
    setWithdrawingId(id);
    const finding = findings.find(f => f.id === id);
    if (finding?.dependencies && finding.dependencies.length > 0) {
      setShowCascadeModal(true);
    } else {
      executeWithdraw(id);
    }
  };

  const executeWithdraw = (id: string) => {
    setFindings(prev => {
      const updated = [...prev];
      const targetIndex = updated.findIndex(f => f.id === id);
      if (targetIndex > -1) {
        updated[targetIndex] = { ...updated[targetIndex], reviewStatus: 'pending' };
        const dependencies = updated[targetIndex].dependencies || [];
        dependencies.forEach(depId => {
          const depIndex = updated.findIndex(f => f.id === depId);
          if (depIndex > -1) {
            updated[depIndex] = { ...updated[depIndex], supportStatus: 'unresolved', reviewStatus: 'pending' };
          }
        });
      }
      return updated;
    });
    setShowCascadeModal(false);
    setWithdrawingId(null);
  };

  const handleAction = (id: string, action: Finding['reviewStatus']) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, reviewStatus: action } : f));
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'coercion': 'border-purple-200 bg-purple-50 text-purple-700',
      'relationship': 'border-blue-200 bg-blue-50 text-blue-700',
      'compelled-task': 'border-amber-200 bg-amber-50 text-amber-700',
      'contradiction': 'border-red-200 bg-red-50 text-red-700',
      'evidence-gap': 'border-slate-200 bg-slate-50 text-slate-600',
      'protection-urgency': 'border-orange-200 bg-orange-50 text-orange-700',
    };
    return map[type] || 'border-border text-muted-foreground bg-muted';
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Banner */}
      <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-foreground">Structured Analysis</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-sm">
              {pendingCount} PENDING REVIEW
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Last analysis run: 2 hours ago
        </div>
      </div>

      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left List */}
        <Panel defaultSize={45} minSize={30} className="flex flex-col border-r border-border bg-muted/20">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {findings.map(finding => (
              <motion.div 
                layout
                key={finding.id}
                onClick={() => setSelectedId(finding.id)}
                className={cn(
                  "p-4 rounded-sm border cursor-pointer transition-all duration-200",
                  selectedId === finding.id 
                    ? "bg-primary/5 border-primary/25 shadow-sm" 
                    : "bg-card border-border hover:border-foreground/20 hover:bg-muted/30",
                  finding.supportStatus === 'unresolved' && "ring-1 ring-amber-400 border-amber-300"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={cn("text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm border", getTypeColor(finding.type))}>
                    {finding.type.replace('-', ' ')}
                  </span>
                  <ReviewStatusBadge status={finding.reviewStatus} />
                </div>
                
                <h3 className="font-medium text-foreground mb-1 leading-tight">{finding.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{finding.description}</p>
                
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
                  <SupportStatusBadge status={finding.supportStatus} />
                  <span className="text-border">&bull;</span>
                  <OriginBadge origin={finding.origin} />
                  <span className="text-border">&bull;</span>
                  <EvidenceNatureBadge nature={finding.evidenceNature} />
                </div>
              </motion.div>
            ))}

            <div className="mt-8 pt-4 border-t border-dashed border-border">
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Limitations & Abstentions</h4>
              <div className="bg-muted border border-border p-3 rounded-sm text-sm text-muted-foreground space-y-2">
                <p className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> AI abstained from analyzing document d-5 due to handwriting illegibility.</p>
                <p className="flex items-start gap-2"><ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> Legal conclusions regarding trafficking statute 18 U.S.C. § 1589 explicitly excluded from model capability.</p>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hover:bg-foreground/20 transition-colors cursor-col-resize" />

        {/* Right Details Panel */}
        <Panel minSize={30} className="flex flex-col bg-card relative">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div 
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto flex flex-col h-full"
              >
                <div className="p-8 pb-32">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={cn("text-xs uppercase font-mono px-2 py-1 rounded-sm border", getTypeColor(selected.type))}>
                      {selected.type.replace('-', ' ')}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">ID: {selected.id}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-foreground mb-4">{selected.title}</h2>
                  <p className="text-lg text-foreground/80 mb-8 leading-relaxed">{selected.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-muted border border-border p-4 rounded-sm">
                      <div className="text-xs font-mono text-muted-foreground uppercase mb-2">Evidence Nature</div>
                      <EvidenceNatureBadge nature={selected.evidenceNature} className="text-sm px-3 py-1" />
                    </div>
                    <div className="bg-muted border border-border p-4 rounded-sm">
                      <div className="text-xs font-mono text-muted-foreground uppercase mb-2">Origin</div>
                      <OriginBadge origin={selected.origin} className="text-sm px-3 py-1" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Source Citations</h3>
                    {selected.citations.length > 0 ? (
                      selected.citations.map((cit, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
                          <div className="bg-muted px-4 py-2 flex justify-between items-center border-b border-border">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">Doc {cit.documentId}</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">PAGE {cit.page}</span>
                          </div>
                          <div className="p-4 font-mono text-sm text-foreground/80 leading-relaxed border-l-2 border-teal-500 ml-4 my-4 pl-4 bg-teal-50/50">
                            "{cit.text}"
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground font-mono text-sm italic">No direct citations linked.</div>
                    )}
                  </div>

                  {selected.contradictions && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-sm font-mono text-red-600 uppercase tracking-widest border-b border-red-200 pb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Contradictory Evidence
                      </h3>
                      {selected.contradictions.map((c, idx) => (
                        <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-sm text-red-800 text-sm">
                          {c}
                        </div>
                      ))}
                    </div>
                  )}

                  {selected.dependencies && selected.dependencies.length > 0 && (
                    <div className="mt-8 p-4 bg-muted border border-border rounded-sm">
                      <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Dependency Chain</h3>
                      <p className="text-sm text-muted-foreground mb-2">This finding supports {selected.dependencies.length} downstream nodes in the Nexus.</p>
                      <div className="flex gap-2">
                        {selected.dependencies.map(dep => (
                          <span key={dep} className="text-xs font-mono bg-secondary text-foreground px-2 py-1 rounded border border-border">{dep}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-md border-t border-border z-10 shadow-lg">
                  <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground font-mono">STATUS:</span>
                      <ReviewStatusBadge status={selected.reviewStatus} className="text-sm" />
                    </div>
                    
                    <div className="flex gap-2">
                      {selected.reviewStatus === 'accepted' ? (
                        <Button 
                          variant="outline" 
                          className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                          onClick={() => handleWithdraw(selected.id)}
                        >
                          Withdraw Acceptance
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            className="bg-card border-border text-foreground hover:bg-muted"
                            onClick={() => handleAction(selected.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                            onClick={() => handleAction(selected.id, 'uncertain')}
                          >
                            Mark Uncertain
                          </Button>
                          <Button 
                            className="bg-teal-600 hover:bg-teal-700 text-white font-medium min-w-[120px]"
                            onClick={() => handleAction(selected.id, 'accepted')}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono">
                Select a finding to review
              </div>
            )}
          </AnimatePresence>
        </Panel>
      </PanelGroup>

      {/* Dependency Cascade Modal */}
      {showCascadeModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border w-full max-w-lg rounded-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold text-amber-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6" />
                Dependency Cascade Warning
              </h3>
              <p className="text-muted-foreground text-sm">
                Withdrawing acceptance for <strong className="text-foreground">{selected.title}</strong> will immediately destabilize downstream findings in the Nexus.
              </p>
            </div>
            
            <div className="p-6 bg-muted/30">
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Affected Items (Will revert to Unresolved)</h4>
              <ul className="space-y-2">
                {selected.dependencies?.map(depId => {
                  const dep = findings.find(f => f.id === depId);
                  return dep ? (
                    <li key={depId} className="flex items-center gap-3 p-3 bg-background border border-border rounded-sm">
                      <span className="text-xs font-mono text-muted-foreground">{depId}</span>
                      <span className="text-sm text-foreground">{dep.title}</span>
                    </li>
                  ) : null;
                })}
              </ul>
              
              <div className="mt-6 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-sm">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">This action will automatically block the Export Gate until all affected findings are re-reviewed.</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-card">
              <Button variant="outline" className="border-border text-foreground" onClick={() => setShowCascadeModal(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => executeWithdraw(selected.id)}>Proceed with Withdrawal</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
