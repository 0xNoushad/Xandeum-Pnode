"use client"

import React from "react"
import NumberFlow, { useCanAnimate } from "@number-flow/react"
import { motion } from "framer-motion"
import { ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"

const MotionNumberFlow = motion.create(NumberFlow)
const MotionArrowUp = motion.create(ArrowUp)

export default function AnimatedNumberRandom({
    value,
    diff,
}: {
    value: number
    diff: number
}) {
    const canAnimate = useCanAnimate()

    return (
        <span className="flex items-center justify-start gap-2">
            <NumberFlow
                value={value}
                className="text-2xl font-bold dark:text-white text-black"
                format={value > 1000 ? { style: "decimal", maximumFractionDigits: 0 } : { style: "decimal", maximumFractionDigits: 1 }}
            />
            <motion.span
                className={cn(
                    diff > 0 ? "bg-emerald-400" : "bg-red-500",
                    "inline-flex items-center px-1.5 py-0.5 rounded-full text-white transition-colors duration-300 text-xs font-semibold"
                )}
                layout={canAnimate}
                transition={{ layout: { duration: 0.9, bounce: 0, type: "spring" } }}
            >
                <MotionArrowUp
                    className="mr-0.5 size-3"
                    absoluteStrokeWidth
                    strokeWidth={3}
                    transition={{
                        rotate: { type: "spring", duration: 0.5, bounce: 0 },
                    }}
                    animate={{ rotate: diff > 0 ? 0 : -180 }}
                    initial={false}
                />
                <MotionNumberFlow
                    value={Math.abs(diff)}
                    format={{ style: "percent", maximumFractionDigits: 1 }}
                    layout={canAnimate}
                    layoutRoot={canAnimate}
                />
            </motion.span>
        </span>
    )
}
