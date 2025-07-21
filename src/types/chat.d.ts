export interface Message {
  id: string
  content: string
  room_id?: string
  user_id?: string
  chat_id?: string
  sender_id?: string
  created_at: string
}
