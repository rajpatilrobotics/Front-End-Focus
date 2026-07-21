import React, { useState } from 'react';
import { MOCK_EVIDENCE_GAPS, EvidenceGap, GapStatus } from '@/data/mock-case';
import { AlertTriangle, HelpCircle, CheckCircle2, Clock, Plus, ArrowRight, FileText, ChevronRight, XCircle, RotateCcw, User, MessageSquare, ClipboardList, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

const GAP_STATUS_CONFIG: Record<GapStatus, { label: string; color: string; dot: string }> = {
  'open':               { label: 'Open',                    color: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500' },
  'investigating':      { label: 'Investigating',           color: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  'waiting-external':   { label: 'Waiting — External',      color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'partially-resolved': { label: 'Partially Resolved',      color: 'bg-teal-50 text-teal-700 border-teal-200',   dot: 'bg-teal-400' },
  'resolved':           { label: 'Resolved',                color: 'bg-teal-50 text-teal-700 border-teal-200',   dot: 'bg-teal-600' },
  'unable-to-resolve':  { label: 'Unable to Resolve',       color: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  'outside-scope':      { label: 'Outside Scope',           color: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50 border-red-200' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const EVIDENCE_STATUS_CONFIG = {
  missing:      { label: 'Missing',     color: 'text-red-700 bg-red-50 border-red-200' },
  conflicting:  { label: 'Conflicting', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  insufficient: { label: 'Insufficient', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

type FilterKey = 'all' | 'open' | 'investigating' | 'high' | 'export-blocker';

type ResolveModal = { open: boolean; gapId: string; reason: string; evidence: string };

export default function CaseGaps() {
  const [gaps, setGaps] = useState<EvidenceGap[]>(MOCK_EVIDENCE_GAPS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_EVIDENCE_GAPS[0]?.id ?? null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [convertedActions, setConvertedActions] = useState<Set<string>>(new Set(['sa-1']));
  const [questionActions, setQuestionActions] = useState<Set<string>>(new Set());
  const [preservedGaps, setPreservedGaps] = useState<Set<string>>(new Set());
  const [resolveModal, setResolveModal] = useState<ResolveModal>({ open: false, gapId: '', reason: '', evidence: '' });

  const selected = gaps.find(g => g.id === selectedId);

  const filtered = gaps.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'open') return g.status === 'open';
    if (filter === 'investigating') return g.status === 'investigating';
    if (filter === 'high') return g.priority === 'high';
    if (filter === 'export-blocker') return g.status === 'open' || g.status === 'investigating' || g.status === 'waiting-external';
    return true;
  });

  const openCount = gaps.filter(g => g.status === 'open' || g.status === 'investigating' || g.status === 'waiting-external').length;

  const convertAction = (actionId: string) => {
    setConvertedActions(prev => new Set([...prev, actionId]));
  };

  const createQuestion = (actionId: string) => {
    setQuestionActions(prev => new Set([...prev, actionId]));
  };

  const preserveAsUnknown = (gapId: string) => {
    setPreservedGaps(prev => new Set([...prev, gapId]));
    setStatus(gapId, 'unable-to-resolve');
  };

  const setStatus = (id: string, status: GapStatus) => {
    setGaps(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  const openResolveModal = (gapId: string) => {
    setResolveModal({ open: true, gapId, reason: '', evidence: '' });
  };

  const confirmResolve = () => {
    if (!resolveModal.reason.trim()) return;
    const now = new Date().toISOString();
    setGaps(prev => prev.map(g => g.id === resolveModal.gapId
      ? {
          ...g,
          status: 'resolved' as GapStatus,
          resolutionEvidence: resolveModal.evidence || undefined,
          auditHistory: [
            ...g.auditHistory,
            { timestamp: now, actor: 'M. Chen', action: `Marked Resolved. Reason: ${resolveModal.reason}${resolveModal.evidence ? ` · Evidence: ${resolveModal.evidence}` : ''}` },
          ],
        }
      : g
    ));
    setResolveModal({ open: false, gapId: '', reason: '', evidence: '' });
  };

  const FILTERS: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: gaps.length },
    { key: 'open', label: 'Open' },
    { key: 'investigating', label: 'Investigating' },
    { key: 'high', label: 'High Priority' },
    { key: 'export-blocker', label: 'Export Blockers', count: openCount },
  ];

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Evidence Gap &amp; Action Planner</h2>
          {openCount > 0 && (
            <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-sm">
              {openCount} UNRESOLVED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">Missing evidence is not negative evidence</span>
          <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5">
            <Plus className="w-3 h-3" /> Add Gap
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border-b border-border bg-muted/30 px-5 py-2 flex items-center gap-1.5 shrink-0">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-mono uppercase rounded border transition-colors flex items-center gap-1",
              filter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            )}
          >
            {f.label}
            {f.count !== undefined && (
              <span className={cn("text-[9px] px-1 rounded", filter === f.key ? "bg-white/20" : "bg-muted")}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left — gap list */}
        <Panel defaultSize={40} minSize={28} className="flex flex-col border-r border-border bg-muted/10 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">No gaps match this filter.</div>
            )}
            {filtered.map(gap => {
              const statusCfg = GAP_STATUS_CONFIG[gap.status];
              const priorityCfg = PRIORITY_CONFIG[gap.priority];
              return (
                <motion.div
                  layout key={gap.id}
                  onClick={() => setSelectedId(gap.id)}
                  className={cn(
                    "p-3.5 rounded-sm border cursor-pointer transition-all",
                    selectedId === gap.id
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={cn("text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border", EVIDENCE_STATUS_CONFIG[gap.evidenceStatus].color)}>
                      {EVIDENCE_STATUS_CONFIG[gap.evidenceStatus].label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border", priorityCfg.color)}>
                        {priorityCfg.label}
                      </span>
                      <div className={cn("w-2 h-2 rounded-full shrink-0", statusCfg.dot)} />
                    </div>
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1.5 leading-tight">{gap.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{gap.whyMatters}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border", statusCfg.color)}>
                      {statusCfg.label}
                    </span>
                    {gap.dueDate && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />{gap.dueDate}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Panel>

        <PanelResizeHandle className="w-0.5 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

        {/* Right — detail */}
        <Panel minSize={35} className="flex flex-col bg-card overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.16 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 pb-28 space-y-7">
                  {/* Title row */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={cn("text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm border", EVIDENCE_STATUS_CONFIG[selected.evidenceStatus].color)}>
                        Evidence: {EVIDENCE_STATUS_CONFIG[selected.evidenceStatus].label}
                      </span>
                      <span className={cn("text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm border", PRIORITY_CONFIG[selected.priority].color)}>
                        {PRIORITY_CONFIG[selected.priority].label} Priority
                      </span>
                      <span className="text-muted-foreground font-mono text-xs ml-auto">{selected.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">{selected.title}</h2>
                  </div>

                  {/* Why it matters */}
                  <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" /> Why This Matters
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">{selected.whyMatters}</p>
                  </div>

                  {/* Consequence */}
                  <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                    <div className="text-[10px] font-mono text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Consequence If Unresolved
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed">{selected.consequence}</p>
                  </div>

                  {/* Responsible person + linked items */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted border border-border rounded-sm p-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Responsible Person</div>
                      <div className="text-sm text-foreground font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />{selected.responsiblePerson}
                      </div>
                    </div>
                    <div className="bg-muted border border-border rounded-sm p-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Related Findings</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.relatedFindingIds.map(fid => (
                          <span key={fid} className="text-[10px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded text-foreground">{fid}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted border border-border rounded-sm p-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Source Documents</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.sourceDocumentIds.map(did => (
                          <span key={did} className="text-[10px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded text-foreground flex items-center gap-1">
                            <FileText className="w-3 h-3" />{did}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Suggested actions */}
                  <div>
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Suggested Next Actions</h3>
                    <div className="space-y-2">
                      {selected.suggestedActions.map(action => {
                        const taskDone = convertedActions.has(action.id);
                        const qDone = questionActions.has(action.id);
                        return (
                          <div key={action.id} className={cn(
                            "p-3.5 rounded-md border transition-all",
                            (taskDone && qDone) ? "bg-teal-50/60 border-teal-200" : "bg-card border-border"
                          )}>
                            <div className="flex items-start gap-2.5 mb-3">
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground leading-snug">{action.label}</span>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                              {/* Create Task */}
                              {!taskDone ? (
                                <button
                                  onClick={() => convertAction(action.id)}
                                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-foreground border border-border bg-muted hover:bg-card px-2.5 py-1 rounded transition-colors"
                                >
                                  <ClipboardList className="w-3 h-3" />Create Task
                                </button>
                              ) : (
                                <span className="flex items-center gap-1.5 text-[10px] font-mono text-teal-700 border border-teal-200 bg-teal-50 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3" />Task Created
                                </span>
                              )}
                              {/* Create Interview Question */}
                              {!qDone ? (
                                <button
                                  onClick={() => createQuestion(action.id)}
                                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                                >
                                  <MessageSquare className="w-3 h-3" />Create Interview Q
                                </button>
                              ) : (
                                <span className="flex items-center gap-1.5 text-[10px] font-mono text-blue-700 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3" />Question Created
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Gap-level: Preserve as Unknown */}
                    <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Archive className="w-3.5 h-3.5 text-slate-500" />Preserve as Unknown
                          </p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Absence of evidence is not negative evidence. Mark this gap as a valid epistemic state — no further investigation required.
                          </p>
                        </div>
                        <button
                          onClick={() => preserveAsUnknown(selected.id)}
                          disabled={preservedGaps.has(selected.id) || selected.status === 'unable-to-resolve'}
                          className={cn(
                            "shrink-0 text-[10px] font-mono uppercase px-2.5 py-1.5 rounded border transition-colors whitespace-nowrap",
                            (preservedGaps.has(selected.id) || selected.status === 'unable-to-resolve')
                              ? "bg-muted text-muted-foreground border-border cursor-default"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          )}
                        >
                          {(preservedGaps.has(selected.id) || selected.status === 'unable-to-resolve') ? '✓ Preserved' : 'Preserve →'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Practitioner notes */}
                  {selected.practitionerNotes && (
                    <div className="bg-muted border border-border rounded-sm p-4">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Practitioner Notes</div>
                      <p className="text-sm text-foreground leading-relaxed">{selected.practitionerNotes}</p>
                    </div>
                  )}

                  {/* Audit history */}
                  <div>
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Audit History</h3>
                    {selected.auditHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No audit entries yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {selected.auditHistory.map((entry, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground">
                            <span className="font-mono shrink-0 text-[10px]">{new Date(entry.timestamp).toLocaleString()}</span>
                            <span className="font-medium text-foreground shrink-0">{entry.actor}</span>
                            <span>{entry.action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action bar */}
                <div className="absolute bottom-0 left-[40%] right-0 p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">STATUS:</span>
                      <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm border", GAP_STATUS_CONFIG[selected.status].color)}>
                        {GAP_STATUS_CONFIG[selected.status].label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="text-xs border border-border rounded-sm px-2 py-1.5 bg-card text-foreground"
                        value={selected.status}
                        onChange={e => setStatus(selected.id, e.target.value as GapStatus)}
                      >
                        {Object.entries(GAP_STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-sm h-8"
                        onClick={() => openResolveModal(selected.id)}
                        disabled={selected.status === 'resolved'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Mark Resolved
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a gap to review
              </div>
            )}
          </AnimatePresence>
        </Panel>
      </PanelGroup>

      {/* Resolve modal */}
      <AnimatePresence>
        {resolveModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-md rounded-md shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-border">
                <h3 className="font-bold text-foreground mb-1">Mark Gap as Resolved</h3>
                <p className="text-sm text-muted-foreground">
                  {gaps.find(g => g.id === resolveModal.gapId)?.title}
                </p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase block mb-1.5">
                    Reason for Resolution <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full text-sm border border-border rounded-sm p-2.5 bg-muted resize-none h-20 focus:outline-none focus:border-primary/50"
                    placeholder="How was this gap resolved? What confirms the resolution?"
                    value={resolveModal.reason}
                    onChange={e => setResolveModal(m => ({ ...m, reason: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground uppercase block mb-1.5">
                    Supporting Evidence <span className="text-muted-foreground/60">(optional)</span>
                  </label>
                  <input
                    className="w-full text-sm border border-border rounded-sm p-2.5 bg-muted focus:outline-none focus:border-primary/50"
                    placeholder="Document ID, note reference, or description of evidence"
                    value={resolveModal.evidence}
                    onChange={e => setResolveModal(m => ({ ...m, evidence: e.target.value }))}
                  />
                </div>
                {!resolveModal.reason.trim() && (
                  <p className="text-xs text-red-600">A resolution reason is required before marking resolved.</p>
                )}
              </div>
              <div className="p-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResolveModal({ open: false, gapId: '', reason: '', evidence: '' })}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                  disabled={!resolveModal.reason.trim()}
                  onClick={confirmResolve}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Confirm Resolution
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
