import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, Send, Bot, User, ShoppingCart, Heart, Sparkles, ChevronRight, Search } from 'lucide-react'
import ProductCard from './ProductCard'

const API = import.meta.env.VITE_BACKEND_URL || ''

function ChatBubble({ role, children }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[72%] rounded-2xl px-4 py-3 shadow-sm border ${isUser ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-1 text-xs opacity-75">
          {isUser ? <User size={14} /> : <Bot size={14} className="text-gray-900" />}<span>{isUser ? 'You' : 'Assistant'}</span>
        </div>
        <div className="prose prose-sm max-w-none">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Chat({ session, onWishlist, onCart, onSelectProduct, onAlt }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recs, setRecs] = useState([])
  const endRef = useRef(null)

  useEffect(() => {
    if (!session?.id) return
    fetch(`${API}/api/sessions/${session.id}/messages`).then(r=>r.json()).then(setMessages).catch(()=>{})
  }, [session])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, recs])

  const send = async () => {
    const text = input.trim()
    if (!text || !session?.id) return
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    try {
      const res = await fetch(`${API}/api/chat?session_id=${session.id}&query=${encodeURIComponent(text)}`, { method: 'POST' })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, meta: { reasons: data.reasons, summary: 'I compared current prices, recent drops, and retailer availability to shortlist these.' } }])
      setRecs(data.products || [])
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Voice input
  const recognitionRef = useRef(null)
  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return alert('Voice input not supported in this browser')
    const recog = new SpeechRecognition()
    recognitionRef.current = recog
    recog.lang = 'en-US'
    recog.continuous = false
    recog.interimResults = false
    recog.onresult = (e) => {
      const t = Array.from(e.results).map(r=>r[0].transcript).join(' ')
      setInput(prev => (prev ? prev + ' ' : '') + t)
    }
    recog.start()
  }

  const QuickActions = () => (
    <div className="flex flex-wrap gap-2">
      {['Find better alternatives', 'Compare top 3', 'Show budget options', 'Retailers near me'].map((q, i)=> (
        <button key={i} onClick={()=>setInput(q)} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50">{q}</button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {!messages.length && (
          <div className="rounded-2xl border bg-white/80 backdrop-blur p-8 text-center shadow-sm">
            <div className="mx-auto w-full max-w-3xl aspect-[2/1] rounded-xl overflow-hidden border mb-6">
              <iframe src="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" className="w-full h-full" title="AI Aura Animation" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your personal shopping expert</h2>
            <p className="text-gray-600 mb-4">Ask me for recommendations, comparisons, or deals. I’ll summarize first, then let you dive deeper.</p>
            <QuickActions />
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role}>
            <div className="whitespace-pre-wrap">{m.content}</div>
            {m.meta?.summary && (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200">
                <div className="flex items-center gap-2 font-medium mb-1"><Sparkles size={16}/> Research Summary</div>
                <p className="text-sm text-gray-700">{m.meta.summary}</p>
              </div>
            )}
            {m.meta?.reasons?.length ? (
              <div className="mt-3 p-3 rounded-lg bg-purple-50 text-purple-800 text-sm border border-purple-100">
                <div className="flex items-center gap-2 font-medium mb-1"><Sparkles size={16}/> Why we recommend these</div>
                <ul className="list-disc pl-5 space-y-1">
                  {m.meta.reasons.map((r, idx)=>(<li key={idx}>{r}</li>))}
                </ul>
              </div>
            ) : null}
          </ChatBubble>
        ))}
        <div ref={endRef} />
        {recs.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map(p => <div key={p.id} onClick={()=>onSelectProduct?.(p)} className="cursor-pointer"><ProductCard p={p} onWishlist={onWishlist} onCart={onCart} /></div>)}
          </div>
        ) : null}
      </div>

      {/* Sticky input */}
      <div className="border-t bg-white p-3">
        <div className="flex items-center gap-2">
          <button onClick={startVoice} className="p-2 rounded-full border hover:bg-gray-50"><Mic size={18} className="text-gray-900"/></button>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask for the best noise-cancelling headphones under $200…" className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 ring-gray-200" />
          <button disabled={loading} onClick={send} className="px-4 py-3 rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60 flex items-center gap-2"><Send size={16}/> Send</button>
        </div>
        <div className="mt-2"><QuickActions /></div>
      </div>
    </div>
  )
}
