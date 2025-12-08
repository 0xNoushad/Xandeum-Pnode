"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface HeartbeatIndicatorProps {
    lastHeartbeat: number;
    status: "Active" | "Delinquent" | "Offline";
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export function HeartbeatIndicator({ 
    lastHeartbeat, 
    status, 
    showLabel = true,
    size = "md" 
}: HeartbeatIndicatorProps) {
    const [timeSince, setTimeSince] = useState<string>("");
    const [isBeating, setIsBeating] = useState(false);

    useEffect(() => {
        const updateTime = () => {
            const now = Date.now();
            const diff = now - lastHeartbeat;
            
            if (diff < 1000) {
                setTimeSince("just now");
            } else if (diff < 60000) {
                setTimeSince(`${Math.floor(diff / 1000)}s ago`);
            } else if (diff < 3600000) {
                setTimeSince(`${Math.floor(diff / 60000)}m ago`);
            } else {
                setTimeSince(`${Math.floor(diff / 3600000)}h ago`);
            }

            // Trigger beat animation if recent heartbeat
            if (diff < 35000 && status === "Active") {
                setIsBeating(true);
                setTimeout(() => setIsBeating(false), 500);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [lastHeartbeat, status]);

    const sizeClasses = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    const getStatusColor = () => {
        switch (status) {
            case "Active": return "text-emerald-500";
            case "Delinquent": return "text-amber-500";
            case "Offline": return "text-red-500";
        }
    };

    const getBgColor = () => {
        switch (status) {
            case "Active": return "bg-emerald-500/20";
            case "Delinquent": return "bg-amber-500/20";
            case "Offline": return "bg-red-500/20";
        }
    };

    return (
        <div className="flex items-center gap-2">
            <motion.div
                animate={isBeating ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`relative p-1.5 rounded-lg ${getBgColor()}`}
            >
                <Heart className={`${sizeClasses[size]} ${getStatusColor()} ${status === "Active" ? "fill-current" : ""}`} />
                {status === "Active" && (
                    <motion.span
                        className="absolute inset-0 rounded-lg bg-emerald-500/30"
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}
            </motion.div>
            {showLabel && (
                <div className="flex flex-col">
                    <span className={`text-xs font-medium ${getStatusColor()}`}>
                        {status === "Active" ? "Heartbeat OK" : status === "Delinquent" ? "Degraded" : "No Signal"}
                    </span>
                    <span className="text-[10px] text-zinc-500">{timeSince}</span>
                </div>
            )}
        </div>
    );
}

// Compact version for lists
export function HeartbeatDot({ status }: { status: "Active" | "Delinquent" | "Offline" }) {
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (status === "Active") {
            const interval = setInterval(() => {
                setPulse(true);
                setTimeout(() => setPulse(false), 300);
            }, 30000); // Every 30 seconds like real heartbeat
            return () => clearInterval(interval);
        }
    }, [status]);

    const color = status === "Active" ? "bg-emerald-500" : status === "Delinquent" ? "bg-amber-500" : "bg-red-500";

    return (
        <motion.span
            animate={pulse ? { scale: [1, 1.5, 1] } : {}}
            className={`h-2 w-2 rounded-full ${color} ${status === "Active" ? "animate-pulse" : ""}`}
        />
    );
}
