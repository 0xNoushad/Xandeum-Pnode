"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AlertCircle, Database, Search, Wifi, WifiOff } from "lucide-react"

interface EmptyStateProps {
    type?: "no-data" | "no-results" | "error" | "offline"
    title?: string
    description?: string
    action?: React.ReactNode
    className?: string
    icon?: React.ReactNode
}

const defaultContent = {
    "no-data": {
        icon: <Database className="h-10 w-10" />,
        title: "No Data Available",
        description: "There's no data to display at the moment. Check back later."
    },
    "no-results": {
        icon: <Search className="h-10 w-10" />,
        title: "No Results Found",
        description: "We couldn't find any matches for your search. Try a different query."
    },
    "error": {
        icon: <AlertCircle className="h-10 w-10" />,
        title: "Something Went Wrong",
        description: "We encountered an error loading this data. Please try again."
    },
    "offline": {
        icon: <WifiOff className="h-10 w-10" />,
        title: "You're Offline",
        description: "Please check your internet connection and try again."
    }
}

export function EmptyState({
    type = "no-data",
    title,
    description,
    action,
    className,
    icon
}: EmptyStateProps) {
    const content = defaultContent[type]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "flex flex-col items-center justify-center py-16 px-6 text-center",
                className
            )}
        >
            {/* Animated icon container */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="relative mb-6"
            >
                {/* Background circles */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-zinc-800/50"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{ transform: "translate(-50%, -50%)", left: "50%", top: "50%", width: 80, height: 80 }}
                />
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800/50 text-zinc-400">
                    {icon || content.icon}
                </div>
            </motion.div>

            {/* Title */}
            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-semibold text-zinc-200 mb-2"
            >
                {title || content.title}
            </motion.h3>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-zinc-500 max-w-sm mb-6"
            >
                {description || content.description}
            </motion.p>

            {/* Action button */}
            {action && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    )
}

// Inline empty state for smaller areas
interface InlineEmptyStateProps {
    message: string
    icon?: React.ReactNode
    className?: string
}

export function InlineEmptyState({
    message,
    icon,
    className
}: InlineEmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                "flex items-center justify-center gap-2 py-8 text-zinc-500 text-sm",
                className
            )}
        >
            {icon}
            <span>{message}</span>
        </motion.div>
    )
}
