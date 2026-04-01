import { createBrowserRouter } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import AttendancePage from './pages/AttendancePage'
import PayrollPage from './pages/PayrollPage'
import PurchasingPage from './pages/PurchasingPage'
import SalesPage from './pages/SalesPage'
import CashierPage from './pages/CashierPage'
import AccountsPage from './pages/AccountsPage'

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-full bg-neutral-50 p-6 font-cairo flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="font-cairo font-bold text-[18px] text-neutral-700 mb-1">{title}</h2>
        <p className="font-cairo text-[13px] text-neutral-400">هذه الصفحة قيد الإنشاء</p>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true,            Component: () => <ComingSoon title="لوحة التحكم" /> },
      { path: 'cattle',         Component: () => <ComingSoon title="الرؤوس والدورات" /> },
      { path: 'inventory',      Component: () => <ComingSoon title="المخزون" /> },
      { path: 'purchasing',     Component: PurchasingPage },
      { path: 'sales',          Component: SalesPage },
      { path: 'accounts',       Component: AccountsPage },
      { path: 'cashier',        Component: CashierPage },
      { path: 'suppliers',      Component: () => <ComingSoon title="الموردين" /> },
      { path: 'customers',      Component: () => <ComingSoon title="العملاء" /> },
      { path: 'employees',      Component: () => <ComingSoon title="الموظفين" /> },
      { path: 'attendance',     Component: AttendancePage },
      { path: 'payroll',        Component: PayrollPage },
      { path: 'settings/users', Component: () => <ComingSoon title="المستخدمين" /> },
      { path: 'settings/rules', Component: () => <ComingSoon title="صلاحيات الوصول" /> },
    ],
  },
])
