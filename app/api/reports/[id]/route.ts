import { NextResponse } from "next/server"
import { reports } from "@/lib/data"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const reportIndex = reports.findIndex((r) => r.id === id)

    if (reportIndex === -1) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
    }

    reports[reportIndex] = { ...reports[reportIndex], status }

    return NextResponse.json({ success: true, report: reports[reportIndex] })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update report" }, { status: 400 })
  }
}
