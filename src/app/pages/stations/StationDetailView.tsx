import { useState } from 'react';
import imgWoodenSign from './wooden-sign.png';
import imgBarnInterior from './barn-interior.png';

interface Room {
  id: number;
  status: 'available' | 'occupied' | 'reserved';
  cattleCount?: number;
  customer?: string;
  comment?: string;
}

interface StationDetailViewProps {
  stationId: number;
  stationName: string;
  rooms: Room[];
  onRoomClick: (roomId: number) => void;
  onBack: () => void;
  onEditStation: (stationId: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

const ROOM_POSITIONS = [
  { top: '82.09px', left: '196.64px' },
  { top: '82.09px', left: '305.15px' },
  { top: '82.09px', left: '425.43px' },
  { top: '82.09px', left: '524.39px' },
  { top: '82.09px', left: '658.03px' },
  { top: '82.09px', left: '791.67px' },
  { top: '211.28px', left: '165.78px' },
  { top: '211.28px', left: '305.15px' },
  { top: '211.28px', left: '425.43px' },
  { top: '211.28px', left: '524.39px' },
  { top: '211.28px', left: '658.03px' },
  { top: '211.28px', left: '791.67px' },
];

function getRoomColor(status: string) {
  switch (status) {
    case 'occupied': return '#135e00';
    case 'reserved': return '#d97706';
    default: return '#737373';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'occupied': return 'مشغولة';
    case 'reserved': return 'محجوزة';
    default: return 'قنية';
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case 'occupied': return 'bg-[#135e00]';
    case 'reserved': return 'bg-[#d97706]';
    default: return 'bg-[#e5e5e5]';
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case 'occupied': return 'text-white';
    case 'reserved': return 'text-white';
    default: return 'text-[#737373]';
  }
}

function getCardBorder(status: string) {
  switch (status) {
    case 'occupied': return 'border-[#135e00]';
    case 'reserved': return 'border-[#d97706]';
    default: return 'border-[#e5e5e5]';
  }
}

/* ── Flat room card ── */
function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 p-3 rounded-lg border-2 bg-white hover:shadow-md transition-all cursor-pointer text-right w-full ${getCardBorder(room.status)}`}
      dir="rtl"
    >
      {/* Top row: room number + status badge */}
      <div className="flex items-center justify-between w-full">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getStatusBg(room.status)} ${getStatusTextColor(room.status)}`}>
          {getStatusLabel(room.status)}
        </span>
        <span className="font-extrabold text-[#171717] text-[18px] leading-none">
          {room.id}
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#f0f0f0]" />

      {/* Cattle count */}
      <div className="flex items-center justify-between w-full">
        <span className="font-bold text-[#135e00] text-[16px]">{room.cattleCount ?? 0}</span>
        <span className="text-[#737373] text-[11px]">عدد الرؤوس</span>
      </div>

      {/* Customer */}
      {room.customer && (
        <div className="flex items-center justify-between w-full">
          <span className="font-medium text-[#171717] text-[12px] truncate max-w-[100px]">{room.customer}</span>
          <span className="text-[#737373] text-[11px] shrink-0">العميل</span>
        </div>
      )}

      {/* Comment */}
      {room.comment && (
        <p className="text-[#737373] text-[11px] leading-snug text-right line-clamp-2">
          {room.comment}
        </p>
      )}
    </button>
  );
}

/* ── View toggle icons ── */
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

