"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import AuthIllustration from "@/components/illustrations/AuthIllustration";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSignup = async () => {
        setError(null);
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Create profile record (triggered by database trigger ideally, but manual here for simplicity if no trigger)
            // Actually, let's rely on the auth user creation. We might need a trigger or just insert to profiles table.
            // For this MVP, we'll insert to profiles table manually if needed, or just rely on Auth.
            // Let's insert into profiles to be safe and consistent with our schema.
            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: data.user.id,
                    email: data.user.email!,
                    full_name: formData.fullName,
                });
                if (profileError) console.error("Profile creation failed:", profileError);
            }

            router.push("/onboarding");
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
                <div className="hidden lg:block order-2 lg:order-1">
                    <AuthIllustration />
                    <div className="text-center mt-8">
                        <h2 className="text-4xl font-bold text-primary mb-4">Join the Community</h2>
                        <p className="text-xl text-text-secondary">
                            Discover events, find study buddies, and more.
                        </p>
                    </div>
                </div>

                {/* Right Side: Signup Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="order-1 lg:order-2"
                >
                    <GlassCard className="p-8 md:p-12 w-full max-w-md mx-auto">
                        <div className="text-center mb-8 lg:hidden">
                            <h1 className="text-3xl font-bold text-primary">Campus Connect</h1>
                            <p className="text-text-secondary">Create your account</p>
                        </div>

                        <h2 className="text-2xl font-bold mb-6 text-text-main hidden lg:block">Sign Up</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

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

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleSignup}
                                disabled={loading}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-text-secondary">
                            Already have an account?{" "}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </main>
    );
}
