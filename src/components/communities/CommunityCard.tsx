"use client";

import GlassCard from "@/components/ui/GlassCard";
import { Users, MapPin } from "lucide-react";

interface CommunityProps {
    name: string;
    description: string;
    members: number;
    image: string;
    category: string;
    location?: string;
}

export default function CommunityCard({ community }: { community: CommunityProps }) {
    return (
        <GlassCard className="h-full flex flex-col p-0 group cursor-pointer">
            {/* Cover Image */}
            <div className="h-40 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img
                    src={community.image}
                    alt={community.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-3 left-4 z-20">
                    <span className="px-2 py-1 bg-primary/90 text-white text-xs font-bold rounded-md uppercase tracking-wide">
                        {community.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
                    {community.name}
                </h3>
                <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-1">
                    {community.description}
                </p>

                <div className="flex items-center justify-between text-sm text-text-secondary mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{community.members} members</span>
                    </div>
                    {community.location && (
                        <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{community.location}</span>
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
