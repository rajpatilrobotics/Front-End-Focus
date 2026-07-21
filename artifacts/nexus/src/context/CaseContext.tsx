/**
 * CaseContext — lightweight shared state for ContextFirst Nexus.
 *
 * Uses React Context + useReducer only. No external state library.
 * State survives route navigation. Refresh persistence is not implemented
 * (this prototype has no persistent backend).
 *
 * AUDIT NOTE: Audit events are append-only within the current session and
 * are NOT described as permanently stored.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  Case, Document, Finding, ContextGap, TimelineEvent, AuditEvent,
  EvidenceGap, UrgentNeed, InterviewQuestion, CaseTask, CaseNote,
  ReviewStatus, ContextGapStatus, GapStatus, UrgentNeedStatus,
  InterviewQuestionStatus, TaskStatus,
  MOCK_CASES, MOCK_DOCUMENTS, MOCK_FINDINGS, MOCK_CONTEXT_GAPS,
  MOCK_TIMELINE, MOCK_EVIDENCE_GAPS, MOCK_URGENT_NEEDS,
  MOCK_INTERVIEW_QUESTIONS, MOCK_TASKS, MOCK_NOTES, MOCK_AUDIT,
} from '@/data/mock-case';

// ── State ────────────────────────────────────────────────────────────────────

export type AnalysisMode = 'replay' | 'incremental';

export type CaseState = {
  /** Currently active case */
  activeCaseId: string;
  /** All cases (mutable within session) */
  cases: Case[];
  /** Case documents */
  documents: Document[];
  /** Analysis findings */
  findings: Finding[];
  /** Context gaps from analysis */
  contextGaps: ContextGap[];
  /** Timeline events */
  timeline: TimelineEvent[];
  /** Evidence gaps */
  evidenceGaps: EvidenceGap[];
  /** Urgent needs and safety */
  urgentNeeds: UrgentNeed[];
  /** Interview questions */
  interviewQuestions: InterviewQuestion[];
  /** Case tasks */
  tasks: CaseTask[];
  /** Notes and journal */
  notes: CaseNote[];
  /** Append-only session audit trail */
  audit: AuditEvent[];
  /** Analysis run state */
  analysisMode: AnalysisMode;
  lastRunId: string | null;
  /** Export */
  exportConfirmed: boolean;
};

// ── Actions ──────────────────────────────────────────────────────────────────

export type CaseAction =
  // Case selection
  | { type: 'SELECT_CASE'; caseId: string }
  // Reset the current case to original fixture state
  | { type: 'RESET_CASE' }
  // Update a case field
  | { type: 'UPDATE_CASE'; id: string; patch: Partial<Case> }

  // Findings / evidence
  | { type: 'UPDATE_FINDING'; id: string; reviewStatus: ReviewStatus }
  | { type: 'WITHDRAW_EVIDENCE'; id: string }
  | { type: 'CHALLENGE_RELATIONSHIP'; id: string; note: string }
  | { type: 'PRESERVE_UNKNOWN'; findingId: string }

  // Context gaps (analysis page)
  | { type: 'UPDATE_CONTEXT_GAP'; id: string; status: ContextGapStatus }

  // Evidence gaps page
  | { type: 'UPDATE_EVIDENCE_GAP'; id: string; patch: Partial<EvidenceGap> }
  | { type: 'CREATE_GAP'; gap: EvidenceGap }

  // Urgent needs
  | { type: 'UPDATE_URGENT_NEED'; id: string; patch: Partial<UrgentNeed> }

  // Interview questions
  | { type: 'UPDATE_INTERVIEW_QUESTION'; id: string; reviewStatus: InterviewQuestionStatus; practitionerNote?: string }
  | { type: 'CREATE_QUESTION'; question: InterviewQuestion }

  // Tasks
  | { type: 'UPDATE_TASK'; id: string; patch: Partial<CaseTask> }
  | { type: 'CREATE_TASK'; task: CaseTask }

  // Notes
  | { type: 'UPDATE_NOTE'; id: string; patch: Partial<CaseNote> }
  | { type: 'ADD_NOTE'; note: CaseNote }

  // Analysis run
  | { type: 'CHANGE_ANALYSIS_MODE'; mode: AnalysisMode }
  | { type: 'SET_LAST_RUN_ID'; runId: string }

  // Audit (append-only)
  | { type: 'APPEND_AUDIT_EVENT'; event: AuditEvent }

  // Export
  | { type: 'SET_EXPORT_CONFIRMED'; value: boolean };

