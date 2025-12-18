"use client";

import { useEffect, useState, useRef } from "react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageBubble from "@/components/chat/MessageBubble";
import UserSearchModal from "@/components/chat/UserSearchModal";
import GlassCard from "@/components/ui/GlassCard";
import { Send, Paperclip, MoreVertical, Phone, Video, Menu, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [messageText, setMessageText] = useState("");

    // Use new hook
    const {
        rooms,
        messages,
        selectedRoomId,
        setSelectedRoomId,
        loadingRooms,
        loadingMessages, // Could use for loading skeletons
        sendMessage,
        createDMRoom,
        error
    } = useChat(currentUser?.id);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Init User
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        getUser();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!messageText.trim()) return;

        await sendMessage(messageText);
        setMessageText(""); // Clear input
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await sendMessage("", 'image', e.target.files[0]);
        }
    };

    const handleSelectUser = (otherUserId: string) => {
        createDMRoom(otherUserId);
        setIsSearchOpen(false);
        setIsSidebarOpen(false); // Close sidebar on mobile
    };

    return (
        <main className="h-screen p-4 md:p-6 relative overflow-hidden flex gap-6">
            <AnimatedBackground />

            {/* User Search Modal */}
            <UserSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectUser={handleSelectUser}
                currentUserId={currentUser?.id}
            />

            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-80 lg:w-96 flex-shrink-0 h-full absolute md:relative z-20 md:z-auto bg-black/90 md:bg-transparent`}>
                <ChatSidebar
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    loading={loadingRooms}
                    error={error}
                    onSelectRoom={(id) => {
                        setSelectedRoomId(id);
                        setIsSidebarOpen(false);
                    }}
                    onNewChat={() => setIsSearchOpen(true)}
                />
            </div>

            {/* Chat Window */}
            <GlassCard className={`flex-1 flex flex-col p-0 h-full overflow-hidden ${!selectedRoomId && 'hidden md:flex'}`}>
                {selectedRoomId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between bg-white/30 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-text-secondary">
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden">
                                    {/* Dynamically find the selected room image/name */}
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
                                <div>
                                    <h2 className="font-bold text-text-main text-sm md:text-base">
                                        {rooms.find(r => r.id === selectedRoomId)?.name || "Chat"}
                                    </h2>
                                    <p className="text-xs text-text-secondary">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-text-secondary">
                                <button className="p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-colors"><Phone size={18} className="md:w-5 md:h-5" /></button>
                                <button className="p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-colors"><Video size={18} className="md:w-5 md:h-5" /></button>
                                <button className="p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-colors"><MoreVertical size={18} className="md:w-5 md:h-5" /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
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

                        {/* Input Area */}
                        <div className="p-3 md:p-4 bg-white/30 backdrop-blur-md border-t border-white/10">
                            <div className="flex items-center gap-2 bg-white/60 rounded-2xl p-2 border border-white/20 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-white/50 hidden md:block"
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
                                    className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 text-text-secondary">
                            <Menu size={40} />
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
        </main>
    );
}
