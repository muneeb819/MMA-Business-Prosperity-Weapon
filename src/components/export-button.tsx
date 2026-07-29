"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ExportCSV({ data, filename, label = "Export CSV" }: { data: Record<string, any>[]; filename: string; label?: string }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    setExporting(true)
    try {
      if (!data || data.length === 0) return
      const headers = Object.keys(data[0])
      const csv = [headers.join(","), ...data.map((row) => headers.map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
    setExporting(false)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} disabled={exporting || !data || data.length === 0} className="text-xs text-zinc-400 hover:text-white h-7 px-2">
      <Download className="w-3 h-3 mr-1" />
      {exporting ? "Exporting..." : label}
    </Button>
  )
}
