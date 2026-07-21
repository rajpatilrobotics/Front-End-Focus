import React, { useState } from 'react';
import { MOCK_DOCUMENTS, Document } from '@/data/mock-case';
import {
  FileText, ShieldAlert, Upload, Lock, Unlock, CheckCircle2, AlertTriangle,
  Clock, Cpu, Eye, FileX, ImageIcon, RotateCcw, Info, BarChart2, Shield, ZoomIn,
  RefreshCw, FilePlus, AlertCircle, CheckSquare, Scan,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

// ── Existing pipeline config (preserved) ─────────────────────────────────────

const PROCESSING_STAGES = [
  { id: 1, name: 'Intake Validation',          desc: 'Verifying document integrity and file format' },
  { id: 2, name: 'Text Extraction',             desc: 'Extracting text content via PDF.js (browser-local)' },
  { id: 3, name: 'Coverage Calculation',        desc: 'Computing page availability and extraction rate' },
  { id: 4, name: 'Identifier Masking',          desc: 'Applying deterministic masks to sensitive identifiers' },
  { id: 5, name: 'Candidate Extraction',        desc: 'Identifying canonical source segments' },
  { id: 6, name: 'Citation Validation',         desc: 'Verifying all citation–segment bindings' },
  { id: 7, name: 'Timeline & Nexus Assembly',   desc: 'Assembling chronology and relationship graph' },
  { id: 8, name: 'Safety & Export-Gate Checks', desc: 'Running leak scan and pre-export validation' },
];

type ProcessingState = 'idle' | 'running' | 'complete';
type PageStatus = 'processed' | 'missing' | 'unreadable' | 'image-only' | 'excluded' | 'extraction-failed' | 'segment-mismatch';

const PAGE_STATUS_CONFIG: Record<PageStatus, {
  label: string; color: string; dot: string; ocr: string; retryable: boolean; retryLabel?: string;
}> = {
  'processed':         { label: 'Processed',        color: 'text-teal-700 bg-teal-50 border-teal-200',       dot: 'bg-teal-500',      ocr: 'Text extracted successfully',                         retryable: false },
  'missing':           { label: 'Missing',           color: 'text-red-700 bg-red-50 border-red-200',          dot: 'bg-red-500',       ocr: 'Page not present in file',                            retryable: false },
  'unreadable':        { label: 'Unreadable',        color: 'text-amber-700 bg-amber-50 border-amber-200',    dot: 'bg-amber-500',     ocr: 'Text extraction failed — unreadable content',         retryable: true, retryLabel: 'Request Re-extraction' },
  'image-only':        { label: 'Image Only',        color: 'text-blue-700 bg-blue-50 border-blue-200',       dot: 'bg-blue-400',      ocr: 'No text layer — OCR required',                        retryable: true, retryLabel: 'Request OCR' },
  'excluded':          { label: 'Excluded',          color: 'text-slate-600 bg-slate-50 border-slate-200',    dot: 'bg-slate-400',     ocr: 'Excluded from processing scope',                      retryable: false },
  'extraction-failed': { label: 'Extraction Failed', color: 'text-red-700 bg-red-50 border-red-200',          dot: 'bg-red-600',       ocr: 'PDF text extraction failed',                          retryable: true, retryLabel: 'Retry Extraction' },
  'segment-mismatch':  { label: 'Segment Mismatch',  color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-500',    ocr: 'Extracted text does not match linked citation segment', retryable: true, retryLabel: 'Re-run Segment Alignment' },
};

type QualityTier = 'high' | 'medium' | 'low' | 'blocked';
const QUALITY_TIER: Record<QualityTier, { label: string; bar: string; text: string }> = {
  high:    { label: 'High Quality',   bar: 'bg-teal-500',  text: 'text-teal-700' },
  medium:  { label: 'Medium Quality', bar: 'bg-amber-400', text: 'text-amber-700' },
  low:     { label: 'Low Quality',    bar: 'bg-red-500',   text: 'text-red-700' },
  blocked: { label: 'Export Blocked', bar: 'bg-red-700',   text: 'text-red-800' },
};

function getQualityScore(doc: Document): { score: number; tier: QualityTier; issues: string[] } {
  const issues: string[] = [];
  let score = 100;
  if (doc.extractionStatus === 'failed')   { score -= 60; issues.push('Extraction completely failed'); }
  else if (doc.extractionStatus === 'partial') { score -= 30; issues.push('Partial extraction — some pages unavailable'); }
  const imageOnlyPages = doc.pages.filter(p => p.status === 'image-only').length;
  const failedPages    = doc.pages.filter(p => p.status === 'extraction-failed').length;
  const missingPages   = doc.pages.filter(p => p.status === 'missing').length;
  if (imageOnlyPages > 0) { score -= imageOnlyPages * 8;  issues.push(`${imageOnlyPages} image-only page${imageOnlyPages > 1 ? 's' : ''} — OCR not applied`); }
  if (failedPages > 0)    { score -= failedPages * 10;    issues.push(`${failedPages} extraction failure${failedPages > 1 ? 's' : ''}`); }
  if (missingPages > 0)   { score -= missingPages * 15;   issues.push(`${missingPages} missing page${missingPages > 1 ? 's' : ''}`); }
  if (doc.maskingStatus === 'pending') { score -= 15; issues.push('Masking approval pending'); }
  const clamped = Math.max(0, Math.min(100, score));
  const tier: QualityTier = clamped >= 85 ? 'high' : clamped >= 55 ? 'medium' : clamped >= 20 ? 'low' : 'blocked';
  return { score: clamped, tier, issues };
}

// ── Phase 5: Document health ──────────────────────────────────────────────────

type HealthKey = 'usable' | 'partial' | 'ocr-required' | 'manual-review' | 'failed';

type HealthStatus = {
  key: HealthKey;
  label: string;
  chip: string;
  dot: string;
  badge: string;
  extractionMethod: string;
};

const HEALTH_CONFIG: Record<HealthKey, HealthStatus> = {
  'usable':        { key: 'usable',        label: 'Usable',          chip: 'bg-teal-50 text-teal-700 border-teal-200',       dot: 'bg-teal-500',     badge: 'bg-teal-50 text-teal-700 border-teal-200',       extractionMethod: 'Text extraction' },
  'partial':       { key: 'partial',       label: 'Partial',         chip: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-500',    badge: 'bg-amber-50 text-amber-700 border-amber-200',     extractionMethod: 'Partial text extraction' },
  'ocr-required':  { key: 'ocr-required',  label: 'OCR required',    chip: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-500',     badge: 'bg-blue-50 text-blue-700 border-blue-200',        extractionMethod: 'Image scan — OCR pending' },
  'manual-review': { key: 'manual-review', label: 'Manual review',   chip: 'bg-purple-50 text-purple-700 border-purple-200',  dot: 'bg-purple-500',   badge: 'bg-purple-50 text-purple-700 border-purple-200',  extractionMethod: 'Awaiting practitioner review' },
  'failed':        { key: 'failed',        label: 'Failed',          chip: 'bg-red-50 text-red-700 border-red-200',           dot: 'bg-red-500',      badge: 'bg-red-50 text-red-700 border-red-200',           extractionMethod: 'Extraction failed' },
};

function getHealthStatus(doc: Document): HealthStatus {
  if (doc.extractionStatus === 'failed') return HEALTH_CONFIG['failed'];
  const hasImageOnly = doc.pages.some(p => p.status === 'image-only');
  const hasMismatch  = doc.pages.some(p => p.status === 'segment-mismatch');
  const isPendingMask = doc.maskingStatus === 'pending';
  if (hasImageOnly && doc.extractionStatus === 'partial') return HEALTH_CONFIG['ocr-required'];
  if (isPendingMask || hasMismatch) return HEALTH_CONFIG['manual-review'];
  if (hasImageOnly) return HEALTH_CONFIG['ocr-required'];
  if (doc.extractionStatus === 'partial') return HEALTH_CONFIG['partial'];
  return HEALTH_CONFIG['usable'];
}

type HealthFilter = 'all' | HealthKey;

const HEALTH_FILTERS: { key: HealthFilter; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'usable',       label: 'Usable' },
  { key: 'partial',      label: 'Partial' },
  { key: 'ocr-required', label: 'OCR required' },
  { key: 'manual-review',label: 'Manual review' },
];

// Coverage limitations per document (static synthetic)
const COVERAGE_LIMITATIONS: Record<string, string[]> = {
  'd-1': [],
  'd-2': ['Page 3 is image-only — no text layer present. Content cannot be extracted without OCR. This page may contain relevant terms or signatures.'],
  'd-3': ['Page 1 partially legible — border entry stamp obscured. Arrival date unresolvable from this source alone.', 'Pages 4–5 missing from uploaded file. Not treated as blank — absence is recorded.'],
  'd-4': ['Full extraction failed. Document may be password-protected or corrupted. Replace with a readable copy before export.'],
  'd-5': ['Masking approval pending. Document is withheld from export until practitioner confirms masking is complete.', 'Segment mismatch on p.2 — extracted text does not align with linked citation. Manual review required.'],
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CaseDocuments() {
  const [selectedDoc, setSelectedDoc]       = useState(MOCK_DOCUMENTS[0]);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [isRevealed, setIsRevealed]         = useState(false);
  const [revealReason, setRevealReason]     = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [currentStage, setCurrentStage]     = useState<number | null>(null);
  const [retryingPage, setRetryingPage]     = useState<number | null>(null);
  const [retriedPages, setRetriedPages]     = useState<Set<number>>(new Set());
  const [activeDetailTab, setActiveDetailTab] = useState<'pages' | 'quality' | 'masking' | 'health'>('health');
  // Phase 5 state
  const [healthFilter, setHealthFilter]     = useState<HealthFilter>('all');

  const totalPages      = MOCK_DOCUMENTS.reduce((s, d) => s + d.pageCount, 0);
  const availablePages  = totalPages - 1;
  const totalSegments   = MOCK_DOCUMENTS.reduce((s, d) => s + (d.canonicalSegments || 0), 0);
  const totalImageOnly  = MOCK_DOCUMENTS.reduce((s, d) => s + d.pages.filter(p => p.status === 'image-only').length, 0);
  const totalFailed     = MOCK_DOCUMENTS.reduce((s, d) => s + d.pages.filter(p => p.status === 'extraction-failed' || p.status === 'missing').length, 0);

  // Phase 5: health summary counts
  const healthCounts = {
    usable:        MOCK_DOCUMENTS.filter(d => getHealthStatus(d).key === 'usable').length,
    partial:       MOCK_DOCUMENTS.filter(d => getHealthStatus(d).key === 'partial').length,
    'ocr-required':MOCK_DOCUMENTS.filter(d => getHealthStatus(d).key === 'ocr-required').length,
    'manual-review':MOCK_DOCUMENTS.filter(d => getHealthStatus(d).key === 'manual-review').length,
    failed:        MOCK_DOCUMENTS.filter(d => getHealthStatus(d).key === 'failed').length,
  };

  const filteredDocs = healthFilter === 'all'
    ? MOCK_DOCUMENTS
    : MOCK_DOCUMENTS.filter(d => getHealthStatus(d).key === healthFilter);

  const quality = getQualityScore(selectedDoc);
  const selectedHealth = getHealthStatus(selectedDoc);
  const coverageLimitations = COVERAGE_LIMITATIONS[selectedDoc.id] ?? [];

  const handleProcess = () => {
    setProcessingState('running');
    setCompletedStages([]);
    setCurrentStage(1);
    PROCESSING_STAGES.forEach((stage, i) => {
      setTimeout(() => {
        setCurrentStage(stage.id);
        if (i === PROCESSING_STAGES.length - 1) {
          setTimeout(() => {
            setCompletedStages(PROCESSING_STAGES.map(s => s.id));
            setCurrentStage(null);
            setProcessingState('complete');
          }, 900);
        } else {
          setCompletedStages(prev => [...prev, stage.id]);
        }
      }, i * 700);
    });
  };

  const handleReveal = () => { setIsRevealed(true); setRevealModalOpen(false); };

  const handleRetry = (page: number) => {
    setRetryingPage(page);
    setTimeout(() => {
      setRetryingPage(null);
      setRetriedPages(prev => new Set([...prev, page]));
    }, 1800);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">

      {/* ── Coverage + health summary bar ── */}
      <div className="border-b border-border bg-card/60 px-5 py-3 shrink-0 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5 text-xs font-mono flex-wrap">
          <span className="text-muted-foreground">DOCS <strong className="text-foreground">{MOCK_DOCUMENTS.length}</strong></span>
          <span className="text-muted-foreground">PAGES <strong className="text-foreground">{totalPages}</strong></span>
          <span className="text-muted-foreground">AVAILABLE <strong className="text-teal-700">{availablePages}</strong></span>
          <span className="text-muted-foreground">MISSING/FAILED <strong className={cn(totalFailed > 0 ? "text-red-600" : "text-foreground")}>{totalFailed}</strong></span>
          <span className="text-muted-foreground">SEGMENTS <strong className="text-foreground">{totalSegments}</strong></span>
          {totalImageOnly > 0 && (
            <span className="text-muted-foreground">
              IMAGE-ONLY <strong className="text-blue-600">{totalImageOnly}</strong>
              <span className="text-muted-foreground/70 ml-1">— OCR required</span>
            </span>
          )}
          {/* Phase 5: health summary chips */}
          <span className="border-l border-border pl-4 flex items-center gap-2">
            {healthCounts.usable > 0 && (
              <span className="flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-sm text-[10px]">
                <CheckCircle2 className="w-3 h-3" />{healthCounts.usable} Usable
              </span>
            )}
            {healthCounts['ocr-required'] > 0 && (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-sm text-[10px]">
                <Scan className="w-3 h-3" />{healthCounts['ocr-required']} OCR required
              </span>
            )}
            {healthCounts['manual-review'] > 0 && (
              <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-sm text-[10px]">
                <AlertCircle className="w-3 h-3" />{healthCounts['manual-review']} Manual review
              </span>
            )}
            {healthCounts.failed > 0 && (
              <span className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-sm text-[10px]">
                <FileX className="w-3 h-3" />{healthCounts.failed} Failed
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {processingState === 'idle' && (
            <Button size="sm" onClick={handleProcess} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm h-7 text-xs font-medium">
              <Cpu className="w-3.5 h-3.5 mr-1.5" />Process Bundled PDFs Locally
            </Button>
          )}
          {processingState === 'complete' && (
            <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Processing complete
            </div>
          )}
        </div>
      </div>

      {/* ── Phase 5: technical usability disclaimer ── */}
      <div className="border-b border-border bg-muted/30 px-5 py-2 shrink-0 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-[11px] font-mono text-muted-foreground">
          Document health describes <strong className="text-foreground">technical usability</strong>, not whether a source is accurate or credible. Usability status does not imply evidentiary weight or legal validity.
        </p>
      </div>

      {/* ── Processing pipeline (preserved) ── */}
      <AnimatePresence>
        {processingState !== 'idle' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-muted/20 shrink-0 overflow-hidden"
          >
            <div className="px-5 py-4">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                Processing Pipeline — Browser Local · No Provider Transmission
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {PROCESSING_STAGES.map(stage => {
                  const isDone    = completedStages.includes(stage.id);
                  const isRunning = currentStage === stage.id && !isDone;
                  return (
                    <div key={stage.id} className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-md border text-center transition-all",
                      isDone ? "bg-teal-50 border-teal-200" : isRunning ? "bg-primary/5 border-primary/30" : "bg-card border-border"
                    )}>
                      <div className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center",
                        isDone ? "border-teal-500 bg-teal-500 text-white" : isRunning ? "border-primary animate-pulse" : "border-border"
                      )}>
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4" />
                          : isRunning
                            ? <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                            : <span className="text-[9px] font-mono font-bold text-muted-foreground">0{stage.id}</span>}
                      </div>
                      <span className={cn("text-[9px] font-mono uppercase leading-tight",
                        isDone ? "text-teal-700" : isRunning ? "text-primary" : "text-muted-foreground"
                      )}>
                        {stage.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ── Document list ── */}
        <div className="w-full md:w-[380px] flex-shrink-0 border-r border-border bg-muted/20 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-card/60">
            <h2 className="font-semibold text-foreground text-sm">Documents</h2>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-7 bg-card border-border text-foreground hover:bg-muted text-xs">
                <Upload className="w-3 h-3 mr-1.5" />Upload
              </Button>
            </div>
          </div>

          {/* Phase 5: health filter chips */}
          <div className="px-3 py-2 border-b border-border bg-card/40 flex items-center gap-1.5 flex-wrap">
            {HEALTH_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => {
                  const newFiltered = f.key === 'all' ? MOCK_DOCUMENTS : MOCK_DOCUMENTS.filter(d => getHealthStatus(d).key === f.key);
                  if (!newFiltered.some(d => d.id === selectedDoc.id)) {
                    setSelectedDoc(newFiltered[0] ?? MOCK_DOCUMENTS[0]);
                    setIsRevealed(false);
                  }
                  setHealthFilter(f.key);
                }}
                className={cn(
                  "px-2.5 py-0.5 text-[10px] font-mono rounded-full border transition-colors",
                  healthFilter === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {f.label}
                {f.key !== 'all' && (
                  <span className="ml-1 opacity-70">
                    {healthCounts[f.key as HealthKey]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredDocs.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">
                No documents in this filter.
              </div>
            )}

            {filteredDocs.map(doc => {
              const q      = getQualityScore(doc);
              const h      = getHealthStatus(doc);
              const tierCfg = QUALITY_TIER[q.tier];
              const readablePages = doc.pages.filter(p => p.status === 'processed').length;
              const ocrPages      = doc.pages.filter(p => p.status === 'image-only').length;
              const failedPagesN  = doc.pages.filter(p => p.status === 'extraction-failed' || p.status === 'missing').length;

              return (
                <div
                  key={doc.id}
                  onClick={() => { setSelectedDoc(doc); setIsRevealed(false); setActiveDetailTab('health'); }}
                  className={cn(
                    "p-3 rounded-sm border cursor-pointer transition-all",
                    selectedDoc.id === doc.id
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15 hover:bg-muted/30"
                  )}
                >
                  {/* Filename + type */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{doc.fileName}</span>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted border border-border shrink-0">{doc.type}</span>
                  </div>

                  {/* Phase 5: health status badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border flex items-center gap-1", h.badge)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", h.dot)} />
                      {h.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{h.extractionMethod}</span>
                  </div>

                  {/* Quality bar (preserved) */}
                  <div className="mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-[10px] font-mono", tierCfg.text)}>{tierCfg.label}</span>
                      <span className={cn("text-[10px] font-mono font-bold", tierCfg.text)}>{q.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className={cn("h-full rounded-full bg-gradient-to-r from-transparent to-current opacity-20", tierCfg.bar)} style={{ width: `${q.score}%` }} />
                      <div className={cn("h-full rounded-full transition-all -mt-3 relative z-10", tierCfg.bar)} style={{ width: `${q.score}%`, backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 100%)' }} />
                    </div>
                  </div>

                  {/* Page status bar (preserved) */}
                  {doc.pages.length > 0 && (
                    <div className="flex items-center gap-0.5 mb-2">
                      {doc.pages.map(p => (
                        <div
                          key={p.page}
                          className={cn("w-3.5 h-1.5 rounded-sm group relative", PAGE_STATUS_CONFIG[p.status as PageStatus]?.dot || 'bg-border')}
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] font-mono whitespace-nowrap rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            Page {p.page}: {PAGE_STATUS_CONFIG[p.status as PageStatus]?.label || p.status}
                          </div>
                        </div>
                      ))}
                      {doc.pageCount > doc.pages.length && (
                        <span className="text-[9px] text-muted-foreground ml-1">+{doc.pageCount - doc.pages.length} more</span>
                      )}
                    </div>
                  )}

                  {/* Phase 5: compact page stats row */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground mb-1.5">
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{doc.pageCount}</strong> pp
                    </span>
                    {readablePages > 0 && (
                      <span className="text-teal-700"><strong>{readablePages}</strong> readable</span>
                    )}
                    {ocrPages > 0 && (
                      <span className="text-blue-600"><strong>{ocrPages}</strong> OCR</span>
                    )}
                    {failedPagesN > 0 && (
                      <span className="text-red-600"><strong>{failedPagesN}</strong> failed</span>
                    )}
                    <span className="text-muted-foreground/60 ml-auto">{doc.language}</span>
                  </div>

                  {/* Masking + coverage (preserved) */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                    <span className={cn("w-1.5 h-1.5 rounded-full inline-block",
                      doc.extractionStatus === 'complete' ? 'bg-teal-500' :
                      doc.extractionStatus === 'partial'  ? 'bg-amber-500' : 'bg-red-500'
                    )} />
                    {doc.coveragePercentage}% extracted
                    {doc.maskingStatus === 'masked' ? (
                      <span className="text-teal-600 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />masked</span>
                    ) : doc.maskingStatus === 'pending' ? (
                      <span className="text-amber-600 flex items-center gap-0.5"><ShieldAlert className="w-2.5 h-2.5" />pending</span>
                    ) : null}
                  </div>

                  {q.issues.length > 0 && (
                    <div className="mt-2 text-[9px] font-mono text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      ⚠ {q.issues[0]}{q.issues.length > 1 ? ` (+${q.issues.length - 1} more)` : ''}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Legend (preserved) */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Page States</div>
              <div className="grid grid-cols-2 gap-1">
                {(Object.entries(PAGE_STATUS_CONFIG) as [PageStatus, typeof PAGE_STATUS_CONFIG[PageStatus]][]).map(([status, cfg]) => (
                  <div key={status} className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                    {cfg.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Document detail panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/10 relative">

          {/* Toolbar (preserved) */}
          <div className="h-11 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground text-sm truncate">{selectedDoc.fileName}</span>
              <span className="text-xs text-muted-foreground font-mono border-l border-border pl-3 shrink-0">{selectedDoc.id}</span>
              {selectedDoc.canonicalSegments !== undefined && (
                <span className="text-xs font-mono text-muted-foreground shrink-0">{selectedDoc.canonicalSegments} segs</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Phase 5: visual-only actions */}
              <Button size="sm" variant="outline" className="h-7 text-xs border-border text-muted-foreground hover:bg-muted font-mono">
                <FilePlus className="w-3 h-3 mr-1" />Replace File
              </Button>
              {!isRevealed ? (
                <Button onClick={() => setRevealModalOpen(true)} size="sm" variant="outline" className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 font-mono uppercase tracking-wider">
                  <Unlock className="w-3 h-3 mr-1" />Intentional Reveal
                </Button>
              ) : (
                <Button onClick={() => setIsRevealed(false)} size="sm" variant="outline" className="h-7 text-xs border-teal-300 text-teal-700 hover:bg-teal-50 font-mono uppercase tracking-wider">
                  <Lock className="w-3 h-3 mr-1" />Restore Masking
                </Button>
              )}
            </div>
          </div>

          {/* Detail tabs (health tab added) */}
          <div className="border-b border-border bg-muted/20 px-4 flex items-center gap-0.5 shrink-0 overflow-x-auto">
            {([
              { key: 'health',  label: 'Document Health', icon: CheckSquare },
              { key: 'pages',   label: 'Document View',   icon: Eye },
              { key: 'quality', label: 'Source Quality',  icon: BarChart2 },
              { key: 'masking', label: 'Masking Status',  icon: Shield },
            ] as { key: typeof activeDetailTab; label: string; icon: React.ElementType }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveDetailTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeDetailTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            ))}
          </div>

          {/* ── Phase 5: Document Health tab ── */}
          {activeDetailTab === 'health' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl space-y-5">

                {/* Health status header */}
                <div className={cn(
                  "flex items-start gap-4 p-4 rounded-sm border",
                  selectedHealth.key === 'usable'        && "bg-teal-50 border-teal-200",
                  selectedHealth.key === 'partial'       && "bg-amber-50 border-amber-200",
                  selectedHealth.key === 'ocr-required'  && "bg-blue-50 border-blue-200",
                  selectedHealth.key === 'manual-review' && "bg-purple-50 border-purple-200",
                  selectedHealth.key === 'failed'        && "bg-red-50 border-red-200",
                )}>
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-1", selectedHealth.dot)} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn(
                        "text-sm font-semibold",
                        selectedHealth.key === 'usable'        && "text-teal-800",
                        selectedHealth.key === 'partial'       && "text-amber-800",
                        selectedHealth.key === 'ocr-required'  && "text-blue-800",
                        selectedHealth.key === 'manual-review' && "text-purple-800",
                        selectedHealth.key === 'failed'        && "text-red-800",
                      )}>
                        {selectedHealth.label}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {selectedHealth.extractionMethod}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedHealth.key === 'usable'        && 'All pages extracted successfully. This document is technically usable for case analysis.'}
                      {selectedHealth.key === 'partial'       && 'Some pages could not be extracted. Usable content is available but coverage is incomplete.'}
                      {selectedHealth.key === 'ocr-required'  && 'One or more pages contain image content with no text layer. OCR is required before this material can be read.'}
                      {selectedHealth.key === 'manual-review' && 'This document requires practitioner review before it can be included in an export. Check the Masking Status tab for details.'}
                      {selectedHealth.key === 'failed'        && 'Extraction failed. This document cannot be read in its current state. Replace with a readable copy or record the limitation.'}
                    </p>
                  </div>
                </div>

                {/* Metadata table */}
                <div className="border border-border rounded-sm overflow-hidden">
                  <div className="bg-muted border-b border-border px-4 py-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Document Details</span>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { label: 'Document ID',        value: selectedDoc.id },
                      { label: 'Filename',           value: selectedDoc.fileName },
                      { label: 'Document Type',      value: selectedDoc.type },
                      { label: 'Total Pages',        value: `${selectedDoc.pageCount}` },
                      { label: 'Readable Pages',     value: `${selectedDoc.pages.filter(p => p.status === 'processed').length}` },
                      { label: 'OCR Pages',          value: `${selectedDoc.pages.filter(p => p.status === 'image-only').length}` },
                      { label: 'Failed Pages',       value: `${selectedDoc.pages.filter(p => p.status === 'extraction-failed' || p.status === 'missing').length}` },
                      { label: 'Detected Language',  value: selectedDoc.language },
                      { label: 'Extraction Method',  value: selectedHealth.extractionMethod },
                      { label: 'Extraction Coverage',value: `${selectedDoc.coveragePercentage}%` },
                      { label: 'Health Status',      value: selectedHealth.label },
                      { label: 'Masking Status',     value: selectedDoc.maskingStatus },
                    ].map(row => (
                      <div key={row.label} className="flex items-center px-4 py-2 text-sm">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground w-40 shrink-0">{row.label}</span>
                        <span className="font-mono text-foreground">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page-level health breakdown */}
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    Page-Level Health
                  </div>
                  <div className="border border-border rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-muted-foreground">Page</th>
                          <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-muted-foreground">Status</th>
                          <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-muted-foreground">Note</th>
                          <th className="text-left px-3 py-2 text-[10px] font-mono uppercase text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDoc.pages.map((p, i) => {
                          const cfg = PAGE_STATUS_CONFIG[p.status as PageStatus];
                          return (
                            <tr key={p.page} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-card" : "bg-muted/20")}>
                              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">p.{p.page}</td>
                              <td className="px-3 py-2">
                                <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 w-fit", cfg.color)}>
                                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{cfg.ocr}</td>
                              <td className="px-3 py-2">
                                {cfg.retryable ? (
                                  <Button size="sm" variant="outline" className={cn(
                                    "h-6 text-[10px] font-mono border rounded-sm px-2",
                                    p.status === 'image-only'
                                      ? "border-blue-200 text-blue-700 hover:bg-blue-50"
                                      : "border-amber-200 text-amber-700 hover:bg-amber-50"
                                  )}>
                                    <RotateCcw className="w-2.5 h-2.5 mr-1" />{cfg.retryLabel}
                                  </Button>
                                ) : (
                                  <span className="text-[10px] font-mono text-muted-foreground/50">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Coverage limitations */}
                <div className="border border-border rounded-sm overflow-hidden">
                  <div className="bg-muted border-b border-border px-4 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Coverage Limitations
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    {coverageLimitations.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-teal-700">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        No coverage limitations recorded for this document.
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {coverageLimitations.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                      Limitations are recorded to support honest case assessment. Missing or unreadable material is not treated as absent — its existence and inaccessibility are noted separately.
                    </p>
                  </div>
                </div>

                {/* Visual-only action bar */}
                <div className="border border-border rounded-sm bg-card p-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground mr-1">Actions:</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border">
                    <Eye className="w-3 h-3 mr-1.5" />Review Pages
                  </Button>
                  {selectedDoc.pages.some(p => p.status === 'image-only') && (
                    <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-blue-200 text-blue-700 hover:bg-blue-50">
                      <RefreshCw className="w-3 h-3 mr-1.5" />Retry OCR
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border">
                    <FilePlus className="w-3 h-3 mr-1.5" />Replace File
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border">
                    <Upload className="w-3 h-3 mr-1.5" />Upload Documents
                  </Button>
                </div>

              </div>
            </div>
          )}

          {/* ── Existing: Document View tab (preserved exactly) ── */}
          {activeDetailTab === 'pages' && (
            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
              <div className={cn(
                "max-w-2xl w-full bg-white text-black p-10 min-h-[600px] shadow-lg border border-border/50",
                !isRevealed ? "font-mono text-sm leading-relaxed" : "font-sans text-base"
              )}>
                <h1 className="text-xl font-bold mb-6 uppercase tracking-widest border-b-2 border-black pb-4 text-sm">
                  {selectedDoc.fileName.replace('.pdf', '')}
                </h1>
                <div className="space-y-5">
                  <p>
                    This document confirms the employment of{' '}
                    {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_NAME_1]</span> : <span className="bg-yellow-200 px-1 font-bold">John Doe</span>}{' '}
                    effective{' '}
                    {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_DATE_1]</span> : <span className="bg-yellow-200 px-1 font-bold">October 1, 2023</span>}.
                  </p>
                  <p>
                    The employee will report to the facility at{' '}
                    {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_LOC_1]</span> : <span className="bg-yellow-200 px-1 font-bold">123 Industrial Parkway</span>}.
                  </p>
                  <p>
                    A deduction of $400/month for placement fee will be applied for the first 6 months. Original passport held for "safekeeping" by{' '}
                    {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_ORG_1]</span> : <span className="bg-yellow-200 px-1 font-bold">Global Staffing Solutions LLC</span>}.
                  </p>
                  {selectedDoc.extractionStatus !== 'complete' && (
                    <div className="my-8 p-4 border-2 border-dashed border-red-400 bg-red-50 text-red-700 text-center font-mono text-xs">
                      [PAGES UNREADABLE / EXTRACTION FAILED — MISSINGNESS NOT TREATED AS SUCCESS]
                    </div>
                  )}
                  {selectedDoc.pages.some(p => p.status === 'image-only') && (
                    <div className="my-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      [IMAGE-ONLY PAGE — TEXT EXTRACTION NOT POSSIBLE · REQUEST OCR IN SOURCE QUALITY TAB]
                    </div>
                  )}
                  <p>
                    Authorized Signature:{' '}
                    {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_NAME_2]</span> : <span className="bg-yellow-200 px-1 font-bold">Michael Smith</span>}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Existing: Source Quality tab (preserved exactly) ── */}
          {activeDetailTab === 'quality' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl space-y-6">
                {/* Summary score */}
                <div className={cn(
                  "p-5 rounded-md border shadow-sm",
                  quality.tier === 'high'   ? "bg-teal-50 border-teal-200"
                  : quality.tier === 'medium' ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Source Quality Score</div>
                      <div className={cn("text-3xl font-bold font-mono", QUALITY_TIER[quality.tier].text)}>{quality.score}%</div>
                    </div>
                    <span className={cn("text-sm font-semibold px-3 py-1.5 rounded border", QUALITY_TIER[quality.tier].text,
                      quality.tier === 'high'   ? "bg-teal-100 border-teal-300"
                      : quality.tier === 'medium' ? "bg-amber-100 border-amber-300"
                      : "bg-red-100 border-red-300"
                    )}>
                      {QUALITY_TIER[quality.tier].label}
                    </span>
                  </div>
                  <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden">
                    <div className={cn("h-full rounded-full", QUALITY_TIER[quality.tier].bar)} style={{ width: `${quality.score}%` }} />
                  </div>
                  {quality.issues.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                      {quality.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                  {quality.issues.length === 0 && (
                    <p className="mt-3 text-sm text-teal-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />No quality issues detected.</p>
                  )}
                </div>

                {/* Per-page OCR status */}
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Per-Page OCR &amp; Extraction Status</div>
                  <div className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="text-left px-4 py-2 text-[10px] font-mono uppercase text-muted-foreground">Page</th>
                          <th className="text-left px-4 py-2 text-[10px] font-mono uppercase text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-2 text-[10px] font-mono uppercase text-muted-foreground">OCR / Extraction</th>
                          <th className="text-left px-4 py-2 text-[10px] font-mono uppercase text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDoc.pages.map((p, i) => {
                          const cfg = PAGE_STATUS_CONFIG[p.status as PageStatus];
                          const isRetrying = retryingPage === p.page;
                          const wasRetried = retriedPages.has(p.page);
                          return (
                            <tr key={p.page} className={cn("border-b border-border/50", i % 2 === 0 ? "bg-card" : "bg-muted/20")}>
                              <td className="px-4 py-2.5 font-mono text-sm text-muted-foreground">p.{p.page}</td>
                              <td className="px-4 py-2.5">
                                <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 w-fit", cfg.color)}>
                                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                {wasRetried
                                  ? <span className="text-teal-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Retry queued — awaiting result</span>
                                  : cfg.ocr}
                              </td>
                              <td className="px-4 py-2.5">
                                {cfg.retryable && !wasRetried && (
                                  <button
                                    onClick={() => handleRetry(p.page)}
                                    disabled={isRetrying}
                                    className={cn(
                                      "flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-1 rounded border transition-colors",
                                      isRetrying
                                        ? "border-border text-muted-foreground cursor-not-allowed"
                                        : p.status === 'image-only'
                                          ? "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                                          : "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    )}
                                  >
                                    {isRetrying
                                      ? <><RotateCcw className="w-3 h-3 animate-spin" />Queuing…</>
                                      : <><RotateCcw className="w-3 h-3" />{cfg.retryLabel}</>}
                                  </button>
                                )}
                                {wasRetried && <span className="text-[10px] font-mono text-teal-700">Queued ✓</span>}
                                {!cfg.retryable && <span className="text-[10px] font-mono text-muted-foreground/50">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Retry actions queue the page for re-processing in the next local pipeline run. No data is sent to any server. OCR is applied browser-locally.
                  </div>
                </div>

                {/* Coverage metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Extraction Coverage', value: `${selectedDoc.coveragePercentage}%`,              color: selectedDoc.coveragePercentage >= 90 ? 'text-teal-700' : 'text-amber-700' },
                    { label: 'Canonical Segments',  value: selectedDoc.canonicalSegments?.toString() || '—', color: 'text-foreground' },
                    { label: 'Masking Status',      value: selectedDoc.maskingStatus,                        color: selectedDoc.maskingStatus === 'masked' ? 'text-teal-700' : selectedDoc.maskingStatus === 'pending' ? 'text-amber-700' : 'text-red-700' },
                    { label: 'Language',            value: selectedDoc.language,                              color: 'text-foreground' },
                    { label: 'Document Type',       value: selectedDoc.type,                                  color: 'text-foreground' },
                    { label: 'Total Pages',         value: `${selectedDoc.pageCount}`,                       color: 'text-foreground' },
                  ].map(m => (
                    <div key={m.label} className="bg-card border border-border rounded-sm p-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">{m.label}</div>
                      <div className={cn("text-sm font-semibold font-mono capitalize", m.color)}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Existing: Masking Status tab (preserved exactly) ── */}
          {activeDetailTab === 'masking' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl space-y-5">
                <div className={cn(
                  "p-4 rounded-md border flex items-start gap-3",
                  selectedDoc.maskingStatus === 'masked'  ? "bg-teal-50 border-teal-200"
                  : selectedDoc.maskingStatus === 'pending' ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
                )}>
                  {selectedDoc.maskingStatus === 'masked'
                    ? <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    : <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                  <div>
                    <div className={cn("font-semibold text-sm mb-1 capitalize",
                      selectedDoc.maskingStatus === 'masked' ? "text-teal-800" : "text-amber-800"
                    )}>
                      Masking: {selectedDoc.maskingStatus}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoc.maskingStatus === 'masked'
                        ? 'All identifiers have been deterministically masked. Use the Intentional Reveal button to view unmasked content — this action is logged to the audit trail.'
                        : 'Masking approval is pending. This document cannot be included in an export until masking is reviewed and approved.'}
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-md p-4 space-y-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Masking Rules</div>
                  {[
                    ['Names',           'All personal names replaced with [REDACTED_NAME_N]',       'masked'],
                    ['Dates',           'All dates replaced with [REDACTED_DATE_N]',                 'masked'],
                    ['Locations',       'All specific addresses replaced with [REDACTED_LOC_N]',     'masked'],
                    ['Organisations',   'All named organisations replaced with [REDACTED_ORG_N]',    selectedDoc.maskingStatus],
                    ['Phone numbers',   'All contact numbers replaced with [REDACTED_PHONE_N]',      'masked'],
                    ['Account numbers', 'All financial identifiers replaced with [REDACTED_FIN_N]',  'masked'],
                  ].map(([type, rule, status]) => (
                    <div key={type} className="flex items-start gap-3 text-sm">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                        status === 'masked' ? 'bg-teal-500' : status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                      )} />
                      <div>
                        <span className="font-medium text-foreground">{type}</span>
                        <span className="text-muted-foreground ml-2">— {rule}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground border border-dashed border-border rounded p-3 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Masking is deterministic: the same identifier always produces the same token within a case run, preserving cross-document co-reference without storing the original value in memory after processing.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reveal dialog (preserved exactly) ── */}
      <Dialog open={revealModalOpen} onOpenChange={setRevealModalOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-amber-700 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />Intentional Reveal Warning
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2 text-sm">
              You are about to view unmasked identifiers in <span className="font-mono text-foreground">{selectedDoc.fileName}</span>. This will be permanently logged to the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Reason for reveal (required)</label>
            <textarea
              value={revealReason}
              onChange={e => setRevealReason(e.target.value)}
              placeholder="E.g., Verification of stamp clarity…"
              className="w-full bg-muted border border-border rounded-sm p-3 text-sm focus:outline-none focus:border-primary/50 min-h-[80px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevealModalOpen(false)} className="border-border text-foreground">Cancel</Button>
            <Button disabled={revealReason.length < 5} onClick={handleReveal} className="bg-amber-600 hover:bg-amber-700 text-white">
              Confirm &amp; Reveal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
