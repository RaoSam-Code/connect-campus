import { Plus, MessageSquare, Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { Room } from "@/hooks/useChat";

interface ChatSidebarProps {
    rooms: Room[];
    selectedRoomId: string | null;
    onSelectRoom: (roomId: string) => void;
    onNewChat: () => void;
    loading: boolean;
    error?: string | null;
}

export default function ChatSidebar({ rooms, selectedRoomId, onSelectRoom, onNewChat, loading, error }: ChatSidebarProps) {

    // Format time for sidebar (e.g. "10:30 AM" or "Yesterday")
    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-r border-white/10 rounded-none md:rounded-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-lg font-bold text-text-main">Messages</h2>
                <button
                    onClick={onNewChat}
                    className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary hover:text-white transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-400 bg-red-400/10 rounded-xl m-2">
                        <p className="text-sm font-medium mb-1">Error loading chats</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                ) : rooms.length > 0 ? (
                    rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => onSelectRoom(room.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedRoomId === room.id
                                ? "bg-primary/20 border border-primary/30"
                                : "hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface border border-white/10 flex-shrink-0 relative">
                                <img
                                    src={room.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${room.name || 'Group'}`}
                                    alt={room.name || "Chat"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-semibold truncate ${selectedRoomId === room.id ? "text-primary" : "text-text-main"}`}>
                                        {room.name || "Group Chat"}
                                    </h3>
                                    <span className="text-[10px] text-text-secondary">
                                        {formatTime(room.last_message?.time || room.updated_at)}
                                    </span>
                                </div>
                                <p className="text-xs text-text-secondary truncate group-hover:text-text-main transition-colors">
                                    {room.last_message ? (
                                        <>
                                            <span className="font-medium text-text-main/80">{room.last_message.sender === "You" ? "You: " : `${room.last_message.sender}: `}</span>
                                            {room.last_message.content}
                                        </>
                                    ) : (
                                        "No messages yet"
                                    )}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-text-secondary">
                            <MessageSquare size={24} />
                        </div>
                        <p className="text-text-main font-medium">No messages yet</p>
                        <p className="text-xs text-text-secondary mt-1">Start a conversation with a friend!</p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
