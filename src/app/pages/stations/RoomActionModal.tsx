import { useState } from 'react';

interface Room {
  id: number;
  status: 'available' | 'occupied' | 'reserved';
  cattleCount?: number;
  customer?: string;
  comment?: string;
}

interface RoomActionModalProps {
  room: Room;
  onClose: () => void;
  onUpdate: (updatedRoom: Room) => void;
}

function getStatusText(status: string) {
  switch (status) {
    case 'occupied': return 'مشغولة';
    case 'reserved': return 'محجوزة';
    default: return 'متاحة';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'occupied': return '#135e00';
    case 'reserved': return '#d97706';
    default: return '#737373';
  }
}

function getStatusBgColor(status: string) {
  switch (status) {
    case 'occupied': return 'rgba(19, 94, 0, 0.1)';
    case 'reserved': return 'rgba(217, 119, 6, 0.1)';
    default: return 'rgba(115, 115, 115, 0.1)';
  }
}

export function RoomActionModal({ room, onClose, onUpdate }: RoomActionModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(room.status);
  const [cattleCount, setCattleCount] = useState(room.cattleCount?.toString() || '');
  const [customer, setCustomer] = useState(room.customer || '');
  const [comment, setComment] = useState(room.comment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...room,
      status,
      cattleCount: cattleCount ? parseInt(cattleCount) : undefined,
      customer: customer || undefined,
      comment: comment || undefined,
    });
    onClose();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStatus(room.status);
    setCattleCount(room.cattleCount?.toString() || '');
    setCustomer(room.customer || '');
    setComment(room.comment || '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className=" text-[#171717] text-[28px]" dir="auto">
              غرفة رقم {room.id}
            </h2>
            <div
              className="inline-block mt-2 px-4 py-2 rounded-md"
              style={{
                backgroundColor: getStatusBgColor(isEditing ? status : room.status),
                color: getStatusColor(isEditing ? status : room.status),
              }}
            >
              <p className=" text-[16px]" dir="auto">
                {getStatusText(isEditing ? status : room.status)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#737373] hover:text-[#171717] text-3xl leading-none">×</button>
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#e5e5e5]">
                <span className=" text-[#737373] text-[14px]" dir="auto">حالة الغرفة</span>
                <span className=" text-[18px]" style={{ color: getStatusColor(room.status) }} dir="auto">
                  {getStatusText(room.status)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#e5e5e5]">
                <span className=" text-[#737373] text-[14px]" dir="auto">عدد الرؤوس</span>
                <span className=" text-[#135e00] text-[18px]">{room.cattleCount || '0'}</span>
              </div>
              {room.customer && (
                <div className="flex justify-between items-center pb-3 border-b border-[#e5e5e5]">
                  <span className=" text-[#737373] text-[14px]" dir="auto">العميل</span>
                  <span className=" text-[#171717] text-[16px]" dir="auto">{room.customer}</span>
                </div>
              )}
              <div className="pt-2">
                <span className=" text-[#737373] text-[14px] block mb-2" dir="auto">ملاحظات</span>
                {room.comment ? (
                  <p className=" text-[#171717] text-[15px] leading-relaxed bg-white p-3 rounded-md" dir="auto">{room.comment}</p>
                ) : (
                  <p className=" text-[#a3a3a3] text-[14px] italic" dir="auto">لا توجد ملاحظات</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-[#135e00] text-white py-3 rounded-md hover:bg-[#1a7a00] transition-colors"
              >
                تعديل البيانات
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#171717] text-[15px] mb-3" dir="auto">حالة الغرفة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Room['status'])}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
                dir="rtl"
              >
                <option value="available">متاحة</option>
                <option value="occupied">مشغولة</option>
                <option value="reserved">محجوزة</option>
              </select>
            </div>
            <div>
              <label className="block text-[#171717] text-[15px] mb-3" dir="auto">عدد الرؤوس</label>
              <input
                type="number"
                min="0"
                value={cattleCount}
                onChange={(e) => setCattleCount(e.target.value)}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
                dir="rtl"
                placeholder="أدخل عدد الرؤوس"
              />
            </div>
            <div>
              <label className="block text-[#171717] text-[15px] mb-3" dir="auto">اسم العميل</label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent"
                dir="rtl"
                placeholder="أدخل اسم العميل"
              />
            </div>
            <div>
              <label className="block text-[#171717] text-[15px] mb-3" dir="auto">ملاحظات</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border-2 border-[#e5e5e5] rounded-lg px-4 py-3 text-[#171717] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#135e00] focus:border-transparent resize-none"
                dir="rtl"
                placeholder="أضف ملاحظاتك هنا..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#135e00] text-white py-3 rounded-md hover:bg-[#1a7a00] transition-colors"
              >
                حفظ التعديلات
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
