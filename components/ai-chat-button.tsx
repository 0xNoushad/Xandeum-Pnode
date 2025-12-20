"use client"

import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function AIChatButton() {
    const openChat = () => {
        window.dispatchEvent(new CustomEvent("open-pnode-bot"));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Button
                variant="outline"
                size="sm"
                onClick={openChat}
                className="gap-2 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 group"
            >
                <Bot className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">AI Chat</span>
            </Button>
        </motion.div>
    )
}
