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
    <div className="flex flex-col h-dvh bg-dark-bg text-white noise">
      <Navbar />

      {/* Sub-header */}
      <div className="pt-16 shrink-0">
        <div className="flex items-center justify-between px-5 sm:px-6 py-2.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 tracking-wide">Zivonx AI</span>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-[11px] text-gray-600 hover:text-gold transition-colors cursor-pointer tracking-wide uppercase">
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <AnimatePresence mode="wait">
            {messages.length === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="text-center pt-12 sm:pt-20"
              >
                {/* Animated logo */}
                <div className="relative inline-block mb-6">
                  <div className="text-5xl sm:text-6xl font-heading font-bold">
                    Zivon<span className="text-gradient">X</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 tracking-widest uppercase">AI Assistant</div>
                  <div className="hero-orb w-[200px] h-[200px] bg-gold/20 top-[-50px] left-1/2 -translate-x-1/2" />
                </div>

                <p className="text-gray-400 text-sm sm:text-base max-w-sm mx-auto mb-10 leading-relaxed">
                  Ask me anything about D2C growth, performance marketing, ad strategy, or working with Zivonx.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  {quickCards.map((c, i) => (
                    <motion.button
                      key={c.msg}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      onClick={() => send(c.msg)}
                      className="px-4 py-3 card-glow rounded-xl text-[13px] text-gray-300 text-left hover:text-gold cursor-pointer transition-colors duration-300"
                    >
                      <span className="text-gold/40 mr-2">→</span>
                      {c.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble mb-5 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gold/10 border border-gold/10 flex items-center justify-center shrink-0 mr-3 mt-1">
                  <span className="text-[11px] font-bold text-gold">Z</span>
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-gold/15 to-gold/5 text-gold-light border border-gold/15 rounded-br-md'
                  : 'bg-dark-elevated border border-white/[0.04] text-gray-200 rounded-bl-md'
              }`}>
                {m.content ? (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                ) : (
                  loading && (
                    <span className="inline-flex gap-1.5 py-1">
                      <span className="typing-dot w-1.5 h-1.5 bg-gold/50 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-gold/50 rounded-full" />
                      <span className="typing-dot w-1.5 h-1.5 bg-gold/50 rounded-full" />
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-white/[0.04] bg-dark-bg/80 backdrop-blur-xl">
        <form
          onSubmit={e => { e.preventDefault(); send() }}
          className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about Zivonx..."
              className="w-full px-4 py-3 sm:py-3.5 bg-dark-elevated border border-white/[0.06] rounded-xl text-white text-[14px] placeholder-gray-600 focus-gold transition-all pr-12"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-gold to-gold-light text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/20 disabled:opacity-20 disabled:hover:shadow-none transition-all duration-300 cursor-pointer text-sm shrink-0"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-700 pb-3 tracking-wide">Powered by Zivonx AI · Groq</p>
      </div>
    </div>
  )
}
