import React, { useState } from 'react';
import { MOCK_FINDINGS, Finding } from '@/data/mock-case';
import { ReviewStatusBadge, SupportStatusBadge } from '@/components/badges';
import { Maximize2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NODE_POSITIONS: Record<string, { x: number, y: number, group: string }> = {
  'root': { x: 500, y: 100, group: 'charge' },
  'f-2': { x: 200, y: 300, group: 'recruitment' },
  'f-1': { x: 400, y: 300, group: 'coercion' },
  'f-4': { x: 600, y: 300, group: 'coercion' },
  'f-5': { x: 500, y: 450, group: 'coercion' },
  'f-3': { x: 800, y: 300, group: 'task' },
  'f-6': { x: 300, y: 200, group: 'contradiction' },
  'f-7': { x: 800, y: 150, group: 'urgency' },
  'f-8': { x: 200, y: 450, group: 'gap' }
};

const EDGES = [
  { source: 'root', target: 'f-1', type: 'supports' },
  { source: 'root', target: 'f-3', type: 'supports' },
  { source: 'root', target: 'f-2', type: 'supports' },
  { source: 'f-1', target: 'f-5', type: 'dependency' },
  { source: 'f-1', target: 'f-6', type: 'contradicts' },
  { source: 'f-3', target: 'f-4', type: 'linked' },
  { source: 'root', target: 'f-7', type: 'modifier' }
];

export default function CaseNexus() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const renderEdge = (edge: typeof EDGES[0], i: number) => {
    const sPos = NODE_POSITIONS[edge.source];
    const tPos = NODE_POSITIONS[edge.target];
    if (!sPos || !tPos) return null;
    
    let stroke = "#CBD5E1"; // slate-300
    let strokeDasharray = "none";
    let strokeWidth = "1.5";
    
    if (edge.type === 'contradicts') {
      stroke = "#F87171"; // red-400
      strokeDasharray = "4,4";
    } else if (edge.type === 'dependency') {
      stroke = "#C084FC"; // purple-400
      strokeWidth = "1.5";
    } else if (edge.type === 'modifier') {
      stroke = "#FB923C"; // orange-400
      strokeDasharray = "2,4";
    }

    return (
      <line 
        key={`e-${i}`}
        x1={sPos.x} y1={sPos.y} 
        x2={tPos.x} y2={tPos.y} 
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        className="transition-all duration-300"
      />
    );
  };

  const getGroupColor = (group: string) => {
    switch(group) {
      case 'charge': return 'bg-slate-800 text-white border-slate-600 ring-4 ring-slate-400/20';
      case 'coercion': return 'bg-purple-100 border-purple-400 text-purple-900';
      case 'recruitment': return 'bg-blue-100 border-blue-400 text-blue-900';
      case 'task': return 'bg-amber-100 border-amber-400 text-amber-900';
      case 'contradiction': return 'bg-red-100 border-red-400 text-red-900';
      case 'urgency': return 'bg-orange-100 border-orange-400 text-orange-900';
      case 'gap': return 'bg-slate-50 border-slate-400 border-dashed text-slate-600';
      default: return 'bg-slate-100 border-slate-300 text-slate-700';
    }
  };

  const selectedFindingData = MOCK_FINDINGS.find(f => f.id === selectedNode);

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden relative">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 p-2 flex items-center justify-center text-xs font-mono text-amber-700 gap-2 shrink-0">
        <ShieldAlert className="w-4 h-4" />
        This is a visual relationship map of extracted evidence. It is not a trafficking determination or legal opinion.
      </div>

      {/* Legend */}
      <div className="absolute top-16 left-6 z-10 space-y-2 bg-card/95 backdrop-blur-md p-4 rounded-sm border border-border shadow-md pointer-events-none">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Nexus Legend</h3>
        <div className="space-y-2 text-xs text-foreground">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400" /> Recruitment</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-400" /> Coercion/Control</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400" /> Compelled Task</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-400" /> Contradiction</div>
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border"><div className="w-6 h-0.5 bg-slate-300" /> Supports</div>
          <div className="flex items-center gap-2"><div className="w-6 h-0.5" style={{background: '#C084FC'}} /> Dependency</div>
          <div className="flex items-center gap-2"><div className="w-6 border-t-2 border-dashed border-red-400" /> Contradicts</div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-muted/50 via-background to-background">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px'}} />
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {EDGES.map((edge, i) => renderEdge(edge, i))}
        </svg>

        {Object.entries(NODE_POSITIONS).map(([id, pos]) => {
          const finding = id === 'root' ? null : MOCK_FINDINGS.find(f => f.id === id);
          const isSelected = selectedNode === id;
          
          return (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              key={id}
              onClick={() => setSelectedNode(id)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-md border-2 p-3 cursor-pointer shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg",
                getGroupColor(pos.group),
                isSelected ? "ring-2 ring-primary shadow-xl z-20 scale-105" : "z-10",
                finding?.supportStatus === 'unresolved' && "animate-pulse ring-2 ring-amber-500"
              )}
              style={{ left: pos.x, top: pos.y, width: id === 'root' ? 240 : 200 }}
            >
              {id === 'root' ? (
                <div className="text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-white/70 mb-1">Target Analysis</div>
                  <div className="font-bold text-sm text-white">Labor Trafficking (18 U.S.C. § 1589) Indicators</div>
                </div>
              ) : finding ? (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono uppercase truncate w-32">{finding.type.replace('-', ' ')}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      finding.reviewStatus === 'accepted' ? 'bg-teal-600' : finding.reviewStatus === 'pending' ? 'bg-blue-600' : 'bg-slate-400'
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

      {/* Side Panel */}
      <AnimatePresence>
        {selectedNode && selectedNode !== 'root' && selectedFindingData && (
          <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-10 right-0 bottom-0 w-[400px] bg-card/98 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col z-30"
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="font-mono text-foreground font-medium">Node Details</h3>
              <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                <Maximize2 className="w-4 h-4 shrink-0" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ReviewStatusBadge status={selectedFindingData.reviewStatus} />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">{selectedFindingData.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{selectedFindingData.description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-muted-foreground uppercase">State Vectors</h4>
                <div className="bg-muted border border-border rounded-sm p-3 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-mono">Support:</span>
                    <SupportStatusBadge status={selectedFindingData.supportStatus} />
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-border/50 pt-3">
                    <span className="text-muted-foreground font-mono">Role in Nexus:</span>
                    <span className="text-xs px-2 py-0.5 rounded-sm uppercase tracking-wider bg-secondary text-secondary-foreground border border-border">
                      {NODE_POSITIONS[selectedNode].group} Node
                    </span>
                  </div>
                </div>
              </div>

              {selectedFindingData.supportStatus === 'unresolved' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm text-sm text-amber-900">
                  <strong className="block text-amber-700 mb-1">Dependency Broken</strong>
                  This node's validity is currently unresolved due to upstream changes. Review required.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-border bg-muted/30">
              <button className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm rounded-sm transition-colors border border-border">
                View Full Analysis &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
