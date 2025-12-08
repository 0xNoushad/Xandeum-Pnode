"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
    status: "online" | "offline" | "warning" | "syncing"
    showLabel?: boolean
    size?: "sm" | "md" | "lg"
    className?: string
}

const statusConfig = {
    online: {
        color: "bg-emerald-500",
        ring: "ring-emerald-500/30",
        label: "Online",
        glow: "shadow-emerald-500/50"
    },
    offline: {
        color: "bg-rose-500",
        ring: "ring-rose-500/30",
        label: "Offline",
        glow: "shadow-rose-500/50"
    },
    warning: {
        color: "bg-amber-500",
        ring: "ring-amber-500/30",
        label: "Warning",
        glow: "shadow-amber-500/50"
    },
    syncing: {
        color: "bg-blue-500",
        ring: "ring-blue-500/30",
        label: "Syncing",
        glow: "shadow-blue-500/50"
    }
}

const sizeConfig = {
    sm: { dot: "h-1.5 w-1.5", text: "text-[10px]", ring: "ring-2" },
    md: { dot: "h-2 w-2", text: "text-xs", ring: "ring-2" },
    lg: { dot: "h-3 w-3", text: "text-sm", ring: "ring-4" }
}

export function StatusIndicator({
    status,
    showLabel = false,
    size = "md",
    className
}: StatusIndicatorProps) {
    const config = statusConfig[status]
    const sizeStyles = sizeConfig[size]

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative">
                {/* Ping effect for online/syncing */}
                {(status === "online" || status === "syncing") && (
                    <motion.span
                        className={cn(
                            "absolute inset-0 rounded-full",
                            config.color
                        )}
                        animate={{
                            scale: [1, 2, 2],
                            opacity: [0.6, 0.2, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                )}

                {/* Main dot */}
                <motion.span
                    className={cn(
                        "block rounded-full",
                        config.color,
                        sizeStyles.dot,
                        status === "syncing" && "animate-pulse"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                />
            </div>

            {showLabel && (
                <motion.span
                    className={cn(
                        "font-medium text-zinc-400",
                        sizeStyles.text
                    )}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {config.label}
                </motion.span>
            )}
        </div>
    )
}

// Network status badge - more detailed
interface NetworkStatusBadgeProps {
    isConnected: boolean
    latency?: number
    className?: string
}

export function NetworkStatusBadge({
    isConnected,
    latency,
    className
}: NetworkStatusBadgeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full",
                "border backdrop-blur-md transition-all duration-300",
                isConnected
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400",
                className
            )}
        >
            <StatusIndicator status={isConnected ? "online" : "offline"} size="sm" />
            <span className="text-xs font-medium">
                {isConnected ? "Connected" : "Disconnected"}
            </span>
            {latency !== undefined && isConnected && (
                <motion.span
                    className="text-[10px] text-zinc-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {latency}ms
                </motion.span>
            )}
        </motion.div>
    )
}

// Animated counter for stats
interface AnimatedCounterProps {
    value: number
    suffix?: string
    prefix?: string
    decimals?: number
    className?: string
}

export function AnimatedCounter({
    value,
    suffix = "",
    prefix = "",
    decimals = 0,
    className
}: AnimatedCounterProps) {
    return (
        <motion.span
            className={cn("tabular-nums", className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={value} // Re-animate on value change
        >
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {prefix}
                {value.toLocaleString(undefined, {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                })}
                {suffix}
            </motion.span>
        </motion.span>
    )
}

// Progress ring for circular progress
interface ProgressRingProps {
    progress: number // 0-100
    size?: number
    strokeWidth?: number
    className?: string
    children?: React.ReactNode
}

export function ProgressRing({
    progress,
    size = 60,
    strokeWidth = 4,
    className,
    children
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="stroke-zinc-800"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    className="stroke-orange-500"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                        strokeDasharray: circumference
                    }}
                />
            </svg>
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    )
}
