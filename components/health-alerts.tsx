"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertTriangle, CheckCircle2, XCircle, TrendingDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HealthAlert {
    id: string;
    type: "offline" | "delinquent" | "recovered" | "degraded";
    pubkey: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface HealthAlertsProps {
    alerts: HealthAlert[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClearAlerts: () => void;
}

export function HealthAlerts({
    alerts,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAlerts,
}: HealthAlertsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleAlertClick = (alert: HealthAlert) => {
        onMarkAsRead(alert.id);
        setIsOpen(false);
        router.push(`/nodes/${alert.pubkey}`);
    };

    const getAlertIcon = (type: HealthAlert["type"]) => {
        switch (type) {
            case "offline":
                return <XCircle className="h-4 w-4" />;
            case "delinquent":
                return <AlertTriangle className="h-4 w-4" />;
            case "recovered":
                return <CheckCircle2 className="h-4 w-4" />;
            case "degraded":
                return <TrendingDown className="h-4 w-4" />;
        }
    };

    const getAlertStyles = (type: HealthAlert["type"]) => {
        switch (type) {
            case "offline":
                return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" };
            case "delinquent":
                return { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" };
            case "recovered":
                return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" };
            case "degraded":
                return { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" };
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 hover:bg-zinc-700/80 hover:border-zinc-600 transition-all"
            >
                <Bell className="h-5 w-5 text-zinc-300" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/30"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/20"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed inset-x-0 bottom-0 sm:bottom-auto sm:inset-x-auto sm:absolute sm:right-0 sm:top-14 w-full sm:w-[360px] max-h-[70vh] sm:max-h-none z-50 rounded-t-2xl sm:rounded-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
                                <div>
                                    <h3 className="font-semibold text-white text-sm">Node Alerts</h3>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {alerts.length === 0 ? "All systems operational" : `${unreadCount} unread`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onMarkAllAsRead}
                                            className="text-xs text-zinc-400 hover:text-white h-7 px-2"
                                        >
                                            Mark read
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                        className="h-8 w-8 text-zinc-400 hover:text-white"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Drag handle for mobile */}
                            <div className="sm:hidden flex justify-center py-2 border-b border-zinc-800/50">
                                <div className="w-10 h-1 rounded-full bg-zinc-700" />
                            </div>

                            {/* Alerts List */}
                            <div className="max-h-[320px] overflow-y-auto">
                                {alerts.length === 0 ? (
                                    <div className="py-12 px-4 text-center">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <p className="text-zinc-300 text-sm font-medium">All nodes healthy</p>
                                        <p className="text-zinc-600 text-xs mt-1">
                                            No issues detected
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {alerts.map((alert, index) => {
                                            const styles = getAlertStyles(alert.type);
                                            return (
                                                <motion.div
                                                    key={alert.id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    onClick={() => handleAlertClick(alert)}
                                                    className={`px-4 py-3 cursor-pointer transition-all hover:bg-zinc-800/80 ${
                                                        index !== alerts.length - 1 ? "border-b border-zinc-800/50" : ""
                                                    } ${!alert.read ? "bg-zinc-800/40" : ""}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${styles.bg} ${styles.text} flex-shrink-0`}>
                                                            {getAlertIcon(alert.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className={`text-sm ${!alert.read ? "text-white font-medium" : "text-zinc-400"}`}>
                                                                    {alert.type === "offline" ? "Node Offline" :
                                                                     alert.type === "delinquent" ? "Node Delinquent" :
                                                                     alert.type === "recovered" ? "Node Recovered" : "Performance Issue"}
                                                                </p>
                                                                {!alert.read && (
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                                                                {alert.pubkey.slice(0, 8)}...{alert.pubkey.slice(-6)}
                                                            </p>
                                                            <p className="text-xs text-zinc-600 mt-1">
                                                                {formatTime(alert.timestamp)}
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-zinc-600 flex-shrink-0 mt-1" />
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {alerts.length > 0 && (
                                <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/80">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs text-zinc-500 hover:text-white h-8"
                                        onClick={onClearAlerts}
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
