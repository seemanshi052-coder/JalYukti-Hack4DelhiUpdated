// Risk calculation engine for wards

import type { Ward, WaterLoggingReport } from "./types"

export function calculateWardRisk(
  wardId: string,
  reports: WaterLoggingReport[],
): { riskScore: number; riskLevel: "LOW" | "MEDIUM" | "HIGH" } {
  const now = Date.now()
  const last24Hours = now - 24 * 60 * 60 * 1000
  const last7Days = now - 7 * 24 * 60 * 60 * 1000

  // Filter reports for this ward
  const wardReports = reports.filter((r) => r.wardId === wardId)
  const recent24h = wardReports.filter((r) => new Date(r.timestamp).getTime() > last24Hours)
  const recent7d = wardReports.filter((r) => new Date(r.timestamp).getTime() > last7Days)

  // Calculate risk score based on report count and severity
  let riskScore = 0

  // Weight recent reports more heavily
  recent24h.forEach((r) => {
    const severityWeight = r.severity === "HIGH" ? 15 : r.severity === "MEDIUM" ? 10 : 5
    riskScore += severityWeight
  })

  recent7d.forEach((r) => {
    const severityWeight = r.severity === "HIGH" ? 5 : r.severity === "MEDIUM" ? 3 : 1
    riskScore += severityWeight
  })

  // Cap at 100
  riskScore = Math.min(100, riskScore)

  const riskLevel = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MEDIUM" : "LOW"

  return { riskScore, riskLevel }
}

export function updateWardRisks(wards: Ward[], reports: WaterLoggingReport[]): Ward[] {
  return wards.map((ward) => {
    const { riskScore, riskLevel } = calculateWardRisk(ward.id, reports)
    return { ...ward, riskScore, riskLevel }
  })
}
