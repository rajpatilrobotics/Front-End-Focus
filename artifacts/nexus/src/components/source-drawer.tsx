import React, { useEffect } from 'react';
import { Citation } from '@/data/mock-case';
import { X, FileText, Lock, Unlock, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SourceDrawerProps {
  open: boolean;
  citation: Citation | null;
  onClose: () => void;
  onReveal?: () => void;
}

const QualityBadge = ({ quality }: { quality?: string }) => {
  const cfg = {
    high: 'bg-teal-50 text-teal-700 border-teal-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-red-50 text-red-700 border-red-200',
  };
  if (!quality) return null;
  return (
    <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded border", cfg[quality as keyof typeof cfg] || cfg.medium)}>
      {quality} quality
    </span>
  );
};

const ValidationBadge = ({ status }: { status?: string }) => {
  if (!status) return null;
  const cfg = {
    verified: { color: 'bg-teal-50 text-teal-700 border-teal-200', icon: CheckCircle2 },
    unverified: { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: HelpCircle },
    disputed: { color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle },
  };
  const entry = cfg[status as keyof typeof cfg] || cfg.unverified;
  const Icon = entry.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded border", entry.color)}>
      <Icon className="w-2.5 h-2.5" />{status}
    </span>
  );
};

export function SourceDrawer({ open, citation, onClose, onReveal }: SourceDrawerProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && citation && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground text-sm">Exact Source</span>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                aria-label="Close source drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Masked quote */}
              <div className="bg-muted/40 border border-border rounded-md p-4 border-l-4 border-l-primary">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Exact Masked Quote</div>
                <p className="font-mono text-sm text-foreground leading-relaxed">
                  "{citation.text}"
                </p>
              </div>

              {/* Location metadata */}
              <div className="bg-card border border-border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Source Location</span>
                </div>
                <div className="divide-y divide-border">
                  {[
                    ['Document', citation.documentId],
                    ['Page', String(citation.page)],
                    ['Segment', citation.segment || '—'],
                    ['Source Authority', citation.sourceAuthority || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground font-mono text-xs uppercase">{k}</span>
                      <span className="text-foreground font-mono text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality metadata */}
              <div className="bg-card border border-border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b border-border">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Extraction &amp; Validation</span>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs font-mono uppercase">Language</span>
                    <span className="text-foreground text-xs font-mono">{citation.language || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs font-mono uppercase">Translation</span>
                    <span className={cn(
                      "text-[10px] font-mono uppercase px-2 py-0.5 rounded border",
                      citation.translationStatus === 'original' ? 'bg-muted text-foreground border-border' :
                      citation.translationStatus === 'translated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    )}>{citation.translationStatus || 'unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs font-mono uppercase">Extraction Quality</span>
                    <QualityBadge quality={citation.extractionQuality} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs font-mono uppercase">Citation Status</span>
                    <ValidationBadge status={citation.validationStatus} />
                  </div>
                </div>
              </div>

              {/* Source limitations */}
              {citation.limitations && (
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-700 mb-1 text-xs uppercase font-mono tracking-wider">Source Limitation</div>
                    {citation.limitations}
                  </div>
                </div>
              )}

              {/* Reveal original */}
              <div className="pt-2 border-t border-border">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3">Original Synthetic Text</div>
                <button
                  onClick={onReveal}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md text-sm font-medium transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Reveal Original (Audited Action)
                </button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">Opens masked reveal flow — logged to case audit trail.</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
