import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  inventoryTransactionsApi,
  warehousesApi,
  itemsApi,
  itemCategoriesApi,
  type CreateInventoryTransactionRequest,
  type ItemListItem,
  type WarehouseItem as ApiWarehouseItem,
} from '../services/api'
import { toast } from 'sonner'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import {
  Package2, LayoutGrid, Layers, ArrowDownToLine, ArrowUpFromLine,
  BarChart3, Plus, Search, X, Edit2, Eye, Trash2, Check,
  ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, XCircle,
  Clock, Scale, MapPin, Users, Truck, FileText, Calendar,
  Building2, TrendingDown, Leaf, Pill, Wrench, Fuel,
  Filter, ClipboardList, AlertCircle, RefreshCw, Star,
  Tag, Archive, Warehouse, Hash, ChevronDown, Package,
  ShoppingCart, Utensils, Boxes, MoreHorizontal,
  FolderTree, FolderOpen, Folder, FolderPlus, GitBranch,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ItemCategory = 'feed' | 'medicine' | 'spare_part' | 'oil_diesel'
type TransactionStatus = 'done' | 'draft' | 'pending'
type ReceiptType = 'opening_balance' | 'from_supplier' | 'return'
type IssueType = 'internal' | 'sales' | 'feeding'

interface Item {
  id: string; code: string; name: string; nameAlt: string
  category: ItemCategory; uom: string; barcode: string
  minStock: number; maxStock: number; reorderQty: number
  avgDeliveryDays: number; currentStock: number; dailyUsage: number
}

interface WhLocation { id: string; name: string }
interface WhItem {
  id: string; code: string; name: string; type: string
  responsibleUsers: string[]; status: 'active' | 'inactive'
  locations: WhLocation[]; notes: string
}

interface CatNode {
  id: string; name: string; parentId: string | null; color: string
}

interface MixerIngredient {
  id: string; itemName: string; qty: number; weight: number
  uom: string; notes: string; status: 'active' | 'inactive'
}
interface Mixer {
  id: string; code: string; name: string; type: string
  status: 'active' | 'inactive'; notes: string
  ingredients: MixerIngredient[]
}

interface TxItem { id: string; itemName: string; qty: number; weight: number; price: number; location: string }
interface ReceiptTx {
  id: string; serial: string; type: ReceiptType; date: string
  warehouseName: string; supplierName: string; supplierInvoice: string
  invoiceValue: number
  itemName: string; qty: number; price: number
  weighbridgeCard: string; photoUrl: string
  items: TxItem[]; totalValue: number; status: TransactionStatus; notes: string
}
interface IssueTx {
  id: string; serial: string; type: IssueType; date: string
  warehouseName: string; destination: string
  clientName?: string; mixerName?: string; mixerCount?: number
  invoiceRef?: string; salesInvoiceValue?: number
  costCenter?: string
  itemName: string; qty: number; price: number
  weighbridgeCard?: string; photoUrl?: string
  items: TxItem[]; totalValue: number; status: TransactionStatus; notes: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Configs
// ─────────────────────────────────────────────────────────────────────────────

const CAT_CFG: Record<ItemCategory, { label: string; color: string; bg: string; dot: string; icon: React.ElementType }> = {
  feed: { label: 'أغذية', color: 'text-success-700', bg: 'bg-success-50', dot: 'bg-success-500', icon: Leaf },
  medicine: { label: 'أدوية', color: 'text-info-700', bg: 'bg-info-50', dot: 'bg-info-500', icon: Pill },
  spare_part: { label: 'قطع غيار', color: 'text-neutral-700', bg: 'bg-neutral-100', dot: 'bg-neutral-500', icon: Wrench },
  oil_diesel: { label: 'زيوت وسولار', color: 'text-warning-700', bg: 'bg-warning-50', dot: 'bg-warning-500', icon: Fuel },
}

// Dynamic store type config based on free-text type
function getStoreCfg(type: string): { color: string; bg: string; icon: React.ElementType } {
  if (type.includes('أغذية') || type.includes('علف') || type.includes('غذاء'))
    return { color: 'text-success-700', bg: 'bg-success-50', icon: Leaf }
  if (type.includes('دواء') || type.includes('صيدلية') || type.includes('طبي'))
    return { color: 'text-info-700', bg: 'bg-info-50', icon: Pill }
  if (type.includes('قطع') || type.includes('غيار') || type.includes('ميكانيك'))
    return { color: 'text-neutral-700', bg: 'bg-neutral-100', icon: Wrench }
  if (type.includes('زيت') || type.includes('سولار') || type.includes('وقود'))
    return { color: 'text-warning-700', bg: 'bg-warning-50', icon: Fuel }
  if (type.includes('معدات') || type.includes('آلات'))
    return { color: 'text-purple-700', bg: 'bg-purple-50', icon: Boxes }
  return { color: 'text-neutral-600', bg: 'bg-neutral-100', icon: Archive }
}

// Tree node color config
const TREE_COLOR_CFG: Record<string, { bg: string; text: string; border: string; dot: string; light: string }> = {
  success: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200', dot: 'bg-success-400', light: 'bg-success-100' },
  info: { bg: 'bg-info-50', text: 'text-info-700', border: 'border-info-200', dot: 'bg-info-400', light: 'bg-info-100' },
  warning: { bg: 'bg-warning-50', text: 'text-warning-700', border: 'border-warning-200', dot: 'bg-warning-400', light: 'bg-warning-100' },
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200', dot: 'bg-neutral-400', light: 'bg-neutral-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400', light: 'bg-purple-100' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-400', light: 'bg-red-100' },
}

const TX_STATUS_CFG: Record<TransactionStatus, { label: string; color: string; bg: string; ring: string; dot: string }> = {
  done: { label: 'مكتمل', color: 'text-success-700', bg: 'bg-success-50', ring: 'ring-success-200', dot: 'bg-success-500' },
  draft: { label: 'مسودة', color: 'text-neutral-600', bg: 'bg-neutral-100', ring: 'ring-neutral-200', dot: 'bg-neutral-400' },
  pending: { label: 'معلق', color: 'text-warning-700', bg: 'bg-warning-50', ring: 'ring-warning-200', dot: 'bg-warning-500' },
}

const RECEIPT_TYPE_CFG: Record<ReceiptType, { label: string; color: string; bg: string }> = {
  opening_balance: { label: 'رصيد افتتاحي', color: 'text-purple-700', bg: 'bg-purple-50' },
  from_supplier: { label: 'من مورد', color: 'text-info-700', bg: 'bg-info-50' },
  return: { label: 'مرتجع', color: 'text-warning-700', bg: 'bg-warning-50' },
}

const ISSUE_TYPE_CFG: Record<IssueType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  internal: { label: 'صرف داخلي', color: 'text-neutral-700', bg: 'bg-neutral-100', icon: ArrowUpFromLine },
  sales: { label: 'فاتورة بيع', color: 'text-success-700', bg: 'bg-success-50', icon: ShoppingCart },
  feeding: { label: 'تغذية', color: 'text-warning-700', bg: 'bg-warning-50', icon: Utensils },
}

const fmtNum = (n: number) => n.toLocaleString('ar-EG')
const fmtMon = (n: number) => `${n.toLocaleString('ar-EG')} ج.م`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const INIT_ITEMS: Item[] = [
  // ── أغذية (Feed) ──────────────────────────────────────────
  { id: 'i1', code: 'FD001', name: 'ذرة صفرا', nameAlt: 'Yellow Corn', category: 'feed', uom: 'طن', barcode: '6281001001001', minStock: 5000, maxStock: 50000, reorderQty: 10000, avgDeliveryDays: 3, currentStock: 22000, dailyUsage: 1800 },
  { id: 'i2', code: 'FD002', name: 'ردة القمح', nameAlt: 'Wheat Bran', category: 'feed', uom: 'طن', barcode: '6281001001002', minStock: 2000, maxStock: 20000, reorderQty: 5000, avgDeliveryDays: 3, currentStock: 8500, dailyUsage: 600 },
  { id: 'i3', code: 'FD003', name: 'كسبة الصويا', nameAlt: 'Soybean Meal', category: 'feed', uom: 'طن', barcode: '6281001001003', minStock: 3000, maxStock: 30000, reorderQty: 8000, avgDeliveryDays: 5, currentStock: 2800, dailyUsage: 550 },
  { id: 'i4', code: 'FD004', name: 'دريس الأرزق', nameAlt: 'Alfalfa Hay', category: 'feed', uom: 'طن', barcode: '6281001001004', minStock: 1000, maxStock: 10000, reorderQty: 3000, avgDeliveryDays: 2, currentStock: 3200, dailyUsage: 280 },
  { id: 'i5', code: 'FD005', name: 'تبن القمح', nameAlt: 'Wheat Straw', category: 'feed', uom: 'طن', barcode: '6281001001005', minStock: 500, maxStock: 8000, reorderQty: 2000, avgDeliveryDays: 2, currentStock: 1800, dailyUsage: 130 },
  { id: 'i6', code: 'FD006', name: 'تفل البنجر', nameAlt: 'Sugar Beet Pulp', category: 'feed', uom: 'طن', barcode: '6281001001006', minStock: 2000, maxStock: 15000, reorderQty: 5000, avgDeliveryDays: 7, currentStock: 6000, dailyUsage: 400 },
  { id: 'i7', code: 'FD007', name: 'بيكربونات الصوديوم', nameAlt: 'Sodium Bicarbonate', category: 'feed', uom: 'كج', barcode: '6281001001007', minStock: 200, maxStock: 2000, reorderQty: 500, avgDeliveryDays: 4, currentStock: 140, dailyUsage: 30 },
  { id: 'i8', code: 'FD008', name: 'سي باف', nameAlt: 'C-PAF', category: 'feed', uom: 'كج', barcode: '6281001001008', minStock: 500, maxStock: 5000, reorderQty: 1000, avgDeliveryDays: 5, currentStock: 2100, dailyUsage: 90 },
  { id: 'i9', code: 'FD009', name: 'ماغنسيوم', nameAlt: 'Magnesium Oxide', category: 'feed', uom: 'كج', barcode: '6281001001009', minStock: 100, maxStock: 1000, reorderQty: 300, avgDeliveryDays: 7, currentStock: 350, dailyUsage: 18 },
  { id: 'i10', code: 'FD010', name: 'مضاد سموم', nameAlt: 'Mycotoxin Binder', category: 'feed', uom: 'كج', barcode: '6281001001010', minStock: 100, maxStock: 1000, reorderQty: 300, avgDeliveryDays: 7, currentStock: 420, dailyUsage: 22 },
  { id: 'i11', code: 'FD011', name: 'بريمكس', nameAlt: 'Premix', category: 'feed', uom: 'كج', barcode: '6281001001011', minStock: 200, maxStock: 2000, reorderQty: 600, avgDeliveryDays: 10, currentStock: 130, dailyUsage: 28 },
  { id: 'i12', code: 'FD012', name: 'خميرة علف', nameAlt: 'Feed Yeast', category: 'feed', uom: 'كج', barcode: '6281001001012', minStock: 100, maxStock: 800, reorderQty: 200, avgDeliveryDays: 5, currentStock: 290, dailyUsage: 25 },
  { id: 'i13', code: 'FD013', name: 'ملح طعام', nameAlt: 'Salt', category: 'feed', uom: 'كج', barcode: '6281001001013', minStock: 200, maxStock: 2000, reorderQty: 500, avgDeliveryDays: 2, currentStock: 750, dailyUsage: 45 },
  { id: 'i14', code: 'FD014', name: 'حجر جيري', nameAlt: 'Limestone', category: 'feed', uom: 'كج', barcode: '6281001001014', minStock: 500, maxStock: 5000, reorderQty: 1500, avgDeliveryDays: 3, currentStock: 1900, dailyUsage: 110 },
  // ── أدوية (Medicine) ──────────────────────────────────────
  { id: 'i15', code: 'MD001', name: 'أموكسيسيلين', nameAlt: 'Amoxicillin', category: 'medicine', uom: 'علبة', barcode: '6281002001001', minStock: 50, maxStock: 500, reorderQty: 100, avgDeliveryDays: 5, currentStock: 120, dailyUsage: 8 },
  { id: 'i16', code: 'MD002', name: 'فيتامين ADE', nameAlt: 'Vitamin ADE', category: 'medicine', uom: 'لتر', barcode: '6281002001002', minStock: 20, maxStock: 200, reorderQty: 50, avgDeliveryDays: 5, currentStock: 65, dailyUsage: 4 },
  { id: 'i17', code: 'MD003', name: 'مطهر فيرادين', nameAlt: 'Virkon Disinfectant', category: 'medicine', uom: 'لتر', barcode: '6281002001003', minStock: 30, maxStock: 300, reorderQty: 80, avgDeliveryDays: 3, currentStock: 18, dailyUsage: 5 },
  { id: 'i18', code: 'MD004', name: 'مضاد التهاب كيتوفان', nameAlt: 'Ketoprofen', category: 'medicine', uom: 'أمبولة', barcode: '6281002001004', minStock: 100, maxStock: 1000, reorderQty: 200, avgDeliveryDays: 5, currentStock: 340, dailyUsage: 15 },
  // ── قطع غيار (Spare Parts) ───────────────────────────────
  { id: 'i19', code: 'SP001', name: 'حزام ناقل', nameAlt: 'Conveyor Belt', category: 'spare_part', uom: 'قطعة', barcode: '6281003001001', minStock: 5, maxStock: 50, reorderQty: 10, avgDeliveryDays: 14, currentStock: 12, dailyUsage: 0.2 },
  { id: 'i20', code: 'SP002', name: 'بلاعة ماء', nameAlt: 'Water Nipple', category: 'spare_part', uom: 'قطعة', barcode: '6281003001002', minStock: 100, maxStock: 1000, reorderQty: 200, avgDeliveryDays: 7, currentStock: 280, dailyUsage: 3 },
  { id: 'i21', code: 'SP003', name: 'فلتر هواء', nameAlt: 'Air Filter', category: 'spare_part', uom: 'قطعة', barcode: '6281003001003', minStock: 10, maxStock: 100, reorderQty: 20, avgDeliveryDays: 7, currentStock: 8, dailyUsage: 0.5 },
  // ── زيوت وسولار (Oils & Diesel) ──────────────────────────
  { id: 'i22', code: 'OD001', name: 'ديزل', nameAlt: 'Diesel', category: 'oil_diesel', uom: 'لتر', barcode: '6281004001001', minStock: 5000, maxStock: 50000, reorderQty: 10000, avgDeliveryDays: 2, currentStock: 18000, dailyUsage: 900 },
  { id: 'i23', code: 'OD002', name: 'زيت محرك', nameAlt: 'Engine Oil', category: 'oil_diesel', uom: 'لتر', barcode: '6281004001002', minStock: 200, maxStock: 2000, reorderQty: 500, avgDeliveryDays: 3, currentStock: 650, dailyUsage: 20 },
  { id: 'i24', code: 'OD003', name: 'شحوم صناعية', nameAlt: 'Grease', category: 'oil_diesel', uom: 'كج', barcode: '6281004001003', minStock: 50, maxStock: 500, reorderQty: 100, avgDeliveryDays: 5, currentStock: 85, dailyUsage: 3 },
]

const INIT_WAREHOUSES: WhItem[] = [
  {
    id: 'w1', code: 'WH001', name: 'مخزن الأعلاف الرئيسي', type: 'أغذية',
    responsibleUsers: ['محمد علي حسن', 'سلطان مطلق الرشيدي'], status: 'active',
    locations: [
      { id: 'wl1', name: 'صومعة الذرة' },
      { id: 'wl2', name: 'صومعة الردة' },
      { id: 'wl3', name: 'صومعة ا��صويا' },
      { id: 'wl4', name: 'م��طقة الدريس' },
      { id: 'wl5', name: 'منطقة التبن' },
      { id: 'wl6', name: 'رف الإضافات A' },
    ],
    notes: 'المخزن الرئيسي لأعلاف المحطة — يعمل على مدار الساعة',
  },
  {
    id: 'w2', code: 'WH002', name: 'مخزن الأدوية والمستلزمات البيطرية', type: 'أدوية',
    responsibleUsers: ['خالد عبدالله النجم'], status: 'active',
    locations: [
      { id: 'wl7', name: 'خزانة المبردة' },
      { id: 'wl8', name: 'خزانة الأمبولات' },
      { id: 'wl9', name: 'خزانة الكبسولات' },
      { id: 'wl10', name: 'رف المطهرات' },
    ],
    notes: 'تحت إشراف الطبيب البيطري — صرف بموافقة طبية',
  },
  {
    id: 'w3', code: 'WH003', name: 'مخزن قطع الغيار والمعدات', type: 'قطع غيار',
    responsibleUsers: ['ناصر راشد العتيبي'], status: 'active',
    locations: [
      { id: 'wl14', name: 'رف المعدات الكبيرة' },
      { id: 'wl15', name: 'رف قطع الغيار' },
    ],
    notes: '',
  },
  {
    id: 'w4', code: 'WH004', name: 'مخزن الزيوت والوقود', type: 'زيوت وسولار',
    responsibleUsers: ['ليلى محمد الشهري'], status: 'active',
    locations: [
      { id: 'wl16', name: 'خزان الديزل الرئيسي' },
      { id: 'wl17', name: 'منطقة الزيوت والشحوم' },
    ],
    notes: '',
  },
]

