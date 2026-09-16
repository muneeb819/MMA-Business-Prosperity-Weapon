"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Settings, CheckCircle, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchCategory } from "./types"

interface ConfigPanelProps {
  categories: SearchCategory[]
  onToggleCategory: (id: string) => void
  searchFrequency: string
  onSearchFrequencyChange: (value: string) => void
  minDealSize: string
  onMinDealSizeChange: (value: string) => void
  targetRegion: string
  onTargetRegionChange: (value: string) => void
  onSave: () => void
}

function ConfigPanelInner({
  categories,
  onToggleCategory,
  searchFrequency,
  onSearchFrequencyChange,
  minDealSize,
  onMinDealSizeChange,
  targetRegion,
  onTargetRegionChange,
  onSave,
}: ConfigPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/80">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Search Categories</CardTitle>
              <CardDescription>Select industries and segments to target</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button key={category.id} onClick={() => onToggleCategory(category.id)}
                className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                  category.selected
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    : "bg-zinc-800/30 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                )}>
                {category.selected && <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />}
                {category.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover glass border-zinc-800/50 bg-zinc-900/80">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Search Settings</CardTitle>
              <CardDescription>Configure search frequency and behavior</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Search Frequency</label>
            <Select value={searchFrequency} onValueChange={onSearchFrequencyChange}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-800"><SelectValue placeholder="Select frequency" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Minimum Deal Size</label>
            <Select value={minDealSize} onValueChange={onMinDealSizeChange}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-800"><SelectValue placeholder="Select minimum" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="10000">$10,000+</SelectItem>
                <SelectItem value="50000">$50,000+</SelectItem>
                <SelectItem value="100000">$100,000+</SelectItem>
                <SelectItem value="250000">$250,000+</SelectItem>
                <SelectItem value="500000">$500,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Target Regions</label>
            <Select value={targetRegion} onValueChange={onTargetRegionChange}>
              <SelectTrigger className="bg-zinc-800/50 border-zinc-800"><SelectValue placeholder="Select regions" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="na">North America</SelectItem>
                <SelectItem value="eu">Europe</SelectItem>
                <SelectItem value="apac">Asia Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white"
              onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const ConfigPanel = memo(ConfigPanelInner)
