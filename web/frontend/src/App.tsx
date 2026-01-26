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
import InventorySectionsPage from './pages/inventory/InventorySectionsPage';
import ItemsBelowMinReportPage from './pages/inventory/reports/ItemsBelowMinReportPage';
import StagnantItemsReportPage from './pages/inventory/reports/StagnantItemsReportPage';
import ItemMovementReportPage from './pages/inventory/reports/ItemMovementReportPage';
import InventoryCountPage from './pages/inventory/InventoryCountPage';
import SystemSettingsPage from './pages/settings/SystemSettingsPage';
import PublicCompanyPage from './pages/public/PublicCompanyPage';
import RolesPage from './pages/settings/RolesPage';
import PermissionsPage from './pages/settings/PermissionsPage';
import CustomersPage from './pages/crm/CustomersPage';
import CustomerFormPage from './pages/crm/CustomerFormPage';
import PurchaseRequisitionsPage from './pages/procurement/PurchaseRequisitionsPage';
import PurchaseRequisitionFormPage from './pages/procurement/PurchaseRequisitionFormPage';
import RFQsPage from './pages/procurement/RFQsPage';
import RFQFormPage from './pages/procurement/RFQFormPage';
import SupplierQuotationsPage from './pages/procurement/SupplierQuotationsPage';
import SupplierQuotationFormPage from './pages/procurement/SupplierQuotationFormPage';
import QuotationComparisonPage from './pages/procurement/QuotationComparisonPage';
import QuotationComparisonFormPage from './pages/procurement/QuotationComparisonFormPage';
import SuppliersPage from './pages/procurement/SuppliersPage';
import SupplierFormPage from './pages/procurement/SupplierFormPage';
import SupplierOutstandingPage from './pages/procurement/SupplierOutstandingPage';
import SupplierItemsPage from './pages/procurement/SupplierItemsPage';
import SupplierItemFormPage from './pages/procurement/SupplierItemFormPage';
import SupplierInvoicesPage from './pages/procurement/SupplierInvoicesPage';
import SupplierInvoiceFormPage from './pages/procurement/SupplierInvoiceFormPage';
import PurchaseOrdersPage from './pages/procurement/PurchaseOrdersPage';
import PurchaseOrderFormPage from './pages/procurement/PurchaseOrderFormPage';
import GRNsPage from './pages/procurement/GRNsPage';
import GRNFormPage from './pages/procurement/GRNFormPage';
import PurchaseReturnsPage from './pages/procurement/PurchaseReturnsPage';
import PurchaseReturnFormPage from './pages/procurement/PurchaseReturnFormPage';
import ApprovalsInbox from './pages/procurement/ApprovalsInbox';
import { Toaster } from 'react-hot-toast';
import StockLevelsPage from './pages/inventory/StockLevelsPage';
import QualityInspectionPage from './pages/inventory/QualityInspectionPage';

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
          <Route path="approvals" element={<ApprovalsInbox />} />
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
            <Route index element={<Navigate to="sections" replace />} />
            <Route path="sections" element={<InventorySectionsPage />} />
            <Route path="categories" element={<ItemCategoriesPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="quality-parameters" element={<QualityParametersPage />} />
            <Route path="price-lists" element={<PriceListsPage />} />
            <Route path="items">
              <Route index element={<ItemsMasterPage />} />
              <Route index element={<ItemsMasterPage />} />
              <Route path=":id" element={<ItemFormPage />} />
            </Route>
            <Route path="reports">
              <Route path="below-min" element={<ItemsBelowMinReportPage />} />
              <Route path="stagnant" element={<StagnantItemsReportPage />} />
              <Route path="movement" element={<ItemMovementReportPage />} />
            </Route>
            <Route path="count" element={<InventoryCountPage />} />
            <Route path="stocks" element={<StockLevelsPage />} />
            <Route path="quality-inspection" element={<QualityInspectionPage />} />
          </Route>

          <Route path="crm">
            <Route index element={<Navigate to="customers" replace />} />
            <Route path="customers">
              <Route index element={<CustomersPage />} />
              <Route path=":id" element={<CustomerFormPage />} />
            </Route>
          </Route>
          <Route path="procurement">
            <Route index element={<Navigate to="pr" replace />} />
            <Route path="pr">
              <Route index element={<PurchaseRequisitionsPage />} />
              <Route path="new" element={<PurchaseRequisitionFormPage />} />
              <Route path=":id" element={<PurchaseRequisitionFormPage />} />
            </Route>
            <Route path="rfq">
              <Route index element={<RFQsPage />} />
              <Route path="new" element={<RFQFormPage />} />
              <Route path=":id" element={<RFQFormPage />} />
            </Route>
            <Route path="quotation">
              <Route index element={<SupplierQuotationsPage />} />
              <Route path="new" element={<SupplierQuotationFormPage />} />
              <Route path=":id" element={<SupplierQuotationFormPage />} />
            </Route>
            <Route path="comparison">
              <Route index element={<QuotationComparisonPage />} />
              <Route path="new" element={<QuotationComparisonFormPage />} />
              <Route path=":id" element={<QuotationComparisonFormPage />} />
            </Route>
            <Route path="suppliers">
              <Route index element={<SuppliersPage />} />
              <Route path="new" element={<SupplierFormPage />} />
              <Route path="outstanding" element={<SupplierOutstandingPage />} />
              <Route path="items">
                <Route index element={<SupplierItemsPage />} />
                <Route path="new" element={<SupplierItemFormPage />} />
              </Route>
              <Route path=":id" element={<SupplierFormPage />} />
            </Route>

            <Route path="po">
              <Route index element={<PurchaseOrdersPage />} />
              <Route path="new" element={<PurchaseOrderFormPage />} />
              <Route path=":id" element={<PurchaseOrderFormPage />} />
            </Route>

            <Route path="grn">
              <Route index element={<GRNsPage />} />
              <Route path="new" element={<GRNFormPage />} />
              <Route path=":id" element={<GRNFormPage />} />
            </Route>

            <Route path="invoices">
              <Route index element={<SupplierInvoicesPage />} />
              <Route path="new" element={<SupplierInvoiceFormPage />} />
              <Route path=":id" element={<SupplierInvoiceFormPage />} />
            </Route>

            <Route path="returns">
              <Route index element={<PurchaseReturnsPage />} />
              <Route path="new" element={<PurchaseReturnFormPage />} />
              <Route path=":id" element={<PurchaseReturnFormPage />} />
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
