import { useState } from 'react';
import { StationCard } from './stations/StationCard';
import { StationDetailView } from './stations/StationDetailView';
import { RoomActionModal } from './stations/RoomActionModal';
import { AddStationModal } from './stations/AddStationModal';
import { EditStationModal } from './stations/EditStationModal';
import { AddCattleModal, type CattleFormData } from './stations/AddCattleModal';
import { useStations } from '../contexts/StationsContext';
import type { Room } from './stations/types';

function makeRooms(count: number): Room[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, status: 'available' as const }));
}

export default function StationsPage() {
  const { stations, setStations } = useStations();

  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [editingStationId, setEditingStationId] = useState<number | null>(null);
  const [addCattleTarget, setAddCattleTarget] = useState<number | null | undefined>(undefined);

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
    const newStation = {
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

  const handleAddCattle = (roomId: number | null, data: CattleFormData) => {
    if (!selectedStationId) return;
    setStations(prev => prev.map(station => {
      if (station.id !== selectedStationId) return station;
      if (roomId !== null) {
        return {
          ...station,
          rooms: station.rooms.map(r =>
            r.id === roomId
              ? {
                  ...r,
                  status: 'clinic' as const,
                  cattleType: data.cattleType || r.cattleType,
                  cattleCount: (r.cattleCount ?? 0) + (data.count ?? 0),
                  batchName: data.batchName || r.batchName,
                  entryDate: data.entryDate || r.entryDate,
                  avgWeight: data.totalWeight && data.count
                    ? Math.round(data.totalWeight / data.count)
                    : r.avgWeight,
                  purchasePrice: data.purchasePrice ?? r.purchasePrice,
                  comment: data.notes || r.comment,
                }
              : r
          ),
        };
      } else {
        const roomCount = station.rooms.length;
        const perRoom = Math.ceil((data.count ?? 0) / roomCount);
        let remaining = data.count ?? 0;
        return {
          ...station,
          rooms: station.rooms.map(r => {
            if (remaining <= 0) return r;
            const count = Math.min(perRoom, remaining);
            remaining -= count;
            return {
              ...r,
              status: 'clinic' as const,
              cattleType: data.cattleType || r.cattleType,
              cattleCount: (r.cattleCount ?? 0) + count,
              batchName: data.batchName || r.batchName,
              entryDate: data.entryDate || r.entryDate,
              avgWeight: data.totalWeight && data.count
                ? Math.round(data.totalWeight / data.count)
                : r.avgWeight,
              purchasePrice: data.purchasePrice ?? r.purchasePrice,
              comment: data.notes || r.comment,
            };
          }),
        };
      }
    }));
    setAddCattleTarget(undefined);
  };

  const getStationStats = (station: typeof stations[0]) => ({
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
            onAddCattle={(roomId) => setAddCattleTarget(roomId)}
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

        {addCattleTarget !== undefined && (
          <AddCattleModal
            stationName={selectedStation.name}
            roomId={addCattleTarget}
            onClose={() => setAddCattleTarget(undefined)}
            onAdd={(data) => handleAddCattle(addCattleTarget, data)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#f2f2f0] min-h-screen">
      <div className="content-stretch flex flex-col items-center px-4 py-[24px]">
        <div className="w-full max-w-[1052px] mb-6 flex justify-between items-start">
          <div className="text-right">
            <p className="font-bold leading-[33px] text-[#171717] text-[22px] mb-1" dir="auto">اختر المحطة</p>
            <p className="font-normal leading-[19.5px] text-[#737373] text-[13px]" dir="auto">اضغط على المحطة لعرض القنايا والإجراءات</p>
          </div>
          <button onClick={() => setShowAddStationModal(true)} className="bg-[#135e00] text-white px-6 py-3 rounded-md hover:bg-[#1a7a00] transition-colors">
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
