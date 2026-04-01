import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  X, User, Settings, ShieldCheck, HelpCircle,
  LogOut, Building2, Phone, Mail, ChevronLeft,
} from 'lucide-react'

interface Props {
  onClose: () => void
}

const PROFILE = {
  name: 'أحمد محمد الشريف',
  role: 'مدير النظام',
  company: 'نجم فارم — محطة التسمين',
  phone: '+20 100 123 4567',
  email: 'admin@najmfarm.com',
  avatar: 'أ',
  lastLogin: 'اليوم — 08:42 ص',
}

const MENU_ITEMS = [
  { icon: User,        label: 'الملف الشخصي',    sub: 'بياناتي وكلمة المرور',  path: '/settings/users', color: 'text-neutral-600' },
  { icon: Settings,    label: 'إعدادات النظام',   sub: 'تخصيص واجهة التطبيق',  path: '/settings/rules', color: 'text-neutral-600' },
  { icon: ShieldCheck, label: 'صلاحيات الوصول',  sub: 'إدارة الأدوار والمستخدمين', path: '/settings/rules', color: 'text-neutral-600' },
  { icon: HelpCircle,  label: 'المساعدة والدعم',  sub: 'دليل المستخدم والتواصل',  path: '/',              color: 'text-neutral-600' },
]

export function ProfileDropdown({ onClose }: Props) {
  const ref    = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function go(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[300]" onClick={onClose} />
      <div
        ref={ref}
        dir="rtl"
        className="absolute top-full mt-2 left-0 z-[400] w-[300px] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-[#1a6b3c] to-[#2d9e5f] px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
              <span className="font-cairo font-bold text-[18px] text-white">{PROFILE.avatar}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-cairo font-bold text-[14px] text-white truncate">{PROFILE.name}</p>
              <p className="font-cairo text-[11px] text-white/70">{PROFILE.role}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white/60 hover:text-white transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
          <div className="mt-3.5 pt-3.5 border-t border-white/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <Building2 size={11} className="text-white/50 shrink-0" />
              <span className="font-cairo text-[11px] text-white/70 truncate">{PROFILE.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={11} className="text-white/50 shrink-0" />
              <span className="font-cairo text-[11px] text-white/70 truncate">{PROFILE.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={11} className="text-white/50 shrink-0" />
              <span className="font-cairo text-[11px] text-white/70" dir="ltr">{PROFILE.phone}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/20">
            <p className="font-cairo text-[10px] text-white/50">آخر دخول: {PROFILE.lastLogin}</p>
          </div>
        </div>

        <div className="py-1.5">
          {MENU_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => go(item.path)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 group-hover:bg-neutral-200 flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={14} className={item.color} />
                </div>
                <div className="flex-1 text-right min-w-0">
                  <p className="font-cairo font-semibold text-[12px] text-neutral-700">{item.label}</p>
                  <p className="font-cairo text-[10px] text-neutral-400 truncate">{item.sub}</p>
                </div>
                <ChevronLeft size={13} className="text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
              </button>
            )
          })}
        </div>

        <div className="border-t border-neutral-100 p-2">
          <button
            onClick={() => { navigate('/'); onClose() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
              <LogOut size={14} className="text-red-500" />
            </div>
            <div className="flex-1 text-right">
              <p className="font-cairo font-semibold text-[12px] text-red-600">تسجيل الخروج</p>
              <p className="font-cairo text-[10px] text-red-400">إنهاء الجلسة الحالية</p>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
