// app/map/page.tsx  (server component)

import dynamic from "next/dynamic";

const WardRiskMapPageClient = dynamic(
  () => import("./WardRiskMapPageClient"),
  { ssr: false } // disable SSR to avoid window errors in build
);

export default function WardRiskMapPage() {
  return <WardRiskMapPageClient />;
}
