import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ReportStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: ReportStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    NEW: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 ring-1 ring-blue-500/20",
    IN_PROGRESS: "bg-warning/10 text-warning-foreground hover:bg-warning/20 ring-1 ring-warning/20",
    RESOLVED: "bg-green-500/10 text-green-500 hover:bg-green-500/20 ring-1 ring-green-500/20",
  }

  return (
    <Badge variant="outline" className={cn(variants[status], className)}>
      {status.replace("_", " ")}
    </Badge>
  )
}
