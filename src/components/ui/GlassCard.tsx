"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export default function GlassCard({
    children,
    className,
    hoverEffect = true,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
        relative overflow-hidden
        bg-surface/70 backdrop-blur-md
        border border-white/20
        shadow-glass
        rounded-2xl
        ${className || ""}
      `}
            {...props}
        >
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