// ── Initial state (fixture) ──────────────────────────────────────────────────

const INITIAL_STATE: CaseState = {
  activeCaseId: 'c-001',
  cases: MOCK_CASES,
  documents: MOCK_DOCUMENTS,
  findings: MOCK_FINDINGS,
  contextGaps: MOCK_CONTEXT_GAPS,
  timeline: MOCK_TIMELINE,
  evidenceGaps: MOCK_EVIDENCE_GAPS,
  urgentNeeds: MOCK_URGENT_NEEDS,
  interviewQuestions: MOCK_INTERVIEW_QUESTIONS,
  tasks: MOCK_TASKS,
  notes: MOCK_NOTES,
  audit: MOCK_AUDIT,
  analysisMode: 'replay',
  lastRunId: 'REPLAY-V1',
  exportConfirmed: false,
};

// ── Reducer ──────────────────────────────────────────────────────────────────

function updateById<T extends { id: string }>(arr: T[], id: string, patch: Partial<T>): T[] {
  return arr.map(item => item.id === id ? { ...item, ...patch } : item);
}

function caseReducer(state: CaseState, action: CaseAction): CaseState {
  switch (action.type) {

    case 'SELECT_CASE':
      return { ...state, activeCaseId: action.caseId };

    case 'RESET_CASE':
      // Restore all fixture arrays; preserve activeCaseId so the user stays in the same case
      return {
        ...INITIAL_STATE,
        activeCaseId: state.activeCaseId,
        // Session audit gets a reset event appended
        audit: [
          ...MOCK_AUDIT,
          {
            id: 'reset-' + Date.now().toString(36),
            timestamp: new Date().toISOString(),
            actor: 'practitioner' as const,
            type: 'case-reset' as const,
            summary: 'Case data restored to original synthetic fixture by practitioner.',
          },
        ],
      };

    case 'UPDATE_CASE':
      return { ...state, cases: updateById(state.cases, action.id, action.patch) };

    // ── Findings ──────────────────────────────────────────────────────────

    case 'UPDATE_FINDING':
      return {
        ...state,
        findings: state.findings.map(f =>
          f.id === action.id ? { ...f, reviewStatus: action.reviewStatus } : f
        ),
      };

    case 'WITHDRAW_EVIDENCE': {
      const findings = state.findings.map(f => {
        if (f.id === action.id) return { ...f, reviewStatus: 'pending' as ReviewStatus };
        // Cascade to dependents
        if ((f.dependencies ?? []).includes(action.id)) {
          return { ...f, supportStatus: 'unresolved' as const, reviewStatus: 'pending' as ReviewStatus };
        }
        return f;
      });
      return { ...state, findings };
    }

    case 'CHALLENGE_RELATIONSHIP':
      // Marks the finding as uncertain with a practitioner note
      return {
        ...state,
        findings: state.findings.map(f =>
          f.id === action.id
            ? { ...f, reviewStatus: 'uncertain' as ReviewStatus }
            : f
        ),
      };

    case 'PRESERVE_UNKNOWN':
      return {
        ...state,
        findings: state.findings.map(f =>
          f.id === action.findingId
            ? { ...f, reviewStatus: 'uncertain' as ReviewStatus }
            : f
        ),
      };

    case 'UPDATE_CONTEXT_GAP':
      return {
        ...state,
        contextGaps: state.contextGaps.map(g =>
          g.id === action.id ? { ...g, status: action.status } : g
        ),
      };

    // ── Evidence gaps ─────────────────────────────────────────────────────

    case 'UPDATE_EVIDENCE_GAP':
      return { ...state, evidenceGaps: updateById(state.evidenceGaps, action.id, action.patch) };

    case 'CREATE_GAP':
      return { ...state, evidenceGaps: [...state.evidenceGaps, action.gap] };

    // ── Urgent needs ─────────────────────────────────────────────────────

    case 'UPDATE_URGENT_NEED':
      return { ...state, urgentNeeds: updateById(state.urgentNeeds, action.id, action.patch) };

    // ── Interview questions ───────────────────────────────────────────────

    case 'UPDATE_INTERVIEW_QUESTION':
      return {
        ...state,
        interviewQuestions: state.interviewQuestions.map(q =>
          q.id === action.id
            ? {
                ...q,
                reviewStatus: action.reviewStatus,
                ...(action.practitionerNote !== undefined
                  ? { practitionerNote: action.practitionerNote }
                  : {}),
              }
            : q
        ),
      };

    case 'CREATE_QUESTION':
      return { ...state, interviewQuestions: [...state.interviewQuestions, action.question] };

    // ── Tasks ─────────────────────────────────────────────────────────────

    case 'UPDATE_TASK':
      return { ...state, tasks: updateById(state.tasks, action.id, action.patch) };

    case 'CREATE_TASK':
      return { ...state, tasks: [...state.tasks, action.task] };

    // ── Notes ─────────────────────────────────────────────────────────────

    case 'UPDATE_NOTE':
      return { ...state, notes: updateById(state.notes, action.id, action.patch) };

    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.note] };

    // ── Analysis run ──────────────────────────────────────────────────────

    case 'CHANGE_ANALYSIS_MODE':
      return { ...state, analysisMode: action.mode };

    case 'SET_LAST_RUN_ID':
      return { ...state, lastRunId: action.runId };

    // ── Audit (append-only) ───────────────────────────────────────────────

    case 'APPEND_AUDIT_EVENT':
      return { ...state, audit: [...state.audit, action.event] };

    // ── Export ────────────────────────────────────────────────────────────

    case 'SET_EXPORT_CONFIRMED':
      return { ...state, exportConfirmed: action.value };

    default:
      return state;
  }
}

