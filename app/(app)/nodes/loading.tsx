"use client"

import { motion } from "framer-motion"
import { NodeListSkeleton } from "@/components/ui/skeletons"

export default function NodesLoading() {
    return (
        <div className="space-y-6 page-container">
            {/* Header skeleton */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div className="h-8 w-32 rounded-xl bg-zinc-800/50 skeleton-shimmer" />
                <div className="h-4 w-64 rounded-lg bg-zinc-800/50 skeleton-shimmer" />
            </motion.div>

            {/* Node list skeleton */}
            <NodeListSkeleton count={8} />
        </div>
    )
}
