export type EvidenceNature = 'documented' | 'reported' | 'reviewer-supplied' | 'unknown';
export type Origin = 'source-extraction' | 'ai-suggestion' | 'human-created';
export type SupportStatus = 'supported' | 'partially-supported' | 'conflicting' | 'insufficient' | 'unresolved' | 'not-processed';
export type ReviewStatus = 'pending' | 'accepted' | 'edited' | 'rejected' | 'uncertain' | 'invalidated';
export type ReviewLane = 'A' | 'B' | 'C';
export type ContextGapStatus = 'unanswered' | 'answered' | 'deferred' | 'unknown' | 'out-of-scope';

export type Case = {
  id: string;
  refId: string;
  practitioner: string;
  documentCount: number;
  analysisReadiness: 'ready' | 'pending';
  exportGateStatus: 'blocked' | 'ready';
  lastActivity: string;
  status: 'open' | 'closed';
};

export type Document = {
  id: string;
  type: string;
  fileName: string;
  pageCount: number;
  coveragePercentage: number;
  extractionStatus: 'complete' | 'partial' | 'failed';
  language: string;
  maskingStatus: 'masked' | 'unmasked' | 'pending';
  pages: { page: number; status: 'processed' | 'missing' | 'unreadable' | 'image-only' | 'excluded' | 'extraction-failed' | 'segment-mismatch' }[];
  canonicalSegments?: number;
};

export type Citation = {
  documentId: string;
  page: number;
  segment?: string;
  text: string;
  sourceAuthority?: string;
  language?: string;
  translationStatus?: 'original' | 'translated' | 'partial' | 'unknown';
  extractionQuality?: 'high' | 'medium' | 'low';
  validationStatus?: 'verified' | 'unverified' | 'disputed';
  limitations?: string;
};

export type Finding = {
  id: string;
  lane: ReviewLane;
  type: 'event' | 'relationship' | 'coercion' | 'compelled-task' | 'timeline-link' | 'contradiction' | 'evidence-gap' | 'protection-urgency';
  title: string;
  description: string;
  evidenceNature: EvidenceNature;
  origin: Origin;
  supportStatus: SupportStatus;
  reviewStatus: ReviewStatus;
  citations: Citation[];
  contradictions?: string[];
  missingContext?: string[];
  dependencies?: string[];
};

export type ContextGap = {
  id: string;
  question: string;
  category: string;
  relatedFindingIds: string[];
  status: ContextGapStatus;
  answer?: string;
};

export type TimelineEvent = {
  id: string;
  description: string;
  date: string;
  dateEnd?: string;
  dateType: 'exact' | 'approximate' | 'unknown' | 'range';
  dateConflict: boolean;
  evidenceNature: EvidenceNature;
  supportStatus: SupportStatus;
  reviewStatus: ReviewStatus;
  citation: Citation;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: 'practitioner' | 'system';
  type: 'purpose-saved' | 'evidence-accepted' | 'evidence-edited' | 'evidence-rejected' | 'evidence-withdrawn' | 'dependency-recalculation' | 'sensitive-reveal' | 'export-evaluated' | 'handoff-created' | 'analysis-run' | 'mask-reviewed' | 'case-reset';
  summary: string;
};

// ── Feature Types ───────────────────────────────────────────────────────────

export type GapStatus = 'open' | 'investigating' | 'waiting-external' | 'partially-resolved' | 'resolved' | 'unable-to-resolve' | 'outside-scope';

export type EvidenceGap = {
  id: string;
  title: string;
  whyMatters: string;
  relatedFindingIds: string[];
  sourceDocumentIds: string[];
  evidenceStatus: 'missing' | 'conflicting' | 'insufficient';
  consequence: string;
  suggestedActions: { id: string; label: string; convertedToTask?: boolean }[];
  responsiblePerson: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  status: GapStatus;
  practitionerNotes?: string;
  resolutionEvidence?: string;
  auditHistory: { timestamp: string; actor: string; action: string }[];
};

export type UrgentNeedUrgency = 'immediate' | 'within-24h' | 'within-72h' | 'ongoing';
export type UrgentNeedStatus = 'newly-recorded' | 'confirming' | 'action-required' | 'referral-offered' | 'referral-accepted' | 'referral-declined' | 'in-progress' | 'completed' | 'unable-to-complete';

export type UrgentNeed = {
  id: string;
  category: string;
  description: string;
  urgency: UrgentNeedUrgency;
  source: 'practitioner-observation' | 'person-reported' | 'document-supported' | 'unknown';
  consentRestrictions?: string;
  safeContactMethod?: string;
  assignedPractitioner: string;
  actionRequired: string;
  referral?: string;
  followUpTime?: string;
  status: UrgentNeedStatus;
  notes?: string;
  auditHistory?: { timestamp: string; actor: string; action: string }[];
};

export type InterviewQuestionStatus = 'pending-review' | 'kept' | 'edited' | 'removed' | 'deferred' | 'inappropriate';

export type InterviewQuestion = {
  id: string;
  questionText: string;
  addressesGapId?: string;
  relatedFindingId?: string;
  citations?: string[];
  reason: string;
  sensitivityNote: string;
  reviewStatus: InterviewQuestionStatus;
  practitionerNote?: string;
};

