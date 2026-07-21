import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useRoute } from 'wouter';
import { ShieldAlert, CheckCircle2, AlertTriangle, Database, ArrowRight, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  const allAcked = ACKNOWLEDGEMENTS.every(a => acks[a.id]);
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
      {/* Header */}
      <div className="border-b border-border bg-card/80 px-8 py-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Purpose Brief
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Record why this case is being reviewed before analysis can begin.</p>
        </div>
        <button
          onClick={handleCheckpoint}
          className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors px-4 py-2 rounded-md text-sm font-medium"
        >
          <Zap className="w-3.5 h-3.5" />
          Load Prepared Checkpoint
          <span className="text-[10px] font-mono bg-amber-100 px-1.5 py-0.5 rounded">FAST DEMO</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form — left 3 cols */}
          <div className="lg:col-span-3 space-y-8">
            {/* Practitioner Details */}
            <section>
              <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 pb-2 border-b border-border">Practitioner Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Practitioner Role <span className="text-red-500">*</span></label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Organization Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.orgType}
                    onChange={e => setForm(f => ({ ...f, orgType: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
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
            <section>
              <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 pb-2 border-b border-border">Case Context</h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Authorized Purpose <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.purpose}
                    onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                    placeholder="Describe the authorized purpose for this review (e.g., Preparation of defence brief for upcoming bail hearing)…"
                    rows={3}
                    className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intended Recipient</label>
                    <input
                      type="text"
                      value={form.recipient}
                      onChange={e => setForm(f => ({ ...f, recipient: e.target.value }))}
                      placeholder="Name or role…"
                      className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recipient Category</label>
                    <select
                      value={form.recipientCategory}
                      onChange={e => setForm(f => ({ ...f, recipientCategory: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
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
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fictional Jurisdiction</label>
                  <input
                    type="text"
                    value={form.jurisdiction}
                    onChange={e => setForm(f => ({ ...f, jurisdiction: e.target.value }))}
                    placeholder="e.g., Synthetic State (demo use only) — domestic legal verification required…"
                    className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </section>

            {/* Source & Handoff */}
            <section>
              <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 pb-2 border-b border-border">Source &amp; Handoff</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source Language</label>
                  <select
                    value={form.sourceLanguage}
                    onChange={e => setForm(f => ({ ...f, sourceLanguage: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Select…</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Mixed (En/Es)</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Translation Status</label>
                  <select
                    value={form.translationStatus}
                    onChange={e => setForm(f => ({ ...f, translationStatus: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Select…</option>
                    <option>All documents in original language</option>
                    <option>Partial professional translation</option>
                    <option>Machine translation (unverified)</option>
                    <option>Unknown</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requested Handoff Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {[
                    { value: 'full', label: 'Full Practitioner Handoff', desc: 'Complete reviewed materials including all citations and context.' },
                    { value: 'minimum', label: 'Minimum-Necessary Safe Share', desc: 'Practitioner-selected summary, no raw citations, external recipients.' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, handoffType: opt.value }))}
                      className={cn(
                        "text-left p-4 rounded-md border-2 transition-all",
                        form.handoffType === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-foreground/20"
                      )}
                    >
                      <div className={cn("text-sm font-semibold mb-1", form.handoffType === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Acknowledgements — right 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-0 space-y-6">
              <section>
                <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4 pb-2 border-b border-border">Required Acknowledgements</h2>
                <p className="text-xs text-muted-foreground mb-4">All six must be confirmed before analysis can begin.</p>
                <div className="space-y-3">
                  {ACKNOWLEDGEMENTS.map(ack => (
                    <button
                      key={ack.id}
                      onClick={() => setAcks(a => ({ ...a, [ack.id]: !a[ack.id] }))}
                      className={cn(
                        "w-full text-left flex items-start gap-3 p-3 rounded-md border transition-all",
                        acks[ack.id]
                          ? "border-teal-200 bg-teal-50"
                          : "border-border bg-card hover:border-foreground/20"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        acks[ack.id] ? "border-teal-600 bg-teal-600" : "border-border"
                      )}>
                        {acks[ack.id] && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <p className={cn("text-xs leading-relaxed", acks[ack.id] ? "text-teal-900" : "text-muted-foreground")}>{ack.text}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Replay status */}
              <div className="p-4 bg-muted border border-border rounded-md">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Analysis Service</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="text-teal-700 font-semibold">Bundled Local Replay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="text-foreground">prepared-replay-v1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">providerTransmission</span>
                    <span className="text-teal-700 font-semibold">false</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Live AI</span>
                    <span className="text-muted-foreground">disabled</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={!formValid}
                  className={cn(
                    "w-full rounded-sm font-semibold",
                    saved ? "bg-teal-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {saved ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved — entering workspace…</>
                  ) : (
                    <>Save Purpose Brief &amp; Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
                {!formValid && (
                  <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {!allAcked ? 'All 6 acknowledgements required' : 'Role, organization, and purpose required'}
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
