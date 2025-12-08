"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { NodeAvatar } from "@/components/ui/node-avatar"
import { PNodeMetrics } from "@/lib/xandeum-rpc"
import { Search, CheckCircle2, AlertCircle, XCircle, Copy } from "lucide-react"
import Link from "next/link"

export function PNodeList({ nodes }: { nodes: PNodeMetrics[] }) {
    const [filter, setFilter] = useState("")

    const filteredNodes = nodes.filter(node =>
        node.pubkey.toLowerCase().includes(filter.toLowerCase()) ||
        node.gossipAddress.includes(filter) ||
        node.location.toLowerCase().includes(filter.toLowerCase())
    )

    const activeCount = nodes.filter(n => n.status === "Active").length
    const delinquentCount = nodes.filter(n => n.status === "Delinquent").length

    return (
        <div className="col-span-full space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-50">Network Nodes</h3>
                    <p className="text-zinc-500 text-xs sm:text-sm">
                        {activeCount} active, {delinquentCount} delinquent of {nodes.length} total
                    </p>
                </div>

                <div className="relative w-full sm:w-[280px] md:w-[320px]">
                    <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search nodes..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 h-9 sm:h-10 rounded-xl bg-zinc-900/50 border-white/10 text-sm text-zinc-100 placeholder:text-zinc-500"
                    />
                </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                {/* Header */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-zinc-400">
                        {filteredNodes.length} nodes
                    </span>
                    <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-zinc-500">
                        <span className="flex items-center gap-1 sm:gap-1.5">
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" />
                            Active
                        </span>
                        <span className="flex items-center gap-1 sm:gap-1.5">
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500" />
                            Delinquent
                        </span>
                        <span className="hidden sm:flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500" />
                            Offline
                        </span>
                    </div>
                </div>

                {/* Node List */}
                <div className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                        {filteredNodes.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">
                                No nodes found
                            </div>
                        ) : filteredNodes.slice(0, 15).map((node, i) => (
                            <NodeListRow key={node.pubkey} node={node} index={i} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* View all link */}
                {filteredNodes.length > 15 && (
                    <div className="p-3 border-t border-white/5 text-center">
                        <Link
                            href="/nodes"
                            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            View all {nodes.length} nodes →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

function NodeListRow({ node, index }: { node: PNodeMetrics; index: number }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(node.pubkey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Link href={`/nodes/${node.pubkey}`}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
                {/* Copy button - hidden on mobile */}
                <button
                    onClick={handleCopy}
                    className="hidden sm:flex h-6 w-6 rounded-md items-center justify-center transition-colors bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/5"
                    title="Copy public key"
                >
                    {copied ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    ) : (
                        <Copy className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
                    )}
                </button>

                {/* Node avatar */}
                <div className="relative flex-shrink-0">
                    <NodeAvatar pubkey={node.pubkey} validatorInfo={node.validatorInfo} size={28} className="sm:w-8 sm:h-8" />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border-2 border-zinc-900 ${
                        node.status === "Active" ? "bg-emerald-500" :
                        node.status === "Delinquent" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-mono text-xs sm:text-sm text-zinc-200 truncate">
                            {node.validatorInfo?.name || `${node.pubkey.slice(0, 6)}...${node.pubkey.slice(-4)}`}
                        </span>
                        {node.isValidator && (
                            <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-medium rounded bg-purple-500/20 text-purple-400">
                                VAL
                            </span>
                        )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-zinc-500 truncate">
                        {node.location !== "Unknown" ? node.location : node.gossipAddress}
                    </div>
                </div>

                {/* Real stats only - hidden on mobile */}
                <div className="hidden md:flex items-center gap-4 text-xs">
                    {node.activatedStake > 0 && (
                        <div className="text-right">
                            <div className="text-zinc-400">{(node.activatedStake / 1e9).toFixed(1)} XAND</div>
                            <div className="text-zinc-600">stake</div>
                        </div>
                    )}
                    {node.commission > 0 && (
                        <div className="text-right w-12">
                            <div className="text-zinc-400">{node.commission}%</div>
                            <div className="text-zinc-600">fee</div>
                        </div>
                    )}
                    <div className="text-right w-14">
                        <div className="text-zinc-400">v{node.version.split('-')[0]}</div>
                        <div className="text-zinc-600">version</div>
                    </div>
                </div>

                {/* Status icon */}
                <div className="w-5 sm:w-6 flex justify-center flex-shrink-0">
                    {node.status === "Active" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                    ) : node.status === "Delinquent" ? (
                        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                    ) : (
                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                    )}
                </div>
            </motion.div>
        </Link>
    );
}
