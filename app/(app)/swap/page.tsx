"use client";

import { useState, useEffect, useMemo } from "react";
import { MotionDiv, AnimatedHeader } from "@/components/motion-div";
import { fetchXandPrice, fetchXandPriceHistory, formatMarketCap, formatVolume, formatPrice, type XandPrice, type PriceHistoryPoint } from "@/lib/coingecko";
import { TrendingUp, TrendingDown, Wallet, ExternalLink } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Image from "next/image";

export default function SwapPage() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [xandPrice, setXandPrice] = useState<XandPrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [amount, setAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1W");
  const [isLoading, setIsLoading] = useState(true);

  const getDaysForRange = (range: string): number => {
    switch (range) {
      case "1D": return 1;
      case "1W": return 7;
      case "1M": return 30;
      case "3M": return 90;
      case "1Y": return 365;
      default: return 7;
    }
  };

  // Fetch price data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [price, history] = await Promise.all([
        fetchXandPrice(),
        fetchXandPriceHistory(getDaysForRange(timeRange))
      ]);
      setXandPrice(price);
      setPriceHistory(history);
      setIsLoading(false);
    };
    loadData();
    
    const interval = setInterval(() => {
      fetchXandPrice().then(setXandPrice);
    }, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Format chart data
  const chartData = useMemo(() => {
    return priceHistory.map(point => ({
      time: new Date(point.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: timeRange === "1D" ? "numeric" : undefined,
      }),
      price: point.price,
      timestamp: point.timestamp,
    }));
  }, [priceHistory, timeRange]);

  const priceChange = xandPrice?.usd_24h_change || 0;
  const isPositive = priceChange >= 0;

  const quickAmounts = [50, 100, 500, 1000, 2000];

  const handleConnectWallet = () => {
    setVisible(true);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const xandReceived = useMemo(() => {
    if (!amount || !xandPrice) return 0;
    return parseFloat(amount) / xandPrice.usd;
  }, [amount, xandPrice]);

  // Jupiter swap URL for real trading
  const jupiterSwapUrl = useMemo(() => {
    const inputMint = "So11111111111111111111111111111111111111112"; // SOL
    const outputMint = "XANDnSwNcxVnrHZHe1wgP9jPVWJC3rVzLHQpTRZ3Pgs"; // XAND (placeholder - replace with real mint)
    return `https://jup.ag/swap/${inputMint}-${outputMint}`;
  }, []);

  return (
    <div className="space-y-4 pb-8">
      <AnimatedHeader>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Swap</h1>
              <p className="text-zinc-500 text-sm">Trade XAND tokens</p>
            </div>
            {/* Xandeum Ticker */}
            {xandPrice && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-white/10">
                <Image 
                  src="/xandeum.png" 
                  alt="XAND" 
                  width={20} 
                  height={20} 
                  className="rounded-full"
                />
                <span className="text-sm font-medium text-zinc-200">Xandeum</span>
                <span className={`text-xs font-medium ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
                <span className="text-sm font-semibold text-zinc-100">{formatPrice(xandPrice.usd)}</span>
              </div>
            )}
          </div>
          {connected && publicKey ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-zinc-800 border border-white/10 text-sm text-zinc-300">
                {shortenAddress(publicKey.toBase58())}
              </div>
              <button 
                onClick={() => disconnect()}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-sm text-zinc-400 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={handleConnectWallet}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-medium text-sm transition-colors"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          )}
        </header>
      </AnimatedHeader>

      {/* Main Layout */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-stretch">
        
        {/* Chart Section */}
        <MotionDiv delay={0} className="h-full">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-5 h-full flex flex-col">
            {/* Token Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image src="/xandeum.png" alt="XAND" width={36} height={36} className="rounded-full" />
                <div>
                  <span className="text-base font-semibold text-zinc-100">XAND</span>
                  <span className="text-xs text-zinc-500 ml-2">Xandeum</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-zinc-50">
                {xandPrice ? formatPrice(xandPrice.usd) : "—"}
              </div>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-1 mb-4">
              {(["1D", "1W", "1M", "3M", "1Y"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    timeRange === range 
                      ? "bg-white/10 text-zinc-100" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Real Chart */}
            <div className="flex-1 w-full min-h-[220px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  <div className="animate-pulse">Loading chart...</div>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      interval={Math.floor(chartData.length / 5)}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      tickFormatter={(val) => val.toFixed(4)}
                      width={50}
                      tickCount={5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                      itemStyle={{ color: '#10b981' }}
                      formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </MotionDiv>

        {/* Trade Card */}
        <MotionDiv delay={0.05} className="h-full">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-5 h-full flex flex-col">
            {/* Buy/Sell Toggle */}
            <div className="flex bg-zinc-800 rounded-lg p-1 mb-5">
              <button
                onClick={() => setTradeType("buy")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  tradeType === "buy" 
                    ? "bg-emerald-500 text-zinc-900" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType("sell")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  tradeType === "sell" 
                    ? "bg-red-500 text-white" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Sell
              </button>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="text-xs text-zinc-500 mb-2 block">Amount (USD)</label>
              <div className="flex items-center bg-zinc-800 rounded-lg px-3 py-2.5">
                <span className="text-zinc-500 mr-1">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-semibold text-zinc-100 outline-none placeholder:text-zinc-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                >
                  {amt}
                </button>
              ))}
            </div>

            {/* You receive */}
            {amount && xandPrice && (
              <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
                <div className="text-xs text-zinc-500 mb-1">You {tradeType === "buy" ? "receive" : "get"}</div>
                <div className="text-lg font-semibold text-zinc-100">
                  {tradeType === "buy" 
                    ? `${xandReceived.toLocaleString(undefined, { maximumFractionDigits: 2 })} XAND`
                    : `${(parseFloat(amount) * (xandPrice?.usd || 0)).toFixed(2)} USD`
                  }
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-auto">
              {connected ? (
                <a 
                  href={jupiterSwapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {tradeType === "buy" ? "Buy on Jupiter" : "Sell on Jupiter"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <button 
                  onClick={handleConnectWallet}
                  className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-semibold transition-colors"
                >
                  Connect Wallet to Trade
                </button>
              )}

              <p className="text-xs text-zinc-600 text-center mt-3">
                Powered by Jupiter Aggregator
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Stats Row */}
      <MotionDiv delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Market Cap</div>
            <div className="text-lg font-bold text-zinc-100">
              {xandPrice ? formatMarketCap(xandPrice.usd_market_cap) : "—"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Volume (24h)</div>
            <div className="text-lg font-bold text-zinc-100">
              {xandPrice ? formatVolume(xandPrice.usd_24h_vol) : "—"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Circulating Supply</div>
            <div className="text-lg font-bold text-zinc-100">420M</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
            <div className="text-xs text-zinc-500 mb-1">Total Liquidity</div>
            <div className="text-lg font-bold text-zinc-100">$45.4K</div>
          </div>
        </div>
      </MotionDiv>

      {/* Trading Activity */}
      <MotionDiv delay={0.15}>
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-500">Trading Activity (24h)</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-emerald-400">95% Buy</span>
              <span className="text-red-400">5% Sell</span>
            </div>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: "95%" }} />
            <div className="bg-red-500 h-full transition-all" style={{ width: "5%" }} />
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