export function StationDetailView({
  stationId, stationName, rooms,
  onRoomClick, onBack, onEditStation,
  onPrev, onNext, hasPrev = false, hasNext = false,
}: StationDetailViewProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'flat'>('visual');

  return (
    <div className="flex flex-col gap-[24px] items-start p-[24px] w-full">

      {/* Header */}
      <div className="flex items-center justify-between w-full gap-4">
        {/* Right: title + subtitle */}
        <div className="flex flex-col gap-[2px] items-end">
          <p className="font-bold leading-[33px] text-[#171717] text-[22px]" dir="auto">{stationName}</p>
          <p className="font-normal leading-[19.5px] text-[#737373] text-[13px]" dir="auto">
            اضغط على رقم الغرفة لإدارتها
          </p>
        </div>

        {/* Left: view toggle + back + edit */}
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-[#f5f5f5] rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('visual')}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${viewMode === 'visual' ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}
              title="عرض مرئي"
            >
              <VisualIcon active={viewMode === 'visual'} />
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${viewMode === 'flat' ? 'bg-white shadow-sm' : 'hover:bg-white/60'}`}
              title="عرض الغرف"
            >
              <FlatIcon active={viewMode === 'flat'} />
            </button>
          </div>

          <button
            onClick={onBack}
            className="bg-[#135e00] text-white px-6 py-3 rounded-md hover:bg-[#1a7a00] transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>رجوع للمحطات</span>
          </button>
          <button
            onClick={() => onEditStation(stationId)}
            className="bg-[#f5f5f5] text-[#171717] px-4 py-3 rounded-md hover:bg-[#e5e5e5] transition-colors"
          >
            تعديل المحطة
          </button>
        </div>
      </div>

      {/* ── VISUAL VIEW ── */}
      {viewMode === 'visual' && (
        <div className="w-full flex justify-center">
          <div className="flex flex-col gap-[12.728px] items-center">

            {/* Wooden sign + nav arrows */}
            <div className="flex items-center gap-4">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#6e3706] text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#f5f0e8] transition-colors"
                aria-label="المحطة السابقة"
              >
                ‹
              </button>

              <div className="relative w-[310.24px] h-[95.376px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[196.63%] left-[-15.03%] max-w-none top-[-48.31%] w-[129.53%]" src={imgWoodenSign} />
                </div>
                <p
                  className="absolute left-0 right-0 text-center font-extrabold text-[#6e3706] text-[34px] px-8 leading-none"
                  style={{ top: '36%', transform: 'translateY(-50%)' }}
                  dir="auto"
                >
                  {stationName}
                </p>
              </div>

              <button
                onClick={onNext}
                disabled={!hasNext}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#6e3706] text-2xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#f5f0e8] transition-colors"
                aria-label="المحطة التالية"
              >
                ›
              </button>
            </div>

            {/* Barn */}
            <div className="relative w-[1075.5px] h-[350.651px] overflow-hidden">
              <img
                alt=""
                className="absolute h-full top-0 max-w-none"
                style={{ left: '-14.08%', width: '121.18%' }}
                src={imgBarnInterior}
              />
              {rooms.map((room, index) => {
                const pos = ROOM_POSITIONS[index];
                if (!pos) return null;
                return (
                  <button
                    key={room.id}
                    onClick={() => onRoomClick(room.id)}
                    className="absolute bg-[rgba(255,255,255,0.8)] flex items-center justify-center rounded-[7px] size-[30.865px] border-[0.318px] border-[rgba(255,255,255,0.25)] hover:scale-110 transition-transform cursor-pointer"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <span
                      className="font-extrabold text-[20.364px] leading-none"
                      style={{ color: getRoomColor(room.status) }}
                    >
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
          {/* Top row: rooms 1–6, left → right */}
          <div className="grid grid-cols-6 gap-3" dir="ltr">
            {rooms.slice(0, 6).map(room => (
              <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room.id)} />
            ))}
          </div>

          {/* Divider with station name */}
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-[#e5e5e5]" />
            <span className="font-bold text-[#171717] text-[15px] whitespace-nowrap">{stationName}</span>
            <div className="h-px flex-1 bg-[#e5e5e5]" />
          </div>

          {/* Bottom row: rooms 7–12, left → right */}
          <div className="grid grid-cols-6 gap-3" dir="ltr">
            {rooms.slice(6, 12).map(room => (
              <RoomCard key={room.id} room={room} onClick={() => onRoomClick(room.id)} />
            ))}
          </div>

          {/* Summary bar */}
          <div className="mt-6 flex items-center gap-6 p-4 bg-white rounded-lg border border-[#f0f0f0]" dir="rtl">
            <div className="text-center">
              <p className="font-bold text-[#135e00] text-[20px]">
                {rooms.filter(r => r.status === 'occupied').length}
              </p>
              <p className="text-[#737373] text-[11px]">مشغولة</p>
            </div>
            <div className="w-px h-8 bg-[#f0f0f0]" />
            <div className="text-center">
              <p className="font-bold text-[#d97706] text-[20px]">
                {rooms.filter(r => r.status === 'reserved').length}
              </p>
              <p className="text-[#737373] text-[11px]">محجوزة</p>
            </div>
            <div className="w-px h-8 bg-[#f0f0f0]" />
            <div className="text-center">
              <p className="font-bold text-[#262626] text-[20px]">
                {rooms.filter(r => r.status === 'available').length}
              </p>
              <p className="text-[#737373] text-[11px]">قنية</p>
            </div>
            <div className="w-px h-8 bg-[#f0f0f0]" />
            <div className="text-center">
              <p className="font-bold text-[#135e00] text-[20px]">
                {rooms.reduce((s, r) => s + (r.cattleCount ?? 0), 0)}
              </p>
              <p className="text-[#737373] text-[11px]">إجمالي الرؤوس</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
