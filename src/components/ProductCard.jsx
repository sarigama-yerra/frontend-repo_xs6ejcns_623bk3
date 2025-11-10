export default function ProductCard({ p, onWishlist, onCart }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow transition">
      <img src={p.image} alt={p.title} className="w-full h-44 object-cover" />
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-800 line-clamp-2">{p.title}</h4>
          <span className="text-sm px-2 py-1 rounded bg-emerald-50 text-emerald-700">★ {p.rating}</span>
        </div>
        <p className="text-lg font-bold text-gray-900">${p.price}</p>
        {p.features?.length ? (
          <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
            {p.features.slice(0,3).map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        ) : null}
        <div className="flex gap-2 pt-2">
          <button onClick={()=>onWishlist(p)} className="flex-1 text-sm px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100">Wishlist</button>
          <button onClick={()=>onCart(p)} className="flex-1 text-sm px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Add to Cart</button>
        </div>
      </div>
    </div>
  )
}