export type TaskStatus = 'to-do' | 'in-progress' | 'waiting' | 'blocked' | 'completed' | 'cancelled';
export type TaskSource = 'evidence-gap' | 'urgent-need' | 'referral' | 'incomplete-masking' | 'pending-review' | 'missing-document' | 'dependency-change' | 'export-blocker' | 'manual';

export type CaseTask = {
  id: string;
  title: string;
  description: string;
  linkedItem?: string;
  source: TaskSource;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  status: TaskStatus;
  dependencies?: string[];
  reminder?: string;
  notes?: string;
  completionEvidence?: string;
  auditHistory?: { timestamp: string; actor: string; action: string }[];
};

export type NoteType = 'practitioner-observation' | 'interview-note' | 'legal-research' | 'safety-note' | 'referral-note' | 'review-rationale' | 'case-strategy' | 'general';

export type CaseNote = {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  lastEditedAt: string;
  visibility: 'internal' | 'export-eligible' | 'safe-share-eligible';
  linkedItems: string[];
  isEvidence: boolean;
};

// ── Synthetic Data ──────────────────────────────────────────────────────────

export const MOCK_CASES: Case[] = [
  {
    id: 'c-001',
    refId: 'REF-2024-0047-SYN',
    practitioner: 'M. Chen',
    documentCount: 7,
    analysisReadiness: 'ready',
    exportGateStatus: 'blocked',
    lastActivity: '2024-03-24T10:30:00Z',
    status: 'open'
  },
  {
    id: 'c-002',
    refId: 'REF-2024-0082-SYN',
    practitioner: 'A. Kumar',
    documentCount: 12,
    analysisReadiness: 'pending',
    exportGateStatus: 'blocked',
    lastActivity: '2024-03-23T15:45:00Z',
    status: 'open'
  },
  {
    id: 'c-003',
    refId: 'REF-2024-0091-SYN',
    practitioner: 'M. Chen',
    documentCount: 3,
    analysisReadiness: 'ready',
    exportGateStatus: 'ready',
    lastActivity: '2024-03-22T09:15:00Z',
    status: 'open'
  }
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd-1',
    type: 'Contract',
    fileName: 'Employment Offer Letter.pdf',
    pageCount: 4,
    coveragePercentage: 100,
    extractionStatus: 'complete',
    language: 'English',
    maskingStatus: 'masked',
    canonicalSegments: 6,
    pages: [
      { page: 1, status: 'processed' },
      { page: 2, status: 'processed' },
      { page: 3, status: 'processed' },
      { page: 4, status: 'processed' },
    ]
  },
  {
    id: 'd-2',
    type: 'Communication',
    fileName: 'Recruiter Communication Log.pdf',
    pageCount: 12,
    coveragePercentage: 83,
    extractionStatus: 'partial',
    language: 'Mixed (En/Es)',
    maskingStatus: 'masked',
    canonicalSegments: 8,
    pages: [
      { page: 1, status: 'processed' },
      { page: 2, status: 'unreadable' },
      { page: 3, status: 'unreadable' },
      { page: 4, status: 'processed' },
      { page: 5, status: 'processed' },
    ]
  },
  {
    id: 'd-3',
    type: 'Travel',
    fileName: 'Travel Record.pdf',
    pageCount: 6,
    coveragePercentage: 100,
    extractionStatus: 'complete',
    language: 'English',
    maskingStatus: 'masked',
    canonicalSegments: 4,
    pages: [
      { page: 1, status: 'processed' },
      { page: 2, status: 'processed' },
    ]
  },
  {
    id: 'd-4',
    type: 'Log',
    fileName: 'Operational Task Log.pdf',
    pageCount: 8,
    coveragePercentage: 100,
    extractionStatus: 'complete',
    language: 'English',
    maskingStatus: 'masked',
    canonicalSegments: 5,
    pages: [
      { page: 1, status: 'processed' },
      { page: 2, status: 'processed' },
    ]
  },
  {
    id: 'd-5',
    type: 'Notes',
    fileName: 'Support Provider Notes.pdf',
    pageCount: 5,
    coveragePercentage: 100,
    extractionStatus: 'complete',
    language: 'English',
    maskingStatus: 'pending',
    canonicalSegments: 3,
    pages: [
      { page: 1, status: 'processed' },
      { page: 2, status: 'processed' },
      { page: 3, status: 'processed' },
    ]
  },
  {
    id: 'd-6',
    type: 'Legal',
    fileName: 'Immigration Status Document.pdf',
    pageCount: 3,
    coveragePercentage: 67,
    extractionStatus: 'partial',
    language: 'English',
    maskingStatus: 'masked',
    canonicalSegments: 2,
    pages: [
      { page: 1, status: 'processed' },
      { page: 2, status: 'missing' },
      { page: 3, status: 'processed' },
    ]
  },
  {
    id: 'd-7',
    type: 'Financial',
    fileName: 'Wage Deduction Records.pdf',
    pageCount: 2,
    coveragePercentage: 50,
    extractionStatus: 'partial',
    language: 'English',
    maskingStatus: 'masked',
    canonicalSegments: 0,
    pages: [
      { page: 1, status: 'image-only' },
      { page: 2, status: 'extraction-failed' },
    ]
  }
];

