"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { District, Ward, ReportSeverity } from "@/lib/types"

export default function ReportWaterLoggingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    districtId: "",
    wardId: "",
    severity: "MEDIUM" as ReportSeverity,
    location: "",
    description: "",
    photo: "",
  })

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
  }, [])

  useEffect(() => {
    if (formData.districtId) {
      // Fetch wards for selected district
      fetch(`/api/districts/${formData.districtId}/wards`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data)
          setFormData((prev) => ({ ...prev, wardId: "" }))
        })
    }
  }, [formData.districtId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          userName: user?.name,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/citizen/my-reports")
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to submit report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return null
  }

  if (isSuccess) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[600px] items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold">Report Submitted Successfully!</h2>
              <p className="text-muted-foreground">Your water-logging report has been recorded.</p>
              <p className="mt-4 text-sm text-muted-foreground">Redirecting to your reports...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Water-Logging</h1>
          <p className="text-muted-foreground">Help us manage water-logging by reporting incidents in your area</p>
        </div>

        {/* Form */}
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Water-Logging Incident Report
            </CardTitle>
            <CardDescription>Please provide details about the water-logging incident</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Location Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="district">
                      District <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.districtId}
                      onValueChange={(value) => setFormData({ ...formData, districtId: value })}
                      required
                    >
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
                    <Label htmlFor="ward">
                      Ward <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.wardId}
                      onValueChange={(value) => setFormData({ ...formData, wardId: value })}
                      disabled={!formData.districtId}
                      required
                    >
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

                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location / Landmark <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Near Metro Station, Main Road"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Incident Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Incident Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="severity">
                    Severity <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: ReportSeverity) => setFormData({ ...formData, severity: value })}
                    required
                  >
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low - Minor accumulation</SelectItem>
                      <SelectItem value="MEDIUM">Medium - Significant water-logging</SelectItem>
                      <SelectItem value="HIGH">High - Severe flooding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the water-logging situation, depth, affected area, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo (Optional)</Label>
                  <Input
                    id="photo"
                    type="text"
                    placeholder="Photo filename (upload feature coming soon)"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">For demo purposes, just enter a filename</p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/citizen")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
