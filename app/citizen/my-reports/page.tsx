"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/risk-badge"
import { StatusBadge } from "@/components/status-badge"
import { FileText, AlertTriangle } from "lucide-react"
import type { WaterLoggingReport } from "@/lib/types"

export default function MyReportsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<WaterLoggingReport[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "CITIZEN")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      // Fetch all reports and filter by user
      fetch("/api/reports")
        .then((res) => res.json())
        .then((data: WaterLoggingReport[]) => {
          const userReports = data.filter((r) => r.userId === user.id)
          setReports(userReports)
        })
    }
  }, [user])

  if (isLoading || !user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
            <p className="text-muted-foreground">View all water-logging incidents you have reported</p>
          </div>
          <Button onClick={() => router.push("/citizen/report")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Reports ({reports.length})</CardTitle>
            <CardDescription>Track the status of your submitted water-logging reports</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-1 font-medium">No reports yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">You haven't submitted any water-logging reports</p>
                <Button onClick={() => router.push("/citizen/report")}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Water-Logging
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="font-medium">{report.location}</h4>
                          <RiskBadge level={report.severity} />
                          <StatusBadge status={report.status} />
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">{report.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            <strong>Ward:</strong> {report.wardName}
                          </span>
                          <span>
                            <strong>District:</strong> {report.districtName}
                          </span>
                          <span>
                            <strong>Reported:</strong> {new Date(report.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
