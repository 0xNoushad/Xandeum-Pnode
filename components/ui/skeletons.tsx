"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Base skeleton with shimmer effect
function SkeletonBase({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl bg-zinc-800/50",
                className
            )}
            {...props}
        >
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ translateX: ["0%", "200%"] }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 0.5
                }}
            />
        </div>
    )
}

// Stat card skeleton
export function StatCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl p-6"
        >
            <div className="flex items-center gap-2 mb-4">
                <SkeletonBase className="h-4 w-4 rounded-md" />
                <SkeletonBase className="h-4 w-24" />
            </div>
            <SkeletonBase className="h-8 w-20 mb-2" />
            <SkeletonBase className="h-3 w-32" />
        </motion.div>
    )
}

// Chart skeleton
export function ChartSkeleton({ height = "h-[300px]" }: { height?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl p-6",
                height
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <SkeletonBase className="h-5 w-32 mb-2" />
                    <SkeletonBase className="h-3 w-48" />
                </div>
                <SkeletonBase className="h-8 w-24 rounded-lg" />
            </div>

            {/* Chart bars */}
            <div className="flex items-end justify-between gap-2 h-[60%] px-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${30 + Math.random() * 60}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="flex-1"
                    >
                        <SkeletonBase className="w-full h-full rounded-t-md" />
                    </motion.div>
                ))}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between px-4 mt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonBase key={i} className="h-3 w-8" />
                ))}
            </div>
        </motion.div>
    )
}

// Node list skeleton
export function NodeListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 pb-2 border-b border-white/10 flex justify-between items-center">
                <SkeletonBase className="h-5 w-32" />
                <SkeletonBase className="h-4 w-24" />
            </div>

            {/* List items */}
            <div className="divide-y divide-white/5">
                {Array.from({ length: count }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-4 p-4"
                    >
                        {/* Avatar */}
                        <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <SkeletonBase className="h-4 w-32 mb-2" />
                            <SkeletonBase className="h-3 w-24" />
                        </div>

                        {/* Progress bars */}
                        <div className="hidden md:flex items-center gap-8">
                            <div className="w-[120px]">
                                <SkeletonBase className="h-1.5 w-full rounded-full" />
                            </div>
                            <div className="w-[120px]">
                                <SkeletonBase className="h-1.5 w-full rounded-full" />
                            </div>
                        </div>

                        {/* Status */}
                        <SkeletonBase className="h-5 w-5 rounded-full" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

// Globe skeleton
export function GlobeSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[400px] rounded-3xl border border-zinc-800 bg-black flex items-center justify-center relative"
        >
            {/* Header */}
            <div className="absolute top-6 left-6 z-10">
                <SkeletonBase className="h-5 w-32 mb-2" />
                <div className="flex items-center gap-2">
                    <SkeletonBase className="h-2 w-2 rounded-full" />
                    <SkeletonBase className="h-3 w-24" />
                </div>
            </div>

            {/* Animated globe placeholder */}
            <motion.div
                className="w-[200px] h-[200px] rounded-full border border-zinc-700/50 relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <motion.div
                    className="absolute inset-4 rounded-full border border-zinc-700/30"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-8 rounded-full border border-zinc-700/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                {/* Pulsing center */}
                <motion.div
                    className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-zinc-600/50"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent" />
        </motion.div>
    )
}

// Activity chart card skeleton
export function ActivityCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl p-6 h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <SkeletonBase className="h-5 w-32" />
                <SkeletonBase className="h-6 w-16 rounded-lg" />
            </div>
            <SkeletonBase className="h-8 w-24 mb-6" />

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-3 h-24">
                {Array.from({ length: 7 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${40 + Math.random() * 50}%` }}
                        transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                        className="flex-1"
                    >
                        <SkeletonBase className="w-full h-full rounded-md" />
                    </motion.div>
                ))}
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-3">
                {["M", "T", "W", "T", "F", "S", "S"].map((_, i) => (
                    <SkeletonBase key={i} className="h-3 w-4" />
                ))}
            </div>
        </motion.div>
    )
}

// Map skeleton
export function MapSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden relative"
        >
            {/* World map placeholder with dots */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[80%] h-[60%]">
                    {/* Random dots representing nodes */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full bg-orange-500/30"
                            style={{
                                left: `${10 + Math.random() * 80}%`,
                                top: `${10 + Math.random() * 80}%`
                            }}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}

                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-20">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <motion.line
                                key={i}
                                x1={`${20 + Math.random() * 60}%`}
                                y1={`${20 + Math.random() * 60}%`}
                                x2={`${20 + Math.random() * 60}%`}
                                y2={`${20 + Math.random() * 60}%`}
                                stroke="rgba(251, 146, 60, 0.5)"
                                strokeWidth="1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: i * 0.2 }}
                            />
                        ))}
                    </svg>
                </div>
            </div>

            {/* Stats sidebar skeleton */}
            <div className="absolute right-0 top-0 bottom-0 w-64 border-l border-white/10 p-4 bg-zinc-900/80 backdrop-blur-xl">
                <SkeletonBase className="h-5 w-32 mb-4" />
                {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="mb-4"
                    >
                        <div className="flex justify-between mb-2">
                            <SkeletonBase className="h-4 w-20" />
                            <SkeletonBase className="h-4 w-8" />
                        </div>
                        <SkeletonBase className="h-2 w-full rounded-full" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

// Overview page skeleton (full page)
export function OverviewSkeleton() {
    return (
        <div className="space-y-6 page-container">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="space-y-2">
                    <SkeletonBase className="h-8 w-32" />
                    <SkeletonBase className="h-4 w-64" />
                </div>
                <SkeletonBase className="h-10 w-24 rounded-xl" />
            </motion.div>

            {/* Overview cards grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
                <div className="col-span-full lg:col-span-2">
                    <ActivityCardSkeleton />
                </div>
                <StatCardSkeleton />
                <div className="flex flex-col gap-6">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
            </div>

            {/* Chart and Globe */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-full lg:col-span-5">
                    <ChartSkeleton height="h-[400px]" />
                </div>
                <div className="col-span-full lg:col-span-2">
                    <GlobeSkeleton />
                </div>
            </div>

            {/* Node list */}
            <NodeListSkeleton count={6} />
        </div>
    )
}

// Metric card skeleton for charts page
export function MetricCardSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl p-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <SkeletonBase className="h-10 w-10 rounded-xl" />
                <div>
                    <SkeletonBase className="h-4 w-24 mb-1" />
                    <SkeletonBase className="h-3 w-16" />
                </div>
            </div>
            <SkeletonBase className="h-10 w-28 mb-2" />
            <div className="flex items-center gap-2">
                <SkeletonBase className="h-4 w-12 rounded-full" />
                <SkeletonBase className="h-3 w-20" />
            </div>
        </motion.div>
    )
}

// Charts page skeleton
export function ChartsSkeleton() {
    return (
        <div className="space-y-6 page-container">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <SkeletonBase className="h-8 w-48 mb-2" />
                <SkeletonBase className="h-4 w-72" />
            </motion.div>

            {/* Metric cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <MetricCardSkeleton />
                    </motion.div>
                ))}
            </div>

            {/* Charts grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartSkeleton height="h-[350px]" />
                <ChartSkeleton height="h-[350px]" />
            </div>

            <ChartSkeleton height="h-[300px]" />
        </div>
    )
}

// Export all skeletons
export {
    SkeletonBase
}
