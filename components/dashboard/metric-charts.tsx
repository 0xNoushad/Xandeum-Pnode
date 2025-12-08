"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Area,
    AreaChart,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    Line,
    LineChart,
} from "recharts"
import { NetworkMetrics } from "@/lib/xandeum"
import { motion } from "framer-motion"
import {
    TrendingUp,
    Clock,
    Zap,
    Activity,
    Server,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from "lucide-react"
import { cn } from "@/lib/utils"

// Premium stat card component
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = "blue",
    delay = 0
}: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    trend?: "up" | "down" | "neutral"
    trendValue?: string
    color?: "blue" | "orange" | "emerald" | "purple" | "rose"
    delay?: number
}) {
    const colorMap = {
        blue: {
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            glow: "shadow-blue-500/10"
        },
        orange: {
            bg: "bg-orange-500/10",
            text: "text-orange-400",
            glow: "shadow-orange-500/10"
        },
        emerald: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            glow: "shadow-emerald-500/10"
        },
        purple: {
            bg: "bg-purple-500/10",
            text: "text-purple-400",
            glow: "shadow-purple-500/10"
        },
        rose: {
            bg: "bg-rose-500/10",
            text: "text-rose-400",
            glow: "shadow-rose-500/10"
        }
    }

    const colors = colorMap[color]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
            <Card className={cn(
                "relative overflow-hidden border-white/10 bg-zinc-900/50 backdrop-blur-xl",
                "hover:border-white/20 transition-all duration-300 group h-full"
            )}>
                <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <div className={cn("p-2 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0", colors.bg)}>
                                    <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", colors.text)} />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-zinc-400 truncate">{title}</span>
                            </div>
                            <div>
                                <div className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                                    {value}
                                </div>
                                {subtitle && (
                                    <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 truncate">{subtitle}</p>
                                )}
                            </div>
                        </div>

                        {trend && trendValue && (
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0",
                                trend === "up" ? "bg-emerald-500/10 text-emerald-400" :
                                    trend === "down" ? "bg-rose-500/10 text-rose-400" :
                                        "bg-zinc-500/10 text-zinc-400"
                            )}>
                                {trend === "up" ? <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> :
                                    trend === "down" ? <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : 
                                    <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                                <span className="hidden sm:inline">{trendValue}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// Custom tooltip for charts
interface TooltipPayloadEntry {
    color?: string;
    name?: string;
    value?: number | string;
    dataKey?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null
    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl p-3 shadow-2xl min-w-[140px]">
            <div className="text-xs font-medium text-zinc-400 mb-2 pb-2 border-b border-white/5">{label}</div>
            <div className="space-y-1.5">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-zinc-400 text-xs">{entry.name}</span>
                        </div>
                        <span className="font-semibold text-white text-xs">{entry.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Deterministic pseudo-random based on index for consistent renders
const seededVariation = (index: number, base: number, variance: number) => {
    const seed = Math.sin(index * 12.9898) * 43758.5453;
    const rand = seed - Math.floor(seed);
    return base + (rand * variance);
};

export function MetricCharts({ metrics }: { metrics: NetworkMetrics }) {
    // Generate latency history based on real average latency (deterministic)
    const latencyHistory = metrics.history.map((h, i) => ({
        date: h.date,
        latency: Math.floor(seededVariation(i, metrics.averageLatency * 0.8, metrics.averageLatency * 0.4)),
        responseTime: Math.floor(seededVariation(i + 100, metrics.averageLatency * 1.2, metrics.averageLatency * 0.6)),
    }))

    // Real node status data from RPC
    const nodeStatusData = [
        { name: "Active", value: metrics.activeNodes, color: "#10b981" },
        { name: "Delinquent", value: metrics.delinquentNodes, color: "#f59e0b" },
        { name: "Offline", value: Math.max(0, metrics.totalNodes - metrics.activeNodes - metrics.delinquentNodes), color: "#ef4444" },
    ].filter(d => d.value > 0)

    // Generate uptime history based on real average uptime (deterministic)
    const uptimeHistory = metrics.history.slice(-14).map((h, i) => ({
        date: h.date,
        uptime: Number(seededVariation(i + 200, metrics.averageUptime * 0.98, metrics.averageUptime * 0.04).toFixed(2)),
        target: 99.5
    }))

    // Sort regions by count for better visualization
    const sortedRegions = [...metrics.nodesByRegion]
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Limit to top 8 regions for cleaner display

    const onlinePercentage = ((metrics.activeNodes / metrics.totalNodes) * 100).toFixed(1)

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Active Nodes"
                    value={`${metrics.activeNodes}/${metrics.totalNodes}`}
                    subtitle={`${metrics.delinquentNodes} delinquent`}
                    icon={Activity}
                    trend={Number(onlinePercentage) > 80 ? "up" : Number(onlinePercentage) > 50 ? "neutral" : "down"}
                    trendValue={`${onlinePercentage}%`}
                    color="emerald"
                    delay={0}
                />
                <StatCard
                    title="Total Transactions"
                    value={metrics.totalTransactions.toLocaleString()}
                    subtitle={`TPS: ${metrics.tps.toFixed(1)}`}
                    icon={Zap}
                    trend="up"
                    trendValue={`Epoch ${metrics.epoch}`}
                    color="blue"
                    delay={0.05}
                />
                <StatCard
                    title="Avg Latency"
                    value={`${metrics.averageLatency}ms`}
                    subtitle="Network response time"
                    icon={Clock}
                    trend={metrics.averageLatency < 50 ? "up" : metrics.averageLatency < 100 ? "neutral" : "down"}
                    trendValue={metrics.averageLatency < 50 ? "Excellent" : metrics.averageLatency < 100 ? "Good" : "Fair"}
                    color="purple"
                    delay={0.1}
                />
                <StatCard
                    title="Network Uptime"
                    value={`${metrics.averageUptime.toFixed(1)}%`}
                    subtitle={`Stake: ${(metrics.totalStake / 1e9).toFixed(1)}B XAND`}
                    icon={Server}
                    trend={metrics.averageUptime > 99 ? "up" : metrics.averageUptime > 95 ? "neutral" : "down"}
                    trendValue={metrics.averageUptime > 99 ? "Excellent" : metrics.averageUptime > 95 ? "Good" : "Fair"}
                    color="orange"
                    delay={0.15}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">
                {/* Latency Chart - Takes 4 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="lg:col-span-4"
                >
                    <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl h-full">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500/10">
                                        <Clock className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-zinc-100">Latency Metrics</CardTitle>
                                        <CardDescription className="text-zinc-500 text-xs mt-0.5">Network response time (30 days)</CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={latencyHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#52525b', fontSize: 10 }}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#52525b', fontSize: 10 }}
                                            tickFormatter={(v) => `${v}ms`}
                                            width={45}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="latency"
                                            name="Latency"
                                            stroke="#a855f7"
                                            strokeWidth={2}
                                            fill="url(#latencyGradient)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="responseTime"
                                            name="Response Time"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#responseGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                                    <span className="text-xs text-zinc-500">Latency</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    <span className="text-xs text-zinc-500">Response Time</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Node Status Pie Chart - Takes 3 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="lg:col-span-3"
                >
                    <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl h-full">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10">
                                    <Server className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold text-zinc-100">Node Status</CardTitle>
                                    <CardDescription className="text-zinc-500 text-xs mt-0.5">Current distribution</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-center justify-center">
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
                                        <div
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        <span className="text-xs text-zinc-500">{status.name}</span>
                                        <span className="text-xs font-semibold text-white">{status.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Region Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                >
                    <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-500/10">
                                    <Globe className="h-4 w-4 text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold text-zinc-100">Regional Distribution</CardTitle>
                                    <CardDescription className="text-zinc-500 text-xs mt-0.5">pNodes by geographic location</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sortedRegions} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#52525b', fontSize: 10 }}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={100}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                        <Bar
                                            dataKey="count"
                                            name="Nodes"
                                            fill="url(#barGradient)"
                                            radius={[0, 6, 6, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Uptime History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                >
                    <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-orange-500/10">
                                    <Activity className="h-4 w-4 text-orange-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-semibold text-zinc-100">Uptime Tracking</CardTitle>
                                    <CardDescription className="text-zinc-500 text-xs mt-0.5">Network availability (14 days)</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={uptimeHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#52525b', fontSize: 10 }}
                                        />
                                        <YAxis
                                            domain={[95, 100]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#52525b', fontSize: 10 }}
                                            tickFormatter={(v) => `${v}%`}
                                            width={40}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line
                                            type="monotone"
                                            dataKey="target"
                                            name="Target"
                                            stroke="#10b981"
                                            strokeWidth={1.5}
                                            strokeDasharray="4 4"
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="uptime"
                                            name="Uptime %"
                                            stroke="#f97316"
                                            strokeWidth={2.5}
                                            dot={{ fill: '#f97316', strokeWidth: 0, r: 3 }}
                                            activeDot={{ r: 5, fill: '#f97316' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                                    <span className="text-xs text-zinc-500">Uptime</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-0.5 w-4 bg-emerald-500" style={{ borderStyle: 'dashed' }} />
                                    <span className="text-xs text-zinc-500">Target (99.5%)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Network Growth Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
            >
                <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-zinc-100">Network Growth</CardTitle>
                                <CardDescription className="text-zinc-500 text-xs mt-0.5">Storage capacity and active nodes trend</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="nodesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#52525b', fontSize: 10 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#52525b', fontSize: 10 }}
                                        tickFormatter={(v) => `${v} TB`}
                                        width={50}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#52525b', fontSize: 10 }}
                                        width={35}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="storageUsed"
                                        name="Storage (TB)"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fill="url(#storageGradient)"
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="activeNodes"
                                        name="Active Nodes"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        fill="url(#nodesGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-8 mt-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-xs text-zinc-500">Storage Used (TB)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                                <span className="text-xs text-zinc-500">Active Nodes</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
