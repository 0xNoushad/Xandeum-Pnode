"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NodeAvatar } from "@/components/ui/node-avatar";
import { PNodeMetrics } from "@/lib/xandeum-rpc";
import { usePNodes, useHealthAlerts, useNodeComparison } from "@/hooks/use-pnodes";
import { HealthAlerts } from "@/components/health-alerts";
import { NodeComparison, NodeSelector } from "@/components/node-comparison";
import { AnimatedHeader, MotionDiv } from "@/components/motion-div";
import {
    Search, CheckCircle2, AlertCircle, XCircle,
    GitCompare, RefreshCw, WifiOff, Clock, Copy
} from "lucide-react";

export default function NodesPage() {
    const { nodes, isLoading, lastUpdated, refresh, isConnected } = usePNodes({
        pollingInterval: 10000,
        enablePolling: true
    });
    const { alerts, unreadCount, markAsRead, markAllAsRead, clearAlerts } = useHealthAlerts(nodes);
    const { comparedNodes, addNode, removeNode, clearAll } = useNodeComparison(4);

    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Delinquent" | "Offline">("all");
    const [showComparison, setShowComparison] = useState(false);
    const [showNodeSelector, setShowNodeSelector] = useState(false);
    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

    const filteredNodes = nodes.filter(node => {
        const matchesSearch = node.pubkey.toLowerCase().includes(filter.toLowerCase()) ||
            node.gossipAddress.includes(filter) ||
            node.location.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === "all" || node.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleToggleComparison = (pubkey: string) => {
        if (selectedForComparison.includes(pubkey)) {
            setSelectedForComparison(prev => prev.filter(p => p !== pubkey));
        } else if (selectedForComparison.length < 4) {
            setSelectedForComparison(prev => [...prev, pubkey]);
        }
    };

    const handleStartComparison = async () => {
        for (const pubkey of selectedForComparison) {
            await addNode(pubkey);
        }
        setShowComparison(true);
    };

    const statusCounts = {
        Active: nodes.filter(n => n.status === "Active").length,
        Delinquent: nodes.filter(n => n.status === "Delinquent").length,
        Offline: nodes.filter(n => n.status === "Offline").length,
    };

    return (
        <div className="space-y-4 sm:space-y-6 page-container pb-10">
            <AnimatedHeader>
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Live pNodes</h1>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <p className="text-zinc-500 text-xs sm:text-sm">Real-time status of all nodes</p>
                                <div className="flex items-center gap-1.5">
                                    {isConnected ? (
                                        <>
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs text-emerald-400">Connected</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                            <span className="text-xs text-amber-400">Cached</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <HealthAlerts
                                alerts={alerts}
                                unreadCount={unreadCount}
                                onMarkAsRead={markAsRead}
                                onMarkAllAsRead={markAllAsRead}
                                onClearAlerts={clearAlerts}
                            />

                            <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 h-9"
                                onClick={() => refresh()}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline ml-2">Refresh</span>
                            </Button>

                            {selectedForComparison.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Button
                                        size="sm"
                                        onClick={handleStartComparison}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-9"
                                    >
                                        <GitCompare className="h-4 w-4" />
                                        <span className="ml-1.5">{selectedForComparison.length}</span>
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </AnimatedHeader>

            {/* Last Updated */}
            {lastUpdated && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-xs text-zinc-500"
                >
                    <Clock className="h-3 w-3" />
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </motion.div>
            )}

            {/* Status Filter Pills */}
            <MotionDiv delay={0.1}>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <StatusPill
                        label="All"
                        count={nodes.length}
                        active={statusFilter === "all"}
                        onClick={() => setStatusFilter("all")}
                    />
                    <StatusPill
                        label="Active"
                        count={statusCounts.Active}
                        active={statusFilter === "Active"}
                        onClick={() => setStatusFilter("Active")}
                        color="emerald"
                    />
                    <StatusPill
                        label="Delinquent"
                        count={statusCounts.Delinquent}
                        active={statusFilter === "Delinquent"}
                        onClick={() => setStatusFilter("Delinquent")}
                        color="amber"
                    />
                    <StatusPill
                        label="Offline"
                        count={statusCounts.Offline}
                        active={statusFilter === "Offline"}
                        onClick={() => setStatusFilter("Offline")}
                        color="red"
                    />
                </div>
            </MotionDiv>

            {/* Search */}
            <MotionDiv delay={0.15}>
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-zinc-500" />
                    <Input
                        placeholder="Search nodes..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 sm:pl-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-zinc-900/50 backdrop-blur-md border-white/10 shadow-sm focus:ring-2 focus:ring-white/20 text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500"
                    />
                </div>
            </MotionDiv>

            {/* Node List */}
            <MotionDiv delay={0.2}>
                <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
                    <div className="p-4 sm:p-6 pb-3 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                            <h4 className="font-semibold text-zinc-100">pNode Validators</h4>
                            <p className="text-sm text-zinc-500">
                                Click checkbox to add nodes for comparison
                            </p>
                        </div>
                        <div className="flex gap-4 text-sm font-medium text-zinc-500">
                            <span>{filteredNodes.length} nodes</span>
                            <span className="text-orange-400">
                                {((statusCounts.Active / nodes.length) * 100).toFixed(1)}% Online
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {isLoading && nodes.length === 0 ? (
                                // Loading skeleton
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="p-4 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-zinc-800" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-40 bg-zinc-800 rounded" />
                                                <div className="h-3 w-24 bg-zinc-800 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredNodes.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center"
                                >
                                    <WifiOff className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-zinc-400">No nodes found matching your filters</p>
                                </motion.div>
                            ) : (
                                filteredNodes.map((node, i) => (
                                    <NodeRow
                                        key={node.pubkey}
                                        node={node}
                                        index={i}
                                        isSelected={selectedForComparison.includes(node.pubkey)}
                                        onToggleComparison={handleToggleComparison}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </MotionDiv>

            {/* Comparison Modal */}
            <AnimatePresence>
                {showComparison && comparedNodes.length > 0 && (
                    <NodeComparison
                        nodes={comparedNodes}
                        onAddNode={() => setShowNodeSelector(true)}
                        onRemoveNode={removeNode}
                        onClose={() => {
                            setShowComparison(false);
                            clearAll();
                            setSelectedForComparison([]);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Node Selector Modal */}
            <AnimatePresence>
                {showNodeSelector && (
                    <NodeSelector
                        nodes={nodes.map(n => ({ pubkey: n.pubkey, status: n.status, location: n.location }))}
                        selectedNodes={comparedNodes.map(n => n.pubkey)}
                        onSelect={async (pubkey) => {
                            await addNode(pubkey);
                        }}
                        onClose={() => setShowNodeSelector(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Status Filter Pill Component
function StatusPill({
    label,
    count,
    active,
    onClick,
    color
}: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    color?: "emerald" | "amber" | "red";
}) {
    const colorClasses = {
        emerald: active ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "hover:bg-emerald-500/10",
        amber: active ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "hover:bg-amber-500/10",
        red: active ? "bg-red-500/20 border-red-500/50 text-red-400" : "hover:bg-red-500/10",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border font-medium text-xs sm:text-sm transition-all touch-target ${active
                    ? color ? colorClasses[color] : "bg-orange-500/20 border-orange-500/50 text-orange-400"
                    : `border-white/10 text-zinc-400 ${color ? colorClasses[color] : "hover:bg-white/5"}`
                }`}
        >
            {label}
            <span className={`ml-1.5 sm:ml-2 ${active ? "" : "text-zinc-500"}`}>({count})</span>
        </motion.button>
    );
}

// Node Row Component
function NodeRow({
    node,
    index,
    isSelected,
    onToggleComparison,
}: {
    node: PNodeMetrics;
    index: number;
    isSelected: boolean;
    onToggleComparison: (pubkey: string) => void;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopyPubkey = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(node.pubkey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusIcon = () => {
        switch (node.status) {
            case "Active":
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case "Delinquent":
                return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case "Offline":
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.02 }}
            className="group"
        >
            <Link href={`/nodes/${node.pubkey}`} className="block">
                <div className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-white/[0.03] transition-colors cursor-pointer">
                    {/* Comparison Checkbox - Hidden on mobile */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleComparison(node.pubkey);
                        }}
                        className={`hidden sm:flex h-5 w-5 rounded-md border-2 items-center justify-center transition-colors flex-shrink-0 ${isSelected
                                ? "bg-orange-500 border-orange-500"
                                : "border-zinc-600 hover:border-zinc-400"
                            }`}
                    >
                        {isSelected && (
                            <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </motion.svg>
                        )}
                    </motion.button>

                    {/* Copy Pubkey Button - Hidden on mobile */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopyPubkey}
                        className="hidden sm:flex h-7 w-7 rounded-lg items-center justify-center transition-colors bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/5 flex-shrink-0"
                        title="Copy public key"
                    >
                        {copied ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                            <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300" />
                        )}
                    </motion.button>

                    {/* Node avatar from pubkey or validator info */}
                    <div className="relative flex-shrink-0">
                        <NodeAvatar pubkey={node.pubkey} validatorInfo={node.validatorInfo} size={36} className="sm:w-10 sm:h-10" />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-zinc-900 ${node.status === "Active" ? "bg-emerald-500" :
                                node.status === "Delinquent" ? "bg-amber-500" : "bg-red-500"
                            }`} />
                    </div>

                    {/* Node Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-semibold text-zinc-100 text-xs sm:text-sm truncate">
                                {node.validatorInfo?.name || `${node.pubkey.slice(0, 6)}...${node.pubkey.slice(-4)}`}
                            </span>
                            {node.isValidator && (
                                <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    Validator
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1 sm:gap-1.5 flex-wrap">
                            <span className="truncate max-w-[100px] sm:max-w-none">{node.location}</span>
                            <span className="text-zinc-600 hidden sm:inline">•</span>
                            <span className="hidden sm:inline">v{node.version}</span>
                            {node.activatedStake > 0 && (
                                <>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-blue-400">{(node.activatedStake / 1e9).toFixed(2)} XAND</span>
                                </>
                            )}
                            {node.commission > 0 && (
                                <>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-amber-400">{node.commission}% fee</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats - Desktop - Real data only */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Stake */}
                        {node.activatedStake > 0 && (
                            <div className="text-right w-20">
                                <div className="text-sm font-medium text-zinc-300">{(node.activatedStake / 1e9).toFixed(1)}</div>
                                <div className="text-[10px] text-zinc-600">XAND stake</div>
                            </div>
                        )}

                        {/* Commission */}
                        {node.commission > 0 && (
                            <div className="text-right w-14">
                                <div className="text-sm font-medium text-zinc-300">{node.commission}%</div>
                                <div className="text-[10px] text-zinc-600">fee</div>
                            </div>
                        )}

                        {/* Credits */}
                        {node.epochCredits > 0 && (
                            <div className="text-right w-20">
                                <div className="text-sm font-medium text-zinc-300">{(node.epochCredits / 1000).toFixed(0)}k</div>
                                <div className="text-[10px] text-zinc-600">credits</div>
                            </div>
                        )}

                        {/* Version */}
                        <div className="text-right w-16">
                            <div className="text-sm font-mono text-zinc-400">v{node.version.split('-')[0]}</div>
                        </div>

                        {/* Status */}
                        <div className="w-8 flex justify-center">
                            {getStatusIcon()}
                        </div>
                    </div>

                    {/* Mobile stats */}
                    <div className="md:hidden text-right">
                        <Badge variant={
                            node.status === "Active" ? "success" :
                                node.status === "Delinquent" ? "orange" : "destructive"
                        }>
                            {node.status}
                        </Badge>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
