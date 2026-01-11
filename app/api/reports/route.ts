import { NextResponse } from "next/server"
import { reports, wards, districts } from "@/lib/data"
import type { WaterLoggingReport } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const districtId = searchParams.get("districtId")
  const wardId = searchParams.get("wardId")
  const status = searchParams.get("status")

  let filtered = reports

  if (districtId) {
    filtered = filtered.filter((r) => r.districtId === districtId)
  }

  if (wardId) {
    filtered = filtered.filter((r) => r.wardId === wardId)
  }

  if (status) {
    filtered = filtered.filter((r) => r.status === status)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, userName, districtId, wardId, severity, description, location, photo } = body

    const district = districts.find((d) => d.id === districtId)
    const ward = wards.find((w) => w.id === wardId)

    if (!district || !ward) {
      return NextResponse.json({ success: false, error: "Invalid district or ward" }, { status: 400 })
    }

    const newReport: WaterLoggingReport = {
      id: `r${Date.now()}`,
      userId: userId || "unknown",
      userName: userName || "Anonymous",
      districtId,
      districtName: district.name,
      wardId,
      wardName: ward.name,
      severity,
      description,
      location,
      timestamp: new Date().toISOString(),
      status: "NEW",
      photo,
    }

    reports.unshift(newReport)

    return NextResponse.json({ success: true, report: newReport })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create report" }, { status: 400 })
  }
}
