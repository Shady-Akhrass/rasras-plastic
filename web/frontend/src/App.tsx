import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import EmployeeList from './pages/employees/EmployeeList';
import UserList from './pages/users/UserList';
import SettingsPage from './pages/settings/SettingsPage';
import CompanyInfoPage from './pages/settings/CompanyInfoPage';
import UnitsPage from './pages/inventory/UnitsPage';
import ItemCategoriesPage from './pages/inventory/ItemCategoriesPage';
import ItemsMasterPage from './pages/inventory/ItemsMasterPage';
import ItemFormPage from './pages/inventory/ItemFormPage';
import WarehousesPage from './pages/inventory/WarehousesPage';
import QualityParametersPage from './pages/inventory/QualityParametersPage';
import PriceListsPage from './pages/inventory/PriceListsPage';
import SystemSettingsPage from './pages/settings/SystemSettingsPage';
import PublicCompanyPage from './pages/public/PublicCompanyPage';
import RolesPage from './pages/settings/RolesPage';
import PermissionsPage from './pages/settings/PermissionsPage';
import { Toaster } from 'react-hot-toast';

// Simple Auth Guard Placeholder
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('accessToken');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/company-profile" element={<PublicCompanyPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="users" element={<UserList />} />
          <Route path="settings">
            <Route index element={<SettingsPage />} />
            <Route path="company" element={<CompanyInfoPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="system" element={<SystemSettingsPage />} />
            <Route path="users" element={<UserList />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
          </Route>
          <Route path="inventory">
            <Route index element={<Navigate to="categories" replace />} />
            <Route path="categories" element={<ItemCategoriesPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="quality-parameters" element={<QualityParametersPage />} />
            <Route path="price-lists" element={<PriceListsPage />} />
            <Route path="items">
              <Route index element={<ItemsMasterPage />} />
              <Route path=":id" element={<ItemFormPage />} />
            </Route>
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
