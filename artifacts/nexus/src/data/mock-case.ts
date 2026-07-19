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
  type: 'purpose-saved' | 'evidence-accepted' | 'evidence-edited' | 'evidence-rejected' | 'evidence-withdrawn' | 'dependency-recalculation' | 'sensitive-reveal' | 'export-evaluated' | 'handoff-created' | 'analysis-run' | 'mask-reviewed' | 'case-reset';
  summary: string;
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
  }
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
