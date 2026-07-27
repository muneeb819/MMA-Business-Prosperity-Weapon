"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { CRMCompany } from "@/lib/types";
import {
  Building2, Mail, MapPin, DollarSign, Users, Search, Edit3, Trash2,
} from "lucide-react";

const STATUS_FILTERS = ["all", "prospect", "active", "inactive", "partner"] as const;

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  partner: "bg-violet-500/20 text-violet-300 border-violet-500/30",
};

interface CompanyListProps {
  companies: CRMCompany[];
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onSelectCompany: (c: CRMCompany) => void;
  onDeleteCompany: (c: CRMCompany) => void;
  onShowToast: (msg: string) => void;
}

export const CompanyList = memo(function CompanyList({
  companies,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSelectCompany,
  onDeleteCompany,
  onShowToast,
}: CompanyListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search companies..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-zinc-900/60 border-zinc-800/80 focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((sf) => (
            <Button
              key={sf}
              size="sm"
              variant={statusFilter === sf ? "default" : "outline"}
              onClick={() => onStatusFilterChange(sf)}
              className={cn(
                "capitalize text-xs",
                statusFilter === sf
                  ? "bg-zinc-700 text-white hover:bg-zinc-600"
                  : "border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800"
              )}
            >
              {sf}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companies.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
            <p className="text-sm">No companies found matching your search.</p>
          </div>
        ) : (
          companies.map((company) => (
            <Card
              key={company.id}
              className="bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 cursor-pointer group"
              onClick={() => onSelectCompany(company)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg shrink-0 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">{company.name}</h3>
                      <Badge variant="outline" className={cn("text-[10px] shrink-0 border", STATUS_COLORS[company.status])}>
                        {company.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-500 mt-0.5 truncate">{company.industry}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{company.country}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 shrink-0" />
                        {formatCurrency(company.revenue)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 shrink-0" />
                        {company.contacts.length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCompany(company);
                    }}
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    View / Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      const email = company.contacts[0]?.email;
                      if (email) {
                        window.open(`mailto:${email}?subject=${encodeURIComponent(`Partnership: ${company.name}`)}`, "_blank");
                        onShowToast(`Opening email to ${company.name}`);
                      } else {
                        onShowToast(`No email available for ${company.name}`);
                      }
                    }}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-red-400/80 hover:bg-red-500/10 hover:border-red-500/30 text-xs h-9 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCompany(company);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
});
