import React, { useState } from 'react';
import { MOCK_TASKS, CaseTask, TaskStatus, TaskSource } from '@/data/mock-case';
import { CheckCircle2, Clock, AlertTriangle, Plus, User, Link2, Filter, ShieldAlert, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  'to-do':      { label: 'To Do',       color: 'bg-slate-50 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
  'in-progress':{ label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  'waiting':    { label: 'Waiting',     color: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400' },
  'blocked':    { label: 'Blocked',     color: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-500' },
  'completed':  { label: 'Completed',   color: 'bg-teal-50 text-teal-700 border-teal-200',       dot: 'bg-teal-500' },
  'cancelled':  { label: 'Cancelled',   color: 'bg-muted text-muted-foreground border-border',   dot: 'bg-muted-foreground/40' },
};

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-600 bg-red-50 border-red-200' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  low:    { label: 'Low',    color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const SOURCE_LABELS: Record<TaskSource, string> = {
  'evidence-gap': 'Evidence Gap',
  'urgent-need': 'Urgent Need',
  'referral': 'Referral',
  'incomplete-masking': 'Incomplete Masking',
  'pending-review': 'Pending Review',
  'missing-document': 'Missing Document',
  'dependency-change': 'Dependency Change',
  'export-blocker': 'Export Blocker',
  'manual': 'Manual',
};

type ViewKey = 'all' | 'to-do' | 'due-soon' | 'overdue' | 'export-blockers' | 'safety' | 'completed';

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: 'all', label: 'All Tasks' },
  { key: 'to-do', label: 'To Do' },
  { key: 'due-soon', label: 'Due Soon' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'export-blockers', label: 'Export Blockers' },
  { key: 'safety', label: 'Safety-Related' },
  { key: 'completed', label: 'Completed' },
];

function isOverdue(task: CaseTask) {
  return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'cancelled';
}
function isDueSoon(task: CaseTask) {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 3 && task.status !== 'completed' && task.status !== 'cancelled';
}

export default function CaseTasks() {
  const [tasks, setTasks] = useState<CaseTask[]>(MOCK_TASKS);
  const [view, setView] = useState<ViewKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_TASKS[0]?.id ?? null);

  const selected = tasks.find(t => t.id === selectedId);

  const filterTasks = (tasks: CaseTask[]) => {
    switch (view) {
      case 'to-do': return tasks.filter(t => t.status === 'to-do' || t.status === 'in-progress' || t.status === 'waiting' || t.status === 'blocked');
      case 'due-soon': return tasks.filter(isDueSoon);
      case 'overdue': return tasks.filter(isOverdue);
      case 'export-blockers': return tasks.filter(t => t.source === 'export-blocker' || t.source === 'incomplete-masking' || t.source === 'pending-review');
      case 'safety': return tasks.filter(t => t.source === 'urgent-need');
      case 'completed': return tasks.filter(t => t.status === 'completed' || t.status === 'cancelled');
      default: return tasks;
    }
  };

  const filteredTasks = filterTasks(tasks);
  const overdueCount = tasks.filter(isOverdue).length;
  const openCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;

  const setStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Case Tasks &amp; Deadline Tracker</h2>
          {overdueCount > 0 && (
            <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-sm">
              {overdueCount} OVERDUE
            </span>
          )}
          <span className="text-[10px] font-mono bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
            {openCount} OPEN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-mono text-muted-foreground">Suggested deadlines require practitioner confirmation</p>
          <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5">
            <Plus className="w-3 h-3" /> Add Task
          </Button>
        </div>
      </div>

      {/* View tabs */}
      <div className="border-b border-border bg-muted/20 px-4 flex items-center gap-0.5 shrink-0 overflow-x-auto">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
              view === v.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {v.label}
            {v.key === 'overdue' && overdueCount > 0 && (
              <span className="ml-1.5 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{overdueCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Task list */}
        <div className="w-[420px] flex flex-col border-r border-border bg-muted/10 overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredTasks.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm font-mono">No tasks in this view.</div>
            )}
            {filteredTasks.map(task => {
              const status = STATUS_CONFIG[task.status];
              const priority = PRIORITY_CONFIG[task.priority];
              const overdue = isOverdue(task);
              return (
                <motion.div
                  layout key={task.id}
                  onClick={() => setSelectedId(task.id)}
                  className={cn(
                    "p-3.5 rounded-sm border cursor-pointer transition-all",
                    selectedId === task.id
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15",
                    overdue && selectedId !== task.id && "border-red-200 bg-red-50/30"
                  )}
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-1.5", status.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-tight", task.status === 'completed' || task.status === 'cancelled' ? "line-through text-muted-foreground" : "text-foreground")}>
                          {task.title}
                        </p>
                        <span className={cn("text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-sm border shrink-0", priority.color)}>
                          {priority.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pl-5">
                    <span className="text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded">{SOURCE_LABELS[task.source]}</span>
                    {task.dueDate && (
                      <span className={cn("flex items-center gap-1", overdue ? "text-red-600 font-medium" : "")}>
                        <Clock className="w-3 h-3" />
                        {overdue ? 'Overdue: ' : ''}{task.dueDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                      <User className="w-3 h-3" />{task.assignee}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Task detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 pb-28 space-y-6 max-w-2xl">
                  {/* Title row */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={cn("text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm border flex items-center gap-1.5", STATUS_CONFIG[selected.status].color)}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CONFIG[selected.status].dot)} />
                        {STATUS_CONFIG[selected.status].label}
                      </span>
                      <span className={cn("text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm border", PRIORITY_CONFIG[selected.priority].color)}>
                        {PRIORITY_CONFIG[selected.priority].label} Priority
                      </span>
                      <span className="text-[10px] font-mono bg-muted border border-border px-2 py-0.5 rounded-sm">
                        {SOURCE_LABELS[selected.source]}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs ml-auto">{selected.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">{selected.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted border border-border rounded-sm p-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Assignee</div>
                      <div className="text-sm text-foreground font-medium flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{selected.assignee}</div>
                    </div>
                    {selected.dueDate && (
                      <div className={cn("border rounded-sm p-3", isOverdue(selected) ? "bg-red-50 border-red-200" : "bg-muted border-border")}>
                        <div className={cn("text-[10px] font-mono uppercase mb-1", isOverdue(selected) ? "text-red-700" : "text-muted-foreground")}>Due Date</div>
                        <div className={cn("text-sm font-medium font-mono flex items-center gap-1.5", isOverdue(selected) ? "text-red-700" : "text-foreground")}>
                          <Clock className="w-3.5 h-3.5" />{selected.dueDate}
                          {isOverdue(selected) && <AlertTriangle className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    )}
                    {selected.linkedItem && (
                      <div className="bg-muted border border-border rounded-sm p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Linked To</div>
                        <div className="text-sm text-foreground font-mono flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />{selected.linkedItem}</div>
                      </div>
                    )}
                  </div>

                  {/* Deadline note */}
                  <div className="border border-dashed border-border rounded-sm p-3 text-xs text-muted-foreground flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    Suggested legal or procedural deadlines must display their jurisdiction, authority, and verification date. User-entered operational reminders are distinguished from legally prescribed deadlines. Never claim universal legal validity.
                  </div>

                  {/* Notes */}
                  {selected.notes && (
                    <div className="bg-muted border border-border rounded-sm p-4">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Notes</div>
                      <p className="text-sm text-foreground">{selected.notes}</p>
                    </div>
                  )}

                  {/* Status history placeholder */}
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-2">Audit History</div>
                    <div className="text-xs text-muted-foreground italic">Audit log entries will appear here as status changes are recorded.</div>
                  </div>
                </div>

                {/* Action bar */}
                <div className="absolute bottom-0 right-0 left-[420px] p-4 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">STATUS:</span>
                      <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm border", STATUS_CONFIG[selected.status].color)}>
                        {STATUS_CONFIG[selected.status].label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="text-xs border border-border rounded-sm px-2 py-1.5 bg-card text-foreground"
                        value={selected.status}
                        onChange={e => setStatus(selected.id, e.target.value as TaskStatus)}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-sm h-8" onClick={() => setStatus(selected.id, 'completed')}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Mark Completed
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a task to review
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
