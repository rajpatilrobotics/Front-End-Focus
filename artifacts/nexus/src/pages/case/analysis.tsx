import React, { useState, useEffect, useRef } from 'react';
import { MOCK_FINDINGS, MOCK_CONTEXT_GAPS, Finding, ContextGap, Citation, ReviewLane } from '@/data/mock-case';
import { EvidenceNatureBadge, OriginBadge, SupportStatusBadge, ReviewStatusBadge } from '@/components/badges';
import { SourceDrawer } from '@/components/source-drawer';
import {
  FileText, AlertTriangle, XCircle, ShieldAlert, Check, HelpCircle,
  BrainCircuit, Shield, EyeOff, Lock, CheckCircle2, Users, Loader2,
  Play, ChevronDown, X, Info, Database, RefreshCw,
  Sparkles, Edit2, Clock, Link2, ChevronRight, AlertCircle, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

// ── Existing types ────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'pending' | 'accepted' | 'edited' | 'rejected' | 'uncertain' | 'conflict' | 'export-blocker';
type ActiveLane = 'A' | 'B' | 'C';
type RunPhase = 'idle' | 'running' | 'complete' | 'replay-loaded';

// ── Existing config ───────────────────────────────────────────────────────────

  const LANE_META: Record<ActiveLane, { label: string; subLabel: string; color: string; activeColor: string }> = {
  A: { label: 'Lane A', subLabel: 'Trafficking Indicators',   color: 'text-primary', activeColor: 'border-primary text-primary bg-primary/5' },
  B: { label: 'Lane B', subLabel: 'Non-Punishment Relevance', color: 'text-emerald-500',   activeColor: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
  C: { label: 'Lane C', subLabel: 'Protection & Urgency',     color: 'text-purple-500', activeColor: 'border-purple-500 text-purple-700 bg-purple-50' },
};

const GAP_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unanswered:    { label: 'Unanswered',     color: 'bg-amber-50 text-amber-700 border-amber-200' },
  answered:      { label: 'Answered',       color: 'bg-teal-50 text-teal-700 border-teal-200' },
  deferred:      { label: 'Deferred',       color: 'bg-slate-50 text-slate-600 border-slate-200' },
  unknown:       { label: 'Unknown (Valid)',color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'out-of-scope':{ label: 'Out of Scope',   color: 'bg-muted text-muted-foreground border-border' },
};

const PROCESSING_STAGES: { label: string; icon: React.ElementType; detail: string }[] = [
  { label: 'Validate purpose and permissions', icon: Shield,        detail: 'Checking purpose brief completeness and practitioner role.' },
  { label: 'Confirm masking',                  icon: EyeOff,       detail: 'Scanning for unmasked PII in all 7 source documents.' },
  { label: 'Build redacted input',             icon: Lock,         detail: 'Constructing redacted evidence packet for analysis.' },
  { label: 'Analyze synthetic evidence',       icon: BrainCircuit, detail: 'Extracting candidate findings from 28 canonical segments.' },
  { label: 'Validate citations',               icon: FileText,     detail: 'Verifying all 23 citations against canonical segment IDs.' },
  { label: 'Quarantine unsafe output',         icon: ShieldAlert,  detail: 'Scanning for prohibited conclusions and injection attempts.' },
  { label: 'Prepare human-review queue',       icon: Users,        detail: 'Generating 14 candidate items for practitioner review.' },
];

// ── Phase 7: Static AI candidate data ────────────────────────────────────────

type CandidateStatus = 'pending' | 'accepted' | 'edited' | 'rejected' | 'uncertain' | 'unknown' | 'deferred' | 'abstained';

type AiCandidate = {
  id: string;
  title: string;
  description: string;
  evidenceNature: 'documented' | 'reported' | 'reviewer-supplied' | 'unknown';
  supportStatus: 'supported' | 'partially-supported' | 'conflicting' | 'insufficient' | 'unresolved';
  citations: { docId: string; page: number; excerpt: string; limitation?: string }[];
  runId: string;
  limitations: string[];
  relatedItem: { id: string; type: 'finding' | 'gap'; label: string };
  reviewStatus: CandidateStatus;
  reasoningTrace: string;
  abstainReason?: string;
};

const AI_CANDIDATES: AiCandidate[] = [
  {
    id: 'CAND-001',
    title: 'Passport retention documented in employment contract',
    description: 'The employment contract (d-1, p.3) contains a clause stating the original passport would be held for "safekeeping" by the named organisation. This is a documented statement within an approved source document.',
    evidenceNature: 'documented',
    supportStatus: 'partially-supported',
    citations: [
      {
        docId: 'd-1',
        page: 3,
        excerpt: '"Original passport held for safekeeping by [REDACTED_ORG_1] for the duration of the placement period."',
        limitation: 'Single-source — not independently corroborated. Passport retention is asserted in the contract but no third-party evidence of retention confirmed.',
      },
    ],
    runId: 'REPLAY-V1-2024-0047',
    limitations: [
      'Single source — not independently corroborated.',
      'AI cannot assess whether retention was voluntary or coerced — practitioner judgement required.',
    ],
    relatedItem: { id: 'f-1', type: 'finding', label: 'f-1 · Passport Retention' },
    reviewStatus: 'pending',
    reasoningTrace: 'The contract text in d-1 p.3 contains an explicit clause about passport retention. The clause was matched against the canonical segment for that page. The organisation name is masked. No corroborating document references this arrangement. The observation is flagged as partially-supported and single-source.',
  },
  {
    id: 'CAND-002',
    title: 'Wage deduction clause — $400/month placement fee',
    description: 'The employment contract (d-1, p.3) contains a clause deducting $400 per month for six months as a placement fee. This is a documented statement within an approved source document.',
    evidenceNature: 'documented',
    supportStatus: 'supported',
    citations: [
      {
        docId: 'd-1',
        page: 3,
        excerpt: '"A deduction of $400/month for placement fee will be applied for the first 6 months of employment."',
        limitation: 'Wage payment records are absent — deduction amount cannot be verified against actual payments made.',
      },
    ],
    runId: 'REPLAY-V1-2024-0047',
    limitations: [
      'Wage records absent (see eg-3) — deduction amount documented but not verifiable against payments.',
      'AI cannot characterise whether this constitutes debt bondage — practitioner judgement required.',
    ],
    relatedItem: { id: 'eg-3', type: 'gap', label: 'eg-3 · Wage records absent' },
    reviewStatus: 'pending',
    reasoningTrace: 'The deduction clause is explicitly stated in d-1 p.3. The canonical segment matches the contract text. The observation is flagged as supported at the document level, but limited because no wage payment records exist to verify whether deductions were actually applied.',
  },
  {
    id: 'CAND-003',
    title: 'Movement restriction reported by support provider',
    description: 'Support provider notes (d-2, p.5) record a reported statement describing restricted movement. This is a reported statement, not a documented fact.',
    evidenceNature: 'reported',
    supportStatus: 'insufficient',
    citations: [
      {
        docId: 'd-2',
        page: 5,
        excerpt: '"Client stated she was not permitted to leave the accommodation unaccompanied during working hours."',
        limitation: 'Single reported statement. No corroborating documentation. Statement recorded secondhand in support notes.',
      },
    ],
    runId: 'REPLAY-V1-2024-0047',
    limitations: [
      'Single reported statement — no corroborating documentation.',
      'Statement is secondhand — recorded in support notes, not a direct account.',
      'AI cannot assess credibility of reported statements — practitioner judgement required.',
    ],
    relatedItem: { id: 'f-2', type: 'finding', label: 'f-2 · Movement Restriction' },
    reviewStatus: 'pending',
    reasoningTrace: 'The support provider notes on d-2 p.5 contain a reported statement about movement restriction. The observation is classified as reported (not documented) and flagged as insufficient — a single secondhand statement without corroborating material.',
  },
  {
    id: 'CAND-004',
    title: 'Arrival date discrepancy between employment contract and border entry stamp',
    description: 'Employment offer letter (d-1, p.1) and border entry stamp (d-3, p.1) contain conflicting dates for arrival in the destination country. The discrepancy is documented across two source documents.',
    evidenceNature: 'documented',
    supportStatus: 'conflicting',
    citations: [
      {
        docId: 'd-1',
        page: 1,
        excerpt: '"Employment effective date: [REDACTED_DATE_1]."',
      },
      {
        docId: 'd-3',
        page: 1,
        excerpt: '"Entry recorded: [REDACTED_DATE_2]."',
        limitation: 'Border entry stamp on p.1 is partially legible — date cannot be fully confirmed from this source.',
      },
    ],
    runId: 'REPLAY-V1-2024-0047',
    limitations: [
      'd-3 p.1 partially legible — date unresolvable without a clearer copy (see task ct-1).',
      'Discrepancy may reflect an administrative variation rather than a substantive conflict — practitioner judgement required.',
    ],
    relatedItem: { id: 'eg-1', type: 'gap', label: 'eg-1 · Arrival date conflict' },
    reviewStatus: 'accepted',
    reasoningTrace: 'Two documents reference arrival or employment commencement dates. The dates do not align. d-3 p.1 is partially illegible. The observation is classified as conflicting — both documents are approved sources, but the conflict cannot be resolved without a clearer copy of d-3. The discrepancy is material to the non-punishment timeline.',
  },
  {
    id: 'CAND-005',
    title: 'AI abstained — legal conclusion on compelled labour statute requested',
    description: 'The analysis task included a segment requesting a legal conclusion on whether documented facts satisfy elements of a compelled labour statute. This falls outside the authorised scope.',
    evidenceNature: 'unknown',
    supportStatus: 'unresolved',
    citations: [],
    runId: 'REPLAY-V1-2024-0047',
    limitations: [],
    relatedItem: { id: 'f-9', type: 'finding', label: 'f-9 · Compelled Labour' },
    reviewStatus: 'abstained',
    abstainReason: 'Task requested a legal conclusion (whether facts satisfy elements of a criminal statute). This falls outside the authorised scope of AI assistance. No output was generated for this segment. Practitioner must make this assessment independently.',
    reasoningTrace: '',
  },
];

const PREREQUISITE_CHECKS = [
  { id: 'pre-1', label: 'Purpose authorized',    detail: 'Purpose brief complete and acknowledged (Phase 1)',       status: 'passed' as const },
  { id: 'pre-2', label: 'Documents approved',     detail: 'All 5 case documents processed; d-5 masking pending',    status: 'attention' as const },
  { id: 'pre-3', label: 'Masking reviewed',       detail: 'd-5 masking approval outstanding — AI operates on masked input only', status: 'attention' as const },
  { id: 'pre-4', label: 'Practitioner initiated', detail: 'Action must be explicitly initiated — no automatic runs', status: 'passed' as const },
];

const CANDIDATE_STATUS_CONFIG: Record<CandidateStatus, { label: string; chip: string; dot: string }> = {
  pending:   { label: 'Pending Review', chip: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
  accepted:  { label: 'Accepted',       chip: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-500' },
  edited:    { label: 'Edited',         chip: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  rejected:  { label: 'Rejected',       chip: 'bg-red-50 text-red-700 border-red-200',         dot: 'bg-red-500' },
  uncertain: { label: 'Uncertain',      chip: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500' },
  unknown:   { label: 'Confirmed Unknown', chip: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  deferred:  { label: 'Deferred',       chip: 'bg-muted text-muted-foreground border-border',  dot: 'bg-muted-foreground' },
  abstained: { label: 'AI Abstained',   chip: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
};

const EVIDENCE_NATURE_COLORS = {
  documented:        'bg-blue-50 text-blue-700 border-blue-200',
  reported:          'bg-amber-50 text-amber-700 border-amber-200',
  'reviewer-supplied':'bg-purple-50 text-purple-700 border-purple-200',
  unknown:           'bg-slate-50 text-slate-600 border-slate-200',
};

const SUPPORT_STATUS_COLORS = {
  supported:           'text-teal-700',
  'partially-supported':'text-amber-600',
  conflicting:         'text-red-600',
  insufficient:        'text-slate-500',
  unresolved:          'text-purple-700',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseAnalysis() {
  // ── Existing state ──────────────────────────────────────────────────────────
  const [findings, setFindings] = useState<Finding[]>(MOCK_FINDINGS);
  const [gaps, setGaps] = useState<ContextGap[]>(MOCK_CONTEXT_GAPS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_FINDINGS.filter(f => f.lane === 'A')[0]?.id || null);
  const [activeLane, setActiveLane] = useState<ActiveLane>('A');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [showCascadeModal, setShowCascadeModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCitation, setDrawerCitation] = useState<Citation | null>(null);
  const [showGaps, setShowGaps] = useState(false);

  // AI Run Experience state
  const [showRunModal, setShowRunModal] = useState(false);
  const [runPhase, setRunPhase] = useState<RunPhase>('idle');
  const [completedStages, setCompletedStages] = useState<number>(0);
  const [lastRunId, setLastRunId] = useState<string | null>('REPLAY-V1');
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Phase 7: new state ──────────────────────────────────────────────────────
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(AI_CANDIDATES[0].id);

  const selectedCandidate = AI_CANDIDATES.find(c => c.id === selectedCandidateId) ?? AI_CANDIDATES[0];

  // ── Existing computed ───────────────────────────────────────────────────────
  const selected = findings.find(f => f.id === selectedId);
  const pendingCount = findings.filter(f => f.reviewStatus === 'pending').length;
  const lanedFindings = findings.filter(f => f.lane === activeLane);

  const filteredFindings = lanedFindings.filter(f => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'conflict') return f.supportStatus === 'conflicting';
    if (filterStatus === 'export-blocker') return f.supportStatus === 'unresolved';
    return f.reviewStatus === filterStatus;
  });

  const laneGaps = gaps.filter(g => {
    if (activeLane === 'A') return g.category === 'Evidence Corroboration' || g.category === 'Source Authority' || g.category === 'Missing Evidence';
    if (activeLane === 'B') return g.category === 'Chronology' || g.category === 'Source Authority' || g.category === 'Missing Evidence';
    if (activeLane === 'C') return g.category === 'Procedural Urgency';
    return false;
  });

  // ── Existing handlers ───────────────────────────────────────────────────────

  const startRun = () => {
    setRunPhase('running');
    setCompletedStages(0);
    let stage = 0;
    const advance = () => {
      stage++;
      setCompletedStages(stage);
      if (stage < PROCESSING_STAGES.length) {
        stageTimerRef.current = setTimeout(advance, 750);
      } else {
        stageTimerRef.current = setTimeout(() => {
          setRunPhase('complete');
          setLastRunId('EVAL-' + Date.now().toString(36).toUpperCase());
        }, 500);
      }
    };
    stageTimerRef.current = setTimeout(advance, 600);
  };

  const loadReplay = () => {
    setRunPhase('replay-loaded');
    setLastRunId('REPLAY-V1');
  };

  const closeModal = () => {
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    setShowRunModal(false);
    if (runPhase === 'running') setRunPhase('idle');
  };

  useEffect(() => () => { if (stageTimerRef.current) clearTimeout(stageTimerRef.current); }, []);

  const handleWithdraw = (id: string) => {
    setWithdrawingId(id);
    const finding = findings.find(f => f.id === id);
    if (finding?.dependencies && finding.dependencies.length > 0) {
      setShowCascadeModal(true);
    } else {
      executeWithdraw(id);
    }
  };

  const executeWithdraw = (id: string) => {
    setFindings(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(f => f.id === id);
      if (idx > -1) {
        updated[idx] = { ...updated[idx], reviewStatus: 'pending' };
        (updated[idx].dependencies || []).forEach(depId => {
          const di = updated.findIndex(f => f.id === depId);
          if (di > -1) updated[di] = { ...updated[di], supportStatus: 'unresolved', reviewStatus: 'pending' };
        });
      }
      return updated;
    });
    setShowCascadeModal(false);
    setWithdrawingId(null);
  };

  const handleAction = (id: string, action: Finding['reviewStatus']) => {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, reviewStatus: action } : f));
  };

  const handleGapAction = (id: string, status: ContextGap['status']) => {
    setGaps(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  const openDrawer = (citation: Citation) => {
    setDrawerCitation(citation);
    setDrawerOpen(true);
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'coercion':          'border-purple-200 bg-purple-50 text-purple-700',
      'relationship':      'border-blue-200 bg-blue-50 text-blue-700',
      'compelled-task':    'border-amber-200 bg-amber-50 text-amber-700',
      'contradiction':     'border-red-200 bg-red-50 text-red-700',
      'evidence-gap':      'border-slate-200 bg-slate-50 text-slate-600',
      'protection-urgency':'border-orange-200 bg-orange-50 text-orange-700',
      'timeline-link':     'border-indigo-200 bg-indigo-50 text-indigo-700',
    };
    return map[type] || 'border-border text-muted-foreground bg-muted';
  };

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: 'all',          label: 'All' },
    { key: 'pending',      label: 'Pending' },
    { key: 'accepted',     label: 'Accepted' },
    { key: 'edited',       label: 'Edited' },
    { key: 'rejected',     label: 'Rejected' },
    { key: 'uncertain',    label: 'Uncertain' },
    { key: 'conflict',     label: 'Conflict' },
    { key: 'export-blocker', label: 'Blocker' },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">

      {/* ── Analysis Run Status Bar ── */}
      <div className={cn(
        "border-b px-5 py-3 flex items-center justify-between shrink-0 transition-colors",
        runPhase === 'complete' ? "bg-teal-50 border-teal-200" : "bg-card border-border"
      )}>
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Structured Analysis</h2>
          {pendingCount > 0 && (
            <span className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-sm">
              {pendingCount} PENDING
            </span>
          )}
          {lastRunId && (
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              {runPhase === 'replay-loaded' ? (
                <span className="text-amber-600 font-semibold">PREPARED REPLAY: {lastRunId}</span>
              ) : runPhase === 'complete' ? (
                <span className="text-teal-700 font-semibold">EVALUATED: {lastRunId}</span>
              ) : (
                <span>Last run: {lastRunId}</span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Phase 7: AI Assistance toggle */}
          <button
            onClick={() => setShowAiPanel(v => !v)}
            className={cn(
              "h-7 px-3 text-xs font-medium rounded-sm border flex items-center gap-1.5 transition-colors",
              showAiPanel
                ? "bg-violet-50 border-violet-300 text-violet-700"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            )}
          >
            <Sparkles className="w-3 h-3" />
            AI Assistance
          </button>

          {runPhase === 'running' && (
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Running analysis…
            </div>
          )}
          {runPhase !== 'running' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setRunPhase('idle'); setShowRunModal(true); loadReplay(); }}
                className="h-7 text-xs gap-1.5 border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                <RefreshCw className="w-3 h-3" />Load Replay
              </Button>
              <Button
                size="sm"
                onClick={() => { setRunPhase('idle'); setCompletedStages(0); setShowRunModal(true); }}
                className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="w-3 h-3" />Start Analysis
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Existing: Replay disclosure banner ── */}
      <AnimatePresence>
        {runPhase === 'replay-loaded' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-3 text-xs text-amber-800">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Prepared Replay loaded — {lastRunId}.</strong> This is a deterministic fixture output, not a live AI run.
                All findings below reflect the pre-loaded synthetic replay state. No provider call was made.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 7: AI availability banner ── */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="bg-violet-50 border-b border-violet-200 px-5 py-2.5 flex items-center gap-3">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="text-xs text-violet-800">
                <strong>Prepared demonstration — no live AI processing.</strong>{' '}
                All observations below are static synthetic data. No model call has been made and no provider has been contacted.
              </span>
              <span className="ml-auto text-[10px] font-mono bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-sm shrink-0">
                ILLUSTRATIVE UI DATA
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Existing: Lane tabs — hidden when AI panel active ── */}
      {!showAiPanel && (
        <>
          <div className="border-b border-border bg-card/50 px-5 flex items-end gap-0 shrink-0">
            {(Object.entries(LANE_META) as [ActiveLane, typeof LANE_META[ActiveLane]][]).map(([lane, meta]) => {
              const count = findings.filter(f => f.lane === lane).length;
              return (
                <button
                  key={lane}
                  onClick={() => { setActiveLane(lane); setSelectedId(null); setFilterStatus('all'); }}
                  className={cn(
                    "flex flex-col items-start px-4 py-2.5 border-l-4 border-b-2 text-left transition-colors min-w-[140px]",
                    activeLane === lane ? `${meta.activeColor}` : "border-b-transparent border-l-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-xs font-bold font-mono", activeLane === lane ? meta.color : '')}>{meta.label}</span>
                    <span className="text-[10px] font-mono bg-muted border border-border px-1 rounded text-muted-foreground">{count}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{meta.subLabel}</span>
                </button>
              );
            })}
            <div className="ml-auto pb-2">
              <button
                onClick={() => setShowGaps(v => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors",
                  showGaps ? "bg-amber-50 border-amber-200 text-amber-700" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                <HelpCircle className="w-3.5 h-3.5" />Context Gaps
                {laneGaps.filter(g => g.status === 'unanswered').length > 0 && (
                  <span className="bg-amber-500 text-white text-[9px] font-bold px-1 rounded">
                    {laneGaps.filter(g => g.status === 'unanswered').length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Context gaps panel */}
          <AnimatePresence>
            {showGaps && laneGaps.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 overflow-hidden border-b border-border bg-amber-50/30"
              >
                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                    Context Gaps — {activeLane === 'A' ? 'Evidence & Source' : activeLane === 'B' ? 'Chronology & Missing Evidence' : 'Procedural Urgency'}
                  </div>
                  {laneGaps.map(gap => (
                    <div key={gap.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg shadow-sm">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{gap.question}</p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-[10px] font-mono text-muted-foreground">{gap.category}</span>
                          {gap.relatedFindingIds.map(fid => (
                            <span key={fid} onClick={() => setSelectedId(fid)}
                              className="text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/5">{fid}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {(['answered', 'deferred', 'unknown', 'out-of-scope'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => handleGapAction(gap.id, s)}
                            className={cn(
                              "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border transition-colors",
                              gap.status === s ? GAP_STATUS_CONFIG[s].color : "border-border text-muted-foreground hover:border-foreground/20"
                            )}
                          >
                            {s.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                      <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded border shrink-0", GAP_STATUS_CONFIG[gap.status].color)}>
                        {GAP_STATUS_CONFIG[gap.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Main content: either existing panel or Phase 7 AI panel ── */}
      {!showAiPanel ? (
        // ── Existing: Findings PanelGroup (preserved exactly) ──
        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          <Panel defaultSize={42} minSize={28} className="flex flex-col border-r border-border bg-muted/10 overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-card/50 flex items-center gap-1 overflow-x-auto shrink-0">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={cn(
                    "shrink-0 px-2.5 py-1 text-[10px] font-mono uppercase rounded border transition-colors",
                    filterStatus === f.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  )}
                >
                  {f.label}
                  {f.key === 'pending' && pendingCount > 0 && (
                    <span className="ml-1 text-[9px] bg-blue-600 text-white px-1 rounded">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredFindings.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm font-mono">No items match this filter.</div>
              )}
              {filteredFindings.map(finding => (
                <motion.div
                  layout key={finding.id}
                  onClick={() => setSelectedId(finding.id)}
                  className={cn(
                    "p-3.5 rounded-lg border cursor-pointer transition-all",
                    selectedId === finding.id
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15 hover:bg-muted/20",
                    finding.supportStatus === 'unresolved' && "ring-1 ring-amber-400 border-amber-300"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn("text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border", getTypeColor(finding.type))}>
                      {finding.type.replace(/-/g, ' ')}
                    </span>
                    <ReviewStatusBadge status={finding.reviewStatus} />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1 leading-tight">{finding.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{finding.description}</p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                    <SupportStatusBadge status={finding.supportStatus} />
                    <span className="text-border text-xs">·</span>
                    <OriginBadge origin={finding.origin} />
                  </div>
                </motion.div>
              ))}

              <div className="mt-6 pt-4 border-t border-dashed border-border">
                <h4 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">AI Limitations &amp; Abstentions</h4>
                <div className="bg-muted border border-border p-3 rounded-lg text-xs text-muted-foreground space-y-2">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    AI abstained from d-5 (handwriting illegibility).
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    Legal conclusions on 18 U.S.C. § 1589 excluded from model scope.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-0.5 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

          <Panel minSize={30} className="flex flex-col bg-card relative overflow-hidden">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 overflow-y-auto flex flex-col h-full"
                >
                  <div className="p-7 pb-28 space-y-6">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn("text-[10px] uppercase font-mono px-2 py-1 rounded border", getTypeColor(selected.type))}>
                        {selected.type.replace(/-/g, ' ')}
                      </span>
                      <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded border font-semibold", LANE_META[selected.lane].activeColor)}>
                        {LANE_META[selected.lane].label} · {LANE_META[selected.lane].subLabel}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs ml-auto">ID: {selected.id}</span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-3">{selected.title}</h2>
                      <p className="text-base text-foreground/80 leading-relaxed">{selected.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted border border-border p-3.5 rounded-lg">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Evidence Nature</div>
                        <EvidenceNatureBadge nature={selected.evidenceNature} />
                      </div>
                      <div className="bg-muted border border-border p-3.5 rounded-lg">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Origin</div>
                        <OriginBadge origin={selected.origin} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Source Citations</h3>
                      {selected.citations.length > 0 ? selected.citations.map((cit, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                          <div className="bg-muted px-4 py-2 flex justify-between items-center border-b border-border">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">{cit.sourceAuthority || `Doc ${cit.documentId}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-muted-foreground">PAGE {cit.page}</span>
                              <button
                                onClick={() => openDrawer(cit)}
                                className="text-[10px] font-mono text-primary hover:text-primary/80 border border-primary/30 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded transition-colors"
                              >
                                View Source ↗
                              </button>
                            </div>
                          </div>
                          <div className="p-4 font-mono text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/40 ml-4 my-3 pl-4">
                            "{cit.text}"
                          </div>
                          {cit.limitations && (
                            <div className="mx-4 mb-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-md">
                              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />{cit.limitations}
                            </div>
                          )}
                        </div>
                      )) : (
                        <p className="text-muted-foreground font-mono text-sm italic">No direct citations linked.</p>
                      )}
                    </div>

                    {selected.missingContext && selected.missingContext.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-mono text-amber-700 uppercase tracking-widest border-b border-amber-200 pb-2">Missing Evidence</h3>
                        {selected.missingContext.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />{m}
                          </div>
                        ))}
                      </div>
                    )}

                    {selected.contradictions && (
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-mono text-red-600 uppercase tracking-widest border-b border-red-200 pb-2 flex items-center gap-2">
                          <XCircle className="w-3.5 h-3.5" />Contradictory Evidence
                        </h3>
                        {selected.contradictions.map((c, i) => (
                          <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{c}</div>
                        ))}
                      </div>
                    )}

                    {selected.dependencies && selected.dependencies.length > 0 && (
                      <div className="p-4 bg-muted border border-border rounded-lg">
                        <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Dependency Chain</h3>
                        <p className="text-sm text-muted-foreground mb-2">Supports {selected.dependencies.length} downstream Nexus item(s).</p>
                        <div className="flex gap-2 flex-wrap">
                          {selected.dependencies.map(dep => (
                            <span key={dep} onClick={() => setSelectedId(dep)}
                              className="text-xs font-mono bg-secondary text-foreground px-2 py-1 rounded border border-border cursor-pointer hover:bg-primary/5">{dep}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review action bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-md border-t border-border z-10 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">STATUS:</span>
                        <ReviewStatusBadge status={selected.reviewStatus} />
                      </div>
                      <div className="flex gap-2">
                        {selected.reviewStatus === 'accepted' ? (
                          <Button variant="outline" size="sm" className="bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 text-xs" onClick={() => handleWithdraw(selected.id)}>
                            Withdraw
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" className="bg-card border-border text-foreground hover:bg-muted text-xs" onClick={() => handleAction(selected.id, 'rejected')}>Reject</Button>
                            <Button variant="outline" size="sm" className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 text-xs" onClick={() => handleAction(selected.id, 'uncertain')}>Uncertain</Button>
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs min-w-[90px]" onClick={() => handleAction(selected.id, 'accepted')}>
                              <Check className="w-3.5 h-3.5 mr-1.5" />Accept
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                  Select a finding to review
                </div>
              )}
            </AnimatePresence>
          </Panel>
        </PanelGroup>

      ) : (

        // ── Phase 7: AI Assistance panel ──
        <div className="flex-1 overflow-hidden flex flex-col">

          {/* Authorized scope + prerequisites */}
          <div className="border-b border-border bg-card/60 px-5 py-3 shrink-0 flex items-start gap-6 flex-wrap">
            {/* Authorized purpose */}
            <div className="flex-1 min-w-[260px]">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Authorized Purpose</div>
              <p className="text-xs text-foreground leading-relaxed">
                Create source-linked candidate observations from approved case documents for practitioner review.
                AI may not generate legal conclusions, risk scores, credibility assessments, or trafficking determinations.
              </p>
            </div>
            {/* Prerequisite checklist */}
            <div className="flex flex-col gap-1.5 shrink-0">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5">Prerequisites</div>
              {PREREQUISITE_CHECKS.map(pre => (
                <div key={pre.id} className="flex items-center gap-2 text-xs">
                  {pre.status === 'passed'
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  <span className={cn(pre.status === 'passed' ? "text-foreground" : "text-amber-800")}>{pre.label}</span>
                  <span className="text-muted-foreground hidden lg:inline">— {pre.detail}</span>
                </div>
              ))}
            </div>
            {/* Prepare button */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <Button size="sm" variant="outline" className="h-7 text-xs border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 gap-1.5">
                <Sparkles className="w-3 h-3" />Prepare Candidate Observations
              </Button>
              <span className="text-[10px] font-mono text-muted-foreground">Visual-only — no processing occurs</span>
            </div>
          </div>

          {/* Core statement */}
          <div className="border-b border-border bg-muted/20 px-5 py-2 shrink-0 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <p className="text-[11px] font-mono text-muted-foreground">
              <strong className="text-foreground">AI suggestions never become findings without an explicit practitioner decision.</strong>{' '}
              Every candidate below requires individual review, acceptance or rejection, and citation verification before it can enter the case record.
            </p>
          </div>

          {/* Split: candidate queue + detail */}
          <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">

            {/* Left: candidate queue */}
            <Panel defaultSize={40} minSize={28} className="flex flex-col border-r border-border bg-muted/10 overflow-hidden">
              <div className="px-3 py-2 border-b border-border bg-card/50 shrink-0 flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  {AI_CANDIDATES.length} Candidates · Run {AI_CANDIDATES[0].runId}
                </span>
                <span className="text-[9px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                  ILLUSTRATIVE UI DATA
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {AI_CANDIDATES.map(candidate => {
                  const statusCfg = CANDIDATE_STATUS_CONFIG[candidate.reviewStatus];
                  const isSelected = selectedCandidateId === candidate.id;
                  const isAbstained = candidate.reviewStatus === 'abstained';

                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className={cn(
                        "p-3.5 rounded-sm border cursor-pointer transition-all",
                        isSelected
                          ? "bg-primary/5 border-primary/25 shadow-sm"
                          : isAbstained
                            ? "bg-orange-50/30 border-orange-200 opacity-75 hover:opacity-100"
                            : "bg-card border-border hover:border-foreground/15 hover:bg-muted/20"
                      )}
                    >
                      {/* AI suggestion label — always present */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-mono bg-violet-50 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />AI suggestion — not verified
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground ml-auto">{candidate.id}</span>
                      </div>

                      <h3 className={cn(
                        "text-sm font-medium leading-snug mb-1.5",
                        isAbstained ? "text-muted-foreground italic" : "text-foreground"
                      )}>
                        {candidate.title}
                      </h3>

                      {!isAbstained && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border", EVIDENCE_NATURE_COLORS[candidate.evidenceNature])}>
                            {candidate.evidenceNature}
                          </span>
                          <span className={cn("text-[9px] font-mono", SUPPORT_STATUS_COLORS[candidate.supportStatus])}>
                            {candidate.supportStatus.replace(/-/g, ' ')}
                          </span>
                          {candidate.citations.length > 0 && (
                            <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5">
                              <FileText className="w-2.5 h-2.5" />{candidate.citations.length} cit.
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border flex items-center gap-1", statusCfg.chip)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusCfg.dot)} />
                          {statusCfg.label}
                        </span>
                        {candidate.relatedItem && (
                          <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                            <Link2 className="w-2.5 h-2.5" />{candidate.relatedItem.id}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <PanelResizeHandle className="w-0.5 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

            {/* Right: candidate detail */}
            <Panel minSize={30} className="flex flex-col bg-card overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCandidate.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="p-6 pb-24 space-y-5">

                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-[9px] font-mono bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />AI suggestion — not verified
                        </span>
                        <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border", CANDIDATE_STATUS_CONFIG[selectedCandidate.reviewStatus].chip)}>
                          {CANDIDATE_STATUS_CONFIG[selectedCandidate.reviewStatus].label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground ml-auto">{selectedCandidate.id}</span>
                      </div>
                      <h2 className="text-lg font-bold text-foreground mb-1 leading-snug">{selectedCandidate.title}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedCandidate.description}</p>
                    </div>

                    {/* Abstain notice */}
                    {selectedCandidate.reviewStatus === 'abstained' && selectedCandidate.abstainReason && (
                      <div className="border border-orange-200 bg-orange-50 rounded-sm p-4 flex items-start gap-2.5">
                        <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800 mb-1">AI Abstained</p>
                          <p className="text-xs text-orange-700 leading-relaxed">{selectedCandidate.abstainReason}</p>
                        </div>
                      </div>
                    )}

                    {selectedCandidate.reviewStatus !== 'abstained' && (
                      <>
                        {/* Evidence nature + support status */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted border border-border rounded-sm p-3">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Evidence Nature</div>
                            <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border", EVIDENCE_NATURE_COLORS[selectedCandidate.evidenceNature])}>
                              {selectedCandidate.evidenceNature}
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                              {selectedCandidate.evidenceNature === 'documented' && 'Content appears in an approved source document.'}
                              {selectedCandidate.evidenceNature === 'reported' && 'Content is a reported statement, not a document fact.'}
                              {selectedCandidate.evidenceNature === 'reviewer-supplied' && 'Supplied by a practitioner reviewer.'}
                              {selectedCandidate.evidenceNature === 'unknown' && 'Evidence nature could not be determined.'}
                            </p>
                          </div>
                          <div className="bg-muted border border-border rounded-sm p-3">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Support Status</div>
                            <span className={cn("text-xs font-medium font-mono", SUPPORT_STATUS_COLORS[selectedCandidate.supportStatus])}>
                              {selectedCandidate.supportStatus.replace(/-/g, ' ')}
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                              {selectedCandidate.supportStatus === 'supported' && 'Observation is supported by available source material.'}
                              {selectedCandidate.supportStatus === 'partially-supported' && 'Observation has some evidentiary basis but lacks full corroboration.'}
                              {selectedCandidate.supportStatus === 'conflicting' && 'Source documents conflict on this point.'}
                              {selectedCandidate.supportStatus === 'insufficient' && 'Source material is insufficient to support the observation.'}
                            </p>
                          </div>
                        </div>

                        {/* Source citations */}
                        {selectedCandidate.citations.length > 0 && (
                          <div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2 mb-3">
                              Source Citations
                            </div>
                            <div className="space-y-3">
                              {selectedCandidate.citations.map((cit, i) => (
                                <div key={i} className="border border-border rounded-sm overflow-hidden">
                                  <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
                                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                      <FileText className="w-3 h-3 text-muted-foreground" />{cit.docId} · p.{cit.page}
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground">Exact citation required</span>
                                  </div>
                                  <div className="p-4 font-mono text-sm text-foreground/80 leading-relaxed border-l-2 border-violet-300 ml-4 my-3 pl-4">
                                    {cit.excerpt}
                                  </div>
                                  {cit.limitation && (
                                    <div className="mx-4 mb-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-sm">
                                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />{cit.limitation}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reasoning trace */}
                        {selectedCandidate.reasoningTrace && (
                          <div className="border border-violet-200 rounded-sm overflow-hidden">
                            <div className="bg-violet-50 border-b border-violet-200 px-4 py-2 flex items-center gap-2">
                              <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
                              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-700">Reasoning Trace — Plain Language</span>
                              <span className="ml-auto text-[9px] font-mono bg-violet-100 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded-sm">AI suggestion — not verified</span>
                            </div>
                            <div className="px-4 py-3 bg-violet-50/20">
                              <p className="text-sm text-foreground leading-relaxed">{selectedCandidate.reasoningTrace}</p>
                            </div>
                          </div>
                        )}

                        {/* Limitations */}
                        {selectedCandidate.limitations.length > 0 && (
                          <div className="border border-amber-200 rounded-sm overflow-hidden">
                            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700">Known Limitations &amp; Missing Context</span>
                            </div>
                            <ul className="divide-y divide-amber-100">
                              {selectedCandidate.limitations.map((lim, i) => (
                                <li key={i} className="px-4 py-2.5 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/30">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  {lim}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Related item */}
                        <div className="border border-border rounded-sm px-4 py-3 flex items-center gap-2.5">
                          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-0.5">
                              Related {selectedCandidate.relatedItem.type === 'gap' ? 'Evidence Gap' : 'Finding'}
                            </div>
                            <p className="text-sm text-foreground font-mono">{selectedCandidate.relatedItem.label}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                        </div>

                        {/* Origin + run ID */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted border border-border rounded-sm p-3">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Origin</div>
                            <span className="text-xs font-mono text-foreground">ai-suggestion</span>
                          </div>
                          <div className="bg-muted border border-border rounded-sm p-3">
                            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Analysis Run ID</div>
                            <span className="text-xs font-mono text-foreground">{selectedCandidate.runId}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Evaluation evidence */}
                    <div className="border border-border rounded-sm overflow-hidden">
                      <div className="bg-muted border-b border-border px-4 py-2 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Evaluation Evidence</span>
                        <span className="ml-auto text-[9px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                          Illustrative UI data — not measured results
                        </span>
                      </div>
                      <div className="divide-y divide-border/50">
                        {[
                          { label: 'Tested task',               value: 'Extract source-linked candidate observations from approved case documents' },
                          { label: 'Evaluation dataset',        value: 'eval-set-v0.3-synthetic (illustrative)' },
                          { label: 'Evaluation date',           value: '2024-01-15 (illustrative)' },
                          { label: 'Citation requirement',      value: 'Required — candidates without a verifiable citation segment are suppressed' },
                          { label: 'Abstention behavior',       value: 'Model abstains from legal conclusions, trafficking determinations, and victim-status assessments' },
                          { label: 'Known failure modes',       value: 'May omit material from image-only pages; may misattribute page numbers in multi-column layouts' },
                        ].map(row => (
                          <div key={row.label} className="px-4 py-2.5 flex items-start gap-4 text-xs">
                            <span className="text-[10px] font-mono uppercase text-muted-foreground w-36 shrink-0 mt-0.5">{row.label}</span>
                            <span className="text-foreground leading-relaxed">{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-border bg-muted/20">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          All values above are illustrative UI data displayed to show what a completed evaluation record would contain.
                          They will be replaced with genuinely measured results before any operational use. Do not treat these values as measured accuracy claims.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Practitioner action bar */}
                  {selectedCandidate.reviewStatus !== 'abstained' && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-md border-t border-border z-10 shadow-lg">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">Review:</span>
                          <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border", CANDIDATE_STATUS_CONFIG[selectedCandidate.reviewStatus].chip)}>
                            {CANDIDATE_STATUS_CONFIG[selectedCandidate.reviewStatus].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:bg-muted">
                            <Clock className="w-3 h-3 mr-1" />Defer
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
                            Confirm Unknown
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50">
                            Mark Uncertain
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-border text-foreground hover:bg-muted">
                            <Edit2 className="w-3 h-3 mr-1" />Edit
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50">
                            <XCircle className="w-3 h-3 mr-1" />Reject
                          </Button>
                          <Button size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                            <Check className="w-3 h-3 mr-1" />Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </Panel>
          </PanelGroup>
        </div>
      )}

      {/* ── Existing: Analysis Run Modal (preserved exactly) ── */}
      <AnimatePresence>
        {showRunModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-border flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    {runPhase === 'replay-loaded' ? 'Prepared Replay' : 'Evaluated AI Analysis'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {runPhase === 'replay-loaded'
                      ? 'Deterministic synthetic fixture — no live AI provider call.'
                      : 'Interactive UI prototype — no live provider call is performed in this preview.'}
                  </p>
                </div>
                {(runPhase === 'complete' || runPhase === 'replay-loaded') && (
                  <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {runPhase === 'replay-loaded' && (
                <div className="p-5">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />Prepared Replay Disclosure
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      You are loading a deterministic pre-run fixture output ({lastRunId}).
                      This is clearly labelled and is not presented as live AI output.
                      The findings below reflect the replay state. No provider call was made.
                    </p>
                  </div>
                  <div className="bg-muted border border-border rounded-lg p-3.5 font-mono text-xs space-y-1.5">
                    {[['runId', lastRunId!], ['runMethod', 'prepared-replay'], ['providerTransmission', 'false'], ['candidatesExtracted', '14'], ['citationsValidated', '23']].map(([k, v]) => (
                      <div key={k} className="flex gap-3">
                        <span className="text-primary">{k}:</span>
                        <span className="text-foreground">{v}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={closeModal} className="w-full mt-4 bg-primary text-primary-foreground">
                    Load Replay State
                  </Button>
                </div>
              )}

              {runPhase === 'idle' && (
                <div className="p-5 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-800 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    Interactive UI prototype — no live provider call is performed in this preview. Provider selection is not exposed to practitioners.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={startRun}
                      className="p-4 rounded-lg border-2 border-primary bg-primary/5 text-left hover:bg-primary/10 transition-colors"
                    >
                      <Play className="w-5 h-5 text-primary mb-2" />
                      <div className="font-semibold text-foreground text-sm mb-1">Evaluated AI Run</div>
                      <p className="text-xs text-muted-foreground">Simulates the 7-stage analysis pipeline with validation and safety checks.</p>
                    </button>
                    <button
                      onClick={loadReplay}
                      className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50 text-left hover:bg-amber-100 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-amber-600 mb-2" />
                      <div className="font-semibold text-foreground text-sm mb-1">Prepared Replay</div>
                      <p className="text-xs text-muted-foreground">Loads the deterministic synthetic fixture output. Clearly labelled — not live AI.</p>
                    </button>
                  </div>
                </div>
              )}

              {(runPhase === 'running' || runPhase === 'complete') && (
                <div className="p-5">
                  <div className="space-y-2.5 mb-5">
                    {PROCESSING_STAGES.map((stage, i) => {
                      const done   = completedStages > i;
                      const active = runPhase === 'running' && completedStages === i;
                      const Icon   = stage.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0.4 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                            done ? "bg-teal-50 border-teal-200" : active ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                            done ? "bg-teal-100 border border-teal-200" : active ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"
                          )}>
                            {done ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            ) : active ? (
                              <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            ) : (
                              <Icon className="w-4 h-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn("text-sm font-medium", done ? "text-teal-800" : active ? "text-foreground" : "text-muted-foreground")}>
                              {i + 1}. {stage.label}
                            </div>
                            {(done || active) && (
                              <div className={cn("text-[10px] font-mono mt-0.5", done ? "text-teal-600" : "text-muted-foreground")}>{stage.detail}</div>
                            )}
                          </div>
                          {done && (
                            <span className="text-[9px] font-mono uppercase text-teal-700 bg-teal-100 border border-teal-200 px-1.5 py-0.5 rounded shrink-0">
                              {i === 5 ? 'CLEAN' : 'PASS'}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {runPhase === 'complete' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                        <div className="text-[10px] font-mono text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />Analysis Complete
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          {[['14', 'Candidates'], ['23', 'Citations verified'], ['0', 'Quarantined']].map(([n, l]) => (
                            <div key={l}>
                              <div className="text-2xl font-bold font-mono text-teal-700">{n}</div>
                              <div className="text-[10px] text-teal-600">{l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground bg-muted border border-border rounded p-3 space-y-1">
                        {[['runId', lastRunId!], ['method', 'evaluated-ai-prototype'], ['providerTransmission', 'false']].map(([k, v]) => (
                          <div key={k} className="flex gap-3">
                            <span className="text-primary">{k}:</span><span>{v}</span>
                          </div>
                        ))}
                      </div>
                      <Button onClick={closeModal} className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white">
                        View Findings Queue
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Existing: Cascade modal (preserved exactly) ── */}
      {showCascadeModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-lg font-bold text-amber-700 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />Dependency Cascade Warning
              </h3>
              <p className="text-muted-foreground text-sm">Withdrawing <strong className="text-foreground">{selected.title}</strong> will destabilize downstream Nexus items.</p>
            </div>
            <div className="p-5 bg-muted/30 space-y-2">
              {selected.dependencies?.map(depId => {
                const dep = findings.find(f => f.id === depId);
                return dep ? (
                  <div key={depId} className="flex items-center gap-3 p-2.5 bg-background border border-border rounded-lg">
                    <span className="text-xs font-mono text-muted-foreground">{depId}</span>
                    <span className="text-sm text-foreground">{dep.title}</span>
                  </div>
                ) : null;
              })}
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">This will block the Export Gate until affected findings are re-reviewed.</p>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-card">
              <Button variant="outline" size="sm" onClick={() => setShowCascadeModal(false)}>Cancel</Button>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => selected && executeWithdraw(selected.id)}>
                Proceed with Withdrawal
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <SourceDrawer
        open={drawerOpen}
        citation={drawerCitation}
        onClose={() => setDrawerOpen(false)}
        onReveal={() => setDrawerOpen(false)}
      />
    </div>
  );
}
