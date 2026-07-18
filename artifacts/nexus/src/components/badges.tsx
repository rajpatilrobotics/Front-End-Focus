import React from 'react';
import { EvidenceNature, Origin, SupportStatus, ReviewStatus } from '@/data/mock-case';
import { FileText, MessageSquare, User, HelpCircle, Bot, BrainCircuit, CheckCircle, AlertTriangle, AlertCircle, Eye, EyeOff, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EvidenceNatureBadge({ nature, className }: { nature: EvidenceNature, className?: string }) {
  const config = {
    'documented': { icon: FileText, label: 'Documented', color: 'text-blue-400 bg-blue-950/50 border-blue-900/50' },
    'reported': { icon: MessageSquare, label: 'Reported', color: 'text-amber-400 bg-amber-950/50 border-amber-900/50' },
    'reviewer-supplied': { icon: User, label: 'Reviewer-Supplied', color: 'text-purple-400 bg-purple-950/50 border-purple-900/50' },
    'unknown': { icon: HelpCircle, label: 'Unknown', color: 'text-zinc-400 bg-zinc-900 border-zinc-800' }
  };
  const { icon: Icon, label, color } = config[nature];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[10px] font-mono uppercase tracking-wider", color, className)}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}

export function OriginBadge({ origin, className }: { origin: Origin, className?: string }) {
  const config = {
    'source-extraction': { icon: FileText, label: 'Extracted', color: 'text-zinc-300 border-zinc-700' },
    'ai-suggestion': { icon: Bot, label: 'AI Suggested', color: 'text-teal-400 border-teal-900/50 bg-teal-950/20' },
    'human-created': { icon: User, label: 'Human Created', color: 'text-purple-400 border-purple-900/50 bg-purple-950/20' }
  };
  const { icon: Icon, label, color } = config[origin];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[10px] font-mono uppercase tracking-wider", color, className)}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}

export function SupportStatusBadge({ status, className }: { status: SupportStatus, className?: string }) {
  const config = {
    'supported': { icon: CheckCircle, label: 'Supported', color: 'text-teal-400' },
    'partially-supported': { icon: AlertTriangle, label: 'Partial Support', color: 'text-amber-400' },
    'conflicting': { icon: XCircle, label: 'Conflicting', color: 'text-red-400' },
    'insufficient': { icon: EyeOff, label: 'Insufficient', color: 'text-zinc-500' },
    'unresolved': { icon: HelpCircle, label: 'Unresolved', color: 'text-purple-400' },
    'not-processed': { icon: Eye, label: 'Not Processed', color: 'text-zinc-600' }
  };
  const { icon: Icon, label, color } = config[status];

  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium", color, className)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus, className?: string }) {
  const config = {
    'pending': { label: 'Pending Review', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'accepted': { label: 'Accepted', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    'edited': { label: 'Edited', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    'rejected': { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    'uncertain': { label: 'Uncertain', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    'invalidated': { label: 'Invalidated', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  };
  const { label, color } = config[status];

  return (
    <div className={cn("inline-flex items-center px-2 py-1 rounded-sm border text-[11px] font-semibold uppercase tracking-wider", color, className)}>
      {label}
    </div>
  );
}
