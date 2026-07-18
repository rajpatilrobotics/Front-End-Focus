import React from 'react';
import { EvidenceNature, Origin, SupportStatus, ReviewStatus } from '@/data/mock-case';
import { FileText, MessageSquare, User, HelpCircle, Bot, CheckCircle, AlertTriangle, Eye, EyeOff, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EvidenceNatureBadge({ nature, className }: { nature: EvidenceNature, className?: string }) {
  const config = {
    'documented': { icon: FileText, label: 'Documented', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    'reported': { icon: MessageSquare, label: 'Reported', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    'reviewer-supplied': { icon: User, label: 'Reviewer-Supplied', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    'unknown': { icon: HelpCircle, label: 'Unknown', color: 'text-slate-600 bg-slate-50 border-slate-200' }
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
    'source-extraction': { icon: FileText, label: 'Extracted', color: 'text-slate-700 border-slate-200 bg-slate-50' },
    'ai-suggestion': { icon: Bot, label: 'AI Suggested', color: 'text-teal-700 border-teal-200 bg-teal-50' },
    'human-created': { icon: User, label: 'Human Created', color: 'text-purple-700 border-purple-200 bg-purple-50' }
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
    'supported': { icon: CheckCircle, label: 'Supported', color: 'text-teal-700' },
    'partially-supported': { icon: AlertTriangle, label: 'Partial Support', color: 'text-amber-600' },
    'conflicting': { icon: XCircle, label: 'Conflicting', color: 'text-red-600' },
    'insufficient': { icon: EyeOff, label: 'Insufficient', color: 'text-slate-500' },
    'unresolved': { icon: HelpCircle, label: 'Unresolved', color: 'text-purple-700' },
    'not-processed': { icon: Eye, label: 'Not Processed', color: 'text-slate-400' }
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
    'pending': { label: 'Pending Review', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    'accepted': { label: 'Accepted', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    'edited': { label: 'Edited', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    'rejected': { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200' },
    'uncertain': { label: 'Uncertain', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    'invalidated': { label: 'Invalidated', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  };
  const { label, color } = config[status];

  return (
    <div className={cn("inline-flex items-center px-2 py-1 rounded-sm border text-[11px] font-semibold uppercase tracking-wider", color, className)}>
      {label}
    </div>
  );
}
