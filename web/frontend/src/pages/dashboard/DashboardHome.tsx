import React from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import WarehouseDashboard from './WarehouseDashboard';
import ManagementDashboard from './ManagementDashboard';
import ProcurementDashboard from './ProcurementDashboard';
import QualityControlDashboard from './QualityControlDashboard';
import FinanceDashboard from './FinanceDashboard';
import SalesDashboard from './SalesDashboard';

const DashboardHome: React.FC = () => {
    usePageTitle('لوحة التحكم');

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!user) return <div className="p-8">Loading user data...</div>;

    const userPermissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];

    // Helper function for permission checks
    const hasPermission = (permission: string) => userPermissions.includes(permission);

    // Role-based dashboard selection
    const role = user.roleCode?.toUpperCase();

    switch (role) {
        case 'WHM':
        case 'WAREHOUSE':
            return <WarehouseDashboard />;
        case 'PM':
        case 'PROCUREMENT':
        case 'BUYER':
            return <ProcurementDashboard />;
        case 'QC':
        case 'QUALITY':
            return <QualityControlDashboard />;
        case 'FM':
        case 'FINANCE':
        case 'ACC':
        case 'ACCOUNTANT':
            return <FinanceDashboard />;
        case 'SM':
        case 'SALES':
            return <SalesDashboard />;
        case 'ADMIN':
        case 'GM':
        case 'GENERAL_MANAGER':
            return <ManagementDashboard />;
        default:
            // Fallback: If no specific dashboard, try to use permissions or default to Management
            if (hasPermission("SECTION_WAREHOUSE")) return <WarehouseDashboard />;
            if (hasPermission("SECTION_PROCUREMENT")) return <ProcurementDashboard />;
            if (hasPermission("SECTION_OPERATIONS")) return <QualityControlDashboard />;
            if (hasPermission("SECTION_FINANCE")) return <FinanceDashboard />;
            if (hasPermission("SECTION_SALES")) return <SalesDashboard />;
            return <ManagementDashboard />;
    }
};

export default DashboardHome;
