import { useEffect, useState } from 'react'
import { Clock, Search, Flame, Star } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 px-3 py-2">
      <Icon size={16} className="text-purple-600" />
      <span>{title}</span>
    </div>
  )
}

function ProductMini({ p, onQuick }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition border border-gray-100">
      <img src={p.image} alt={p.title} className="w-12 h-12 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
        <p className="text-xs text-gray-500">${p.price} · ★ {p.rating}</p>
      </div>
      <button onClick={() => onQuick(p)} className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100">Add</button>
    </div>
  )
}

export default function Sidebar({ onQuickAdd, onSelectChat }) {
  const [recent, setRecent] = useState([])
  const [older, setOlder] = useState([])
  const [trending, setTrending] = useState([])
  const [essentials, setEssentials] = useState([])
  const [favorites, setFavorites] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API}/api/sessions/recent`).then(r=>r.json()).then(setRecent).catch(()=>{})
    fetch(`${API}/api/sessions?limit=30`).then(r=>r.json()).then(data=>setOlder(data.slice(7))).catch(()=>{})
    fetch(`${API}/api/products/trending`).then(r=>r.json()).then(setTrending).catch(()=>{})
    fetch(`${API}/api/products/essentials`).then(r=>r.json()).then(setEssentials).catch(()=>{})
    fetch(`${API}/api/products/favorites`).then(r=>r.json()).then(setFavorites).catch(()=>{})
  }, [])

  const olderFiltered = older.filter(s=> s.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <aside className="hidden lg:flex flex-col w-[360px] h-screen sticky top-0 border-r border-gray-200 bg-white">
      {/* Top: Recent Chats */}
      <div className="p-4 border-b border-gray-200">
        <SectionTitle icon={Clock} title="Recent Chats" />
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {recent.map(s => (
            <button key={s.id} onClick={()=>onSelectChat(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100">
              <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>
              <p className="text-xs text-gray-500">{new Date(s.created_at).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Older Chats scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
          <Search size={16} className="text-gray-500" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chats" className="bg-transparent flex-1 text-sm outline-none" />
        </div>
        {olderFiltered.map(s => (
          <button key={s.id} onClick={()=>onSelectChat(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100">
            <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>
          </button>
        ))}
      </div>

      {/* Bottom: Discovery */}
      <div className="p-4 border-t border-gray-200 space-y-5">
        <SectionTitle icon={Flame} title="Trending This Week" />
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {trending.map(p => <ProductMini key={p.id} p={p} onQuick={onQuickAdd} />)}
        </div>
        <SectionTitle icon={Star} title="Daily Useful Essentials" />
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {essentials.map(p => <ProductMini key={p.id} p={p} onQuick={onQuickAdd} />)}
        </div>
        <SectionTitle icon={Star} title="Community Favorites" />
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {favorites.map(p => <ProductMini key={p.id} p={p} onQuick={onQuickAdd} />)}
        </div>
      </div>
    </aside>
  )
}
