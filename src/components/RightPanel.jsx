import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, ShoppingCart, Heart, ExternalLink, Star, ArrowUpRight } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || ''

function Sparkline({ points = [], width = 260, height = 64, stroke = '#7c3aed' }) {
  if (!points.length) return <div className="text-xs text-gray-500">No data</div>
  const min = Math.min(...points.map(p=>p.price))
  const max = Math.max(...points.map(p=>p.price))
  const norm = (v) => max === min ? height/2 : height - ((v - min) / (max - min)) * height
  const step = width / (points.length - 1)
  const d = points.map((p, i) => `${i===0?'M':'L'} ${i*step} ${norm(p.price)}`).join(' ')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  )
}

export default function RightPanel({ product, onWishlist, onCart, achievements, onAcknowledge }) {
  const [history, setHistory] = useState([])

  useEffect(()=>{
    if (!product?.id) { setHistory([]); return }
    fetch(`${API}/api/products/${product.id}/price-history`).then(r=>r.json()).then(d=>setHistory(d.history||[])).catch(()=>{})
  }, [product])

  const bestRetailer = useMemo(()=>{
    if (!product?.retailers?.length) return null
    return product.retailers.reduce((a,b)=> (a.price <= b.price ? a : b))
  }, [product])

  if (!product) {
    return (
      <aside className="hidden xl:block w-[360px] h-screen sticky top-0 border-l bg-white p-4">
        <div className="h-full grid place-content-center text-center text-gray-500">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-50 grid place-content-center text-purple-700 mb-3">
            <Star />
          </div>
          <p className="font-medium">Context panel</p>
          <p className="text-sm">Select a product to see details, retailers, and price history.</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="hidden xl:flex flex-col w-[380px] h-screen sticky top-0 border-l bg-white">
      <div className="p-4 border-b">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Product details</p>
        <h3 className="font-semibold text-lg text-gray-900 leading-snug line-clamp-2">{product.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="font-bold text-gray-900">${product.price}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">★ {product.rating}</span>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        <img src={product.image} alt={product.title} className="w-full h-44 object-cover rounded-lg border" />

        {product.features?.length ? (
          <div>
            <p className="text-sm font-medium text-gray-800 mb-2">Key specs</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              {product.features.map((f, i)=>(<li key={i}>{f}</li>))}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="text-sm font-medium text-gray-800 mb-2">Price history</p>
          <div className="rounded-lg border p-3 bg-gray-50">
            <Sparkline points={history} />
            <div className="mt-2 text-xs text-gray-500">Last 30 days</div>
          </div>
        </div>

        {product.retailers?.length ? (
          <div>
            <p className="text-sm font-medium text-gray-800 mb-2">Retailers</p>
            <div className="space-y-2">
              {product.retailers.sort((a,b)=>a.price-b.price).map((r, i)=>{
                const isBest = bestRetailer && r.price === bestRetailer.price
                return (
                  <a key={i} href={r.url} target="_blank" className={`flex items-center justify-between p-3 rounded-lg border ${isBest? 'border-purple-300 bg-purple-50':'border-gray-200 bg-white'} hover:shadow-sm transition`}>
                    <div className="text-sm font-medium text-gray-800 flex items-center gap-2">{r.name} {isBest && (<span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600 text-white">Best</span>)}</div>
                    <div className="text-sm text-gray-900 flex items-center gap-2">${r.price}<ExternalLink size={14} className="text-gray-400"/></div>
                  </a>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="flex gap-2 pt-1">
          <button onClick={()=>onWishlist(product)} className="flex-1 text-sm px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100">Save</button>
          <button onClick={()=>onCart(product)} className="flex-1 text-sm px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2"><ShoppingCart size={16}/> Add to cart</button>
        </div>

        {achievements?.length ? (
          <div className="mt-2 p-3 rounded-lg border bg-emerald-50/60 text-emerald-800 text-sm">
            <div className="flex items-center gap-2 font-medium mb-1"><BadgeCheck size={16}/> Smart Shopper</div>
            <ul className="list-disc pl-5 space-y-1">
              {achievements.map((a, i)=>(<li key={i}>{a}</li>))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
