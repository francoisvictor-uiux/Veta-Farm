import { useState } from 'react'
import {
  Cell, PieChart, Pie, Tooltip,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Percent, Download,
  ArrowUpRight, ArrowDownRight, Scale,
  ShoppingCart, Tag, Wallet, Wrench, Zap, MoreHorizontal,
} from 'lucide-react'

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtMoney  = (n: number) => n.toLocaleString('ar-EG') + ' ج.م'
const fmtDate   = (d: string) => new Date(d).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })

// ─── Mock Financial Data ───────────────────────────────────────────────────────
const MONTHLY_DATA = [
  { month: 'يناير', revenue: 285000, expenses: 210000, profit: 75000 },
  { month: 'فبراير', revenue: 318000, expenses: 245000, profit: 73000 },
  { month: 'مارس',   revenue: 618500, expenses: 420900, profit: 197600 },
]

const EXPENSE_BREAKDOWN = [
  { name: 'مشتريات',       value: 248000, pct: 58.9, color: '#f59e0b', icon: ShoppingCart },
  { name: 'رواتب وأجور',   value: 185000, pct: 43.9, color: '#8b5cf6', icon: Wallet      },
  { name: 'تشغيلية',       value: 20500,  pct: 4.9,  color: '#0ea5e9', icon: Zap         },
  { name: 'صيانة',         value: 15000,  pct: 3.6,  color: '#f97316', icon: Wrench       },
  { name: 'أخرى',          value: 9000,   pct: 2.1,  color: '#94a3b8', icon: MoreHorizontal},
]

const REVENUE_BREAKDOWN = [
  { name: 'مبيعات ماشية',       value: 400000, pct: 64.7, color: '#1a6b3c' },
  { name: 'مبيعات لحوم',        value: 143500, pct: 23.2, color: '#2d9e5f' },
  { name: 'منتجات ثانوية',      value: 60000,  pct: 9.7,  color: '#4ade80' },
  { name: 'إيرادات أخرى',       value: 15000,  pct: 2.4,  color: '#86efac' },
]

const RECENT_JOURNAL = [
  { date: '2026-03-30', desc: 'مصروفات تشغيلية — مارس 2026',     debit: 32500,  credit: 0,      balance: 197600 },
  { date: '2026-03-27', desc: 'تحصيل مبيعات ماشية',               debit: 0,      credit: 120000, balance: 230100 },
  { date: '2026-03-24', desc: 'رواتب وأجور مارس 2026',            debit: 185000, credit: 0,      balance: 110100 },
  { date: '2026-03-22', desc: 'تحصيل مبيعات منتجات ثانوية',       debit: 0,      credit: 38500,  balance: 295100 },
  { date: '2026-03-17', desc: 'دفع مشتريات دريس برسيم',           debit: 75000,  credit: 0,      balance: 256600 },
  { date: '2026-03-15', desc: 'تحصيل فاتورة عملاء',               debit: 0,      credit: 120000, balance: 331600 },
  { date: '2026-03-14', desc: 'دفع مشتريات مواشي هولشتاين',       debit: 280000, credit: 0,      balance: 211600 },
  { date: '2026-03-10', desc: 'تحصيل مبيعات ماشية',               debit: 0,      credit: 165000, balance: 491600 },
]

type Period = 'mar' | 'q1' | 'ytd'
const PERIOD_LABELS: Record<Period, string> = { mar: 'مارس 2026', q1: 'الربع الأول', ytd: 'منذ بداية العام' }

// ─── Custom CSS Bar Chart (avoids recharts key conflicts) ─────────────────────
interface BarRow { month: string; revenue: number; expenses: number; profit: number }

