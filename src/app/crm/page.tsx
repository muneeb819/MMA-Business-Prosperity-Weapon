"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { mockCompanies } from "@/lib/mock-data";
import { api } from "@/lib/api";
import type { CRMCompany } from "@/lib/types";
import { CrmStats } from "@/components/crm/CrmStats";
import { CompanyList } from "@/components/crm/CompanyList";
import { ContactPanel } from "@/components/crm/ContactPanel";
import { CompanyDetail } from "@/components/crm/CompanyDetail";
import { AddContactDialog } from "@/components/crm/AddContactDialog";
import { AddCompanyDialog } from "@/components/crm/AddCompanyDialog";
import { Users, Building2, Target, DollarSign, Plus, UserPlus, X, Check, Calendar, Clock } from "lucide-react";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-5">
      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-sm text-white">{message}</span>
      <button onClick={onClose} className="ml-2 text-zinc-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function CRMPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [contactSearch, setContactSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CRMCompany | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [activeTab, setActiveTab] = useState("companies");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CRMCompany[]>(mockCompanies);
  const [companyToDelete, setCompanyToDelete] = useState<CRMCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCompanies() {
      setLoading(true);
      try {
        const data = await api.crm.companies.list();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCompanies(data);
        }
      } catch {
        // API unavailable — keep mockCompanies
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCompanies();
    return () => { cancelled = true; };
  }, []);

  const filteredCompanies = companies.filter((c) => {
    const match = c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase());
    return match && (statusFilter === "all" || c.status === statusFilter);
  });

  const filteredContacts = companies.flatMap((c) =>
    c.contacts.filter((ct) => ct.name.toLowerCase().includes(contactSearch.toLowerCase()) || ct.role.toLowerCase().includes(contactSearch.toLowerCase())).map((ct) => ({ ...ct, companyName: c.name }))
  );

  const totalCompanies = companies.length;
  const totalContacts = companies.reduce((a, c) => a + c.contacts.length, 0);
  const activeLeads = companies.filter((c) => c.status === "prospect").length;
  const totalRevenue = companies.reduce((a, c) => a + c.revenue, 0);

  const stats = [
    { label: "Companies", value: totalCompanies, icon: Building2, color: "text-cyan-400", glow: "bg-cyan-500/10" },
    { label: "Contacts", value: totalContacts, icon: Users, color: "text-violet-400", glow: "bg-violet-500/10" },
    { label: "Active Leads", value: activeLeads, icon: Target, color: "text-amber-400", glow: "bg-amber-500/10" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-400", glow: "bg-emerald-500/10" },
  ];

  const showToast = useCallback((msg: string) => { setToastMsg(msg); }, []);

  const handleAddContact = async (data: { firstName: string; lastName: string; email: string; phone: string; role: string; company: string; notes: string }) => {
    const name = `${data.firstName} ${data.lastName}`.trim();
    if (!name || !data.email) { showToast("Name and email are required"); return; }
    const newContact = { id: `contact-${Date.now()}`, name, email: data.email, phone: data.phone, role: data.role || "Unknown", companyId: "" };
    const target = data.company.trim();

    try {
      await api.crm.contacts.create({ ...newContact, companyName: target });
    } catch {
      // API unavailable — continue with local state
    }

    if (target) {
      setCompanies((prev) => {
        const updated = prev.map((c) => c.name.toLowerCase() === target.toLowerCase() ? { ...c, contacts: [...c.contacts, newContact] } : c);
        if (!prev.some((c) => c.name.toLowerCase() === target.toLowerCase())) showToast(`Company "${target}" not found, contact added without company link`);
        return updated;
      });
    } else {
      setCompanies((prev) => {
        if (prev.length > 0) { const u = [...prev]; u[u.length - 1] = { ...u[u.length - 1], contacts: [...u[u.length - 1].contacts, newContact] }; return u; }
        return prev;
      });
    }
    showToast("Contact added successfully");
    setShowAddContact(false);
  };

  const handleAddCompany = async (data: { name: string; industry: string; country: string; revenue: string; website: string; notes: string }) => {
    if (!data.name.trim()) { showToast("Company name is required"); return; }

    const newCompany: CRMCompany = {
      id: `company-${Date.now()}`, name: data.name.trim(), industry: data.industry || "Unknown",
      country: data.country || "Unknown", revenue: Number(data.revenue) || 0, status: "prospect",
      website: data.website, notes: data.notes, contacts: [], leads: [], createdAt: new Date().toISOString(),
    };

    try {
      const result = await api.crm.companies.create(newCompany);
      if (result && typeof result === "object" && result.id) {
        newCompany.id = result.id;
      }
    } catch {
      // API unavailable — continue with local state
    }

    setCompanies((prev) => [...prev, newCompany]);
    showToast("Company added successfully");
    setShowAddCompany(false);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    try {
      await api.crm.companies.delete(companyToDelete.id);
    } catch {
      // API unavailable — continue with local state
    }
    setCompanies((p) => p.filter((c) => c.id !== companyToDelete.id));
    showToast(`${companyToDelete.name} removed`);
    setCompanyToDelete(null);
  };

  const handleSaveCompany = async (companyId: string, data: Partial<CRMCompany>) => {
    try {
      await api.crm.companies.update(companyId, data);
    } catch {
      // API unavailable — continue with local state
    }
    setCompanies((prev) => prev.map((c) => c.id === companyId ? { ...c, ...data } : c));
    setSelectedCompany((prev) => prev && prev.id === companyId ? { ...prev, ...data } : prev);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20"><Users className="w-6 h-6 text-cyan-400" /></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">CRM</h1>
                <p className="text-sm text-zinc-500">Manage your customer relationships</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddCompany(true)} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"><Building2 className="w-4 h-4 mr-2" />Add Company</Button>
              <Button onClick={() => setShowAddContact(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/20"><UserPlus className="w-4 h-4 mr-2" />Add Contact</Button>
            </div>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-zinc-400">Loading CRM data...</span>
            </div>
          )}
          <CrmStats stats={stats} />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900/80 border border-zinc-800/80 p-1 h-auto">
              <TabsTrigger value="companies" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Building2 className="w-4 h-4 mr-1.5" />Companies</TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Users className="w-4 h-4 mr-1.5" />Contacts</TabsTrigger>
              <TabsTrigger value="meetings" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Calendar className="w-4 h-4 mr-1.5" />Meetings</TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white"><Clock className="w-4 h-4 mr-1.5" />Activities</TabsTrigger>
            </TabsList>
            <TabsContent value="companies" className="mt-4">
              <CompanyList companies={filteredCompanies} search={search} onSearchChange={setSearch} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} onSelectCompany={setSelectedCompany} onDeleteCompany={setCompanyToDelete} onShowToast={showToast} />
            </TabsContent>
            <TabsContent value="contacts" className="mt-4">
              <ContactPanel contacts={filteredContacts} contactSearch={contactSearch} onContactSearchChange={setContactSearch} onAddContact={() => setShowAddContact(true)} onShowToast={showToast} />
            </TabsContent>
            <TabsContent value="meetings" className="mt-4">
              <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-2xl bg-zinc-800/50 mb-4"><Calendar className="w-10 h-10 text-zinc-600" /></div>
                <h3 className="text-lg font-semibold text-zinc-400">No meetings scheduled</h3>
                <p className="text-sm text-zinc-600 mt-1 max-w-sm">Schedule meetings with your contacts to keep your pipeline moving forward.</p>
                <Button onClick={() => showToast("Meeting scheduler opened")} className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"><Plus className="w-4 h-4 mr-2" />Schedule Meeting</Button>
              </div>
            </TabsContent>
            <TabsContent value="activities" className="mt-4">
              <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-2xl bg-zinc-800/50 mb-4"><Clock className="w-10 h-10 text-zinc-600" /></div>
                <h3 className="text-lg font-semibold text-zinc-400">No recent activities</h3>
                <p className="text-sm text-zinc-600 mt-1 max-w-sm">Activities like calls, emails, and notes will appear here as you interact with your contacts.</p>
                <Button onClick={() => showToast("Activity log opened")} className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"><Plus className="w-4 h-4 mr-2" />Log Activity</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <AddContactDialog open={showAddContact} onOpenChange={setShowAddContact} onAdd={handleAddContact} />
      <AddCompanyDialog open={showAddCompany} onOpenChange={setShowAddCompany} onAdd={handleAddCompany} />
      <CompanyDetail company={selectedCompany} open={!!selectedCompany} onOpenChange={(o) => { if (!o) setSelectedCompany(null); }} onShowToast={showToast} onSave={handleSaveCompany} />
      <Dialog open={!!companyToDelete} onOpenChange={(o) => { if (!o) setCompanyToDelete(null); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400"><DollarSign className="w-5 h-5" />Delete Company</DialogTitle>
            <DialogDescription className="text-zinc-500">Are you sure you want to delete <span className="text-white font-medium">{companyToDelete?.name}</span>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setCompanyToDelete(null)} className="text-zinc-400 hover:text-white">Cancel</Button>
            <Button onClick={handleDeleteCompany} className="bg-red-600 hover:bg-red-500 text-white">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
