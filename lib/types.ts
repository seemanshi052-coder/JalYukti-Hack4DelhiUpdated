// Domain models for JalYukti Water-Logging Management System

export type UserRole = "CITIZEN" | "COMMUTER" | "OFFICIAL" | "ADMIN"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  districtId?: string
  wardId?: string
}

export interface District {
  id: string
  name: string
}

export interface Ward {
  id: string
  name: string
  districtId: string
  riskScore: number // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
}

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH"
export type ReportStatus = "NEW" | "IN_PROGRESS" | "RESOLVED"

export interface WaterLoggingReport {
  id: string
  userId: string
  userName: string
  districtId: string
  districtName: string
  wardId: string
  wardName: string
  severity: ReportSeverity
  description: string
  location: string
  timestamp: string
  status: ReportStatus
  photo?: string
}

export interface Alert {
  id: string
  districtId?: string
  districtName?: string
  wardId?: string
  wardName?: string
  title: string
  message: string
  severity: "LOW" | "MEDIUM" | "HIGH"
  createdAt: string
}

export interface PumpDeployment {
  id: string
  wardId: string
  wardName: string
  districtId: string
  districtName: string
  pumpCount: number
  status: "DEPLOYED" | "IN_TRANSIT" | "MAINTENANCE"
  lastUpdated: string
}
