import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import Sidebar from './Sidebar'
import Chat from './components/Chat'
import RightPanel from './components/RightPanel'

const API = import.meta.env.VITE_BACKEND_URL || ''

export default function App() {
  const [session, setSession] = useState(null)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [selected, setSelected] = useState(null)
  const [achievements, setAchievements] = useState([])

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
      // Achievement example
      setAchievements(prev => prev.includes('Saved your first item') ? prev : [...prev, 'Saved your first item'])
    } catch(e) {}
  }

  const onWishlist = async (p) => {
    await onQuickAdd(p)
  }
  const onCart = async (p) => {
    setCart(prev => [...prev, { ...p, quantity: 1 }])
    try {
      await fetch(`${API}/api/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: p.id, quantity: 1 }) })
      setAchievements(prev => prev.includes('Added to cart') ? prev : [...prev, 'Added to cart'])
    } catch(e) {}
  }

  const onSelectChat = (s) => setSession(s)

  const onFindAlternatives = () => {
    // UX stub: could call backend search with cheaper price filter
    setAchievements(prev => prev.includes('Smart alternative hunt') ? prev : [...prev, 'Smart alternative hunt'])
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar onQuickAdd={onQuickAdd} onSelectChat={onSelectChat} />

        {/* Center Main Chat Area */}
        <main className="flex-1 h-screen sticky top-0 overflow-hidden">
          <div className="h-full grid grid-rows-[auto,1fr]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-900 text-white grid place-content-center"><ShoppingBag size={18}/></div>
                <div>
                  <h1 className="font-semibold tracking-tight">Shopping Assistant</h1>
                  <p className="text-xs text-gray-500">Sophisticated, helpful, effortlessly smart</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-3">
                <button onClick={onFindAlternatives} className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50">Find Better Alternatives</button>
                <span>{cart.length} in cart · {wishlist.length} saved</span>
              </div>
            </header>

            {/* Chat */}
            <Chat session={session} onWishlist={onWishlist} onCart={onCart} onSelectProduct={setSelected} onAlt={onFindAlternatives} />
          </div>
        </main>

        {/* Right Context Panel */}
        <RightPanel product={selected} onWishlist={onWishlist} onCart={onCart} achievements={achievements} />
      </div>
    </div>
  )
}
