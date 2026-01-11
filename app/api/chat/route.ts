import { NextResponse } from "next/server"

// Helper: very simple way to extract ward id from message, improve later
function extractWardIdFromMessage(message: string): string | null {
  const text = message.toLowerCase()
  // Example: if your ward names are like "Aya Nagar", "Dwarka", etc.
  if (text.includes("aya nagar")) return "AYA_NAGAR_WARD_ID"
  if (text.includes("dwarka")) return "DWARKA_WARD_ID"
  return null
}

export async function POST(request: Request) {
  const { message, role } = await request.json()
  const text = (message || "").toString().trim()

  if (role !== "citizen") {
    return NextResponse.json({
      reply:
        "Right now I only answer citizen water-logging questions. Other roles will be added later.",
    })
  }

  if (!text) {
    return NextResponse.json({
      reply:
        "Please type your question. For example: 'water logging level of Aya Nagar' or 'risk in my ward today'.",
    })
  }

  // 1) Figure out which ward to talk about
  const wardId = extractWardIdFromMessage(text) // later you can also use selectedWard from frontend

  if (!wardId) {
    return NextResponse.json({
      reply:
        "I could not detect the ward from your message. Please mention the ward name, for example: 'Aya Nagar' or select a ward on the dashboard.",
    })
  }

  try {
    // 2) Call your own risk endpoint for this ward
    const riskRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/risk?wardId=${wardId}`,
      { cache: "no-store" }
    )
    if (!riskRes.ok) {
      throw new Error("Risk API error")
    }
    const riskData = await riskRes.json()
    // Example riskData you design: { wardName, riskLevel, riskScore, rainfall24h, reports24h }

    const {
      wardName,
      riskLevel,
      riskScore,
      rainfall24h,
      reports24h,
      lastUpdated,
    } = riskData

    // 3) Build a dynamic answer using that data
    const reply = [
      `Current water-logging risk for ${wardName} is ${riskLevel} (score ${riskScore}/100).`,
      `In the last 24 hours, rainfall is about ${rainfall24h} mm and ${reports24h} incident reports were submitted.`,
      lastUpdated
        ? `This information was last updated at ${new Date(lastUpdated).toLocaleString()}.`
        : "",
      `You can see detailed risk and reports for this ward in the dashboard cards.`,
    ]
      .filter(Boolean)
      .join(" ")

    return NextResponse.json({ reply })
  } catch (err) {
    console.error("Chat risk error", err)
    return NextResponse.json({
      reply:
        "Sorry, I could not fetch live risk data right now. Please check the dashboard cards, or try again in a few minutes.",
    })
  }
}
