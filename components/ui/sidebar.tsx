"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

interface Links {
    label: string;
    href: string;
    icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
    undefined
);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

interface MobileContentProps {
    onNavigate: () => void;
}

interface SidebarBodyProps extends React.ComponentProps<typeof motion.div> {
    mobileContent?: React.ReactNode | ((props: MobileContentProps) => React.ReactNode);
}

export const SidebarBody = ({ mobileContent, ...props }: SidebarBodyProps) => {
    return (
        <>
            {/* Desktop sidebar - hidden on mobile */}
            <DesktopSidebar {...props} />
            {/* Mobile sidebar - only the drawer, header is separate */}
            <MobileSidebar mobileContent={mobileContent} {...(props as React.ComponentProps<"div">)} />
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof motion.div>) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-screen sticky top-0 py-4 hidden md:flex md:flex-col w-[300px] flex-shrink-0 bg-zinc-950/50 backdrop-blur-xl border-r border-white/5",
                className
            )}
            animate={{
                width: animate ? (open ? "300px" : "60px") : "300px",
                paddingLeft: animate ? (open ? "16px" : "8px") : "16px",
                paddingRight: animate ? (open ? "16px" : "8px") : "16px",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

interface MobileSidebarProps extends React.ComponentProps<"div"> {
    mobileContent?: React.ReactNode | ((props: MobileContentProps) => React.ReactNode);
}

export const MobileSidebar = ({
    className,
    mobileContent,
    ...props
}: MobileSidebarProps) => {
    const { open, setOpen } = useSidebar();
    return (
        <>
            {/* Mobile header bar - fixed at top */}
            <div
                className={cn(
                    "h-14 px-4 flex flex-row md:hidden items-center justify-between w-full bg-zinc-950 border-b border-white/5 fixed top-0 left-0 right-0 z-40"
                )}
                {...props}
            >
                {/* Logo on left */}
                <Link href="/" className="flex items-center gap-2">
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex h-7 w-7 items-center justify-center"
                    >
                        <Image src="/logo.svg" alt="Xandeum" width={28} height={28} className="rounded" />
                    </motion.div>
                    <span className="font-semibold text-zinc-100 text-sm">Xandeum</span>
                </Link>

                {/* Menu button on right */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(!open)}
                    className="p-2 -mr-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors touch-target focus-ring"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </motion.button>
            </div>

            {/* Full-screen drawer */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                            onClick={() => setOpen(false)}
                        />

                        {/* Drawer panel */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300,
                            }}
                            className={cn(
                                "fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-zinc-950 border-r border-white/10 z-[101] flex flex-col md:hidden safe-area-top safe-area-bottom",
                                className
                            )}
                        >
                            {/* Drawer header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        className="flex h-8 w-8 items-center justify-center"
                                    >
                                        <Image src="/logo.svg" alt="Xandeum" width={32} height={32} className="rounded" />
                                    </motion.div>
                                    <span className="font-semibold text-zinc-100">Xandeum</span>
                                </Link>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setOpen(false)}
                                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors touch-target focus-ring"
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </motion.button>
                            </div>

                            {/* Navigation content - use mobileContent if provided */}
                            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                                {typeof mobileContent === 'function' 
                                    ? mobileContent({ onNavigate: () => setOpen(false) })
                                    : mobileContent}
                            </div>

                            {/* Drawer footer */}
                            <div className="p-4 border-t border-white/5">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                                >
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-breathe" />
                                    <span className="text-xs font-medium text-emerald-400">
                                        Network Online
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export const SidebarLink = ({
    link,
    className,
    forceShowLabel = false,
    ...props
}: {
    link: Links;
    className?: string;
    forceShowLabel?: boolean;
    props?: LinkProps;
}) => {
    const { open, setOpen, animate } = useSidebar();
    
    const handleClick = () => {
        // Close sidebar on mobile when link is clicked
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setOpen(false);
        }
    };

    // Always show label if forceShowLabel is true (for mobile drawer)
    const showLabel = forceShowLabel || (animate ? open : true);
    
    return (
        <Link
            href={link.href}
            onClick={handleClick}
            className={cn(
                "flex items-center justify-start gap-2 group/sidebar py-2",
                className
            )}
            {...props}
        >
            {link.icon}
            <motion.span
                animate={{
                    display: showLabel ? "inline-block" : "none",
                    opacity: showLabel ? 1 : 0,
                }}
                className="text-inherit text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
