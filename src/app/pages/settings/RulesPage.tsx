import { useState, useMemo } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal'
import {
  Plus, Search, Edit2, Trash2, ChevronRight,
  ShieldCheck, CheckCircle2, AlertTriangle, X,
} from 'lucide-react'
import type { Rule, RuleStatus, RuleFormData, UserRole, PermissionAction } from '../../types/rules'
import { EMPTY_FORM } from '../../types/rules'
import {
  MOCK_RULES,
  PERMISSION_ACTION_LABELS,
  ROLE_LABELS,
  ROLE_COLORS,
  MODULE_OPTIONS,
  ALL_PERMISSION_ACTIONS,
} from '../../data/rulesData'
import { INITIAL_USERS } from './UsersPage'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function getModuleLabel(value: string) {
  return MODULE_OPTIONS.find(m => m.value === value)?.label ?? value
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        checked ? 'bg-primary-500' : 'bg-neutral-300',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm',
          'transition duration-200 ease-in-out',
          checked ? 'translate-x-[-16px]' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RuleStatus }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold bg-success-100 text-success-700 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
        فعّال
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-cairo font-semibold bg-neutral-200 text-neutral-600 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
      معطّل
    </span>
  )
}

// ─── Role Pills ───────────────────────────────────────────────────────────────

