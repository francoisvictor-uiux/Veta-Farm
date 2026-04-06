import type { PaymentMethod } from './purchasing'
export type { PaymentMethod }

export type SaleStatus   = 'awaiting_approval' | 'pending' | 'confirmed' | 'delivered' | 'partial' | 'cancelled'
export type SaleCategory = 'cattle' | 'meat' | 'byproduct' | 'other'

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  awaiting_approval: 'بانتظار الموافقة',
  pending:   'معلق',
  confirmed: 'مؤكد',
  delivered: 'مسلّم',
  partial:   'جزئي',
  cancelled: 'ملغي',
}

export const SALE_CATEGORY_LABELS: Record<SaleCategory, string> = {
  cattle:    'مواشي',
  meat:      'لحوم',
  byproduct: 'منتجات ثانوية',
  other:     'أخرى',
}

export interface SaleItem {
  id: string
  name: string
  category: SaleCategory
  quantity: number
  unit: string
  unitPrice: number
  total: number
  weight?: number
}

export interface SaleOrder {
  id: string
  orderNumber: string
  customerName: string
  date: string
  deliveryDate?: string
  items: SaleItem[]
  totalAmount: number
  collectedAmount: number
  status: SaleStatus
  paymentMethod?: PaymentMethod
  notes?: string
}

export interface SalePayment {
  id: string
  orderId: string
  date: string
  amount: number
  method: PaymentMethod
  notes?: string
}
