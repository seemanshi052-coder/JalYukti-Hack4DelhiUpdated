import { NextResponse } from "next/server"
import { wards } from "@/lib/data"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const districtWards = wards.filter((w) => w.districtId === id)
  return NextResponse.json(districtWards)
}
