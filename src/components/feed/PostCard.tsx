import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { MessageCircle, Heart, Share2, MoreHorizontal, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

import Link from "next/link";

interface PostProps {
    id: string;
    author: {
        id: string;
        name: string;
        avatar: string;
        time: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
    currentUserId?: string;
}

export default function PostCard({ post }: { post: PostProps }) {
    const [likes, setLikes] = useState(post.likes);
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [showComments, setShowComments] = useState(false);
    const [commentsList, setCommentsList] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const handleLike = async () => {
        if (!post.currentUserId) return;

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikes(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            if (newIsLiked) {
                await supabase.from('post_likes').insert({
                    user_id: post.currentUserId,
                    post_id: post.id
                });
                await supabase.rpc('increment_likes', { row_id: post.id });
            } else {
                await supabase.from('post_likes').delete().match({
                    user_id: post.currentUserId,
                    post_id: post.id
                });
                await supabase.rpc('decrement_likes', { row_id: post.id });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            // Revert
            setIsLiked(!newIsLiked);
            setLikes(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const fetchComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }

        setLoadingComments(true);
        setShowComments(true);

        try {
            const { data } = await supabase
                .from('comments')
                .select('*, profiles(full_name, avatar_url)')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            setCommentsList(data || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !post.currentUserId) return;

        const newComment = {
            id: crypto.randomUUID(),
            content: commentText,
            user_id: post.currentUserId,
            created_at: new Date().toISOString(),
            profiles: {
                full_name: "You", // Placeholder until refresh
                avatar_url: null
            }
        };

        setCommentsList(prev => [...prev, newComment]);
        setCommentText("");

        try {
            await supabase.from('comments').insert({
                content: newComment.content,
                post_id: post.id,
                user_id: post.currentUserId
            });
            await supabase.rpc('increment_comments', { row_id: post.id });
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <GlassCard className="mb-6 p-0 overflow-hidden group">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <Link href={`/profile/view?id=${post.author.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main text-sm">{post.author.name}</h3>
                        <p className="text-xs text-text-secondary">{post.author.time}</p>
                    </div>
                </Link>
                <button className="text-text-secondary hover:text-text-main transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                <p className="text-text-main leading-relaxed mb-4">{post.content}</p>
            </div>

            {/* Image */}
            {post.image && (
                <div className="w-full h-64 bg-gray-100 overflow-hidden">
                    <img src={post.image} alt="Post content" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
            )}

            {/* Actions */}
            <div className="p-4 flex items-center justify-between border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors group/like ${isLiked ? 'text-red-500' : 'text-text-secondary hover:text-primary'}`}
                    >
                        <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500/10' : 'group-hover/like:bg-primary/10'}`}>
                            <Heart size={20} className={`transition-transform ${isLiked ? 'fill-current scale-110' : 'group-hover/like:scale-110'}`} />
                        </div>
                        <span className="text-sm font-medium">{likes}</span>
                    </button>

                    <button
                        onClick={fetchComments}
                        className={`flex items-center gap-2 transition-colors group/comment ${showComments ? 'text-primary' : 'text-text-secondary hover:text-secondary'}`}
                    >
                        <div className="p-2 rounded-full group-hover/comment:bg-secondary/10 transition-colors">
                            <MessageCircle size={20} />
                        </div>
                        <span className="text-sm font-medium">{post.comments + commentsList.length}</span>
                    </button>
                </div>

                <button className="text-text-secondary hover:text-text-main transition-colors p-2 hover:bg-white/10 rounded-full">
                    <Share2 size={20} />
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/10 bg-black/20"
                    >
                        <div className="p-4 space-y-4">
                            {loadingComments ? (
                                <p className="text-center text-sm text-text-secondary">Loading comments...</p>
                            ) : commentsList.length > 0 ? (
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {commentsList.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                                <img
                                                    src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.profiles?.full_name}`}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3">
                                                <p className="text-xs font-bold text-text-main mb-1">{comment.profiles?.full_name}</p>
                                                <p className="text-sm text-text-secondary">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-text-secondary py-2">No comments yet. Be the first!</p>
                            )}

                            {/* Add Comment */}
                            <div className="flex gap-2 items-center pt-2">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim()}
                                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
