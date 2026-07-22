import React, { useState } from 'react';
import {
  MOCK_CASES, MOCK_FINDINGS, MOCK_EVIDENCE_GAPS, MOCK_URGENT_NEEDS
} from '@/data/mock-case';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, FileWarning, EyeOff, Lock, Network,
  ArrowRight, Download, FileJson, FileText, Code2, CheckCircle2, ChevronDown,
  ChevronUp, HelpCircle, Phone, Info, XCircle, AlertCircle, User, FileCheck,
  Hash, Calendar, Shield, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

// ── Existing config (preserved) ───────────────────────────────────────────────

type ExportFormat = 'html' | 'json' | 'pdf';

const ALL_GATE_CHECKS = [
  { id: 'gc-1',  category: 'Purpose',   label: 'Purpose Brief completeness',                           status: 'pass' },
  { id: 'gc-2',  category: 'Purpose',   label: 'Authority acknowledgements confirmed',                  status: 'pass' },
  { id: 'gc-3',  category: 'Purpose',   label: 'Synthetic-data acknowledgements confirmed',             status: 'pass' },
  { id: 'gc-4',  category: 'Documents', label: 'Document processing completed',                        status: 'pass' },
  { id: 'gc-5',  category: 'Documents', label: 'Coverage calculation verified',                        status: 'pass' },
  { id: 'gc-6',  category: 'Masking',   label: 'Masking review approved for all documents',             status: 'fail', detail: 'd-5 masking approval pending' },
  { id: 'gc-7',  category: 'Masking',   label: 'Deterministic leak scan passed',                       status: 'pass' },
  { id: 'gc-8',  category: 'Review',    label: 'All consequential items individually reviewed',         status: 'fail', detail: '4 items pending practitioner review' },
  { id: 'gc-9',  category: 'Review',    label: 'Citation validity — all 23 citations',                 status: 'pass' },
  { id: 'gc-10', category: 'Nexus',     label: 'Dependency resolution complete',                       status: 'fail', detail: '1 unresolved cascade from withdrawn finding' },
  { id: 'gc-11', category: 'Nexus',     label: 'No unclosed contradiction loops',                      status: 'pass' },
  { id: 'gc-12', category: 'Gaps',      label: 'All export-blocking evidence gaps resolved or deferred', status: 'fail', detail: '2 evidence gaps marked as export blockers remain open' },
  { id: 'gc-13', category: 'Guidance',  label: 'Guidance limitations acknowledged',                    status: 'pass' },
  { id: 'gc-14', category: 'Scope',     label: 'Jurisdiction warning noted',                           status: 'pass' },
  { id: 'gc-15', category: 'Scope',     label: 'Purpose scope matches handoff type',                   status: 'pass' },
  { id: 'gc-16', category: 'Freshness', label: 'Active run freshness (< 24h)',                         status: 'pass' },
  { id: 'gc-17', category: 'Freshness', label: 'Export-gate evaluation freshness',                     status: 'fail', detail: 'Gate not yet evaluated this session' },
];

const FORMAT_CONFIG: Record<ExportFormat, { icon: React.ElementType; label: string; desc: string; color: string; borderColor: string }> = {
  html: { icon: Code2,    label: 'Semantic HTML Preview',     desc: 'Readable structured preview with full provenance, citations, and limitations.',         color: 'text-blue-700',   borderColor: 'border-blue-300' },
  json: { icon: FileJson, label: 'Canonical Structured JSON', desc: 'Machine-readable manifest with manifest ID, reviewed-state hash, all candidate IDs.',   color: 'text-purple-700', borderColor: 'border-purple-300' },
  pdf:  { icon: FileText, label: 'Local PDF',                 desc: 'PDF generated locally in the browser. Same manifest ID and hash as the JSON output.',   color: 'text-teal-700',   borderColor: 'border-teal-300' },
};

