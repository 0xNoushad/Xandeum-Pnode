"use client";

import { MetricCharts } from "@/components/dashboard/metric-charts"
import { AnimatedHeader, MotionDiv } from "@/components/motion-div"
import { AIChatButton } from "@/components/ai-chat-button"
import { useNetworkStats, usePNodes } from "@/hooks/use-pnodes"
import { Activity, Zap, Server, Layers } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchNetworkMetrics, type NetworkMetrics } from "@/lib/xandeum"

export default function ChartsPage() {
    const { stats: networkStats } = useNetworkStats(5000); // Update every 5s
    const { nodes } = usePNodes({ pollingInterval: 30000, enablePolling: true, useGossipData: true });
    const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);

    useEffect(() => {
        fetchNetworkMetrics().then(setMetrics);
        const interval = setInterval(() => {
            fetchNetworkMetrics().then(setMetrics);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Calculate region distribution from nodes
    const nodesByRegion = nodes.reduce((acc, node) => {
        const country = node.country || "Unknown";
        const existing = acc.find(r => r.name === country);
        if (existing) {
            existing.count++;
        } else {
            acc.push({ name: country, count: 1 });
        }
        return acc;
    }, [] as { name: string; count: number }[]);

    const activeNodes = nodes.filter(n => n.status === "Active").length;
    const delinquentNodes = nodes.filter(n => n.status === "Delinquent").length;

    const displayMetrics: NetworkMetrics = metrics || {
        totalNodes: nodes.length,
        activeNodes,
        delinquentNodes,
        totalTransactions: networkStats?.slot || 0,
        tps: networkStats?.tps || 0,
        epoch: networkStats?.epoch || 0,
        totalStake: networkStats?.totalStake || 0,
        nodesByRegion,
        churnRate: nodes.length > 0 ? Math.round(delinquentNodes / nodes.length * 100 * 10) / 10 : 0,
        averageLatency: 45,
        averageUptime: 99.5,
        history: [],
    };

    return (
        <div className="space-y-6 page-container pb-10">
            <AnimatedHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Performance</h1>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <p className="text-zinc-500 text-xs sm:text-sm">Real-time network analytics</p>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs text-emerald-400">Live</span>
                            </div>
                        </div>
                    </div>
                    <AIChatButton />
                </div>
            </AnimatedHeader>

            {/* Live Network Stats */}
            <MotionDiv delay={0.05}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="h-4 w-4 text-blue-400" />
                            <span className="text-xs text-zinc-500">Current Slot</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-50 font-mono">
                            {networkStats?.slot?.toLocaleString() || "—"}
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Server className="h-4 w-4 text-purple-400" />
                            <span className="text-xs text-zinc-500">Block Height</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-50 font-mono">
                            {networkStats?.blockHeight?.toLocaleString() || "—"}
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs text-zinc-500">TPS</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                            {networkStats?.tps?.toFixed(2) || "—"}
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-orange-400" />
                            <span className="text-xs text-zinc-500">Epoch</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-50 font-mono">
                            {networkStats?.epoch || "—"}
                        </div>
                    </div>
                </div>
            </MotionDiv>

            <MotionDiv delay={0.1}>
                <MetricCharts metrics={displayMetrics} />
            </MotionDiv>
        </div>
    )
}
