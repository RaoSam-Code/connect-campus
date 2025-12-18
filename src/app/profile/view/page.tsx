"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import GlassCard from "@/components/ui/GlassCard";
import PostCard from "@/components/feed/PostCard";
import { ArrowLeft, MapPin, Calendar, BookOpen, GraduationCap, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";

export default function UserProfilePage() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);

                // 1. Fetch Profile Details
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

                // 2. Fetch User's Posts
                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles:profiles!posts_user_id_fkey (
                            full_name,
                            avatar_url
                        )
                    `)
                    .eq('user_id', id)
                    .order('created_at', { ascending: false });

                if (postsError) throw postsError;
                setPosts(postsData || []);

                // 3. Fetch Likes (if logged in)
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
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen p-4 md:p-8 relative">
                <AnimatedBackground />
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <Skeleton className="h-40 w-full rounded-3xl" />
                </div>
            </main>
        );
    }

    if (!id || !profile) {
        return (
            <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold text-text-main mb-2">User Not Found</h1>
                <Link href="/feed" className="text-primary hover:underline">Back to Feed</Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 relative">
            <AnimatedBackground />

            <div className="max-w-4xl mx-auto">
                <Link href="/feed" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Link>

                {/* Profile Header */}
                <GlassCard className="mb-8 p-0 overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-32 h-32 rounded-full border-4 border-surface overflow-hidden bg-surface">
                                <img
                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`}
                                    alt={profile.full_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="pt-16 px-8 pb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-text-main mb-1">{profile.full_name}</h1>
                                <p className="text-text-secondary mb-4">@{profile.username || profile.full_name.toLowerCase().replace(/\s/g, '')}</p>
                                <p className="text-text-main max-w-2xl leading-relaxed mb-6">{profile.bio || "No bio yet."}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                    {profile.university && (
                                        <div className="flex items-center gap-2">
                                            <GraduationCap size={16} />
                                            <span>{profile.university}</span>
                                        </div>
                                    )}
                                    {profile.major && (
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={16} />
                                            <span>{profile.major}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Joined {new Date(profile.created_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {currentUser?.id !== profile.id && (
                                <button className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                                    <MessageSquare size={18} />
                                    <span>Message</span>
                                </button>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* User's Posts */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-main">Posts</h2>
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
                            <p className="text-text-secondary">No posts yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
