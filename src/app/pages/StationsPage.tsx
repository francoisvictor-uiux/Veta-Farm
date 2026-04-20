import { useState } from 'react';
import { StationCard } from './stations/StationCard';
import { StationDetailView } from './stations/StationDetailView';
import { RoomActionModal } from './stations/RoomActionModal';
import { AddStationModal } from './stations/AddStationModal';
import { EditStationModal } from './stations/EditStationModal';

interface Room {
  id: number;
  status: 'available' | 'occupied' | 'reserved';
  cattleCount?: number;
  customer?: string;
  comment?: string;
}

interface Station {
  id: number;
  name: string;
  rooms: Room[];
}

function makeRooms(count: number): Room[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, status: 'available' as const }));
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([
    { id: 1, name: 'محطة 1', rooms: makeRooms(12) },
    { id: 2, name: 'محطة 2', rooms: makeRooms(12) },
    { id: 3, name: 'محطة 3', rooms: makeRooms(12) },
  ]);

  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [editingStationId, setEditingStationId] = useState<number | null>(null);

  const selectedStation = stations.find(s => s.id === selectedStationId);
  const selectedRoom = selectedStation?.rooms.find(r => r.id === selectedRoomId);
  const editingStation = stations.find(s => s.id === editingStationId);

  const handleRoomUpdate = (updatedRoom: Room) => {
    if (!selectedStationId) return;
    setStations(prev => prev.map(station =>
      station.id === selectedStationId
        ? { ...station, rooms: station.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r) }
        : station
    ));
  };

  const handleAddStation = (name: string, roomCount: number) => {
    const newStation: Station = {
      id: Math.max(...stations.map(s => s.id), 0) + 1,
      name,
      rooms: makeRooms(roomCount),
    };
    setStations(prev => [...prev, newStation]);
  };

  const handleUpdateStation = (stationId: number, newName: string) => {
    setStations(prev => prev.map(s => s.id === stationId ? { ...s, name: newName } : s));
  };

  const handleDeleteStation = (stationId: number) => {
    setStations(prev => prev.filter(s => s.id !== stationId));
    setSelectedStationId(null);
  };

  const getStationStats = (station: Station) => ({
    reserved: station.rooms.filter(r => r.status === 'reserved').length,
    empty: station.rooms.filter(r => r.status === 'available').length,
    totalCattle: station.rooms.reduce((sum, r) => sum + (r.cattleCount || 0), 0),
  });

  if (selectedStation) {
    const currentIndex = stations.findIndex(s => s.id === selectedStationId);
    const prevStation = currentIndex > 0 ? stations[currentIndex - 1] : null;
    const nextStation = currentIndex < stations.length - 1 ? stations[currentIndex + 1] : null;

    return (
      <div className="bg-[#f2f2f0] min-h-screen flex flex-col items-center">
        <div className="w-full max-w-[1503px] px-4">
          <StationDetailView
            stationId={selectedStation.id}
            stationName={selectedStation.name}
            rooms={selectedStation.rooms}
            onRoomClick={(roomId) => setSelectedRoomId(roomId)}
            onBack={() => setSelectedStationId(null)}
            onEditStation={(stationId) => setEditingStationId(stationId)}
            hasPrev={!!prevStation}
            hasNext={!!nextStation}
            onPrev={() => prevStation && setSelectedStationId(prevStation.id)}
            onNext={() => nextStation && setSelectedStationId(nextStation.id)}
          />
        </div>

        {selectedRoom && (
          <RoomActionModal
            room={selectedRoom}
            onClose={() => setSelectedRoomId(null)}
            onUpdate={handleRoomUpdate}
          />
        )}

        {editingStation && (
          <EditStationModal
            station={editingStation}
            onClose={() => setEditingStationId(null)}
            onUpdate={handleUpdateStation}
            onDelete={handleDeleteStation}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#f2f2f0] min-h-screen">
      <div className="content-stretch flex flex-col items-center px-4 py-[24px]">
        <div className="w-full max-w-[1052px] mb-6 flex justify-between items-start">
          {/* Right side (first in RTL): title */}
          <div className="text-right">
            <p className="font-bold leading-[33px] text-[#171717] text-[22px] mb-1" dir="auto">
              اختر المحطة
            </p>
            <p className="font-normal leading-[19.5px] text-[#737373] text-[13px]" dir="auto">
              اضغط على المحطة لعرض الغرف والإجراءات
            </p>
          </div>
          {/* Left side (last in RTL): button */}
          <button
            onClick={() => setShowAddStationModal(true)}
            className="bg-[#135e00] text-white px-6 py-3 rounded-md hover:bg-[#1a7a00] transition-colors"
          >
            + إضافة محطة جديدة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1052px]">
          {stations.map((station) => {
            const stats = getStationStats(station);
            return (
              <StationCard
                key={station.id}
                stationNumber={station.id}
                stationName={station.name}
                reservedCount={stats.reserved}
                emptyCount={stats.empty}
                cattleCount={stats.totalCattle}
                onClick={() => setSelectedStationId(station.id)}
              />
            );
          })}
        </div>
      </div>

      {showAddStationModal && (
        <AddStationModal
          onClose={() => setShowAddStationModal(false)}
          onAdd={handleAddStation}
        />
      )}
    </div>
  );
}
