"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { MapPin, GraduationCap, Calendar, Edit2 } from "lucide-react";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
    profile: any;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const router = useRouter();

    if (!profile) return null;

    return (
        <div className="relative mb-8">
            {/* Cover Image (Placeholder for now) */}
            <div className="h-48 md:h-64 rounded-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 mix-blend-multiply" />
                <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Profile Info Card */}
            <div className="px-4 md:px-8 -mt-20 relative z-10">
                <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-surface"
                    >
                        <img
                            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`}
                            alt={profile.full_name}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Info */}
                    <div className="flex-1 space-y-2 mb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-text-main">{profile.full_name}</h1>
                                <p className="text-text-secondary">@{profile.email?.split('@')[0]}</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-text-main transition-colors border border-white/10 backdrop-blur-md"
                            >
                                <Edit2 size={16} />
                                <span>Edit Profile</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-4 text-text-secondary text-sm mt-4">
                            {profile.university && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{profile.university}</span>
                                </div>
                            )}
                            {profile.major && (
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap size={16} className="text-secondary" />
                                    <span>{profile.major} • {profile.year}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Calendar size={16} className="text-accent" />
                                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Interests Tags */}
                        {profile.interests && profile.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                                {profile.interests.map((interest: string, index: number) => (
                                    <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={profile}
                onUpdate={() => window.location.reload()} // Simple reload to refresh data for now
            />
        </div>
    );
}
