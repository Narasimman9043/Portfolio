import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getMessages, markRead, deleteMessage } from '../services/contactService'
import { ConfirmDialog } from '../components/ui'

export default function AdminMessages({ onClose }) {
  const [messages,     setMessages]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setMessages(await getMessages()) }
    catch (err) { toast.error(err.message || 'Failed to load messages.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      setMessages(m => m.map(x => x.id === id ? { ...x, is_read: true } : x))
    } catch (err) { toast.error(err.message || 'Failed to mark as read.') }
  }

  const confirmDelete = async () => {
    try {
      await deleteMessage(deleteTarget.id)
      setMessages(m => m.filter(x => x.id !== deleteTarget.id))
      toast.success('Message deleted')
    } catch (err) { toast.error(err.message || 'Delete failed.') }
    finally { setDeleteTarget(null) }
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <div className="fixed inset-0 z-[160] bg-[#0B0E1A]/95 backdrop-blur-xl overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">Contact Messages</h1>
            <p className="text-sm text-slate-400 mt-1">{unread} unread · {messages.length} total</p>
          </div>
          <button onClick={onClose} className="icon-btn glass hover:bg-white/10 w-10 h-10">
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-28 skeleton" />)}</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <i className="fa-solid fa-inbox text-4xl text-slate-500 mb-4" />
            <p className="font-display font-semibold text-lg">No messages yet</p>
            <p className="text-sm text-slate-500 mt-1">Contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`glass rounded-2xl p-6 transition-all ${!msg.is_read ? 'border-l-4 border-l-brandpurple' : ''}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold">{msg.name}</span>
                      {!msg.is_read && <span className="text-xs bg-brandpurple/20 text-brandpurple rounded-full px-2 py-0.5 font-semibold">New</span>}
                    </div>
                    <p className="text-sm text-brandblue">{msg.email}</p>
                    {msg.subject && <p className="text-sm font-medium mt-1 text-slate-300">{msg.subject}</p>}
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{msg.message}</p>
                    <p className="text-xs text-slate-600 mt-3">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!msg.is_read && (
                      <button onClick={() => handleMarkRead(msg.id)} className="text-xs px-3 py-1.5 rounded-lg glass hover:bg-white/10 transition-colors flex items-center gap-1.5">
                        <i className="fa-solid fa-check text-emerald-400" /> Mark read
                      </button>
                    )}
                    <a href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Your message'}`}
                      className="text-xs px-3 py-1.5 rounded-lg glass hover:bg-white/10 transition-colors flex items-center gap-1.5">
                      <i className="fa-solid fa-reply text-brandblue" /> Reply
                    </a>
                    <button onClick={() => setDeleteTarget(msg)} className="text-xs px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors flex items-center gap-1.5">
                      <i className="fa-solid fa-trash" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="Delete this message?" description="This cannot be undone." />
    </div>
  )
}
