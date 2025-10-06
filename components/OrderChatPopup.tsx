"use client"
import React, { useEffect, useRef, useState } from 'react'
import { OrderMessage } from '@/types'

interface OrderChatPopupProps {
  orderId: number
  open: boolean
  onClose: () => void
  userEmail?: string | null
}

export const OrderChatPopup: React.FC<OrderChatPopupProps> = ({ orderId, open, onClose, userEmail }) => {
  const [messages, setMessages] = useState<OrderMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    let abort = false
    const fetchMessages = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/order-messages?orderId=${orderId}`, {
          headers: userEmail ? { 'x-user-email': userEmail } : undefined
        })
        const json = await res.json()
        if (!abort && json.messages) {
          setMessages(json.messages)
        }
      } catch (e) {
        console.error('fetch messages failed', e)
      } finally {
        if (!abort) setLoading(false)
      }
    }
    fetchMessages()
  }, [orderId, open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async () => {
    if (!input.trim()) return
    const optimistic: OrderMessage = {
      id: 'temp-' + Date.now(),
      order_id: orderId,
      sender_role: 'user', // role corrected by server for admins
      sender_email: null,
      message: input.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(m => [...m, optimistic])
    setInput('')
    setSending(true)
    try {
      const res = await fetch('/api/order-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userEmail ? { 'x-user-email': userEmail } : {}) },
        body: JSON.stringify({ orderId, message: optimistic.message }),
      })
      const json = await res.json()
      if (json.message) {
        setMessages(m => m.map(msg => msg.id === optimistic.id ? json.message : msg))
      } else if (json.error) {
        // revert optimistic
        setMessages(m => m.filter(msg => msg.id !== optimistic.id))
        alert(json.error)
      }
    } catch (e) {
      console.error(e)
      setMessages(m => m.filter(msg => msg.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md h-[520px] rounded-lg shadow-lg flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Order #{orderId} Chat</h2>
          <button onClick={onClose} className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
          {loading && <div className="text-neutral-500 text-xs">Loading...</div>}
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.sender_role === 'admin' ? 'items-start' : 'items-end'}`}>
              <div className={`rounded-md px-3 py-2 max-w-[80%] whitespace-pre-wrap text-xs leading-relaxed ${m.sender_role === 'admin' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' : 'bg-blue-600 text-white'}`}>
                {m.message}
              </div>
              <span className="mt-1 text-[10px] text-neutral-400">{new Date(m.created_at).toLocaleString()}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-col gap-2">
          <textarea
            className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
            placeholder="Type your message..."
            value={input}
            maxLength={500}
            onChange={e => setInput(e.target.value)}
          />
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span>{input.length}/500</span>
            <button
              disabled={!input.trim() || sending}
              onClick={sendMessage}
              className="px-3 py-1 rounded bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs hover:bg-blue-500"
            >Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
