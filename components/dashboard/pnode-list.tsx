"use client"

import { PNodeMetrics } from "@/lib/xandeum-rpc"
import { CheckCircle2, XCircle, Globe, Lock } from "lucide-react"
import Link from "next/link"

export function PNodeList({ nodes }: { nodes: PNodeMetrics[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-50">Recent Nodes</h3>
                <Link
                    href="/nodes"
                    className="text-sm text-orange-400 hover:text-orange-300"
                >
                    See all →
                </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                <div className="divide-y divide-white/5">
                    {nodes.slice(0, 10).map((node, i) => (
                        <NodeRow key={node.pubkey} node={node} index={i + 1} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function NodeRow({ node, index }: { node: PNodeMetrics; index: number }) {
    const isOnline = node.status === "Active";
    const isPublic = node.isPublic ?? false;

    return (
        <Link href={`/nodes/${node.pubkey}`}>
            <div className="flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors">
                {/* Index number */}
                <span className="w-6 text-xs text-zinc-600 text-center">{index}</span>

                {/* Status dot */}
                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    isOnline ? "bg-emerald-500" : "bg-red-500"
                }`} />

                {/* Pubkey */}
                <span className="font-mono text-sm text-zinc-300 flex-1 truncate">
                    {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}
                </span>

                {/* Public/Private badge */}
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                    isPublic 
                        ? "bg-blue-500/20 text-blue-400" 
                        : "bg-orange-500/20 text-orange-400"
                }`}>
                    {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {isPublic ? "Public" : "Private"}
                </span>

                {/* Version */}
                <span className="text-xs text-zinc-500 w-16 text-right">
                    v{node.version.split('-')[0]}
                </span>

                {/* Status icon */}
                {isOnline ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                ) : (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
            </div>
        </Link>
    );
}
