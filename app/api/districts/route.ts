import { NextResponse } from "next/server"
import { districts } from "@/lib/data"

export async function GET() {
  return NextResponse.json(districts)
}
