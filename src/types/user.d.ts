export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  is_public: boolean
  created_at: string
}

export interface Room {
  id: string
  name: string
  is_public: boolean
  created_at: string
}
