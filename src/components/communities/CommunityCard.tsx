import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Users, MapPin, Plus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface CommunityProps {
    id: string;
    name: string;
    description: string;
    members: number;
    image: string;
    category: string;
    location?: string;
    isMember?: boolean;
    currentUserId?: string;
}

export default function CommunityCard({ community }: { community: CommunityProps }) {
    const [isMember, setIsMember] = useState(community.isMember || false);
    const [memberCount, setMemberCount] = useState(community.members);
    const [loading, setLoading] = useState(false);

    const handleJoinLeave = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();

        if (!community.currentUserId) {
            alert("Please login to join communities");
            return;
        }

        setLoading(true);
        const newIsMember = !isMember;

        // Optimistic update
        setIsMember(newIsMember);
        setMemberCount((prev: number) => newIsMember ? prev + 1 : prev - 1);

        try {
            if (newIsMember) {
                const { error } = await supabase.from('community_members').insert({
                    community_id: community.id,
                    user_id: community.currentUserId
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('community_members').delete().match({
                    community_id: community.id,
                    user_id: community.currentUserId
                });
                if (error) throw error;
            }
        } catch (error) {
            console.error("Error toggling membership:", error);
            // Revert
            setIsMember(!newIsMember);
            setMemberCount((prev: number) => !newIsMember ? prev + 1 : prev - 1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Link href={`/communities/view?id=${community.id}`} className="block h-full">
            <GlassCard className="h-full flex flex-col p-0 group cursor-pointer relative overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Cover Image */}
                <div className="h-40 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
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

                    {/* Join Button (Absolute) */}
                    <button
                        onClick={handleJoinLeave}
                        disabled={loading}
                        className={`absolute top-3 right-3 z-30 p-2 rounded-full transition-all duration-300 ${isMember
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-white/20 backdrop-blur-md text-white hover:bg-primary"
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isMember ? (
                            <Check size={20} />
                        ) : (
                            <Plus size={20} />
                        )}
                    </button>
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
                            <span>{memberCount} members</span>
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
        </Link>
    );
}
