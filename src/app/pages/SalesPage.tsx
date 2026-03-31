import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Search, Plus, X, Download, Tag, Clock,
  CheckCircle2, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft,
  Eye, CreditCard, Truck, FileText, AlertCircle,
  TrendingUp, Wallet, ChevronDown, Scale,
} from 'lucide-react'
import {
  SaleOrder, SaleItem, SalePayment, SaleStatus, SaleCategory,
  PaymentMethod, SALE_STATUS_LABELS, SALE_CATEGORY_LABELS,
} from '../types/sales'
import { PAYMENT_METHOD_LABELS } from '../types/purchasing'
import { saleOrders as initOrders, salePayments as initPayments } from '../data/salesData'

function fmtMoney(n: number) { return n.toLocaleString('ar-EG') + ' ج.م' }
function fmtDate(d: string)  { return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) }
function genId(prefix = 'id') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}` }
const todayStr = () => new Date().toISOString().split('T')[0]

const PAGE_SIZE = 8

function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const slice      = items.slice((safePage - 1) * pageSize, safePage * pageSize)
  return { page: safePage, setPage, totalPages, slice, total: items.length }
}

const STATUS_CFG: Record<SaleStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: 'معلق',  color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  confirmed: { label: 'مؤكد',  color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  delivered: { label: 'مسلّم', color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-500'  },
  partial:   { label: 'جزئي',  color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  cancelled: { label: 'ملغي',  color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-400'    },
}

const CATEGORY_COLOR: Record<SaleCategory, string> = {
  cattle:    'bg-amber-50 text-amber-700',
  meat:      'bg-red-50 text-red-700',
  byproduct: 'bg-lime-50 text-lime-700',
  other:     'bg-neutral-100 text-neutral-500',
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string
  color: 'primary' | 'success' | 'error' | 'warning' | 'neutral'
}) {
  const c = {
    primary: { bg: 'bg-[#e8f5ee]', icon: 'text-[#1a6b3c]', text: 'text-[#1a6b3c]' },
    success: { bg: 'bg-green-50',  icon: 'text-green-600',  text: 'text-green-700'  },
    error:   { bg: 'bg-red-50',    icon: 'text-red-600',    text: 'text-red-700'    },
    warning: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-700' },
    neutral: { bg: 'bg-neutral-100', icon: 'text-neutral-500', text: 'text-neutral-700' },
  }[color]
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={c.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-cairo text-[11px] text-neutral-400 truncate">{label}</p>
        <p className={`font-cairo font-bold text-[18px] ${c.text} leading-tight`}>{value}</p>
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, setPage, total, pageSize }: {
  page: number; totalPages: number; setPage: (p: number) => void; total: number; pageSize: number
}) {
  const start = (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, total)
  if (total === 0) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100" dir="rtl">
      <span className="font-cairo text-[12px] text-neutral-400">
        عرض <span className="font-semibold text-neutral-600">{start}–{end}</span> من <span className="font-semibold text-neutral-600">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none"><ChevronsRight size={14} /></button>
        <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none"><ChevronRight size={14} /></button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
          <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg font-cairo text-[12px] font-semibold ${p === page ? 'bg-[#1a6b3c] text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}>{p}</button>
        ))}
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none"><ChevronLeft size={14} /></button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none"><ChevronsLeft size={14} /></button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: SaleStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-cairo text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
    </span>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

const inputCls  = "w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
const selectCls = inputCls + " appearance-none cursor-pointer"
const UNITS_SALE = ['رأس', 'كيلو', 'طن', 'لتر', 'قطعة', 'صندوق']

interface SaleForm {
  customerName: string; date: string; deliveryDate: string
  paymentMethod: PaymentMethod | ''; notes: string; items: Omit<SaleItem, 'id'>[]
}

function emptySaleForm(): SaleForm {
  return { customerName: '', date: todayStr(), deliveryDate: '', paymentMethod: '', notes: '',
    items: [{ name: '', category: 'cattle', quantity: 1, unit: 'رأس', unitPrice: 0, total: 0 }] }
}

function AddSaleModal({ onSave, onClose }: { onSave: (form: SaleForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<SaleForm>(emptySaleForm())
  const set = <K extends keyof SaleForm>(k: K, v: SaleForm[K]) => setForm(f => ({ ...f, [k]: v }))

  function setItem(idx: number, field: keyof Omit<SaleItem, 'id'>, value: string | number) {
    setForm(f => {
      const items = f.items.map((it, i) => {
        if (i !== idx) return it
        const updated = { ...it, [field]: value }
        updated.total = updated.quantity * updated.unitPrice
        return updated
      })
      return { ...f, items }
    })
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', category: 'cattle', quantity: 1, unit: 'رأس', unitPrice: 0, total: 0 }] }))
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  const grandTotal = form.items.reduce((s, it) => s + it.total, 0)
  const valid = form.customerName.trim() !== '' && form.items.length > 0 && form.items.every(it => it.name.trim() !== '' && it.total > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[92vh] flex flex-col overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-l from-[#1a6b3c] to-[#2d9e5f] shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center"><Tag size={15} className="text-[#1a6b3c]" /></div>
            <h2 className="font-cairo font-bold text-[15px] text-neutral-800">أمر بيع جديد</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="العميل" required><input value={form.customerName} onChange={e => set('customerName', e.target.value)} placeholder="اسم العميل..." className={inputCls} /></Field>
            <Field label="طريقة الدفع">
              <div className="relative">
                <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value as PaymentMethod)} className={selectCls}>
                  <option value="">اختر...</option>
                  {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="تاريخ الطلب"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} /></Field>
            <Field label="موعد التسليم"><input type="date" value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)} className={inputCls} /></Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-cairo text-[12px] font-semibold text-neutral-600">الأصناف <span className="text-red-500">*</span></label>
              <button onClick={addItem} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e8f5ee] text-[#1a6b3c] font-cairo text-[11px] font-semibold hover:bg-[#d4eddf]"><Plus size={12} /> إضافة صنف</button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2">
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input value={item.name} onChange={e => setItem(idx, 'name', e.target.value)} placeholder="اسم الصنف أو المنتج..." className={inputCls} />
                    <button onClick={() => removeItem(idx)} disabled={form.items.length === 1} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none"><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="relative">
                      <select value={item.category} onChange={e => setItem(idx, 'category', e.target.value as SaleCategory)} className={selectCls + ' text-[12px]'}>
                        {(Object.entries(SALE_CATEGORY_LABELS) as [SaleCategory, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e => setItem(idx, 'quantity', parseFloat(e.target.value) || 0)} placeholder="الكمية" className={inputCls + ' text-[12px]'} />
                    <div className="relative">
                      <select value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)} className={selectCls + ' text-[12px]'}>
                        {UNITS_SALE.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    <input type="number" min="0" value={item.unitPrice} onChange={e => setItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder="السعر" className={inputCls + ' text-[12px]'} />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-cairo text-[11px] text-neutral-400">الإجمالي:</span>
                    <span className="font-cairo font-bold text-[13px] text-[#1a6b3c]">{fmtMoney(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[#e8f5ee] border border-[#1a6b3c]/20 px-4 py-3 flex items-center justify-between">
            <span className="font-cairo text-[13px] font-semibold text-[#1a6b3c]">إجمالي أمر البيع</span>
            <span className="font-cairo font-bold text-[18px] text-[#1a6b3c]">{fmtMoney(grandTotal)}</span>
          </div>
          <Field label="ملاحظات">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="أي ملاحظات إضافية..." className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition resize-none" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100">إلغاء</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid} className="flex items-center gap-2 px-5 py-2 bg-[#1a6b3c] text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-[#145730] disabled:opacity-40 disabled:pointer-events-none">
            <Plus size={14} /> حفظ أمر البيع
          </button>
        </div>
      </div>
    </div>
  )
}

function CollectModal({ order, onSave, onClose }: { order: SaleOrder; onSave: (payment: SalePayment) => void; onClose: () => void }) {
  const remaining = order.totalAmount - order.collectedAmount
  const [amount, setAmount] = useState(String(remaining))
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [date, setDate]     = useState(todayStr())
  const [notes, setNotes]   = useState('')
  const valid = parseFloat(amount) > 0 && parseFloat(amount) <= remaining

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-l from-[#1a6b3c] to-emerald-400" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center"><CreditCard size={15} className="text-[#1a6b3c]" /></div>
            <div>
              <h2 className="font-cairo font-bold text-[14px] text-neutral-800">تحصيل دفعة</h2>
              <p className="font-cairo text-[11px] text-neutral-400">{order.orderNumber} · {order.customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3">
            <div><p className="font-cairo text-[10px] text-neutral-400">إجمالي الأمر</p><p className="font-cairo font-bold text-[14px] text-neutral-800">{fmtMoney(order.totalAmount)}</p></div>
            <div><p className="font-cairo text-[10px] text-neutral-400">المتبقي للتحصيل</p><p className="font-cairo font-bold text-[14px] text-orange-600">{fmtMoney(remaining)}</p></div>
          </div>
          <Field label="المبلغ المحصّل (ج.م)" required>
            <input type="number" min="1" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="طريقة الدفع">
              <div className="relative">
                <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className={selectCls}>
                  {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <ChevronDown size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="تاريخ التحصيل"><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="ملاحظات">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="ملاحظات التحصيل..." className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition resize-none" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100">إلغاء</button>
          <button onClick={() => valid && onSave({ id: genId('sp'), orderId: order.id, date, amount: parseFloat(amount), method, notes: notes || undefined })} disabled={!valid} className="flex items-center gap-2 px-5 py-2 bg-[#1a6b3c] text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-[#145730] disabled:opacity-40 disabled:pointer-events-none">
            <CreditCard size={14} /> تأكيد التحصيل
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewSaleModal({ order, payments, onClose }: { order: SaleOrder; payments: SalePayment[]; onClose: () => void }) {
  const remaining = order.totalAmount - order.collectedAmount
  const orderPayments = payments.filter(p => p.orderId === order.id)
  const totalWeight   = order.items.reduce((s, it) => s + (it.weight ?? 0), 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[580px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-l from-[#1a6b3c] to-[#2d9e5f]" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center"><FileText size={15} className="text-[#1a6b3c]" /></div>
            <div>
              <h2 className="font-cairo font-bold text-[15px] text-neutral-800">{order.orderNumber}</h2>
              <p className="font-cairo text-[11px] text-neutral-400">{order.customerName} · {fmtDate(order.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"><X size={16} /></button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'إجمالي الأمر', value: fmtMoney(order.totalAmount), cls: 'text-neutral-800' },
              { label: 'المحصّل', value: fmtMoney(order.collectedAmount), cls: 'text-green-600' },
              { label: 'المتبقي', value: fmtMoney(remaining), cls: remaining > 0 ? 'text-orange-600' : 'text-neutral-400' },
            ].map(c => (
              <div key={c.label} className="rounded-xl bg-neutral-50 border border-neutral-100 p-3 text-center">
                <p className="font-cairo text-[10px] text-neutral-400 mb-0.5">{c.label}</p>
                <p className={`font-cairo font-bold text-[14px] ${c.cls}`}>{c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {order.paymentMethod && <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5"><span className="font-cairo text-[12px] text-neutral-400">طريقة الدفع</span><span className="font-cairo font-semibold text-[12px] text-neutral-700">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span></div>}
            {order.deliveryDate && <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5"><span className="font-cairo text-[12px] text-neutral-400">موعد التسليم</span><span className="font-cairo font-semibold text-[12px] text-neutral-700">{fmtDate(order.deliveryDate)}</span></div>}
            {totalWeight > 0 && <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5"><span className="font-cairo text-[12px] text-neutral-400">إجمالي الوزن</span><span className="font-cairo font-semibold text-[12px] text-neutral-700">{totalWeight.toLocaleString('ar-EG')} كيلو</span></div>}
          </div>
          <div>
            <h3 className="font-cairo font-bold text-[13px] text-neutral-700 mb-2">الأصناف</h3>
            <div className="rounded-xl overflow-hidden border border-neutral-100">
              <table className="w-full">
                <thead><tr className="bg-neutral-50 border-b border-neutral-100">
                  {['الصنف', 'الفئة', 'الكمية', 'سعر الوحدة', 'الإجمالي'].map(h => <th key={h} className="px-3 py-2 font-cairo text-[11px] font-semibold text-neutral-500 text-right">{h}</th>)}
                </tr></thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                      <td className="px-3 py-2">
                        <p className="font-cairo font-semibold text-[12px] text-neutral-800">{item.name}</p>
                        {item.weight && <p className="font-cairo text-[10px] text-neutral-400 mt-0.5">{item.weight.toLocaleString('ar-EG')} كيلو</p>}
                      </td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full font-cairo text-[10px] font-semibold ${CATEGORY_COLOR[item.category]}`}>{SALE_CATEGORY_LABELS[item.category]}</span></td>
                      <td className="px-3 py-2 font-cairo text-[12px] text-neutral-600">{item.quantity} {item.unit}</td>
                      <td className="px-3 py-2 font-cairo text-[12px] text-neutral-600">{fmtMoney(item.unitPrice)}</td>
                      <td className="px-3 py-2 font-cairo font-semibold text-[12px] text-neutral-800">{fmtMoney(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#e8f5ee] border-t border-[#1a6b3c]/20">
                    <td colSpan={4} className="px-3 py-2 font-cairo font-bold text-[12px] text-[#1a6b3c]">الإجمالي الكلي</td>
                    <td className="px-3 py-2 font-cairo font-bold text-[14px] text-[#1a6b3c]">{fmtMoney(order.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {orderPayments.length > 0 && (
            <div>
              <h3 className="font-cairo font-bold text-[13px] text-neutral-700 mb-2">سجل التحصيلات</h3>
              <div className="space-y-2">
                {orderPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-green-50 border border-green-100 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                      <div>
                        <p className="font-cairo text-[12px] font-semibold text-green-800">{fmtMoney(p.amount)}</p>
                        <p className="font-cairo text-[10px] text-green-600">{fmtDate(p.date)} · {PAYMENT_METHOD_LABELS[p.method]}</p>
                      </div>
                    </div>
                    {p.notes && <p className="font-cairo text-[11px] text-neutral-500 max-w-[180px] truncate">{p.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {order.notes && (
            <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-3 flex gap-2">
              <AlertCircle size={14} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="font-cairo text-[12px] text-yellow-800">{order.notes}</p>
            </div>
          )}
        </div>
        <div className="flex justify-end px-5 py-4 border-t border-neutral-100 shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100">إغلاق</button>
        </div>
      </div>
    </div>
  )
}

const ALL_STATUSES: (SaleStatus | 'all')[] = ['all', 'pending', 'confirmed', 'partial', 'delivered', 'cancelled']
const FILTER_LABELS: Record<string, string> = { all: 'الكل', pending: 'معلق', confirmed: 'مؤكد', partial: 'جزئي', delivered: 'مسلّم', cancelled: 'ملغي' }

export default function SalesPage() {
  const [orders, setOrders]     = useState<SaleOrder[]>(initOrders)
  const [payments, setPayments] = useState<SalePayment[]>(initPayments)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState<SaleStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [collectOrder, setCollectOrder] = useState<SaleOrder | null>(null)
  const [viewOrder, setViewOrder]       = useState<SaleOrder | null>(null)

  const stats = useMemo(() => {
    const active    = orders.filter(o => o.status !== 'cancelled')
    const pending   = orders.filter(o => o.status === 'pending' || o.status === 'confirmed')
    const collected = active.reduce((s, o) => s + o.collectedAmount, 0)
    const balance   = active.reduce((s, o) => s + (o.totalAmount - o.collectedAmount), 0)
    return { count: active.length, pending: pending.length, collected, balance }
  }, [orders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter(o => {
      const matchQ = !q || o.customerName.includes(q) || o.orderNumber.toLowerCase().includes(q) || o.items.some(it => it.name.includes(q))
      const matchS = filterStatus === 'all' || o.status === filterStatus
      return matchQ && matchS
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [orders, search, filterStatus])

  const { page, setPage, totalPages, slice, total } = usePagination(filtered)

  function handleAddSale(form: SaleForm) {
    const items = form.items.map(it => ({ ...it, id: genId('item') }))
    const totalAmount = items.reduce((s, it) => s + it.total, 0)
    const newOrder: SaleOrder = {
      id: genId('so'), orderNumber: `SO-2026-${String(orders.length + 1).padStart(3, '0')}`,
      customerName: form.customerName, date: form.date, deliveryDate: form.deliveryDate || undefined,
      paymentMethod: form.paymentMethod as PaymentMethod || undefined,
      notes: form.notes || undefined, items, totalAmount, collectedAmount: 0, status: 'pending',
    }
    setOrders(prev => [newOrder, ...prev])
    setShowAddModal(false)
    toast.success('تم إنشاء أمر البيع', { description: `${newOrder.orderNumber} · ${fmtMoney(totalAmount)} · ${form.customerName}` })
  }

  function handleCollect(payment: SalePayment) {
    setPayments(prev => [payment, ...prev])
    setOrders(prev => prev.map(o => {
      if (o.id !== payment.orderId) return o
      const newCollected = o.collectedAmount + payment.amount
      const newStatus: SaleStatus = newCollected >= o.totalAmount ? (o.status === 'delivered' ? 'delivered' : 'confirmed') : 'partial'
      return { ...o, collectedAmount: newCollected, status: newStatus }
    }))
    setCollectOrder(null)
    toast.success('تم تسجيل التحصيل', { description: `${fmtMoney(payment.amount)} · ${PAYMENT_METHOD_LABELS[payment.method]}` })
  }

  function handleDeliver(order: SaleOrder) {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'delivered', deliveryDate: o.deliveryDate || todayStr() } : o))
    toast.success(`تم تأكيد تسليم ${order.orderNumber}`, { description: order.customerName })
  }

  function handleConfirm(order: SaleOrder) {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'confirmed' } : o))
    toast.success(`تم تأكيد ${order.orderNumber}`)
  }

  function handleCancel(order: SaleOrder) {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))
    toast.error(`تم إلغاء ${order.orderNumber}`)
  }

  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1280px] mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-800">المبيعات</h1>
            <p className="font-cairo text-[13px] text-neutral-400 mt-0.5">إدارة أوامر البيع والعملاء والتحصيلات</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-cairo text-[13px] font-semibold hover:bg-neutral-50">
              <Download size={15} /> تصدير
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a6b3c] text-white rounded-xl font-cairo text-[13px] font-semibold hover:bg-[#145730] active:scale-95 shadow-sm">
              <Plus size={16} /> أمر بيع جديد
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Tag} label="إجمالي الأوامر" value={String(stats.count)} color="primary" />
          <StatCard icon={Clock} label="أوامر قيد التنفيذ" value={String(stats.pending)} color="warning" />
          <StatCard icon={TrendingUp} label="إجمالي التحصيلات" value={fmtMoney(stats.collected)} color="success" />
          <StatCard icon={Wallet} label="المبالغ المستحقة" value={fmtMoney(stats.balance)} color={stats.balance > 0 ? 'error' : 'neutral'} />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-neutral-100">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="بحث بالعميل أو رقم الأمر أو الصنف..."
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 pr-9 pl-3 font-cairo text-[13px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition" />
              {search && <button onClick={() => setSearch('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"><X size={13} /></button>}
            </div>
            <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() => { setFilterStatus(s); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg font-cairo text-[12px] font-semibold transition-all ${filterStatus === s ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                  {FILTER_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {['رقم الأمر', 'العميل', 'التاريخ', 'الأصناف', 'الإجمالي', 'المحصّل', 'المتبقي', 'الحالة', 'عمليات'].map(h => (
                    <th key={h} className="px-4 py-3 font-cairo text-[11px] font-semibold text-neutral-500 text-right whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3"><Tag size={20} className="text-neutral-400" /></div>
                    <p className="font-cairo text-[13px] text-neutral-400">لا توجد أوامر بيع مطابقة</p>
                  </td></tr>
                ) : slice.map((order, i) => {
                  const remaining    = order.totalAmount - order.collectedAmount
                  const mainCategory = order.items[0]?.category ?? 'other'
                  const totalWeight  = order.items.reduce((s, it) => s + (it.weight ?? 0), 0)
                  return (
                    <tr key={order.id} className={`border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors ${i % 2 === 0 ? '' : 'bg-neutral-50/30'}`}>
                      <td className="px-4 py-3"><span className="font-cairo font-semibold text-[12px] text-[#1a6b3c]">{order.orderNumber}</span></td>
                      <td className="px-4 py-3">
                        <p className="font-cairo font-semibold text-[13px] text-neutral-800">{order.customerName}</p>
                        {order.paymentMethod && <p className="font-cairo text-[10px] text-neutral-400 mt-0.5">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-cairo text-[12px] text-neutral-600">{fmtDate(order.date)}</p>
                        {order.deliveryDate && <p className="font-cairo text-[10px] text-neutral-400 mt-0.5">تسليم: {fmtDate(order.deliveryDate)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-cairo text-[10px] font-semibold ${CATEGORY_COLOR[mainCategory]}`}>{SALE_CATEGORY_LABELS[mainCategory]}</span>
                          {order.items.length > 1 && <span className="font-cairo text-[10px] text-neutral-400">+{order.items.length - 1}</span>}
                        </div>
                        {totalWeight > 0 && <p className="font-cairo text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1"><Scale size={9} /> {totalWeight.toLocaleString('ar-EG')} كيلو</p>}
                      </td>
                      <td className="px-4 py-3 font-cairo font-semibold text-[13px] text-neutral-800 whitespace-nowrap">{fmtMoney(order.totalAmount)}</td>
                      <td className="px-4 py-3 font-cairo font-semibold text-[13px] text-green-600 whitespace-nowrap">{fmtMoney(order.collectedAmount)}</td>
                      <td className="px-4 py-3 font-cairo font-semibold text-[13px] whitespace-nowrap">
                        <span className={remaining > 0 ? 'text-orange-600' : 'text-neutral-400'}>{fmtMoney(remaining)}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewOrder(order)} title="عرض التفاصيل" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-[#1a6b3c] hover:bg-[#e8f5ee] transition-colors"><Eye size={14} /></button>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && remaining > 0 && (
                            <button onClick={() => setCollectOrder(order)} title="تحصيل دفعة" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 transition-colors"><CreditCard size={14} /></button>
                          )}
                          {order.status === 'pending' && (
                            <button onClick={() => handleConfirm(order)} title="تأكيد الأمر" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><CheckCircle2 size={14} /></button>
                          )}
                          {(order.status === 'confirmed' || order.status === 'partial') && (
                            <button onClick={() => handleDeliver(order)} title="تأكيد التسليم" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"><Truck size={14} /></button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button onClick={() => handleCancel(order)} title="إلغاء الأمر" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"><X size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      </div>
      {showAddModal  && <AddSaleModal onSave={handleAddSale} onClose={() => setShowAddModal(false)} />}
      {collectOrder  && <CollectModal order={collectOrder} onSave={handleCollect} onClose={() => setCollectOrder(null)} />}
      {viewOrder     && <ViewSaleModal order={viewOrder} payments={payments} onClose={() => setViewOrder(null)} />}
    </div>
  )
}
