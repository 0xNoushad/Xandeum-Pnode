"use client";

import { PriceCard } from "@/components/dashboard/price-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Coins } from "lucide-react";
import { motion } from "framer-motion";

interface OverviewCardsProps {
    stats: {
        activeNodes: number;
        totalNodes: number;
        totalStake?: number;
    };
}

function AnimatedStatCard({
    icon: Icon,
    title,
    value,
    subtitle,
    extra,
    color,
    delay
}: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle: string;
    extra?: { label: string; value: string }[];
    color: string;
    delay: number;
}) {
    const colorClasses: Record<string, string> = {
        blue: "text-blue-500",
        orange: "text-orange-500",
        emerald: "text-emerald-500",
        purple: "text-purple-500",
    };

    const bgClasses: Record<string, string> = {
        blue: "bg-blue-500/10",
        orange: "bg-orange-500/10",
        emerald: "bg-emerald-500/10",
        purple: "bg-purple-500/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card className="flex-1 transition-all hover:bg-zinc-900/60 group cursor-pointer border-white/10 bg-zinc-900/50 backdrop-blur-xl h-full">
                <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className={`p-1.5 rounded-lg ${bgClasses[color]}`}
                        >
                            <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${colorClasses[color]}`} />
                        </motion.div>
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: delay + 0.2, duration: 0.3, type: "spring" }}
                        className="text-2xl sm:text-3xl font-bold text-white"
                    >
                        {value}
                    </motion.div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 mt-1">
                        {subtitle}
                    </div>
                    {extra && extra.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                            {extra.map((item, i) => (
                                <div key={i} className="flex justify-between text-[10px] sm:text-xs">
                                    <span className="text-zinc-500">{item.label}</span>
                                    <span className="text-zinc-300 font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

export function OverviewCards({ stats }: OverviewCardsProps) {
    // Format stake for display (lamports to XAND)
    const formatStake = (lamports: number) => {
        const xand = lamports / 1e9;
        if (xand >= 1e9) return `${(xand / 1e9).toFixed(2)}B`;
        if (xand >= 1e6) return `${(xand / 1e6).toFixed(2)}M`;
        if (xand >= 1e3) return `${(xand / 1e3).toFixed(2)}K`;
        return xand.toFixed(2);
    };

    return (
        <motion.div
            className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr"
            initial="hidden"
            animate="visible"
        >
            {/* Price Card - Spans 2 Columns */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="col-span-1 sm:col-span-2"
            >
                <PriceCard />
            </motion.div>

            {/* Real Stats - All from RPC */}
            <AnimatedStatCard
                icon={Server}
                title="Active Validators"
                value={stats.activeNodes}
                subtitle={`of ${stats.totalNodes} total nodes`}
                extra={[
                    { label: "Online", value: `${((stats.activeNodes / stats.totalNodes) * 100).toFixed(0)}%` },
                    { label: "Network", value: "Devnet" },
                ]}
                color="emerald"
                delay={0.2}
            />

            <AnimatedStatCard
                icon={Coins}
                title="Total Stake"
                value={formatStake(stats.totalStake || 0)}
                subtitle="XAND locked"
                extra={[
                    { label: "Per Node", value: stats.totalNodes > 0 ? formatStake((stats.totalStake || 0) / stats.totalNodes) : "0" },
                    { label: "Status", value: "Secured" },
                ]}
                color="purple"
                delay={0.25}
            />
        </motion.div>
    );
}
