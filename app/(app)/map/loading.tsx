"use client"

import { motion } from "framer-motion"
import { MapSkeleton } from "@/components/ui/skeletons"

export default function MapLoading() {
    return (
        <div className="space-y-6 page-container h-[calc(100vh-8rem)]">
            {/* Header skeleton */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div className="h-8 w-32 rounded-xl bg-zinc-800/50 skeleton-shimmer" />
                <div className="h-4 w-64 rounded-lg bg-zinc-800/50 skeleton-shimmer" />
            </motion.div>

            {/* Map skeleton */}
            <div className="flex-1 h-full">
                <MapSkeleton />
            </div>
        </div>
    )
}
