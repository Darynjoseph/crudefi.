import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Login from '../pages/auth/Login';
import Unauthorized from '../pages/auth/Unauthorized';
import PrivateRoute, { AdminRoute, ManagerRoute, StaffRoute } from '../components/common/PrivateRoute';
import Sidebar, { SidebarProvider, useSidebar } from '../layouts/Sidebar';
import Topbar from '../layouts/Topbar';

// Lazy load components for better performance
// const Login = lazy(() => import('../pages/Login'));

/*const Dashboard = lazy(() => import('../pages/dashboard'));
const MiscExpenses = lazy(() => import('../pages/expenses/misc'));
const PettyCash = lazy(() => import('../pages/expenses/petty-cash'));
const FruitDeliveries = lazy(() => import('../pages/fruit-deliveries'));
const OilLogs = lazy(() => import('../pages/oil-logs'));
const Reports = lazy(() => import('../pages/reports'));
const StaffSalaries = lazy(() => import('../pages/staff-salaries'));
const Admin = lazy(() => import('../pages/admin'));*/

// Layout content component that uses sidebar context
const LayoutContent = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100/60 min-h-screen font-['Inter',ui-sans-serif,system-ui]">
      <Sidebar />
      <div className={`transition-all duration-300 ease-in-out ${!isCollapsed ? 'lg:pl-64' : 'pl-0'}`}>
        <Topbar />
        <main className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary shadow-sm"></div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

// Layout component wrapper with authentication using floating sidebar
const Layout = () => {
  return (
    <PrivateRoute>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </PrivateRoute>
  );
};

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Import the actual dashboard component
const Dashboard = lazy(() => import('../pages/dashboard'));
const AdminPanel = lazy(() => import('../pages/admin'));
const FruitDeliveries = lazy(() => import('../pages/deliveries/fruit-deliveries'));
const StaffManagement = lazy(() => import('../pages/staff/StaffManagementPage'));
const ShiftManagement = lazy(() => import('../pages/shifts/ShiftManagementPage'));
const RolesManagement = lazy(() => import('../pages/roles/RoleManagementPage'));
const ExpenseSetup = lazy(() => import('../pages/expense-setup'));
const AssetsPage = lazy(() => import('../pages/assets'));
const ExpensesPage = lazy(() => import('../pages/expenses'));
const AddExpensePage = lazy(() => import('../pages/expenses/add'));
const OilLogsPage = lazy(() => import('../pages/oil-logs'));
const SuppliersPage = lazy(() => import('../pages/suppliers'));
const FruitsPage = lazy(() => import('../pages/fruits'));

// Report pages
const ReportsHub = lazy(() => import('../pages/reports'));
const FinancialReports = lazy(() => import('../pages/reports/financial'));
const LaborReports = lazy(() => import('../pages/reports/labor'));
const DeliveryReports = lazy(() => import('../pages/reports/deliveries'));
const ProductionReports = lazy(() => import('../pages/reports/production'));
const CombinedReports = lazy(() => import('../pages/reports/combined'));



// Route configuration with role-based protection
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: 'fruit-deliveries',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <FruitDeliveries />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'staff',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <StaffManagement />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'roles',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <RolesManagement />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'shifts',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ShiftManagement />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'expense-setup',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ExpenseSetup />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'assets',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AssetsPage />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'expenses',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ExpensesPage />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'expenses/add',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AddExpensePage />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'oil-logs',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <OilLogsPage />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'suppliers',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SuppliersPage />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'fruits',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <FruitsPage />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'reports',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsHub />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'reports/financial',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <FinancialReports />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'reports/labor',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <LaborReports />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'reports/deliveries',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <DeliveryReports />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'reports/production',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProductionReports />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'reports/combined',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <CombinedReports />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminPanel />
            </Suspense>
          </AdminRoute>
        )
      },
      // Example of role-based routes (uncomment when components are created)
      /*
      {
        path: 'expenses',
        children: [
          {
            path: 'misc',
            element: (
              <StaffRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <MiscExpenses />
                </Suspense>
              </StaffRoute>
            )
          },
          {
            path: 'petty-cash',
            element: (
              <StaffRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <PettyCash />
                </Suspense>
              </StaffRoute>
            )
          }
        ]
      },
      {
        path: 'fruit-deliveries',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <FruitDeliveries />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'oil-logs',
        element: (
          <StaffRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <OilLogs />
            </Suspense>
          </StaffRoute>
        )
      },
      {
        path: 'reports',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Reports />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'staff-salaries',
        element: (
          <ManagerRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <StaffSalaries />
            </Suspense>
          </ManagerRoute>
        )
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Admin />
            </Suspense>
          </AdminRoute>
        )
      }
      */
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);

export default router;
