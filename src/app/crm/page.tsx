"use client"

import React, { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency, timeAgo, cn } from "@/lib/utils"
import { mockCompanies, mockLeads } from "@/lib/mock-data"
import { CRMCompany } from "@/lib/types"
import {
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  DollarSign,
  Target,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Star,
  ArrowUpRight,
  ExternalLink,
  Briefcase,
  BarChart3,
  Layers,
  UserPlus,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"

const statusColors: Record<string, string> = {
  prospect: "bg-blue-500/10 text-blue-600",
  active: "bg-emerald-500/10 text-emerald-600",
  inactive: "bg-gray-500/10 text-gray-600",
  partner: "bg-violet-500/10 text-violet-600",
}

export default function CRMPage() {
  const [selectedCompany, setSelectedCompany] = useState<CRMCompany | null>(null)
  const [activeTab, setActiveTab] = useState("companies")
  const [showAddContact, setShowAddContact] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                CRM
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your companies, clients, leads, and relationships
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button size="sm" onClick={() => setShowAddContact(true)}>
                <UserPlus className="h-4 w-4 mr-2" /> Add Contact
              </Button>
              <Button size="sm">
                <Building2 className="h-4 w-4 mr-2" /> Add Company
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockCompanies.length}</p>
                    <p className="text-xs text-muted-foreground">Companies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockCompanies.reduce((a, c) => a + c.contacts.length, 0)}</p>
                    <p className="text-xs text-muted-foreground">Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockCompanies.reduce((a, c) => a + c.leads.length, 0)}</p>
                    <p className="text-xs text-muted-foreground">Active Leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(mockCompanies.reduce((a, c) => a + c.revenue, 0))}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 max-w-lg">
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="companies" className="space-y-4 mt-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search companies..." className="pl-10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockCompanies.map((company) => (
                  <Card key={company.id} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedCompany(company)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{company.name}</h3>
                          <p className="text-xs text-muted-foreground">{company.industry}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={cn("text-[10px]", statusColors[company.status])}>
                              {company.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{company.country}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(company.revenue)}</span>
                            <span className="text-xs text-muted-foreground">{company.contacts.length} contacts</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4 mt-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-10" />
              </div>
              <div className="space-y-3">
                {mockCompanies.flatMap(c => c.contacts).map(contact => {
                  const company = mockCompanies.find(c => c.id === contact.companyId)
                  return (
                    <Card key={contact.id} className="hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold">{contact.name}</h4>
                            <p className="text-xs text-muted-foreground">{contact.role} at {company?.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="meetings" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Meetings</h3>
                  <p className="text-sm text-muted-foreground mt-1">Schedule and manage your client meetings</p>
                  <Button className="mt-4"><Plus className="h-4 w-4 mr-2" /> Schedule Meeting</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Activity Timeline</h3>
                  <p className="text-sm text-muted-foreground mt-1">Track all interactions with your contacts</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Company Detail Dialog */}
          <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              {selectedCompany && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">{selectedCompany.name}</DialogTitle>
                    <DialogDescription>{selectedCompany.industry} · {selectedCompany.country}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn(statusColors[selectedCompany.status])}>{selectedCompany.status}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{selectedCompany.website}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-3">Contacts ({selectedCompany.contacts.length})</h4>
                        <div className="space-y-2">
                          {selectedCompany.contacts.map(contact => (
                            <div key={contact.id} className="p-3 rounded-lg bg-muted/30">
                              <p className="font-medium text-sm">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.role}</p>
                              <p className="text-xs text-muted-foreground">{contact.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />Revenue: {formatCurrency(selectedCompany.revenue)}</div>
                          <div className="flex items-center gap-2"><Target className="h-4 w-4 text-muted-foreground" />Active Leads: {selectedCompany.leads.length}</div>
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Created: {timeAgo(new Date(selectedCompany.createdAt))}</div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Notes</h4>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{selectedCompany.notes}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button><Mail className="h-4 w-4 mr-2" /> Send Email</Button>
                      <Button variant="outline"><Phone className="h-4 w-4 mr-2" /> Call</Button>
                      <Button variant="outline"><Calendar className="h-4 w-4 mr-2" /> Schedule Meeting</Button>
                      <Button variant="outline"><Edit3 className="h-4 w-4 mr-2" /> Edit</Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Contact Dialog */}
          <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>Add a new contact to your CRM</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input placeholder="+1-555-0123" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <Input placeholder="e.g. CTO, Project Manager" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Company</label>
                  <Input placeholder="Company name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <Textarea placeholder="Additional notes..." rows={3} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAddContact(false)}>Cancel</Button>
                  <Button onClick={() => setShowAddContact(false)}>Save Contact</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
