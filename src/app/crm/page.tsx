"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatCurrency, timeAgo, cn } from "@/lib/utils";
import { mockCompanies } from "@/lib/mock-data";
import type { CRMCompany } from "@/lib/types";
import {
  Users, Building2, Mail, Phone, MapPin, Globe, Plus, Search, Filter,
  DollarSign, Target, Calendar, MessageSquare, Clock, UserPlus, Edit3,
} from "lucide-react";

export default function CRMPage() {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CRMCompany | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [activeTab, setActiveTab] = useState("companies");

  const filteredCompanies = mockCompanies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const totalCompanies = mockCompanies.length;
  const totalContacts = mockCompanies.reduce((a, c) => a + c.contacts.length, 0);
  const activeLeads = mockCompanies.filter((c) => c.status === "prospect").length;
  const totalRevenue = mockCompanies.reduce((a, c) => a + c.revenue, 0);

  const stats = [
    { label: "Companies", value: totalCompanies, icon: Building2, color: "text-cyan-400", glow: "bg-cyan-500/10" },
    { label: "Contacts", value: totalContacts, icon: Users, color: "text-violet-400", glow: "bg-violet-500/10" },
    { label: "Active Leads", value: activeLeads, icon: Target, color: "text-amber-400", glow: "bg-amber-500/10" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-400", glow: "bg-emerald-500/10" },
  ];

  const statusColor: Record<string, string> = {
    prospect: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    partner: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  CRM
                </h1>
                <p className="text-sm text-zinc-500">Manage your customer relationships</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddContact(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/20"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className={cn("p-2.5 rounded-lg", s.glow)}>
                      <s.icon className={cn("w-5 h-5", s.color)} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900/80 border border-zinc-800/80 p-1 h-auto">
              <TabsTrigger value="companies" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Building2 className="w-4 h-4 mr-1.5" />
                Companies
              </TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-1.5" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="meetings" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-1.5" />
                Meetings
              </TabsTrigger>
              <TabsTrigger value="activities" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                <Clock className="w-4 h-4 mr-1.5" />
                Activities
              </TabsTrigger>
            </TabsList>

            {/* Companies Tab */}
            <TabsContent value="companies" className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-zinc-900/60 border-zinc-800/80 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCompanies.map((company) => (
                  <Card
                    key={company.id}
                    className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedCompany(company)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                          {company.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-white truncate">{company.name}</h3>
                            <Badge variant="outline" className={cn("text-[10px] shrink-0 border", statusColor[company.status])}>
                              {company.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-500 mt-0.5">{company.industry}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {company.country}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(company.revenue)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {company.contacts.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-10 bg-zinc-900/60 border-zinc-800/80 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {mockCompanies.flatMap((c) =>
                  c.contacts.map((contact) => (
                    <Card key={contact.id} className="bg-zinc-900/60 border-zinc-800/80 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-violet-500/20 flex items-center justify-center text-violet-300 font-semibold text-sm shrink-0">
                            {contact.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white">{contact.name}</h4>
                            <p className="text-sm text-zinc-500">{contact.role} at {c.name}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Meetings Tab */}
            <TabsContent value="meetings" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-2xl bg-zinc-800/50 mb-4">
                    <Calendar className="w-10 h-10 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-400">No meetings scheduled</h3>
                  <p className="text-sm text-zinc-600 mt-1 max-w-sm">
                    Schedule meetings with your contacts to keep your pipeline moving forward.
                  </p>
                  <Button className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-4">
              <Card className="bg-zinc-900/60 border-zinc-800/80">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-2xl bg-zinc-800/50 mb-4">
                    <Clock className="w-10 h-10 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-400">No recent activities</h3>
                  <p className="text-sm text-zinc-600 mt-1 max-w-sm">
                    Activities like calls, emails, and notes will appear here as you interact with your contacts.
                  </p>
                  <Button className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              Add New Contact
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Add a new contact to your CRM database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">First Name</label>
                <Input placeholder="John" className="bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">Last Name</label>
                <Input placeholder="Doe" className="bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Email</label>
              <Input placeholder="john@example.com" className="bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Phone</label>
              <Input placeholder="+1 (555) 000-0000" className="bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Role</label>
              <Input placeholder="CTO" className="bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Company</label>
              <Input placeholder="Acme Corp" className="bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Notes</label>
              <Textarea placeholder="Add any notes about this contact..." rows={3} className="bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50 resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowAddContact(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company Detail Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCompany && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xl shrink-0">
                    {selectedCompany.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedCompany.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <span>{selectedCompany.industry}</span>
                      <Badge variant="outline" className={cn("text-[10px] border", statusColor[selectedCompany.status])}>
                        {selectedCompany.status}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/80">
                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Country</p>
                    <p className="text-sm font-medium text-white">{selectedCompany.country}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/80">
                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Revenue</p>
                    <p className="text-sm font-medium text-emerald-400">{formatCurrency(selectedCompany.revenue)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/80">
                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Contacts</p>
                    <p className="text-sm font-medium text-white">{selectedCompany.contacts.length}</p>
                  </div>
                </div>

                {/* Contacts List */}
                <div>
                  <h4 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Contacts</h4>
                  <div className="space-y-2">
                    {selectedCompany.contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/60 hover:bg-zinc-800/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center text-violet-300 text-xs font-semibold shrink-0">
                          {contact.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{contact.name}</p>
                          <p className="text-xs text-zinc-500">{contact.role}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-cyan-400">
                            <Mail className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-500 hover:text-emerald-400">
                            <Phone className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedCompany.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Notes</h4>
                    <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/60">
                      <p className="text-sm text-zinc-400 leading-relaxed">{selectedCompany.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60">
                  <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    <Phone className="w-3.5 h-3.5 mr-1.5" />
                    Call
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Schedule Meeting
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
