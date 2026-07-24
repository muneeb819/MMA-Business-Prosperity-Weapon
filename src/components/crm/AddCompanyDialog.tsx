"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Building2 } from "lucide-react";

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (company: { name: string; industry: string; country: string; revenue: string; website: string; notes: string }) => void;
}

const inputClass = "bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50";

export const AddCompanyDialog = memo(function AddCompanyDialog({ open, onOpenChange, onAdd }: AddCompanyDialogProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [revenue, setRevenue] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => { setName(""); setIndustry(""); setCountry(""); setRevenue(""); setWebsite(""); setNotes(""); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-cyan-400" />Add New Company</DialogTitle>
          <DialogDescription className="text-zinc-500">Add a new company to your CRM database.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Company Name</label>
            <Input placeholder="Acme Corp" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Industry</label>
            <Input placeholder="Technology Services" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Country</label>
              <Input placeholder="United States" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Revenue</label>
              <Input placeholder="50000" value={revenue} onChange={(e) => setRevenue(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Website</label>
            <Input placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Notes</label>
            <Textarea placeholder="Add any notes about this company..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { onOpenChange(false); reset(); }} className="text-zinc-400 hover:text-white">Cancel</Button>
            <Button onClick={() => { onAdd({ name, industry, country, revenue, website, notes }); reset(); }} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
              <Building2 className="w-4 h-4 mr-2" />Add Company
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
