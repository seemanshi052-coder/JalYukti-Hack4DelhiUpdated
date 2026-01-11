// Mock authentication API

import { NextResponse } from "next/server"
import { users } from "@/lib/data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, role } = body

    // Mock authentication - find or create user
    let user = users.find((u) => u.email === email)

    if (!user) {
      user = {
        id: `u${Date.now()}`,
        name: email.split("@")[0],
        email,
        role: role || "CITIZEN",
      }
      users.push(user)
    }

    // Return mock token
    return NextResponse.json({
      success: true,
      user,
      token: `mock-token-${user.id}`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 400 })
  }
}
