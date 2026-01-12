"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/risk-badge"
import { Navigation, AlertTriangle, MapPin, Route, TrendingUp } from "lucide-react"
import type { District, Ward, Alert } from "@/lib/types"
import { WaterLoggingChat } from "@/components/WaterLoggingChat"

export default function CommuterDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [startWard, setStartWard] = useState<string>("")
  const [endWard, setEndWard] = useState<string>("")
  const [startWardData, setStartWardData] = useState<Ward | null>(null)
  const [endWardData, setEndWardData] = useState<Ward | null>(null)
  const [routeAlerts, setRouteAlerts] = useState<Alert[]>([])
  const [allWards, setAllWards] = useState<Ward[]>([])

  // --- demo state just for prototype values ---
  const [demoStartRisk, setDemoStartRisk] = useState<number | null>(null)
  const [demoEndRisk, setDemoEndRisk] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "COMMUTER")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Fetch districts and alerts
    Promise.all([
      fetch("/api/districts").then((res) => res.json()),
      fetch("/api/alerts").then((res) => res.json()),
    ]).then(([districtsData, alertsData]) => {
      setDistricts(districtsData)
      setRouteAlerts(alertsData)

      // Fetch all wards for all districts
      Promise.all(
        districtsData.map((d: District) =>
          fetch(`/api/districts/${d.id}/wards`).then((res) => res.json()),
        ),
      ).then((wardsArrays) => {
        const allWardsData = wardsArrays.flat()
        setAllWards(allWardsData)
      })
    })
  }, [])

  // whenever both wards are selected, prepare demo scores (for prototype only)
  useEffect(() => {
    if (startWard && endWard) {
      const s = Math.floor(Math.random() * 60)      // 0–59
      const e = Math.floor(Math.random() * 60)      // 0–59
      setDemoStartRisk(s)
      setDemoEndRisk(e)
    }
  }, [startWard, endWard])

  useEffect(() => {
    if (startWard) {
      const ward = allWards.find((w) => w.id === startWard)
      // if backend has no riskScore, inject demo one for prototype
      if (ward && (ward.riskScore === 0 || ward.riskScore == null) && demoStartRisk != null) {
        setStartWardData({ ...ward, riskScore: demoStartRisk })
      } else {
        setStartWardData(ward || null)
      }
    }
  }, [startWard, allWards, demoStartRisk])

  useEffect(() => {
    if (endWard) {
      const ward = allWards.find((w) => w.id === endWard)
      if (ward && (ward.riskScore === 0 || ward.riskScore == null) && demoEndRisk != null) {
        setEndWardData({ ...ward, riskScore: demoEndRisk })
      } else {
        setEndWardData(ward || null)
      }
    }
  }, [endWard, allWards, demoEndRisk])

  if (isLoading || !user) {
    return null
  }

  // helper to map numeric score to level
  const scoreToLevel = (score: number): "LOW" | "MEDIUM" | "HIGH" => {
    if (score >= 70) return "HIGH"
    if (score >= 40) return "MEDIUM"
    return "LOW"
  }

  // Calculate route risk
  const calculateRouteRisk = () => {
    if (!startWardData || !endWardData) return null

    const startScore = startWardData.riskScore
    const endScore = endWardData.riskScore

    const avgRisk = Math.round((startScore + endScore) / 2)
    const maxRisk = Math.max(startScore, endScore)

    const riskLevel: "LOW" | "MEDIUM" | "HIGH" = scoreToLevel(maxRisk)

    return { avgRisk, maxRisk, riskLevel }
  }

  const routeRisk = calculateRouteRisk()

  // Filter alerts for route wards
  const relevantAlerts = routeAlerts.filter(
    (alert) => alert.wardId === startWard || alert.wardId === endWard || !alert.wardId,
  )

  // Decide message block color/text from routeRisk
  let routeBlock =
    routeRisk?.riskLevel === "HIGH"
      ? {
          className: "rounded-lg bg-destructive/10 p-4 ring-1 ring-destructive/20",
          title: "High Risk Route",
          text:
            "This route passes through high-risk areas. Consider alternative routes or delay your journey if possible.",
        }
      : routeRisk?.riskLevel === "MEDIUM"
      ? {
          className: "rounded-lg bg-warning/10 p-4 ring-1 ring-warning/20",
          title: "Moderate Risk Route",
          text:
            "Some water-logging reported along this route. Proceed with caution and allow extra travel time.",
        }
      : routeRisk
      ? {
          className: "rounded-lg bg-green-500/10 p-4 ring-1 ring-green-500/20",
          title: "Safe Route",
          text:
            "This route has low water-logging risk. Normal travel conditions expected.",
        }
      : null

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commuter Dashboard</h1>
          <p className="text-muted-foreground">
            Plan safe routes and check water-logging conditions along your journey
          </p>
        </div>

        {/* Route Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Route Safety Checker
            </CardTitle>
            <CardDescription>
              Select your starting point and destination to check route safety
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-ward">Starting Ward</Label>
                <Select value={startWard} onValueChange={setStartWard}>
                  <SelectTrigger id="start-ward">
                    <SelectValue placeholder="Select starting ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <div key={district.id}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {district.name}
                        </div>
                        {allWards
                          .filter((w) => w.districtId === district.id)
                          .slice(0, 5)
                          .map((ward) => (
                            <SelectItem key={ward.id} value={ward.id}>
                              {ward.name}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-ward">Destination Ward</Label>
                <Select value={endWard} onValueChange={setEndWard}>
                  <SelectTrigger id="end-ward">
                    <SelectValue placeholder="Select destination ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <div key={district.id}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                          {district.name}
                        </div>
                        {allWards
                          .filter((w) => w.districtId === district.id)
                          .slice(0, 5)
                          .map((ward) => (
                            <SelectItem key={ward.id} value={ward.id}>
                              {ward.name}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {startWard && endWard && (
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Route: <strong>{startWardData?.name}</strong> →{" "}
                  <strong>{endWardData?.name}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {routeRisk && startWardData && endWardData && (
          <>
            {/* Route Risk Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Overall Route Risk"
                value={<RiskBadge level={routeRisk.riskLevel} />}
                icon={AlertTriangle}
                description={`Max Risk Score: ${routeRisk.maxRisk}/100`}
              />
              <StatCard
                title="Starting Point"
                value={<RiskBadge level={scoreToLevel(startWardData.riskScore)} />}
                icon={MapPin}
                description={`${startWardData.name}: ${startWardData.riskScore}/100`}
              />
              <StatCard
                title="Destination"
                value={<RiskBadge level={scoreToLevel(endWardData.riskScore)} />}
                icon={MapPin}
                description={`${endWardData.name}: ${endWardData.riskScore}/100`}
              />
            </div>

            {/* Route Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Route Analysis</CardTitle>
                <CardDescription>
                  Water-logging risk assessment for your journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Starting Point</h4>
                      <RiskBadge level={scoreToLevel(startWardData.riskScore)} />
                    </div>
                    <p className="text-sm text-muted-foreground">{startWardData.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Risk Score: {startWardData.riskScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Destination</h4>
                      <RiskBadge level={scoreToLevel(endWardData.riskScore)} />
                    </div>
                    <p className="text-sm text-muted-foreground">{endWardData.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Risk Score: {endWardData.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                {routeBlock && (
                  <div className={routeBlock.className}>
                    <h4 className="mb-1 font-medium">{routeBlock.title}</h4>
                    <p className="text-sm">{routeBlock.text}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Alerts */}
            {relevantAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Alerts Affecting Your Route</CardTitle>
                  <CardDescription>
                    Important notifications for areas along your journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relevantAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-4"
                    >
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
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          {alert.wardName && <span>Ward: {alert.wardName}</span>}
                          <span>•</span>
                          <span>{new Date(alert.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <RiskBadge level={alert.severity} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.push("/map")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  View Full Map
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const temp = startWard
                    setStartWard(endWard)
                    setEndWard(temp)
                  }}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Swap Route
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {(!startWard || !endWard) && (
          <Card>
            <CardContent className="flex min-h-[300px] items-center justify-center p-12 text-center">
              <div>
                <Route className="mx-auto mb-3 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">Select Your Route</h3>
                <p className="text-muted-foreground">
                  Choose starting point and destination to check route safety
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Commuter-specific chatbot, floating bottom-right */}
      <WaterLoggingChat role="commuter" />
    </DashboardLayout>
  )
}
