"use client";

import { useEffect, useState, useRef } from "react";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageBubble from "@/components/chat/MessageBubble";
import GlassCard from "@/components/ui/GlassCard";
import { Send, Paperclip, MoreVertical, Phone, Video } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ChatPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Hardcoded room ID for demo purposes. In a real app, this would come from the URL or state.
    // We'll create a default room if it doesn't exist or just use a fixed UUID for the "General" chat.
    const ROOM_ID = "00000000-0000-0000-0000-000000000000";

    useEffect(() => {
        const initChat = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            // Fetch existing messages
            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          profiles (
            full_name
          )
        `)
                .eq('room_id', ROOM_ID) // We need to make sure this room exists or handle it
                .order('created_at', { ascending: true });

            if (data) setMessages(data);

            // Subscribe to new messages
            const channel = supabase
                .channel(`room:${ROOM_ID}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${ROOM_ID}`
                }, async (payload) => {
                    console.log("Realtime event received:", payload);
                    // Fetch the new message details including profile
                    const { data: newMsg } = await supabase
                        .from('messages')
                        .select('*, profiles(full_name)')
                        .eq('id', payload.new.id)
                        .single();

                    if (newMsg) {
                        // Prevent duplicate if we already have it (from optimistic update)
                        setMessages(prev => {
                            if (prev.some(msg => msg.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                })
                .subscribe((status) => {
                    console.log("Subscription status:", status);
                });

            return () => {
                supabase.removeChannel(channel);
            };
        };

        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;

        const tempId = crypto.randomUUID();
        const msgContent = newMessage;
        setNewMessage("");

        // Optimistic update
        const optimisticMsg = {
            id: tempId,
            content: msgContent,
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            profiles: {
                full_name: currentUser.user_metadata?.full_name || "You"
            }
        };

        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const { error } = await supabase.from('messages').insert({
                room_id: ROOM_ID,
                user_id: currentUser.id,
                content: msgContent,
            });

            if (error) {
                console.error("Error sending message:", error);
                // Rollback if error (remove the optimistic message)
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
                setNewMessage(msgContent); // Restore input
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setNewMessage(msgContent);
        }
    };

    return (
        <main className="h-screen p-4 md:p-6 relative overflow-hidden flex gap-6">
            <AnimatedBackground />

            {/* Sidebar - Hidden on mobile if chat is open (simplified for now) */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 h-full hidden md:block">
                <ChatSidebar />
            </div>

            {/* Chat Window */}
            <GlassCard className="flex-1 flex flex-col p-0 h-full overflow-hidden">
                {/* Chat Header */}
                <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between bg-white/30 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=General" alt="Group" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="font-bold text-text-main text-sm md:text-base">General Chat</h2>
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
                                sender: msg.profiles?.full_name
                            }}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 md:p-4 bg-white/30 backdrop-blur-md border-t border-white/10">
                    <div className="flex items-center gap-2 bg-white/60 rounded-2xl p-2 border border-white/20 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <button className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-white/50 hidden md:block">
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none text-text-main placeholder-text-muted px-2 text-sm md:text-base"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </GlassCard>
        </main>
    );
}
