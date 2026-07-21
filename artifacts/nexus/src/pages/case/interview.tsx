import React, { useState } from 'react';
import { MOCK_INTERVIEW_QUESTIONS, InterviewQuestion, InterviewQuestionStatus } from '@/data/mock-case';
import {
  MessageSquare, ShieldAlert, AlertTriangle, CheckCircle2, XCircle,
  Clock, Plus, Info, Edit2, EyeOff, Flag, ChevronDown, ChevronUp,
  FileText, GitBranch, BookOpen, Filter, User, HelpCircle, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ── Status config (preserved) ─────────────────────────────────────────────────

const STATUS_CONFIG: Record<InterviewQuestionStatus, { label: string; color: string; dot: string }> = {
  'pending-review': { label: 'Pending Review',     color: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  'kept':           { label: 'Approved for Use',   color: 'bg-teal-50 text-teal-700 border-teal-200',    dot: 'bg-teal-500' },
  'edited':         { label: 'Edited',              color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'removed':        { label: 'Removed',             color: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  'deferred':       { label: 'Deferred',            color: 'bg-slate-50 text-slate-600 border-slate-300', dot: 'bg-slate-500' },
  'inappropriate':  { label: 'Inappropriate',       color: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-500' },
};

// ── Non-negotiable rules (preserved, expanded) ────────────────────────────────

const NON_NEGOTIABLE = [
  'Do not ask accusatory, coercive, or leading questions.',
  'Never interpret hesitation, uncertainty, incomplete memory, or refusal as dishonesty or lack of credibility.',
  'Avoid assuming allegations are true or false — questions are exploratory, not confirmatory.',
  'Prefer open prompts: "What do you remember about…?" or "Can you tell me more about…?"',
  'Do not request traumatic detail repeatedly without a stated case-preparation reason.',
  'Questions are planning aids, not mandatory scripts — the practitioner adapts in session.',
  'Every question must be reviewed and approved by the practitioner before use.',
  'Memory varies — allow silences, avoid filling pauses with suggestions.',
];

// ── Synthetic iq-6 linked to eg-5 (operational-task gap) ─────────────────────

const IQ6: InterviewQuestion = {
  id: 'iq-6',
  questionText: 'Can you describe what a typical working day looked like for you during that period?',
  addressesGapId: 'eg-5',
  relatedFindingId: 'f-3',
  citations: ['f-3', 'eg-5', 'd-4'],
  reason: 'The Operational Task Log (d-4) contains one extractable page recording a shift extension. Pages 2–3 are unreadable. The subject\'s own account of their working schedule during Jan–Feb 2024 is entirely absent from the evidence base. Open-ended recall about daily routine may help characterise the schedule without leading to specific dates or claims.',
  sensitivityNote: 'Working conditions may carry complex feelings including shame, confusion, or fear of disbelief. Do not reference "forced labour," "compelled tasks," or legal categories. Use the person\'s own language for their work. Extended silences or incomplete responses should not be interpreted as evasion.',
  reviewStatus: 'pending-review',
  practitionerNote: 'Linked to eg-5 (extraction failure on d-4 pp.2–3). This question seeks the subject\'s independent account — not corroboration of the log. Do not read the log entry to the subject or use it as a prompt. Any account given should be recorded verbatim and not edited for consistency with the existing document.',
};

const ALL_QUESTIONS: InterviewQuestion[] = [IQ6, ...MOCK_INTERVIEW_QUESTIONS];

// ── Per-question static source context ───────────────────────────────────────

const SOURCE_CONTEXT: Record<string, { summary: string; items: { id: string; label: string; note: string }[] }> = {
  'iq-6': {
    summary: 'One extractable page of a supervisor-authored log. No independent schedule record. Subject\'s account not yet obtained.',
    items: [
      { id: 'd-4 p.1', label: 'Operational Task Log — p.1', note: '"Shift extended by 6 hours, no overtime recorded." · Medium extraction quality · Pages 2–3 image-only, not extractable' },
      { id: 'f-3', label: 'Nexus: Excessive Unpaid Hours', note: 'Partially supported · Accepted by M. Chen 24 Mar 2024 · Single-source' },
      { id: 'eg-5', label: 'Evidence Gap eg-5', note: 'Operational task log incomplete — shift record insufficient' },
    ],
  },
  'iq-1': {
    summary: 'Two documents with conflicting dates. No explanation exists in any reviewed source.',
    items: [
      { id: 'd-1 p.1', label: 'Employment Offer Letter — p.1', note: 'Contract start date: October 1, 2023' },
      { id: 'd-3 p.1', label: 'Border Entry Stamp — p.1', note: 'Entry recorded: November 15, 2023 · 45-day gap unexplained' },
      { id: 'f-6',    label: 'Nexus: Arrival Date Discrepancy', note: 'Conflicting · Pending review' },
    ],
  },
  'iq-2': {
    summary: 'Passport retention documented in one source only. No physical receipt or independent corroboration.',
    items: [
      { id: 'd-2 p.5', label: 'Recruiter Communication Log — p.5', note: '"[REDACTED] requested original passport for safekeeping on day of arrival."' },
      { id: 'd-5 p.2', label: 'Support Provider Notes — p.2', note: 'Subject stated unable to access passport — single provider record' },
      { id: 'f-1',     label: 'Nexus: Passport Retention', note: 'Accepted with reservation — single-source' },
    ],
  },
  'iq-3': {
    summary: 'Shift log authored by supervisor only. Subject\'s own account of their schedule is entirely absent.',
    items: [
      { id: 'd-4 p.1', label: 'Operational Task Log — p.1', note: '"Shift extended by 6 hours, no overtime recorded." · Supervisor-authored' },
      { id: 'f-3',     label: 'Nexus: Excessive Unpaid Hours', note: 'Partially supported · Subject account absent' },
    ],
  },
  'iq-4': {
    summary: 'Employment contract records fee deduction. Wage payment records are entirely absent — document unreadable.',
    items: [
      { id: 'd-1 p.2', label: 'Employment Offer Letter — p.2', note: 'Deduction of $400/month for initial placement fee documented' },
      { id: 'd-7',     label: 'Wage Deduction Records', note: 'All pages image-only · Extraction failed · No data available' },
      { id: 'eg-3',    label: 'Evidence Gap eg-3', note: 'Wage payment records entirely absent' },
    ],
  },
  'iq-5': {
    summary: 'No specific document prompted this question — it is a general welfare check.',
    items: [
      { id: 'un-1', label: 'Urgent Need — Imminent Eviction', note: 'Eviction notice active · Housing loss within 48 hours · f-7' },
    ],
  },
};

// ── Per-question topics to avoid ──────────────────────────────────────────────

const TOPICS_TO_AVOID: Record<string, string[]> = {
  'iq-6': [
    'Do not use terms like "forced," "compelled," "trafficking," or any legal category.',
    'Do not reference shift hours, specific dates, or overtime — let the person describe their experience freely.',
    'Do not show or read the log entry to the subject.',
    'Do not suggest what a "normal" working day would have looked like.',
    'Avoid asking why they did not leave or report the situation.',
  ],
  'iq-1': [
    'Do not name the specific dates from the documents — allow free recall first.',
    'Avoid asking why there was a gap — ask what they remember instead.',
    'Do not suggest the gap is suspicious or requires explanation.',
  ],
  'iq-2': [
    'Do not use the word "confiscated" or any term implying an accusation.',
    'Avoid asking about anyone else\'s passport.',
    'If distress is visible, acknowledge and offer to return to the topic later.',
  ],
  'iq-3': [
    'Do not reference "forced labour," "modern slavery," or any legal category.',
    'Avoid asking about specific shift extensions unless raised by the person.',
    'Do not use the log as a prompt or reference point.',
  ],
  'iq-4': [
    'Avoid language that implies the person should have known their rights.',
    'Do not reference specific deduction amounts from the contract initially.',
    'Financial topics may carry shame — pace accordingly and allow silences.',
  ],
  'iq-5': [
    'Do not narrow the question — keep it fully open.',
    'Avoid listing categories of urgent need as prompts.',
    'If safeguarding is indicated, pause the interview and follow protocol.',
  ],
};

// ── Gap label lookup ──────────────────────────────────────────────────────────

const GAP_LABELS: Record<string, string> = {
  'eg-1': 'eg-1 · Arrival date conflict',
  'eg-2': 'eg-2 · Passport corroboration',
  'eg-3': 'eg-3 · Wage records absent',
  'eg-5': 'eg-5 · Operational task log incomplete',
  'un-1': 'un-1 · Urgent need (welfare)',
};

// ── Visual-only action button ─────────────────────────────────────────────────

function PreviewButton({
  icon: Icon,
  label,
  className = '',
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <button
      disabled
      className={cn(
        'flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1.5 rounded border cursor-not-allowed opacity-60 whitespace-nowrap',
        className,
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseInterview() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>(ALL_QUESTIONS);
  const [selectedId, setSelectedId] = useState<string>('iq-6');
  const [showPlanning, setShowPlanning] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [planningNotes, setPlanningNotes] = useState({ purpose: '', topicsToAvoid: '', interpreter: '', accessibility: '', interviewer: '' });
  const [statusFilter, setStatusFilter] = useState<InterviewQuestionStatus | 'all'>('all');
  const [gapFilter, setGapFilter] = useState<string>('all');
  const [rulesOpen, setRulesOpen] = useState(false);

  const selected = questions.find(q => q.id === selectedId);
  const keptCount = questions.filter(q => q.reviewStatus === 'kept' || q.reviewStatus === 'edited').length;
  const pendingCount = questions.filter(q => q.reviewStatus === 'pending-review').length;

  // Existing preserved handler
  const setStatus = (id: string, status: InterviewQuestionStatus) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, reviewStatus: status } : q));
  };

  // All unique gap IDs for gap filter
  const allGapIds = Array.from(new Set(ALL_QUESTIONS.map(q => q.addressesGapId).filter(Boolean))) as string[];

  const filtered = questions.filter(q => {
    const statusMatch = statusFilter === 'all' || q.reviewStatus === statusFilter;
    const gapMatch = gapFilter === 'all' || q.addressesGapId === gapFilter || (!q.addressesGapId && gapFilter === 'none');
    return statusMatch && gapMatch;
  });

  const sourceCtx = selected ? SOURCE_CONTEXT[selected.id] : null;
  const topicsToAvoid = selected ? TOPICS_TO_AVOID[selected.id] : null;

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">

      {/* ── Page header ── */}
      <div className="bg-card border-b border-border px-5 py-3.5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <h2 className="font-bold text-foreground text-sm">Interview Planner</h2>
              {pendingCount > 0 && (
                <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                  {pendingCount} PENDING REVIEW
                </span>
              )}
              {keptCount > 0 && (
                <span className="text-[9px] font-mono bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded">
                  {keptCount} APPROVED
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xl">
              Suggested questions are linked to evidence gaps and are offered as starting points only. All questions must be reviewed and approved by the practitioner. Hesitation, uncertainty, incomplete memory, or refusal to answer does not indicate dishonesty.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <Button
              size="sm" variant="outline"
              className={cn('h-7 text-xs rounded-sm border-border gap-1.5', showPlanning && 'bg-primary/5 border-primary/30 text-primary')}
              onClick={() => setShowPlanning(v => !v)}
            >
              <Edit2 className="w-3 h-3" /> Session Setup
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5" disabled>
              <Plus className="w-3 h-3" /> Add Question
              <span className="text-[8px] font-mono border border-current/20 px-1 py-px rounded opacity-60">UI PREVIEW</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Trauma-informed guidance banner (collapsible) ── */}
      <div className="bg-amber-50 border-b border-amber-200 shrink-0">
        <button
          onClick={() => setRulesOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-left hover:bg-amber-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-[10px] font-mono text-amber-700 uppercase tracking-widest">
              Trauma-Informed Guidance — Practitioner Must Review Every Question
            </span>
          </div>
          {rulesOpen
            ? <ChevronUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
        </button>
        <AnimatePresence initial={false}>
          {rulesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-3.5 grid grid-cols-2 gap-x-8 gap-y-1.5">
                {NON_NEGOTIABLE.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-amber-800">
                    <span className="text-amber-400 shrink-0 mt-0.5">·</span>
                    {rule}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {!rulesOpen && (
            <div className="px-5 pb-2.5 flex flex-wrap gap-x-5 gap-y-0.5">
              {NON_NEGOTIABLE.slice(0, 3).map((r, i) => (
                <span key={i} className="text-[10px] text-amber-800">· {r}</span>
              ))}
              <span className="text-[10px] text-amber-600 font-mono">↑ expand for all {NON_NEGOTIABLE.length} rules</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Session setup panel (preserved exactly) ── */}
      <AnimatePresence>
        {showPlanning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-muted/20 shrink-0 overflow-hidden"
          >
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Interview Purpose</label>
                <textarea
                  className="w-full text-sm border border-border rounded-sm p-2 bg-card resize-none h-16 focus:outline-none focus:border-primary/50"
                  placeholder="What case-preparation purpose does this interview serve?"
                  value={planningNotes.purpose}
                  onChange={e => setPlanningNotes(p => ({ ...p, purpose: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Topics to Avoid (session-wide)</label>
                <textarea
                  className="w-full text-sm border border-border rounded-sm p-2 bg-card resize-none h-16 focus:outline-none focus:border-primary/50"
                  placeholder="Note any topics that should not be raised in this session."
                  value={planningNotes.topicsToAvoid}
                  onChange={e => setPlanningNotes(p => ({ ...p, topicsToAvoid: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Language / Interpreter</label>
                <input
                  className="w-full text-sm border border-border rounded-sm p-2 bg-card focus:outline-none focus:border-primary/50"
                  placeholder="Language required. Interpreter arranged?"
                  value={planningNotes.interpreter}
                  onChange={e => setPlanningNotes(p => ({ ...p, interpreter: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Accessibility Accommodation</label>
                <input
                  className="w-full text-sm border border-border rounded-sm p-2 bg-card focus:outline-none focus:border-primary/50"
                  placeholder="Any specific accommodation required?"
                  value={planningNotes.accessibility}
                  onChange={e => setPlanningNotes(p => ({ ...p, accessibility: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Intended Interviewer</label>
                <input
                  className="w-full text-sm border border-border rounded-sm p-2 bg-card focus:outline-none focus:border-primary/50"
                  placeholder="Practitioner conducting this interview"
                  value={planningNotes.interviewer}
                  onChange={e => setPlanningNotes(p => ({ ...p, interviewer: e.target.value }))}
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className={cn(
                  'flex items-start gap-2 p-3 rounded-sm border cursor-pointer transition-all',
                  consentConfirmed ? 'bg-teal-50 border-teal-200' : 'border-border bg-card',
                )}>
                  <div className={cn('w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center', consentConfirmed ? 'border-teal-600 bg-teal-600' : 'border-border')}>
                    {consentConfirmed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={consentConfirmed} onChange={e => setConsentConfirmed(e.target.checked)} />
                  <span className="text-xs text-muted-foreground">Consent to interview confirmed. Pause/stop considerations discussed.</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter bars ── */}
      <div className="border-b border-border bg-muted/20 px-4 py-2 shrink-0 space-y-1.5">
        {/* Status filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest shrink-0 w-14">Status</span>
          {(['all', 'pending-review', 'kept', 'edited', 'deferred', 'removed', 'inappropriate'] as const).map(s => {
            const count = s === 'all' ? questions.length : questions.filter(q => q.reviewStatus === s).length;
            const cfg = s === 'all' ? null : STATUS_CONFIG[s as InterviewQuestionStatus];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase rounded border transition-colors',
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20',
                )}
              >
                {cfg && <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />}
                {s === 'all' ? 'All' : cfg?.label}
                <span className={cn('text-[9px] px-1 rounded', statusFilter === s ? 'bg-white/20' : 'bg-muted')}>{count}</span>
              </button>
            );
          })}
        </div>
        {/* Gap filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest shrink-0 w-14">Gap</span>
          <button
            onClick={() => setGapFilter('all')}
            className={cn(
              'px-2 py-0.5 text-[10px] font-mono uppercase rounded border transition-colors',
              gapFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >All</button>
          {allGapIds.map(gid => (
            <button
              key={gid}
              onClick={() => setGapFilter(gid)}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase rounded border transition-colors',
                gapFilter === gid ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {gid}
              {gid === 'eg-5' && (
                <span className="text-[8px] bg-red-100 text-red-700 border border-red-200 px-1 rounded ml-0.5">NEW</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — question list */}
        <div className="w-[340px] flex flex-col border-r border-border bg-muted/10 overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">No questions match this filter.</div>
            )}
            {filtered.map(q => {
              const statusCfg = STATUS_CONFIG[q.reviewStatus];
              const isRemoved = q.reviewStatus === 'removed';
              const isSelected = selectedId === q.id;
              return (
                <motion.div
                  layout key={q.id}
                  onClick={() => !isRemoved && setSelectedId(q.id)}
                  className={cn(
                    'p-3.5 rounded-md border transition-all',
                    isRemoved ? 'opacity-40 cursor-default' : 'cursor-pointer',
                    isSelected && !isRemoved
                      ? 'bg-primary/5 border-primary/30 shadow-sm ring-1 ring-primary/10'
                      : !isRemoved ? 'bg-card border-border hover:border-foreground/15 hover:bg-muted/20' : 'bg-card border-border',
                  )}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusCfg.dot)} />
                      <span className={cn('text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border', statusCfg.color)}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/60">{q.id}</span>
                  </div>

                  {/* Question text */}
                  <p className={cn(
                    'text-[13px] leading-snug mb-2',
                    isRemoved ? 'line-through text-muted-foreground' : 'text-foreground font-medium',
                  )}>
                    "{q.questionText}"
                  </p>

                  {/* Gap + finding chips */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {q.addressesGapId && (
                      <span className="flex items-center gap-1 text-[9px] font-mono bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                        <HelpCircle className="w-2.5 h-2.5" />{q.addressesGapId}
                      </span>
                    )}
                    {q.relatedFindingId && (
                      <span className="flex items-center gap-1 text-[9px] font-mono bg-purple-50 border border-purple-200 text-purple-700 px-1.5 py-0.5 rounded">
                        <GitBranch className="w-2.5 h-2.5" />{q.relatedFindingId}
                      </span>
                    )}
                  </div>

                  {/* Reason snippet */}
                  {!isRemoved && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{q.reason}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — question detail */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.16 }}
                className="flex-1 overflow-y-auto pb-20"
              >
                <div className="p-5 space-y-5 max-w-3xl">

                  {/* ── Header ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-mono text-[10px] text-muted-foreground border border-border bg-muted/50 px-1.5 py-0.5 rounded">
                        {selected.id}
                      </span>
                      <span className={cn('text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border', STATUS_CONFIG[selected.reviewStatus].color)}>
                        {STATUS_CONFIG[selected.reviewStatus].label}
                      </span>
                      {selected.addressesGapId && (
                        <span className="flex items-center gap-1 text-[9px] font-mono bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                          <HelpCircle className="w-2.5 h-2.5" />
                          Gap: {GAP_LABELS[selected.addressesGapId] ?? selected.addressesGapId}
                        </span>
                      )}
                      {selected.relatedFindingId && (
                        <span className="flex items-center gap-1 text-[9px] font-mono bg-purple-50 border border-purple-200 text-purple-700 px-1.5 py-0.5 rounded">
                          <GitBranch className="w-2.5 h-2.5" />Nexus: {selected.relatedFindingId}
                        </span>
                      )}
                    </div>

                    {/* Suggested wording */}
                    <div className="bg-muted border-l-4 border-primary/40 rounded-md p-5">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2.5">Neutral Suggested Wording</div>
                      <p className="text-lg font-medium text-foreground leading-relaxed">
                        "{selected.questionText}"
                      </p>
                      <div className="mt-3 pt-3 border-t border-border/50 text-[10px] font-mono text-muted-foreground/70">
                        This wording is a starting point. Adapt to the person's language, pace, and needs in session.
                      </div>
                    </div>
                  </div>

                  {/* ── Why this may help ── */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="text-[10px] font-mono text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />Why This Question May Help
                    </div>
                    <p className="text-sm text-blue-900 leading-relaxed">{selected.reason}</p>
                  </div>

                  {/* ── Source context already known ── */}
                  {sourceCtx && (
                    <div className="border border-border rounded-md overflow-hidden">
                      <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Source Context Already Known</span>
                      </div>
                      <div className="p-4 space-y-3 bg-card">
                        <p className="text-[11px] text-muted-foreground leading-relaxed italic">{sourceCtx.summary}</p>
                        {sourceCtx.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-2.5 bg-muted/40 rounded-md border border-border/60">
                            <span className="font-mono text-[9px] bg-secondary border border-border text-foreground px-1.5 py-1 rounded shrink-0 mt-0.5 whitespace-nowrap">
                              {item.id}
                            </span>
                            <div>
                              <div className="text-[11px] font-medium text-foreground mb-0.5">{item.label}</div>
                              <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">{item.note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Sensitivity note ── */}
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />Sensitivity Note
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">{selected.sensitivityNote}</p>
                  </div>

                  {/* ── Topics to avoid ── */}
                  {topicsToAvoid && topicsToAvoid.length > 0 && (
                    <div className="border border-red-200 rounded-md overflow-hidden">
                      <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-center gap-2">
                        <EyeOff className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-[10px] font-mono text-red-700 uppercase tracking-widest">Topics to Avoid for This Question</span>
                      </div>
                      <div className="p-4 space-y-2 bg-white">
                        {topicsToAvoid.map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-red-800">
                            <X className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Practitioner notes ── */}
                  {selected.practitionerNote && (
                    <div className="bg-muted border border-border rounded-md p-4">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />Practitioner Notes
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{selected.practitionerNote}</p>
                    </div>
                  )}

                  {/* ── Non-negotiable reminder ── */}
                  <div className="border border-dashed border-amber-300 bg-amber-50/40 rounded-md p-4 space-y-1.5">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2">Non-Negotiable Reminder</div>
                    {NON_NEGOTIABLE.slice(0, 4).map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-amber-800">
                        <span className="text-amber-400 shrink-0">·</span>{r}
                      </div>
                    ))}
                  </div>

                  {/* ── UI preview disclosure ── */}
                  <div className="bg-muted border border-border rounded-md px-4 py-3 text-[10px] font-mono text-muted-foreground leading-relaxed">
                    UI preview — questions are not generated, approved, or sent in this design prototype.
                    No data is recorded, transmitted, or shared with any external system.
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a question to review
              </div>
            )}
          </AnimatePresence>

          {/* ── Sticky action bar ── */}
          {selected && (
            <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-card/97 backdrop-blur-md border-t border-border shadow-lg z-10">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Current status */}
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', STATUS_CONFIG[selected.reviewStatus].dot)} />
                  <span className={cn('text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm border', STATUS_CONFIG[selected.reviewStatus].color)}>
                    {STATUS_CONFIG[selected.reviewStatus].label}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Visual-only: Edit */}
                  <PreviewButton
                    icon={Edit2}
                    label="Edit"
                    className="bg-muted border-border text-muted-foreground"
                  />
                  {/* Visual-only: Mark Inappropriate */}
                  <PreviewButton
                    icon={Flag}
                    label="Mark Inappropriate"
                    className="bg-red-50 border-red-200 text-red-600"
                  />
                  {/* Working: Remove (preserved) */}
                  <button
                    onClick={() => setStatus(selected.id, 'removed')}
                    disabled={selected.reviewStatus === 'removed'}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1.5 rounded border bg-muted border-border text-muted-foreground hover:bg-card hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-3 h-3" />Remove
                  </button>
                  {/* Working: Defer (preserved) */}
                  <button
                    onClick={() => setStatus(selected.id, 'deferred')}
                    disabled={selected.reviewStatus === 'deferred'}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1.5 rounded border bg-muted border-border text-muted-foreground hover:bg-card hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Clock className="w-3 h-3" />Defer
                  </button>
                  {/* Working: Approve (preserved) */}
                  <button
                    onClick={() => setStatus(selected.id, 'kept')}
                    disabled={selected.reviewStatus === 'kept'}
                    className="flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1.5 rounded border bg-teal-600 border-teal-700 text-white hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-3 h-3" />Approve for Use
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
