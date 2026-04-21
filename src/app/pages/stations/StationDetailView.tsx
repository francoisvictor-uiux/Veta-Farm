import { useState } from 'react';
import imgWoodenSign from './wooden-sign.png';
import imgBarnInterior from './barn-interior.png';
import type { Room } from './types';

interface StationDetailViewProps {
  stationId: number;
  stationName: string;
  rooms: Room[];
  onRoomClick: (roomId: number) => void;
  onBack: () => void;
  onEditStation: (stationId: number) => void;
  onAddCattle: (roomId: number | null) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const ROOM_POSITIONS = [
  { top: '102.61px', left: '245.80px' },
  { top: '102.61px', left: '381.44px' },
  { top: '102.61px', left: '531.79px' },
  { top: '102.61px', left: '655.49px' },
  { top: '102.61px', left: '822.54px' },
  { top: '102.61px', left: '989.59px' },
  { top: '264.10px', left: '207.23px' },
  { top: '264.10px', left: '381.44px' },
  { top: '264.10px', left: '531.79px' },
  { top: '264.10px', left: '655.49px' },
  { top: '264.10px', left: '822.54px' },
  { top: '264.10px', left: '989.59px' },
];

function getRoomColor(status: string) {
  switch (status) {
    case 'clinic':   return '#135e00';
    case 'reserved': return '#d97706';
    default:         return '#737373';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'clinic':   return 'عيادة';
    case 'reserved': return 'محجوز';
    default:         return 'فارغ';
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'clinic':   return 'bg-[#135e00]';
    case 'reserved': return 'bg-[#d97706]';
    default:         return 'bg-[#e5e5e5]';
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case 'clinic':
    case 'reserved': return 'text-white';
    default:         return 'text-[#737373]';
  }
}

function getCardBorder(status: string) {
  switch (status) {
    case 'clinic':   return 'border-[#135e00]';
    case 'reserved': return 'border-[#d97706]';
    default:         return 'border-[#e5e5e5]';
  }
}

/* ── Tooltip ── */
interface TooltipState { room: Room; x: number; y: number }

function PenTooltip({ room }: { room: Room }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-[#e5e5e5] p-3 min-w-[200px] max-w-[240px] text-right" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusBg(room.status)} ${getStatusTextColor(room.status)}`}>
          {getStatusLabel(room.status)}
        </span>
        <span className="font-extrabold text-[#171717] text-[14px]">قنية {room.id}</span>
      </div>

      {(room.cattleCount !== undefined || room.batchName) && (
        <>
          <div className="w-full h-px bg-[#f0f0f0] my-2" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#135e00] text-[13px]">{room.cattleCount ?? 0} رأس</span>
            {room.batchName && (
              <span className="text-[#737373] text-[11px] truncate max-w-[120px]">{room.batchName}</span>
            )}
          </div>
        </>
      )}

      {room.customers && room.customers.length > 0 && (
        <>
          <div className="w-full h-px bg-[#f0f0f0] my-2" />
          <p className="text-[#737373] text-[10px] mb-1">العملاء الحاجزين:</p>
          {room.customers.map((c, i) => (
            <p key={i} className="text-[#171717] text-[12px] font-medium">• {c}</p>
          ))}
        </>
      )}

      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-2.5 h-2.5 bg-white border-r border-b border-[#e5e5e5] rotate-45" />
    </div>
  );
}

/* ── Flat room card ── */
interface RoomCardProps {
  room: Room;
  onClick: () => void;
  onAddCattle: () => void;
  onShowTooltip: (room: Room, e: React.MouseEvent<HTMLElement>) => void;
  onHideTooltip: () => void;
}

function RoomCard({ room, onClick, onAddCattle, onShowTooltip, onHideTooltip }: RoomCardProps) {
  return (
    <div className={`flex flex-col gap-2 p-3 rounded-lg border-2 bg-white text-right w-full ${getCardBorder(room.status)}`} dir="rtl">
      <div className="flex items-center justify-between w-full">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusBg(room.status)} ${getStatusTextColor(room.status)}`}>
          {getStatusLabel(room.status)}
        </span>
        <button
          onClick={onClick}
          onMouseEnter={(e) => onShowTooltip(room, e)}
          onMouseLeave={onHideTooltip}
          className="font-extrabold text-[#171717] text-[18px] leading-none hover:text-[#135e00] transition-colors relative"
        >
          {room.id}
        </button>
      </div>

      <div className="w-full h-px bg-[#f0f0f0]" />

      <div className="flex items-center justify-between w-full">
        <span className="font-bold text-[#135e00] text-[16px]">{room.cattleCount ?? 0}</span>
        <span className="text-[#737373] text-[11px]">عدد الرؤوس</span>
      </div>

      {room.cattleType && (
        <div className="flex items-center justify-between w-full">
          <span className="font-medium text-[#171717] text-[12px]">{room.cattleType === 'dairy' ? 'حلاب' : 'تسمين'}</span>
          <span className="text-[#737373] text-[11px] shrink-0">النوع</span>
        </div>
      )}

      {room.customers && room.customers.length > 0 && (
        <div className="flex items-center justify-between w-full">
          <span className="font-medium text-[#171717] text-[12px] truncate max-w-[100px]">{room.customers[0]}{room.customers.length > 1 ? ` +${room.customers.length - 1}` : ''}</span>
          <span className="text-[#737373] text-[11px] shrink-0">العميل</span>
        </div>
      )}

      {room.comment && (
        <p className="text-[#737373] text-[11px] leading-snug text-right line-clamp-2">{room.comment}</p>
      )}

      <div className="w-full h-px bg-[#f0f0f0]" />
      <button
        onClick={onAddCattle}
        className="w-full text-[11px] text-[#135e00] font-medium py-1 rounded hover:bg-[#f0f9ed] transition-colors"
      >
        + إضافة رؤوس
      </button>
    </div>
  );
}

/* ── View icons ── */
function VisualIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill={active ? '#135e00' : '#a3a3a3'} />
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill={active ? '#135e00' : '#a3a3a3'} />
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill={active ? '#135e00' : '#a3a3a3'} />
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill={active ? '#135e00' : '#a3a3a3'} />
    </svg>
  );
}

function FlatIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="2" width="16" height="4" rx="1.5" fill={active ? '#135e00' : '#a3a3a3'} />
      <rect x="1" y="8" width="16" height="4" rx="1.5" fill={active ? '#135e00' : '#a3a3a3'} />
      <rect x="1" y="14" width="16" height="2.5" rx="1.5" fill={active ? '#135e00' : '#a3a3a3'} />
    </svg>
  );
}

function TableIcon({ active }: { active: boolean }) {
  const c = active ? '#135e00' : '#a3a3a3';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="16" height="3.5" rx="1" fill={c} />
      <rect x="1" y="6.5" width="4.5" height="3" rx="0.8" fill={c} />
      <rect x="6.75" y="6.5" width="4.5" height="3" rx="0.8" fill={c} />
      <rect x="12.5" y="6.5" width="4.5" height="3" rx="0.8" fill={c} />
      <rect x="1" y="11.5" width="4.5" height="3" rx="0.8" fill={c} />
      <rect x="6.75" y="11.5" width="4.5" height="3" rx="0.8" fill={c} />
      <rect x="12.5" y="11.5" width="4.5" height="3" rx="0.8" fill={c} />
    </svg>
  );
}

export function StationDetailView({
  stationId, stationName, rooms,
  onRoomClick, onBack, onEditStation, onAddCattle,
  onPrev, onNext, hasPrev = false, hasNext = false,
}: StationDetailViewProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'flat' | 'table'>('visual');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const showTooltip = (room: Room, e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ room, x: rect.left + rect.width / 2, y: rect.top });
  };
  const hideTooltip = () => setTooltip(null);

  return (
    <div className="flex flex-col gap-[24px] items-start p-[24px] w-full">

      {/* Header */}
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex flex-col gap-[2px] items-end">
          <p className="font-bold leading-[33px] text-[#171717] text-[22px] text-right" dir="auto">{stationName}</p>
          <p className="font-normal leading-[19.5px] text-[#737373] text-[13px] text-right" dir="auto">
            اضغط على رقم القنية لإدارتها — مرر الماوس لعرض التفاصيل
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#f5f5f5] rounded-lg p-1 gap-1">
            <button onClick={() => setViewMode('visual')} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${viewMode === 'visual' ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`} title="عرض مرئي">
              <VisualIcon active={viewMode === 'visual'} />
            </button>
            <button onClick={() => setViewMode('flat')} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${viewMode === 'flat' ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`} title="عرض الكروت">
              <FlatIcon active={viewMode === 'flat'} />
            </button>
            <button onClick={() => setViewMode('table')} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`} title="عرض الجدول">
              <TableIcon active={viewMode === 'table'} />
            </button>
          </div>

          <button onClick={() => onAddCattle(null)} className="bg-[#135e00] text-white px-4 py-3 rounded-md hover:bg-[#1a7a00] transition-colors text-[13px]">
            + إضافة رؤوس للمحطة
          </button>
          <button onClick={onBack} className="bg-[#f5f5f5] text-[#171717] px-4 py-3 rounded-md hover:bg-[#e5e5e5] transition-colors flex items-center gap-2 text-[13px]">
            <span>←</span>
            <span>رجوع للمحطات</span>
          </button>
          <button onClick={() => onEditStation(stationId)} className="bg-[#f5f5f5] text-[#171717] px-4 py-3 rounded-md hover:bg-[#e5e5e5] transition-colors text-[13px]">
            تعديل المحطة
          </button>
        </div>
      </div>

      {/* ── VISUAL VIEW ── */}
      {viewMode === 'visual' && (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-[12.728px] items-center">
            <div className="flex items-center gap-4">
              <button onClick={onPrev} disabled={!hasPrev} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#6e3706] text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#f5f0e8] transition-colors" aria-label="المحطة السابقة">‹</button>

              <div className="relative w-[388px] h-[119px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[196.63%] left-[-15.03%] max-w-none top-[-48.31%] w-[129.53%]" src={imgWoodenSign} />
                </div>
                <p className="absolute left-0 right-0 text-center font-extrabold text-[#6e3706] text-[42px] px-8 leading-none" style={{ top: '36%', transform: 'translateY(-50%)' }} dir="auto">
                  {stationName}
                </p>
              </div>

              <button onClick={onNext} disabled={!hasNext} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#6e3706] text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#f5f0e8] transition-colors" aria-label="المحطة التالية">›</button>
            </div>

            <div className="relative w-[1344px] h-[438px] overflow-hidden">
              <img alt="" className="absolute h-full top-0 max-w-none" style={{ left: '-14.08%', width: '121.18%' }} src={imgBarnInterior} />
              {rooms.map((room, index) => {
                const pos = ROOM_POSITIONS[index];
                if (!pos) return null;
                return (
                  <button
                    key={room.id}
                    onClick={() => onRoomClick(room.id)}
                    onMouseEnter={(e) => showTooltip(room, e)}
                    onMouseLeave={hideTooltip}
                    className="absolute bg-[rgba(255,255,255,0.8)] flex items-center justify-center rounded-[9px] size-[39px] border-[0.4px] border-[rgba(255,255,255,0.25)] hover:scale-110 transition-transform cursor-pointer"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <span className="font-extrabold text-[25px] leading-none" style={{ color: getRoomColor(room.status) }}>
                      {room.id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── FLAT VIEW ── */}
      {viewMode === 'flat' && (
        <div className="w-full">
          <div className="grid grid-cols-6 gap-3" dir="ltr">
            {rooms.slice(0, 6).map(room => (
              <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room.id)} onAddCattle={() => onAddCattle(room.id)} onShowTooltip={showTooltip} onHideTooltip={hideTooltip} />
            ))}
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-[#e5e5e5]" />
            <span className="font-bold text-[#171717] text-[15px] whitespace-nowrap">{stationName}</span>
            <div className="h-px flex-1 bg-[#e5e5e5]" />
          </div>

          <div className="grid grid-cols-6 gap-3" dir="ltr">
            {rooms.slice(6, 12).map(room => (
              <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room.id)} onAddCattle={() => onAddCattle(room.id)} onShowTooltip={showTooltip} onHideTooltip={hideTooltip} />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-6 p-4 bg-white rounded-lg border border-[#f0f0f0]" dir="rtl">
            <div className="text-center">
              <p className="font-bold text-[#135e00] text-[20px]">{rooms.filter(r => r.status === 'clinic').length}</p>
              <p className="text-[#737373] text-[11px]">عيادة</p>
            </div>
            <div className="w-px h-8 bg-[#f0f0f0]" />
            <div className="text-center">
              <p className="font-bold text-[#d97706] text-[20px]">{rooms.filter(r => r.status === 'reserved').length}</p>
              <p className="text-[#737373] text-[11px]">محجوزة</p>
            </div>
            <div className="w-px h-8 bg-[#f0f0f0]" />
            <div className="text-center">
              <p className="font-bold text-[#262626] text-[20px]">{rooms.filter(r => r.status === 'available').length}</p>
              <p className="text-[#737373] text-[11px]">فارغة</p>
            </div>
            <div className="w-px h-8 bg-[#f0f0f0]" />
            <div className="text-center">
              <p className="font-bold text-[#135e00] text-[20px]">{rooms.reduce((s, r) => s + (r.cattleCount ?? 0), 0)}</p>
              <p className="text-[#737373] text-[11px]">إجمالي الرؤوس</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="w-full bg-white rounded-lg border border-[#e5e5e5] overflow-hidden">
          <table className="w-full" dir="rtl">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">القنية</th>
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">الحالة</th>
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">الدورة</th>
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">الرؤوس</th>
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">النوع</th>
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">متوسط الوزن</th>
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">تاريخ الدخول</th>
                <th className="text-right px-4 py-3 text-[#737373] text-[12px] font-medium">العملاء</th>
                <th className="px-4 py-3 text-[#737373] text-[12px] font-medium text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={room.id} className={`border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors ${index % 2 !== 0 ? 'bg-[#fafafa]/40' : ''}`}>
                  <td className="px-4 py-3 font-bold text-[#171717] text-[14px]">{room.id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${getStatusBg(room.status)} ${getStatusTextColor(room.status)}`}>
                      {getStatusLabel(room.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#171717] text-[13px]">{room.batchName || '—'}</td>
                  <td className="px-4 py-3 font-bold text-[#135e00] text-[14px]">{room.cattleCount ?? 0}</td>
                  <td className="px-4 py-3 text-[#171717] text-[13px]">
                    {room.cattleType === 'dairy' ? 'حلاب' : room.cattleType === 'fattening' ? 'تسمين' : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#171717] text-[13px]">{room.avgWeight ? `${room.avgWeight} كجم` : '—'}</td>
                  <td className="px-4 py-3 text-[#171717] text-[13px]">{room.entryDate ?? '—'}</td>
                  <td className="px-4 py-3 text-[#171717] text-[13px]">
                    {room.customers && room.customers.length > 0 ? room.customers.join('، ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => onRoomClick(room.id)} className="text-[#135e00] text-[12px] font-medium px-2 py-1 rounded hover:bg-[#f0f9ed] transition-colors">تعديل</button>
                      <button onClick={() => onAddCattle(room.id)} className="text-[#d97706] text-[12px] font-medium px-2 py-1 rounded hover:bg-[#fef3c7] transition-colors">+ رؤوس</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-6 px-5 py-3 bg-[#fafafa] border-t border-[#e5e5e5]" dir="rtl">
            <span className="text-[#737373] text-[12px]">إجمالي:</span>
            <span className="font-bold text-[#135e00] text-[13px]">{rooms.reduce((s, r) => s + (r.cattleCount ?? 0), 0)} رأس</span>
            <span className="text-[#e5e5e5]">|</span>
            <span className="text-[#737373] text-[12px]">
              {rooms.filter(r => r.status === 'clinic').length} عيادة ·{' '}
              {rooms.filter(r => r.status === 'reserved').length} محجوزة ·{' '}
              {rooms.filter(r => r.status === 'available').length} فارغة
            </span>
          </div>
        </div>
      )}

      {/* ── TOOLTIP (fixed, above overflow-hidden containers) ── */}
      {tooltip && (
        <div
          className="fixed z-[500] pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
        >
          <PenTooltip room={tooltip.room} />
        </div>
      )}

    </div>
  );
}
