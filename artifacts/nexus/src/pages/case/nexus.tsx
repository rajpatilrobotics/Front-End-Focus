import React, { useState } from 'react';
import { Finding } from '@/data/mock-case';
import { useCaseContext } from '@/context/CaseContext';
import { ReviewStatusBadge, SupportStatusBadge } from '@/components/badges';
import {
  Maximize2, ShieldAlert, Filter, Table2, GitBranch, HelpCircle,
  AlertTriangle, CheckCircle2, ArrowRight, XCircle, ChevronRight,
  Scale, Eye, EyeOff, FileText, Link2, X, TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

// ── Graph config ──────────────────────────────────────────────────────────────

const NODE_POSITIONS: Record<string, { x: number; y: number; group: string }> = {
  root:  { x: 500, y: 80,  group: 'charge' },
  'f-2': { x: 190, y: 260, group: 'recruitment' },
  'f-1': { x: 390, y: 260, group: 'coercion' },
  'f-4': { x: 610, y: 260, group: 'coercion' },
  'f-5': { x: 500, y: 410, group: 'coercion' },
  'f-3': { x: 820, y: 260, group: 'task' },
  'f-6': { x: 295, y: 155, group: 'contradiction' },
  'f-7': { x: 820, y: 120, group: 'urgency' },
  'f-8': { x: 175, y: 410, group: 'gap' },
};

const EDGES = [
  { source: 'root', target: 'f-1', type: 'supports' },
  { source: 'root', target: 'f-3', type: 'supports' },
  { source: 'root', target: 'f-2', type: 'supports' },
  { source: 'f-1', target: 'f-5', type: 'dependency' },
  { source: 'f-1', target: 'f-6', type: 'contradicts' },
  { source: 'f-3', target: 'f-4', type: 'linked' },
  { source: 'root', target: 'f-7', type: 'modifier' },
];

const EDGE_TYPES = {
  supports:    { stroke: '#94a3b8', dash: 'none', width: '1.5', label: 'Supports' },
  dependency:  { stroke: '#c084fc', dash: 'none', width: '1.5', label: 'Depends on' },
  contradicts: { stroke: '#f87171', dash: '4,4',  width: '1.5', label: 'Conflicts with' },
  linked:      { stroke: '#94a3b8', dash: '2,4',  width: '1',   label: 'Linked' },
  modifier:    { stroke: '#fb923c', dash: '2,4',  width: '1',   label: 'Urgency modifier' },
};

type FilterGroup = 'all' | 'coercion' | 'recruitment' | 'task' | 'contradiction' | 'urgency' | 'gap';
type ChallengePhase = 'idle' | 'reviewing' | 'impact';

const GROUP_COLORS: Record<string, string> = {
  charge:       'bg-slate-800 text-white border-slate-600 ring-4 ring-slate-400/20',
  coercion:     'bg-purple-50 border-purple-300 text-purple-900',
  recruitment:  'bg-blue-50 border-blue-300 text-blue-900',
  task:         'bg-amber-50 border-amber-300 text-amber-900',
  contradiction:'bg-red-50 border-red-300 text-red-900',
  urgency:      'bg-orange-50 border-orange-300 text-orange-900',
  gap:          'bg-slate-50 border-slate-300 border-dashed text-slate-600',
};

const FILTER_OPTIONS: { key: FilterGroup; label: string }[] = [
  { key: 'all', label: 'All Nodes' },
  { key: 'coercion', label: 'Control / Coercion' },
  { key: 'recruitment', label: 'Recruitment' },
  { key: 'task', label: 'Compelled Tasks' },
  { key: 'contradiction', label: 'Contradictions' },
  { key: 'urgency', label: 'Urgency / Protection' },
  { key: 'gap', label: 'Evidence Gaps' },
];

// ── Challenge mode data (static UI scenario) ──────────────────────────────────

const CHALLENGE_CONTRARY = [
  'Source document (Operational Task Log) is self-reported by the supervisor — no independent verification.',
  'Pages 2–3 of d-4 contain shift data that is unavailable due to extraction failure.',
  'Subject\'s own account of working hours has not been separately recorded.',
];

const CHALLENGE_ASSUMPTIONS = [
  'Assumes the task log accurately reflects hours actually worked by the subject.',
  'Assumes subject had no contractual right to refuse extended shifts.',
  'Assumes "no overtime recorded" means overtime was owed rather than absent by design.',
];

const CHALLENGE_IMPACT = [
  { id: 'f-9', label: 'Alleged Conduct Timing (f-9)', change: 'Becomes Unresolved / Pending', severity: 'high' },
  { id: 't-4', label: 'Timeline event: Alleged task assigned (t-4)', change: 'Marked Uncertain', severity: 'med' },
  { id: 'eg-new', label: 'New Evidence Gap', change: '"Compelled task evidence no longer supportable" gap created', severity: 'high' },
  { id: 'export', label: 'Export Gate', change: 'Remains Blocked — new dependency blocker added', severity: 'high' },
];

const CHALLENGE_UNCHANGED = ['f-1 Passport Retention', 'f-2 Recruitment Fee Debt', 'f-6 Arrival Date Discrepancy'];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseNexus() {
  const { state } = useCaseContext();
  const findings = state.findings;
  const evidenceGaps = state.evidenceGaps;
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterGroup>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [challengePhase, setChallengePhase] = useState<ChallengePhase>('idle');
  const [challengeWithdrawn, setChallengeWithdrawn] = useState(false);

  const selectedFinding = findings.find(f => f.id === selectedNode);
  const canChallenge = selectedNode === 'f-3' || (selectedFinding && selectedFinding.reviewStatus === 'accepted');

  const isVisible = (id: string) => {
    if (activeFilter === 'all') return true;
    if (id === 'root') return true;
    return NODE_POSITIONS[id]?.group === activeFilter;
  };

  const renderEdge = (edge: typeof EDGES[0], i: number) => {
    const sPos = NODE_POSITIONS[edge.source];
    const tPos = NODE_POSITIONS[edge.target];
    if (!sPos || !tPos || !isVisible(edge.source) || !isVisible(edge.target)) return null;
    const cfg = EDGE_TYPES[edge.type as keyof typeof EDGE_TYPES] || EDGE_TYPES.supports;
    // If challenge withdrawn, show f-3 edges as dashed red
    const isWithdrawnEdge = challengeWithdrawn && (edge.source === 'f-3' || edge.target === 'f-3');
    return (
      <line
        key={`e-${i}`}
        x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y}
        stroke={isWithdrawnEdge ? '#f87171' : cfg.stroke}
        strokeWidth={cfg.width}
        strokeDasharray={isWithdrawnEdge ? '4,4' : cfg.dash}
        opacity={isWithdrawnEdge ? 0.5 : 1}
        className="transition-all duration-500"
      />
    );
  };

  const handleCancelChallenge = () => {
    setChallengePhase('idle');
  };

  const handleConfirmWithdrawal = () => {
    setChallengeWithdrawn(true);
    setChallengePhase('idle');
    setSelectedNode(null);
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden relative">

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs text-amber-700 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          Relationship map of extracted evidence — not a trafficking determination or legal opinion
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('graph')}
            className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors",
              viewMode === 'graph' ? "bg-card border-border text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <GitBranch className="w-3.5 h-3.5" />Graph
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors",
              viewMode === 'table' ? "bg-card border-border text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <Table2 className="w-3.5 h-3.5" />Accessible Table
          </button>
        </div>
      </div>

      {/* Challenge withdrawn notice */}
      <AnimatePresence>
        {challengeWithdrawn && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center gap-3 text-sm text-red-800">
              <TriangleAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Challenge confirmed.</strong> Excessive Unpaid Hours (f-3) withdrawn.
                f-9 → Unresolved. Timeline event t-4 → Uncertain. New evidence gap created.
                Audit trail updated.
              </span>
              <span className="ml-auto text-[10px] font-mono text-red-600 border border-red-300 bg-red-100 px-2 py-0.5 rounded">DEPENDENCY CASCADE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter bar */}
      <div className="border-b border-border bg-card/50 px-4 py-2 flex items-center gap-1.5 shrink-0 overflow-x-auto">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-mono uppercase rounded border transition-colors whitespace-nowrap",
              activeFilter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {viewMode === 'graph' ? (
        <>
          {/* Legend */}
          <div className="absolute top-[120px] left-4 z-10 bg-card/95 backdrop-blur-md p-4 rounded-lg border border-border shadow-md pointer-events-none">
            <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Legend</h3>
            <div className="space-y-1.5 text-[11px] text-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-300" />Recruitment</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-50 border border-purple-300" />Coercion / Control</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-300" />Compelled Task</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-50 border border-red-300" />Contradiction</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-50 border border-orange-300" />Urgency</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-dashed border-slate-300" />Evidence Gap</div>
              <div className="mt-3 pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-300" />Supports</div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-purple-400" />Depends on</div>
                <div className="flex items-center gap-2"><div className="w-6 border-t-2 border-dashed border-red-400" />Conflicts with</div>
                <div className="flex items-center gap-2"><div className="w-6 border-t border-dashed border-orange-400" />Urgency modifier</div>
              </div>
            </div>
          </div>

          {/* Graph area */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-muted/40 via-background to-background">
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {EDGES.map((edge, i) => renderEdge(edge, i))}
            </svg>

            {Object.entries(NODE_POSITIONS).map(([id, pos]) => {
              if (!isVisible(id)) return null;
              const finding = id === 'root' ? null : findings.find(f => f.id === id);
              const isSelected = selectedNode === id;
              const isWithdrawn = challengeWithdrawn && id === 'f-3';
              const isCascaded = challengeWithdrawn && id === 'f-9';

              return (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: isWithdrawn ? 0.45 : 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  key={id}
                  onClick={() => !isWithdrawn && setSelectedNode(isSelected ? null : id)}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 p-3 shadow-sm transition-all duration-200',
                    isWithdrawn ? 'cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-105 hover:shadow-md',
                    GROUP_COLORS[pos.group],
                    isSelected ? 'ring-2 ring-primary shadow-xl z-20 scale-105' : 'z-10',
                    isCascaded && 'ring-2 ring-amber-400 border-amber-300',
                    (finding?.supportStatus === 'unresolved' || isCascaded) && 'ring-2 ring-amber-400',
                  )}
                  style={{ left: pos.x, top: pos.y, width: id === 'root' ? 230 : 190 }}
                >
                  {id === 'root' ? (
                    <div className="text-center">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-white/60 mb-1">Target Analysis</div>
                      <div className="font-bold text-sm text-white">Charge–Coercion Nexus</div>
                      <div className="text-[10px] text-white/50 mt-1">Relationship map only</div>
                    </div>
                  ) : finding ? (
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[9px] font-mono uppercase opacity-70">{finding.type.replace(/-/g, ' ')}</span>
                        <div className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          isWithdrawn ? 'bg-slate-400'
                          : isCascaded ? 'bg-amber-500'
                          : finding.reviewStatus === 'accepted' ? 'bg-teal-500'
                          : finding.reviewStatus === 'pending' ? 'bg-blue-500'
                          : finding.reviewStatus === 'invalidated' ? 'bg-red-500'
                          : 'bg-slate-400'
                        )} />
                      </div>
                      <div className="font-medium text-[13px] leading-snug line-clamp-2">{finding.title}</div>
                      {isWithdrawn && (
                        <div className="mt-1.5 text-[9px] font-mono uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded inline-block">Withdrawn</div>
                      )}
                      {isCascaded && (
                        <div className="mt-1.5 text-[9px] font-mono uppercase text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block">Unresolved</div>
                      )}
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        /* Accessible table view */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Table2 className="w-4 h-4" />
              Accessible relationship table — same data as the graph view
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">ID</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Finding</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Review Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Support</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.filter(f => activeFilter === 'all' || NODE_POSITIONS[f.id]?.group === activeFilter).map((f, i) => (
                    <tr
                      key={f.id}
                      onClick={() => setSelectedNode(f.id)}
                      className={cn(
                        "border-b border-border/50 cursor-pointer transition-colors",
                        selectedNode === f.id ? "bg-primary/5" : i % 2 === 0 ? "bg-card" : "bg-muted/20",
                        "hover:bg-muted/40"
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{f.id}</td>
                      <td className="px-4 py-3"><span className="text-[10px] font-mono uppercase text-muted-foreground">{f.type.replace(/-/g, ' ')}</span></td>
                      <td className="px-4 py-3 font-medium text-foreground">{f.title}</td>
                      <td className="px-4 py-3"><ReviewStatusBadge status={f.reviewStatus} /></td>
                      <td className="px-4 py-3"><SupportStatusBadge status={f.supportStatus} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {f.dependencies?.map(d => (
                            <span key={d} className="text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded">{d}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Evidence gaps */}
            <div className="mt-6">
              <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Evidence Gaps in Nexus</h3>
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/60">
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Gap ID</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Title</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Evidence Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceGaps.map((g, i) => (
                      <tr key={g.id} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-card" : "bg-muted/20")}>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{g.id}</td>
                        <td className="px-4 py-3 text-foreground">{g.title}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border",
                            g.evidenceStatus === 'missing' ? "bg-red-50 text-red-700 border-red-200"
                            : g.evidenceStatus === 'conflicting' ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                          )}>
                            {g.evidenceStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono text-muted-foreground capitalize">{g.status.replace(/-/g, ' ')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Node detail side panel ── */}
      <AnimatePresence>
        {selectedNode && selectedNode !== 'root' && selectedFinding && challengePhase === 'idle' && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-[88px] right-0 bottom-0 w-[400px] bg-card/98 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col z-30"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="font-mono text-foreground font-semibold text-sm">Evidence Node</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{selectedFinding.id} · {NODE_POSITIONS[selectedNode]?.group} node</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors" aria-label="Close panel">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <ReviewStatusBadge status={selectedFinding.reviewStatus} />
                <SupportStatusBadge status={selectedFinding.supportStatus} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-2 leading-snug">{selectedFinding.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedFinding.description}</p>
              </div>

              {/* Metadata grid */}
              <div className="bg-muted/50 border border-border rounded-lg p-3.5 space-y-3">
                {[
                  ['Support', selectedFinding.supportStatus.replace(/-/g, ' ')],
                  ['Origin', selectedFinding.origin.replace(/-/g, ' ')],
                  ['Evidence nature', selectedFinding.evidenceNature.replace(/-/g, ' ')],
                  ['Lane', selectedFinding.lane === 'A' ? 'Lane A · Trafficking Indicators'
                    : selectedFinding.lane === 'B' ? 'Lane B · Non-Punishment Relevance'
                    : 'Lane C · Protection & Urgency'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-muted-foreground font-mono text-xs">{label}:</span>
                    <span className="text-xs font-mono text-foreground capitalize">{value}</span>
                  </div>
                ))}
              </div>

              {/* Citations */}
              {selectedFinding.citations.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />Source Citations
                  </div>
                  {selectedFinding.citations.map((cit, i) => (
                    <div key={i} className="bg-muted border border-border rounded-md p-3 text-xs font-mono text-foreground/80 border-l-2 border-l-primary/50 leading-relaxed mb-2">
                      "{cit.text}"
                      <div className="mt-1.5 text-[10px] text-muted-foreground/70 flex items-center gap-1.5">
                        <span>{cit.sourceAuthority}</span>
                        <span>·</span>
                        <span>p.{cit.page}</span>
                        {cit.validationStatus === 'verified' && (
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        )}
                      </div>
                      {cit.limitations && (
                        <div className="mt-2 flex items-start gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 p-1.5 rounded text-[10px] leading-snug">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                          {cit.limitations}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Contradictions */}
              {selectedFinding.contradictions && selectedFinding.contradictions.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-red-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <XCircle className="w-3 h-3" />Contrary Evidence
                  </div>
                  {selectedFinding.contradictions.map((c, i) => (
                    <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs mb-2">{c}</div>
                  ))}
                </div>
              )}

              {/* Missing context */}
              {selectedFinding.missingContext && selectedFinding.missingContext.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <HelpCircle className="w-3 h-3" />Missing Information
                  </div>
                  {selectedFinding.missingContext.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                      <ChevronRight className="w-3 h-3 text-amber-500 shrink-0" />{m}
                    </div>
                  ))}
                </div>
              )}

              {/* Dependencies */}
              {selectedFinding.dependencies && selectedFinding.dependencies.length > 0 && (
                <div className="bg-muted/50 border border-border rounded-lg p-3.5">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2.5 flex items-center gap-1.5">
                    <Link2 className="w-3 h-3" />Downstream Dependencies
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedFinding.dependencies.map(dep => (
                      <span
                        key={dep}
                        onClick={() => setSelectedNode(dep)}
                        className="text-[10px] font-mono bg-secondary border border-border px-2 py-1 rounded cursor-pointer hover:bg-primary/5 flex items-center gap-1 transition-colors"
                      >
                        {dep}<ArrowRight className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFinding.supportStatus === 'unresolved' && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-700 mb-1 text-xs font-semibold uppercase tracking-wide">Dependency Broken</strong>
                    This node's validity is unresolved due to upstream changes. Human review required before export.
                  </div>
                </div>
              )}
            </div>

            {/* Action footer */}
            <div className="p-4 border-t border-border bg-muted/20 space-y-2">
              {canChallenge && !challengeWithdrawn && (
                <Button
                  onClick={() => setChallengePhase('reviewing')}
                  variant="outline"
                  className="w-full border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold h-9 gap-2"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Challenge this relationship
                </Button>
              )}
              {challengeWithdrawn && selectedNode === 'f-3' && (
                <div className="text-center text-xs text-muted-foreground font-mono py-1">This node has been withdrawn.</div>
              )}
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs rounded-md transition-colors border border-border">
                  View in Analysis →
                </button>
                <button className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium text-xs rounded-md border border-amber-200 transition-colors">
                  Open Gap
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Challenge Review Panel ── */}
      <AnimatePresence>
        {challengePhase !== 'idle' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-[88px] right-0 bottom-0 w-[480px] bg-card border-l border-border shadow-2xl flex flex-col z-40"
          >
            {/* Challenge header */}
            <div className="p-4 border-b border-border bg-amber-50/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Challenge this relationship</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">f-3 · Excessive Unpaid Hours</p>
                </div>
              </div>
              <button onClick={handleCancelChallenge} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Scope notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-800 flex items-start gap-2">
                <Eye className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Challenging a relationship does not automatically withdraw it. Review the evidence below, then use "Preview Impact" before confirming.</span>
              </div>

              {/* Supporting evidence */}
              <section>
                <h4 className="text-[10px] font-mono text-teal-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-teal-100 pb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />Supporting Evidence
                </h4>
                <div className="bg-muted/50 border border-border rounded-lg p-3.5 text-xs font-mono text-foreground/80 border-l-2 border-l-teal-400">
                  "Shift extended by 6 hours, no overtime recorded."
                  <div className="mt-1.5 text-[10px] text-muted-foreground">Operational Task Log · p.1 · High quality · Verified</div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[9px] font-mono uppercase bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded">Documented in source</span>
                  <span className="text-[9px] font-mono uppercase bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">Source extraction</span>
                </div>
              </section>

              {/* Contrary evidence */}
              <section>
                <h4 className="text-[10px] font-mono text-red-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-red-100 pb-2">
                  <XCircle className="w-3.5 h-3.5" />Contrary Evidence
                </h4>
                <div className="space-y-2">
                  {CHALLENGE_CONTRARY.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              {/* Unverified assumptions */}
              <section>
                <h4 className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-amber-100 pb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />Unverified Assumptions
                </h4>
                <div className="space-y-2">
                  {CHALLENGE_ASSUMPTIONS.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              {/* What depends on it */}
              <section>
                <h4 className="text-[10px] font-mono text-purple-700 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-purple-100 pb-2">
                  <Link2 className="w-3.5 h-3.5" />What Depends on This
                </h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
                  <span className="font-mono text-xs font-semibold">f-9</span> — Alleged Conduct Timing vs. Control Period
                  <p className="text-xs text-purple-700 mt-1 leading-relaxed">This relationship provides the evidential basis that the alleged conduct occurred during a documented compelled-task period.</p>
                </div>
              </section>

              {/* Impact preview */}
              <AnimatePresence>
                {challengePhase === 'impact' && (
                  <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h4 className="text-[10px] font-mono text-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border pb-2">
                      <EyeOff className="w-3.5 h-3.5" />Impact Preview — if withdrawn
                    </h4>
                    <div className="space-y-2 mb-4">
                      {CHALLENGE_IMPACT.map(item => (
                        <div key={item.id} className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border text-xs",
                          item.severity === 'high' ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800"
                        )}>
                          <TriangleAlert className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", item.severity === 'high' ? 'text-red-500' : 'text-amber-500')} />
                          <div>
                            <span className="font-semibold">{item.label}</span>
                            <p className="mt-0.5 opacity-80">{item.change}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <div className="text-[10px] font-mono text-teal-700 uppercase mb-2">Unchanged</div>
                      {CHALLENGE_UNCHANGED.map(item => (
                        <div key={item} className="flex items-center gap-2 text-xs text-teal-700 mb-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />{item}
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700">
                      <strong className="block mb-1">Audit Trail</strong>
                      Withdrawal will be recorded with timestamp, actor, and downstream recalculation summary. This action cannot be silently reversed.
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            {/* Challenge action footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex flex-col gap-2 shrink-0">
              {challengePhase === 'reviewing' && (
                <Button
                  onClick={() => setChallengePhase('impact')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold h-9 text-sm gap-2"
                >
                  <EyeOff className="w-4 h-4" />Preview Impact
                </Button>
              )}
              {challengePhase === 'impact' && (
                <Button
                  onClick={handleConfirmWithdrawal}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-9 text-sm gap-2"
                >
                  <XCircle className="w-4 h-4" />Confirm Withdrawal
                </Button>
              )}
              <Button
                onClick={handleCancelChallenge}
                variant="outline"
                className="w-full h-9 text-sm"
              >
                Cancel — keep current state
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                This action will be recorded in the Audit Trail.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
