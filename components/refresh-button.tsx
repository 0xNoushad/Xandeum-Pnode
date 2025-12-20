"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface RefreshButtonProps {
    onClick?: () => void;
    isLoading?: boolean;
}

export function RefreshButton({ onClick, isLoading: externalLoading }: RefreshButtonProps = {}) {
    const router = useRouter()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const isLoading = externalLoading ?? isRefreshing;

    const handleRefresh = () => {
        if (onClick) {
            onClick();
        } else {
            setIsRefreshing(true)
            // Simulate some delay for visual feedback
            setTimeout(() => {
                router.refresh()
                setTimeout(() => setIsRefreshing(false), 500)
            }, 300)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2 border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 group press-effect"
            >
                <motion.div
                    animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={isLoading ? {
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                    } : {
                        duration: 0.3
                    }}
                >
                    <RefreshCw className={`h-4 w-4 transition-colors ${isLoading ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-100'}`} />
                </motion.div>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.span
                            key="refreshing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-emerald-400"
                        >
                            Refreshing...
                        </motion.span>
                    ) : (
                        <motion.span
                            key="refresh"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            Refresh
                        </motion.span>
                    )}
                </AnimatePresence>
            </Button>
        </motion.div>
    )
}
