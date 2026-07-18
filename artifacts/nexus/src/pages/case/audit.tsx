import React, { useState } from 'react';
import { MOCK_AUDIT, AuditEvent } from '@/data/mock-case';
import { History, Shield, BrainCircuit, User, Eye, Lock, FileText, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CaseAudit() {
  const [filter, setFilter] = useState<string>('all');
  
  const sortedEvents = [...MOCK_AUDIT].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const filteredEvents = filter === 'all' 
    ? sortedEvents 
    : sortedEvents.filter(e => e.actor === filter || e.type.includes(filter));

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'analysis-run': return BrainCircuit;
      case 'evidence-accepted': return CheckCircle2;
      case 'sensitive-reveal': return Eye;
      case 'evidence-withdrawn': return AlertTriangle;
      case 'export-evaluated': return Shield;
      case 'handoff-created': return Download;
      default: return FileText;
    }
  };

  const getEventColor = (type: string) => {
    if (type.includes('accept')) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (type.includes('withdraw') || type.includes('reject')) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (type.includes('reveal')) return 'text-red-700 bg-red-50 border-red-200';
    if (type === 'analysis-run') return 'text-purple-700 bg-purple-50 border-purple-200';
    return 'text-muted-foreground bg-muted border-border';
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            Immutable Audit Trail
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Append-only log of all decisions, reveals, and system actions.</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-muted border border-border text-sm rounded-sm px-3 py-1.5 text-foreground focus:outline-none focus:border-foreground/30 font-mono"
          >
            <option value="all">ALL EVENTS</option>
            <option value="practitioner">HUMAN ACTIONS ONLY</option>
            <option value="system">SYSTEM ACTIONS ONLY</option>
            <option value="reveal">SENSITIVE REVEALS</option>
          </select>
          <Button variant="outline" size="sm" className="bg-card border-border text-foreground hover:bg-muted">
            Export Log (.csv)
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 mb-8 flex items-start gap-3 text-sm text-amber-700">
            <Lock className="w-5 h-5 shrink-0" />
            <p>
              This trail is cryptographically sealed. Raw sensitive data is never logged here. 
              Only reference IDs and safe summaries are recorded for accountability.
            </p>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);
              
              return (
                <div key={event.id} className="bg-card border border-border p-4 rounded-sm flex gap-4 hover:bg-muted/30 transition-colors shadow-sm">
                  <div className={cn("p-2 rounded-sm border shrink-0 h-fit", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          {event.type.replace('-', ' ')}
                        </span>
                        <span className="text-border">&bull;</span>
                        <span className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded uppercase",
                          event.actor === 'system' ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                        )}>
                          {event.actor === 'system' ? <BrainCircuit className="w-3 h-3 inline mr-1" /> : <User className="w-3 h-3 inline mr-1" />}
                          {event.actor}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground/80 mt-2 font-mono leading-relaxed">
                      {event.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-mono">
              No audit events found matching current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
