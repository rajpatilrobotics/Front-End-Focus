import React, { useState } from 'react';
import { MOCK_URGENT_NEEDS, UrgentNeed, UrgentNeedStatus, UrgentNeedUrgency } from '@/data/mock-case';
import { AlertTriangle, Phone, ShieldAlert, Plus, CheckCircle2, Clock, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';

const URGENCY_CONFIG: Record<UrgentNeedUrgency, { label: string; color: string; dot: string }> = {
  'immediate':    { label: 'Immediate',      color: 'bg-red-100 text-red-800 border-red-300',    dot: 'bg-red-500' },
  'within-24h':   { label: 'Within 24 hours', color: 'bg-orange-50 text-orange-800 border-orange-300', dot: 'bg-orange-500' },
  'within-72h':   { label: 'Within 72 hours', color: 'bg-amber-50 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
  'ongoing':      { label: 'Ongoing',        color: 'bg-blue-50 text-blue-700 border-blue-200',  dot: 'bg-blue-400' },
};

const STATUS_CONFIG: Record<UrgentNeedStatus, { label: string; color: string }> = {
  'newly-recorded':    { label: 'Newly Recorded',    color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'confirming':        { label: 'Confirming',        color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'action-required':   { label: 'Action Required',   color: 'bg-red-50 text-red-700 border-red-200' },
  'referral-offered':  { label: 'Referral Offered',  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'referral-accepted': { label: 'Referral Accepted', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  'referral-declined': { label: 'Referral Declined', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'in-progress':       { label: 'In Progress',       color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'completed':         { label: 'Completed',         color: 'bg-teal-50 text-teal-700 border-teal-200' },
  'unable-to-complete':{ label: 'Unable to Complete', color: 'bg-slate-50 text-slate-600 border-slate-200' },
};

const SOURCE_LABELS: Record<string, string> = {
  'practitioner-observation': 'Practitioner observation',
  'person-reported': 'Person-reported',
  'document-supported': 'Document-supported',
  'unknown': 'Unknown',
};

export default function CaseSafety() {
  const [needs, setNeeds] = useState<UrgentNeed[]>(MOCK_URGENT_NEEDS);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_URGENT_NEEDS[0]?.id ?? null);

  const selected = needs.find(n => n.id === selectedId);

  const immediateCount = needs.filter(n => n.urgency === 'immediate').length;
  const actionCount = needs.filter(n => n.status === 'action-required').length;

  const setStatus = (id: string, status: UrgentNeedStatus) => {
    setNeeds(prev => prev.map(n => n.id === id ? { ...n, status } : n));
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Emergency notice */}
      <div className="bg-red-700 text-white px-5 py-2.5 flex items-center gap-3 shrink-0">
        <Phone className="w-4 h-4 shrink-0" />
        <p className="text-sm font-medium">
          If there is immediate danger to life, contact your local emergency services immediately. This tool does not contact emergency services on your behalf.
        </p>
      </div>

      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Urgent Needs &amp; Safety Plan</h2>
          <span className="text-[10px] font-mono text-muted-foreground">Practitioner-recorded · Not an AI risk score</span>
          {immediateCount > 0 && (
            <span className="text-[10px] font-mono bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-sm">
              {immediateCount} IMMEDIATE
            </span>
          )}
          {actionCount > 0 && (
            <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-sm">
              {actionCount} ACTION REQUIRED
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5">
          <Plus className="w-3 h-3" /> Record Need
        </Button>
      </div>

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left — need list */}
        <Panel defaultSize={38} minSize={26} className="flex flex-col border-r border-border bg-muted/10 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {needs.map(need => {
              const urgency = URGENCY_CONFIG[need.urgency];
              const status = STATUS_CONFIG[need.status];
              return (
                <motion.div
                  layout key={need.id}
                  onClick={() => setSelectedId(need.id)}
                  className={cn(
                    "p-3.5 rounded-sm border cursor-pointer transition-all",
                    selectedId === need.id
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15 hover:bg-muted/20",
                    need.urgency === 'immediate' && selectedId !== need.id && "border-red-200 bg-red-50/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={cn("text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border flex items-center gap-1", urgency.color)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", urgency.dot)} />
                      {urgency.label}
                    </span>
                    <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border shrink-0", status.color)}>
                      {status.label}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{need.category}</div>
                  <p className="text-sm text-foreground font-medium leading-tight line-clamp-2">{need.description}</p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{need.assignedPractitioner}</span>
                    {need.followUpTime && (
                      <>
                        <span className="text-border">·</span>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(need.followUpTime).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Panel>

        <PanelResizeHandle className="w-0.5 bg-border hover:bg-primary/30 transition-colors cursor-col-resize" />

        {/* Right — detail */}
        <Panel minSize={35} className="flex flex-col bg-card overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.16 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 pb-28 space-y-6">
                  {/* Category + urgency */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={cn("text-[10px] uppercase font-mono px-2 py-1 rounded-sm border flex items-center gap-1.5", URGENCY_CONFIG[selected.urgency].color)}>
                        <div className={cn("w-2 h-2 rounded-full", URGENCY_CONFIG[selected.urgency].dot)} />
                        {URGENCY_CONFIG[selected.urgency].label}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-sm">
                        Source: {SOURCE_LABELS[selected.source]}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs ml-auto">{selected.id}</span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{selected.category}</div>
                    <p className="text-lg font-semibold text-foreground leading-snug">{selected.description}</p>
                  </div>

                  {/* Action required */}
                  <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Action Required
                    </div>
                    <p className="text-sm text-amber-900">{selected.actionRequired}</p>
                  </div>

                  {/* Safe contact & consent */}
                  <div className="grid grid-cols-2 gap-3">
                    {selected.safeContactMethod && (
                      <div className="bg-muted border border-border rounded-sm p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Safe Contact Method</div>
                        <p className="text-sm text-foreground">{selected.safeContactMethod}</p>
                      </div>
                    )}
                    {selected.consentRestrictions && (
                      <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                        <div className="text-[10px] font-mono text-red-700 uppercase mb-1.5">Consent / Contact Restrictions</div>
                        <p className="text-sm text-red-800">{selected.consentRestrictions}</p>
                      </div>
                    )}
                  </div>

                  {/* Assignment & follow-up */}
                  <div className="bg-muted border border-border rounded-sm p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Assigned Practitioner</div>
                        <div className="text-foreground font-medium">{selected.assignedPractitioner}</div>
                      </div>
                      {selected.followUpTime && (
                        <div>
                          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Follow-Up Time</div>
                          <div className="text-foreground font-medium font-mono">{new Date(selected.followUpTime).toLocaleString()}</div>
                        </div>
                      )}
                      {selected.referral && (
                        <div className="col-span-2">
                          <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Referral</div>
                          <div className="text-foreground">{selected.referral}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Practitioner notes */}
                  {selected.notes && (
                    <div className="bg-muted border border-border rounded-sm p-4">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Notes
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{selected.notes}</p>
                    </div>
                  )}

                  {/* Safety separation notice */}
                  <div className="border border-dashed border-border rounded-sm p-3 text-xs text-muted-foreground flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/60" />
                    Safety plan details are kept separate from legal findings. Sensitive information here will not appear in safe-share exports unless explicitly selected and permitted by the practitioner.
                  </div>

                  {/* Referral workflow */}
                  <div>
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Referral Workflow</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {[
                        'Practitioner reviews available organisation',
                        'Practitioner checks consent and safe-contact requirements',
                        'Practitioner records whether information was offered',
                        'Practitioner records accepted / declined / follow-up required',
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">{i + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                      <div className="mt-3 pt-3 border-t border-dashed border-border text-[11px] text-muted-foreground/70">
                        No data is transmitted to any organisation unless an explicitly implemented and separately confirmed integration exists.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                <div className="absolute bottom-0 left-[38%] right-0 p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">STATUS:</span>
                      <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm border", STATUS_CONFIG[selected.status].color)}>
                        {STATUS_CONFIG[selected.status].label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="text-xs border border-border rounded-sm px-2 py-1.5 bg-card text-foreground"
                        value={selected.status}
                        onChange={e => setStatus(selected.id, e.target.value as UrgentNeedStatus)}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-sm h-8">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Mark Completed
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a need to review
              </div>
            )}
          </AnimatePresence>
        </Panel>
      </PanelGroup>
    </div>
  );
}
