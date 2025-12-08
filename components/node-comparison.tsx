"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, GitCompare, Plus, Server, Activity,
    ChevronDown, ChevronUp, MapPin, Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PNodeDetailedMetrics } from "@/lib/xandeum-rpc";

interface NodeComparisonProps {
    nodes: PNodeDetailedMetrics[];
    onAddNode: () => void;
    onRemoveNode: (pubkey: string) => void;
    onClose: () => void;
    maxNodes?: number;
}

export function NodeComparison({
    nodes,
    onAddNode,
    onRemoveNode,
    onClose,
    maxNodes = 4,
}: NodeComparisonProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>(["overview", "validator"]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Active": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
            case "Delinquent": return "text-amber-500 bg-amber-500/10 border-amber-500/30";
            case "Offline": return "text-red-500 bg-red-500/10 border-red-500/30";
            default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/30";
        }
    };

    const getBestValue = (values: number[], higherIsBetter = true) => {
        if (higherIsBetter) {
            return Math.max(...values);
        }
        return Math.min(...values.filter(v => v > 0));
    };

    // Only show sections with REAL data from RPC
    const sections = [
        { id: "overview", label: "Overview", icon: Server },
        { id: "validator", label: "Validator Stats", icon: Activity },
        { id: "location", label: "Location", icon: MapPin },
        { id: "stake", label: "Stake & Credits", icon: Coins },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-blue-500/20 border border-white/10">
                            <GitCompare className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100">Compare Nodes</h2>
                            <p className="text-sm text-zinc-500">Side-by-side comparison of {nodes.length} nodes</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="overflow-auto max-h-[calc(90vh-80px)] p-6">
                    {/* Node Headers */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${Math.min(nodes.length + 1, maxNodes)}, 1fr)` }}>
                        <div /> {/* Empty corner cell */}

                        {nodes.map((node, index) => (
                            <motion.div
                                key={node.pubkey}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <Card className="bg-zinc-800/50 border-white/10">
                                    <CardContent className="p-4">
                                        <button
                                            onClick={() => onRemoveNode(node.pubkey)}
                                            className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="space-y-2">
                                            <div className="font-mono text-sm text-zinc-300 truncate pr-6">
                                                {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}
                                            </div>
                                            <Badge className={getStatusColor(node.status)}>
                                                {node.status}
                                            </Badge>
                                            <div className="text-xs text-zinc-500">{node.location}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {/* Add Node Button */}
                        {nodes.length < maxNodes && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onAddNode}
                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors min-h-[120px]"
                            >
                                <Plus className="h-6 w-6 text-zinc-500" />
                                <span className="text-sm text-zinc-500">Add Node</span>
                            </motion.button>
                        )}
                    </div>

                    {/* Comparison Sections */}
                    <div className="mt-6 space-y-4">
                        {sections.map(section => (
                            <div key={section.id} className="rounded-2xl border border-white/10 overflow-hidden">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full p-4 flex items-center justify-between bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <section.icon className="h-5 w-5 text-orange-400" />
                                        <span className="font-medium text-zinc-200">{section.label}</span>
                                    </div>
                                    {expandedSections.includes(section.id) ? (
                                        <ChevronUp className="h-5 w-5 text-zinc-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-zinc-500" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedSections.includes(section.id) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="p-4 space-y-3">
                                                    {/* Overview - Real data from RPC */}
                                                {section.id === "overview" && (
                                                    <>
                                                        <ComparisonRow
                                                            label="Status"
                                                            values={nodes.map(n => n.status)}
                                                        />
                                                        <ComparisonRow
                                                            label="Version"
                                                            values={nodes.map(n => `v${n.version}`)}
                                                        />
                                                        <ComparisonRow
                                                            label="Gossip Address"
                                                            values={nodes.map(n => n.gossipAddress)}
                                                        />
                                                        <ComparisonRow
                                                            label="Feature Set"
                                                            values={nodes.map(n => n.featureSet?.toString() || "N/A")}
                                                        />
                                                        <ComparisonRow
                                                            label="Shred Version"
                                                            values={nodes.map(n => n.shredVersion?.toString() || "N/A")}
                                                        />
                                                    </>
                                                )}

                                                {/* Validator Stats - Real data from vote accounts */}
                                                {section.id === "validator" && (
                                                    <>
                                                        <ComparisonRow
                                                            label="Is Validator"
                                                            values={nodes.map(n => n.isValidator ? "Yes" : "No")}
                                                        />
                                                        <ComparisonRow
                                                            label="Vote Pubkey"
                                                            values={nodes.map(n => n.votePubkey ? `${n.votePubkey.slice(0, 8)}...` : "N/A")}
                                                        />
                                                        <ComparisonRow
                                                            label="Commission"
                                                            values={nodes.map(n => n.commission > 0 ? `${n.commission}%` : "N/A")}
                                                            numValues={nodes.map(n => n.commission)}
                                                            best={getBestValue(nodes.map(n => n.commission), false)}
                                                            lowerIsBetter
                                                        />
                                                        <ComparisonRow
                                                            label="Last Vote"
                                                            values={nodes.map(n => n.lastVote > 0 ? n.lastVote.toLocaleString() : "N/A")}
                                                            numValues={nodes.map(n => n.lastVote)}
                                                            best={getBestValue(nodes.map(n => n.lastVote))}
                                                        />
                                                        <ComparisonRow
                                                            label="Root Slot"
                                                            values={nodes.map(n => n.rootSlot > 0 ? n.rootSlot.toLocaleString() : "N/A")}
                                                            numValues={nodes.map(n => n.rootSlot)}
                                                            best={getBestValue(nodes.map(n => n.rootSlot))}
                                                        />
                                                    </>
                                                )}

                                                {/* Location - Real data from IP geolocation */}
                                                {section.id === "location" && (
                                                    <>
                                                        <ComparisonRow
                                                            label="Location"
                                                            values={nodes.map(n => n.location)}
                                                        />
                                                        <ComparisonRow
                                                            label="Country"
                                                            values={nodes.map(n => n.country)}
                                                        />
                                                        <ComparisonRow
                                                            label="City"
                                                            values={nodes.map(n => n.city)}
                                                        />
                                                        <ComparisonRow
                                                            label="ISP"
                                                            values={nodes.map(n => n.isp)}
                                                        />
                                                        <ComparisonRow
                                                            label="Coordinates"
                                                            values={nodes.map(n => n.coordinates[0] !== 0 ? `${n.coordinates[0].toFixed(2)}, ${n.coordinates[1].toFixed(2)}` : "Unknown")}
                                                        />
                                                    </>
                                                )}

                                                {/* Stake & Credits - Real data from vote accounts */}
                                                {section.id === "stake" && (
                                                    <>
                                                        <ComparisonRow
                                                            label="Activated Stake"
                                                            values={nodes.map(n => n.activatedStake > 0 ? `${(n.activatedStake / 1e9).toFixed(2)} XAND` : "N/A")}
                                                            numValues={nodes.map(n => n.activatedStake)}
                                                            best={getBestValue(nodes.map(n => n.activatedStake))}
                                                        />
                                                        <ComparisonRow
                                                            label="Epoch Credits"
                                                            values={nodes.map(n => n.epochCredits > 0 ? n.epochCredits.toLocaleString() : "N/A")}
                                                            numValues={nodes.map(n => n.epochCredits)}
                                                            best={getBestValue(nodes.map(n => n.epochCredits))}
                                                        />
                                                        <ComparisonRow
                                                            label="Total Credits"
                                                            values={nodes.map(n => n.credits > 0 ? n.credits.toLocaleString() : "N/A")}
                                                            numValues={nodes.map(n => n.credits)}
                                                            best={getBestValue(nodes.map(n => n.credits))}
                                                        />
                                                        <ComparisonRow
                                                            label="Uptime %"
                                                            values={nodes.map(n => `${n.uptimePercentage.toFixed(2)}%`)}
                                                            numValues={nodes.map(n => n.uptimePercentage)}
                                                            best={getBestValue(nodes.map(n => n.uptimePercentage))}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

interface ComparisonRowProps {
    label: string;
    values: string[];
    numValues?: number[];
    best?: number;
    lowerIsBetter?: boolean;
}

function ComparisonRow({ label, values, numValues, best }: ComparisonRowProps) {
    const isBest = (index: number) => {
        if (numValues === undefined || best === undefined) return false;
        return numValues[index] === best;
    };

    return (
        <div className="grid gap-4 items-center" style={{ gridTemplateColumns: `200px repeat(${values.length}, 1fr)` }}>
            <div className="text-sm text-zinc-500">{label}</div>
            {values.map((value, index) => (
                <div
                    key={index}
                    className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${isBest(index)
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-zinc-300 bg-zinc-800/50"
                        }`}
                >
                    {value}
                    {isBest(index) && (
                        <span className="ml-2 text-xs text-emerald-500">Best</span>
                    )}
                </div>
            ))}
        </div>
    );
}

