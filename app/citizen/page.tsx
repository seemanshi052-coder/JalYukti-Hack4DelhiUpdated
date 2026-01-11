"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { RiskBadge } from "@/components/risk-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Droplets, MapPin, Bell } from "lucide-react"
import type { District, Ward, WaterLoggingReport, Alert } from "@/lib/types"





export default function CitizenDashboard() {

  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [selectedWard, setSelectedWard] = useState<string>("")
  const [wardData, setWardData] = useState<Ward | null>(null)
  const [wardReports, setWardReports] = useState<WaterLoggingReport[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [messages, setMessages] = useState<{ text: string; role: "citizen" | "bot" }[]>([])
  const [input, setInput] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [wardRisk, setWardRisk] = useState<{
    wardId: string
    wardName: string
    riskLevel: "LOW" | "MEDIUM" | "HIGH"
    riskScore: number
    rainfallRecentMm: number | null
    imdDailyRainMm?: number | null
    temperatureC?: number | null
    lastUpdated?: string
  } | null>(null)


  useEffect(() => {
    // Show welcome message when chat opens
    setMessages([
      {
        text: "Hello, I am the JalYukti assistant for citizens. Describe your issue or question.",
        role: "bot",
      },
    ])
  }, [])


  const handleSend = async () => {
    if (!input.trim()) return

    const userText = input
    const newMessage = { text: userText, role: "citizen" as const }
    setMessages((prev) => [...prev, newMessage])
    setInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, role: "citizen" }),
      })

      const data = await response.json()
      setMessages((prev) => [...prev, { text: data.reply, role: "bot" }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong. Please try again.", role: "bot" },
      ])
    }
  }

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "CITIZEN")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Fetch districts
    fetch("/api/districts")
      .then((res) => res.json())
      .then(setDistricts)

    // Fetch alerts
    fetch("/api/alerts")
      .then((res) => res.json())
      .then(setAlerts)
  }, [])

  useEffect(() => {
    if (selectedDistrict) {
      // Fetch wards for selected district
      fetch(`/api/districts/${selectedDistrict}/wards`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data)
          setSelectedWard("")
        })
    }
  }, [selectedDistrict])

  useEffect(() => {
    if (selectedWard) {
      const ward = wards.find((w) => w.id === selectedWard)
      setWardData(ward || null)

      // Fetch reports for selected ward
      fetch(`/api/reports?wardId=${selectedWard}`)
        .then((res) => res.json())
        .then(setWardReports)

      // Fetch live risk for selected ward
      fetch(`/api/risk?wardId=${selectedWard}`)
        .then((res) => res.json())
        .then((data) => {
          setWardRisk(data)
        })
        .catch(() => {
          setWardRisk(null)
        })
    } else {
      setWardData(null)
      setWardReports([])
      setWardRisk(null)
    }
  }, [selectedWard, wards])


  if (isLoading || !user) {
    return null
  }

  const wardAlerts = alerts.filter((a) => !a.wardId || a.wardId === selectedWard)
  const todayReports = wardReports.filter((r) => {
    const reportDate = new Date(r.timestamp)
    const today = new Date()
    return reportDate.toDateString() === today.toDateString()
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citizen Dashboard</h1>
          <p className="text-muted-foreground">Monitor water-logging in your area and report incidents</p>
        </div>

        {/* District and Ward Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Location</CardTitle>
            <CardDescription>Choose your district and ward to view local water-logging information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Select value={selectedWard} onValueChange={setSelectedWard} disabled={!selectedDistrict}>
                  <SelectTrigger id="ward">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedWard && wardData && (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Reports Today"
                value={todayReports.length}
                icon={AlertTriangle}
                description="In this ward"
              />

              <StatCard
                title="Current Risk Level"
                value={
                  wardRisk ? (
                    <RiskBadge level={wardRisk.riskLevel} />
                  ) : (
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  )
                }
                icon={Droplets}
                description={
                  wardRisk
                    ? `Risk Score: ${wardRisk.riskScore}/100`
                    : "Risk score from live data"
                }
              />

              <StatCard
                title="Recent Rainfall"
                value={
                  wardRisk && wardRisk.rainfallRecentMm != null
                    ? `${wardRisk.rainfallRecentMm.toFixed(1)} mm`
                    : "N/A"
                }
                icon={Bell}
                description={
                  wardRisk && wardRisk.imdDailyRainMm != null
                    ? `IMD daily: ${wardRisk.imdDailyRainMm.toFixed(1)} mm`
                    : "Using live weather data"
                }
              />
            </div>


            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={() => router.push("/citizen/report")}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Water-Logging
                </Button>
                <Button variant="outline" onClick={() => router.push("/citizen/my-reports")}>
                  View My Reports
                </Button>
                <Button variant="outline" onClick={() => router.push("/map")}>
                  <MapPin className="mr-2 h-4 w-4" />
                  View Ward Map
                </Button>
                 <Button variant="outline" onClick={() => router.push("/citizen/community")}>
              Citizens Community
            </Button>
              </CardContent>
            </Card>



            {/* Active Alerts */}
            {wardAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>Important notifications for your area</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wardAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                      <div
                        className={`mt-0.5 h-2 w-2 rounded-full ${alert.severity === "HIGH"
                          ? "bg-destructive"
                          : alert.severity === "MEDIUM"
                            ? "bg-warning"
                            : "bg-green-500"
                          }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <RiskBadge level={alert.severity} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports in {wardData.name}</CardTitle>
                <CardDescription>Water-logging incidents reported in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                {wardReports.length === 0 ? (
                  <p className="text-center text-muted-foreground">No reports in this ward yet</p>
                ) : (
                  <div className="space-y-3">
                    {wardReports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{report.location}</h4>
                            <RiskBadge level={report.severity} />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Reported {new Date(report.timestamp).toLocaleString()} by {report.userName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!selectedWard && (
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center p-12 text-center">
              <div>
                <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Select a district and ward to view local information</p>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Chatbot for citizens */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
            <span>JalYukti Assistant </span>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsChatOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="flex h-64 flex-col px-3 py-2">
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-lg px-2 py-1 text-xs ${msg.role === "citizen"
                    ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                    : "mr-auto max-w-[80%] bg-muted text-foreground"
                    }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-md border bg-background px-2 py-1 text-xs outline-none"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
              />
              <Button size="sm" className="text-xs" onClick={handleSend}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Floating button to reopen chat when closed */}
      {!isChatOpen && (
        <button
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open JalYukti chat"
        >
          💬
        </button>

      )}
    </DashboardLayout>
  )
}


