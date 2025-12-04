"use client";

import GlassCard from "@/components/ui/GlassCard";
import { Search } from "lucide-react";

const CONVERSATIONS = [
    {
        id: 1,
        name: "CS101 Study Group",
        lastMessage: "Does anyone have the notes?",
        time: "2m",
        unread: 3,
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=CS101",
        isGroup: true,
    },
    {
        id: 2,
        name: "Sarah Jenkins",
        lastMessage: "See you at the library!",
        time: "1h",
        unread: 0,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        isGroup: false,
    },
    {
        id: 3,
        name: "Photography Club",
        lastMessage: "Photo walk this Saturday 📸",
        time: "3h",
        unread: 12,
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=Photo",
        isGroup: true,
    },
    {
        id: 4,
        name: "Mike Chen",
        lastMessage: "Thanks for the help!",
        time: "1d",
        unread: 0,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        isGroup: false,
    },
];

export default function ChatSidebar() {
    return (
        <GlassCard className="h-full flex flex-col p-0 border-r border-white/20 rounded-r-none">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-primary mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/50 border border-white/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {CONVERSATIONS.map((chat) => (
                    <div
                        key={chat.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 cursor-pointer transition-colors group"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                            </div>
                            {chat.unread > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-text-main text-sm truncate">{chat.name}</h3>
                                <span className="text-xs text-text-secondary">{chat.time}</span>
                            </div>
                            <p className="text-xs text-text-secondary truncate group-hover:text-text-main transition-colors">
                                {chat.lastMessage}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