// Node selector modal for adding nodes to comparison
interface NodeSelectorProps {
    nodes: { pubkey: string; status: string; location: string }[];
    selectedNodes: string[];
    onSelect: (pubkey: string) => void;
    onClose: () => void;
}

export function NodeSelector({ nodes, selectedNodes, onSelect, onClose }: NodeSelectorProps) {
    const [search, setSearch] = useState("");

    const filteredNodes = nodes.filter(n =>
        n.pubkey.toLowerCase().includes(search.toLowerCase()) ||
        n.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-zinc-100 mb-3">Select Node to Compare</h3>
                    <input
                        type="text"
                        placeholder="Search by pubkey or location..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-zinc-800/50 border border-white/10 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {filteredNodes.map(node => (
                        <button
                            key={node.pubkey}
                            onClick={() => {
                                onSelect(node.pubkey);
                                onClose();
                            }}
                            disabled={selectedNodes.includes(node.pubkey)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 ${selectedNodes.includes(node.pubkey) ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <div className={`h-2 w-2 rounded-full ${node.status === "Active" ? "bg-emerald-500" :
                                    node.status === "Delinquent" ? "bg-amber-500" : "bg-red-500"
                                }`} />
                            <div className="flex-1 text-left">
                                <div className="font-mono text-sm text-zinc-300">
                                    {node.pubkey.slice(0, 12)}...{node.pubkey.slice(-8)}
                                </div>
                                <div className="text-xs text-zinc-500">{node.location}</div>
                            </div>
                            {selectedNodes.includes(node.pubkey) && (
                                <Badge variant="outline" className="text-xs">Added</Badge>
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
