import { createHashRouter } from 'react-router'
import { AppLayout } from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/Dashboard'
import StationsPage from './pages/StationsPage'
import RulesPage from './pages/settings/RulesPage'
import UsersPage from './pages/settings/UsersPage'
import EmployeesPage from './pages/EmployeesPage'
import InventoryPage from './pages/InventoryPage'
import CattlePage from './pages/CattlePage'
import SuppliersPage from './pages/SuppliersPage'
import CustomersPage from './pages/CustomersPage'
import AttendancePage from './pages/AttendancePage'
import PayrollPage from './pages/PayrollPage'
import PurchasingPage from './pages/PurchasingPage'
import SalesPage from './pages/SalesPage'
import AccountsPage from './pages/AccountsPage'
import CashierPage from './pages/CashierPage'

export const router = createHashRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true,                    Component: Dashboard        },
      { path: 'stations',               Component: StationsPage     },
      { path: 'cattle',                 Component: CattlePage       },
      { path: 'inventory',              Component: InventoryPage    },
      { path: 'purchasing',             Component: PurchasingPage   },
      { path: 'sales',                  Component: SalesPage        },
      { path: 'accounts',               Component: AccountsPage     },
      { path: 'cashier',                Component: CashierPage      },
      { path: 'suppliers',              Component: SuppliersPage    },
      { path: 'customers',              Component: CustomersPage    },
      { path: 'employees',              Component: EmployeesPage    },
      { path: 'attendance',             Component: AttendancePage   },
      { path: 'payroll',                Component: PayrollPage      },
      { path: 'settings/users',         Component: UsersPage        },
      { path: 'settings/rules',         Component: RulesPage        },
    ],
  },
])
