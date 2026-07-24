"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";

interface AgentItem {
  agent: string;
  efficiency: number;
  tasks: number;
}

interface AgentPerformanceProps {
  agents: AgentItem[];
  totalCount: number;
  showAll: boolean;
  onToggleShowAll: () => void;
}

export const AgentPerformance = memo(function AgentPerformance({
  agents,
  totalCount,
  showAll,
  onToggleShowAll,
}: AgentPerformanceProps) {
  const displayed = showAll ? agents : agents.slice(0, 3);

  return (
    <Card className="bg-zinc-900/80 border-zinc-800/80 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 min-w-0">
          <Brain className="w-5 h-5 text-violet-400 shrink-0" />
          <span className="truncate">AI Agent Performance</span>
        </CardTitle>
        <CardDescription className="truncate">Performance metrics for your AI-powered agents</CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((agent) => (
            <div
              key={agent.agent}
              className="p-5 rounded-xl bg-zinc-800/20 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all duration-300 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none" />
              <div className="flex items-center gap-3 mb-4 min-w-0 relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-purple-500/30 transition-all shrink-0">
                  <Brain className="w-5 h-5 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{agent.agent}</h4>
                  <p className="text-xs text-zinc-500 truncate">{agent.tasks} tasks completed</p>
                </div>
              </div>
              <div className="space-y-3 relative">
                <div>
                  <div className="flex items-center justify-between mb-1.5 min-w-0">
                    <span className="text-xs text-zinc-500 shrink-0">Efficiency</span>
                    <span className="text-xs font-semibold text-violet-400 shrink-0">{agent.efficiency}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600/80 to-purple-400/80 transition-all duration-700 ease-out pointer-events-none"
                      style={{ width: `${agent.efficiency}%` }}
                    />
                  </div>
                </div>
                <div className="pt-1">
                  <div className="p-2 rounded-lg bg-zinc-800/30 overflow-hidden">
                    <p className="text-lg font-bold text-white">{agent.tasks}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tasks</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalCount > 3 && (
          <button
            onClick={onToggleShowAll}
            className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-zinc-500 hover:text-violet-400 transition-colors rounded-lg hover:bg-zinc-800/40 mt-4"
          >
            {showAll ? (
              <>Show Less <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>See All ({totalCount}) <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
});
