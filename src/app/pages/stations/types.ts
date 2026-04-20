export interface Room {
  id: number;
  status: 'available' | 'occupied' | 'reserved';
  cattleCount?: number;
  cattleType?: 'dairy' | 'fattening';
  purchasePrice?: number;
  totalWeight?: number;
  customer?: string;
  comment?: string;
}