export const MOCK_FINDINGS: Finding[] = [
  {
    id: 'f-1',
    lane: 'A',
    type: 'coercion',
    title: 'Passport Retention',
    description: 'Employer withheld travel documents upon arrival, removing subject\'s means of independent departure.',
    evidenceNature: 'documented',
    origin: 'source-extraction',
    supportStatus: 'supported',
    reviewStatus: 'accepted',
    citations: [{
      documentId: 'd-2', page: 5, segment: 'SEG-D2-05-A',
      text: '[REDACTED] requested original passport for "safekeeping" on day of arrival.',
      sourceAuthority: 'Recruiter Communication Log',
      language: 'English',
      translationStatus: 'original',
      extractionQuality: 'high',
      validationStatus: 'verified',
    }],
    dependencies: ['f-5', 'f-6']
  },
  {
    id: 'f-2',
    lane: 'A',
    type: 'relationship',
    title: 'Recruitment Fee Debt',
    description: 'Subject incurred ongoing debt to recruiter via wage deductions, creating economic dependency.',
    evidenceNature: 'documented',
    origin: 'ai-suggestion',
    supportStatus: 'supported',
    reviewStatus: 'accepted',
    citations: [{
      documentId: 'd-1', page: 2, segment: 'SEG-D1-02-B',
      text: 'Deduction of $400/month for initial placement fee will be applied to first 6 months of wages.',
      sourceAuthority: 'Employment Offer Letter',
      language: 'English',
      translationStatus: 'original',
      extractionQuality: 'high',
      validationStatus: 'verified',
    }]
  },
  {
    id: 'f-3',
    lane: 'A',
    type: 'compelled-task',
    title: 'Excessive Unpaid Hours',
    description: 'Subject required to work beyond contracted hours without compensation or option to refuse.',
    evidenceNature: 'reported',
    origin: 'ai-suggestion',
    supportStatus: 'supported',
    reviewStatus: 'accepted',
    citations: [{
      documentId: 'd-4', page: 1, segment: 'SEG-D4-01-A',
      text: 'Shift extended by 6 hours, no overtime recorded.',
      sourceAuthority: 'Operational Task Log',
      language: 'English',
      translationStatus: 'original',
      extractionQuality: 'medium',
      validationStatus: 'verified',
      limitations: 'Log is self-reported by supervisor; independent verification absent.'
    }]
  },
  {
    id: 'f-4',
    lane: 'A',
    type: 'coercion',
    title: 'Threats of Deportation',
    description: 'Supervisor leveraged immigration status to compel compliance with work demands.',
    evidenceNature: 'reported',
    origin: 'ai-suggestion',
    supportStatus: 'partially-supported',
    reviewStatus: 'pending',
    citations: [{
      documentId: 'd-2', page: 8, segment: 'SEG-D2-08-C',
      text: '"If you leave, ICE will be notified immediately."',
      sourceAuthority: 'Recruiter Communication Log',
      language: 'Mixed (En/Es)',
      translationStatus: 'translated',
      extractionQuality: 'medium',
      validationStatus: 'unverified',
      limitations: 'Pages 2–3 of source document are unreadable; context may be incomplete.'
    }]
  },
  {
    id: 'f-5',
    lane: 'A',
    type: 'coercion',
    title: 'Isolation from Support Networks',
    description: 'Subject prohibited from contacting family or leaving premises unescorted.',
    evidenceNature: 'reviewer-supplied',
    origin: 'human-created',
    supportStatus: 'insufficient',
    reviewStatus: 'pending',
    citations: [{
      documentId: 'd-5', page: 2, segment: 'SEG-D5-02-A',
      text: 'Client stated they were not allowed out of the housing facility.',
      sourceAuthority: 'Support Provider Notes',
      language: 'English',
      translationStatus: 'original',
      extractionQuality: 'low',
      validationStatus: 'unverified',
      limitations: 'Single-source; no corroborating documentation found.'
    }]
  },
  {
    id: 'f-6',
    lane: 'B',
    type: 'contradiction',
    title: 'Arrival Date Discrepancy',
    description: 'Travel record contradicts employment contract start date by 45 days — timing affects non-punishment assessment.',
    evidenceNature: 'documented',
    origin: 'ai-suggestion',
    supportStatus: 'conflicting',
    reviewStatus: 'pending',
    citations: [
      {
        documentId: 'd-1', page: 1, segment: 'SEG-D1-01-A',
        text: 'Start Date: October 1, 2023',
        sourceAuthority: 'Employment Offer Letter',
        language: 'English', translationStatus: 'original',
        extractionQuality: 'high', validationStatus: 'verified',
      },
      {
        documentId: 'd-3', page: 1, segment: 'SEG-D3-01-A',
        text: 'Entry stamped: November 15, 2023',
        sourceAuthority: 'Travel Record',
        language: 'English', translationStatus: 'original',
        extractionQuality: 'high', validationStatus: 'verified',
      }
    ],
    contradictions: [
      'Contract states employment began Oct 1; border entry stamped Nov 15 — a 45-day gap with no documented explanation.',
      'Gap period activities are not covered by any document in the current case packet.'
    ]
  },
  {
    id: 'f-7',
    lane: 'C',
    type: 'protection-urgency',
    title: 'Imminent Housing Loss',
    description: 'Subject faces eviction within 48 hours. No alternative housing or referral documented.',
    evidenceNature: 'reported',
    origin: 'source-extraction',
    supportStatus: 'supported',
    reviewStatus: 'pending',
    citations: [{
      documentId: 'd-5', page: 4, segment: 'SEG-D5-04-A',
      text: 'Eviction notice served, effective Friday.',
      sourceAuthority: 'Support Provider Notes',
      language: 'English', translationStatus: 'original',
      extractionQuality: 'high', validationStatus: 'verified',
    }]
  },
  {
    id: 'f-8',
    lane: 'B',
    type: 'evidence-gap',
    title: 'Missing Payment Records',
    description: 'No documentation of actual wages received versus contracted amount. Debt calculation cannot be verified.',
    evidenceNature: 'unknown',
    origin: 'ai-suggestion',
    supportStatus: 'not-processed',
    reviewStatus: 'rejected',
    citations: [],
    missingContext: ['Wage stubs or bank transfer records', 'Employer payroll documentation', 'Third-party financial records']
  },
  {
    id: 'f-9',
    lane: 'B',
    type: 'timeline-link',
    title: 'Alleged Conduct Timing vs. Control Period',
    description: 'Alleged conduct in the case charge occurs during the documented control period — relevant to non-punishment assessment. Domestic legal verification required.',
    evidenceNature: 'documented',
    origin: 'ai-suggestion',
    supportStatus: 'partially-supported',
    reviewStatus: 'pending',
    citations: [{
      documentId: 'd-4', page: 3, segment: 'SEG-D4-03-B',
      text: 'Task assigned 2025-04-02. Subject confirmed receipt.',
      sourceAuthority: 'Operational Task Log',
      language: 'English', translationStatus: 'original',
      extractionQuality: 'medium', validationStatus: 'unverified',
      limitations: 'This is a candidate overlap indication only. Legal determination requires qualified domestic counsel.'
    }],
    dependencies: ['f-3', 'f-1']
  },
  {
    id: 'f-10',
    lane: 'C',
    type: 'protection-urgency',
    title: 'No Interpreter Confirmed',
    description: 'Upcoming hearing date identified with no interpreter arrangement documented. Source language includes Spanish.',
    evidenceNature: 'reported',
    origin: 'human-created',
    supportStatus: 'insufficient',
    reviewStatus: 'pending',
    citations: [{
      documentId: 'd-5', page: 5, segment: 'SEG-D5-05-A',
      text: 'Hearing scheduled for [REDACTED_DATE]. Language support: pending.',
      sourceAuthority: 'Support Provider Notes',
      language: 'English', translationStatus: 'original',
      extractionQuality: 'high', validationStatus: 'unverified',
    }]
  }
];

