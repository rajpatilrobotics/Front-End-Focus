import React, { useState } from 'react';
import { CaseNote, NoteType } from '@/data/mock-case';
import { useCaseContext } from '@/context/CaseContext';
import { FileText, Lock, Share2, Plus, Clock, User, AlertTriangle, Edit3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NOTE_TYPE_CONFIG: Record<NoteType, { label: string; color: string }> = {
  'practitioner-observation': { label: 'Practitioner Observation', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'interview-note':           { label: 'Interview Note',           color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'legal-research':           { label: 'Legal Research',           color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  'safety-note':              { label: 'Safety Note',              color: 'bg-red-50 text-red-700 border-red-200' },
  'referral-note':            { label: 'Referral Note',            color: 'bg-teal-50 text-teal-700 border-teal-200' },
  'review-rationale':         { label: 'Review Rationale',         color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'case-strategy':            { label: 'Case Strategy',            color: 'bg-slate-50 text-slate-700 border-slate-200' },
  'general':                  { label: 'General Note',             color: 'bg-muted text-muted-foreground border-border' },
};

const VISIBILITY_CONFIG = {
  'internal':             { label: 'Internal only',           icon: Lock,    color: 'text-slate-600' },
  'export-eligible':      { label: 'Export-eligible',         icon: FileText, color: 'text-amber-700' },
  'safe-share-eligible':  { label: 'Safe-share eligible',     icon: Share2,  color: 'text-teal-700' },
};

const ALL_TYPES: NoteType[] = ['practitioner-observation', 'interview-note', 'legal-research', 'safety-note', 'referral-note', 'review-rationale', 'case-strategy', 'general'];

export default function CaseNotes() {
  const { state, dispatch } = useCaseContext();
  const notes = state.notes;
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const selected = notes.find(n => n.id === selectedId);

  const filtered = notes.filter(n => filterType === 'all' || n.type === filterType);

  const startEdit = (note: CaseNote) => {
    setEditingContent(note.id);
    setEditValue(note.content);
  };

  const saveEdit = (id: string) => {
    dispatch({ type: 'UPDATE_NOTE', id, patch: { content: editValue, lastEditedAt: new Date().toISOString() } });
    setEditingContent(null);
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground text-sm">Case Notes &amp; Decision Journal</h2>
          <span className="text-[10px] font-mono text-muted-foreground">{notes.length} notes</span>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs rounded-sm border-border gap-1.5">
          <Plus className="w-3 h-3" /> New Note
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2 text-[11px] text-amber-800 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        Notes are practitioner commentary and reasoning. A note never silently becomes a verified fact and is never substituted for accepted evidence.
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — type filter + note list */}
        <div className="w-72 flex flex-col border-r border-border bg-muted/10 overflow-hidden shrink-0">
          {/* Type filter */}
          <div className="p-3 border-b border-border bg-muted/20 shrink-0">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Filter by type</div>
            <div className="space-y-1">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  "w-full text-left text-xs px-2 py-1.5 rounded-sm transition-colors",
                  filterType === 'all' ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                All notes ({notes.length})
              </button>
              {ALL_TYPES.map(t => {
                const count = notes.filter(n => n.type === t).length;
                if (count === 0) return null;
                return (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={cn(
                      "w-full text-left text-xs px-2 py-1.5 rounded-sm transition-colors flex items-center justify-between",
                      filterType === t ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{NOTE_TYPE_CONFIG[t].label}</span>
                    <span className="text-[9px] font-mono bg-muted border border-border px-1 rounded">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm font-mono">No notes of this type.</div>
            )}
            {filtered.map(note => {
              const typeCfg = NOTE_TYPE_CONFIG[note.type];
              const visCfg = VISIBILITY_CONFIG[note.visibility];
              const VisIcon = visCfg.icon;
              return (
                <motion.div
                  layout key={note.id}
                  onClick={() => setSelectedId(note.id)}
                  className={cn(
                    "p-3.5 rounded-sm border cursor-pointer transition-all",
                    selectedId === note.id
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border", typeCfg.color)}>
                      {typeCfg.label}
                    </span>
                    <VisIcon className={cn("w-3 h-3 shrink-0", visCfg.color)} />
                  </div>
                  <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2 mb-1.5">{note.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{note.author}</span>
                    <span className="text-border">·</span>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right — note content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 max-w-3xl space-y-6">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className={cn("text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border", NOTE_TYPE_CONFIG[selected.type].color)}>
                        {NOTE_TYPE_CONFIG[selected.type].label}
                      </span>
                      {(() => {
                        const visCfg = VISIBILITY_CONFIG[selected.visibility];
                        const VisIcon = visCfg.icon;
                        return (
                          <span className={cn("text-[9px] font-mono uppercase flex items-center gap-1 px-2 py-0.5 rounded-sm border border-border bg-muted", visCfg.color)}>
                            <VisIcon className="w-3 h-3" />{visCfg.label}
                          </span>
                        );
                      })()}
                      <span className="text-[9px] font-mono bg-muted border border-border px-2 py-0.5 rounded-sm text-muted-foreground">
                        {selected.isEvidence ? 'Evidence' : 'Commentary — not evidence'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{selected.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{selected.author}</span>
                      <span className="text-border">·</span>
                      <span>Created {new Date(selected.createdAt).toLocaleString()}</span>
                      {selected.lastEditedAt !== selected.createdAt && (
                        <>
                          <span className="text-border">·</span>
                          <span>Edited {new Date(selected.lastEditedAt).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    {editingContent === selected.id ? (
                      <div className="space-y-3">
                        <textarea
                          className="w-full text-sm border border-border rounded-sm p-4 bg-muted resize-none h-48 focus:outline-none focus:border-primary/50 leading-relaxed"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs" onClick={() => saveEdit(selected.id)}>Save</Button>
                          <Button size="sm" variant="outline" className="text-xs border-border" onClick={() => setEditingContent(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="bg-muted border border-border rounded-sm p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap group relative cursor-text"
                        onClick={() => startEdit(selected)}
                      >
                        {selected.content}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Linked items */}
                  {selected.linkedItems.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Linked Case Items</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.linkedItems.map(item => (
                          <span key={item} className="text-[10px] font-mono bg-secondary border border-border px-1.5 py-0.5 rounded text-foreground">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visibility explanation */}
                  <div className="border border-dashed border-border rounded-sm p-4 text-xs text-muted-foreground space-y-1.5">
                    <div className="font-mono text-[10px] uppercase mb-2">Visibility settings</div>
                    <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /><strong>Internal only</strong> — not included in any export without explicit practitioner selection.</div>
                    <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /><strong>Export-eligible</strong> — may be included in a full practitioner handoff if explicitly included.</div>
                    <div className="flex items-center gap-2"><Share2 className="w-3.5 h-3.5" /><strong>Safe-share eligible</strong> — may be included in a minimum-necessary safe share if permitted.</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a note to read
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
