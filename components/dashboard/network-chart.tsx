"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { NetworkHistoryPoint } from "@/lib/xandeum"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const chartConfig = {
    storageUsed: {
        label: "Storage Used",
        color: "hsl(var(--chart-1))",
    },
    activeNodes: {
        label: "Active Nodes",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

interface NetworkChartProps {
    data: NetworkHistoryPoint[]
}

export function NetworkChart({ data }: NetworkChartProps) {
    // Simple data transformation for formatting
    const chartData = data.map(item => ({
        ...item,
        // Convert to GB/TB for smoother display if needed, but keeping raw for now
    }));

    return (
        <Card className="col-span-1 lg:col-span-5 rounded-xl border-none shadow-sm">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b border-border/50 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle>Network Usage</CardTitle>
                    <CardDescription>
                        Showing total storage saturation over time
                    </CardDescription>
                </div>
                <Select defaultValue="30d">
                    <SelectTrigger className="w-[120px] rounded-lg h-9 ml-auto" aria-label="Select value">
                        <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
                        <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
                        <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="fillStorage" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-storageUsed)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-storageUsed)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value) // Assuming value is date string
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="storageUsed"
                            type="natural"
                            fill="url(#fillStorage)"
                            stroke="var(--color-storageUsed)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
