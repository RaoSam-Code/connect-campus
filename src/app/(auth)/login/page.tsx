"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import AuthIllustration from "@/components/illustrations/AuthIllustration";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleLogin = async () => {
        setError(null);
        setLoading(true);

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (signInError) throw signInError;

            router.push("/feed");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
                {/* Left Side: Illustration */}
                <div className="hidden lg:block">
                    <AuthIllustration />
                    <div className="text-center mt-8">
                        <h2 className="text-4xl font-bold text-primary mb-4">Welcome Back!</h2>
                        <p className="text-xl text-text-secondary">
                            Connect with your campus community today.
                        </p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <GlassCard className="p-8 md:p-12 w-full max-w-md mx-auto">
                        <div className="text-center mb-8 lg:hidden">
                            <h1 className="text-3xl font-bold text-primary">Campus Connect</h1>
                            <p className="text-text-secondary">Sign in to continue</p>
                        </div>

                        <h2 className="text-2xl font-bold mb-6 text-text-main hidden lg:block">Sign In</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="student@university.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span className="text-text-secondary">Remember me</span>
                                </label>
                                <a href="#" className="text-primary hover:underline font-medium">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-text-secondary">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-primary font-bold hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </main>
    );
}
