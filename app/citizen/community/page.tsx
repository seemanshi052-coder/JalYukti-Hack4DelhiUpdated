"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CitizenCommunity } from "@/components/CitizenCommunity"

export default function CitizenCommunityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citizens Community</h1>
          <p className="text-muted-foreground">
            Talk with other citizens about water‑logging issues and updates in your area.
          </p>
        </div>

        <CitizenCommunity />
      </div>
    </DashboardLayout>
  )
}
