import React, { useState } from 'react';
import { MapPin, Phone, Globe, Clock, AlertTriangle, CheckCircle2, ChevronDown, Search, Filter, ExternalLink, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Service = {
  id: string;
  name: string;
  category: string;
  coverageArea: string;
  phone?: string;
  website?: string;
  address?: string;
  hours?: string;
  languages: string[];
  eligibilityNotes: string;
  accessibility?: string;
  remoteSupport: boolean;
  cost: string;
  safeContactOptions?: string;
  informationSource: string;
  lastVerified: string;
};

const MOCK_SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: '[Synthetic] Metro Legal Aid — Trafficking Unit',
    category: 'Legal Aid',
    coverageArea: 'Metro District',
    phone: '[Synthetic contact]',
    website: '[Synthetic website]',
    hours: 'Mon–Fri 09:00–17:00',
    languages: ['English', 'Spanish', 'Mandarin'],
    eligibilityNotes: 'Income-based eligibility. Trafficking cases prioritised regardless of immigration status.',
    accessibility: 'Wheelchair accessible. Interpreter available on request.',
    remoteSupport: true,
    cost: 'No cost',
    safeContactOptions: 'Accepts referrals via practitioner intermediary. Does not contact clients directly without consent.',
    informationSource: 'Synthetic training fixture — not a real organisation',
    lastVerified: '2024-03-01',
  },
  {
    id: 'svc-2',
    name: '[Synthetic] Harbour Emergency Shelter',
    category: 'Emergency Accommodation',
    coverageArea: 'City-wide',
    phone: '[Synthetic contact]',
    hours: '24/7',
    languages: ['English', 'Spanish'],
    eligibilityNotes: 'Open to adults fleeing exploitation or unsafe housing. No ID required for initial intake.',
    accessibility: 'Ground-floor rooms available. Limited mobility support.',
    remoteSupport: false,
    cost: 'No cost',
    safeContactOptions: 'Referral by practitioner. Do not send client without advance notification.',
    informationSource: 'Synthetic training fixture — not a real organisation',
    lastVerified: '2024-02-15',
  },
  {
    id: 'svc-3',
    name: '[Synthetic] Bridge Immigration Legal Services',
    category: 'Immigration Legal Services',
    coverageArea: 'State-wide',
    phone: '[Synthetic contact]',
    website: '[Synthetic website]',
    hours: 'Tue & Thu 10:00–15:00 (drop-in). Appointments at other times.',
    languages: ['English', 'Spanish', 'French', 'Portuguese'],
    eligibilityNotes: 'Serves undocumented clients and those with pending immigration matters. Trafficking-specific T-visa assistance available.',
    remoteSupport: true,
    cost: 'Sliding scale / no cost for trafficking cases',
    safeContactOptions: 'Telephone and video appointments available. Can coordinate with legal aid referral.',
    informationSource: 'Synthetic training fixture — not a real organisation',
    lastVerified: '2024-03-10',
  },
  {
    id: 'svc-4',
    name: '[Synthetic] Clearway Mental Health — Trauma Services',
    category: 'Mental Health Services',
    coverageArea: 'Metro and surrounding counties',
    phone: '[Synthetic contact]',
    hours: 'Mon–Fri 08:00–20:00. Crisis line 24/7.',
    languages: ['English', 'Spanish', 'ASL'],
    eligibilityNotes: 'Accepts referrals for survivors of trafficking and forced labour. Trauma-informed model. Interpreter co-ordination available.',
    accessibility: 'Remote and in-person. Accessible premises.',
    remoteSupport: true,
    cost: 'No cost for trafficking cases. Insurance accepted for others.',
    safeContactOptions: 'Intake via practitioner referral form. Does not require client to self-identify.',
    informationSource: 'Synthetic training fixture — not a real organisation',
    lastVerified: '2024-02-28',
  },
  {
    id: 'svc-5',
    name: '[Synthetic] Voz Interpretation Services',
    category: 'Translation and Interpretation',
    coverageArea: 'National (remote) / Metro (in-person)',
    phone: '[Synthetic contact]',
    website: '[Synthetic website]',
    hours: 'On-demand remote. In-person by appointment.',
    languages: ['Spanish', 'Portuguese', 'Haitian Creole', 'Tagalog', 'Vietnamese', '20+ others'],
    eligibilityNotes: 'Available for legal, medical, and support settings. Confidentiality agreement standard.',
    remoteSupport: true,
    cost: 'Fee-based. Pro bono available for NGO referrals.',
    informationSource: 'Synthetic training fixture — not a real organisation',
    lastVerified: '2024-01-20',
  },
];

const CATEGORIES = ['All', 'Emergency Accommodation', 'Legal Aid', 'Immigration Legal Services', 'Mental Health Services', 'Translation and Interpretation', 'Healthcare', 'Transportation', 'Food and Essential Support', 'Digital Safety', 'Child and Family Services'];

type ReferralRecord = { serviceId: string; offered: boolean; outcome?: 'accepted' | 'declined' | 'follow-up' };

