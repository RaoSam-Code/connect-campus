"use client";

import { motion } from "framer-motion";

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
    const tabs = [
        { id: "posts", label: "Posts" },
        { id: "market", label: "Listings" },
        { id: "about", label: "About" },
    ];

    return (
        <div className="flex items-center gap-2 p-1 bg-white/10 backdrop-blur-md rounded-xl w-fit mx-auto md:mx-0 mb-8 border border-white/10">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
            relative px-6 py-2 rounded-lg text-sm font-medium transition-colors
            ${activeTab === tab.id ? "text-white" : "text-text-secondary hover:text-text-main"}
          `}
                >
                    {activeTab === tab.id && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary/80 rounded-lg shadow-lg"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
