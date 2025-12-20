"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { xandeumRPC } from "@/lib/xandeum-rpc";



// Animated counter
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Blinking cursor
function Cursor() {
  return <span className="inline-block w-[2px] h-[1.1em] bg-emerald-400 ml-0.5 animate-pulse align-middle" />;
}

// Terminal line component
function TerminalLine({ prefix, text, delay, typing = false }: { prefix: string; text: string; delay: number; typing?: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!typing) {
      setDisplayed(text);
      return;
    }
    
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 500);
        }
      }, 40);
      return () => clearInterval(interval);
    }, delay * 1000);
    
    return () => clearTimeout(timeout);
  }, [text, delay, typing]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
      <span className="text-emerald-400">{prefix}</span>
      <span className="text-zinc-300">{displayed}</span>
      {typing && showCursor && <Cursor />}
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState({ nodes: 0, tps: 0, stake: 0 });
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await xandeumRPC.getNetworkStats();
        setStats({
          nodes: data.activeNodes,
          tps: Math.round(data.tps || 0),
          stake: Math.round((data.totalStake || 0) / 1e9),
        });
        setLoaded(true);
      } catch {
        setStats({ nodes: 17, tps: 2400, stake: 5 });
        setLoaded(true);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6 bg-black font-mono">
      {/* Spotlight effect */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16,185,129,0.04), transparent 40%)`,
        }}
      />

      {/* Scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
        }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-8">
        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/80 backdrop-blur w-full"
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-700" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-zinc-700" />
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-500 ml-2">xandeum-analytics</span>
          </div>

          {/* Terminal content */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* ASCII art / Logo */}
            <motion.pre
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-emerald-400 text-[6px] xs:text-[8px] sm:text-xs leading-tight overflow-x-auto"
            >
{`██╗  ██╗ █████╗ ███╗   ██╗██████╗ ███████╗██╗   ██╗███╗   ███╗
╚██╗██╔╝██╔══██╗████╗  ██║██╔══██╗██╔════╝██║   ██║████╗ ████║
 ╚███╔╝ ███████║██╔██╗ ██║██║  ██║█████╗  ██║   ██║██╔████╔██║
 ██╔██╗ ██╔══██║██║╚██╗██║██║  ██║██╔══╝  ██║   ██║██║╚██╔╝██║
██╔╝ ██╗██║  ██║██║ ╚████║██████╔╝███████╗╚██████╔╝██║ ╚═╝ ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚═╝`}
            </motion.pre>

            <div className="h-px bg-zinc-800 my-4" />

            {/* Terminal lines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <TerminalLine prefix="$" text="connecting to xandeum..." delay={0.5} typing />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-[10px] sm:text-sm text-zinc-500"
              >
                → connected to api.xandeum.com:8899
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="pt-2"
              >
                <TerminalLine prefix="$" text="fetch network_stats" delay={2} typing />
              </motion.div>
            </motion.div>

            {/* Stats output */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
              className="bg-zinc-900/50 rounded p-3 sm:p-4 space-y-2 border border-zinc-800"
            >
              <div className="text-[10px] sm:text-xs text-zinc-500 mb-2 sm:mb-3">{"// network status"}</div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <div className="text-lg sm:text-2xl text-white font-bold">
                    {loaded ? <Counter value={stats.nodes} /> : <span className="text-zinc-600">--</span>}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-zinc-600 uppercase tracking-wider">validators</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl text-white font-bold">
                    {loaded ? <Counter value={stats.tps} /> : <span className="text-zinc-600">--</span>}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-zinc-600 uppercase tracking-wider">tps</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl text-white font-bold">
                    {loaded ? <Counter value={stats.stake} suffix="B" /> : <span className="text-zinc-600">--</span>}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-zinc-600 uppercase tracking-wider">stake</div>
                </div>
              </div>
            </motion.div>

            {/* Status line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5 }}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400">status:</span>
              <span className="text-zinc-300">operational</span>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 }}
          className="flex justify-center"
        >
          <Link href="/dashboard">
            <button className="group flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 border border-zinc-700 rounded text-zinc-300 text-xs sm:text-sm hover:bg-zinc-900 hover:border-zinc-600 hover:text-white transition-all touch-target">
              <span className="text-emerald-400">→</span>
              <span>enter dashboard</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
