"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-white/10",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
        info:
          "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
        orange:
          "border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
        glass:
          "border-white/10 bg-white/5 text-zinc-200 backdrop-blur-sm hover:bg-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

interface AnimatedBadgeProps extends BadgeProps {
  delay?: number
}

function AnimatedBadge({ delay = 0, className, ...props }: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300 }}
    >
      <Badge className={className} {...props} />
    </motion.div>
  )
}

// Live status badge with pulsing dot
interface LiveBadgeProps {
  status?: "live" | "updating" | "syncing"
  label?: string
  className?: string
}

function LiveBadge({ status = "live", label, className }: LiveBadgeProps) {
  const statusConfig = {
    live: { color: "bg-emerald-500", text: "Live", variant: "success" as const },
    updating: { color: "bg-blue-500", text: "Updating", variant: "info" as const },
    syncing: { color: "bg-amber-500", text: "Syncing", variant: "warning" as const },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            config.color
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            config.color
          )}
        />
      </span>
      {label || config.text}
    </Badge>
  )
}

interface CountBadgeProps {
  count: number
  max?: number
  className?: string
}

function CountBadge({ count, max = 99, className }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count

  return (
    <motion.div
      key={count}
      initial={{ scale: 1.2 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
        "bg-orange-500 text-white",
        className
      )}
    >
      {displayCount}
    </motion.div>
  )
}

export { Badge, AnimatedBadge, LiveBadge, CountBadge, badgeVariants }

