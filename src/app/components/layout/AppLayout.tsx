import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { Sidebar } from './Sidebar'

// ─── Breadcrumb map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':                 { title: 'الرئيسية',          subtitle: 'لوحة التحكم الرئيسية'       },
  '/cattle':           { title: 'الرؤوس والدورات',   subtitle: 'إدارة الدورات ورؤوس الماشية' },
  '/inventory':        { title: 'المخزون',            subtitle: 'إدارة المخازن والأصناف'      },
  '/purchasing':       { title: 'المشتريات',          subtitle: 'أوامر الشراء والفواتير'       },
  '/sales':            { title: 'المبيعات',           subtitle: 'فواتير البيع والتحصيل'        },
  '/accounts':         { title: 'الحسابات العامة',   subtitle: 'دفتر الأستاذ والقيود'        },
  '/cashier':          { title: 'الخزينة والبنوك',   subtitle: 'إدارة النقد والتسويات'        },
  '/suppliers':        { title: 'الموردين',           subtitle: 'بيانات وكشوف الموردين'        },
  '/customers':        { title: 'العملاء',            subtitle: 'بيانات وكشوف العملاء'         },
  '/employees':        { title: 'الموظفين',           subtitle: 'بيانات وملفات الموظفين'       },
  '/attendance':       { title: 'الحضور والانصراف',  subtitle: 'سجلات الحضور اليومية'         },
  '/payroll':          { title: 'الرواتب',            subtitle: 'مسيرات ومسح الرواتب'         },
  '/settings/users':   { title: 'المستخدمين',         subtitle: 'إدارة حسابات المستخدمين'      },
  '/settings/rules':   { title: 'صلاحيات الوصول',   subtitle: 'قواعد الصلاحيات والأدوار'     },
}

function getPageInfo(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Partial match
  const match = Object.keys(PAGE_TITLES).find(k => k !== '/' && pathname.startsWith(k))
  return match ? PAGE_TITLES[match] : { title: 'نجم فارم', subtitle: '' }
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  const location = useLocation()
  const { title, subtitle } = getPageInfo(location.pathname)

  return (
    <header className="h-[64px] bg-white border-b border-neutral-200 flex items-center gap-4 px-6 shrink-0 z-[200]" dir="rtl">
      {/* Page title */}
      <div className="flex flex-col leading-tight flex-1 min-w-0">
        <h1 className="font-cairo font-bold text-[18px] text-neutral-900 truncate">{title}</h1>
        {subtitle && (
          <p className="font-cairo text-[11px] text-neutral-400 truncate">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-[10px] bg-neutral-100 border border-neutral-200 w-56">
        <Search size={14} className="text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="بحث سريع..."
          className="flex-1 bg-transparent outline-none font-cairo text-[13px] text-neutral-700 placeholder:text-neutral-400"
          dir="rtl"
        />
      </div>

      {/* Notifications */}
      <button
        type="button"
        className="relative w-9 h-9 flex items-center justify-center rounded-[10px] hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
      </button>

      {/* User avatar */}
      <button
        type="button"
        className="flex items-center gap-2.5 h-9 px-3 rounded-[10px] hover:bg-neutral-100 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
          <span className="text-white font-cairo font-bold text-[11px]">م</span>
        </div>
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="font-cairo font-semibold text-[12px] text-neutral-900">المدير العام</span>
          <span className="font-cairo text-[10px] text-neutral-400">مدير النظام</span>
        </div>
        <ChevronDown size={13} className="text-neutral-400" />
      </button>
    </header>
  )
}

// ─── App Layout ───────────────────────────────────────────────────────────────

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-100 font-cairo" dir="rtl">
      {/* Sidebar — RIGHT in RTL (first child in RTL flex) */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
