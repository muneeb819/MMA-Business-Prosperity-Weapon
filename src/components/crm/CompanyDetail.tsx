"use client";

import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, cn } from "@/lib/utils";
import type { CRMCompany } from "@/lib/types";
import {
  Globe, DollarSign, Users, Mail, Phone, Calendar, Edit3, Save, X, MessageSquare,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  partner: "bg-rose-500/20 text-violet-300 border-rose-500/30",
};

interface CompanyDetailProps {
  company: CRMCompany | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowToast: (msg: string) => void;
  onSave?: (companyId: string, data: Partial<CRMCompany>) => void;
}

function openMailto(email: string, subject: string, body: string) {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  window.open(`mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`, "_blank");
}

function openTel(phone: string) {
  window.open(`tel:${phone}`, "_self");
}

export const CompanyDetail = memo(function CompanyDetail({
  company,
  open,
  onOpenChange,
  onShowToast,
  onSave,
}: CompanyDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", industry: "", country: "", revenue: "", website: "", notes: "" });

  const startEdit = () => {
    if (!company) return;
    setEditForm({
      name: company.name,
      industry: company.industry,
      country: company.country,
      revenue: String(company.revenue || ""),
      website: company.website || "",
      notes: company.notes || "",
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!company || !onSave) return;
    onSave(company.id, {
      name: editForm.name,
      industry: editForm.industry,
      country: editForm.country,
      revenue: Number(editForm.revenue) || 0,
      website: editForm.website,
      notes: editForm.notes,
    });
    setIsEditing(false);
    onShowToast(`${company.name} updated successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onOpenChange(false); setIsEditing(false); } }}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto z-50">
        {company && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-rose-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl shrink-0">
                  {isEditing ? editForm.name.charAt(0) : company.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-zinc-800/60 border-zinc-700 text-white font-bold text-xl"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Input
                          value={editForm.industry}
                          onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                          className="bg-zinc-800/60 border-zinc-700 text-white text-sm"
                          placeholder="Industry"
                        />
                        <Input
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="bg-zinc-800/60 border-zinc-700 text-white text-sm"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <DialogTitle className="text-xl truncate">{company.name}</DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <span>{company.industry}</span>
                        <Badge variant="outline" className={cn("text-[10px] border shrink-0", STATUS_COLORS[company.status])}>
                          {company.status}
                        </Badge>
                      </DialogDescription>
                    </>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500 uppercase tracking-wider">Revenue</label>
                      <Input value={editForm.revenue} onChange={(e) => setEditForm({ ...editForm, revenue: e.target.value })} className="bg-zinc-800/60 border-zinc-700 text-white" placeholder="50000" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-500 uppercase tracking-wider">Website</label>
                      <Input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} className="bg-zinc-800/60 border-zinc-700 text-white" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider">Notes</label>
                    <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="bg-zinc-800/60 border-zinc-700 text-white resize-none" rows={3} placeholder="Company notes..." />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={saveEdit} className="bg-emerald-600 hover:bg-emerald-500 text-white"><Save className="w-4 h-4 mr-1.5" />Save Changes</Button>
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4 mr-1.5" />Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/80">
                      <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Globe className="w-3 h-3 shrink-0" /> Country</p>
                      <p className="text-sm font-medium text-white truncate">{company.country}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/80">
                      <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3 shrink-0" /> Revenue</p>
                      <p className="text-sm font-medium text-emerald-400">{formatCurrency(company.revenue)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/80">
                      <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3 shrink-0" /> Contacts</p>
                      <p className="text-sm font-medium text-white">{company.contacts.length}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Contacts</h4>
                    <div className="space-y-2">
                      {company.contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/60 hover:bg-zinc-800/50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-violet-300 text-xs font-semibold shrink-0">
                            {contact.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{contact.name}</p>
                            <p className="text-xs text-zinc-500 truncate">{contact.role}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {contact.email && (
                              <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-500 hover:text-indigo-400"
                                onClick={() => { openMailto(contact.email, `Re: ${company.name}`, `Hi ${contact.name.split(" ")[0]},\n\n`); onShowToast(`Opening email to ${contact.name}`); }}>
                                <Mail className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {contact.phone && (
                              <Button size="icon" variant="ghost" className="h-9 w-9 text-zinc-500 hover:text-emerald-400"
                                onClick={() => { openTel(contact.phone); onShowToast(`Calling ${contact.name}...`); }}>
                                <Phone className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      {company.contacts.length === 0 && (
                        <p className="text-sm text-zinc-600 py-4 text-center">No contacts yet</p>
                      )}
                    </div>
                  </div>

                  {company.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Notes</h4>
                      <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-800/60">
                        <p className="text-sm text-zinc-400 leading-relaxed">{company.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60">
                    <Button size="sm" onClick={() => { const email = company.contacts[0]?.email || ""; if (email) { openMailto(email, `Partnership: ${company.name}`, `Dear ${company.name} team,\n\n`); onShowToast(`Opening email to ${company.name}`); } else { onShowToast("No email address available"); } }}
                      className="bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500">
                      <Mail className="w-3.5 h-3.5 mr-1.5" />Send Email
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={() => { const phone = company.contacts[0]?.phone || ""; if (phone) { openTel(phone); onShowToast(`Calling ${company.name}...`); } else { onShowToast("No phone number available"); } }}>
                      <Phone className="w-3.5 h-3.5 mr-1.5" />Call
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={() => { onShowToast(`Meeting request sent to ${company.name}`); }}>
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />Schedule Meeting
                    </Button>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={startEdit}>
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />Edit
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});
