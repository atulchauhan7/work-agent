import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
  }

  async function clearChat() {
    await fetch(`${API_BASE}/api/clear`, { method: 'POST' }).catch(() => {})
    setMessages([])
  }

  return (
    <div className="flex flex-col h-dvh bg-dark-bg text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/[0.06] bg-dark-bg/80 backdrop-blur-xl shrink-0">
        <Link to="/" className="text-lg font-heading font-bold text-white">
          Zivon<span className="text-gold">X</span>
        </Link>
        <span className="text-sm text-gray-500">AI Chat</span>
        <button onClick={clearChat} className="text-xs text-gray-500 hover:text-gold transition-colors cursor-pointer">
          Clear
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center pt-16"
            >
              <div className="text-4xl font-heading font-bold mb-2">
                Zivon<span className="text-gold">X</span> AI
              </div>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                Get instant answers about D2C growth, performance marketing, ad strategy, and working with us.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-lg mx-auto">
                {quickCards.map(c => (
                  <button
                    key={c.msg}
                    onClick={() => send(c.msg)}
                    className="px-4 py-2.5 bg-dark-card border border-white/[0.06] rounded-full text-sm text-gray-300 hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all cursor-pointer"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-2xl mx-auto mb-4 ${m.role === 'user' ? 'text-right' : ''}`}
            >
              <div className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'bg-dark-card border border-white/[0.06] text-gray-200'
              }`}>
                {m.content}
                {m.role === 'assistant' && !m.content && loading && (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gold/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] px-4 sm:px-6 py-3 bg-dark-bg shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); send() }}
          className="max-w-2xl mx-auto flex gap-2"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about Zivonx..."
            className="flex-1 px-4 py-3 bg-dark-card border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gold text-black font-semibold rounded-xl hover:bg-gold-light disabled:opacity-30 transition-all cursor-pointer"
          >
            Send
          </button>
        </form>
        <p className="text-center text-[11px] text-gray-600 mt-2">Powered by Zivonx AI · Groq</p>
      </div>
    </div>
  )
}
