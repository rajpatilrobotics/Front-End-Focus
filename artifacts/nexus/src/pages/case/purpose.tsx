import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useRoute } from 'wouter';
import { ShieldAlert, CheckCircle2, AlertTriangle, Database, ArrowRight, Zap, Lock, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared';

const ACKNOWLEDGEMENTS = [
  { id: 'ack-1', text: 'The material in this workspace is the bundled synthetic fixture only. I will not input real or private case data.' },
  { id: 'ack-2', text: 'The system cannot verify my authority or credentials. I confirm I am a qualified practitioner.' },
  { id: 'ack-3', text: 'All consequential decisions remain outside system support and are my sole responsibility.' },
  { id: 'ack-4', text: 'Cooperation with law enforcement or reporting is not required or implied by using this system.' },
  { id: 'ack-5', text: 'The local replay is frozen synthetic output — not live AI. No provider transmission occurs.' },
  { id: 'ack-6', text: 'I understand that this system does not determine trafficking status, credibility, guilt, or legal eligibility.' },
];

export default function CasePurpose() {
  const [, params] = useRoute('/case/:id/*?');
  const [, setLocation] = useLocation();
  const id = params?.id || 'c-001';

  const [form, setForm] = useState({
    role: '',
    orgType: '',
    purpose: '',
    recipient: '',
    recipientCategory: '',
    jurisdiction: '',
    sourceLanguage: '',
    translationStatus: '',
    handoffType: 'full',
  });
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const ackCount = Object.values(acks).filter(Boolean).length;
  const allAcked = ackCount === ACKNOWLEDGEMENTS.length;
  const formValid = form.role && form.orgType && form.purpose && allAcked;

  const handleSave = () => {
    if (!formValid) return;
    setSaved(true);
    setTimeout(() => setLocation(`/case/${id}`), 600);
  };

  const handleCheckpoint = () => {
    setLocation(`/case/${id}`);
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <PageHeader
        title="Purpose Brief"
        description="Record why this case is being reviewed before analysis can begin."
        icon={Lock}
        action={
          <button
            onClick={handleCheckpoint}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors px-4 py-2 rounded-md text-sm font-semibold shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Load Prepared Checkpoint
            <span className="text-[10px] font-mono bg-amber-200/50 px-1.5 py-0.5 rounded text-amber-800">FAST DEMO</span>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Synthetic fixture notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Synthetic fixture inputs only.</strong> Do not enter real, private, or identifying information. This form is part of a static design prototype — no data is stored, submitted, or transmitted.
            </p>
          </div>

        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-5 gap-10">

          {/* Form — left 3 cols */}
          <div className="xl:col-span-3 space-y-10">
            {/* Practitioner Details */}
            <section className="bg-card p-6 rounded-xl border shadow-sm">
              <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                Practitioner Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Practitioner Role <span className="text-red-500">*</span></label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option value="">Select role…</option>
                    <option>Legal Aid Practitioner</option>
                    <option>Defence Lawyer</option>
                    <option>Public Defender</option>
                    <option>Court Navigation Practitioner</option>
                    <option>NGO Legal Practitioner</option>
                    <option>Authorized Supervisor</option>
                    <option>Demo Evaluator</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organization Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.orgType}
                    onChange={e => setForm(f => ({ ...f, orgType: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option value="">Select type…</option>
                    <option>Legal Aid Organization</option>
                    <option>Public Defender Office</option>
                    <option>Law Firm (Pro Bono)</option>
                    <option>NGO / Civil Society</option>
                    <option>Academic / Research</option>
                    <option>Government Legal Office</option>
                    <option>Evaluation / Demo</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Case Context */}
            <section className="bg-card p-6 rounded-xl border shadow-sm">
              <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                Case Context
              </h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Authorized Purpose <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                    placeholder="Describe the authorized purpose for this review (e.g., Preparation of defence brief for upcoming bail hearing)…"
                    rows={3}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground resize-none transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Intended Recipient</label>
                    <input
                      type="text"
                      value={form.recipient}
                      onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
                      placeholder="Name or role…"
                      className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recipient Category</label>
                    <select
                      value={form.recipientCategory}
                      onChange={e => setForm(f => ({ ...f, recipientCategory: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                    >
                      <option value="">Select…</option>
                      <option>Lead Counsel</option>
                      <option>Co-Counsel</option>
                      <option>Support Organization</option>
                      <option>Court (Judicial)</option>
                      <option>Internal Supervision</option>
                      <option>Evaluation Only</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fictional Jurisdiction</label>
                  <input
                    type="text"
                    value={form.jurisdiction}
                    onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))}
                    placeholder="e.g., Synthetic State (demo use only) — domestic legal verification required…"
                    className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground transition-all font-medium"
                  />
                </div>
              </div>
            </section>

            {/* Source & Handoff */}
            <section className="bg-card p-6 rounded-xl border shadow-sm">
              <h2 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
                Source &amp; Handoff
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Language</label>
                  <select
                    value={form.sourceLanguage}
                    onChange={e => setForm(f => ({ ...f, sourceLanguage: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option value="">Select…</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Mixed (En/Es)</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Translation Status</label>
                  <select
                    value={form.translationStatus}
                    onChange={e => setForm(f => ({ ...f, translationStatus: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  >
                    <option value="">Select…</option>
                    <option>All documents in original language</option>
                    <option>Partial professional translation</option>
                    <option>Machine translation (unverified)</option>
                    <option>Unknown</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requested Handoff Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: 'full', label: 'Full Practitioner Handoff', desc: 'Complete reviewed materials including all citations and context.' },
                    { value: 'minimum', label: 'Minimum-Necessary Safe Share', desc: 'Practitioner-selected summary, no raw citations, external recipients.' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, handoffType: opt.value }))}
                      className={cn(
                        "text-left p-4 rounded-xl border-2 transition-all",
                        form.handoffType === opt.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-foreground/20"
                      )}
                    >
                      <div className={cn("text-sm font-bold mb-1.5", form.handoffType === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Acknowledgements — right 2 cols */}
          <div className="xl:col-span-2">
            <div className="sticky top-6 space-y-6">
              <section className="bg-card p-6 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-primary" />
                    Required Acknowledgements
                  </h2>
                  <div className={cn(
                    "text-[10px] font-mono font-bold px-2 py-1 rounded border",
                    allAcked ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-muted text-muted-foreground border-border"
                  )}>
                    {ackCount} / {ACKNOWLEDGEMENTS.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {ACKNOWLEDGEMENTS.map(ack => (
                    <button
                      key={ack.id}
                      onClick={() => setAcks(a => ({ ...a, [ack.id]: !a[ack.id] }))}
                      className={cn(
                        "w-full text-left flex items-start gap-3.5 p-3.5 rounded-lg border-2 transition-all",
                        acks[ack.id]
                          ? "border-teal-400 bg-teal-50/50 shadow-sm"
                          : "border-border bg-card hover:border-foreground/20"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        acks[ack.id] ? "border-teal-500 bg-teal-500" : "border-muted-foreground/30"
                      )}>
                        {acks[ack.id] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <p className={cn("text-xs leading-relaxed font-medium", acks[ack.id] ? "text-teal-900" : "text-muted-foreground")}>{ack.text}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Replay status */}
              <div className="p-5 bg-muted/50 border border-border rounded-xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <Database className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Analysis Service</span>
                </div>
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center bg-card p-2 rounded border border-border/50">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">Bundled Local Replay</span>
                  </div>
                  <div className="flex justify-between items-center bg-card p-2 rounded border border-border/50">
                    <span className="text-muted-foreground">Version</span>
                    <span className="text-foreground font-semibold">prepared-replay-v1</span>
                  </div>
                  <div className="flex justify-between items-center bg-card p-2 rounded border border-border/50">
                    <span className="text-muted-foreground">providerTransmission</span>
                    <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">false</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-2">
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={!formValid}
                  className={cn(
                    "w-full h-14 rounded-xl font-bold text-sm shadow-md transition-all",
                    saved
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : formValid
                        ? "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5"
                        : "bg-muted text-muted-foreground opacity-60"
                  )}
                >
                  {saved ? (
                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Saved — entering workspace…</>
                  ) : (
                    <>Save Purpose Brief &amp; Continue <ArrowRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
                {!formValid && (
                  <p className="text-xs font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 text-center flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {!allAcked ? `Please confirm ${ACKNOWLEDGEMENTS.length - ackCount} remaining acknowledgement(s)` : 'Practitioner role, organization, and purpose required'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
