import React, { useState, useEffect, useRef } from 'react';
import { MOCK_FINDINGS, MOCK_CONTEXT_GAPS, Finding, ContextGap, Citation, ReviewLane } from '@/data/mock-case';
import { EvidenceNatureBadge, OriginBadge, SupportStatusBadge, ReviewStatusBadge } from '@/components/badges';
import { SourceDrawer } from '@/components/source-drawer';
import {
  FileText, AlertTriangle, XCircle, ShieldAlert, Check, HelpCircle,
  BrainCircuit, Shield, EyeOff, Lock, CheckCircle2, Users, Loader2,
  Play, ChevronDown, X, Info, Database, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'pending' | 'accepted' | 'edited' | 'rejected' | 'uncertain' | 'conflict' | 'export-blocker';
type ActiveLane = 'A' | 'B' | 'C';
type RunPhase = 'idle' | 'running' | 'complete' | 'replay-loaded';

// ── Config ────────────────────────────────────────────────────────────────────

const LANE_META: Record<ActiveLane, { label: string; subLabel: string; color: string; activeColor: string }> = {
  A: { label: 'Lane A', subLabel: 'Trafficking Indicators',   color: 'text-purple-700', activeColor: 'border-purple-500 text-purple-700 bg-purple-50' },
  B: { label: 'Lane B', subLabel: 'Non-Punishment Relevance', color: 'text-blue-700',   activeColor: 'border-blue-500 text-blue-700 bg-blue-50' },
  C: { label: 'Lane C', subLabel: 'Protection & Urgency',     color: 'text-orange-700', activeColor: 'border-orange-500 text-orange-700 bg-orange-50' },
};

const GAP_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unanswered:    { label: 'Unanswered',    color: 'bg-amber-50 text-amber-700 border-amber-200' },
  answered:      { label: 'Answered',      color: 'bg-teal-50 text-teal-700 border-teal-200' },
  deferred:      { label: 'Deferred',      color: 'bg-slate-50 text-slate-600 border-slate-200' },
  unknown:       { label: 'Unknown (Valid)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'out-of-scope':{ label: 'Out of Scope',  color: 'bg-muted text-muted-foreground border-border' },
};

const PROCESSING_STAGES: { label: string; icon: React.ElementType; detail: string }[] = [
  { label: 'Validate purpose and permissions', icon: Shield,       detail: 'Checking purpose brief completeness and practitioner role.' },
  { label: 'Confirm masking',                  icon: EyeOff,      detail: 'Scanning for unmasked PII in all 7 source documents.' },
  { label: 'Build redacted input',             icon: Lock,        detail: 'Constructing redacted evidence packet for analysis.' },
  { label: 'Analyze synthetic evidence',       icon: BrainCircuit,detail: 'Extracting candidate findings from 28 canonical segments.' },
  { label: 'Validate citations',               icon: FileText,    detail: 'Verifying all 23 citations against canonical segment IDs.' },
  { label: 'Quarantine unsafe output',         icon: ShieldAlert, detail: 'Scanning for prohibited conclusions and injection attempts.' },
  { label: 'Prepare human-review queue',       icon: Users,       detail: 'Generating 14 candidate items for practitioner review.' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseAnalysis() {
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);
  const [gaps, setGaps] = useState<ContextGap[]>(MOCK_CONTEXT_GAPS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_FINDINGS.filter(f => f.lane === 'A')[0]?.id || null);
  const [activeLane, setActiveLane] = useState<ActiveLane>('A');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [showCascadeModal, setShowCascadeModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCitation, setDrawerCitation] = useState<Citation | null>(null);
  const [showGaps, setShowGaps] = useState(false);

  // AI Run Experience state
  const [showRunModal, setShowRunModal] = useState(false);
  const [runPhase, setRunPhase] = useState<RunPhase>('idle');
  const [completedStages, setCompletedStages] = useState<number>(0);
  const [lastRunId, setLastRunId] = useState<string | null>('REPLAY-V1');
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = findings.find(f => f.id === selectedId);
  const pendingCount = findings.filter(f => f.reviewStatus === 'pending').length;
  const lanedFindings = findings.filter(f => f.lane === activeLane);

  const filteredFindings = lanedFindings.filter(f => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'conflict') return f.supportStatus === 'conflicting';
    if (filterStatus === 'export-blocker') return f.supportStatus === 'unresolved';
    return f.reviewStatus === filterStatus;
  });

  const laneGaps = gaps.filter(g => {
    if (activeLane === 'A') return g.category === 'Evidence Corroboration' || g.category === 'Source Authority' || g.category === 'Missing Evidence';
    if (activeLane === 'B') return g.category === 'Chronology' || g.category === 'Source Authority' || g.category === 'Missing Evidence';
    if (activeLane === 'C') return g.category === 'Procedural Urgency';
    return false;
  });

  // ── Run simulation ──────────────────────────────────────────────────────────

  const startRun = () => {
    setRunPhase('running');
    setCompletedStages(0);
    let stage = 0;
    const advance = () => {
      stage++;
      setCompletedStages(stage);
      if (stage < PROCESSING_STAGES.length) {
        stageTimerRef.current = setTimeout(advance, 750);
      } else {
        stageTimerRef.current = setTimeout(() => {
          setRunPhase('complete');
          setLastRunId('EVAL-' + Date.now().toString(36).toUpperCase());
        }, 500);
      }
    };
    stageTimerRef.current = setTimeout(advance, 600);
  };

  const loadReplay = () => {
    setRunPhase('replay-loaded');
    setLastRunId('REPLAY-V1');
  };

  const closeModal = () => {
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    setShowRunModal(false);
    if (runPhase === 'running') setRunPhase('idle');
  };

  useEffect(() => () => { if (stageTimerRef.current) clearTimeout(stageTimerRef.current); }, []);

  // ── Finding actions ────────────────────────────────────────────────────────

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
      const idx = updated.findIndex(f => f.id === id);
      if (idx > -1) {
        updated[idx] = { ...updated[idx], reviewStatus: 'pending' };
        (updated[idx].dependencies || []).forEach(depId => {
          const di = updated.findIndex(f => f.id === depId);
          if (di > -1) updated[di] = { ...updated[di], supportStatus: 'unresolved', reviewStatus: 'pending' };
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

  const handleGapAction = (id: string, status: ContextGap['status']) => {
    setGaps(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  const openDrawer = (citation: Citation) => {
    setDrawerCitation(citation);
    setDrawerOpen(true);
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'coercion':          'border-purple-200 bg-purple-50 text-purple-700',
      'relationship':      'border-blue-200 bg-blue-50 text-blue-700',
      'compelled-task':    'border-amber-200 bg-amber-50 text-amber-700',
      'contradiction':     'border-red-200 bg-red-50 text-red-700',
      'evidence-gap':      'border-slate-200 bg-slate-50 text-slate-600',
      'protection-urgency':'border-orange-200 bg-orange-50 text-orange-700',
      'timeline-link':     'border-indigo-200 bg-indigo-50 text-indigo-700',
    };
    return map[type] || 'border-border text-muted-foreground bg-muted';
  };

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'edited', label: 'Edited' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'uncertain', label: 'Uncertain' },
    { key: 'conflict', label: 'Conflict' },
    { key: 'export-blocker', label: 'Blocker' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">

      {/* ── Analysis Run Status Bar ── */}
      <div className={cn(
        "border-b px-5 py-3 flex items-center justify-between shrink-0 transition-colors",
        runPhase === 'complete' ? "bg-teal-50 border-teal-200" : "bg-card border-border"
      )}>
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Structured Analysis</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-sm">
              {pendingCount} PENDING
            </span>
          )}
          {lastRunId && (
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              {runPhase === 'replay-loaded' ? (
                <span className="text-amber-600 font-semibold">PREPARED REPLAY: {lastRunId}</span>
              ) : runPhase === 'complete' ? (
                <span className="text-teal-700 font-semibold">EVALUATED: {lastRunId}</span>
              ) : (
                <span>Last run: {lastRunId}</span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {runPhase === 'running' && (
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Running analysis…
            </div>
          )}
          {runPhase !== 'running' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setRunPhase('idle'); setShowRunModal(true); loadReplay(); }}
                className="h-7 text-xs gap-1.5 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                <RefreshCw className="w-3 h-3" />Load Replay
              </Button>
              <Button
                size="sm"
                onClick={() => { setRunPhase('idle'); setCompletedStages(0); setShowRunModal(true); }}
                className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="w-3 h-3" />Start Analysis
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Replay disclosure banner ── */}
      <AnimatePresence>
        {runPhase === 'replay-loaded' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-3 text-xs text-amber-800">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Prepared Replay loaded — {lastRunId}.</strong> This is a deterministic fixture output, not a live AI run.
                All findings below reflect the pre-loaded synthetic replay state.
                No provider call was made.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lane tabs */}
      <div className="border-b border-border bg-card/50 px-5 flex items-end gap-0 shrink-0">
        {(Object.entries(LANE_META) as [ActiveLane, typeof LANE_META[ActiveLane]][]).map(([lane, meta]) => {
          const count = findings.filter(f => f.lane === lane).length;
          return (
            <button
              key={lane}
              onClick={() => { setActiveLane(lane); setSelectedId(null); setFilterStatus('all'); }}
              className={cn(
                "flex flex-col items-start px-4 py-2.5 border-b-2 text-left transition-colors min-w-[140px]",
                activeLane === lane ? `border-current ${meta.color}` : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("text-xs font-bold font-mono", activeLane === lane ? meta.color : '')}>{meta.label}</span>
                <span className="text-[10px] font-mono bg-muted border border-border px-1 rounded text-muted-foreground">{count}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">{meta.subLabel}</span>
            </button>
          );
        })}
        <div className="ml-auto pb-2">
          <button
            onClick={() => setShowGaps(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors",
              showGaps ? "bg-amber-50 border-amber-200 text-amber-700" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <HelpCircle className="w-3.5 h-3.5" />Context Gaps
            {laneGaps.filter(g => g.status === 'unanswered').length > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-bold px-1 rounded">
                {laneGaps.filter(g => g.status === 'unanswered').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Context gaps panel */}
      <AnimatePresence>
        {showGaps && laneGaps.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden border-b border-border bg-amber-50/30"
          >
            <div className="p-4 space-y-2">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                Context Gaps — {activeLane === 'A' ? 'Evidence & Source' : activeLane === 'B' ? 'Chronology & Missing Evidence' : 'Procedural Urgency'}
              </div>
              {laneGaps.map(gap => (
                <div key={gap.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg shadow-sm">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{gap.question}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground">{gap.category}</span>
                      {gap.relatedFindingIds.map(fid => (
                        <span key={fid} onClick={() => setSelectedId(fid)}
                          className="text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/5">{fid}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {(['answered', 'deferred', 'unknown', 'out-of-scope'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => handleGapAction(gap.id, s)}
                        className={cn(
                          "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors",
                          gap.status === s ? GAP_STATUS_CONFIG[s].color : "border-border text-muted-foreground hover:border-foreground/20"
                        )}
                      >
                        {s.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                  <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded border shrink-0", GAP_STATUS_CONFIG[gap.status].color)}>
                    {GAP_STATUS_CONFIG[gap.status].label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left — findings list */}
        <Panel defaultSize={42} minSize={28} className="flex flex-col border-r border-border bg-muted/10 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-card/50 flex items-center gap-1 overflow-x-auto shrink-0">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={cn(
                  "shrink-0 px-2.5 py-1 text-[10px] font-mono uppercase rounded border transition-colors",
                  filterStatus === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                {f.label}
                {f.key === 'pending' && pendingCount > 0 && (
                  <span className="ml-1 text-[9px] bg-blue-600 text-white px-1 rounded">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredFindings.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">No items match this filter.</div>
            )}
            {filteredFindings.map(finding => (
              <motion.div
                layout key={finding.id}
                onClick={() => setSelectedId(finding.id)}
                className={cn(
                  "p-3.5 rounded-lg border cursor-pointer transition-all",
                  selectedId === finding.id
                    ? "bg-primary/5 border-primary/25 shadow-sm"
                    : "bg-card border-border hover:border-foreground/15 hover:bg-muted/20",
                  finding.supportStatus === 'unresolved' && "ring-1 ring-amber-400 border-amber-300"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn("text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border", getTypeColor(finding.type))}>
                    {finding.type.replace(/-/g, ' ')}
                  </span>
                  <ReviewStatusBadge status={finding.reviewStatus} />
                </div>
                <h3 className="font-medium text-foreground text-sm mb-1 leading-tight">{finding.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{finding.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                  <SupportStatusBadge status={finding.supportStatus} />
                  <span className="text-border text-xs">·</span>
                  <OriginBadge origin={finding.origin} />
                </div>
              </motion.div>
            ))}

            <div className="mt-6 pt-4 border-t border-dashed border-border">
              <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">AI Limitations &amp; Abstentions</h4>
              <div className="bg-muted border border-border p-3 rounded-lg text-xs text-muted-foreground space-y-2">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  AI abstained from d-5 (handwriting illegibility).
                </p>
                <p className="flex items-start gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  Legal conclusions on 18 U.S.C. § 1589 excluded from model scope.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-0.5 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

        {/* Right — detail panel */}
        <Panel minSize={30} className="flex flex-col bg-card relative overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="flex-1 overflow-y-auto flex flex-col h-full"
              >
                <div className="p-7 pb-28 space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={cn("text-[10px] uppercase font-mono px-2 py-1 rounded border", getTypeColor(selected.type))}>
                      {selected.type.replace(/-/g, ' ')}
                    </span>
                    <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border font-semibold", LANE_META[selected.lane].activeColor)}>
                      {LANE_META[selected.lane].label} · {LANE_META[selected.lane].subLabel}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs ml-auto">ID: {selected.id}</span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">{selected.title}</h2>
                    <p className="text-base text-foreground/80 leading-relaxed">{selected.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted border border-border p-3.5 rounded-lg">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Evidence Nature</div>
                      <EvidenceNatureBadge nature={selected.evidenceNature} />
                    </div>
                    <div className="bg-muted border border-border p-3.5 rounded-lg">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Origin</div>
                      <OriginBadge origin={selected.origin} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Source Citations</h3>
                    {selected.citations.length > 0 ? selected.citations.map((cit, idx) => (
                      <div key={idx} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-muted px-4 py-2 flex justify-between items-center border-b border-border">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{cit.sourceAuthority || `Doc ${cit.documentId}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground">PAGE {cit.page}</span>
                            <button
                              onClick={() => openDrawer(cit)}
                              className="text-[10px] font-mono text-primary hover:text-primary/80 border border-primary/30 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded transition-colors"
                            >
                              View Source ↗
                            </button>
                          </div>
                        </div>
                        <div className="p-4 font-mono text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/40 ml-4 my-3 pl-4">
                          "{cit.text}"
                        </div>
                        {cit.limitations && (
                          <div className="mx-4 mb-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-md">
                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />{cit.limitations}
                          </div>
                        )}
                      </div>
                    )) : (
                      <p className="text-muted-foreground font-mono text-sm italic">No direct citations linked.</p>
                    )}
                  </div>

                  {selected.missingContext && selected.missingContext.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-mono text-amber-700 uppercase tracking-widest border-b border-amber-200 pb-2">Missing Evidence</h3>
                      {selected.missingContext.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />{m}
                        </div>
                      ))}
                    </div>
                  )}

                  {selected.contradictions && (
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-mono text-red-600 uppercase tracking-widest border-b border-red-200 pb-2 flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5" />Contradictory Evidence
                      </h3>
                      {selected.contradictions.map((c, i) => (
                        <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{c}</div>
                      ))}
                    </div>
                  )}

                  {selected.dependencies && selected.dependencies.length > 0 && (
                    <div className="p-4 bg-muted border border-border rounded-lg">
                      <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Dependency Chain</h3>
                      <p className="text-sm text-muted-foreground mb-2">Supports {selected.dependencies.length} downstream Nexus item(s).</p>
                      <div className="flex gap-2 flex-wrap">
                        {selected.dependencies.map(dep => (
                          <span key={dep} onClick={() => setSelectedId(dep)}
                            className="text-xs font-mono bg-secondary text-foreground px-2 py-1 rounded border border-border cursor-pointer hover:bg-primary/5">{dep}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Review action bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-md border-t border-border z-10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">STATUS:</span>
                      <ReviewStatusBadge status={selected.reviewStatus} />
                    </div>
                    <div className="flex gap-2">
                      {selected.reviewStatus === 'accepted' ? (
                        <Button variant="outline" size="sm" className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 text-xs" onClick={() => handleWithdraw(selected.id)}>
                          Withdraw
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" className="bg-card border-border text-foreground hover:bg-muted text-xs" onClick={() => handleAction(selected.id, 'rejected')}>Reject</Button>
                          <Button variant="outline" size="sm" className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 text-xs" onClick={() => handleAction(selected.id, 'uncertain')}>Uncertain</Button>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs min-w-[90px]" onClick={() => handleAction(selected.id, 'accepted')}>
                            <Check className="w-3.5 h-3.5 mr-1.5" />Accept
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a finding to review
              </div>
            )}
          </AnimatePresence>
        </Panel>
      </PanelGroup>

      {/* ── Analysis Run Modal ── */}
      <AnimatePresence>
        {showRunModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-border flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    {runPhase === 'replay-loaded' ? 'Prepared Replay' : 'Evaluated AI Analysis'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {runPhase === 'replay-loaded'
                      ? 'Deterministic synthetic fixture — no live AI provider call.'
                      : 'Interactive UI prototype — no live provider call is performed in this preview.'}
                  </p>
                </div>
                {(runPhase === 'complete' || runPhase === 'replay-loaded') && (
                  <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Replay loaded state */}
              {runPhase === 'replay-loaded' && (
                <div className="p-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />Prepared Replay Disclosure
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      You are loading a deterministic pre-run fixture output ({lastRunId}).
                      This is clearly labelled and is not presented as live AI output.
                      The findings below reflect the replay state.
                    </p>
                  </div>
                  <div className="bg-muted border border-border rounded-lg p-3.5 font-mono text-xs space-y-1.5">
                    {[['runId', lastRunId!], ['runMethod', 'prepared-replay'], ['providerTransmission', 'false'], ['candidatesExtracted', '14'], ['citationsValidated', '23']].map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-primary">{k}:</span>
                        <span className="text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={closeModal} className="w-full mt-4 bg-primary text-primary-foreground">
                    Load Replay State
                  </Button>
                </div>
              )}

              {/* Run idle — choose method */}
              {runPhase === 'idle' && (
                <div className="p-5 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-800 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    Interactive UI prototype — no live provider call is performed in this preview. Provider selection is not exposed to practitioners.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startRun}
                      className="p-4 rounded-lg border-2 border-primary bg-primary/5 text-left hover:bg-primary/10 transition-colors"
                    >
                      <Play className="w-5 h-5 text-primary mb-2" />
                      <div className="font-semibold text-foreground text-sm mb-1">Evaluated AI Run</div>
                      <p className="text-xs text-muted-foreground">Simulates the 7-stage analysis pipeline with validation and safety checks.</p>
                    </button>
                    <button
                      onClick={loadReplay}
                      className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50 text-left hover:bg-amber-100 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-amber-600 mb-2" />
                      <div className="font-semibold text-foreground text-sm mb-1">Prepared Replay</div>
                      <p className="text-xs text-muted-foreground">Loads the deterministic synthetic fixture output. Clearly labelled — not live AI.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Running or complete — stages */}
              {(runPhase === 'running' || runPhase === 'complete') && (
                <div className="p-5">
                  <div className="space-y-2.5 mb-5">
                    {PROCESSING_STAGES.map((stage, i) => {
                      const done = completedStages > i;
                      const active = runPhase === 'running' && completedStages === i;
                      const Icon = stage.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.4 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                            done ? "bg-teal-50 border-teal-200" : active ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                            done ? "bg-teal-100 border border-teal-200" : active ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"
                          )}>
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            ) : active ? (
                              <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            ) : (
                              <Icon className="w-4 h-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn("text-sm font-medium", done ? "text-teal-800" : active ? "text-foreground" : "text-muted-foreground")}>
                              {i + 1}. {stage.label}
                            </div>
                            {(done || active) && (
                              <div className={cn("text-[10px] font-mono mt-0.5", done ? "text-teal-600" : "text-muted-foreground")}>{stage.detail}</div>
                            )}
                          </div>
                          {done && (
                            <span className="text-[9px] font-mono uppercase text-teal-700 bg-teal-100 border border-teal-200 px-1.5 py-0.5 rounded shrink-0">
                              {i === 5 ? 'CLEAN' : 'PASS'}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Complete summary */}
                  {runPhase === 'complete' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                        <div className="text-[10px] font-mono text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />Analysis Complete
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          {[['14', 'Candidates'], ['23', 'Citations verified'], ['0', 'Quarantined']].map(([n, l]) => (
                            <div key={l}>
                              <div className="text-2xl font-bold font-mono text-teal-700">{n}</div>
                              <div className="text-[10px] text-teal-600">{l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground bg-muted border border-border rounded p-3 space-y-1">
                        {[['runId', lastRunId!], ['method', 'evaluated-ai-prototype'], ['providerTransmission', 'false']].map(([k, v]) => (
                          <div key={k} className="flex gap-3">
                            <span className="text-primary">{k}:</span><span>{v}</span>
                          </div>
                        ))}
                      </div>
                      <Button onClick={closeModal} className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white">
                        View Findings Queue
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cascade modal */}
      {showCascadeModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-lg font-bold text-amber-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />Dependency Cascade Warning
              </h3>
              <p className="text-muted-foreground text-sm">Withdrawing <strong className="text-foreground">{selected.title}</strong> will destabilize downstream Nexus items.</p>
            </div>
            <div className="p-5 bg-muted/30 space-y-2">
              {selected.dependencies?.map(depId => {
                const dep = findings.find(f => f.id === depId);
                return dep ? (
                  <div key={depId} className="flex items-center gap-3 p-2.5 bg-background border border-border rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground">{depId}</span>
                    <span className="text-sm text-foreground">{dep.title}</span>
                  </div>
                ) : null;
              })}
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">This will block the Export Gate until affected findings are re-reviewed.</p>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-card">
              <Button variant="outline" size="sm" onClick={() => setShowCascadeModal(false)}>Cancel</Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => selected && executeWithdraw(selected.id)}>
                Proceed with Withdrawal
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <SourceDrawer
        open={drawerOpen}
        citation={drawerCitation}
        onClose={() => setDrawerOpen(false)}
        onReveal={() => setDrawerOpen(false)}
      />
    </div>
  );
}
