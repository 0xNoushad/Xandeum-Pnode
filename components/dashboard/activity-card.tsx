"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Prop definition for individual data points
export interface ActivityDataPoint {
    day: string;
    value: number;
}

// Prop definition for the component
interface ActivityChartCardProps {
    title?: string;
    totalValue: string;
    data: ActivityDataPoint[];
    className?: string;
    dropdownOptions?: string[];
}

/**
 * A responsive and animated card component to display weekly activity data.
 * Features a bar chart animated with Framer Motion and supports shadcn theming.
 */
export const ActivityChartCard = ({
    title = "Activity",
    totalValue,
    data,
    className,
    dropdownOptions = ["Weekly", "Monthly", "Yearly"],
}: ActivityChartCardProps) => {
    const [selectedRange, setSelectedRange] = React.useState(
        dropdownOptions[0] || ""
    );

    // Find the maximum value in the data to normalize bar heights
    const maxValue = React.useMemo(() => {
        return data.reduce((max, item) => (item.value > max ? item.value : max), 0);
    }, [data]);

    // Framer Motion variants for animations
    const chartVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Animate each child (bar) with a delay
            },
        },
    };

    const barVariants = {
        hidden: { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
        visible: {
            scaleY: 1,
            opacity: 1,
            transformOrigin: "bottom",
            transition: {
                duration: 0.5,
                ease: "easeOut" as const, // Cubic bezier for a smooth bounce effect
            },
        },
    };

    return (
        <Card
            className={cn("w-full h-full flex flex-col transition-all hover:bg-zinc-900/60", className)}
            aria-labelledby="activity-card-title"
        >
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle id="activity-card-title" className="text-zinc-100">{title}</CardTitle>
                    <Select value={selectedRange} onValueChange={setSelectedRange}>
                        <SelectTrigger className="w-[100px] h-8 border-none bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white focus:ring-0 shadow-none">
                            <SelectValue placeholder="Range" />
                        </SelectTrigger>
                        <SelectContent align="end" className="bg-zinc-900 border-white/10 text-zinc-300">
                            {dropdownOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 h-full">
                    {/* Total Value */}
                    <div className="flex flex-col flex-shrink-0">
                        <p className="text-5xl font-bold tracking-tighter text-white">
                            {totalValue}
                        </p>
                        <CardDescription className="flex items-center gap-1 text-zinc-400 mt-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">+12%</span> from last week
                        </CardDescription>
                    </div>

                    {/* Bar Chart - Fixed height container for proper percentage calculation */}
                    <motion.div
                        key={selectedRange}
                        className="flex-1 h-32 w-full flex items-end justify-between gap-2"
                        variants={chartVariants}
                        initial="hidden"
                        animate="visible"
                        aria-label="Activity chart"
                    >
                        {data.map((item, index) => (
                            <div
                                key={index}
                                className="flex-1 h-full flex flex-col items-center justify-end gap-2"
                                role="presentation"
                            >
                                <motion.div
                                    className="w-full rounded-md bg-white/90 hover:bg-blue-500 transition-colors"
                                    style={{
                                        height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                    }}
                                    variants={barVariants}
                                    aria-label={`${item.day}: ${item.value} hours`}
                                />
                                <span className="text-xs text-zinc-500 font-medium flex-shrink-0">
                                    {item.day}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
};
