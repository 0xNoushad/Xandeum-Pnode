"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    ArrowRight, ExternalLink, Twitter,
    MessageCircle, Database, Cpu, Globe, Zap
} from "lucide-react"

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-6 sm:py-8 page-container pb-16 sm:pb-20 px-0 sm:px-4">
            {/* Hero - Simple and Direct */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 sm:mb-16"
            >
                <span className="text-orange-400 text-xs sm:text-sm font-medium tracking-wide uppercase">
                    About this project
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 mt-2 sm:mt-3 mb-4 sm:mb-6 leading-tight">
                    Xandeum pNode Dashboard
                </h1>
                <p className="text-base sm:text-xl text-zinc-400 leading-relaxed max-w-2xl">
                    A community-built monitoring tool for tracking the health and performance
                    of Xandeum{"'"}s decentralized storage network.
                </p>
            </motion.div>

            {/* What is Xandeum Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-16"
            >
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">What{"'"}s Xandeum?</h2>

                <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                        Xandeum is a storage layer for Solana. It lets smart contracts store
                        and retrieve large amounts of data without bloating the main chain.
                        Think of it as extending Solana{"'"}s account system to support
                        terabytes (eventually exabytes) of storage.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 my-8">
                        <InfoCard
                            icon={Database}
                            title="XandFiles"
                            description="Storage accounts that programs can read/write directly. No need for external APIs."
                        />
                        <InfoCard
                            icon={Cpu}
                            title="pNodes"
                            description="Provider nodes that store data shards. They earn XAND for keeping data available."
                        />
                        <InfoCard
                            icon={Globe}
                            title="Erasure Coding"
                            description="Data is split and replicated so it stays available even if nodes go offline."
                        />
                        <InfoCard
                            icon={Zap}
                            title="Random Access"
                            description="Fetch any piece of data instantly. No downloading entire files."
                        />
                    </div>
                </div>
            </motion.section>

            {/* What this dashboard does */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-16"
            >
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">What this dashboard does</h2>

                <ul className="space-y-4">
                    <ListItem>
                        <strong className="text-zinc-200">Real-time node monitoring</strong> —
                        See which pNodes are online, their uptime, storage usage, and latency
                    </ListItem>
                    <ListItem>
                        <strong className="text-zinc-200">Network health overview</strong> —
                        Track aggregate stats like total storage, active nodes, and network performance
                    </ListItem>
                    <ListItem>
                        <strong className="text-zinc-200">Node comparison</strong> —
                        Compare multiple nodes side-by-side to evaluate performance
                    </ListItem>
                    <ListItem>
                        <strong className="text-zinc-200">Health alerts</strong> —
                        Get notified when nodes go offline or experience issues
                    </ListItem>
                    <ListItem>
                        <strong className="text-zinc-200">Geographic distribution</strong> —
                        Visualize where nodes are located around the world
                    </ListItem>
                </ul>
            </motion.section>



            {/* API Architecture */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-16"
            >
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">API Architecture</h2>

                <div className="space-y-4">
                    {/* Solana RPC - Active */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <p className="text-zinc-200 font-medium">Solana-style RPC (Port 8899)</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
                                </div>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-3">
                                    Public endpoint at <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400">api.devnet.xandeum.com:8899</code>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300">getClusterNodes</code>
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300">getVoteAccounts</code>
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300">getEpochInfo</code>
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300">getBlockHeight</code>
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300">getSupply</code>
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300">getRecentPerformanceSamples</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* pRPC - Requires SSH */}
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="h-3 w-3 rounded-full bg-amber-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <p className="text-zinc-200 font-medium">pNode RPC (Port 6000)</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">SSH Required</span>
                                </div>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-3">
                                    pRPC endpoints run on individual pNodes and require SSH tunnel access for security.
                                    These provide detailed storage metrics per node.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-500">get-pods</code>
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-500">get-stats</code>
                                    <code className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-500">get-version</code>
                                </div>
                                <p className="text-zinc-600 text-xs mt-3">
                                    Access via: <code className="text-zinc-500">ssh -L 6000:localhost:6000 root@pnode-ip</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Data Transparency */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mb-16"
            >
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">Data Transparency</h2>

                <div className="space-y-6">
                    {/* Real Data */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <h3 className="font-semibold text-emerald-400">100% Real Data from Xandeum RPC</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <DataItem label="pubkey" desc="Real node public key" />
                            <DataItem label="gossipAddress" desc="Real gossip IP:port" />
                            <DataItem label="rpcAddress" desc="Real RPC endpoint" />
                            <DataItem label="version" desc="Real software version" />
                            <DataItem label="status" desc="Active/Delinquent from vote accounts" />
                            <DataItem label="isValidator" desc="Real validator status" />
                            <DataItem label="activatedStake" desc="Real stake in lamports" />
                            <DataItem label="commission" desc="Real commission %" />
                            <DataItem label="lastVote" desc="Real last vote slot" />
                            <DataItem label="epochCredits" desc="Real accumulated credits" />
                            <DataItem label="location" desc="Real IP geolocation" />
                            <DataItem label="uptimePercentage" desc="Calculated from epoch credits" />
                            <DataItem label="lastHeartbeat" desc="Calculated from lastVote" />
                            <DataItem label="peersConnected" desc="Real cluster node count" />
                        </div>
                    </div>

                    {/* Derived Data */}
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <h3 className="font-semibold text-amber-400">Derived Data (Deterministic per Node)</h3>
                        </div>
                        <p className="text-zinc-500 text-sm mb-4">
                            These values are derived from each node{"'"}s pubkey hash for consistency. 
                            When pRPC (port 6000) becomes publicly accessible, real hardware stats will be used.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <DataItem label="latency" desc="Derived 20-80ms range" />
                            <DataItem label="storage.used" desc="Derived from pubkey" />
                            <DataItem label="shardCount" desc="Derived from pubkey" />
                            <DataItem label="hardware specs" desc="CPU, cores, memory, disk" />
                            <DataItem label="network traffic" desc="Inbound/outbound" />
                            <DataItem label="history" desc="30-day pattern from pubkey" />
                            <DataItem label="joinedAt" desc="Derived join date" />
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Links */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-16"
            >
                <h2 className="text-2xl font-bold text-zinc-100 mb-6">Resources</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                    <ResourceLink
                        href="https://xandeum.network"
                        label="Xandeum Website"
                        description="Official project page"
                        external
                    />
                    <ResourceLink
                        href="https://docs.xandeum.network"
                        label="Documentation"
                        description="Technical guides & API reference"
                        external
                    />
                    <ResourceLink
                        href="https://discord.gg/uqRSmmM5m"
                        label="Discord"
                        description="Community & support"
                        icon={MessageCircle}
                        external
                    />
                    <ResourceLink
                        href="https://twitter.com/xandeum"
                        label="Twitter"
                        description="Updates & announcements"
                        icon={Twitter}
                        external
                    />
                </div>
            </motion.section>

            {/* CTA - Terminal style */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex justify-center"
            >
                <Link href="/dashboard">
                    <button className="group flex items-center gap-3 px-6 py-3 border border-zinc-700 rounded text-zinc-300 text-sm font-mono hover:bg-zinc-900 hover:border-zinc-600 hover:text-white transition-all">
                        <span className="text-emerald-400">→</span>
                        <span>open dashboard</span>
                    </button>
                </Link>
            </motion.div>
        </div>
    )
}

function InfoCard({ icon: Icon, title, description }: {
    icon: React.ElementType;
    title: string;
    description: string;
}) {
    return (
        <div className="p-5 rounded-2xl border border-white/10 bg-zinc-900/30">
            <Icon className="h-5 w-5 text-orange-400 mb-3" />
            <h3 className="font-semibold text-zinc-100 mb-1">{title}</h3>
            <p className="text-sm text-zinc-500">{description}</p>
        </div>
    )
}

function ListItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3 text-zinc-400">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0" />
            <span>{children}</span>
        </li>
    )
}



function ResourceLink({
    href,
    label,
    description,
    icon: Icon = ExternalLink,
    external = false
}: {
    href: string;
    label: string;
    description: string;
    icon?: React.ElementType;
    external?: boolean;
}) {
    const Component = external ? "a" : Link

    return (
        <Component
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
        >
            <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                <Icon className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex-1">
                <div className="font-medium text-zinc-200">{label}</div>
                <div className="text-sm text-zinc-500">{description}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
        </Component>
    )
}



function DataItem({ label, desc }: { label: string; desc: string }) {
    return (
        <div className="flex items-start gap-2">
            <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">{label}</code>
            <span className="text-zinc-500">{desc}</span>
        </div>
    )
}
