import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ExternalLink, Link2 } from 'lucide-react';
import { EvidenceNature, SupportStatus, ReviewStatus, Origin } from '@/data/mock-case';
import { EvidenceNatureBadge, SupportStatusBadge, ReviewStatusBadge, OriginBadge } from './badges';

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  badges
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  badges?: React.ReactNode;
}) {
  return (
    <div className="bg-card border-b border-border px-6 py-5 flex items-start justify-between shrink-0 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
          {badges}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <div className="relative z-10 ml-6 shrink-0 flex items-start">
          {action}
        </div>
      )}
    </div>
  );
}

export function SourceCitation({
  documentId,
  page,
  onClick
}: {
  documentId: string;
  page: number;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted/50 hover:bg-muted border border-border rounded text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors group shadow-2xs"
    >
      <Link2 className="w-3 h-3 group-hover:text-primary transition-colors" />
      <span className="font-semibold text-foreground/80">{documentId.toUpperCase()}</span>
      <span className="text-border mx-0.5">·</span>
      <span>p.{page}</span>
    </button>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5 shadow-sm">
        <Icon className="w-8 h-8 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}
