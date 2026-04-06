import type { Rule, UserRole, PermissionAction } from '../types/rules'

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  create:  'إضافة',
  read:    'عرض',
  update:  'تعديل',
  delete:  'حذف',
  approve: 'اعتماد',
  export:  'تصدير',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  manager:     'مدير',
  veterinarian:'دكتور بيطري',
  purchasing:  'مسئول مشتريات',
  accountant:  'محاسب',
  warehouse:   'مسئول مخزن',
  sales:       'مسئول مبيعات',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  manager:     'bg-primary-50 text-primary-600 border-primary-200',
  veterinarian:'bg-success-50 text-success-700 border-success-200',
  purchasing:  'bg-orange-50 text-orange-700 border-orange-200',
  accountant:  'bg-amber-50 text-amber-700 border-amber-200',
  warehouse:   'bg-blue-50 text-blue-700 border-blue-200',
  sales:       'bg-teal-50 text-teal-700 border-teal-200',
}

export const MODULE_OPTIONS = [
  { value: 'dashboard',  label: 'الرئيسية'               },
  { value: 'cattle',     label: 'إدارة الرؤوس والدورات'  },
  { value: 'inventory',  label: 'المخزون'                 },
  { value: 'purchasing', label: 'المشتريات'               },
  { value: 'sales',      label: 'المبيعات'                },
  { value: 'accounts',   label: 'الحسابات العامة'         },
  { value: 'cashier',    label: 'الخزينة والبنوك'         },
  { value: 'suppliers',  label: 'الموردين'                },
  { value: 'customers',  label: 'العملاء'                 },
  { value: 'employees',  label: 'الموظفين'                },
  { value: 'attendance', label: 'الحضور والانصراف'        },
  { value: 'payroll',    label: 'الرواتب'                 },
  { value: 'settings',   label: 'الإعدادات'               },
]

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  'create', 'read', 'update', 'delete', 'approve', 'export',
]

export const MOCK_RULES: Rule[] = [
  {
    id: '1',
    name: 'صلاحيات المدير — جميع الوحدات',
    module: 'dashboard',
    roles: ['manager'],
    allowedActions: ['create', 'read', 'update', 'delete', 'approve', 'export'],
    status: 'active',
    lastUpdated: '2025-01-15',
  },
  {
    id: '2',
    name: 'صلاحيات المحاسب — الحسابات العامة',
    module: 'accounts',
    roles: ['accountant'],
    allowedActions: ['create', 'read', 'update', 'approve', 'export'],
    status: 'active',
    lastUpdated: '2025-01-10',
  },
  {
    id: '3',
    name: 'صلاحيات الدكتور البيطري — الرؤوس',
    module: 'cattle',
    roles: ['veterinarian'],
    allowedActions: ['create', 'read', 'update'],
    status: 'active',
    lastUpdated: '2025-01-08',
  },
  {
    id: '4',
    name: 'صلاحيات مسئول المشتريات',
    module: 'purchasing',
    roles: ['purchasing'],
    allowedActions: ['create', 'read', 'update', 'approve', 'export'],
    status: 'active',
    lastUpdated: '2024-12-20',
  },
  {
    id: '5',
    name: 'صلاحيات مسئول المخزن — المخزون',
    module: 'inventory',
    roles: ['warehouse'],
    allowedActions: ['create', 'read', 'update', 'export'],
    status: 'active',
    lastUpdated: '2025-01-12',
  },
  {
    id: '6',
    name: 'صلاحيات الإدارة — الموظفين والرواتب',
    module: 'employees',
    roles: ['manager', 'accountant'],
    allowedActions: ['create', 'read', 'update', 'delete', 'export'],
    status: 'active',
    lastUpdated: '2025-01-05',
  },
  {
    id: '7',
    name: 'صلاحيات المحاسب — الخزينة',
    module: 'cashier',
    roles: ['accountant'],
    allowedActions: ['create', 'read', 'update', 'approve', 'export'],
    status: 'active',
    lastUpdated: '2025-01-03',
  },
  {
    id: '8',
    name: 'صلاحيات مسئول المخزن — الحضور',
    module: 'attendance',
    roles: ['warehouse'],
    allowedActions: ['create', 'read'],
    status: 'active',
    lastUpdated: '2024-12-28',
  },
]
