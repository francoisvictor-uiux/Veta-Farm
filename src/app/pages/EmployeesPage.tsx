import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import {
  Plus, Search, X, UserCheck, Users, UserX, Briefcase,
  Edit2, Trash2, Check, ChevronRight, ChevronLeft,
  ChevronsRight, ChevronsLeft, CornerDownLeft, Eye,
  Phone, Mail, MapPin, CreditCard, BadgeDollarSign,
  ShieldCheck, Landmark, CalendarDays, CalendarX2,
  StickyNote, Building2, User,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type EmployeeStatus = 'active' | 'inactive' | 'on_leave'
type EmployeeRole =
  | 'manager' | 'veterinarian' | 'purchasing'
  | 'accountant' | 'warehouse'

interface Employee {
  id: string
  // معلومات موظف
  name: string
  jobTitle: string
  nationalId: string
  address: string
  department: string
  role: EmployeeRole
  // وسائل تواصل
  phone: string
  email: string
  // بيانات مالي����
  basicSalary: number
  insurance: number
  taxes: number
  // توقيت العمل
  workStart: string
  workEnd: string
  // أخرى
  status: EmployeeStatus
  notes: string
  avatar: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_EMPLOYEES: Employee[] = [
  { id:'e1',  name:'أحمد محمد السيد',       role:'manager',      jobTitle:'مدير عام',              nationalId:'29901152304210', address:'الرياض، حي النزهة، شارع الأمير سلطان',         department:'الإدارة العامة',    phone:'0501234567', email:'ahmed@negmfarm.com',    basicSalary:18000, insurance:1800, taxes:540,  workStart:'2020-03-15', workEnd:'',           status:'active',   notes:'قائد الفريق الرئيسي، مسؤول عن الإدارة الكاملة للمزرعة',  avatar:'أ' },
  { id:'e2',  name:'محمد علي حسن',          role:'manager',      jobTitle:'مدير عمليات',           nationalId:'29812073301521', address:'الرياض، حي الملقا، طريق الملك فهد',              department:'الإدارة العامة',    phone:'0507654321', email:'mohamed@negmfarm.com',  basicSalary:12000, insurance:1200, taxes:360,  workStart:'2021-06-01', workEnd:'',           status:'active',   notes:'مسؤول عن العمليات اليومية للمزرعة',                       avatar:'م' },
  { id:'e3',  name:'خالد عبدالله النجم',    role:'veterinarian', jobTitle:'دكتور بيطري أول',       nationalId:'29705084412330', address:'الرياض، حي العليا، شارع العليا العام',           department:'الرعاية البيطرية',  phone:'0509876543', email:'khaled@negmfarm.com',   basicSalary:15000, insurance:1500, taxes:450,  workStart:'2021-09-20', workEnd:'',           status:'active',   notes:'متخصص في صحة الماشية والدواجن',                           avatar:'خ' },
  { id:'e4',  name:'سارة أحمد الزهراني',    role:'accountant',   jobTitle:'محاسبة قانونية',        nationalId:'30102094501122', address:'جدة، حي الروضة، شارع التحلية',                  department:'الحسابات والمالية', phone:'0502468135', email:'sara@negmfarm.com',     basicSalary:11000, insurance:1100, taxes:330,  workStart:'2022-01-10', workEnd:'',           status:'active',   notes:'مسؤولة عن الميزانية والحسابات الختامية',                  avatar:'س' },
  { id:'e5',  name:'عمر صالح الغامدي',      role:'warehouse',    jobTitle:'مسئول مخزن',            nationalId:'30005117601450', address:'الرياض، حي الشفا، طريق خريص',                   department:'المخزن',            phone:'0501357924', email:'omar@negmfarm.com',     basicSalary:5000,  insurance:500,  taxes:150,  workStart:'2022-04-05', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ع' },
  { id:'e6',  name:'فاطمة يوسف القحطاني',   role:'accountant',   jobTitle:'محاسبة',                nationalId:'30308136702100', address:'الرياض، حي الياسمين، شارع أنس بن مالك',         department:'الحسابات والمالية', phone:'0508642097', email:'fatima@negmfarm.com',   basicSalary:9000,  insurance:900,  taxes:270,  workStart:'2022-07-18', workEnd:'',           status:'on_leave', notes:'في إجازة أمومة حتى نهاية الربع الثالث',                   avatar:'ف' },
  { id:'e7',  name:'ناصر راشد العتيبي',     role:'purchasing',   jobTitle:'مسئول مشتريات',         nationalId:'29803058802331', address:'الرياض، حي البديعة، شارع صلاح الدين',            department:'المشتريات',         phone:'0503216549', email:'nasser@negmfarm.com',   basicSalary:6500,  insurance:650,  taxes:195,  workStart:'2023-02-28', workEnd:'',           status:'active',   notes:'مسؤول عن توريد مستلزمات المزرعة والأعلاف',               avatar:'ن' },
  { id:'e8',  name:'هيثم جابر الدوسري',     role:'warehouse',    jobTitle:'أمين مخزن',             nationalId:'30110175903210', address:'الرياض، حي الدار البيضاء',                      department:'المخزن',            phone:'0506549873', email:'haitham@negmfarm.com',  basicSalary:4800,  insurance:480,  taxes:144,  workStart:'2023-05-11', workEnd:'2025-01-31', status:'inactive', notes:'انتهت عقدته ولم يتم التجديد',                             avatar:'ه' },
  { id:'e9',  name:'ليلى محمد الشهري',      role:'manager',      jobTitle:'مديرة إنتاج',           nationalId:'30007198504520', address:'الرياض، حي قرطبة، شارع الأندلس',                department:'الإدارة العامة',    phone:'0504561237', email:'layla@negmfarm.com',    basicSalary:11500, insurance:1150, taxes:345,  workStart:'2023-08-01', workEnd:'',           status:'active',   notes:'مسؤولة عن متابعة معدلات الإنتاج اليومي',                 avatar:'ل' },
  { id:'e10', name:'عبدالرحمن سعيد آل علي', role:'warehouse',    jobTitle:'مسئول مخزن',            nationalId:'29906226005890', address:'الرياض، حي عرقة، طريق الدائري الغربي',          department:'المخزن',            phone:'0507891234', email:'abdo@negmfarm.com',     basicSalary:5500,  insurance:550,  taxes:165,  workStart:'2024-01-15', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ع' },
  { id:'e11', name:'ريم فهد البقمي',        role:'accountant',   jobTitle:'مختصة مالية',           nationalId:'30211234106710', address:'الرياض، حي الورود، شارع التخصصي',               department:'الحسابات والمالية', phone:'0503334455', email:'reem@negmfarm.com',     basicSalary:9500,  insurance:950,  taxes:285,  workStart:'2024-02-10', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ر' },
  { id:'e12', name:'سلطان مطلق الرشيدي',    role:'warehouse',    jobTitle:'أمين مخزن أعلاف',       nationalId:'30104264807150', address:'الرياض، حي الخليج',                             department:'المخزن',            phone:'0506667788', email:'sultan@negmfarm.com',   basicSalary:4500,  insurance:450,  taxes:135,  workStart:'2024-03-01', workEnd:'',           status:'active',   notes:'',                                                        avatar:'س' },
  { id:'e13', name:'نورة عبدالعزيز الحربي', role:'manager',      jobTitle:'مديرة جودة',            nationalId:'30009312208220', address:'الرياض، حي حطين، طريق الملك سلمان',             department:'الإدارة العامة',    phone:'0509990011', email:'noura@negmfarm.com',    basicSalary:11000, insurance:1100, taxes:330,  workStart:'2024-04-15', workEnd:'',           status:'on_leave', notes:'إجازة صيفية حتى سبتمبر',                                  avatar:'ن' },
  { id:'e14', name:'طارق يحيى الجهني',      role:'purchasing',   jobTitle:'مسئول توريد',           nationalId:'29811356009670', address:'الرياض، حي النسيم الشرقي',                      department:'المشتريات',         phone:'0502223344', email:'tarek@negmfarm.com',    basicSalary:6200,  insurance:620,  taxes:186,  workStart:'2024-05-20', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ط' },
  { id:'e15', name:'منى جمال العمري',        role:'veterinarian', jobTitle:'دكتورة بيطرية',         nationalId:'30106413510400', address:'الرياض، حي الصحافة، شارع سلطانة',               department:'الرعاية البيطرية',  phone:'0505556677', email:'mona@negmfarm.com',     basicSalary:14000, insurance:1400, taxes:420,  workStart:'2024-06-05', workEnd:'',           status:'active',   notes:'متخصصة في التطعيمات والوقاية',                            avatar:'م' },
  { id:'e16', name:'وليد سامي الحارثي',     role:'warehouse',    jobTitle:'أمين مخزن',             nationalId:'29907482211340', address:'الرياض، حي المنار',                             department:'المخزن',            phone:'0508889900', email:'walid@negmfarm.com',    basicSalary:4800,  insurance:480,  taxes:144,  workStart:'2024-07-01', workEnd:'2025-02-28', status:'inactive', notes:'غادر العمل بصورة مفاجئة',                                 avatar:'و' },
  { id:'e17', name:'دانا محمد الثقفي',      role:'accountant',   jobTitle:'محللة مالية',           nationalId:'30112544412780', address:'جدة، حي الفيصلية، طريق المدينة',                department:'الحسابات والمالية', phone:'0501112233', email:'dana@negmfarm.com',     basicSalary:10500, insurance:1050, taxes:315,  workStart:'2024-08-15', workEnd:'',           status:'active',   notes:'',                                                        avatar:'د' },
  { id:'e18', name:'فيصل علي المالكي',      role:'warehouse',    jobTitle:'مسئول مخزن صيانة',      nationalId:'30003612614090', address:'الرياض، حي السلي',                              department:'المخزن',            phone:'0504445566', email:'faisal@negmfarm.com',   basicSalary:5200,  insurance:520,  taxes:156,  workStart:'2024-09-01', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ف' },
  { id:'e19', name:'هند سعد القرني',        role:'manager',      jobTitle:'مديرة إدارية',          nationalId:'30208716815600', address:'الرياض، حي الملز، شارع المطار القديم',          department:'الإدارة العامة',    phone:'0507778899', email:'hend@negmfarm.com',     basicSalary:12000, insurance:1200, taxes:360,  workStart:'2024-10-10', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ه' },
  { id:'e20', name:'بدر عبدالله الشمري',    role:'warehouse',    jobTitle:'أمين مخزن',             nationalId:'30007919017320', address:'الرياض، حي النهضة',                             department:'المخزن',            phone:'0500001122', email:'badr@negmfarm.com',     basicSalary:4800,  insurance:480,  taxes:144,  workStart:'2024-11-01', workEnd:'',           status:'on_leave', notes:'إجازة اضطرارية',                                          avatar:'ب' },
  { id:'e21', name:'أسماء حمد العجمي',      role:'accountant',   jobTitle:'محاسبة رواتب',          nationalId:'30302121218440', address:'الرياض، حي الروابي',                            department:'الحسابات والمالية', phone:'0503334567', email:'asma@negmfarm.com',     basicSalary:8500,  insurance:850,  taxes:255,  workStart:'2024-11-20', workEnd:'',           status:'active',   notes:'مسؤولة عن مسير رواتب الموظفين',                          avatar:'أ' },
  { id:'e22', name:'حمد سليمان الدغيم',     role:'purchasing',   jobTitle:'مسئول مشتريات',         nationalId:'29811222419970', address:'الرياض، حي الربيع',                             department:'المشتريات',         phone:'0506667890', email:'hamad@negmfarm.com',    basicSalary:6000,  insurance:600,  taxes:180,  workStart:'2024-12-01', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ح' },
  { id:'e23', name:'عبير وليد السبيعي',     role:'veterinarian', jobTitle:'مساعدة دكتور بيطري',    nationalId:'30106523621050', address:'الرياض، حي الجزيرة',                            department:'الرعاية البيطرية',  phone:'0509990123', email:'abeer@negmfarm.com',    basicSalary:8000,  insurance:800,  taxes:240,  workStart:'2025-01-05', workEnd:'',           status:'active',   notes:'',                                                        avatar:'ع' },
  { id:'e24', name:'نايف خالد الرويلي',     role:'purchasing',   jobTitle:'مسئول توريد',           nationalId:'29901624422660', address:'الرياض، حي المصيف',                             department:'المشتريات',         phone:'0502223456', email:'nayef@negmfarm.com',    basicSalary:5800,  insurance:580,  taxes:174,  workStart:'2025-02-14', workEnd:'2025-09-30', status:'inactive', notes:'عقد مؤقت انتهى',                                          avatar:'ن' },
  { id:'e25', name:'غادة صالح المطيري',     role:'warehouse',    jobTitle:'أمينة مخزن',            nationalId:'30203725624780', address:'الرياض، حي الأمير فيصل',                        department:'المخزن',            phone:'0505556789', email:'ghada@negmfarm.com',    basicSalary:4500,  insurance:450,  taxes:135,  workStart:'2025-03-01', workEnd:'',           status:'active',   notes:'',                                                        avatar:'غ' },
]

// ─────────────────────────────���───────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<EmployeeRole, { label:string; color:string; bg:string; dot:string }> = {
  manager:     { label:'مدير',              color:'text-primary-700', bg:'bg-primary-50',  dot:'bg-primary-500' },
  veterinarian:{ label:'دكتور بيطري',       color:'text-success-700', bg:'bg-success-50',  dot:'bg-success-500' },
  purchasing:  { label:'مسئول مشتريات',     color:'text-orange-700',  bg:'bg-orange-50',   dot:'bg-orange-400'  },
  accountant:  { label:'محاسب',             color:'text-warning-700', bg:'bg-warning-50',  dot:'bg-warning-500' },
  warehouse:   { label:'مسئول مخزن',        color:'text-info-700',    bg:'bg-info-50',     dot:'bg-info-500'    },
}

const STATUS_CONFIG: Record<EmployeeStatus, { label:string; color:string; bg:string; ring:string; dot:string }> = {
  active:   { label:'نشط',     color:'text-success-700', bg:'bg-success-50',  ring:'ring-success-200', dot:'bg-success-500' },
  inactive: { label:'غير نشط', color:'text-neutral-600', bg:'bg-neutral-100', ring:'ring-neutral-200', dot:'bg-neutral-400' },
  on_leave: { label:'في إجازة',color:'text-warning-700', bg:'bg-warning-50',  ring:'ring-warning-200', dot:'bg-warning-500' },
}

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value:'manager',      label:'مدير'             },
  { value:'veterinarian', label:'دكتور بيطري'       },
  { value:'purchasing',   label:'مسئول مشتريات'    },
  { value:'accountant',   label:'محاسب'            },
  { value:'warehouse',    label:'مسئول مخزن'       },
]

const DEPT_OPTIONS = [
  'الإدارة العامة','الرعاية البيطرية',
  'المشتريات','الحسابات والمالية','المخزن',
]

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────��─────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' })
}

function fmtMoney(n: number) {
  return n.toLocaleString('ar-EG') + ' ج.م'
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

// ───────────────────────────────────���─────────────────────────────────────────
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

function RoleBadge({ role }: { role: EmployeeRole }) {
  const c = ROLE_CONFIG[role]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  )
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  const c = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${c.bg} ${c.color} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status==='active'?'animate-pulse':''}`} />{c.label}
    </span>
  )
}

function AvatarCircle({ letter, role, size='md' }: { letter:string; role:EmployeeRole; size?:'sm'|'md'|'lg' }) {
  const c = ROLE_CONFIG[role]
  const sz = size==='lg' ? 'w-16 h-16 text-[22px]' : size==='sm' ? 'w-8 h-8 text-[12px]' : 'w-9 h-9 text-[14px]'
  return (
    <div className={`${sz} rounded-full ${c.bg} flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}>
      <span className={`font-bold ${c.color}`}>{letter}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header (used in modal)
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

function ViewDrawer({ employee, onClose, onEdit }: { employee: Employee; onClose: () => void; onEdit: () => void }) {
  const rc = ROLE_CONFIG[employee.role]
  const sc = STATUS_CONFIG[employee.status]

  function InfoRow({ icon: Icon, label, value, ltr }: { icon: React.ElementType; label: string; value: string; ltr?: boolean }) {
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
        <div className="w-7 h-7 rounded-[8px] bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={13} className="text-neutral-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-cairo text-[10px] text-neutral-400 mb-0.5">{label}</p>
          <p className={`font-cairo font-semibold text-[13px] text-neutral-900 break-words ${ltr ? 'dir-ltr text-left' : ''}`}
             dir={ltr ? 'ltr' : 'rtl'}>
            {value || '—'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[600] flex" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer — slides from right */}
      <div className="relative mr-auto w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="shrink-0 px-6 py-5 bg-gradient-to-l from-primary-50 to-white border-b border-neutral-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-white transition-colors mt-0.5">
              <X size={16} />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-primary-500 text-white font-cairo font-semibold text-[12px] hover:bg-primary-600 transition-colors"
              >
                <Edit2 size={12} /> تعديل
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AvatarCircle letter={employee.avatar} role={employee.role} size="lg" />
            <div className="min-w-0">
              <h2 className="font-cairo font-bold text-[18px] text-neutral-900 leading-snug">{employee.name}</h2>
              <p className="font-cairo text-[12px] text-neutral-500 mt-0.5">{employee.jobTitle}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${rc.bg} ${rc.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />{rc.label}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ${sc.bg} ${sc.color} ${sc.ring}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${employee.status==='active'?'animate-pulse':''}`} />{sc.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* معلومات موظف */}
          <div>
            <SectionHeading icon={User} label="معلومات موظف" />
            <InfoRow icon={User}      label="الاسم"          value={employee.name} />
            <InfoRow icon={Briefcase} label="المسمى الوظيفي" value={employee.jobTitle} />
            <InfoRow icon={CreditCard} label="الرقم القومي"  value={employee.nationalId} ltr />
            <InfoRow icon={MapPin}    label="العنوان"        value={employee.address} />
            <InfoRow icon={Building2} label="القسم"          value={employee.department} />
          </div>

          {/* وسائل تواصل */}
          <div>
            <SectionHeading icon={Phone} label="وسائل تواصل" color="text-info-500" />
            <InfoRow icon={Phone} label="رقم الجوال"      value={employee.phone} ltr />
            <InfoRow icon={Mail}  label="البريد الإلكتروني" value={employee.email} ltr />
          </div>

          {/* البيانات المالية */}
          <div>
            <SectionHeading icon={BadgeDollarSign} label="البيانات المالية" color="text-warning-600" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'راتب أساسي', value: fmtMoney(employee.basicSalary), icon: Landmark,    color:'text-success-600', bg:'bg-success-50' },
                { label:'تأمينات',    value: fmtMoney(employee.insurance),   icon: ShieldCheck, color:'text-info-600',    bg:'bg-info-50'    },
                { label:'ضرائب',      value: fmtMoney(employee.taxes),       icon: BadgeDollarSign, color:'text-warning-600', bg:'bg-warning-50' },
              ].map(item => (
                <div key={item.label} className={`rounded-[12px] ${item.bg} px-3 py-3 text-center`}>
                  <item.icon size={16} className={`${item.color} mx-auto mb-1`} />
                  <p className="font-cairo text-[10px] text-neutral-500 mb-0.5">{item.label}</p>
                  <p className={`font-cairo font-bold text-[12px] ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-neutral-50 rounded-[10px] px-4 py-2.5 flex items-center justify-between">
              <span className="font-cairo text-[12px] text-neutral-500">صافي الراتب</span>
              <span className="font-cairo font-bold text-[14px] text-success-700">
                {fmtMoney(employee.basicSalary - employee.insurance - employee.taxes)}
              </span>
            </div>
          </div>

          {/* توقيت العمل */}
          <div>
            <SectionHeading icon={CalendarDays} label="توقيت العمل" color="text-purple-500" />
            <InfoRow icon={CalendarDays} label="بداية العمل"  value={fmtDate(employee.workStart)} />
            <InfoRow icon={CalendarX2}   label="نهاية العمل"  value={employee.workEnd ? fmtDate(employee.workEnd) : 'غير محدد (مفتوح)'} />
          </div>

          {/* ملاحظات */}
          {employee.notes && (
            <div>
              <SectionHeading icon={StickyNote} label="ملاحظات" color="text-neutral-500" />
              <div className="bg-neutral-50 rounded-[10px] px-4 py-3">
                <p className="font-cairo text-[13px] text-neutral-700 leading-relaxed">{employee.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────���───────��───────────────────────────────────────────────────────
// Add / Edit Modal
// ─────────────────────────────────────────────────────────────────────────────

type FormData = Omit<Employee, 'id' | 'avatar'>

const EMPTY_FORM: FormData = {
  name:'', jobTitle:'', nationalId:'', address:'', department:'المخزن', role:'warehouse',
  phone:'', email:'',
  basicSalary:0, insurance:0, taxes:0,
  workStart: new Date().toISOString().split('T')[0], workEnd:'',
  status:'active', notes:'',
}

interface ModalProps { employee?: Employee | null; onClose: () => void; onSave: (emp: Omit<Employee,'id'>) => void }

function EmployeeModal({ employee, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<FormData>(employee ? {
    name: employee.name, jobTitle: employee.jobTitle, nationalId: employee.nationalId,
    address: employee.address, department: employee.department, role: employee.role,
    phone: employee.phone, email: employee.email,
    basicSalary: employee.basicSalary, insurance: employee.insurance, taxes: employee.taxes,
    workStart: employee.workStart, workEnd: employee.workEnd,
    status: employee.status, notes: employee.notes,
  } : { ...EMPTY_FORM })

  const f = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const inputCls = 'w-full h-10 px-3 rounded-[10px] border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-cairo placeholder:text-neutral-400'
  const labelCls = 'block text-[11.5px] font-semibold text-neutral-500 mb-1.5'

  const netSalary = (form.basicSalary || 0) - (form.insurance || 0) - (form.taxes || 0)

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[640px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/60">
          <div>
            <h2 className="font-cairo font-bold text-[16px] text-neutral-900">
              {employee ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
            </h2>
            <p className="font-cairo text-[11px] text-neutral-400 mt-0.5">
              {employee ? `تعديل: ${employee.name}` : 'أدخل جميع البيانات المطلوبة'}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form
          id="emp-form"
          onSubmit={e => { e.preventDefault(); onSave({ ...form, avatar: form.name.trim().charAt(0) || 'م' }) }}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-6 py-5 space-y-6">

            {/* ── معلومات موظف ── */}
            <div>
              <SectionHeading icon={User} label="معلومات موظف" />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>الاسم الكامل <span className="text-red-400">*</span></label>
                  <input required type="text" value={form.name} onChange={e => f('name', e.target.value)} placeholder="أدخل الاسم الكامل" className={inputCls} dir="rtl" />
                </div>
                <div>
                  <label className={labelCls}>المسمى الوظيفي</label>
                  <input type="text" value={form.jobTitle} onChange={e => f('jobTitle', e.target.value)} placeholder="مثال: مشرف مزرعة" className={inputCls} dir="rtl" />
                </div>
                <div>
                  <label className={labelCls}>الرقم القومي</label>
                  <input type="text" value={form.nationalId} onChange={e => f('nationalId', e.target.value)} placeholder="xxxxxxxxxx" className={inputCls} dir="ltr" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>العنوان</label>
                  <input type="text" value={form.address} onChange={e => f('address', e.target.value)} placeholder="المدينة، الحي، الشارع" className={inputCls} dir="rtl" />
                </div>
                <div>
                  <label className={labelCls}>القسم</label>
                  <select value={form.department} onChange={e => f('department', e.target.value)} className={inputCls + ' cursor-pointer'}>
                    {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>الدور الوظيفي</label>
                  <select value={form.role} onChange={e => f('role', e.target.value as EmployeeRole)} className={inputCls + ' cursor-pointer'}>
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── وسائل تواصل ── */}
            <div>
              <SectionHeading icon={Phone} label="وسائل تواصل" color="text-info-500" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>رقم الجوال</label>
                  <input type="tel" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="05xxxxxxxx" className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>البريد الإلكتروني</label>
                  <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="example@negmfarm.com" className={inputCls} dir="ltr" />
                </div>
              </div>
            </div>

            {/* ── البيانات المالية ── */}
            <div>
              <SectionHeading icon={BadgeDollarSign} label="البيانات المالية" color="text-warning-600" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>الراتب الأساسي (ج.م)</label>
                  <input type="number" min={0} value={form.basicSalary || ''} onChange={e => f('basicSalary', +e.target.value)} placeholder="0" className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>التأمينات (ج.م)</label>
                  <input type="number" min={0} value={form.insurance || ''} onChange={e => f('insurance', +e.target.value)} placeholder="0" className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>الضرائب (ج.م)</label>
                  <input type="number" min={0} value={form.taxes || ''} onChange={e => f('taxes', +e.target.value)} placeholder="0" className={inputCls} dir="ltr" />
                </div>
              </div>
              {/* Net salary preview */}
              <div className="mt-3 flex items-center justify-between bg-success-50 rounded-[10px] px-4 py-2.5 border border-success-100">
                <span className="font-cairo text-[12px] text-success-700 font-semibold">صافي الراتب المتوقع</span>
                <span className="font-cairo font-bold text-[14px] text-success-700">{fmtMoney(Math.max(0, netSalary))}</span>
              </div>
            </div>

            {/* ── توقيت العمل ── */}
            <div>
              <SectionHeading icon={CalendarDays} label="توقيت العمل" color="text-purple-500" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>بداية العمل</label>
                  <input type="date" value={form.workStart} onChange={e => f('workStart', e.target.value)} className={inputCls} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>نهاية العمل <span className="text-neutral-400 font-normal">(اختياري)</span></label>
                  <input type="date" value={form.workEnd} onChange={e => f('workEnd', e.target.value)} className={inputCls} dir="ltr" />
                </div>
              </div>
            </div>

            {/* ── الحالة والملاحظات ── */}
            <div>
              <SectionHeading icon={StickyNote} label="الحالة والملاحظات" color="text-neutral-500" />
              <div className="mb-3">
                <label className={labelCls}>الحالة</label>
                <div className="flex items-center gap-2">
                  {(['active','on_leave','inactive'] as EmployeeStatus[]).map(s => {
                    const c = STATUS_CONFIG[s]
                    return (
                      <button key={s} type="button"
                        onClick={() => f('status', s)}
                        className={[
                          'flex-1 h-9 flex items-center justify-center gap-1.5 rounded-[10px] border font-cairo font-semibold text-[12px] transition-all',
                          form.status === s
                            ? `${c.bg} ${c.color} border-current shadow-sm scale-[1.02]`
                            : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300',
                        ].join(' ')}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className={labelCls}>ملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={e => f('notes', e.target.value)}
                  placeholder="أي ملاحظات إضافية عن الموظف..."
                  rows={3}
                  className={inputCls + ' h-auto py-2.5 resize-none'}
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
          <button form="emp-form" type="submit"
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm">
            <Check size={15} />
            {employee ? 'ح��ظ التعديلات' : 'إضافة الموظف'}
          </button>
          <button type="button" onClick={onClose}
            className="h-10 px-5 rounded-[10px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}


// ──────���──────────────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg }: {
  label:string; value:number|string; sub:string; icon:React.ElementType; iconColor:string; iconBg:string
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-[14px] px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <p className="font-cairo text-[11px] text-neutral-500 mb-0.5">{label}</p>
        <p className="font-cairo font-bold text-[20px] text-neutral-900 leading-none">{value}</p>
        <p className="font-cairo text-[10px] text-neutral-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const [employees, setEmployees]       = useState<Employee[]>(INITIAL_EMPLOYEES)
  const [search, setSearch]             = useState('')
  const [filterRole, setFilterRole]     = useState<EmployeeRole | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<EmployeeStatus | 'all'>('all')

  const [viewTarget,   setViewTarget]   = useState<Employee | null>(null)
  const [editTarget,   setEditTarget]   = useState<Employee | null>(null)
  const [showModal,    setShowModal]    = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)

  const filtered = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase()
    const matchSearch = !q || e.name.includes(q) || e.jobTitle.includes(q) || e.department.includes(q) || e.email.includes(q) || e.nationalId.includes(q)
    const matchRole   = filterRole   === 'all' || e.role   === filterRole
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    return matchSearch && matchRole && matchStatus
  }), [employees, search, filterRole, filterStatus])

  const pg = usePagination(filtered, 7)
  useEffect(() => { pg.setPage(1) }, [search, filterRole, filterStatus])

  const hasFilters = !!(search || filterRole !== 'all' || filterStatus !== 'all')

  function openAdd()             { setEditTarget(null); setShowModal(true) }
  function openEdit(e: Employee) { setViewTarget(null); setEditTarget(e); setShowModal(true) }
  function openView(e: Employee) { setViewTarget(e) }

  function handleSave(data: Omit<Employee,'id'>) {
    if (editTarget) {
      setEmployees(prev => prev.map(e => e.id === editTarget.id ? { ...data, id: editTarget.id } : e))
      if (viewTarget?.id === editTarget.id) setViewTarget({ ...data, id: editTarget.id })
    } else {
      const newEmp = { ...data, id: `e${Date.now()}` }
      setEmployees(prev => [newEmp, ...prev])
      pg.setPage(1)
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    setEmployees(prev => prev.filter(e => e.id !== id))
    setDeleteTarget(null)
    if (viewTarget?.id === id) setViewTarget(null)
  }

  const selectCls = 'h-10 px-3 rounded-[12px] border border-neutral-200 bg-white font-cairo text-[13px] text-neutral-700 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 shadow-sm cursor-pointer'
  const totalSalary = employees.filter(e=>e.status==='active').reduce((s,e)=>s+e.basicSalary,0)

  return (
    <div className="min-h-full font-cairo" style={{ backgroundColor:'#F2F2F0' }} dir="rtl">
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users size={22} className="text-primary-500" />
              <h1 className="font-cairo font-bold text-[26px] text-neutral-900 leading-tight">إدارة الموظفين</h1>
            </div>
            <p className="font-cairo text-[13px] text-neutral-500">عرض وإدارة بيانات وأدوار وحالات جميع الموظفين</p>
          </div>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-[12px] font-cairo font-semibold text-[13px] hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm">
            <Plus size={16} /> إضافة موظف
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="إجمالي الموظفين" value={employees.length}                                          sub="موظف مسجّل"   icon={Users}          iconColor="text-primary-500" iconBg="bg-primary-50"  />
          <StatCard label="موظفون نشطون"    value={employees.filter(e=>e.status==='active').length}           sub="يعملون الآن"  icon={UserCheck}      iconColor="text-success-600" iconBg="bg-success-50"  />
          <StatCard label="في إجازة / غير نشط" value={employees.filter(e=>e.status!=='active').length}       sub="خارج الخدمة"  icon={UserX}          iconColor="text-warning-600" iconBg="bg-warning-50"  />
        </div>

        {/* Filters */}
        <div className="bg-white border border-neutral-200 rounded-[14px] px-5 py-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 h-10 px-3 rounded-[12px] bg-neutral-50 border border-neutral-200 flex-1 min-w-[200px] focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <Search size={14} className="text-neutral-400 shrink-0" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم، الوظيفة، القسم، الرقم القومي..."
              className="flex-1 bg-transparent outline-none font-cairo text-[13px] text-neutral-900 placeholder:text-neutral-400" dir="rtl" />
            {search && (
              <button onClick={() => setSearch('')} className="text-neutral-400 hover:text-neutral-600 transition-colors"><X size={13} /></button>
            )}
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value as EmployeeRole|'all')} className={selectCls}>
            <option value="all">كل الوظائف</option>
            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as EmployeeStatus|'all')} className={selectCls}>
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نش��</option>
            <option value="on_leave">في إجازة</option>
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all') }}
              className="flex items-center gap-1.5 h-10 px-3 rounded-[12px] border border-neutral-200 text-neutral-600 font-cairo text-[12px] hover:bg-neutral-50 transition-colors">
              <X size={13} /> مسح الفلاتر
            </button>
          )}
          {hasFilters && <span className="font-cairo text-[12px] text-neutral-400 me-auto">{filtered.length} نتيجة</span>}
        </div>

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-[14px] overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_88px] items-center px-5 py-3 border-b border-neutral-100 bg-neutral-50/80">
            {['الموظف','الوظيفة','الحالة','القسم','بداية العمل',''].map((h,i)=>(
              <span key={i} className="font-cairo font-semibold text-[10.5px] text-neutral-400 uppercase tracking-widest">{h}</span>
            ))}
          </div>

          {pg.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                <Users size={24} className="text-neutral-300" />
              </div>
              <p className="font-cairo font-semibold text-[14px] text-neutral-500">لا توجد نتائج</p>
              <p className="font-cairo text-[12px] text-neutral-400 mt-1">جرّب تغيير معايير البحث أو الفلاتر</p>
              {hasFilters && (
                <button onClick={() => { setSearch(''); setFilterRole('all'); setFilterStatus('all') }}
                  className="mt-4 px-4 py-2 rounded-[10px] bg-primary-50 text-primary-600 font-cairo font-semibold text-[12px] hover:bg-primary-100 transition-colors">
                  مسح جميع الفلاتر
                </button>
              )}
            </div>
          ) : (
            <ul style={{ minHeight: `${pg.pageSize * 60}px` }}>
              {pg.slice.map((emp, i) => (
                <li key={emp.id}
                  className={[
                    'group flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_88px] items-start md:items-center px-5 py-3.5 transition-colors hover:bg-primary-50/20 cursor-default',
                    i < pg.slice.length - 1 ? 'border-b border-neutral-100' : '',
                  ].join(' ')}
                >
                  {/* Employee */}
                  <div className="flex items-center gap-3 min-w-0">
                    <AvatarCircle letter={emp.avatar} role={emp.role} />
                    <div className="min-w-0">
                      <p className="font-cairo font-semibold text-[13px] text-neutral-900 leading-snug truncate">{emp.name}</p>
                      <span className="font-cairo text-[11px] text-neutral-400 truncate">{emp.jobTitle || emp.email}</span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0"><RoleBadge role={emp.role} /></div>
                  <div className="mt-1.5 md:mt-0"><StatusBadge status={emp.status} /></div>
                  <span className="font-cairo text-[12px] text-neutral-600 mt-1.5 md:mt-0 truncate">{emp.department}</span>
                  <span className="font-cairo text-[12px] text-neutral-400 whitespace-nowrap mt-1.5 md:mt-0" dir="ltr">
                    {fmtDate(emp.workStart)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 mt-2 md:mt-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openView(emp)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-neutral-400 hover:text-info-600 hover:bg-info-50 transition-colors" title="عرض">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openEdit(emp)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-neutral-400 hover:text-primary-500 hover:bg-primary-50 transition-colors" title="تعديل">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(emp)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="حذف">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
              {/* Ghost rows */}
              {pg.slice.length < pg.pageSize && Array.from({ length: pg.pageSize - pg.slice.length }).map((_,i)=>(
                <li key={`ghost-${i}`} className="border-b border-neutral-50 last:border-0" style={{ height:60 }} />
              ))}
            </ul>
          )}

          {pg.total > 0 && (
            <Pagination
              page={pg.page} totalPages={pg.totalPages} pageSize={pg.pageSize} from={pg.from} to={pg.to} total={pg.total}
              onPage={pg.setPage} onPageSize={s => { pg.setPageSize(s); pg.setPage(1) }}
              onFirst={pg.goFirst} onPrev={pg.goPrev} onNext={pg.goNext} onLast={pg.goLast}
            />
          )}
        </div>

        {/* Status legend */}
        <div className="flex items-center gap-3 px-1 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key,cfg]) => {
            const count = employees.filter(e=>e.status===key).length
            return (
              <button key={key}
                onClick={() => setFilterStatus(filterStatus===key ? 'all' : key as EmployeeStatus)}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ring-1 transition-all',
                  filterStatus===key ? `${cfg.bg} ${cfg.color} ${cfg.ring} scale-105 shadow-sm` : 'bg-white text-neutral-500 ring-neutral-200 hover:scale-105',
                ].join(' ')}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label} <span className="font-bold">{count}</span>
              </button>
            )
          })}
          <span className="font-cairo text-[11px] text-neutral-400 me-auto">انقر لتصفية حسب الحالة</span>
        </div>
      </div>

      {/* View Drawer */}
      {viewTarget && (
        <ViewDrawer
          employee={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => openEdit(viewTarget)}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <EmployeeModal employee={editTarget} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.name}
          itemType="الموظف"
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
