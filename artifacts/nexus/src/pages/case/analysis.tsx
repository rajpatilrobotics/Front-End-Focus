import React, { useState } from 'react';
import { MOCK_FINDINGS, Finding } from '@/data/mock-case';
import { EvidenceNatureBadge, OriginBadge, SupportStatusBadge, ReviewStatusBadge } from '@/components/badges';
import { FileText, AlertTriangle, XCircle, HelpCircle, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

export default function CaseAnalysis() {
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_FINDINGS[0].id);
  
  // Withdrawal cascade simulation state
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
        
        // Cascade logic
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
      'coercion': 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      'relationship': 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      'compelled-task': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      'contradiction': 'border-red-500/30 bg-red-500/10 text-red-400',
      'evidence-gap': 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400',
      'protection-urgency': 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    };
    return map[type] || 'border-zinc-700 text-zinc-400';
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-zinc-200">Structured Analysis</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-sm">
              {pendingCount} PENDING REVIEW
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          Last analysis run: 2 hours ago
        </div>
      </div>

      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left List */}
        <Panel defaultSize={45} minSize={30} className="flex flex-col border-r border-border bg-sidebar/20">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {findings.map(finding => (
              <motion.div 
                layout
                key={finding.id}
                onClick={() => setSelectedId(finding.id)}
                className={cn(
                  "p-4 rounded-sm border cursor-pointer transition-all duration-200",
                  selectedId === finding.id ? "bg-zinc-800 border-zinc-600 shadow-lg" : "bg-card border-border hover:border-zinc-700 hover:bg-zinc-900/50",
                  finding.supportStatus === 'unresolved' && "ring-1 ring-amber-500/50 border-amber-500/30"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={cn("text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm border", getTypeColor(finding.type))}>
                    {finding.type.replace('-', ' ')}
                  </span>
                  <ReviewStatusBadge status={finding.reviewStatus} />
                </div>
                
                <h3 className="font-medium text-zinc-200 mb-1 leading-tight">{finding.title}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">{finding.description}</p>
                
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
                  <SupportStatusBadge status={finding.supportStatus} />
                  <span className="text-zinc-700">&bull;</span>
                  <OriginBadge origin={finding.origin} />
                  <span className="text-zinc-700">&bull;</span>
                  <EvidenceNatureBadge nature={finding.evidenceNature} />
                </div>
              </motion.div>
            ))}

            <div className="mt-8 pt-4 border-t border-dashed border-zinc-700">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Limitations & Abstentions</h4>
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-sm text-sm text-zinc-400 space-y-2">
                <p className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500/70 shrink-0 mt-0.5" /> AI abstained from analyzing document d-5 due to handwriting illegibility.</p>
                <p className="flex items-start gap-2"><ShieldAlert className="w-4 h-4 text-blue-500/70 shrink-0 mt-0.5" /> Legal conclusions regarding trafficking statute 18 U.S.C. § 1589 explicitly excluded from model capability.</p>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border hover:bg-zinc-600 transition-colors cursor-col-resize" />

        {/* Right Details Panel */}
        <Panel minSize={30} className="flex flex-col bg-card/10 relative">
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
                    <span className="text-zinc-500 font-mono text-xs">ID: {selected.id}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-zinc-100 mb-4">{selected.title}</h2>
                  <p className="text-lg text-zinc-300 mb-8 leading-relaxed">{selected.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-sm">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-2">Evidence Nature</div>
                      <EvidenceNatureBadge nature={selected.evidenceNature} className="text-sm px-3 py-1" />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-sm">
                      <div className="text-xs font-mono text-zinc-500 uppercase mb-2">Origin</div>
                      <OriginBadge origin={selected.origin} className="text-sm px-3 py-1" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-mono text-zinc-400 uppercase tracking-widest border-b border-border pb-2">Source Citations</h3>
                    {selected.citations.length > 0 ? (
                      selected.citations.map((cit, idx) => (
                        <div key={idx} className="bg-zinc-900 border border-zinc-700 rounded-sm overflow-hidden">
                          <div className="bg-zinc-800/50 px-4 py-2 flex justify-between items-center border-b border-zinc-700">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-zinc-400" />
                              <span className="text-sm font-medium text-zinc-300">Doc {cit.documentId}</span>
                            </div>
                            <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">PAGE {cit.page}</span>
                          </div>
                          <div className="p-4 font-mono text-sm text-zinc-300 leading-relaxed border-l-2 border-teal-500/50 ml-4 my-4 pl-4 bg-teal-500/5">
                            "{cit.text}"
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-zinc-500 font-mono text-sm italic">No direct citations linked.</div>
                    )}
                  </div>

                  {selected.contradictions && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-sm font-mono text-red-400 uppercase tracking-widest border-b border-red-900/30 pb-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Contradictory Evidence
                      </h3>
                      {selected.contradictions.map((c, idx) => (
                        <div key={idx} className="p-3 bg-red-950/20 border border-red-900/30 rounded-sm text-red-200 text-sm">
                          {c}
                        </div>
                      ))}
                    </div>
                  )}

                  {selected.dependencies && selected.dependencies.length > 0 && (
                    <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-sm">
                      <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Dependency Chain</h3>
                      <p className="text-sm text-zinc-500 mb-2">This finding supports {selected.dependencies.length} downstream nodes in the Nexus.</p>
                      <div className="flex gap-2">
                        {selected.dependencies.map(dep => (
                          <span key={dep} className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700">{dep}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Action Bar (Fixed at bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 z-10">
                  <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-400 font-mono">STATUS:</span>
                      <ReviewStatusBadge status={selected.reviewStatus} className="text-sm" />
                    </div>
                    
                    <div className="flex gap-2">
                      {selected.reviewStatus === 'accepted' ? (
                        <Button 
                          variant="outline" 
                          className="bg-zinc-900 border-amber-900/50 text-amber-500 hover:bg-amber-950 hover:text-amber-400"
                          onClick={() => handleWithdraw(selected.id)}
                        >
                          Withdraw Acceptance
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            onClick={() => handleAction(selected.id, 'rejected')}
                          >
                            Reject
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-zinc-900 border-purple-900/50 text-purple-400 hover:bg-purple-950"
                            onClick={() => handleAction(selected.id, 'uncertain')}
                          >
                            Mark Uncertain
                          </Button>
                          <Button 
                            className="bg-teal-600 hover:bg-teal-500 text-white font-medium min-w-[120px]"
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
              <div className="flex-1 flex items-center justify-center text-zinc-500 font-mono">
                Select a finding to review
              </div>
            )}
          </AnimatePresence>
        </Panel>
      </PanelGroup>

      {/* Dependency Cascade Modal */}
      {showCascadeModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-amber-500 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6" />
                Dependency Cascade Warning
              </h3>
              <p className="text-zinc-400 text-sm">
                Withdrawing acceptance for <strong className="text-zinc-200">{selected.title}</strong> will immediately destabilize downstream findings in the Nexus.
              </p>
            </div>
            
            <div className="p-6 bg-zinc-900/50">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">Affected Items (Will revert to Unresolved)</h4>
              <ul className="space-y-2">
                {selected.dependencies?.map(depId => {
                  const dep = findings.find(f => f.id === depId);
                  return dep ? (
                    <li key={depId} className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-sm">
                      <span className="text-xs font-mono text-zinc-500">{depId}</span>
                      <span className="text-sm text-zinc-300">{dep.title}</span>
                    </li>
                  ) : null;
                })}
              </ul>
              
              <div className="mt-6 flex items-start gap-3 p-3 bg-red-950/20 border border-red-900/30 rounded-sm">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">This action will automatically block the Export Gate until all affected findings are re-reviewed.</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-950">
              <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setShowCascadeModal(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => executeWithdraw(selected.id)}>Proceed with Withdrawal</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}