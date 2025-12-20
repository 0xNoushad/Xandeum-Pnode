"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PNodeMetrics } from "@/lib/xandeum-rpc";
import { usePNodes } from "@/hooks/use-pnodes";
import { RefreshButton } from "@/components/refresh-button";
import { AIChatButton } from "@/components/ai-chat-button";
import { isPrivateNode } from "@/lib/node-utils";
import { Search, CheckCircle2, XCircle, Globe, Lock, WifiOff, ChevronLeft, ChevronRight, Copy, Check, Star } from "lucide-react";

export default function NodesPage() {
    const { nodes, isLoading, refresh, isConnected } = usePNodes({
        pollingInterval: 30000,
        enablePolling: false,
        useGossipData: true,
    });

    const [filter, setFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "public" | "private">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedPubkey, setCopiedPubkey] = useState<string | null>(null);
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const NODES_PER_PAGE = 15;

    // Load watchlist
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("node-watchlist") || "[]");
        setWatchlist(saved);
    }, []);

    const toggleWatchlist = (pubkey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const isWatched = watchlist.includes(pubkey);
        const updated = isWatched 
            ? watchlist.filter(k => k !== pubkey)
            : [...watchlist, pubkey];
        localStorage.setItem("node-watchlist", JSON.stringify(updated));
        setWatchlist(updated);
    };

    const filteredNodes = nodes.filter(node => {
        const matchesSearch = node.pubkey.toLowerCase().includes(filter.toLowerCase()) ||
            node.gossipAddress.includes(filter) ||
            node.location.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = statusFilter === "all" || 
            (statusFilter === "online" ? node.status === "Active" : node.status !== "Active");
        // Use utility function for consistent private node detection
        const nodeIsPrivate = isPrivateNode(node);
        const matchesType = typeFilter === "all" ||
            (typeFilter === "public" ? !nodeIsPrivate : nodeIsPrivate);
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredNodes.length / NODES_PER_PAGE);
    const paginatedNodes = filteredNodes.slice(
        (currentPage - 1) * NODES_PER_PAGE,
        currentPage * NODES_PER_PAGE
    );

    const resetFilters = () => {
        setFilter("");
        setStatusFilter("all");
        setTypeFilter("all");
        setCurrentPage(1);
    };

    const online = nodes.filter(n => n.status === "Active").length;
    const offline = nodes.filter(n => n.status !== "Active").length;
    // Use utility function for consistent private node detection in stats
    const publicNodes = nodes.filter(n => !isPrivateNode(n)).length;
    const privateNodes = nodes.filter(n => isPrivateNode(n)).length;

    const handleCopy = async (pubkey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(pubkey);
        setCopiedPubkey(pubkey);
        setTimeout(() => setCopiedPubkey(null), 1500);
    };

    return (
        <div className="space-y-6 pb-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Nodes</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-zinc-500 text-sm">{nodes.length} total</p>
                        {isConnected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AIChatButton />
                    <RefreshButton onClick={() => refresh()} isLoading={isLoading} />
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Online" value={online} color="emerald" />
                <StatCard label="Offline" value={offline} color="red" />
                <StatCard label="Public" value={publicNodes} color="blue" />
                <StatCard label="Private" value={privateNodes} color="orange" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search pubkey, IP, location..."
                        value={filter}
                        onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                        className="pl-10 h-9 rounded-lg bg-zinc-900/50 border-white/10 text-sm"
                    />
                </div>
                
                {/* Status Filter */}
                <div className="flex gap-1">
                    <FilterBtn active={statusFilter === "all"} onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}>Status</FilterBtn>
                    <FilterBtn active={statusFilter === "online"} onClick={() => { setStatusFilter("online"); setCurrentPage(1); }} color="emerald">Online</FilterBtn>
                    <FilterBtn active={statusFilter === "offline"} onClick={() => { setStatusFilter("offline"); setCurrentPage(1); }} color="red">Offline</FilterBtn>
                </div>

                {/* Type Filter */}
                <div className="flex gap-1">
                    <FilterBtn active={typeFilter === "all"} onClick={() => { setTypeFilter("all"); setCurrentPage(1); }}>Type</FilterBtn>
                    <FilterBtn active={typeFilter === "public"} onClick={() => { setTypeFilter("public"); setCurrentPage(1); }} color="blue">Public</FilterBtn>
                    <FilterBtn active={typeFilter === "private"} onClick={() => { setTypeFilter("private"); setCurrentPage(1); }} color="orange">Private</FilterBtn>
                </div>
            </div>

            {/* Node List */}
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden">
                <div className="divide-y divide-white/5">
                    {isLoading && nodes.length === 0 ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="p-3 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-4 bg-zinc-800 rounded" />
                                    <div className="h-2 w-2 bg-zinc-800 rounded-full" />
                                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                                </div>
                            </div>
                        ))
                    ) : filteredNodes.length === 0 ? (
                        <div className="p-12 text-center">
                            <WifiOff className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400 text-sm">No nodes found</p>
                            <button onClick={resetFilters} className="text-orange-400 text-xs mt-2 hover:underline">
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        paginatedNodes.map((node, i) => (
                            <NodeRow 
                                key={`${node.pubkey}-${i}`} 
                                node={node} 
                                index={(currentPage - 1) * NODES_PER_PAGE + i + 1}
                                onCopy={handleCopy}
                                isCopied={copiedPubkey === node.pubkey}
                                isWatched={watchlist.includes(node.pubkey)}
                                onToggleWatch={toggleWatchlist}
                            />
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                            {(currentPage - 1) * NODES_PER_PAGE + 1}-{Math.min(currentPage * NODES_PER_PAGE, filteredNodes.length)} of {filteredNodes.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="border-white/10 h-7 w-7 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-zinc-400 px-2">{currentPage}/{totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="border-white/10 h-7 w-7 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "emerald" | "red" | "blue" | "orange" }) {
    const colors = {
        emerald: "text-emerald-400",
        red: "text-red-400",
        blue: "text-blue-400",
        orange: "text-orange-400",
    };
    return (
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3">
            <div className="text-[10px] text-zinc-500">{label}</div>
            <div className={`text-xl font-bold ${colors[color]}`}>{value}</div>
        </div>
    );
}

function FilterBtn({ children, active, onClick, color }: { 
    children: React.ReactNode; 
    active: boolean; 
    onClick: () => void;
    color?: "emerald" | "red" | "blue" | "orange";
}) {
    const colors = {
        emerald: active ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "hover:bg-emerald-500/10",
        red: active ? "bg-red-500/20 border-red-500/50 text-red-400" : "hover:bg-red-500/10",
        blue: active ? "bg-blue-500/20 border-blue-500/50 text-blue-400" : "hover:bg-blue-500/10",
        orange: active ? "bg-orange-500/20 border-orange-500/50 text-orange-400" : "hover:bg-orange-500/10",
    };

    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                active
                    ? color ? colors[color] : "bg-zinc-700/50 border-zinc-600 text-zinc-300"
                    : `border-white/10 text-zinc-500 ${color ? colors[color] : "hover:bg-white/5"}`
            }`}
        >
            {children}
        </button>
    );
}

function NodeRow({ node, index, onCopy, isCopied, isWatched, onToggleWatch }: { 
    node: PNodeMetrics; 
    index: number;
    onCopy: (pubkey: string, e: React.MouseEvent) => void;
    isCopied: boolean;
    isWatched: boolean;
    onToggleWatch: (pubkey: string, e: React.MouseEvent) => void;
}) {
    const isOnline = node.status === "Active";
    // Use utility function for consistent private node detection
    const nodeIsPrivate = isPrivateNode(node);
    const isPublic = !nodeIsPrivate;

    // Format version safely - handle missing or invalid version data
    const formatVersion = (version: string | null | undefined): string => {
        if (!version || version === "unknown") {
            return nodeIsPrivate ? "Private" : "N/A";
        }
        // Extract version number before any dash (e.g., "1.2.3-beta" -> "1.2.3")
        const versionPart = version.split('-')[0];
        return versionPart ? `v${versionPart}` : (nodeIsPrivate ? "Private" : "N/A");
    };

    const displayVersion = formatVersion(node.version);
    const isVersionPrivate = displayVersion === "Private";

    return (
        <Link href={`/nodes/${node.pubkey}`}>
            <div className="flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors">
                <span className="w-5 text-[10px] text-zinc-600 text-center">{index}</span>
                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="font-mono text-sm text-zinc-300 flex-1 truncate">
                    {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}
                </span>
                <button 
                    onClick={(e) => onCopy(node.pubkey, e)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Copy address"
                >
                    {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
                    )}
                </button>
                <button 
                    onClick={(e) => onToggleWatch(node.pubkey, e)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                >
                    <Star className={`h-3.5 w-3.5 ${isWatched ? "text-yellow-400 fill-yellow-400" : "text-zinc-500 hover:text-yellow-400"}`} />
                </button>
                <span className={`flex items-center justify-center gap-1 w-[72px] py-0.5 rounded text-[10px] font-medium ${
                    isPublic ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
                }`}>
                    {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {isPublic ? "Public" : "Private"}
                </span>
                <span className={`text-[10px] w-14 text-right ${isVersionPrivate ? "text-orange-400" : "text-zinc-500"}`}>
                    {displayVersion}
                </span>
                {isOnline ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                ) : (
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
            </div>
        </Link>
    );
}
