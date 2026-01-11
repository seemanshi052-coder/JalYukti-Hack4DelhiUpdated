import { NextResponse } from "next/server";
import { WARDS } from "@/lib/wards";
import type { WardConfig } from "@/lib/wards";
import type { Ward } from "@/lib/types";
import { computeWardRisk } from "@/lib/risk";

export async function GET() {
  console.log("WARDS length", WARDS.length);

  try {
    const results: Ward[] = [];

    const latitudes = WARDS.map((w) => w.lat).join(",");
    const longitudes = WARDS.map((w) => w.lon).join(",");

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${latitudes}` +
      `&longitude=${longitudes}` +
      "&daily=rain_sum,precipitation_probability_max" +
      "&timezone=auto";

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error("Open-Meteo batch error", res.status, text);
      return NextResponse.json(
        { error: "weather fetch failed" },
        { status: 500 }
      );
    }

    const weather = (await res.json()) as {
      daily?: {
        rain_sum?: number[];
        precipitation_probability_max?: number[];
      };
    };

    for (let i = 0; i < WARDS.length; i += 1) {
      const wc: WardConfig = WARDS[i];

      const dailyRainMm =
        weather.daily?.rain_sum?.[i] != null ? weather.daily.rain_sum[i]! : 0;

      const popPercent =
        weather.daily?.precipitation_probability_max?.[i] != null
          ? weather.daily.precipitation_probability_max[i]!
          : 0;

      const pop = popPercent / 100;
      const reports24h = 0;

      // IMPORTANT: computeWardRisk is called with positional args,
      // matching your existing business logic.
      const wardRisk = computeWardRisk(wc, dailyRainMm, pop, reports24h);

      results.push(wardRisk);
    }

    console.log("results length", results.length);
    return NextResponse.json(results);
  } catch (e) {
    console.error("risk/all error", e);
    return NextResponse.json({ error: "risk failed" }, { status: 500 });
  }
}
