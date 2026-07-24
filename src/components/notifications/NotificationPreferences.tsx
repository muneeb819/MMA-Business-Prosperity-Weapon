"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PreferenceKey = "highValue" | "urgentAlerts" | "governmentContracts" | "systemUpdates";

interface NotificationPreferencesProps {
  prefs: Record<PreferenceKey, boolean>;
  onTogglePref: (key: PreferenceKey) => void;
  onClose: () => void;
}

const prefLabels: Record<PreferenceKey, string> = {
  highValue: "High Value Leads",
  urgentAlerts: "Urgent Alerts",
  governmentContracts: "Government Contracts",
  systemUpdates: "System Updates",
};

const NotificationPreferences = React.memo(function NotificationPreferences({
  prefs,
  onTogglePref,
  onClose,
}: NotificationPreferencesProps) {
  return (
    <Card className="border-0 bg-[#12121a] border-slate-800/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-slate-800 rounded-md"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(prefLabels) as PreferenceKey[]).map((key) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <span className="text-xs text-slate-400">{prefLabels[key]}</span>
              <button
                onClick={() => onTogglePref(key)}
                className={cn(
                  "w-9 h-5 rounded-full flex items-center cursor-pointer transition-colors duration-200",
                  prefs[key] ? "bg-cyan-500/30 justify-end" : "bg-slate-700/50 justify-start"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full mx-0.5 transition-colors duration-200",
                  prefs[key] ? "bg-cyan-400" : "bg-slate-500"
                )} />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export { NotificationPreferences };
export type { PreferenceKey };
