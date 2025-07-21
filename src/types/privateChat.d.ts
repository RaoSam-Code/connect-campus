export interface PrivateChat {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
}
export interface PrivateMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}
