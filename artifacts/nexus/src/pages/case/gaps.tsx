import React, { useState } from 'react';
import { MOCK_EVIDENCE_GAPS, EvidenceGap, GapStatus } from '@/data/mock-case';
import {
  AlertTriangle, HelpCircle, CheckCircle2, Clock, Plus, ArrowRight,
  FileText, ChevronRight, XCircle, RotateCcw, User, MessageSquare,
  ClipboardList, Archive, ShieldAlert, GitBranch, Link2, Mail,
  CircleDot, ChevronDown, ChevronUp, Info, BookOpen, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

// ── Status / priority config (preserved exactly) ──────────────────────────────

const GAP_STATUS_CONFIG: Record<GapStatus, { label: string; color: string; dot: string }> = {
  'open':               { label: 'Open',               color: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-500' },
  'investigating':      { label: 'Investigating',       color: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  'waiting-external':   { label: 'Waiting — External',  color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  'partially-resolved': { label: 'Partially Resolved',  color: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-400' },
  'resolved':           { label: 'Resolved',            color: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-600' },
  'unable-to-resolve':  { label: 'Preserved — Unknown', color: 'bg-slate-50 text-slate-600 border-slate-200',   dot: 'bg-slate-400' },
  'outside-scope':      { label: 'Outside Scope',       color: 'bg-muted text-muted-foreground border-border',  dot: 'bg-muted-foreground' },
};

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50 border-red-200' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const EVIDENCE_STATUS_CONFIG = {
  missing:      { label: 'Missing',      color: 'text-red-700 bg-red-50 border-red-200' },
  conflicting:  { label: 'Conflicting',  color: 'text-amber-700 bg-amber-50 border-amber-200' },
  insufficient: { label: 'Insufficient', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

// ── Static supplemental data (not in mock-case.ts) ───────────────────────────

type GapSupplement = {
  relatedTimeline?: { id: string; label: string; dateType?: string };
  creatingDependency: string;
  exportEffect: { severity: 'blocks' | 'limits' | 'note'; text: string };
  relatedNexus: { id: string; label: string }[];
  relatedSource: { id: string; name: string; pages: string }[];
};

const GAP_SUPPLEMENTS: Record<string, GapSupplement> = {
  'eg-1': {
    relatedTimeline: { id: 't-2', label: 'Arrived in destination country — date conflict', dateType: 'exact' },
    creatingDependency: 'f-6 (Arrival Date Discrepancy) · conflicting status prevents timeline completion',
    exportEffect: { severity: 'blocks', text: 'Non-punishment timeline incomplete — export gate blocked until date conflict resolved' },
    relatedNexus: [
      { id: 'f-6', label: 'Arrival Date Discrepancy' },
      { id: 'f-1', label: 'Passport Retention' },
    ],
    relatedSource: [
      { id: 'd-1', name: 'Employment Offer Letter', pages: 'p.1' },
      { id: 'd-3', name: 'Border Entry Stamp', pages: 'p.1' },
    ],
  },
  'eg-2': {
    relatedTimeline: { id: 't-3', label: 'Passport confiscated upon arrival', dateType: 'approximate' },
    creatingDependency: 'f-1 (Passport Retention) · insufficient corroboration — single-source only',
    exportEffect: { severity: 'blocks', text: 'f-1 dependency chain unresolved — export blocked pending corroboration of f-5' },
    relatedNexus: [
      { id: 'f-1', label: 'Passport Retention' },
      { id: 'f-5', label: 'Isolation from Support Networks' },
    ],
    relatedSource: [
      { id: 'd-2', name: 'Recruiter Communication Log', pages: 'p.5' },
      { id: 'd-5', name: 'Support Provider Notes', pages: 'p.2' },
    ],
  },
  'eg-3': {
    relatedTimeline: { id: 't-1', label: 'Employment contract signed in home country', dateType: 'exact' },
    creatingDependency: 'f-2 (Recruitment Fee Debt) · partially supported only — wage records entirely absent',
    exportEffect: { severity: 'limits', text: 'Wage verification absent — limitation note required in handoff package' },
    relatedNexus: [
      { id: 'f-2', label: 'Recruitment Fee Debt' },
      { id: 'f-8', label: 'Missing Payment Records' },
    ],
    relatedSource: [
      { id: 'd-7', name: 'Wage Deduction Records', pages: 'all pages · image-only, extraction failed' },
    ],
  },
  'eg-4': {
    creatingDependency: 'f-10 (Imminent Hearing — No Interpreter Confirmed) · procedural urgency unresolved',
    exportEffect: { severity: 'note', text: 'Procedural urgency noted — does not directly block export, but requires resolution before handoff' },
    relatedNexus: [
      { id: 'f-7', label: 'Imminent Housing Loss' },
    ],
    relatedSource: [
      { id: 'd-5', name: 'Support Provider Notes', pages: 'p.4' },
    ],
  },
  'eg-5': {
    relatedTimeline: { id: 't-6', label: 'Shift extensions recorded Jan–Feb 2024', dateType: 'range' },
    creatingDependency: 'f-3 (Excessive Unpaid Hours) · pages 2–3 of source document unreadable — compelled-task record incomplete',
    exportEffect: { severity: 'blocks', text: 'f-3 → f-9 (Alleged Conduct Timing) dependency chain unresolved — one of four active export blockers' },
    relatedNexus: [
      { id: 'f-3', label: 'Excessive Unpaid Hours' },
      { id: 'f-9', label: 'Alleged Conduct Timing' },
    ],
    relatedSource: [
      { id: 'd-4', name: 'Operational Task Log', pages: 'p.1 only · pp.2–3 image-only, extraction failed' },
    ],
  },
};

// ── Synthetic eg-5 gap (operational-task challenge scenario, hardcoded here) ──

const EG5: EvidenceGap = {
  id: 'eg-5',
  title: 'Operational task log pages 2–3 not extractable — shift record incomplete',
  whyMatters: 'The Excessive Unpaid Hours relationship (f-3) is supported by a single extractable page of a supervisor log. Pages 2–3 contain additional shift entries for Jan–Feb 2024 and could not be extracted because the document is image-only on those pages. The compelled-task record is therefore incomplete. Absence of these pages does not confirm or deny the underlying claim.',
  relatedFindingIds: ['f-3', 'f-9'],
  sourceDocumentIds: ['d-4'],
  evidenceStatus: 'insufficient',
  consequence: 'f-3 (Excessive Unpaid Hours) remains partially supported. The challenged relationship cannot be fully corroborated from its own source document. f-9 (Alleged Conduct Timing) dependency chain remains unresolved until f-3 is strengthened or this gap is formally preserved.',
  suggestedActions: [
    { id: 'eg5-a1', label: 'Request a complete or re-scanned copy of the Operational Task Log (d-4) from employer or legal hold custodian.' },
    { id: 'eg5-a2', label: 'Ask subject in follow-up interview whether they retain any personal record of shift hours worked Jan–Feb 2024.' },
    { id: 'eg5-a3', label: 'Create document request to custodian for payroll-system export or time-tracking record covering the same period.' },
  ],
  responsiblePerson: 'M. Chen',
  priority: 'high',
  status: 'open',
  dueDate: '2024-04-10',
  practitionerNotes: 'Source document partially unreadable. Do not assume the missing pages are exculpatory or inculpatory — this gap records a formal extraction failure only. The gap was auto-generated when document processing detected image-only pages in d-4.',
  auditHistory: [
    { timestamp: '2024-03-24T10:15:00Z', actor: 'System', action: 'Gap auto-generated: extraction failure on d-4 pp.2–3 detected during document processing.' },
    { timestamp: '2024-03-24T11:00:00Z', actor: 'M. Chen', action: 'Reviewed gap. Marked Open. Challenge scenario for f-3 noted in practitioner notes.' },
  ],
};

// Prepend eg-5 so it appears first and is pre-selected
const ALL_GAPS: EvidenceGap[] = [EG5, ...MOCK_EVIDENCE_GAPS];

// ── Filter config ─────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'open' | 'investigating' | 'high' | 'export-blocker';
type ResolveModal = { open: boolean; gapId: string; reason: string; evidence: string };

// ── Action button (visual-only, disabled) ─────────────────────────────────────

function ActionButton({
  icon: Icon,
  label,
  color = 'default',
}: {
  icon: React.ElementType;
  label: string;
  color?: 'default' | 'blue' | 'amber' | 'slate';
}) {
  const styles = {
    default: 'bg-muted border-border text-muted-foreground',
    blue:    'bg-blue-50 border-blue-200 text-blue-600',
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
    slate:   'bg-slate-50 border-slate-200 text-slate-600',
  };
  return (
    <button
      disabled
      className={cn(
        'flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1.5 rounded border cursor-not-allowed opacity-70 whitespace-nowrap',
        styles[color],
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
      <span className="ml-1 text-[8px] bg-white/60 border border-current/20 px-1 py-px rounded opacity-80">
        UI PREVIEW
      </span>
    </button>
  );
}

// ── Export effect badge ───────────────────────────────────────────────────────

function ExportEffectBadge({ severity, text }: { severity: 'blocks' | 'limits' | 'note'; text: string }) {
  const cfg = {
    blocks: { bg: 'bg-red-50 border-red-200 text-red-800', icon: ShieldAlert, iconColor: 'text-red-500', label: 'BLOCKS EXPORT' },
    limits: { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500', label: 'LIMITS EXPORT' },
    note:   { bg: 'bg-slate-50 border-slate-200 text-slate-700', icon: Info, iconColor: 'text-slate-400', label: 'EXPORT NOTE' },
  }[severity];
  const Icon = cfg.icon;
  return (
    <div className={cn('flex items-start gap-2.5 p-3 rounded-md border text-xs shadow-sm', cfg.bg)}>
      <Icon className={cn('w-3.5 h-3.5 shrink-0 mt-0.5', cfg.iconColor)} />
      <div>
        <span className={cn('font-mono text-[9px] uppercase tracking-widest mr-2', cfg.iconColor)}>{cfg.label}</span>
        {text}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseGaps() {
  const [gaps, setGaps] = useState<EvidenceGap[]>(ALL_GAPS);
  const [selectedId, setSelectedId] = useState<string>('eg-5');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [convertedActions, setConvertedActions] = useState<Set<string>>(new Set(['sa-1']));
  const [questionActions, setQuestionActions] = useState<Set<string>>(new Set());
  const [preservedGaps, setPreservedGaps] = useState<Set<string>>(new Set());
  const [resolveModal, setResolveModal] = useState<ResolveModal>({ open: false, gapId: '', reason: '', evidence: '' });
  const [actionsExpanded, setActionsExpanded] = useState(true);

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
  const preservedCount = gaps.filter(g => g.status === 'unable-to-resolve' || preservedGaps.has(g.id)).length;
  const reviewNeededCount = gaps.filter(g => g.priority === 'high' && (g.status === 'open' || g.status === 'investigating')).length;

  // Preserved existing handlers
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
    { key: 'all',           label: 'All',            count: gaps.length },
    { key: 'open',          label: 'Open' },
    { key: 'investigating', label: 'Investigating' },
    { key: 'high',          label: 'High Priority' },
    { key: 'export-blocker',label: 'Export Blockers', count: openCount },
  ];

  const supplement = selected ? GAP_SUPPLEMENTS[selected.id] : null;

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">

      {/* ── Page header ── */}
      <div className="bg-card border-b border-border px-5 py-3.5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <h2 className="font-bold text-foreground text-sm">Evidence Gaps</h2>
              {openCount > 0 && (
                <span className="text-[9px] font-mono bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded">
                  {openCount} UNRESOLVED
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
              Gaps are recorded absences, conflicts, or insufficiencies in the evidence base. They do not imply a conclusion. Absence of evidence is not negative evidence — gaps may be formally preserved as unknown.
            </p>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5 shrink-0 mt-0.5" disabled>
            <Plus className="w-3 h-3" /> Add Gap
            <span className="text-[8px] font-mono border border-current/20 px-1 py-px rounded opacity-60 ml-0.5">UI PREVIEW</span>
          </Button>
        </div>

        {/* Summary row */}
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-red-700 leading-none">{openCount}</div>
              <div className="text-[9px] font-mono text-red-500 uppercase tracking-wide">Open / Active</div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Archive className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-600 leading-none">{preservedCount}</div>
              <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Preserved Unknown</div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-700 leading-none">{reviewNeededCount}</div>
              <div className="text-[9px] font-mono text-amber-500 uppercase tracking-wide">Review Needed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="border-b border-border bg-muted/30 px-5 py-2 flex items-center gap-1.5 shrink-0">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-mono uppercase rounded border transition-colors flex items-center gap-1',
              filter === f.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20',
            )}
          >
            {f.label}
            {f.count !== undefined && (
              <span className={cn('text-[9px] px-1 rounded', filter === f.key ? 'bg-white/20' : 'bg-muted')}>
                {f.count}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[9px] font-mono text-muted-foreground/60 italic">Missing evidence is not negative evidence</span>
      </div>

      {/* ── Main panels ── */}
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">

        {/* Left — gap list */}
        <Panel defaultSize={38} minSize={28} className="flex flex-col border-r border-border bg-muted/10 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">No gaps match this filter.</div>
            )}
            {filtered.map(gap => {
              const statusCfg = GAP_STATUS_CONFIG[gap.status];
              const priorityCfg = PRIORITY_CONFIG[gap.priority];
              const isSelected = selectedId === gap.id;
              const sup = GAP_SUPPLEMENTS[gap.id];
              return (
                <motion.div
                  layout key={gap.id}
                  onClick={() => setSelectedId(gap.id)}
                  className={cn(
                    'p-3.5 rounded-md border cursor-pointer transition-all border-l-4',
                    gap.priority === 'high' ? 'border-l-red-500' : gap.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500',
                    isSelected
                      ? 'bg-primary/5 border-r-primary/30 border-y-primary/30 shadow-sm ring-1 ring-primary/10'
                      : 'bg-card border-r-border border-y-border hover:border-r-foreground/15 hover:border-y-foreground/15 hover:bg-muted/20',
                  )}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn('text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border', EVIDENCE_STATUS_CONFIG[gap.evidenceStatus].color)}>
                        {EVIDENCE_STATUS_CONFIG[gap.evidenceStatus].label}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/70">{gap.id}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border', priorityCfg.color)}>
                        {priorityCfg.label}
                      </span>
                      <div className={cn('w-2 h-2 rounded-full shrink-0', statusCfg.dot)} />
                    </div>
                  </div>

                  <h3 className="font-medium text-foreground text-[13px] mb-1.5 leading-snug">{gap.title}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">{gap.whyMatters}</p>

                  {/* Mini chips */}
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {sup?.relatedNexus.slice(0, 2).map(n => (
                      <span key={n.id} className="flex items-center gap-1 text-[9px] font-mono bg-purple-50 border border-purple-200 text-purple-700 px-1.5 py-0.5 rounded">
                        <GitBranch className="w-2.5 h-2.5" />{n.id}
                      </span>
                    ))}
                    {sup?.relatedTimeline && (
                      <span className="flex items-center gap-1 text-[9px] font-mono bg-orange-50 border border-orange-200 text-orange-700 px-1.5 py-0.5 rounded">
                        <Clock className="w-2.5 h-2.5" />{sup.relatedTimeline.id}
                      </span>
                    )}
                    {sup?.exportEffect.severity === 'blocks' && (
                      <span className="flex items-center gap-1 text-[9px] font-mono bg-red-50 border border-red-200 text-red-600 px-1.5 py-0.5 rounded">
                        <ShieldAlert className="w-2.5 h-2.5" />Export blocked
                      </span>
                    )}
                    {sup?.exportEffect.severity === 'limits' && (
                      <span className="flex items-center gap-1 text-[9px] font-mono bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-2.5 h-2.5" />Export limited
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className={cn('text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border', statusCfg.color)}>
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

        {/* Right — detail panel */}
        <Panel minSize={40} className="flex flex-col bg-card overflow-hidden relative">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.16 }}
                className="flex-1 overflow-y-auto pb-20"
              >
                <div className="p-5 space-y-5">

                  {/* ── Header ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className="font-mono text-[10px] text-muted-foreground border border-border bg-muted/50 px-1.5 py-0.5 rounded">
                        {selected.id}
                      </span>
                      <span className={cn('text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm border', EVIDENCE_STATUS_CONFIG[selected.evidenceStatus].color)}>
                        Evidence: {EVIDENCE_STATUS_CONFIG[selected.evidenceStatus].label}
                      </span>
                      <span className={cn('text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm border', PRIORITY_CONFIG[selected.priority].color)}>
                        {PRIORITY_CONFIG[selected.priority].label} Priority
                      </span>
                      <span className={cn('text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border ml-auto', GAP_STATUS_CONFIG[selected.status].color)}>
                        {GAP_STATUS_CONFIG[selected.status].label}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-foreground leading-snug">{selected.title}</h2>
                  </div>

                  {/* ── Why it matters ── */}
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />Why This Matters
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">{selected.whyMatters}</p>
                  </div>

                  {/* ── Relationship metadata grid ── */}
                  {supplement && (
                    <div className="grid grid-cols-2 gap-2.5">

                      {/* Related Nexus relationships */}
                      <div className="bg-muted/40 border border-border rounded-md p-3">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <GitBranch className="w-3 h-3" />Related Nexus Relationship{supplement.relatedNexus.length > 1 ? 's' : ''}
                        </div>
                        <div className="space-y-1.5">
                          {supplement.relatedNexus.map(n => (
                            <div key={n.id} className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] bg-purple-50 border border-purple-200 text-purple-800 px-1.5 py-0.5 rounded shrink-0">{n.id}</span>
                              <span className="text-[11px] text-foreground leading-snug">{n.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Related source documents */}
                      <div className="bg-muted/40 border border-border rounded-md p-3">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <FileText className="w-3 h-3" />Related Source
                        </div>
                        <div className="space-y-1.5">
                          {supplement.relatedSource.map(s => (
                            <div key={s.id}>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] bg-secondary border border-border text-foreground px-1.5 py-0.5 rounded shrink-0">{s.id.toUpperCase()}</span>
                                <span className="text-[11px] text-foreground">{s.name}</span>
                              </div>
                              <div className="text-[9px] font-mono text-muted-foreground mt-0.5 ml-0.5">{s.pages}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Related timeline event */}
                      {supplement.relatedTimeline && (
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                          <div className="text-[9px] font-mono text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />Related Timeline Event
                          </div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono text-[10px] bg-orange-100 border border-orange-200 text-orange-800 px-1.5 py-0.5 rounded shrink-0">
                              {supplement.relatedTimeline.id}
                            </span>
                            {supplement.relatedTimeline.dateType && (
                              <span className="text-[9px] font-mono text-orange-500 uppercase">
                                {supplement.relatedTimeline.dateType}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-orange-900 leading-snug">{supplement.relatedTimeline.label}</p>
                        </div>
                      )}

                      {/* Creating dependency */}
                      <div className={cn("bg-muted/40 border border-border rounded-md p-3", supplement.relatedTimeline ? '' : 'col-span-2')}>
                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Link2 className="w-3 h-3" />Creating Dependency
                        </div>
                        <p className="text-[11px] text-foreground leading-relaxed">{supplement.creatingDependency}</p>
                      </div>

                    </div>
                  )}

                  {/* ── Export effect ── */}
                  {supplement && (
                    <ExportEffectBadge severity={supplement.exportEffect.severity} text={supplement.exportEffect.text} />
                  )}

                  {/* ── Consequence ── */}
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-[10px] font-mono text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />Consequence If Unresolved
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed">{selected.consequence}</p>
                  </div>

                  {/* ── Responsible person ── */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span>Responsible:</span>
                    <span className="font-medium text-foreground">{selected.responsiblePerson}</span>
                    {selected.dueDate && (
                      <>
                        <span className="text-border">·</span>
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>Due {selected.dueDate}</span>
                      </>
                    )}
                  </div>

                  {/* ── Suggested next actions ── */}
                  <div className="border border-border rounded-md overflow-hidden">
                    <button
                      onClick={() => setActionsExpanded(v => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
                    >
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" />Suggested Next Actions
                        <span className="ml-1 bg-muted border border-border text-muted-foreground px-1.5 py-0.5 rounded text-[9px]">
                          {selected.suggestedActions.length}
                        </span>
                      </div>
                      {actionsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {actionsExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-3 bg-card">

                            {selected.suggestedActions.map((action, i) => (
                              <div key={action.id} className="border border-border rounded-md p-3.5 bg-muted/20">
                                <div className="flex items-start gap-2.5 mb-3">
                                  <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0 mt-0.5 w-4">
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                  <p className="text-sm text-foreground leading-snug">{action.label}</p>
                                </div>
                                {/* 4 action buttons — all disabled, visual-only */}
                                <div className="flex flex-wrap gap-1.5 pl-6">
                                  <ActionButton icon={MessageSquare} label="Create Interview Question" color="blue" />
                                  <ActionButton icon={FileText} label="Create Document Request" color="blue" />
                                  <ActionButton icon={ClipboardList} label="Create Task" color="default" />
                                </div>
                              </div>
                            ))}

                            {/* Preserve as Unknown */}
                            <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50">
                              <div className="flex items-start gap-2.5 mb-2">
                                <Archive className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">Preserve as Unknown</p>
                                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    Absence of evidence is not negative evidence. Mark this gap as a valid epistemic state — investigation is formally complete with unknown outcome.
                                  </p>
                                </div>
                              </div>
                              <div className="pl-6">
                                <ActionButton icon={Archive} label="Preserve as Unknown" color="slate" />
                              </div>
                            </div>

                            {/* Disclosure */}
                            <div className="bg-muted border border-border rounded-md px-3 py-2.5 text-[10px] font-mono text-muted-foreground leading-relaxed">
                              UI preview — actions are not created or synchronized in this design prototype.
                              No tasks, interview questions, or document requests will be recorded on other pages.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── Practitioner notes ── */}
                  {selected.practitionerNotes && (
                    <div className="bg-muted border border-border rounded-md p-4">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />Practitioner Notes
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{selected.practitionerNotes}</p>
                    </div>
                  )}

                  {/* ── Audit history ── */}
                  <div>
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">
                      Audit History
                    </h3>
                    {selected.auditHistory.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No audit entries yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {selected.auditHistory.map((entry, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground">
                            <span className="font-mono shrink-0 text-[10px] whitespace-nowrap">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                            <span className="font-medium text-foreground shrink-0">{entry.actor}</span>
                            <span className="leading-relaxed">{entry.action}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a gap to review
              </div>
            )}
          </AnimatePresence>

          {/* ── Sticky action bar ── */}
          {selected && (
            <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-card/97 backdrop-blur-md border-t border-border shadow-lg z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground font-mono shrink-0">STATUS:</span>
                <select
                  className="text-xs border border-border rounded-sm px-2 py-1.5 bg-card text-foreground flex-1"
                  value={selected.status}
                  onChange={e => setStatus(selected.id, e.target.value as GapStatus)}
                >
                  {Object.entries(GAP_STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-sm h-8 shrink-0"
                  onClick={() => openResolveModal(selected.id)}
                  disabled={selected.status === 'resolved'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Mark Resolved
                </Button>
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>

      {/* ── Resolve modal (preserved exactly) ── */}
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
                  variant="outline" size="sm"
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
