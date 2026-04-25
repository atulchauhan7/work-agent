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
  const containerRef = useRef(null)

  // Prevent mobile keyboard from causing layout shift
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv || !containerRef.current) return
    const onResize = () => {
      // Adjust container height to visual viewport (excludes keyboard)
      containerRef.current.style.height = `${vv.height}px`
    }
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => {
      vv.removeEventListener('resize', onResize)
      vv.removeEventListener('scroll', onResize)
    }
  }, [])

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
    <div ref={containerRef} className="flex flex-col h-[100svh] bg-dark-bg text-white overflow-hidden grain">
      <Navbar />

      {/* Sub-header — pt-20 clears fixed navbar at full height (~76px) */}
      <div className="pt-20 shrink-0">
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-white/[0.03] bg-dark-bg/50 backdrop-blur-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-ring text-green-400" />
            <span className="text-xs text-gray-500 tracking-[0.1em] font-medium font-body">Zivonx AI</span>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-[11px] text-gray-600 hover:text-gold transition-all duration-300 cursor-pointer tracking-[0.1em] uppercase hover:tracking-[0.15em] font-body">
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
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
                <div className="relative inline-block mb-8">
                  <div className="text-5xl sm:text-6xl font-display font-bold">
                    Zivon<span className="gold-shimmer">X</span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-2 tracking-[0.3em] uppercase font-semibold font-body">AI Assistant</div>
                </div>

                <p className="text-gray-400 text-sm sm:text-base max-w-sm mx-auto mb-12 leading-relaxed font-body">
                  Ask me anything about D2C growth, performance marketing, ad strategy, or working with Zivonx.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  {quickCards.map((c, i) => (
                    <motion.button
                      key={c.msg}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      onClick={() => send(c.msg)}
                      className="px-4 py-3.5 bg-dark-card border border-white/[0.04] hover:border-gold/20 rounded-sm text-[13px] text-gray-300 text-left hover:text-gold cursor-pointer transition-all duration-500 hover:bg-gold/[0.02] group font-body"
                    >
                      <span className="text-gold/30 mr-2 group-hover:text-gold/60 transition-colors duration-500">→</span>
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
                <div className="w-7 h-7 rounded-sm bg-gold/10 border border-gold/10 flex items-center justify-center shrink-0 mr-3 mt-1">
                  <span className="text-[11px] font-bold text-gold">Z</span>
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3.5 rounded-sm text-[14px] leading-relaxed font-body ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-gold/12 to-gold/[0.03] text-gold-light border border-gold/12 shadow-[0_2px_12px_rgba(245,158,11,0.06)]'
                  : 'bg-dark-card border border-white/[0.03] text-gray-200'
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
      <div className="shrink-0 border-t border-white/[0.03] bg-dark-bg/90 backdrop-blur-2xl">
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
              className="w-full px-4 py-3 sm:py-3.5 bg-dark-card border border-white/[0.05] rounded-sm text-white text-[14px] placeholder-gray-600 transition-all duration-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 focus:bg-dark-card/80 pr-12 font-body"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 sm:px-6 py-3 sm:py-3.5 bg-gold text-black font-semibold rounded-sm hover:bg-gold-light disabled:opacity-20 transition-all duration-300 cursor-pointer text-sm shrink-0 border border-gold-dark/20 hover:shadow-[0_0_16px_rgba(245,158,11,0.2)] font-body"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-700 pb-3 tracking-[0.1em] font-body">Powered by Zivonx AI · Groq</p>
      </div>
    </div>
  )
}
