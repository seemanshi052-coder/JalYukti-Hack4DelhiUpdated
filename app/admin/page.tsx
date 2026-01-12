"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/risk-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LayoutDashboard, AlertTriangle, Bell, Activity, TrendingUp, Settings } from "lucide-react"
import type { WaterLoggingReport, Ward, Alert, PumpDeployment } from "@/lib/types"

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<WaterLoggingReport[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [pumpDeployments, setPumpDeployments] = useState<PumpDeployment[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Fetch all data
    Promise.all([
      fetch("/api/reports").then((res) => res.json()),
      fetch("/api/alerts").then((res) => res.json()),
      fetch("/api/pump-deployments").then((res) => res.json()),
      fetch("/api/districts").then((res) => res.json()),
    ]).then(([reportsData, alertsData, pumpsData, districtsData]) => {
      setReports(reportsData)
      setAlerts(alertsData)
      setPumpDeployments(pumpsData)

      // Fetch all wards
      Promise.all(
        districtsData.map((d: { id: string }) =>
          fetch(`/api/districts/${d.id}/wards`).then((res) => res.json()),
        ),
      ).then((wardsArrays) => {
        const allWards: Ward[] = wardsArrays.flat()

        // ---- DEMO: inject random riskScore + riskLevel when missing/zero ----
        const demoWards: Ward[] = allWards.map((ward) => {
          // if backend already has a non-zero score, keep it
          if (ward.riskScore && ward.riskScore > 0) {
            // ensure riskLevel is consistent
            if (!ward.riskLevel) {
              let lvl: "LOW" | "MEDIUM" | "HIGH"
              if (ward.riskScore >= 70) lvl = "HIGH"
              else if (ward.riskScore >= 40) lvl = "MEDIUM"
              else lvl = "LOW"
              return { ...ward, riskLevel: lvl }
            }
            return ward
          }

          // otherwise create random demo score 0–100
          const score = Math.floor(Math.random() * 101)

          let level: "LOW" | "MEDIUM" | "HIGH"
          if (score >= 70) level = "HIGH"
          else if (score >= 40) level = "MEDIUM"
          else level = "LOW"

          return {
            ...ward,
            riskScore: score,
            riskLevel: level,
          }
        })
        // ---------------------------------------------------------------------

        setWards(demoWards)
      })
    })
  }, [])

  if (isLoading || !user) {
    return null
  }

  const today = new Date().toDateString()
  const todayReports = reports.filter((r) => new Date(r.timestamp).toDateString() === today)
  const highRiskWards = wards.filter((w) => w.riskLevel === "HIGH")
  const totalPumps = pumpDeployments.reduce((sum, d) => sum + d.pumpCount, 0)

  // Sort wards by risk score
  const topRiskWards = [...wards].sort((a, b) => b.riskScore - a.riskScore).slice(0, 10)

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">City Admin Dashboard</h1>
          <p className="text-muted-foreground">Delhi-wide water-logging management and analytics</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Reports Today"
            value={todayReports.length}
            icon={AlertTriangle}
            description="Across all wards"
            trend={{ value: "+12% from yesterday", isPositive: false }}
          />
          <StatCard
            title="High Risk Wards"
            value={highRiskWards.length}
            icon={TrendingUp}
            description={`Out of 250 total`}

          />
          <StatCard title="Active Alerts" value={alerts.length} icon={Bell} description="City-wide notifications" />
          <StatCard
            title="Pumps Deployed"
            value={totalPumps}
            icon={Activity}
            description={`${pumpDeployments.length} locations`}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => router.push("/admin/pumps")}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Pump Deployments
            </Button>
            <Button variant="outline" onClick={() => router.push("/map")}>
              View Full Map
            </Button>
            <Button variant="outline">Generate Report</Button>
          </CardContent>
        </Card>

        {/* Ward-wise Risk Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 High-Risk Wards</CardTitle>
            <CardDescription>Wards requiring immediate attention based on risk score</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ward Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Reports</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRiskWards.map((ward) => {
                  const wardReports = reports.filter((r) => r.wardId === ward.id)
                  return (
                    <TableRow key={ward.id}>
                      <TableCell className="font-medium">{ward.name}</TableCell>
                      <TableCell>
                        {wards.find((w) => w.districtId === ward.districtId)?.name ||
                          ward.districtId.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full ${
                                ward.riskScore >= 70
                                  ? "bg-destructive"
                                  : ward.riskScore >= 40
                                  ? "bg-warning"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${ward.riskScore}%` }}
                            />
                          </div>
                          <span className="text-sm">{ward.riskScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={ward.riskLevel} />
                      </TableCell>
                      <TableCell>{wardReports.length}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Latest water-logging incidents across Delhi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        report.severity === "HIGH"
                          ? "bg-destructive"
                          : report.severity === "MEDIUM"
                          ? "bg-warning"
                          : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{report.location}</h4>
                      <p className="text-xs text-muted-foreground">
                        {report.wardName} • {new Date(report.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <RiskBadge level={report.severity} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>City-wide notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        alert.severity === "HIGH"
                          ? "bg-destructive"
                          : alert.severity === "MEDIUM"
                          ? "bg-warning"
                          : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{alert.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {alert.wardName || alert.districtName || "City-wide"} •{" "}
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <RiskBadge level={alert.severity} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>Delhi water-logging management system statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Wards</p>
                <h3 className="mt-1 text-2xl font-bold">{wards.length}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Across 10 districts</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <h3 className="mt-1 text-2xl font-bold">{reports.length}</h3>
                <p className="mt-1 text-xs text-muted-foreground">All time</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <h3 className="mt-1 text-2xl font-bold">2.4h</h3>
                <p className="mt-1 text-xs text-green-500">18% faster than target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
