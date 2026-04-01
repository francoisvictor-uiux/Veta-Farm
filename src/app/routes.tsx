import { createBrowserRouter } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'

// Pages — all modules
import Dashboard        from './pages/Dashboard'
import AttendancePage   from './pages/AttendancePage'
import PayrollPage      from './pages/PayrollPage'
import PurchasingPage   from './pages/PurchasingPage'
import SalesPage        from './pages/SalesPage'
import CashierPage      from './pages/CashierPage'
import AccountsPage     from './pages/AccountsPage'
import CattlePage       from './pages/CattlePage'
import InventoryPage    from './pages/InventoryPage'
import CustomersPage    from './pages/CustomersPage'
import SuppliersPage    from './pages/SuppliersPage'
import EmployeesPage    from './pages/EmployeesPage'
import LoginPage        from './pages/auth/LoginPage'
import UsersPage        from './pages/settings/UsersPage'
import RulesPage        from './pages/settings/RulesPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true,            Component: Dashboard       },
      { path: 'cattle',         Component: CattlePage      },
      { path: 'inventory',      Component: InventoryPage   },
      { path: 'purchasing',     Component: PurchasingPage  },
      { path: 'sales',          Component: SalesPage       },
      { path: 'accounts',       Component: AccountsPage    },
      { path: 'cashier',        Component: CashierPage     },
      { path: 'suppliers',      Component: SuppliersPage   },
      { path: 'customers',      Component: CustomersPage   },
      { path: 'employees',      Component: EmployeesPage   },
      { path: 'attendance',     Component: AttendancePage  },
      { path: 'payroll',        Component: PayrollPage     },
      { path: 'settings/users', Component: UsersPage       },
      { path: 'settings/rules', Component: RulesPage       },
    ],
  },
])
