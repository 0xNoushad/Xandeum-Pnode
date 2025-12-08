"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Copy, Activity, Server, Network, Globe, ArrowLeft, ExternalLink, RefreshCw,
    Zap, Shield, Wifi, CheckCircle2, AlertCircle, Coins, Users
} from "lucide-react";
import { usePNodeDetail } from "@/hooks/use-pnodes";

export default function NodeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const publicKey = params.publicKey as string;
    const { node, isLoading, error, refresh } = usePNodeDetail(publicKey);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (node) {
            await navigator.clipboard.writeText(node.pubkey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            case "Delinquent": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
            case "Offline": return "bg-red-500/10 text-red-400 border-red-500/30";
            default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
        }
    };

    // Format stake (lamports to XAND)
    const formatStake = (lamports: number) => {
        const xand = lamports / 1e9;
        if (xand >= 1e6) return `${(xand / 1e6).toFixed(2)}M XAND`;
        if (xand >= 1e3) return `${(xand / 1e3).toFixed(2)}K XAND`;
        return `${xand.toFixed(2)} XAND`;
    };

    if (isLoading) {
        return (
            <div className="space-y-6 page-container">
                <div className="animate-pulse space-y-6">
                    <div className="h-20 bg-zinc-800/50 rounded-2xl" />
                    <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-zinc-800/50 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !node) {
        return (
            <div className="space-y-6 page-container">
                <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                    <h2 className="text-xl font-semibold text-zinc-100 mb-2">Node Not Found</h2>
                    <p className="text-zinc-500 mb-6">Could not load details for this node.</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 page-container pb-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:gap-4"
            >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="space-y-2">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Back to Nodes
                        </button>
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-50">
                                Node Details
                            </h1>
                            <Badge className={getStatusColor(node.status)}>
                                <span className={`mr-1 sm:mr-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full inline-block ${
                                    node.status === "Active" ? "bg-emerald-400 animate-pulse" :
                                    node.status === "Delinquent" ? "bg-amber-400" : "bg-red-400"
                                }`} />
                                {node.status}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="text-[10px] sm:text-sm text-zinc-400 font-mono bg-zinc-800/50 px-2 sm:px-3 py-1 rounded-lg truncate max-w-[200px] sm:max-w-none">
                                {node.pubkey.slice(0, 12)}...{node.pubkey.slice(-8)}
                            </code>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" onClick={handleCopy}>
                                {copied ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => refresh()} className="border-white/10 h-8 sm:h-9">
                            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-2">Refresh</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 h-8 sm:h-9"
                            onClick={() => window.open(`https://explorer.solana.com/address/${node.pubkey}?cluster=custom&customUrl=https%3A%2F%2Fapi.devnet.xandeum.com%3A8899`, "_blank")}
                        >
                            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline ml-2">Explorer</span>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Real Data Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4"
            >
                <StatCard
                    icon={Coins}
                    label="Activated Stake"
                    value={formatStake(node.activatedStake)}
                    color="purple"
                    real
                />
                <StatCard
                    icon={Zap}
                    label="Commission"
                    value={`${node.commission}%`}
                    color="orange"
                    real
                />
                <StatCard
                    icon={Activity}
                    label="Epoch Credits"
                    value={node.credits.toLocaleString()}
                    color="emerald"
                    real
                />
                <StatCard
                    icon={Users}
                    label="Peers"
                    value={node.network.peersConnected.toString()}
                    color="blue"
                    real
                />
            </motion.div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Node Information - ALL REAL */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-zinc-100">
                                <Server className="h-5 w-5 text-blue-400" />
                                Node Information
                                <Badge variant="outline" className="ml-auto text-xs border-emerald-500/30 text-emerald-400">
                                    Real Data
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InfoRow label="Public Key" value={`${node.pubkey.slice(0, 20)}...`} icon={Shield} mono />
                            <InfoRow label="Gossip Address" value={node.gossipAddress} icon={Network} mono />
                            {node.rpcAddress && <InfoRow label="RPC Address" value={node.rpcAddress} icon={Wifi} mono />}
                            <InfoRow label="Version" value={node.version} icon={Shield} />
                            {node.votePubkey && <InfoRow label="Vote Account" value={`${node.votePubkey.slice(0, 16)}...`} icon={CheckCircle2} mono />}
                            <InfoRow label="Last Vote" value={node.lastVote?.toLocaleString() || "N/A"} icon={Activity} />
                            <InfoRow label="Root Slot" value={node.rootSlot?.toLocaleString() || "N/A"} icon={Server} />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Location - REAL from IP Geolocation */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-zinc-100">
                                <Globe className="h-5 w-5 text-emerald-400" />
                                Location
                                <Badge variant="outline" className="ml-auto text-xs border-emerald-500/30 text-emerald-400">
                                    From IP
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InfoRow label="Country" value={node.country || "Unknown"} icon={Globe} />
                            <InfoRow label="City" value={node.city || "Unknown"} icon={Globe} />
                            <InfoRow label="Region" value={node.region} icon={Globe} />
                            <InfoRow label="ISP" value={node.isp || "Unknown"} icon={Network} />
                            {node.coordinates && (
                                <InfoRow 
                                    label="Coordinates" 
                                    value={`${node.coordinates[0].toFixed(4)}, ${node.coordinates[1].toFixed(4)}`} 
                                    icon={Globe} 
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Validator Stats - REAL */}
                {node.isValidator && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
                        <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-zinc-100">
                                    <Zap className="h-5 w-5 text-orange-400" />
                                    Validator Stats
                                    <Badge variant="outline" className="ml-auto text-xs border-emerald-500/30 text-emerald-400">
                                        From Vote Account
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                                    <div className="text-center p-3 sm:p-4 rounded-xl bg-zinc-800/50">
                                        <div className="text-lg sm:text-3xl font-bold text-purple-400">{formatStake(node.activatedStake)}</div>
                                        <div className="text-[10px] sm:text-sm text-zinc-500 mt-1">Activated Stake</div>
                                    </div>
                                    <div className="text-center p-3 sm:p-4 rounded-xl bg-zinc-800/50">
                                        <div className="text-lg sm:text-3xl font-bold text-orange-400">{node.commission}%</div>
                                        <div className="text-[10px] sm:text-sm text-zinc-500 mt-1">Commission</div>
                                    </div>
                                    <div className="text-center p-3 sm:p-4 rounded-xl bg-zinc-800/50">
                                        <div className="text-lg sm:text-3xl font-bold text-emerald-400">{node.credits.toLocaleString()}</div>
                                        <div className="text-[10px] sm:text-sm text-zinc-500 mt-1">Epoch Credits</div>
                                    </div>
                                    <div className="text-center p-3 sm:p-4 rounded-xl bg-zinc-800/50">
                                        <div className="text-lg sm:text-3xl font-bold text-blue-400">{node.lastVote?.toLocaleString() || "N/A"}</div>
                                        <div className="text-[10px] sm:text-sm text-zinc-500 mt-1">Last Vote Slot</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    icon: Icon,
    label,
    value,
    color,
    real
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: "emerald" | "blue" | "orange" | "purple";
    real?: boolean;
}) {
    const colorClasses = {
        emerald: "text-emerald-400 bg-emerald-500/10",
        blue: "text-blue-400 bg-blue-500/10",
        orange: "text-orange-400 bg-orange-500/10",
        purple: "text-purple-400 bg-purple-500/10",
    };

    return (
        <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    {real && <span className="text-[8px] sm:text-[10px] text-emerald-500 font-medium">REAL</span>}
                </div>
                <div className="text-lg sm:text-2xl font-bold text-zinc-100 truncate">{value}</div>
                <div className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1">{label}</div>
            </CardContent>
        </Card>
    );
}

// Info Row Component
function InfoRow({ 
    label, 
    value, 
    icon: Icon,
    mono 
}: { 
    label: string; 
    value: string; 
    icon: React.ElementType;
    mono?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-2 text-zinc-500">
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
            </div>
            <span className={`text-sm text-zinc-200 ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );
}
