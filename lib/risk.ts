import type { Ward as RiskWard } from "./types";
import type { WardConfig } from "./wards";

// More sensitive thresholds
function toLevel(score: number): RiskWard["riskLevel"] {
  if (score >= 40) return "HIGH";   // was 70
  if (score >= 15) return "MEDIUM"; // was 35
  return "LOW";
}

type RiskInputs = {
  dailyRainMm: number; // total rain for today
  pop: number;         // probability of precipitation 0–1
  reports24h: number;  // number of reports in last 24h
};

export function computeWardRisk(
  wardConfig: WardConfig,
  inputs: RiskInputs
): RiskWard {
  // Rain: 20 mm -> 50 points, 40+ mm capped at 50
  const rainScore = Math.min((inputs.dailyRainMm / 20) * 50, 50);

  // Probability: up to 30 points
  const popScore = inputs.pop * 30;

  // Citizen reports: each adds 8 points, capped at 20
  const reportScore = Math.min(inputs.reports24h * 8, 20);

  const rawScore = rainScore + popScore + reportScore; // 0–100 range
  const riskScore = Math.min(Math.round(rawScore), 100);
  const riskLevel = toLevel(riskScore);

  return {
    id: wardConfig.id,
    name: wardConfig.name,
    districtId: wardConfig.district, // later map to real districtId
    riskScore,
    riskLevel,
  };
}
