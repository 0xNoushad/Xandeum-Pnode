"use client"

import { motion } from "framer-motion"

export function Loader() {
    // Animated bar chart that looks like analytics loading
    const bars = [40, 70, 50, 85, 60, 75, 45]

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            {/* Animated Analytics Bars */}
            <div className="flex items-end gap-1.5 h-16">
                {bars.map((height, i) => (
                    <motion.div
                        key={i}
                        className="w-2 rounded-sm bg-white"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: `${height}%`,
                            opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                            height: {
                                duration: 0.5,
                                delay: i * 0.1,
                                ease: "easeOut"
                            },
                            opacity: {
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeInOut"
                            }
                        }}
                    />
                ))}
            </div>

            {/* Loading text */}
            <motion.p
                className="text-sm text-zinc-500 tracking-wide"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            >
                Loading analytics...
            </motion.p>
        </div>
    );
}
