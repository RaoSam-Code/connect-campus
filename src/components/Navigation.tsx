"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    HomeIcon,
    CommunityIcon,
    ChatIcon,
    MarketplaceIcon,
    ProfileIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Communities", href: "/communities", icon: CommunityIcon },
    { name: "Marketplace", href: "/marketplace", icon: MarketplaceIcon },
    { name: "Chat", href: "/chat", icon: ChatIcon },
    { name: "Profile", href: "/profile", icon: ProfileIcon },
];

export default function Navigation() {
    const pathname = usePathname();

    if (["/login", "/signup", "/onboarding"].includes(pathname)) return null;

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <div className={cn(
                "fixed bottom-4 left-4 right-4 z-50 md:hidden transition-transform duration-300",
                // Hide navbar if we are chatting (detected via URL param)
                pathname === '/chat' && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').has('id') && "translate-y-32"
            )}>
                <div className="flex items-center justify-around bg-surface/80 backdrop-blur-lg border border-white/20 shadow-glass rounded-2xl p-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href} className="relative p-2">
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-pill"
                                        className="absolute inset-0 bg-primary/10 rounded-xl"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    size={24}
                                    className={cn(
                                        "relative z-10 transition-colors duration-200",
                                        isActive ? "text-primary" : "text-text-secondary"
                                    )}
                                />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Sidebar Navigation */}
            <div className="hidden md:flex fixed left-4 top-4 bottom-4 w-20 flex-col items-center py-8 bg-surface/80 backdrop-blur-lg border border-white/20 shadow-glass rounded-2xl z-50">
                <div className="mb-8">
                    {/* Logo Placeholder */}
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                        CC
                    </div>
                </div>

                <div className="flex flex-col gap-6 w-full items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative p-3 group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="desktop-nav-pill"
                                        className="absolute inset-0 bg-primary/10 rounded-xl"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className="relative z-10">
                                    <item.icon
                                        size={24}
                                        className={cn(
                                            "transition-colors duration-200",
                                            isActive ? "text-primary" : "text-text-secondary group-hover:text-primary"
                                        )}
                                    />
                                </div>

                                {/* Tooltip */}
                                <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-white/20 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-sm font-medium text-text-main">
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
