import { NextResponse } from "next/server"
import { pumpDeployments } from "@/lib/data"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, pumpCount } = body

    const deploymentIndex = pumpDeployments.findIndex((d) => d.id === id)

    if (deploymentIndex === -1) {
      return NextResponse.json({ success: false, error: "Deployment not found" }, { status: 404 })
    }

    pumpDeployments[deploymentIndex] = {
      ...pumpDeployments[deploymentIndex],
      ...(status && { status }),
      ...(pumpCount && { pumpCount }),
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, deployment: pumpDeployments[deploymentIndex] })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update deployment" }, { status: 400 })
  }
}
