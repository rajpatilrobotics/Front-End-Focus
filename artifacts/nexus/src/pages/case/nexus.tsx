import React, { useState } from 'react';
import { MOCK_FINDINGS, Finding } from '@/data/mock-case';
import { ReviewStatusBadge, SupportStatusBadge } from '@/components/badges';
import { AlertCircle, Maximize2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock coordinates for nodes in the nexus graph
const NODE_POSITIONS: Record<string, { x: number, y: number, group: string }> = {
  'root': { x: 500, y: 100, group: 'charge' },
  
  // Recruitment indicators (left)
  'f-2': { x: 200, y: 300, group: 'recruitment' },
  
  // Coercion/Control indicators (middle)
  'f-1': { x: 400, y: 300, group: 'coercion' },
  'f-4': { x: 600, y: 300, group: 'coercion' },
  'f-5': { x: 500, y: 450, group: 'coercion' },
  
  // Compelled tasks (right)
  'f-3': { x: 800, y: 300, group: 'task' },
  
  // Modifiers
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
  
  // Render an SVG edge
  const renderEdge = (edge: typeof EDGES[0], i: number) => {
    const sPos = NODE_POSITIONS[edge.source];
    const tPos = NODE_POSITIONS[edge.target];
    if (!sPos || !tPos) return null;
    
    // Path calculation
    const dx = tPos.x - sPos.x;
    const dy = tPos.y - sPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Simple line for now
    let strokeColor = "stroke-zinc-700";
    let strokeDasharray = "none";
    let strokeWidth = "2";
    
    if (edge.type === 'contradicts') {
      strokeColor = "stroke-red-500/50";
      strokeDasharray = "4,4";
    } else if (edge.type === 'dependency') {
      strokeColor = "stroke-purple-500/50";
      strokeWidth = "1.5";
    } else if (edge.type === 'modifier') {
      strokeColor = "stroke-orange-500/50";
      strokeDasharray = "2,4";
    }

    return (
      <line 
        key={`e-${i}`}
        x1={sPos.x} y1={sPos.y} 
        x2={tPos.x} y2={tPos.y} 
        className={cn(strokeColor, "transition-all duration-300")}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
    );
  };

  const getGroupColor = (group: string) => {
    switch(group) {
      case 'charge': return 'bg-zinc-100 text-zinc-900 border-white ring-4 ring-white/20';
      case 'coercion': return 'bg-purple-950 border-purple-500 text-purple-200';
      case 'recruitment': return 'bg-blue-950 border-blue-500 text-blue-200';
      case 'task': return 'bg-amber-950 border-amber-500 text-amber-200';
      case 'contradiction': return 'bg-red-950 border-red-500 text-red-200';
      case 'urgency': return 'bg-orange-950 border-orange-500 text-orange-200';
      case 'gap': return 'bg-zinc-900 border-zinc-600 border-dashed text-zinc-400';
      default: return 'bg-zinc-800 border-zinc-600 text-zinc-300';
    }
  };

  const selectedFindingData = MOCK_FINDINGS.find(f => f.id === selectedNode);

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden relative">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-900/50 p-2 flex items-center justify-center text-xs font-mono text-amber-500 gap-2 shrink-0">
        <ShieldAlert className="w-4 h-4" />
        This is a visual relationship map of extracted evidence. It is not a trafficking determination or legal opinion.
      </div>

      <div className="absolute top-16 left-6 z-10 space-y-2 bg-zinc-950/80 backdrop-blur-md p-4 rounded-sm border border-zinc-800 shadow-xl pointer-events-none">
        <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Nexus Legend</h3>
        <div className="space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-950 border border-blue-500" /> Recruitment</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-950 border border-purple-500" /> Coercion/Control</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-950 border border-amber-500" /> Compelled Task</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-950 border border-red-500" /> Contradiction</div>
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-zinc-800"><div className="w-6 h-0.5 bg-zinc-700" /> Supports</div>
          <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-purple-500/50" /> Dependency</div>
          <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed border-red-500/50" /> Contradicts</div>
        </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-background to-background">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {EDGES.map((edge, i) => renderEdge(edge, i))}
        </svg>

        {/* Nodes */}
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
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-md border-2 p-3 cursor-pointer shadow-lg transition-all duration-200 hover:scale-105",
                getGroupColor(pos.group),
                isSelected ? "ring-2 ring-white/50 shadow-white/10 shadow-2xl z-20" : "z-10 opacity-90",
                finding?.supportStatus === 'unresolved' && "animate-pulse ring-2 ring-amber-500"
              )}
              style={{ left: pos.x, top: pos.y, width: id === 'root' ? 240 : 200 }}
            >
              {id === 'root' ? (
                <div className="text-center">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Target Analysis</div>
                  <div className="font-bold text-sm">Labor Trafficking (18 U.S.C. § 1589) Indicators</div>
                </div>
              ) : finding ? (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono uppercase truncate w-32">{finding.type.replace('-', ' ')}</span>
                    <div className={cn("w-2 h-2 rounded-full", finding.reviewStatus === 'accepted' ? 'bg-teal-400' : finding.reviewStatus === 'pending' ? 'bg-blue-400' : 'bg-zinc-500')} />
                  </div>
                  <div className="font-medium text-sm leading-tight line-clamp-2">{finding.title}</div>
                  
                  {finding.supportStatus === 'unresolved' && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-black rounded-full flex items-center justify-center text-xs font-bold shadow-md">!</div>
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
            className="absolute top-16 right-0 bottom-0 w-[400px] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl flex flex-col z-30"
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h3 className="font-mono text-zinc-300">Node Details</h3>
              <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white p-1">
                <Maximize2 className="w-4 h-4 shrink-0" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ReviewStatusBadge status={selectedFindingData.reviewStatus} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedFindingData.title}</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">{selectedFindingData.description}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono text-zinc-500 uppercase">State Vectors</h4>
                <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-3 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-mono">Support:</span>
                    <SupportStatusBadge status={selectedFindingData.supportStatus} />
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-zinc-800/50 pt-3">
                    <span className="text-zinc-500 font-mono">Role in Nexus:</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-sm uppercase tracking-wider",
                      getGroupColor(NODE_POSITIONS[selectedNode].group).split(' ')[1] // Extract text color class
                    )}>{NODE_POSITIONS[selectedNode].group} Node</span>
                  </div>
                </div>
              </div>

              {selectedFindingData.supportStatus === 'unresolved' && (
                <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-sm text-sm text-amber-200">
                  <strong className="block text-amber-400 mb-1">Dependency Broken</strong>
                  This node's validity is currently unresolved due to upstream changes. Review required.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-black">
              <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm rounded-sm transition-colors border border-zinc-700">
                View Full Analysis &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}