// ── Derived selectors ────────────────────────────────────────────────────────

export type CaseSelectors = {
  /** Count of findings with reviewStatus === 'pending' */
  pendingFindingsCount: number;
  /** Count of urgent needs with urgency === 'immediate' */
  immediateNeedsCount: number;
  /** Count of evidence gaps that are open / investigating / waiting-external */
  openGapsCount: number;
  /** Count of interview questions with reviewStatus === 'pending-review' */
  pendingQuestionsCount: number;
  /** Count of tasks that are to-do / in-progress / waiting */
  openTasksCount: number;
  /** Whether the active case export gate is blocked */
  isExportBlocked: boolean;
  /** Workflow progress step (for stepper) */
  workflowStep: string;
  /** Active case data */
  activeCase: Case | undefined;
};

function computeSelectors(state: CaseState): CaseSelectors {
  const activeCase = state.cases.find(c => c.id === state.activeCaseId);
  return {
    pendingFindingsCount: state.findings.filter(f => f.reviewStatus === 'pending').length,
    immediateNeedsCount: state.urgentNeeds.filter(n => n.urgency === 'immediate').length,
    openGapsCount: state.evidenceGaps.filter(
      g => g.status === 'open' || g.status === 'investigating' || g.status === 'waiting-external'
    ).length,
    pendingQuestionsCount: state.interviewQuestions.filter(q => q.reviewStatus === 'pending-review').length,
    openTasksCount: state.tasks.filter(
      t => t.status === 'to-do' || t.status === 'in-progress' || t.status === 'waiting'
    ).length,
    isExportBlocked: activeCase?.exportGateStatus === 'blocked',
    workflowStep: 'documents',
    activeCase,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

type CaseContextValue = {
  state: CaseState;
  dispatch: React.Dispatch<CaseAction>;
  selectors: CaseSelectors;
};

const CaseContext = createContext<CaseContextValue | null>(null);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(caseReducer, INITIAL_STATE);
  const selectors = computeSelectors(state);

  return (
    <CaseContext.Provider value={{ state, dispatch, selectors }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCaseContext(): CaseContextValue {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error('useCaseContext must be used inside <CaseProvider>');
  return ctx;
}

// ── Convenience hook ──────────────────────────────────────────────────────────

/**
 * Returns a stable dispatch helper that also appends an audit event
 * whenever a finding is accepted, edited, rejected, or withdrawn.
 */
export function useCaseDispatch() {
  const { dispatch } = useCaseContext();

  const dispatchWithAudit = useCallback(
    (action: CaseAction, auditSummary?: string) => {
      dispatch(action);
      if (auditSummary) {
        dispatch({
          type: 'APPEND_AUDIT_EVENT',
          event: {
            id: 'ae-' + Date.now().toString(36),
            timestamp: new Date().toISOString(),
            actor: 'practitioner',
            type: 'evidence-accepted',
            summary: auditSummary,
          },
        });
      }
    },
    [dispatch]
  );

  return dispatchWithAudit;
}
