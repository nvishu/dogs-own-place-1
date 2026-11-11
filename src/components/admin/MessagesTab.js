'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { apiAdminMessages, apiAdminSetMessageStatus, apiAdminDeleteMessage } from '@/lib/apiClient'

export default function MessagesTab() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    apiAdminMessages().then((d) => setMessages(d.messages || [])).catch((e) => toast.error(e.message)).finally(() => setLoading(false))
  }, [])

  const toggle = async (m) => {
    const next = m.status === 'new' ? 'read' : 'new'
    try {
      await apiAdminSetMessageStatus(m._id, next)
      setMessages((list) => list.map((x) => (x._id === m._id ? { ...x, status: next } : x)))
    } catch (e) { toast.error(e.message) }
  }
  const open = (m) => {
    setOpenId(openId === m._id ? null : m._id)
    if (m.status === 'new') toggle(m)
  }
  const remove = async (m) => {
    if (!confirm('Delete this message permanently?')) return
    try {
      await apiAdminDeleteMessage(m._id)
      setMessages((list) => list.filter((x) => x._id !== m._id))
      toast.success('Message deleted')
    } catch (e) { toast.error(e.message) }
  }

  if (loading) return <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-20" />)}</div>
  if (!messages.length) return <div className="card text-center py-14 text-gray-400"><div className="text-5xl mb-3">📭</div>No messages yet.</div>

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m._id} className={`card !p-0 overflow-hidden ${m.status === 'new' ? 'border-brand-primary/40' : ''}`}>
          <button onClick={() => open(m)} className="w-full text-left p-4 sm:p-5 flex items-start gap-3">
            <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${m.status === 'new' ? 'bg-brand-primary animate-pulse' : 'bg-gray-300'}`} />
            <span className="flex-1 min-w-0">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-bold text-brand-dark">{m.name}</span>
                <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</span>
              </span>
              <span className="block text-sm font-semibold text-brand-primary truncate">{m.subject || 'No subject'}</span>
              <span className="block text-sm text-gray-500 truncate">{m.message}</span>
            </span>
          </button>
          {openId === m._id && (
            <div className="px-5 pb-5 pt-1 border-t border-orange-50 animate-fade-in">
              <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed mb-4">{m.message}</p>
              <div className="text-sm text-gray-500 mb-4">📧 {m.email}{m.phone ? ` · 📞 ${m.phone}` : ''}</div>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your enquiry'))}`} className="btn-primary btn-sm">Reply by email</a>
                {m.phone && <a href={`tel:${m.phone}`} className="btn-secondary btn-sm">Call</a>}
                <button onClick={() => toggle(m)} className="btn-ghost btn-sm">Mark {m.status === 'new' ? 'read' : 'unread'}</button>
                <button onClick={() => remove(m)} className="btn-ghost btn-sm text-red-600 hover:!bg-red-50">Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
