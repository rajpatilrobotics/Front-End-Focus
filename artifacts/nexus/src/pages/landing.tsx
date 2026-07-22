import React from 'react';
import { Link } from 'wouter';
import {
  ShieldAlert, FileText, Network, Clock, Download, ArrowRight, AlertTriangle,
  CheckCircle2, XCircle, Activity, Lock, ChevronRight, Sparkles,
  User,
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
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-800 shadow-sm z-20 relative flex-wrap text-center">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold">All data in this workspace is a bundled synthetic fixture.</span>
        <span className="hidden xs:inline">This prototype does not accept real or private case data.</span>
      </div>

      {/* ── Dark hero ── */}
      <section
        className="relative overflow-hidden border-b border-border min-h-[85vh] flex items-center"
        style={{ background: 'linear-gradient(135deg, #060D1A 0%, #0B1E3D 50%, #091526 100%)' }}
      >
        {/* Animated Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none animate-[pulse_8s_ease-in-out_infinite]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Moving Glow blobs */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[500px] rounded-full pointer-events-none animate-[spin_20s_linear_infinite]" style={{ background: 'radial-gradient(ellipse, rgba(43,188,212,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" style={{ background: 'radial-gradient(ellipse, rgba(43,188,212,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28">
          {/* Audience pill */}
          <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-mono border-2 border-emerald-500/30 bg-emerald-500/15 text-emerald-300 px-4 py-2 rounded-full mb-6 sm:mb-8 shadow-sm backdrop-blur-md max-w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="min-w-0">For qualified legal practitioners — not survivors, hotlines, or law enforcement</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.05]">
            Source-grounded case preparation
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#2BBCD4] via-[#5EDFEF] to-[#2BBCD4]">
              for forced-criminality matters
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8 sm:mb-10 font-light">
            ContextFirst Nexus helps qualified practitioners answer: what does the case packet actually document about the relationship between alleged conduct and possible coercion — and what needs human review before a safe handoff?
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4">
            <Link href="/cases">
              <Button
                size="lg"
                className="text-white font-bold px-8 sm:px-10 h-12 sm:h-14 rounded-md gap-2 shadow-2xl hover:scale-[1.02] transition-transform w-full sm:w-auto"
                style={{ background: 'linear-gradient(135deg, #2BBCD4 0%, #1FA8C0 100%)', boxShadow: '0 8px 32px rgba(43,188,212,0.4)' }}
              >
                Start Demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/trust">
              <Button size="lg" variant="outline" className="h-12 sm:h-14 border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-medium px-6 sm:px-8 rounded-md backdrop-blur-sm transition-all w-full sm:w-auto">
                Trust &amp; Safety
              </Button>
            </Link>
          </div>

          {/* Hero stats */}
          <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row flex-wrap gap-6 sm:gap-8 border-t border-white/8 pt-8 sm:pt-10 max-w-2xl">
            {[
              { value: '11/11', label: 'safety scenarios illustrated' },
              { value: 'false', label: 'Provider transmission' },
              { value: 'Local', label: 'Processing location' },
            ].map((s, idx) => (
              <div key={s.label} className={cn("group", idx !== 2 && "sm:pr-8 sm:border-r border-white/10")}>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-[#2BBCD4] group-hover:text-white transition-colors">{s.value}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wider leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What it does ── */}
      <section className="px-6 py-24 bg-background border-b border-border relative">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs font-mono text-primary font-semibold uppercase tracking-widest">What this system does</p>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-12">Six core capabilities</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHAT_IT_DOES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="p-6 bg-card border border-border border-l-4 border-l-transparent rounded-xl shadow-sm hover:shadow-xl group-hover:border-l-primary hover:border-l-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 group overflow-hidden"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                  <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground mb-1">Human responsibility</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The system organises and suggests. <strong className="text-foreground font-semibold">The practitioner makes every consequential decision.</strong> There is no bulk approval — every candidate is reviewed separately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Prohibited / Audience ── */}
      <section className="px-6 py-24 bg-muted/30 border-b border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Prohibited */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs font-mono text-red-600 font-semibold uppercase tracking-widest">What this system never decides</p>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Prohibited determinations</h2>
            <div className="bg-card border border-red-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-red-950/80 px-5 py-3 border-b border-red-800 flex items-center gap-2 text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs font-mono uppercase tracking-wider font-bold">Always outside system scope</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-0">
                {PROHIBITED_DECISIONS.map((item, i) => (
                  <div key={i} className={cn("flex items-center gap-3 px-5 py-3 hover:bg-red-50/30 transition-colors", i < PROHIBITED_DECISIONS.length - 1 && "border-b border-border/60")}>
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audience */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <p className="text-xs font-mono text-primary font-semibold uppercase tracking-widest">Intended audience</p>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Qualified practitioners only</h2>
            <div className="space-y-3">
              {['Legal-aid practitioners', 'Defence or public-defender teams', 'Court-navigation practitioners', 'NGO legal teams', 'Qualified supervisors or pilot evaluators'].map(role => (
                <div key={role} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary/70 transition-all">
                    <User className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{role}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-mono text-amber-800 uppercase tracking-wider font-bold">Not designed for</p>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed font-medium">Survivors, hotlines, emergency services, law enforcement, or the general public. The person described in the evidence is an affected stakeholder, not the direct user.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Application flow ── */}
      <section className="px-6 py-24 border-b border-border bg-background relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <p className="text-xs font-mono text-primary font-semibold uppercase tracking-widest mb-3 text-center">Application flow</p>
          <h2 className="text-3xl font-bold text-foreground mb-16 text-center">Six-step case preparation</h2>

          <div className="relative">
            <div className="absolute top-6 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-3">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.label} className="relative flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center mb-4 group-hover:border-primary group-hover:bg-primary transition-all shadow-md relative z-10 group-hover:drop-shadow-lg duration-300">
                    <span className="text-sm font-bold font-mono text-muted-foreground group-hover:text-white transition-colors duration-300">{step.n}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-6 py-24 border-b border-border" style={{ background: 'linear-gradient(180deg, #060D1A 0%, #0B1E3D 100%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Experience the workspace.</h2>
          <p className="text-lg text-slate-300 mb-10">
            Open the fully-populated synthetic fixture. No account, no uploads, and no external processing.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/cases">
              <Button
                size="lg"
                className="text-white font-bold px-8 sm:px-12 h-14 sm:h-16 text-base sm:text-lg rounded-xl gap-2 shadow-xl hover:scale-105 transition-all duration-300 ring-4 ring-primary/30 animate-pulse"
                style={{ background: 'linear-gradient(135deg, #2BBCD4 0%, #1FA8C0 100%)', boxShadow: '0 8px 32px rgba(43,188,212,0.3)' }}
              >
                Load Case Workspace <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-400 font-mono mt-4">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> No account needed</span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Synthetic data only</span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Local processing</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-5 flex items-center justify-between text-xs text-muted-foreground font-mono bg-card relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
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
