import React, { useState } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, Plus, User, Link2,
  ShieldAlert, XCircle, Loader2, AlertCircle, ChevronRight,
  ArrowRight, Info, Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Static type definitions ──────────────────────────────────────────────────

type TaskStatus = 'urgent' | 'in-progress' | 'blocked' | 'completed';
type TaskPriority = 'high' | 'medium' | 'low';

type StaticTask = {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  owner: string;
  dueDate: string;
  dueDateLabel: string;
  evidenceGapId: string;
  evidenceGapLabel: string;
  whyMatters: string;
  sourceType: string;
  isSafetySensitive?: boolean;
  safetyLabel?: string;
  blockerExplanation?: string;
  notes?: string;
};

// ── Static synthetic display data ───────────────────────────────────────────

const TASKS: StaticTask[] = [
  {
    id: 'ct-3',
    title: 'Confirm legal representation before Thursday hearing',
    priority: 'high',
    status: 'urgent',
    owner: 'M. Chen',
    dueDate: '2024-03-27',
    dueDateLabel: 'Thu Mar 27',
    evidenceGapId: 'eg-7',
    evidenceGapLabel: 'No confirmed representation at hearing',
    whyMatters:
      'An unrepresented individual at a hearing involving potential removal or detention carries significant procedural and safety risk. This task directly affects the client\'s ability to assert non-punishment protections. Without duty counsel confirmed, the hearing cannot proceed safely.',
    sourceType: 'Urgent Need',
    isSafetySensitive: true,
    safetyLabel: 'Hearing safety — unrepresented client',
    notes: 'Legal aid intake form submitted. Duty counsel roster checked — no confirmation received as of 09:00.',
  },
  {
    id: 'ct-5',
    title: 'Contact emergency housing coordinator re: eviction notice',
    priority: 'high',
    status: 'in-progress',
    owner: 'M. Chen',
    dueDate: '2024-03-24',
    dueDateLabel: 'Today',
    evidenceGapId: 'un-1',
    evidenceGapLabel: 'Immediate accommodation — eviction effective Friday',
    whyMatters:
      'Client faces eviction by end of week. Loss of stable accommodation at this stage of case preparation increases vulnerability and may disrupt access to services. Record whether a housing offer was made and the client\'s response, regardless of outcome.',
    sourceType: 'Urgent Need',
    isSafetySensitive: true,
    safetyLabel: 'Immediate safety need — housing',
    notes: 'Emergency housing coordinator called at 10:30. Awaiting callback. Backup shelter option identified.',
  },
  {
    id: 'ct-1',
    title: 'Obtain clearer copy of travel record — border entry stamp p.1',
    priority: 'high',
    status: 'in-progress',
    owner: 'M. Chen',
    dueDate: '2024-03-28',
    dueDateLabel: 'Thu Mar 28',
    evidenceGapId: 'eg-1',
    evidenceGapLabel: 'Arrival date conflict — border entry stamp partially legible',
    whyMatters:
      'The arrival date discrepancy between d-1 (Employment Offer Letter) and d-3 (Border Entry Stamp) remains unresolved. This conflict blocks the non-punishment timeline from completing and is currently holding the export gate. A legible copy of p.1 of d-3 is the critical path item.',
    sourceType: 'Evidence Gap',
    notes: 'Document request submitted to issuing authority. Estimated 3–5 business days. Chasing with coordinator.',
  },
  {
    id: 'ct-6',
    title: 'Document why wage payment records cannot be obtained',
    priority: 'medium',
    status: 'blocked',
    owner: 'M. Chen',
    dueDate: '2024-03-29',
    dueDateLabel: 'Fri Mar 29',
    evidenceGapId: 'eg-3',
    evidenceGapLabel: 'Wage records absent — compelled labour claim unsupported',
    whyMatters:
      'The absence of wage records weakens the compelled labour claim. If records genuinely cannot be obtained, this limitation must be formally documented before export — including the reason, who was contacted, and any corroborating context. Without this documentation, reviewers cannot assess the evidentiary weight of the gap.',
    sourceType: 'Evidence Gap',
    blockerExplanation:
      'Waiting on legal team guidance regarding third-party disclosure request options. Request sent 2024-03-22 — no response after 3 business days. Task cannot proceed without clarity on whether a disclosure request is viable.',
    notes: 'Legal team consultation required before any outreach to former employer or payroll contact.',
  },
  {
    id: 'ct-9',
    title: 'Verify interpreter confirmed for upcoming hearing',
    priority: 'high',
    status: 'completed',
    owner: 'J. Okafor',
    dueDate: '2024-03-22',
    dueDateLabel: 'Fri Mar 22',
    evidenceGapId: 'un-2',
    evidenceGapLabel: 'Interpreter availability — hearing language access',
    whyMatters:
      'Hearing access for non-English-speaking clients is a procedural requirement and a trauma-informed practice standard. Confirmation of interpreter prevents last-minute disruption and supports client dignity throughout the process.',
    sourceType: 'Urgent Need',
    notes: 'Interpreter confirmed: Tagalog, in-person. Booking reference recorded in case file.',
  },
];

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; chip: string; dot: string; row: string; detail: string }> = {
  urgent:      { label: 'Urgent',      chip: 'bg-red-50 text-red-700 border-red-200',     dot: 'bg-red-500',   row: 'border-red-200 bg-red-50/30',   detail: 'bg-red-50 border-red-200 text-red-700' },
  'in-progress':{ label: 'In Progress', chip: 'bg-blue-50 text-blue-700 border-blue-200',  dot: 'bg-blue-500',  row: 'border-border bg-card',          detail: 'bg-blue-50 border-blue-200 text-blue-700' },
  blocked:     { label: 'Blocked',     chip: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', row: 'border-orange-200 bg-orange-50/20', detail: 'bg-orange-50 border-orange-200 text-orange-700' },
  completed:   { label: 'Completed',   chip: 'bg-teal-50 text-teal-700 border-teal-200',  dot: 'bg-teal-500',  row: 'border-border bg-muted/30 opacity-75', detail: 'bg-teal-50 border-teal-200 text-teal-700' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50 border-red-200' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

type FilterKey = 'all' | 'urgent' | 'in-progress' | 'blocked' | 'completed';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'urgent',      label: 'Urgent' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'blocked',     label: 'Blocked' },
  { key: 'completed',   label: 'Completed' },
];

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  urgent:       <AlertTriangle className="w-3.5 h-3.5" />,
  'in-progress': <Loader2 className="w-3.5 h-3.5" />,
  blocked:      <XCircle className="w-3.5 h-3.5" />,
  completed:    <CheckCircle2 className="w-3.5 h-3.5" />,
};

// ── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm border", color)}>
      {icon}
      <span className="text-xl font-bold font-mono leading-none">{count}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CaseTasks() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedId, setSelectedId] = useState<string>(TASKS[0].id);

  const filtered = activeFilter === 'all' ? TASKS : TASKS.filter(t => t.status === activeFilter);
  const selected = filtered.find(t => t.id === selectedId) ?? filtered[0] ?? TASKS[0];

  const counts = {
    urgent:      TASKS.filter(t => t.status === 'urgent').length,
    inProgress:  TASKS.filter(t => t.status === 'in-progress').length,
    blocked:     TASKS.filter(t => t.status === 'blocked').length,
    completed:   TASKS.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Case Tasks</h2>
          <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-sm">
            {counts.urgent} URGENT
          </span>
          <span className="text-[10px] font-mono bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-sm">
            {counts.blocked} BLOCKED
          </span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-mono text-muted-foreground hidden lg:block">
            Suggested deadlines require practitioner confirmation
          </p>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" disabled className="h-7 text-xs rounded-sm border-border gap-1.5 opacity-50 cursor-not-allowed">
              <Plus className="w-3 h-3" /> Create Task
            </Button>
            <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-500 border border-slate-300 px-1.5 py-0.5 rounded hidden sm:inline">DEMO ONLY</span>
          </div>
        </div>
      </div>

      {/* ── Status summary bar ── */}
      <div className="bg-muted/30 border-b border-border px-5 py-4 flex items-center gap-3 shrink-0 flex-wrap">
        <SummaryCard
          label="Urgent"
          count={counts.urgent}
          color="bg-red-50 border-y-red-200 border-r-red-200 border-l-4 border-l-red-500 text-red-700 shadow-sm"
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
        />
        <SummaryCard
          label="In Progress"
          count={counts.inProgress}
          color="bg-blue-50 border-y-blue-200 border-r-blue-200 border-l-4 border-l-blue-500 text-blue-700 shadow-sm"
          icon={<Loader2 className="w-4 h-4 text-blue-500" />}
        />
        <SummaryCard
          label="Blocked"
          count={counts.blocked}
          color="bg-orange-50 border-y-orange-200 border-r-orange-200 border-l-4 border-l-orange-500 text-orange-700 shadow-sm"
          icon={<XCircle className="w-4 h-4 text-orange-500" />}
        />
        <SummaryCard
          label="Completed"
          count={counts.completed}
          color="bg-teal-50 border-y-teal-200 border-r-teal-200 border-l-4 border-l-teal-500 text-teal-700 shadow-sm"
          icon={<CheckCircle2 className="w-4 h-4 text-teal-500" />}
        />
        <div className="ml-auto text-[10px] font-mono text-muted-foreground">
          {TASKS.filter(t => t.status !== 'completed').length} OPEN · {TASKS.length} TOTAL
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-1.5 shrink-0 flex-wrap">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mr-1">Filter:</span>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => {
              const newFiltered = f.key === 'all' ? TASKS : TASKS.filter(t => t.status === f.key);
              if (!newFiltered.some(t => t.id === selectedId)) {
                setSelectedId(newFiltered[0]?.id ?? TASKS[0].id);
              }
              setActiveFilter(f.key);
            }}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
              activeFilter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="ml-1.5 text-[9px] opacity-70">
                {TASKS.filter(t => t.status === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Task list */}
        <div className="w-[380px] shrink-0 flex flex-col border-r border-border bg-muted/10 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filtered.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">
                No tasks in this filter.
              </div>
            )}
            {filtered.map(task => {
              const status = STATUS_CONFIG[task.status];
              const priority = PRIORITY_CONFIG[task.priority];
              const isSelected = selectedId === task.id;
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedId(task.id)}
                  className={cn(
                    "p-3.5 rounded-sm border cursor-pointer transition-all border-l-4",
                    task.priority === 'high' ? 'border-l-red-500' : task.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500',
                    isSelected
                      ? "bg-primary/5 border-r-primary/30 border-y-primary/30 shadow-sm"
                      : cn("hover:border-r-foreground/15 hover:border-y-foreground/15", status.row)
                  )}
                >
                  {/* Title row */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", status.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={cn(
                          "text-sm font-medium leading-snug",
                          isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {task.title}
                        </p>
                        <span className={cn(
                          "text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm border shrink-0",
                          priority.color
                        )}>
                          {priority.label}
                        </span>
                      </div>

                      {/* Safety label */}
                      {task.isSafetySensitive && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />
                          <span className="text-[10px] font-mono text-red-600">{task.safetyLabel}</span>
                        </div>
                      )}

                      {/* Meta row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm border flex items-center gap-1",
                          status.chip
                        )}>
                          {STATUS_ICON[task.status]}
                          {status.label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded-sm">
                          {task.sourceType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground pl-4.5 pl-[18px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.dueDateLabel}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />{task.owner}
                    </span>
                    <span className="flex items-center gap-1 ml-auto font-mono text-muted-foreground/70">
                      <Link2 className="w-3 h-3" />{task.evidenceGapId}
                    </span>
                  </div>

                  {/* Blocker banner */}
                  {task.status === 'blocked' && (
                    <div className="mt-2 ml-[18px] flex items-start gap-1.5 bg-orange-50 border border-orange-200 rounded-sm px-2 py-1.5">
                      <XCircle className="w-3 h-3 text-orange-600 shrink-0 mt-0.5" />
                      <span className="text-[10px] font-mono text-orange-700 leading-snug line-clamp-2">
                        {task.blockerExplanation}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Task detail */}
        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pb-24 max-w-2xl space-y-6">

              {/* Status / priority badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm border flex items-center gap-1.5",
                  STATUS_CONFIG[selected.status].chip
                )}>
                  {STATUS_ICON[selected.status]}
                  {STATUS_CONFIG[selected.status].label}
                </span>
                <span className={cn(
                  "text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm border",
                  PRIORITY_CONFIG[selected.priority].color
                )}>
                  {PRIORITY_CONFIG[selected.priority].label} Priority
                </span>
                <span className="text-[10px] font-mono bg-muted border border-border px-2 py-0.5 rounded-sm">
                  {selected.sourceType}
                </span>
                <span className="ml-auto text-[10px] font-mono text-muted-foreground">{selected.id}</span>
              </div>

              {/* Title */}
              <div>
                <h2 className={cn(
                  "text-xl font-bold mb-1 leading-tight",
                  selected.status === 'completed' ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  {selected.title}
                </h2>
                {selected.isSafetySensitive && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-mono text-red-600 font-medium">{selected.safetyLabel}</span>
                  </div>
                )}
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted border border-border rounded-sm p-3">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Owner</div>
                  <div className="text-sm text-foreground font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />{selected.owner}
                  </div>
                </div>
                <div className={cn(
                  "border rounded-sm p-3",
                  selected.status === 'urgent' ? "bg-red-50 border-red-200" : "bg-muted border-border"
                )}>
                  <div className={cn(
                    "text-[10px] font-mono uppercase mb-1",
                    selected.status === 'urgent' ? "text-red-700" : "text-muted-foreground"
                  )}>
                    Due Date
                  </div>
                  <div className={cn(
                    "text-sm font-medium font-mono flex items-center gap-1.5",
                    selected.status === 'urgent' ? "text-red-700" : "text-foreground"
                  )}>
                    <Clock className="w-3.5 h-3.5" />{selected.dueDateLabel}
                    {selected.status === 'urgent' && <AlertTriangle className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <div className="bg-muted border border-border rounded-sm p-3">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Evidence Gap</div>
                  <div className="text-[11px] text-foreground font-mono flex items-start gap-1.5">
                    <Link2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{selected.evidenceGapId}</span>
                  </div>
                </div>
              </div>

              {/* Evidence gap link */}
              <div className="border border-border rounded-sm p-3 flex items-start gap-2.5 bg-muted/30">
                <Link2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase mb-0.5">Related Evidence Gap</div>
                  <p className="text-sm text-foreground">{selected.evidenceGapLabel}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 ml-auto" />
              </div>

              {/* Why this matters */}
              <div className="border border-border rounded-sm overflow-hidden">
                <div className="bg-muted border-b border-border px-4 py-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Why This Matters
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-foreground leading-relaxed">{selected.whyMatters}</p>
                </div>
              </div>

              {/* Blocker explanation */}
              {selected.status === 'blocked' && selected.blockerExplanation && (
                <div className="border border-orange-200 rounded-sm overflow-hidden">
                  <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-700">
                      Blocker — Action Required
                    </span>
                  </div>
                  <div className="px-4 py-3 bg-orange-50/50">
                    <p className="text-sm text-orange-900 leading-relaxed">{selected.blockerExplanation}</p>
                  </div>
                </div>
              )}

              {/* Safety disclosure note */}
              {selected.isSafetySensitive && (
                <div className="border border-amber-200 rounded-sm p-4 text-sm text-amber-900 bg-amber-50 shadow-sm flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="block font-semibold mb-1">Safety-Sensitive Task</strong>
                    This task involves information relevant to the client's immediate safety or wellbeing. Handle with trauma-informed care. Do not record identifying details beyond what is necessary.
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div className="bg-muted border border-border rounded-sm p-4">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Practitioner Notes</div>
                  <p className="text-sm text-foreground leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* Completed visual state */}
              {selected.status === 'completed' && (
                <div className="border border-teal-200 bg-teal-50 rounded-sm p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Task Completed</p>
                    <p className="text-xs text-teal-700 mt-0.5">
                      This task has been marked complete. The related evidence gap or urgent need has been addressed. No further action required unless new information surfaces.
                    </p>
                  </div>
                </div>
              )}

              {/* Deadline disclaimer */}
              <div className="border border-dashed border-border rounded-sm p-3 text-xs text-muted-foreground flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                Suggested deadlines must display their jurisdiction, authority, and verification date. Operational reminders are distinguished from legally prescribed deadlines. Never assert universal legal validity.
              </div>

            </div>
          </div>

          {/* Action bar */}
          <div className="border-t border-border bg-card/95 backdrop-blur-md px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Status:</span>
              <span className={cn(
                "text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm border flex items-center gap-1.5",
                STATUS_CONFIG[selected.status].chip
              )}>
                {STATUS_ICON[selected.status]}
                {STATUS_CONFIG[selected.status].label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted-foreground/70 hidden lg:block italic">Static prototype — no data changes occur</span>
              <Button size="sm" variant="outline" disabled className="h-7 text-xs rounded-sm border-border opacity-50 cursor-not-allowed">
                <ArrowRight className="w-3 h-3 mr-1.5" />Reassign
              </Button>
              <Button size="sm" variant="outline" disabled className="h-7 text-xs rounded-sm border-border opacity-50 cursor-not-allowed">
                Update Status
              </Button>
              {selected.status !== 'completed' && (
                <Button size="sm" disabled className="bg-muted text-muted-foreground text-xs rounded-sm h-7 opacity-50 cursor-not-allowed border border-border">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Mark Completed
                </Button>
              )}
              <span className="text-[9px] font-mono uppercase bg-slate-100 text-slate-500 border border-slate-300 px-1.5 py-0.5 rounded shrink-0">DEMO ONLY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
