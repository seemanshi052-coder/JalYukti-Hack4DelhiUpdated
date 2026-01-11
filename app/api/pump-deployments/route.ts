import { NextResponse } from "next/server"
import { pumpDeployments, wards, districts } from "@/lib/data"
import type { PumpDeployment } from "@/lib/types"

export async function GET() {
  return NextResponse.json(pumpDeployments)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wardId, pumpCount, status } = body

    const ward = wards.find((w) => w.id === wardId)
    const district = districts.find((d) => d.id === ward?.districtId)

    if (!ward || !district) {
      return NextResponse.json({ success: false, error: "Invalid ward" }, { status: 400 })
    }

    const newDeployment: PumpDeployment = {
      id: `p${Date.now()}`,
      wardId,
      wardName: ward.name,
      districtId: district.id,
      districtName: district.name,
      pumpCount,
      status: status || "DEPLOYED",
      lastUpdated: new Date().toISOString(),
    }

    pumpDeployments.push(newDeployment)

    return NextResponse.json({ success: true, deployment: newDeployment })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create deployment" }, { status: 400 })
  }
}
