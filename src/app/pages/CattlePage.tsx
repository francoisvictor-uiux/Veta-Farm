import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search, Plus, Filter, ChevronDown, ChevronLeft, ChevronRight, Edit2, Trash2, Eye,
  Calendar, Info, Scale, Target, PlayCircle, Truck, ScanLine, Type, Camera,
  X, Check, CalendarDays, Loader2,
} from 'lucide-react'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import {
  livestockBatchesApi, livestockHeadsApi,
  type LivestockBatchItem, type LivestockHeadItem,
  type CreateBatchRequest, type UpdateBatchRequest,
  type CreateHeadRequest, type CreateHeadsBulkRequest, type UpdateHeadRequest,
} from '../services/api'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CattleType = 'dairy' | 'fattening'
type BatchStatus = 'active' | 'closed'
type CattleStatus = 'active' | 'sold' | 'dead' | 'quarantine'

interface Batch {
  id: number
  name: string
  type: CattleType
  startDate: string
  endDate?: string
  status: BatchStatus
  targetWeight?: number
  numberOfHeads?: number
}

interface Cattle {
  id: number
  batchId: number
  tag?: string
  type: CattleType
  breed?: string
  entryDate: string
  avgWeight?: number
  vehicleNumber?: string
  weighbridgePhoto?: string
  status: CattleStatus
  batchName?: string
}

const TYPE_CFG: Record<CattleType, { label: string; color: string; bg: string }> = {
  dairy: { label: 'حلاب', color: 'text-info-700', bg: 'bg-info-50' },
  fattening: { label: 'تسمين', color: 'text-warning-700', bg: 'bg-warning-50' },
}

const STATUS_CFG: Record<CattleStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'نشط', color: 'text-success-700', bg: 'bg-success-50' },
  sold: { label: 'تم البيع', color: 'text-primary-700', bg: 'bg-primary-50' },
  dead: { label: 'نافُق', color: 'text-error-700', bg: 'bg-error-50' },
  quarantine: { label: 'حجر صحي', color: 'text-warning-700', bg: 'bg-warning-50' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI (Pagination, EmptyState, etc.)
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
        <Icon size={28} className="text-neutral-300" />
      </div>
      <p className="font-cairo font-semibold text-[14px] text-neutral-500">{title}</p>
      <p className="font-cairo text-[12px] text-neutral-400">{sub}</p>
    </div>
  )
}

const PAGE_SIZE = 7

