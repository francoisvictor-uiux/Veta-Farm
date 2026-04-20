import { useState } from 'react';

export interface CattleFormData {
  cattleType: 'dairy' | 'fattening';
  cattleCount: number;
  purchasePrice?: number;
  totalWeight?: number;
  customer?: string;
  comment?: string;
}

interface AddCattleModalProps {
  title: string;
  onClose: () => void;
  onAdd: (data: CattleFormData) => void;
}

export function AddCattleModal({ title, onClose, onAdd }: AddCattleModalProps) {
  const [cattleType, setCattleType] = useState<'dairy' | 'fattening'>('fattening');
  const [cattleCount, setCattleCount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [customer, setCustomer] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cattleCount || parseInt(cattleCount) < 1) return;
    onAdd({
      cattleType,
      cattleCount: parseInt(cattleCount),
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      totalWeight: totalWeight ? parseFloat(totalWeight) : undefined,
      customer: customer || undefined,
      comment: comment || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#171717] text-[24px]" dir="auto">{title}</h2>
          <button onClick={onClose} className="text-[#737373] hover:text-[#171717] text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          <div>
            <label className="block text-[#171717] text-[14px] mb-2">نوع الماشية</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCattleType('fattening')}
                className={`flex-1 py-2 rounded-md border-2 text-[14px] transition-colors ${cattleType === 'fattening' ? 'border-[#135e00] bg-[#f0f9ed] text-[#135e00] font-bold' : 'border-[#e5e5e5] text-[#737373] hover:border-[#135e00]'}`}
              >
                تسمين
              </button>
              <button
                type="button"
                onClick={() => setCattleType('dairy')}
                className={`flex-1 py-2 rounded-md border-2 text-[14px] transition-colors ${cattleType === 'dairy' ? 'border-[#135e00] bg-[#f0f9ed] text-[#135e00] font-bold' : 'border-[#e5e5e5] text-[#737373] hover:border-[#135e00]'}`}
              >
                حلاب
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#171717] text-[14px] mb-2">عدد الرؤوس</label>
            <input
              type="number" min="1" value={cattleCount}
              onChange={(e) => setCattleCount(e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00]"
              placeholder="أدخل عدد الرؤوس" required
            />
          </div>

          <div>
            <label className="block text-[#171717] text-[14px] mb-2">سعر الشراء</label>
            <input
              type="number" min="0" value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00]"
              placeholder="أدخل سعر الشراء"
            />
          </div>

          <div>
            <label className="block text-[#171717] text-[14px] mb-2">الوزن الإجمالي (كجم)</label>
            <input
              type="number" min="0" value={totalWeight}
              onChange={(e) => setTotalWeight(e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00]"
              placeholder="أدخل الوزن الإجمالي"
            />
          </div>

          <div>
            <label className="block text-[#171717] text-[14px] mb-2">اسم العميل</label>
            <input
              type="text" value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00]"
              placeholder="أدخل اسم العميل"
            />
          </div>

          <div>
            <label className="block text-[#171717] text-[14px] mb-2">ملاحظات</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-[#e5e5e5] rounded-md px-4 py-2 text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#135e00] resize-none"
              placeholder="أضف ملاحظاتك هنا..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-[#135e00] text-white py-3 rounded-md hover:bg-[#1a7a00] transition-colors">
              إضافة
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-[#f5f5f5] text-[#171717] py-3 rounded-md hover:bg-[#e5e5e5] transition-colors">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
