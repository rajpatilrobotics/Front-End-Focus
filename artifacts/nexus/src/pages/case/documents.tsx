import React, { useState } from 'react';
import { MOCK_DOCUMENTS } from '@/data/mock-case';
import { FileText, ShieldAlert, Upload, Lock, Unlock, CheckCircle2, AlertTriangle, Clock, Cpu, Eye, FileX, ImageIcon, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

const PROCESSING_STAGES = [
  { id: 1, name: 'Intake Validation', icon: CheckCircle2, desc: 'Verifying document integrity and file format' },
  { id: 2, name: 'Text Extraction', icon: FileText, desc: 'Extracting text content via PDF.js (browser-local)' },
  { id: 3, name: 'Coverage Calculation', icon: Eye, desc: 'Computing page availability and extraction rate' },
  { id: 4, name: 'Identifier Masking', icon: Lock, desc: 'Applying deterministic masks to sensitive identifiers' },
  { id: 5, name: 'Candidate Extraction', icon: Cpu, desc: 'Identifying canonical source segments' },
  { id: 6, name: 'Citation Validation', icon: CheckCircle2, desc: 'Verifying all citation–segment bindings' },
  { id: 7, name: 'Timeline & Nexus Assembly', icon: FileText, desc: 'Assembling chronology and relationship graph' },
  { id: 8, name: 'Safety & Export-Gate Checks', icon: ShieldAlert, desc: 'Running leak scan and pre-export validation' },
];

type ProcessingState = 'idle' | 'running' | 'complete';
type PageStatus = 'processed' | 'missing' | 'unreadable' | 'image-only' | 'excluded' | 'extraction-failed' | 'segment-mismatch';

const PAGE_STATUS_CONFIG: Record<PageStatus, { label: string; color: string; dot: string }> = {
  'processed': { label: 'Processed', color: 'text-teal-700 bg-teal-50 border-teal-200', dot: 'bg-teal-500' },
  'missing': { label: 'Missing', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' },
  'unreadable': { label: 'Unreadable', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  'image-only': { label: 'Image Only', color: 'text-blue-700 bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
  'excluded': { label: 'Excluded', color: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
  'extraction-failed': { label: 'Extraction Failed', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-600' },
  'segment-mismatch': { label: 'Segment Mismatch', color: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
};

export default function CaseDocuments() {
  const [selectedDoc, setSelectedDoc] = useState(MOCK_DOCUMENTS[0]);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealReason, setRevealReason] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [currentStage, setCurrentStage] = useState<number | null>(null);

  const totalPages = MOCK_DOCUMENTS.reduce((s, d) => s + d.pageCount, 0);
  const availablePages = totalPages - 1;
  const totalSegments = MOCK_DOCUMENTS.reduce((s, d) => s + (d.canonicalSegments || 0), 0);

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

  const handleReveal = () => {
    setIsRevealed(true);
    setRevealModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Coverage summary bar */}
      <div className="border-b border-border bg-card/60 px-5 py-3 shrink-0 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-muted-foreground">DOCUMENTS <strong className="text-foreground">{MOCK_DOCUMENTS.length}</strong></span>
          <span className="text-muted-foreground">PAGES EXPECTED <strong className="text-foreground">{totalPages}</strong></span>
          <span className="text-muted-foreground">AVAILABLE <strong className="text-teal-700">{availablePages}</strong></span>
          <span className="text-muted-foreground">MISSING <strong className="text-red-600">1</strong></span>
          <span className="text-muted-foreground">SEGMENTS <strong className="text-foreground">{totalSegments}</strong></span>
        </div>
        {processingState === 'idle' && (
          <Button size="sm" onClick={handleProcess} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm h-7 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5 mr-1.5" />
            Process Bundled PDFs Locally
          </Button>
        )}
        {processingState === 'complete' && (
          <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Processing complete
          </div>
        )}
      </div>

      {/* Processing pipeline */}
      <AnimatePresence>
        {processingState !== 'idle' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border bg-muted/20 shrink-0 overflow-hidden"
          >
            <div className="px-5 py-4">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Processing Pipeline — Browser Local · No Provider Transmission</div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {PROCESSING_STAGES.map(stage => {
                  const isDone = completedStages.includes(stage.id);
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
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isRunning ? (
                          <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                        ) : (
                          <span className="text-[9px] font-bold text-muted-foreground">{stage.id}</span>
                        )}
                      </div>
                      <span className={cn("text-[9px] font-mono uppercase leading-tight", isDone ? "text-teal-700" : isRunning ? "text-primary" : "text-muted-foreground")}>
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
        {/* Document list */}
        <div className="w-full md:w-[380px] flex-shrink-0 border-r border-border bg-muted/20 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-card/60">
            <h2 className="font-semibold text-foreground text-sm">Documents</h2>
            <Button variant="outline" size="sm" className="h-7 bg-card border-border text-foreground hover:bg-muted text-xs">
              <Upload className="w-3 h-3 mr-1.5" />Upload
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {MOCK_DOCUMENTS.map(doc => (
              <div
                key={doc.id}
                onClick={() => { setSelectedDoc(doc); setIsRevealed(false); }}
                className={cn(
                  "p-3 rounded-sm border cursor-pointer transition-all",
                  selectedDoc.id === doc.id
                    ? "bg-primary/5 border-primary/25 shadow-sm"
                    : "bg-card border-border hover:border-foreground/15 hover:bg-muted/30"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">{doc.fileName}</span>
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted border border-border shrink-0">{doc.type}</span>
                </div>

                {/* Page status indicators */}
                {doc.pages.length > 0 && (
                  <div className="flex items-center gap-0.5 mb-2">
                    {doc.pages.map(p => (
                      <div
                        key={p.page}
                        title={`Page ${p.page}: ${p.status}`}
                        className={cn("w-3.5 h-1.5 rounded-sm", PAGE_STATUS_CONFIG[p.status as PageStatus]?.dot || 'bg-border')}
                      />
                    ))}
                    {doc.pageCount > doc.pages.length && (
                      <span className="text-[9px] text-muted-foreground ml-1">+{doc.pageCount - doc.pages.length} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                  <span className={cn("w-1.5 h-1.5 rounded-full inline-block mr-0.5",
                    doc.extractionStatus === 'complete' ? 'bg-teal-500' :
                    doc.extractionStatus === 'partial' ? 'bg-amber-500' : 'bg-red-500'
                  )} />
                  {doc.coveragePercentage}% extracted
                  <span>{doc.pageCount}pp</span>
                  <span className="text-muted-foreground/60">{doc.language}</span>
                  {doc.maskingStatus === 'masked' ? (
                    <span className="text-teal-600 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />masked</span>
                  ) : doc.maskingStatus === 'pending' ? (
                    <span className="text-amber-600 flex items-center gap-0.5"><ShieldAlert className="w-2.5 h-2.5" />pending</span>
                  ) : null}
                </div>

                {doc.extractionStatus !== 'complete' && (
                  <div className="mt-2 text-[9px] font-mono text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    ⚠ Some pages missing or unreadable — not treated as success
                  </div>
                )}

                {doc.pages.some(p => p.status === 'image-only' || p.status === 'extraction-failed') && (
                  <div className="mt-1 text-[9px] font-mono text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200">
                    ✗ {doc.pages.filter(p => p.status === 'image-only').length > 0 ? 'Image-only page detected' : 'Extraction failed on 1+ pages'}
                  </div>
                )}
              </div>
            ))}

            {/* Page state legend */}
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

        {/* Document viewer */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/10 relative">
          <div className="h-11 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-medium text-foreground text-sm truncate">{selectedDoc.fileName}</span>
              <span className="text-xs text-muted-foreground font-mono border-l border-border pl-3 shrink-0">ID: {selectedDoc.id}</span>
              {selectedDoc.canonicalSegments !== undefined && (
                <span className="text-xs font-mono text-muted-foreground shrink-0">{selectedDoc.canonicalSegments} segments</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
                    [IMAGE-ONLY PAGE — TEXT EXTRACTION NOT POSSIBLE]
                  </div>
                )}

                <p>
                  Authorized Signature:{' '}
                  {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_NAME_2]</span> : <span className="bg-yellow-200 px-1 font-bold">Michael Smith</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reveal dialog */}
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
