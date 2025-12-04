"use client";

import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();

        // Realtime subscription
        const channel = supabase
            .channel('realtime posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                // Optimistic update or refetch. For simplicity, let's refetch to get the profile data relation
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <main className="min-h-screen p-4 md:p-8 relative">
            <AnimatedBackground />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Town Square</h1>
                    <p className="text-text-secondary">What's happening on campus right now.</p>
                </div>

                <CreatePost onPostCreated={fetchPosts} />

                {loading ? (
                    <div className="columns-1 md:columns-2 gap-6 space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="break-inside-avoid mb-6">
                                <div className="p-4 rounded-2xl bg-surface/70 backdrop-blur-md border border-white/20 shadow-glass">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-20 w-full mb-4" />
                                    <Skeleton className="h-64 w-full rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 gap-6 space-y-6">
                        {posts.map((post) => (
                            <div key={post.id} className="break-inside-avoid mb-6">
                                <PostCard
                                    post={{
                                        author: {
                                            name: post.profiles?.full_name || "Anonymous",
                                            avatar: post.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.profiles?.full_name}`,
                                            time: new Date(post.created_at).toLocaleDateString(),
                                        },
                                        content: post.content,
                                        image: post.image_url,
                                        likes: post.likes_count || 0,
                                        comments: post.comments_count || 0,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
