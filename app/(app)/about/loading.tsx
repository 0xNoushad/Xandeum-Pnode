"use client"

import { motion } from "framer-motion"

function SkeletonBase({ className }: { className?: string }) {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-zinc-800/50 ${className}`}>
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

export default function AboutLoading() {
    return (
        <div className="max-w-5xl mx-auto space-y-16 py-8 page-container pb-20">
            {/* Hero Section Skeleton */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-4"
            >
                <SkeletonBase className="h-8 w-48 mx-auto rounded-full" />
                <SkeletonBase className="h-12 w-80 mx-auto" />
                <SkeletonBase className="h-6 w-[500px] max-w-full mx-auto" />
            </motion.div>

            {/* Trilemma Section Skeleton */}
            <div className="space-y-6">
                <div className="text-center">
                    <SkeletonBase className="h-8 w-64 mx-auto mb-2" />
                    <SkeletonBase className="h-4 w-96 max-w-full mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-2xl bg-zinc-800/30 border border-white/5"
                        >
                            <SkeletonBase className="h-14 w-14 rounded-2xl mx-auto mb-4" />
                            <SkeletonBase className="h-5 w-32 mx-auto mb-2" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-3/4 mx-auto mt-2" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* pNodes Section Skeleton */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <SkeletonBase className="h-6 w-32 rounded-full" />
                        <SkeletonBase className="h-8 w-48" />
                        <SkeletonBase className="h-4 w-full" />
                        <SkeletonBase className="h-4 w-3/4" />
                        <div className="space-y-3 mt-4">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <SkeletonBase className="h-5 w-5 rounded-full flex-shrink-0" />
                                    <SkeletonBase className="h-4 flex-1" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-48 h-48 rounded-full border border-zinc-700/30 flex items-center justify-center"
                        >
                            <SkeletonBase className="h-20 w-20 rounded-2xl" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features Grid Skeleton */}
            <div className="space-y-6">
                <div className="text-center">
                    <SkeletonBase className="h-8 w-40 mx-auto mb-2" />
                    <SkeletonBase className="h-4 w-64 mx-auto" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-3xl border border-white/10 bg-zinc-900/50"
                        >
                            <SkeletonBase className="h-12 w-12 rounded-xl mb-4" />
                            <SkeletonBase className="h-5 w-32 mb-3" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-full mt-2" />
                            <SkeletonBase className="h-4 w-2/3 mt-2" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8">
                <SkeletonBase className="h-6 w-40 mx-auto mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[0, 1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="text-center"
                        >
                            <SkeletonBase className="h-6 w-6 rounded-full mx-auto mb-2" />
                            <SkeletonBase className="h-8 w-20 mx-auto mb-1" />
                            <SkeletonBase className="h-4 w-24 mx-auto" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
