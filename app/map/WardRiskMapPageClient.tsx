// app/ward-risk-map/WardRiskMapPageClient.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RiskBadge } from "@/components/risk-badge";
import { StatusBadge } from "@/components/status-badge";
import { MapPin, AlertTriangle, Droplets, Activity } from "lucide-react";
import { DelhiWardMap } from "@/components/DelhiWardMap";
import type { District, Ward, WaterLoggingReport } from "@/lib/types";

export default function WardRiskMapPageClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [wardData, setWardData] = useState<Ward | null>(null);
  const [reports, setReports] = useState<WaterLoggingReport[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetch("/api/districts")
      .then((res) => res.json())
      .then(setDistricts);
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`/api/districts/${selectedDistrict}/wards`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data);
          setSelectedWard("");
        });
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedWard) {
      const ward = wards.find((w) => w.id === selectedWard);
      setWardData(ward || null);

      fetch(`/api/reports?wardId=${selectedWard}`)
        .then((res) => res.json())
        .then(setReports);
    }
  }, [selectedWard, wards]);

  if (isLoading || !user) {
    return null;
  }

  const now = Date.now();
  const last24Hours = now - 24 * 60 * 60 * 1000;
  const last7Days = now - 7 * 24 * 60 * 60 * 1000;

  const reports24h = reports.filter(
    (r) => new Date(r.timestamp).getTime() > last24Hours
  );
  const reports7d = reports.filter(
    (r) => new Date(r.timestamp).getTime() > last7Days
  );

  const selectedDistrictName =
    districts.find((d) => d.id === selectedDistrict)?.name ?? selectedDistrict;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Delhi Ward Risk Map
          </h1>
          <p className="text-muted-foreground">
            View water-logging risk levels and incidents across Delhi wards
          </p>
        </div>

        {/* District and Ward Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Location</CardTitle>
            <CardDescription>
              Choose a district and ward to view detailed risk information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward</Label>
                <Select
                  value={selectedWard}
                  onValueChange={setSelectedWard}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger id="ward">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedWard && wardData && (
          <>
            {/* Map Visualization Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {wardData.name}
                </CardTitle>
                <CardDescription>
                  Ward risk visualization and geographic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 ${
                    wardData.riskLevel === "HIGH"
                      ? "border-destructive/50 bg-destructive/5"
                      : wardData.riskLevel === "MEDIUM"
                      ? "border-warning/50 bg-warning/5"
                      : "border-green-500/50 bg-green-500/5"
                  }`}
                >
                  <MapPin
                    className={`mb-4 h-16 w-16 ${
                      wardData.riskLevel === "HIGH"
                        ? "text-destructive"
                        : wardData.riskLevel === "MEDIUM"
                        ? "text-warning"
                        : "text-green-500"
                    }`}
                  />

                  {/* District + Ward */}
                  <h3 className="mb-2 text-2xl font-bold">
                    {selectedDistrictName}
                  </h3>
                  <h3 className="mb-2 text-2xl font-bold">
                    {wardData.name}
                  </h3>

                  <div className="mb-4">
                    <RiskBadge level={wardData.riskLevel} className="text-lg" />
                  </div>

                  <DelhiWardMap />
                </div>
              </CardContent>
            </Card>

            {/* Ward Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Risk Score
                      </p>
                      <h3 className="text-2xl font-bold">
                        {wardData.riskScore}/100
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10 ring-1 ring-chart-2/20">
                      <AlertTriangle className="h-6 w-6 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Reports (24h)
                      </p>
                      <h3 className="text-2xl font-bold">
                        {reports24h.length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10 ring-1 ring-chart-3/20">
                      <Droplets className="h-6 w-6 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Reports (7d)
                      </p>
                      <h3 className="text-2xl font-bold">
                        {reports7d.length}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Latest Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Reports in {wardData.name}</CardTitle>
                <CardDescription>
                  Recent water-logging incidents in this ward
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No reports in this ward
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 10).map((report) => (
                      <div
                        key={report.id}
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-medium">
                                {report.location}
                              </h4>
                              <RiskBadge level={report.severity} />
                              <StatusBadge status={report.status} />
                            </div>
                            <p className="mb-2 text-sm text-muted-foreground">
                              {report.description}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>Reported by {report.userName}</span>
                              <span>
                                {new Date(
                                  report.timestamp
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!selectedWard && (
          <Card>
            <CardContent className="flex min-h-[400px] items-center justify-center p-12 text-center">
              <div>
                <MapPin className="mx-auto mb-3 h-16 w-16 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium">
                  Select a Ward to View
                </h3>
                <p className="text-muted-foreground">
                  Choose a district and ward to see risk information and map
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
