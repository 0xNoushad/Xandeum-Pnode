"use client"

import { Area, AreaChart, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { fetchXandPriceHistory, fetchXandPrice, formatPrice, PriceHistoryPoint, XandPrice } from "@/lib/coingecko"
import { TrendingUp, TrendingDown } from "lucide-react"

export function PerformanceChart() {
    const { theme } = useTheme()
    const [timeRange, setTimeRange] = useState("30D")
    const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([])
    const [currentPrice, setCurrentPrice] = useState<XandPrice | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch real price history from CoinGecko
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const days = timeRange === "7D" ? 7 : timeRange === "30D" ? 30 : timeRange === "3M" ? 90 : timeRange === "1Y" ? 365 : 365
                const [history, price] = await Promise.all([
                    fetchXandPriceHistory(days),
                    fetchXandPrice()
                ])
                setPriceHistory(history)
                setCurrentPrice(price)
            } catch (error) {
                console.error("Failed to load price history:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [timeRange])

    // Transform data for the chart
    const chartData = useMemo(() => {
        if (priceHistory.length === 0) return []
        
        // Sample data points for smoother chart (max ~50 points)
        const step = Math.max(1, Math.floor(priceHistory.length / 50))
        return priceHistory
            .filter((_, i) => i % step === 0)
            .map(item => ({
                date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                price: item.price,
                timestamp: item.timestamp
            }))
    }, [priceHistory])

    const isDark = theme === "dark"
    const isPositive = currentPrice ? currentPrice.usd_24h_change >= 0 : true

    // Calculate price range for display
    const priceRange = useMemo(() => {
        if (chartData.length === 0) return { min: 0, max: 0, change: 0 }
        const prices = chartData.map(d => d.price)
        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const first = prices[0]
        const last = prices[prices.length - 1]
        const change = first > 0 ? ((last - first) / first) * 100 : 0
        return { min, max, change }
    }, [chartData])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <Card className="col-span-1 lg:col-span-4 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-4 sm:p-8 pb-2 sm:pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className={cn(
                                    "p-1 sm:p-1.5 rounded-md",
                                    isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {isPositive ? <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                </div>
                                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">XAND Price History</h3>
                            </div>
                            <div className="flex items-baseline gap-2 sm:gap-3">
                                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    ${currentPrice ? formatPrice(currentPrice.usd) : "—"}
                                </h2>
                                {currentPrice && (
                                    <span className={cn(
                                        "text-xs sm:text-sm font-medium",
                                        isPositive ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        {isPositive ? "+" : ""}{currentPrice.usd_24h_change.toFixed(2)}% (24h)
                                    </span>
                                )}
                            </div>
                            {chartData.length > 0 && (
                                <div className="text-[10px] sm:text-xs text-zinc-500 mt-1">
                                    Range: ${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}
                                    <span className={cn(
                                        "ml-1 sm:ml-2",
                                        priceRange.change >= 0 ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        ({priceRange.change >= 0 ? "+" : ""}{priceRange.change.toFixed(1)}%)
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-800">
                            {["7D", "30D", "3M", "1Y"].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={cn(
                                        "px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md sm:rounded-lg transition-all duration-200",
                                        timeRange === range
                                            ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    )}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <CardContent className="p-0 min-h-[200px] sm:min-h-[300px] h-[200px] sm:h-[300px]">
                    {loading ? (
                        <div className="h-[180px] sm:h-[280px] flex items-center justify-center">
                            <div className="animate-pulse text-zinc-500 text-sm">Loading price data...</div>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-[180px] sm:h-[280px] flex items-center justify-center">
                            <div className="text-zinc-500 text-sm">No price data available</div>
                        </div>
                    ) : (
                        <div className="h-[180px] sm:h-[280px] w-full mt-2 sm:mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke={isDark ? "#27272a" : "#f4f4f5"} strokeDasharray="0" />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload || !payload.length) return null
                                            const data = payload[0]?.payload
                                            return (
                                                <div className="rounded-lg border border-zinc-200 bg-white p-2 sm:p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] sm:text-[10px] uppercase text-zinc-500 font-semibold">
                                                            {data?.date}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("h-2 w-2 rounded-full", isPositive ? "bg-emerald-500" : "bg-red-500")} />
                                                            <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                                                ${formatPrice(data?.price || 0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={isPositive ? "#10b981" : "#ef4444"}
                                        strokeWidth={2}
                                        fill="url(#fillPrice)"
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {chartData.length > 0 && (
                        <div className="hidden sm:flex justify-between px-8 pb-6 text-xs text-zinc-400 font-medium translate-y-[-20px]">
                            {chartData.length > 6 ? (
                                chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0).map((item, i) => (
                                    <div key={i}>{item.date}</div>
                                ))
                            ) : (
                                chartData.map((item, i) => <div key={i}>{item.date}</div>)
                            )}
                        </div>
                    )}
                </CardContent>
                <div className="px-4 sm:px-8 pb-3 sm:pb-4 text-[10px] sm:text-xs text-zinc-500">
                    Data from CoinGecko • Real-time XAND/USD
                </div>
            </Card>
        </motion.div>
    )
}
