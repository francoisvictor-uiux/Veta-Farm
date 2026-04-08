import { useState, useMemo, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { toast } from 'sonner'
import {
  Search, X, Plus, Clock, Users, UserCheck, UserX, AlertCircle,
  LogIn, LogOut, Timer, Edit2, CalendarDays, ChevronRight, ChevronLeft,
  ChevronsRight, ChevronsLeft, Filter, Download,
  CreditCard, Star, Minus, ChevronDown, BadgeInfo, ShieldAlert,
} from 'lucide-react'
import { attendanceRecords as initRecords } from '../data/attendanceData'
import { AttendanceRecord, Employee as AttEmployee, LeaveType, LEAVE_TYPE_LABELS, QuickTransaction } from '../types/attendance'
import { INITIAL_EMPLOYEES } from './EmployeesPage'
import { readLocalStorage, DB_KEYS } from '../hooks/useLocalStorage'

// Map HR employee (EmployeesPage) → AttEmployee (attendance module)
function mapHR(e: typeof INITIAL_EMPLOYEES[0]): AttEmployee {
  return {
    id:             e.id,
    employeeNumber: e.id.replace('e', 'EMP-').padStart(7, '0'),
    name:           e.name,
    jobTitle:       e.jobTitle,
    department:     e.department,
    startDate:      e.workStart || '2020-01-01',
    annualLeave:    21,
    usedLeave:      0,
    isActive:       e.status !== 'inactive',
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0]

function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtMoney(n: number) {
  return n.toLocaleString('ar-EG') + ' ج.م'
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}س ${m.toString().padStart(2, '0')}د`
}

function genId() { return `att-${Date.now()}` }
function genTxId() { return `tx-${Date.now()}` }

// ─── Status Config ─────────────────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  'on-time':  { label: 'في الموعد', color: 'text-green-700',  bg: 'bg-green-50',   dot: 'bg-green-500'  },
  'late':     { label: 'متأخر',     color: 'text-yellow-700', bg: 'bg-yellow-50',  dot: 'bg-yellow-500' },
  'absent':   { label: 'غائب',      color: 'text-red-700',    bg: 'bg-red-50',     dot: 'bg-red-500'    },
  'half-day': { label: 'نصف يوم',   color: 'text-blue-700',   bg: 'bg-blue-50',    dot: 'bg-blue-500'   },
  'present':  { label: 'حاضر',      color: 'text-green-700',  bg: 'bg-green-50',   dot: 'bg-green-500'  },
  'leave':    { label: 'إجازة',     color: 'text-purple-700', bg: 'bg-purple-50',  dot: 'bg-purple-500' },
} as const

type StatusKey = keyof typeof STATUS_CFG

// ─── Pagination ───────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8

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
          <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg font-cairo text-[12px] font-semibold transition-colors ${p === page ? 'bg-[#1a6b3c] text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}>{p}</button>
        ))}
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronLeft size={14} /></button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"><ChevronsLeft size={14} /></button>
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number
  color: 'primary' | 'success' | 'error' | 'warning' | 'neutral'
}) {
  const colors = {
    primary: { bg: 'bg-[#e8f5ee]', icon: 'text-[#1a6b3c]', text: 'text-[#1a6b3c]' },
    success: { bg: 'bg-green-50',  icon: 'text-green-600',  text: 'text-green-700'  },
    error:   { bg: 'bg-red-50',    icon: 'text-red-600',    text: 'text-red-700'    },
    warning: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-700' },
    neutral: { bg: 'bg-neutral-100', icon: 'text-neutral-500', text: 'text-neutral-700' },
  }
  const c = colors[color]
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={c.icon} />
      </div>
      <div className="min-w-0">
        <p className="font-cairo text-[11px] text-neutral-400 truncate">{label}</p>
        <p className={`font-cairo font-bold text-[20px] ${c.text} leading-tight`}>{value}</p>
      </div>
    </div>
  )
}

// ─── Manual Attendance Modal ────────────────────────────────────────────────────────────────────

interface ManualForm {
  employeeId: string
  date: string
  checkIn: string
  checkOut: string
  status: StatusKey
  leaveType: LeaveType
  notes: string
}

function emptyManualForm(): ManualForm {
  return {
    employeeId: '',
    date: today(),
    checkIn: '',
    checkOut: '',
    status: 'on-time',
    leaveType: 'annual',
    notes: '',
  }
}

function ManualModal({ initial, isEdit, onSave, onClose, employees }: {
  initial: ManualForm
  isEdit: boolean
  onSave: (data: ManualForm) => void
  onClose: () => void
  employees: AttEmployee[]
}) {
  const [form, setForm] = useState<ManualForm>(initial)
  const set = <K extends keyof ManualForm>(k: K, v: ManualForm[K]) => setForm(f => ({ ...f, [k]: v }))
  const isLeave = form.status === 'absent' || form.status === 'leave'
  const valid = form.employeeId !== '' && (isLeave || form.checkIn !== '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-l from-[#1a6b3c] to-[#2d9e5f] shrink-0" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center">
              <CalendarDays size={16} className="text-[#1a6b3c]" />
            </div>
            <h2 className="font-cairo font-bold text-[15px] text-neutral-800">
              {isEdit ? 'تعديل سجل الحضور' : 'تسجيل حضور يدوي'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* الموظف */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
              الموظف <span className="text-red-500">*</span>
            </label>
            <select
              value={form.employeeId}
              onChange={e => set('employeeId', e.target.value)}
              className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
            >
              <option value="">اختر موظف...</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.employeeNumber} · {e.name} — {e.department}</option>
              ))}
            </select>
          </div>

          {/* التاريخ */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">التاريخ</label>
            <input
              type="date" value={form.date}
              onChange={e => set('date', e.target.value)}
              className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
            />
          </div>

          {/* الحالة */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">حالة اليوم</label>
            <div className="flex gap-2 flex-wrap">
              {(['on-time', 'late', 'half-day', 'leave', 'absent'] as StatusKey[]).map(s => {
                const cfg = STATUS_CFG[s]
                return (
                  <button
                    key={s} type="button" onClick={() => set('status', s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cairo text-[12px] font-semibold border transition-all ${
                      form.status === s
                        ? `${cfg.bg} ${cfg.color} border-current`
                        : 'bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* نوع الإجازة — يظهر فقط عند الغياب أو الإجازة */}
          {isLeave && (
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 space-y-2">
              <label className="font-cairo text-[12px] font-semibold text-purple-700 block">نوع الإجازة</label>
              <div className="flex gap-2 flex-wrap">
                {(Object.entries(LEAVE_TYPE_LABELS) as [LeaveType, string][])
                  .filter(([k]) => k !== 'none')
                  .map(([k, lbl]) => (
                    <button
                      key={k} type="button" onClick={() => set('leaveType', k)}
                      className={`px-3 py-1.5 rounded-lg font-cairo text-[11px] font-semibold border transition-all ${
                        form.leaveType === k
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* أوقات الحضور والانصراف — لا تظهر عند الإجازة */}
          {!isLeave && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
                  وقت الحضور <span className="text-red-500">*</span>
                </label>
                <input
                  type="time" value={form.checkIn}
                  onChange={e => set('checkIn', e.target.value)}
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
                />
              </div>
              <div>
                <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
                  وقت الانصراف <span className="font-normal text-neutral-400">(اختياري)</span>
                </label>
                <input
                  type="time" value={form.checkOut}
                  onChange={e => set('checkOut', e.target.value)}
                  className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
                />
              </div>
            </div>
          )}

          {/* ملاحظات */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={2}
              placeholder="أي ملاحظات إضافية..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">
            إلغاء
          </button>
          <button
            onClick={() => valid && onSave(form)}
            disabled={!valid}
            className="flex items-center gap-2 px-5 py-2 bg-[#1a6b3c] text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-[#145730] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {isEdit ? <><Edit2 size={14} /> حفظ التعديلات</> : <><Plus size={14} /> تسجيل الحضور</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Quick Transaction Modal ────────────────────────────────────────────────────────────────────

type TxType = 'advance' | 'advance-return' | 'gratuity' | 'bonus' | 'deduction'

const TX_CFG: Record<TxType, { label: string; icon: React.ElementType; color: string; bg: string; placeholder: string }> = {
  'advance':        { label: 'صرف سلفة',      icon: CreditCard, color: 'text-orange-700', bg: 'bg-orange-50', placeholder: 'مبلغ السلفة...' },
  'advance-return': { label: 'رد سلفة',        icon: Minus,      color: 'text-blue-700',   bg: 'bg-blue-50',   placeholder: 'مبلغ الرد...' },
  'gratuity':       { label: 'صرف اكراميات',   icon: Star,       color: 'text-yellow-700', bg: 'bg-yellow-50', placeholder: 'مبلغ الاكراميات...' },
  'bonus':          { label: 'صرف مكافأة',     icon: Star,       color: 'text-green-700',  bg: 'bg-green-50',  placeholder: 'مبلغ المكافأة...' },
  'deduction':      { label: 'تطبيق خصم',      icon: Minus,      color: 'text-red-700',    bg: 'bg-red-50',    placeholder: 'مبلغ الخصم...' },
}

function QuickTxModal({ empId, type, onSave, onClose, employees }: {
  empId: string
  type: TxType
  onSave: (tx: QuickTransaction) => void
  onClose: () => void
  employees: AttEmployee[]
}) {
  const emp = employees.find(e => e.id === empId)
  const cfg = TX_CFG[type]
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const valid = parseFloat(amount) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`h-1 w-full ${cfg.bg.replace('50', '400')}`} />

        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
              <cfg.icon size={15} className={cfg.color} />
            </div>
            <div>
              <h2 className={`font-cairo font-bold text-[14px] ${cfg.color}`}>{cfg.label}</h2>
              <p className="font-cairo text-[11px] text-neutral-400">{emp?.name} · {emp?.employeeNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">المبلغ (ج.م) <span className="text-red-500">*</span></label>
            <input
              type="number" min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={cfg.placeholder}
              className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[14px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
              autoFocus
            />
          </div>
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">ملاحظات</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="سبب العملية..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-cairo text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">
            إلغاء
          </button>
          <button
            onClick={() => valid && onSave({ id: genTxId(), employeeId: empId, date: today(), type, amount: parseFloat(amount), notes: notes || undefined })}
            disabled={!valid}
            className={`flex items-center gap-2 px-5 py-2 ${cfg.bg} ${cfg.color} border border-current rounded-lg font-cairo text-[13px] font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors hover:opacity-80`}
          >
            <cfg.icon size={14} />
            تأكيد
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Bulk Status Modal ─────────────────────────────────────────────────────────────────────────────

function BulkStatusModal({ count, onClose, onSave }: { count: number; onClose: () => void; onSave: (status: StatusKey) => void }) {
  const [status, setStatus] = useState<StatusKey>('on-time')
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-cairo font-bold text-[16px] text-neutral-800 mb-2">تعديل الحالة مجمّعاً</h3>
        <p className="font-cairo text-[13px] text-neutral-500 mb-6">سيتم تغيير حالة اليوم لـ {count} سجل/سجلات محددة.</p>
        
        <label className="block text-[12px] font-semibold text-neutral-600 mb-2">اختر الحالة الجديدة</label>
        <div className="flex gap-2 flex-wrap mb-6">
          {(['on-time', 'late', 'half-day', 'leave', 'absent'] as StatusKey[]).map(s => {
            const cfg = STATUS_CFG[s]
            return (
              <button
                key={s} type="button" onClick={() => setStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-cairo text-[12px] font-semibold border transition-all ${
                  status === s
                    ? `${cfg.bg} ${cfg.color} border-current`
                    : 'bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => onSave(status)} className="flex-1 h-10 bg-[#1a6b3c] text-white rounded-lg font-cairo font-bold text-[13px] hover:bg-[#145730] transition-colors">تحديث</button>
          <button onClick={onClose} className="px-5 h-10 border border-neutral-200 text-neutral-600 rounded-lg font-cairo font-bold text-[13px] hover:bg-neutral-50 transition-colors">إلغاء</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────────────────────

export default function AttendancePage() {
  // ── Live employees — reads from EmployeesPage localStorage, falls back to seed data
  const employees: AttEmployee[] = useMemo(() =>
    readLocalStorage<typeof INITIAL_EMPLOYEES>(DB_KEYS.employees, INITIAL_EMPLOYEES)
      .filter(e => e.status !== 'inactive')
      .map(mapHR)
  , [])

  const [records, setRecords] = useLocalStorage<AttendanceRecord[]>('vetafarm_attendance_records', initRecords)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusKey | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null)
  // Leave balances state (mutable, starts from employee data)
  const [leaveBalances, setLeaveBalances] = useLocalStorage<Record<string, number>>(
    'vetafarm_attendance_leaves',
    () => Object.fromEntries(employees.map(e => [e.id, e.annualLeave - e.usedLeave]))
  )
  // Quick transaction modal
  const [quickTx, setQuickTx] = useState<{ empId: string; type: TxType } | null>(null)

  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set())
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set())
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false)

  // Ensure any employee added after first mount gets a default leave balance entry
  useEffect(() => {
    const missing = employees.filter(e => leaveBalances[e.id] === undefined)
    if (missing.length > 0) {
      setLeaveBalances(prev => ({
        ...prev,
        ...Object.fromEntries(missing.map(e => [e.id, e.annualLeave - e.usedLeave])),
      }))
    }
  }, [employees])  // eslint-disable-line

  const todayDate = today()

  // ── Stats ──
  const stats = useMemo(() => {
    const todayRecs = records.filter(r => r.date === todayDate)
    return {
      total:   employees.length,
      present: todayRecs.filter(r => ['on-time','late','half-day','present'].includes(r.status)).length,
      absent:  todayRecs.filter(r => r.status === 'absent').length,
      leave:   todayRecs.filter(r => r.status === 'leave').length,
      late:    todayRecs.filter(r => r.status === 'late').length,
    }
  }, [records, todayDate])

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return records.filter(r => {
      const emp = employees.find(e => e.id === r.employeeId)
      const q = search.trim().toLowerCase()
      const matchQ = !q || emp?.name.includes(q) || emp?.department.includes(q) || emp?.employeeNumber.toLowerCase().includes(q)
      const matchS = filterStatus === 'all' || r.status === filterStatus
      return matchQ && matchS
    })
  }, [records, search, filterStatus])

  const { page, setPage, totalPages, slice, total } = usePagination(filtered)

  // ── Selected States updates ──
  useEffect(() => { setSelectedRecordIds(new Set()) }, [page, search, filterStatus])

  // ── Bulk Actions on Cards ──
  function toggleEmpSelect(id: string) {
    setSelectedEmpIds(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function handleBulkCheckIn() {
    let count = 0
    const time = nowTime()
    const hour = parseInt(time.split(':')[0])
    const isLate = hour >= 8
    
    setRecords(prev => {
      const updated = [...prev]
      selectedEmpIds.forEach(id => {
        if (!updated.find(r => r.employeeId === id && r.date === todayDate)) {
          updated.unshift({ id: genId(), employeeId: id, date: todayDate, checkIn: time, status: isLate ? 'late' : 'on-time' })
          count++
        }
      })
      return updated
    })
    
    toast.success('تم تسجيل الحضور الجماعي بنجاح', { description: `تم حضور ${count} موظفين.` })
    setSelectedEmpIds(new Set())
  }

  function handleBulkCheckOut() {
    let count = 0
    const time = nowTime()
    setRecords(prev => {
      const updated = [...prev]
      selectedEmpIds.forEach(id => {
        const idx = updated.findIndex(r => r.employeeId === id && r.date === todayDate && !r.checkOut)
        if (idx !== -1) {
          const r = updated[idx]
          if (r.checkIn) {
            const [ih, im] = r.checkIn.split(':').map(Number)
            const [oh, om] = time.split(':').map(Number)
            const dur = (oh * 60 + om) - (ih * 60 + im)
            updated[idx] = { ...r, checkOut: time, duration: dur > 0 ? dur : 0 }
          } else {
            updated[idx] = { ...r, checkOut: time }
          }
          count++
        }
      })
      return updated
    })
    
    toast.success('تم تسجيل الانصراف الجماعي بنجاح', { description: `تم انصراف ${count} موظفين.` })
    setSelectedEmpIds(new Set())
  }

  // ── Bulk Actions on Table ──
  function toggleRecordSelect(id: string) {
    setSelectedRecordIds(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function toggleSelectAllRecords() {
    if (selectedRecordIds.size === slice.length && slice.length > 0) setSelectedRecordIds(new Set())
    else setSelectedRecordIds(new Set(slice.map(r => r.id)))
  }

  function handleBulkRecordDelete() {
    setRecords(prev => prev.filter(r => !selectedRecordIds.has(r.id)))
    toast.success('تم حذف السجلات بنجاح', { description: `تم مسح ${selectedRecordIds.size} سجلات.` })
    setSelectedRecordIds(new Set())
  }

  function handleBulkStatusSave(status: StatusKey) {
    setRecords(prev => prev.map(r => selectedRecordIds.has(r.id) ? { ...r, status, leaveType: status==='leave'?'annual':undefined } : r))
    toast.success('تم تعديل حالة السجلات بنجاح', { description: `تم تحديث ${selectedRecordIds.size} سجلات.` })
    setShowBulkStatusModal(false)
    setSelectedRecordIds(new Set())
  }

  // ── Quick check-in ──
  function handleQuickCheckIn(employeeId: string) {
    if (records.find(r => r.employeeId === employeeId && r.date === todayDate)) {
      toast.error('هذا الموظف سجّل حضوره مسبقاً')
      return
    }
    const time = nowTime()
    const hour = parseInt(time.split(':')[0])
    const isLate = hour >= 8
    setRecords(prev => [{ id: genId(), employeeId, date: todayDate, checkIn: time, status: isLate ? 'late' : 'on-time' }, ...prev])
    const emp = employees.find(e => e.id === employeeId)
    toast.success(`تم تسجيل حضور ${emp?.name ?? ''}`, {
      description: `الوقت: ${time} · ${isLate ? 'متأخر' : 'في الموعد'}`,
    })
  }

  // ── Quick check-out ──
  function handleQuickCheckOut(employeeId: string) {
    const idx = records.findIndex(r => r.employeeId === employeeId && r.date === todayDate && !r.checkOut)
    if (idx === -1) return
    const time = nowTime()
    const updated = [...records]
    const r = updated[idx]
    if (r.checkIn) {
      const [ih, im] = r.checkIn.split(':').map(Number)
      const [oh, om] = time.split(':').map(Number)
      const dur = (oh * 60 + om) - (ih * 60 + im)
      updated[idx] = { ...r, checkOut: time, duration: dur > 0 ? dur : 0 }
    } else {
      updated[idx] = { ...r, checkOut: time }
    }
    setRecords(updated)
    const emp = employees.find(e => e.id === employeeId)
    const dur = updated[idx].duration
    toast.success(`تم تسجيل انصراف ${emp?.name ?? ''}`, {
      description: dur ? `مدة العمل: ${fmtDuration(dur)}` : `الوقت: ${time}`,
    })
  }

  // ── Add manual ──
  function handleAdd(form: ManualForm) {
    let dur: number | undefined
    if (form.checkIn && form.checkOut) {
      const [ih, im] = form.checkIn.split(':').map(Number)
      const [oh, om] = form.checkOut.split(':').map(Number)
      dur = (oh * 60 + om) - (ih * 60 + im)
    }
    const isLeave = form.status === 'leave' || form.status === 'absent'
    if (isLeave && form.leaveType !== 'none' && form.leaveType !== 'unpaid') {
      setLeaveBalances(prev => ({
        ...prev,
        [form.employeeId]: Math.max(0, (prev[form.employeeId] ?? 0) - 1),
      }))
    }
    setRecords(prev => [{
      id: genId(),
      employeeId: form.employeeId,
      date: form.date,
      checkIn: form.checkIn || undefined,
      checkOut: form.checkOut || undefined,
      status: form.status,
      leaveType: isLeave ? form.leaveType : undefined,
      notes: form.notes || undefined,
      duration: dur,
    }, ...prev])
    setShowModal(false)
    const emp = employees.find(e => e.id === form.employeeId)
    toast.success(`تم تسجيل ${STATUS_CFG[form.status].label} — ${emp?.name ?? ''}`)
  }

  // ── Edit ──
  function handleEdit(form: ManualForm) {
    if (!editRecord) return
    let dur: number | undefined
    if (form.checkIn && form.checkOut) {
      const [ih, im] = form.checkIn.split(':').map(Number)
      const [oh, om] = form.checkOut.split(':').map(Number)
      dur = (oh * 60 + om) - (ih * 60 + im)
    }
    setRecords(prev => prev.map(r => r.id === editRecord.id ? {
      ...r,
      employeeId: form.employeeId,
      date: form.date,
      checkIn: form.checkIn || undefined,
      checkOut: form.checkOut || undefined,
      status: form.status,
      leaveType: (form.status === 'leave' || form.status === 'absent') ? form.leaveType : undefined,
      notes: form.notes || undefined,
      duration: dur,
    } : r))
    setEditRecord(null)
    toast.success('تم تعديل السجل بنجاح')
  }

  // ── Quick Transaction ──
  function handleQuickTx(tx: QuickTransaction) {
    const emp = employees.find(e => e.id === tx.employeeId)
    const cfg = TX_CFG[tx.type]
    toast.success(`${cfg.label} — ${emp?.name ?? ''}`, {
      description: `المبلغ: ${fmtMoney(tx.amount)}${tx.notes ? ' · ' + tx.notes : ''}`,
    })
    setQuickTx(null)
  }

  function editInitialForm(r: AttendanceRecord): ManualForm {
    return {
      employeeId: r.employeeId,
      date: r.date,
      checkIn: r.checkIn ?? '',
      checkOut: r.checkOut ?? '',
      status: r.status as StatusKey,
      leaveType: r.leaveType ?? 'annual',
      notes: r.notes ?? '',
    }
  }

  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1200px] mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-800">الحضور والانصراف</h1>
            <p className="font-cairo text-[13px] text-neutral-400 mt-0.5">تسجيل ومتابعة حضور وانصراف الموظفين يومياً</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-cairo text-[13px] font-semibold hover:bg-neutral-50 transition-all">
              <Download size={15} />
              تصدير
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a6b3c] text-white rounded-xl font-cairo text-[13px] font-semibold hover:bg-[#145730] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={16} />
              تسجيل يدوي
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}       label="إجمالي الموظفين" value={stats.total}   color="primary" />
          <StatCard icon={UserCheck}   label="الحضور اليوم"    value={stats.present} color="success" />
          <StatCard icon={UserX}       label="الغياب اليوم"    value={stats.absent}  color="error"   />
          <StatCard icon={AlertCircle} label="إجازة اليوم"     value={stats.leave}   color="warning" />
        </div>

        {/* ── Quick Check-in Panel ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#1a6b3c]" />
              <h2 className="font-cairo font-bold text-[14px] text-neutral-800">تسجيل سريع — {fmtDate(todayDate)}</h2>
            </div>
            {selectedEmpIds.size > 0 ? (
              <div className="flex items-center gap-2">
                <span className="font-cairo font-bold text-[12px] text-[#1a6b3c]">تم تحديد {selectedEmpIds.size}</span>
                <button onClick={handleBulkCheckIn} className="px-3 py-1.5 bg-[#1a6b3c] text-white rounded-lg font-cairo text-[11px] font-semibold hover:bg-[#145730] transition-colors shadow-sm"><LogIn size={13} className="inline mr-1" /> حضور</button>
                <button onClick={handleBulkCheckOut} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-cairo text-[11px] font-semibold hover:bg-red-700 transition-colors shadow-sm"><LogOut size={13} className="inline mr-1" /> انصراف</button>
                <button onClick={() => setSelectedEmpIds(new Set())} className="px-2 py-1.5 text-neutral-500 hover:text-neutral-700 font-cairo text-[11px] transition-colors"><X size={15}/></button>
              </div>
            ) : (
              <p className="font-cairo text-[11px] text-neutral-400">انقر على البطاقة لتحديد موظفين</p>
            )}
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {employees.map(emp => {
              const rec = records.find(r => r.employeeId === emp.id && r.date === todayDate)
              const checkedIn  = !!rec?.checkIn
              const checkedOut = !!rec?.checkOut
              const statusCfg  = rec ? STATUS_CFG[rec.status as StatusKey] : null
              const leaveLeft  = leaveBalances[emp.id] ?? 0

              return (
                <div key={emp.id} onClick={() => toggleEmpSelect(emp.id)} className={`rounded-xl border p-3 flex flex-col gap-2.5 transition-colors cursor-pointer ${selectedEmpIds.has(emp.id) ? 'bg-[#e8f5ee] border-[#1a6b3c]' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-200'}`}>
                  {/* معلومات الموظف */}
                  <div className="flex items-center gap-2.5">
                    <input type="checkbox" checked={selectedEmpIds.has(emp.id)} onChange={() => {}} className="w-4 h-4 rounded border-neutral-300 text-[#1a6b3c] focus:ring-[#1a6b3c] cursor-pointer" />
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <span className="font-cairo font-bold text-[13px] text-[#1a6b3c]">{emp.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-cairo font-semibold text-[12px] text-neutral-800 truncate">{emp.name}</p>
                      <p className="font-cairo text-[10px] text-neutral-400 truncate">{emp.employeeNumber} · {emp.department}</p>
                    </div>
                    {/* رصيد الإجازات */}
                    <div className={`px-1.5 py-0.5 rounded-md text-[10px] font-cairo font-semibold shrink-0 ${leaveLeft <= 3 ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                      {leaveLeft}ي
                    </div>
                  </div>

                  {/* حالة اليوم */}
                  {rec && statusCfg && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-cairo font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} shrink-0`} />
                      <span>{statusCfg.label}</span>
                      {rec.leaveType && (
                        <span className="opacity-70">· {LEAVE_TYPE_LABELS[rec.leaveType]}</span>
                      )}
                      {rec.checkIn && <span className="ms-auto opacity-70" dir="ltr">{rec.checkIn}</span>}
                    </div>
                  )}

                  {/* أزرار الحضور */}
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleQuickCheckIn(emp.id)}
                      disabled={checkedIn}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-cairo text-[11px] font-semibold transition-all ${
                        checkedIn
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                      }`}
                    >
                      <LogIn size={11} />
                      حضور
                    </button>
                    <button
                      onClick={() => handleQuickCheckOut(emp.id)}
                      disabled={!checkedIn || checkedOut}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg font-cairo text-[11px] font-semibold transition-all ${
                        !checkedIn || checkedOut
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <LogOut size={11} />
                      انصراف
                    </button>
                  </div>

                  {/* أزرار العمليات المالية */}
                  <div className="grid grid-cols-4 gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setQuickTx({ empId: emp.id, type: 'advance' })}
                      className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors"
                      title="صرف سلفة"
                    >
                      <CreditCard size={12} />
                      <span className="font-cairo text-[9px] font-semibold">سلفة</span>
                    </button>
                    <button
                      onClick={() => setQuickTx({ empId: emp.id, type: 'advance-return' })}
                      className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                      title="رد سلفة"
                    >
                      <Minus size={12} />
                      <span className="font-cairo text-[9px] font-semibold">رد</span>
                    </button>
                    <button
                      onClick={() => setQuickTx({ empId: emp.id, type: 'gratuity' })}
                      className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 transition-colors"
                      title="اكراميات"
                    >
                      <Star size={12} />
                      <span className="font-cairo text-[9px] font-semibold">اكراميات</span>
                    </button>
                    <button
                      onClick={() => setQuickTx({ empId: emp.id, type: 'deduction' })}
                      className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      title="خصم"
                    >
                      <ShieldAlert size={12} />
                      <span className="font-cairo text-[9px] font-semibold">خصم</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="بحث بالاسم أو القسم أو رقم الموظف..."
              className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 ps-8 pe-3 font-cairo text-[13px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }} className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-neutral-400" />
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
              {([
                ['all',      'الكل'],
                ['on-time',  'في الموعد'],
                ['late',     'متأخر'],
                ['absent',   'غائب'],
                ['leave',    'إجازة'],
                ['half-day', 'نصف يوم'],
              ] as [StatusKey | 'all', string][]).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => { setFilterStatus(v); setPage(1) }}
                  className={`px-3 py-1.5 font-cairo text-[12px] font-semibold transition-colors ${
                    filterStatus === v ? 'bg-[#1a6b3c] text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Attendance Table ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          {selectedRecordIds.size > 0 && (
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
               <span className="font-cairo font-bold text-[13px] text-blue-800">تم تحديد {selectedRecordIds.size} سجلات</span>
               <div className="flex items-center gap-2">
                 <button onClick={() => setShowBulkStatusModal(true)} className="px-3 py-1.5 bg-white text-blue-700 border border-blue-200 rounded-lg font-cairo font-semibold text-[12px] hover:bg-blue-100 transition-colors shadow-sm">تعديل الحالة</button>
                 <button onClick={handleBulkRecordDelete} className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg font-cairo font-semibold text-[12px] hover:bg-red-50 transition-colors shadow-sm">حذف السجلات</button>
                 <button onClick={() => setSelectedRecordIds(new Set())} className="px-3 py-1.5 text-neutral-500 hover:text-neutral-700 font-cairo font-semibold text-[12px] transition-colors">إلغاء</button>
               </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="px-4 py-3 w-10 text-right"><input type="checkbox" checked={selectedRecordIds.size > 0 && selectedRecordIds.size === slice.length} onChange={toggleSelectAllRecords} className="w-4 h-4 rounded border-neutral-300 text-[#1a6b3c] focus:ring-[#1a6b3c] cursor-pointer" /></th>
                  {['رقم الموظف', 'الموظف', 'التاريخ', 'وقت الحضور', 'وقت الانصراف', 'عدد ساعات العمل', 'حالة اليوم', 'الرصيد المتبقي', 'ملاحظات', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 font-cairo font-semibold text-[11px] text-neutral-500 whitespace-nowrap text-right ${i === 9 ? 'w-16' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center">
                          <CalendarDays size={24} className="text-neutral-300" />
                        </div>
                        <p className="font-cairo text-[13px] text-neutral-400">لا توجد سجلات مطابقة</p>
                      </div>
                    </td>
                  </tr>
                ) : slice.map(record => {
                  const emp = employees.find(e => e.id === record.employeeId)
                  const statusCfg = STATUS_CFG[record.status as StatusKey] ?? STATUS_CFG['present']
                  const leaveLeft = leaveBalances[record.employeeId] ?? 0
                  return (
                    <tr key={record.id} onClick={() => toggleRecordSelect(record.id)} className={`transition-colors cursor-pointer ${selectedRecordIds.has(record.id) ? 'bg-[#e8f5ee]' : 'hover:bg-neutral-50/70'}`}>
                      <td className="px-4 py-3.5"><input type="checkbox" checked={selectedRecordIds.has(record.id)} onChange={() => {}} className="w-4 h-4 rounded border-neutral-300 text-[#1a6b3c] focus:ring-[#1a6b3c] cursor-pointer" /></td>
                      {/* رقم الموظف */}
                      <td className="px-4 py-3.5">
                        <span className="font-cairo text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {emp?.employeeNumber ?? '—'}
                        </span>
                      </td>
                      {/* الموظف */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#e8f5ee] flex items-center justify-center shrink-0">
                            <span className="font-cairo font-bold text-[13px] text-[#1a6b3c]">{emp?.name.charAt(0) ?? '؟'}</span>
                          </div>
                          <div>
                            <p className="font-cairo font-semibold text-[13px] text-neutral-800">{emp?.name ?? '—'}</p>
                            <p className="font-cairo text-[11px] text-neutral-400">{emp?.department ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      {/* التاريخ */}
                      <td className="px-4 py-3.5">
                        <span className="font-cairo text-[12px] text-neutral-600">{fmtDate(record.date)}</span>
                      </td>
                      {/* وقت الحضور */}
                      <td className="px-4 py-3.5">
                        {record.checkIn
                          ? <span className="font-cairo text-[12px] text-green-700 font-semibold" dir="ltr">{record.checkIn}</span>
                          : <span className="font-cairo text-[12px] text-neutral-300">—</span>}
                      </td>
                      {/* وقت الانصراف */}
                      <td className="px-4 py-3.5">
                        {record.checkOut
                          ? <span className="font-cairo text-[12px] text-red-600 font-semibold" dir="ltr">{record.checkOut}</span>
                          : record.checkIn
                            ? <span className="font-cairo text-[11px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">في العمل</span>
                            : <span className="font-cairo text-[12px] text-neutral-300">—</span>}
                      </td>
                      {/* عدد ساعات العمل */}
                      <td className="px-4 py-3.5">
                        {record.duration
                          ? <div className="flex items-center gap-1"><Timer size={12} className="text-neutral-400" /><span className="font-cairo text-[12px] text-neutral-700">{fmtDuration(record.duration)}</span></div>
                          : <span className="font-cairo text-[12px] text-neutral-300">—</span>}
                      </td>
                      {/* حالة اليوم */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
                          </span>
                          {record.leaveType && (
                            <p className="font-cairo text-[10px] text-neutral-400 mt-0.5 ps-1">{LEAVE_TYPE_LABELS[record.leaveType]}</p>
                          )}
                        </div>
                      </td>
                      {/* الرصيد المتبقي */}
                      <td className="px-4 py-3.5">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold ${leaveLeft <= 3 ? 'bg-red-50 text-red-700' : 'bg-purple-50 text-purple-700'}`}>
                          <CalendarDays size={11} />
                          {leaveLeft} يوم
                        </div>
                      </td>
                      {/* ملاحظات */}
                      <td className="px-4 py-3.5 max-w-[120px]">
                        <span className="font-cairo text-[12px] text-neutral-500 truncate block">{record.notes || '—'}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setEditRecord(record)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>

        {/* ── جدول رصيد الإجازات ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-100">
            <CalendarDays size={15} className="text-purple-500" />
            <h2 className="font-cairo font-bold text-[14px] text-neutral-700">رصيد الإجازات السنوية</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {['رقم الموظف', 'اسم الموظف', 'الإجازات السنوية الكلية', 'المستخدم', 'الرصيد المتبقي', 'المعدل الشهري'].map((h, i) => (
                    <th key={i} className="px-4 py-3 font-cairo font-semibold text-[11px] text-neutral-500 whitespace-nowrap text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {employees.map(emp => {
                  const left = leaveBalances[emp.id] ?? 0
                  const used = emp.annualLeave - left
                  const pct  = Math.round((left / emp.annualLeave) * 100)
                  return (
                    <tr key={emp.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-cairo text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">{emp.employeeNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center shrink-0">
                            <span className="font-cairo font-bold text-[12px] text-[#1a6b3c]">{emp.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-cairo font-semibold text-[13px] text-neutral-800">{emp.name}</p>
                            <p className="font-cairo text-[11px] text-neutral-400">{emp.jobTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-cairo text-[13px] text-neutral-700 font-semibold">{emp.annualLeave} يوم</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-cairo text-[13px] text-orange-600">{used} يوم</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className={`h-full rounded-full ${left <= 3 ? 'bg-red-400' : left <= 7 ? 'bg-yellow-400' : 'bg-purple-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`font-cairo font-bold text-[13px] ${left <= 3 ? 'text-red-600' : 'text-purple-700'}`}>{left} يوم</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-cairo text-[12px] text-neutral-500">{(emp.annualLeave / 12).toFixed(1)} يوم/شهر</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Modals ── */}
      {showModal && (
        <ManualModal initial={emptyManualForm()} isEdit={false} onSave={handleAdd} onClose={() => setShowModal(false)} employees={employees} />
      )}
      {editRecord && (
        <ManualModal initial={editInitialForm(editRecord)} isEdit onSave={handleEdit} onClose={() => setEditRecord(null)} employees={employees} />
      )}
      {quickTx && (
        <QuickTxModal empId={quickTx.empId} type={quickTx.type} onSave={handleQuickTx} onClose={() => setQuickTx(null)} employees={employees} />
      )}
    </div>
  )
}
