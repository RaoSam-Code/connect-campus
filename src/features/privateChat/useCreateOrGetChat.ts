import { supabase } from '@/lib/supabaseClient'

export async function getOrCreatePrivateChat(
  userA: string,
  userB: string
): Promise<string> {
  const { data: existing } = await supabase
    .from('private_chats')
    .select('id')
    .or(
      `and(user1_id.eq.${userA},user2_id.eq.${userB}),` +
      `and(user1_id.eq.${userB},user2_id.eq.${userA})`
    )
    .single()
  if (existing?.id) return existing.id

  const { data: inserted, error } = await supabase
    .from('private_chats')
    .insert({ user1_id: userA, user2_id: userB })
    .select('id')
    .single()

  if (error || !inserted?.id) throw error || new Error('Chat creation failed')
  return inserted.id
}