export default function CaseServices() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralService, setReferralService] = useState<Service | null>(null);

  const selected = MOCK_SERVICES.find(s => s.id === selectedId);

  const filtered = MOCK_SERVICES.filter(s => {
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesRemote = !remoteOnly || s.remoteSupport;
    return matchesSearch && matchesCat && matchesRemote;
  });

  const getReferral = (id: string) => referrals.find(r => r.serviceId === id);

  const recordReferral = (serviceId: string, offered: boolean, outcome?: 'accepted' | 'declined' | 'follow-up') => {
    setReferrals(prev => {
      const existing = prev.findIndex(r => r.serviceId === serviceId);
      const record = { serviceId, offered, outcome };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = record;
        return updated;
      }
      return [...prev, record];
    });
    setShowReferralModal(false);
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-foreground text-sm">Service &amp; Referral Navigator</h2>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">All listings are synthetic training fixtures · Verify before relying on any real service</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-sm">
            {referrals.length} referrals recorded
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2 text-xs text-amber-800 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        Listing does not guarantee eligibility, current capacity, or availability. No data is transmitted to any organisation unless separately confirmed.
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — search + results */}
        <div className="w-80 flex flex-col border-r border-border shrink-0 overflow-hidden">
          {/* Search & filters */}
          <div className="p-3 border-b border-border bg-muted/20 space-y-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search services…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-card border border-border rounded-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <select
              className="w-full text-xs bg-card border border-border rounded-sm px-2 py-1.5 text-foreground"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="rounded" />
              Remote support available
            </label>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm font-mono">No services match your filters.</div>
            )}
            {filtered.map(svc => {
              const referral = getReferral(svc.id);
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedId(svc.id)}
                  className={cn(
                    "p-3 rounded-sm border cursor-pointer transition-all",
                    selectedId === svc.id
                      ? "bg-primary/5 border-primary/25 shadow-sm"
                      : "bg-card border-border hover:border-foreground/15"
                  )}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono uppercase text-muted-foreground">{svc.category}</span>
                    {referral && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-foreground leading-tight mb-1">{svc.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{svc.coverageArea}</span>
                    {svc.remoteSupport && (
                      <span className="ml-1 text-[9px] font-mono bg-blue-50 text-blue-600 border border-blue-200 px-1 rounded">REMOTE</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — service detail */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="p-6 space-y-6 max-w-3xl">
                  {/* Name + category */}
                  <div>
                    <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">{selected.category}</div>
                    <h2 className="text-xl font-bold text-foreground mb-1">{selected.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selected.coverageArea}</span>
                      {selected.remoteSupport && <span className="text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded">Remote support available</span>}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-3">
                    {selected.phone && (
                      <div className="bg-muted border border-border rounded-sm p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Phone</div>
                        <div className="text-sm text-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{selected.phone}</div>
                      </div>
                    )}
                    {selected.website && (
                      <div className="bg-muted border border-border rounded-sm p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Website</div>
                        <div className="text-sm text-foreground flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{selected.website}</div>
                      </div>
                    )}
                    {selected.hours && (
                      <div className="bg-muted border border-border rounded-sm p-3">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Hours</div>
                        <div className="text-sm text-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{selected.hours}</div>
                      </div>
                    )}
                    <div className="bg-muted border border-border rounded-sm p-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1.5">Cost</div>
                      <div className="text-sm text-foreground">{selected.cost}</div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Languages</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.languages.map(l => (
                        <span key={l} className="text-xs bg-muted border border-border px-2 py-0.5 rounded text-foreground">{l}</span>
                      ))}
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="bg-card border border-border rounded-sm p-4">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Eligibility Notes</div>
                    <p className="text-sm text-foreground leading-relaxed">{selected.eligibilityNotes}</p>
                    {selected.accessibility && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Accessibility</div>
                        <p className="text-sm text-foreground">{selected.accessibility}</p>
                      </div>
                    )}
                  </div>

                  {/* Safe contact */}
                  {selected.safeContactOptions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
                      <div className="text-[10px] font-mono text-blue-700 uppercase mb-2">Safe Contact Options</div>
                      <p className="text-sm text-blue-900">{selected.safeContactOptions}</p>
                    </div>
                  )}

                  {/* Source & verification */}
                  <div className="text-xs text-muted-foreground border border-dashed border-border rounded-sm p-3 space-y-1">
                    <div><span className="font-mono uppercase text-[10px]">Information source:</span> {selected.informationSource}</div>
                    <div><span className="font-mono uppercase text-[10px]">Last verified:</span> {selected.lastVerified}</div>
                    <div className="flex items-start gap-1.5 mt-2 text-amber-700">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      Listing does not guarantee eligibility, capacity, or current availability. Always verify directly before making a referral.
                    </div>
                  </div>

                  {/* Referral status */}
                  {getReferral(selected.id) && (
                    <div className="bg-teal-50 border border-teal-200 rounded-sm p-4 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                      <div className="text-sm text-teal-800">
                        Referral recorded for this organisation.
                        {getReferral(selected.id)?.outcome && (
                          <span className="ml-1 font-medium capitalize">Outcome: {getReferral(selected.id)?.outcome?.replace('-', ' ')}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-sm border-border text-foreground text-xs h-8"
                      onClick={() => { setReferralService(selected); setShowReferralModal(true); }}
                    >
                      Record Referral Activity
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
                Select a service to view details
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Referral modal */}
      <AnimatePresence>
        {showReferralModal && referralService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border w-full max-w-md rounded-md shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-bold text-foreground mb-1">Record Referral Activity</h3>
                <p className="text-sm text-muted-foreground">{referralService.name}</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-800 flex items-start gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  You must confirm consent and safe-contact requirements before proceeding. No data is sent to this organisation automatically.
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase mb-2">Was information about this service offered to the client?</div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs" onClick={() => recordReferral(referralService.id, true, 'accepted')}>
                      Offered — Accepted
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-border" onClick={() => recordReferral(referralService.id, true, 'declined')}>
                      Offered — Declined
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs border-border" onClick={() => recordReferral(referralService.id, true, 'follow-up')}>
                      Follow-Up Required
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowReferralModal(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
