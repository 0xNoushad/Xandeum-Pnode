"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ExternalLink, Twitter, MessageCircle, Github, FileText } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto py-6 sm:py-8 pb-16 sm:pb-20">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
                    About Xandeum
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Xandeum is a decentralized storage layer for Solana, enabling smart contracts 
                    to store and retrieve large amounts of data without bloating the main chain.
                </p>
            </motion.div>

            {/* What is Xandeum */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
            >
                <h2 className="text-xl font-semibold text-zinc-100 mb-4">How it works</h2>
                <div className="space-y-3 text-zinc-400">
                    <p>
                        pNodes (provider nodes) store data shards across the network using erasure coding, 
                        ensuring data stays available even if some nodes go offline.
                    </p>
                    <p>
                        This dashboard monitors the health and performance of the pNode network in real-time.
                    </p>
                </div>
            </motion.section>

            {/* Links */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-12"
            >
                <h2 className="text-xl font-semibold text-zinc-100 mb-4">Links</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <ResourceLink
                        href="https://xandeum.com"
                        label="Website"
                        icon={ExternalLink}
                    />
                    <ResourceLink
                        href="https://docs.xandeum.com"
                        label="Documentation"
                        icon={FileText}
                    />
                    <ResourceLink
                        href="https://twitter.com/xaboratory"
                        label="Twitter"
                        icon={Twitter}
                    />
                    <ResourceLink
                        href="https://discord.gg/xandeum"
                        label="Discord"
                        icon={MessageCircle}
                    />
                    <ResourceLink
                        href="https://github.com/xandeum"
                        label="GitHub"
                        icon={Github}
                    />
                    <ResourceLink
                        href="https://explorer.solana.com?cluster=custom&customUrl=https://api.xandeum.com:8899"
                        label="Explorer"
                        icon={ExternalLink}
                    />
                </div>
            </motion.section>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
            >
                <Link href="/dashboard">
                    <button className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-300 text-sm hover:bg-zinc-700 hover:text-white transition-all">
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </Link>
            </motion.div>
        </div>
    )
}

function ResourceLink({ href, label, icon: Icon }: {
    href: string;
    label: string;
    icon: React.ElementType;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors group"
        >
            <Icon className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
            <span className="text-sm text-zinc-300 group-hover:text-white">{label}</span>
            <ArrowRight className="h-3 w-3 text-zinc-600 ml-auto group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
        </a>
    )
}
