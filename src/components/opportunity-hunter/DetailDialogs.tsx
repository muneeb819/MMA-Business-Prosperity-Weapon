"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Globe, Play, Pause, ExternalLink, MapPin, Mail, Star, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, statusColors } from "./types"
import type { Source, Discovery } from "./types"

interface DetailDialogsProps {
  selectedSource: Source | null
  onCloseSource: () => void
  sourceStatuses: Record<string, string>
  onToggleSourceStatus: (id: string) => void
  selectedDiscovery: Discovery | null
  onCloseDiscovery: () => void
  bookmarkedIds: Set<string>
  onToggleBookmark: (id: string) => void
  showConfigDialog: boolean
  onCloseConfigDialog: () => void
  searchFrequency: string
  onSearchFrequencyChange: (v: string) => void
  minDealSize: string
  onMinDealSizeChange: (v: string) => void
  targetRegion: string
  onTargetRegionChange: (v: string) => void
  onConfigSave: () => void
}

function DetailDialogsInner({
  selectedSource, onCloseSource, sourceStatuses, onToggleSourceStatus,
  selectedDiscovery, onCloseDiscovery, bookmarkedIds, onToggleBookmark,
  showConfigDialog, onCloseConfigDialog,
  searchFrequency, onSearchFrequencyChange,
  minDealSize, onMinDealSizeChange,
  targetRegion, onTargetRegionChange, onConfigSave,
}: DetailDialogsProps) {
  return (
    <>
      {/* Source Detail Dialog */}
      <Dialog open={!!selectedSource} onOpenChange={(open) => !open && onCloseSource()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 z-50 max-w-lg">
          {selectedSource && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br", selectedSource.gradient)}>
                    <selectedSource.icon className="w-5 h-5 text-white" />
                  </div>
                  {selectedSource.name}
                </DialogTitle>
                <DialogDescription>{selectedSource.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Leads Found</p>
                    <p className="text-xl font-bold text-cyan-400">{selectedSource.leadsFound}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Status</p>
                    <p className="text-xl font-bold text-emerald-400 capitalize">{sourceStatuses[selectedSource.id]}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Accuracy</p>
                    <p className="text-xl font-bold text-violet-400">{selectedSource.metrics.accuracy}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Speed</p>
                    <p className="text-xl font-bold text-amber-400">{selectedSource.metrics.speed}%</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-500">Last scan: {selectedSource.lastScan}</div>
                <Button className="w-full" variant="outline" onClick={() => onToggleSourceStatus(selectedSource.id)}>
                  {sourceStatuses[selectedSource.id] === "active"
                    ? <><Pause className="w-4 h-4 mr-2" />Pause Source</>
                    : <><Play className="w-4 h-4 mr-2" />Activate Source</>}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Discovery Detail Dialog */}
      <Dialog open={!!selectedDiscovery} onOpenChange={(open) => !open && onCloseDiscovery()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 z-50 overflow-y-auto max-h-[85vh] max-w-2xl">
          {selectedDiscovery && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedDiscovery.title}
                  <Badge variant="secondary" className={cn("text-xs capitalize", statusColors[selectedDiscovery.status])}>
                    {selectedDiscovery.status.replace("-", " ")}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedDiscovery.company}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-zinc-400">{selectedDiscovery.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Deal Size</p>
                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(selectedDiscovery.dealSize)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Score</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <p className="text-xl font-bold text-amber-400">{selectedDiscovery.score}%</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedDiscovery.location}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{selectedDiscovery.source}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedDiscovery.contact}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedDiscovery.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800">{tag}</span>
                  ))}
                </div>
                {/* Point of Contact Section */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4">
                  <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Point of Contact
                  </h4>
                  <div className="space-y-2">
                    {selectedDiscovery.contactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">Email</span>
                        <a href={`mailto:${selectedDiscovery.contactEmail}`} className="text-cyan-400 hover:underline">{selectedDiscovery.contactEmail}</a>
                      </div>
                    )}
                    {selectedDiscovery.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">Phone</span>
                        <span className="text-white">{selectedDiscovery.contactPhone}</span>
                      </div>
                    )}
                    {selectedDiscovery.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">Website</span>
                        <a href={selectedDiscovery.website} target="_blank" rel="noopener" className="text-cyan-400 hover:underline truncate max-w-[200px]">{selectedDiscovery.website}</a>
                      </div>
                    )}
                    {selectedDiscovery.contactLinkedIn && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">LinkedIn</span>
                        <a href={selectedDiscovery.contactLinkedIn} target="_blank" rel="noopener" className="text-cyan-400 hover:underline">Company Page</a>
                      </div>
                    )}
                    {selectedDiscovery.contactFacebook && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">Facebook</span>
                        <a href={selectedDiscovery.contactFacebook} target="_blank" rel="noopener" className="text-cyan-400 hover:underline">Company Page</a>
                      </div>
                    )}
                    {selectedDiscovery.contactTwitter && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">Twitter</span>
                        <a href={selectedDiscovery.contactTwitter} target="_blank" rel="noopener" className="text-cyan-400 hover:underline">Profile</a>
                      </div>
                    )}
                    {selectedDiscovery.contactInstagram && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">Instagram</span>
                        <a href={selectedDiscovery.contactInstagram} target="_blank" rel="noopener" className="text-cyan-400 hover:underline">Profile</a>
                      </div>
                    )}
                    {selectedDiscovery.contactWhatsApp && selectedDiscovery.contactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 w-16 text-xs">WhatsApp</span>
                        <a href={selectedDiscovery.contactWhatsApp} target="_blank" rel="noopener" className="text-emerald-400 hover:underline">Send Message</a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                    onClick={() => window.open(selectedDiscovery.website, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />Open Website
                  </Button>
                  <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800/50"
                    onClick={() => onToggleBookmark(selectedDiscovery.id)}>
                    <Bookmark className={cn("w-4 h-4", bookmarkedIds.has(selectedDiscovery.id) && "fill-amber-400 text-amber-400")} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={onCloseConfigDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 z-50 max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Configuration</DialogTitle>
            <DialogDescription>Adjust core hunter settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Search Frequency</label>
              <Select value={searchFrequency} onValueChange={onSearchFrequencyChange}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Minimum Deal Size</label>
              <Select value={minDealSize} onValueChange={onMinDealSizeChange}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="10000">$10,000+</SelectItem>
                  <SelectItem value="50000">$50,000+</SelectItem>
                  <SelectItem value="100000">$100,000+</SelectItem>
                  <SelectItem value="250000">$250,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Target Region</label>
              <Select value={targetRegion} onValueChange={onTargetRegionChange}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="na">North America</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="apac">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
              onClick={onConfigSave}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const DetailDialogs = memo(DetailDialogsInner)
