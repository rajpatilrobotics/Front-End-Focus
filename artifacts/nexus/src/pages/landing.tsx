import React from 'react';
import { Link } from 'wouter';
import {
  ShieldAlert, FileText, Network, Clock, Download, ArrowRight, AlertTriangle,
  CheckCircle2, XCircle, Activity, Lock, ChevronRight, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PROHIBITED_DECISIONS = [
  'Trafficking or victim status',
  'Credibility of any person',
  'Guilt or innocence',
  'Legal eligibility for any status',
  'Non-punishment eligibility',
  'Case priority or urgency ranking',
  'Legal strategy or advice',
  'Prosecution or sentencing outcome',
  'Referral to law enforcement',
  'Any clinical or medical determination',
];

const WHAT_IT_DOES = [
  { icon: FileText,    title: 'Document Evidence',   text: 'Organises and surfaces document evidence with exact source citations — every claim traces back to a real page.' },
  { icon: Network,     title: 'Charge–Coercion Nexus', text: 'Maps charge-coercion relationships in a reviewable Nexus graph. Proposals only — a human confirms every link.' },
  { icon: Clock,       title: 'Timeline Reconstruction', text: 'Reconstructs a source-grounded chronological timeline. Approximate and unknown dates are marked honestly.' },
  { icon: ShieldAlert, title: 'Pre-Handoff Gate',    text: 'Flags every unresolved review blocker before a safe handoff can be created. There is no unsafe override.' },
  { icon: Lock,        title: 'Identifier Masking',  text: 'Masks sensitive identifiers in view. The original source is never altered — full text is revealed intentionally only.' },
  { icon: Download,    title: 'Local-Only Processing', text: 'Generates exports locally. No case data is uploaded, transmitted, or stored on any external server.' },
];

const FLOW_STEPS = [
  { n: '01', label: 'Purpose Brief' },
  { n: '02', label: 'Documents & Coverage' },
  { n: '03', label: 'Local Analysis' },
  { n: '04', label: 'Timeline & Nexus Review' },
  { n: '05', label: 'Export Gate' },
  { n: '06', label: 'Reviewed Local Output' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Top bar ── */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center border border-primary/25">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-foreground tracking-tight">ContextFirst Nexus</span>
          <span className="hidden sm:block text-[10px] font-mono text-muted-foreground border border-border px-2 py-0.5 rounded-full bg-muted">
            SYNTHETIC FIXTURE v1
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hidden sm:block">
            Trust &amp; Safety
          </Link>
          <Link href="/cases">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-semibold gap-1.5 shadow-sm shadow-primary/20">
              Start Demo <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Synthetic data strip ── */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        All data in this workspace is a bundled synthetic fixture. This prototype does not accept real or private case data.
      </div>

      {/* ── Dark hero ── */}
      <section
        className="relative overflow-hidden border-b border-border"
        style={{ background: 'linear-gradient(140deg, #0B1629 0%, #0E2040 60%, #0B1629 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(43,188,212,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(43,188,212,0.07) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28">
          {/* Audience pill */}
          <div className="inline-flex items-center gap-2 text-[11px] font-mono border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            For qualified legal practitioners — not survivors, hotlines, or law enforcement
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-[1.1]">
            Source-grounded case preparation
            <span className="block mt-2" style={{ color: '#2BBCD4' }}>
              for forced-criminality matters
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
            ContextFirst Nexus helps qualified practitioners answer: what does the case packet actually document about the relationship between alleged conduct and possible coercion — and what needs human review before a safe handoff?
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link href="/cases">
              <Button
                size="lg"
                className="text-white font-bold px-8 rounded-md gap-2"
                style={{ background: 'linear-gradient(135deg, #2BBCD4 0%, #1FA8C0 100%)', boxShadow: '0 4px 24px rgba(43,188,212,0.3)' }}
              >
                Start Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/trust">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/8 hover:border-white/30 font-medium px-8 rounded-md">
                Trust &amp; Safety
              </Button>
            </Link>
          </div>

          {/* Hero stats */}
          <div className="mt-14 grid grid-cols-3 gap-8 border-t border-white/10 pt-10 max-w-lg">
            {[
              { value: '11/11', label: 'Safety tests passing' },
              { value: 'false', label: 'Provider transmission' },
              { value: '0', label: 'External transmissions' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold font-mono" style={{ color: '#2BBCD4' }}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What it does ── */}
      <section className="px-6 py-16 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">What this system does</p>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-10">Six core capabilities</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_IT_DOES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="relative p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/25 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5 text-sm">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Human responsibility</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The system organises and suggests. <strong className="text-foreground">The practitioner makes every consequential decision.</strong> There is no bulk approval — every candidate is reviewed separately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Prohibited / Audience ── */}
      <section className="px-6 py-16 bg-muted/30 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Prohibited */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">What this system never decides</p>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-5">Prohibited determinations</h2>
            <div className="bg-card border border-red-200/70 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-red-50 px-4 py-2.5 border-b border-red-200/70">
                <p className="text-[11px] font-mono text-red-700 uppercase tracking-wider font-semibold">Always outside system scope</p>
              </div>
              {PROHIBITED_DECISIONS.map((item, i) => (
                <div key={i} className={cn("flex items-center gap-3 px-4 py-2.5", i < PROHIBITED_DECISIONS.length - 1 && "border-b border-border/60")}>
                  <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Intended audience</p>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-5">Qualified practitioners only</h2>
            <div className="space-y-3">
              {['Legal-aid practitioners', 'Defence or public-defender teams', 'Court-navigation practitioners', 'NGO legal teams', 'Qualified supervisors or pilot evaluators'].map(role => (
                <div key={role} className="flex items-center gap-3 p-3.5 bg-card border border-border rounded-lg hover:border-primary/25 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{role}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-mono text-amber-800 uppercase tracking-wider mb-1.5">Not designed for</p>
              <p className="text-sm text-amber-900">Survivors, hotlines, emergency services, law enforcement, or the general public. The person described in the evidence is an affected stakeholder, not the direct user.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Application flow ── */}
      <section className="px-6 py-16 border-b border-border bg-background">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2 text-center">Application flow</p>
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">Six-step case preparation</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center mb-3 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all shadow-sm">
                  <span className="text-xs font-bold font-mono text-muted-foreground group-hover:text-primary transition-colors">{step.n}</span>
                </div>
                <span className="text-xs font-medium text-foreground leading-snug">{step.label}</span>
                {i < FLOW_STEPS.length - 1 && (
                  <ChevronRight className="absolute right-0 top-2.5 w-4 h-4 text-border hidden lg:block -translate-y-0.5" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-3">
            <Link href="/cases">
              <Button
                size="lg"
                className="text-white font-bold px-10 rounded-md gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2BBCD4 0%, #1FA8C0 100%)', boxShadow: '0 4px 24px rgba(43,188,212,0.25)' }}
              >
                Load Case Workspace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground font-mono">
              No account or upload required · Synthetic data only · All processing is local
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-5 flex items-center justify-between text-xs text-muted-foreground font-mono bg-card">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span>ContextFirst Nexus · Synthetic Fixture v1 · providerTransmission: false</span>
        </div>
        <div className="flex gap-4">
          <Link href="/trust" className="hover:text-foreground transition-colors">Trust &amp; Safety</Link>
          <Link href="/cases" className="hover:text-foreground transition-colors">Case Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
