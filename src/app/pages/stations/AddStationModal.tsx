import { useState } from 'react';

interface AddStationModalProps {
  onClose: () => void;
  onAdd: (stationName: string, roomCount: number) => void;
}

export function AddStationModal({ onClose, onAdd }: AddStationModalProps) {
  const [stationName, setStationName] = useState('');
  const [roomCount, setRoomCount] = useState('12');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stationName.trim()) {
      onAdd(stationName, parseInt(roomCount));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className=" text-[#171717] text-[24px]" dir="auto">إضافة محطة جديدة</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-[#171717] text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#171717] text-[14px] mb-2" dir="auto">اسم المحطة</label>
            <input
              type="text"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00]"
              dir="rtl"
              placeholder="أدخل اسم المحطة"
              required
            />
          </div>
          <div>
            <label className="block text-[#171717] text-[14px] mb-2" dir="auto">عدد الغرف</label>
            <input
              type="number"
              min="1"
              max="24"
              value={roomCount}
              onChange={(e) => setRoomCount(e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00]"
              dir="rtl"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#135e00] text-white py-3 rounded-md hover:bg-[#1a7a00] transition-colors"
            >
              إضافة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
