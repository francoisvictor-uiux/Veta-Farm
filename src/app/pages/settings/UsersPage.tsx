import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal'
import {
  Plus, Search, X, Users, UserCheck, UserX,
  Edit2, Trash2, Check, ChevronRight, ChevronLeft,
  ChevronsRight, ChevronsLeft, CornerDownLeft, Eye,
  Mail, ShieldCheck, Key, CalendarDays, StickyNote,
  Shield, User, Lock, RefreshCw,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type UserRole =
  | 'manager' | 'veterinarian' | 'purchasing'
  | 'accountant' | 'warehouse'

type UserStatus = 'active' | 'inactive'

export interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: string
  createdAt: string
  notes: string
  avatar: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export const INITIAL_USERS: SystemUser[] = [
  { id:'u1',  name:'أحمد محمود النجار',      email:'ahmed@negmfarm.com',    role:'manager',      status:'active',   lastLogin:'2026-03-30T09:15:00', createdAt:'2023-01-10', notes:'مدير النظام الرئيسي، صلاحيات كاملة',             avatar:'أ' },
  { id:'u2',  name:'فاطمة محمد البدوي',      email:'fatima@negmfarm.com',   role:'manager',      status:'active',   lastLogin:'2026-03-30T14:40:00', createdAt:'2023-01-15', notes:'مسؤولة عن الإدارة اليومية للمزرعة',              avatar:'ف' },
  { id:'u3',  name:'كريم عبدالله الشيخ',     email:'karim@negmfarm.com',    role:'veterinarian', status:'active',   lastLogin:'2026-03-29T11:22:00', createdAt:'2023-03-05', notes:'دكتور بيطري أول، رقابة كاملة على صحة الرؤوس',   avatar:'ك' },
  { id:'u4',  name:'سارة طارق حجازي',        email:'sara@negmfarm.com',     role:'accountant',   status:'active',   lastLogin:'2026-03-30T08:55:00', createdAt:'2023-04-12', notes:'مسؤولة عن حسابات الموردين والعملاء',              avatar:'س' },
  { id:'u5',  name:'محمد علي حسن',           email:'mohamed@negmfarm.com',  role:'purchasing',   status:'active',   lastLogin:'2026-03-28T16:30:00', createdAt:'2023-06-01', notes:'',                                                avatar:'م' },
  { id:'u6',  name:'نور إبراهيم طه',         email:'nour@negmfarm.com',     role:'warehouse',    status:'active',   lastLogin:'2026-03-27T10:10:00', createdAt:'2023-08-20', notes:'مسؤولة عن مخزن الأعلاف',                         avatar:'ن' },
  { id:'u7',  name:'عمر رمضان درويش',        email:'omar@negmfarm.com',     role:'warehouse',    status:'active',   lastLogin:'2026-03-30T07:45:00', createdAt:'2024-01-08', notes:'',                                                avatar:'ع' },
  { id:'u8',  name:'هاني فريد عوض',          email:'hany@negmfarm.com',     role:'warehouse',    status:'inactive', lastLogin:'2025-12-15T09:00:00', createdAt:'2024-02-14', notes:'حساب موقوف مؤقتاً',                               avatar:'ه' },
  { id:'u9',  name:'ياسمين سامي الغزالي',    email:'yasmine@negmfarm.com',  role:'purchasing',   status:'active',   lastLogin:'2026-03-29T13:20:00', createdAt:'2024-03-01', notes:'',                                                avatar:'ي' },
  { id:'u10', name:'دينا عمر الجندي',        email:'dina@negmfarm.com',     role:'accountant',   status:'active',   lastLogin:'2026-03-25T11:00:00', createdAt:'2024-05-10', notes:'',                                                avatar:'د' },
  { id:'u11', name:'مصطفى سامي منصور',       email:'mostafa@negmfarm.com',  role:'purchasing',   status:'inactive', lastLogin:'2025-11-20T08:30:00', createdAt:'2024-07-22', notes:'موظف سابق، الحساب غير مفعّل',                    avatar:'م' },
  { id:'u12', name:'شيرين أحمد سلامة',       email:'shirin@negmfarm.com',   role:'accountant',   status:'active',   lastLogin:'2026-03-30T10:05:00', createdAt:'2024-09-01', notes:'',                                                avatar:'ش' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; dot: string }> = {
  manager:     { label:'مدير',             color:'text-primary-700',  bg:'bg-primary-50',   dot:'bg-primary-500'  },
  veterinarian:{ label:'دكتور بيطري',      color:'text-success-700',  bg:'bg-success-50',   dot:'bg-success-500'  },
  purchasing:  { label:'مسئول مشتريات',    color:'text-orange-700',   bg:'bg-orange-50',    dot:'bg-orange-400'   },
  accountant:  { label:'محاسب',            color:'text-warning-700',  bg:'bg-warning-50',   dot:'bg-warning-500'  },
  warehouse:   { label:'مسئول مخزن',       color:'text-info-700',     bg:'bg-info-50',      dot:'bg-info-500'     },
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bg: string; ring: string; dot: string }> = {
  active:   { label:'نشط',     color:'text-success-700', bg:'bg-success-50',  ring:'ring-success-200', dot:'bg-success-500' },
  inactive: { label:'موقوف',   color:'text-neutral-600', bg:'bg-neutral-100', ring:'ring-neutral-200', dot:'bg-neutral-400' },
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value:'manager',      label:'مدير'             },
  { value:'veterinarian', label:'دكتور بيطري'       },
  { value:'purchasing',   label:'مسئول مشتريات'    },
  { value:'accountant',   label:'محاسب'            },
  { value:'warehouse',    label:'مسئول مخزن'       },
]

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtDateTime(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function initials(name: string) {
  return name.trim().charAt(0)
}

// ─────────────────────────────────────────────────────────────────────────────
// usePagination hook
// ─────────────────────────────────────────────────────────────────────────────

function usePagination<T>(items: T[], defaultPageSize = 7) {
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  useEffect(() => {
    setPage(p => Math.min(p, Math.max(1, Math.ceil(items.length / pageSize))))
  }, [items.length, pageSize])

  const slice = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const goTo    = useCallback((p: number) => setPage(Math.min(Math.max(1, p), Math.max(1, Math.ceil(items.length / pageSize)))), [items.length, pageSize])
  const goFirst = useCallback(() => setPage(1), [])
  const goPrev  = useCallback(() => setPage(p => Math.max(1, p - 1)), [])
  const goNext  = useCallback(() => setPage(p => Math.min(Math.ceil(items.length / pageSize), p + 1)), [items.length, pageSize])
  const goLast  = useCallback(() => setPage(Math.max(1, Math.ceil(items.length / pageSize))), [items.length, pageSize])

  const from = items.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, items.length)

  return { page, setPage: goTo, pageSize, setPageSize, totalPages, slice, goFirst, goPrev, goNext, goLast, from, to, total: items.length }
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = []
  const left  = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)
  pages.push(1)
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < total - 1) pages.push('...')
  pages.push(total)
  return pages
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination component
// ─────────────────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number; totalPages: number; pageSize: number; from: number; to: number; total: number
  onPage:(p:number)=>void; onPageSize:(s:number)=>void
  onFirst:()=>void; onPrev:()=>void; onNext:()=>void; onLast:()=>void
}

