"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageTransition } from "@/components/page-transition"
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/glass-card"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Users, Building2 } from "lucide-react"

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const events = [
  { day: 15, title: "Client Meeting: TechCorp", time: "10:00 AM", type: "meeting", attendees: 3 },
  { day: 15, title: "Proposal Review", time: "2:00 PM", type: "review", attendees: 2 },
  { day: 17, title: "Lead Qualification Call", time: "11:30 AM", type: "call", attendees: 1 },
  { day: 19, title: "Strategy Session", time: "9:00 AM", type: "meeting", attendees: 5 },
  { day: 22, title: "Q3 Planning", time: "1:00 PM", type: "review", attendees: 4 },
]

const typeColors: Record<string, string> = {
  meeting: "border-l-indigo-500 bg-indigo-500/10",
  review: "border-l-rose-500 bg-rose-500/10",
  call: "border-l-emerald-500 bg-emerald-500/10",
}

export default function CalendarPage() {
  const [currentMonth] = useState("March 2025")
  const [selectedDay, setSelectedDay] = useState(15)

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
  const firstDayOffset = 6

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
                <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg border border-primary/30 hover:bg-primary/30 transition-all text-sm">
                  <Plus className="w-4 h-4" /> Add Event
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GlassCard glow="blue">
                    <GlassCardContent>
                      <div className="flex items-center justify-between mb-6">
                        <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-all">
                          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <h2 className="text-base font-semibold text-foreground">{currentMonth}</h2>
                        <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-all">
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
                        {daysInMonth.map((day) => {
                          const hasEvents = events.some((e) => e.day === day)
                          return (
                            <button
                              key={day}
                              onClick={() => setSelectedDay(day)}
                              className={`relative p-2 text-sm rounded-lg transition-all ${
                                selectedDay === day
                                  ? "bg-primary/20 text-primary border border-primary/30"
                                  : hasEvents
                                    ? "text-foreground hover:bg-muted/50"
                                    : "text-muted-foreground hover:bg-muted/50"
                              }`}
                            >
                              {day}
                              {hasEvents && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                              )}
                            </button>
                          )
                        })}
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
                    <GlassCardContent className="space-y-3">
                      {events
                        .filter((e) => e.day === selectedDay)
                        .map((event, i) => (
                          <div key={i} className={`p-3 rounded-lg border-l-2 ${typeColors[event.type] || typeColors.meeting}`}>
                            <p className="text-sm font-medium text-foreground">{event.title}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {event.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {event.attendees}
                              </span>
                            </div>
                          </div>
                        ))}
                      {events.filter((e) => e.day === selectedDay).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">No events for this day</p>
                      )}
                    </GlassCardContent>
                  </GlassCard>

                  <GlassCard glow="emerald">
                    <GlassCardHeader>
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" /> Upcoming
                      </h2>
                    </GlassCardHeader>
                    <GlassCardContent className="space-y-2">
                      {events.slice(0, 3).map((event, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all">
                          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {event.day}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                          </div>
                        </div>
                      ))}
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
