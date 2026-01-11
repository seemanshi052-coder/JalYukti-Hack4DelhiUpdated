import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH"
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const variants = {
    LOW: "bg-green-500/10 text-green-500 hover:bg-green-500/20 ring-1 ring-green-500/20",
    MEDIUM: "bg-warning/10 text-warning-foreground hover:bg-warning/20 ring-1 ring-warning/20",
    HIGH: "bg-destructive/10 text-destructive hover:bg-destructive/20 ring-1 ring-destructive/20",
  }

  return (
    <Badge variant="outline" className={cn(variants[level], className)}>
      {level}
    </Badge>
  )
}