function Pagination({ page, totalPages, pageSize, from, to, total, onPage, onPageSize, onFirst, onPrev, onNext, onLast }: PaginationProps) {
  const [jumpVal, setJumpVal] = useState('')
  const jumpRef = useRef<HTMLInputElement>(null)
  const pages = getPageNumbers(page, totalPages)

  function handleJump(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return
    const n = parseInt(jumpVal, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) { onPage(n); setJumpVal('') }
    else { setJumpVal('') }
  }

  const btnBase = 'h-8 min-w-[32px] px-1 flex items-center justify-center rounded-[8px] font-cairo text-[12px] font-semibold transition-all select-none'
  const btnNav  = `${btnBase} text-neutral-500 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neutral-400`
  const btnPage = (active: boolean) =>
    active ? `${btnBase} bg-primary-500 text-white shadow-sm px-2.5`
           : `${btnBase} text-neutral-600 hover:bg-neutral-100 px-2.5`

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-neutral-100 bg-neutral-50/80" dir="rtl">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-cairo text-[12px] text-neutral-500 whitespace-nowrap">
          عرض <span className="font-semibold text-neutral-800">{from}–{to}</span> من <span className="font-semibold text-neutral-800">{total}</span> سجل
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-cairo text-[11px] text-neutral-400">في الصفحة:</span>
          <div className="flex items-center gap-0.5">
            {PAGE_SIZE_OPTIONS.map(s => (
              <button key={s} onClick={() => onPageSize(s)}
                className={[
                  'h-6 px-2 rounded-[6px] font-cairo text-[11px] font-semibold transition-all',
                  s === pageSize ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-200',
                ].join(' ')}
              >{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1" dir="ltr">
        <button className={btnNav} onClick={onFirst} disabled={page===1} title="الأولى"><ChevronsRight size={14} /></button>
        <button className={btnNav} onClick={onPrev}  disabled={page===1} title="السابقة"><ChevronRight size={14} /></button>
        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((p, i) =>
            p === '...'
              ? <span key={`el-${i}`} className="w-8 text-center font-cairo text-[12px] text-neutral-400 select-none">…</span>
              : <button key={p} onClick={() => onPage(p as number)} className={btnPage(p === page)}>{p}</button>
          )}
        </div>
        <button className={btnNav} onClick={onNext} disabled={page===totalPages} title="التالية"><ChevronLeft size={14} /></button>
        <button className={btnNav} onClick={onLast} disabled={page===totalPages} title="الأخيرة"><ChevronsLeft size={14} /></button>

        {totalPages > 5 && (
          <div className="flex items-center gap-1 ms-2 ps-3 border-s border-neutral-200" dir="rtl">
            <span className="font-cairo text-[11px] text-neutral-400 whitespace-nowrap">اذهب إلى:</span>
            <input
              ref={jumpRef} type="number" min={1} max={totalPages}
              value={jumpVal} onChange={e => setJumpVal(e.target.value)} onKeyDown={handleJump}
              placeholder="—"
              className="w-12 h-7 px-2 text-center rounded-[8px] border border-neutral-200 bg-white font-cairo text-[12px] text-neutral-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              dir="ltr"
            />
            <button
              onClick={() => { const n=parseInt(jumpVal,10); if(!isNaN(n)&&n>=1&&n<=totalPages){onPage(n);setJumpVal('')} }}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] bg-neutral-100 text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            ><CornerDownLeft size={12} /></button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Badges
// ─────────────────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  const c = ROLE_CONFIG[role]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  const c = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${c.bg} ${c.color} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status==='active'?'animate-pulse':''}`} />{c.label}
    </span>
  )
}

function AvatarCircle({ letter, role, size='md' }: { letter:string; role:UserRole; size?:'sm'|'md'|'lg' }) {
  const c = ROLE_CONFIG[role]
  const sz = size==='lg' ? 'w-16 h-16 text-[22px]' : size==='sm' ? 'w-8 h-8 text-[12px]' : 'w-9 h-9 text-[14px]'
  return (
    <div className={`${sz} rounded-full ${c.bg} flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}>
      <span className={`font-bold ${c.color}`}>{letter}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({ icon: Icon, label, color = 'text-primary-500' }: { icon: React.ElementType; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100">
      <div className="w-6 h-6 rounded-[6px] bg-primary-50 flex items-center justify-center shrink-0">
        <Icon size={13} className={color} />
      </div>
      <span className="font-cairo font-bold text-[12px] text-neutral-700 tracking-wide">{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// View Drawer
// ─────────────────────────────────────────────────────────────────────────────

function ViewDrawer({ user, onClose, onEdit }: { user: SystemUser; onClose: () => void; onEdit: () => void }) {
  const rc = ROLE_CONFIG[user.role]
  const sc = STATUS_CONFIG[user.status]

  function InfoRow({ icon: Icon, label, value, ltr }: { icon: React.ElementType; label: string; value: string; ltr?: boolean }) {
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
        <div className="w-7 h-7 rounded-[8px] bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={13} className="text-neutral-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-cairo text-[10px] text-neutral-400 mb-0.5">{label}</p>
          <p className={`font-cairo font-semibold text-[13px] text-neutral-900 break-words`} dir={ltr ? 'ltr' : 'rtl'}>
            {value || '—'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[600] flex" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mr-auto w-full max-w-[440px] h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="shrink-0 px-6 py-5 bg-gradient-to-l from-primary-50 to-white border-b border-neutral-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-white transition-colors mt-0.5">
              <X size={16} />
            </button>
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-primary-500 text-white font-cairo font-semibold text-[12px] hover:bg-primary-600 transition-colors"
            >
              <Edit2 size={12} /> تعديل
            </button>
          </div>

          <div className="flex items-center gap-4">
            <AvatarCircle letter={user.avatar} role={user.role} size="lg" />
            <div className="min-w-0">
              <h2 className="font-cairo font-bold text-[18px] text-neutral-900 leading-snug">{user.name}</h2>
              <p className="font-cairo text-[12px] text-neutral-500 mt-0.5" dir="ltr">{user.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${rc.bg} ${rc.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />{rc.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${sc.bg} ${sc.color} ${sc.ring}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${user.status==='active'?'animate-pulse':''}`} />{sc.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <SectionHeading icon={User} label="معلومات الحساب" />
            <InfoRow icon={User}        label="الاسم الكامل"        value={user.name} />
            <InfoRow icon={Mail}        label="البريد الإلكتروني"   value={user.email} ltr />
            <InfoRow icon={ShieldCheck} label="الدور الوظيفي"       value={ROLE_CONFIG[user.role].label} />
          </div>

          <div>
            <SectionHeading icon={CalendarDays} label="سجل النشاط" color="text-info-500" />
            <InfoRow icon={CalendarDays} label="تاريخ الإنشاء"   value={fmtDate(user.createdAt)} />
            <InfoRow icon={CalendarDays} label="آخر تسجيل دخول"  value={fmtDateTime(user.lastLogin)} />
          </div>

          {user.notes && (
            <div>
              <SectionHeading icon={StickyNote} label="ملاحظات" color="text-neutral-500" />
              <div className="bg-neutral-50 rounded-[10px] px-4 py-3">
                <p className="font-cairo text-[13px] text-neutral-700 leading-relaxed">{user.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Add / Edit Modal
// ─────────────────────────────────────────────────────────────────────────────

type FormData = {
  name: string
  email: string
  password: string
  role: UserRole
  status: UserStatus
  notes: string
}

const EMPTY_FORM: FormData = {
  name: '', email: '', password: '', role: 'warehouse', status: 'active', notes: '',
}

interface ModalProps { user?: SystemUser | null; onClose: () => void; onSave: (u: Omit<SystemUser, 'id'>) => void }

function UserModal({ user, onClose, onSave }: ModalProps) {
  const isEdit = !!user
  const [form, setForm] = useState<FormData>(() =>
    isEdit
      ? { name: user.name, email: user.email, password: '', role: user.role, status: user.status, notes: user.notes }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [showPassword, setShowPassword] = useState(false)

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.name.trim())  e.name  = 'الاسم مطلوب'
    if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'بريد إلكتروني غير صحيح'
    if (!isEdit && !form.password.trim()) e.password = 'كلمة المرور مطلوبة'
    else if (form.password && form.password.length < 8) e.password = 'يجب أن تكون 8 أحرف على الأقل'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const now = new Date().toISOString()
    onSave({
      name:      form.name.trim(),
      email:     form.email.trim().toLowerCase(),
      role:      form.role,
      status:    form.status,
      notes:     form.notes.trim(),
      lastLogin: isEdit ? user!.lastLogin : '',
      createdAt: isEdit ? user!.createdAt : now.split('T')[0],
      avatar:    initials(form.name),
    })
  }

  const inputBase = 'w-full h-10 px-3 rounded-[10px] border bg-white font-cairo text-[13px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-all'
  const inputNormal = `${inputBase} border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`
  const inputError  = `${inputBase} border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20`

  function FieldLabel({ label, required }: { label: string; required?: boolean }) {
    return (
      <label className="block font-cairo font-semibold text-[12px] text-neutral-700 mb-1.5">
        {label}{required && <span className="text-red-500 ms-0.5">*</span>}
      </label>
    )
  }

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[480px] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Top bar */}
        <div className="h-1 w-full bg-gradient-to-l from-primary-400 to-primary-600 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-primary-50 flex items-center justify-center">
              {isEdit ? <Edit2 size={16} className="text-primary-500" /> : <Plus size={16} className="text-primary-500" />}
            </div>
            <div>
              <h2 className="font-cairo font-bold text-[15px] text-neutral-900">
                {isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
              </h2>
              <p className="font-cairo text-[11px] text-neutral-400">
                {isEdit ? `تعديل بيانات ${user!.name}` : 'إنشاء حساب جديد في النظام'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* الاسم */}
          <div>
            <FieldLabel label="الاسم الكامل" required />
            <input
              type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="مثال: أحمد محمد السيد"
              className={errors.name ? inputError : inputNormal}
            />
            {errors.name && <p className="font-cairo text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <FieldLabel label="البريد الإلكتروني" required />
            <input
              type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="example@negmfarm.com"
              className={`${errors.email ? inputError : inputNormal} text-left`}
              dir="ltr"
            />
            {errors.email && <p className="font-cairo text-[11px] text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* كلمة المرور */}
          <div>
            <FieldLabel label={isEdit ? 'كلمة المرور الجديدة (اتركها فارغة إن لم تريد التغيير)' : 'كلمة المرور'} required={!isEdit} />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={e => set('password', e.target.value)}
                placeholder={isEdit ? '••••••••' : 'أدخل كلمة مرور قوية'}
                className={`${errors.password ? inputError : inputNormal} pe-10`}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <Lock size={14} /> : <Key size={14} />}
              </button>
            </div>
            {errors.password && <p className="font-cairo text-[11px] text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* الدور الوظيفي */}
          <div>
            <FieldLabel label="الدور الوظيفي" required />
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map(opt => {
                const rc = ROLE_CONFIG[opt.value]
                const active = form.role === opt.value
                return (
                  <button
                    key={opt.value} type="button"
                    onClick={() => set('role', opt.value)}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] border-2 text-start transition-all',
                      active
                        ? `${rc.bg} border-current ${rc.color}`
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                    ].join(' ')}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${active ? rc.dot : 'bg-neutral-300'}`} />
                    <span className="font-cairo font-semibold text-[12px]">{opt.label}</span>
                    {active && <Check size={12} className="ms-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* الحالة */}
          <div>
            <FieldLabel label="حالة الحساب" />
            <div className="flex gap-3">
              {(['active', 'inactive'] as UserStatus[]).map(s => {
                const sc = STATUS_CONFIG[s]
                const active = form.status === s
                return (
                  <button
                    key={s} type="button"
                    onClick={() => set('status', s)}
                    className={[
                      'flex-1 flex items-center justify-center gap-2 h-10 rounded-[10px] border-2 font-cairo font-semibold text-[12px] transition-all',
                      active
                        ? `${sc.bg} border-current ${sc.color}`
                        : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50',
                    ].join(' ')}
                  >
                    <span className={`w-2 h-2 rounded-full ${active ? sc.dot : 'bg-neutral-300'}`} />
                    {sc.label}
                    {active && <Check size={12} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ملاحظات */}
          <div>
            <FieldLabel label="ملاحظات" />
            <textarea
              value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={3} placeholder="أي ملاحظات إضافية عن هذا المستخدم..."
              className="w-full px-3 py-2.5 rounded-[10px] border border-neutral-200 bg-white font-cairo text-[13px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
          <button
            onClick={handleSave}
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-bold text-[13px] hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm"
          >
            <Check size={14} />
            {isEdit ? 'حفظ التعديلات' : 'إضافة المستخدم'}
          </button>
          <button
            onClick={onClose}
            className="px-5 h-10 border border-neutral-200 text-neutral-600 rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-neutral-100 active:scale-[0.98] transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useLocalStorage<SystemUser[]>('vetafarm_users', INITIAL_USERS)

  // UI State
  const [search,        setSearch]        = useState('')
  const [filterRole,    setFilterRole]    = useState<UserRole | 'all'>('all')
  const [filterStatus,  setFilterStatus]  = useState<UserStatus | 'all'>('all')
  const [viewUser,      setViewUser]      = useState<SystemUser | null>(null)
  const [editUser,      setEditUser]      = useState<SystemUser | null | undefined>(undefined)
  const [deleteTarget,  setDeleteTarget]  = useState<SystemUser | null>(null)

  // Filtered list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchRole   = filterRole   === 'all' || u.role   === filterRole
      const matchStatus = filterStatus === 'all' || u.status === filterStatus
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, filterRole, filterStatus])

  const pag = usePagination(filtered, 10)

  // Stats
  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins:   users.filter(u => u.role === 'manager').length,
  }), [users])

  // Handlers
  function handleSave(data: Omit<SystemUser, 'id'>) {
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...data, id: editUser.id } : u))
    } else {
      const newUser: SystemUser = { ...data, id: `u${Date.now()}` }
      setUsers(prev => [newUser, ...prev])
    }
    setEditUser(undefined)
  }

  function handleDelete() {
    if (!deleteTarget) return
    setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
    if (viewUser?.id === deleteTarget.id) setViewUser(null)
    setDeleteTarget(null)
  }

  function openEdit(u: SystemUser) {
    setViewUser(null)
    setEditUser(u)
  }

  const hasFilters = search || filterRole !== 'all' || filterStatus !== 'all'

  return (
    <div className="min-h-full bg-neutral-100 font-cairo" dir="rtl">
      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-5">

        {/* ── Page Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-900">إدارة المستخدمين</h1>
            <p className="font-cairo text-[13px] text-neutral-500 mt-0.5">إدارة حسابات الوصول وصلاحيات النظام</p>
          </div>
          <button
            onClick={() => setEditUser(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-[12px] font-cairo font-bold text-[13px] hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={16} /> إضافة مستخدم
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'إجمالي المستخدمين', value: stats.total,    icon: Users,      color: 'text-primary-600', bg: 'bg-primary-50',   ring: 'ring-primary-100'  },
            { label: 'مستخدمون نشطون',    value: stats.active,   icon: UserCheck,  color: 'text-success-600', bg: 'bg-success-50',   ring: 'ring-success-100'  },
            { label: 'حسابات موقوفة',     value: stats.inactive, icon: UserX,      color: 'text-neutral-500', bg: 'bg-neutral-100',  ring: 'ring-neutral-200'  },
            { label: 'المديرون',          value: stats.admins,   icon: ShieldCheck, color: 'text-primary-600', bg: 'bg-primary-50',   ring: 'ring-primary-100'  },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-[16px] px-4 py-3.5 flex items-center gap-3 shadow-sm ring-1 ${s.ring}`}>
              <div className={`w-10 h-10 rounded-[10px] ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="font-cairo font-bold text-[20px] text-neutral-900 leading-none">{s.value}</p>
                <p className="font-cairo text-[11px] text-neutral-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-[20px] shadow-sm ring-1 ring-neutral-100 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو البريد الإلكتروني..."
                className="w-full h-9 ps-9 pe-8 rounded-[10px] border border-neutral-200 bg-neutral-50 font-cairo text-[13px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Role filter */}
            <select
              value={filterRole} onChange={e => setFilterRole(e.target.value as UserRole | 'all')}
              className="h-9 px-3 rounded-[10px] border border-neutral-200 bg-neutral-50 font-cairo text-[12px] text-neutral-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="all">كل الأدوار</option>
              {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus} onChange={e => setFilterStatus(e.target.value as UserStatus | 'all')}
              className="h-9 px-3 rounded-[10px] border border-neutral-200 bg-neutral-50 font-cairo text-[12px] text-neutral-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">موقوف</option>
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all') }}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-neutral-200 text-neutral-500 font-cairo text-[12px] hover:bg-neutral-50 transition-colors"
              >
                <X size={12} /> مسح
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/70">
                  {['المستخدم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'آخر دخول', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-start font-cairo font-bold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {pag.slice.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Users size={24} className="text-neutral-400" />
                        </div>
                        <p className="font-cairo font-semibold text-[14px] text-neutral-500">
                          {hasFilters ? 'لا توجد نتائج مطابقة' : 'لا يوجد مستخدمون'}
                        </p>
                        {hasFilters && (
                          <button
                            onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all') }}
                            className="font-cairo text-[12px] text-primary-500 hover:underline"
                          >مسح الفلاتر</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : pag.slice.map(u => (
                  <tr
                    key={u.id}
                    className="hover:bg-neutral-50/60 transition-colors group cursor-pointer"
                    onClick={() => setViewUser(u)}
                  >
                    {/* Name + Avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <AvatarCircle letter={u.avatar} role={u.role} size="sm" />
                        <span className="font-cairo font-semibold text-[13px] text-neutral-900 whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5">
                      <span className="font-cairo text-[12px] text-neutral-500" dir="ltr">{u.email}</span>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>

                    {/* Last Login */}
                    <td className="px-5 py-3.5">
                      <span className="font-cairo text-[12px] text-neutral-500 whitespace-nowrap">
                        {u.lastLogin ? fmtDateTime(u.lastLogin) : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => setViewUser(u)}
                          className="w-7 h-7 flex items-center justify-center rounded-[7px] text-neutral-400 hover:text-info-600 hover:bg-info-50 transition-colors"
                          title="عرض"
                        ><Eye size={13} /></button>
                        <button
                          onClick={() => openEdit(u)}
                          className="w-7 h-7 flex items-center justify-center rounded-[7px] text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="تعديل"
                        ><Edit2 size={13} /></button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="w-7 h-7 flex items-center justify-center rounded-[7px] text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="حذف"
                        ><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <Pagination
              page={pag.page} totalPages={pag.totalPages} pageSize={pag.pageSize}
              from={pag.from} to={pag.to} total={pag.total}
              onPage={pag.setPage} onPageSize={pag.setPageSize}
              onFirst={pag.goFirst} onPrev={pag.goPrev} onNext={pag.goNext} onLast={pag.goLast}
            />
          )}
        </div>

        {/* Reset password tip */}
        <div className="flex items-center gap-3 px-4 py-3 bg-info-50 border border-info-100 rounded-[12px]">
          <RefreshCw size={14} className="text-info-500 shrink-0" />
          <p className="font-cairo text-[12px] text-info-700">
            لإعادة تعيين كلمة مرور مستخدم، افتح التعديل وأدخل كلمة المرور الجديدة في حقل «كلمة المرور الجديدة».
          </p>
        </div>
      </div>

      {/* View Drawer */}
      {viewUser && (
        <ViewDrawer
          user={viewUser}
          onClose={() => setViewUser(null)}
          onEdit={() => openEdit(viewUser)}
        />
      )}

      {/* Add / Edit Modal */}
      {editUser !== undefined && (
        <UserModal
          user={editUser}
          onClose={() => setEditUser(undefined)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.name}
          itemType="المستخدم"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