export const MOCK_CONTEXT_GAPS: ContextGap[] = [
  {
    id: 'cg-1',
    question: 'Which arrival date is supported by independent evidence: October 1 or November 15, 2023?',
    category: 'Chronology',
    relatedFindingIds: ['f-6'],
    status: 'unanswered'
  },
  {
    id: 'cg-2',
    question: 'Is the task log\'s provenance independently verifiable — or is it self-reported by the employer?',
    category: 'Source Authority',
    relatedFindingIds: ['f-3', 'f-9'],
    status: 'deferred'
  },
  {
    id: 'cg-3',
    question: 'Has an interpreter been confirmed for the upcoming hearing?',
    category: 'Procedural Urgency',
    relatedFindingIds: ['f-10'],
    status: 'unanswered'
  },
  {
    id: 'cg-4',
    question: 'Is document custody for the passport independently supported beyond the subject\'s own statement?',
    category: 'Evidence Corroboration',
    relatedFindingIds: ['f-1', 'f-5'],
    status: 'unknown'
  },
  {
    id: 'cg-5',
    question: 'Are there payment records in any form that could verify or refute the wage deduction claim?',
    category: 'Missing Evidence',
    relatedFindingIds: ['f-2', 'f-8'],
    status: 'out-of-scope'
  }
];

