"use client";

import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ListingCard from "@/components/marketplace/ListingCard";
import GlassCard from "@/components/ui/GlassCard";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MarketplacePage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const { data, error } = await supabase
                    .from('market_items')
                    .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setListings(data || []);
            } catch (error) {
                console.error("Error fetching listings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const filteredListings = listings.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen p-4 md:p-8 relative">
            <AnimatedBackground />

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">Marketplace</h1>
                        <p className="text-text-secondary">Buy, sell, and trade with students.</p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <GlassCard className="p-2 flex items-center gap-2 flex-1 md:w-80">
                            <Search className="text-text-secondary ml-2" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search items..."
                                className="bg-transparent border-none outline-none text-text-main placeholder-text-muted flex-1 h-10"
                            />
                        </GlassCard>
                        <GlassCard className="p-3 flex items-center justify-center cursor-pointer hover:bg-white/40 transition-colors w-12">
                            <Filter size={20} className="text-text-secondary" />
                        </GlassCard>
                    </div>
                </div>

                {loading ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="break-inside-avoid mb-6">
                                <div className="rounded-2xl overflow-hidden bg-surface/70 backdrop-blur-md border border-white/20 shadow-glass">
                                    <Skeleton className="h-48 w-full" />
                                    <div className="p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-12" />
                                        </div>
                                        <Skeleton className="h-3 w-16" />
                                        <div className="flex items-center gap-2 mt-2">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                        {filteredListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={{
                                    title: listing.title,
                                    price: `$${listing.price}`,
                                    image: listing.image_url,
                                    condition: listing.condition,
                                    seller: {
                                        name: listing.profiles?.full_name || "Anonymous",
                                        avatar: listing.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${listing.profiles?.full_name}`
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
