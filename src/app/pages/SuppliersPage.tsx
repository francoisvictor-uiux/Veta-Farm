import { useState, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import {
  Plus, Search, X, Edit2, Trash2, Eye,
  ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft,
  Phone, Mail, MapPin, Building2, Tag, Wallet,
  PackageSearch, Users, UserCheck, UserX, TrendingDown,
  StickyNote, CalendarDays, ShoppingCart, Filter,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SupplierStatus = 'active' | 'inactive'
export type SupplierCategory = 'feed' | 'medicine' | 'equipment' | 'other'

export interface Supplier {
  id: string
  name: string
  company: string
  phone: string
  email: string
  address: string
  category: SupplierCategory
  balance: number          // positive = we owe them, negative = they owe us
  status: SupplierStatus
  notes: string
  registeredAt: string
  lastOrderDate?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const INIT_SUPPLIERS: Supplier[] = [
  { id:'s1',  name:'حسام محمود النجار',       company:'شركة النيل للأعلاف',               phone:'01001234567', email:'hossam@nile-feed.com',       address:'القاهرة، مدينة نصر، شارع عباس العقاد',             category:'feed',      balance:72500,  status:'active',   notes:'مورد رئيسي للأعلاف، يوفر خصماً 5% عند الدفع الفوري',  registeredAt:'2021-03-10', lastOrderDate:'2026-03-15' },
  { id:'s2',  name:'طارق رمضان حسين',         company:'مؤسسة الدلتا الطبية البيطرية',     phone:'01507654321', email:'tarek@delta-vet.com',         address:'الجيزة، المهندسين، شارع جامعة الدول العربية',       category:'medicine',  balance:41000,  status:'active',   notes:'متخصص في الأدوية واللقاحات البيطرية',                  registeredAt:'2021-06-20', lastOrderDate:'2026-02-28' },
  { id:'s3',  name:'كريم عبدالله الشيخ',      company:'الصعيد للمعدات الزراعية',          phone:'01209876543', email:'karim@saeed-agri.com',        address:'أسيوط، حي الوليدية، شارع النصر',                   category:'equipment', balance:160000, status:'active',   notes:'يوفر معدات الحلب والتبريد بضمان سنة',                  registeredAt:'2020-11-05', lastOrderDate:'2026-01-20' },
  { id:'s4',  name:'مصطفى حمدي البدوي',       company:'مزارع الشرقية للأعلاف',           phone:'01012468135', email:'mostafa@sharqia-farms.com',   address:'الزقازيق، حي الجامعة، طريق القاهرة',               category:'feed',      balance:28000,  status:'active',   notes:'',                                                     registeredAt:'2022-01-15', lastOrderDate:'2026-03-10' },
  { id:'s5',  name:'إبراهيم سالم القاضي',     company:'مستلزمات البيطرة الشرقية',         phone:'01551357924', email:'ibrahim@eastern-vet.com',     address:'المنصورة، حي الجمهورية، شارع الجيش',               category:'medicine',  balance:0,      status:'inactive', notes:'توقف التعامل بعد انتهاء العقد',                        registeredAt:'2021-09-01', lastOrderDate:'2025-06-30' },
  { id:'s6',  name:'وائل سعد منصور',          company:'شركة السادات للتجهيزات الزراعية',  phone:'01008642097', email:'wael@sadat-agri.com',         address:'بني سويف، المنطقة الصناعية، طريق الفيوم',          category:'equipment', balance:93750,  status:'active',   notes:'مورد معدات الري وأنظمة التبريد',                       registeredAt:'2022-04-22', lastOrderDate:'2026-02-05' },
  { id:'s7',  name:'دينا عمر الجندي',         company:'شركة الجندي للأدوية البيطرية',     phone:'01203216549', email:'dina@gundi-pharma.com',       address:'الإسكندرية، محرم بك، شارع أبو قير',                category:'medicine',  balance:61500,  status:'active',   notes:'وكيل حصري لعدة شركات أدوية أوروبية',                  registeredAt:'2022-07-11', lastOrderDate:'2026-03-01' },
  { id:'s8',  name:'عادل فريد حافظ',          company:'مؤسسة الفيوم للأعلاف المركزة',    phone:'01006549873', email:'adel@fayoum-conc.com',        address:'الفيوم، حي المحطة، طريق القاهرة',                  category:'feed',      balance:-16000, status:'active',   notes:'رصيد سالب = المورد يدين لنا بدفعة مرتجعة',            registeredAt:'2022-09-18', lastOrderDate:'2026-03-20' },
  { id:'s9',  name:'هاني نبيل درويش',         company:'الشروق للتجارة العامة',            phone:'01024561237', email:'hany@shorouk-trade.com',      address:'القاهرة، مصر الجديدة، شارع ميرامار',               category:'other',     balance:34500,  status:'active',   notes:'يوفر مواد التعبئة والتغليف',                           registeredAt:'2023-01-05', lastOrderDate:'2026-01-28' },
  { id:'s10', name:'رانيا خالد شلبي',         company:'شلبي للاستيراد والتصدير',          phone:'01507891234', email:'rania@shalaby-import.com',    address:'القاهرة، المعادي، شارع كورنيش النيل',              category:'equipment', balance:127500, status:'active',   notes:'مستورد معدات ماشية من هولندا وألمانيا',                registeredAt:'2023-03-12', lastOrderDate:'2026-02-14' },
  { id:'s11', name:'عمر طه زيدان',            company:'مؤسسة المنيا للأعلاف',             phone:'01006667788', email:'omar@minya-feed.com',         address:'المنيا، حي الكورنيش، شارع الجمهورية',              category:'feed',      balance:45500,  status:'inactive', notes:'يوجد نزاع في الفاتورة الأخيرة، تم تجميد التعامل',      registeredAt:'2023-05-20', lastOrderDate:'2025-11-30' },
  { id:'s12', name:'ياسمين سامي الغزالي',     company:'الغزالي للتقنيات الزراعية',        phone:'01209990011', email:'yasmine@ghazali-agtech.com',  address:'الجيزة، الشيخ زايد، المحور المركزي',               category:'equipment', balance:206000, status:'active',   notes:'متخصص في أنظمة الإدارة الذكية للمزارع',               registeredAt:'2023-08-01', lastOrderDate:'2026-03-18' },
  { id:'s13', name:'وليد أحمد شعبان',         company:'شركة الخليج للمواشي',              phone:'01001234500', email:'walid@gulf-cattle.com',       address:'الإسماعيلية، المنطقة الصناعية، طريق القنال',        category:'other',     balance:0,      status:'active',   notes:'مورد رؤوس الماشية والخراف، يتعامل بالجملة',           registeredAt:'2020-05-15', lastOrderDate:'2026-03-27' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_CFG: Record<SupplierCategory, { label: string; color: string; bg: string; dot: string }> = {
  feed:      { label:'أعلاف',          color:'text-warning-700', bg:'bg-warning-50',  dot:'bg-warning-500' },
  medicine:  { label:'أدوية',          color:'text-success-700', bg:'bg-success-50',  dot:'bg-success-500' },
  equipment: { label:'معدات وتجهيزات', color:'text-info-700',    bg:'bg-info-50',     dot:'bg-info-500'    },
  other:     { label:'أخرى',           color:'text-neutral-600', bg:'bg-neutral-100', dot:'bg-neutral-400' },
}

const STATUS_CFG: Record<SupplierStatus, { label: string; color: string; bg: string; dot: string }> = {
  active:   { label:'نشط',     color:'text-success-700', bg:'bg-success-50',  dot:'bg-success-500' },
  inactive: { label:'غير نشط', color:'text-neutral-600', bg:'bg-neutral-100', dot:'bg-neutral-400' },
}

const CATEGORY_OPTIONS: { value: SupplierCategory; label: string }[] = [
  { value:'feed',      label:'أعلاف' },
  { value:'medicine',  label:'أدوية' },
  { value:'equipment', label:'معدات وتجهيزات' },
  { value:'other',     label:'أخرى' },
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

function genId() { return `s${Date.now()}` }

// ─────────────────────────────────────────────────────────────────────────────
// Empty Form
// ─────────────────────────────────────────────────────────────────────────────

function emptyForm(): Omit<Supplier, 'id'> {
  return {
    name: '', company: '', phone: '', email: '', address: '',
    category: 'feed', balance: 0, status: 'active', notes: '',
    registeredAt: new Date().toISOString().split('T')[0],
    lastOrderDate: '',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination hook
// ─────────────────────────────────────────────────────────────────────────────

function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const slice = items.slice((safePage - 1) * pageSize, safePage * pageSize)
  return { page: safePage, setPage, totalPages, slice, total: items.length }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination Component
// ─────────────────────────────────────────────────────────────────────────────

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

function ViewDrawer({ supplier, onClose, onEdit }: { supplier: Supplier; onClose: () => void; onEdit: () => void }) {
  const cat = CATEGORY_CFG[supplier.category]
  const st = STATUS_CFG[supplier.status]
  const balanceColor = supplier.balance > 0 ? 'text-error-600' : supplier.balance < 0 ? 'text-success-600' : 'text-neutral-600'
  const balanceLabel = supplier.balance > 0 ? 'مديونية علينا' : supplier.balance < 0 ? 'رصيد لصالحنا' : 'لا يوجد رصيد'

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
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-cairo font-bold text-[16px] text-neutral-800">{supplier.name}</h2>
              <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">{supplier.company}</p>
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
          {/* Status + Category badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-cairo font-semibold ${st.bg} ${st.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-cairo font-semibold ${cat.bg} ${cat.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
              {cat.label}
            </span>
          </div>

          {/* Balance card */}
          <div className={`rounded-xl p-4 border ${supplier.balance > 0 ? 'bg-error-50 border-error-100' : supplier.balance < 0 ? 'bg-success-50 border-success-100' : 'bg-neutral-50 border-neutral-200'}`}>
            <p className="font-cairo text-[11px] text-neutral-500 mb-1">{balanceLabel}</p>
            <p className={`font-cairo font-bold text-[22px] ${balanceColor}`}>
              {fmt(Math.abs(supplier.balance))}
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="font-cairo font-semibold text-[12px] text-neutral-400 uppercase mb-3">بيانات التواصل</p>
            <div className="space-y-2.5">
              <InfoRow icon={Phone} label="الهاتف" value={supplier.phone} dir="ltr" />
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={supplier.email} dir="ltr" />
              <InfoRow icon={MapPin} label="العنوان" value={supplier.address} />
            </div>
          </div>

          {/* Dates */}
          <div>
            <p className="font-cairo font-semibold text-[12px] text-neutral-400 uppercase mb-3">التواريخ</p>
            <div className="space-y-2.5">
              <InfoRow icon={CalendarDays} label="تاريخ التسجيل" value={fmtDate(supplier.registeredAt)} />
              <InfoRow icon={ShoppingCart} label="آخر طلب" value={fmtDate(supplier.lastOrderDate)} />
            </div>
          </div>

          {/* Notes */}
          {supplier.notes && (
            <div>
              <p className="font-cairo font-semibold text-[12px] text-neutral-400 uppercase mb-2">ملاحظات</p>
              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <p className="font-cairo text-[13px] text-neutral-600 leading-relaxed">{supplier.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function InfoRow({ icon: Icon, label, value, dir: d }: { icon: React.ElementType; label: string; value: string; dir?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-neutral-500" />
      </div>
      <div className="min-w-0">
        <p className="font-cairo text-[11px] text-neutral-400">{label}</p>
        <p className={`font-cairo text-[13px] text-neutral-700 font-medium break-all ${d === 'ltr' ? 'direction-ltr text-right' : ''}`}>{value || '—'}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Supplier Modal (Add / Edit)
// ─────────────────────────────────────────────────────────────────────────────

function SupplierModal({
  initial, isEdit, onSave, onClose,
}: {
  initial: Omit<Supplier, 'id'>
  isEdit: boolean
  onSave: (data: Omit<Supplier, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(initial)
  const set = (k: keyof Omit<Supplier, 'id'>, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const valid = form.name.trim() !== '' && form.phone.trim() !== ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[500px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Gradient accent */}
        <div className="h-1 w-full bg-gradient-to-l from-primary-400 to-primary-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Building2 size={16} className="text-primary-600" />
            </div>
            <h2 className="font-cairo font-bold text-[15px] text-neutral-800">
              {isEdit ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
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
                اسم المورد <span className="text-error-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="الاسم الكامل"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
              />
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">اسم الشركة / المؤسسة</label>
              <input
                value={form.company}
                onChange={e => set('company', e.target.value)}
                placeholder="الشركة أو المؤسسة"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
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
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition text-right"
              />
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">البريد الإلكتروني</label>
              <input
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com"
                dir="ltr"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition text-right"
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
              className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">الفئة</label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value as SupplierCategory)}
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
              >
                {CATEGORY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">الحالة</label>
              <div className="flex gap-2 mt-1">
                {(['active', 'inactive'] as SupplierStatus[]).map(s => (
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
          </div>

          {/* Balance */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
              الرصيد <span className="font-normal text-neutral-400">(موجب = مديونية علينا، سالب = لصالحنا)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={form.balance}
                onChange={e => set('balance', parseFloat(e.target.value) || 0)}
                dir="ltr"
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 pe-12 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition text-right"
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
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
              />
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">تاريخ آخر طلب</label>
              <input
                type="date"
                value={form.lastOrderDate ?? ''}
                onChange={e => set('lastOrderDate', e.target.value)}
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
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
              placeholder="أي معلومات إضافية عن المورد..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition resize-none"
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
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {isEdit ? <><Edit2 size={14} /> حفظ التعديلات</> : <><Plus size={14} /> إضافة المورد</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('vetafarm_suppliers', INIT_SUPPLIERS)

  // Filters
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<SupplierCategory | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<SupplierStatus | 'all'>('all')

  // Modals
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  // Filtered list
  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      const q = search.trim().toLowerCase()
      const matchQ = !q || s.name.includes(q) || s.company.includes(q) || s.phone.includes(q)
      const matchCat = filterCategory === 'all' || s.category === filterCategory
      const matchSt = filterStatus === 'all' || s.status === filterStatus
      return matchQ && matchCat && matchSt
    })
  }, [suppliers, search, filterCategory, filterStatus])

  const { page, setPage, totalPages, slice } = usePagination(filtered)

  // Stats
  const totalBalance = suppliers.filter(s => s.balance > 0).reduce((a, s) => a + s.balance, 0)
  const activeCount = suppliers.filter(s => s.status === 'active').length
  const inactiveCount = suppliers.filter(s => s.status === 'inactive').length

  // Handlers
  function handleAdd(data: Omit<Supplier, 'id'>) {
    setSuppliers(prev => [{ ...data, id: genId() }, ...prev])
    setShowAdd(false)
  }

  function handleEdit(data: Omit<Supplier, 'id'>) {
    if (!editSupplier) return
    setSuppliers(prev => prev.map(s => s.id === editSupplier.id ? { ...data, id: s.id } : s))
    if (viewSupplier?.id === editSupplier.id) setViewSupplier({ ...data, id: editSupplier.id })
    setEditSupplier(null)
  }

  function handleDelete() {
    if (!deleteSupplier) return
    setSuppliers(prev => prev.filter(s => s.id !== deleteSupplier.id))
    if (viewSupplier?.id === deleteSupplier.id) setViewSupplier(null)
    setDeleteSupplier(null)
  }

  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1200px] mx-auto space-y-5">

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-800">إدارة الموردين</h1>
            <p className="font-cairo text-[13px] text-neutral-400 mt-0.5">تتبع وإدارة موردي المزرعة والرصيد المالي</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-cairo text-[13px] font-semibold hover:bg-primary-700 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={16} />
            مورد جديد
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="إجمالي الموردين" value={String(suppliers.length)} color="primary" />
          <StatCard icon={UserCheck} label="الموردون النشطون" value={String(activeCount)} color="success" />
          <StatCard icon={UserX} label="غير النشطين" value={String(inactiveCount)} color="neutral" />
          <StatCard icon={TrendingDown} label="إجمالي المديونية" value={fmt(totalBalance)} color="error" small />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="بحث بالاسم أو الشركة أو الهاتف..."
              className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 ps-8 pe-3 font-cairo text-[13px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }} className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-neutral-400" />
            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={e => { setFilterCategory(e.target.value as SupplierCategory | 'all'); setPage(1) }}
              className="h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[12px] text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
            >
              <option value="all">كل الفئات</option>
              {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Status filter */}
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
              {([['all', 'الكل'], ['active', 'نشط'], ['inactive', 'غير نشط']] as [string, string][]).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => { setFilterStatus(v as SupplierStatus | 'all'); setPage(1) }}
                  className={`px-3 py-1.5 font-cairo text-[12px] font-semibold transition-colors ${
                    filterStatus === v ? 'bg-primary-600 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'
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
                  {['المورد', 'الفئة', 'الهاتف', 'الرصيد', 'آخر طلب', 'الحالة', ''].map((h, i) => (
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
                          <PackageSearch size={24} className="text-neutral-300" />
                        </div>
                        <p className="font-cairo text-[13px] text-neutral-400">لا يوجد موردون مطابقون للبحث</p>
                      </div>
                    </td>
                  </tr>
                ) : slice.map(s => {
                  const cat = CATEGORY_CFG[s.category]
                  const st = STATUS_CFG[s.status]
                  const balColor = s.balance > 0 ? 'text-error-600 font-semibold' : s.balance < 0 ? 'text-success-600 font-semibold' : 'text-neutral-500'
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setViewSupplier(s)}
                      className="group hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      {/* Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-primary-600">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p className="font-cairo font-semibold text-[13px] text-neutral-800">{s.name}</p>
                            <p className="font-cairo text-[11px] text-neutral-400">{s.company || '—'}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold ${cat.bg} ${cat.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                          {cat.label}
                        </span>
                      </td>
                      {/* Phone */}
                      <td className="px-4 py-3.5">
                        <span className="font-cairo text-[13px] text-neutral-600" dir="ltr">{s.phone}</span>
                      </td>
                      {/* Balance */}
                      <td className="px-4 py-3.5">
                        <span className={`font-cairo text-[13px] ${balColor}`}>
                          {s.balance === 0 ? '—' : fmt(Math.abs(s.balance))}
                        </span>
                      </td>
                      {/* Last order */}
                      <td className="px-4 py-3.5">
                        <span className="font-cairo text-[12px] text-neutral-500">{fmtDate(s.lastOrderDate)}</span>
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
                            onClick={() => setViewSupplier(s)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="عرض"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setEditSupplier(s)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-warning-600 hover:bg-warning-50 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteSupplier(s)}
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
      {viewSupplier && (
        <ViewDrawer
          supplier={viewSupplier}
          onClose={() => setViewSupplier(null)}
          onEdit={() => { setEditSupplier(viewSupplier); setViewSupplier(null) }}
        />
      )}

      {showAdd && (
        <SupplierModal
          initial={emptyForm()}
          isEdit={false}
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editSupplier && (
        <SupplierModal
          initial={{ ...editSupplier }}
          isEdit
          onSave={handleEdit}
          onClose={() => setEditSupplier(null)}
        />
      )}

      {deleteSupplier && (
        <ConfirmDeleteModal
          itemName={deleteSupplier.name}
          itemType="المورد"
          onConfirm={handleDelete}
          onClose={() => setDeleteSupplier(null)}
        />
      )}
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
    primary: { bg: 'bg-primary-50',  icon: 'text-primary-600',  text: 'text-primary-700'  },
    success: { bg: 'bg-success-50',  icon: 'text-success-600',  text: 'text-success-700'  },
    neutral: { bg: 'bg-neutral-100', icon: 'text-neutral-500',  text: 'text-neutral-700'  },
    error:   { bg: 'bg-error-50',    icon: 'text-error-600',    text: 'text-error-700'    },
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
