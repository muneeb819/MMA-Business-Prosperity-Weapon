"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Connector } from "@/lib/types";
import {
  Cable,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
  Database,
  Globe,
  Rss,
  Check,
  X,
} from "lucide-react";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-5">
      <Check className="w-4 h-4 text-teal-400 shrink-0" />
      <span className="text-sm text-white">{message}</span>
      <button onClick={onClose} className="ml-2 text-zinc-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

const connectorTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  scraper: { label: "Scraper", icon: Globe, color: "text-cyan-400" },
  api: { label: "API", icon: Zap, color: "text-amber-400" },
  rss: { label: "RSS Feed", icon: Rss, color: "text-orange-400" },
  webhook: { label: "Webhook", icon: Database, color: "text-violet-400" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  inactive: { label: "Inactive", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/30" },
  syncing: { label: "Syncing", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  error: { label: "Error", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

export default function ConnectorsPage() {
  useEffect(() => { document.title = "Connectors | MBPW"; }, []);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("scraper");
  const [newPlatform, setNewPlatform] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => { setToastMsg(msg); }, []);

  const fetchConnectors = useCallback(async () => {
    try {
      const data = await api.connectors.list();
      setConnectors(Array.isArray(data) ? data : []);
    } catch {
      setConnectors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConnectors(); }, [fetchConnectors]);

  const handleSync = useCallback(async (id: string) => {
    setSyncingId(id);
    try {
      await api.connectors.sync(id);
      await fetchConnectors();
      showToast("Sync completed");
    } catch { showToast("Sync failed"); } finally {
      setSyncingId(null);
    }
  }, [fetchConnectors, showToast]);

  const handleToggle = useCallback(async (c: Connector) => {
    const newStatus = c.status === "active" ? "inactive" : "active";
    await api.connectors.update(c.id, { status: newStatus });
    await fetchConnectors();
    showToast(newStatus === "active" ? "Connector started" : "Connector paused");
  }, [fetchConnectors, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    await api.connectors.delete(id);
    await fetchConnectors();
    showToast("Connector removed");
  }, [fetchConnectors, showToast]);

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) { showToast("Name is required"); return; }
    await api.connectors.create({ name: newName, type: newType, platform: newPlatform || undefined });
    setShowAdd(false);
    setNewName("");
    setNewType("scraper");
    setNewPlatform("");
    await fetchConnectors();
    showToast("Connector created");
  }, [newName, newType, newPlatform, fetchConnectors, showToast]);

  const totalLeads = connectors.reduce((sum, c) => sum + (c.leadsFound || 0), 0);
  const activeCount = connectors.filter((c) => c.status === "active").length;
  const errorCount = connectors.filter((c) => c.status === "error").length;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20">
                    <Cable className="w-6 h-6 text-teal-400" />
                  </div>
                  Connectors
                </h1>
                <p className="text-sm text-zinc-500 mt-1">Manage data sources and integrations</p>
              </div>
              <Button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Add Connector
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-zinc-900/60 border-white/[0.06]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Sources</span>
                    <Cable className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{connectors.length}</div>
                  <div className="text-xs text-zinc-500 mt-1">{activeCount} active</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/60 border-white/[0.06]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Leads Found</span>
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{totalLeads.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500 mt-1">across all sources</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/60 border-white/[0.06]">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Errors</span>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{errorCount}</div>
                  <div className="text-xs text-zinc-500 mt-1">need attention</div>
                </CardContent>
              </Card>
            </div>

            {loading ? (
              <div className="text-center py-20 text-zinc-500">Loading connectors...</div>
            ) : connectors.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                <Cable className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No connectors configured</p>
                <p className="text-sm mt-1">Add a connector to start pulling leads from external sources</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectors.map((c) => {
                  const typeInfo = connectorTypeConfig[c.type] || connectorTypeConfig.scraper;
                  const statusInfo = statusConfig[c.status] || statusConfig.inactive;
                  const TypeIcon = typeInfo.icon;
                  const isSyncing = syncingId === c.id;
                  return (
                    <Card key={c.id} className="bg-zinc-900/60 border-white/[0.06] hover:border-white/[0.1] transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]`}>
                            <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                              <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${statusInfo.bg} ${statusInfo.color} border`}>
                                {statusInfo.label}
                              </Badge>
                              {c.platform && (
                                <Badge variant="outline" className="text-[10px] text-zinc-500 bg-white/[0.02] border-white/[0.06] px-2 py-0.5 capitalize">
                                  {c.platform}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                              <span>{typeInfo.label}</span>
                              <span>{c.leadsFound || 0} leads found</span>
                              <span>{c.syncCount || 0} syncs</span>
                              {c.lastSyncAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(c.lastSyncAt).toLocaleDateString()}
                                </span>
                              )}
                              {c.errorMessage && (
                                <span className="text-red-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {c.errorMessage}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSync(c.id)}
                              disabled={isSyncing}
                              className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-9"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                              Sync
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggle(c)}
                              className="border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white h-9"
                            >
                              {c.status === "active" ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                              {c.status === "active" ? "Pause" : "Start"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(c.id)}
                              className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 h-9"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogContent className="bg-[#0D0E18] border-white/[0.08] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20">
                      <Plus className="w-5 h-5 text-teal-400" />
                    </div>
                    Add Connector
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500 text-sm">
                    Connect a new data source to automatically discover leads.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Name</label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Upwork Scraper" className="bg-white/[0.03] border-white/[0.08] text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Type</label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#12131C] border-white/10">
                        <SelectItem value="scraper">Scraper</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="rss">RSS Feed</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Platform (optional)</label>
                    <Input value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)} placeholder="e.g. upwork, indeed, linkedin" className="bg-white/[0.03] border-white/[0.08] text-white" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleAdd} disabled={!newName.trim()} className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold h-11">
                    <Plus className="w-4 h-4 mr-2" /> Create Connector
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-white h-11 px-4">Cancel</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </ScrollArea>
      </main>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
