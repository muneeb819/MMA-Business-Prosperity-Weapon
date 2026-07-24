"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, MapPin, Clock, Star, Bookmark, ArrowUpRight, Eye, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, statusColors } from "./types"
import type { Discovery } from "./types"

interface DiscoveryFeedProps {
  discoveries: Discovery[]
  bookmarkedIds: Set<string>
  onToggleBookmark: (id: string) => void
  onSelectDiscovery: (discovery: Discovery) => void
}

function DiscoveryFeedInner({
  discoveries,
  bookmarkedIds,
  onToggleBookmark,
  onSelectDiscovery,
}: DiscoveryFeedProps) {
  return (
    <div className="space-y-3">
      {discoveries.length === 0 ? (
        <Card className="border-zinc-800/50 bg-zinc-900/80">
          <CardContent className="p-12 text-center">
            <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No discoveries match your filters</p>
            <p className="text-zinc-600 text-sm mt-1">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        discoveries.map((discovery) => (
          <Card
            key={discovery.id}
            className="card-hover glass border-zinc-800/50 bg-zinc-900/80 group"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold group-hover:text-white transition-colors truncate">
                          {discovery.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs capitalize shrink-0",
                            statusColors[discovery.status]
                          )}
                        >
                          {discovery.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mt-0.5 truncate">
                        {discovery.company} - {discovery.industry}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold text-emerald-400">
                        {formatCurrency(discovery.dealSize)}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium">
                          {discovery.score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {discovery.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {discovery.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {discovery.discoveredAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {discovery.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-zinc-400 hover:text-white"
                    onClick={() => onSelectDiscovery(discovery)}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-9 w-9 p-0",
                      bookmarkedIds.has(discovery.id)
                        ? "text-amber-400 hover:text-amber-300"
                        : "text-zinc-400 hover:text-white"
                    )}
                    onClick={() => onToggleBookmark(discovery.id)}
                    title={bookmarkedIds.has(discovery.id) ? "Remove Bookmark" : "Bookmark"}
                  >
                    <Bookmark className={cn("w-4 h-4", bookmarkedIds.has(discovery.id) && "fill-amber-400")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-zinc-400 hover:text-white"
                    onClick={() => window.open(discovery.website, "_blank")}
                    title="Open Website"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export const DiscoveryFeed = memo(DiscoveryFeedInner)
