import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard, Layers, Package, ShoppingCart, Tag,
  BookOpen, Landmark, Truck, Users, UserCheck, CalendarDays,
  Wallet, ShieldCheck, UserCog,
  ChevronDown, ChevronUp, LogOut, PanelRightClose,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ElementType
  path: string
  badge?: number
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'الرئيسية', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    label: 'إدارة المزرعة',
    items: [
      { label: 'الرؤوس والدورات', icon: Layers,       path: '/cattle'     },
      { label: 'المخزون',          icon: Package,      path: '/inventory'  },
      { label: 'المشتريات',        icon: ShoppingCart, path: '/purchasing' },
      { label: 'المبيعات',         icon: Tag,          path: '/sales'      },
    ],
  },
  {
    label: 'الحسابات والمالية',
    items: [
      { label: 'الحسابات العامة', icon: BookOpen, path: '/accounts' },
      { label: 'الخزينة والبنوك', icon: Landmark, path: '/cashier'  },
    ],
  },
  {
    label: 'الأطراف',
    items: [
      { label: 'الموردين', icon: Truck, path: '/suppliers' },
      { label: 'العملاء',  icon: Users, path: '/customers' },
    ],
  },
  {
    label: 'الموارد البشرية',
    items: [
      { label: 'الموظفين',         icon: UserCheck,    path: '/employees'  },
      { label: 'الحضور والانصراف', icon: CalendarDays, path: '/attendance' },
      { label: 'الرواتب',          icon: Wallet,       path: '/payroll'    },
    ],
  },
  {
    label: 'الإعدادات',
    items: [
      { label: 'المستخدمين',      icon: UserCog,     path: '/settings/users' },
      { label: 'صلاحيات الوصول',  icon: ShieldCheck, path: '/settings/rules' },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function LogoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
      <g transform="translate(9,5)">
        <path d="M11 30 L11 14" stroke="#d7fa78" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M11 14 C11 8 19 4 21 2 C21 2 21 10 15 14 C13.5 15 11 14 11 14Z" fill="#d7fa78" />
        <path d="M11 19 C11 13 3 9 1 7 C1 7 1 15 7 19 C8.5 20 11 19 11 19Z" fill="#d7fa78" opacity="0.7" />
        <path d="M11 24 C13 20 19 18 21 16 C21 16 19 22 14 25 C12.5 26 11 24 11 24Z" fill="#d7fa78" opacity="0.5" />
      </g>
    </svg>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate  = useNavigate()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(
      NAV_GROUPS.filter(g => g.label).map(g => [g.label!, true])
    )
  )

  function toggleGroup(label: string) {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={[
        'h-full flex flex-col shrink-0 bg-neutral-50 border-s border-neutral-200',
        'transition-[width] duration-250',
        collapsed ? 'w-[64px]' : 'w-[256px]',
      ].join(' ')}
      dir="rtl"
    >
      {/* ── Logo / Brand ── */}
      {collapsed ? (
        <div className="h-[64px] flex items-center justify-center border-b border-neutral-200 shrink-0">
          <button
            type="button"
            onClick={onToggle}
            title="توسيع القائمة"
            className="w-9 h-9 rounded-[10px] bg-[#1a6b3c] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <LogoIcon />
          </button>
        </div>
      ) : (
        <div className="h-[64px] flex items-center justify-between px-3 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-[8px] bg-[#1a6b3c] flex items-center justify-center shrink-0">
              <LogoIcon />
            </div>
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-neutral-900 font-bold text-[15px] whitespace-nowrap font-cairo">
                نجم فارم
              </span>
              <span className="text-neutral-500 text-[10px] whitespace-nowrap font-cairo">
                نظام إدارة محطات التسمين
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            title="طي القائمة"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-[7px] text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-all duration-150"
          >
            <PanelRightClose size={15} />
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
            {group.label && !collapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(group.label!)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-[7px] text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest font-cairo">
                  {group.label}
                </span>
                {openGroups[group.label] ? (
                  <ChevronUp size={10} />
                ) : (
                  <ChevronDown size={10} />
                )}
              </button>
            )}

            {group.label && collapsed && gi > 0 && (
              <div className="mx-2 my-1.5 h-px bg-neutral-200" />
            )}

            {(group.label ? openGroups[group.label] !== false || collapsed : true) && (
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.path)
                  const Icon   = item.icon
                  return (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() => navigate(item.path)}
                        title={item.label}
                        className={[
                          'w-full flex items-center gap-2.5 rounded-[8px] transition-all duration-150 py-2',
                          collapsed ? 'justify-center px-1.5' : 'px-2.5',
                          active
                            ? 'bg-[#1a6b3c] text-white shadow-sm'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
                        ].join(' ')}
                      >
                        <Icon size={16} className="shrink-0" />
                        {!collapsed && (
                          <span className="text-[13px] font-semibold text-start flex-1 truncate font-cairo">
                            {item.label}
                          </span>
                        )}
                        {!collapsed && item.badge && item.badge > 0 && (
                          <span className="ms-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* ── Bottom: Logout ── */}
      <div className="border-t border-neutral-200 p-2 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/login')}
          title="تسجيل الخروج"
          className={[
            'w-full flex items-center gap-2.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-[8px] py-2',
            collapsed ? 'justify-center px-1.5' : 'px-2.5',
          ].join(' ')}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && (
            <span className="text-[13px] font-semibold font-cairo">تسجيل الخروج</span>
          )}
        </button>
      </div>
    </aside>
  )
}