export const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: 't-1',
    description: 'Employment contract signed in home country.',
    date: '2023-09-15',
    dateType: 'exact',
    dateConflict: false,
    evidenceNature: 'documented',
    supportStatus: 'supported',
    reviewStatus: 'accepted',
    citation: { documentId: 'd-1', page: 4, text: 'Signed: 15 Sep 2023', sourceAuthority: 'Employment Offer Letter', language: 'English', translationStatus: 'original', extractionQuality: 'high', validationStatus: 'verified' }
  },
  {
    id: 't-2',
    description: 'Arrived in destination country (date conflict with contract start).',
    date: '2023-11-15',
    dateType: 'exact',
    dateConflict: true,
    evidenceNature: 'documented',
    supportStatus: 'conflicting',
    reviewStatus: 'pending',
    citation: { documentId: 'd-3', page: 1, text: 'Entry stamped: Nov 15', sourceAuthority: 'Travel Record', language: 'English', translationStatus: 'original', extractionQuality: 'high', validationStatus: 'verified' }
  },
  {
    id: 't-3',
    description: 'Passport confiscated by supervisor upon arrival.',
    date: '2023-11-15',
    dateType: 'approximate',
    dateConflict: false,
    evidenceNature: 'reported',
    supportStatus: 'partially-supported',
    reviewStatus: 'pending',
    citation: { documentId: 'd-2', page: 5, text: 'Took passport on first day', sourceAuthority: 'Recruiter Communication Log', language: 'English', translationStatus: 'original', extractionQuality: 'medium', validationStatus: 'unverified' }
  },
  {
    id: 't-4',
    description: 'Alleged task assigned during documented control period.',
    date: '2025-04-02',
    dateType: 'exact',
    dateConflict: false,
    evidenceNature: 'documented',
    supportStatus: 'partially-supported',
    reviewStatus: 'pending',
    citation: { documentId: 'd-4', page: 3, text: 'Task assigned 2025-04-02. Subject confirmed receipt.', sourceAuthority: 'Operational Task Log', language: 'English', translationStatus: 'original', extractionQuality: 'medium', validationStatus: 'unverified', limitations: 'Self-reported by supervisor' }
  },
  {
    id: 't-5',
    description: 'First altercation reported (date unknown).',
    date: 'unknown',
    dateType: 'unknown',
    dateConflict: false,
    evidenceNature: 'reported',
    supportStatus: 'insufficient',
    reviewStatus: 'pending',
    citation: { documentId: 'd-5', page: 3, text: 'Client mentioned being pushed by manager early on.', sourceAuthority: 'Support Provider Notes', language: 'English', translationStatus: 'original', extractionQuality: 'low', validationStatus: 'unverified' }
  },
  {
    id: 't-6',
    description: 'Excessive unpaid overtime period — shift extensions recorded across multiple weeks.',
    date: '2024-01-10',
    dateEnd: '2024-02-28',
    dateType: 'range',
    dateConflict: false,
    evidenceNature: 'documented',
    supportStatus: 'partially-supported',
    reviewStatus: 'pending',
    citation: { documentId: 'd-4', page: 2, text: 'Repeated shift extension entries between Jan 10 and Feb 28.', sourceAuthority: 'Operational Task Log', language: 'English', translationStatus: 'original', extractionQuality: 'medium', validationStatus: 'unverified', limitations: 'Log is self-reported by supervisor; dates may not be precise.' }
  }
];

export const MOCK_EVIDENCE_GAPS: EvidenceGap[] = [
  {
    id: 'eg-1',
    title: 'Arrival date cannot be reconciled between contract and travel record',
    whyMatters: 'The 45-day gap between the contract start date and the border entry stamp is unexplained. Activities during this period are undocumented and may be relevant to the control timeline.',
    relatedFindingIds: ['f-6', 'f-1'],
    sourceDocumentIds: ['d-1', 'd-3'],
    evidenceStatus: 'conflicting',
    consequence: 'Non-punishment timeline assessment cannot be completed. Export gate blocked.',
    suggestedActions: [
      { id: 'sa-1', label: 'Request clearer copy of travel record page 1', convertedToTask: true },
      { id: 'sa-2', label: 'Verify border entry stamp with independent record' },
      { id: 'sa-3', label: 'Ask non-leading follow-up about the period between contract signing and travel' },
    ],
    responsiblePerson: 'M. Chen',
    priority: 'high',
    dueDate: '2024-04-01',
    status: 'investigating',
    practitionerNotes: 'Client mentioned transit through a third country but no documentation obtained.',
    auditHistory: [
      { timestamp: '2024-03-24T09:00:00Z', actor: 'system', action: 'Gap identified from conflicting citations in f-6' },
      { timestamp: '2024-03-24T10:00:00Z', actor: 'M. Chen', action: 'Status set to Investigating. Note added.' },
    ],
  },
  {
    id: 'eg-2',
    title: 'Passport retention independently corroborated by only one source',
    whyMatters: 'Passport retention is a central coercion indicator. The only citation is from the recruiter communication log; no physical custody record or independent witness account exists.',
    relatedFindingIds: ['f-1', 'f-5'],
    sourceDocumentIds: ['d-2', 'd-5'],
    evidenceStatus: 'insufficient',
    consequence: 'Finding f-1 support status may need to be downgraded. Nexus dependency chain affected.',
    suggestedActions: [
      { id: 'sa-4', label: 'Request any written receipt or acknowledgement of document custody' },
      { id: 'sa-5', label: 'Compare support provider notes for corroborating reference' },
      { id: 'sa-6', label: 'Record why additional corroboration cannot be obtained if none exists' },
    ],
    responsiblePerson: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-30',
    status: 'open',
    auditHistory: [
      { timestamp: '2024-03-24T09:05:00Z', actor: 'system', action: 'Gap identified: insufficient corroboration for f-1' },
    ],
  },
  {
    id: 'eg-3',
    title: 'Wage payment records entirely absent',
    whyMatters: 'Without payment records, the recruitment fee debt calculation in f-2 cannot be independently verified. Debt servitude claim is partially supported at best.',
    relatedFindingIds: ['f-2', 'f-8'],
    sourceDocumentIds: ['d-7'],
    evidenceStatus: 'missing',
    consequence: 'f-2 and f-8 remain partially supported or unprocessed. Export may require limitation statement.',
    suggestedActions: [
      { id: 'sa-7', label: 'Request bank transfer records or wage stubs from relevant period' },
      { id: 'sa-8', label: 'Request employer payroll documentation via legal process if available' },
      { id: 'sa-9', label: 'Record why wage records cannot be obtained' },
    ],
    responsiblePerson: 'M. Chen',
    priority: 'medium',
    status: 'open',
    auditHistory: [
      { timestamp: '2024-03-24T09:10:00Z', actor: 'system', action: 'Gap identified: no wage records in case packet' },
    ],
  },
  {
    id: 'eg-4',
    title: 'Interpreter status for upcoming hearing unconfirmed',
    whyMatters: 'A hearing date has been identified without confirmed interpreter access. Source documents include Spanish-language content.',
    relatedFindingIds: ['f-10'],
    sourceDocumentIds: ['d-5'],
    evidenceStatus: 'missing',
    consequence: 'Procedural urgency finding f-10 remains unresolved. Hearing readiness at risk.',
    suggestedActions: [
      { id: 'sa-10', label: 'Verify interpreter availability with court/hearing authority' },
      { id: 'sa-11', label: 'Confirm language(s) required with client if safe to do so' },
    ],
    responsiblePerson: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-27',
    status: 'open',
    practitionerNotes: 'Hearing date is redacted. Confirm date before interpreter request.',
    auditHistory: [
      { timestamp: '2024-03-24T09:15:00Z', actor: 'system', action: 'Gap linked to f-10 (interpreter not confirmed)' },
    ],
  },
];

