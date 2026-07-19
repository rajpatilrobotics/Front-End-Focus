import React from 'react';
import { Link } from 'wouter';
import { ShieldAlert, FileText, Network, Clock, Download, ArrowRight, AlertTriangle, CheckCircle2, XCircle, Activity, Lock } from 'lucide-react';
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
  { icon: FileText, text: 'Organises and surfaces document evidence with source citations' },
  { icon: Network, text: 'Maps charge-coercion relationships in a reviewable Nexus graph' },
  { icon: Clock, text: 'Reconstructs a source-grounded chronological timeline' },
  { icon: ShieldAlert, text: 'Flags review blockers before any safe handoff is generated' },
  { icon: Lock, text: 'Masks sensitive identifiers — original source never altered' },
  { icon: Download, text: 'Generates locally, never uploads or transmits case data' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center border border-border">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground tracking-tight">ContextFirst Nexus</span>
          <span className="text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded">SYNTHETIC FIXTURE v1</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/trust" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            Trust &amp; Safety
          </Link>
          <Link href="/cases">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm">
              Start Demo <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Synthetic warning strip */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-center gap-2 text-xs font-mono text-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        All data in this workspace is a bundled synthetic fixture. This prototype does not accept real or private case data.
      </div>

      {/* Hero */}
      <section className="border-b border-border px-6 py-16 md:py-24 bg-gradient-to-br from-muted/40 via-background to-background">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            For qualified legal practitioners — not survivors, hotlines, or law enforcement
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Source-grounded case preparation<br />
            <span className="text-primary">for forced-criminality matters</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
            ContextFirst Nexus helps qualified practitioners answer: what does the case packet actually document about the relationship between alleged conduct and possible coercion — and what needs human review before a safe handoff?
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link href="/cases">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-semibold px-8">
                Start Demo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/trust">
              <Button size="lg" variant="outline" className="rounded-sm border-border text-foreground hover:bg-muted font-medium px-8">
                Trust &amp; Safety
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <section className="flex-1 px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* What the system does */}
          <div>
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              What this system does
            </h2>
            <div className="space-y-4">
              {WHAT_IT_DOES.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-card border border-border rounded-md shadow-sm">
                  <div className="w-7 h-7 rounded bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-teal-700" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-muted border border-border rounded-md">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Human responsibility</p>
              <p className="text-sm text-foreground leading-relaxed">
                The system organises and suggests. <strong>The practitioner makes every consequential decision.</strong> There is no bulk approval. Every candidate is reviewed separately.
              </p>
            </div>
          </div>

          {/* What it NEVER decides */}
          <div>
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              What this system never decides
            </h2>
            <div className="bg-card border border-red-200 rounded-md overflow-hidden shadow-sm">
              <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                <p className="text-xs font-mono text-red-700 uppercase tracking-wider font-semibold">Prohibited determinations — always outside system scope</p>
              </div>
              <div className="divide-y divide-border">
                {PROHIBITED_DECISIONS.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs font-mono text-blue-700 uppercase tracking-wider mb-2">Audience</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Legal-aid practitioners', 'Defence lawyers', 'Public defenders', 'Court-navigation practitioners', 'NGO legal practitioners', 'Authorized supervisors'].map(role => (
                  <span key={role} className="text-xs bg-white border border-blue-200 text-blue-800 px-2 py-1 rounded font-medium">{role}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo flow strip */}
      <section className="border-t border-border bg-muted/30 px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6 text-center">Application flow</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Purpose Brief', 'Documents & Coverage', 'Start Local Analysis', 'Timeline & Nexus Review', 'Export Gate', 'Reviewed Local PDF / JSON'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-md shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-foreground font-medium">{step}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/cases">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm font-semibold px-10">
                Load Case Workspace <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">No account or upload required · Synthetic data only · All processing is local</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>ContextFirst Nexus · Synthetic Fixture v1 · providerTransmission: false</span>
        <div className="flex gap-4">
          <Link href="/trust" className="hover:text-foreground transition-colors">Trust &amp; Safety</Link>
          <Link href="/cases" className="hover:text-foreground transition-colors">Case Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
