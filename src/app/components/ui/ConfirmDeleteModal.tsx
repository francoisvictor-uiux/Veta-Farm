import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Shared Confirm Delete Modal
// يُستخدم في كل عملية حذف في السيستم
// ─────────────────────────────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  /** الاسم أو الوصف للعنصر المراد حذفه — يظهر داخل الرسالة */
  itemName: string
  /** نوع العنصر — يظهر في العنوان مثل: "حذف الموظف" / "حذف المخزن" */
  itemType?: string
  /** دالة تنفّذ الحذف بعد التأكيد */
  onConfirm: () => void
  /** دالة إغلاق المودال بدون حذف */
  onClose: () => void
}

export default function ConfirmDeleteModal({
  itemName,
  itemType = 'العنصر',
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[380px] overflow-hidden">
        {/* Red top bar */}
        <div className="h-1.5 w-full bg-gradient-to-l from-red-400 to-red-600" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 inset-inline-start-4 w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Icon */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <div className="absolute -top-1 -inset-inline-start-1 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border-2 border-white">
                <AlertTriangle size={12} className="text-red-500" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="font-cairo font-bold text-[17px] text-neutral-900">
                حذف {itemType}
              </h3>
              <p className="font-cairo text-[13px] text-neutral-500 leading-relaxed">
                هل أنت متأكد من حذف{' '}
                <span className="font-bold text-neutral-800">"{itemName}"</span>؟
                <br />
                <span className="text-red-500 font-semibold">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-red-500 text-white rounded-[10px] font-cairo font-bold text-[13px] hover:bg-red-600 active:scale-[0.98] transition-all shadow-sm"
            >
              <Trash2 size={14} />
              نعم، احذف
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-neutral-200 text-neutral-600 rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-neutral-50 active:scale-[0.98] transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
