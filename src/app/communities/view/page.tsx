"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import GlassCard from "@/components/ui/GlassCard";
import PostCard from "@/components/feed/PostCard";
import CreatePost from "@/components/feed/CreatePost";
import { ArrowLeft, Users, MapPin, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CommunityDetailsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    const [community, setCommunity] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isMember, setIsMember] = useState(false);
    const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

    const fetchCommunityData = async () => {
        if (!id) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            // 1. Fetch Community Details
            const { data: communityData, error: communityError } = await supabase
                .from('communities')
                .select('*')
                .eq('id', id)
                .single();

            if (communityError) throw communityError;
            setCommunity(communityData);

            // 2. Check Membership
            if (user) {
                const { data: membership } = await supabase
                    .from('community_members')
                    .select('*')
                    .eq('community_id', id)
                    .eq('user_id', user.id)
                    .single();

                setIsMember(!!membership);
            }

            // 3. Fetch Posts for this Community
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:profiles!posts_user_id_fkey (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('community_id', id)
                .order('created_at', { ascending: false });

            if (postsError) throw postsError;
            setPosts(postsData || []);

            // 4. Fetch Likes
            if (user && postsData && postsData.length > 0) {
                const { data: likes } = await supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('user_id', user.id)
                    .in('post_id', postsData.map(p => p.id));

                if (likes) {
                    setLikedPostIds(new Set(likes.map(l => l.post_id)));
                }
            }

        } catch (error) {
            console.error("Error fetching community data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCommunityData();
        } else {
            setLoading(false);
        }
    }, [id]);

    const handleJoin = async () => {
        if (!currentUser || !id) return;

        try {
            if (isMember) {
                await supabase.from('community_members').delete().match({
                    community_id: id,
                    user_id: currentUser.id
                });
                setIsMember(false);
            } else {
                await supabase.from('community_members').insert({
                    community_id: id,
                    user_id: currentUser.id
                });
                setIsMember(true);
            }
        } catch (error) {
            console.error("Error toggling membership:", error);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen p-4 md:p-8 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </main>
        );
    }

    if (!id || !community) {
        return (
            <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-text-main mb-2">Community Not Found</h1>
                <Link href="/communities" className="text-primary hover:underline">Back to Communities</Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 relative">
            <AnimatedBackground />

            <div className="max-w-4xl mx-auto">
                <Link href="/communities" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back to Communities</span>
                </Link>

                {/* Header Card */}
                <GlassCard className="mb-8 p-0 overflow-hidden">
                    <div className="h-48 md:h-64 w-full relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <img
                            src={community.image_url}
                            alt={community.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-6 left-6 md:left-8 z-20">
                            <span className="px-3 py-1 bg-primary/90 text-white text-xs font-bold rounded-md uppercase tracking-wide mb-2 inline-block">
                                {community.category}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{community.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                                <div className="flex items-center gap-1">
                                    <Users size={16} />
                                    <span>{0} members</span> {/* Placeholder count */}
                                </div>
                                {community.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} />
                                        <span>{community.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 right-6 z-20">
                            <button
                                onClick={handleJoin}
                                className={`px-6 py-2 rounded-full font-bold transition-all ${isMember
                                    ? "bg-white/20 hover:bg-red-500/20 text-white hover:text-red-500 backdrop-blur-md"
                                    : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
                                    }`}
                            >
                                {isMember ? "Leave Community" : "Join Community"}
                            </button>
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        <h2 className="text-lg font-bold text-text-main mb-2">About</h2>
                        <p className="text-text-secondary leading-relaxed">{community.description}</p>
                    </div>
                </GlassCard>

                {/* Feed */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-text-main">Community Feed</h2>
                    </div>

                    {isMember && (
                        <CreatePost onPostCreated={fetchCommunityData} communityId={id} />
                    )}

                    {posts.length > 0 ? (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={{
                                        id: post.id,
                                        author: {
                                            id: post.user_id,
                                            name: post.profiles?.full_name || "Anonymous",
                                            avatar: post.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.profiles?.full_name}`,
                                            time: new Date(post.created_at).toLocaleDateString(),
                                        },
                                        content: post.content,
                                        image: post.image_url,
                                        likes: post.likes_count || 0,
                                        comments: post.comments_count || 0,
                                        isLiked: likedPostIds.has(post.id),
                                        currentUserId: currentUser?.id
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-text-secondary">No posts yet. Be the first to share something!</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
