import useSWR from 'swr'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/types/user'

export function useProfiles(currentUserId: string) {
  const key = currentUserId ? `/profiles/${currentUserId}` : null

  const fetcher = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('is_public', true)
      .neq('id', currentUserId)

    if (error) throw error
    return (data as Profile[]) || []
  }

  const { data, error } = useSWR<Profile[]>(key, fetcher)

  return {
    profiles: data,
    isLoading: !error && !data,
    isError: !!error,
  }
}
