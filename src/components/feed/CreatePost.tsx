"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Image, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CreatePostProps {
  onPostCreated?: () => void;
  communityId?: string;
}

export default function CreatePost({ onPostCreated, communityId }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !imageFile) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('posts').insert({
        content,
        user_id: user.id,
        image_url: imageUrl,
        community_id: communityId || null
      });

      if (error) throw error;

      setContent("");
      setImageFile(null);
      setImagePreview(null);
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
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

          {imagePreview && (
            <div className="relative mt-2 mb-2 w-full h-48 rounded-xl overflow-hidden group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
            <label className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-primary/5 cursor-pointer">
              <Image size={20} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
            <button
              onClick={handlePost}
              disabled={loading || (!content.trim() && !imageFile)}
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
