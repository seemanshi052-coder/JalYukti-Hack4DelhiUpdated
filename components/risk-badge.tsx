import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH"
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const variants = {
    LOW: "bg-green-500/20 text-green-200 hover:bg-green-500/30 ring-1 ring-green-400",
    MEDIUM:
      "bg-orange-500/30 text-orange-100 hover:bg-orange-500/40 ring-1 ring-orange-400",
    HIGH: "bg-red-500/30 text-red-100 hover:bg-red-500/40 ring-1 ring-red-400",
  }

  return (
    <Badge variant="outline" className={cn(variants[level], className)}>
      {level}
    </Badge>
  )
}
