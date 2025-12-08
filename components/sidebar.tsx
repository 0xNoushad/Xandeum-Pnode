"use client"

import { useState } from "react";
import { Sidebar as SidebarContainer, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Server, Map as MapIcon, BarChart3, HelpCircle } from "lucide-react"
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
    { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-zinc-400 group-hover/sidebar:text-zinc-100 transition-colors" strokeWidth={1.5} /> },
    { label: "Live Nodes", href: "/nodes", icon: <Server className="h-5 w-5 flex-shrink-0 text-zinc-400 group-hover/sidebar:text-zinc-100 transition-colors" strokeWidth={1.5} /> },
    { label: "Global Map", href: "/map", icon: <MapIcon className="h-5 w-5 flex-shrink-0 text-zinc-400 group-hover/sidebar:text-zinc-100 transition-colors" strokeWidth={1.5} /> },
    { label: "Performance", href: "/charts", icon: <BarChart3 className="h-5 w-5 flex-shrink-0 text-zinc-400 group-hover/sidebar:text-zinc-100 transition-colors" strokeWidth={1.5} /> },
    { label: "About Xandeum", href: "/about", icon: <HelpCircle className="h-5 w-5 flex-shrink-0 text-zinc-400 group-hover/sidebar:text-zinc-100 transition-colors" strokeWidth={1.5} /> },
];

const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.08,
            duration: 0.4,
            ease: "easeOut" as const
        }
    })
};

// Mobile navigation links - simple links without context dependency
function MobileNavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <motion.div
            className="flex flex-col gap-2"
            initial="hidden"
            animate="visible"
        >
            {links.map((link, idx) => (
                <motion.div
                    key={link.label}
                    custom={idx}
                    variants={linkVariants}
                    whileHover={{
                        x: 4,
                        transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Link
                        href={link.href}
                        onClick={onNavigate}
                        className="flex items-center gap-3 hover:bg-white/5 hover:text-zinc-100 text-zinc-400 transition-all duration-200 rounded-xl py-3 px-3 group"
                    >
                        {link.icon}
                        <span className="text-sm group-hover:translate-x-1 transition duration-150">
                            {link.label}
                        </span>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}

// Desktop navigation links - respects open state
function DesktopNavigationLinks() {
    const { open } = useSidebar();
    
    return (
        <motion.div
            className="mt-10 flex flex-col gap-2"
            initial="hidden"
            animate="visible"
        >
            {links.map((link, idx) => (
                <motion.div
                    key={link.label}
                    custom={idx}
                    variants={linkVariants}
                    whileHover={{
                        x: 4,
                        transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    <SidebarLink
                        link={link}
                        className={cn(
                            "hover:bg-white/5 hover:text-zinc-100 text-zinc-400 transition-all duration-200 rounded-xl py-3",
                            open ? "justify-start px-2" : "justify-center px-0"
                        )}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}

// Network status indicator
function NetworkStatus() {
    const { open } = useSidebar();
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className={cn(
                "flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20",
                open ? "mx-2" : "mx-1 justify-center"
            )}
        >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-breathe" />
            {open && (
                <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-xs font-medium text-emerald-400 whitespace-nowrap overflow-hidden"
                >
                    Network Online
                </motion.span>
            )}
        </motion.div>
    );
}

export function Sidebar() {
    const [open, setOpen] = useState(false);

    return (
        <SidebarContainer open={open} setOpen={setOpen}>
            <SidebarBody 
                className="justify-between gap-10 bg-zinc-950/50 backdrop-blur-xl border-r border-white/5 pb-8"
                mobileContent={({ onNavigate }: { onNavigate: () => void }) => <MobileNavigationLinks onNavigate={onNavigate} />}
            >
                {/* Desktop sidebar content */}
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        {open ? <Logo key="logo" /> : <LogoIcon key="icon" />}
                    </AnimatePresence>
                    <DesktopNavigationLinks />
                </div>

                {/* Network Status Indicator - Desktop only */}
                <NetworkStatus />
            </SidebarBody>
        </SidebarContainer>
    )
}

export const Logo = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20"
        >
            <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex h-7 w-7 items-center justify-center"
            >
                <Image src="/logo.svg" alt="Xandeum" width={28} height={28} className="rounded" />
            </motion.div>
            <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="font-medium text-zinc-100 whitespace-pre"
            >
                Xandeum
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm text-foreground py-1 relative z-20 justify-center"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-7 w-7 items-center justify-center"
            >
                <Image src="/logo.svg" alt="Xandeum" width={28} height={28} className="rounded" />
            </motion.div>
        </Link>
    );
};
