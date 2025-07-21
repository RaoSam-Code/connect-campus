import { supabase } from '@/lib/supabaseClient'
import type { Message } from '@/types/chat'

export async function sendMessage(
  roomId: string,
  userId: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')      // no generics here
    .insert({ room_id: roomId, user_id: userId, content })
    .select('*')
    .single()

  if (error) throw error
  return data as Message
}
