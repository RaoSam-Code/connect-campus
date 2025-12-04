"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { MessageCircle, Heart, Share2, MoreHorizontal } from "lucide-react";

interface PostProps {
    author: {
        name: string;
        avatar: string;
        time: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
}

export default function PostCard({ post }: { post: PostProps }) {
    return (
        <GlassCard className="mb-6 p-0 overflow-hidden group">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main text-sm">{post.author.name}</h3>
                        <p className="text-xs text-text-secondary">{post.author.time}</p>
                    </div>
                </div>
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
                    <button className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors group/like">
                        <div className="p-2 rounded-full group-hover/like:bg-primary/10 transition-colors">
                            <Heart size={20} className="group-hover/like:scale-110 transition-transform" />
                        </div>
                        <span className="text-sm font-medium">{post.likes}</span>
                    </button>

                    <button className="flex items-center gap-2 text-text-secondary hover:text-secondary transition-colors group/comment">
                        <div className="p-2 rounded-full group-hover/comment:bg-secondary/10 transition-colors">
                            <MessageCircle size={20} />
                        </div>
                        <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                </div>

                <button className="text-text-secondary hover:text-text-main transition-colors p-2 hover:bg-white/10 rounded-full">
                    <Share2 size={20} />
                </button>
            </div>
        </GlassCard>
    );
}
