"use client";

import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import CommunityCard from "@/components/communities/CommunityCard";
import GlassCard from "@/components/ui/GlassCard";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const { data, error } = await supabase
                    .from('communities')
                    .select('*')
                    .order('name');

                if (error) throw error;
                setCommunities(data || []);
            } catch (error) {
                console.error("Error fetching communities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen p-4 md:p-8 relative">
            <AnimatedBackground />

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">Communities</h1>
                        <p className="text-text-secondary">Find your tribe and get involved.</p>
                    </div>

                    <GlassCard className="p-2 flex items-center gap-2 w-full md:w-auto min-w-[300px]">
                        <Search className="text-text-secondary ml-2" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search clubs, societies..."
                            className="bg-transparent border-none outline-none text-text-main placeholder-text-muted flex-1 h-10"
                        />
                    </GlassCard>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-2xl overflow-hidden bg-surface/70 backdrop-blur-md border border-white/20 shadow-glass">
                                <Skeleton className="h-32 w-full" />
                                <div className="p-6 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <div className="flex justify-between pt-4">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCommunities.map((community) => (
                            <CommunityCard key={community.id} community={community} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
