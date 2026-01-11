"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Plus, CheckCircle2 } from "lucide-react"
import type { District, Ward, PumpDeployment } from "@/lib/types"

export default function PumpManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [districts, setDistricts] = useState<District[]>([])
  const [allWards, setAllWards] = useState<Ward[]>([])
  const [deployments, setDeployments] = useState<PumpDeployment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    wardId: "",
    pumpCount: "3",
    status: "DEPLOYED" as "DEPLOYED" | "IN_TRANSIT" | "MAINTENANCE",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    // Fetch data
    Promise.all([
      fetch("/api/districts").then((res) => res.json()),
      fetch("/api/pump-deployments").then((res) => res.json()),
    ]).then(([districtsData, deploymentsData]) => {
      setDistricts(districtsData)
      setDeployments(deploymentsData)

      // Fetch all wards
      Promise.all(
        districtsData.map((d: District) => fetch(`/api/districts/${d.id}/wards`).then((res) => res.json())),
      ).then((wardsArrays) => {
        setAllWards(wardsArrays.flat())
      })
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/pump-deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          pumpCount: Number.parseInt(formData.pumpCount),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setDeployments([...deployments, data.deployment])
        setIsSuccess(true)
        setTimeout(() => {
          setIsSuccess(false)
          setFormData({ wardId: "", pumpCount: "3", status: "DEPLOYED" })
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to deploy pumps:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: "DEPLOYED" | "IN_TRANSIT" | "MAINTENANCE") => {
    try {
      const response = await fetch(`/api/pump-deployments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        setDeployments((prev) => prev.map((d) => (d.id === id ? data.deployment : d)))
      }
    } catch (error) {
      console.error("Failed to update deployment:", error)
    }
  }

  if (isLoading || !user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pump Deployment Management</h1>
          <p className="text-muted-foreground">Deploy and manage water pumps across Delhi wards</p>
        </div>

        {/* Deployment Form */}
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Deploy New Pumps
            </CardTitle>
            <CardDescription>Assign pumps to a ward to manage water-logging</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-3 h-12 w-12 text-green-500" />
                <h3 className="mb-1 text-lg font-medium">Pumps Deployed Successfully!</h3>
                <p className="text-sm text-muted-foreground">The deployment has been recorded</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ward">
                    Ward <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.wardId}
                    onValueChange={(value) => setFormData({ ...formData, wardId: value })}
                  >
                    <SelectTrigger id="ward">
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <div key={district.id}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{district.name}</div>
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
                  <Label htmlFor="pumpCount">
                    Number of Pumps <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pumpCount"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.pumpCount}
                    onChange={(e) => setFormData({ ...formData, pumpCount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "DEPLOYED" | "IN_TRANSIT" | "MAINTENANCE") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEPLOYED">Deployed</SelectItem>
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Deploying..." : "Deploy Pumps"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Existing Deployments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Deployments
            </CardTitle>
            <CardDescription>Manage existing pump deployments across Delhi</CardDescription>
          </CardHeader>
          <CardContent>
            {deployments.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center text-center">
                <div>
                  <Settings className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No pump deployments yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{deployment.wardName}</h4>
                      <p className="text-sm text-muted-foreground">{deployment.districtName}</p>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <strong>Pumps:</strong> {deployment.pumpCount}
                        </span>
                        <span>
                          <strong>Updated:</strong> {new Date(deployment.lastUpdated).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={deployment.status}
                        onValueChange={(value: "DEPLOYED" | "IN_TRANSIT" | "MAINTENANCE") =>
                          handleStatusUpdate(deployment.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEPLOYED">Deployed</SelectItem>
                          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                          <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
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
