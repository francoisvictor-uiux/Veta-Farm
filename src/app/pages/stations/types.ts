export interface Feeding {
  id: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  feedingNumber: number;
  amount: number; // kg
}

export interface Room {
  id: number;
  status: 'available' | 'reserved' | 'clinic';
  cattleCount?: number;
  cattleType?: 'dairy' | 'fattening';
  batchName?: string;
  customers?: string[];
  entryDate?: string;
  feedings?: Feeding[];
  avgWeight?: number;
  avgFeedingCostPerHead?: number;
  purchasePrice?: number;
  totalWeight?: number;
  comment?: string;
}