export const MOCK_URGENT_NEEDS: UrgentNeed[] = [
  {
    id: 'un-1',
    category: 'Emergency Accommodation',
    description: 'Eviction notice effective Friday. No documented alternative housing or referral in place.',
    urgency: 'immediate',
    source: 'document-supported',
    consentRestrictions: 'Client has not consented to sharing address with any third party.',
    safeContactMethod: 'Organisation mobile (M. Chen) only',
    assignedPractitioner: 'M. Chen',
    actionRequired: 'Contact emergency housing coordinator and record offer made to client.',
    followUpTime: '2024-03-25T09:00:00Z',
    status: 'action-required',
    notes: 'Linked to support provider note p.4. Eviction date not fully confirmed — verify before escalating.',
    auditHistory: [
      { timestamp: '2024-03-24T08:50:00Z', actor: 'system', action: 'Need recorded from document-supported source (d-5, p.4)' },
      { timestamp: '2024-03-24T09:30:00Z', actor: 'M. Chen', action: 'Status set to Action Required. Follow-up time set for 2024-03-25 09:00.' },
    ],
  },
  {
    id: 'un-2',
    category: 'Interpreter / Language Access',
    description: 'Upcoming legal hearing requires Spanish interpreter. No arrangement documented in case packet.',
    urgency: 'within-24h',
    source: 'document-supported',
    safeContactMethod: 'Through legal aid office only',
    assignedPractitioner: 'M. Chen',
    actionRequired: 'Confirm hearing date and request interpreter through appropriate channel.',
    status: 'confirming',
    notes: 'Hearing date is redacted in support notes. Clarify before submitting interpreter request.',
    auditHistory: [
      { timestamp: '2024-03-24T09:00:00Z', actor: 'system', action: 'Need identified: interpreter not confirmed for hearing (linked eg-4)' },
      { timestamp: '2024-03-24T10:00:00Z', actor: 'M. Chen', action: 'Status set to Confirming. Hearing date pending clarification.' },
    ],
  },
  {
    id: 'un-3',
    category: 'Legal Representation',
    description: 'No legal representative confirmed for upcoming hearing. Case involves potential criminal charge.',
    urgency: 'within-72h',
    source: 'practitioner-observation',
    safeContactMethod: 'Via NGO office number',
    assignedPractitioner: 'M. Chen',
    actionRequired: 'Identify eligible duty counsel or legal aid referral and record outcome.',
    status: 'newly-recorded',
    auditHistory: [
      { timestamp: '2024-03-24T10:10:00Z', actor: 'M. Chen', action: 'Need recorded from practitioner observation. Status: Newly Recorded.' },
    ],
  },
  {
    id: 'un-4',
    category: 'Safe Communications',
    description: 'Client\'s personal phone may be monitored based on communication log content. Safe messaging channel not established.',
    urgency: 'ongoing',
    source: 'practitioner-observation',
    consentRestrictions: 'Do not contact on personal number without confirming safety.',
    safeContactMethod: 'Organisation office only during specified hours',
    assignedPractitioner: 'M. Chen',
    actionRequired: 'Establish and document a safe contact protocol with client before next contact attempt.',
    status: 'in-progress',
    auditHistory: [
      { timestamp: '2024-03-24T09:45:00Z', actor: 'M. Chen', action: 'Need recorded. Phone monitoring risk identified from d-2 content.' },
      { timestamp: '2024-03-24T10:15:00Z', actor: 'M. Chen', action: 'Status updated to In Progress. Safe contact protocol discussion initiated.' },
    ],
  },
];

