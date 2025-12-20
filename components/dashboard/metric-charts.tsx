"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"
import { NetworkMetrics } from "@/lib/xandeum"
import { motion } from "framer-motion"
import { Activity, Server, Globe, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    delay = 0
}: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    color?: "blue" | "orange" | "emerald" | "purple"
    delay?: number
}) {
    const colorMap = {
        blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
        orange: { bg: "bg-orange-500/10", text: "text-orange-400" },
        emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
        purple: { bg: "bg-purple-500/10", text: "text-purple-400" },
    }
    const colors = colorMap[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <Card className="border-white/10 bg-zinc-900/50 h-full">
                <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className={cn("p-2 rounded-lg", colors.bg)}>
                                <Icon className={cn("h-4 w-4", colors.text)} />
                            </div>
                            <span className="text-sm text-zinc-400">{title}</span>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
                            {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

interface TooltipPayloadEntry {
    color?: string;
    name?: string;
    value?: number | string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-white/10 bg-zinc-900/95 p-3 shadow-xl">
            {label && <div className="text-xs text-zinc-400 mb-2">{label}</div>}
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-zinc-400 text-xs">{entry.name}:</span>
                    <span className="font-semibold text-white text-xs">{entry.value}</span>
                </div>
            ))}
        </div>
    )
}

export function MetricCharts({ metrics }: { metrics: NetworkMetrics }) {
    const nodeStatusData = [
        { name: "Active", value: metrics.activeNodes, color: "#10b981" },
        { name: "Delinquent", value: metrics.delinquentNodes, color: "#f59e0b" },
        { name: "Offline", value: Math.max(0, metrics.totalNodes - metrics.activeNodes - metrics.delinquentNodes), color: "#ef4444" },
    ].filter(d => d.value > 0)

    const sortedRegions = [...metrics.nodesByRegion]
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

    const onlinePercent = ((metrics.activeNodes / metrics.totalNodes) * 100).toFixed(1)

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Nodes"
                    value={`${metrics.activeNodes}/${metrics.totalNodes}`}
                    subtitle={`${onlinePercent}% online`}
                    icon={Activity}
                    color="emerald"
                    delay={0}
                />
                <StatCard
                    title="Transactions"
                    value={metrics.totalTransactions.toLocaleString()}
                    subtitle={`TPS: ${metrics.tps.toFixed(1)}`}
                    icon={Zap}
                    color="blue"
                    delay={0.05}
                />
                <StatCard
                    title="Epoch"
                    value={metrics.epoch}
                    subtitle={`${metrics.totalNodes} total nodes`}
                    icon={Server}
                    color="purple"
                    delay={0.1}
                />
                <StatCard
                    title="Total Stake"
                    value={`${(metrics.totalStake / 1e9).toFixed(1)}B`}
                    subtitle="XAND staked"
                    icon={Globe}
                    color="orange"
                    delay={0.15}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Node Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Server className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base text-zinc-100">Node Status</CardTitle>
                                    <CardDescription className="text-zinc-500 text-xs">Current distribution</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={nodeStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {nodeStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-5 mt-2">
                                {nodeStatusData.map((status) => (
                                    <div key={status.name} className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                                        <span className="text-xs text-zinc-500">{status.name}</span>
                                        <span className="text-xs font-semibold text-white">{status.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Region Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                >
                    <Card className="border-white/10 bg-zinc-900/50">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Globe className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base text-zinc-100">Regions</CardTitle>
                                    <CardDescription className="text-zinc-500 text-xs">Nodes by location</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sortedRegions} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#52525b', fontSize: 10 }} />
                                        <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                        <Bar dataKey="count" name="Nodes" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
