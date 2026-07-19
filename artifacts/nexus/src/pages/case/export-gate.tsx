import React, { useState } from 'react';
import { MOCK_CASES, MOCK_FINDINGS } from '@/data/mock-case';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileWarning, EyeOff, Lock, Network, ArrowRight, Download, FileJson, FileText, Code2, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

type ExportFormat = 'html' | 'json' | 'pdf';

const ALL_GATE_CHECKS = [
  { id: 'gc-1', category: 'Purpose', label: 'Purpose Brief completeness', status: 'pass' },
  { id: 'gc-2', category: 'Purpose', label: 'Authority acknowledgements confirmed', status: 'pass' },
  { id: 'gc-3', category: 'Purpose', label: 'Synthetic-data acknowledgements confirmed', status: 'pass' },
  { id: 'gc-4', category: 'Documents', label: 'Document processing completed', status: 'pass' },
  { id: 'gc-5', category: 'Documents', label: 'Coverage calculation verified', status: 'pass' },
  { id: 'gc-6', category: 'Masking', label: 'Masking review approved for all documents', status: 'fail', detail: 'd-5 masking approval pending' },
  { id: 'gc-7', category: 'Masking', label: 'Deterministic leak scan passed', status: 'pass' },
  { id: 'gc-8', category: 'Review', label: 'All consequential items individually reviewed', status: 'fail', detail: '4 items pending practitioner review' },
  { id: 'gc-9', category: 'Review', label: 'Citation validity — all 23 citations', status: 'pass' },
  { id: 'gc-10', category: 'Nexus', label: 'Dependency resolution complete', status: 'fail', detail: '1 unresolved cascade from withdrawn finding' },
  { id: 'gc-11', category: 'Nexus', label: 'No unclosed contradiction loops', status: 'pass' },
  { id: 'gc-12', category: 'Guidance', label: 'Guidance limitations acknowledged', status: 'pass' },
  { id: 'gc-13', category: 'Scope', label: 'Jurisdiction warning noted', status: 'pass' },
  { id: 'gc-14', category: 'Scope', label: 'Purpose scope matches handoff type', status: 'pass' },
  { id: 'gc-15', category: 'Freshness', label: 'Active run freshness (< 24h)', status: 'pass' },
  { id: 'gc-16', category: 'Freshness', label: 'Export-gate evaluation freshness', status: 'fail', detail: 'Gate not yet evaluated this session' },
];

const FORMAT_CONFIG: Record<ExportFormat, {
  icon: React.ElementType; label: string; desc: string; color: string; borderColor: string;
}> = {
  html: { icon: Code2, label: 'Semantic HTML Preview', desc: 'Readable structured preview with full provenance, citations, and limitations. Human-readable for practitioner review before download.', color: 'text-blue-700', borderColor: 'border-blue-300' },
  json: { icon: FileJson, label: 'Canonical Structured JSON', desc: 'Machine-readable manifest with manifest ID, reviewed-state hash, case revision, run ID, all candidate IDs, citations, context gaps, labels, limitations, and redaction status.', color: 'text-purple-700', borderColor: 'border-purple-300' },
  pdf: { icon: FileText, label: 'Local PDF', desc: 'PDF generated locally in the browser — loaded only when requested. Contains the same manifest ID and reviewed-state hash as the JSON. No server upload.', color: 'text-teal-700', borderColor: 'border-teal-300' },
};

const SAFE_SHARE_CANDIDATES = MOCK_FINDINGS.filter(f => f.reviewStatus === 'accepted');

