import React, { useState } from 'react';
import { InterviewQuestion, InterviewQuestionStatus } from '@/data/mock-case';
import { useCaseContext } from '@/context/CaseContext';
import { MessageSquare, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Clock, Plus, Info, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG: Record<InterviewQuestionStatus, { label: string; color: string }> = {
  'pending-review': { label: 'Pending Review', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'kept':           { label: 'Kept',           color: 'bg-teal-50 text-teal-700 border-teal-200' },
  'edited':         { label: 'Edited',          color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'removed':        { label: 'Removed',         color: 'bg-slate-50 text-slate-500 border-slate-200' },
  'deferred':       { label: 'Deferred',        color: 'bg-slate-50 text-slate-600 border-slate-300' },
  'inappropriate':  { label: 'Inappropriate',   color: 'bg-red-50 text-red-700 border-red-200' },
};

const NON_NEGOTIABLE = [
  'Do not suggest accusatory or coercive questions.',
  'Avoid assuming allegations are true.',
  'Prefer open prompts: "What happened next?" or "What do you remember about…?"',
  'Do not repeatedly request traumatic details without a stated case-preparation reason.',
  'Questions are planning aids, not mandatory scripts.',
  'Every question must be approved by the practitioner before use.',
  'Never interpret refusal, uncertainty, or inconsistent memory as dishonesty.',
];

export default function CaseInterview() {
  const { state, dispatch } = useCaseContext();
  const questions = state.interviewQuestions;
  const [selectedId, setSelectedId] = useState<string | null>(questions[0]?.id ?? null);
  const [showPlanning, setShowPlanning] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [planningNotes, setPlanningNotes] = useState({ purpose: '', topicsToAvoid: '', interpreter: '', accessibility: '', interviewer: '' });

  const selected = questions.find(q => q.id === selectedId);
  const keptCount = questions.filter(q => q.reviewStatus === 'kept' || q.reviewStatus === 'edited').length;
  const pendingCount = questions.filter(q => q.reviewStatus === 'pending-review').length;

  const setStatus = (id: string, status: InterviewQuestionStatus) => {
    dispatch({ type: 'UPDATE_INTERVIEW_QUESTION', id, reviewStatus: status });
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Trauma-Informed Interview Planner</h2>
          {pendingCount > 0 && (
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-sm">
              {pendingCount} PENDING REVIEW
            </span>
          )}
          {keptCount > 0 && (
            <span className="text-[10px] font-mono bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-sm">
              {keptCount} APPROVED FOR USE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className={cn("h-7 text-xs rounded-sm border-border gap-1.5", showPlanning && "bg-primary/5 border-primary/30 text-primary")}
            onClick={() => setShowPlanning(v => !v)}
          >
            <Edit2 className="w-3 h-3" /> Planning Controls
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5">
            <Plus className="w-3 h-3" /> Add Question
          </Button>
        </div>
      </div>

      {/* Non-negotiable rules banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 shrink-0">
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-1">Non-Negotiable Rules — Practitioner Must Review Every Question</div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {NON_NEGOTIABLE.slice(0, 3).map((r, i) => (
                <span key={i} className="text-[10px] text-amber-800">· {r}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Planning controls panel */}
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
                <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Topics to Avoid</label>
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
                  "flex items-start gap-2 p-3 rounded-sm border cursor-pointer transition-all",
                  consentConfirmed ? "bg-teal-50 border-teal-200" : "border-border bg-card"
                )}>
                  <div className={cn("w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center", consentConfirmed ? "border-teal-600 bg-teal-600" : "border-border")}>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left — question list */}
        <div className="w-96 flex flex-col border-r border-border bg-muted/10 overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {questions.map(q => {
              const status = STATUS_CONFIG[q.reviewStatus];
              const isRemoved = q.reviewStatus === 'removed';
              return (
                <motion.div
                  layout key={q.id}
                  onClick={() => !isRemoved && setSelectedId(q.id)}
                  className={cn(
                    "p-3.5 rounded-sm border transition-all",
                    isRemoved ? "opacity-40 cursor-default" : "cursor-pointer",
                    selectedId === q.id && !isRemoved
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15 hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border", status.color)}>
                      {status.label}
                    </span>
                    {q.addressesGapId && (
                      <span className="text-[9px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">{q.addressesGapId}</span>
                    )}
                  </div>
                  <p className={cn("text-sm leading-relaxed", isRemoved ? "line-through text-muted-foreground" : "text-foreground")}>
                    {q.questionText}
                  </p>
                  {!isRemoved && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{q.reason}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — question detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 pb-28 space-y-6 max-w-2xl">
                  {/* Question */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border", STATUS_CONFIG[selected.reviewStatus].color)}>
                        {STATUS_CONFIG[selected.reviewStatus].label}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs ml-auto">{selected.id}</span>
                    </div>
                    <div className="bg-muted border-l-4 border-primary/40 rounded-sm p-5">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Suggested Question</div>
                      <p className="text-lg font-medium text-foreground leading-relaxed">"{selected.questionText}"</p>
                    </div>
                  </div>

                  {/* Why useful */}
                  <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
                    <div className="text-[10px] font-mono text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Why This May Be Useful
                    </div>
                    <p className="text-sm text-blue-900 leading-relaxed">{selected.reason}</p>
                  </div>

                  {/* Sensitivity */}
                  <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                    <div className="text-[10px] font-mono text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Sensitivity Note
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">{selected.sensitivityNote}</p>
                  </div>

                  {/* Links */}
                  <div className="grid grid-cols-2 gap-3">
                    {selected.addressesGapId && (
                      <div className="bg-muted border border-border rounded-sm p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Addresses Evidence Gap</div>
                        <span className="text-sm font-mono text-foreground">{selected.addressesGapId}</span>
                      </div>
                    )}
                    {selected.relatedFindingId && (
                      <div className="bg-muted border border-border rounded-sm p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Related Finding</div>
                        <span className="text-sm font-mono text-foreground">{selected.relatedFindingId}</span>
                      </div>
                    )}
                  </div>

                  {/* Non-negotiable reminder */}
                  <div className="border border-dashed border-border rounded-sm p-4 space-y-1.5">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Non-Negotiable Rules (reminder)</div>
                    {NON_NEGOTIABLE.map((r, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-border shrink-0">·</span>{r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action bar */}
                <div className="absolute bottom-0 right-0 left-96 p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-10">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm border", STATUS_CONFIG[selected.reviewStatus].color)}>
                      {STATUS_CONFIG[selected.reviewStatus].label}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs border-border h-8" onClick={() => setStatus(selected.id, 'removed')}>
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />Remove
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs border-border h-8" onClick={() => setStatus(selected.id, 'deferred')}>
                        <Clock className="w-3.5 h-3.5 mr-1.5" />Defer
                      </Button>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8" onClick={() => setStatus(selected.id, 'kept')}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Approve for Use
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a question to review
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
