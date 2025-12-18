"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import GlassCard from "@/components/ui/GlassCard";
import { ArrowLeft, Camera, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CreateListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        description: "",
        condition: "Good",
    });

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.price || !imageFile) {
            alert("Please fill in all required fields and upload an image.");
            return;
        }

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Upload Image
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('post-images') // Reusing post-images bucket for now
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('post-images')
                .getPublicUrl(fileName);

            // 2. Insert Item
            const { error: insertError } = await supabase
                .from('market_items')
                .insert({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    condition: formData.condition,
                    image_url: publicUrl,
                    seller_id: user.id,
                    status: 'available'
                });

            if (insertError) throw insertError;

            router.push('/marketplace');
            router.refresh();
        } catch (error) {
            console.error("Error creating listing:", error);
            alert("Failed to create listing. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 relative flex items-center justify-center">
            <AnimatedBackground />

            <div className="w-full max-w-2xl relative z-10">
                <Link href="/marketplace" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back to Marketplace</span>
                </Link>

                <GlassCard className="p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-text-main mb-6">Sell an Item</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-64 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group relative overflow-hidden"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors mb-4">
                                        <Camera size={32} className="text-text-secondary group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-text-secondary font-medium">Click to upload photo</p>
                                    <p className="text-text-muted text-sm mt-1">JPG, PNG up to 5MB</p>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all"
                                    placeholder="What are you selling?"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Price ($)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Condition</label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all appearance-none"
                            >
                                <option value="New" className="bg-surface text-black">New</option>
                                <option value="Like New" className="bg-surface text-black">Like New</option>
                                <option value="Good" className="bg-surface text-black">Good</option>
                                <option value="Fair" className="bg-surface text-black">Fair</option>
                                <option value="Poor" className="bg-surface text-black">Poor</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-main transition-all resize-none h-32"
                                placeholder="Describe your item..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Listing Item...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    <span>List Item</span>
                                </>
                            )}
                        </button>
                    </form>
                </GlassCard>
            </div>
        </main>
    );
}
