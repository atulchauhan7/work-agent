import { Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}