const INIT_CAT_TREE: CatNode[] = [
  { id: 'c1', name: 'أغذية وأعلاف', parentId: null, color: 'success' },
  { id: 'c1a', name: 'حبوب', parentId: 'c1', color: 'success' },
  { id: 'c1b', name: 'بقوليات ومخروطات', parentId: 'c1', color: 'success' },
  { id: 'c1c', name: 'إضافات غذائية', parentId: 'c1', color: 'success' },
  { id: 'c1d', name: 'أعلاف مالئة', parentId: 'c1', color: 'success' },
  { id: 'c2', name: 'أدوية وصيدلية', parentId: null, color: 'info' },
  { id: 'c2a', name: 'مضادات حيوية', parentId: 'c2', color: 'info' },
  { id: 'c2b', name: 'فيتامينات ومعادن', parentId: 'c2', color: 'info' },
  { id: 'c2c', name: 'مطهرات ومعقمات', parentId: 'c2', color: 'info' },
  { id: 'c2d', name: 'مضادات التهاب', parentId: 'c2', color: 'info' },
  { id: 'c3', name: 'قطع غيار', parentId: null, color: 'neutral' },
  { id: 'c3a', name: 'قطع ميكانيكية', parentId: 'c3', color: 'neutral' },
  { id: 'c3b', name: 'قطع كهربائية', parentId: 'c3', color: 'neutral' },
  { id: 'c4', name: 'زيوت وسولار', parentId: null, color: 'warning' },
  { id: 'c4a', name: 'زيوت تشحيم', parentId: 'c4', color: 'warning' },
  { id: 'c4b', name: 'وقود وسولار', parentId: 'c4', color: 'warning' },
]