export const MOCK_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-1',
    questionText: 'What do you remember about the time between when you signed the contract and when you travelled?',
    addressesGapId: 'eg-1',
    relatedFindingId: 'f-6',
    citations: ['f-6', 'eg-1'],
    reason: 'The 45-day gap between the contract date and the travel record is unexplained. Open-ended recall may clarify without leading.',
    sensitivityNote: 'Avoid asking about specific dates initially. Allow the person to orient freely before follow-up.',
    reviewStatus: 'kept',
  },
  {
    id: 'iq-2',
    questionText: 'What happened with your travel documents when you arrived?',
    addressesGapId: 'eg-2',
    relatedFindingId: 'f-1',
    citations: ['f-1', 'eg-2'],
    reason: 'Passport retention is documented in only one source. Non-leading recall about documents may surface corroborating detail.',
    sensitivityNote: 'This topic may relate to a point of control. Do not press if the person shows distress. Note any hesitation.',
    reviewStatus: 'pending-review',
  },
  {
    id: 'iq-3',
    questionText: 'Can you tell me about your working hours and how they were decided?',
    relatedFindingId: 'f-3',
    citations: ['f-3'],
    reason: 'Compelled work hours claim is supported by a supervisor-authored log only. Person\'s own account of scheduling is absent.',
    sensitivityNote: 'Frame around their experience of the schedule, not around the legal concept of forced labour.',
    reviewStatus: 'kept',
  },
  {
    id: 'iq-4',
    questionText: 'Was there anything about the payment arrangements that was different from what you expected?',
    addressesGapId: 'eg-3',
    relatedFindingId: 'f-2',
    citations: ['f-2', 'f-8', 'eg-3'],
    reason: 'Wage deduction records are incomplete. Person\'s recollection of payment expectations vs. reality may support or qualify the debt claim.',
    sensitivityNote: 'Financial topics may carry shame or confusion. Use neutral language and allow long silences.',
    reviewStatus: 'pending-review',
  },
  {
    id: 'iq-5',
    questionText: 'Is there anything important about your situation right now that you think I should know about?',
    addressesGapId: 'un-1',
    citations: [],
    reason: 'Open-ended welfare question. May surface urgent needs not yet recorded.',
    sensitivityNote: 'Ask near the start of any session. If immediate safety is indicated, follow safeguarding protocol before continuing.',
    reviewStatus: 'kept',
  },
];

export const MOCK_TASKS: CaseTask[] = [
  {
    id: 'ct-1',
    title: 'Obtain clearer copy of travel record page 1',
    description: 'Border entry stamp on p.1 of d-3 is partially legible. A clearer copy is needed to resolve the arrival date conflict.',
    linkedItem: 'eg-1',
    source: 'evidence-gap',
    assignee: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-28',
    status: 'in-progress',
  },
  {
    id: 'ct-2',
    title: 'Approve masking for d-5 (Support Provider Notes)',
    description: 'Masking review for document d-5 is pending practitioner approval. This is blocking the Export Gate.',
    linkedItem: 'd-5',
    source: 'incomplete-masking',
    assignee: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-26',
    status: 'to-do',
  },
  {
    id: 'ct-3',
    title: 'Verify interpreter availability for upcoming hearing',
    description: 'Linked to urgent need un-2. Hearing date must be confirmed before interpreter request can be submitted.',
    linkedItem: 'un-2',
    source: 'urgent-need',
    assignee: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-25',
    status: 'to-do',
  },
  {
    id: 'ct-4',
    title: 'Review 4 pending analysis findings (Lane A and B)',
    description: 'Findings f-4, f-5, f-6, f-9 remain in pending review status. All are required before export gate can clear.',
    linkedItem: 'analysis',
    source: 'pending-review',
    assignee: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-27',
    status: 'to-do',
  },
  {
    id: 'ct-5',
    title: 'Contact emergency housing coordinator re: eviction notice',
    description: 'Eviction notice effective Friday. Record whether housing offer was made and client response.',
    linkedItem: 'un-1',
    source: 'urgent-need',
    assignee: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-24',
    status: 'in-progress',
    notes: 'Coordinator contacted. Awaiting callback.',
    auditHistory: [
      { timestamp: '2024-03-24T09:00:00Z', actor: 'system', action: 'Task auto-generated from urgent need un-1 (Emergency Accommodation)' },
      { timestamp: '2024-03-24T10:30:00Z', actor: 'M. Chen', action: 'Status set to In Progress. Housing coordinator called.' },
    ],
  },
  {
    id: 'ct-6',
    title: 'Record why additional wage records cannot be obtained',
    description: 'If no payment records can be sourced, this limitation must be documented before export.',
    linkedItem: 'eg-3',
    source: 'evidence-gap',
    assignee: 'M. Chen',
    priority: 'medium',
    status: 'waiting',
    dependencies: ['ct-4'],
    notes: 'Waiting on legal team to advise on disclosure request options.',
    auditHistory: [
      { timestamp: '2024-03-24T09:10:00Z', actor: 'system', action: 'Task auto-generated from evidence gap eg-3 (Wage records absent)' },
      { timestamp: '2024-03-24T11:00:00Z', actor: 'M. Chen', action: 'Status set to Waiting — legal team consultation required.' },
    ],
  },
  {
    id: 'ct-7',
    title: 'Confirm legal representation before hearing date',
    description: 'No duty counsel or legal aid representative confirmed. Urgent need un-3.',
    linkedItem: 'un-3',
    source: 'urgent-need',
    assignee: 'M. Chen',
    priority: 'high',
    dueDate: '2024-03-27',
    status: 'to-do',
  },
];

