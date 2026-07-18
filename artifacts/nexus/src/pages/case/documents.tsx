import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { MOCK_DOCUMENTS } from '@/data/mock-case';
import { FileText, ShieldAlert, Upload, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CaseDocuments() {
  const [selectedDoc, setSelectedDoc] = useState(MOCK_DOCUMENTS[0]);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealReason, setRevealReason] = useState("");

  const handleReveal = () => {
    setIsRevealed(true);
    setRevealModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Document List */}
      <div className="w-full md:w-[400px] flex-shrink-0 border-r border-border bg-muted/30 flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
          <h2 className="font-semibold text-foreground">Documents</h2>
          <Button variant="outline" size="sm" className="h-8 bg-card border-border text-foreground hover:bg-muted">
            <Upload className="w-3.5 h-3.5 mr-2" />
            Upload
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {MOCK_DOCUMENTS.map(doc => (
            <div 
              key={doc.id}
              onClick={() => { setSelectedDoc(doc); setIsRevealed(false); }}
              className={cn(
                "p-3 rounded-sm border cursor-pointer transition-all",
                selectedDoc.id === doc.id 
                  ? "bg-primary/5 border-primary/30 shadow-sm" 
                  : "bg-card border-border hover:border-foreground/20 hover:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{doc.fileName}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted border border-border flex-shrink-0">
                  {doc.type}
                </span>
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    doc.extractionStatus === 'complete' ? "bg-teal-500" :
                    doc.extractionStatus === 'partial' ? "bg-amber-500" : "bg-red-500"
                  )} />
                  {doc.coveragePercentage}% Extracted
                </div>
                <div>{doc.pageCount} Pages</div>
                {doc.maskingStatus === 'masked' ? (
                  <div className="flex items-center gap-1 text-teal-600"><Lock className="w-3 h-3" /> Masked</div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-600"><ShieldAlert className="w-3 h-3" /> Pending</div>
                )}
              </div>
              
              {doc.extractionStatus !== 'complete' && (
                <div className="mt-2 text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Some pages missing or unreadable
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/10 relative">
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground text-sm">{selectedDoc.fileName}</span>
            <span className="text-xs text-muted-foreground font-mono border-l border-border pl-3">ID: {selectedDoc.id}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isRevealed ? (
              <Button 
                onClick={() => setRevealModalOpen(true)}
                size="sm" 
                variant="outline"
                className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-mono uppercase tracking-wider"
              >
                <Unlock className="w-3 h-3 mr-1.5" />
                Intentional Reveal
              </Button>
            ) : (
              <Button 
                onClick={() => setIsRevealed(false)}
                size="sm" 
                variant="outline"
                className="h-7 text-xs border-teal-300 text-teal-700 hover:bg-teal-50 hover:text-teal-800 font-mono uppercase tracking-wider"
              >
                <Lock className="w-3 h-3 mr-1.5" />
                Restore Masking
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className={cn(
            "max-w-3xl w-full bg-white text-black p-12 min-h-[800px] shadow-lg border border-border/50 transition-all duration-300",
            !isRevealed ? "font-mono text-sm leading-relaxed" : "font-sans text-base"
          )}>
            <div>
              <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest border-b-2 border-black pb-4">
                {selectedDoc.fileName.replace('.pdf', '')}
              </h1>
              
              <div className="space-y-6">
                <p>
                  This document confirms the employment of {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_NAME_1]</span> : <span className="bg-yellow-200 px-1 font-bold">John Doe</span>} effective {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_DATE_1]</span> : <span className="bg-yellow-200 px-1 font-bold">October 1, 2023</span>}.
                </p>
                <p>
                  The employee is expected to report to the facility located at {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_LOC_1]</span> : <span className="bg-yellow-200 px-1 font-bold">123 Industrial Parkway</span>}.
                </p>
                <p>
                  A deduction of $400/month for initial placement fee will be applied to the first 6 months of wages. The original passport will be held for "safekeeping" by {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_ORG_1]</span> : <span className="bg-yellow-200 px-1 font-bold">Global Staffing Solutions LLC</span>}.
                </p>
                
                {selectedDoc.extractionStatus !== 'complete' && (
                  <div className="my-12 p-4 border-2 border-dashed border-red-400 bg-red-50 text-red-700 flex items-center justify-center font-mono text-xs">
                    [PAGES 2-3 UNREADABLE / WATER DAMAGE DETECTED / EXTRACTION FAILED]
                  </div>
                )}
                
                <p>
                  Authorized Signature: {!isRevealed ? <span className="bg-black text-white px-1 font-bold">[REDACTED_NAME_2]</span> : <span className="bg-yellow-200 px-1 font-bold">Michael Smith</span>}
                </p>
              </div>
            </div>
            
            {!isRevealed && (
              <div className="fixed bottom-8 right-12 flex items-center gap-2 bg-foreground text-background px-3 py-1.5 rounded-sm text-xs font-mono shadow-xl border border-border/50 opacity-90">
                <Lock className="w-3 h-3" />
                MASKING ACTIVE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reveal Modal */}
      <Dialog open={revealModalOpen} onOpenChange={setRevealModalOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-amber-700 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Intentional Reveal Warning
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-3">
              You are about to view unmasked sensitive identifiers in <span className="font-mono text-foreground">{selectedDoc.fileName}</span>. 
              This action will be permanently recorded in the case audit trail.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Reason for reveal (required)
              </label>
              <textarea
                id="reason"
                value={revealReason}
                onChange={(e) => setRevealReason(e.target.value)}
                placeholder="E.g., Verification of stamp clarity..."
                className="w-full bg-muted border border-border rounded-sm p-3 text-sm focus:outline-none focus:border-primary/50 min-h-[100px] text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevealModalOpen(false)} className="border-border text-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button 
              disabled={revealReason.length < 5}
              onClick={handleReveal}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              Confirm & Reveal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
