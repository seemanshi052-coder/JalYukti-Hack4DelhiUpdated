"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Droplets } from "lucide-react"
import type { UserRole } from "@/lib/types"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("CITIZEN")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, role)

      // Redirect based on role
      switch (role) {
        case "CITIZEN":
          router.push("/citizen")
          break
        case "COMMUTER":
          router.push("/commuter")
          break
        case "OFFICIAL":
          router.push("/official")
          break
        case "ADMIN":
          router.push("/admin")
          break
      }
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/20">
              <Droplets className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to JalYukti</CardTitle>
          <CardDescription>Sign in to access the water-logging management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZEN">Citizen</SelectItem>
                  <SelectItem value="COMMUTER">Commuter</SelectItem>
                  <SelectItem value="OFFICIAL">Official (PWD/Traffic)</SelectItem>
                  <SelectItem value="ADMIN">City Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                For demo purposes, select your role to access different dashboards
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
