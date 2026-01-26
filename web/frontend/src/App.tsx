import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
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
import GRNListPage from './pages/inventory/warehouse/GRNListPage';
import GRNFormPage from './pages/inventory/warehouse/GRNFormPage';
import MaterialIssueListPage from './pages/inventory/warehouse/MaterialIssueListPage';
import MaterialIssueFormPage from './pages/inventory/warehouse/MaterialIssueFormPage';
import TransferNoteListPage from './pages/inventory/warehouse/TransferNoteListPage';
import TransferNoteFormPage from './pages/inventory/warehouse/TransferNoteFormPage';
import PeriodicInventoryReportPage from './pages/inventory/reports/PeriodicInventoryReportPage';
import VarianceReportPage from './pages/inventory/reports/VarianceReportPage';
import DualInventoryValuationPage from './pages/inventory/reports/DualInventoryValuationPage';
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
import SalesSectionsPage from './pages/sales/SalesSectionsPage';
import QuotationListPage from './pages/sales/QuotationListPage';
import QuotationFormPage from './pages/sales/QuotationFormPage';
import SaleOrderListPage from './pages/sales/SaleOrderListPage';
import SaleOrderFormPage from './pages/sales/SaleOrderFormPage';
import DeliveryOrderListPage from './pages/sales/DeliveryOrderListPage';
import DeliveryOrderFormPage from './pages/sales/DeliveryOrderFormPage';
import SalesInvoiceListPage from './pages/sales/SalesInvoiceListPage';
import SalesInvoiceFormPage from './pages/sales/SalesInvoiceFormPage';
import ReceiptListPage from './pages/sales/ReceiptListPage';
import ReceiptFormPage from './pages/sales/ReceiptFormPage';
import SalesReportsPage from './pages/sales/SalesReportsPage';
import { Toaster } from 'react-hot-toast';
import StockLevelsPage from './pages/inventory/StockLevelsPage';

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
      <ScrollToTop />
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
            <Route index element={<Navigate to="sections" replace />} />
            <Route path="sections" element={<InventorySectionsPage />} />
            <Route path="categories" element={<ItemCategoriesPage />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="warehouses" element={<WarehousesPage />} />
            <Route path="quality-parameters" element={<QualityParametersPage />} />
            <Route path="price-lists" element={<PriceListsPage />} />
            <Route path="items">
              <Route index element={<ItemsMasterPage />} />
              <Route path=":id" element={<ItemFormPage />} />
            </Route>
            <Route path="reports">
              <Route path="below-min" element={<ItemsBelowMinReportPage />} />
              <Route path="stagnant" element={<StagnantItemsReportPage />} />
              <Route path="movement" element={<ItemMovementReportPage />} />
              <Route path="periodic-inventory" element={<PeriodicInventoryReportPage />} />
              <Route path="variance" element={<VarianceReportPage />} />
              <Route path="dual-valuation" element={<DualInventoryValuationPage />} />
            </Route>
            <Route path="warehouse">
              <Route path="grn">
                <Route index element={<GRNListPage />} />
                <Route path="new" element={<GRNFormPage />} />
                <Route path=":id" element={<GRNFormPage />} />
              </Route>
              <Route path="issue">
                <Route index element={<MaterialIssueListPage />} />
                <Route path="new" element={<MaterialIssueFormPage />} />
                <Route path=":id" element={<MaterialIssueFormPage />} />
              </Route>
              <Route path="transfer">
                <Route index element={<TransferNoteListPage />} />
                <Route path="new" element={<TransferNoteFormPage />} />
                <Route path=":id" element={<TransferNoteFormPage />} />
              </Route>
            </Route>
            <Route path="count" element={<InventoryCountPage />} />
            <Route path="stocks" element={<StockLevelsPage />} />
          </Route>

          <Route path="crm">
            <Route index element={<Navigate to="customers" replace />} />
            <Route path="customers">
              <Route index element={<CustomersPage />} />
              <Route path=":id" element={<CustomerFormPage />} />
            </Route>
          </Route>
          <Route path="sales">
            <Route index element={<Navigate to="sections" replace />} />
            <Route path="sections" element={<SalesSectionsPage />} />
            <Route path="quotations">
              <Route index element={<QuotationListPage />} />
              <Route path="new" element={<QuotationFormPage />} />
              <Route path=":id" element={<QuotationFormPage />} />
            </Route>
            <Route path="orders">
              <Route index element={<SaleOrderListPage />} />
              <Route path="new" element={<SaleOrderFormPage />} />
              <Route path=":id" element={<SaleOrderFormPage />} />
            </Route>
            <Route path="delivery-orders">
              <Route index element={<DeliveryOrderListPage />} />
              <Route path="new" element={<DeliveryOrderFormPage />} />
              <Route path=":id" element={<DeliveryOrderFormPage />} />
            </Route>
            <Route path="invoices">
              <Route index element={<SalesInvoiceListPage />} />
              <Route path="new" element={<SalesInvoiceFormPage />} />
              <Route path=":id" element={<SalesInvoiceFormPage />} />
            </Route>
            <Route path="receipts">
              <Route index element={<ReceiptListPage />} />
              <Route path="new" element={<ReceiptFormPage />} />
              <Route path=":id" element={<ReceiptFormPage />} />
            </Route>
            <Route path="reports" element={<SalesReportsPage />} />
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
