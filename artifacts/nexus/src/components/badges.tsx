import React from 'react';
import { EvidenceNature, Origin, SupportStatus, ReviewStatus } from '@/data/mock-case';
import { FileText, MessageSquare, User, HelpCircle, Bot, CheckCircle, AlertTriangle, Eye, EyeOff, XCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EvidenceNatureBadge({ nature, className }: { nature: EvidenceNature, className?: string }) {
  const config = {
    'documented': { icon: FileText, label: 'Documented', color: 'text-emerald-800 bg-emerald-50 border-emerald-200 shadow-emerald-500/10' },
    'reported': { icon: MessageSquare, label: 'Reported', color: 'text-sky-800 bg-sky-50 border-sky-200 shadow-sky-500/10' },
    'reviewer-supplied': { icon: User, label: 'Reviewer-Supplied', color: 'text-purple-700 bg-purple-50 border-purple-200 shadow-purple-500/10' },
    'unknown': { icon: HelpCircle, label: 'Unknown', color: 'text-slate-600 bg-slate-50 border-slate-200 shadow-slate-500/10' }
  };
  const { icon: Icon, label, color } = config[nature];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded shadow-2xs border text-[10px] font-mono uppercase tracking-wider", color, className)}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}

export function OriginBadge({ origin, className }: { origin, className?: string }) {
  const config = {
    'source-extraction': { icon: FileText, label: 'Extracted', color: 'text-slate-700 border-slate-200 bg-slate-50 shadow-slate-500/10' },
    'ai-suggestion': { icon: Sparkles, label: 'AI Suggested', color: 'text-purple-800 border-purple-200 bg-purple-50 shadow-purple-500/10' },
    'human-created': { icon: User, label: 'Human Created', color: 'text-purple-700 border-purple-200 bg-purple-50 shadow-purple-500/10' }
  };
  const { icon: Icon, label, color } = config[origin];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded shadow-2xs border text-[10px] font-mono uppercase tracking-wider", color, className)}>
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}

export function SupportStatusBadge({ status, className }: { status: SupportStatus, className?: string }) {
  const config = {
    'supported': { icon: CheckCircle, label: 'Supported', color: 'text-teal-700' },
    'partially-supported': { icon: AlertTriangle, label: 'Partial Support', color: 'text-amber-600' },
    'conflicting': { icon: XCircle, label: 'Conflicting', color: 'text-red-600' },
    'insufficient': { icon: EyeOff, label: 'Insufficient', color: 'text-slate-500' },
    'unresolved': { icon: HelpCircle, label: 'Unresolved', color: 'text-purple-700' },
    'not-processed': { icon: Eye, label: 'Not Processed', color: 'text-slate-400' }
  };
  const { icon: Icon, label, color } = config[status];

  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold tracking-tight", color, className)}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
}

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus, className?: string }) {
  const config = {
    'pending': { label: 'Pending Review', color: 'bg-amber-50 text-amber-800 border-amber-200 shadow-amber-500/10' },
    'accepted': { label: 'Accepted', color: 'bg-teal-50 text-teal-700 border-teal-200 shadow-teal-500/10' },
    'edited': { label: 'Edited', color: 'bg-teal-50 text-teal-700 border-teal-200 shadow-teal-500/10' },
    'rejected': { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200 shadow-red-500/10' },
    'uncertain': { label: 'Uncertain', color: 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-500/10' },
    'invalidated': { label: 'Invalidated', color: 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-500/10' },
  };
  const { label, color } = config[status];

  return (
    <div className={cn("inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest shadow-2xs", color, className)}>
      {label}
    </div>
  );
}
