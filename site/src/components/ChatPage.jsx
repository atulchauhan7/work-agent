import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'

const API_BASE = ''

const quickCards = [
  { label: 'What services does Zivonx offer?', msg: 'What services does Zivonx offer?' },
  { label: 'What results have you delivered?', msg: 'What kind of results have you delivered?' },
  { label: 'How does pricing work?', msg: 'How does pricing work?' },
  { label: 'How do I get started?', msg: 'How do I get started with Zivonx?' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Something went wrong' }))
        setMessages(prev => [...prev, { role: 'assistant', content: err.error || 'Error occurred.' }])
        setLoading(false)
        return
      }

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.type === 'token') {
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + d.content }
                return copy
              })
            } else if (d.type === 'error') {
              setMessages(prev => {
                const copy = [...prev]
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: d.content || 'Something went wrong. Please try again.' }
                return copy
              })
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  async function clearChat() {
    await fetch(`${API_BASE}/api/clear`, { method: 'POST' }).catch(() => {})
    setMessages([])
  }

  return (
    <div className="flex flex-col bg-bg text-ink" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Navbar />

      {/* Sub-header */}
      <div className="pt-20 shrink-0 relative z-10">
        <div className="flex items-center justify-between max-w-3xl mx-auto px-5 sm:px-6 py-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-accent rounded-full pulse-ring text-accent" />
            <span className="text-[13px] text-muted font-medium">Zivonx AI</span>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-[12px] text-muted hover:text-accent transition-colors cursor-pointer font-medium">Clear chat</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5 }} className="text-center pt-10 sm:pt-16">
                <div className="font-display text-4xl sm:text-6xl font-semibold tracking-[-0.03em] mb-3">Zivonx<span className="text-accent"> AI</span></div>
                <p className="text-muted text-base max-w-sm mx-auto mb-12 leading-relaxed">Ask me anything about D2C growth, performance marketing, ad strategy, or working with Zivonx.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  {quickCards.map((c, i) => (
                    <motion.button key={c.msg} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.08 }} onClick={() => send(c.msg)} className="group px-4 py-4 bg-soft border border-line hover:border-accent rounded-xl text-[14px] text-muted text-left hover:text-ink transition-all duration-200">
                      <span className="text-accent mr-2 inline-block group-hover:translate-x-0.5 transition-transform">→</span>{c.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble mb-5 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0 mr-3 mt-0.5">
                  <span className="text-[12px] font-semibold font-display">Z</span>
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                m.role === 'user' ? 'bg-accent text-white' : 'bg-soft border border-line text-ink/90'
              }`}>
                {m.content ? (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                ) : (
                  loading && (
                    <span className="inline-flex gap-1.5 py-1">
                      <span className="typing-dot w-1.5 h-1.5 bg-ink/40 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-ink/40 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-ink/40 rounded-full" />
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-line bg-bg/90 backdrop-blur-xl relative z-10">
        <form onSubmit={e => { e.preventDefault(); send() }} className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about Zivonx..."
            className="flex-1 px-4 py-3.5 bg-soft border border-line rounded-lg text-ink placeholder-ink/35 transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            style={{ fontSize: '16px' }}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="px-5 sm:px-7 py-3.5 bg-ink text-white font-medium rounded-lg hover:bg-accent disabled:opacity-25 transition-colors cursor-pointer text-sm shrink-0">
            <span className="hidden sm:inline">Send</span>
            <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
        <p className="text-center text-[11px] text-muted pb-3">Powered by Zivonx AI</p>
      </div>
    </div>
  )
}
