"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, MessageSquare, UserPlus } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  companyId: string;
  companyName: string;
}

interface ContactPanelProps {
  contacts: Contact[];
  contactSearch: string;
  onContactSearchChange: (v: string) => void;
  onAddContact: () => void;
  onShowToast: (msg: string) => void;
}

export const ContactPanel = memo(function ContactPanel({
  contacts,
  contactSearch,
  onContactSearchChange,
  onAddContact,
  onShowToast,
}: ContactPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search contacts..."
            value={contactSearch}
            onChange={(e) => onContactSearchChange(e.target.value)}
            className="pl-10 bg-zinc-900/60 border-zinc-800/80 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>
        <Button
          onClick={onAddContact}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Users className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
            <p className="text-sm">No contacts found.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-violet-500/20 flex items-center justify-center text-violet-300 font-semibold text-sm shrink-0">
                    {contact.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white">{contact.name}</h4>
                    <p className="text-sm text-zinc-500 truncate">{contact.role} at {contact.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10"
                      onClick={() => onShowToast(`Email sent to ${contact.name}`)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => onShowToast(`Calling ${contact.name}...`)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10"
                      onClick={() => onShowToast(`Message sent to ${contact.name}`)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
});
