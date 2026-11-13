"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageTransition } from "@/components/page-transition"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/glass-card"
import { Calendar, ChevronLeft, ChevronRight, CalendarPlus, Inbox } from "lucide-react"

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const [view, setView] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }))
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const daysInMonth = useMemo(
    () => new Date(view.year, view.month + 1, 0).getDate(),
    [view.year, view.month],
  )
  const firstDayOffset = useMemo(
    () => new Date(view.year, view.month, 1).getDay(),
    [view.year, view.month],
  )
  const monthLabel = new Date(view.year, view.month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const isToday = (day: number) =>
    day === today.getDate() && view.month === today.getMonth() && view.year === today.getFullYear()

  const shiftMonth = (delta: number) => {
    setView((v) => {
      const next = new Date(v.year, v.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
    setSelectedDay(1)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <PageTransition>
            <div className="space-y-6">
              <Breadcrumbs />
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                    Calendar
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">Schedule & event management</p>
                </div>
                <button
                  disabled
                  title="Event storage isn't connected to the backend yet — no events will be fabricated."
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary/50 rounded-lg border border-primary/15 cursor-not-allowed text-sm opacity-70"
                >
                  <CalendarPlus className="w-4 h-4" /> Add Event
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GlassCard glow="blue">
                    <GlassCardContent>
                      <div className="flex items-center justify-between mb-6">
                        <button
                          onClick={() => shiftMonth(-1)}
                          aria-label="Previous month"
                          className="p-1.5 rounded-lg hover:bg-muted/50 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <h2 className="text-base font-semibold text-foreground">{monthLabel}</h2>
                        <button
                          onClick={() => shiftMonth(1)}
                          aria-label="Next month"
                          className="p-1.5 rounded-lg hover:bg-muted/50 transition-all"
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {weekdays.map((day) => (
                          <div key={day} className="text-center text-xs text-muted-foreground py-2 font-medium">
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: firstDayOffset }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`relative p-2 text-sm rounded-lg transition-all ${
                              selectedDay === day
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : isToday(day)
                                  ? "text-foreground font-semibold bg-muted/60 hover:bg-muted"
                                  : "text-muted-foreground hover:bg-muted/50"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </div>

                <div className="space-y-4">
                  <GlassCard glow="purple">
                    <GlassCardHeader>
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-400" />
                        Events for Day {selectedDay}
                      </h2>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="text-center py-6 space-y-2">
                        <Inbox className="w-7 h-7 mx-auto text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No events for this day</p>
                        <p className="text-xs text-muted-foreground/70">
                          Events will appear here once event storage is connected.
                        </p>
                      </div>
                    </GlassCardContent>
                  </GlassCard>

                  <GlassCard glow="emerald">
                    <GlassCardHeader>
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-400" /> Upcoming
                      </h2>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="text-center py-6 space-y-2">
                        <Inbox className="w-7 h-7 mx-auto text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No upcoming events</p>
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </div>
              </div>
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
