import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import Sidebar from './Sidebar'
import Chat from './components/Chat'

const API = import.meta.env.VITE_BACKEND_URL || ''

export default function App() {
  const [session, setSession] = useState(null)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    // create a session on mount
    const create = async () => {
      try {
        const title = `New shopping chat ${new Date().toLocaleTimeString()}`
        const res = await fetch(`${API}/api/sessions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
        const data = await res.json()
        setSession(data)
      } catch(e) {
        console.error(e)
      }
    }
    create()
  }, [])

  const onQuickAdd = async (p) => {
    setWishlist(prev => [...prev, p])
    try {
      await fetch(`${API}/api/wishlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: p.id }) })
    } catch(e) {}
  }

  const onWishlist = async (p) => {
    await onQuickAdd(p)
  }
  const onCart = async (p) => {
    setCart(prev => [...prev, { ...p, quantity: 1 }])
    try {
      await fetch(`${API}/api/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: p.id, quantity: 1 }) })
    } catch(e) {}
  }

  const onSelectChat = (s) => setSession(s)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar onQuickAdd={onQuickAdd} onSelectChat={onSelectChat} />

        {/* Center Main Chat Area */}
        <main className="flex-1 h-screen sticky top-0 overflow-hidden">
          <div className="h-full grid grid-rows-[auto,1fr]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-600 text-white grid place-content-center"><ShoppingBag size={18}/></div>
                <div>
                  <h1 className="font-semibold">Shopping Assistant</h1>
                  <p className="text-xs text-gray-500">Premium, personal, and on your budget</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {cart.length} in cart · {wishlist.length} saved
              </div>
            </header>

            {/* Chat */}
            <Chat session={session} onWishlist={onWishlist} onCart={onCart} />
          </div>
        </main>
      </div>
    </div>
  )
}
