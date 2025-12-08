"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TooltipProps {
    children: React.ReactNode
    content: React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
    className?: string
}

export function SimpleTooltip({
    children,
    content,
    side = "top",
    className
}: TooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false)

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2"
    }

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                        "absolute z-50 px-3 py-1.5 text-xs text-zinc-200 rounded-xl",
                        "bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-lg",
                        "whitespace-nowrap pointer-events-none",
                        positionClasses[side],
                        className
                    )}
                >
                    {content}
                </motion.div>
            )}
        </div>
    )
}

interface InfoTooltipProps {
    content: React.ReactNode
    side?: "top" | "right" | "bottom" | "left"
}

export function InfoTooltip({ content, side = "top" }: InfoTooltipProps) {
    return (
        <SimpleTooltip content={content} side={side}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-zinc-800 text-zinc-400 text-[10px] hover:bg-zinc-700 hover:text-zinc-300 transition-colors focus-ring"
            >
                ?
            </motion.button>
        </SimpleTooltip>
    )
}
