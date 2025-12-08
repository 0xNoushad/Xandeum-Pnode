"use client";

import { motion } from "framer-motion";
import { Coins, TrendingUp, Zap } from "lucide-react";
import NumberFlow from "@number-flow/react";

interface CreditsDisplayProps {
    credits: number;
    epochCredits?: number;
    className?: string;
}

export function CreditsDisplay({ credits, epochCredits, className = "" }: CreditsDisplayProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <motion.div
                whileHover={{ rotate: 15 }}
                className="p-2 rounded-lg bg-orange-500/10"
            >
                <Coins className="h-4 w-4 text-orange-400" />
            </motion.div>
            <div>
                <div className="flex items-baseline gap-1">
                    <NumberFlow
                        value={credits}
                        format={{ notation: "compact", maximumFractionDigits: 1 }}
                        className="text-lg font-bold text-white"
                    />
                    <span className="text-xs text-zinc-500">credits</span>
                </div>
                {epochCredits !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{epochCredits.toLocaleString()} this epoch</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Compact inline version
export function CreditsInline({ credits }: { credits: number }) {
    return (
        <span className="inline-flex items-center gap-1 text-orange-400">
            <Zap className="h-3 w-3" />
            <span className="font-medium">{credits.toLocaleString()}</span>
        </span>
    );
}
