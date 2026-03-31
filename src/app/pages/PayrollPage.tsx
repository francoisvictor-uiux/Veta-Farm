import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Search, X, Plus, Download, Filter,
  Wallet, CheckCircle2, Clock3, AlertCircle,
  ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft,
  Edit2, Banknote, TrendingUp, Users, Eye, Check,
  ShieldCheck, Receipt, CreditCard, Star, Calendar, ChevronDown,
} from 'lucide-react'
import { payrollEmployees, payrollRecords as initRecords } from '../data/payrollData'
import { PayrollRecord, PayrollStatus } from '../types/payroll'

// ─── Helpers ───────────────────────────────────────────────────────────────────────────────

function fmtMoney(n: number) {
  return n.toLocaleString('ar-EG') + ' ج.م'
}

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
}

function genId() { return `pay-${Date.now()}` }

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function buildMonths() {
  const months: string[] = []
  const d = new Date()
  for (let i = 0; i < 12; i++) {
    months.push(new Date(d.getFullYear(), d.getMonth() - i, 1).toISOString().slice(0, 7))
  }
  return months
}

const MONTHS = buildMonths()

// ─── Status Config ─────────────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<PayrollStatus, { label: string; color: string; bg: string; dot: string }> = {
  paid:      { label: 'مُصرَّف', color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-500'  },
  pending:   { label: 'معلق',    color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  'on-hold': { label: 'موقوف',   color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-500'    },
  partial:   { label: 'جزئي',    color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
}

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

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string
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
        <p className={`font-cairo font-bold text-[18px] ${c.text} leading-tight`}>{value}</p>
        {sub && <p className="font-cairo text-[10px] text-neutral-400 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Payroll Form ───────────────────────────────────────────────────────────────────────────────

interface PayrollForm {
  employeeId: string
  month: string
  baseSalary: string
  insurance: string
  taxes: string
  advances: string
  allowances: string
  gratuities: string
  deductions: string
  bonus: string
  workDays: string
  leaveDays: string
  status: PayrollStatus
  notes: string
}

function emptyForm(): PayrollForm {
  return {
    employeeId: '', month: currentMonth(),
    baseSalary: '', insurance: '0', taxes: '0',
    advances: '0', allowances: '0', gratuities: '0',
    deductions: '0', bonus: '0',
    workDays: '26', leaveDays: '0',
    status: 'pending', notes: '',
  }
}

function toNum(s: string) { return parseFloat(s) || 0 }

function calcNet(f: PayrollForm): number {
  return Math.max(0,
    toNum(f.baseSalary) + toNum(f.allowances) + toNum(f.gratuities) + toNum(f.bonus)
    - toNum(f.insurance) - toNum(f.taxes) - toNum(f.advances) - toNum(f.deductions)
  )
}

function PayrollModal({ initial, isEdit, onSave, onClose }: {
  initial: PayrollForm
  isEdit: boolean
  onSave: (data: PayrollForm) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<PayrollForm>(initial)
  const [showExtra, setShowExtra] = useState(false)
  const set = <K extends keyof PayrollForm>(k: K, v: PayrollForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  function onEmployee(id: string) {
    const emp = payrollEmployees.find(e => e.id === id)
    setForm(f => ({
      ...f,
      employeeId: id,
      baseSalary: emp ? String(emp.baseSalary) : '',
      insurance:  emp ? String(emp.insurance)  : '0',
      taxes:      emp ? String(emp.taxes)      : '0',
    }))
  }

  const net = calcNet(form)
  const valid = form.employeeId !== '' && form.baseSalary !== '' && net >= 0

  const Field = ({ label, k, required, hint }: { label: string; k: keyof PayrollForm; required?: boolean; hint?: string }) => (
    <div>
      <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="font-normal text-neutral-400 ms-1">{hint}</span>}
      </label>
      <input
        type="number" min="0"
        value={form[k] as string}
        onChange={e => set(k, e.target.value)}
        placeholder="0"
        className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-l from-[#1a6b3c] to-[#2d9e5f] shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center">
              <Wallet size={16} className="text-[#1a6b3c]" />
            </div>
            <h2 className="font-cairo font-bold text-[15px] text-neutral-800">
              {isEdit ? 'تعديل مسير الراتب' : 'إضافة مسير راتب'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* الموظف والشهر */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">
                الموظف <span className="text-red-500">*</span>
              </label>
              <select
                value={form.employeeId}
                onChange={e => onEmployee(e.target.value)}
                disabled={isEdit}
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition disabled:opacity-60"
              >
                <option value="">اختر موظف...</option>
                {payrollEmployees.map(e => (
                  <option key={e.id} value={e.id}>{e.employeeNumber} · {e.name} — {e.department}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">الشهر</label>
              <select
                value={form.month}
                onChange={e => set('month', e.target.value)}
                disabled={isEdit}
                className="w-full h-9 rounded-lg border border-neutral-200 bg-neutral-50 px-3 font-cairo text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] transition disabled:opacity-60"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{fmtMonth(m)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="أيام العمل" k="workDays" />
              <Field label="أيام الإجازة" k="leaveDays" />
            </div>
          </div>

          {/* الراتب الأساسي + الاستقطاعات الإلزامية */}
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-100">
              <p className="font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">الراتب والاستقطاعات الإلزامية</p>
            </div>
            <div className="p-3 grid grid-cols-3 gap-3">
              <Field label="الراتب الأساسي" k="baseSalary" required />
              <Field label="تأمينات" k="insurance" />
              <Field label="ضرائب" k="taxes" />
            </div>
          </div>

          {/* الإضافات */}
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-100">
              <p className="font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">الإضافات</p>
            </div>
            <div className="p-3 grid grid-cols-3 gap-3">
              <Field label="بدلات" k="allowances" />
              <Field label="اكراميات" k="gratuities" />
              <Field label="مكافآت" k="bonus" />
            </div>
          </div>

          {/* الخصومات */}
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-100">
              <p className="font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">الخصومات والسُّلف</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-3">
              <Field label="سُلف" k="advances" hint="(خصم من الصافي)" />
              <Field label="خصومات أخرى" k="deductions" />
            </div>
          </div>

          {/* صافي الراتب */}
          <div className="rounded-xl bg-[#e8f5ee] border border-[#1a6b3c]/15 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-cairo text-[11px] text-[#1a6b3c]/70">المعادلة: راتب + بدلات + اكراميات + مكافآت − تأمينات − ضرائب − سُلف − خصومات</p>
              <p className="font-cairo text-[12px] font-semibold text-[#1a6b3c] mt-0.5">صافي الراتب</p>
            </div>
            <span className="font-cairo font-bold text-[20px] text-[#1a6b3c]">{fmtMoney(net)}</span>
          </div>

          {/* الحالة */}
          <div>
            <label className="font-cairo text-[12px] font-semibold text-neutral-600 block mb-1.5">الحالة</label>
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'paid', 'partial', 'on-hold'] as PayrollStatus[]).map(s => {
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">
            إلغاء
          </button>
          <button
            onClick={() => valid && onSave(form)}
            disabled={!valid}
            className="flex items-center gap-2 px-5 py-2 bg-[#1a6b3c] text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-[#145730] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            {isEdit ? <><Edit2 size={14} /> حفظ التعديلات</> : <><Plus size={14} /> إضافة المسير</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Modal ──────────────────────────────────────────────────────────────────────────────

function DetailModal({ record, onClose, onMarkPaid }: {
  record: PayrollRecord
  onClose: () => void
  onMarkPaid: (id: string) => void
}) {
  const emp = payrollEmployees.find(e => e.id === record.employeeId)
  const cfg = STATUS_CFG[record.status]

  const Section = ({ title, rows }: { title: string; rows: { label: string; value: string; cls?: string }[] }) => (
    <div className="rounded-xl border border-neutral-100 overflow-hidden">
      <div className="bg-neutral-50 px-3 py-2 border-b border-neutral-100">
        <p className="font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">{title}</p>
      </div>
      {rows.map((row, i) => (
        <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i < rows.length - 1 ? 'border-b border-neutral-50' : ''}`}>
          <span className="font-cairo text-[12px] text-neutral-500">{row.label}</span>
          <span className={`font-cairo font-semibold text-[13px] ${row.cls || 'text-neutral-700'}`}>{row.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-l from-[#1a6b3c] to-[#2d9e5f] shrink-0" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5ee] flex items-center justify-center">
              <Eye size={15} className="text-[#1a6b3c]" />
            </div>
            <h2 className="font-cairo font-bold text-[15px] text-neutral-800">تفاصيل المسير</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Employee badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] flex items-center justify-center shrink-0">
              <span className="font-cairo font-bold text-[14px] text-[#1a6b3c]">{emp?.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-cairo font-bold text-[14px] text-neutral-800">{emp?.name}</p>
              <p className="font-cairo text-[11px] text-neutral-400">{emp?.employeeNumber} · {emp?.jobTitle} · {emp?.department}</p>
            </div>
            <span className={`ms-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold ${cfg.bg} ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>

          {/* الشهر وأيام العمل */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3 text-center">
              <p className="font-cairo text-[10px] text-neutral-400 mb-1">الشهر</p>
              <p className="font-cairo font-bold text-[12px] text-neutral-700">{fmtMonth(record.month)}</p>
            </div>
            <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center">
              <p className="font-cairo text-[10px] text-neutral-400 mb-1">أيام العمل</p>
              <p className="font-cairo font-bold text-[16px] text-green-700">{record.workDays}</p>
            </div>
            <div className="rounded-xl bg-yellow-50 border border-yellow-100 p-3 text-center">
              <p className="font-cairo text-[10px] text-neutral-400 mb-1">أيام الإجازة</p>
              <p className="font-cairo font-bold text-[16px] text-yellow-700">{record.leaveDays}</p>
            </div>
          </div>

          {/* الراتب والاستقطاعات */}
          <Section title="الراتب والاستقطاعات الإلزامية" rows={[
            { label: 'الراتب الأساسي', value: fmtMoney(record.baseSalary) },
            { label: 'تأمينات',        value: `- ${fmtMoney(record.insurance)}`,  cls: 'text-red-600' },
            { label: 'ضرائب',          value: `- ${fmtMoney(record.taxes)}`,       cls: 'text-red-600' },
          ]} />

          {/* الإضافات */}
          <Section title="الإضافات" rows={[
            { label: 'بدلات',    value: `+ ${fmtMoney(record.allowances)}`,  cls: 'text-green-600' },
            { label: 'اكراميات', value: `+ ${fmtMoney(record.gratuities)}`,  cls: 'text-green-600' },
            { label: 'مكافآت',   value: `+ ${fmtMoney(record.bonus)}`,        cls: 'text-green-600' },
          ]} />

          {/* الخصومات */}
          <Section title="الخصومات والسُّلف" rows={[
            { label: 'سُلف',          value: `- ${fmtMoney(record.advances)}`,  cls: 'text-orange-600' },
            { label: 'خصومات أخرى',  value: `- ${fmtMoney(record.deductions)}`, cls: 'text-red-600' },
          ]} />

          {/* صافي */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#e8f5ee] rounded-xl border border-[#1a6b3c]/15">
            <span className="font-cairo font-bold text-[13px] text-[#1a6b3c]">صافي الراتب</span>
            <span className="font-cairo font-bold text-[20px] text-[#1a6b3c]">{fmtMoney(record.netSalary)}</span>
          </div>

          {record.notes && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-100 px-3 py-2">
              <p className="font-cairo text-[12px] text-yellow-700">{record.notes}</p>
            </div>
          )}
          {record.paidAt && (
            <div className="flex items-center justify-between">
              <span className="font-cairo text-[12px] text-neutral-400">تاريخ الصرف</span>
              <span className="font-cairo text-[12px] text-neutral-600">
                {new Date(record.paidAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-neutral-100 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-cairo text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">
            إغلاق
          </button>
          {record.status !== 'paid' && (
            <button
              onClick={() => { onMarkPaid(record.id); onClose() }}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-cairo text-[13px] font-semibold hover:bg-green-700 transition-colors"
            >
              <Check size={14} />
              تأكيد الصرف
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────────────────────

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>(initRecords)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<PayrollStatus | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState<PayrollRecord | null>(null)
  const [viewRecord, setViewRecord] = useState<PayrollRecord | null>(null)

  const monthRecords = useMemo(() =>
    records.filter(r => r.month === selectedMonth),
    [records, selectedMonth]
  )

  const stats = useMemo(() => {
    const totalNet = monthRecords.reduce((s, r) => s + r.netSalary, 0)
    const paid    = monthRecords.filter(r => r.status === 'paid').length
    const pending = monthRecords.filter(r => r.status === 'pending').length
    const onHold  = monthRecords.filter(r => r.status === 'on-hold').length
    return { totalNet, paid, pending, onHold, count: monthRecords.length }
  }, [monthRecords])

  const filtered = useMemo(() => {
    return monthRecords.filter(r => {
      const emp = payrollEmployees.find(e => e.id === r.employeeId)
      const q = search.trim().toLowerCase()
      const matchQ = !q || emp?.name.toLowerCase().includes(q) || emp?.department.toLowerCase().includes(q) || emp?.employeeNumber.toLowerCase().includes(q)
      const matchS = filterStatus === 'all' || r.status === filterStatus
      return matchQ && matchS
    })
  }, [monthRecords, search, filterStatus])

  const { page, setPage, totalPages, slice, total } = usePagination(filtered)

  function handleAdd(form: PayrollForm) {
    const net = calcNet(form)
    setRecords(prev => [{
      id: genId(),
      employeeId: form.employeeId,
      month: form.month,
      baseSalary: toNum(form.baseSalary),
      insurance:  toNum(form.insurance),
      taxes:      toNum(form.taxes),
      advances:   toNum(form.advances),
      allowances: toNum(form.allowances),
      gratuities: toNum(form.gratuities),
      deductions: toNum(form.deductions),
      bonus:      toNum(form.bonus),
      workDays:   toNum(form.workDays),
      leaveDays:  toNum(form.leaveDays),
      netSalary: net,
      status: form.status,
      notes: form.notes || undefined,
    }, ...prev])
    setShowModal(false)
    setSelectedMonth(form.month)
    setPage(1)
    const emp = payrollEmployees.find(e => e.id === form.employeeId)
    toast.success(`تم إضافة مسير ${emp?.name ?? ''}`, {
      description: `${fmtMonth(form.month)} · صافي: ${fmtMoney(net)}`,
    })
  }

  function handleEdit(form: PayrollForm) {
    if (!editRecord) return
    const net = calcNet(form)
    setRecords(prev => prev.map(r => r.id === editRecord.id ? {
      ...r,
      baseSalary: toNum(form.baseSalary),
      insurance:  toNum(form.insurance),
      taxes:      toNum(form.taxes),
      advances:   toNum(form.advances),
      allowances: toNum(form.allowances),
      gratuities: toNum(form.gratuities),
      deductions: toNum(form.deductions),
      bonus:      toNum(form.bonus),
      workDays:   toNum(form.workDays),
      leaveDays:  toNum(form.leaveDays),
      netSalary: net,
      status: form.status,
      notes: form.notes || undefined,
    } : r))
    setEditRecord(null)
    toast.success('تم حفظ التعديلات بنجاح')
  }

  function handleMarkPaid(id: string) {
    const rec = records.find(r => r.id === id)
    const emp = rec ? payrollEmployees.find(e => e.id === rec.employeeId) : null
    setRecords(prev => prev.map(r => r.id === id ? {
      ...r, status: 'paid' as PayrollStatus,
      paidAt: new Date().toISOString().split('T')[0],
    } : r))
    toast.success(`تم تأكيد صرف راتب ${emp?.name ?? ''}`, {
      description: rec ? `المبلغ: ${fmtMoney(rec.netSalary)}` : undefined,
    })
  }

  function handlePayAll() {
    const today = new Date().toISOString().split('T')[0]
    const pendingRecs = records.filter(r => r.month === selectedMonth && r.status === 'pending')
    if (pendingRecs.length === 0) return
    setRecords(prev => prev.map(r =>
      r.month === selectedMonth && r.status === 'pending'
        ? { ...r, status: 'paid' as PayrollStatus, paidAt: today }
        : r
    ))
    toast.success(`تم صرف ${pendingRecs.length} رواتب بنجاح`, {
      description: `الإجمالي: ${fmtMoney(pendingRecs.reduce((s, r) => s + r.netSalary, 0))}`,
    })
  }

  function editInitial(r: PayrollRecord): PayrollForm {
    return {
      employeeId: r.employeeId, month: r.month,
      baseSalary: String(r.baseSalary), insurance:  String(r.insurance),
      taxes:      String(r.taxes),      advances:   String(r.advances),
      allowances: String(r.allowances), gratuities: String(r.gratuities),
      deductions: String(r.deductions), bonus:      String(r.bonus),
      workDays:   String(r.workDays),   leaveDays:  String(r.leaveDays),
      status: r.status, notes: r.notes ?? '',
    }
  }

  const pendingCount = monthRecords.filter(r => r.status === 'pending').length

  // Table columns config
  const cols = [
    'الموظف', 'أيام العمل', 'الراتب الأساسي', 'تأمينات', 'ضرائب',
    'سُلف', 'بدلات+اكراميات', 'خصومات', 'صافي الراتب', 'الحالة', 'ملاحظات', ''
  ]

  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-800">مسيرات الرواتب الشهرية</h1>
            <p className="font-cairo text-[13px] text-neutral-400 mt-0.5">إدارة رواتب وبدلات وتأمينات وخصومات الموظفين شهرياً</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-cairo text-[13px] font-semibold hover:bg-neutral-50 transition-all">
              <Download size={15} />
              تصدير التقرير
            </button>
            {pendingCount > 0 && (
              <button
                onClick={handlePayAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-cairo text-[13px] font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-sm"
              >
                <CheckCircle2 size={15} />
                صرف الكل ({pendingCount})
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a6b3c] text-white rounded-xl font-cairo text-[13px] font-semibold hover:bg-[#145730] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={16} />
              إضافة مسير
            </button>
          </div>
        </div>

        {/* ── Month Selector ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-4 py-3 flex items-center gap-3">
          <Banknote size={16} className="text-[#1a6b3c] shrink-0" />
          <span className="font-cairo font-semibold text-[13px] text-neutral-700 shrink-0">الشهر:</span>
          <div className="flex gap-1.5 flex-wrap">
            {MONTHS.slice(0, 6).map(m => (
              <button
                key={m}
                onClick={() => { setSelectedMonth(m); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg font-cairo text-[12px] font-semibold transition-colors ${
                  selectedMonth === m
                    ? 'bg-[#1a6b3c] text-white'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                {fmtMonth(m)}
              </button>
            ))}
          </div>
          {selectedMonth !== currentMonth() && (
            <button
              onClick={() => { setSelectedMonth(currentMonth()); setPage(1) }}
              className="ms-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-cairo text-[12px] font-semibold text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="العودة للشهر الحالي"
            >
              <X size={13} />
              مسح
            </button>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp}   label="إجمالي الرواتب" value={fmtMoney(stats.totalNet)} color="primary" />
          <StatCard icon={CheckCircle2} label="مُصرَّف"         value={stats.paid}    sub={`من ${stats.count} موظف`} color="success" />
          <StatCard icon={Clock3}       label="معلق"            value={stats.pending} color="warning" />
          <StatCard icon={AlertCircle}  label="موقوف"           value={stats.onHold}  color="error" />
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
            <div className="relative">
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value as PayrollStatus | 'all'); setPage(1) }}
                className="h-9 rounded-lg border border-neutral-200 bg-white ps-3 pe-8 font-cairo text-[12px] font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/30 focus:border-[#1a6b3c] appearance-none cursor-pointer transition"
              >
                <option value="all">الكل</option>
                <option value="paid">مُصرَّف</option>
                <option value="pending">معلق</option>
                <option value="partial">جزئي</option>
                <option value="on-hold">موقوف</option>
              </select>
              <ChevronDown size={13} className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {cols.map((h, i) => (
                    <th key={i} className={`px-3 py-3 font-cairo font-semibold text-[11px] text-neutral-500 whitespace-nowrap text-right ${i === cols.length - 1 ? 'w-28' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center">
                          <Wallet size={24} className="text-neutral-300" />
                        </div>
                        <p className="font-cairo text-[13px] text-neutral-400">لا توجد مسيرات في هذا الشهر</p>
                      </div>
                    </td>
                  </tr>
                ) : slice.map(record => {
                  const emp = payrollEmployees.find(e => e.id === record.employeeId)
                  const cfg = STATUS_CFG[record.status]
                  return (
                    <tr key={record.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* الموظف */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#e8f5ee] flex items-center justify-center shrink-0">
                            <span className="font-cairo font-bold text-[12px] text-[#1a6b3c]">{emp?.name.charAt(0) ?? '؟'}</span>
                          </div>
                          <div>
                            <p className="font-cairo font-semibold text-[12px] text-neutral-800">{emp?.name ?? '—'}</p>
                            <p className="font-cairo text-[10px] text-neutral-400">{emp?.employeeNumber} · {emp?.department}</p>
                          </div>
                        </div>
                      </td>
                      {/* أيام العمل */}
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-cairo font-bold text-[13px] text-neutral-700">{record.workDays}</span>
                          {record.leaveDays > 0 && (
                            <span className="font-cairo text-[10px] text-yellow-600">{record.leaveDays} إجازة</span>
                          )}
                        </div>
                      </td>
                      {/* الراتب الأساسي */}
                      <td className="px-3 py-3">
                        <span className="font-cairo text-[12px] text-neutral-700">{fmtMoney(record.baseSalary)}</span>
                      </td>
                      {/* تأمينات */}
                      <td className="px-3 py-3">
                        <span className="font-cairo text-[12px] text-red-600">-{fmtMoney(record.insurance)}</span>
                      </td>
                      {/* ضرائب */}
                      <td className="px-3 py-3">
                        <span className="font-cairo text-[12px] text-red-600">-{fmtMoney(record.taxes)}</span>
                      </td>
                      {/* سُلف */}
                      <td className="px-3 py-3">
                        {record.advances > 0
                          ? <span className="font-cairo text-[12px] text-orange-600">-{fmtMoney(record.advances)}</span>
                          : <span className="font-cairo text-[12px] text-neutral-300">—</span>}
                      </td>
                      {/* بدلات + اكراميات */}
                      <td className="px-3 py-3">
                        <div>
                          <span className="font-cairo text-[12px] text-green-600">+{fmtMoney(record.allowances + record.gratuities)}</span>
                          {record.gratuities > 0 && (
                            <p className="font-cairo text-[10px] text-neutral-400">اكراميات: {fmtMoney(record.gratuities)}</p>
                          )}
                        </div>
                      </td>
                      {/* خصومات */}
                      <td className="px-3 py-3">
                        {record.deductions > 0
                          ? <span className="font-cairo text-[12px] text-red-600">-{fmtMoney(record.deductions)}</span>
                          : <span className="font-cairo text-[12px] text-neutral-300">—</span>}
                      </td>
                      {/* صافي */}
                      <td className="px-3 py-3">
                        <span className="font-cairo font-bold text-[13px] text-[#1a6b3c]">{fmtMoney(record.netSalary)}</span>
                      </td>
                      {/* الحالة */}
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      {/* ملاحظات */}
                      <td className="px-3 py-3 max-w-[120px]">
                        <span className="font-cairo text-[11px] text-neutral-500 truncate block">{record.notes || '—'}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewRecord(record)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-[#1a6b3c] hover:bg-[#e8f5ee] transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setEditRecord(record)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={14} />
                          </button>
                          {record.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(record.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="تأكيد الصرف"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {/* ── صف الإجمالي ── */}
                {filtered.length > 0 && (() => {
                  const totBase    = filtered.reduce((s, r) => s + r.baseSalary,  0)
                  const totIns     = filtered.reduce((s, r) => s + r.insurance,   0)
                  const totTax     = filtered.reduce((s, r) => s + r.taxes,       0)
                  const totAdv     = filtered.reduce((s, r) => s + r.advances,    0)
                  const totAll     = filtered.reduce((s, r) => s + r.allowances + r.gratuities, 0)
                  const totDed     = filtered.reduce((s, r) => s + r.deductions,  0)
                  const totNet     = filtered.reduce((s, r) => s + r.netSalary,   0)
                  return (
                    <tr className="bg-[#f0f9f4] border-t-2 border-[#1a6b3c]/15">
                      <td className="px-3 py-3">
                        <span className="font-cairo font-bold text-[12px] text-neutral-600">
                          الإجمالي ({filtered.length} مسير)
                        </span>
                      </td>
                      <td />
                      <td className="px-3 py-3"><span className="font-cairo font-bold text-[12px] text-neutral-700">{fmtMoney(totBase)}</span></td>
                      <td className="px-3 py-3"><span className="font-cairo font-bold text-[12px] text-red-700">-{fmtMoney(totIns)}</span></td>
                      <td className="px-3 py-3"><span className="font-cairo font-bold text-[12px] text-red-700">-{fmtMoney(totTax)}</span></td>
                      <td className="px-3 py-3"><span className="font-cairo font-bold text-[12px] text-orange-700">-{fmtMoney(totAdv)}</span></td>
                      <td className="px-3 py-3"><span className="font-cairo font-bold text-[12px] text-green-700">+{fmtMoney(totAll)}</span></td>
                      <td className="px-3 py-3"><span className="font-cairo font-bold text-[12px] text-red-700">-{fmtMoney(totDed)}</span></td>
                      <td className="px-3 py-3"><span className="font-cairo font-bold text-[15px] text-[#1a6b3c]">{fmtMoney(totNet)}</span></td>
                      <td colSpan={3} />
                    </tr>
                  )
                })()}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>

        {/* ── موظفون بدون مسير ── */}
        {(() => {
          const coveredIds = new Set(monthRecords.map(r => r.employeeId))
          const missing = payrollEmployees.filter(e => !coveredIds.has(e.id))
          if (missing.length === 0) return null
          return (
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral-100">
                <Users size={15} className="text-yellow-500" />
                <h2 className="font-cairo font-bold text-[14px] text-neutral-700">
                  موظفون بدون مسير لـ {fmtMonth(selectedMonth)}
                </h2>
                <span className="ms-auto font-cairo text-[11px] font-semibold bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-100">
                  {missing.length}
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {missing.map(emp => (
                  <div key={emp.id} className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-3 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                      <span className="font-cairo font-bold text-[13px] text-neutral-400">{emp.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-cairo font-semibold text-[12px] text-neutral-600 truncate">{emp.name}</p>
                      <p className="font-cairo text-[10px] text-neutral-400">{emp.employeeNumber} · {emp.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {showModal && (
        <PayrollModal initial={emptyForm()} isEdit={false} onSave={handleAdd} onClose={() => setShowModal(false)} />
      )}
      {editRecord && (
        <PayrollModal initial={editInitial(editRecord)} isEdit onSave={handleEdit} onClose={() => setEditRecord(null)} />
      )}
      {viewRecord && (
        <DetailModal record={viewRecord} onClose={() => setViewRecord(null)} onMarkPaid={handleMarkPaid} />
      )}
    </div>
  )
}
