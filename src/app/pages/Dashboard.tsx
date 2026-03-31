import {
  TrendingUp, TrendingDown, Layers, Package,
  Wallet, Users, AlertTriangle, ArrowLeft,
  Plus, Scale, CalendarCheck2, Truck,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

// ─── Mock data ────────────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    label: 'عدد الرؤوس النشطة',
    value: '1,248',
    unit: 'رأس',
    change: +5.2,
    icon: Layers,
    color: 'text-primary-500',
    bg: 'bg-primary-50',
    border: 'border-primary-100',
  },
  {
    label: 'تكلفة التغذية اليوم',
    value: '14,350',
    unit: 'ج.م',
    change: -2.1,
    icon: Package,
    color: 'text-warning-600',
    bg: 'bg-warning-50',
    border: 'border-warning-100',
  },
  {
    label: 'رصيد الخزينة',
    value: '283,400',
    unit: 'ج.م',
    change: +8.7,
    icon: Wallet,
    color: 'text-success-600',
    bg: 'bg-success-50',
    border: 'border-success-100',
  },
  {
    label: 'مديونية العملاء',
    value: '96,200',
    unit: 'ج.م',
    change: -3.5,
    icon: Users,
    color: 'text-info-600',
    bg: 'bg-info-50',
    border: 'border-info-100',
  },
  {
    label: 'مديونية الموردين',
    value: '42,800',
    unit: 'ج.م',
    change: +1.2,
    icon: Truck,
    color: 'text-error-600',
    bg: 'bg-error-50',
    border: 'border-error-100',
  },
  {
    label: 'رصيد البنك',
    value: '512,000',
    unit: 'ج.م',
    change: +12.4,
    icon: Wallet,
    color: 'text-primary-500',
    bg: 'bg-primary-50',
    border: 'border-primary-100',
  },
  {
    label: 'أصول المعدات',
    value: '1,840,000',
    unit: 'ج.م',
    change: 0,
    icon: Package,
    color: 'text-neutral-600',
    bg: 'bg-neutral-100',
    border: 'border-neutral-200',
  },
]

const MONTHLY_DATA = [
  { month: 'أغسطس',   revenue: 320000, cost: 240000 },
  { month: 'سبتمبر',  revenue: 280000, cost: 210000 },
  { month: 'أكتوبر',  revenue: 410000, cost: 290000 },
  { month: 'نوفمبر',  revenue: 390000, cost: 275000 },
  { month: 'ديسمبر',  revenue: 460000, cost: 310000 },
  { month: 'يناير',   revenue: 510000, cost: 340000 },
]

const FEED_TREND = [
  { day: '1 يناير',  cost: 12400 },
  { day: '5 يناير',  cost: 13200 },
  { day: '10 يناير', cost: 11800 },
  { day: '15 يناير', cost: 14500 },
  { day: '20 يناير', cost: 13900 },
  { day: '25 يناير', cost: 14350 },
  { day: '30 يناير', cost: 15200 },
]

const ALERTS = [
  { type: 'error',   icon: AlertTriangle, text: 'مديونية عميل "شركة النور" متأخرة 45 يوماً', amount: '28,500 ج.م', path: '/customers' },
  { type: 'error',   icon: AlertTriangle, text: 'فاتورة مورد "الغذاء الذهبي" تستحق غداً',     amount: '14,200 ج.م', path: '/purchasing' },
  { type: 'warning', icon: AlertTriangle, text: 'مخزون "ذرة صفراء" أقل من الحد الأدنى',       amount: '2.4 طن',     path: '/inventory' },
  { type: 'warning', icon: AlertTriangle, text: 'مخزون "كسب فول" أقل من 7 أيام',              amount: '1.8 طن',     path: '/inventory' },
  { type: 'warning', icon: AlertTriangle, text: '18 رأس في الدورة 5 دون وزن مستهدف',          amount: '18 رأس',     path: '/cattle'    },
]