// ─────────────────────────��ر'      },
const INIT_MIXERS: Mixer[] = [
  {
    id: 'mx1', code: 'MX001', name: 'ميكسر A — دورة اللحم', type: 'علف مركب', status: 'active',
    notes: 'يُستخدم لتغذية دورات تسمين اللحم — يومياً من الساعة 6 صباحاً',
    ingredients: [
      { id: 'mi1', itemName: 'ذرة صفراء', qty: 1, weight: 400, uom: 'كج', notes: 'المكوّن الأساسي', status: 'active' },
      { id: 'mi2', itemName: 'ردة القمح', qty: 1, weight: 200, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi3', itemName: 'كسبة الصويا', qty: 1, weight: 150, uom: 'كج', notes: 'مصدر بروتين', status: 'active' },
      { id: 'mi4', itemName: 'دريس الأرزق', qty: 1, weight: 100, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi5', itemName: 'تبن القمح', qty: 1, weight: 50, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi6', itemName: 'بريمكس', qty: 1, weight: 20, uom: 'كج', notes: 'فيتامينات ومعادن', status: 'active' },
      { id: 'mi7', itemName: 'ملح طعام', qty: 1, weight: 10, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi8', itemName: 'حجر جيري', qty: 1, weight: 20, uom: 'كج', notes: 'مصدر كالسيوم', status: 'active' },
      { id: 'mi9', itemName: 'بيكربونات الصوديوم', qty: 1, weight: 10, uom: 'كج', notes: 'تنظيم الحموضة', status: 'active' },
      { id: 'mi10', itemName: 'سي باف', qty: 1, weight: 40, uom: 'كج', notes: '', status: 'active' },
    ],
  },
  {
    id: 'mx2', code: 'MX002', name: 'ميكسر B — دورة الألبان', type: 'علف مركب', status: 'active',
    notes: 'يُستخدم لتغذية أبقار الألبان — مرتين يومياً',
    ingredients: [
      { id: 'mi11', itemName: 'ذرة صفراء', qty: 1, weight: 300, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi12', itemName: 'كسبة الصويا', qty: 1, weight: 200, uom: 'كج', notes: 'بروتين عالٍ', status: 'active' },
      { id: 'mi13', itemName: 'دريس الأرزق', qty: 1, weight: 200, uom: 'كج', notes: 'ضروري للإنتاج', status: 'active' },
      { id: 'mi14', itemName: 'تفل البنجر', qty: 1, weight: 150, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi15', itemName: 'ردة القمح', qty: 1, weight: 100, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi16', itemName: 'بريمكس', qty: 1, weight: 20, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi17', itemName: 'ماغنسيوم', qty: 1, weight: 10, uom: 'كج', notes: 'يرفع إنتاج الحليب', status: 'active' },
      { id: 'mi18', itemName: 'مضاد سموم', qty: 1, weight: 15, uom: 'كج', notes: '', status: 'active' },
      { id: 'mi19', itemName: 'خميرة علف', qty: 1, weight: 5, uom: 'كج', notes: 'تحسين الهضم', status: 'active' },
    ],
  },
  {
    id: 'mx3', code: 'MX003', name: 'ميكسر C — دورة الإنتاج', type: 'علف مركب', status: 'inactive',
    notes: 'متوقف مؤقتاً — قيد المراجعة',
    ingredients: [
      { id: 'mi20', itemName: 'ذرة صفراء', qty: 1, weight: 350, uom: 'كج', notes: '', status: 'inactive' },
      { id: 'mi21', itemName: 'ردة القمح', qty: 1, weight: 200, uom: 'كج', notes: '', status: 'inactive' },
    ],
  },
]

const INIT_RECEIPTS: ReceiptTx[] = [
  {
    id: 'r1', serial: 'RCV-2025-001', type: 'opening_balance', date: '2025-01-01',
    warehouseName: 'مخزن الأعلاف الرئيسي', supplierName: '—', supplierInvoice: '—',
    invoiceValue: 83800, itemName: 'ذرة صفراء', qty: 20, price: 1800,
    weighbridgeCard: '', photoUrl: '',
    items: [
      { id: 'ri1', itemName: 'ذرة صفراء', qty: 20, weight: 20000, price: 1800, location: 'صومعة الذرة' },
      { id: 'ri2', itemName: 'ردة القمح', qty: 8, weight: 8000, price: 950, location: 'صومعة الردة' },
      { id: 'ri3', itemName: 'كسبة الصويا', qty: 5, weight: 5000, price: 2100, location: 'صومعة الصويا' },
    ],
    totalValue: 83800, status: 'done', notes: 'رصيد افتتاحي للعام 2025',
  },
  {
    id: 'r2', serial: 'RCV-2025-012', type: 'from_supplier', date: '2025-03-10',
    warehouseName: 'مخزن الأعلاف الرئيسي', supplierName: 'شركة الخليج للأعلاف', supplierInvoice: 'INV-4521',
    invoiceValue: 30140, itemName: 'ذرة صفراء', qty: 10, price: 1820,
    weighbridgeCard: 'WB-1023', photoUrl: 'invoice_4521.jpg',
    items: [
      { id: 'ri4', itemName: 'ذرة صفراء', qty: 10, weight: 10000, price: 1820, location: 'صومعة الذرة' },
      { id: 'ri5', itemName: 'كسبة الصويا', qty: 5, weight: 5000, price: 2150, location: 'صومعة الصويا' },
      { id: 'ri6', itemName: 'بريمكس', qty: 0.2, weight: 200, price: 3200, location: 'رف الإضافات A' },
    ],
    totalValue: 30140, status: 'done', notes: '',
  },
  {
    id: 'r3', serial: 'RCV-2025-018', type: 'from_supplier', date: '2025-03-22',
    warehouseName: 'مخزن الأدوية والمستلزمات البيطرية', supplierName: 'شركة نورا للمستلزمات البيطرية', supplierInvoice: 'INV-0872',
    invoiceValue: 10625, itemName: 'أموكسيسيلين', qty: 50, price: 85,
    weighbridgeCard: '', photoUrl: 'invoice_0872.pdf',
    items: [
      { id: 'ri7', itemName: 'أموكسيسيلين', qty: 50, weight: 25, price: 85, location: 'خزانة الأمبولات' },
      { id: 'ri8', itemName: 'فيتامين ADE', qty: 20, weight: 20, price: 120, location: 'خزانة المبردة' },
      { id: 'ri9', itemName: 'مضاد التهاب كيتوفان', qty: 100, weight: 15, price: 45, location: 'خزانة الأمبولات' },
    ],
    totalValue: 10625, status: 'done', notes: '',
  },
  {
    id: 'r4', serial: 'RCV-2025-025', type: 'from_supplier', date: '2025-03-28',
    warehouseName: 'مخزن الأعلاف الرئيسي', supplierName: 'مورد الديزل الوطني', supplierInvoice: 'INV-3310',
    invoiceValue: 12500, itemName: 'ديزل', qty: 10000, price: 1.25,
    weighbridgeCard: 'WB-1041', photoUrl: '',
    items: [
      { id: 'ri10', itemName: 'ديزل', qty: 10000, weight: 8500, price: 1.25, location: 'منطقة الوقود' },
    ],
    totalValue: 12500, status: 'pending', notes: 'بانتظار فحص العداد',
  },
  {
    id: 'r5', serial: 'RCV-2025-026', type: 'return', date: '2025-03-29',
    warehouseName: 'مخزن قطع الغيار والمعدات', supplierName: 'شركة التقنية للمعدات', supplierInvoice: 'RET-0044',
    invoiceValue: 475, itemName: 'فلتر هواء', qty: 5, price: 95,
    weighbridgeCard: '', photoUrl: 'return_doc.jpg',
    items: [
      { id: 'ri11', itemName: 'فلتر هواء', qty: 5, weight: 2, price: 95, location: 'رف قطع الغيار' },
    ],
    totalValue: 475, status: 'draft', notes: 'مرتجع — جودة غير مطابقة',
  },
]

const INIT_ISSUES: IssueTx[] = [
  {
    id: 'is1', serial: 'ISS-2025-001', type: 'feeding', date: '2025-03-28',
    warehouseName: 'محطة التغذية الرئيسية', destination: 'الدورة 12 — تسمين',
    mixerName: 'ميكسر A — دورة اللحم', mixerCount: 3,
    itemName: 'ذرة صفراء', qty: 1200, price: 1820, weighbridgeCard: 'WB-2081', photoUrl: '',
    items: [
      { id: 'ii1', itemName: 'ذرة صفراء', qty: 1.2, weight: 1200, price: 1820, location: 'صومعة الذرة' },
      { id: 'ii2', itemName: 'ردة القمح', qty: 0.6, weight: 600, price: 950, location: 'صومعة الردة' },
      { id: 'ii3', itemName: 'كسبة الصويا', qty: 0.45, weight: 450, price: 2150, location: 'صومعة الصويا' },
      { id: 'ii4', itemName: 'بريمكس', qty: 0.06, weight: 60, price: 3200, location: 'رف الإضافات A' },
    ],
    totalValue: 4554, status: 'done', notes: 'تغذية صباحية',
  },
  {
    id: 'is2', serial: 'ISS-2025-002', type: 'feeding', date: '2025-03-28',
    warehouseName: 'محطة التغذية الرئيسية', destination: 'الدورة 5 — ألبان',
    mixerName: 'ميكسر B — دورة الألبان', mixerCount: 2,
    itemName: 'ذرة صفراء', qty: 600, price: 1820,
    items: [
      { id: 'ii5', itemName: 'ذرة صفراء', qty: 0.6, weight: 600, price: 1820, location: 'صومعة الذرة' },
      { id: 'ii6', itemName: 'كسبة الصويا', qty: 0.4, weight: 400, price: 2150, location: 'صومعة الصويا' },
      { id: 'ii7', itemName: 'دريس الأرزق', qty: 0.4, weight: 400, price: 1650, location: 'منطقة الدريس' },
    ],
    totalValue: 2892, status: 'done', notes: '',
  },
  {
    id: 'is3', serial: 'ISS-2025-008', type: 'internal', date: '2025-03-27',
    warehouseName: 'صيدلية المزرعة', destination: 'مركز تكلفة — رعاية بيطرية',
    itemName: 'أموكسيسيلين', qty: 10, price: 85,
    items: [
      { id: 'ii8', itemName: 'أموكسيسيلين', qty: 10, weight: 5, price: 85, location: 'خزانة الأمبولات' },
      { id: 'ii9', itemName: 'مضاد التهاب كيتوفان', qty: 20, weight: 3, price: 45, location: 'خزانة الأمبولات' },
    ],
    totalValue: 1750, status: 'done', notes: 'صرف لمعالجة الدورة 11',
  },
  {
    id: 'is4', serial: 'ISS-2025-012', type: 'sales', date: '2025-03-26',
    warehouseName: 'محطة التغذية الرئيسية', destination: 'مزرعة الفالح', invoiceRef: 'SI-2025-044',
    itemName: 'ذرة صفراء', qty: 5000, price: 1900,
    items: [
      { id: 'ii10', itemName: 'ذرة صفراء', qty: 5, weight: 5000, price: 1900, location: 'صومعة الذرة' },
    ],
    totalValue: 9500, status: 'done', notes: '',
  },
  {
    id: 'is5', serial: 'ISS-2025-018', type: 'internal', date: '2025-03-29',
    warehouseName: 'مخزن المعدات والقطع', destination: 'مركز تكلفة — صيانة',
    itemName: 'زيت محرك', qty: 50, price: 22,
    items: [
      { id: 'ii11', itemName: 'زيت محرك', qty: 50, weight: 50, price: 22, location: 'منطقة الزيوت' },
      { id: 'ii12', itemName: 'شحوم صناعية', qty: 5, weight: 5, price: 35, location: 'منطقة الزيوت' },
    ],
    totalValue: 1275, status: 'pending', notes: 'بانتظار موافقة المشرف',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI Components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg }:
  { label: string; value: string | number; sub: string; icon: React.ElementType; iconColor: string; iconBg: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-[16px] px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-[12px] ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="font-cairo font-bold text-[22px] text-neutral-900 leading-tight">{typeof value === 'number' ? fmtNum(value) : value}</p>
        <p className="font-cairo text-[11px] text-neutral-400 mt-0.5">{label} · {sub}</p>
      </div>
    </div>
  )
}

function CategoryBadge({ cat }: { cat: ItemCategory }) {
  const c = CAT_CFG[cat]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const c = TX_STATUS_CFG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${c.bg} ${c.color} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

// Stock level relative to min/max
function StockBar({ current, min, max }: { current: number; min: number; max: number }) {
  const pct = Math.min(100, Math.round((current / max) * 100))
  const color = current < min ? 'bg-red-400' : current < min * 1.5 ? 'bg-warning-400' : 'bg-success-500'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-cairo text-[10px] text-neutral-500 shrink-0">{pct}%</span>
    </div>
  )
}

function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
        <Icon size={28} className="text-neutral-300" />
      </div>
      <p className="font-cairo font-semibold text-[14px] text-neutral-500">{title}</p>
      <p className="font-cairo text-[12px] text-neutral-400">{sub}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 7

function Pagination({
  page, totalPages, setPage, total, unit,
}: {
  page: number; totalPages: number; setPage: (p: number) => void; total: number; unit: string
}) {
  const [inputVal, setInputVal] = useState(String(page))
  useEffect(() => { setInputVal(String(page)) }, [page])

  function goToPage(val: string) {
    const n = parseInt(val)
    if (!isNaN(n) && n >= 1 && n <= totalPages) setPage(n)
    else setInputVal(String(page))
  }

  return (
    <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between gap-4">
      <span className="font-cairo text-[12px] text-neutral-400">
        إجمالي: <span className="font-semibold text-neutral-600">{total}</span> {unit}
        {totalPages > 1 && <span className="text-neutral-300 mx-1.5">·</span>}
        {totalPages > 1 && <span>الصفحة {page} من {totalPages}</span>}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <div className="flex items-center gap-1">
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onBlur={() => goToPage(inputVal)}
              onKeyDown={e => { if (e.key === 'Enter') goToPage(inputVal) }}
              className="w-10 h-7 text-center rounded-[6px] border border-neutral-200 font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white"
            />
            <span className="font-cairo text-[12px] text-neutral-400">/ {totalPages}</span>
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-neutral-200 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — أصناف (Items)
// ─────────────────────────────────────────────────────────────────────────────

// Map API ItemListItem → local Item shape
function mapApiItem(api: ItemListItem): Item {
  const catMap: Record<string, ItemCategory> = {
    'أغذية': 'feed', 'علف': 'feed', 'Feed': 'feed',
    'أدوية': 'medicine', 'دواء': 'medicine', 'Medicine': 'medicine',
    'قطع غيار': 'spare_part', 'Spare': 'spare_part',
    'زيوت': 'oil_diesel', 'سولار': 'oil_diesel', 'Oil': 'oil_diesel',
  }
  const cat = catMap[api.itemCategoryName ?? ''] ?? 'feed'
  return {
    id: String(api.id),
    code: api.itemCode,
    name: api.name,
    nameAlt: api.alternateName ?? '',
    category: cat,
    uom: api.unitOfMeasureName ?? 'طن',
    barcode: api.barcode ?? '',
    minStock: api.minQuantity,
    maxStock: api.maxQuantity,
    reorderQty: api.reorderQuantity,
    avgDeliveryDays: api.averageDeliveryDays,
    currentStock: api.currentStockQuantity,
    dailyUsage: api.dailyUsage,
  }
}

function ItemsTab() {
  const [items, setItems] = useState<Item[]>(INIT_ITEMS)
  const [loadingItems, setLoadingItems] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<ItemCategory | 'all'>('all')
  const [viewItem, setViewItem] = useState<Item | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [savingItem, setSavingItem] = useState(false)

  // Category DDL for the Add Item form
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])

  // Fetch items from API
  const fetchItems = async () => {
    setLoadingItems(true)
    try {
      const res = await itemsApi.getList(1, 200)
      if (res.isSuccess && res.data?.data?.length) {
        setItems(res.data.data.map(mapApiItem))
        console.log('[ItemsTab] Loaded', res.data.data.length, 'items from API')
      } else {
        console.warn('[ItemsTab] No data from API, using mock fallback')
        setItems(INIT_ITEMS)
      }
    } catch (e) {
      console.error('[ItemsTab] Failed to load items:', e)
      setItems(INIT_ITEMS)
    } finally {
      setLoadingItems(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // Load category dropdown for Add form
    itemCategoriesApi.getDropdown().then(r => { if (r.isSuccess) setCategories(r.data || []) }).catch(() => {})
  }, [])

  const filtered = useMemo(() => items.filter(it => {
    const q = search.toLowerCase()
    const matchSearch = !q || it.name.includes(search) || it.nameAlt.toLowerCase().includes(q) || it.code.toLowerCase().includes(q)
    const matchCat = catFilter === 'all' || it.category === catFilter
    return matchSearch && matchCat
  }), [items, search, catFilter])

  const stockAlert = items.filter(i => i.currentStock < i.minStock).length

  const [itemPage, setItemPage] = useState(1)
  useEffect(() => { setItemPage(1) }, [search, catFilter])
  const itemTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedItems = filtered.slice((itemPage - 1) * PAGE_SIZE, itemPage * PAGE_SIZE)

  const inp = 'w-full h-9 px-3 rounded-[10px] border border-neutral-200 bg-neutral-50 text-[13px] font-cairo text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400'
  const lbl = 'block text-[11px] font-semibold text-neutral-500 mb-1 uppercase tracking-wide'

  const [form, setForm] = useState<Partial<Item & { categoryId?: number }>>({ category: 'feed', uom: 'طن', minStock: 0, maxStock: 0, reorderQty: 0, avgDeliveryDays: 3, currentStock: 0, dailyUsage: 0 })
  const ff = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(p => ({ ...p, [k]: v }))

  async function saveItem() {
    if (!form.name || !form.code) { toast.error('الكود والاسم مطلوبان'); return }
    setSavingItem(true)
    try {
      const catId = form.categoryId ?? categories[0]?.id ?? 1
      const uomMap: Record<string, number> = { 'طن': 1, 'كج': 2, 'لتر': 3, 'قطعة': 4, 'علبة': 5, 'أمبولة': 6, 'جرام': 7 }
      const dto = {
        itemCode: form.code!,
        name: form.name!,
        alternateName: form.nameAlt,
        barcode: form.barcode,
        itemCategoryId: catId,
        unitOfMeasureId: uomMap[form.uom ?? 'طن'] ?? 1,
        itemType: 'Stock',
        trackingType: 'Quantity',
        minQuantity: form.minStock ?? 0,
        maxQuantity: form.maxStock ?? 0,
        reorderPoint: form.reorderQty ?? 0,
        reorderQuantity: form.reorderQty ?? 0,
        dailyUsage: form.dailyUsage ?? 0,
        averageDeliveryDays: form.avgDeliveryDays ?? 3,
        status: 'Active',
      }
      await itemsApi.create(dto)
      toast.success('تم إضافة الصنف بنجاح')
      setShowAdd(false)
      setForm({ category: 'feed', uom: 'طن', minStock: 0, maxStock: 0, reorderQty: 0, avgDeliveryDays: 3, currentStock: 0, dailyUsage: 0 })
      await fetchItems()
    } catch (err) {
      console.error('[ItemsTab] saveItem error:', err)
      toast.error('فشل حفظ الصنف: ' + (err instanceof Error ? err.message : 'خطأ غير معروف'))
    } finally {
      setSavingItem(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الأصناف" value={items.length} sub="صنف مسجّل" icon={Package2} iconColor="text-primary-500" iconBg="bg-primary-50" />
        <StatCard label="تنبيهات نقص" value={stockAlert} sub="دون الحد الأدنى" icon={AlertTriangle} iconColor="text-red-500" iconBg="bg-red-50" />
        <StatCard label="أصناف أغذية" value={items.filter(i => i.category === 'feed').length} sub="صنف علف" icon={Leaf} iconColor="text-success-600" iconBg="bg-success-50" />
        <StatCard label="أصناف أدوية" value={items.filter(i => i.category === 'medicine').length} sub="صنف دواء" icon={Pill} iconColor="text-info-600" iconBg="bg-info-50" />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-[14px] px-5 py-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 h-10 px-3 rounded-[12px] bg-neutral-50 border border-neutral-200 flex-1 min-w-[200px] focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <Search size={14} className="text-neutral-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الكود..."
            className="flex-1 bg-transparent outline-none font-cairo text-[13px] placeholder:text-neutral-400" dir="rtl" />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-neutral-400" /></button>}
        </div>
        {/* Category filter dropdown */}
        <div className="relative">
          <Filter size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value as ItemCategory | 'all')}
            className="h-9 ps-8 pe-8 rounded-[10px] border border-neutral-200 bg-white font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 cursor-pointer appearance-none"
          >
            <option value="all">كل الفئات</option>
            {Object.entries(CAT_CFG).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 px-4 h-10 bg-primary-500 text-white rounded-[12px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm">
          <Plus size={16} /> إضافة صنف
        </button>
      </div>

      {/* شجرة الأصناف + جدول */}
      <div className="flex gap-4">
        {/* شجرة الأصناف — sidebar */}
        <div className="w-52 shrink-0 bg-white border border-neutral-200 rounded-[16px] shadow-sm overflow-hidden self-start">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
            <GitBranch size={14} className="text-primary-500" />
            <span className="font-cairo font-bold text-[12px] text-neutral-700">شجرة الأصناف</span>
          </div>
          <div className="py-2">
            {/* All */}
            <button onClick={() => setCatFilter('all')}
              className={['w-full flex items-center justify-between px-4 py-2 text-start transition-colors font-cairo text-[12px]',
                catFilter === 'all' ? 'bg-primary-50 text-primary-700 font-bold' : 'text-neutral-600 hover:bg-neutral-50'].join(' ')}>
              <span>كل الأصناف</span>
              <span className={['px-1.5 py-0.5 rounded font-bold text-[11px]', catFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'].join(' ')}>{items.length}</span>
            </button>
            {/* Categories */}
            {(Object.entries(CAT_CFG) as [ItemCategory, typeof CAT_CFG[ItemCategory]][]).map(([cat, cfg]) => {
              const CatIcon = cfg.icon
              const count = items.filter(i => i.category === cat).length
              const active = catFilter === cat
              return (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className={['w-full flex items-center gap-2 px-4 py-2.5 text-start transition-colors', active ? `${cfg.bg}` : 'hover:bg-neutral-50'].join(' ')}>
                  <CatIcon size={13} className={active ? cfg.color : 'text-neutral-400'} />
                  <span className={['font-cairo text-[12px] flex-1', active ? `font-bold ${cfg.color}` : 'text-neutral-600'].join(' ')}>{cfg.label}</span>
                  <span className={['px-1.5 py-0.5 rounded font-bold text-[11px]', active ? `bg-white/60 ${cfg.color}` : 'bg-neutral-100 text-neutral-500'].join(' ')}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main table */}
        <div className="flex-1 bg-white border border-neutral-200 rounded-[16px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['الكود', 'الاسم', 'الفئة', 'الوحدة', 'الرصيد الحالي', 'الحد الأدنى / الأقصى', 'مستوى المخزون', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon={Package} title="لا توجد أصناف" sub="حاول تغيير معايير البحث" /></td></tr>
                ) : pagedItems.map(it => {
                  const isCrit = it.currentStock < it.minStock
                  return (
                    <tr key={it.id} className="hover:bg-neutral-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="font-cairo font-bold text-[12px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">{it.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-cairo font-semibold text-[13px] text-neutral-900">{it.name}</p>
                        <p className="font-cairo text-[11px] text-neutral-400" dir="ltr">{it.nameAlt}</p>
                      </td>
                      <td className="px-4 py-3"><CategoryBadge cat={it.category} /></td>
                      <td className="px-4 py-3 font-cairo text-[13px] text-neutral-700">{it.uom}</td>
                      <td className="px-4 py-3">
                        <span className={`font-cairo font-bold text-[13px] ${isCrit ? 'text-red-500' : 'text-neutral-900'}`}>
                          {fmtNum(it.currentStock)}
                        </span>
                        {isCrit && <AlertTriangle size={12} className="inline ms-1 text-red-400" />}
                      </td>
                      <td className="px-4 py-3 font-cairo text-[12px] text-neutral-500">
                        {fmtNum(it.minStock)} / {fmtNum(it.maxStock)}
                      </td>
                      <td className="px-4 py-3">
                        <StockBar current={it.currentStock} min={it.minStock} max={it.maxStock} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewItem(it)}
                            className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="عرض التفاصيل">
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={itemPage} totalPages={itemTotalPages} setPage={setItemPage} total={filtered.length} unit="صنف" />
        </div>
      </div>

      {/* View Item Drawer */}
      {viewItem && (
        <div className="fixed inset-0 z-[600] flex" dir="rtl">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative mr-auto w-full max-w-[440px] h-full bg-white shadow-2xl flex flex-col">
            <div className="shrink-0 px-6 py-5 border-b border-neutral-100 bg-gradient-to-l from-primary-50 to-white flex items-start justify-between gap-4">
              <button onClick={() => setViewItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-white hover:text-neutral-700 transition-colors mt-0.5">
                <X size={16} />
              </button>
              <div className="text-start">
                <div className="flex items-center gap-2 mb-1">
                  <CategoryBadge cat={viewItem.category} />
                  <span className="font-cairo text-[12px] text-neutral-400">{viewItem.code}</span>
                </div>
                <h2 className="font-cairo font-bold text-[18px] text-neutral-900">{viewItem.name}</h2>
                <p className="font-cairo text-[12px] text-neutral-500" dir="ltr">{viewItem.nameAlt}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Stock cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: 'الرصيد الحالي', v: fmtNum(viewItem.currentStock) + ' ' + viewItem.uom, clr: viewItem.currentStock < viewItem.minStock ? 'text-red-500' : 'text-success-700', bg: viewItem.currentStock < viewItem.minStock ? 'bg-red-50' : 'bg-success-50' },
                  { l: 'الحد الأدنى', v: fmtNum(viewItem.minStock) + ' ' + viewItem.uom, clr: 'text-warning-700', bg: 'bg-warning-50' },
                  { l: 'الحد الأقصى', v: fmtNum(viewItem.maxStock) + ' ' + viewItem.uom, clr: 'text-neutral-700', bg: 'bg-neutral-100' },
                ].map(c => (
                  <div key={c.l} className={`${c.bg} rounded-[12px] p-3 text-center`}>
                    <p className="font-cairo text-[10px] text-neutral-500 mb-1">{c.l}</p>
                    <p className={`font-cairo font-bold text-[13px] ${c.clr}`}>{c.v}</p>
                  </div>
                ))}
              </div>
              <StockBar current={viewItem.currentStock} min={viewItem.minStock} max={viewItem.maxStock} />
              {[
                { l: 'الاستهلاك اليومي', v: `${fmtNum(viewItem.dailyUsage)} ${viewItem.uom}` },
                { l: 'الأيام المتبقية', v: viewItem.dailyUsage > 0 ? `${Math.round(viewItem.currentStock / viewItem.dailyUsage)} يوم` : '—' },
                { l: 'كمية إعادة الطلب', v: `${fmtNum(viewItem.reorderQty)} ${viewItem.uom}` },
                { l: 'متوسط زمن التسليم', v: `${viewItem.avgDeliveryDays} أيام` },
                { l: 'وحدة القياس', v: viewItem.uom },
                { l: 'الباركود', v: viewItem.barcode, ltr: true },
              ].map(r => (
                <div key={r.l} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <span className="font-cairo text-[12px] text-neutral-500">{r.l}</span>
                  <span className={`font-cairo font-semibold text-[13px] text-neutral-900 ${r.ltr ? 'dir-ltr' : ''}`} dir={r.ltr ? 'ltr' : 'rtl'}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/60">
              <div>
                <h2 className="font-cairo font-bold text-[15px] text-neutral-900">إضافة صنف جديد</h2>
                <p className="font-cairo text-[11px] text-neutral-400 mt-0.5">أدخل بيانات الصنف</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>��لكود <span className="text-red-400 normal-case">*</span></label>
                  <input value={form.code || ''} onChange={e => ff('code', e.target.value)} placeholder="FD015" className={inp} dir="ltr" />
                </div>
                <div>
                  <label className={lbl}>الفئة</label>
                  <select value={form.category} onChange={e => ff('category', e.target.value as ItemCategory)} className={inp + ' cursor-pointer'}>
                    {Object.entries(CAT_CFG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>الاسم العربي <span className="text-red-400 normal-case">*</span></label>
                  <input value={form.name || ''} onChange={e => ff('name', e.target.value)} placeholder="اسم الصنف بالعربي" className={inp} dir="rtl" />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>الاسم البديل (إنجليزي)</label>
                  <input value={form.nameAlt || ''} onChange={e => ff('nameAlt', e.target.value)} placeholder="English Name" className={inp} dir="ltr" />
                </div>
                <div>
                  <label className={lbl}>وحدة القياس</label>
                  <select value={form.uom} onChange={e => ff('uom', e.target.value)} className={inp + ' cursor-pointer'}>
                    {['طن', 'كج', 'لتر', 'قطعة', 'علبة', 'أمبول��', 'جرام'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>الباركود</label>
                  <input value={form.barcode || ''} onChange={e => ff('barcode', e.target.value)} placeholder="6281001..." className={inp} dir="ltr" />
                </div>
                <div>
                  <label className={lbl}>الحد الأدنى</label>
                  <input type="number" min={0} value={form.minStock || ''} onChange={e => ff('minStock', +e.target.value)} placeholder="0" className={inp} dir="ltr" />
                </div>
                <div>
                  <label className={lbl}>الحد الأقصى</label>
                  <input type="number" min={0} value={form.maxStock || ''} onChange={e => ff('maxStock', +e.target.value)} placeholder="0" className={inp} dir="ltr" />
                </div>
                <div>
                  <label className={lbl}>كمية إعادة الطلب</label>
                  <input type="number" min={0} value={form.reorderQty || ''} onChange={e => ff('reorderQty', +e.target.value)} placeholder="0" className={inp} dir="ltr" />
                </div>
                <div>
                  <label className={lbl}>متوسط زمن التسليم (أيام)</label>
                  <input type="number" min={1} value={form.avgDeliveryDays || ''} onChange={e => ff('avgDeliveryDays', +e.target.value)} placeholder="3" className={inp} dir="ltr" />
                </div>
              </div>
            </div>
            <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
              <button onClick={saveItem}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm">
                <Check size={15} /> حفظ الصنف
              </button>
              <button onClick={() => setShowAdd(false)}
                className="h-10 px-5 rounded-[10px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — مخازن (Warehouses)
// ─────────────────────────────────────────────────────────────────────────────

type WhType = 'أدوية' | 'أغذية' | 'قطع غيار' | 'زيوت وسولار'

const WH_TYPES: WhType[] = ['أدوية', 'أغذية', 'قطع غيار', 'زيوت وسولار']

const WH_TYPE_CFG: Record<WhType, { color: string; bg: string; icon: React.ElementType; dot: string }> = {
  'أدوية': { color: 'text-info-700', bg: 'bg-info-50', icon: Pill, dot: 'bg-info-500' },
  'أغذية': { color: 'text-success-700', bg: 'bg-success-50', icon: Leaf, dot: 'bg-success-500' },
  'قطع غيار': { color: 'text-neutral-600', bg: 'bg-neutral-200', icon: Wrench, dot: 'bg-neutral-500' },
  'زيوت وسولار': { color: 'text-warning-700', bg: 'bg-warning-50', icon: Fuel, dot: 'bg-warning-500' },
}

type WhFormState = {
  name: string; type: WhType; status: 'active' | 'inactive'
  responsibleUsers: string; locations: string[]; notes: string
}

const emptyWhForm = (): WhFormState => ({
  name: '', type: 'أغذية', status: 'active', responsibleUsers: '', locations: [], notes: '',
})

// Map API WarehouseItem → local WhItem shape
function mapApiWarehouse(api: ApiWarehouseItem): WhItem {
  return {
    id: String(api.id),
    code: api.warehouseCode,
    name: api.name,
    type: api.warehouseType,
    responsibleUsers: api.responsibleEmployeeName ? [api.responsibleEmployeeName] : [],
    status: api.status === 'Active' ? 'active' : 'inactive',
    locations: [],
    notes: api.notes ?? '',
  }
}

function WarehousesTab() {
  const [warehouses, setWarehouses] = useState<WhItem[]>(INIT_WAREHOUSES)
  const [loadingWh, setLoadingWh] = useState(true)
  const [viewWh, setViewWh] = useState<WhItem | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<WhType | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editWh, setEditWh] = useState<WhItem | null>(null)
  const [form, setForm] = useState<WhFormState>(emptyWhForm())
  const [locInput, setLocInput] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<WhItem | null>(null)
  const [savingWh, setSavingWh] = useState(false)

  const fetchWarehouses = async () => {
    setLoadingWh(true)
    try {
      const res = await warehousesApi.getAll()
      if (res.isSuccess && res.data?.length) {
        setWarehouses(res.data.map(mapApiWarehouse))
        console.log('[WarehousesTab] Loaded', res.data.length, 'warehouses from API')
      } else {
        console.warn('[WarehousesTab] No data from API, using mock fallback')
        setWarehouses(INIT_WAREHOUSES)
      }
    } catch (e) {
      console.error('[WarehousesTab] Failed to load warehouses:', e)
      setWarehouses(INIT_WAREHOUSES)
    } finally {
      setLoadingWh(false)
    }
  }

  useEffect(() => { fetchWarehouses() }, [])

  const filtered = warehouses.filter(w => {
    const q = search.trim().toLowerCase()
    const matchQ = !q || w.name.includes(search) || w.code.toLowerCase().includes(q)
    const matchT = typeFilter === 'all' || w.type === typeFilter
    return matchQ && matchT
  })

  const [whPage, setWhPage] = useState(1)
  useEffect(() => { setWhPage(1) }, [search, typeFilter])
  const whTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedWh = filtered.slice((whPage - 1) * PAGE_SIZE, whPage * PAGE_SIZE)

  function openAdd() {
    setEditWh(null); setForm(emptyWhForm()); setLocInput(''); setShowModal(true)
  }
  function openEdit(wh: WhItem) {
    setEditWh(wh)
    setForm({
      name: wh.name, type: (wh.type as WhType) || 'أغذية', status: wh.status,
      responsibleUsers: wh.responsibleUsers.join('، '),
      locations: wh.locations.map(l => l.name), notes: wh.notes,
    })
    setLocInput(''); setShowModal(true)
  }
  function addLoc() {
    const v = locInput.trim(); if (!v) return
    setForm(f => ({ ...f, locations: [...f.locations, v] })); setLocInput('')
  }
  function removeLoc(idx: number) {
    setForm(f => ({ ...f, locations: f.locations.filter((_, i) => i !== idx) }))
  }
  async function save() {
    if (!form.name.trim()) return
    setSavingWh(true)
    try {
      const dto = {
        warehouseCode: editWh?.code ?? `WH${String(warehouses.length + 1).padStart(3, '0')}`,
        name: form.name,
        warehouseType: form.type,
        status: form.status === 'active' ? 'Active' : 'Inactive',
        totalCapacity: 0,
        currentUtilization: 0,
        notes: form.notes,
      }
      if (editWh) {
        await warehousesApi.update(Number(editWh.id), { ...dto, id: Number(editWh.id) })
        toast.success('تم تحديث المخزن بنجاح')
      } else {
        await warehousesApi.create(dto)
        toast.success('تم إضافة المخزن بنجاح')
      }
      setShowModal(false)
      setForm(emptyWhForm())
      await fetchWarehouses()
    } catch (err) {
      console.error('[WarehousesTab] save error:', err)
      toast.error('فشل حفظ المخزن: ' + (err instanceof Error ? err.message : 'خطأ غير معروف'))
    } finally {
      setSavingWh(false)
    }
    setShowModal(false)
  }
  function confirmDeleteWh() {
    if (!deleteTarget) return
    setWarehouses(ws => ws.filter(w => w.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const inp = 'w-full h-9 px-3 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white placeholder:text-neutral-300'
  const lbl = 'block font-cairo font-semibold text-[11px] text-neutral-500 mb-1'

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي المخازن" value={warehouses.length} sub="مخزن مسجّل" icon={Warehouse} iconColor="text-primary-500" iconBg="bg-primary-50" />
        <StatCard label="أغذية" value={warehouses.filter(w => w.type === 'أغذية').length} sub="مخزن أغذية" icon={Leaf} iconColor="text-success-600" iconBg="bg-success-50" />
        <StatCard label="أدوية" value={warehouses.filter(w => w.type === 'أدوية').length} sub="مخزن دواء" icon={Pill} iconColor="text-info-600" iconBg="bg-info-50" />
        <StatCard label="إجمالي المواقع" value={warehouses.reduce((s, w) => s + w.locations.length, 0)} sub="موقع داخلي" icon={MapPin} iconColor="text-warning-600" iconBg="bg-warning-50" />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-[16px] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم أو كود المخزن..."
            className="w-full h-9 ps-8 pe-3 rounded-[8px] border border-neutral-200 font-cairo text-[13px] focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 placeholder:text-neutral-300" />
        </div>
        {/* Type filter dropdown */}
        <div className="relative">
          <Filter size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as WhType | 'all')}
            className="h-9 ps-8 pe-8 rounded-[8px] border border-neutral-200 bg-white font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 cursor-pointer appearance-none"
          >
            <option value="all">كل الأنواع</option>
            {WH_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-[10px] bg-primary-500 text-white font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm shrink-0 ms-auto">
          <Plus size={15} /> إضافة مخزن
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-[16px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70">
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide w-10">#</th>
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">الكود</th>
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">اسم المخزن</th>
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">النوع</th>
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">المواقع الداخلية</th>
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">المسؤولون</th>
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide">الحالة</th>
                <th className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide w-24">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-16">
                  <EmptyState icon={Warehouse} title="لا توجد مخازن" sub="أضف مخزناً جديداً باستخدام الزر أعلاه" />
                </td></tr>
              ) : pagedWh.map((wh, idx) => {
                const cfg = WH_TYPE_CFG[(wh.type as WhType)] ?? WH_TYPE_CFG['أغذية']
                const WIcon = cfg.icon
                return (
                  <tr key={wh.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3 font-cairo text-[12px] text-neutral-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-cairo font-bold text-[12px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{wh.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-[8px] ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <WIcon size={15} className={cfg.color} />
                        </div>
                        <div>
                          <p className="font-cairo font-semibold text-[13px] text-neutral-900">{wh.name}</p>
                          {wh.notes && <p className="font-cairo text-[11px] text-neutral-400 truncate max-w-[200px]">{wh.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {wh.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {wh.locations.slice(0, 3).map(loc => (
                          <span key={loc.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-cairo text-[10px]">
                            <MapPin size={8} className="text-neutral-400" /> {loc.name}
                          </span>
                        ))}
                        {wh.locations.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded font-cairo text-[10px]">+{wh.locations.length - 3}</span>
                        )}
                        {wh.locations.length === 0 && <span className="font-cairo text-[11px] text-neutral-300">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-cairo text-[12px] text-neutral-600">
                        {wh.responsibleUsers[0] ?? '—'}{wh.responsibleUsers.length > 1 ? ` +${wh.responsibleUsers.length - 1}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${wh.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${wh.status === 'active' ? 'bg-success-500' : 'bg-neutral-400'}`} />
                        {wh.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewWh(wh)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="عرض التفاصيل">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openEdit(wh)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(wh)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={whPage} totalPages={whTotalPages} setPage={setWhPage} total={filtered.length} unit="مخزن" />
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[520px] flex flex-col max-h-[90vh]">
            <div className="shrink-0 px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-primary-50 flex items-center justify-center">
                  <Warehouse size={18} className="text-primary-500" />
                </div>
                <h2 className="font-cairo font-bold text-[17px] text-neutral-900">{editWh ? 'تعديل المخزن' : 'إضافة مخزن جديد'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className={lbl}>اسم المخزن <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="مثال: مخزن الأعلاف الرئيسي" className={inp} />
              </div>

              {/* Type grid */}
              <div>
                <label className={lbl}>نوع المخزن</label>
                <div className="grid grid-cols-3 gap-2">
                  {WH_TYPES.map(t => {
                    const cfg = WH_TYPE_CFG[t]; const TIcon = cfg.icon
                    const selected = form.type === t
                    return (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={['flex flex-col items-center gap-1.5 py-3 px-2 rounded-[10px] border-2 transition-all font-cairo text-[12px] font-semibold',
                          selected ? `border-primary-400 ${cfg.bg} ${cfg.color}` : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50',
                        ].join(' ')}>
                        <TIcon size={18} className={selected ? cfg.color : 'text-neutral-400'} />
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={lbl}>الحالة</label>
                <div className="flex gap-2">
                  {(['active', 'inactive'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={['flex-1 h-9 rounded-[8px] border-2 font-cairo font-semibold text-[12px] transition-all',
                        form.status === s
                          ? s === 'active' ? 'border-success-400 bg-success-50 text-success-700' : 'border-neutral-300 bg-neutral-100 text-neutral-600'
                          : 'border-neutral-200 text-neutral-400 hover:border-neutral-300',
                      ].join(' ')}>
                      {s === 'active' ? 'نشط' : 'غير نشط'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsible */}
              <div>
                <label className={lbl}>المسؤولون (افصل بفاصلة)</label>
                <input value={form.responsibleUsers} onChange={e => setForm(f => ({ ...f, responsibleUsers: e.target.value }))}
                  placeholder="مثال: محمد علي، أحمد سالم" className={inp} />
              </div>

              {/* Locations */}
              <div>
                <label className={lbl}>المواقع الداخلية</label>
                <div className="flex gap-2 mb-2">
                  <input value={locInput} onChange={e => setLocInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLoc() } }}
                    placeholder="اسم الموقع أو الرف..." className={inp + ' flex-1'} />
                  <button onClick={addLoc} type="button"
                    className="h-9 px-3 rounded-[8px] bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors shrink-0">
                    <Plus size={15} />
                  </button>
                </div>
                {form.locations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.locations.map((loc, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full font-cairo text-[11px]">
                        <MapPin size={9} className="text-neutral-400" /> {loc}
                        <button onClick={() => removeLoc(i)}
                          className="w-3.5 h-3.5 rounded-full text-neutral-400 hover:text-red-500 flex items-center justify-center ms-0.5">
                          <X size={8} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className={lbl}>ملاحظات</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="ملاحظات إضافية..."
                  className="w-full px-3 py-2 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white placeholder:text-neutral-300 resize-none" />
              </div>
            </div>

            <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
              <button onClick={save}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm">
                <Check size={15} /> {editWh ? 'حفظ التعديلات' : 'إضافة المخزن'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="h-10 px-5 rounded-[10px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.name}
          itemType="المخزن"
          onConfirm={confirmDeleteWh}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Warehouse View Modal ─────────────────────────────────────────────── */}
      {viewWh && (() => {
        const cfg = WH_TYPE_CFG[(viewWh.type as WhType)] ?? WH_TYPE_CFG['أغذية']
        const WHIcon = cfg.icon
        // Mock inventory summary per category inside this warehouse
        const whItems = INIT_ITEMS.filter(i => i.category === (viewWh.type === 'أغذية' ? 'feed' : viewWh.type === 'أدوية' ? 'medicine' : viewWh.type === 'قطع غيار' ? 'spare_part' : 'oil_diesel'))
        const totalQty = whItems.reduce((s, i) => s + i.currentStock, 0)
        return (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewWh(null)} />
            <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[660px] max-h-[88vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="shrink-0 px-6 py-5 border-b border-neutral-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[12px] ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <WHIcon size={20} className={cfg.color} />
                    </div>
                    <div>
                      <h2 className="font-cairo font-bold text-[17px] text-neutral-900">{viewWh.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-cairo text-[12px] text-neutral-400">{viewWh.code}</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{viewWh.type}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${viewWh.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${viewWh.status === 'active' ? 'bg-success-500' : 'bg-neutral-400'}`} />
                          {viewWh.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setViewWh(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100">
                    <X size={16} />
                  </button>
                </div>
                {/* Summary pills */}
                <div className="flex gap-3 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-[8px]">
                    <Package2 size={13} className="text-primary-500" />
                    <span className="font-cairo font-bold text-[13px] text-primary-700">{whItems.length} صنف</span>
                    <span className="font-cairo text-[11px] text-primary-500">إجمالي الأصناف</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-[8px]">
                    <Boxes size={13} className="text-neutral-500" />
                    <span className="font-cairo font-bold text-[13px] text-neutral-700">{fmtNum(totalQty)}</span>
                    <span className="font-cairo text-[11px] text-neutral-500">إجمالي الكميات</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-[8px]">
                    <MapPin size={13} className="text-neutral-500" />
                    <span className="font-cairo font-bold text-[13px] text-neutral-700">{viewWh.locations.length} موقع</span>
                    <span className="font-cairo text-[11px] text-neutral-500">أماكن داخلية</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Locations table */}
                {viewWh.locations.length > 0 && (
                  <div className="border-b border-neutral-100">
                    <div className="px-5 py-3 bg-neutral-50 flex items-center gap-2">
                      <MapPin size={13} className="text-neutral-500" />
                      <span className="font-cairo font-bold text-[12px] text-neutral-600">جدول الأماكن الداخلية</span>
                    </div>
                    <table className="w-full">
                      <thead className="border-b border-neutral-100">
                        <tr>
                          {['#', 'اسم الموقع / الرف', 'حالة'].map(h => (
                            <th key={h} className="px-5 py-2.5 text-start font-cairo font-semibold text-[11px] text-neutral-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {viewWh.locations.map((loc, i) => (
                          <tr key={loc.id} className="hover:bg-neutral-50/50">
                            <td className="px-5 py-2.5 font-cairo text-[12px] text-neutral-400">{i + 1}</td>
                            <td className="px-5 py-2.5">
                              <span className="inline-flex items-center gap-1.5 font-cairo font-semibold text-[13px] text-neutral-800">
                                <MapPin size={10} className="text-neutral-400" /> {loc.name}
                              </span>
                            </td>
                            <td className="px-5 py-2.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success-50 text-success-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-success-500" /> فعال
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Inventory summary */}
                <div>
                  <div className="px-5 py-3 bg-neutral-50 flex items-center gap-2 border-b border-neutral-100">
                    <Package2 size={13} className="text-neutral-500" />
                    <span className="font-cairo font-bold text-[12px] text-neutral-600">إجمالي الأصناف والكميات والأسعار في المخزن</span>
                  </div>
                  {whItems.length === 0 ? (
                    <div className="py-8 text-center font-cairo text-[13px] text-neutral-400">لا توجد أصناف مسجلة في هذا المخزن</div>
                  ) : (
                    <table className="w-full">
                      <thead className="border-b border-neutral-100">
                        <tr>
                          {['الصنف', 'الفئة', 'الكمية الحالية', 'الوحدة', 'الحد الأدنى', 'المستوى'].map(h => (
                            <th key={h} className="px-5 py-2.5 text-start font-cairo font-semibold text-[11px] text-neutral-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {whItems.map(it => {
                          const isCrit = it.currentStock < it.minStock
                          return (
                            <tr key={it.id} className="hover:bg-neutral-50/50">
                              <td className="px-5 py-2.5">
                                <p className="font-cairo font-semibold text-[13px] text-neutral-900">{it.name}</p>
                                <p className="font-cairo text-[11px] text-neutral-400">{it.code}</p>
                              </td>
                              <td className="px-5 py-2.5"><CategoryBadge cat={it.category} /></td>
                              <td className="px-5 py-2.5">
                                <span className={`font-cairo font-bold text-[13px] ${isCrit ? 'text-red-500' : 'text-neutral-900'}`}>
                                  {fmtNum(it.currentStock)}
                                </span>
                                {isCrit && <AlertTriangle size={11} className="inline ms-1 text-red-400" />}
                              </td>
                              <td className="px-5 py-2.5 font-cairo text-[12px] text-neutral-500">{it.uom}</td>
                              <td className="px-5 py-2.5 font-cairo text-[12px] text-neutral-600">{fmtNum(it.minStock)}</td>
                              <td className="px-5 py-2.5">
                                <StockBar current={it.currentStock} min={it.minStock} max={it.maxStock} />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="border-t-2 border-neutral-200 bg-neutral-50">
                        <tr>
                          <td className="px-5 py-2.5 font-cairo font-bold text-[13px] text-neutral-700" colSpan={2}>الإجمالي</td>
                          <td className="px-5 py-2.5 font-cairo font-bold text-[14px] text-primary-700">{fmtNum(totalQty)}</td>
                          <td colSpan={3} />
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>

                {/* Notes */}
                {viewWh.notes && (
                  <div className="px-6 py-4 border-t border-neutral-100">
                    <p className="font-cairo text-[11px] font-semibold text-neutral-400 mb-1">ملاحظات</p>
                    <p className="font-cairo text-[13px] text-neutral-700">{viewWh.notes}</p>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
                <button onClick={() => { setViewWh(null); openEdit(viewWh) }}
                  className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-bold text-[13px] hover:bg-primary-600 transition-colors shadow-sm">
                  <Edit2 size={15} /> تعديل المخزن
                </button>
                <button onClick={() => setViewWh(null)}
                  className="h-10 px-5 rounded-[10px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — ميكسرات (Mixers)
// ─────────────────────────────────────────────────────────────────────────────

type MixerFormIngredient = { id: string; itemId: string; itemName: string; weight: number; uom: string; notes: string }
type MixerFormState = { code: string; name: string; type: string; notes: string; ingredients: MixerFormIngredient[] }

const emptyIngredient = (): MixerFormIngredient => ({ id: `ing-${Date.now()}`, itemId: '', itemName: '', weight: 0, uom: 'كج', notes: '' })
const emptyForm = (): MixerFormState => ({
  code: '', name: '', type: 'علف مركب', notes: '',
  ingredients: [emptyIngredient()],
})

// ── Item combobox — أغذية وأعلاف فقط ────────────────────────────────────────
const INV_FEED = INIT_ITEMS.filter(i => i.category === 'feed')

function ItemCombobox({ value, onSelect }: { value: string; onSelect: (item: Item) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = !query
    ? INV_FEED
    : INV_FEED.filter(i =>
      i.name.includes(query) ||
      i.nameAlt.toLowerCase().includes(query.toLowerCase()) ||
      i.code.toLowerCase().includes(query.toLowerCase())
    )

  function pick(item: Item) { setQuery(''); setOpen(false); onSelect(item) }

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        className={[
          'flex items-center gap-2 h-8 px-2.5 rounded-[8px] border cursor-pointer transition-all bg-white',
          open ? 'border-primary-400 ring-1 ring-primary-400/30' : 'border-neutral-200 hover:border-neutral-300',
        ].join(' ')}
      >
        {open ? (
          <input
            autoFocus
            value={query}
            onChange={e => { e.stopPropagation(); setQuery(e.target.value) }}
            onClick={e => e.stopPropagation()}
            placeholder="بحث بالاسم أو الكود..."
            dir="rtl"
            className="flex-1 bg-transparent outline-none font-cairo text-[13px] text-neutral-900 placeholder:text-neutral-300 min-w-0"
          />
        ) : (
          <span className={`flex-1 font-cairo text-[13px] truncate ${value ? 'text-neutral-900' : 'text-neutral-300'}`} dir="rtl">
            {value || 'اختر صنفاً...'}
          </span>
        )}
        <ChevronDown size={12} className={`text-neutral-400 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-[999] top-full mt-1 right-0 left-0 bg-white border border-neutral-200 rounded-[10px] shadow-2xl max-h-[240px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="font-cairo text-[12px] text-neutral-400 text-center py-5">لا توجد نتائج مطابقة</p>
          ) : filtered.map(item => (
            <button key={item.id} onMouseDown={() => pick(item)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 transition-colors text-start group border-b border-neutral-50 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="font-cairo font-semibold text-[13px] text-neutral-900 group-hover:text-primary-700 truncate">{item.name}</p>
                <p className="font-cairo text-[10px] text-neutral-400">{item.code} · رصيد: {fmtNum(item.currentStock)} {item.uom}</p>
              </div>
              <span className="font-cairo text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">{item.uom}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MixersTab() {
  const [mixers, setMixers] = useState<Mixer[]>(INIT_MIXERS)
  const [mixerSearch, setMixerSearch] = useState('')
  const [viewMixer, setViewMixer] = useState<Mixer | null>(null)
  const [editMixer, setEditMixer] = useState<Mixer | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [cloneId, setCloneId] = useState<string>('')
  const [form, setForm] = useState<MixerFormState>(emptyForm())

  const filteredMixers = useMemo(() =>
    !mixerSearch.trim()
      ? mixers
      : mixers.filter(m =>
          m.name.includes(mixerSearch) ||
          m.code.toLowerCase().includes(mixerSearch.toLowerCase()) ||
          m.type.includes(mixerSearch)
        )
  , [mixers, mixerSearch])

  const [mxPage, setMxPage] = useState(1)
  useEffect(() => { setMxPage(1) }, [mixerSearch])
  const mxTotalPages = Math.max(1, Math.ceil(filteredMixers.length / PAGE_SIZE))
  const pagedMixers = filteredMixers.slice((mxPage - 1) * PAGE_SIZE, mxPage * PAGE_SIZE)

  const inp = 'w-full h-9 px-3 rounded-[10px] border border-neutral-200 bg-white text-[13px] font-cairo text-neutral-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400'
  const lbl = 'block text-[11px] font-semibold text-neutral-500 mb-1 uppercase tracking-wide'

  function openAdd() {
    setEditMixer(null); setCloneId(''); setForm(emptyForm()); setShowModal(true)
  }
  function openEdit(mx: Mixer) {
    setEditMixer(mx); setCloneId('')
    setForm({
      code: mx.code, name: mx.name, type: mx.type, notes: mx.notes,
      ingredients: mx.ingredients.map(i => ({ id: i.id, itemId: '', itemName: i.itemName, weight: i.weight, uom: i.uom, notes: i.notes }))
    })
    setShowModal(true)
  }
  function applyClone(id: string) {
    setCloneId(id)
    if (!id) { setForm(f => ({ ...f, ingredients: [emptyIngredient()] })); return }
    const src = mixers.find(m => m.id === id)
    if (!src) return
    setForm(f => ({ ...f, ingredients: src.ingredients.map(i => ({ id: `ing-${Date.now()}-${i.id}`, itemId: '', itemName: i.itemName, weight: i.weight, uom: i.uom, notes: i.notes })) }))
  }
  function addIngRow() { setForm(f => ({ ...f, ingredients: [...f.ingredients, emptyIngredient()] })) }
  function removeIngRow(id: string) { setForm(f => ({ ...f, ingredients: f.ingredients.filter(i => i.id !== id) })) }
  function setIng(id: string, field: keyof MixerFormIngredient, val: string | number) {
    setForm(f => ({ ...f, ingredients: f.ingredients.map(i => i.id === id ? { ...i, [field]: val } : i) }))
  }
  function selectIngItem(id: string, item: Item) {
    setForm(f => ({
      ...f, ingredients: f.ingredients.map(i =>
        i.id === id ? { ...i, itemId: item.id, itemName: item.name, uom: item.uom } : i
      )
    }))
  }
  function saveMixer() {
    if (!form.name.trim()) return
    const ingredients: MixerIngredient[] = form.ingredients
      .filter(i => i.itemName.trim())
      .map(i => ({ ...i, qty: 1, status: 'active' as const }))
    if (editMixer) {
      const updated: Mixer = { ...editMixer, ...form, ingredients }
      setMixers(prev => prev.map(m => m.id === editMixer.id ? updated : m))
      if (viewMixer?.id === editMixer.id) setViewMixer(updated)
    } else {
      setMixers(prev => [...prev, { id: `mx${Date.now()}`, ...form, status: 'active', ingredients }])
    }
    setShowModal(false)
  }

  const totalIngredients = mixers.reduce((s, m) => s + m.ingredients.length, 0)

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="إجمالي الميكسرات" value={mixers.length} sub="ميكسر مسجّل" icon={Layers} iconColor="text-primary-500" iconBg="bg-primary-50" />
        <StatCard label="ميكسرات نشطة" value={mixers.filter(m => m.status === 'active').length} sub="يعمل حالياً" icon={CheckCircle2} iconColor="text-success-600" iconBg="bg-success-50" />
        <StatCard label="إجمالي المكونات" value={totalIngredients} sub="مكوّن علفي" icon={ClipboardList} iconColor="text-warning-600" iconBg="bg-warning-50" />
      </div>

      {/* Table card */}
      <div className="bg-white border border-neutral-200 rounded-[16px] overflow-hidden shadow-sm">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 h-9 px-3 rounded-[10px] bg-neutral-50 border border-neutral-200 flex-1 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400/30 transition-all">
            <Search size={13} className="text-neutral-400 shrink-0" />
            <input
              value={mixerSearch}
              onChange={e => setMixerSearch(e.target.value)}
              placeholder="بحث بالاسم أو الكود..."
              className="flex-1 bg-transparent outline-none font-cairo text-[13px] placeholder:text-neutral-400"
              dir="rtl"
            />
            {mixerSearch && <button onClick={() => setMixerSearch('')}><X size={12} className="text-neutral-400" /></button>}
          </div>
          <p className="font-cairo text-[13px] text-neutral-400 shrink-0">{filteredMixers.length} ميكسر</p>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 h-9 bg-primary-500 text-white rounded-[10px] font-cairo font-semibold text-[13px] hover:bg-primary-600 active:scale-[0.98] transition-all shadow-sm shrink-0">
            <Plus size={15} /> إضافة ميكسر
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                {['الكود', 'اسم الميكسر', 'النوع', 'المكونات', 'وزن الوجبة', 'الحالة', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredMixers.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icon={Layers} title="لا توجد ميكسرات" sub="حاول تغيير كلمة البحث" /></td></tr>
              ) : pagedMixers.map(mx => {
                const totalWeight = mx.ingredients.reduce((s, i) => s + i.weight, 0)
                const activeIngs = mx.ingredients.filter(i => i.status === 'active')
                return (
                  <tr key={mx.id} className="hover:bg-neutral-50/60 transition-colors group">

                    <td className="px-5 py-3.5">
                      <span className="font-cairo font-semibold text-[12px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">{mx.code}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-cairo font-semibold text-[14px] text-neutral-900">{mx.name}</p>
                      {mx.notes && <p className="font-cairo text-[11px] text-neutral-400 mt-0.5 truncate max-w-[200px]">{mx.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-cairo text-[13px] text-neutral-600 whitespace-nowrap">{mx.type}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-cairo font-semibold text-[13px] text-neutral-700">{activeIngs.length}</span>
                      <span className="font-cairo text-[11px] text-neutral-400 mr-1">مكوّن</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-cairo font-bold text-[14px] text-primary-600">{fmtNum(totalWeight)}</span>
                      <span className="font-cairo text-[11px] text-neutral-400 mr-1">كج</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${mx.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${mx.status === 'active' ? 'bg-success-500' : 'bg-neutral-400'}`} />
                        {mx.status === 'active' ? 'نشط' : 'متوقف'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewMixer(mx)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="عرض التفاصيل">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openEdit(mx)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="تعديل">
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={mxPage} totalPages={mxTotalPages} setPage={setMxPage} total={filteredMixers.length} unit="ميكسر" />
      </div>

      {/* ── View Modal ──────────────────────────────────────────────────────────── */}
      {viewMixer && (() => {
        const total = viewMixer.ingredients.reduce((s, i) => s + i.weight, 0)
        return (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewMixer(null)} />
            <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[620px] max-h-[88vh] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="shrink-0 px-6 py-5 border-b border-neutral-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-cairo font-bold text-[17px] text-neutral-900 mb-1">{viewMixer.name}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-cairo text-[12px] text-neutral-500">{viewMixer.code} · {viewMixer.type}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${viewMixer.status === 'active' ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${viewMixer.status === 'active' ? 'bg-success-500' : 'bg-neutral-400'}`} />
                        {viewMixer.status === 'active' ? 'نشط' : 'متوقف'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setViewMixer(null); openEdit(viewMixer) }}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[12px] hover:bg-neutral-50 transition-colors">
                      <Edit2 size={13} /> تعديل
                    </button>
                    <button onClick={() => setViewMixer(null)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 rounded-[8px]">
                    <Scale size={13} className="text-primary-500" />
                    <span className="font-cairo font-bold text-[13px] text-primary-700">{fmtNum(total)} كج</span>
                    <span className="font-cairo text-[11px] text-primary-500">وزن الوجبة</span>
                  </div>
                  <div className="px-3 py-1.5 bg-neutral-100 rounded-[8px]">
                    <span className="font-cairo text-[12px] text-neutral-600">{viewMixer.ingredients.filter(i => i.status === 'active').length} مكوّن نشط</span>
                  </div>
                </div>
              </div>

              {/* Ingredients table */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-100 sticky top-0">
                    <tr>
                      {['المكوّن', 'الوزن (كج)', 'الوحدة', 'النسبة', 'ملاحظات', 'الحالة'].map(h => (
                        <th key={h} className="px-5 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {viewMixer.ingredients.map(ing => {
                      const pct = total > 0 ? ((ing.weight / total) * 100) : 0
                      const isActive = ing.status === 'active'
                      return (
                        <tr key={ing.id} className={`hover:bg-neutral-50/50 ${!isActive ? 'opacity-50' : ''}`}>
                          <td className="px-5 py-3 font-cairo font-semibold text-[13px] text-neutral-900">{ing.itemName}</td>
                          <td className="px-5 py-3 font-cairo font-bold text-[14px] text-primary-600">{fmtNum(ing.weight)}</td>
                          <td className="px-5 py-3 font-cairo text-[12px] text-neutral-500">{ing.uom}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-cairo text-[12px] text-neutral-600 w-10 shrink-0">{pct.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-cairo text-[12px] text-neutral-400">{ing.notes || '—'}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500' : 'bg-neutral-400'}`} />
                              {isActive ? 'فعال' : 'عاطل'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-neutral-200 bg-neutral-50">
                    <tr>
                      <td className="px-5 py-3 font-cairo font-bold text-[13px] text-neutral-700">الإجمالي</td>
                      <td className="px-5 py-3 font-cairo font-bold text-[14px] text-primary-700">{fmtNum(total)}</td>
                      <td className="px-5 py-3 font-cairo text-[12px] text-neutral-500">كج</td>
                      <td className="px-5 py-3 font-cairo font-bold text-[12px] text-neutral-700">100%</td>
                      <td /><td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-neutral-100 flex justify-end">
                <button onClick={() => setViewMixer(null)}
                  className="h-9 px-5 rounded-[9px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-colors">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[660px] max-h-[92vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div>
                <h2 className="font-cairo font-bold text-[16px] text-neutral-900">
                  {editMixer ? `تعديل: ${editMixer.name}` : 'إضافة ميكسر جديد'}
                </h2>
                <p className="font-cairo text-[12px] text-neutral-400 mt-0.5">
                  {editMixer ? 'تعديل بيانات ومكونات الميكسر' : 'يمكنك الاستنساخ من ميكسر موجود كنقطة بداية'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Clone picker — add mode only */}
              {!editMixer && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-[12px] px-4 py-3.5">
                  <label className="block font-cairo font-semibold text-[12px] text-neutral-500 mb-2">
                    استنساخ من ميكسر موجود <span className="font-normal opacity-60">(اختياري)</span>
                  </label>
                  <select value={cloneId} onChange={e => applyClone(e.target.value)} className={inp + ' cursor-pointer'}>
                    <option value="">— ابدأ من صفر —</option>
                    {mixers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.ingredients.length} مكوّن · {fmtNum(m.ingredients.reduce((s, i) => s + i.weight, 0))} كج)
                      </option>
                    ))}
                  </select>
                  {cloneId && (
                    <p className="font-cairo text-[11px] text-success-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={12} /> تم نسخ مكونات الميكسر — يمكنك تعديلها أدناه
                    </p>
                  )}
                </div>
              )}

              {/* Basic info */}
              <div>
                <p className="font-cairo font-bold text-[12px] text-neutral-500 uppercase tracking-wide mb-3">بيانات الميكسر</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>الكود</label>
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                      placeholder="MX004" className={inp} dir="ltr" />
                  </div>
                  <div>
                    <label className={lbl}>النوع</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp + ' cursor-pointer'}>
                      {['علف مركب', 'علف مالئ', 'علف مكثف', 'خلطة خاصة'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>اسم الميكسر <span className="text-red-400 normal-case">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="مثال: ميكسر D — دورة التسمين" className={inp} dir="rtl" />
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>ملاحظات</label>
                    <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="وصف استخدام الميكسر..." className={inp} dir="rtl" />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className={lbl + ' mb-0'}>المكونات ({form.ingredients.length})</p>
                  <span className="font-cairo text-[12px] text-neutral-500">
                    الإجمالي: <span className="font-bold text-primary-600">{fmtNum(form.ingredients.reduce((s, i) => s + (+i.weight || 0), 0))} كج</span>
                  </span>
                </div>
                <div className="border border-neutral-200 rounded-[12px] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-2.5 text-start font-cairo font-semibold text-[11px] text-neutral-400 uppercase tracking-wide w-[40%]">الصنف من المخزن</th>
                        <th className="px-3 py-2.5 text-start font-cairo font-semibold text-[11px] text-neutral-400 uppercase tracking-wide">الوزن</th>
                        <th className="px-3 py-2.5 text-start font-cairo font-semibold text-[11px] text-neutral-400 uppercase tracking-wide">الوحدة</th>
                        <th className="px-3 py-2.5 text-start font-cairo font-semibold text-[11px] text-neutral-400 uppercase tracking-wide">ملاحظات</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {form.ingredients.map(ing => (
                        <tr key={ing.id} className="align-middle">
                          {/* Combobox item picker */}
                          <td className="px-3 py-2">
                            <ItemCombobox
                              value={ing.itemName}
                              onSelect={item => selectIngItem(ing.id, item)}
                            />
                          </td>

                          {/* Weight */}
                          <td className="px-3 py-2">
                            <input
                              type="number" min={0}
                              value={ing.weight || ''}
                              onChange={e => setIng(ing.id, 'weight', +e.target.value)}
                              placeholder="0" dir="ltr"
                              className="w-24 h-8 px-2.5 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 transition-all"
                            />
                          </td>

                          {/* UOM — auto-filled from item, still editable */}
                          <td className="px-3 py-2">
                            <div className="h-8 min-w-[52px] flex items-center px-2.5 rounded-[8px] border border-neutral-100 bg-neutral-50 font-cairo text-[13px] text-neutral-600 select-none">
                              {ing.uom || '—'}
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="px-3 py-2">
                            <input
                              value={ing.notes}
                              onChange={e => setIng(ing.id, 'notes', e.target.value)}
                              placeholder="ملاحظة اختيارية" dir="rtl"
                              className="w-full h-8 px-2.5 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 placeholder:text-neutral-300 transition-all"
                            />
                          </td>

                          {/* Remove */}
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => removeIngRow(ing.id)}
                              disabled={form.ingredients.length <= 1}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40">
                    <button onClick={addIngRow}
                      className="inline-flex items-center gap-1.5 font-cairo font-semibold text-[12px] text-primary-600 hover:text-primary-700 transition-colors">
                      <Plus size={14} /> إضافة مكوّن
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-100">
              <button onClick={saveMixer}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white rounded-[10px] font-cairo font-bold text-[13px] shadow-sm transition-all active:scale-[0.98]">
                <Check size={15} /> {editMixer ? 'حفظ التعديلات' : 'إضافة الميكسر'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="h-10 px-5 rounded-[10px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────���───────────────────────
// TAB 4 — استلامات (Receipts)
// ─────────────────────────────────────────────────────────────��───────────────

// ── Receipt form state ────────────────────────────────────────────────────────
type ReceiptFormState = {
  warehouseName: string; type: ReceiptType; itemName: string; date: string
  supplierName: string; supplierInvoice: string; invoiceValue: string
  qty: string; price: string; weighbridgeCard: string; photoName: string; notes: string
  status: TransactionStatus
}
const emptyReceiptForm = (): ReceiptFormState => ({
  warehouseName: '', type: 'from_supplier', itemName: '', date: new Date().toISOString().slice(0, 10),
  supplierName: '', supplierInvoice: '', invoiceValue: '', qty: '', price: '',
  weighbridgeCard: '', photoName: '', notes: '', status: 'done',
})

function ReceiptsTab() {
  const [receipts, setReceipts] = useState<ReceiptTx[]>([])
  const [loadingReceipts, setLoadingReceipts] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ReceiptType | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [viewR, setViewR] = useState<ReceiptTx | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ReceiptTx | null>(null)
  const [form, setForm] = useState<ReceiptFormState>(emptyReceiptForm())
  const fileRef = useRef<HTMLInputElement>(null)

  // Load real warehouse and item data for dropdowns
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string }>>([])
  const [items, setItems] = useState<Array<{ id: number; name: string }>>([])
  const [loadingLookups, setLoadingLookups] = useState(true)

  // Initialize - load lookups
  useEffect(() => {
    (async () => {
      try {
        console.log('[ReceiptsTab] Loading warehouses and items...')
        const [whRes, itRes] = await Promise.all([warehousesApi.getDropdown(), itemsApi.getDropdown()])
        if (whRes.isSuccess) {
          setWarehouses(whRes.data || [])
          console.log('[ReceiptsTab] Loaded warehouses:', whRes.data)
        }
        if (itRes.isSuccess) {
          setItems(itRes.data || [])
          console.log('[ReceiptsTab] Loaded items:', itRes.data)
        }
      } catch (e) {
        console.error('[ReceiptsTab] Failed to load lookups:', e)
        toast.error('فشل تحميل المخازن والأصناف')
      } finally {
        setLoadingLookups(false)
      }
    })()
  }, [])

  // Fetch receipts from API
  const fetchReceipts = async () => {
    setLoadingReceipts(true)
    try {
      console.log('[ReceiptsTab] Fetching receipts from API...')
      const res = await inventoryTransactionsApi.getReceipts(1, 100)
      if (res.isSuccess && res.data?.data) {
        // Map API response to local ReceiptTx shape
        const mapped: ReceiptTx[] = res.data.data.map((tx) => {
          const typeMap: Record<string, ReceiptType> = {
            PurchaseReceipt: 'from_supplier',
            OpeningBalance: 'opening_balance',
            ReturnedGoods: 'return',
          }
          const firstLine = tx.lines?.[0]
          return {
            id: String(tx.id),
            serial: tx.transactionNumber,
            type: typeMap[tx.transactionType] ?? 'from_supplier',
            date: tx.transactionDate?.slice(0, 10) ?? '',
            warehouseName: tx.warehouseName ?? '',
            supplierName: tx.partnerName ?? '—',
            supplierInvoice: tx.externalReferenceNumber ?? '—',
            invoiceValue: firstLine ? firstLine.quantity * firstLine.unitPrice : 0,
            itemName: firstLine?.itemName ?? '',
            qty: firstLine?.quantity ?? 0,
            price: firstLine?.unitPrice ?? 0,
            weighbridgeCard: tx.weightBridgeReference ?? '',
            photoUrl: tx.invoiceImageUrl ?? '',
            items: (tx.lines ?? []).map((l) => ({
              id: String(l.id),
              itemName: l.itemName,
              qty: l.quantity,
              weight: l.weight,
              price: l.unitPrice,
              location: l.warehouseLocationName ?? '',
            })),
            totalValue: (tx.lines ?? []).reduce((s, l) => s + l.totalPrice, 0),
            status: tx.status === 'Completed' ? 'done' : tx.status === 'Pending' ? 'pending' : 'draft' as TransactionStatus,
            notes: tx.notes ?? '',
          }
        })
        setReceipts(mapped)
      } else {
        console.warn('[ReceiptsTab] API returned no data, using mock fallback')
        setReceipts(INIT_RECEIPTS)
      }
    } catch (e) {
      console.error('[ReceiptsTab] Failed to fetch receipts:', e)
      toast.error('فشل تحميل الاستلامات')
      setReceipts(INIT_RECEIPTS) // Fallback to mock data while backend unavailable
    } finally {
      setLoadingReceipts(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [])

  // Filter receipts
  const filtered = receipts.filter(r => {
    const q = search.toLowerCase()
    const mq = !q || r.serial.toLowerCase().includes(q) || r.supplierName.includes(search)
      || r.warehouseName.includes(search) || r.itemName.includes(search)
    const mt = typeFilter === 'all' || r.type === typeFilter
    return mq && mt
  })

  const totalDone = receipts.filter(r => r.status === 'done').reduce((s, r) => s + r.totalValue, 0)

  // Pagination
  const [rcptPage, setRcptPage] = useState(1)
  useEffect(() => { setRcptPage(1) }, [search, typeFilter])
  const rcptTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedReceipts = filtered.slice((rcptPage - 1) * PAGE_SIZE, rcptPage * PAGE_SIZE)

  // Form handlers
  function ff(k: keyof ReceiptFormState, v: string) { setForm(f => ({ ...f, [k]: v })) }

  // Save receipt via real API
  async function saveReceipt() {
    console.log('[ReceiptsTab] saveReceipt starting...', { warehouse: form.warehouseName, item: form.itemName })
    toast.info('جاري حفظ الاستلام...', { id: 'saving-receipt' })

    if (!form.warehouseName || !form.itemName) {
      toast.error('المخزن والصنف مطلوبان')
      console.log('[ReceiptsTab] Validation failed - missing warehouse or item')
      return
    }

    try {
      const whId = warehouses.find(w => w.name === form.warehouseName)?.id
      const itemId = items.find(i => i.name === form.itemName)?.id
      if (!whId || !itemId) {
        toast.error('لم يتم العثور على المخزن أو الصنف في النظام')
        console.warn('[ReceiptsTab] Warehouse/item lookup failed', { whId, itemId })
        return
      }

      const qty = parseFloat(form.qty) || 0
      const price = parseFloat(form.price) || 0

      const transactionTypeMap: Record<ReceiptType, string> = {
        from_supplier: 'PurchaseReceipt',
        opening_balance: 'OpeningBalance',
        return: 'ReturnedGoods',
      }

      const dto: CreateInventoryTransactionRequest = {
        transactionDate: form.date,
        transactionType: transactionTypeMap[form.type],
        transactionDirection: 'Inbound',
        warehouseId: whId,
        partnerId: form.type === 'from_supplier' ? 0 : undefined,
        externalReferenceNumber: form.supplierInvoice || undefined,
        weightBridgeReference: form.weighbridgeCard || undefined,
        invoiceImageUrl: form.photoName || undefined,
        status: form.status === 'done' ? 'Completed' : form.status === 'pending' ? 'Pending' : 'Draft',
        notes: form.notes || undefined,
        requiresCostCenter: false,
        lines: [{ itemId, warehouseId: whId, quantity: qty, weight: qty, unitPrice: price }],
      }

      console.log('[ReceiptsTab] Calling inventoryTransactionsApi.create with DTO:', dto)
      await inventoryTransactionsApi.create(dto)
      toast.success('تم حفظ الاستلام بنجاح')
      setShowModal(false)
      setForm(emptyReceiptForm())
      await fetchReceipts()
    } catch (err) {
      console.error('[ReceiptsTab] Error saving receipt:', err)
      toast.error('فشل حفظ الاستلام: ' + (err instanceof Error ? err.message : 'خطأ غير معروف'))
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setReceipts(rs => rs.filter(r => r.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // Dropdown options from real data
  const whNames = warehouses.map(w => w.name)
  const itemNames = items.map(i => i.name)

  const inp = 'w-full h-9 px-3 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white placeholder:text-neutral-300'
  const lbl = 'block font-cairo font-semibold text-[11px] text-neutral-500 mb-1'

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الاستلامات" value={receipts.length} sub="قيد استلام" icon={ArrowDownToLine} iconColor="text-primary-500" iconBg="bg-primary-50" />
        <StatCard label="مكتملة" value={receipts.filter(r => r.status === 'done').length} sub="تمت بنجاح" icon={CheckCircle2} iconColor="text-success-600" iconBg="bg-success-50" />
        <StatCard label="معلقة / مسودة" value={receipts.filter(r => r.status !== 'done').length} sub="تحتاج متابعة" icon={Clock} iconColor="text-warning-600" iconBg="bg-warning-50" />
        <StatCard label="إجمالي القيمة" value={fmtMon(totalDone)} sub="للمعاملات المكتملة" icon={FileText} iconColor="text-info-600" iconBg="bg-info-50" />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-neutral-200 rounded-[16px] px-4 py-3 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالصنف، المورد، المخزن، رقم الإذن..."
            className="w-full h-9 ps-8 pe-3 rounded-[8px] border border-neutral-200 font-cairo text-[13px] focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 placeholder:text-neutral-300" />
          {search && <button onClick={() => setSearch('')} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2"><X size={13} className="text-neutral-400" /></button>}
        </div>
        {/* Type filter dropdown */}
        <div className="relative">
          <Filter size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as ReceiptType | 'all')}
            className="h-9 ps-8 pe-8 rounded-[8px] border border-neutral-200 bg-white font-cairo font-semibold text-[12px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 cursor-pointer appearance-none"
          >
            <option value="all">كل الأنواع</option>
            <option value="from_supplier">من مورد</option>
            <option value="opening_balance">رصيد افتتاحي</option>
            <option value="return">مرتجع</option>
          </select>
          <ChevronDown size={12} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
        <button onClick={() => { setForm(emptyReceiptForm()); setShowModal(true) }}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-[10px] bg-primary-500 text-white font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm ms-auto">
          <Plus size={15} /> إضافة استلام
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-[16px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70">
                {['#', 'رقم الإذن', 'المخزن', 'نوع الإضافة', 'الصنف', 'التاريخ', 'المورد', 'فاتورة / القيمة', 'الكمية', 'السعر', 'كارتة الميزان', 'صورة', 'ملاحظات', ''].map(h => (
                  <th key={h} className="px-3 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={14}><EmptyState icon={ArrowDownToLine} title="لا توجد استلامات" sub="أضف أول استلام بالضغط على الزر أعلاه" /></td></tr>
              ) : pagedReceipts.map((r, idx) => {
                const tc = RECEIPT_TYPE_CFG[r.type]
                return (
                  <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-3 py-3 font-cairo text-[11px] text-neutral-400">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <span className="font-cairo font-bold text-[12px] text-primary-600">{r.serial}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-cairo text-[12px] text-neutral-700 flex items-center gap-1">
                        <Warehouse size={11} className="text-neutral-400 shrink-0" /> {r.warehouseName}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tc.bg} ${tc.color}`}>
                        {tc.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-cairo font-semibold text-[13px] text-neutral-900">{r.itemName}</td>
                    <td className="px-3 py-3 font-cairo text-[12px] text-neutral-600" dir="ltr">{fmtDate(r.date)}</td>
                    <td className="px-3 py-3 font-cairo text-[12px] text-neutral-700">{r.supplierName}</td>
                    <td className="px-3 py-3">
                      <div className="font-cairo text-[11px]">
                        <p className="text-neutral-500">{r.supplierInvoice}</p>
                        <p className="font-bold text-success-700">{fmtMon(r.invoiceValue || r.totalValue)}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-cairo text-[13px] text-neutral-800">{fmtNum(r.qty)}</td>
                    <td className="px-3 py-3 font-cairo text-[13px] text-neutral-800">{fmtMon(r.price)}</td>
                    <td className="px-3 py-3">
                      {r.weighbridgeCard
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-info-50 text-info-700 font-cairo font-semibold text-[11px]"><Scale size={10} />{r.weighbridgeCard}</span>
                        : <span className="font-cairo text-[11px] text-neutral-300">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      {r.photoUrl
                        ? <span className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-success-50 text-success-600" title={r.photoUrl}><FileText size={13} /></span>
                        : <span className="font-cairo text-[11px] text-neutral-300">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      {r.notes
                        ? <span className="font-cairo text-[11px] text-neutral-500 max-w-[120px] truncate block" title={r.notes}>{r.notes}</span>
                        : <span className="font-cairo text-[11px] text-neutral-300">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewR(r)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="عرض التفاصيل">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(r)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="حذف">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={rcptPage} totalPages={rcptTotalPages} setPage={setRcptPage} total={filtered.length} unit="استلام" />
      </div>

      {/* ── Add Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[600px] flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="shrink-0 px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-primary-50 flex items-center justify-center">
                  <ArrowDownToLine size={17} className="text-primary-500" />
                </div>
                <h2 className="font-cairo font-bold text-[17px] text-neutral-900">إضافة استلام جديد</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Row 1: المخزن + نوع الإضافة */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>المخزن <span className="text-red-400">*</span></label>
                  <select value={form.warehouseName} onChange={e => ff('warehouseName', e.target.value)} className={inp}>
                    <option value="">اختر المخزن...</option>
                    {whNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>نوع الإضافة</label>
                  <div className="flex gap-2">
                    {([['from_supplier', 'من مورد'], ['opening_balance', 'افتتاحي'], ['return', 'مرتجع']] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => ff('type', v)}
                        className={['flex-1 h-9 rounded-[8px] border-2 font-cairo font-semibold text-[11px] transition-all',
                          form.type === v ? `border-primary-400 bg-primary-50 text-primary-700` : 'border-neutral-200 text-neutral-500 hover:border-neutral-300',
                        ].join(' ')}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: الصنف + التاريخ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>الصنف <span className="text-red-400">*</span></label>
                  <select value={form.itemName} onChange={e => ff('itemName', e.target.value)} className={inp}>
                    <option value="">اختر الصنف...</option>
                    {itemNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>التاريخ</label>
                  <input type="date" value={form.date} onChange={e => ff('date', e.target.value)} className={inp} dir="ltr" />
                </div>
              </div>

              {/* Row 3: المورد + رقم الفاتورة */}
              {form.type !== 'opening_balance' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>المورد</label>
                    <input value={form.supplierName} onChange={e => ff('supplierName', e.target.value)} placeholder="اسم المورد..." className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>رقم فاتورة المورد</label>
                    <input value={form.supplierInvoice} onChange={e => ff('supplierInvoice', e.target.value)} placeholder="INV-XXXX" className={inp} dir="ltr" />
                  </div>
                </div>
              )}

              {/* Row 4: القيمة (حسابات المورد) */}
              {form.type !== 'opening_balance' && (
                <div>
                  <label className={lbl}>القيمة — حسابات المورد <span className="font-normal text-neutral-400">(الإجمالي المدفوع أو المستحق)</span></label>
                  <div className="relative">
                    <input type="number" min={0} value={form.invoiceValue} onChange={e => ff('invoiceValue', e.target.value)}
                      placeholder="0.00" className={inp} dir="ltr" />
                    <span className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 font-cairo text-[12px] text-neutral-400">ج.م</span>
                  </div>
                </div>
              )}

              {/* Row 5: الكمية + السعر */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>الكمية</label>
                  <input type="number" min={0} value={form.qty} onChange={e => ff('qty', e.target.value)} placeholder="0" className={inp} dir="ltr" />
                </div>
                <div>
                  <label className={lbl}>السعر / الوحدة</label>
                  <div className="relative">
                    <input type="number" min={0} value={form.price} onChange={e => ff('price', e.target.value)} placeholder="0.00" className={inp} dir="ltr" />
                    <span className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 font-cairo text-[12px] text-neutral-400">ج.م</span>
                  </div>
                </div>
              </div>

              {/* Row 6: كارتة الميزان + الحالة */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>كارتة الميزان</label>
                  <div className="relative">
                    <Scale size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input value={form.weighbridgeCard} onChange={e => ff('weighbridgeCard', e.target.value)}
                      placeholder="WB-XXXX" className={inp + ' ps-8'} dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>الحالة</label>
                  <select value={form.status} onChange={e => ff('status', e.target.value as TransactionStatus)} className={inp}>
                    <option value="done">مكتمل</option>
                    <option value="pending">معلق</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>
              </div>

              {/* Row 7: الصورة */}
              <div>
                <label className={lbl}>صورة / مستند</label>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => ff('photoName', e.target.files?.[0]?.name ?? '')} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full h-9 flex items-center gap-2 px-3 rounded-[8px] border border-dashed border-neutral-300 text-neutral-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/40 transition-all font-cairo text-[13px]">
                  <FileText size={14} />
                  {form.photoName ? <span className="text-primary-600 font-semibold">{form.photoName}</span> : <span>اختر صورة أو ملف PDF...</span>}
                </button>
                {form.photoName && (
                  <button onClick={() => ff('photoName', '')} className="mt-1 font-cairo text-[11px] text-red-400 hover:text-red-600">× حذف المرفق</button>
                )}
              </div>

              {/* Row 8: الملاحظات */}
              <div>
                <label className={lbl}>ملاحظات</label>
                <textarea value={form.notes} onChange={e => ff('notes', e.target.value)}
                  rows={2} placeholder="أي ملاحظات إضافية..."
                  className="w-full px-3 py-2 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white placeholder:text-neutral-300 resize-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
              <button onClick={saveReceipt}
                className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-bold text-[13px] hover:bg-primary-600 transition-colors shadow-sm">
                <Check size={15} /> حفظ الاستلام
              </button>
              <button onClick={() => setShowModal(false)}
                className="h-10 px-5 rounded-[10px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Modal ── */}
      {viewR && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewR(null)} />
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[560px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-cairo font-bold text-[15px] text-primary-600">{viewR.serial}</span>
                  <StatusBadge status={viewR.status} />
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${RECEIPT_TYPE_CFG[viewR.type].bg} ${RECEIPT_TYPE_CFG[viewR.type].color}`}>
                    {RECEIPT_TYPE_CFG[viewR.type].label}
                  </span>
                </div>
                <p className="font-cairo text-[12px] text-neutral-400">{fmtDate(viewR.date)} · {viewR.warehouseName}</p>
              </div>
              <button onClick={() => setViewR(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { l: 'الصنف', v: viewR.itemName },
                  { l: 'الكمية', v: fmtNum(viewR.qty) },
                  { l: 'السعر / الوحدة', v: fmtMon(viewR.price) },
                  { l: 'القيمة الإجمالية', v: fmtMon(viewR.invoiceValue || viewR.totalValue) },
                  { l: 'المورد', v: viewR.supplierName },
                  { l: 'رقم الفاتورة', v: viewR.supplierInvoice, ltr: true },
                  { l: 'كارتة الميزان', v: viewR.weighbridgeCard || '—', ltr: true },
                  { l: 'مستند / صورة', v: viewR.photoUrl || '—' },
                  { l: 'ملاحظات', v: viewR.notes || '—' },
                ].map(row => (
                  <div key={row.l}>
                    <p className="font-cairo text-[10px] text-neutral-400 mb-0.5 uppercase tracking-wide">{row.l}</p>
                    <p className="font-cairo font-semibold text-[13px] text-neutral-900" dir={row.ltr ? 'ltr' : 'rtl'}>{row.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmDeleteModal
          itemName={deleteTarget.serial}
          itemType="الاستلام"
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 5 — صرف (Issues)
// ─────────────────────────────────────────────────────────────────────────────

type IssueFormState = {
  type: IssueType; date: string; warehouseName: string; destination: string
  mixerName: string; mixerCount: string
  clientName: string; invoiceRef: string; salesInvoiceValue: string
  costCenter: string
  itemName: string; qty: string; price: string
  weighbridgeCard: string; photoName: string; notes: string
  status: TransactionStatus
}
const emptyIssueForm = (): IssueFormState => ({
  type: 'internal', date: new Date().toISOString().slice(0, 10),
  warehouseName: '', destination: '', mixerName: '', mixerCount: '',
  clientName: '', invoiceRef: '', salesInvoiceValue: '',
  costCenter: '', itemName: '', qty: '', price: '',
  weighbridgeCard: '', photoName: '', notes: '', status: 'done',
})

function IssuesTab() {
  const [issues, setIssues] = useState<IssueTx[]>([])
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<IssueType | 'all'>('all')
  const [viewI, setViewI] = useState<IssueTx | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<IssueFormState>(emptyIssueForm())
  const fileRef = useRef<HTMLInputElement>(null)

  // Load real warehouse and item data for dropdowns
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string }>>([])
  const [items, setItems] = useState<Array<{ id: number; name: string }>>([])
  const [loadingLookups, setLoadingLookups] = useState(true)

  // Fetch issues from API
  const fetchIssues = async () => {
    setLoadingIssues(true)
    try {
      console.log('[IssuesTab] Fetching issues from API...')
      const res = await inventoryTransactionsApi.getIssues(1, 100)
      if (res.isSuccess && res.data?.data) {
        const typeMap: Record<string, IssueType> = {
          Feeding: 'feeding',
          SalesInvoice: 'sales',
          InternalTransfer: 'internal',
        }
        const mapped: IssueTx[] = res.data.data.map((tx) => {
          const firstLine = tx.lines?.[0]
          return {
            id: String(tx.id),
            serial: tx.transactionNumber,
            type: typeMap[tx.transactionType] ?? 'internal',
            date: tx.transactionDate?.slice(0, 10) ?? '',
            warehouseName: tx.warehouseName ?? '',
            destination: tx.costCenterName ?? tx.partnerName ?? '',
            invoiceRef: tx.externalReferenceNumber,
            itemName: firstLine?.itemName ?? '',
            qty: firstLine?.quantity ?? 0,
            price: firstLine?.unitPrice ?? 0,
            weighbridgeCard: tx.weightBridgeReference,
            photoUrl: tx.invoiceImageUrl,
            items: (tx.lines ?? []).map((l) => ({
              id: String(l.id),
              itemName: l.itemName,
              qty: l.quantity,
              weight: l.weight,
              price: l.unitPrice,
              location: l.warehouseLocationName ?? '',
            })),
            totalValue: (tx.lines ?? []).reduce((s, l) => s + l.totalPrice, 0),
            status: tx.status === 'Completed' ? 'done' : tx.status === 'Pending' ? 'pending' : 'draft' as TransactionStatus,
            notes: tx.notes ?? '',
          }
        })
        setIssues(mapped)
      } else {
        console.warn('[IssuesTab] API returned no data, using mock fallback')
        setIssues(INIT_ISSUES)
      }
    } catch (e) {
      console.error('[IssuesTab] Failed to fetch issues:', e)
      toast.error('فشل تحميل الصرف')
      setIssues(INIT_ISSUES) // Fallback while backend unavailable
    } finally {
      setLoadingIssues(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        console.log('[IssuesTab] Loading warehouses and items...')
        const [whRes, itRes] = await Promise.all([warehousesApi.getDropdown(), itemsApi.getDropdown()])
        if (whRes.isSuccess) setWarehouses(whRes.data || [])
        if (itRes.isSuccess) setItems(itRes.data || [])
      } catch (e) { console.error('[IssuesTab] Failed to load lookups:', e); toast.error('فشل تحميل البيانات المساعدة') }
      finally { setLoadingLookups(false) }
    })()
    fetchIssues()
  }, [])

  function fi(k: keyof IssueFormState, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function saveIssue() {
    console.log('[IssuesTab] saveIssue starting...', { warehouse: form.warehouseName, item: form.itemName })
    toast.info('جاري حفظ الصرف...', { id: 'saving-issue' })
    if (!form.warehouseName || !form.itemName) { toast.error('المخزن والصنف مطلوبان'); console.log('[IssuesTab] Validation failed'); return }
    try {
      const whId = warehouses.find(w => w.name === form.warehouseName)?.id
      const itemId = items.find(i => i.name === form.itemName)?.id
      if (!whId || !itemId) { toast.error('لم يتم العثور على المخزن أو الصنف'); return }
      const qty = parseFloat(form.qty) || 0
      const price = parseFloat(form.price) || 0
      const transactionType = form.type === 'feeding' ? 'Feeding' : form.type === 'sales' ? 'SalesInvoice' : 'InternalTransfer'
      const dto: CreateInventoryTransactionRequest = {
        transactionDate: form.date,
        transactionType,
        transactionDirection: 'Outbound',
        warehouseId: whId,
        costCenterId: form.costCenter ? 0 : undefined,
        externalReferenceNumber: form.type === 'sales' ? form.invoiceRef : undefined,
        weightBridgeReference: form.weighbridgeCard || undefined,
        invoiceImageUrl: form.photoName || undefined,
        status: form.status === 'done' ? 'Completed' : form.status === 'pending' ? 'Pending' : 'Draft',
        notes: form.notes || undefined,
        lines: [{ itemId, warehouseId: whId, quantity: qty, weight: qty, unitPrice: price, notes: undefined }],
        requiresCostCenter: form.type === 'feeding' || form.type === 'internal',
      }
      console.log('[IssuesTab] Creating transaction:', dto)
      await inventoryTransactionsApi.create(dto)
      toast.success('تم حفظ الصرف بنجاح')
      setShowModal(false)
      setForm(emptyIssueForm())
      await fetchIssues()
    } catch (err) { console.error('[IssuesTab] Error saving issue:', err); toast.error('فشل حفظ الصرف: ' + (err instanceof Error ? err.message : 'خطأ غير معروف')) }
  }

  const whNames = warehouses.map(w => w.name)
  const itemNames = items.map(i => i.name)

  const filtered = issues.filter(is => {
    const q = search.toLowerCase()
    const ms = !q || is.serial.toLowerCase().includes(q) || is.destination.includes(search)
    const mt = typeFilter === 'all' || is.type === typeFilter
    return ms && mt
  })

  const totalValue = issues.filter(i => i.status === 'done').reduce((s, i) => s + i.totalValue, 0)

  const [issPage, setIssPage] = useState(1)
  useEffect(() => { setIssPage(1) }, [search, typeFilter])
  const issTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedIssues = filtered.slice((issPage - 1) * PAGE_SIZE, issPage * PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي أذونات الصرف" value={issues.length} sub="معاملة" icon={ArrowUpFromLine} iconColor="text-primary-500" iconBg="bg-primary-50" />
        <StatCard label="تغذية" value={issues.filter(i => i.type === 'feeding').length} sub="وجبة تغذية" icon={Utensils} iconColor="text-warning-600" iconBg="bg-warning-50" />
        <StatCard label="فواتير بيع" value={issues.filter(i => i.type === 'sales').length} sub="فاتورة صادرة" icon={ShoppingCart} iconColor="text-success-600" iconBg="bg-success-50" />
        <StatCard label="إجمالي القيمة" value={fmtMon(totalValue)} sub="قيمة الصرف" icon={FileText} iconColor="text-info-600" iconBg="bg-info-50" />
      </div>

      <div className="bg-white border border-neutral-200 rounded-[14px] px-5 py-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 h-10 px-3 rounded-[12px] bg-neutral-50 border border-neutral-200 flex-1 min-w-[200px] focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <Search size={14} className="text-neutral-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الإذن، الوجهة..."
            className="flex-1 bg-transparent outline-none font-cairo text-[13px] placeholder:text-neutral-400" dir="rtl" />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-neutral-400" /></button>}
        </div>
        <div className="relative">
          <Filter size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as IssueType | 'all')}
            className="h-10 ps-8 pe-8 rounded-[12px] border border-neutral-200 bg-white font-cairo font-semibold text-[13px] text-neutral-700 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 cursor-pointer appearance-none min-w-[140px] transition-all hover:border-neutral-300">
            <option value="all">كل الأنواع</option>
            {Object.entries(ISSUE_TYPE_CFG).map(([v, c]) => (
              <option key={v} value={v}>{c.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
        <button onClick={() => { setForm(emptyIssueForm()); setShowModal(true) }}
          className="inline-flex items-center gap-1.5 px-4 h-10 bg-primary-500 text-white rounded-[12px] font-cairo font-semibold text-[13px] hover:bg-primary-600 transition-colors shadow-sm">
          <Plus size={16} /> إذن صرف
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-[16px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['رقم الإذن', 'النوع', 'التاريخ', 'المستودع', 'الوجهة / التفاصيل', 'القيمة', 'الحالة', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState icon={ArrowUpFromLine} title="لا توجد أذونات صرف" sub="لم يتم تسجيل أي صرف بعد" /></td></tr>
              ) : pagedIssues.map(is => {
                const tc = ISSUE_TYPE_CFG[is.type]
                const IssIcon = tc.icon
                return (
                  <tr key={is.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-cairo font-bold text-[12px] text-primary-600">{is.serial}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                        <IssIcon size={10} /> {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-cairo text-[12px] text-neutral-600" dir="ltr">{fmtDate(is.date)}</td>
                    <td className="px-4 py-3 font-cairo text-[13px] text-neutral-800">{is.warehouseName}</td>
                    <td className="px-4 py-3">
                      <p className="font-cairo text-[13px] text-neutral-900">{is.destination}</p>
                      {is.mixerName && <p className="font-cairo text-[11px] text-neutral-400">{is.mixerName} · {is.mixerCount} وجبات</p>}
                      {is.invoiceRef && <p className="font-cairo text-[11px] text-neutral-400" dir="ltr">{is.invoiceRef}</p>}
                    </td>
                    <td className="px-4 py-3 font-cairo font-bold text-[13px] text-warning-700">{fmtMon(is.totalValue)}</td>
                    <td className="px-4 py-3"><StatusBadge status={is.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewI(is)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors" title="عرض التفاصيل">
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={issPage} totalPages={issTotalPages} setPage={setIssPage} total={filtered.length} unit="معاملة" />
      </div>

      {/* View Issue Modal */}
      {viewI && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewI(null)} />
          <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-cairo font-bold text-[15px] text-primary-600">{viewI.serial}</span>
                  <StatusBadge status={viewI.status} />
                  <span className={`font-cairo font-semibold text-[11px] px-2 py-0.5 rounded-full ${ISSUE_TYPE_CFG[viewI.type].bg} ${ISSUE_TYPE_CFG[viewI.type].color}`}>{ISSUE_TYPE_CFG[viewI.type].label}</span>
                </div>
                <p className="font-cairo text-[12px] text-neutral-400">{viewI.destination} · {fmtDate(viewI.date)}</p>
              </div>
              <button onClick={() => setViewI(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-neutral-100">
                {[
                  { l: 'المستودع', v: viewI.warehouseName },
                  { l: 'الوجهة', v: viewI.destination },
                  ...(viewI.mixerName ? [{ l: 'الميكسر', v: `${viewI.mixerName} · ${viewI.mixerCount} وجبات` }] : []),
                  ...(viewI.invoiceRef ? [{ l: 'رقم الفاتورة', v: viewI.invoiceRef, ltr: true }] : []),
                  { l: 'إجمالي القيمة', v: fmtMon(viewI.totalValue) },
                  { l: 'ملاحظات', v: viewI.notes || '—' },
                ].map(r => (
                  <div key={r.l}>
                    <p className="font-cairo text-[10px] text-neutral-400 mb-0.5">{r.l}</p>
                    <p className="font-cairo font-semibold text-[13px] text-neutral-900" dir={(r as any).ltr ? 'ltr' : 'rtl'}>{r.v}</p>
                  </div>
                ))}
              </div>
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    {['الصنف', 'الكمية', 'الوزن (كج)', 'السعر', 'الإجمالي'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-start font-cairo font-semibold text-[11px] text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {viewI.items.map(it => (
                    <tr key={it.id} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-2.5 font-cairo font-semibold text-[13px] text-neutral-900">{it.itemName}</td>
                      <td className="px-4 py-2.5 font-cairo text-[13px] text-neutral-700">{it.qty}</td>
                      <td className="px-4 py-2.5 font-cairo text-[13px] text-neutral-700">{fmtNum(it.weight)}</td>
                      <td className="px-4 py-2.5 font-cairo text-[13px] text-neutral-700">{fmtMon(it.price)}</td>
                      <td className="px-4 py-2.5 font-cairo font-bold text-[13px] text-warning-700">{fmtMon(it.weight * it.price)}</td>
                      <td className="px-4 py-2.5 font-cairo text-[11px] text-neutral-500">{it.location || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Issue Modal ── */}
      {showModal && (() => {
        const inp = 'w-full h-9 px-3 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white placeholder:text-neutral-300'
        const lbl = 'block font-cairo font-semibold text-[11px] text-neutral-500 mb-1'
        return (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4" dir="rtl">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[600px] flex flex-col max-h-[92vh]">
              <div className="shrink-0 px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-warning-50 flex items-center justify-center">
                    <ArrowUpFromLine size={17} className="text-warning-600" />
                  </div>
                  <h2 className="font-cairo font-bold text-[17px] text-neutral-900">إضافة إذن صرف جديد</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Type */}
                <div>
                  <label className={lbl}>نوع الصرف</label>
                  <div className="flex gap-2">
                    {([['internal', 'داخلي'], ['sales', 'فاتورة بيع'], ['feeding', 'تغذية']] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => fi('type', v)}
                        className={['flex-1 h-9 rounded-[8px] border-2 font-cairo font-semibold text-[11px] transition-all',
                          form.type === v ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300',
                        ].join(' ')}>{l}</button>
                    ))}
                  </div>
                </div>
                {/* Warehouse + Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>المخزن <span className="text-red-400">*</span></label>
                    <select value={form.warehouseName} onChange={e => fi('warehouseName', e.target.value)} className={inp}>
                      <option value="">اختر المخزن...</option>
                      {whNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>التاريخ</label>
                    <input type="date" value={form.date} onChange={e => fi('date', e.target.value)} className={inp} dir="ltr" />
                  </div>
                </div>
                {/* Destination */}
                <div>
                  <label className={lbl}>الوجهة</label>
                  <input value={form.destination} onChange={e => fi('destination', e.target.value)}
                    placeholder={form.type === 'feeding' ? 'مثال: الدورة 12 — تسمين' : form.type === 'sales' ? 'مثال: مزرعة الفالح' : 'مثال: مركز تكلفة'}
                    className={inp} />
                </div>
                {/* Conditional fields */}
                {form.type === 'feeding' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lbl}>اسم الميكسر</label>
                      <input value={form.mixerName} onChange={e => fi('mixerName', e.target.value)} placeholder="ميكسر A..." className={inp} /></div>
                    <div><label className={lbl}>عدد الوجبات</label>
                      <input type="number" min={1} value={form.mixerCount} onChange={e => fi('mixerCount', e.target.value)} placeholder="1" className={inp} dir="ltr" /></div>
                  </div>
                )}
                {form.type === 'sales' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lbl}>اسم العميل</label>
                      <input value={form.clientName} onChange={e => fi('clientName', e.target.value)} placeholder="اسم العميل..." className={inp} /></div>
                    <div><label className={lbl}>رقم فاتورة البيع</label>
                      <input value={form.invoiceRef} onChange={e => fi('invoiceRef', e.target.value)} placeholder="SI-XXXX" className={inp} dir="ltr" /></div>
                  </div>
                )}
                {form.type === 'internal' && (
                  <div><label className={lbl}>مركز التكلفة</label>
                    <input value={form.costCenter} onChange={e => fi('costCenter', e.target.value)} placeholder="مركز تكلفة — صيانة" className={inp} /></div>
                )}
                {/* Item + Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>الصنف المصروف <span className="text-red-400">*</span></label>
                    <select value={form.itemName} onChange={e => fi('itemName', e.target.value)} className={inp}>
                      <option value="">اختر الصنف...</option>
                      {itemNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>حالة الصرف</label>
                    <select value={form.status} onChange={e => fi('status', e.target.value as TransactionStatus)} className={inp}>
                      <option value="done">تم</option>
                      <option value="draft">مسودة</option>
                      <option value="pending">معلق</option>
                    </select>
                  </div>
                </div>
                {/* Qty + Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>الكمية \ العدد</label>
                    <input type="number" min={0} value={form.qty} onChange={e => fi('qty', e.target.value)} placeholder="0" className={inp} dir="ltr" /></div>
                  <div><label className={lbl}>السعر / الوحدة</label>
                    <div className="relative">
                      <input type="number" min={0} value={form.price} onChange={e => fi('price', e.target.value)} placeholder="0.00" className={inp} dir="ltr" />
                      <span className="absolute inset-inline-end-3 top-1/2 -translate-y-1/2 font-cairo text-[12px] text-neutral-400">ج.م</span>
                    </div>
                  </div>
                </div>
                {/* Weighbridge + Photo */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>كارتة الميزان</label>
                    <div className="relative">
                      <Scale size={13} className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input value={form.weighbridgeCard} onChange={e => fi('weighbridgeCard', e.target.value)}
                        placeholder="WB-XXXX" className={inp + ' ps-8'} dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>صورة ومستند (ملف)</label>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                      onChange={e => fi('photoName', e.target.files?.[0]?.name ?? '')} />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-full h-9 flex items-center gap-2 px-3 rounded-[8px] border border-dashed border-neutral-300 text-neutral-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/40 transition-all font-cairo text-[12px]">
                      <FileText size={14} />
                      {form.photoName ? <span className="text-primary-600 font-semibold truncate">{form.photoName}</span> : <span>اختر ملف...</span>}
                    </button>
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <label className={lbl}>ملاحظات</label>
                  <textarea value={form.notes} onChange={e => fi('notes', e.target.value)}
                    rows={2} placeholder="أي ملاحظات إضافية..."
                    className="w-full px-3 py-2 rounded-[8px] border border-neutral-200 font-cairo text-[13px] text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 bg-white placeholder:text-neutral-300 resize-none" />
                </div>
              </div>
              <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/60">
                <button onClick={saveIssue}
                  className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary-500 text-white rounded-[10px] font-cairo font-bold text-[13px] hover:bg-primary-600 transition-colors shadow-sm">
                  <Check size={15} /> حفظ إذن الصرف
                </button>
                <button onClick={() => setShowModal(false)}
                  className="h-10 px-5 rounded-[10px] border border-neutral-200 text-neutral-600 font-cairo font-semibold text-[13px] hover:bg-neutral-100 transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ────────────────────────────────────────────────────────────���────────────────
// TAB 6 — تقارير (Reports)
// ─────────────────────────────────────────────────────────────────────────────

function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState<'shortage' | 'balance' | 'feeding' | 'movement'>('shortage')

  const shortageItems = INIT_ITEMS.filter(i => i.currentStock < i.minStock)
    .map(i => ({ ...i, deficit: i.minStock - i.currentStock }))
    .sort((a, b) => (a.currentStock / a.minStock) - (b.currentStock / b.minStock))

  const balanceItems = INIT_ITEMS
    .map(i => ({ ...i, daysLeft: i.dailyUsage > 0 ? Math.round(i.currentStock / i.dailyUsage) : 999 }))
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const dailyFeed = {
    totalWeight: INIT_MIXERS.filter(m => m.status === 'active').reduce((s, m) => s + m.ingredients.filter(i => i.status === 'active').reduce((ss, i) => ss + i.weight, 0), 0),
    mixers: INIT_MIXERS.filter(m => m.status === 'active').map(m => ({
      name: m.name,
      weight: m.ingredients.filter(i => i.status === 'active').reduce((s, i) => s + i.weight, 0),
      ingredientCount: m.ingredients.filter(i => i.status === 'active').length,
    }))
  }

  const reports = [
    { id: 'shortage' as const, label: 'نواقص المخزون', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', count: `${shortageItems.length} أصناف` },
    { id: 'balance' as const, label: 'رصيد والفترة المتبقية', icon: TrendingDown, color: 'text-warning-600', bg: 'bg-warning-50', count: `${INIT_ITEMS.length} صنف` },
    { id: 'feeding' as const, label: 'التغذية اليومية', icon: Utensils, color: 'text-success-600', bg: 'bg-success-50', count: `${dailyFeed.mixers.length} ميكسر` },
    { id: 'movement' as const, label: 'حركة صنف', icon: RefreshCw, color: 'text-info-600', bg: 'bg-info-50', count: 'كل الأصناف' },
  ]

  const [movItem, setMovItem] = useState(INIT_ITEMS[0]?.id || '')
  const selectedItem = INIT_ITEMS.find(i => i.id === movItem)

  return (
    <div className="space-y-5">
      {/* Report selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {reports.map(r => {
          const RIcon = r.icon
          return (
            <button key={r.id} onClick={() => setSelectedReport(r.id)}
              className={['relative rounded-[16px] p-4 text-start border-2 transition-all shadow-sm',
                selectedReport === r.id ? `border-primary-500 bg-primary-50/50` : 'bg-white border-neutral-200 hover:border-neutral-300'].join(' ')}>
              {selectedReport === r.id && <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-primary-500" />}
              <div className={`w-10 h-10 rounded-[12px] ${r.bg} flex items-center justify-center mb-3`}>
                <RIcon size={18} className={r.color} />
              </div>
              <p className="font-cairo font-bold text-[13px] text-neutral-900 mb-0.5">{r.label}</p>
              <p className="font-cairo text-[11px] text-neutral-400">{r.count}</p>
            </button>
          )
        })}
      </div>

      {/* Report Content */}
      <div className="bg-white border border-neutral-200 rounded-[16px] overflow-hidden shadow-sm">
        {/* ── نواقص المخزون ── */}
        {selectedReport === 'shortage' && (
          <>
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-cairo font-bold text-[15px] text-neutral-900">نواقص المخزون</h3>
                <p className="font-cairo text-[12px] text-neutral-400">{shortageItems.length} صنف تحت الحد الأدنى</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full font-cairo font-bold text-[12px] ${shortageItems.length > 0 ? 'bg-red-50 text-red-600' : 'bg-success-50 text-success-600'}`}>
                {shortageItems.length > 0 ? `⚠ ${shortageItems.length} تنبيه` : '✓ كل شيء على ما يرام'}
              </span>
            </div>
            {shortageItems.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="لا يوجد نقص في المخزون" sub="جميع الأصناف فوق الحد الأدنى" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-100">
                    <tr>{['الصنف', 'الفئة', 'الوحدة', 'الرصيد الحالي', 'الحد الأدنى', 'النقص', 'نسبة التغطية', 'أيام التسليم'].map(h => (
                      <th key={h} className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {shortageItems.map(it => {
                      const pct = Math.round((it.currentStock / it.minStock) * 100)
                      const isCrit = pct < 50
                      return (
                        <tr key={it.id} className={`hover:bg-neutral-50/50 ${isCrit ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3">
                            <p className="font-cairo font-semibold text-[13px] text-neutral-900">{it.name}</p>
                            <p className="font-cairo text-[11px] text-neutral-400">{it.code}</p>
                          </td>
                          <td className="px-4 py-3"><CategoryBadge cat={it.category} /></td>
                          <td className="px-4 py-3 font-cairo text-[12px] text-neutral-600">{it.uom}</td>
                          <td className="px-4 py-3 font-cairo font-bold text-[13px] text-red-500">{fmtNum(it.currentStock)}</td>
                          <td className="px-4 py-3 font-cairo text-[13px] text-neutral-700">{fmtNum(it.minStock)}</td>
                          <td className="px-4 py-3 font-cairo font-bold text-[13px] text-red-500">-{fmtNum(it.deficit)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-red-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className={`font-cairo font-bold text-[11px] ${isCrit ? 'text-red-500' : 'text-warning-600'}`}>{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-cairo text-[12px] text-neutral-600">{it.avgDeliveryDays} أيام</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── رصيد والفترة المتبقية ── */}
        {selectedReport === 'balance' && (
          <>
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="font-cairo font-bold text-[15px] text-neutral-900">رصيد المخزون والفترة المتبقية</h3>
              <p className="font-cairo text-[12px] text-neutral-400">بناءً على معدلات السحب اليومية للمحطة</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>{['الصنف', 'الفئة', 'الرصيد الحالي', 'وحدة', 'الاستهلاك اليومي', 'الأيام المتبقية', 'مستوى المخزون'].map(h => (
                    <th key={h} className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {balanceItems.map(it => {
                    const days = it.daysLeft
                    const daysCls = days < 3 ? 'text-red-500 bg-red-50' : days < 7 ? 'text-warning-600 bg-warning-50' : days < 14 ? 'text-yellow-600 bg-yellow-50' : 'text-success-700 bg-success-50'
                    return (
                      <tr key={it.id} className="hover:bg-neutral-50/50">
                        <td className="px-4 py-3">
                          <p className="font-cairo font-semibold text-[13px] text-neutral-900">{it.name}</p>
                          <p className="font-cairo text-[11px] text-neutral-400">{it.code}</p>
                        </td>
                        <td className="px-4 py-3"><CategoryBadge cat={it.category} /></td>
                        <td className="px-4 py-3 font-cairo font-bold text-[13px] text-neutral-900">{fmtNum(it.currentStock)}</td>
                        <td className="px-4 py-3 font-cairo text-[12px] text-neutral-500">{it.uom}</td>
                        <td className="px-4 py-3 font-cairo text-[13px] text-neutral-700">{fmtNum(it.dailyUsage)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-cairo font-bold text-[12px] px-2.5 py-1 rounded-full ${daysCls}`}>
                            {days === 999 ? '—' : `${days} يوم`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StockBar current={it.currentStock} min={it.minStock} max={it.maxStock} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── التغذية اليومية ── */}
        {selectedReport === 'feeding' && (
          <>
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-cairo font-bold text-[15px] text-neutral-900">إجمالي التغذية اليومية لكل دورة</h3>
                <p className="font-cairo text-[12px] text-neutral-400">حسب الميكسرات النشطة مع عدد الرؤوس المتبقية</p>
              </div>
              <div className="text-start">
                <p className="font-cairo font-bold text-[22px] text-primary-600">{fmtNum(dailyFeed.totalWeight)} كج</p>
                <p className="font-cairo text-[11px] text-neutral-400">إجمالي وزن الوجبة</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    {['الدورة / الوجهة', 'الميكسر', 'عدد الوجبات', 'وزن الوجبة (كج)', 'نسبة من الإجمالي', 'عدد المكونات', 'عدد الرؤوس المتبقية'].map(h => (
                      <th key={h} className="px-4 py-3 text-start font-cairo font-semibold text-[11px] text-neutral-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[
                    { cycle: 'الدورة 12 — تسمين', mixer: 'ميكسر A', meals: 3, heads: 248 },
                    { cycle: 'الدورة 5 — ألبان', mixer: 'ميكسر B', meals: 2, heads: 112 },
                    { cycle: 'الدورة 8 — تسمين', mixer: 'ميكسر A', meals: 3, heads: 195 },
                  ].map((row, i) => {
                    const mx = dailyFeed.mixers.find(m => m.name.startsWith(row.mixer))
                    const weight = mx?.weight ?? 0
                    const pct = dailyFeed.totalWeight > 0 ? Math.round((weight / dailyFeed.totalWeight) * 100) : 0
                    return (
                      <tr key={i} className="hover:bg-neutral-50/50">
                        <td className="px-4 py-3">
                          <p className="font-cairo font-semibold text-[13px] text-neutral-900">{row.cycle}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-cairo text-[12px] text-neutral-700 flex items-center gap-1">
                            <Layers size={12} className="text-success-500" /> {row.mixer}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-cairo text-[13px] text-neutral-700">{row.meals}</td>
                        <td className="px-4 py-3 font-cairo font-bold text-[13px] text-success-700">{fmtNum(weight)} كج</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                              <div className="h-full bg-success-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-cairo text-[11px] text-neutral-500">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-cairo text-[12px] text-neutral-600">{mx?.ingredientCount ?? 0} مكوّن</td>
                        <td className="px-4 py-3">
                          <span className="font-cairo font-bold text-[13px] text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                            {row.heads} رأس
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── حركة صنف ── */}
        {selectedReport === 'movement' && (
          <>
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="font-cairo font-bold text-[15px] text-neutral-900">حركة صنف</h3>
              <div className="mt-3 max-w-xs">
                <select value={movItem} onChange={e => setMovItem(e.target.value)}
                  className="w-full h-10 px-3 rounded-[10px] border border-neutral-200 bg-white font-cairo text-[13px] text-neutral-900 outline-none focus:border-primary-500 cursor-pointer">
                  {INIT_ITEMS.map(i => <option key={i.id} value={i.id}>{i.code} — {i.name}</option>)}
                </select>
              </div>
            </div>
            {selectedItem && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary-50 rounded-[12px] p-4 text-center">
                    <p className="font-cairo text-[10px] text-neutral-500 mb-1">الرصيد الحالي</p>
                    <p className="font-cairo font-bold text-[18px] text-primary-700">{fmtNum(selectedItem.currentStock)} {selectedItem.uom}</p>
                  </div>
                  <div className="bg-success-50 rounded-[12px] p-4 text-center">
                    <p className="font-cairo text-[10px] text-neutral-500 mb-1">الاستهلاك اليومي</p>
                    <p className="font-cairo font-bold text-[18px] text-success-700">{fmtNum(selectedItem.dailyUsage)} {selectedItem.uom}</p>
                  </div>
                  <div className="bg-warning-50 rounded-[12px] p-4 text-center">
                    <p className="font-cairo text-[10px] text-neutral-500 mb-1">الأيام المتبقية</p>
                    <p className="font-cairo font-bold text-[18px] text-warning-700">
                      {selectedItem.dailyUsage > 0 ? Math.round(selectedItem.currentStock / selectedItem.dailyUsage) : '—'} يوم
                    </p>
                  </div>
                </div>
                {/* Mock movement history */}
                <div>
                  <p className="font-cairo font-semibold text-[12px] text-neutral-500 mb-3 uppercase tracking-wide">آخر حركات الصنف</p>
                  {[
                    { date: '2025-03-28', type: 'صرف تغذية', qty: `-${fmtNum(selectedItem.dailyUsage * 3)}`, note: 'الدورة 12 — 3 وجبات', cls: 'text-warning-600', icon: ArrowUpFromLine },
                    { date: '2025-03-22', type: 'استلام من مورد', qty: `+${fmtNum(selectedItem.reorderQty)}`, note: 'INV-4521', cls: 'text-success-600', icon: ArrowDownToLine },
                    { date: '2025-03-20', type: 'صرف تغذية', qty: `-${fmtNum(selectedItem.dailyUsage * 2)}`, note: 'الدورة 5 — ألبان', cls: 'text-warning-600', icon: ArrowUpFromLine },
                    { date: '2025-03-10', type: 'صرف داخلي', qty: `-${fmtNum(selectedItem.dailyUsage)}`, note: 'مركز تكلفة — صيانة', cls: 'text-neutral-600', icon: ArrowUpFromLine },
                    { date: '2025-01-01', type: 'رصيد افتتاحي', qty: `+${fmtNum(selectedItem.currentStock + selectedItem.dailyUsage * 80)}`, note: 'بداية العام 2025', cls: 'text-info-600', icon: ArrowDownToLine },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${row.cls.includes('success') || row.cls.includes('info') ? 'bg-success-50' : 'bg-warning-50'}`}>
                        <row.icon size={14} className={row.cls} />
                      </div>
                      <div className="flex-1">
                        <p className="font-cairo font-semibold text-[13px] text-neutral-900">{row.type}</p>
                        <p className="font-cairo text-[11px] text-neutral-400">{row.note}</p>
                      </div>
                      <span className={`font-cairo font-bold text-[13px] ${row.cls}`}>{row.qty} {selectedItem.uom}</span>
                      <span className="font-cairo text-[11px] text-neutral-400" dir="ltr">{fmtDate(row.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────��───────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

const MAIN_TABS = [
  { id: 'items', label: 'الأصناف', icon: Package2 },
  { id: 'warehouses', label: 'المخازن', icon: Warehouse },
  { id: 'mixers', label: 'الميكسرات', icon: Layers },
  { id: 'receipts', label: 'الاستلامات', icon: ArrowDownToLine },
  { id: 'issues', label: 'الصرف', icon: ArrowUpFromLine },
  { id: 'reports', label: 'تقارير المخزون', icon: BarChart3 },
] as const

type MainTab = typeof MAIN_TABS[number]['id']

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('items')

  const shortageCount = INIT_ITEMS.filter(i => i.currentStock < i.minStock).length

  return (
    <div className="min-h-full font-cairo" style={{ backgroundColor: '#F2F2F0' }} dir="rtl">
      <div className="max-w-[1320px] mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package2 size={22} className="text-primary-500" />
              <h1 className="font-cairo font-bold text-[26px] text-neutral-900">إدارة المخزون</h1>
            </div>
            <p className="font-cairo text-[13px] text-neutral-500">أصناف · مخازن · ميكسرات · استلامات وصرف · تقارير</p>
          </div>
          {shortageCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-[12px]">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="font-cairo font-semibold text-[12px] text-red-600">{shortageCount} أصناف تحت الحد الأدنى</span>
              <button onClick={() => setActiveTab('reports')}
                className="font-cairo text-[11px] text-red-500 underline hover:text-red-700">عرض التقرير</button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border border-neutral-200 rounded-[16px] p-1.5 flex items-center gap-1 shadow-sm">
          {MAIN_TABS.map(t => {
            const Icon = t.icon
            const active = activeTab === t.id
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={['flex-1 flex items-center justify-center gap-2 h-10 rounded-[12px] font-cairo font-semibold text-[13px] transition-all',
                  active ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50',
                ].join(' ')}>
                <Icon size={16} />
                <span className="hidden sm:block">{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'items' && <ItemsTab />}
        {activeTab === 'warehouses' && <WarehousesTab />}
        {activeTab === 'mixers' && <MixersTab />}
        {activeTab === 'receipts' && <ReceiptsTab />}
        {activeTab === 'issues' && <IssuesTab />}
        {activeTab === 'reports' && <ReportsTab />}

      </div>
    </div>
  )
}