export default function CaseExportGate() {
  const caseData = MOCK_CASES[0];
  const pendingFindings = MOCK_FINDINGS.filter(f => f.reviewStatus === 'pending');
  const unresolvedFindings = MOCK_FINDINGS.filter(f => f.supportStatus === 'unresolved');
  const isReady = caseData.exportGateStatus === 'ready';

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('html');
  const [showAllChecks, setShowAllChecks] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set(SAFE_SHARE_CANDIDATES.map(f => f.id)));
  const [isSafeShare, setIsSafeShare] = useState(false);
  const [minimumConfirmed, setMinimumConfirmed] = useState(false);

  const failingChecks = ALL_GATE_CHECKS.filter(c => c.status === 'fail');
  const passingChecks = ALL_GATE_CHECKS.filter(c => c.status === 'pass');
  const checksByCategory = ALL_GATE_CHECKS.reduce<Record<string, typeof ALL_GATE_CHECKS>>((acc, c) => {
    (acc[c.category] = acc[c.category] || []).push(c);
    return acc;
  }, {});

  const blockers = [
    { id: 'b1', title: 'Unreviewed Consequential Items', count: pendingFindings.length, icon: AlertTriangle, color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', link: '/analysis' },
    { id: 'b2', title: 'Unresolved Dependency Cascade', count: unresolvedFindings.length, icon: Network, color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', link: '/nexus' },
    { id: 'b3', title: 'Missing Critical Evidence Flags', count: 0, icon: FileWarning, color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', link: '/analysis' },
    { id: 'b4', title: 'Incomplete Masking Actions', count: 1, icon: EyeOff, color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', link: '/' },
  ];

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Hero status */}
      <div className={cn("px-7 py-8 border-b border-border shrink-0", isReady ? "bg-teal-50/40" : "bg-amber-50/20")}>
        <div className="max-w-4xl mx-auto flex items-start gap-5">
          <div className={cn("p-3.5 rounded-full border-2 shadow-sm shrink-0",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {blockers.map(b => (
                <div key={b.id} className={cn("p-4 rounded-md border flex flex-col shadow-sm", b.count > 0 ? cn("bg-card", b.borderColor) : "bg-muted border-border opacity-50")}>
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
          </section>

          {/* Full gate checks */}
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
                        <div className="bg-muted px-4 py-2 border-b border-border">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{category}</span>
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
                            <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0",
                              check.status === 'pass' ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-red-50 text-red-700 border-red-200"
                            )}>{check.status}</span>
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
                  <div className="bg-card border border-border rounded-md p-4 space-y-3">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Candidate Selection — Minimum Necessity</div>
                    <p className="text-xs text-muted-foreground">Select only what is necessary for the identified recipient. Raw documents and unnecessary identifiers are excluded automatically.</p>
                    <div className="space-y-2">
                      {SAFE_SHARE_CANDIDATES.map(f => (
                        <button key={f.id} onClick={() => toggleCandidate(f.id)} className={cn("w-full flex items-start gap-3 p-3 rounded-sm border text-left transition-all", selectedCandidates.has(f.id) ? "border-teal-200 bg-teal-50" : "border-border bg-muted hover:border-foreground/20")}>
                          <div className={cn("w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center", selectedCandidates.has(f.id) ? "border-teal-600 bg-teal-600" : "border-border")}>
                            {selectedCandidates.has(f.id) && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-foreground">{f.title}</span>
                            <span className="text-[10px] font-mono text-muted-foreground ml-2">{f.id}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setMinimumConfirmed(v => !v)}
                      className={cn("w-full flex items-center gap-2 p-3 rounded-sm border transition-all", minimumConfirmed ? "border-teal-200 bg-teal-50" : "border-border hover:border-foreground/20")}
                    >
                      <div className={cn("w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center", minimumConfirmed ? "border-teal-600 bg-teal-600" : "border-border")}>
                        {minimumConfirmed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs text-muted-foreground">I confirm this selection meets the minimum-necessity threshold for the identified recipient.</span>
                    </button>
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
                      selectedFormat === fmt
                        ? cn("border-current bg-white shadow-md", cfg.color)
                        : "border-border bg-card hover:border-foreground/20"
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
                ['manifestId', 'MANIFEST-2024-0047-001'],
                ['caseRevision', 'r14'],
                ['runId', 'REPLAY-V1-2024-0047'],
                ['reviewedStateHash', 'sha256:7f3a9b…'],
                ['candidateIds', `[${(isSafeShare ? [...selectedCandidates] : SAFE_SHARE_CANDIDATES.map(f => f.id)).join(', ')}]`],
                ['citationCount', '23'],
                ['redactionStatus', 'masked'],
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
              {isSafeShare && <span className="ml-2 text-[10px] bg-teal-800 px-2 py-0.5 rounded">Safe Share · {selectedCandidates.size} candidates</span>}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Downloads locally in the browser · Not emailed, uploaded, filed, or reported</p>
          </section>

        </div>
      </div>
    </div>
  );
}
