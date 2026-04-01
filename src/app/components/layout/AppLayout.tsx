import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Toaster } from 'sonner'
import { NotificationPanel, MOCK_NOTIFICATIONS, type Notification } from './NotificationPanel'
import { ProfileDropdown } from './ProfileDropdown'

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
  const match = Object.keys(PAGE_TITLES).find(k => k !== '/' && pathname.startsWith(k))
  return match ? PAGE_TITLES[match] : { title: 'نجم فارم', subtitle: '' }
}

interface HeaderProps {
  notifications: Notification[]
  showNotif: boolean
  showProfile: boolean
  onToggleNotif: () => void
  onToggleProfile: () => void
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
}

function Header({
  notifications, showNotif, showProfile,
  onToggleNotif, onToggleProfile, onMarkAllRead, onMarkRead,
}: HeaderProps) {
  const location = useLocation()
  const { title, subtitle } = getPageInfo(location.pathname)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="h-[64px] bg-white border-b border-neutral-200 flex items-center gap-3 px-6 shrink-0 z-[200] relative" dir="rtl">
      <div className="flex flex-col leading-tight flex-1 min-w-0">
        <h1 className="font-cairo font-bold text-[18px] text-neutral-900 truncate">{title}</h1>
        {subtitle && (
          <p className="font-cairo text-[11px] text-neutral-400 truncate">{subtitle}</p>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-[10px] bg-neutral-100 border border-neutral-200 w-52">
        <Search size={14} className="text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="بحث سريع..."
          className="flex-1 bg-transparent outline-none font-cairo text-[13px] text-neutral-700 placeholder:text-neutral-400"
          dir="rtl"
        />
      </div>

      {/* Notification bell */}
      <div className="relative">
        <button
          type="button"
          onClick={onToggleNotif}
          className={`relative w-9 h-9 flex items-center justify-center rounded-[10px] transition-colors ${showNotif ? 'bg-neutral-100 text-neutral-900' : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white font-cairo font-bold text-[9px] rounded-full px-1 leading-none">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotif && (
          <NotificationPanel
            notifications={notifications}
            onMarkAllRead={onMarkAllRead}
            onMarkRead={onMarkRead}
            onClose={onToggleNotif}
          />
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          type="button"
          onClick={onToggleProfile}
          className={`flex items-center gap-2 h-9 px-2.5 rounded-[10px] transition-colors ${showProfile ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
        >
          <div className="w-7 h-7 rounded-full bg-[#1a6b3c] flex items-center justify-center shrink-0 ring-2 ring-[#1a6b3c]/20">
            <span className="text-white font-cairo font-bold text-[11px]">أ</span>
          </div>
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="font-cairo font-semibold text-[12px] text-neutral-900">المدير العام</span>
            <span className="font-cairo text-[10px] text-neutral-400">مدير النظام</span>
          </div>
          <ChevronDown
            size={13}
            className={`text-neutral-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`}
          />
        </button>

        {showProfile && (
          <ProfileDropdown onClose={onToggleProfile} />
        )}
      </div>
    </header>
  )
}

export function AppLayout() {
  const [collapsed, setCollapsed]   = useState(false)
  const [showNotif, setShowNotif]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  function toggleNotif() {
    setShowNotif(v => !v)
    setShowProfile(false)
  }
  function toggleProfile() {
    setShowProfile(v => !v)
    setShowNotif(false)
  }
  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }
  function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-100 font-cairo" dir="rtl">
      <Toaster
        position="top-center"
        dir="rtl"
        toastOptions={{
          style: { fontFamily: 'Cairo, sans-serif', fontSize: '13px' },
        }}
      />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          notifications={notifications}
          showNotif={showNotif}
          showProfile={showProfile}
          onToggleNotif={toggleNotif}
          onToggleProfile={toggleProfile}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
