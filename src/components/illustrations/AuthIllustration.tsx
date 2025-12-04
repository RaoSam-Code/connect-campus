"use client";

import { motion } from "framer-motion";

export default function AuthIllustration() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg
                viewBox="0 0 800 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full max-w-lg drop-shadow-2xl"
            >
                {/* Floating Elements Group */}
                <motion.g
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Main Device/Card */}
                    <rect
                        x="200"
                        y="150"
                        width="400"
                        height="300"
                        rx="20"
                        fill="url(#grad1)"
                        className="opacity-90"
                    />
                    <rect
                        x="200"
                        y="150"
                        width="400"
                        height="300"
                        rx="20"
                        stroke="white"
                        strokeOpacity="0.5"
                        strokeWidth="2"
                    />

                    {/* Screen Content */}
                    <rect x="240" y="200" width="140" height="10" rx="5" fill="white" fillOpacity="0.8" />
                    <rect x="240" y="230" width="200" height="10" rx="5" fill="white" fillOpacity="0.4" />
                    <rect x="240" y="260" width="180" height="10" rx="5" fill="white" fillOpacity="0.4" />

                    {/* Chat Bubble 1 */}
                    <motion.g
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <rect x="150" y="100" width="180" height="80" rx="16" fill="#f64060" />
                        <circle cx="190" cy="140" r="15" fill="white" fillOpacity="0.3" />
                        <rect x="220" y="130" width="80" height="8" rx="4" fill="white" />
                        <rect x="220" y="145" width="50" height="8" rx="4" fill="white" fillOpacity="0.6" />
                    </motion.g>

                    {/* Chat Bubble 2 */}
                    <motion.g
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        <rect x="500" y="380" width="160" height="70" rx="16" fill="#00455d" />
                        <circle cx="540" cy="415" r="15" fill="white" fillOpacity="0.3" />
                        <rect x="570" y="405" width="60" height="8" rx="4" fill="white" />
                        <rect x="570" y="420" width="40" height="8" rx="4" fill="white" fillOpacity="0.6" />
                    </motion.g>
                </motion.g>

                {/* Definitions */}
                <defs>
                    <linearGradient id="grad1" x1="200" y1="150" x2="600" y2="450" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f64060" stopOpacity="0.2" />
                        <stop offset="1" stopColor="#00455d" stopOpacity="0.2" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