const FINDING_SAFE_SHARE_CANDIDATES = MOCK_FINDINGS.filter(f => f.reviewStatus === 'accepted');
const URGENT_NEED_SAFE_SHARE_CANDIDATES = MOCK_URGENT_NEEDS.filter(n =>
  n.status === 'in-progress' || n.status === 'referral-offered' || n.status === 'referral-accepted'
);
const EXPORT_BLOCKER_GAPS = MOCK_EVIDENCE_GAPS.filter(g =>
  (g.status === 'open' || g.status === 'investigating') &&
  (g.priority === 'high' || g.evidenceStatus === 'missing')
);
const IMMEDIATE_NEEDS = MOCK_URGENT_NEEDS.filter(n =>
  n.urgency === 'immediate'
);

// ── Phase 6: Checklist categories ────────────────────────────────────────────

type ChecklistStatus = 'passed' | 'attention' | 'blocking';

type ChecklistCategory = {
  id: string;
  label: string;
  status: ChecklistStatus;
  severity?: 'critical';
  checks: typeof ALL_GATE_CHECKS;
  failDetail?: string;
};

function buildChecklistCategories(): ChecklistCategory[] {
  const byCategory = ALL_GATE_CHECKS.reduce<Record<string, typeof ALL_GATE_CHECKS>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c); return acc;
  }, {});

  return [
    {
      id: 'purpose',
      label: 'Purpose & Authorization',
      checks: [...(byCategory['Purpose'] || []), ...(byCategory['Scope'] || []), ...(byCategory['Guidance'] || [])],
      status: 'passed',
    },
    {
      id: 'review',
      label: 'Human Review',
      checks: [...(byCategory['Review'] || [])],
      status: 'blocking',
      failDetail: '4 consequential items not yet individually reviewed',
    },
    {
      id: 'citations',
      label: 'Citations',
      checks: [{ id: 'gc-9', category: 'Review', label: 'Citation validity — all 23 citations', status: 'pass' }],
      status: 'passed',
    },
    {
      id: 'masking',
      label: 'Masking',
      checks: [...(byCategory['Masking'] || [])],
      status: 'blocking',
      severity: 'critical',
      failDetail: 'Document d-5 masking approval pending — export blocked',
    },
    {
      id: 'dependencies',
      label: 'Dependencies',
      checks: [...(byCategory['Nexus'] || []), ...(byCategory['Freshness'] || [])],
      status: 'attention',
      failDetail: '1 unresolved cascade from withdrawn finding; gate not evaluated this session',
    },
    {
      id: 'gaps',
      label: 'Document Coverage & Evidence Gaps',
      checks: [...(byCategory['Documents'] || []), ...(byCategory['Gaps'] || [])],
      status: 'blocking',
      severity: 'critical',
      failDetail: '2 export-blocking evidence gaps remain open',
    },
  ];
}

const CHECKLIST_CATEGORIES = buildChecklistCategories();

// ── Phase 6: Blocker rows (static synthetic) ─────────────────────────────────

const CRITICAL_BLOCKERS = [
  {
    id: 'BLK-001',
    severity: 'critical' as const,
    affectedItems: ['d-5', 'gc-6'],
    reason: 'Document d-5 (Support Provider Notes) masking approval has not been confirmed by a practitioner. No export is possible until all identifiers are reviewed and approved.',
    link: '/case/c-001',
    linkLabel: 'Review Masking',
  },
  {
    id: 'BLK-002',
    severity: 'critical' as const,
    affectedItems: ['eg-1', 'eg-3', 'gc-12'],
    reason: '2 evidence gaps with export-blocking status remain open or under investigation. The non-punishment timeline cannot be completed without resolving the arrival date conflict (eg-1).',
    link: '/case/c-001/gaps',
    linkLabel: 'Resolve Gaps',
  },
];