function RolePills({ roles }: { roles: UserRole[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map(r => (
        <span key={r} className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-[10px] font-cairo font-semibold ${ROLE_COLORS[r]}`}>
          {ROLE_LABELS[r]}
        </span>
      ))}
    </div>
  )
}

// ─── Users Count Tooltip ───────────────────────────────────────────────────────

function UsersCount({ roles }: { roles: UserRole[] }) {
  const usersWithRole = INITIAL_USERS.filter(u => roles.includes(u.role))
  const count = usersWithRole.length
  
  return (
    <div className="relative group inline-flex items-center justify-center">
      <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] rounded-full bg-blue-50 text-blue-600 font-bold text-[12px] border border-blue-100 cursor-help transition-colors group-hover:bg-blue-100">
        {count}
      </span>
      {count > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 w-max max-w-[200px] bg-neutral-900 text-white rounded-[8px] p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[99] shadow-xl pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-right-1.5 before:border-4 before:border-transparent before:border-l-neutral-900 flex flex-col gap-1.5">
          <p className="font-cairo text-[11px] text-neutral-300 font-bold text-start border-b border-neutral-700 pb-1 mb-0.5">مستخدمي الصلاحية ({count})</p>
          <ul className="text-[11px] font-cairo text-start flex flex-col gap-1">
            {usersWithRole.map(u => (
              <li key={u.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {u.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Action Pills ─────────────────────────────────────────────────────────────

function ActionPills({ actions }: { actions: PermissionAction[] }) {
  const show = actions.slice(0, 3)
  const extra = actions.length - 3
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {show.map(a => (
        <span key={a} className="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-[11px] font-cairo font-medium text-neutral-700">
          {PERMISSION_ACTION_LABELS[a]}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[11px] font-cairo text-neutral-400">+{extra}</span>
      )}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
        <ShieldCheck size={34} className="text-neutral-300" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-cairo font-bold text-[18px] text-neutral-800">لا توجد قواعد صلاحيات بعد</h3>
        <p className="font-cairo font-medium text-[13px] text-neutral-400 max-w-[280px] leading-relaxed">
          أنشئ قواعد للتحكم في صلاحيات وصول كل دور إلى وحدات النظام
        </p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm"
      >
        <Plus size={15} />
        إنشاء أول قاعدة
      </button>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-neutral-100">
          <div className="h-4 bg-neutral-100 rounded w-1/4" />
          <div className="h-5 bg-neutral-100 rounded-full w-20" />
          <div className="h-5 bg-neutral-100 rounded-full w-16" />
          <div className="flex gap-1 flex-1">
            <div className="h-5 bg-neutral-100 rounded-md w-12" />
            <div className="h-5 bg-neutral-100 rounded-md w-12" />
          </div>
          <div className="h-4 bg-neutral-100 rounded w-20" />
          <div className="flex gap-2">
            <div className="h-5 w-9 bg-neutral-100 rounded-full" />
            <div className="h-7 w-7 bg-neutral-100 rounded-lg" />
            <div className="h-7 w-7 bg-neutral-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function ToastNotification({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={[
      'fixed bottom-6 left-6 z-[400] flex items-center gap-3 px-5 py-3.5 rounded-[12px] shadow-xl font-cairo font-medium text-[13px] min-w-[260px]',
      type === 'success'
        ? 'bg-white border border-success-500/30 text-success-700'
        : 'bg-white border border-error-500/30 text-error-700',
    ].join(' ')} dir="rtl">
      {type === 'success'
        ? <CheckCircle2 size={18} className="text-success-500 shrink-0" />
        : <AlertTriangle size={18} className="text-error-500 shrink-0" />
      }
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors ms-1">
        <X size={14} />
      </button>
    </div>
  )
}


// ─── Field helpers ─────���────────────────────────────────────────────────────

function FieldLabel({ children, required, error }: { children: React.ReactNode; required?: boolean; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wider">
        {children} {required && <span className="text-error-500 normal-case">*</span>}
      </label>
      {error && <p className="font-cairo text-[11px] text-error-500">{error}</p>}
    </div>
  )
}

function inputCls(err?: string) {
  return [
    'w-full h-10 px-3 rounded-[8px] border font-cairo font-medium text-[13px] text-neutral-900 bg-neutral-50 outline-none transition-all',
    err
      ? 'border-error-500 ring-2 ring-error-500/20'
      : 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
  ].join(' ')
}

// ─── Rule Form Modal ──────────────────────────────────────────────────────────

interface RuleModalProps {
  editingRule: Rule | null
  onClose: () => void
  onSave: (data: RuleFormData) => void
}

function RuleModal({ editingRule, onClose, onSave }: RuleModalProps) {
  const initial: RuleFormData = editingRule
    ? { name: editingRule.name, roles: editingRule.roles, allowedActions: editingRule.allowedActions, module: editingRule.module }
    : { ...EMPTY_FORM }

  const [form, setForm] = useState<RuleFormData>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof RuleFormData, string>>>({})
  const [isSaving, setIsSaving] = useState(false)

  function validate() {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'اسم القاعدة مطلوب'
    if (!form.module) e.module = 'اختر الوحدة'
    if (form.roles.length === 0) e.roles = 'اختر دوراً واحداً على الأقل'
    if (form.allowedActions.length === 0) e.allowedActions = 'اختر صلاحية واحدة على الأقل'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setIsSaving(false)
    onSave(form)
  }

  function toggleRole(role: UserRole) {
    setForm(p => ({
      ...p,
      roles: p.roles.includes(role) ? p.roles.filter(r => r !== role) : [...p.roles, role],
    }))
    if (errors.roles) setErrors(p => ({ ...p, roles: undefined }))
  }

  function toggleAction(action: PermissionAction) {
    setForm(p => ({
      ...p,
      allowedActions: p.allowedActions.includes(action)
        ? p.allowedActions.filter(a => a !== action)
        : [...p.allowedActions, action],
    }))
    if (errors.allowedActions) setErrors(p => ({ ...p, allowedActions: undefined }))
  }

  function toggleAll() {
    setForm(p => ({
      ...p,
      allowedActions: p.allowedActions.length === ALL_PERMISSION_ACTIONS.length ? [] : [...ALL_PERMISSION_ACTIONS],
    }))
    if (errors.allowedActions) setErrors(p => ({ ...p, allowedActions: undefined }))
  }

  const allSelected = form.allowedActions.length === ALL_PERMISSION_ACTIONS.length

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm"
      dir="rtl"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-primary-50 flex items-center justify-center">
              <ShieldCheck size={18} className="text-primary-500" />
            </div>
            <div>
              <h2 className="font-cairo font-bold text-[16px] text-neutral-900 leading-tight">
                {editingRule ? 'تعديل قاعدة الصلاحية' : 'إنشاء قاعدة صلاحية'}
              </h2>
              <p className="font-cairo text-[11px] text-neutral-400">
                {editingRule ? 'عدّل بيانات القاعدة أدناه' : 'حدد الأدوار والصلاحيات الممنوحة'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Rule name */}
          <div className="space-y-1.5">
            <FieldLabel required error={errors.name}>اسم القاعدة</FieldLabel>
            <input
              type="text"
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: undefined })) }}
              placeholder="مثال: صلاحيات المحاسب — الحسابات"
              className={inputCls(errors.name)}
            />
          </div>

          {/* Module */}
          <div className="space-y-1.5">
            <FieldLabel required error={errors.module}>الوحدة / القسم</FieldLabel>
            <select
              value={form.module}
              onChange={e => { setForm(p => ({ ...p, module: e.target.value })); if (errors.module) setErrors(p => ({ ...p, module: undefined })) }}
              className={inputCls(errors.module)}
            >
              <option value="">— اختر الوحدة —</option>
              {MODULE_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <FieldLabel required error={errors.roles}>الأدوار المستفيدة</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => {
                const active = form.roles.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={[
                      'flex items-center gap-1.5 px-4 py-2 rounded-full border font-cairo font-semibold text-[12px] transition-all',
                      active
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50',
                    ].join(' ')}
                  >
                    {active && <CheckCircle2 size={12} />}
                    {ROLE_LABELS[role]}
                  </button>
                )
              })}
            </div>
            {errors.roles && <p className="font-cairo text-[11px] text-error-500">{errors.roles}</p>}
          </div>

          {/* Allowed actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel required error={errors.allowedActions}>الصلاحيات الممنوحة</FieldLabel>
              <button
                type="button"
                onClick={toggleAll}
                className="font-cairo text-[11px] text-primary-500 hover:underline"
              >
                {allSelected ? 'إلغاء الكل' : 'تحديد الكل'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_PERMISSION_ACTIONS.map(action => {
                const active = form.allowedActions.includes(action)
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => toggleAction(action)}
                    className={[
                      'flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] border font-cairo font-semibold text-[12px] transition-all',
                      active
                        ? 'bg-primary-50 border-primary-300 text-primary-600'
                        : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300',
                    ].join(' ')}
                  >
                    {active && <CheckCircle2 size={12} />}
                    {PERMISSION_ACTION_LABELS[action]}
                  </button>
                )
              })}
            </div>
            {errors.allowedActions && <p className="font-cairo text-[11px] text-error-500">{errors.allowedActions}</p>}
          </div>

          {/* Live preview */}
          {form.name && form.module && form.roles.length > 0 && form.allowedActions.length > 0 && (
            <div className="bg-primary-50 border border-primary-100 rounded-[10px] p-4 space-y-1">
              <p className="font-cairo font-semibold text-[11px] text-primary-500 uppercase tracking-wide mb-2">ملخص القاعدة</p>
              <p className="font-cairo font-medium text-[12px] text-neutral-700 leading-relaxed">
                يمكن لـ <span className="font-bold text-primary-500">{form.roles.map(r => ROLE_LABELS[r]).join('، ')}</span>
                {' '}ف وحدة <span className="font-bold text-primary-500">{getModuleLabel(form.module)}</span>
                {' '}القيام بـ: <span className="font-bold text-primary-500">{form.allowedActions.map(a => PERMISSION_ACTION_LABELS[a]).join('، ')}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex gap-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-neutral-200 text-neutral-700 rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-neutral-50 transition-colors">
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                جارٍ الحفظ...
              </>
            ) : editingRule ? 'حفظ التعديلات' : 'إنشاء القاعدة'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section helper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h4 className="font-cairo font-semibold text-[11px] text-neutral-400 uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ rule, onClose, onEdit }: { rule: Rule; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-[250]" dir="rtl">
      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute top-0 right-0 bottom-0 bg-white w-full max-w-[400px] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors">
            <ChevronRight size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-cairo font-bold text-[15px] text-neutral-900 leading-tight truncate">{rule.name}</h3>
            <p className="font-cairo text-[11px] text-neutral-400">آخر تعديل: {formatDate(rule.lastUpdated)}</p>
          </div>
          <StatusBadge status={rule.status} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Section title="الوحدة / القسم">
            <p className="font-cairo font-semibold text-[14px] text-neutral-800">{getModuleLabel(rule.module)}</p>
          </Section>

          <Section title="الأدوار المستفيدة">
            <div className="flex flex-wrap gap-2">
              {rule.roles.map(r => (
                <span key={r} className={`px-3 py-1.5 rounded-full border text-[12px] font-cairo font-semibold ${ROLE_COLORS[r]}`}>
                  {ROLE_LABELS[r]}
                </span>
              ))}
            </div>
          </Section>

          <Section title="الصلاحيات الممنوحة">
            <div className="grid grid-cols-3 gap-2">
              {ALL_PERMISSION_ACTIONS.map(action => {
                const granted = rule.allowedActions.includes(action)
                return (
                  <div
                    key={action}
                    className={[
                      'flex items-center gap-1.5 px-3 py-2 rounded-[8px] border font-cairo font-medium text-[12px]',
                      granted
                        ? 'bg-success-100 border-success-200 text-success-700'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-400',
                    ].join(' ')}
                  >
                    {granted
                      ? <CheckCircle2 size={12} className="shrink-0" />
                      : <X size={12} className="shrink-0 opacity-40" />
                    }
                    {PERMISSION_ACTION_LABELS[action]}
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="ملخص القاعدة">
            <p className="font-cairo font-medium text-[13px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-[10px] p-4 leading-relaxed">
              يمكن لـ <span className="font-bold text-primary-500">{rule.roles.map(r => ROLE_LABELS[r]).join('، ')}</span>
              {' '}في وحدة <span className="font-bold text-primary-500">{getModuleLabel(rule.module)}</span>
              {' '}القيام بـ: <span className="font-bold text-primary-500">{rule.allowedActions.map(a => PERMISSION_ACTION_LABELS[a]).join('، ')}</span>
            </p>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors"
          >
            <Edit2 size={14} /> تعديل القاعدة
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RulesPage() {
  const [rules, setRules] = useLocalStorage<Rule[]>('vetafarm_rules', MOCK_RULES)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<RuleStatus | 'all'>('all')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [isLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null)
  const [detailRule, setDetailRule] = useState<Rule | null>(null)
  const [toastState, setToastState] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const filtered = useMemo(() => {
    return rules.filter(r => {
      const matchSearch = !search || r.name.includes(search)
      const matchStatus = filterStatus === 'all' || r.status === filterStatus
      const matchModule = filterModule === 'all' || r.module === filterModule
      return matchSearch && matchStatus && matchModule
    })
  }, [rules, search, filterStatus, filterModule])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToastState({ message, type })
    setTimeout(() => setToastState(null), 3500)
  }

  function handleToggle(id: string) {
    setRules(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: r.status === 'active' ? 'disabled' : 'active', lastUpdated: new Date().toISOString().split('T')[0] }
        : r
    ))
  }

  function handleDelete() {
    if (!deleteTarget) return
    setRules(prev => prev.filter(r => r.id !== deleteTarget.id))
    setDeleteTarget(null)
    showToast('تم حذف القاعدة بنجاح')
  }

  function handleSave(data: RuleFormData) {
    if (editingRule) {
      setRules(prev => prev.map(r =>
        r.id === editingRule.id
          ? { ...r, ...data, lastUpdated: new Date().toISOString().split('T')[0] }
          : r
      ))
      showToast('تم تعديل القاعدة بنجاح')
    } else {
      setRules(prev => [{
        id: Date.now().toString(),
        ...data,
        status: 'active',
        lastUpdated: new Date().toISOString().split('T')[0],
      }, ...prev])
      showToast('تم إنشاء القاعدة بنجاح')
    }
    setModalOpen(false)
    setEditingRule(null)
  }

  function openEdit(rule: Rule) {
    setDetailRule(null)
    setEditingRule(rule)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingRule(null)
    setModalOpen(true)
  }

  const hasFilters = search || filterStatus !== 'all' || filterModule !== 'all'

  return (
    <div className="min-h-full font-cairo" style={{ backgroundColor: '#F2F2F0' }} dir="rtl">
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={22} className="text-primary-500" />
              <h1 className="font-cairo font-bold text-[26px] text-neutral-900 leading-tight">إدارة الصلاحيات</h1>
            </div>
            <p className="font-cairo font-medium text-[13px] text-neutral-500">
              تحكم في صلاحيات وصول كل دور لكل وحدة في النظام
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-[12px] font-cairo font-semibold text-[13px] hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={16} />
            إنشاء قاعدة
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي القواعد',  value: rules.length,                                     sub: 'قاعدة مضافة',   color: 'text-neutral-800' },
            { label: 'قواعد فعّالة',    value: rules.filter(r => r.status === 'active').length,  sub: 'تعمل الآن',     color: 'text-success-700' },
            { label: 'قواعد معطّلة',    value: rules.filter(r => r.status === 'disabled').length,sub: 'موقوفة مؤقتاً', color: 'text-neutral-500' },
            { label: 'وحدات محمية',     value: new Set(rules.map(r => r.module)).size,           sub: 'وحدة مفعّلة',  color: 'text-primary-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-neutral-200 rounded-[12px] px-5 py-4">
              <p className="font-cairo font-medium text-[12px] text-neutral-500 mb-1">{stat.label}</p>
              <p className={`font-cairo font-bold text-[28px] leading-tight ${stat.color}`}>{stat.value}</p>
              <p className="font-cairo text-[11px] text-neutral-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white border border-neutral-200 rounded-[12px] px-5 py-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 h-9 px-3 rounded-[8px] bg-neutral-50 border border-neutral-200 flex-1 min-w-[200px]">
            <Search size={14} className="text-neutral-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في القواعد..."
              className="flex-1 bg-transparent outline-none font-cairo text-[13px] text-neutral-900 placeholder:text-neutral-400"
              dir="rtl"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as RuleStatus | 'all')}
            className="h-9 px-3 rounded-[8px] border border-neutral-200 bg-neutral-50 font-cairo text-[13px] text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">كل الحالات</option>
            <option value="active">فعّال</option>
            <option value="disabled">معطّل</option>
          </select>

          {/* Module filter */}
          <select
            value={filterModule}
            onChange={e => setFilterModule(e.target.value)}
            className="h-9 px-3 rounded-[8px] border border-neutral-200 bg-neutral-50 font-cairo text-[13px] text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">كل الوحدات</option>
            {MODULE_OPTIONS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setSearch(''); setFilterStatus('all'); setFilterModule('all') }}
              className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border border-neutral-200 text-neutral-600 font-cairo text-[12px] hover:bg-neutral-50 transition-colors"
            >
              <X size={13} />
              مسح لفلاتر
            </button>
          )}

          {/* Results count */}
          {hasFilters && (
            <span className="font-cairo text-[12px] text-neutral-400 ms-auto">
              {filtered.length} نتيجة
            </span>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-neutral-200 rounded-[12px] overflow-visible">

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[minmax(160px,2fr)_80px_140px_80px_minmax(140px,2fr)_100px_100px] items-center px-5 py-2.5 border-b border-neutral-100 bg-neutral-50 rounded-t-[12px]">
            {['اسم القاعدة', 'الحالة', 'الأدوار', 'المستخدمين', 'الصلاحيات', 'آخر تعديل', 'إجراءات'].map(h => (
              <span key={h} className="font-semibold text-[10.5px] text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                {h}
              </span>
            ))}
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState onAdd={openCreate} />
          ) : (
            <ul>
              {filtered.map((rule, i) => (
                <li
                  key={rule.id}
                  className={[
                    'flex flex-col md:grid md:grid-cols-[minmax(160px,2fr)_80px_140px_80px_minmax(140px,2fr)_100px_100px] items-start md:items-center px-5 py-3.5 transition-colors hover:bg-neutral-50/80 cursor-pointer',
                    i < filtered.length - 1 ? 'border-b border-neutral-100' : 'rounded-b-[12px]',
                  ].join(' ')}
                  onClick={() => setDetailRule(rule)}
                >
                  {/* Name */}
                  <div className="min-w-0 pe-3">
                    <p className="font-semibold text-[13px] text-neutral-900 leading-snug truncate">{rule.name}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{getModuleLabel(rule.module)}</p>
                  </div>

                  {/* Status */}
                  <div><StatusBadge status={rule.status} /></div>

                  {/* Roles */}
                  <div><RolePills roles={rule.roles} /></div>

                  {/* Users */}
                  <div><UsersCount roles={rule.roles} /></div>

                  {/* Actions */}
                  <div className="pe-3"><ActionPills actions={rule.allowedActions} /></div>

                  {/* Date */}
                  <span className="text-[12px] text-neutral-400 whitespace-nowrap">
                    {formatDate(rule.lastUpdated)}
                  </span>

                  {/* Row actions */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <ToggleSwitch
                      checked={rule.status === 'active'}
                      onChange={() => handleToggle(rule.id)}
                    />
                    <button
                      type="button"
                      onClick={() => openEdit(rule)}
                      className="w-7 h-7 flex items-center justify-center rounded-[7px] text-neutral-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(rule)}
                      className="w-7 h-7 flex items-center justify-center rounded-[7px] text-neutral-400 hover:text-error-500 hover:bg-error-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Modals & Overlays ── */}
      {modalOpen && (
        <RuleModal
          editingRule={editingRule}
          onClose={() => { setModalOpen(false); setEditingRule(null) }}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.name}
          itemType="القاعدة"
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
      {detailRule && (
        <DetailDrawer
          rule={detailRule}
          onClose={() => setDetailRule(null)}
          onEdit={() => openEdit(detailRule)}
        />
      )}
      {toastState && (
        <ToastNotification
          message={toastState.message}
          type={toastState.type}
          onClose={() => setToastState(null)}
        />
      )}
    </div>
  )
}