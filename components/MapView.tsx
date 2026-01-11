"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

import { WARDS, WardConfig } from "../lib/wards";
import L from "leaflet";

const greyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function iconForRisk(level: "LOW" | "MEDIUM" | "HIGH") {
  if (level === "HIGH") return redIcon;
  if (level === "MEDIUM") return yellowIcon;
  return greyIcon;
}


export function MapView() {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const [selectedWard, setSelectedWard] = useState<WardConfig | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", {
      center: [28.63, 77.09],
      zoom: 11,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    WARDS.forEach((ward) => {
      const marker = L.marker([ward.lat, ward.lon])
        .addTo(map)
        .on("click", () => setSelectedWard(ward));

      markersRef.current[ward.id] = marker;
    });

    mapRef.current = map;
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div id="map" style={{ flex: 1 }} />
      <div style={{ width: 300, padding: 12, borderLeft: "1px solid #ccc" }}>
        {selectedWard ? (
          <>
            <h3>{selectedWard.name}</h3>
            <p>District: {selectedWard.district}</p>
            <p>
              Lat: {selectedWard.lat.toFixed(4)}, Lon:{" "}
              {selectedWard.lon.toFixed(4)}
            </p>
          </>
        ) : (
          <p>Click a ward marker to see details.</p>
        )}
      </div>
    </div>
  );
}