const ATTENTION_BLOCKERS = [
  {
    id: 'BLK-003',
    severity: 'attention' as const,
    affectedItems: ['f-4', 'f-5', 'f-6', 'f-9', 'gc-8'],
    reason: '4 findings in Lane A and B remain in pending review status. Individual human review of all consequential items is required before a practitioner handoff can be generated.',
    link: '/case/c-001/analysis',
    linkLabel: 'Complete Review',
  },
  {
    id: 'BLK-004',
    severity: 'attention' as const,
    affectedItems: ['f-withdrawn', 'gc-10', 'gc-17'],
    reason: '1 unresolved dependency cascade from a withdrawn finding. Export gate freshness check has not been run in this session.',
    link: '/case/c-001/nexus',
    linkLabel: 'Review Nexus',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseExportGate() {
  const caseData = MOCK_CASES[0];
  const pendingFindings = MOCK_FINDINGS.filter(f => f.reviewStatus === 'pending');
  const unresolvedFindings = MOCK_FINDINGS.filter(f => f.supportStatus === 'unresolved');
  const isReady = caseData.exportGateStatus === 'ready';

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('html');
  const [showAllChecks, setShowAllChecks] = useState(false);
  const [selectedFindingCandidates, setSelectedFindingCandidates] = useState<Set<string>>(
    new Set(FINDING_SAFE_SHARE_CANDIDATES.map(f => f.id))
  );
  const [selectedNeedCandidates, setSelectedNeedCandidates] = useState<Set<string>>(new Set());
  const [isSafeShare, setIsSafeShare] = useState(false);
  const [minimumConfirmed, setMinimumConfirmed] = useState(false);
  const [safeShareSection, setSafeShareSection] = useState<'findings' | 'safety'>('findings');
  const [selectedOutput, setSelectedOutput] = useState<'full' | 'safe-share'>('full');

  const failingChecks = ALL_GATE_CHECKS.filter(c => c.status === 'fail');
  const passingChecks = ALL_GATE_CHECKS.filter(c => c.status === 'pass');
  const checksByCategory = ALL_GATE_CHECKS.reduce<Record<string, typeof ALL_GATE_CHECKS>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c); return acc;
  }, {});

  const toggleFindingCandidate = (id: string) => {
    setSelectedFindingCandidates(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleNeedCandidate = (id: string) => {
    setSelectedNeedCandidates(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const totalSelected = selectedFindingCandidates.size + selectedNeedCandidates.size;
  const criticalBlockerCount = CRITICAL_BLOCKERS.length;

  const STATUS_ICON: Record<ChecklistStatus, React.ReactNode> = {
    passed:    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />,
    attention: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    blocking:  <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  };
  const STATUS_CHIP: Record<ChecklistStatus, string> = {
    passed:    'bg-teal-50 text-teal-700 border-teal-200',
    attention: 'bg-amber-50 text-amber-700 border-amber-200',
    blocking:  'bg-red-50 text-red-700 border-red-200',
  };
  const STATUS_LABEL: Record<ChecklistStatus, string> = {
    passed:    'Passed',
    attention: 'Attention required',
    blocking:  'Blocking',
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">

      {/* ── Phase 6: Readiness banner ── */}
      <div className={cn(
        "px-6 py-5 border-b border-border shrink-0",
        isReady ? "bg-teal-50/50" : "bg-red-50/40"
      )}>
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <div className={cn(
            "p-3 rounded-full border-2 shadow-sm shrink-0",
            isReady ? "bg-teal-50 border-teal-300 text-teal-600" : "bg-red-50 border-red-300 text-red-600"
          )}>
            {isReady ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <h1 className={cn("text-xl font-bold mb-1", isReady ? "text-teal-800" : "text-red-800")}>
              {isReady
                ? 'Safe to export — all gate checks passed'
                : `Not ready to export — ${criticalBlockerCount} critical blocker${criticalBlockerCount !== 1 ? 's' : ''}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isReady
                ? 'All safety checks passed. Select an output type and generate the canonical handoff.'
                : 'Export remains unavailable until every critical blocker is resolved. No override or bypass is possible.'}
            </p>
          </div>
          {!isReady && (
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-600">
                {criticalBlockerCount} Critical · {ATTENTION_BLOCKERS.length} Attention
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {passingChecks.length}/{ALL_GATE_CHECKS.length} checks passing
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-7 space-y-8">

          {/* ── Phase 6: Compact gate checklist ── */}
          <section>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Gate Checklist
            </div>

            <div className="border border-border rounded-sm overflow-hidden divide-y divide-border">
              {CHECKLIST_CATEGORIES.map(cat => (
                <div key={cat.id} className={cn(
                  "flex items-center gap-4 px-4 py-3",
                  cat.status === 'blocking' && cat.severity === 'critical' && "bg-red-50/40",
                )}>
                  {STATUS_ICON[cat.status]}
                  <span className={cn(
                    "text-sm font-medium flex-1",
                    cat.status === 'passed' ? "text-foreground" : cat.status === 'blocking' ? "text-foreground" : "text-foreground"
                  )}>
                    {cat.label}
                    {cat.severity === 'critical' && (
                      <span className="ml-2 text-[9px] font-mono uppercase bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded-sm">Critical</span>
                    )}
                  </span>
                  {cat.failDetail && cat.status !== 'passed' && (
                    <span className="text-xs text-muted-foreground hidden md:block max-w-xs truncate">{cat.failDetail}</span>
                  )}
                  <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border shrink-0", STATUS_CHIP[cat.status])}>
                    {STATUS_LABEL[cat.status]}
                  </span>
                </div>
              ))}
            </div>

            {/* Show all checks toggle */}
            <button
              onClick={() => setShowAllChecks(v => !v)}
              className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              {showAllChecks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAllChecks ? 'Hide' : 'Show'} all {ALL_GATE_CHECKS.length} checks
            </button>

            <AnimatePresence>
              {showAllChecks && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 bg-card border border-border rounded-sm overflow-hidden">
                    {Object.entries(checksByCategory).map(([category, checks]) => (
                      <div key={category}>
                        <div className="bg-muted px-4 py-1.5 border-b border-border flex items-center gap-2">
                          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{category}</span>
                          <span className="text-[9px] font-mono text-muted-foreground/60">
                            {checks.filter(c => c.status === 'pass').length}/{checks.length} pass
                          </span>
                        </div>
                        {checks.map((check, i) => (
                          <div key={check.id} className={cn("flex items-start gap-3 px-4 py-2.5", i < checks.length - 1 && "border-b border-border/40")}>
                            {check.status === 'pass'
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              : <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                            <div className="flex-1">
                              <span className="text-xs text-foreground">{check.label}</span>
                              {check.detail && <p className="text-[10px] text-red-600 mt-0.5">{check.detail}</p>}
                            </div>
                            <span className={cn(
                              "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0",
                              check.status === 'pass' ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-red-50 text-red-700 border-red-200"
                            )}>
                              {check.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── Phase 6: Blocker table ── */}
          {!isReady && (
            <section>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-500" /> Active Blockers
              </div>

              <div className="space-y-2">
                {/* Critical blockers */}
                {CRITICAL_BLOCKERS.map(b => (
                  <div key={b.id} className="border border-red-200 rounded-sm bg-red-50/40 overflow-hidden">
                    <div className="px-4 py-3 flex items-start gap-4">
                      <div className="shrink-0 mt-0.5 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-mono bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded-sm">{b.id}</span>
                        <span className="text-[9px] font-mono uppercase bg-red-600 text-white px-1.5 py-0.5 rounded-sm">Critical</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {b.affectedItems.map(item => (
                            <span key={item} className="text-[10px] font-mono bg-card border border-red-200 text-red-700 px-1.5 py-0.5 rounded-sm">{item}</span>
                          ))}
                        </div>
                        <p className="text-sm text-red-900 leading-relaxed">{b.reason}</p>
                      </div>
                      <Link href={b.link}>
                        <span className="text-[10px] font-mono text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer">
                          {b.linkLabel} <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Attention blockers */}
                {ATTENTION_BLOCKERS.map(b => (
                  <div key={b.id} className="border border-amber-200 rounded-sm bg-amber-50/30 overflow-hidden">
                    <div className="px-4 py-3 flex items-start gap-4">
                      <div className="shrink-0 mt-0.5 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-mono bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-sm">{b.id}</span>
                        <span className="text-[9px] font-mono uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-sm">Attention</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {b.affectedItems.map(item => (
                            <span key={item} className="text-[10px] font-mono bg-card border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded-sm">{item}</span>
                          ))}
                        </div>
                        <p className="text-sm text-amber-900 leading-relaxed">{b.reason}</p>
                      </div>
                      <Link href={b.link}>
                        <span className="text-[10px] font-mono text-amber-700 hover:text-amber-900 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer">
                          {b.linkLabel} <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* No override notice */}
              <div className="mt-3 border border-dashed border-red-200 rounded-sm px-4 py-3 flex items-start gap-2.5 bg-red-50/20">
                <Lock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">
                  <strong>No override or bypass is available.</strong> Critical blockers must be resolved by a practitioner through the relevant case panels. This gate cannot be unlocked programmatically.
                </p>
              </div>

              {/* Immediate urgent needs */}
              {IMMEDIATE_NEEDS.length > 0 && (
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-sm px-4 py-3 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <strong className="block mb-1">{IMMEDIATE_NEEDS.length} urgent need{IMMEDIATE_NEEDS.length > 1 ? 's' : ''} require immediate or same-day action</strong>
                    <p className="text-xs text-orange-700">Export is not a substitute for urgent safety action. Ensure all immediate and within-24h needs have been actioned before proceeding.</p>
                    <Link href="/case/c-001/safety">
                      <span className="text-[10px] font-mono text-orange-700 hover:text-orange-900 mt-1 flex items-center gap-1 cursor-pointer">
                        Review Urgent Needs <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Phase 6: Output selection — two separated panels ── */}
          <section className={cn("space-y-5 transition-opacity duration-200", !isReady && "opacity-50 pointer-events-none")}>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5" /> Output Type
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full practitioner handoff */}
              <button
                onClick={() => { setSelectedOutput('full'); setIsSafeShare(false); }}
                className={cn(
                  "text-left p-5 rounded-sm border-2 transition-all",
                  selectedOutput === 'full'
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-foreground/20"
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-3 h-3 rounded-full border-2 shrink-0", selectedOutput === 'full' ? "border-primary bg-primary" : "border-border")} />
                  <span className="text-sm font-semibold text-foreground">Full Practitioner Handoff</span>
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Recipient</dt>
                    <dd className="text-foreground">Receiving legal practitioner or caseworker</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Purpose</dt>
                    <dd className="text-foreground">Full case analysis — protected legal context</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Included</dt>
                    <dd className="text-foreground">All accepted findings, timeline, evidence gaps, citations, urgent needs, practitioner notes (export-eligible)</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Excluded</dt>
                    <dd className="text-foreground">Raw source documents, internal-only notes, unresolved findings, rejected evidence</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Redaction</dt>
                    <dd className="text-teal-700 font-medium">All identifiers masked</dd>
                  </div>
                </dl>
              </button>

              {/* Minimum-necessary safe share */}
              <button
                onClick={() => { setSelectedOutput('safe-share'); setIsSafeShare(true); }}
                className={cn(
                  "text-left p-5 rounded-sm border-2 transition-all",
                  selectedOutput === 'safe-share'
                    ? "border-blue-400 bg-blue-50/30"
                    : "border-border bg-card hover:border-foreground/20"
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-3 h-3 rounded-full border-2 shrink-0", selectedOutput === 'safe-share' ? "border-blue-500 bg-blue-500" : "border-border")} />
                  <span className="text-sm font-semibold text-foreground">Minimum-Necessary Safe Share</span>
                  <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-sm">Scoped</span>
                </div>
                <dl className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Recipient</dt>
                    <dd className="text-foreground">Named third party with stated, limited purpose</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Purpose</dt>
                    <dd className="text-foreground">Minimum necessary for recipient's stated role only</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Included</dt>
                    <dd className="text-foreground">Practitioner-selected findings and urgent needs only — no full timeline or raw sources</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Excluded</dt>
                    <dd className="text-foreground">Safety plan details, trauma disclosures, unselected items, all raw documents and internal notes</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-[10px] font-mono uppercase text-muted-foreground w-32 shrink-0">Redaction</dt>
                    <dd className="text-teal-700 font-medium">All identifiers masked</dd>
                  </div>
                </dl>
              </button>
            </div>

            {/* Safe-share selection (shown when safe-share selected) */}
            <AnimatePresence>
              {selectedOutput === 'safe-share' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="border border-blue-200 rounded-sm overflow-hidden bg-blue-50/10">
                    <div className="px-4 py-3 border-b border-blue-200 bg-blue-50/30">
                      <div className="text-[10px] font-mono text-blue-800 uppercase tracking-widest mb-1">Candidate Selection — Minimum Necessity</div>
                      <p className="text-xs text-muted-foreground">Select only what is necessary for the identified recipient. Safety plan details are excluded unless explicitly permitted.</p>
                    </div>

                    {/* Safety-plan exclusion notice */}
                    <div className="px-4 py-2.5 border-b border-blue-200 bg-blue-50/20 flex items-start gap-2">
                      <EyeOff className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        <strong>Sensitive safety-plan details are excluded by default</strong> and will not appear in this output unless you have separately confirmed that disclosure is permitted and serves the client's safety.
                      </p>
                    </div>

                    {/* Section tabs */}
                    <div className="border-b border-blue-200 flex">
                      {([
                        { key: 'findings', label: `Analysis Findings (${FINDING_SAFE_SHARE_CANDIDATES.length} eligible)` },
                        { key: 'safety',   label: `Safety & Urgent Needs (${URGENT_NEED_SAFE_SHARE_CANDIDATES.length} eligible)` },
                      ] as { key: typeof safeShareSection; label: string }[]).map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setSafeShareSection(tab.key)}
                          className={cn(
                            "flex-1 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                            safeShareSection === tab.key ? "border-blue-500 text-blue-700" : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 space-y-2">
                      {safeShareSection === 'findings' && (
                        <>
                          {FINDING_SAFE_SHARE_CANDIDATES.map(f => (
                            <button key={f.id} onClick={() => toggleFindingCandidate(f.id)} className={cn(
                              "w-full flex items-start gap-3 p-3 rounded-sm border text-left transition-all",
                              selectedFindingCandidates.has(f.id) ? "border-teal-200 bg-teal-50" : "border-border bg-muted hover:border-foreground/20"
                            )}>
                              <div className={cn("w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center", selectedFindingCandidates.has(f.id) ? "border-teal-600 bg-teal-600" : "border-border")}>
                                {selectedFindingCandidates.has(f.id) && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-foreground">{f.title}</span>
                                <span className="text-[10px] font-mono text-muted-foreground ml-2">{f.id}</span>
                              </div>
                            </button>
                          ))}
                          {FINDING_SAFE_SHARE_CANDIDATES.length === 0 && (
                            <p className="text-sm text-muted-foreground italic py-2">No accepted findings available for safe share.</p>
                          )}
                        </>
                      )}
                      {safeShareSection === 'safety' && (
                        <>
                          <div className="bg-orange-50 border border-orange-200 rounded-sm p-3 text-xs text-orange-800 flex items-start gap-2 mb-2">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            Urgent needs included in a safe share must not expose identifying information. Only include where disclosure serves a legitimate safety purpose and consent has been confirmed.
                          </div>
                          {URGENT_NEED_SAFE_SHARE_CANDIDATES.map(n => (
                            <button key={n.id} onClick={() => toggleNeedCandidate(n.id)} className={cn(
                              "w-full flex items-start gap-3 p-3 rounded-sm border text-left transition-all",
                              selectedNeedCandidates.has(n.id) ? "border-orange-200 bg-orange-50" : "border-border bg-muted hover:border-foreground/20"
                            )}>
                              <div className={cn("w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center", selectedNeedCandidates.has(n.id) ? "border-orange-600 bg-orange-600" : "border-border")}>
                                {selectedNeedCandidates.has(n.id) && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <div>
                                <span className="text-xs font-medium text-foreground">{n.category}</span>
                                <span className={cn("text-[9px] font-mono uppercase ml-2 px-1.5 py-0.5 rounded border",
                                  n.urgency === 'immediate' ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                )}>{n.urgency.replace(/-/g, ' ')}</span>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{n.description}</p>
                              </div>
                            </button>
                          ))}
                          {URGENT_NEED_SAFE_SHARE_CANDIDATES.length === 0 && (
                            <p className="text-sm text-muted-foreground italic py-2">No urgent needs at eligible status for safe share inclusion.</p>
                          )}
                        </>
                      )}
                      <div className="pt-3 border-t border-border">
                        <button
                          onClick={() => setMinimumConfirmed(v => !v)}
                          className={cn("w-full flex items-center gap-2 p-3 rounded-sm border transition-all", minimumConfirmed ? "border-teal-200 bg-teal-50" : "border-border hover:border-foreground/20")}
                        >
                          <div className={cn("w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center", minimumConfirmed ? "border-teal-600 bg-teal-600" : "border-border")}>
                            {minimumConfirmed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="text-xs text-muted-foreground text-left">
                            I confirm this selection ({totalSelected} item{totalSelected !== 1 ? 's' : ''}) meets the minimum-necessity threshold. Consent and safe-contact requirements have been verified.
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 6: Handoff preview ── */}
            <div className="border border-border rounded-sm overflow-hidden">
              <div className="bg-muted border-b border-border px-4 py-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Handoff Preview — {selectedOutput === 'full' ? 'Full Practitioner Handoff' : 'Minimum-Necessary Safe Share'}</span>
              </div>
              <div className="divide-y divide-border">
                {[
                  {
                    key: 'included',
                    label: 'Included',
                    icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />,
                    color: 'text-teal-800',
                    value: selectedOutput === 'full'
                      ? (() => { const evtCount = MOCK_FINDINGS.filter(f => f.type === 'timeline-link').length; return `${FINDING_SAFE_SHARE_CANDIDATES.length} accepted findings · Timeline (${evtCount} event${evtCount !== 1 ? 's' : ''}) · 23 linked fixture citations · Evidence gap summary · Urgent need referrals · Export-eligible notes`; })()
                      : `${selectedFindingCandidates.size} selected finding${selectedFindingCandidates.size !== 1 ? 's' : ''} · ${selectedNeedCandidates.size} urgent need item${selectedNeedCandidates.size !== 1 ? 's' : ''} · Minimum-scope summary only`,
                  },
                  {
                    key: 'excluded',
                    label: 'Excluded',
                    icon: <Minus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />,
                    color: 'text-foreground',
                    value: selectedOutput === 'full'
                      ? 'Raw source documents · Internal-only notes · Rejected and pending findings · Unresolved contradictions · Safety plan details'
                      : 'Safety plan details · Trauma disclosures · Unselected findings · Full timeline · Raw source documents · Internal notes · All rejected items',
                  },
                  {
                    key: 'limitations',
                    label: 'Limitations preserved',
                    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
                    color: 'text-foreground',
                    value: 'Coverage gaps from d-3 and d-5 documented · Arrival date conflict unresolved · Single-source findings flagged · Jurisdiction not confirmed · Guidance limitations noted',
                  },
                  {
                    key: 'gaps',
                    label: 'Unresolved gaps disclosed',
                    icon: <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />,
                    color: 'text-foreground',
                    value: '2 open evidence gaps included in disclosure appendix (eg-1, eg-3) · Absence treated as absence, not as negative evidence',
                  },
                ].map(row => (
                  <div key={row.key} className="flex items-start gap-3 px-4 py-3 text-xs">
                    {row.icon}
                    <div className="flex-1">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-0.5">{row.label}</span>
                      <p className={cn("leading-relaxed", row.color)}>{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Phase 6: Format selection ── */}
            <div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Output Format</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.entries(FORMAT_CONFIG) as [ExportFormat, typeof FORMAT_CONFIG[ExportFormat]][]).map(([fmt, cfg]) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={cn(
                      "p-4 rounded-sm border-2 text-left transition-all",
                      selectedFormat === fmt ? cn("border-current shadow-sm", cfg.color) : "border-border bg-card hover:border-foreground/20"
                    )}
                  >
                    <cfg.icon className={cn("w-4 h-4 mb-2", selectedFormat === fmt ? cfg.color : "text-muted-foreground")} />
                    <div className={cn("text-sm font-semibold mb-1", selectedFormat === fmt ? cfg.color : "text-foreground")}>{cfg.label}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cfg.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Phase 6: Provenance summary ── */}
            <div className="border border-border rounded-sm overflow-hidden">
              <div className="bg-muted border-b border-border px-4 py-2.5 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Provenance Summary</span>
              </div>
              <div className="px-4 py-3 font-mono text-xs divide-y divide-border/50">
                {[
                  { label: 'Run ID',               value: 'REPLAY-V1-2024-0047',        highlight: false },
                  { label: 'Manifest ID',           value: 'MANIFEST-2024-0047-001',     highlight: false },
                  { label: 'Case Revision',         value: 'r14',                         highlight: false },
                  { label: 'Reviewed-State Hash',   value: 'sha256:7f3a9b2c4e1d8f…',     highlight: false },
                  { label: 'Masking Status',        value: 'Incomplete — d-5 pending',   highlight: true },
                  { label: 'Human Review Status',   value: 'Incomplete — 4 items pending', highlight: true },
                  { label: 'Citation Count',        value: '23 linked fixture citations', highlight: false },
                  { label: 'Provider Transmission', value: 'false — browser-local only', highlight: false },
                  { label: 'Generated',             value: '2024-03-24 11:42 UTC',       highlight: false },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-4 py-1.5">
                    <span className="text-muted-foreground w-44 shrink-0">{row.label}</span>
                    <span className={cn("text-foreground", row.highlight && "text-amber-700 font-medium")}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Phase 6: Export buttons (disabled) + statement ── */}
            <div className="space-y-3">
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-sm py-3 text-sm"
                disabled={true}
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Handoff — {FORMAT_CONFIG[selectedFormat].label}
                {selectedOutput === 'safe-share' && (
                  <span className="ml-2 text-[10px] bg-teal-800 px-2 py-0.5 rounded">
                    Safe Share · {totalSelected} item{totalSelected !== 1 ? 's' : ''}
                  </span>
                )}
              </Button>
              <p className="text-[10px] text-center font-mono text-muted-foreground">
                Downloads locally in the browser · Not emailed, uploaded, filed, or reported
              </p>
            </div>
          </section>

          {/* ── Phase 6: Persistent "unavailable" statement ── */}
          {!isReady && (
            <div className="border border-dashed border-red-200 bg-red-50/20 rounded-sm px-5 py-4 flex items-start gap-3">
              <Lock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">
                  Export remains unavailable until every critical blocker is resolved.
                </p>
                <p className="text-xs text-red-700">
                  {CRITICAL_BLOCKERS.length} critical blocker{CRITICAL_BLOCKERS.length !== 1 ? 's' : ''} and {ATTENTION_BLOCKERS.length} attention item{ATTENTION_BLOCKERS.length !== 1 ? 's' : ''} must be addressed by a practitioner before this case can be handed off. No programmatic bypass exists.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
