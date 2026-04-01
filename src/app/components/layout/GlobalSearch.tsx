import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Search, X, ShoppingCart, Tag, Landmark, Users, FileText, ArrowLeft } from 'lucide-react'
import { purchaseOrders } from '../../data/purchasingData'
import { saleOrders }     from '../../data/salesData'
import { transactions }   from '../../data/treasuryData'
import { employees }      from '../../data/attendanceData'

interface Result {
  id: string; category: 'purchase' | 'sale' | 'cashier' | 'hr'
  title: string; sub: string; path: string; value?: string
}

const CAT_CFG = {
  purchase: { label: 'المشتريات',  icon: ShoppingCart, color: 'text-amber-600',  bg: 'bg-amber-50'  },
  sale:     { label: 'المبيعات',   icon: Tag,          color: 'text-[#1a6b3c]', bg: 'bg-[#e8f5ee]' },
  cashier:  { label: 'الخزينة',    icon: Landmark,     color: 'text-blue-600',  bg: 'bg-blue-50'   },
  hr:       { label: 'الموظفين',   icon: Users,        color: 'text-violet-600',bg: 'bg-violet-50' },
}

const fmt = (n: number) => n.toLocaleString('ar-EG') + ' ج.م'

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return <>{text.slice(0, idx)}<mark className="bg-yellow-100 text-yellow-800 rounded px-0.5 not-italic">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>
}

interface Props { placeholder?: string; className?: string }

export function GlobalSearch({ placeholder = 'بحث سريع...', className = '' }: Props) {
  const [query, setQuery]     = useState('')
  const [open, setOpen]       = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const q = query.trim().toLowerCase()

  const results = useMemo((): Result[] => {
    if (q.length < 2) return []
    const out: Result[] = []
    purchaseOrders
      .filter(o => o.orderNumber.toLowerCase().includes(q) || o.supplierName.includes(q) || o.items.some(it => it.name.includes(q)))
      .slice(0, 3).forEach(o => out.push({ id: o.id, category: 'purchase', path: '/purchasing', title: o.orderNumber, value: fmt(o.totalAmount), sub: `${o.supplierName} · ${o.items.map(i => i.name).join('، ')}` }))
    saleOrders
      .filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.includes(q) || o.items.some(it => it.name.includes(q)))
      .slice(0, 3).forEach(o => out.push({ id: o.id, category: 'sale', path: '/sales', title: o.orderNumber, value: fmt(o.totalAmount), sub: `${o.customerName} · ${o.items.map(i => i.name).join('، ')}` }))
    transactions
      .filter(t => t.txNumber.toLowerCase().includes(q) || t.description.includes(q) || (t.reference ?? '').toLowerCase().includes(q))
      .slice(0, 3).forEach(t => out.push({ id: t.id, category: 'cashier', path: '/cashier', title: t.txNumber, value: fmt(t.amount), sub: t.description }))
    employees
      .filter(e => e.name.includes(q) || e.employeeNumber.toLowerCase().includes(q) || e.department.includes(q) || e.jobTitle.includes(q))
      .slice(0, 3).forEach(e => out.push({ id: e.id, category: 'hr', path: '/attendance', title: e.name, sub: `${e.employeeNumber} · ${e.jobTitle} · ${e.department}` }))
    return out
  }, [q])

  const grouped = useMemo(() => {
    const map: Partial<Record<Result['category'], Result[]>> = {}
    results.forEach(r => { if (!map[r.category]) map[r.category] = []; map[r.category]!.push(r) })
    return map
  }, [results])

  const showDropdown = open && focused && q.length >= 2

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setFocused(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() } }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  function go(path: string) { navigate(path); setQuery(''); setOpen(false); setFocused(false) }

  return (
    <div ref={wrapRef} className={`relative ${className}`} dir="rtl">
      <div className={`flex items-center gap-2 h-9 px-3 rounded-[10px] border transition-all duration-150 ${focused ? 'bg-white border-[#1a6b3c]/40 ring-2 ring-[#1a6b3c]/15 shadow-sm' : 'bg-neutral-100 border-neutral-200'}`}>
        <Search size={14} className={`shrink-0 transition-colors ${focused ? 'text-[#1a6b3c]' : 'text-neutral-400'}`} />
        <input ref={inputRef} type="text" value={query} placeholder={placeholder}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          className="flex-1 bg-transparent outline-none font-cairo text-[13px] text-neutral-700 placeholder:text-neutral-400 min-w-0" dir="rtl" />
        {query && <button onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus() }} className="shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"><X size={13} /></button>}
      </div>
      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 z-[500] w-[420px] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden">
          {results.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center"><FileText size={18} className="text-neutral-300" /></div>
              <p className="font-cairo text-[13px] text-neutral-500">لا توجد نتائج لـ «{query}»</p>
              <p className="font-cairo text-[11px] text-neutral-400">جرّب كلمة أخرى أو رقم مرجع</p>
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              {(Object.entries(grouped) as [Result['category'], Result[]][]).map(([cat, items]) => {
                const cfg = CAT_CFG[cat]
                const CatIcon = cfg.icon
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50/80 border-b border-neutral-100 sticky top-0">
                      <div className={`w-5 h-5 rounded-md ${cfg.bg} flex items-center justify-center`}><CatIcon size={11} className={cfg.color} /></div>
                      <span className="font-cairo font-semibold text-[10px] text-neutral-500 uppercase tracking-wider">{cfg.label}</span>
                      <span className="font-cairo text-[10px] text-neutral-400 mr-auto">{items.length} نتيجة</span>
                    </div>
                    {items.map(r => (
                      <button key={r.id} onClick={() => go(r.path)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 transition-colors text-right group">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}><CatIcon size={13} className={cfg.color} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-cairo font-semibold text-[12px] text-neutral-800 truncate"><Highlighted text={r.title} query={query} /></p>
                          <p className="font-cairo text-[11px] text-neutral-400 truncate"><Highlighted text={r.sub} query={query} /></p>
                        </div>
                        {r.value && <span className={`font-cairo font-semibold text-[11px] ${cfg.color} shrink-0`}>{r.value}</span>}
                        <ArrowLeft size={13} className="text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                )
              })}
              <div className="px-4 py-2.5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
                <span className="font-cairo text-[11px] text-neutral-400">{results.length} نتيجة إجمالية</span>
                <span className="font-cairo text-[10px] text-neutral-300">Esc للإغلاق</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
