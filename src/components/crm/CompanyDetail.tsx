"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { formatCurrency, cn } from "@/lib/utils";
import type { CRMCompany } from "@/lib/types";
import {
  Globe, DollarSign, Users, Mail, Phone, Calendar, Edit3,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  partner: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

interface CompanyDetailProps {
  company: CRMCompany | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const CompanyDetail = memo(function CompanyDetail({
  company,
  open,
  onOpenChange,
  onShowToast,
}: CompanyDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto z-50">
        {company && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xl shrink-0">
                  {company.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-xl truncate">{company.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <span>{company.industry}</span>
                    <Badge variant="outline" className={cn("text-[10px] border shrink-0", STATUS_COLORS[company.status])}>
                      {company.status}
                    </Badge>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-6">
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
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center text-violet-300 text-xs font-semibold shrink-0">
                        {contact.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{contact.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{contact.role}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-zinc-500 hover:text-cyan-400"
                          onClick={() => onShowToast(`Email sent to ${contact.name}`)}
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-zinc-500 hover:text-emerald-400"
                          onClick={() => onShowToast(`Calling ${contact.name}...`)}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                <Button
                  size="sm"
                  onClick={() => onShowToast(`Email sent to ${company.name}`)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                >
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  Send Email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={() => onShowToast(`Calling ${company.name}...`)}
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={() => onShowToast("Meeting scheduler opened")}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Schedule Meeting
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={() => {
                    onShowToast("Editing company details");
                    onOpenChange(false);
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});
