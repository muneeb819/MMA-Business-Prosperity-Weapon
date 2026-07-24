"use client";

import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (contact: { firstName: string; lastName: string; email: string; phone: string; role: string; company: string; notes: string }) => void;
}

const inputClass = "bg-zinc-800/60 border-zinc-700/80 focus:border-cyan-500/50";

export const AddContactDialog = memo(function AddContactDialog({ open, onOpenChange, onAdd }: AddContactDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => { setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setRole(""); setCompany(""); setNotes(""); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-cyan-400" />Add New Contact</DialogTitle>
          <DialogDescription className="text-zinc-500">Add a new contact to your CRM database.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">First Name</label>
              <Input placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Last Name</label>
              <Input placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Email</label>
            <Input placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Phone</label>
            <Input placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Role</label>
            <Input placeholder="CTO" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Company</label>
            <Input placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">Notes</label>
            <Textarea placeholder="Add any notes about this contact..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { onOpenChange(false); reset(); }} className="text-zinc-400 hover:text-white">Cancel</Button>
            <Button onClick={() => { onAdd({ firstName, lastName, email, phone, role, company, notes }); reset(); }} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
              <UserPlus className="w-4 h-4 mr-2" />Add Contact
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
