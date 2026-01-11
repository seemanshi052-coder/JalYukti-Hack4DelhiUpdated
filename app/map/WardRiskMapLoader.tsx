"use client";

import dynamic from "next/dynamic";

const WardRiskMapPageClient = dynamic(
  () => import("./WardRiskMapPageClient"),
  { ssr: false }
);

export default function WardRiskMapLoader() {
  return <WardRiskMapPageClient />;
}