function Pagination({
  page, totalPages, setPage, total, unit,
}: {
  page: number; totalPages: number; setPage: (p: number) => void; total: number; unit: string
}) {
  const [inputVal, setInputVal] = useState(String(page))
  useEffect(() => { setInputVal(String(page)) }, [page])

  function goToPage(val: string) {
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= totalPages) setPage(n)
    else setInputVal(String(page))
  }

  return (
    <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between gap-4">
      <span className="font-cairo text-[12px] text-neutral-400">
        إجمالي: <span className="font-semibold text-neutral-600">{total}</span> {unit}
        {totalPages > 1 && <span className="text-neutral-300 mx-1.5">·</span>}
        {totalPages > 1 && <span>الصفحة {page} من {totalPages}</span>}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <div className="flex items-center gap-1">
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onBlur={() => goToPage(inputVal)}
              onKeyDown={e => { if (e.key === 'Enter') goToPage(inputVal) }}
              className="w-10 h-7 text-center rounded-[6px] border border-neutral-200 font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white"
            />
            <span className="font-cairo text-[12px] text-neutral-400">/ {totalPages}</span>
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg }: any) {
  return (
    <div className="bg-white border border-neutral-200 rounded-[16px] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-cairo text-[13px] text-neutral-400 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-cairo font-bold text-[24px] text-neutral-800 leading-none">{value}</h3>
            {sub && <span className="font-cairo text-[12px] text-neutral-500">{sub}</span>}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Heads Form Type
// ─────────────────────────────────────────────────────────────────────────────

interface HeadFormState {
  batchId: string
  type: CattleType | ''
  count: string
  avgWeight: string
  breed: string
  tag: string
  vehicleNumber: string
  weighbridgePhoto: File | null
  entryDate: string
}

function emptyHeadForm(): HeadFormState {
  return {
    batchId: '', type: '', count: '1', avgWeight: '', breed: '', tag: '', vehicleNumber: '', weighbridgePhoto: null,
    entryDate: new Date().toISOString().split('T')[0]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

function HeadsTab({ cattle, batches, onAdd, onEdit, onDelete }: {
  cattle: Cattle[]
  batches: Batch[]
  onAdd: (h: HeadFormState) => void
  onEdit: (id: number, h: HeadFormState) => void
  onDelete: (id: number) => void
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CattleType | 'all'>('all')
  const [batchFilter, setBatchFilter] = useState<string | number>('all')

  const [showAdd, setShowAdd] = useState(false)
  const [viewCattle, setViewCattle] = useState<Cattle | null>(null)
  const [editCattle, setEditCattle] = useState<Cattle | null>(null)
  const [deleteCattle, setDeleteCattle] = useState<Cattle | null>(null)

  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return cattle.filter(c => {
      const ms = !search || c.tag?.toLowerCase().includes(search.toLowerCase()) || c.breed?.toLowerCase().includes(search.toLowerCase())
      const mt = typeFilter === 'all' || c.type === typeFilter
      const mb = batchFilter === 'all' || c.batchId === Number(batchFilter)
      return ms && mt && mb
    })
  }, [cattle, search, typeFilter, batchFilter])

  useEffect(() => { setPage(1) }, [search, typeFilter, batchFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-[14px] px-5 py-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالوسم أو السلالة..."
            className="w-full h-9 ps-8 pe-3 rounded-[10px] border border-neutral-200 font-cairo text-[13px] focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 placeholder:text-neutral-300" />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as CattleType | 'all')}
            className="h-9 ps-8 pe-8 rounded-[10px] border border-neutral-200 bg-white font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 cursor-pointer appearance-none">
            <option value="all">كل الأنواع</option>
            <option value="dairy">حلاب</option>
            <option value="fattening">تسمين</option>
          </select>
          <ChevronDown size={12} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Calendar size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
            className="h-9 ps-8 pe-8 rounded-[10px] border border-neutral-200 bg-white font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 cursor-pointer appearance-none max-w-[200px] truncate">
            <option value="all">كل الدورات</option>
            {batches.map(b => (
              <option key={b.id} value={String(b.id)}>{b.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm ms-auto">
          <Plus size={15} /> إضافة رأس / عدد
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-[16px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70">
                {['#', 'الوسم', 'الدورة', 'النوع', 'السلالة', 'متوسط الوزن', 'تاريخ الدخول', 'الحالة', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}><EmptyState icon={Target} title="لا توجد رؤوس" sub="قم بإضافة رؤوس جديدة باستخدام الزر أعلاه" /></td></tr>
              ) : paged.map((c, idx) => {
                const b = batches.find(x => x.id === c.batchId)
                const tc = TYPE_CFG[c.type]
                const sc = STATUS_CFG[c.status]
                return (
                  <tr key={c.id} onClick={() => setViewCattle(c)} className="border-b border-neutral-50 hover:bg-neutral-50/60 transition-colors cursor-pointer group">
                    <td className="px-4 py-3 font-cairo text-[12px] text-neutral-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3">
                      {c.tag
                        ? <span className="font-cairo font-bold text-[12px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{c.tag}</span>
                        : <span className="font-cairo text-[12px] text-neutral-400 italic">مُجمّع (بلا وسم)</span>}
                    </td>
                    <td className="px-4 py-3 font-cairo text-[13px] text-neutral-800">{b?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                        {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-cairo text-[13px] text-neutral-600 border-none">{c.breed || '—'}</td>
                    <td className="px-4 py-3 font-cairo font-bold text-[13px] text-warning-700">{c.avgWeight} كجم</td>
                    <td className="px-4 py-3 font-cairo text-[12px] text-neutral-500" dir="ltr">{c.entryDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewCattle(c)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-info-50 hover:text-info-600 transition-colors" title="عرض التفاصيل">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => setEditCattle(c)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="تعديل">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteCattle(c)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="حذف">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} total={filtered.length} unit="رأس" />
      </div>

      {/* Modals */}
      {showAdd && (
        <HeadFormModal batches={batches} initial={emptyHeadForm()} isEdit={false}
          onSave={d => { onAdd(d); setShowAdd(false) }}
          onClose={() => setShowAdd(false)} />
      )}
      {editCattle && (
        <HeadFormModal batches={batches} initial={{
          batchId: String(editCattle.batchId), type: editCattle.type, count: '1',
          avgWeight: String(editCattle.avgWeight || ''), breed: editCattle.breed || '',
          tag: editCattle.tag || '', vehicleNumber: editCattle.vehicleNumber || '', weighbridgePhoto: null,
          entryDate: editCattle.entryDate
        }} isEdit={true}
          onSave={d => { onEdit(editCattle.id, d); setEditCattle(null) }}
          onClose={() => setEditCattle(null)} />
      )}
      {viewCattle && (
        <HeadViewDrawer cattle={viewCattle} batches={batches}
          onClose={() => setViewCattle(null)}
          onEdit={() => { setEditCattle(viewCattle); setViewCattle(null) }} />
      )}
      {deleteCattle && (
        <ConfirmDeleteModal
          itemName={deleteCattle.tag ? `الرأس ${deleteCattle.tag}` : 'الرأس المجمّع'}
          itemType="الرأس"
          onConfirm={() => { onDelete(deleteCattle.id); setDeleteCattle(null) }}
          onClose={() => setDeleteCattle(null)} />
      )}
    </div>
  )
}

function HeadFormModal({ batches, initial, isEdit, onSave, onClose }: {
  batches: Batch[], initial: HeadFormState, isEdit: boolean,
  onSave: (data: HeadFormState) => void, onClose: () => void
}) {
  const [form, setForm] = useState<HeadFormState>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inp = 'w-full h-9 px-3 rounded-[10px] border border-neutral-200 bg-white text-[13px] font-cairo text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-500'
  const lbl = 'block text-[11px] font-semibold text-neutral-500 mb-1 uppercase tracking-wide'

  function save() {
    const errs: Record<string, string> = {}
    if (!form.type) errs.type = 'يرجى اختيار نوع الإضافة'
    if (!form.count || parseInt(form.count) < 1) errs.count = 'يرجى إدخال عدد صحيح أكبر من صفر'
    if (!form.avgWeight || parseFloat(form.avgWeight) <= 0) errs.avgWeight = 'يرجى إدخال متوسط الوزن صحيح'
    if (!form.batchId) errs.batchId = 'يرجى اختيار الدورة'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 min-h-screen" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[550px] flex flex-col max-h-full">
        <div className="shrink-0 px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-cairo font-bold text-[18px] text-neutral-900 leading-tight mb-1">{isEdit ? 'تعديل رأس' : 'إضافة رأس / عدد'}</h3>
            <p className="font-cairo text-[12px] text-neutral-500">{isEdit ? 'قم بتعديل بيانات الرأس المحددة' : 'سجل بيانات الرؤوس الجديدة (حلاب أو تسمين).'}</p>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            <div>
              <label className={lbl}>الدورة المرتبطة <span className="text-error-500">*</span></label>
              <select value={form.batchId} onChange={e => { setForm({ ...form, batchId: e.target.value }); delete errors.batchId; }}
                className={`${inp} ${errors.batchId ? 'border-error-400 focus:ring-error-400/20' : ''}`}>
                <option value="">-- اختر الدورة --</option>
                {batches.filter(b => b.status === 'active' || Number(form.batchId) === b.id).map(b => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
              {errors.batchId && <p className="text-error-500 text-[11px] mt-1 pr-1">{errors.batchId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>نوع الإضافة <span className="text-error-500">*</span></label>
                <select value={form.type} onChange={e => { setForm({ ...form, type: e.target.value as CattleType }); delete errors.type; }}
                  className={`${inp} ${errors.type ? 'border-error-400 focus:ring-error-400/20' : ''}`}>
                  <option value="">-- اختر النوع --</option>
                  <option value="dairy">حلاب</option>
                  <option value="fattening">تسمين</option>
                </select>
                {errors.type && <p className="text-error-500 text-[11px] mt-1 pr-1">{errors.type}</p>}
              </div>

              <div>
                <label className={lbl}>العدد <span className="text-error-500">*</span></label>
                <div className="relative">
                  <Target size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="number" min="1" disabled={isEdit} value={form.count} onChange={e => { setForm({ ...form, count: e.target.value }); delete errors.count; }}
                    className={`${inp} pe-10 ${errors.count ? 'border-error-400 focus:ring-error-400/20' : ''}`} placeholder="1" />
                </div>
                {errors.count && <p className="text-error-500 text-[11px] mt-1 pr-1">{errors.count}</p>}
              </div>
            </div>

            <div>
              <label className={lbl}>متوسط وزن الرأس (كجم) <span className="text-error-500">*</span></label>
              <div className="relative">
                <Scale size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="number" step="0.5" value={form.avgWeight} onChange={e => { setForm({ ...form, avgWeight: e.target.value }); delete errors.avgWeight; }}
                  className={`${inp} pe-10 ${errors.avgWeight ? 'border-error-400 focus:ring-error-400/20' : ''}`} placeholder="مثال: 150" />
              </div>
              {errors.avgWeight && <p className="text-error-500 text-[11px] mt-1 pr-1">{errors.avgWeight}</p>}
            </div>

            <div>
              <label className={lbl}>تاريخ الدخول <span className="text-error-500">*</span></label>
              <div className="relative">
                <Calendar size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="date" value={form.entryDate} onChange={e => setForm({ ...form, entryDate: e.target.value })}
                  className={`${inp} pe-10`} dir="ltr" />
              </div>
            </div>

            <div className="h-px bg-neutral-100 my-2" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>السلالة <span className="text-neutral-400 font-normal lowercase">(Not Mandatory)</span></label>
                <div className="relative">
                  <Type size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })}
                    className={`${inp} pe-10`} placeholder="هولشتاين، سيمنتال..." />
                </div>
              </div>
              <div>
                <label className={lbl}>الوسم <span className="text-neutral-400 font-normal lowercase">(Not Mandatory)</span></label>
                <div className="relative">
                  <ScanLine size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}
                    className={`${inp} pe-10`} placeholder="رقم الرأس / الباركود" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>رقم السيارة <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <Truck size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })}
                    className={`${inp} pe-10`} placeholder="أ ب ج 123" />
                </div>
              </div>
              <div>
                <label className={lbl}>صورة كارتة الميزان <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <input type="file" id="wb-photo" className="hidden" />
                  <label htmlFor="wb-photo" className={`flex items-center justify-between w-full h-9 px-3 rounded-[10px] border border-neutral-200 bg-white cursor-pointer hover:border-primary-400 transition-colors`}>
                    <span className="font-cairo text-[12px] text-neutral-400">إرفاق صورة الكارتة</span>
                    <Camera size={14} className="text-neutral-400" />
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-3 rounded-b-[20px]">
          <button onClick={onClose}
            className="px-6 h-10 font-cairo font-semibold text-[13px] text-neutral-600 bg-white border border-neutral-200 rounded-[12px] hover:bg-neutral-50 transition-colors">
            إلغاء
          </button>
          <button onClick={save}
            className="px-8 h-10 font-cairo font-semibold text-[13px] text-white bg-primary-500 rounded-[12px] hover:bg-primary-600 shadow-sm transition-colors">
            {isEdit ? 'حفظ التعديلات' : 'إضافة وحفظ'}
          </button>
        </div>
      </div>
    </div>
  )
}

function HeadViewDrawer({ cattle, batches, onClose, onEdit }: {
  cattle: Cattle; batches: Batch[]; onClose: () => void; onEdit: () => void
}) {
  const tc = TYPE_CFG[cattle.type]
  const sc = STATUS_CFG[cattle.status]
  const b = batches.find(x => x.id === cattle.batchId)

  function Row({ icon: Icon, label, value, ltr }: { icon: React.ElementType; label: string; value: string; ltr?: boolean }) {
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
        <div className="w-7 h-7 rounded-[8px] bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={13} className="text-neutral-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-cairo text-[10px] text-neutral-400 mb-0.5">{label}</p>
          <p className="font-cairo font-semibold text-[13px] text-neutral-900" dir={ltr ? 'ltr' : 'rtl'}>{value || '—'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[600] flex" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mr-auto w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="shrink-0 px-5 py-5 bg-gradient-to-l from-primary-50 to-white border-b border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-white transition-colors">
              <X size={15} />
            </button>
            <button onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-primary-500 text-white font-cairo font-semibold text-[12px] hover:bg-primary-600 transition-colors">
              <Edit2 size={12} /> تعديل
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] bg-primary-100 flex items-center justify-center shrink-0">
              <ScanLine size={22} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-cairo font-bold text-[17px] text-neutral-900 leading-snug">{cattle.tag || 'محمّع (بلا وسم)'}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>{tc.label}</span>
                <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="shrink-0 px-5 py-3 border-b border-neutral-100 bg-neutral-50/60">
          <div className="flex items-center gap-4">
            <div className="text-center flex-1">
              <p className="font-cairo font-bold text-[20px] text-warning-600 leading-none">{cattle.avgWeight}</p>
              <p className="font-cairo text-[11px] text-neutral-400 mt-0.5">وزن الرأس (كجم)</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Row icon={CalendarDays} label="تاريخ الدخول" value={cattle.entryDate} ltr />
          <Row icon={Target} label="الدورة المرتبطة" value={b?.name || '—'} />
          <Row icon={Type} label="السلالة" value={cattle.breed || '—'} />
          <Row icon={Truck} label="رقم السيارة" value={cattle.vehicleNumber || '—'} />
        </div>
      </div>
    </div>
  )
}

interface BatchFormState {
  name: string
  type: CattleType | ''
  startDate: string
  endDate: string
  targetWeight: string
  notes: string
}

function emptyBatchForm(): BatchFormState {
  return {
    name: '',
    type: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetWeight: '',
    notes: '',
  }
}

// ─── Batch Form Modal (shared for Add & Edit) ────────────────────────────────

function BatchFormModal({
  initial, isEdit, onSave, onClose,
}: {
  initial: BatchFormState
  isEdit: boolean
  onSave: (data: Omit<Batch, 'id'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<BatchFormState>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const inp = 'w-full h-9 px-3 rounded-[10px] border border-neutral-200 bg-white text-[13px] font-cairo text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400'
  const inpErr = 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
  const lbl = 'block text-[11px] font-semibold text-neutral-500 mb-1 uppercase tracking-wide'

  function save() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'اسم الدورة مطلوب'
    if (!form.type) errs.type = 'نوع الدورة مطلوب'
    if (!form.startDate) errs.startDate = 'تاريخ البدء مطلوب'
    if (form.endDate && form.endDate < form.startDate) errs.endDate = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave({
      name: form.name.trim(),
      type: form.type as CattleType,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      status: form.endDate ? 'closed' : 'active',
      targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : undefined,
      notes: form.notes.trim() || undefined,
    })
  }

  function f<K extends keyof BatchFormState>(k: K, v: BatchFormState[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined as any }))
  }

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[500px] flex flex-col max-h-[90vh]">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-l from-primary-400 to-primary-600 rounded-t-[20px]" />
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-primary-50 flex items-center justify-center">
              {isEdit ? <Edit2 size={16} className="text-primary-500" /> : <PlayCircle size={16} className="text-primary-500" />}
            </div>
            <div>
              <h3 className="font-cairo font-bold text-[16px] text-neutral-900">{isEdit ? 'تعديل الدورة' : 'فتح دورة جديدة'}</h3>
              <p className="font-cairo text-[11px] text-neutral-400">{isEdit ? 'عدّل بيانات الدورة أدناه' : 'أدخل بيانات الدورة الجديدة'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* اسم الدورة */}
          <div>
            <label className={lbl}>اسم الدورة <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => f('name', e.target.value)}
              placeholder="مثال: دورة تسمين عجول 2026/01"
              className={`${inp} ${errors.name ? inpErr : ''}`} />
            {errors.name && <p className="font-cairo text-[11px] text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* نوع الدورة */}
          <div>
            <label className={lbl}>نوع الدورة <span className="text-red-500">*</span></label>
            <div className="flex gap-3">
              {(['fattening', 'dairy'] as CattleType[]).map(t => {
                const tc = TYPE_CFG[t]
                const active = form.type === t
                return (
                  <button key={t} type="button" onClick={() => f('type', t)}
                    className={['flex-1 flex items-center justify-center gap-2 h-10 rounded-[10px] border-2 font-cairo font-semibold text-[13px] transition-all',
                      active ? `${tc.bg} border-current ${tc.color}` : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50',
                    ].join(' ')}>
                    {active && <Check size={13} />}{tc.label}
                  </button>
                )
              })}
            </div>
            {errors.type && <p className="font-cairo text-[11px] text-red-500 mt-1">{errors.type}</p>}
          </div>

          {/* تواريخ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>تاريخ البدء <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)}
                className={`${inp} ${errors.startDate ? inpErr : ''}`} dir="ltr" />
              {errors.startDate && <p className="font-cairo text-[11px] text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className={lbl}>تاريخ الانتهاء <span className="text-neutral-400 font-normal">(اختياري)</span></label>
              <input type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)}
                className={`${inp} ${errors.endDate ? inpErr : ''}`} dir="ltr" />
              {errors.endDate && <p className="font-cairo text-[11px] text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* الوزن المستهدف */}
          <div>
            <label className={lbl}>الوزن المستهدف للرأس (كجم) <span className="text-neutral-400 font-normal">(اختياري)</span></label>
            <div className="relative">
              <Scale size={13} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input type="number" min="0" step="1" value={form.targetWeight} onChange={e => f('targetWeight', e.target.value)}
                placeholder="مثال: 450" className={`${inp} pe-8`} />
            </div>
          </div>

          {/* ملاحظات */}
          <div>
            <label className={lbl}>ملاحظات <span className="text-neutral-400 font-normal">(اختياري)</span></label>
            <textarea value={form.notes} rows={2} onChange={e => f('notes', e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              className="w-full px-3 py-2 rounded-[10px] border border-neutral-200 bg-white text-[13px] font-cairo text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400 resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60 flex gap-3 rounded-b-[20px]">
          <button onClick={save}
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-bold text-[13px] hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm">
            {isEdit ? <><Check size={14} /> حفظ التعديلات</> : <><PlayCircle size={14} /> فتح الدورة</>}
          </button>
          <button onClick={onClose}
            className="px-5 h-10 border border-neutral-200 text-neutral-600 rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-all">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Batch View Drawer ────────────────────────────────────────────────────────

function BatchViewDrawer({ batch, cattleCount, onClose, onEdit }: {
  batch: Batch; cattleCount: number; onClose: () => void; onEdit: () => void
}) {
  const tc = TYPE_CFG[batch.type]

  function Row({ icon: Icon, label, value, ltr }: { icon: React.ElementType; label: string; value: string; ltr?: boolean }) {
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
        <div className="w-7 h-7 rounded-[8px] bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={13} className="text-neutral-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-cairo text-[10px] text-neutral-400 mb-0.5">{label}</p>
          <p className="font-cairo font-semibold text-[13px] text-neutral-900" dir={ltr ? 'ltr' : 'rtl'}>{value || '—'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[600] flex" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mr-auto w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="shrink-0 px-5 py-5 bg-gradient-to-l from-primary-50 to-white border-b border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-white transition-colors">
              <X size={15} />
            </button>
            <button onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-primary-500 text-white font-cairo font-semibold text-[12px] hover:bg-primary-600 transition-colors">
              <Edit2 size={12} /> تعديل
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] bg-primary-100 flex items-center justify-center shrink-0">
              <PlayCircle size={22} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-cairo font-bold text-[17px] text-neutral-900 leading-snug">{batch.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>{tc.label}</span>
                <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${batch.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${batch.status === 'active' ? 'bg-success-500 animate-pulse' : 'bg-neutral-400'}`} />
                  {batch.status === 'active' ? 'مفتوحة' : 'مغلقة'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="shrink-0 px-5 py-3 border-b border-neutral-100 bg-neutral-50/60">
          <div className="flex items-center gap-4">
            <div className="text-center flex-1">
              <p className="font-cairo font-bold text-[20px] text-primary-600 leading-none">{cattleCount}</p>
              <p className="font-cairo text-[11px] text-neutral-400 mt-0.5">عدد الرؤوس</p>
            </div>
            <div className="w-px h-8 bg-neutral-200" />
            <div className="text-center flex-1">
              <p className="font-cairo font-bold text-[20px] text-warning-600 leading-none">{batch.targetWeight ? `${batch.targetWeight}` : '—'}</p>
              <p className="font-cairo text-[11px] text-neutral-400 mt-0.5">الوزن المستهدف (كجم)</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Row icon={CalendarDays} label="تاريخ البدء" value={batch.startDate} ltr />
          <Row icon={CalendarDays} label="تاريخ الانتهاء" value={batch.endDate ?? 'لم يُحدَّد بعد'} ltr />
          <Row icon={Target} label="الوزن المستهدف" value={batch.targetWeight ? `${batch.targetWeight} كجم` : '—'} />
          {batch.notes && (
            <div className="mt-4 bg-neutral-50 rounded-[10px] px-4 py-3">
              <p className="font-cairo text-[10px] text-neutral-400 mb-1">ملاحظات</p>
              <p className="font-cairo text-[13px] text-neutral-700 leading-relaxed">{batch.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── BatchesTab ───────────────────────────────────────────────────────────────

function BatchesTab({ batches, cattle, onAdd, onEdit, onDelete }: {
  batches: Batch[]
  cattle: Cattle[]
  onAdd: (b: Omit<Batch, 'id'>) => void
  onEdit: (id: number, b: Omit<Batch, 'id'>) => void
  onDelete: (id: number) => void
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CattleType | 'all'>('all')
  const [page, setPage] = useState(1)

  const [showAdd, setShowAdd] = useState(false)
  const [viewBatch, setViewBatch] = useState<Batch | null>(null)
  const [editBatch, setEditBatch] = useState<Batch | null>(null)
  const [deleteBatch, setDeleteBatch] = useState<Batch | null>(null)

  const filtered = useMemo(() => batches.filter(b => {
    const ms = !search || b.name.includes(search)
    const mt = typeFilter === 'all' || b.type === typeFilter
    return ms && mt
  }), [batches, search, typeFilter])

  useEffect(() => { setPage(1) }, [search, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function batchToCattleCount(id: number) {
    return cattle.filter(c => c.batchId === id).length
  }

  function batchToForm(b: Batch): BatchFormState {
    return {
      name: b.name,
      type: b.type,
      startDate: b.startDate,
      endDate: b.endDate ?? '',
      targetWeight: b.targetWeight?.toString() ?? '',
      notes: b.notes ?? '',
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-[14px] px-5 py-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم الدورة..."
            className="w-full h-9 ps-8 pe-3 rounded-[10px] border border-neutral-200 font-cairo text-[13px] focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 placeholder:text-neutral-300" />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as CattleType | 'all')}
            className="h-9 ps-8 pe-8 rounded-[10px] border border-neutral-200 bg-white font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 cursor-pointer appearance-none">
            <option value="all">كل الأنواع</option>
            <option value="dairy">حلاب</option>
            <option value="fattening">تسمين</option>
          </select>
          <ChevronDown size={12} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 h-9 px-4 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm ms-auto">
          <Plus size={15} /> فتح دورة جديدة
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-[16px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70">
                {['#', 'اسم الدورة', 'النوع', 'تاريخ البدء', 'تاريخ الانتهاء', 'الوزن المستهدف', 'الحالة', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={Target} title="لا توجد دورات" sub="قم بإنشاء دورة للبدء في التسجيل" /></td></tr>
              ) : paged.map((b, idx) => {
                const tc = TYPE_CFG[b.type]
                return (
                  <tr key={b.id} onClick={() => setViewBatch(b)} className="border-b border-neutral-50 hover:bg-neutral-50/60 transition-colors cursor-pointer group">
                    <td className="px-4 py-3 font-cairo text-[12px] text-neutral-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-cairo font-bold text-[13px] text-neutral-900">{b.name}</p>
                      {b.notes && <p className="font-cairo text-[11px] text-neutral-400 truncate max-w-[200px]">{b.notes}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>{tc.label}</span>
                    </td>
                    <td className="px-4 py-3 font-cairo text-[12px] text-neutral-600" dir="ltr">{b.startDate}</td>
                    <td className="px-4 py-3 font-cairo text-[12px]" dir="ltr">
                      {b.endDate ? <span className="text-neutral-700 font-semibold">{b.endDate}</span> : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-cairo text-[13px] text-neutral-800 font-bold">{b.targetWeight ? `${b.targetWeight} كجم` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${b.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'active' ? 'bg-success-500 animate-pulse' : 'bg-neutral-400'}`} />
                        {b.status === 'active' ? 'مفتوحة' : 'مغلقة'}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setViewBatch(b)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-info-50 hover:text-info-600 transition-colors" title="عرض">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => setEditBatch(b)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="تعديل">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteBatch(b)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="حذف">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} setPage={setPage} total={filtered.length} unit="دورة" />
      </div>

      {/* Add Modal */}
      {showAdd && (
        <BatchFormModal
          initial={emptyBatchForm()} isEdit={false}
          onSave={data => { onAdd(data); setShowAdd(false) }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit Modal */}
      {editBatch && (
        <BatchFormModal
          initial={batchToForm(editBatch)} isEdit={true}
          onSave={data => { onEdit(editBatch.id, data); setEditBatch(null) }}
          onClose={() => setEditBatch(null)}
        />
      )}

      {/* View Drawer */}
      {viewBatch && (
        <BatchViewDrawer
          batch={viewBatch}
          cattleCount={batchToCattleCount(viewBatch.id)}
          onClose={() => setViewBatch(null)}
          onEdit={() => { setEditBatch(viewBatch); setViewBatch(null) }}
        />
      )}

      {/* Delete Confirm */}
      {deleteBatch && (
        <ConfirmDeleteModal
          itemName={deleteBatch.name}
          itemType="الدورة"
          onConfirm={() => { onDelete(deleteBatch.id); setDeleteBatch(null) }}
          onClose={() => setDeleteBatch(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Layout
// ─────────────────────────────────────────────────────────────────────────────

export default function CattlePage() {
  const [activeTab, setActiveTab] = useState<'heads' | 'batches'>('heads')
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [batchesRes, cattleRes] = await Promise.all([
        livestockBatchesApi.getList(1, 1000),
        livestockHeadsApi.getList(1, 1000),
      ])

      console.log('Batches response:', batchesRes)
      console.log('Cattle response:', cattleRes)

      if (batchesRes.data?.data) {
        const mappedBatches = batchesRes.data.data.map((b: LivestockBatchItem) => {
          console.log('Mapping batch:', b)
          const typeStr = (b.batchType || '').toLowerCase()
          return {
            id: b.id,
            name: b.name,
            type: (typeStr.includes('dairy') ? 'dairy' : 'fattening') as CattleType,
            startDate: b.startDate,
            endDate: b.endDate,
            status: (b.status || '').toLowerCase().includes('closed') ? 'closed' : 'active' as BatchStatus,
            targetWeight: b.targetWeight,
            numberOfHeads: b.numberOfHeads,
          }
        })
        setBatches(mappedBatches)
      }

      if (cattleRes.data?.data) {
        const mappedCattle = cattleRes.data.data.map((c: LivestockHeadItem) => {
          console.log('Mapping cattle:', c)
          const typeStr = (c.headType || '').toLowerCase()
          const statusStr = (c.status || '').toLowerCase()
          let status: CattleStatus = 'active'
          if (statusStr.includes('sold')) status = 'sold'
          else if (statusStr.includes('dead')) status = 'dead'
          else if (statusStr.includes('quarantine')) status = 'quarantine'

          return {
            id: c.id,
            batchId: c.livestockBatchId,
            tag: c.tag,
            type: (typeStr.includes('dairy') ? 'dairy' : 'fattening') as CattleType,
            breed: c.breed,
            entryDate: c.entryDate,
            avgWeight: c.averageWeight,
            vehicleNumber: c.vehicleNumber,
            weighbridgePhoto: c.weighbridgePhotoUrl,
            status: status,
            batchName: c.batchName,
          }
        })
        setCattle(mappedCattle)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تحميل البيانات'
      setError(msg)
      console.error('Error loading cattle data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Batches
  async function handleAddBatch(data: Omit<Batch, 'id'>) {
    try {
      const req: CreateBatchRequest = {
        name: data.name,
        batchType: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        targetWeight: data.targetWeight,
        status: data.status === 'active' ? 'Active' : 'Closed',
      }
      await livestockBatchesApi.create(req)
      await loadData()
    } catch (err) {
      console.error('Error adding batch:', err)
      setError('فشل إضافة الدورة')
    }
  }

  async function handleEditBatch(id: string | number, data: Omit<Batch, 'id'>) {
    try {
      const req: UpdateBatchRequest = {
        id: Number(id),
        name: data.name,
        batchType: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        targetWeight: data.targetWeight,
        status: data.status === 'active' ? 'Active' : 'Closed',
      }
      await livestockBatchesApi.update(Number(id), req)
      await loadData()
    } catch (err) {
      console.error('Error editing batch:', err)
      setError('فشل تعديل الدورة')
    }
  }

  async function handleDeleteBatch(id: string | number) {
    try {
      await livestockBatchesApi.delete(Number(id))
      await loadData()
    } catch (err) {
      console.error('Error deleting batch:', err)
      setError('فشل حذف الدورة')
    }
  }

  // Heads
  async function handleAddHeads(form: HeadFormState) {
    try {
      const count = parseInt(form.count) || 1

      if (count > 1) {
        // Use bulk API
        const req: CreateHeadsBulkRequest = {
          livestockBatchId: Number(form.batchId),
          count: count,
          headType: form.type,
          breed: form.breed || undefined,
          averageWeight: form.avgWeight ? parseFloat(form.avgWeight) : undefined,
          entryDate: form.entryDate,
          status: 'Active',
          vehicleNumber: form.vehicleNumber || undefined,
          weighbridgePhotoUrl: form.weighbridgePhoto?.name || undefined,
        }
        await livestockHeadsApi.createBulk(req)
      } else {
        // Use single create API
        const req: CreateHeadRequest = {
          livestockBatchId: Number(form.batchId),
          headType: form.type,
          tag: form.tag || undefined,
          breed: form.breed || undefined,
          averageWeight: form.avgWeight ? parseFloat(form.avgWeight) : undefined,
          entryDate: form.entryDate,
          status: 'Active',
          vehicleNumber: form.vehicleNumber || undefined,
          weighbridgePhotoUrl: form.weighbridgePhoto?.name || undefined,
        }
        await livestockHeadsApi.create(req)
      }

      await loadData()
    } catch (err) {
      console.error('Error adding heads:', err)
      setError('فشل إضافة الرؤوس')
    }
  }

  async function handleEditHead(id: string | number, data: HeadFormState) {
    try {
      const req: UpdateHeadRequest = {
        id: Number(id),
        livestockBatchId: Number(data.batchId),
        headType: data.type,
        tag: data.tag || undefined,
        breed: data.breed || undefined,
        averageWeight: data.avgWeight ? parseFloat(data.avgWeight) : undefined,
        entryDate: data.entryDate,
        status: 'Active',
        vehicleNumber: data.vehicleNumber || undefined,
        weighbridgePhotoUrl: data.weighbridgePhoto?.name || undefined,
      }
      await livestockHeadsApi.update(Number(id), req)
      await loadData()
    } catch (err) {
      console.error('Error editing head:', err)
      setError('فشل تعديل الرأس')
    }
  }

  async function handleDeleteHead(id: string | number) {
    try {
      await livestockHeadsApi.delete(Number(id))
      await loadData()
    } catch (err) {
      console.error('Error deleting head:', err)
      setError('فشل حذف الرأس')
    }
  }

  return (
    <div className="min-h-full bg-neutral-100 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="font-cairo font-bold text-[24px] text-neutral-900 leading-tight mb-2">الرؤوس والدورات</h1>
          <p className="font-cairo text-[14px] text-neutral-500 leading-tight">إدارة السجلات، الدورات المفتوحة والمغلقة، والأوزان الخاصة بالمواشي.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[12px] px-4 py-3 flex items-center gap-3">
            <div className="text-red-600 text-[14px] font-cairo">{error}</div>
            <button onClick={() => setError('')} className="ms-auto text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-neutral-200 rounded-[12px] px-4 py-4 flex items-center gap-3">
            <Loader2 size={18} className="text-primary-500 animate-spin" />
            <span className="font-cairo text-[14px] text-neutral-600">جاري تحميل البيانات...</span>
          </div>
        )}

        {/* Tabs */}
        {!loading && (
          <>
            <div className="flex items-center gap-1 border-b border-neutral-200">
              <button onClick={() => setActiveTab('heads')} className={`px-5 py-3 font-cairo font-bold text-[14px] leading-tight transition-all border-b-[3px] ${activeTab === 'heads' ? 'text-primary-600 border-primary-600' : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-300'}`}>
                سجل الرؤوس
              </button>
              <button onClick={() => setActiveTab('batches')} className={`px-5 py-3 font-cairo font-bold text-[14px] leading-tight transition-all border-b-[3px] ${activeTab === 'batches' ? 'text-primary-600 border-primary-600' : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-300'}`}>
                الدورات
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'heads' && <HeadsTab cattle={cattle} batches={batches} onAdd={handleAddHeads} onEdit={handleEditHead} onDelete={handleDeleteHead} />}
            {activeTab === 'batches' && <BatchesTab batches={batches} cattle={cattle} onAdd={handleAddBatch} onEdit={handleEditBatch} onDelete={handleDeleteBatch} />}
          </>
        )}

      </div>
    </div>
  )
}
