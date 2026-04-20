import { useState } from 'react';

interface Station {
  id: number;
  name: string;
}

interface EditStationModalProps {
  station: Station;
  onClose: () => void;
  onUpdate: (stationId: number, newName: string) => void;
  onDelete: (stationId: number) => void;
}

export function EditStationModal({ station, onClose, onUpdate, onDelete }: EditStationModalProps) {
  const [stationName, setStationName] = useState(station.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stationName.trim()) {
      onUpdate(station.id, stationName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className=" text-[#171717] text-[24px]" dir="auto">تعديل المحطة</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-[#171717] text-2xl leading-none">×</button>
        </div>

        {!showDeleteConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#171717] text-[14px] mb-2" dir="auto">اسم المحطة</label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00]"
                dir="rtl"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#135e00] text-white py-3 rounded-md hover:bg-[#1a7a00] transition-colors"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors"
              >
                إلغاء
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-50 text-red-600 py-3 rounded-md hover:bg-red-100 transition-colors mt-2"
            >
              حذف المحطة
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <p className=" text-[#171717] text-center" dir="auto">
              هل أنت متأكد من حذف المحطة "{station.name}"؟
              <br />
              سيتم حذف جميع الغرف والبيانات المرتبطة بها.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { onDelete(station.id); onClose(); }}
                className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
