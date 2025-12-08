"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { 
    fetchXandPrice, 
    fetchXandPriceHistory, 
    formatPrice, 
    formatMarketCap, 
    formatVolume,
    XandPrice,
    PriceHistoryPoint 
} from "@/lib/coingecko";

export function PriceCard() {
    const [price, setPrice] = useState<XandPrice | null>(null);
    const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [priceData, historyData] = await Promise.all([
                    fetchXandPrice(),
                    fetchXandPriceHistory(7), // 7 days for the mini chart
                ]);
                setPrice(priceData);
                setHistory(historyData);
            } catch (error) {
                console.error("Failed to load price data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        
        // Refresh every minute
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Calculate chart bar heights from history
    const chartBars = history.length > 0 
        ? (() => {
            // Sample ~18 points from history
            const step = Math.max(1, Math.floor(history.length / 18));
            const sampled = history.filter((_, i) => i % step === 0).slice(-18);
            const prices = sampled.map(p => p.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const range = max - min || 1;
            return prices.map(p => 30 + ((p - min) / range) * 70); // 30-100% height
        })()
        : Array(18).fill(50);

    const isPositive = price ? price.usd_24h_change >= 0 : true;

    return (
        <Card className="w-full h-full relative overflow-hidden transition-all hover:bg-zinc-900/60 group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-16 h-16 sm:w-24 sm:h-24 text-emerald-500" />
            </div>

            <CardHeader className="pb-2 p-4 sm:p-6 sm:pb-2">
                <CardTitle className="text-zinc-100 flex items-center justify-between text-sm sm:text-base">
                    <span>XAND Price</span>
                    {price && (
                        <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                            isPositive 
                                ? "bg-emerald-500/10 text-emerald-500" 
                                : "bg-red-500/10 text-red-500"
                        }`}>
                            {isPositive ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                            {isPositive ? "+" : ""}{price.usd_24h_change.toFixed(2)}%
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-8 sm:h-10 bg-zinc-800 rounded w-28 sm:w-32" />
                        <div className="h-4 bg-zinc-800 rounded w-40 sm:w-48" />
                    </div>
                ) : price ? (
                    <>
                        <div className="mt-1 sm:mt-2">
                            <div className="text-2xl sm:text-4xl font-bold text-white tracking-tight flex items-baseline gap-1">
                                {formatPrice(price.usd)}
                                <span className="text-sm sm:text-lg text-zinc-500 font-normal">USD</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-xs sm:text-sm text-zinc-500 mt-1.5 sm:mt-2">
                                <span>
                                    MCap: <span className="text-zinc-300">{formatMarketCap(price.usd_market_cap)}</span>
                                </span>
                                <span>
                                    Vol: <span className="text-zinc-300">{formatVolume(price.usd_24h_vol)}</span>
                                </span>
                            </div>
                        </div>

                        {/* Real price chart */}
                        <div className="mt-4 sm:mt-6 h-12 sm:h-16 flex items-end gap-0.5 sm:gap-1">
                            {chartBars.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: `${h}%`, opacity: 1 }}
                                    transition={{ delay: i * 0.03, duration: 0.5 }}
                                    className={`flex-1 rounded-sm ${isPositive ? "bg-emerald-500/80" : "bg-red-500/80"}`}
                                />
                            ))}
                        </div>

                        <a 
                            href="https://www.coingecko.com/en/coins/xandeum" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-2 sm:mt-3"
                        >
                            Data from CoinGecko <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </a>
                    </>
                ) : (
                    <div className="text-zinc-500 text-xs sm:text-sm">
                        Unable to load price data
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
