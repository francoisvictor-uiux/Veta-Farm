import { useState } from 'react';
import type { Room } from './types';

const TODAY = '2026-04-20';

interface RoomActionModalProps {
  room: Room;
  onClose: () => void;
  onUpdate: (updatedRoom: Room) => void;
}

function getStatusText(status: string) {
  switch (status) {
    case 'clinic':   return 'عيادة';
    case 'reserved': return 'محجوز';
    default:         return 'فارغ';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'clinic':   return '#135e00';
    case 'reserved': return '#d97706';
    default:         return '#737373';
  }
}

function getStatusBgColor(status: string) {
  switch (status) {
    case 'clinic':   return 'rgba(19, 94, 0, 0.1)';
    case 'reserved': return 'rgba(217, 119, 6, 0.1)';
    default:         return 'rgba(115, 115, 115, 0.1)';
  }
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'م' : 'ص';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

const ORDINALS = ['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة'];
function feedingOrdinal(n: number) { return ORDINALS[n] ?? `#${n}`; }

function daysSince(dateStr: string) {
  return Math.floor((new Date(TODAY).getTime() - new Date(dateStr).getTime()) / 86400000);
}

function AnalyticsSection({ room }: { room: Room }) {
  const feedings = room.feedings ?? [];
  const todayFeedings = feedings.filter(f => f.date === TODAY);
  const lastToday = todayFeedings.length > 0
    ? todayFeedings.reduce((max, f) => f.feedingNumber > max.feedingNumber ? f : max, todayFeedings[0])
    : null;
  const totalAmount = feedings.reduce((s, f) => s + f.amount, 0);
  const daysIn = room.entryDate ? daysSince(room.entryDate) : null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-px flex-1 bg-[#e5e5e5]" />
        <span className="text-[#737373] text-[12px] font-medium whitespace-nowrap">التحليلات والإحصائيات</span>
        <div className="h-px flex-1 bg-[#e5e5e5]" />
      </div>

      <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg divide-y divide-[#f0f0f0]" dir="rtl">
        {/* 4 - Last feeding today */}
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-[#737373] text-[12px] shrink-0">آخر تغذية اليوم</span>
          {lastToday
            ? <span className="font-medium text-[#171717] text-[13px]">{formatTime(lastToday.time)} · التغذية {feedingOrdinal(lastToday.feedingNumber)}</span>
            : <span className="text-[#a3a3a3] text-[13px]">—</span>
          }
        </div>

        {/* 5 - Entry date */}
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-[#737373] text-[12px] shrink-0">تاريخ الدخول</span>
          {daysIn !== null
            ? <span className="font-medium text-[#171717] text-[13px]">{room.entryDate} · منذ {daysIn} يوماً</span>
            : <span className="text-[#a3a3a3] text-[13px]">—</span>
          }
        </div>

        {/* 6 - Total feedings */}
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-[#737373] text-[12px] shrink-0">إجمالي التغذيات</span>
          {feedings.length > 0
            ? <span className="font-medium text-[#171717] text-[13px]">{feedings.length} وجبة · {totalAmount.toLocaleString('ar-EG')} كجم إجمالي</span>
            : <span className="text-[#a3a3a3] text-[13px]">—</span>
          }
        </div>

        {/* 7 - Avg weight & feeding cost per head */}
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-[#737373] text-[12px] shrink-0">متوسط الوزن / التغذية</span>
          {(room.avgWeight || room.avgFeedingCostPerHead)
            ? (
              <div className="flex items-center gap-3">
                {room.avgWeight && <span className="font-bold text-[#135e00] text-[13px]">{room.avgWeight} كجم/رأس</span>}
                {room.avgWeight && room.avgFeedingCostPerHead && <span className="text-[#d4d4d4]">·</span>}
                {room.avgFeedingCostPerHead && <span className="font-medium text-[#171717] text-[13px]">{room.avgFeedingCostPerHead} كجم/رأس/يوم</span>}
              </div>
            )
            : <span className="text-[#a3a3a3] text-[13px]">—</span>
          }
        </div>
      </div>
    </div>
  );
}

export function RoomActionModal({ room, onClose, onUpdate }: RoomActionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus]               = useState(room.status);
  const [cattleCount, setCattleCount]     = useState(room.cattleCount?.toString() || '');
  const [cattleType, setCattleType]       = useState<'dairy' | 'fattening'>(room.cattleType ?? 'fattening');
  const [batchName, setBatchName]         = useState(room.batchName || '');
  const [customersText, setCustomersText] = useState((room.customers ?? []).join('، '));
  const [entryDate, setEntryDate]         = useState(room.entryDate || '');
  const [avgWeight, setAvgWeight]         = useState(room.avgWeight?.toString() || '');
  const [comment, setComment]             = useState(room.comment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customers = customersText
      ? customersText.split(/[،,]/).map(s => s.trim()).filter(Boolean)
      : undefined;
    onUpdate({
      ...room,
      status,
      cattleCount: cattleCount ? parseInt(cattleCount) : undefined,
      cattleType,
      batchName: batchName || undefined,
      customers,
      entryDate: entryDate || undefined,
      avgWeight: avgWeight ? parseFloat(avgWeight) : undefined,
      comment: comment || undefined,
    });
    onClose();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStatus(room.status);
    setCattleCount(room.cattleCount?.toString() || '');
    setCattleType(room.cattleType ?? 'fattening');
    setBatchName(room.batchName || '');
    setCustomersText((room.customers ?? []).join('، '));
    setEntryDate(room.entryDate || '');
    setAvgWeight(room.avgWeight?.toString() || '');
    setComment(room.comment || '');
  };

  const currentStatus = isEditing ? status : room.status;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-[#171717] text-[28px]" dir="auto">قنية رقم {room.id}</h2>
            {room.batchName && !isEditing && (
              <p className="text-[#737373] text-[13px] mt-1" dir="auto">{room.batchName}</p>
            )}
            <div
              className="inline-block mt-2 px-4 py-2 rounded-md"
              style={{ backgroundColor: getStatusBgColor(currentStatus), color: getStatusColor(currentStatus) }}
            >
              <p className="text-[16px]" dir="auto">{getStatusText(currentStatus)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#737373] hover:text-[#171717] text-3xl leading-none">×</button>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-[#e5e5e5]">
                <span className="text-[#737373] text-[13px]" dir="auto">الحالة</span>
                <span className="text-[15px] font-medium" style={{ color: getStatusColor(room.status) }}>{getStatusText(room.status)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#e5e5e5]">
                <span className="text-[#737373] text-[13px]" dir="auto">عدد الرؤوس</span>
                <span className="text-[#135e00] text-[18px] font-bold">{room.cattleCount || '0'}</span>
              </div>
              {room.cattleType && (
                <div className="flex justify-between items-center pb-3 border-b border-[#e5e5e5]">
                  <span className="text-[#737373] text-[13px]" dir="auto">النوع</span>
                  <span className="text-[#171717] text-[14px]">{room.cattleType === 'dairy' ? 'حلاب' : 'تسمين'}</span>
                </div>
              )}
              {room.customers && room.customers.length > 0 && (
                <div className="flex justify-between items-start pb-3 border-b border-[#e5e5e5]">
                  <div className="text-right">
                    {room.customers.map((c, i) => (
                      <p key={i} className="text-[#171717] text-[14px]">{c}</p>
                    ))}
                  </div>
                  <span className="text-[#737373] text-[13px] shrink-0 ml-4" dir="auto">العملاء</span>
                </div>
              )}
              <div className="pt-1">
                <span className="text-[#737373] text-[13px] block mb-1" dir="auto">ملاحظات</span>
                {room.comment
                  ? <p className="text-[#171717] text-[14px] leading-relaxed bg-white p-3 rounded-md" dir="auto">{room.comment}</p>
                  : <p className="text-[#a3a3a3] text-[13px] italic" dir="auto">لا توجد ملاحظات</p>
                }
              </div>
            </div>

            <AnalyticsSection room={room} />

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsEditing(true)} className="flex-1 bg-[#135e00] text-white py-3 rounded-md hover:bg-[#1a7a00] transition-colors">
                تعديل البيانات
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors">
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            {/* Status */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">حالة القنية</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Room['status'])}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
              >
                <option value="available">فارغ</option>
                <option value="reserved">محجوز</option>
                <option value="clinic">عيادة</option>
              </select>
            </div>

            {/* Cattle type */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">نوع الماشية</label>
              <div className="flex gap-3">
                {(['fattening', 'dairy'] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setCattleType(t)}
                    className={`flex-1 py-2.5 rounded-lg border-2 text-[14px] transition-colors ${cattleType === t ? 'border-[#135e00] bg-[#f0f9ed] text-[#135e00] font-bold' : 'border-[#e5e5e5] text-[#737373] hover:border-[#135e00]'}`}>
                    {t === 'fattening' ? 'تسمين' : 'حلاب'}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">عدد الرؤوس</label>
              <input type="number" min="0" value={cattleCount} onChange={(e) => setCattleCount(e.target.value)}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
                placeholder="أدخل عدد الرؤوس" />
            </div>

            {/* Batch name */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">اسم الدورة</label>
              <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
                placeholder="مثال: دورة تسمين 2026/1" />
            </div>

            {/* Customers */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">العملاء الحاجزين <span className="text-[#a3a3a3] text-[12px]">(افصل بفاصلة)</span></label>
              <input type="text" value={customersText} onChange={(e) => setCustomersText(e.target.value)}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
                placeholder="مثال: أحمد، محمد، خالد" />
            </div>

            {/* Entry date */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">تاريخ الدخول</label>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent" />
            </div>

            {/* Avg weight */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">متوسط وزن الرأس (كجم)</label>
              <input type="number" min="0" value={avgWeight} onChange={(e) => setAvgWeight(e.target.value)}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
                placeholder="أدخل متوسط الوزن" />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[#171717] text-[14px] mb-2">ملاحظات</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent resize-none"
                placeholder="أضف ملاحظاتك هنا..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-[#135e00] text-white py-3 rounded-md hover:bg-[#1a7a00] transition-colors">حفظ التعديلات</button>
              <button type="button" onClick={handleCancel} className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors">إلغاء</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
