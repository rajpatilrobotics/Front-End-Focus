import React, { useState } from 'react';
import { MOCK_FINDINGS, MOCK_EVIDENCE_GAPS, Finding } from '@/data/mock-case';
import { ReviewStatusBadge, SupportStatusBadge } from '@/components/badges';
import { Maximize2, ShieldAlert, Filter, Table2, GitBranch, HelpCircle, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const NODE_POSITIONS: Record<string, { x: number; y: number; group: string }> = {
  root:  { x: 500, y: 90,  group: 'charge' },
  'f-2': { x: 200, y: 280, group: 'recruitment' },
  'f-1': { x: 400, y: 280, group: 'coercion' },
  'f-4': { x: 620, y: 280, group: 'coercion' },
  'f-5': { x: 510, y: 430, group: 'coercion' },
  'f-3': { x: 820, y: 280, group: 'task' },
  'f-6': { x: 300, y: 170, group: 'contradiction' },
  'f-7': { x: 820, y: 130, group: 'urgency' },
  'f-8': { x: 180, y: 430, group: 'gap' },
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
  supports:    { stroke: '#94a3b8', dash: 'none',  width: '1.5', label: 'Supports' },
  dependency:  { stroke: '#c084fc', dash: 'none',  width: '1.5', label: 'Depends on' },
  contradicts: { stroke: '#f87171', dash: '4,4',   width: '1.5', label: 'Conflicts with' },
  linked:      { stroke: '#94a3b8', dash: '2,4',   width: '1',   label: 'Linked' },
  modifier:    { stroke: '#fb923c', dash: '2,4',   width: '1',   label: 'Urgency modifier' },
};

type FilterGroup = 'all' | 'coercion' | 'recruitment' | 'task' | 'contradiction' | 'urgency' | 'gap';

const GROUP_COLORS: Record<string, string> = {
  charge:       'bg-slate-800 text-white border-slate-600 ring-4 ring-slate-400/20',
  coercion:     'bg-purple-100 border-purple-400 text-purple-900',
  recruitment:  'bg-blue-100 border-blue-400 text-blue-900',
  task:         'bg-amber-100 border-amber-400 text-amber-900',
  contradiction:'bg-red-100 border-red-400 text-red-900',
  urgency:      'bg-orange-100 border-orange-400 text-orange-900',
  gap:          'bg-slate-50 border-slate-400 border-dashed text-slate-600',
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

export default function CaseNexus() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterGroup>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');

  const selectedFinding = MOCK_FINDINGS.find(f => f.id === selectedNode);

  const isVisible = (id: string) => {
    if (activeFilter === 'all') return true;
    const pos = NODE_POSITIONS[id];
    if (!pos) return false;
    if (id === 'root') return true;
    return pos.group === activeFilter;
  };

  const renderEdge = (edge: typeof EDGES[0], i: number) => {
    const sPos = NODE_POSITIONS[edge.source];
    const tPos = NODE_POSITIONS[edge.target];
    if (!sPos || !tPos) return null;
    if (!isVisible(edge.source) || !isVisible(edge.target)) return null;
    const cfg = EDGE_TYPES[edge.type as keyof typeof EDGE_TYPES] || EDGE_TYPES.supports;
    return (
      <line
        key={`e-${i}`}
        x1={sPos.x} y1={sPos.y}
        x2={tPos.x} y2={tPos.y}
        stroke={cfg.stroke}
        strokeWidth={cfg.width}
        strokeDasharray={cfg.dash}
        className="transition-all duration-300"
      />
    );
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
            className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors", viewMode === 'graph' ? "bg-card border-border text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <GitBranch className="w-3.5 h-3.5" />Graph
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn("flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors", viewMode === 'table' ? "bg-card border-border text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <Table2 className="w-3.5 h-3.5" />Accessible Table
          </button>
        </div>
      </div>

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
          <div className="absolute top-28 left-4 z-10 bg-card/95 backdrop-blur-md p-4 rounded-sm border border-border shadow-md pointer-events-none">
            <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Legend</h3>
            <div className="space-y-1.5 text-[11px] text-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400" />Recruitment</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-400" />Coercion / Control</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400" />Compelled Task</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-400" />Contradiction</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-400" />Urgency</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-dashed border-slate-400" />Evidence Gap</div>
              <div className="mt-3 pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-300" />Supports</div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-purple-400" />Depends on</div>
                <div className="flex items-center gap-2"><div className="w-6 border-t-2 border-dashed border-red-400" />Conflicts with</div>
                <div className="flex items-center gap-2"><div className="w-6 border-t border-dashed border-orange-400" />Urgency modifier</div>
              </div>
            </div>
          </div>

          {/* Graph area */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-muted/50 via-background to-background">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {EDGES.map((edge, i) => renderEdge(edge, i))}
            </svg>

            {Object.entries(NODE_POSITIONS).map(([id, pos]) => {
              if (!isVisible(id)) return null;
              const finding = id === 'root' ? null : MOCK_FINDINGS.find(f => f.id === id);
              const isSelected = selectedNode === id;

              return (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  key={id}
                  onClick={() => setSelectedNode(isSelected ? null : id)}
                  className={cn(
                    'absolute -translate-x-1/2 -translate-y-1/2 rounded-md border-2 p-3 cursor-pointer shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg',
                    GROUP_COLORS[pos.group],
                    isSelected ? 'ring-2 ring-primary shadow-xl z-20 scale-105' : 'z-10',
                    finding?.supportStatus === 'unresolved' && 'animate-pulse ring-2 ring-amber-500'
                  )}
                  style={{ left: pos.x, top: pos.y, width: id === 'root' ? 240 : 196 }}
                >
                  {id === 'root' ? (
                    <div className="text-center">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-white/70 mb-1">Target Analysis</div>
                      <div className="font-bold text-sm text-white">Charge–Coercion Nexus</div>
                      <div className="text-[10px] text-white/60 mt-1">Relationship map only</div>
                    </div>
                  ) : finding ? (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono uppercase truncate w-32">{finding.type.replace(/-/g, ' ')}</span>
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          finding.reviewStatus === 'accepted' ? 'bg-teal-600'
                          : finding.reviewStatus === 'pending' ? 'bg-blue-500'
                          : finding.reviewStatus === 'invalidated' ? 'bg-red-500'
                          : 'bg-slate-400'
                        )} />
                      </div>
                      <div className="font-medium text-sm leading-tight line-clamp-2">{finding.title}</div>
                      {finding.supportStatus === 'unresolved' && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">!</div>
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
            <div className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">ID</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Finding</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Review Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Support</th>
                    <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Dependencies</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_FINDINGS.filter(f => activeFilter === 'all' || NODE_POSITIONS[f.id]?.group === activeFilter).map((f, i) => (
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
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">{f.type.replace(/-/g, ' ')}</span>
                      </td>
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

            {/* Evidence gaps table */}
            <div className="mt-6">
              <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Evidence Gaps in Nexus</h3>
              <div className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Gap ID</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Question</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Evidence Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 text-[10px] font-mono uppercase text-muted-foreground">Related Findings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_EVIDENCE_GAPS.map((g, i) => (
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
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {g.relatedFindingIds.map(id => (
                              <span key={id} className="text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded">{id}</span>
                            ))}
                          </div>
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

      {/* Node detail side panel */}
      <AnimatePresence>
        {selectedNode && selectedNode !== 'root' && selectedFinding && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-[88px] right-0 bottom-0 w-[400px] bg-card/98 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col z-30"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="font-mono text-foreground font-medium text-sm">Node Details</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{selectedFinding.id}</span>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <ReviewStatusBadge status={selectedFinding.reviewStatus} />
                  <span className={cn(
                    "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border",
                    NODE_POSITIONS[selectedNode]?.group === 'coercion' ? "bg-purple-50 text-purple-700 border-purple-200"
                    : NODE_POSITIONS[selectedNode]?.group === 'contradiction' ? "bg-red-50 text-red-700 border-red-200"
                    : NODE_POSITIONS[selectedNode]?.group === 'urgency' ? "bg-orange-50 text-orange-700 border-orange-200"
                    : "bg-muted text-muted-foreground border-border"
                  )}>
                    {NODE_POSITIONS[selectedNode]?.group} node
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">{selectedFinding.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedFinding.description}</p>
              </div>

              <div className="bg-muted border border-border rounded-sm p-3 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-mono text-xs">Support:</span>
                  <SupportStatusBadge status={selectedFinding.supportStatus} />
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-3">
                  <span className="text-muted-foreground font-mono text-xs">Origin:</span>
                  <span className="text-xs font-mono text-foreground capitalize">{selectedFinding.origin.replace(/-/g, ' ')}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border/50 pt-3">
                  <span className="text-muted-foreground font-mono text-xs">Evidence nature:</span>
                  <span className="text-xs font-mono text-foreground capitalize">{selectedFinding.evidenceNature.replace(/-/g, ' ')}</span>
                </div>
              </div>

              {/* Citations */}
              {selectedFinding.citations.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Source Citations</div>
                  {selectedFinding.citations.map((cit, i) => (
                    <div key={i} className="bg-muted border border-border rounded-sm p-3 text-xs font-mono text-muted-foreground border-l-2 border-l-primary/40">
                      "{cit.text}"
                      <div className="mt-1 text-[10px] text-muted-foreground/70">{cit.sourceAuthority} · p.{cit.page}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFinding.supportStatus === 'unresolved' && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm text-sm text-amber-800">
                  <strong className="block text-amber-700 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />Dependency Broken</strong>
                  This node's validity is unresolved due to upstream changes. Review required before export.
                </div>
              )}

              {selectedFinding.dependencies && selectedFinding.dependencies.length > 0 && (
                <div className="bg-muted border border-border rounded-sm p-3">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Downstream Dependencies</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedFinding.dependencies.map(dep => (
                      <span
                        key={dep}
                        onClick={() => setSelectedNode(dep)}
                        className="text-[10px] font-mono bg-secondary border border-border px-2 py-1 rounded cursor-pointer hover:bg-primary/5 flex items-center gap-1"
                      >
                        {dep}<ArrowRight className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Withdrawal warning */}
              <div className="border border-dashed border-border rounded-sm p-3 text-xs text-muted-foreground">
                Withdrawing this node will warn you about all downstream dependencies and reopen them for review. Export gate will be blocked until resolution is complete.
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex gap-2">
              <button className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium text-xs rounded-sm transition-colors border border-border">
                View in Analysis →
              </button>
              <button className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium text-xs rounded-sm border border-amber-200 transition-colors">
                Open Gap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
