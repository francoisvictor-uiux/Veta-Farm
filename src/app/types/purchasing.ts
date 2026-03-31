export type PurchaseStatus = 'pending' | 'approved' | 'received' | 'partial' | 'cancelled'
export type PaymentMethod  = 'cash' | 'bank' | 'check' | 'transfer'
export type PurchaseCategory = 'feed' | 'medicine' | 'equipment' | 'cattle' | 'other'

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending:   'معلق',
  approved:  'معتمد',
  received:  'مستلم',
  partial:   'جزئي',
  cancelled: 'ملغي',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash:     'نقدي',
  bank:     'بنك',
  check:    'شيك',
  transfer: 'تحويل بنكي',
}

export const PURCHASE_CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  feed:      'أعلاف',
  medicine:  'أدوية بيطرية',
  equipment: 'معدات',
  cattle:    'مواشي',
  other:     'أخرى',
}

export interface PurchaseItem {
  id: string
  name: string
  category: PurchaseCategory
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierName: string
  date: string
  expectedDate?: string
  receivedDate?: string
  items: PurchaseItem[]
  totalAmount: number
  paidAmount: number
  status: PurchaseStatus
  paymentMethod?: PaymentMethod
  invoiceNumber?: string
  notes?: string
}

export interface PurchasePayment {
  id: string
  orderId: string
  date: string
  amount: number
  method: PaymentMethod
  notes?: string
}
