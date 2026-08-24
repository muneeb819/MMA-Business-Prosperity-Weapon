"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Download, RefreshCw, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { platformFilters, countryFilters, technologyFilters, industryFilters } from "./types"

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedFilter: string
  onFilterChange: (value: string) => void
  activePlatform: string
  onPlatformChange: (value: string) => void
  activeCountry: string
  onCountryChange: (value: string) => void
  activeTechnology: string
  onTechnologyChange: (value: string) => void
  activeIndustry: string
  onIndustryChange: (value: string) => void
  onExport: () => void
  onResetFilters: () => void
}

function FilterBarInner({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  activePlatform,
  onPlatformChange,
  activeCountry,
  onCountryChange,
  activeTechnology,
  onTechnologyChange,
  activeIndustry,
  onIndustryChange,
  onExport,
  onResetFilters,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search discoveries..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-zinc-900/50 border-zinc-800/50 focus-visible:ring-cyan-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-800 hover:bg-zinc-800/50"
          onClick={onExport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-zinc-800 hover:bg-zinc-800/50"
          onClick={onResetFilters}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-500 font-medium mr-1">Platform:</span>
        {platformFilters.map((pf) => (
          <button
            key={pf.id}
            onClick={() => onPlatformChange(pf.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border",
              activePlatform === pf.id
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                : "bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
            )}
          >
            {pf.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Country:</span>
          <Select value={activeCountry} onValueChange={onCountryChange}>
            <SelectTrigger className="h-8 w-[160px] bg-zinc-900/50 border-zinc-800/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {countryFilters.map((cf) => (
                <SelectItem key={cf.id} value={cf.id} className="text-xs">
                  {cf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Industry:</span>
          <Select value={activeIndustry} onValueChange={onIndustryChange}>
            <SelectTrigger className="h-8 w-[180px] bg-zinc-900/50 border-zinc-800/50 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {industryFilters.map((inf) => (
                <SelectItem key={inf.id} value={inf.id} className="text-xs">
                  {inf.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Technology:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {technologyFilters.map((tf) => (
              <button
                key={tf.id}
                onClick={() => onTechnologyChange(tf.id)}
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 border",
                  activeTechnology === tf.id
                    ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                    : "bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-zinc-500" />
        {["all", "new", "contacted", "qualified", "proposal-sent", "negotiation"].map(
          (filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter)}
              className={cn(
                "capitalize h-8 text-xs",
                selectedFilter === filter
                  ? "bg-zinc-800 text-white"
                  : "border-zinc-800 text-zinc-400 hover:bg-zinc-800/50"
              )}
            >
              {filter.replace("-", " ")}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

export const FilterBar = memo(FilterBarInner)
