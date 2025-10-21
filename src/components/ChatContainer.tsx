'use client'

import React, { useEffect, useRef, useState } from 'react'
import MessageItem, { Message } from '@/components/MessageItem'
import { supabase } from '@/lib/supabaseClient'
import {
  subscribeToTable,
  unsubscribeChannel,
} from '@/lib/realtime'
import styles from '@/styles/Chat.module.css'

interface Props {
  roomId: string
  isPrivate?: boolean
}

export default function ChatContainer({ roomId, isPrivate }: Props) {
  const [currentUserId, setCurrentUserId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const table = isPrivate ? 'private_messages' : 'messages'
  const userField = isPrivate ? 'sender_id' : 'user_id'
  const roomField = isPrivate ? 'chat_id' : 'room_id'

  // Load session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) {
        setCurrentUserId(data.session.user.id)
      }
    })
  }, [])

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(roomField, roomId)
        .order('created_at', { ascending: true })

      if (!error) {
        setMessages((data as Message[]) || [])
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    fetchMessages()
  }, [roomId])

  // Realtime: on INSERT
  useEffect(() => {
    const channel = subscribeToTable<Message>(
      {
        table,
        event: 'INSERT',
        filter: `${roomField}=eq.${roomId}`,
      },
      ({ new: newMsg }) => {
        if (!newMsg) return
        setMessages((prev) => [...prev, newMsg as Message])
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    )

    return () => unsubscribeChannel(channel)
  }, [roomId])

  // Polling every 2 seconds as backup or fallback
  useEffect(() => {
    const interval = setInterval(() => {
      supabase
        .from(table)
        .select('*')
        .eq(roomField, roomId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) {
            const latest = data as Message[]
            const lastPrevId = messages.at(-1)?.id
            const lastNewId = latest.at(-1)?.id
            if (lastNewId !== lastPrevId) {
              setMessages(latest)
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          }
        })
    }, 2000)

    return () => clearInterval(interval)
  }, [roomId, messages])

  // Send message
  const handleSend = async () => {
    const body = text.trim()
    if (!body || !currentUserId) return

    const { data: inserted, error } = await supabase
      .from(table)
      .insert({ [roomField]: roomId, [userField]: currentUserId, content: body })
      .select('*')
      .single()

    if (!error && inserted) {
      setMessages((prev) => [...prev, inserted as Message])
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    setText('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.messageList}>
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} currentUserId={currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className={styles.chatBox}>
        <input
          className={styles.input}
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}


// // src/components/ChatContainer.tsx   typing 
// 'use client'

// import React, { useEffect, useRef, useState } from 'react'
// import MessageItem, { Message } from '@/components/MessageItem'
// import { supabase } from '@/lib/supabaseClient'
// import {
//   subscribeToTable,
//   unsubscribeChannel,
// } from '@/lib/realtime'
// import styles from '@/styles/Chat.module.css'

// // simple debounce
// function debounce<T extends any[]>(fn: (...args: T) => void, ms: number) {
//   let timer: ReturnType<typeof setTimeout>
//   return (...args: T) => {
//     clearTimeout(timer)
//     timer = setTimeout(() => fn(...args), ms)
//   }
// }

// interface Props {
//   roomId: string
//   isPrivate?: boolean
// }

// export default function ChatContainer({ roomId, isPrivate }: Props) {
//   const [currentUserId, setCurrentUserId] = useState<string>('')
//   const [messages, setMessages] = useState<Message[]>([])
//   const [text, setText] = useState('')
//   const [typingUsers, setTypingUsers] = useState<string[]>([])
//   const bottomRef = useRef<HTMLDivElement>(null)
//   const presenceRef = useRef<any>(null)

//   // determine table/fields
//   const table = isPrivate ? 'private_messages' : 'messages'
//   const userField = isPrivate ? 'sender_id' : 'user_id'
//   const roomField = isPrivate ? 'chat_id' : 'room_id'

//   // 1️⃣ Load session
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       const uid = data.session?.user.id
//       if (uid) setCurrentUserId(uid)
//     })
//   }, [])

//   // 2️⃣ Load initial message history
//   useEffect(() => {
//     if (!currentUserId) return
//     supabase
//       .from(table)
//       .select('*')
//       .eq(roomField, roomId)
//       .order('created_at', { ascending: true })
//       .then(({ data }) => {
//         setMessages((data as Message[]) || [])
//         bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//       })
//   }, [roomId, currentUserId])

//   // 3️⃣ Realtime message INSERT listener
//   useEffect(() => {
//     if (!currentUserId) return
//     const channel = subscribeToTable<Message>(
//       {
//         table,
//         event: 'INSERT',
//         filter: `${roomField}=eq.${roomId}`,
//       },
//       ({ new: newMsg }) => {
//         if (newMsg) {
//           setMessages((prev) => [...prev, newMsg])
//           bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//         }
//       }
//     )
//     return () => unsubscribeChannel(channel)
//   }, [roomId, currentUserId])

//   // 4️⃣ Presence channel for typing status
//   useEffect(() => {
//     if (!currentUserId) return

//     const pres = supabase
//       .channel(`presence-${roomId}`, {
//         config: { presence: { key: currentUserId } },
//       })
//       .subscribe()

//     // sync existing state
//     pres.on('presence', { event: 'sync' }, () => {
//       const state = pres.presenceState() as Record<
//         string,
//         { typing?: boolean }[]
//       >
//       const othersTyping = Object.entries(state)
//         .filter(
//           ([key, metas]) =>
//             key !== currentUserId && metas.some((m) => m.typing)
//         )
//         .map(([key]) => key)
//       setTypingUsers(othersTyping)
//     })

//     // listen for join/leave as well
//     pres.on('presence', { event: 'join' }, () => {
//       pres.presenceState() // trigger a sync event
//     })
//     pres.on('presence', { event: 'leave' }, () => {
//       pres.presenceState()
//     })

//     presenceRef.current = pres
//     return () => unsubscribeChannel(pres)
//   }, [roomId, currentUserId])

//   // 5️⃣ Fallback polling every 2s
//   useEffect(() => {
//     if (!currentUserId) return
//     const iv = setInterval(async () => {
//       const { data } = await supabase
//         .from(table)
//         .select('*')
//         .eq(roomField, roomId)
//         .order('created_at', { ascending: true })
//       if (data) {
//         const latest = data as Message[]
//         const lastPrevId = messages.at(-1)?.id
//         const lastNewId = latest.at(-1)?.id
//         if (lastNewId !== lastPrevId) {
//           setMessages(latest)
//           bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//         }
//       }
//     }, 2000)
//     return () => clearInterval(iv)
//   }, [roomId, currentUserId, messages])

//   // 6️⃣ Handle input + broadcast typing
//   const broadcastTyping = debounce((typing: boolean) => {
//     presenceRef.current?.track({ typing })
//   }, 300)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setText(e.target.value)
//     broadcastTyping(true)
//   }

//   const handleSend = async () => {
//     if (!text.trim() || !currentUserId) return
//     // stop typing indicator
//     presenceRef.current?.track({ typing: false })

//     const { data: inserted, error } = await supabase
//       .from(table)
//       .insert({
//         [roomField]: roomId,
//         [userField]: currentUserId,
//         content: text.trim(),
//       })
//       .select('*')
//       .single()

//     if (!error && inserted) {
//       setMessages((prev) => [...prev, inserted as Message])
//       bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//     }
//     setText('')
//   }

//   return (
//     <div className={styles.container}>
//       <div className={styles.messageList}>
//         {messages.map((m) => (
//           <MessageItem
//             key={m.id}
//             message={m}
//             currentUserId={currentUserId}
//           />
//         ))}
//         <div ref={bottomRef} />

//         {/* Typing indicator */}
//         {typingUsers.length > 0 && (
//           <div className={styles.typing}>
//             {typingUsers.join(', ')} typing…
//           </div>
//         )}
//       </div>

//       <div className={styles.chatBox}>
//         <input
//           className={styles.input}
//           value={text}
//           onChange={handleChange}
//           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//           placeholder="Type a message…"
//         />
//         <button className={styles.sendButton} onClick={handleSend}>
//           Send
//         </button>
//       </div>
//     </div>
//   )
// }
