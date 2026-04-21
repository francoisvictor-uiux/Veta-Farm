import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Room } from '../pages/stations/types';

export interface Station {
  id: number;
  name: string;
  rooms: Room[];
}

interface StationsContextValue {
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  updateRoom: (stationId: number, updatedRoom: Room) => void;
}

const StationsContext = createContext<StationsContextValue | null>(null);

export function useStations() {
  const ctx = useContext(StationsContext);
  if (!ctx) throw new Error('useStations must be used within StationsProvider');
  return ctx;
}

function makeRooms(count: number): Room[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, status: 'available' as const }));
}

const INIT_STATIONS: Station[] = [
  {
    id: 1,
    name: 'محطة 1',
    rooms: [
      {
        id: 1, status: 'clinic',
        cattleCount: 8, cattleType: 'fattening',
        batchName: 'دورة تسمين 2026/1',
        customers: ['أحمد محمد', 'خالد الشريف'],
        entryDate: '2026-01-15',
        avgWeight: 320,
        avgFeedingCostPerHead: 45,
        feedings: [
          { id: 'f1', date: '2026-04-20', time: '06:00', feedingNumber: 1, amount: 120 },
          { id: 'f2', date: '2026-04-20', time: '12:30', feedingNumber: 2, amount: 115 },
          { id: 'f3', date: '2026-04-20', time: '18:00', feedingNumber: 3, amount: 110 },
          { id: 'f4', date: '2026-04-19', time: '06:00', feedingNumber: 1, amount: 118 },
          { id: 'f5', date: '2026-04-19', time: '13:00', feedingNumber: 2, amount: 112 },
        ],
        comment: 'دفعة استثمارية ممتازة',
      },
      {
        id: 2, status: 'reserved',
        cattleCount: 5, cattleType: 'dairy',
        batchName: 'دورة حلاب 2026',
        customers: ['محمد عبدالله'],
        entryDate: '2026-02-01',
        avgWeight: 410,
        avgFeedingCostPerHead: 60,
        feedings: [
          { id: 'f10', date: '2026-04-20', time: '07:00', feedingNumber: 1, amount: 80 },
          { id: 'f11', date: '2026-04-20', time: '15:00', feedingNumber: 2, amount: 75 },
        ],
      },
      ...makeRooms(10).map(r => ({ ...r, id: r.id + 2 })),
    ],
  },
  { id: 2, name: 'محطة 2', rooms: makeRooms(12) },
  { id: 3, name: 'محطة 3', rooms: makeRooms(12) },
];

export function StationsProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<Station[]>(INIT_STATIONS);

  const updateRoom = (stationId: number, updatedRoom: Room) => {
    setStations(prev => prev.map(s =>
      s.id === stationId
        ? { ...s, rooms: s.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r) }
        : s
    ));
  };

  return (
    <StationsContext.Provider value={{ stations, setStations, updateRoom }}>
      {children}
    </StationsContext.Provider>
  );
}
