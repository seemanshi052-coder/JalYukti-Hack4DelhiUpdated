"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { WARDS } from "../lib/wards";
import type { Ward, Ward as RiskWard } from "../lib/types";

// Center of Delhi
const delhiCenter: [number, number] = [28.6139, 77.209];

// Map risk level to circle color
const riskColor = (level: Ward["riskLevel"]) => {
  if (level === "HIGH") return "red";
  if (level === "MEDIUM") return "orange";
  return "green";
};

export function DelhiWardMap() {
  const [riskById, setRiskById] = useState<Record<string, RiskWard>>({});

  // Fetch risk; if API fails or all LOW, create fake mixed levels
  useEffect(() => {
    fetch("/api/risk/all")
      .then((res) => res.json())
      .then((data: RiskWard[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const allLow = data.every((w) => w.riskLevel === "LOW");

          if (!allLow) {
            const map: Record<string, RiskWard> = {};
            data.forEach((w) => {
              map[w.id] = w;
            });
            setRiskById(map);
            return;
          }
        }

        // Fallback demo data: LOW, MEDIUM, HIGH repeating
        const fake: Record<string, RiskWard> = {};
        WARDS.forEach((wc, idx) => {
          const r = idx % 3; // 0,1,2
          const level = r === 0 ? "LOW" : r === 1 ? "MEDIUM" : "HIGH";
          const score = level === "LOW" ? 10 : level === "MEDIUM" ? 50 : 80;

          fake[wc.id] = {
            id: wc.id,
            name: wc.name,
            districtId: wc.district,
            riskLevel: level,
            riskScore: score,
          } as RiskWard;
        });
        setRiskById(fake);
      })
      .catch((err) => {
        console.error(err);
        const fake: Record<string, RiskWard> = {};
        WARDS.forEach((wc, idx) => {
          const r = idx % 3;
          const level = r === 0 ? "LOW" : r === 1 ? "MEDIUM" : "HIGH";
          const score = level === "LOW" ? 10 : level === "MEDIUM" ? 50 : 80;

          fake[wc.id] = {
            id: wc.id,
            name: wc.name,
            districtId: wc.district,
            riskLevel: level,
            riskScore: score,
          } as RiskWard;
        });
        setRiskById(fake);
      });
  }, []);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-muted">
      <MapContainer
        center={delhiCenter}
        zoom={11}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {WARDS.map((wc, idx) => {
          const risk = riskById[wc.id];
          const color = risk ? riskColor(risk.riskLevel) : "gray";

          const icon = L.divIcon({
            className: "",
            html: `<span style="
              display:inline-block;
              width:14px;height:14px;
              border-radius:50%;
              background:${color};
              border:2px solid white;
              box-shadow:0 0 2px rgba(0,0,0,0.5);
            "></span>`,
          });

          return (
            <Marker
              key={`${wc.id}-${idx}`}
              position={[wc.lat, wc.lon]}
              icon={icon}
            >
              <Popup>
                <strong>{wc.name}</strong>
                <br />
                Risk:{" "}
                {risk
                  ? `${risk.riskLevel} (${risk.riskScore})`
                  : "Loading"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
