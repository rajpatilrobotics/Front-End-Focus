import React, { useState } from 'react';
import { useCaseContext } from '@/context/CaseContext';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, FileWarning, EyeOff, Lock, Network,
  ArrowRight, Download, FileJson, FileText, Code2, CheckCircle2, ChevronDown,
  ChevronUp, HelpCircle, Phone, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

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
  html: { icon: Code2,    label: 'Semantic HTML Preview',        desc: 'Readable structured preview with full provenance, citations, and limitations. Human-readable for practitioner review before download.',                                                    color: 'text-blue-700',   borderColor: 'border-blue-300' },
  json: { icon: FileJson, label: 'Canonical Structured JSON',    desc: 'Machine-readable manifest with manifest ID, reviewed-state hash, case revision, run ID, all candidate IDs, citations, context gaps, labels, limitations, and redaction status.',           color: 'text-purple-700', borderColor: 'border-purple-300' },
  pdf:  { icon: FileText, label: 'Local PDF',                    desc: 'PDF generated locally in the browser — loaded only when requested. Contains the same manifest ID and reviewed-state hash as the JSON. No server upload.',                                   color: 'text-teal-700',   borderColor: 'border-teal-300' },
};

export default function CaseExportGate() {
  const { state, selectors } = useCaseContext();
  const findings = state.findings;
  const evidenceGaps = state.evidenceGaps;
  const urgentNeeds = state.urgentNeeds;
  const caseData = state.cases.find(c => c.id === state.activeCaseId) || state.cases[0];

  // Derived from shared state (reactive)
  const FINDING_SAFE_SHARE_CANDIDATES = findings.filter(f => f.reviewStatus === 'accepted');
  const URGENT_NEED_SAFE_SHARE_CANDIDATES = urgentNeeds.filter(n =>
    n.status === 'in-progress' || n.status === 'referral-offered' || n.status === 'referral-accepted'
  );
  const EXPORT_BLOCKER_GAPS = evidenceGaps.filter(g =>
    (g.status === 'open' || g.status === 'investigating') &&
    (g.priority === 'high' || g.evidenceStatus === 'missing')
  );
  const IMMEDIATE_NEEDS = urgentNeeds.filter(n =>
    n.urgency === 'immediate' || n.urgency === 'within-24h'
  );

  const pendingFindings = findings.filter(f => f.reviewStatus === 'pending');
  const unresolvedFindings = findings.filter(f => f.supportStatus === 'unresolved');
  const isReady = caseData.exportGateStatus === 'ready';

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('html');
  const [showAllChecks, setShowAllChecks] = useState(false);
  const [selectedFindingCandidates, setSelectedFindingCandidates] = useState<Set<string>>(
    new Set(FINDING_SAFE_SHARE_CANDIDATES.map(f => f.id))
  );
  const [selectedNeedCandidates, setSelectedNeedCandidates] = useState<Set<string>>(new Set());
  const [isSafeShare, setIsSafeShare] = useState(false);
  const [minimumConfirmed, setMinimumConfirmed] = useState(false);
  const [gapBlockerExpanded, setGapBlockerExpanded] = useState(true);
  const [safeShareSection, setSafeShareSection] = useState<'findings' | 'safety'>('findings');

  const failingChecks = ALL_GATE_CHECKS.filter(c => c.status === 'fail');
  const passingChecks = ALL_GATE_CHECKS.filter(c => c.status === 'pass');
  const checksByCategory = ALL_GATE_CHECKS.reduce<Record<string, typeof ALL_GATE_CHECKS>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c);
    return acc;
  }, {});

  const toggleFindingCandidate = (id: string) => {
    setSelectedFindingCandidates(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
    });
  };
  const toggleNeedCandidate = (id: string) => {
    setSelectedNeedCandidates(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
    });
  };

  const totalSelected = selectedFindingCandidates.size + selectedNeedCandidates.size;

  const BLOCKERS = [
    {
      id: 'b1', title: 'Unreviewed Consequential Items',
      count: pendingFindings.length,
      icon: AlertTriangle, color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200',
      link: '/analysis',
      detail: pendingFindings.length > 0 ? `${pendingFindings.length} finding${pendingFindings.length > 1 ? 's' : ''} pending review in the Analysis panel.` : undefined,
    },
    {
      id: 'b2', title: 'Unresolved Dependency Cascade',
      count: unresolvedFindings.length,
      icon: Network, color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200',
      link: '/nexus',
      detail: unresolvedFindings.length > 0 ? `${unresolvedFindings.length} node${unresolvedFindings.length > 1 ? 's' : ''} with broken upstream dependency. Review in the Nexus graph.` : undefined,
    },
    {
      id: 'b3', title: 'Evidence Gap Blockers',
      count: EXPORT_BLOCKER_GAPS.length,
      icon: HelpCircle, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200',
      link: '/gaps',
      detail: EXPORT_BLOCKER_GAPS.length > 0 ? `${EXPORT_BLOCKER_GAPS.length} high-priority gap${EXPORT_BLOCKER_GAPS.length > 1 ? 's' : ''} still open. Evidence gaps may indicate insufficient basis for export.` : undefined,
    },
    {
      id: 'b4', title: 'Incomplete Masking Actions',
      count: 1,
      icon: EyeOff, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200',
      link: '/',
      detail: 'Document d-5 masking approval is pending. No export is possible until masking is reviewed.',
    },
    {
      id: 'b5', title: 'Missing Critical Evidence Flags',
      count: 0,
      icon: FileWarning, color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200',
      link: '/analysis',
      detail: undefined,
    },
  ];

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Hero status */}
      <div className={cn("px-7 py-8 border-b border-border shrink-0", isReady ? "bg-teal-50/40" : "bg-amber-50/20")}>
        <div className="max-w-4xl mx-auto flex items-start gap-5">
          <div className={cn(
            "p-3.5 rounded-full border-2 shadow-sm shrink-0",
            isReady ? "bg-teal-50 border-teal-300 text-teal-600" : "bg-amber-50 border-amber-300 text-amber-600"
          )}>
            {isReady ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1.5">
              {isReady ? 'Safe Export Ready' : 'Export Gate Blocked'}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {isReady
                ? 'All safety checks passed. Select a format and generate the canonical handoff.'
                : `${failingChecks.length} gate checks are failing. No override or bypass is possible. Resolve all blockers to continue.`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Active blockers */}
          <section>
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Active Blockers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {BLOCKERS.map(b => (
                <div key={b.id} className={cn(
                  "p-4 rounded-md border flex flex-col shadow-sm transition-all",
                  b.count > 0 ? cn("bg-card", b.borderColor) : "bg-muted border-border opacity-50"
                )}>
                  <div className="flex justify-between items-start mb-3">
                    <div className={cn("p-2 rounded-sm", b.count > 0 ? b.bgColor : "bg-muted")}>
                      <b.icon className={cn("w-4 h-4", b.count > 0 ? b.color : "text-muted-foreground/40")} />
                    </div>
                    {b.count > 0 ? (
                      <span className={cn("text-xl font-bold font-mono", b.color)}>{b.count}</span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    )}
                  </div>
                  <h3 className={cn("font-medium text-sm mb-1", b.count > 0 ? "text-foreground" : "text-muted-foreground")}>{b.title}</h3>
                  {b.detail && b.count > 0 && (
                    <p className="text-xs text-muted-foreground mb-2 flex-1">{b.detail}</p>
                  )}
                  {b.count > 0 && (
                    <Link href={`/case/c-001${b.link}`}>
                      <div className="mt-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors">
                        Resolve <ArrowRight className="w-3 h-3" />
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Evidence gap blocker detail */}
            {EXPORT_BLOCKER_GAPS.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setGapBlockerExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-red-800 hover:bg-red-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Evidence gap blockers — must be resolved or marked out-of-scope before export ({EXPORT_BLOCKER_GAPS.length})
                  </div>
                  {gapBlockerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {gapBlockerExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-red-200">
                        {EXPORT_BLOCKER_GAPS.map((gap, i) => (
                          <div key={gap.id} className={cn("flex items-start gap-3 px-4 py-3 text-sm", i > 0 && "border-t border-red-100")}>
                            <span className="text-[10px] font-mono bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded shrink-0 mt-0.5">{gap.id}</span>
                            <div className="flex-1">
                              <span className="text-red-900 font-medium">{gap.title}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-mono uppercase text-red-600 bg-red-100 border border-red-200 px-1 py-0.5 rounded">{gap.evidenceStatus}</span>
                                <span className="text-[9px] font-mono uppercase text-muted-foreground">{gap.status.replace(/-/g, ' ')}</span>
                              </div>
                            </div>
                            <Link href="/case/c-001/gaps">
                              <span className="text-[10px] font-mono text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 shrink-0">
                                Resolve <ArrowRight className="w-3 h-3" />
                              </span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Immediate urgent needs notice */}
            {IMMEDIATE_NEEDS.length > 0 && (
              <div className="mt-3 bg-orange-50 border border-orange-200 rounded-md px-4 py-3 flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <strong className="block mb-1">{IMMEDIATE_NEEDS.length} urgent need{IMMEDIATE_NEEDS.length > 1 ? 's' : ''} require immediate or same-day action</strong>
                  <p className="text-xs text-orange-700">Export is not a substitute for urgent safety action. Ensure all immediate and within-24h needs have been actioned in the Urgent Needs panel before proceeding.</p>
                  <Link href="/case/c-001/safety">
                    <span className="text-[10px] font-mono text-orange-700 hover:text-orange-900 mt-1 flex items-center gap-1 cursor-pointer">Review Urgent Needs <ArrowRight className="w-3 h-3" /></span>
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Full gate checklist */}
          <section>
            <button
              onClick={() => setShowAllChecks(v => !v)}
              className="w-full flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3 hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                Full Safety Checklist ({passingChecks.length}/{ALL_GATE_CHECKS.length} passing)
              </span>
              {showAllChecks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showAllChecks && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                    {Object.entries(checksByCategory).map(([category, checks]) => (
                      <div key={category}>
                        <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{category}</span>
                          <span className="text-[9px] font-mono text-muted-foreground/60">
                            {checks.filter(c => c.status === 'pass').length}/{checks.length} pass
                          </span>
                        </div>
                        {checks.map(check => (
                          <div key={check.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/20">
                            {check.status === 'pass' ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <span className={cn("text-sm", check.status === 'pass' ? "text-foreground" : "text-foreground font-medium")}>{check.label}</span>
                              {check.detail && <p className="text-xs text-red-600 mt-0.5">{check.detail}</p>}
                            </div>
                            <span className={cn(
                              "text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0",
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

          {/* Export section */}
          <section className={cn("space-y-6 transition-opacity", !isReady && "opacity-40 pointer-events-none")}>
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
              Handoff Generation
            </h2>

            {/* Handoff type toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground font-medium">Handoff type:</span>
              <div className="flex bg-muted border border-border rounded p-0.5 gap-0.5">
                {[{ v: false, l: 'Full Practitioner Handoff' }, { v: true, l: 'Minimum-Necessary Safe Share' }].map(({ v, l }) => (
                  <button
                    key={String(v)}
                    onClick={() => setIsSafeShare(v)}
                    className={cn("px-3 py-1.5 text-xs rounded font-medium transition-colors", isSafeShare === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum-necessary candidate selection */}
            <AnimatePresence>
              {isSafeShare && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border space-y-1">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Candidate Selection — Minimum Necessity</div>
                      <p className="text-xs text-muted-foreground">Select only what is necessary for the identified recipient. Raw documents and unnecessary identifiers are excluded automatically.</p>
                    </div>

                    {/* Section tabs */}
                    <div className="border-b border-border flex">
                      {([
                        { key: 'findings', label: `Analysis Findings (${FINDING_SAFE_SHARE_CANDIDATES.length} eligible)` },
                        { key: 'safety',   label: `Safety & Urgent Needs (${URGENT_NEED_SAFE_SHARE_CANDIDATES.length} eligible)` },
                      ] as { key: typeof safeShareSection; label: string }[]).map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setSafeShareSection(tab.key)}
                          className={cn(
                            "flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                            safeShareSection === tab.key
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
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
                          <div className="bg-orange-50 border border-orange-200 rounded-sm p-3 text-xs text-orange-800 flex items-start gap-2 mb-3">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            Urgent needs in a safe share must be minimum-necessary and must not expose identifying information. Only include items where disclosure serves a legitimate safety purpose for the recipient and consent has been confirmed.
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
                                <span className={cn(
                                  "text-[9px] font-mono uppercase ml-2 px-1.5 py-0.5 rounded border",
                                  n.urgency === 'immediate' ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                )}>
                                  {n.urgency.replace(/-/g, ' ')}
                                </span>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{n.description}</p>
                              </div>
                            </button>
                          ))}
                          {URGENT_NEED_SAFE_SHARE_CANDIDATES.length === 0 && (
                            <p className="text-sm text-muted-foreground italic py-2">No urgent needs at eligible status for safe share inclusion.</p>
                          )}
                        </>
                      )}

                      {/* Minimum necessity confirmation */}
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

            {/* Format selection */}
            <div className="space-y-3">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Output Format</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Object.entries(FORMAT_CONFIG) as [ExportFormat, typeof FORMAT_CONFIG[ExportFormat]][]).map(([fmt, cfg]) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={cn(
                      "p-4 rounded-md border-2 text-left transition-all",
                      selectedFormat === fmt ? cn("border-current bg-white shadow-md", cfg.color) : "border-border bg-card hover:border-foreground/20"
                    )}
                  >
                    <cfg.icon className={cn("w-5 h-5 mb-2", selectedFormat === fmt ? cfg.color : "text-muted-foreground")} />
                    <div className={cn("text-sm font-semibold mb-1", selectedFormat === fmt ? cfg.color : "text-foreground")}>{cfg.label}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cfg.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Manifest preview */}
            <div className="bg-muted border border-border rounded-md p-4 font-mono text-xs text-muted-foreground space-y-1">
              <div className="text-[10px] uppercase tracking-widest mb-2 text-foreground">Manifest Metadata (all formats)</div>
              {[
                ['manifestId',          'MANIFEST-2024-0047-001'],
                ['caseRevision',         'r14'],
                ['runId',                'REPLAY-V1-2024-0047'],
                ['reviewedStateHash',    'sha256:7f3a9b…'],
                ['candidateIds',         `[${(isSafeShare ? [...selectedFindingCandidates] : FINDING_SAFE_SHARE_CANDIDATES.map(f => f.id)).join(', ')}]`],
                ['urgentNeedIds',        isSafeShare ? `[${[...selectedNeedCandidates].join(', ') || '—'}]` : '—'],
               ['referralSummaryCount', String(URGENT_NEED_SAFE_SHARE_CANDIDATES.filter(n => n.status === 'referral-accepted').length)],
                ['citationCount',        '23'],
                ['redactionStatus',      'masked'],
                ['providerTransmission', 'false'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <span className="text-primary">{k}:</span>
                  <span className="text-foreground">{v}</span>
                </div>
              ))}
            </div>

            {/* Generate button */}
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-sm py-3 text-sm"
              disabled={isSafeShare && !minimumConfirmed}
            >
              <Download className="w-4 h-4 mr-2" />
              Create Canonical Handoff — {FORMAT_CONFIG[selectedFormat].label}
              {isSafeShare && (
                <span className="ml-2 text-[10px] bg-teal-800 px-2 py-0.5 rounded">
                  Safe Share · {totalSelected} item{totalSelected !== 1 ? 's' : ''}
                </span>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Downloads locally in the browser · Not emailed, uploaded, filed, or reported</p>
          </section>

        </div>
      </div>
    </div>
  );
}
