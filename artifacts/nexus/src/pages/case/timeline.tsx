import React, { useState } from 'react';
import { MOCK_TIMELINE, TimelineEvent, Citation } from '@/data/mock-case';
import { EvidenceNatureBadge, SupportStatusBadge, ReviewStatusBadge } from '@/components/badges';
import { SourceDrawer } from '@/components/source-drawer';
import { Clock, AlertTriangle, FileText, Filter, Plus, HelpCircle, MessageSquare, CheckCircle2, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type FilterKey = 'all' | 'conflicting' | 'pending' | 'accepted' | 'approximate';

const DATE_TYPE_CONFIG = {
  exact:       { label: 'Exact date',       color: 'text-foreground',        indicator: '' },
  approximate: { label: 'Approximate date', color: 'text-muted-foreground italic', indicator: '~' },
  unknown:     { label: 'Date unknown',     color: 'text-muted-foreground/60', indicator: '?' },
};

export default function CaseTimeline() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCitation, setDrawerCitation] = useState<Citation | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const datedEvents = MOCK_TIMELINE.filter(e => e.dateType !== 'unknown').sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const undatedEvents = MOCK_TIMELINE.filter(e => e.dateType === 'unknown');

  const getFiltered = (events: TimelineEvent[]) => {
    switch (filter) {
      case 'conflicting': return events.filter(e => e.dateConflict);
      case 'pending':     return events.filter(e => e.reviewStatus === 'pending');
      case 'accepted':    return events.filter(e => e.reviewStatus === 'accepted');
      case 'approximate': return events.filter(e => e.dateType === 'approximate' || e.dateType === 'unknown');
      default: return events;
    }
  };

  const filteredDated = getFiltered(datedEvents);
  const filteredUndated = getFiltered(undatedEvents);
  const hiddenCount = MOCK_TIMELINE.length - (filteredDated.length + filteredUndated.length);
  const conflictCount = MOCK_TIMELINE.filter(e => e.dateConflict).length;

  const openDrawer = (citation: Citation) => {
    setDrawerCitation(citation);
    setDrawerOpen(true);
  };

  const FILTERS: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'all',         label: 'All Events',     count: MOCK_TIMELINE.length },
    { key: 'conflicting', label: 'Conflicts Only',  count: conflictCount },
    { key: 'pending',     label: 'Pending Review' },
    { key: 'accepted',    label: 'Accepted' },
    { key: 'approximate', label: 'Uncertain Dates' },
  ];

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/80 px-5 py-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Chronological Reconstruction
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {MOCK_TIMELINE.length} source-linked events · Approximate dates are marked — they are not exact
          </p>
        </div>
        <div className="flex items-center gap-2">
          {conflictCount > 0 && (
            <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-sm">
              {conflictCount} CONFLICT{conflictCount > 1 ? 'S' : ''}
            </span>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5">
            <Plus className="w-3 h-3" /> Add Event
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border-b border-border bg-muted/20 px-5 py-2 flex items-center gap-1.5 shrink-0">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-mono uppercase rounded border transition-colors flex items-center gap-1",
              filter === f.key
                ? f.key === 'conflicting'
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-primary text-primary-foreground border-primary"
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
        <span className="ml-auto text-[10px] font-mono text-muted-foreground flex items-center gap-1">
          <Filter className="w-3 h-3" />
          {hiddenCount > 0 ? `${hiddenCount} hidden by filter` : 'Showing all'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 relative">
        <div className="max-w-4xl mx-auto relative">
          {/* Timeline axis */}
          <div className="absolute left-8 md:left-[142px] top-0 bottom-0 w-1 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent -translate-x-[1.5px]" />

          {/* Uncertainty notice */}
          {filter !== 'conflicting' && (
            <div className="relative mb-8 flex items-start gap-8">
              <div className="hidden md:block w-32 shrink-0" />
              <div className="flex-1 bg-muted/60 border border-border/50 rounded-sm p-3 text-xs text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                Approximate (~) and unknown (?) dates are marked. Never treat an approximate date as exact. "Date unknown" is a valid and honest state.
              </div>
            </div>
          )}

          {/* Dated events */}
          <div className="space-y-10">
            {filteredDated.length === 0 && filter !== 'all' && filteredUndated.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">No events match this filter.</div>
            )}
            {filteredDated.map(event => (
              <TimelineNode
                key={event.id}
                event={event}
                isExpanded={expandedId === event.id}
                onToggle={() => setExpandedId(prev => prev === event.id ? null : event.id)}
                onViewSource={openDrawer}
              />
            ))}
          </div>

          {/* Undated events section */}
          {filteredUndated.length > 0 && (
            <div className="mt-16 relative">
              <div className="absolute left-8 md:left-32 -top-8 bottom-0 w-px border-l border-dashed border-border" />
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="hidden md:block w-32 text-right">
                  <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest bg-background py-1">Undated</span>
                </div>
                <div className="w-4 h-4 rounded-full bg-background border-2 border-border relative z-10 shrink-0 md:-translate-x-2" />
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest bg-background px-2">Events without confirmed dates</h3>
              </div>
              <div className="space-y-8">
                {filteredUndated.map(event => (
                  <TimelineNode
                    key={event.id}
                    event={event}
                    isExpanded={expandedId === event.id}
                    onToggle={() => setExpandedId(prev => prev === event.id ? null : event.id)}
                    onViewSource={openDrawer}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SourceDrawer
        open={drawerOpen}
        citation={drawerCitation}
        onClose={() => setDrawerOpen(false)}
        onReveal={() => setDrawerOpen(false)}
      />
    </div>
  );
}

function TimelineNode({
  event,
  isExpanded,
  onToggle,
  onViewSource,
}: {
  event: TimelineEvent;
  isExpanded: boolean;
  onToggle: () => void;
  onViewSource: (cit: Citation) => void;
}) {
  const hasConflict = event.dateConflict;
  const isApproximate = event.dateType === 'approximate';
  const isUnknown = event.dateType === 'unknown';
  const dateCfg = DATE_TYPE_CONFIG[event.dateType as keyof typeof DATE_TYPE_CONFIG]
    ?? { label: event.dateType, color: 'text-muted-foreground', indicator: '' };

  return (
    <div className="relative flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group">
      {/* Date column */}
      <div className="md:w-32 flex-shrink-0 md:text-right pt-1 pl-12 md:pl-0">
        {event.dateType !== 'unknown' ? (
          <div className={cn("font-mono text-sm", hasConflict ? "text-amber-600 font-semibold" : dateCfg.color)}>
            {isApproximate && <span className="mr-1 inline-block bg-amber-100 text-amber-800 rounded px-1 text-xs">~</span>}
            {event.date}
          </div>
        ) : (
          <div className="font-mono text-sm text-muted-foreground/50 italic flex items-center justify-end md:justify-end gap-1"><span className="inline-block bg-amber-100 text-amber-800 rounded px-1 text-xs not-italic">?</span> unknown</div>
        )}
        <div className="text-[9px] font-mono text-muted-foreground/50 mt-0.5 md:text-right">
          {dateCfg.label}
        </div>
      </div>

      {/* Axis marker */}
      <div className={cn(
        "absolute left-8 md:left-[142px] top-1.5 w-3 h-3 rounded-full border-2 z-10 bg-background transition-colors -translate-x-[5px] hover:ring-2 hover:ring-primary/30",
        hasConflict
          ? "border-amber-500 ring-4 ring-amber-500/20"
          : event.reviewStatus === 'accepted'
            ? "border-teal-500 bg-teal-100"
            : isUnknown
              ? "border-dashed border-muted-foreground/40"
              : "border-border group-hover:border-foreground/40"
      )} />
      
      {/* Faint horizontal line */}
      <div className="absolute left-8 md:left-[142px] top-[10px] w-4 md:w-8 h-px bg-border/40 z-0" />

      {/* Content card */}
      <div className={cn(
        "flex-1 bg-card border rounded-md ml-12 md:ml-8 transition-all shadow-sm z-10 relative",
        hasConflict ? "border-amber-300 bg-amber-50/20" : "border-border hover:border-foreground/20 hover:shadow-md"
      )}>
        {/* Card header */}
        <div className="p-4 cursor-pointer" onClick={onToggle}>
          <div className="flex justify-between items-start mb-3 gap-4">
            <p className="text-foreground leading-relaxed font-medium">{event.description}</p>
            <ReviewStatusBadge status={event.reviewStatus} className="shrink-0" />
          </div>

          {/* Conflict banner */}
          {hasConflict && (
            <div className="mb-3 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-sm p-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong className="block text-amber-700 mb-1">Date Conflict — Manual Verification Required</strong>
                Source documents disagree on the date of this event. Both sources are shown. The conflict cannot be resolved automatically.
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <EvidenceNatureBadge nature={event.evidenceNature} />
              <span className="text-border">·</span>
              <SupportStatusBadge status={event.supportStatus} />
            </div>
            <button
              onClick={e => { e.stopPropagation(); onViewSource(event.citation); }}
              className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {event.citation.sourceAuthority} · p.{event.citation.page}
            </button>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border p-4 bg-muted/20 space-y-4">
                {/* Citation text */}
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Source extract</div>
                  <div className="bg-card border border-border rounded-sm p-3 font-mono text-sm text-foreground/80 border-l-2 border-l-primary/40">
                    "{event.citation.text}"
                  </div>
                  {event.citation.limitations && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      {event.citation.limitations}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="text-xs h-7 border-border rounded-sm gap-1.5">
                    <HelpCircle className="w-3 h-3" />Create Evidence Gap
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7 border-border rounded-sm gap-1.5">
                    <MessageSquare className="w-3 h-3" />Add Practitioner Note
                  </Button>
                  {hasConflict && (
                    <Button size="sm" variant="outline" className="text-xs h-7 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-sm gap-1.5">
                      <GitCompare className="w-3 h-3" />Compare Conflicting Sources
                    </Button>
                  )}
                  {event.reviewStatus === 'pending' && (
                    <Button size="sm" className="text-xs h-7 bg-teal-600 hover:bg-teal-700 text-white rounded-sm gap-1.5">
                      <CheckCircle2 className="w-3 h-3" />Accept Event
                    </Button>
                  )}
                  {event.reviewStatus === 'accepted' && (
                    <Button size="sm" variant="outline" className="text-xs h-7 border-amber-200 text-amber-700 bg-amber-50 rounded-sm">
                      Withdraw Decision
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
