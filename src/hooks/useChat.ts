import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Room {
    id: string;
    name?: string;
    is_group: boolean;
    image_url?: string;
    updated_at: string;
    last_message?: {
        content: string;
        sender: string;
        time: string;
    };
    participants?: any[];
}

export interface Message {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    image_url?: string;
    room_id: string;
    profiles?: {
        full_name: string;
        avatar_url?: string;
    };
    sender?: string; // Derived for UI
}

export function useChat(currentUserId: string | undefined) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Refs for realtime subscriptions to avoid stale closures
    const selectedRoomIdRef = useRef(selectedRoomId);

    useEffect(() => {
        selectedRoomIdRef.current = selectedRoomId;
        if (selectedRoomId) {
            fetchMessages(selectedRoomId);
        } else {
            setMessages([]);
        }
    }, [selectedRoomId]);

    // 1. Fetch Rooms (ordered by updated_at)
    const fetchRooms = useCallback(async () => {
        if (!currentUserId) return;
        setLoadingRooms(true);
        try {
            // Get rooms user is participant in OR General
            const { data: participations, error: partError } = await supabase
                .from('room_participants')
                .select('room_id')
                .eq('user_id', currentUserId);

            if (partError) throw partError;

            const roomIds = participations?.map(p => p.room_id) || [];

            // Always include General
            if (!roomIds.includes('00000000-0000-0000-0000-000000000000')) {
                roomIds.push('00000000-0000-0000-0000-000000000000');
            }

            const { data: roomsData, error: roomsError } = await supabase
                .from('chat_rooms')
                .select('*')
                .in('id', roomIds)
                .order('updated_at', { ascending: false });

            if (roomsError) throw roomsError;

            let fetchedRooms = roomsData || [];

            // Self-healing: If General room missing, create it
            const hasGeneral = fetchedRooms.some(r => r.id === '00000000-0000-0000-0000-000000000000');
            if (!hasGeneral) {
                console.log("General room missing, attempting to create...");
                const { data: newGeneral, error: createError } = await supabase
                    .from('chat_rooms')
                    .insert({
                        id: '00000000-0000-0000-0000-000000000000',
                        name: 'General',
                        is_group: true,
                        created_by: currentUserId
                    })
                    .select()
                    .single();

                if (!createError && newGeneral) {
                    fetchedRooms.push(newGeneral);
                } else {
                    console.error("Failed to auto-create General room:", createError);
                }
            }

            // Enrich DMs with other user's info
            const enrichedRooms = await Promise.all(fetchedRooms.map(async (room) => {
                if (!room.is_group) {
                    const { data: otherPart } = await supabase
                        .from('room_participants')
                        .select('profiles(full_name, avatar_url)')
                        .eq('room_id', room.id)
                        .neq('user_id', currentUserId)
                        .single();

                    if (otherPart?.profiles) {
                        const profile = Array.isArray(otherPart.profiles) ? otherPart.profiles[0] : otherPart.profiles;
                        return {
                            ...room,
                            name: profile.full_name,
                            image_url: profile.avatar_url
                        };
                    }
                }
                return room;
            }));

            setRooms(enrichedRooms);

        } catch (error: any) {
            console.error('Error fetching rooms:', error);
            setError(error.message || "Failed to load chats");
        } finally {
            setLoadingRooms(false);
        }
    }, [currentUserId]);

    // 2. Fetch Messages
    const fetchMessages = async (roomId: string) => {
        setLoadingMessages(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*, profiles(full_name, avatar_url)')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true }); // Oldest first for chat history

            if (error) throw error;
            setMessages(data || []);

            // Auto-join if General (idempotent)
            if (roomId === '00000000-0000-0000-0000-000000000000' && currentUserId) {
                await supabase.from('room_participants').upsert({
                    room_id: roomId,
                    user_id: currentUserId
                }, { onConflict: 'room_id,user_id' });
            }

        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // 3. Send Message
    const sendMessage = async (content: string, type: 'text' | 'image' = 'text', file?: File) => {
        if (!currentUserId || !selectedRoomId) return;

        let imageUrl = null;

        // Upload Image if present
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUserId}-${Math.random()}.${fileExt}`;
            try {
                const { error: uploadError } = await supabase.storage
                    .from('chat-attachments') // Ensure this bucket exists
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chat-attachments')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            } catch (error) {
                console.error("Upload failed", error);
                alert("Failed to upload image.");
                return;
            }
        } else if (type === 'image' && content.startsWith('http')) {
            imageUrl = content; // Direct URL passed
        }

        try {
            const { error } = await supabase.from('messages').insert({
                room_id: selectedRoomId,
                user_id: currentUserId,
                content: type === 'text' ? content : '[Image]',
                image_url: imageUrl
            });

            if (error) throw error;
            // Optimistic update handled by Subscription usually, but we can do it here too if needed
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // 4. Create/Get DM Room
    const createDMRoom = async (otherUserId: string) => {
        if (!currentUserId) return;
        try {
            const { data: roomId, error } = await supabase.rpc('create_dm_room', {
                other_user_id: otherUserId
            });

            if (error) throw error;
            if (roomId) {
                await fetchRooms();
                return roomId;
            }
        } catch (error) {
            console.error("Error creating DM:", error);
        }
        return null;
    };

    // 5. Setup Realtime Subscriptions
    useEffect(() => {
        if (!currentUserId) return;

        // A. Listen for ANY messages - to update Room List last_message
        const globalMessagesChannel = supabase
            .channel('global_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, () => {
                fetchRooms(); // Refresh sidebar order
            })
            .subscribe();

        // B. Listen for messages in Selected Room - to update Chat Window
        let roomChannel: any = null;
        if (selectedRoomId) {
            console.log("Subscribing to room:", selectedRoomId);
            roomChannel = supabase
                .channel(`room:${selectedRoomId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${selectedRoomId}`
                }, async (payload) => {
                    console.log("New message received:", payload);
                    // Fetch full message with profile (now fixed by SQL script)
                    const { data: newMsg, error } = await supabase
                        .from('messages')
                        .select('*, profiles(full_name, avatar_url)')
                        .eq('id', payload.new.id)
                        .single();

                    if (error) {
                        console.error("Error fetching new message details:", error);
                        return;
                    }

                    if (newMsg) {
                        setMessages(prev => {
                            // Prevent duplicates
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            const updated = [...prev, newMsg];
                            // Sort to ensure order (though usually correct)
                            return updated.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                        });
                    }
                })
                .subscribe((status) => {
                    console.log(`Room subscription status: ${status}`);
                });
        }

        return () => {
            supabase.removeChannel(globalMessagesChannel);
            if (roomChannel) supabase.removeChannel(roomChannel);
        };
    }, [currentUserId, selectedRoomId, fetchRooms]);

    // Initial Fetch
    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const [error, setError] = useState<string | null>(null);

    // ... (inside fetchRooms)
    // catch (error: any) {
    //  console.error('Error fetching rooms:', error);
    //  setError(error.message || "Failed to load rooms");
    // }

    return {
        rooms,
        messages,
        selectedRoomId,
        setSelectedRoomId,
        loadingRooms,
        loadingMessages,
        sendMessage,
        createDMRoom,
        refreshRooms: fetchRooms,
        error // Expose error
    };
}
