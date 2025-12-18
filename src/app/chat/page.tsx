"use client";

import { useEffect, useState, useRef } from "react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageBubble from "@/components/chat/MessageBubble";
import UserSearchModal from "@/components/chat/UserSearchModal";
import GlassCard from "@/components/ui/GlassCard";
import { Send, Paperclip, MoreVertical, Phone, Video, Menu, ArrowLeft, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

export default function ChatPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlRoomId = searchParams.get('id');

    // Init User
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, []);

    // Use new hook
    const {
        rooms,
        messages,
        selectedRoomId,
        setSelectedRoomId,
        loadingRooms,
        sendMessage,
        createDMRoom,
        error
    } = useChat(currentUser?.id);

    // Sync state with URL
    useEffect(() => {
        if (urlRoomId && urlRoomId !== selectedRoomId) {
            setSelectedRoomId(urlRoomId);
        } else if (!urlRoomId && selectedRoomId) {
            setSelectedRoomId(null);
        }
    }, [urlRoomId, selectedRoomId, setSelectedRoomId]);

    const handleRoomSelect = (id: string | null) => {
        if (id) {
            router.push(`/chat?id=${id}`);
        } else {
            router.push('/chat');
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Define handlers BEFORE ChatContent so they can be used
    const handleSend = async () => {
        if (!messageText.trim()) return;
        const text = messageText;
        setMessageText(""); // Clear first for speed
        await sendMessage(text);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await sendMessage("", file);
        }
    };

    const handleSelectUser = async (otherUserId: string) => {
        const roomId = await createDMRoom(otherUserId);
        if (roomId) {
            handleRoomSelect(roomId);
        }
        setIsSearchOpen(false);
    };

    // Use a portal to render the full-screen chat on mobile to bypass layout constraints
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const ChatContent = (
        <GlassCard
            className={cn(
                "flex-1 flex flex-col p-0 h-full overflow-hidden transition-all duration-300 shadow-none border-none border-white/10",
                // Mobile Full-screen Reimagined:
                // When a room is selected on mobile, we use a portal so these classes might be redundant but kept for safety
                selectedRoomId ? "fixed inset-0 z-[100] rounded-none bg-white" : "hidden md:flex md:relative md:z-auto md:rounded-2xl md:bg-surface/70 md:border md:border-white/20 md:shadow-glass"
            )}
        >
            {selectedRoomId ? (
                <>
                    {/* Chat Header - Fixed at top */}
                    <div className="flex-shrink-0 p-3 md:p-4 border-b border-black/5 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => handleRoomSelect(null)}
                                className="p-1.5 -ml-1 hover:bg-black/5 rounded-full transition-colors text-text-secondary"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {(() => {
                                    const room = rooms.find(r => r.id === selectedRoomId);
                                    return (
                                        <img
                                            src={room?.image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedRoomId}`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    );
                                })()}
                            </div>
                            <div className="min-w-0 text-left">
                                <h2 className="font-bold text-text-main text-sm md:text-base truncate leading-tight">
                                    {rooms.find(r => r.id === selectedRoomId)?.name || "Chat"}
                                </h2>
                                <p className="text-[10px] md:text-xs text-green-500 font-medium tracking-wide">online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 text-text-secondary">
                            <button className="p-2 hover:bg-black/5 rounded-full transition-colors"><Phone size={20} className="md:w-5 md:h-5" /></button>
                            <button className="p-2 hover:bg-black/5 rounded-full transition-colors"><Video size={20} className="md:w-5 md:h-5" /></button>
                            <button className="p-2 hover:bg-black/5 rounded-full transition-colors"><MoreVertical size={20} className="md:w-5 md:h-5" /></button>
                        </div>
                    </div>

                    {/* Messages Area - Scrollable middle, messages pushed to bottom */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col custom-scrollbar bg-[#F2F2F7]">
                        {/* Spacer to push messages to bottom if there are few */}
                        <div className="flex-1" />

                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={{
                                    content: msg.content,
                                    isOwn: currentUser?.id === msg.user_id,
                                    time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    sender: msg.profiles?.full_name,
                                    image: msg.image_url
                                }}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area - Fixed at bottom */}
                    <div className="flex-shrink-0 p-3 md:p-4 bg-white/80 backdrop-blur-md border-t border-black/5 pb-safe">
                        <div className="flex items-center gap-2 bg-black/5 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-black/5 hidden md:block"
                            >
                                <Paperclip size={20} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*"
                            />
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none outline-none text-text-main placeholder-text-muted px-2 text-sm md:text-base"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!messageText.trim()}
                                className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale cursor-pointer"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/30 backdrop-blur-xl">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <MessageSquare size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-text-main mb-2">Select a Conversation</h2>
                    <p className="text-text-secondary max-w-md">
                        Choose a chat from the sidebar or start a new one to begin messaging.
                    </p>
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="mt-6 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                    >
                        Start New Chat
                    </button>
                </div>
            )}
        </GlassCard>
    );

    return (
        <main className="h-[calc(100vh-8rem)] md:h-[calc(100vh-2rem)] flex gap-6 relative overflow-hidden">
            <AnimatedBackground />

            {/* User Search Modal */}
            <UserSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectUser={handleSelectUser}
                currentUserId={currentUser?.id}
            />

            {/* Sidebar - Hidden on mobile if a room is selected */}
            <div className={cn(
                "w-full md:w-80 flex-shrink-0 h-full",
                selectedRoomId && "hidden md:block"
            )}>
                <ChatSidebar
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    loading={loadingRooms}
                    error={error}
                    onSelectRoom={handleRoomSelect}
                    onNewChat={() => setIsSearchOpen(true)}
                />
            </div>

            {/* Chat Window - Render directly or via Portal on mobile */}
            {mounted && selectedRoomId && typeof window !== 'undefined' && window.innerWidth < 768 ? (
                // On mobile, render the full-screen chat window in a Portal to document.body
                // This bypasses the pb-24 padding and transform constraints of the layout
                createPortal(
                    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden">
                        {ChatContent}
                    </div>,
                    document.body
                )
            ) : (
                // On desktop or when no room is selected, render normally
                ChatContent
            )}
        </main>
    );
}
