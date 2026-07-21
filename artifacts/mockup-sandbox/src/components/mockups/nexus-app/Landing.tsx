import React from "react";
import { 
  Shield, 
  FileText, 
  Network, 
  History, 
  Lock, 
  EyeOff, 
  HardDrive,
  ArrowRight,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 border-b border-border bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg tracking-tight">ContextFirst Nexus</span>
            <div className="hidden md:flex items-center ml-8 text-sm text-muted-foreground">
              Context-first case analysis. No hallucinations. No shortcuts.
            </div>
          </div>
          <div>
            <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Request Access
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        {/* Hero */}
        <section className="max-w-4xl mx-auto text-center mb-32 fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Asylum and trafficking cases are decided on context. <span className="text-primary">Get it right.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            A precise, local-only forensic workspace designed for legal professionals to map timelines, build chronologies, and establish the charge-coercion nexus from raw evidence.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base h-12 px-8">
              View Demo Case <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base h-12 px-8 border-border text-foreground hover:bg-secondary">
              Read the Methodology
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "Document Evidence", desc: "Extract structured events from messy legal documents and statements." },
              { icon: Network, title: "Charge-Coercion Nexus", desc: "Map the direct link between coercive acts and criminal charges." },
              { icon: History, title: "Timeline Reconstruction", desc: "Build a chronological narrative with source citations for every point." },
              { icon: Lock, title: "Pre-Handoff Gate", desc: "Ensure all required elements are present before generating handoff docs." },
              { icon: EyeOff, title: "Identifier Masking", desc: "Automatically redact PII and sensitive markers for safe review." },
              { icon: HardDrive, title: "Local-Only Processing", desc: "Zero data leaves your device. Total compliance with privacy mandates." },
            ].map((f, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-lg hover:border-primary/50 transition-colors duration-300">
                <f.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Prohibited Decisions */}
        <section className="max-w-4xl mx-auto mb-32 bg-amber-500/5 border border-amber-500/20 rounded-xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-500">What This Tool Will Never Do</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Nexus is an analytical workspace, not an automated judge. The following determinations remain strictly the domain of human legal professionals:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {[
              "Trafficking or victim status",
              "Credibility of any person",
              "Guilt or innocence",
              "Legal eligibility for any status",
              "Non-punishment eligibility",
              "Case priority or urgency ranking",
              "Legal strategy or advice",
              "Prosecution or sentencing outcome",
              "Referral to law enforcement",
              "Any clinical or medical determination"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow */}
        <section className="max-w-6xl mx-auto mb-24">
          <h2 className="text-3xl font-bold text-center mb-16">The Analysis Protocol</h2>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2 hidden lg:block" />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
              {[
                { n: "01", t: "Purpose Brief" },
                { n: "02", t: "Docs & Coverage" },
                { n: "03", t: "Local Analysis" },
                { n: "04", t: "Timeline Review" },
                { n: "05", t: "Pre-Handoff Gate" },
                { n: "06", t: "Export & Handoff" }
              ].map((step, i) => (
                <div key={i} className="bg-background border border-border p-5 rounded-lg relative z-10 text-center">
                  <div className="text-xs font-mono text-primary mb-2 tracking-widest">{step.n}</div>
                  <div className="font-medium text-sm">{step.t}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HardDrive className="w-4 h-4" />
          <span>Local-only processing. No data leaves your device.</span>
        </div>
        <p className="opacity-60">ContextFirst Nexus © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}