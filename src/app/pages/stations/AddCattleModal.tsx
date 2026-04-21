import { useState } from 'react';
import { X, BadgeDollarSign, Scale, Target, Type, ScanLine, CalendarDays, Camera } from 'lucide-react';

export interface CattleFormData {
  batchName: string;
  cattleType: 'dairy' | 'fattening' | '';
  count: number;
  totalWeight: number;
  purchasePrice: number;
  breed: string;
  tag: string;
  vehicleNumber: string;
  supplierName: string;
  supplierInvoice: string;
  entryDate: string;
  weighbridgeCard: string;
  weighbridgePhoto: File | null;
  notes: string;
}

interface AddCattleModalProps {
  stationName: string;
  roomId: number | null;
  onClose: () => void;
  onAdd: (data: CattleFormData) => void;
}

function emptyForm(): CattleFormData {
  return {
    batchName: '', cattleType: '', count: 1, totalWeight: 0, purchasePrice: 0,
    breed: '', tag: '', vehicleNumber: '', supplierName: '', supplierInvoice: '',
    entryDate: new Date().toISOString().split('T')[0],
    weighbridgeCard: '', weighbridgePhoto: null, notes: '',
  };
}

export function AddCattleModal({ stationName, roomId, onClose, onAdd }: AddCattleModalProps) {
  const [form, setForm] = useState<CattleFormData>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inp = 'w-full h-9 px-3 rounded-[10px] border border-neutral-200 bg-white text-[13px] font-cairo text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-500';
  const lbl = 'block text-[11px] font-semibold text-neutral-500 mb-1 uppercase tracking-wide';

  function save() {
    const errs: Record<string, string> = {};
    if (!form.cattleType) errs.cattleType = 'يرجى اختيار نوع الإضافة';
    if (!form.count || form.count < 1) errs.count = 'يرجى إدخال عدد صحيح أكبر من صفر';
    if (!form.totalWeight || form.totalWeight <= 0) errs.totalWeight = 'يرجى إدخال الوزن الإجمالي';
    if (!form.purchasePrice || form.purchasePrice <= 0) errs.purchasePrice = 'يرجى إدخال سعر الشراء';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onAdd(form);
  }

  const avgWeight = form.totalWeight > 0 && form.count > 0
    ? (form.totalWeight / form.count).toFixed(1) + ' كجم'
    : '—';

  const title = roomId === null
    ? `إضافة رؤوس — ${stationName}`
    : `إضافة رؤوس — قنية ${roomId} / ${stationName}`;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 min-h-screen" dir="rtl">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[550px] flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="shrink-0 px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-cairo font-bold text-[18px] text-neutral-900 leading-tight mb-1">إضافة رأس / عدد</h3>
            <p className="font-cairo text-[12px] text-neutral-500">{title}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">

            {/* Batch name */}
            <div>
              <label className={lbl}>اسم الدورة <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
              <input type="text" value={form.batchName} onChange={e => setForm({ ...form, batchName: e.target.value })}
                className={inp} placeholder="مثال: دورة تسمين 2026/1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>نوع الإضافة <span className="text-red-500">*</span></label>
                <select value={form.cattleType} onChange={e => { setForm({ ...form, cattleType: e.target.value as CattleFormData['cattleType'] }); delete errors.cattleType; }}
                  className={`${inp} ${errors.cattleType ? 'border-red-400' : ''}`}>
                  <option value="">-- اختر النوع --</option>
                  <option value="dairy">حلاب</option>
                  <option value="fattening">تسمين</option>
                </select>
                {errors.cattleType && <p className="text-red-500 text-[11px] mt-1">{errors.cattleType}</p>}
              </div>

              <div>
                <label className={lbl}>سعر الشراء للرأس (ج.م) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <BadgeDollarSign size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="number" step="0.1" value={form.purchasePrice || ''} onChange={e => { setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 }); delete errors.purchasePrice; }}
                    className={`${inp} pe-10 ${errors.purchasePrice ? 'border-red-400' : ''}`} placeholder="مثال: 12000" />
                </div>
                {errors.purchasePrice && <p className="text-red-500 text-[11px] mt-1">{errors.purchasePrice}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>عدد الرؤوس <span className="text-red-500">*</span></label>
                <input type="number" min="1" value={form.count || ''} onChange={e => { setForm({ ...form, count: parseInt(e.target.value) || 0 }); delete errors.count; }}
                  className={`${inp} ${errors.count ? 'border-red-400' : ''}`} placeholder="مثال: 10" />
                {errors.count && <p className="text-red-500 text-[11px] mt-1">{errors.count}</p>}
              </div>

              <div>
                <label className={lbl}>الوزن الإجمالي للدفعة (كجم) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Scale size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="number" step="0.5" value={form.totalWeight || ''} onChange={e => { setForm({ ...form, totalWeight: parseFloat(e.target.value) || 0 }); delete errors.totalWeight; }}
                    className={`${inp} pe-10 ${errors.totalWeight ? 'border-red-400' : ''}`} placeholder="مثال: 4500" />
                </div>
                {errors.totalWeight && <p className="text-red-500 text-[11px] mt-1">{errors.totalWeight}</p>}
              </div>
            </div>

            <div>
              <label className={lbl}>متوسط وزن الرأس <span className="text-neutral-400 font-normal lowercase">(تلقائي)</span></label>
              <div className="relative">
                <Target size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                <input type="text" disabled value={avgWeight}
                  className={`${inp} pe-10 bg-neutral-50/50 cursor-not-allowed text-primary-600 font-bold`} />
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>السلالة <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <Type size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })}
                    className={`${inp} pe-10`} placeholder="هولشتاين، سيمنتال..." />
                </div>
              </div>
              <div>
                <label className={lbl}>الوسم <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <ScanLine size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })}
                    className={`${inp} pe-10`} placeholder="رقم الرأس / الباركود" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>التاريخ</label>
                <div className="relative">
                  <CalendarDays size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="date" value={form.entryDate} onChange={e => setForm({ ...form, entryDate: e.target.value })}
                    className={`${inp} pe-10`} dir="ltr" />
                </div>
              </div>
              <div>
                <label className={lbl}>المورد <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <Type size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })}
                    className={`${inp} pe-10`} placeholder="اسم المورد..." />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>رقم فاتورة المورد <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <ScanLine size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.supplierInvoice} onChange={e => setForm({ ...form, supplierInvoice: e.target.value })}
                    className={`${inp} pe-10`} placeholder="INV-XXXX" dir="ltr" />
                </div>
              </div>
              <div>
                <label className={lbl}>كارتة الميزان / رقم السيارة <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <Scale size={14} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="text" value={form.weighbridgeCard} onChange={e => setForm({ ...form, weighbridgeCard: e.target.value })}
                    className={`${inp} pe-10`} placeholder="WB-XXXX / أ ب ج 123" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>صورة المرفق / الميزان <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <div className="relative">
                  <input type="file" id="wb-photo-station" className="hidden" onChange={e => setForm({ ...form, weighbridgePhoto: e.target.files?.[0] || null })} />
                  <label htmlFor="wb-photo-station" className="flex items-center justify-between w-full h-9 px-3 rounded-[10px] border border-neutral-200 bg-neutral-50 cursor-pointer hover:border-primary-400 transition-colors">
                    <span className="font-cairo text-[12px] text-neutral-500 truncate max-w-[85%]">{form.weighbridgePhoto ? form.weighbridgePhoto.name : 'إرفاق صورة أو مستند'}</span>
                    <Camera size={14} className="text-neutral-400 shrink-0" />
                  </label>
                </div>
              </div>
              <div>
                <label className={lbl}>ملاحظات <span className="text-neutral-400 font-normal lowercase">(اختياري)</span></label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className={inp} placeholder="أي ملاحظات إضافية..." />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-3 rounded-b-[20px]">
          <button onClick={onClose} className="px-6 h-10 font-cairo font-semibold text-[13px] text-neutral-600 bg-white border border-neutral-200 rounded-[12px] hover:bg-neutral-50 transition-colors">
            إلغاء
          </button>
          <button onClick={save} className="px-8 h-10 font-cairo font-semibold text-[13px] text-white bg-primary-500 rounded-[12px] hover:bg-primary-600 shadow-sm transition-colors">
            إضافة وحفظ
          </button>
        </div>

      </div>
    </div>
  );
}
