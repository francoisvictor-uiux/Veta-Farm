import { useEffect, useRef } from 'react'
import {
  X, Bell, CheckCircle2, AlertCircle, Info,
  ShoppingCart, Wallet, Users, ArrowUpRight,
} from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  body: string
  time: string
  read: boolean
  category: 'finance' | 'purchase' | 'hr' | 'system'
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'warning', category: 'finance',
    title: 'فاتورة مستحقة السداد',
    body: 'أمر الشراء PO-2026-002 متأخر — المبلغ المتبقي 4,700 ج.م',
    time: 'منذ ساعة', read: false,
  },
  {
    id: 'n2', type: 'success', category: 'purchase',
    title: 'تم استلام الطلب',
    body: 'تم استلام PO-2026-004 بنجاح — 20 رأس هولشتاين',
    time: 'منذ 3 ساعات', read: false,
  },
  {
    id: 'n3', type: 'info', category: 'hr',
    title: 'غياب موظف',
    body: 'لم يسجّل عمر السيد حضوره اليوم',
    time: 'منذ 4 ساعات', read: false,
  },
  {
    id: 'n4', type: 'warning', category: 'finance',
    title: 'رصيد صندوق منخفض',
    body: 'رصيد صندوق المزرعة الرئيسي أقل من 70,000 ج.م',
    time: 'أمس', read: true,
  },
  {
    id: 'n5', type: 'success', category: 'finance',
    title: 'تحصيل مبيعات',
    body: 'تم تحصيل SO-2026-003 كاملاً — 160,000 ج.م',
    time: 'أمس', read: true,
  },
  {
    id: 'n6', type: 'info', category: 'hr',
    title: 'موعد صرف الرواتب',
    body: 'موعد صرف رواتب أبريل 2026 بعد 5 أيام',
    time: 'منذ يومين', read: true,
  },
]

const TYPE_CFG = {
  success: { icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
  warning: { icon: AlertCircle,  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
  info:    { icon: Info,         color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100'  },
  error:   { icon: AlertCircle,  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100'   },
}

const CAT_ICON = {
  finance:  Wallet,
  purchase: ShoppingCart,
  hr:       Users,
  system:   Bell,
}

interface Props {
  notifications: Notification[]
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
  onClose: () => void
}

export function NotificationPanel({ notifications, onMarkAllRead, onMarkRead, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-[300]" onClick={onClose} />
      <div
        ref={ref}
        dir="rtl"
        className="absolute top-full mt-2 left-0 z-[400] w-[380px] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 80px)' }}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-neutral-500" />
            <span className="font-cairo font-bold text-[14px] text-neutral-800">الإشعارات</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white font-cairo font-bold text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-cairo text-[11px] font-semibold text-[#1a6b3c] hover:bg-[#e8f5ee] transition-colors"
              >
                <CheckCircle2 size={12} />
                قراءة الكل
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Bell size={20} className="text-neutral-300" />
              </div>
              <p className="font-cairo text-[13px] text-neutral-400">لا توجد إشعارات</p>
            </div>
          ) : (
            <div>
              {notifications.filter(n => !n.read).length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-neutral-50/80 border-b border-neutral-100">
                    <span className="font-cairo text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">غير مقروءة</span>
                  </div>
                  {notifications.filter(n => !n.read).map(n => (
                    <NotificationItem key={n.id} n={n} onMarkRead={onMarkRead} />
                  ))}
                </div>
              )}
              {notifications.filter(n => n.read).length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-neutral-50/80 border-b border-neutral-100">
                    <span className="font-cairo text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">سابقة</span>
                  </div>
                  {notifications.filter(n => n.read).map(n => (
                    <NotificationItem key={n.id} n={n} onMarkRead={onMarkRead} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-neutral-100 px-4 py-3 bg-neutral-50/50">
          <button className="w-full flex items-center justify-center gap-1.5 font-cairo text-[12px] font-semibold text-[#1a6b3c] hover:text-[#145730] transition-colors">
            عرض كل الإشعارات
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </>
  )
}

function NotificationItem({ n, onMarkRead }: { n: Notification; onMarkRead: (id: string) => void }) {
  const cfg = TYPE_CFG[n.type]
  const TypeIcon = cfg.icon
  const CatIcon  = CAT_ICON[n.category]

  return (
    <button
      onClick={() => onMarkRead(n.id)}
      className={`w-full text-right flex items-start gap-3 px-4 py-3.5 border-b border-neutral-50 transition-colors hover:bg-neutral-50 ${!n.read ? 'bg-blue-50/30' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0 mt-0.5`}>
        <TypeIcon size={15} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className={`font-cairo font-semibold text-[12px] ${n.read ? 'text-neutral-600' : 'text-neutral-900'} leading-tight`}>
            {n.title}
          </p>
          {!n.read && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
          )}
        </div>
        <p className="font-cairo text-[11px] text-neutral-500 leading-relaxed line-clamp-2">{n.body}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <CatIcon size={10} className="text-neutral-300" />
          <span className="font-cairo text-[10px] text-neutral-400">{n.time}</span>
        </div>
      </div>
    </button>
  )
}
