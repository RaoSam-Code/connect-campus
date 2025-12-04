
"use client"

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Image, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('posts').insert({
        content,
        user_id: user.id,
      });

      if (error) throw error;

      setContent("");
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="mb-8 p-4">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening on campus?"
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-text-main placeholder-text-muted min-h-[80px]"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <button className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary/5">
              <Image size={20} />
            </button>
            <button
              onClick={handlePost}
              disabled={loading || !content.trim()}
              className="px-4 py-2 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Posting..." : "Post"}</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

