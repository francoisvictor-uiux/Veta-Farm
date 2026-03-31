import { createBrowserRouter } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/Dashboard'
import RulesPage from './pages/settings/RulesPage'
import UsersPage from './pages/settings/UsersPage'
import EmployeesPage from './pages/EmployeesPage'
import InventoryPage from './pages/InventoryPage'
import CattlePage from './pages/CattlePage'

// Placeholder component factory for future pages
import { createElement } from 'react'

function placeholder(title: string, arabicTitle: string) {
  return function PlaceholderPage() {
    return createElement(
      'div',
      { className: 'min-h-full bg-neutral-100 flex items-center justify-center p-12 font-cairo', dir: 'rtl' },
      createElement(
        'div',
        { className: 'text-center space-y-4' },
        createElement('div', {
          className: 'w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-4',
          children: createElement('span', { className: 'text-3xl' }, '🚧'),
        }),
        createElement('h2', { className: 'font-cairo font-bold text-[22px] text-neutral-700' }, arabicTitle),
        createElement('p', { className: 'font-cairo text-[14px] text-neutral-400' }, `صفحة ${title} — قيد التطوير، سيتم إضافتها قريباً`),
        createElement(
          'div',
          { className: 'inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full mt-2' },
          createElement('span', { className: 'w-2 h-2 rounded-full bg-primary-500 animate-pulse' }),
          createElement('span', { className: 'font-cairo text-[12px] text-primary-500 font-semibold' }, 'قيد التطوير')
        )
      )
    )
  }
}

const PurchasingPage  = placeholder('Purchasing',  'المشتريات')
const SalesPage       = placeholder('Sales',       'المبيعات')
const AccountsPage    = placeholder('Accounts',    'الحسابات العامة')
const CashierPage     = placeholder('Cashier',     'الخزينة والبنوك')
const SuppliersPage   = placeholder('Suppliers',   'الموردين')
const CustomersPage   = placeholder('Customers',   'العملاء')
const AttendancePage  = placeholder('Attendance',  'الحضور والانصراف')
const PayrollPage     = placeholder('Payroll',     'الرواتب')

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true,                    Component: Dashboard     },
      { path: 'cattle',                 Component: CattlePage    },
      { path: 'inventory',              Component: InventoryPage  },
      { path: 'purchasing',             Component: PurchasingPage },
      { path: 'sales',                  Component: SalesPage      },
      { path: 'accounts',               Component: AccountsPage   },
      { path: 'cashier',                Component: CashierPage    },
      { path: 'suppliers',              Component: SuppliersPage  },
      { path: 'customers',              Component: CustomersPage  },
      { path: 'employees',              Component: EmployeesPage  },
      { path: 'attendance',             Component: AttendancePage },
      { path: 'payroll',                Component: PayrollPage    },
      { path: 'settings/users',         Component: UsersPage      },
      { path: 'settings/rules',         Component: RulesPage      },
    ],
  },
])