export const MOCK_NOTES: CaseNote[] = [
  {
    id: 'cn-1',
    type: 'practitioner-observation',
    title: 'Observation: client appeared distressed when contract was mentioned',
    content: 'During initial intake, the client became visibly distressed when the employment contract was referenced. This was noted without further probing. May be relevant to trauma-informed interview planning.',
    author: 'M. Chen',
    createdAt: '2024-03-24T08:45:00Z',
    lastEditedAt: '2024-03-24T08:45:00Z',
    visibility: 'internal',
    linkedItems: ['f-2', 'd-1'],
    isEvidence: false,
  },
  {
    id: 'cn-2',
    type: 'review-rationale',
    title: 'Rationale: accepted f-1 (Passport Retention) with reservation',
    content: 'Accepted finding f-1 on the basis of the citation from d-2 p.5. However, corroboration is single-source. If passport retention is a pivotal claim in any eventual handoff, independent corroboration should be sought before reliance. This note records the reservation accompanying acceptance.',
    author: 'M. Chen',
    createdAt: '2024-03-24T09:20:00Z',
    lastEditedAt: '2024-03-24T09:22:00Z',
    visibility: 'export-eligible',
    linkedItems: ['f-1', 'eg-2'],
    isEvidence: false,
  },
  {
    id: 'cn-3',
    type: 'legal-research',
    title: 'Research note: non-punishment provisions — jurisdiction TBC',
    content: 'Initial research suggests non-punishment provisions may be relevant in the applicable jurisdiction. This note is a research reminder only and does not constitute legal advice. Domestic counsel must verify before any representation is made. Jurisdiction has not been confirmed in the purpose brief.',
    author: 'M. Chen',
    createdAt: '2024-03-24T10:00:00Z',
    lastEditedAt: '2024-03-24T10:05:00Z',
    visibility: 'internal',
    linkedItems: ['f-9'],
    isEvidence: false,
  },
  {
    id: 'cn-4',
    type: 'safety-note',
    title: 'Safe contact protocol — do not contact on personal number',
    content: 'Client personal phone may be accessible to a third party based on content in d-2. Agreed protocol: contact via organisation office number only, between 10:00–16:00. Client will use a code word to indicate if contact is unsafe to continue. Do not leave voicemail.',
    author: 'M. Chen',
    createdAt: '2024-03-24T10:15:00Z',
    lastEditedAt: '2024-03-24T10:15:00Z',
    visibility: 'internal',
    linkedItems: ['un-4'],
    isEvidence: false,
  },
];

export const MOCK_AUDIT: AuditEvent[] = [
  {
    id: 'a-0',
    timestamp: '2024-03-24T08:30:00Z',
    actor: 'practitioner',
    type: 'purpose-saved',
    summary: 'Purpose Brief recorded. Role: Legal Aid Practitioner. Org: NGO Legal Services. Handoff: Full Practitioner Handoff.'
  },
  {
    id: 'a-1',
    timestamp: '2024-03-24T09:00:00Z',
    actor: 'system',
    type: 'analysis-run',
    summary: 'Deterministic replay dispatched locally. Run ID: REPLAY-V1-2024-0047. 14 candidates extracted, 23 citations validated. No provider transmission.'
  },
  {
    id: 'a-2',
    timestamp: '2024-03-24T09:05:00Z',
    actor: 'system',
    type: 'mask-reviewed',
    summary: 'Masking review passed for documents d-1, d-2, d-3, d-4. Deterministic leak scan: clean. d-5 masking pending practitioner approval.'
  },
  {
    id: 'a-3',
    timestamp: '2024-03-24T09:15:00Z',
    actor: 'practitioner',
    type: 'evidence-accepted',
    summary: 'Accepted finding: Recruitment Fee Debt (f-2). No edits.'
  },
  {
    id: 'a-4',
    timestamp: '2024-03-24T09:16:00Z',
    actor: 'practitioner',
    type: 'evidence-accepted',
    summary: 'Accepted finding: Excessive Unpaid Hours (f-3). No edits.'
  },
  {
    id: 'a-5',
    timestamp: '2024-03-24T09:20:00Z',
    actor: 'practitioner',
    type: 'evidence-accepted',
    summary: 'Accepted finding: Passport Retention (f-1). No edits.'
  },
  {
    id: 'a-6',
    timestamp: '2024-03-24T10:30:00Z',
    actor: 'practitioner',
    type: 'sensitive-reveal',
    summary: 'Intentional reveal of original document d-2, page 5. Reason: Verification of stamp clarity.'
  },
  {
    id: 'a-7',
    timestamp: '2024-03-24T10:45:00Z',
    actor: 'system',
    type: 'export-evaluated',
    summary: 'Export gate evaluated. Status: BLOCKED. Active blockers: 4 (pending review items: 2, unresolved cascade: 1, incomplete masking: 1).'
  }
];
