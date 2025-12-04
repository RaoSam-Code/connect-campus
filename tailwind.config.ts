import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#f64060", // Meetup Red
                    hover: "#d63653",
                    light: "#ffeef1",
                },
                secondary: {
                    DEFAULT: "#00455d", // Deep Teal
                    hover: "#003344",
                },
                background: "#f6f7f8",
                surface: "#ffffff",
                text: {
                    main: "#1f2428",
                    secondary: "#757575",
                    muted: "#a0a0a0",
                },
                border: "#e6e6e6",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
                'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
