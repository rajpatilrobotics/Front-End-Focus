import React from "react";
import { 
  Search, 
  Plus, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Shield, 
  ShieldAlert,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const stats = [
    { label: "Open Cases", value: 7, color: "text-foreground", border: "border-border" },
    { label: "Pending Review", value: 3, color: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/5" },
    { label: "Export Ready", value: 2, color: "text-primary", border: "border-primary/30", bg: "bg-primary/5" },
    { label: "Overdue Tasks", value: 1, color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5" },
    { label: "Urgent Needs Active", value: 2, color: "text-destructive", border: "border-destructive/30", bg: "bg-destructive/5" },
    { label: "Evidence Gaps Open", value: 4, color: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/5" },
  ];

  const cases = [
    { id: "REF-2024-0091-SYN", docs: 3, status: "READY", gate: "passed", time: "10 mins ago", type: "SYN" },
    { id: "REF-2023-0047-TRF", docs: 12, status: "BLOCKED", gate: "failed", time: "2 hours ago", type: "TRF" },
    { id: "REF-2024-0112-SYN", docs: 1, status: "PENDING", gate: "partial", time: "4 hours ago", type: "SYN" },
    { id: "REF-2024-0088-TRF", docs: 8, status: "IN PROGRESS", gate: "none", time: "1 day ago", type: "TRF" },
    { id: "REF-2023-0902-TRF", docs: 5, status: "READY", gate: "passed", time: "2 days ago", type: "TRF" },
    { id: "REF-2024-0105-SYN", docs: 4, status: "PENDING", gate: "partial", time: "3 days ago", type: "SYN" },
    { id: "REF-2023-0855-SYN", docs: 2, status: "BLOCKED", gate: "failed", time: "1 week ago", type: "SYN" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY": return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">READY</Badge>;
      case "PENDING": return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">PENDING</Badge>;
      case "BLOCKED": return <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">BLOCKED</Badge>;
      default: return <Badge variant="outline" className="text-muted-foreground">{status}</Badge>;
    }
  };

  const getGateIcon = (gate: string) => {
    switch (gate) {
      case "passed": return <Shield className="w-5 h-5 text-primary" />;
      case "failed": return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case "partial": return <Shield className="w-5 h-5 text-amber-500" />;
      default: return <Shield className="w-5 h-5 text-muted-foreground/30" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-semibold text-lg tracking-tight">ContextFirst Nexus</span>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Case
          </Button>
          <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-mono text-xs font-semibold">
            JD
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 pt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className={`p-4 rounded-lg border ${stat.border || "border-border"} ${stat.bg || "bg-card"}`}>
              <div className={`text-3xl font-mono font-semibold mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex bg-secondary p-1 rounded-md">
            {["All Cases", "Open", "Pending Review", "Export Ready"].map((tab, i) => (
              <button 
                key={i} 
                className={`px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${i === 0 ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by ID or keyword..." 
              className="w-full bg-card border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Case ID</div>
            <div className="col-span-2 text-center">Docs</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Gate</div>
            <div className="col-span-2">Last Activity</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-border">
            {cases.map((c, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-secondary/30 transition-colors group cursor-pointer">
                <div className="col-span-3">
                  <div className="font-mono text-sm font-medium flex items-center gap-2">
                    <span className={c.type === 'SYN' ? 'text-blue-400' : 'text-purple-400'}>
                      {c.type === 'SYN' ? 'SYN' : 'TRF'}
                    </span>
                    <span className="text-foreground">{c.id}</span>
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="inline-flex items-center text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 mr-1.5 opacity-50" /> {c.docs}
                  </div>
                </div>
                <div className="col-span-2 text-center">
                  {getStatusBadge(c.status)}
                </div>
                <div className="col-span-2 flex justify-center">
                  {getGateIcon(c.gate)}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-50" /> {c.time}
                </div>
                <div className="col-span-1 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}