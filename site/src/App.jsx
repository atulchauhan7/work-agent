import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'
import PrivacyPage from './components/PrivacyPage'

// Intercept all hash-link clicks and use JS smooth scroll.
// Fixes: /#section hrefs that bypass CSS scroll-behavior, and iOS Safari which
// doesn't honour scroll-behavior: smooth reliably.
function useSmoothHashScroll() {
  useEffect(() => {
    const handle = (e) => {
      const a = e.target.closest('a[href]')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      // Match same-page hash: "#section" or "/#section"
      const match = href.match(/^(?:\/)?#(.+)$/)
      if (!match) return
      const el = document.getElementById(match[1])
      if (!el) return
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Update URL hash without triggering a navigation
      history.pushState(null, '', '#' + match[1])
    }
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])
}

export default function App() {
  useSmoothHashScroll()
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
    </Routes>
  )
}
