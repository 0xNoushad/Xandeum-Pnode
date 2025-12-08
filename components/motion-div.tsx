"use client"

import { motion, Variants, HTMLMotionProps } from "framer-motion"
import { ReactNode } from "react"

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
}

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
}

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
}

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
}

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }
}

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
}

export const floatingAnimation: Variants = {
    initial: { y: 0 },
    animate: {
        y: [-5, 5, -5],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

export const pulseAnimation: Variants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.02, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
}

interface MotionDivProps extends Omit<HTMLMotionProps<"div">, 'children'> {
    children: ReactNode
    className?: string
    delay?: number
    variant?: "fadeInUp" | "fadeIn" | "slideInLeft" | "slideInRight" | "scaleIn" | "stagger"
}

export function MotionDiv({
    children,
    className,
    delay = 0,
    variant = "fadeInUp",
    ...props
}: MotionDivProps) {
    const variants: Record<string, Variants> = {
        fadeInUp,
        fadeIn,
        slideInLeft,
        slideInRight,
        scaleIn,
        stagger: staggerItem
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants[variant]}
            transition={{ delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export function StaggerContainer({
    children,
    className,
    delay = 0
}: {
    children: ReactNode
    className?: string
    delay?: number
}) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Animated card wrapper with hover effects
export function AnimatedCard({
    children,
    className,
    delay = 0
}: {
    children: ReactNode
    className?: string
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{
                y: -4,
                transition: { duration: 0.2 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Page transition wrapper
export function PageTransition({
    children,
    className
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function AnimatedHeader({
    children,
    className
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
