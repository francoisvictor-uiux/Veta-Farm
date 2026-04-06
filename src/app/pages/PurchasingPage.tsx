import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Search, Plus, X, Download, ShoppingCart, Clock,
  CheckCircle2, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft,
  Eye, CreditCard, PackageCheck, Trash2, AlertCircle, FileText,
  TrendingDown, Wallet, ChevronDown,
} from 'lucide-react'
import {
  PurchaseOrder, PurchaseItem, PurchasePayment, PurchaseStatus,
  PurchaseCategory, PaymentMethod,
  PURCHASE_STATUS_LABELS, PAYMENT_METHOD_LABELS, PURCHASE_CATEGORY_LABELS,
} from '../types/purchasing'
import { purchaseOrders as initOrders, purchasePayments as initPayments } from '../data/purchasingData'
import { INIT_SUPPLIERS } from './SuppliersPage'
import SearchableSelect from '../components/ui/SearchableSelect'

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

const STATUS_CFG: Record<PurchaseStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: 'معلق',   color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  approved:  { label: 'معتمد',  color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
  received:  { label: 'مستلم',  color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-500'  },
  partial:   { label: 'جزئي',   color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  cancelled: { label: 'ملغي',   color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-400'    },
}

const CATEGORY_COLOR: Record<PurchaseCategory, string> = {
  feed:      'bg-lime-50 text-lime-700',
  medicine:  'bg-cyan-50 text-cyan-700',
  equipment: 'bg-violet-50 text-violet-700',
  cattle:    'bg-amber-50 text-amber-700',
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
        <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronsRight size={14} /></button>
        <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronRight size={14} /></button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
          <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg font-cairo text-[12px] font-semibold transition-colors ${p === page ? 'bg-[#1a6b3c] text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}>{p}</button>
        ))}
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronLeft size={14} /></button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronsLeft size={14} /></button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: PurchaseStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-cairo text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
const selectCls = inputCls + " appearance-none cursor-pointer"

const UNITS = ['طن', 'كيلو', 'لتر', 'عبوة', 'رأس', 'قطعة', 'رول', 'جرعة', 'كيس', 'صندوق']

interface OrderForm {
  supplierName: string; date: string; expectedDate: string; invoiceNumber: string
  paymentMethod: PaymentMethod | ''; notes: string; invoiceImage?: string | null; items: Omit<PurchaseItem, 'id'>[]
}

function emptyOrderForm(): OrderForm {
  return { supplierName: '', date: todayStr(), expectedDate: '', invoiceNumber: '', paymentMethod: '', notes: '', invoiceImage: null,
    items: [{ name: '', category: 'feed', quantity: 1, unit: 'طن', unitPrice: 0, total: 0 }] }
}

function AddOrderModal({ onSave, onClose }: { onSave: (form: OrderForm) => void; onClose: () => void }) {
  const [form, setForm] = useState<OrderForm>(emptyOrderForm())
  const set = <K extends keyof OrderForm>(k: K, v: OrderForm[K]) => setForm(f => ({ ...f, [k]: v }))

  function setItem(idx: number, field: keyof Omit<PurchaseItem, 'id'>, value: string | number) {
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

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: '', category: 'feed', quantity: 1, unit: 'طن', unitPrice: 0, total: 0 }] }))
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  const grandTotal = form.items.reduce((s, it) => s + it.total, 0)
  const valid = form.supplierName.trim() !== '' && form.items.length > 0 && form.items.every(it => it.name.trim() !== '' && it.total > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[92vh] flex flex-col overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-l from-[#1a6b3c] to-[#2d9e5f] shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center"><ShoppingCart size={15} className="text-[#1a6b3c]" /></div>
            <h2 className="font-cairo font-bold text-[15px] text-neutral-800">أمر شراء جديد</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="المورد" required>
              <SearchableSelect
                value={form.supplierName}
                onChange={v => set('supplierName', v)}
                options={INIT_SUPPLIERS.map(s => ({ label: s.name, value: s.name }))}
                placeholder="اختر المورد..."
                className={inputCls}
              />
            </Field>
            <Field label="رقم الفاتورة"><input value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} placeholder="INV-..." className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="تاريخ الطلب"><input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} /></Field>
            <Field label="التاريخ المتوقع للاستلام"><input type="date" value={form.expectedDate} onChange={e => set('expectedDate', e.target.value)} className={inputCls} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="طريقة الدفع">
              <div className="relative">
                <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value as PaymentMethod)} className={selectCls}>
                  <option value="">اختر...</option>
                  {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </Field>
            <Field label="صورة الفاتورة (اختياري)">
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) set('invoiceImage', URL.createObjectURL(file))
                }} className="w-full text-[12px] text-neutral-500 file:ml-2 file:py-1.5 file:px-3 file:rounded-[8px] file:border-0 file:text-[11px] file:font-semibold file:bg-[#e8f5ee] file:text-[#1a6b3c] hover:file:bg-[#d4eddf] cursor-pointer" />
                {form.invoiceImage && <img src={form.invoiceImage} alt="فاتورة" className="h-9 w-12 rounded object-cover cursor-pointer hover:opacity-80" onClick={() => window.open(form.invoiceImage!)} />}
              </div>
            </Field>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-cairo text-[12px] font-semibold text-neutral-600">الأصناف <span className="text-red-500">*</span></label>
              <button onClick={addItem} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e8f5ee] text-[#1a6b3c] font-cairo text-[11px] font-semibold hover:bg-[#d4eddf] transition-colors"><Plus size={12} /> إضافة صنف</button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2">
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input value={item.name} onChange={e => setItem(idx, 'name', e.target.value)} placeholder="اسم الصنف..." className={inputCls} />
                    <button onClick={() => removeItem(idx)} disabled={form.items.length === 1} className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="relative">
                      <select value={item.category} onChange={e => setItem(idx, 'category', e.target.value as PurchaseCategory)} className={selectCls + ' text-[12px]'}>
                        {(Object.entries(PURCHASE_CATEGORY_LABELS) as [PurchaseCategory, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    </div>
                    <input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e => setItem(idx, 'quantity', parseFloat(e.target.value) || 0)} placeholder="الكمية" className={inputCls + ' text-[12px]'} />
                    <div className="relative">
                      <select value={item.unit} onChange={e => setItem(idx, 'unit', e.target.value)} className={selectCls + ' text-[12px]'}>
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
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
            <span className="font-cairo text-[13px] font-semibold text-[#1a6b3c]">إجمالي الأمر</span>
            <span className="font-cairo font-bold text-[18px] text-[#1a6b3c]">{fmtMoney(grandTotal)}</span>
          </div>
          <Field label="ملاحظات">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="أي ملاحظات إضافية..." className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition resize-none" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100">إلغاء</button>
          <button onClick={() => valid && onSave(form)} disabled={!valid} className="flex items-center gap-2 px-5 py-2 bg-[#1a6b3c] text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-[#145730] disabled:opacity-40 disabled:pointer-events-none">
            <Plus size={14} /> حفظ الأمر
          </button>
        </div>
      </div>
    </div>
  )
}

function PaymentModal({ order, onSave, onClose }: { order: PurchaseOrder; onSave: (payment: PurchasePayment) => void; onClose: () => void }) {
  const remaining = order.totalAmount - order.paidAmount
  const [amount, setAmount] = useState(String(remaining))
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [date, setDate]     = useState(todayStr())
  const [notes, setNotes]   = useState('')
  const valid = parseFloat(amount) > 0 && parseFloat(amount) <= remaining

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-l from-green-600 to-emerald-400" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><CreditCard size={15} className="text-green-600" /></div>
            <div>
              <h2 className="font-cairo font-bold text-[14px] text-neutral-800">تسجيل دفعة</h2>
              <p className="font-cairo text-[11px] text-neutral-400">{order.orderNumber} · {order.supplierName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3">
            <div><p className="font-cairo text-[10px] text-neutral-400">الإجمالي</p><p className="font-cairo font-bold text-[14px] text-neutral-800">{fmtMoney(order.totalAmount)}</p></div>
            <div><p className="font-cairo text-[10px] text-neutral-400">المتبقي</p><p className="font-cairo font-bold text-[14px] text-red-600">{fmtMoney(remaining)}</p></div>
          </div>
          <Field label="المبلغ (ج.م)" required>
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
            <Field label="تاريخ الدفع"><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="ملاحظات">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="سبب الدفعة..." className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition resize-none" />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100">إلغاء</button>
          <button onClick={() => valid && onSave({ id: genId('pp'), orderId: order.id, date, amount: parseFloat(amount), method, notes: notes || undefined })} disabled={!valid} className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-green-700 disabled:opacity-40 disabled:pointer-events-none">
            <CreditCard size={14} /> تأكيد الدفعة
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewOrderModal({ order, payments, onClose }: { order: PurchaseOrder; payments: PurchasePayment[]; onClose: () => void }) {
  const remaining = order.totalAmount - order.paidAmount
  const orderPayments = payments.filter(p => p.orderId === order.id)
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
              <p className="font-cairo text-[11px] text-neutral-400">{order.supplierName} · {fmtDate(order.date)}</p>
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
              { label: 'المدفوع', value: fmtMoney(order.paidAmount), cls: 'text-green-600' },
              { label: 'المتبقي', value: fmtMoney(remaining), cls: remaining > 0 ? 'text-red-600' : 'text-neutral-400' },
            ].map(c => (
              <div key={c.label} className="rounded-xl bg-neutral-50 border border-neutral-100 p-3 text-center">
                <p className="font-cairo text-[10px] text-neutral-400 mb-0.5">{c.label}</p>
                <p className={`font-cairo font-bold text-[14px] ${c.cls}`}>{c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {order.invoiceNumber && <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5"><span className="font-cairo text-[12px] text-neutral-400">رقم الفاتورة</span><span className="font-cairo font-semibold text-[12px] text-neutral-700">{order.invoiceNumber}</span></div>}
            {order.paymentMethod && <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5"><span className="font-cairo text-[12px] text-neutral-400">طريقة الدفع</span><span className="font-cairo font-semibold text-[12px] text-neutral-700">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span></div>}
            {order.expectedDate && <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5"><span className="font-cairo text-[12px] text-neutral-400">موعد الاستلام</span><span className="font-cairo font-semibold text-[12px] text-neutral-700">{fmtDate(order.expectedDate)}</span></div>}
            {order.receivedDate && <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5"><span className="font-cairo text-[12px] text-neutral-400">تاريخ الاستلام</span><span className="font-cairo font-semibold text-[12px] text-green-600">{fmtDate(order.receivedDate)}</span></div>}
          </div>
          {order.invoiceImage && (
            <div>
              <h3 className="font-cairo font-bold text-[13px] text-neutral-700 mb-2">صورة الفاتورة المرفقة</h3>
              <a href={order.invoiceImage} target="_blank" rel="noreferrer">
                <img src={order.invoiceImage} alt="فاتورة" className="rounded-xl w-full max-h-[300px] object-cover border border-neutral-200 hover:opacity-90 transition-opacity" />
              </a>
            </div>
          )}
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
                      <td className="px-3 py-2 font-cairo text-[12px] font-semibold text-neutral-800">{item.name}</td>
                      <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full font-cairo text-[10px] font-semibold ${CATEGORY_COLOR[item.category]}`}>{PURCHASE_CATEGORY_LABELS[item.category]}</span></td>
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
              <h3 className="font-cairo font-bold text-[13px] text-neutral-700 mb-2">سجل المدفوعات</h3>
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

const ALL_STATUSES: (PurchaseStatus | 'all')[] = ['all', 'pending', 'approved', 'partial', 'received', 'cancelled']
const FILTER_LABELS: Record<string, string> = { all: 'الكل', pending: 'معلق', approved: 'معتمد', partial: 'جزئي', received: 'مستلم', cancelled: 'ملغي' }

export default function PurchasingPage() {
  const [orders, setOrders]     = useState<PurchaseOrder[]>(initOrders)
  const [payments, setPayments] = useState<PurchasePayment[]>(initPayments)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState<PurchaseStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [payOrder, setPayOrder]   = useState<PurchaseOrder | null>(null)
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null)

  const stats = useMemo(() => {
    const total   = orders.filter(o => o.status !== 'cancelled')
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'approved')
    const paid    = total.reduce((s, o) => s + o.paidAmount, 0)
    const balance = total.reduce((s, o) => s + (o.totalAmount - o.paidAmount), 0)
    return { count: total.length, pending: pending.length, paid, balance }
  }, [orders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter(o => {
      const matchQ = !q || o.supplierName.includes(q) || o.orderNumber.toLowerCase().includes(q) || o.items.some(it => it.name.includes(q))
      const matchS = filterStatus === 'all' || o.status === filterStatus
      return matchQ && matchS
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [orders, search, filterStatus])

  const { page, setPage, totalPages, slice, total } = usePagination(filtered)

  function handleAddOrder(form: OrderForm) {
    const items = form.items.map(it => ({ ...it, id: genId('item') }))
    const totalAmount = items.reduce((s, it) => s + it.total, 0)
    const newOrder: PurchaseOrder = {
      id: genId('po'), orderNumber: `PO-2026-${String(orders.length + 1).padStart(3, '0')}`,
      supplierName: form.supplierName, date: form.date, expectedDate: form.expectedDate || undefined,
      invoiceNumber: form.invoiceNumber || undefined, paymentMethod: form.paymentMethod as PaymentMethod || undefined,
      notes: form.notes || undefined, invoiceImage: form.invoiceImage || undefined, items, totalAmount, paidAmount: 0, status: 'pending',
    }
    setOrders(prev => [newOrder, ...prev])
    setShowAddModal(false)
    toast.success('تم إنشاء أمر الشراء', { description: `${newOrder.orderNumber} · ${fmtMoney(totalAmount)} · ${form.supplierName}` })
  }

  function handlePayment(payment: PurchasePayment) {
    setPayments(prev => [payment, ...prev])
    setOrders(prev => prev.map(o => {
      if (o.id !== payment.orderId) return o
      const newPaid = o.paidAmount + payment.amount
      const newStatus: PurchaseStatus = newPaid >= o.totalAmount ? (o.status === 'received' ? 'received' : 'approved') : 'partial'
      return { ...o, paidAmount: newPaid, status: newPaid >= o.totalAmount && o.status === 'received' ? 'received' : newStatus }
    }))
    setPayOrder(null)
    toast.success('تم تسجيل الدفعة', { description: `${fmtMoney(payment.amount)} · ${PAYMENT_METHOD_LABELS[payment.method]}` })
  }

  function handleReceive(order: PurchaseOrder) {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'received', receivedDate: todayStr() } : o))
    toast.success(`تم تأكيد استلام ${order.orderNumber}`, { description: order.supplierName })
  }

  function handleCancel(order: PurchaseOrder) {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))
    toast.error(`تم إلغاء ${order.orderNumber}`)
  }

  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1280px] mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-800">المشتريات</h1>
            <p className="font-cairo text-[13px] text-neutral-400 mt-0.5">إدارة أوامر الشراء والموردين والمدفوعات</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-cairo text-[13px] font-semibold hover:bg-neutral-50">
              <Download size={15} /> تصدير
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1a6b3c] text-white rounded-xl font-cairo text-[13px] font-semibold hover:bg-[#145730] active:scale-95 shadow-sm">
              <Plus size={16} /> أمر شراء جديد
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingCart} label="إجمالي الأوامر" value={String(stats.count)} color="primary" />
          <StatCard icon={Clock} label="أوامر معلقة" value={String(stats.pending)} color="warning" />
          <StatCard icon={Wallet} label="إجمالي المدفوعات" value={fmtMoney(stats.paid)} color="success" />
          <StatCard icon={TrendingDown} label="المبالغ المتبقية" value={fmtMoney(stats.balance)} color={stats.balance > 0 ? 'error' : 'neutral'} />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-neutral-100">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="بحث بالمورد أو رقم الأمر أو الصنف..."
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 pr-9 pl-3 font-cairo text-[13px] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition" />
              {search && <button onClick={() => setSearch('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"><X size={13} /></button>}
            </div>
            <div className="relative shrink-0 w-[160px]">
              <select 
                value={filterStatus} 
                onChange={e => { setFilterStatus(e.target.value as any); setPage(1) }}
                className="w-full h-9 rounded-lg border border-neutral-200 bg-white px-3 font-cairo text-[12px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition appearance-none"
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{FILTER_LABELS[s]}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute inset-inline-end-auto inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {['رقم الأمر', 'المورد', 'التاريخ', 'الأصناف', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة', 'عمليات'].map(h => (
                    <th key={h} className="px-4 py-3 font-cairo text-[11px] font-semibold text-neutral-500 text-right whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-3"><ShoppingCart size={20} className="text-neutral-400" /></div>
                    <p className="font-cairo text-[13px] text-neutral-400">لا توجد أوامر شراء مطابقة</p>
                  </td></tr>
                ) : slice.map((order, i) => {
                  const remaining = order.totalAmount - order.paidAmount
                  const mainCategory = order.items[0]?.category ?? 'other'
                  return (
                    <tr key={order.id} className={`border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors ${i % 2 === 0 ? '' : 'bg-neutral-50/30'}`}>
                      <td className="px-4 py-3"><span className="font-cairo font-semibold text-[12px] text-[#1a6b3c]">{order.orderNumber}</span></td>
                      <td className="px-4 py-3">
                        <p className="font-cairo font-semibold text-[13px] text-neutral-800">{order.supplierName}</p>
                        {order.invoiceNumber && <p className="font-cairo text-[10px] text-neutral-400 mt-0.5">{order.invoiceNumber}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-cairo text-[12px] text-neutral-600">{fmtDate(order.date)}</p>
                        {order.expectedDate && <p className="font-cairo text-[10px] text-neutral-400 mt-0.5">متوقع: {fmtDate(order.expectedDate)}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-cairo text-[10px] font-semibold ${CATEGORY_COLOR[mainCategory]}`}>{PURCHASE_CATEGORY_LABELS[mainCategory]}</span>
                        {order.items.length > 1 && <span className="font-cairo text-[10px] text-neutral-400 mr-1">+{order.items.length - 1}</span>}
                      </td>
                      <td className="px-4 py-3 font-cairo font-semibold text-[13px] text-neutral-800 whitespace-nowrap">{fmtMoney(order.totalAmount)}</td>
                      <td className="px-4 py-3 font-cairo font-semibold text-[13px] text-green-600 whitespace-nowrap">{fmtMoney(order.paidAmount)}</td>
                      <td className="px-4 py-3 font-cairo font-semibold text-[13px] whitespace-nowrap">
                        <span className={remaining > 0 ? 'text-red-600' : 'text-neutral-400'}>{fmtMoney(remaining)}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewOrder(order)} title="عرض التفاصيل" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-[#1a6b3c] hover:bg-[#e8f5ee] transition-colors"><Eye size={14} /></button>
                          {order.status !== 'received' && order.status !== 'cancelled' && remaining > 0 && (
                            <button onClick={() => setPayOrder(order)} title="تسجيل دفعة" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 transition-colors"><CreditCard size={14} /></button>
                          )}
                          {(order.status === 'pending' || order.status === 'approved') && (
                            <button onClick={() => handleReceive(order)} title="تأكيد الاستلام" className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><PackageCheck size={14} /></button>
                          )}
                          {(order.status === 'pending' || order.status === 'approved') && (
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
      {showAddModal && <AddOrderModal onSave={handleAddOrder} onClose={() => setShowAddModal(false)} />}
      {payOrder    && <PaymentModal order={payOrder} onSave={handlePayment} onClose={() => setPayOrder(null)} />}
      {viewOrder   && <ViewOrderModal order={viewOrder} payments={payments} onClose={() => setViewOrder(null)} />}
    </div>
  )
}