function CssBarChart({ data }: { data: BarRow[] }) {
  const CHART_H = 200
  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.expenses, d.profit]))
  const px     = (v: number) => Math.max(Math.round((v / maxVal) * CHART_H), 3)
  const fmt    = (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'ك' : String(v)

  const BARS = [
    { key: 'revenue'  as const, color: '#1a6b3c', label: 'إيرادات'  },
    { key: 'expenses' as const, color: '#fca5a5', label: 'مصروفات' },
    { key: 'profit'   as const, color: '#60a5fa', label: 'صافي'     },
  ]

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(maxVal * t))

  return (
    <div dir="ltr" className="flex gap-2">
      {/* Y-axis */}
      <div className="flex flex-col justify-between items-end shrink-0" style={{ width: 44, height: CHART_H }}>
        {[...ticks].reverse().map((t, i) => (
          <span key={i} className="font-cairo text-[10px] text-neutral-400 leading-none">{fmt(t)}</span>
        ))}
      </div>
      {/* Chart area */}
      <div className="flex-1 flex flex-col gap-0">
        {/* Bars area */}
        <div className="relative" style={{ height: CHART_H }}>
          {/* Grid lines */}
          {ticks.map((_, i) => (
            <div key={i} className="absolute w-full border-t border-neutral-100"
              style={{ bottom: (i / (ticks.length - 1)) * CHART_H }} />
          ))}
          {/* Bar groups */}
          <div className="absolute inset-0 flex items-end justify-around px-2" style={{ gap: data.length > 1 ? 16 : 48 }}>
            {data.map((row, ri) => (
              <div key={`grp-${ri}`} className="flex items-end gap-1.5 flex-1 justify-center" style={{ height: CHART_H }}>
                {BARS.map(bar => (
                  <div key={`col-${ri}-${bar.key}`}
                    className="group relative flex-1 rounded-t-md cursor-default transition-opacity hover:opacity-80"
                    style={{ height: px(row[bar.key]), background: bar.color, maxWidth: 36, minWidth: 12 }}
                  >
                    {/* Value label on top */}
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-cairo text-[9px] text-neutral-500 whitespace-nowrap hidden group-hover:block">
                      {fmt(row[bar.key])}
                    </span>
                    {/* Hover tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-900 text-white font-cairo text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      {bar.label}: {fmtMoney(row[bar.key])}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* X-axis labels */}
        <div className="flex justify-around px-2 pt-2">
          {data.map((row, ri) => (
            <span key={`lbl-${ri}`} className="font-cairo text-[11px] text-neutral-500 flex-1 text-center">{row.month}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, icon: Icon, accent }: {
  label: string; value: string; sub?: string
  trend?: { dir: 'up' | 'down'; pct: number }
  icon: React.ElementType
  accent: { bg: string; iconColor: string; textColor: string }
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={accent.iconColor} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold font-cairo rounded-full px-2 py-1 ${trend.dir === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {trend.dir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.pct}%
          </div>
        )}
      </div>
      <p className="font-cairo text-[11px] text-neutral-400 mb-1">{label}</p>
      <p className={`font-cairo font-bold text-[22px] ${accent.textColor} leading-tight`}>{value}</p>
      {sub && <p className="font-cairo text-[11px] text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  const [period, setPeriod] = useState<Period>('mar')

  const periodMultiplier = period === 'mar' ? 1 : period === 'q1' ? 1 : 1
  const baseRev  = period === 'mar' ? 618500  : period === 'q1' ? 1221500 : 1221500
  const baseExp  = period === 'mar' ? 420900  : period === 'q1' ? 875900  : 875900
  const baseProf = baseRev - baseExp
  const profPct  = Math.round((baseProf / baseRev) * 100)

  const chartData = period === 'mar'
    ? MONTHLY_DATA.slice(2)
    : period === 'q1'
    ? MONTHLY_DATA
    : MONTHLY_DATA

  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo" dir="rtl">
      <div className="max-w-[1280px] mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-cairo font-bold text-[22px] text-neutral-800">الحسابات العامة</h1>
            <p className="font-cairo text-[13px] text-neutral-400 mt-0.5">التقارير المالية والأداء العام للمزرعة</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-neutral-200 shadow-sm">
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([k, v]) => (
                <button key={k} onClick={() => setPeriod(k)}
                  className={`px-3 py-1.5 rounded-lg font-cairo text-[12px] font-semibold transition-all ${period === k ? 'bg-[#1a6b3c] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                  {v}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 bg-white text-neutral-600 rounded-xl font-cairo text-[13px] font-semibold hover:bg-neutral-50">
              <Download size={15} /> تصدير
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="إجمالي الإيرادات"
            value={fmtMoney(baseRev)}
            sub={PERIOD_LABELS[period]}
            trend={{ dir: 'up', pct: 14 }}
            icon={TrendingUp}
            accent={{ bg: 'bg-[#e8f5ee]', iconColor: 'text-[#1a6b3c]', textColor: 'text-[#1a6b3c]' }}
          />
          <KpiCard
            label="إجمالي المصروفات"
            value={fmtMoney(baseExp)}
            sub={PERIOD_LABELS[period]}
            trend={{ dir: 'up', pct: 8 }}
            icon={TrendingDown}
            accent={{ bg: 'bg-red-50', iconColor: 'text-red-600', textColor: 'text-red-700' }}
          />
          <KpiCard
            label="صافي الربح"
            value={fmtMoney(baseProf)}
            sub={PERIOD_LABELS[period]}
            trend={{ dir: 'up', pct: 22 }}
            icon={Scale}
            accent={{ bg: 'bg-blue-50', iconColor: 'text-blue-600', textColor: 'text-blue-700' }}
          />
          <KpiCard
            label="هامش الربح"
            value={`${profPct}%`}
            sub="نسبة الربح الصافي"
            icon={Percent}
            accent={{ bg: 'bg-violet-50', iconColor: 'text-violet-600', textColor: 'text-violet-700' }}
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

          {/* Monthly Bar Chart */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-cairo font-bold text-[15px] text-neutral-800">الإيرادات مقابل المصروفات</h2>
                <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">مقارنة شهرية للأداء المالي</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#1a6b3c]" /><span className="font-cairo text-[11px] text-neutral-500">إيرادات</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400" /><span className="font-cairo text-[11px] text-neutral-500">مصروفات</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400" /><span className="font-cairo text-[11px] text-neutral-500">صافي</span></div>
              </div>
            </div>
            {/* Custom CSS Bar Chart */}
            <CssBarChart data={chartData} />
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <div className="mb-4">
              <h2 className="font-cairo font-bold text-[15px] text-neutral-800">توزيع المصروفات</h2>
              <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">{PERIOD_LABELS[period]}</p>
            </div>
            {/* Mini donut via recharts */}
            <div className="flex items-center justify-center mb-4">
              <PieChart width={180} height={180}>
                <Pie data={EXPENSE_BREAKDOWN} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" paddingAngle={3} startAngle={90} endAngle={450}>
                  {EXPENSE_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-expense-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [fmtMoney(v), '']} contentStyle={{ fontFamily: 'Cairo', fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </div>
            {/* Legend rows */}
            <div className="space-y-2">
              {EXPENSE_BREAKDOWN.map(item => {
                const Icon = item.icon
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ background: item.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <Icon size={11} className="text-neutral-400" />
                          <span className="font-cairo text-[12px] font-semibold text-neutral-700">{item.name}</span>
                        </div>
                        <span className="font-cairo text-[11px] text-neutral-500">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                      </div>
                    </div>
                    <span className="font-cairo text-[11px] font-semibold text-neutral-600 w-[80px] text-left shrink-0">{fmtMoney(item.value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Revenue + Journal Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <div className="mb-4">
              <h2 className="font-cairo font-bold text-[15px] text-neutral-800">مصادر الإيرادات</h2>
              <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">{PERIOD_LABELS[period]}</p>
            </div>
            <div className="space-y-3">
              {REVENUE_BREAKDOWN.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="font-cairo text-[13px] font-semibold text-neutral-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-cairo text-[12px] font-bold text-neutral-800">{fmtMoney(item.value)}</span>
                      <span className="font-cairo text-[11px] text-neutral-400 w-[40px] text-left">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Total */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="font-cairo text-[13px] font-bold text-neutral-700">الإجمالي</span>
              <span className="font-cairo font-bold text-[16px] text-[#1a6b3c]">{fmtMoney(baseRev)}</span>
            </div>
          </div>

          {/* Recent Journal Entries */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="font-cairo font-bold text-[15px] text-neutral-800">آخر القيود المحاسبية</h2>
                <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">الحركات المالية الأخيرة</p>
              </div>
              <Tag size={15} className="text-neutral-300" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    {['التاريخ', 'البيان', 'مدين', 'دائن', 'الرصيد'].map(h => (
                      <th key={h} className="px-4 py-3 font-cairo text-[11px] font-semibold text-neutral-500 text-right whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_JOURNAL.map((row, i) => (
                    <tr key={i} className={`border-b border-neutral-50 hover:bg-neutral-50/70 transition-colors ${i % 2 === 0 ? '' : 'bg-neutral-50/30'}`}>
                      <td className="px-4 py-3 font-cairo text-[11px] text-neutral-500 whitespace-nowrap">{fmtDate(row.date)}</td>
                      <td className="px-4 py-3 font-cairo text-[12px] text-neutral-700 max-w-[200px] truncate">{row.desc}</td>
                      <td className="px-4 py-3">
                        {row.debit > 0
                          ? <span className="font-cairo font-semibold text-[12px] text-red-600">{fmtMoney(row.debit)}</span>
                          : <span className="text-neutral-300 font-cairo text-[12px]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {row.credit > 0
                          ? <span className="font-cairo font-semibold text-[12px] text-green-600">{fmtMoney(row.credit)}</span>
                          : <span className="text-neutral-300 font-cairo text-[12px]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-cairo font-bold text-[12px] text-neutral-800">{fmtMoney(row.balance)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* P&L Summary Footer */}
            <div className="border-t border-neutral-100 px-5 py-3 bg-neutral-50/50">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'إجمالي المدين',   value: fmtMoney(RECENT_JOURNAL.reduce((s, r) => s + r.debit,  0)), color: 'text-red-600'     },
                  { label: 'إجمالي الدائن',   value: fmtMoney(RECENT_JOURNAL.reduce((s, r) => s + r.credit, 0)), color: 'text-green-600'   },
                  { label: 'صافي الفترة',     value: fmtMoney(RECENT_JOURNAL.reduce((s, r) => s + r.credit - r.debit, 0)), color: 'text-blue-600' },
                ].map(col => (
                  <div key={col.label} className="text-center">
                    <p className="font-cairo text-[10px] text-neutral-400">{col.label}</p>
                    <p className={`font-cairo font-bold text-[13px] ${col.color}`}>{col.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary cards row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'أعلى بند إيرادات',
              name: 'مبيعات ماشية',
              value: fmtMoney(400000),
              pct: '64.7%',
              trend: 'up' as const,
              color: '#1a6b3c',
              bg: 'bg-[#e8f5ee]',
            },
            {
              title: 'أعلى بند مصروفات',
              name: 'مشتريات مواشي وأعلاف',
              value: fmtMoney(248000),
              pct: '58.9%',
              trend: 'down' as const,
              color: '#d97706',
              bg: 'bg-amber-50',
            },
            {
              title: 'نسبة المصروفات للإيرادات',
              name: 'كفاءة التكاليف',
              value: `${Math.round((baseExp / baseRev) * 100)}%`,
              pct: `هامش صافٍ ${profPct}%`,
              trend: 'up' as const,
              color: '#2563eb',
              bg: 'bg-blue-50',
            },
          ].map(card => (
            <div key={card.title} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <p className="font-cairo text-[11px] text-neutral-400 mb-2">{card.title}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                  {card.trend === 'up'
                    ? <TrendingUp size={16} style={{ color: card.color }} />
                    : <TrendingDown size={16} style={{ color: card.color }} />}
                </div>
                <div>
                  <p className="font-cairo font-bold text-[16px] text-neutral-800">{card.value}</p>
                  <p className="font-cairo text-[11px] text-neutral-500">{card.name}</p>
                  <p className="font-cairo text-[10px]" style={{ color: card.color }}>{card.pct}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
