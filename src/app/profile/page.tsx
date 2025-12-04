"use client";

import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import PostCard from "@/components/feed/PostCard";
import ListingCard from "@/components/marketplace/ListingCard";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push("/login");
                    return;
                }

                // 1. Fetch Profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

                // 2. Fetch User's Posts
                const { data: postsData } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles (
                            full_name,
                            avatar_url,
                            university,
                            major
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                setPosts(postsData || []);

                // 3. Fetch User's Listings
                const { data: listingsData } = await supabase
                    .from('market_items')
                    .select(`
                        *,
                        profiles (
                            full_name,
                            avatar_url
                        )
                    `)
                    .eq('seller_id', user.id)
                    .order('created_at', { ascending: false });

                setListings(listingsData || []);

            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router]);

    if (loading) {
        return (
            <main className="min-h-screen relative pb-20">
                <AnimatedBackground />
                <div className="h-64 bg-surface/50 animate-pulse" />
                <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
                    <div className="p-8 rounded-3xl bg-surface/70 backdrop-blur-md border border-white/20 shadow-glass h-64 animate-pulse" />
                    <div className="mt-8 space-y-4">
                        <Skeleton className="h-10 w-64 mx-auto" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative pb-20">
            <AnimatedBackground />

            <div className="max-w-5xl mx-auto">
                <ProfileHeader profile={profile} />

                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="px-4 md:px-0">
                    {activeTab === "posts" && (
                        <div className="columns-1 md:columns-2 gap-6 space-y-6">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div key={post.id} className="break-inside-avoid mb-6">
                                        <PostCard post={post} />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-text-secondary py-10 col-span-full">
                                    No posts yet. Share something with the campus!
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "market" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.length > 0 ? (
                                listings.map((listing) => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={{
                                            title: listing.title,
                                            price: `$${listing.price}`,
                                            image: listing.image_url,
                                            condition: listing.condition,
                                            seller: {
                                                name: listing.profiles?.full_name || "Anonymous",
                                                avatar: listing.profiles?.avatar_url
                                            }
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="text-center text-text-secondary py-10 col-span-full">
                                    No listings yet. Sell your old textbooks!
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "about" && (
                        <div className="bg-surface/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-text-secondary">
                            <h3 className="text-xl font-bold text-text-main mb-4">About Me</h3>
                            <p>
                                {profile?.bio || "No bio added yet."}
                            </p>

                            <div className="mt-6">
                                <h4 className="font-bold text-text-main mb-2">Details</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>🎓 University: {profile?.university || "Not set"}</li>
                                    <li>📚 Major: {profile?.major || "Not set"}</li>
                                    <li>📅 Year: {profile?.year || "Not set"}</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
