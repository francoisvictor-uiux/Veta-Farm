import { useState, useMemo } from 'react'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import {
  Plus, Search, X, Edit2, Trash2, Eye,
  ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft,
  Phone, Mail, MapPin, Building2, User,
  Users, UserCheck, UserX, TrendingUp,
  CalendarDays, ShoppingBag, Filter, Wallet,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CustomerStatus = 'active' | 'inactive'
export type CustomerType = 'individual' | 'company' | 'slaughterhouse' | 'distributor'

export interface Customer {
  id: string
  name: string
  company: string
  phone: string
  email: string
  address: string
  type: CustomerType
  balance: number         // positive = they owe us, negative = we owe them (credit)
  status: CustomerStatus
  notes: string
  registeredAt: string
  lastOrderDate?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const INIT_CUSTOMERS: Customer[] = [
  { id:'c1',  name:'محمود سعيد عبده',         company:'مسلخ القاهرة الكبير',              phone:'01001234567', email:'mahmoud@cairo-slaught.com',    address:'القاهرة، الشرابية، المنطقة الصناعية الثانية',     type:'slaughterhouse', balance:142500, status:'active',   notes:'عميل منتظم، يشتري بالجملة كل أسبوعين',               registeredAt:'2021-05-12', lastOrderDate:'2026-03-18' },
  { id:'c2',  name:'كريم عاطف مرسي',          company:'شركة النيل للتوزيع الغذائي',       phone:'01507654321', email:'karim@nile-dist.com',           address:'الجيزة، الدقي، شارع التحرير',                     type:'distributor',    balance:76000,  status:'active',   notes:'موزع رئيسي في منطقة القاهرة الكبرى',                 registeredAt:'2021-08-20', lastOrderDate:'2026-03-10' },
  { id:'c3',  name:'أحمد حسن رزق',            company:'',                                 phone:'01209876543', email:'ahmed.r@gmail.com',            address:'القاهرة، عين شمس، شارع العباسية',                 type:'individual',     balance:24000,  status:'active',   notes:'يشتري عجول للمناسبات والمواسم',                       registeredAt:'2022-01-10', lastOrderDate:'2026-01-25' },
  { id:'c4',  name:'طارق محمود فتحي',         company:'مطاعم الفتحي',                     phone:'01012468135', email:'tarek@fathi-rest.com',          address:'القاهرة، المهندسين، شارع المساحة',                type:'company',        balance:46500,  status:'active',   notes:'سلسلة مطاعم، تحتاج توريد منتظم',                     registeredAt:'2022-03-15', lastOrderDate:'2026-02-28' },
  { id:'c5',  name:'عبدالرحمن سيد برعي',      company:'مسلخ الجيزة الجديد',               phone:'01551357924', email:'abdo@giza-slaught.com',         address:'الجيزة، المنطقة الصناعية، الطريق الدائري',        type:'slaughterhouse', balance:0,      status:'inactive', notes:'توقف التعامل بسبب خلاف في السعر',                     registeredAt:'2022-06-01', lastOrderDate:'2025-09-30' },
  { id:'c6',  name:'منى سعد حجاب',            company:'',                                 phone:'01008642097', email:'mona.h@hotmail.com',            address:'القاهرة، مدينة نصر، حي الأندلس',                  type:'individual',     balance:10500,  status:'active',   notes:'',                                                    registeredAt:'2022-09-20', lastOrderDate:'2026-03-05' },
  { id:'c7',  name:'ياسر إبراهيم مسعود',      company:'شركة الدلتا للتوزيع',              phone:'01203216549', email:'yasser@delta-co.com',           address:'المنصورة، حي الجامعة، شارع الجمهورية',            type:'distributor',    balance:158500, status:'active',   notes:'موزع موسمي، حجم أعلى في المواسم والأعياد',            registeredAt:'2022-11-05', lastOrderDate:'2026-03-20' },
  { id:'c8',  name:'نبيل حمدي الشيخ',         company:'مطعم الشيخ للمشويات',              phone:'01006549873', email:'nabil@sheikh-grill.com',        address:'القاهرة، الزيتون، شارع كلوت بك',                  type:'company',        balance:32000,  status:'active',   notes:'',                                                    registeredAt:'2023-01-18', lastOrderDate:'2026-02-14' },
  { id:'c9',  name:'هناء محمد سلامة',         company:'',                                 phone:'01024561237', email:'hanaa.s@yahoo.com',             address:'الإسكندرية، سيدي بشر، شارع الكورنيش',            type:'individual',     balance:-7500,  status:'active',   notes:'رصيد سالب = دفع مقدم على طلب قادم',                  registeredAt:'2023-04-22', lastOrderDate:'2026-03-12' },
  { id:'c10', name:'سامي علي درويش',          company:'شركة الصعيد للتجارة',              phone:'01507891234', email:'sami@saeed-trade.com',          address:'أسيوط، حي الجامعة، شارع الجمهورية',               type:'company',        balance:94500,  status:'active',   notes:'تشتري عجول التسمين للتصدير',                          registeredAt:'2023-06-10', lastOrderDate:'2026-01-30' },
  { id:'c11', name:'محمد عاطف نصر',           company:'مسلخ الشرقية المركزي',             phone:'01006667788', email:'med@sharqia-slaught.com',       address:'الزقازيق، حي الجامعة، طريق الإسماعيلية',         type:'slaughterhouse', balance:112000, status:'active',   notes:'أكبر عميل من منطقة الدلتا',                          registeredAt:'2023-08-01', lastOrderDate:'2026-03-22' },
  { id:'c12', name:'إيمان فريد طه',           company:'',                                 phone:'01209990011', email:'eman.t@gmail.com',              address:'الجيزة، المهندسين، شارع سوريا',                   type:'individual',     balance:16000,  status:'inactive', notes:'لم يتم التواصل منذ أكثر من 6 أشهر',                   registeredAt:'2023-09-15', lastOrderDate:'2025-08-20' },
  { id:'c13', name:'وائل حسن القاضي',         company:'سلسلة مطاعم القاضي',               phone:'01012223344', email:'wael@qadi-rest.com',            address:'القاهرة، المعادي، طريق الكورنيش',                 type:'company',        balance:58000,  status:'active',   notes:'يطلب أسبوعياً ويفضل الاستلام الذاتي',                registeredAt:'2023-11-02', lastOrderDate:'2026-03-17' },
  { id:'c14', name:'شيرين خالد حجازي',        company:'شركة حجازي للتوزيع الإقليمي',      phone:'01005556677', email:'shirin@hegazy-dist.com',        address:'القاهرة، الهرم، طريق الواحات الصحراوي',           type:'distributor',    balance:219000, status:'active',   notes:'أكبر موزع في منطقة القاهرة والجيزة، عقد سنوي',       registeredAt:'2024-01-08', lastOrderDate:'2026-03-19' },
  { id:'c15', name:'علي عبدالرحمن زغلول',     company:'',                                 phone:'01008889900', email:'ali.z@outlook.com',             address:'القاهرة، مدينة نصر، حي الأندلس',                  type:'individual',     balance:9000,   status:'active',   notes:'',                                                    registeredAt:'2024-03-20', lastOrderDate:'2026-02-08' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<CustomerType, { label: string; color: string; bg: string; dot: string }> = {
  individual:    { label:'فرد',          color:'text-neutral-600', bg:'bg-neutral-100', dot:'bg-neutral-400' },
  company:       { label:'شركة',         color:'text-primary-700', bg:'bg-primary-50',  dot:'bg-primary-500' },
  slaughterhouse:{ label:'مسلخ',         color:'text-error-700',   bg:'bg-error-50',    dot:'bg-error-500'   },
  distributor:   { label:'موزع',         color:'text-info-700',    bg:'bg-info-50',     dot:'bg-info-500'    },
}

const STATUS_CFG: Record<CustomerStatus, { label: string; color: string; bg: string; dot: string }> = {
  active:   { label:'نشط',     color:'text-success-700', bg:'bg-success-50',  dot:'bg-success-500' },
  inactive: { label:'غير نشط', color:'text-neutral-600', bg:'bg-neutral-100', dot:'bg-neutral-400' },
}

const TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value:'individual',     label:'فرد'   },
  { value:'company',        label:'شركة'  },
  { value:'slaughterhouse', label:'مسلخ'  },
  { value:'distributor',    label:'موزع'  },
]

const PAGE_SIZE = 8

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('ar-EG') + ' ج.م'
}

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

function genId() { return `c${Date.now()}` }

function emptyForm(): Omit<Customer, 'id'> {
  return {
    name: '', company: '', phone: '', email: '', address: '',
    type: 'individual', balance: 0, status: 'active', notes: '',
    registeredAt: new Date().toISOString().split('T')[0],
    lastOrderDate: '',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const slice = items.slice((safePage - 1) * pageSize, safePage * pageSize)
  return { page: safePage, setPage, totalPages, slice, total: items.length }
}

function Pagination({ page, totalPages, setPage, total, pageSize }: {
  page: number; totalPages: number; setPage: (p: number) => void; total: number; pageSize: number
}) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
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
          <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg font-cairo text-[12px] font-semibold transition-colors ${p === page ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}>{p}</button>
        ))}
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronLeft size={14} /></button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronsLeft size={14} /></button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// View Drawer
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, ltr }: { icon: React.ElementType; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-neutral-500" />
      </div>
      <div className="min-w-0">
        <p className="font-cairo text-[11px] text-neutral-400">{label}</p>
        <p className={`font-cairo text-[13px] text-neutral-700 font-medium break-all ${ltr ? 'direction-ltr text-right' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  )
}

function ViewDrawer({ customer, onClose, onEdit }: { customer: Customer; onClose: () => void; onEdit: () => void }) {
  const tp = TYPE_CFG[customer.type]
  const st = STATUS_CFG[customer.status]
  const balancePositive = customer.balance > 0
  const balanceZero = customer.balance === 0
  const balanceColor = balancePositive ? 'text-warning-600' : customer.balance < 0 ? 'text-success-600' : 'text-neutral-600'
  const balanceBg = balancePositive ? 'bg-warning-50 border-warning-100' : customer.balance < 0 ? 'bg-success-50 border-success-100' : 'bg-neutral-50 border-neutral-200'
  const balanceLabel = balancePositive ? 'مستحق علي العميل' : customer.balance < 0 ? 'رصيد دائن للعميل' : 'لا يوجد رصيد'

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" onClick={onClose} />
      <div
        dir="rtl"
        className="fixed inset-y-0 inset-inline-start-0 w-full max-w-[460px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-100">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center shrink-0">
              {customer.type === 'individual'
                ? <User size={22} className="text-success-600" />
                : <Building2 size={22} className="text-success-600" />
              }
            </div>
            <div>
              <h2 className="font-cairo font-bold text-[16px] text-neutral-800">{customer.name}</h2>
              <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">{customer.company || tp.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg font-cairo text-[12px] font-semibold hover:bg-primary-100 transition-colors"
            >
              <Edit2 size={13} />
              تعديل
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-cairo font-semibold ${st.bg} ${st.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-cairo font-semibold ${tp.bg} ${tp.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tp.dot}`} />
              {tp.label}
            </span>
          </div>

          {/* Balance */}
          {!balanceZero && (
            <div className={`rounded-xl p-4 border ${balanceBg}`}>
              <p className="font-cairo text-[11px] text-neutral-500 mb-1">{balanceLabel}</p>
              <p className={`font-cairo font-bold text-[22px] ${balanceColor}`}>
                {fmt(Math.abs(customer.balance))}
              </p>
            </div>
          )}

          {/* Contact */}
          <div>
            <p className="font-cairo font-semibold text-[12px] text-neutral-400 uppercase mb-3">بيانات التواصل</p>
            <div className="space-y-2.5">
              <InfoRow icon={Phone} label="الهاتف" value={customer.phone} ltr />
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={customer.email} ltr />
              <InfoRow icon={MapPin} label="العنوان" value={customer.address} />
              {customer.company && <InfoRow icon={Building2} label="الشركة / المؤسسة" value={customer.company} />}
            </div>
          </div>

          {/* Dates */}
          <div>
            <p className="font-cairo font-semibold text-[12px] text-neutral-400 uppercase mb-3">التواريخ</p>
            <div className="space-y-2.5">
              <InfoRow icon={CalendarDays} label="تاريخ التسجيل" value={fmtDate(customer.registeredAt)} />
              <InfoRow icon={ShoppingBag} label="آخر طلب" value={fmtDate(customer.lastOrderDate)} />
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div>
              <p className="font-cairo font-semibold text-[12px] text-neutral-400 uppercase mb-2">ملاحظات</p>
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <p className="font-cairo text-[13px] text-neutral-600 leading-relaxed">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer Modal (Add / Edit)
// ─────────────────────────────────────────────────────────────────────────────

function CustomerModal({
  initial, isEdit, onSave, onClose,
}: {
  initial: Omit<Customer, 'id'>
  isEdit: boolean
  onSave: (data: Omit<Customer, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Customer, 'id'>>(initial)
  const set = (k: keyof Omit<Customer, 'id'>, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const valid = form.name.trim() !== '' && form.phone.trim() !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-1 w-full bg-gradient-to-l from-success-400 to-success-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center">
              <User size={16} className="text-success-600" />
            </div>
            <h2 className="font-cairo font-bold text-[15px] text-neutral-800">
              {isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Name + Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
                اسم العميل <span className="text-error-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition"
              />
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">الشركة / المؤسسة</label>
              <input
                value={form.company}
                onChange={e => set('company', e.target.value)}
                placeholder="اختياري"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition"
              />
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
                رقم الهاتف <span className="text-error-500">*</span>
              </label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="05xxxxxxxx"
                dir="ltr"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition text-right"
              />
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">البريد الإلكتروني</label>
              <input
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition text-right"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">العنوان</label>
            <input
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="المدينة، الحي، الشارع"
              className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition"
            />
          </div>

          {/* Type */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">نوع العميل</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPE_OPTIONS.map(o => {
                const cfg = TYPE_CFG[o.value]
                const active = form.type === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set('type', o.value)}
                    className={`py-2 rounded-lg font-cairo text-[12px] font-semibold border transition-all ${
                      active ? `${cfg.bg} ${cfg.color} border-current` : 'bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">الحالة</label>
            <div className="flex gap-2">
              {(['active', 'inactive'] as CustomerStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 h-9 rounded-lg font-cairo text-[12px] font-semibold border transition-all ${
                    form.status === s
                      ? s === 'active'
                        ? 'bg-success-50 text-success-700 border-success-300'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                      : 'bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {STATUS_CFG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
              الرصيد <span className="font-normal text-neutral-400">(موجب = مستحق على العميل، سالب = رصيد دائن)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={form.balance}
                onChange={e => set('balance', parseFloat(e.target.value) || 0)}
                dir="ltr"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 pe-12 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition text-right"
              />
              <span className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 font-cairo text-[12px] text-neutral-400 pointer-events-none">ج.م</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">تاريخ التسجيل</label>
              <input
                type="date"
                value={form.registeredAt}
                onChange={e => set('registeredAt', e.target.value)}
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition"
              />
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">تاريخ آخر طلب</label>
              <input
                type="date"
                value={form.lastOrderDate ?? ''}
                onChange={e => set('lastOrderDate', e.target.value)}
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              placeholder="أي معلومات إضافية عن العميل..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => valid && onSave(form)}
            disabled={!valid}
            className="flex items-center gap-2 px-5 py-2 bg-success-600 text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-success-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {isEdit ? <><Edit2 size={14} /> حفظ التعديلات</> : <><Plus size={14} /> إضافة العميل</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, small }: {
  icon: React.ElementType; label: string; value: string; color: string; small?: boolean
}) {
  const colors: Record<string, { bg: string; icon: string; text: string }> = {
    success: { bg: 'bg-success-50',  icon: 'text-success-600',  text: 'text-success-700'  },
    primary: { bg: 'bg-primary-50',  icon: 'text-primary-600',  text: 'text-primary-700'  },
    neutral: { bg: 'bg-neutral-100', icon: 'text-neutral-500',  text: 'text-neutral-700'  },
    warning: { bg: 'bg-warning-50',  icon: 'text-warning-600',  text: 'text-warning-700'  },
  }
  const c = colors[color] ?? colors.primary
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={c.icon} />
      </div>
      <div className="min-w-0">
        <p className="font-cairo text-[11px] text-neutral-400 truncate">{label}</p>
        <p className={`font-cairo font-bold ${small ? 'text-[14px]' : 'text-[20px]'} ${c.text} leading-tight`}>{value}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<CustomerType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | 'all'>('all')

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const q = search.trim().toLowerCase()
      const matchQ = !q || c.name.includes(q) || c.company.includes(q) || c.phone.includes(q)
      const matchType = filterType === 'all' || c.type === filterType
      const matchSt = filterStatus === 'all' || c.status === filterStatus
      return matchQ && matchType && matchSt
    })
  }, [customers, search, filterType, filterStatus])

  const { page, setPage, totalPages, slice } = usePagination(filtered)

  const totalReceivable = customers.filter(c => c.balance > 0).reduce((a, c) => a + c.balance, 0)
  const activeCount = customers.filter(c => c.status === 'active').length
  const inactiveCount = customers.filter(c => c.status === 'inactive').length

  function handleAdd(data: Omit<Customer, 'id'>) {
    setCustomers(prev => [{ ...data, id: genId() }, ...prev])
    setShowAdd(false)
  }

  function handleEdit(data: Omit<Customer, 'id'>) {
    if (!editCustomer) return
    setCustomers(prev => prev.map(c => c.id === editCustomer.id ? { ...data, id: c.id } : c))
    if (viewCustomer?.id === editCustomer.id) setViewCustomer({ ...data, id: editCustomer.id })
    setEditCustomer(null)
  }

  function handleDelete() {
    if (!deleteCustomer) return
    setCustomers(prev => prev.filter(c => c.id !== deleteCustomer.id))
    if (viewCustomer?.id === deleteCustomer.id) setViewCustomer(null)
    setDeleteCustomer(null)
  }

  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1200px] mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-800">إدارة العملاء</h1>
            <p className="font-cairo text-[13px] text-neutral-400 mt-0.5">تتبع وإدارة عملاء المزرعة والذمم المدينة</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-success-600 text-white rounded-xl font-cairo text-[13px] font-semibold hover:bg-success-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={16} />
            عميل جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}     label="إجمالي العملاء"      value={String(customers.length)} color="success" />
          <StatCard icon={UserCheck} label="العملاء النشطون"      value={String(activeCount)}      color="primary" />
          <StatCard icon={UserX}     label="غير النشطين"          value={String(inactiveCount)}    color="neutral" />
          <StatCard icon={TrendingUp} label="إجمالي الذمم المدينة" value={fmt(totalReceivable)}     color="warning" small />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="بحث بالاسم أو الشركة أو الهاتف..."
              className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 ps-8 pe-3 font-cairo text-[13px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-success-300 focus:border-success-400 transition"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }} className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-neutral-400" />
            {/* Type filter */}
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value as CustomerType | 'all'); setPage(1) }}
              className="h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[12px] text-neutral-700 focus:outline-none focus:ring-2 focus:ring-success-300 transition"
            >
              <option value="all">كل الأنواع</option>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Status filter */}
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
              {([['all', 'الكل'], ['active', 'نشط'], ['inactive', 'غير نشط']] as [string, string][]).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => { setFilterStatus(v as CustomerStatus | 'all'); setPage(1) }}
                  className={`px-3 py-1.5 font-cairo text-[12px] font-semibold transition-colors ${
                    filterStatus === v ? 'bg-success-600 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {['العميل', 'النوع', 'الهاتف', 'الرصيد', 'آخر طلب', 'الحالة', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 font-cairo font-semibold text-[11px] text-neutral-500 uppercase whitespace-nowrap ${i === 6 ? 'w-10' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Users size={24} className="text-neutral-300" />
                        </div>
                        <p className="font-cairo text-[13px] text-neutral-400">لا يوجد عملاء مطابقون للبحث</p>
                      </div>
                    </td>
                  </tr>
                ) : slice.map(c => {
                  const tp = TYPE_CFG[c.type]
                  const st = STATUS_CFG[c.status]
                  const balColor = c.balance > 0 ? 'text-warning-600 font-semibold' : c.balance < 0 ? 'text-success-600 font-semibold' : 'text-neutral-500'
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setViewCustomer(c)}
                      className="group hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-success-50 flex items-center justify-center shrink-0 text-success-600">
                            {c.type === 'individual' ? <User size={16} /> : <Building2 size={16} />}
                          </div>
                          <div>
                            <p className="font-cairo font-semibold text-[13px] text-neutral-800">{c.name}</p>
                            <p className="font-cairo text-[11px] text-neutral-400">{c.company || '—'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold ${tp.bg} ${tp.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tp.dot}`} />
                          {tp.label}
                        </span>
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-3.5">
                        <span className="font-cairo text-[13px] text-neutral-600" dir="ltr">{c.phone}</span>
                      </td>
                      {/* Balance */}
                      <td className="px-4 py-3.5">
                        <span className={`font-cairo text-[13px] ${balColor}`}>
                          {c.balance === 0 ? '—' : fmt(Math.abs(c.balance))}
                        </span>
                      </td>
                      {/* Last order */}
                      <td className="px-4 py-3.5">
                        <span className="font-cairo text-[12px] text-neutral-500">{fmtDate(c.lastOrderDate)}</span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold ${st.bg} ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setViewCustomer(c)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="عرض"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setEditCustomer(c)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-warning-600 hover:bg-warning-50 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteCustomer(c)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-error-600 hover:bg-error-50 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        </div>
      </div>

      {/* Drawers & Modals */}
      {viewCustomer && (
        <ViewDrawer
          customer={viewCustomer}
          onClose={() => setViewCustomer(null)}
          onEdit={() => { setEditCustomer(viewCustomer); setViewCustomer(null) }}
        />
      )}

      {showAdd && (
        <CustomerModal
          initial={emptyForm()}
          isEdit={false}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editCustomer && (
        <CustomerModal
          initial={{ ...editCustomer }}
          isEdit
          onSave={handleEdit}
          onClose={() => setEditCustomer(null)}
        />
      )}

      {deleteCustomer && (
        <ConfirmDeleteModal
          itemName={deleteCustomer.name}
          itemType="العميل"
          onConfirm={handleDelete}
          onClose={() => setDeleteCustomer(null)}
        />
      )}
    </div>
  )
}
