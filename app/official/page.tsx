"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/risk-badge"
import { StatusBadge } from "@/components/status-badge"
import { ClipboardCheck, AlertTriangle, CheckCircle, Clock, Shield } from "lucide-react"
import type { WaterLoggingReport, Ward, ReportStatus } from "@/lib/types"
import { WaterLoggingChat } from "@/components/WaterLoggingChat"  // ✅ add this

export default function OfficialDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<WaterLoggingReport[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [assignedWards] = useState<string[]>(["nd-w1", "nd-w2", "nd-w3", "cd-w1", "cd-w2"]) // Mock assignment
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "OFFICIAL")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Fetch all reports
    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        // Filter reports for assigned wards
        const assignedReports = data.filter((r: WaterLoggingReport) =>
          assignedWards.includes(r.wardId),
        )
        setReports(assignedReports)
      })

    // Fetch wards data
    Promise.all([
      fetch("/api/districts/nd/wards").then((res) => res.json()),
      fetch("/api/districts/cd/wards").then((res) => res.json()),
    ]).then(([ndWards, cdWards]) => {
      const allWards = [...ndWards, ...cdWards]
      const assigned = allWards.filter((w: Ward) => assignedWards.includes(w.id))
      setWards(assigned)
    })
  }, [assignedWards])

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    setIsUpdating(reportId)
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
        )
      }
    } catch (error) {
      console.error("Failed to update report:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading || !user) {
    return null
  }

  const newReports = reports.filter((r) => r.status === "NEW")
  const inProgressReports = reports.filter((r) => r.status === "IN_PROGRESS")
  const resolvedReports = reports.filter((r) => r.status === "RESOLVED")
  const highRiskWards = wards.filter((w) => w.riskLevel === "HIGH")

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Official Dashboard</h1>
          <p className="text-muted-foreground">
            PWD/Traffic Department - Manage water-logging incidents
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="New Reports"
            value={newReports.length}
            icon={AlertTriangle}
            description="Awaiting action"
          />
          <StatCard
            title="In Progress"
            value={inProgressReports.length}
            icon={Clock}
            description="Being handled"
          />
          <StatCard
            title="Resolved Today"
            value={resolvedReports.length}
            icon={CheckCircle}
            description="Completed"
          />
          <StatCard
            title="High Risk Wards"
            value={highRiskWards.length}
            icon={Shield}
            description="Need attention"
          />
        </div>

        {/* Assigned Wards Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Wards</CardTitle>
            <CardDescription>Wards under your supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {wards.map((ward) => {
                const wardReports = reports.filter((r) => r.wardId === ward.id)
                const wardNewReports = wardReports.filter((r) => r.status === "NEW")
                const wardInProgress = wardReports.filter((r) => r.status === "IN_PROGRESS")

                return (
                  <div key={ward.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">{ward.name}</h4>
                      <RiskBadge level={ward.riskLevel} />
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Risk Score:</span>
                        <span className="font-medium">{ward.riskScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Reports:</span>
                        <span className="font-medium text-destructive">
                          {wardNewReports.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>In Progress:</span>
                        <span className="font-medium text-warning">
                          {wardInProgress.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reports Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Reports Management
            </CardTitle>
            <CardDescription>
              Review and update status of water-logging reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center text-center">
                <div>
                  <ClipboardCheck className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No reports in your assigned wards
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* New Reports Section */}
                {newReports.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      New Reports ({newReports.length})
                    </h3>
                    <div className="space-y-3">
                      {newReports.map((report) => (
                        <div
                          key={report.id}
                          className="rounded-lg border-2 border-destructive/20 bg-card p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h4 className="font-medium">{report.location}</h4>
                                <RiskBadge level={report.severity} />
                                <StatusBadge status={report.status} />
                              </div>
                              <p className="mb-2 text-sm text-muted-foreground">
                                {report.description}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                  <strong>Ward:</strong> {report.wardName}
                                </span>
                                <span>
                                  <strong>Reporter:</strong> {report.userName}
                                </span>
                                <span>
                                  <strong>Time:</strong>{" "}
                                  {new Date(report.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusUpdate(report.id, "IN_PROGRESS")
                                }
                                disabled={isUpdating === report.id}
                              >
                                {isUpdating === report.id ? "Updating..." : "Start Work"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(report.id, "RESOLVED")
                                }
                                disabled={isUpdating === report.id}
                              >
                                Mark Resolved
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In Progress Reports Section */}
                {inProgressReports.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
                      <Clock className="h-4 w-4" />
                      In Progress ({inProgressReports.length})
                    </h3>
                    <div className="space-y-3">
                      {inProgressReports.map((report) => (
                        <div
                          key={report.id}
                          className="rounded-lg border border-border bg-card p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h4 className="font-medium">{report.location}</h4>
                                <RiskBadge level={report.severity} />
                                <StatusBadge status={report.status} />
                              </div>
                              <p className="mb-2 text-sm text-muted-foreground">
                                {report.description}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                  <strong>Ward:</strong> {report.wardName}
                                </span>
                                <span>
                                  <strong>Reporter:</strong> {report.userName}
                                </span>
                                <span>
                                  <strong>Time:</strong>{" "}
                                  {new Date(report.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(report.id, "RESOLVED")
                              }
                              disabled={isUpdating === report.id}
                            >
                              {isUpdating === report.id ? "Updating..." : "Mark Resolved"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolved Reports Section */}
                {resolvedReports.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      Resolved ({resolvedReports.length})
                    </h3>
                    <div className="space-y-3">
                      {resolvedReports.slice(0, 3).map((report) => (
                        <div
                          key={report.id}
                          className="rounded-lg border border-border bg-card p-4 opacity-60"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <h4 className="font-medium">{report.location}</h4>
                                <RiskBadge level={report.severity} />
                                <StatusBadge status={report.status} />
                              </div>
                              <p className="mb-2 text-sm text-muted-foreground">
                                {report.description}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>
                                  <strong>Ward:</strong> {report.wardName}
                                </span>
                                <span>
                                  <strong>Reported:</strong>{" "}
                                  {new Date(report.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Officer-specific chatbot */}
      <WaterLoggingChat role="official" />
    </DashboardLayout>
  )
}
