"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import GlassCard from "@/components/ui/GlassCard";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CreateCommunityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "General",
        location: "Campus Center",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.description) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Insert Community
            const { data, error } = await supabase
                .from('communities')
                .insert({
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    location: formData.location,
                    created_by: user.id,
                    image_url: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}` // Default avatar for now
                })
                .select()
                .single();

            if (error) throw error;

            // Auto-join the creator
            if (data) {
                await supabase.from('community_members').insert({
                    community_id: data.id,
                    user_id: user.id
                });
            }

            router.push('/communities');
            router.refresh();
        } catch (error) {
            console.error("Error creating community:", error);
            alert("Failed to create community. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 relative flex items-center justify-center">
            <AnimatedBackground />

            <div className="w-full max-w-2xl relative z-10">
                <Link href="/communities" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back to Communities</span>
                </Link>

                <GlassCard className="p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">Create a Community</h1>
                            <p className="text-text-secondary">Start a new club or group on campus.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Community Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all"
                                placeholder="e.g. Coding Club"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all appearance-none"
                                >
                                    <option value="General" className="bg-surface text-black">General</option>
                                    <option value="Academic" className="bg-surface text-black">Academic</option>
                                    <option value="Sports" className="bg-surface text-black">Sports</option>
                                    <option value="Arts" className="bg-surface text-black">Arts</option>
                                    <option value="Social" className="bg-surface text-black">Social</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Location (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all"
                                    placeholder="e.g. Student Center"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all resize-none h-32"
                                placeholder="What is this community about?"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <span>Create Community</span>
                            )}
                        </button>
                    </form>
                </GlassCard>
            </div>
        </main>
    );
}
