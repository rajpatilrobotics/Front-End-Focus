import React, { useState } from 'react';
import { MOCK_TIMELINE, TimelineEvent } from '@/data/mock-case';
import { EvidenceNatureBadge, SupportStatusBadge, ReviewStatusBadge } from '@/components/badges';
import { Clock, Calendar, AlertTriangle, FileText, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function CaseTimeline() {
  const [filter, setFilter] = useState<'all' | 'conflicting' | 'pending'>('all');
  
  const datedEvents = MOCK_TIMELINE.filter(e => e.dateType !== 'unknown').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const undatedEvents = MOCK_TIMELINE.filter(e => e.dateType === 'unknown');

  const getFilteredEvents = (events: TimelineEvent[]) => {
    if (filter === 'conflicting') return events.filter(e => e.dateConflict);
    if (filter === 'pending') return events.filter(e => e.reviewStatus === 'pending');
    return events;
  };

  const filteredDated = getFilteredEvents(datedEvents);
  const filteredUndated = getFilteredEvents(undatedEvents);
  const hiddenCount = MOCK_TIMELINE.length - (filteredDated.length + filteredUndated.length);

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header & Filters */}
      <div className="border-b border-border bg-card/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-400" />
            Chronological Reconstruction
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Timeline generated from {MOCK_TIMELINE.length} extracted events.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-md border border-zinc-800">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilter('all')}
            className={cn("h-8 text-xs rounded-sm", filter === 'all' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200")}
          >
            All Events
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilter('conflicting')} 
            className={cn("h-8 text-xs rounded-sm", filter === 'conflicting' ? "bg-amber-950/50 text-amber-500 border-amber-900/50" : "text-zinc-400 hover:text-zinc-200")}
          >
            Conflicts Only
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setFilter('pending')} 
            className={cn("h-8 text-xs rounded-sm", filter === 'pending' ? "bg-blue-950/50 text-blue-400 border-blue-900/50" : "text-zinc-400 hover:text-zinc-200")}
          >
            Pending Review
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        {hiddenCount > 0 && (
          <div className="max-w-4xl mx-auto mb-8 bg-zinc-900/50 border border-zinc-800 rounded-sm p-3 text-center text-sm font-mono text-zinc-500">
            <Filter className="w-4 h-4 inline-block mr-2" />
            {hiddenCount} events hidden by active filters
          </div>
        )}

        <div className="max-w-4xl mx-auto relative">
          {/* Main timeline axis */}
          <div className="absolute left-8 md:left-32 top-0 bottom-0 w-px bg-zinc-800" />

          {/* Dated Events */}
          <div className="space-y-12">
            {filteredDated.map((event, i) => (
              <TimelineNode key={event.id} event={event} />
            ))}
          </div>

          {/* Undated Events Section */}
          {filteredUndated.length > 0 && (
            <div className="mt-20 relative">
              <div className="absolute left-8 md:left-32 -top-10 bottom-0 w-px border-l border-dashed border-zinc-700 bg-transparent" />
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="hidden md:block w-32 text-right">
                  <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest bg-background py-1">Undated</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-700 relative z-10 -ml-[9px] md:ml-0 md:-translate-x-2 shrink-0" />
                <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest bg-background px-2">Events without exact dates</h3>
              </div>
              
              <div className="space-y-8">
                {filteredUndated.map((event) => (
                  <TimelineNode key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineNode({ event }: { event: TimelineEvent }) {
  const isApproximate = event.dateType === 'approximate';
  const hasConflict = event.dateConflict;
  
  return (
    <div className="relative flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group">
      {/* Date Column (Left) */}
      <div className="md:w-32 flex-shrink-0 md:text-right pt-1 pl-12 md:pl-0">
        {event.dateType !== 'unknown' ? (
          <div className={cn(
            "font-mono text-sm inline-block",
            hasConflict ? "text-amber-500" : isApproximate ? "text-zinc-400 italic" : "text-zinc-200"
          )}>
            {isApproximate && "~ "}{event.date}
          </div>
        ) : null}
      </div>

      {/* Axis Marker */}
      <div className={cn(
        "absolute left-8 md:left-[136px] top-1.5 w-3 h-3 rounded-full border-2 z-10 bg-background transition-colors",
        hasConflict 
          ? "border-amber-500 ring-4 ring-amber-500/20" 
          : event.reviewStatus === 'accepted' 
            ? "border-teal-500 bg-teal-500/20" 
            : "border-zinc-500 group-hover:border-zinc-300"
      )} />

      {/* Content Card (Right) */}
      <div className={cn(
        "flex-1 bg-card border rounded-md p-4 ml-12 md:ml-0 transition-all",
        hasConflict ? "border-amber-900/50 shadow-[0_0_15px_rgba(245,158,11,0.05)]" : "border-border hover:border-zinc-600"
      )}>
        <div className="flex justify-between items-start mb-3 gap-4">
          <p className="text-zinc-200 leading-relaxed font-medium">
            {event.description}
          </p>
          <ReviewStatusBadge status={event.reviewStatus} className="shrink-0" />
        </div>

        {hasConflict && (
          <div className="my-4 bg-amber-950/20 border border-amber-900/30 rounded-sm p-3 text-sm text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-500 mb-1">Date Conflict Detected</strong>
              Source documents disagree on this timeline position. Manual verification required.
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <EvidenceNatureBadge nature={event.evidenceNature} />
            <span className="text-zinc-700">&bull;</span>
            <SupportStatusBadge status={event.supportStatus} />
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-xs font-mono text-zinc-400 group-hover:text-zinc-300 group-hover:border-zinc-600 transition-colors cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            Doc {event.citation.documentId}, p.{event.citation.page}
          </div>
        </div>
      </div>
    </div>
  );
}