"use client";

import { useState, useEffect } from "react";
import { Search, X, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GlassCard from "@/components/ui/GlassCard";

interface UserSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (userId: string) => void;
    currentUserId: string;
}

export default function UserSearchModal({ isOpen, onClose, onSelectUser, currentUserId }: UserSearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim() || !currentUserId) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .ilike('full_name', `%${query}%`)
                    .neq('id', currentUserId) // Don't show self
                    .limit(5);

                if (error) throw error;
                setResults(data || []);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [query, currentUserId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <GlassCard className="w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-text-main mb-4">New Message</h2>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for people..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-text-main placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        autoFocus
                    />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    ) : results.length > 0 ? (
                        results.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => onSelectUser(user.id)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface border border-white/10">
                                    <img
                                        src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`}
                                        alt={user.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-text-main font-medium group-hover:text-primary transition-colors">{user.full_name}</p>
                                    <p className="text-xs text-text-secondary">@{user.full_name.toLowerCase().replace(/\s/g, '')}</p>
                                </div>
                            </button>
                        ))
                    ) : query ? (
                        <p className="text-center text-text-secondary py-4">No users found.</p>
                    ) : (
                        <p className="text-center text-text-muted py-4 text-sm">Type to search for friends</p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
