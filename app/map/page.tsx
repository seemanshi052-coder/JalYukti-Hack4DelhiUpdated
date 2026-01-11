// app/ward-risk-map/page.tsx (or your correct route path)

import WardRiskMapPageClient from "./WardRiskMapPageClient";

export default function WardRiskMapPage() {
  // Do NOT use window here
  // No 'use client' here
  return <WardRiskMapPageClient />;
}
