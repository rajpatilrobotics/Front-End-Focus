import React, { useState } from 'react';
import { MOCK_FINDINGS, MOCK_EVIDENCE_GAPS, Finding } from '@/data/mock-case';
import { ReviewStatusBadge, SupportStatusBadge, EvidenceNatureBadge, OriginBadge } from '@/components/badges';
import {
  ShieldAlert, Filter, Table2, GitBranch, HelpCircle,
  AlertTriangle, CheckCircle2, ArrowRight, XCircle, ChevronRight,
  Scale, Eye, EyeOff, FileText, Link2, X, TriangleAlert,
  Clock, ShieldX, BookOpen, CircleDot, CircleCheck, CircleHelp,
  CircleX, CircleMinus, CircleAlert, ChevronDown, ChevronUp,
  ExternalLink,
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

const CHALLENGE_MISSING = [
  'Subject\'s independent account of working schedule',
  'Independent payroll or time-tracking record',
  'Third-party observation of shift duration',
];

const CHALLENGE_IMPACT = [
  { id: 'f-9', label: 'Alleged Conduct Timing (f-9)', change: 'Becomes Unresolved / Pending', severity: 'high' },
  { id: 't-4', label: 'Timeline event: Alleged task assigned (t-4)', change: 'Marked Uncertain', severity: 'med' },
  { id: 'eg-new', label: 'New Evidence Gap', change: '"Compelled task evidence no longer supportable" gap created', severity: 'high' },
  { id: 'export', label: 'Export Gate', change: 'Remains Blocked — new dependency blocker added', severity: 'high' },
];

const CHALLENGE_UNCHANGED = ['f-1 Passport Retention', 'f-2 Recruitment Fee Debt', 'f-6 Arrival Date Discrepancy'];

// ── Evidence Integrity Trace data ──────────────────────────────────────────────

type IntegrityTrace = {
  documentId: string;
  documentName: string;
  page: number;
  quote: string;
  claimSummary: string;
  timelineDeps: { id: string; label: string; dateType: string }[];
  reviewActor: string;
  reviewDate: string;
  reviewAction: string;
  exportStatus: 'contributing' | 'blocked' | 'clear' | 'pending';
  exportNote: string;
};

const INTEGRITY_TRACES: Record<string, IntegrityTrace> = {
  'f-1': {
    documentId: 'd-2',
    documentName: 'Recruiter Communication Log',
    page: 5,
    quote: '[REDACTED] requested original passport for "safekeeping" on day of arrival.',
    claimSummary: 'Coercion indicator — employer withheld travel documents removing means of departure',
    timelineDeps: [
      { id: 't-3', label: 'Passport confiscated upon arrival', dateType: 'approximate' },
    ],
    reviewActor: 'M. Chen',
    reviewDate: '24 Mar 2024',
    reviewAction: 'Accepted with reservation (single-source)',
    exportStatus: 'pending',
    exportNote: 'f-1 accepted — dependency chain to f-5 requires resolution before export',
  },
  'f-2': {
    documentId: 'd-1',
    documentName: 'Employment Offer Letter',
    page: 2,
    quote: 'Deduction of $400/month for initial placement fee will be applied to first 6 months of wages.',
    claimSummary: 'Recruitment fee debt creating ongoing economic dependency on employer',
    timelineDeps: [
      { id: 't-1', label: 'Employment contract signed in home country', dateType: 'exact' },
    ],
    reviewActor: 'M. Chen',
    reviewDate: '24 Mar 2024',
    reviewAction: 'Accepted — documented in signed contract',
    exportStatus: 'pending',
    exportNote: 'f-2 accepted — wage records absent (eg-3); export may require limitation statement',
  },
  'f-3': {
    documentId: 'd-4',
    documentName: 'Operational Task Log',
    page: 1,
    quote: 'Shift extended by 6 hours, no overtime recorded.',
    claimSummary: 'Compelled task — extended hours without compensation or right to refuse',
    timelineDeps: [
      { id: 't-6', label: 'Shift extensions recorded Jan–Feb 2024', dateType: 'range' },
      { id: 't-4', label: 'Alleged task assigned during control period', dateType: 'exact' },
    ],
    reviewActor: 'M. Chen',
    reviewDate: '24 Mar 2024',
    reviewAction: 'Accepted — supervisor log, medium extraction quality',
    exportStatus: 'blocked',
    exportNote: 'f-3 → f-9 (Conduct Timing) partially supported — export gate blocked on this dependency',
  },
  'f-4': {
    documentId: 'd-2',
    documentName: 'Recruiter Communication Log',
    page: 8,
    quote: '"If you leave, ICE will be notified immediately."',
    claimSummary: 'Coercion via immigration threat — supervisor leveraged status to compel compliance',
    timelineDeps: [],
    reviewActor: '—',
    reviewDate: '—',
    reviewAction: 'Pending — unverified, translation partial, pp.2–3 unreadable',
    exportStatus: 'blocked',
    exportNote: 'f-4 pending review — partially supported, unverified citation; export blocked',
  },
  'f-5': {
    documentId: 'd-5',
    documentName: 'Support Provider Notes',
    page: 2,
    quote: 'Client stated they were not allowed out of the housing facility.',
    claimSummary: 'Isolation — subject prohibited from contacting family or leaving unescorted',
    timelineDeps: [],
    reviewActor: '—',
    reviewDate: '—',
    reviewAction: 'Pending — single-source, no corroborating documentation',
    exportStatus: 'blocked',
    exportNote: 'f-5 insufficient support — dependency of f-1; export blocked pending resolution',
  },
  'f-6': {
    documentId: 'd-1',
    documentName: 'Employment Offer Letter + Travel Record',
    page: 1,
    quote: 'Start Date: October 1, 2023 [contract] vs. Entry stamped: November 15, 2023 [travel record]',
    claimSummary: 'Contradiction — 45-day unexplained gap between contract start and border entry',
    timelineDeps: [
      { id: 't-2', label: 'Arrived in destination country — date conflict', dateType: 'exact' },
    ],
    reviewActor: '—',
    reviewDate: '—',
    reviewAction: 'Pending — conflicting sources, no explanation documented',
    exportStatus: 'blocked',
    exportNote: 'f-6 conflicting — non-punishment timeline cannot be completed; export blocked',
  },
  'f-7': {
    documentId: 'd-5',
    documentName: 'Support Provider Notes',
    page: 4,
    quote: 'Eviction notice served, effective Friday.',
    claimSummary: 'Imminent housing loss — eviction within 48 hours, no alternative documented',
    timelineDeps: [],
    reviewActor: '—',
    reviewDate: '—',
    reviewAction: 'Pending — document-supported, requires immediate action',
    exportStatus: 'pending',
    exportNote: 'f-7 urgent need — does not directly block export but requires resolution before handoff',
  },
  'f-8': {
    documentId: 'd-7',
    documentName: 'Wage Deduction Records',
    page: 1,
    quote: '(No extractable text — document pages are image-only or extraction-failed)',
    claimSummary: 'Evidence gap — no documentation of actual wages received vs. contracted amount',
    timelineDeps: [],
    reviewActor: '—',
    reviewDate: '—',
    reviewAction: 'Rejected — not-processed; document not readable',
    exportStatus: 'pending',
    exportNote: 'f-8 not processed — wage verification absent; f-2 debt claim partially supported only',
  },
};

// ── Dependent export item per finding ──────────────────────────────────────────

const EXPORT_DEPS: Record<string, { label: string; status: 'blocked' | 'pending' | 'clear' }> = {
  'f-1': { label: 'Export dep: f-1 accepted, but f-5 dependency unresolved → gate blocked', status: 'blocked' },
  'f-2': { label: 'Export dep: wage records absent → limitation note required in handoff', status: 'pending' },
  'f-3': { label: 'Export dep: f-3 → f-9 unresolved → BLOCKED · new blocker would be added if withdrawn', status: 'blocked' },
  'f-4': { label: 'Export dep: f-4 pending review → one of 4 active export blockers', status: 'blocked' },
  'f-5': { label: 'Export dep: f-5 insufficient → f-1 dependency chain unresolved → gate blocked', status: 'blocked' },
  'f-6': { label: 'Export dep: f-6 conflicting → non-punishment timeline incomplete → gate blocked', status: 'blocked' },
  'f-7': { label: 'Export dep: f-7 urgency noted · does not directly block export', status: 'pending' },
  'f-8': { label: 'Export dep: f-8 not processed · wage limitation note required if f-2 is included', status: 'pending' },
};

// ── Node state visual legend config ───────────────────────────────────────────

const NODE_REVIEW_STATES = [
  { icon: CheckCircle2, color: 'text-teal-600',  dot: 'bg-teal-500',  label: 'Human accepted' },
  { icon: CircleDot,   color: 'text-blue-600',   dot: 'bg-blue-500',  label: 'Pending review' },
  { icon: CircleCheck, color: 'text-purple-600', dot: 'bg-purple-500',label: 'Uncertain' },
  { icon: CircleX,     color: 'text-red-600',    dot: 'bg-red-500',   label: 'Invalidated' },
  { icon: ShieldX,     color: 'text-orange-600', dot: 'bg-orange-400',label: 'Export blocked' },
];

const NODE_EVIDENCE_STATES = [
  { bg: 'bg-teal-50 border-teal-300',   label: 'Supporting' },
  { bg: 'bg-red-50 border-red-300',     label: 'Contrary' },
  { bg: 'bg-amber-50 border-amber-300', label: 'Missing info' },
  { bg: 'bg-slate-50 border-slate-300 border-dashed', label: 'Unknown' },
];

// ── Integrity trace component ──────────────────────────────────────────────────

function IntegrityTraceFlow({ findingId }: { findingId: string }) {
  const trace = INTEGRITY_TRACES[findingId];
  if (!trace) return null;

  const exportColors = {
    blocked: 'border-red-200 bg-red-50 text-red-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    clear:   'border-teal-200 bg-teal-50 text-teal-700',
    contributing: 'border-blue-200 bg-blue-50 text-blue-700',
  };

  const steps = [
    {
      icon: FileText,
      color: 'bg-slate-100 border-slate-300 text-slate-600',
      label: 'Document',
      value: `${trace.documentId.toUpperCase()} · ${trace.documentName} · p.${trace.page}`,
    },
    {
      icon: BookOpen,
      color: 'bg-blue-50 border-blue-200 text-blue-600',
      label: 'Exact source quotation',
      value: trace.quote,
      mono: true,
    },
    {
      icon: CircleAlert,
      color: 'bg-purple-50 border-purple-200 text-purple-600',
      label: 'Extracted claim',
      value: trace.claimSummary,
    },
    ...(trace.timelineDeps.length > 0 ? [{
      icon: Clock,
      color: 'bg-orange-50 border-orange-200 text-orange-600',
      label: 'Timeline event(s)',
      value: trace.timelineDeps.map(t => `${t.id} · ${t.label} (${t.dateType})`).join('\n'),
    }] : []),
    {
      icon: GitBranch,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      label: 'Nexus relationship',
      value: `${findingId} → root · Charge–Coercion Nexus`,
    },
    {
      icon: Eye,
      color: 'bg-teal-50 border-teal-200 text-teal-600',
      label: 'Human review',
      value: `${trace.reviewAction} · ${trace.reviewDate !== '—' ? `by ${trace.reviewActor}` : 'Awaiting review'}`,
    },
    {
      icon: ShieldAlert,
      color: exportColors[trace.exportStatus],
      label: 'Export eligibility',
      value: trace.exportNote,
    },
  ];

  return (
    <div>
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <ArrowRight className="w-3 h-3" />Evidence Integrity Trace
      </div>
      <div className="relative pl-3">
        {/* vertical rail */}
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative flex gap-2.5 pb-2.5 last:pb-0">
                {/* rail dot */}
                <div className={cn(
                  'relative z-10 w-3 h-3 rounded-full border shrink-0 mt-1.5 flex items-center justify-center',
                  step.color,
                )}>
                  <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                </div>
                <div className={cn(
                  'flex-1 rounded-md border p-2.5 text-xs',
                  step.color,
                )}>
                  <div className="font-mono uppercase text-[9px] tracking-widest opacity-60 mb-0.5">{step.label}</div>
                  <div className={cn('leading-relaxed', step.mono ? 'font-mono text-[11px]' : '')}>
                    {step.value.split('\n').map((line, j) => (
                      <div key={j}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Static challenge section (visual-only) ────────────────────────────────────

function StaticChallengeSection({ findingId }: { findingId: string }) {
  const [open, setOpen] = useState(false);

  // Only show for f-3 (the pre-configured challenge scenario)
  if (findingId !== 'f-3') return null;

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden">
      {/* Section header — toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3.5 py-3 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Scale className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="text-xs font-semibold text-amber-900">Challenge this relationship</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono uppercase text-amber-600 border border-amber-300 bg-amber-100 px-1.5 py-0.5 rounded">
            UI PREVIEW
          </span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-amber-600" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-600" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3.5 space-y-4 bg-white">
              {/* Prototype notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-[10px] font-mono text-slate-600 leading-relaxed">
                UI preview — dependency changes are not executed in this design prototype.
                No state will be modified, no audit events will be recorded.
              </div>

              {/* Supporting evidence */}
              <div>
                <div className="text-[9px] font-mono text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />Supporting Evidence
                </div>
                <div className="bg-muted border border-border rounded-md p-2.5 text-[11px] font-mono text-foreground/80 border-l-2 border-l-teal-400 leading-relaxed">
                  "Shift extended by 6 hours, no overtime recorded."
                  <div className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <span>Operational Task Log · p.1</span>
                    <span className="text-[9px] uppercase bg-teal-50 text-teal-700 border border-teal-200 px-1 py-0.5 rounded">Medium quality</span>
                    <CheckCircle2 className="w-2.5 h-2.5 text-teal-600" />
                  </div>
                </div>
              </div>

              {/* Contrary evidence */}
              <div>
                <div className="text-[9px] font-mono text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <XCircle className="w-3 h-3" />Contrary Evidence
                </div>
                <div className="space-y-1.5">
                  {CHALLENGE_CONTRARY.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-[11px] text-red-800">
                      <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unverified assumptions */}
              <div>
                <div className="text-[9px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />Unverified Assumptions
                </div>
                <div className="space-y-1.5">
                  {CHALLENGE_ASSUMPTIONS.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing information */}
              <div>
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3" />Missing Information
                </div>
                <div className="space-y-1">
                  {CHALLENGE_MISSING.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <ChevronRight className="w-3 h-3 text-amber-400 shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Impact Preview — if withdrawn</span>
                  <span className="ml-auto text-[9px] font-mono text-slate-500 border border-slate-300 bg-white px-1.5 py-0.5 rounded">NOT EXECUTED</span>
                </div>
                <div className="p-3 space-y-2">
                  {/* Affected nexus ID */}
                  <div className="flex items-start gap-2.5 p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800">
                    <TriangleAlert className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-semibold">Affected Nexus ID: f-9</span>
                      <p className="mt-0.5 opacity-80">Alleged Conduct Timing → Becomes Unresolved / Pending</p>
                    </div>
                  </div>
                  {/* Affected timeline ID */}
                  <div className="flex items-start gap-2.5 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                    <Clock className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-semibold">Affected Timeline ID: t-4</span>
                      <p className="mt-0.5 opacity-80">Alleged task assigned (2025-04-02) → Marked Uncertain</p>
                    </div>
                  </div>
                  {/* Evidence gap created */}
                  <div className="flex items-start gap-2.5 p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800">
                    <CircleHelp className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-semibold">Evidence Gap created: eg-new</span>
                      <p className="mt-0.5 opacity-80">"Compelled task evidence no longer supportable" — open gap</p>
                    </div>
                  </div>
                  {/* Export blocker */}
                  <div className="flex items-start gap-2.5 p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800">
                    <ShieldX className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-semibold">Export Gate: new blocker added</span>
                      <p className="mt-0.5 opacity-80">Remains Blocked — additional dependency blocker from f-9 cascade</p>
                    </div>
                  </div>
                  {/* Unchanged */}
                  <div className="pt-1 border-t border-border">
                    <div className="text-[9px] font-mono text-teal-700 uppercase mb-1.5">Unchanged</div>
                    {CHALLENGE_UNCHANGED.map(item => (
                      <div key={item} className="flex items-center gap-2 text-[11px] text-teal-700 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-500 shrink-0" />{item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseNexus() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterGroup>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [challengePhase, setChallengePhase] = useState<ChallengePhase>('idle');
  const [challengeWithdrawn, setChallengeWithdrawn] = useState(false);

  const selectedFinding = MOCK_FINDINGS.find(f => f.id === selectedNode);
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
          {/* Legend — expanded with node states */}
          <div className="absolute top-[120px] left-4 z-10 bg-card/97 backdrop-blur-md p-4 rounded-lg border border-border shadow-md pointer-events-none" style={{ width: 188 }}>
            <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Legend</h3>

            {/* Node types */}
            <div className="space-y-1.5 text-[11px] text-foreground mb-3">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-300" />Recruitment</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-50 border border-purple-300" />Coercion / Control</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-300" />Compelled Task</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-50 border border-red-300" />Contradiction</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-50 border border-orange-300" />Urgency</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border border-dashed border-slate-300" />Evidence Gap</div>
            </div>

            {/* Evidence states */}
            <div className="border-t border-border pt-2.5 mb-3">
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Evidence state</div>
              <div className="space-y-1.5 text-[11px]">
                {NODE_EVIDENCE_STATES.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded border shrink-0", s.bg)} />
                    <span className="text-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review states */}
            <div className="border-t border-border pt-2.5 mb-3">
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Review state</div>
              <div className="space-y-1.5 text-[11px]">
                {NODE_REVIEW_STATES.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", s.dot)} />
                    <span className="text-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge types */}
            <div className="border-t border-border pt-2.5 space-y-1.5">
              <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-300" />Supports</div>
              <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-purple-400" />Depends on</div>
              <div className="flex items-center gap-2"><div className="w-6 border-t-2 border-dashed border-red-400" />Conflicts with</div>
              <div className="flex items-center gap-2"><div className="w-6 border-t border-dashed border-orange-400" />Urgency modifier</div>
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
              const finding = id === 'root' ? null : MOCK_FINDINGS.find(f => f.id === id);
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
                        {/* Review state dot */}
                        <div className={cn(
                          'w-2 h-2 rounded-full shrink-0',
                          isWithdrawn ? 'bg-slate-400'
                          : isCascaded ? 'bg-amber-500'
                          : finding.reviewStatus === 'accepted' ? 'bg-teal-500'
                          : finding.reviewStatus === 'pending' ? 'bg-blue-500'
                          : finding.reviewStatus === 'invalidated' ? 'bg-red-500'
                          : finding.reviewStatus === 'uncertain' ? 'bg-purple-500'
                          : finding.reviewStatus === 'rejected' ? 'bg-orange-400'
                          : 'bg-slate-400'
                        )} />
                      </div>
                      <div className="font-medium text-[13px] leading-snug line-clamp-2">{finding.title}</div>
                      {/* Support status mini-badge */}
                      <div className={cn(
                        "mt-1.5 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded inline-block border",
                        finding.supportStatus === 'supported' ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : finding.supportStatus === 'partially-supported' ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : finding.supportStatus === 'conflicting' ? 'bg-red-50 border-red-200 text-red-700'
                        : finding.supportStatus === 'insufficient' ? 'bg-slate-50 border-slate-200 text-slate-500'
                        : finding.supportStatus === 'unresolved' ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                      )}>
                        {finding.supportStatus.replace(/-/g, ' ')}
                      </div>
                      {isWithdrawn && (
                        <div className="mt-1.5 text-[9px] font-mono uppercase text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded inline-block ml-1">Withdrawn</div>
                      )}
                      {isCascaded && (
                        <div className="mt-1.5 text-[9px] font-mono uppercase text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block ml-1">Unresolved</div>
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
            initial={{ x: 440, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 440, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-[88px] right-0 bottom-0 w-[440px] bg-card/98 backdrop-blur-xl border-l border-border shadow-2xl flex flex-col z-30"
          >
            {/* Panel header */}
            <div className="p-4 border-b border-border bg-muted/30 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{selectedFinding.id}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs font-mono text-muted-foreground capitalize">{NODE_POSITIONS[selectedNode]?.group} node</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs font-mono text-muted-foreground">Lane {selectedFinding.lane}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ReviewStatusBadge status={selectedFinding.reviewStatus} />
                    <SupportStatusBadge status={selectedFinding.supportStatus} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted transition-colors shrink-0"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">

                {/* Title + description */}
                <div>
                  <h2 className="text-base font-bold text-foreground mb-1.5 leading-snug">{selectedFinding.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedFinding.description}</p>
                </div>

                {/* Metadata row */}
                <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2.5">
                  <div className="flex justify-between items-center text-xs border-b border-border/50 pb-2">
                    <span className="font-mono text-muted-foreground text-[10px]">Relationship ID:</span>
                    <span className="font-mono text-foreground font-semibold">{selectedFinding.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-border/50 pb-2">
                    <span className="font-mono text-muted-foreground text-[10px]">Evidence nature:</span>
                    <EvidenceNatureBadge nature={selectedFinding.evidenceNature} />
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-border/50 pb-2">
                    <span className="font-mono text-muted-foreground text-[10px]">Origin:</span>
                    <OriginBadge origin={selectedFinding.origin} />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-muted-foreground text-[10px]">Review lane:</span>
                    <span className="font-mono text-xs text-foreground">
                      {selectedFinding.lane === 'A' ? 'Lane A · Trafficking Indicators'
                        : selectedFinding.lane === 'B' ? 'Lane B · Non-Punishment Relevance'
                        : 'Lane C · Protection & Urgency'}
                    </span>
                  </div>
                </div>

                {/* Evidence Integrity Trace */}
                <IntegrityTraceFlow findingId={selectedFinding.id} />

                {/* Exact citation */}
                {selectedFinding.citations.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />Exact Citation{selectedFinding.citations.length > 1 ? 's' : ''}
                    </div>
                    {selectedFinding.citations.map((cit, i) => (
                      <div key={i} className="bg-muted border border-border rounded-md p-3 text-xs font-mono border-l-2 border-l-primary/50 leading-relaxed mb-2">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1.5">
                          {cit.documentId?.toUpperCase()} · {cit.sourceAuthority} · p.{cit.page}
                          {cit.segment && <span className="ml-1 opacity-60">· {cit.segment}</span>}
                        </div>
                        <div className="text-foreground/85 mb-1.5">"{cit.text}"</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {cit.extractionQuality && (
                            <span className={cn("text-[9px] uppercase px-1 py-0.5 rounded border font-mono",
                              cit.extractionQuality === 'high' ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : cit.extractionQuality === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                            )}>
                              {cit.extractionQuality} quality
                            </span>
                          )}
                          {cit.validationStatus === 'verified' && (
                            <span className="flex items-center gap-1 text-[9px] text-teal-700 font-mono">
                              <CheckCircle2 className="w-2.5 h-2.5" />Verified
                            </span>
                          )}
                          {cit.translationStatus && cit.translationStatus !== 'original' && (
                            <span className="text-[9px] uppercase bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.5 rounded font-mono">
                              {cit.translationStatus}
                            </span>
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

                {/* Contrary evidence */}
                {selectedFinding.contradictions && selectedFinding.contradictions.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-red-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <XCircle className="w-3 h-3" />Contrary Evidence
                    </div>
                    {selectedFinding.contradictions.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs mb-2">
                        <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                        {c}
                      </div>
                    ))}
                  </div>
                )}

                {/* Missing information */}
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

                {/* Dependent Timeline items */}
                {INTEGRITY_TRACES[selectedFinding.id]?.timelineDeps.length > 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-orange-700 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />Dependent Timeline Items
                    </div>
                    <div className="space-y-1.5">
                      {INTEGRITY_TRACES[selectedFinding.id].timelineDeps.map(t => (
                        <div key={t.id} className="flex items-center gap-2.5 p-2.5 bg-orange-50 border border-orange-200 rounded-md text-xs">
                          <span className="font-mono font-bold text-orange-800 shrink-0">{t.id}</span>
                          <span className="text-orange-800 flex-1">{t.label}</span>
                          <span className={cn("text-[9px] font-mono uppercase px-1 py-0.5 rounded border shrink-0",
                            t.dateType === 'exact' ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : t.dateType === 'approximate' ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : t.dateType === 'range' ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                          )}>
                            {t.dateType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Downstream dependencies (finding-to-finding) */}
                {selectedFinding.dependencies && selectedFinding.dependencies.length > 0 && (
                  <div className="bg-muted/50 border border-border rounded-lg p-3.5">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2.5 flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" />Downstream Nexus Dependencies
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

                {/* Dependent export item */}
                {EXPORT_DEPS[selectedFinding.id] && (
                  <div className={cn(
                    "flex items-start gap-2.5 p-3 rounded-lg border text-xs",
                    EXPORT_DEPS[selectedFinding.id].status === 'blocked'
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  )}>
                    <ShieldAlert className={cn("w-3.5 h-3.5 shrink-0 mt-0.5",
                      EXPORT_DEPS[selectedFinding.id].status === 'blocked' ? 'text-red-500' : 'text-amber-500'
                    )} />
                    <div>
                      <div className="font-mono font-semibold text-[10px] uppercase mb-0.5">Dependent Export Item</div>
                      {EXPORT_DEPS[selectedFinding.id].label}
                    </div>
                  </div>
                )}

                {/* Unresolved warning */}
                {selectedFinding.supportStatus === 'unresolved' && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-700 mb-1 text-xs font-semibold uppercase tracking-wide">Dependency Broken</strong>
                      This node's validity is unresolved due to upstream changes. Human review required before export.
                    </div>
                  </div>
                )}

                {/* Static challenge section (visual-only, collapsible) */}
                <StaticChallengeSection findingId={selectedFinding.id} />

              </div>
            </div>

            {/* Action footer */}
            <div className="p-4 border-t border-border bg-muted/20 space-y-2 shrink-0">
              {/* Open Source button */}
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 border border-slate-200 text-slate-500 font-medium text-xs rounded-md cursor-not-allowed opacity-70"
                title="UI preview — source viewer not enabled in prototype"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Source — {INTEGRITY_TRACES[selectedFinding.id]?.documentName ?? selectedFinding.citations[0]?.sourceAuthority ?? 'Source Document'}
                <span className="text-[9px] font-mono uppercase bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded ml-1">UI preview</span>
              </button>

              {canChallenge && !challengeWithdrawn && (
                <Button
                  onClick={() => setChallengePhase('reviewing')}
                  variant="outline"
                  className="w-full border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold h-9 gap-2"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Open Challenge Workflow
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

      {/* ── Challenge Review Panel (interactive, existing) ── */}
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

              {/* Missing information */}
              <section>
                <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border pb-2">
                  <HelpCircle className="w-3.5 h-3.5" />Missing Information
                </h4>
                <div className="space-y-1.5">
                  {CHALLENGE_MISSING.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="w-3 h-3 text-amber-400 shrink-0" />{item}
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