const TODAY_JOURNAL = [
  { time: '09:14', type: 'استلام مشتريات', ref: 'GRN-2025-0142', amount: '+12,400 ج.م', user: 'أحمد محمود' },
  { time: '10:30', type: 'نزول ميكسر',    ref: 'MIX-2025-0087', amount: '-8,200 ج.م',  user: 'سامي علي'   },
  { time: '11:05', type: 'تحصيل عميل',    ref: 'RV-2025-0033',  amount: '+30,000 ج.م', user: 'محمد حسين'  },
  { time: '12:50', type: 'دفع مورد',      ref: 'PV-2025-0019',  amount: '-9,500 ج.م',  user: 'أحد محمود' },
  { time: '14:22', type: 'تسجيل وزن',    ref: 'WGT-2025-0055', amount: '—',            user: 'سامي لي'   },
]

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, unit, change, icon: Icon, color, bg, border,
}: typeof KPI_CARDS[0]) {
  const isPos = change > 0
  const isNeg = change < 0

  return (
    <div className={`bg-white border ${border} rounded-[14px] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-[10px] ${bg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={color} />
        </div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-[11px] font-cairo font-semibold rounded-full px-2 py-0.5 ${isPos ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-600'}`}>
            {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="font-cairo font-medium text-[12px] text-neutral-500">{label}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="font-cairo font-bold text-[22px] text-neutral-900">{value}</span>
          <span className="font-cairo font-medium text-[12px] text-neutral-400">{unit}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-neutral-200 rounded-[10px] px-4 py-3 shadow-lg font-cairo" dir="rtl">
      <p className="text-[12px] text-neutral-500 font-medium mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-[12px] text-neutral-600">{p.name}</span>
          <span className="text-[13px] font-bold" style={{ color: p.color }}>
            {p.value.toLocaleString('ar-EG')} ج.م
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Alert item ───────────────────────────────────────���──────────────────────

function AlertItem({ alert }: { alert: typeof ALERTS[0] }) {
  const isError = alert.type === 'error'
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-[10px] ${isError ? 'bg-error-50 border border-error-100' : 'bg-warning-50 border border-warning-100'}`}>
      <alert.icon size={15} className={`mt-0.5 shrink-0 ${isError ? 'text-error-500' : 'text-warning-600'}`} />
      <div className="flex-1 min-w-0">
        <p className="font-cairo font-medium text-[12px] text-neutral-800 leading-snug">{alert.text}</p>
        <p className={`font-cairo font-bold text-[11px] mt-0.5 ${isError ? 'text-error-600' : 'text-warning-700'}`}>{alert.amount}</p>
      </div>
      <button className={`shrink-0 text-[11px] font-cairo font-semibold flex items-center gap-1 ${isError ? 'text-error-500' : 'text-warning-600'} hover:underline`}>
        عرض <ArrowLeft size={10} />
      </button>
    </div>
  )
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'استلام مشتريات', icon: Truck,          color: 'bg-primary-500 text-white hover:bg-primary-600' },
  { label: 'نزول ميكسر',    icon: Package,         color: 'bg-warning-500 text-white hover:bg-warning-600' },
  { label: 'تسجيل وزن',    icon: Scale,           color: 'bg-info-500 text-white hover:bg-info-600'       },
  { label: 'تسجيل حضور',   icon: CalendarCheck2,  color: 'bg-success-600 text-white hover:bg-success-700' },
]

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div className="min-h-full bg-neutral-100 font-cairo" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

        {/* ── Welcome banner ── */}
        <div className="bg-primary-500 rounded-[16px] px-7 py-5 flex items-center justify-between gap-4 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
          />
          <div className="relative space-y-1">
            <p className="font-cairo font-medium text-[13px] text-primary-200">الأحد، 30 مارس 2026</p>
            <h2 className="font-cairo font-bold text-[22px] text-white">صباح الخير، المدير العام 👋</h2>
            <p className="font-cairo font-medium text-[13px] text-primary-200">
              لديك <span className="text-accent-500 font-bold">3 تنبيهات</span> تستوجب المراجعة اليوم
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 relative">
            {QUICK_ACTIONS.map(qa => (
              <button
                key={qa.label}
                type="button"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-cairo font-semibold text-[12px] transition-all active:scale-[0.97] shadow-sm ${qa.color}`}
              >
                <Plus size={13} />
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {KPI_CARDS.map(card => (
            <KpiCard key={card.label} {...card} />
          ))}
        </div>

        {/* ── Charts + Alerts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue vs Cost chart */}
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-[14px] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-cairo font-bold text-[15px] text-neutral-900">الإيرادات مقابل التكاليف</h3>
                <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">آخر 6 أشهر</p>
              </div>
              <span className="text-[11px] font-cairo font-semibold text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                بالجنيه المصري
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_DATA} barGap={4}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  key="x-axis"
                  dataKey="month"
                  tick={{ fontFamily: 'Cairo', fontSize: 11, fill: '#9f9f9f' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  key="y-axis"
                  tick={{ fontFamily: 'Cairo', fontSize: 10, fill: '#9f9f9f' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip key="tooltip" content={<CustomTooltip />} />
                <Legend
                  key="legend"
                  formatter={(val) => <span style={{ fontFamily: 'Cairo', fontSize: 11, color: '#757575' }}>{val}</span>}
                />
                <Bar key="revenue" dataKey="revenue" name="الإيرادات" fill="#1a4a26" radius={[4, 4, 0, 0]} />
                <Bar key="cost"    dataKey="cost"    name="التكاليف"  fill="#d7fa78" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts panel */}
          <div className="bg-white border border-neutral-200 rounded-[14px] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cairo font-bold text-[15px] text-neutral-900">تنبيهات النظام</h3>
              <span className="bg-error-500 text-white text-[11px] font-cairo font-bold px-2 py-0.5 rounded-full">
                {ALERTS.filter(a => a.type === 'error').length} عاجل
              </span>
            </div>
            <div className="flex flex-col gap-2.5 flex-1">
              {ALERTS.map((alert, i) => (
                <AlertItem key={i} alert={alert} />
              ))}
            </div>
            <button className="mt-4 w-full text-center font-cairo text-[12px] font-semibold text-primary-500 hover:underline">
              عرض جميع التنبيهات
            </button>
          </div>
        </div>

        {/* ── Feed trend + Journal row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Feed cost trend */}
          <div className="bg-white border border-neutral-200 rounded-[14px] p-6">
            <div className="mb-5">
              <h3 className="font-cairo font-bold text-[15px] text-neutral-900">تكلفة التغذية اليومية</h3>
              <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">آخر 30 يوماً — يناير 2026</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={FEED_TREND}>
                <defs>
                  <linearGradient id="feedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1a4a26" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a4a26" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  key="x-axis"
                  dataKey="day"
                  tick={{ fontFamily: 'Cairo', fontSize: 10, fill: '#9f9f9f' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  key="y-axis"
                  tick={{ fontFamily: 'Cairo', fontSize: 10, fill: '#9f9f9f' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                  width={32}
                />
                <Tooltip
                  key="tooltip"
                  formatter={(v: number) => [`${v.toLocaleString('ar-EG')} ج.م`, 'التكلفة']}
                  contentStyle={{ fontFamily: 'Cairo', fontSize: 12, borderRadius: 10, border: '1px solid #e6e6e6' }}
                />
                <Area
                  key="cost"
                  type="monotone"
                  dataKey="cost"
                  stroke="#1a4a26"
                  strokeWidth={2}
                  fill="url(#feedGrad)"
                  dot={{ fill: '#1a4a26', r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Daily journal */}
          <div className="bg-white border border-neutral-200 rounded-[14px] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cairo font-bold text-[15px] text-neutral-900">دفتر اليومية — اليوم</h3>
              <button className="text-[12px] font-cairo font-semibold text-primary-500 hover:underline">
                عرض الكل
              </button>
            </div>
            <div className="space-y-2 flex-1">
              {TODAY_JOURNAL.map((entry, i) => {
                const isPositive = entry.amount.startsWith('+')
                const isNegative = entry.amount.startsWith('-')
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-neutral-100 last:border-0">
                    <span className="font-cairo text-[11px] text-neutral-400 shrink-0 w-10">{entry.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-cairo font-semibold text-[12px] text-neutral-800 leading-snug">{entry.type}</p>
                      <p className="font-cairo text-[10px] text-neutral-400">{entry.ref} · {entry.user}</p>
                    </div>
                    <span className={`font-cairo font-bold text-[12px] shrink-0 ${isPositive ? 'text-success-600' : isNegative ? 'text-error-500' : 'text-neutral-400'}`}>
                      {entry.amount}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}