export type EvidenceNature = 'documented' | 'reported' | 'reviewer-supplied' | 'unknown';
export type Origin = 'source-extraction' | 'ai-suggestion' | 'human-created';
export type SupportStatus = 'supported' | 'partially-supported' | 'conflicting' | 'insufficient' | 'unresolved' | 'not-processed';
export type ReviewStatus = 'pending' | 'accepted' | 'edited' | 'rejected' | 'uncertain' | 'invalidated';

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
  pages: { page: number; status: 'processed' | 'missing' | 'unreadable' | 'excluded' }[];
};

export type Finding = {
  id: string;
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
  dependencies?: string[]; // IDs of findings that depend on this one
};

export type Citation = {
  documentId: string;
  page: number;
  text: string;
};

export type TimelineEvent = {
  id: string;
  description: string;
  date: string; // ISO or "unknown"
  dateType: 'exact' | 'approximate' | 'unknown';
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
  type: 'evidence-accepted' | 'evidence-edited' | 'evidence-rejected' | 'evidence-withdrawn' | 'dependency-recalculation' | 'sensitive-reveal' | 'export-evaluated' | 'handoff-created' | 'analysis-run';
  summary: string;
};

// Synthetic Data
export const MOCK_CASES: Case[] = [
  {
    id: 'c-001',
    refId: 'REF-2024-0047-SYN',
    practitioner: 'M. Chen',
    documentCount: 5,
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
    pages: [
      { page: 1, status: 'processed' },
      { page: 2, status: 'unreadable' },
      { page: 3, status: 'unreadable' },
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
    pages: []
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
    pages: []
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
    pages: []
  }
];

export const MOCK_FINDINGS: Finding[] = [
  {
    id: 'f-1',
    type: 'coercion',
    title: 'Passport Retention',
    description: 'Employer withheld travel documents upon arrival.',
    evidenceNature: 'documented',
    origin: 'source-extraction',
    supportStatus: 'supported',
    reviewStatus: 'accepted',
    citations: [{ documentId: 'd-2', page: 5, text: '[REDACTED] requested original passport for "safekeeping" on day of arrival.' }],
    dependencies: ['f-5', 'f-6']
  },
  {
    id: 'f-2',
    type: 'relationship',
    title: 'Recruitment Fee Debt',
    description: 'Subject owes ongoing debt to recruiter.',
    evidenceNature: 'documented',
    origin: 'ai-suggestion',
    supportStatus: 'supported',
    reviewStatus: 'accepted',
    citations: [{ documentId: 'd-1', page: 2, text: 'Deduction of $400/month for initial placement fee.' }]
  },
  {
    id: 'f-3',
    type: 'compelled-task',
    title: 'Excessive Unpaid Hours',
    description: 'Subject required to work beyond contracted hours without compensation.',
    evidenceNature: 'reported',
    origin: 'ai-suggestion',
    supportStatus: 'supported',
    reviewStatus: 'accepted',
    citations: [{ documentId: 'd-4', page: 1, text: 'Shift extended by 6 hours, no overtime recorded.' }]
  },
  {
    id: 'f-4',
    type: 'coercion',
    title: 'Threats of Deportation',
    description: 'Supervisor leveraged immigration status to compel compliance.',
    evidenceNature: 'reported',
    origin: 'ai-suggestion',
    supportStatus: 'partially-supported',
    reviewStatus: 'pending',
    citations: [{ documentId: 'd-2', page: 8, text: '"If you leave, ICE will be notified immediately."' }]
  },
  {
    id: 'f-5',
    type: 'coercion',
    title: 'Isolation from Support Networks',
    description: 'Subject prohibited from contacting family or leaving premises unescorted.',
    evidenceNature: 'reviewer-supplied',
    origin: 'human-created',
    supportStatus: 'insufficient',
    reviewStatus: 'pending',
    citations: [{ documentId: 'd-5', page: 2, text: 'Client stated they were not allowed out of the housing facility.' }]
  },
  {
    id: 'f-6',
    type: 'contradiction',
    title: 'Arrival Date Discrepancy',
    description: 'Travel record contradicts employment contract start date.',
    evidenceNature: 'documented',
    origin: 'ai-suggestion',
    supportStatus: 'conflicting',
    reviewStatus: 'pending',
    citations: [
      { documentId: 'd-1', page: 1, text: 'Start Date: October 1, 2023' },
      { documentId: 'd-3', page: 1, text: 'Entry stamped: November 15, 2023' }
    ]
  },
  {
    id: 'f-7',
    type: 'protection-urgency',
    title: 'Imminent Housing Loss',
    description: 'Subject faces eviction in 48 hours.',
    evidenceNature: 'reported',
    origin: 'source-extraction',
    supportStatus: 'supported',
    reviewStatus: 'pending',
    citations: [{ documentId: 'd-5', page: 4, text: 'Eviction notice served, effective Friday.' }]
  },
  {
    id: 'f-8',
    type: 'evidence-gap',
    title: 'Missing Payment Records',
    description: 'No documentation of actual payments received versus promised.',
    evidenceNature: 'unknown',
    origin: 'ai-suggestion',
    supportStatus: 'not-processed',
    reviewStatus: 'rejected',
    citations: []
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
    citation: { documentId: 'd-1', page: 4, text: 'Signed: 15 Sep 2023' }
  },
  {
    id: 't-2',
    description: 'Arrived in destination country.',
    date: '2023-11-15',
    dateType: 'exact',
    dateConflict: true,
    evidenceNature: 'documented',
    supportStatus: 'conflicting',
    reviewStatus: 'pending',
    citation: { documentId: 'd-3', page: 1, text: 'Entry stamped: Nov 15' }
  },
  {
    id: 't-3',
    description: 'Passport confiscated by supervisor.',
    date: '2023-11-15',
    dateType: 'approximate',
    dateConflict: false,
    evidenceNature: 'reported',
    supportStatus: 'partially-supported',
    reviewStatus: 'pending',
    citation: { documentId: 'd-2', page: 5, text: 'Took passport on first day' }
  },
  {
    id: 't-4',
    description: 'First physical altercation reported.',
    date: 'unknown',
    dateType: 'unknown',
    dateConflict: false,
    evidenceNature: 'reported',
    supportStatus: 'insufficient',
    reviewStatus: 'pending',
    citation: { documentId: 'd-5', page: 3, text: 'Client mentioned being pushed by manager early on.' }
  }
];

export const MOCK_AUDIT: AuditEvent[] = [
  {
    id: 'a-1',
    timestamp: '2024-03-24T09:00:00Z',
    actor: 'system',
    type: 'analysis-run',
    summary: 'Automated extraction and relationship mapping completed on 5 documents.'
  },
  {
    id: 'a-2',
    timestamp: '2024-03-24T09:15:00Z',
    actor: 'practitioner',
    type: 'evidence-accepted',
    summary: 'Accepted finding: Recruitment Fee Debt (f-2)'
  },
  {
    id: 'a-3',
    timestamp: '2024-03-24T09:16:00Z',
    actor: 'practitioner',
    type: 'evidence-accepted',
    summary: 'Accepted finding: Excessive Unpaid Hours (f-3)'
  },
  {
    id: 'a-4',
    timestamp: '2024-03-24T10:30:00Z',
    actor: 'practitioner',
    type: 'sensitive-reveal',
    summary: 'Intentional reveal of original document d-2, page 5. Reason: Verification of stamp clarity.'
  }
];
