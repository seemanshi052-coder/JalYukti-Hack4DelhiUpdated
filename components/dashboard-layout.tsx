"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Droplets,
  LayoutDashboard,
  AlertTriangle,
  Map,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  MapPin,
} from "lucide-react"
//        ^^^^^ new


interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: "Citizen Dashboard", href: "/citizen", icon: LayoutDashboard, roles: ["CITIZEN"] },
  { label: "Report Issue", href: "/citizen/report", icon: AlertTriangle, roles: ["CITIZEN"] },
  { label: "My Reports", href: "/citizen/my-reports", icon: FileText, roles: ["CITIZEN"] },
  { label: "Citizens Community", href: "/citizen/community", icon: Users, roles: ["CITIZEN"] },
 { label: "Commuter Dashboard", href: "/commuter", icon: LayoutDashboard, roles: ["COMMUTER"] },
  { label: "Official Dashboard", href: "/official", icon: LayoutDashboard, roles: ["OFFICIAL"] },
  { label: "Admin Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["ADMIN"] },
  { label: "Pump Management", href: "/admin/pumps", icon: Settings, roles: ["ADMIN"] },
  { label: "Ward Risk Map", href: "/map", icon: Map },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const filteredNavItems = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)))

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary/10 ring-1 ring-sidebar-primary/20">
            <Droplets className="h-6 w-6 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">JalYukti</h1>
            <p className="text-xs text-sidebar-foreground/60">Delhi Water Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                onClick={() => router.push(item.href)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
            <p className="text-sm font-medium text-sidebar-accent-foreground">{user?.name}</p>
            <p className="text-xs text-sidebar-accent-foreground/60">{user?.email}</p>
            <p className="mt-1 text-xs text-sidebar-accent-foreground/80">
              Role: <span className="font-medium">{user?.role}</span>
            </p>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Droplets className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold">JalYukti</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-40 bg-background p-4 lg:hidden">
            <nav className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      router.push(item.href)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
              <div className="pt-4">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        <div className="pt-16 lg:pt-0">{children}</div>
      </main>
    </div>
  )
}
