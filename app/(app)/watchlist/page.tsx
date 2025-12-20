"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Trash2, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePNodes } from "@/hooks/use-pnodes";

export default function WatchlistPage() {
    const router = useRouter();
    const { nodes } = usePNodes();
    const [watchlist, setWatchlist] = useState<string[]>(() => {
        if (typeof window === "undefined") return [];
        return JSON.parse(localStorage.getItem("node-watchlist") || "[]");
    });
    const [copied, setCopied] = useState<string | null>(null);

    const removeFromWatchlist = (pubkey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const updated = watchlist.filter(k => k !== pubkey);
        localStorage.setItem("node-watchlist", JSON.stringify(updated));
        setWatchlist(updated);
    };

    const clearAll = () => {
        localStorage.setItem("node-watchlist", JSON.stringify([]));
        setWatchlist([]);
    };

    const handleCopy = (pubkey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(pubkey);
        setCopied(pubkey);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleExplorer = (pubkey: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`https://explorer.solana.com/address/${pubkey}?cluster=custom&customUrl=https://api.xandeum.com:8899`, "_blank");
    };

    const watchedNodes = nodes.filter(n => watchlist.includes(n.pubkey));

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Watchlist</h1>
                    <p className="text-sm text-zinc-500 mt-1">{watchlist.length} nodes watched</p>
                </div>
                {watchlist.length > 0 && (
                    <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-red-400" onClick={clearAll}>
                        <Trash2 className="h-4 w-4 mr-2" /> Clear All
                    </Button>
                )}
            </div>

            {watchlist.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-12 text-center">
                    <Star className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-300 mb-2">No nodes watched</h3>
                    <p className="text-sm text-zinc-500 mb-4">Click the star icon on any node to add it to your watchlist</p>
                    <Button variant="outline" size="sm" className="border-white/10" onClick={() => router.push("/nodes")}>
                        Browse Nodes
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {watchlist.map(pubkey => {
                        const node = watchedNodes.find(n => n.pubkey === pubkey);
                        const isOnline = node?.status === "Active";
                        
                        return (
                            <Link key={pubkey} href={`/nodes/${pubkey}`}>
                                <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? "bg-emerald-400" : "bg-zinc-600"}`} />
                                        <div className="min-w-0">
                                            <div className="font-mono text-sm text-zinc-200 truncate">
                                                {pubkey.slice(0, 20)}...{pubkey.slice(-8)}
                                            </div>
                                            {node && (
                                                <div className="text-xs text-zinc-500 mt-0.5">
                                                    {node.location} • {node.isPublic ? "Public" : "Private"} • v{node.version.split('-')[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button 
                                            onClick={(e) => handleCopy(pubkey, e)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
                                        >
                                            {copied === pubkey ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                        <button 
                                            onClick={(e) => handleExplorer(pubkey, e)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => removeFromWatchlist(pubkey, e)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-yellow-400"
                                        >
                                            <Star className="h-4 w-4 fill-yellow-400" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
