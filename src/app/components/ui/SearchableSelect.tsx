import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface SearchableSelectProps {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
  className?: string
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  className = ''
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  const selectedLabel = options.find(o => o.value === value)?.label || ''

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      <div 
        onClick={() => { setOpen(!open); setSearch('') }}
        className={`flex items-center justify-between cursor-pointer select-none ${className}`}
      >
        <span className={value ? "text-neutral-800 line-clamp-1" : "text-neutral-400"}>
          {value ? selectedLabel : placeholder}
        </span>
        <ChevronDown size={13} className={`text-neutral-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </div>
      
      {open && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-neutral-100 relative">
            <Search size={13} className="absolute inset-inline-start-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 rounded-md bg-neutral-50 px-8 font-cairo text-[12px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-primary-300 transition"
              placeholder="ابحث..."
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-[12px] text-neutral-400 font-cairo">لا توجد نتائج</div>
            ) : (
              filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                  className={`px-3 py-2 text-[13px] font-cairo cursor-pointer transition-colors ${value === o.value ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-50'}`}
                >
                  {o.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
