import React, { useState, useEffect } from 'react';
import {
    Users, Package, Bell, Search, Menu, LogOut, LayoutDashboard,
    Settings, User, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    HelpCircle, Shield, Building2, Lock, Ruler,
    Calendar, Clock, Command, Maximize2, Minimize2, Microscope,
    DollarSign, FileText, Tag, Scale, Truck, Warehouse, ShoppingCart,
    ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine,
    Receipt, ClipboardList, BarChart2, AlertTriangle, Activity,
    ClipboardCheck, GitCompare, Undo2, Database
} from 'lucide-react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clearSession, getSessionRemainingMs } from '../../services/authUtils';
import { refreshUserPermissions } from '../../services/authService';
import { canAccessPath } from '../../utils/permissionUtils';
import { ROLE_CODES } from '../../constants/roleCodes';
import { formatDate, formatTime } from '../../utils/format';
import { useNotificationPolling } from '../../hooks/useNotificationPolling';

// ════════════════════════════════════════════
// ─── Sub-Components (unchanged) ───
// ════════════════════════════════════════════

const SidebarLink = ({
    to, icon: Icon, label, active, collapsed, badge, blink, search
}: {
    to: string; icon: React.ElementType; label: string; active: boolean;
    collapsed: boolean; badge?: number; blink?: boolean; search?: string;
}) => (
    <Link
        to={search ? { pathname: to, search } : to}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl 
            transition-all duration-300
            ${active
                ? 'bg-gradient-to-l from-brand-primary to-brand-primary/90 text-white shadow-lg shadow-brand-primary/25'
                : 'text-slate-600 hover:bg-brand-primary/5 hover:text-brand-primary'}
            ${collapsed ? 'justify-center px-3' : ''}`}
    >
        <div className="relative">
            <Icon className={`w-5 h-5 transition-transform duration-300 
                ${active ? '' : 'group-hover:scale-110'}`} />
            {badge && collapsed && (
                <span className="absolute -top-2 -right-2 w-4 h-4 text-[10px] font-bold 
                    rounded-full flex items-center justify-center border border-white 
                    animate-blink-red bg-rose-500 text-white shadow-sm">
                    {badge}
                </span>
            )}
        </div>
        {!collapsed && <span className="font-medium flex-1">{label}</span>}
        {badge && !collapsed && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300
                ${active ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}
                ${blink ? 'animate-blink-red !bg-rose-500 !text-white shadow-sm' : ''}`}>
                {badge}
            </span>
        )}
        {collapsed && (
            <div className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm 
                rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                {label}
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 
                    bg-slate-900 rotate-45" />
            </div>
        )}
        {active && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white 
                rounded-l-full opacity-50" />
        )}
    </Link>
);

const SidebarSubGroupTitle = ({ title, collapsed }: { title: string; collapsed: boolean }) => (
    !collapsed ? (
        <div className="px-3 py-2 mt-3 mb-1 first:mt-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {title}
            </span>
        </div>
    ) : null
);

const SidebarDropdownSection = ({
    id: _id, title, icon: Icon, collapsed, isOpen, onToggle,
    hasActiveChild, badge, blink, children
}: {
    id: string; title: string; icon: React.ElementType; collapsed: boolean;
    isOpen: boolean; onToggle: () => void; hasActiveChild: boolean;
    badge?: number; blink?: boolean; children: React.ReactNode;
}) => {
    if (collapsed) {
        return (
            <div className="mt-2">
                <div className="mx-3 border-t border-slate-200" />
                <div className="mt-1 space-y-0.5">{children}</div>
            </div>
        );
    }
    return (
        <div className="mt-4 mb-1">
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 
                    rounded-xl transition-all duration-200
                    ${hasActiveChild
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {badge && !isOpen && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full 
                            transition-all duration-300
                            ${hasActiveChild
                                ? 'bg-white/20 text-white'
                                : 'bg-brand-primary/10 text-brand-primary'}
                            ${blink
                                ? 'animate-blink-red !bg-rose-500 !text-white shadow-sm'
                                : ''}`}>
                            {badge}
                        </span>
                    )}
                    {isOpen
                        ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </div>
            </button>
            <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
                <div className="overflow-hidden">
                    <div className="mt-1 mr-2 space-y-0.5 border-r-2 border-slate-100 pr-2 min-h-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NotificationItem = ({
    title, message, time, read, type = 'info', route, onNavigate
}: {
    title: string; message: string; time: string; read: boolean;
    type?: 'info' | 'success' | 'warning'; route?: string; onNavigate?: () => void;
}) => {
    const nav = useNavigate();
    const typeColors = {
        info: 'bg-brand-primary', success: 'bg-emerald-500', warning: 'bg-amber-500'
    };

    const handleClick = () => {
        if (route) {
            nav(route);
            onNavigate?.();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b 
                border-slate-100 last:border-0 ${!read ? 'bg-brand-primary/5' : ''}`}>
            <div className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[type]} 
                    ${read ? 'opacity-0' : ''}`} />
                <div className="flex-1">
                    <p className={`text-sm ${read
                        ? 'text-slate-600'
                        : 'text-slate-900 font-semibold'}`}>
                        {title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{message}</p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{time}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════
// ─── Main Layout ───
// ════════════════════════════════════════════

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [, setRefreshKey] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { pendingApprovals, pendingInspections, waitingImports, pendingCustomerRequests } =
        useNotificationPolling(location.pathname);

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userName = user?.fullNameAr || user?.username || 'المستخدم';
    const userRole = user?.roleCode || user?.roleName || 'USER';
    const userPermissions: string[] = Array.isArray(user?.permissions)
        ? user.permissions : [];

    // Clock — once per minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    // Close mobile menu on navigate
    useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

    // Auto-logout on JWT expiry + Initialize SW with credentials
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // Sync with Service Worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            navigator.serviceWorker.controller.postMessage({
                type: 'INIT_AUTH',
                payload: {
                    accessToken: token,
                    userId: user?.userId,
                    apiUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`
                }
            });
        }

        const remaining = getSessionRemainingMs(token);
        if (remaining <= 0) { clearSession(); return; }
        const id = setTimeout(() => clearSession(), remaining);
        return () => clearTimeout(id);
    }, []);

    // تحديث الصلاحيات من الخادم عند تحميل الـ Dashboard — لا تعتمد على localStorage فقط
    useEffect(() => {
        refreshUserPermissions().then((ok) => { if (ok) setRefreshKey((k) => k + 1); });
    }, []);

    // Route guard
    useEffect(() => {
        if (!canAccessPath(location.pathname, userRole, userPermissions)) {
            navigate('/dashboard', { replace: true });
        }
    }, [location.pathname, userRole, userPermissions, navigate]);

    const handleLogout = () => clearSession();

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').slice(0, 2);

    // ─── Role groups (fallback) ───
    const ROLES_PROCUREMENT = ['PM', 'BUYER', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'];
    const ROLES_SALES = ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'];
    const ROLES_WAREHOUSE = [ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM, ROLE_CODES.WAREHOUSE_KEEPER];
    const ROLES_OPERATIONS = [ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM, ROLE_CODES.SALES_MANAGER];
    const ROLES_SYSTEM = [ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN];
    /** GM و ADMIN لهم override access دائمًا — راجع توثيق_الصلاحيات.md */
    const ROLES_FINANCE = [ROLE_CODES.ADMIN, ROLE_CODES.SYS_ADMIN, ROLE_CODES.SYSTEM_ADMIN, ROLE_CODES.GM, ROLE_CODES.FINANCE_MANAGER, ROLE_CODES.ACCOUNTANT];
    const ROLES_CRM = ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'];

    // ─── Nav items (use hook counts) ───
    const navItems: Array<{
        to: string; icon: React.ElementType; label: string; section: string;
        roles?: readonly string[]; requiredPermission?: string;
        warehouseGroup?: string; search?: string; badge?: number; order?: number;
    }> = [
            { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة القيادة', section: 'main' },
            {
                to: '/dashboard/approvals', icon: Bell, label: 'الطلبات والاعتمادات',
                section: 'main', badge: (pendingApprovals + pendingCustomerRequests) || undefined
            },
            {
                to: '/dashboard/audit', icon: FileText, label: 'سجل الاعتمادات',
                section: 'main', requiredPermission: 'SECTION_MAIN'
            },
            {
                to: '/dashboard/users', icon: User, label: 'المستخدمين',
                roles: ['ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'main', requiredPermission: 'SECTION_USERS'
            },
            {
                to: '/dashboard/employees', icon: Users, label: 'الموظفين',
                roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'hr', requiredPermission: 'SECTION_EMPLOYEES'
            },
            {
                to: '/dashboard/hr/leave-types', icon: ClipboardList, label: 'أنواع الإجازات',
                roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'hr', requiredPermission: 'SECTION_EMPLOYEES'
            },
            {
                to: '/dashboard/hr/shifts', icon: Clock, label: 'الشفتات',
                roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'hr', requiredPermission: 'SECTION_EMPLOYEES'
            },
            {
                to: '/dashboard/hr/holidays', icon: Calendar, label: 'العطلات',
                roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'hr', requiredPermission: 'SECTION_EMPLOYEES'
            },
            {
                to: '/dashboard/hr/employee-shifts', icon: Users, label: 'شفتات الموظفين',
                roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'hr', requiredPermission: 'SECTION_EMPLOYEES'
            },
            {
                to: '/dashboard/hr/attendance', icon: ClipboardCheck, label: 'الحضور والانصراف',
                roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'hr', requiredPermission: 'SECTION_EMPLOYEES'
            },
            {
                to: '/dashboard/hr/payroll', icon: DollarSign, label: 'المرتبات',
                roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'],
                section: 'hr', requiredPermission: 'SECTION_EMPLOYEES'
            },

            // Procurement
            {
                to: '/dashboard/procurement/pr', icon: FileText, label: 'طلبات الشراء (PR)',
                section: 'procurement', order: 1, roles: ROLES_PROCUREMENT,
                requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/rfq', icon: FileText,
                label: 'طلبات عروض الأسعار (RFQ)', section: 'procurement', order: 2,
                roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/quotation', icon: Tag, label: 'عروض الموردين',
                section: 'procurement', order: 3, roles: ROLES_PROCUREMENT,
                requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/comparison', icon: Scale,
                label: 'مقارنة العروض (QCS)', section: 'procurement', order: 4,
                roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/po', icon: ShoppingCart,
                label: 'أوامر الشراء (PO)', section: 'procurement', order: 5,
                roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/invoices', icon: FileText,
                label: 'فواتير الموردين', section: 'procurement', order: 7,
                roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/suppliers/outstanding', icon: DollarSign,
                label: 'الأرصدة المستحقة', section: 'procurement', order: 8,
                roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/returns', icon: Undo2,
                label: 'مرتجعات الشراء', section: 'procurement', order: 9,
                roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT'
            },
            {
                to: '/dashboard/procurement/suppliers', icon: Truck, label: 'الموردين',
                section: 'procurement', order: 10, roles: ROLES_PROCUREMENT,
                requiredPermission: 'SECTION_PROCUREMENT'
            },

            // Sales
            {
                to: '/dashboard/sales/sections', icon: ShoppingCart,
                label: 'قسم المبيعات', section: 'sales', order: 1,
                roles: ROLES_SALES, requiredPermission: 'SECTION_SALES'
            },
            {
                to: '/dashboard/sales/purchase-requisitions', icon: ClipboardList,
                label: 'طلبات الشراء', section: 'sales', order: 2, roles: ROLES_SALES,
                requiredPermission: 'SECTION_SALES'
            },
            {
                to: '/dashboard/sales/customer-requests', icon: User, label: 'طلبات العملاء',
                section: 'sales', order: 2.5, roles: ROLES_SALES,
                requiredPermission: 'SECTION_SALES',
                badge: pendingCustomerRequests || undefined
            },
            {
                to: '/dashboard/sales/quotations', icon: Tag, label: 'عروض الأسعار',
                section: 'sales', order: 3, roles: ROLES_SALES,
                requiredPermission: 'SECTION_SALES'
            },
            {
                to: '/dashboard/sales/orders', icon: ClipboardList,
                label: 'أوامر البيع (SO)', section: 'sales', order: 4,
                roles: ROLES_SALES, requiredPermission: 'SECTION_SALES'
            },
            {
                to: '/dashboard/sales/issue-notes', icon: Package,
                label: 'إذونات الصرف', section: 'sales', order: 5,
                roles: ROLES_SALES, requiredPermission: 'SECTION_SALES'
            },
            {
                to: '/dashboard/sales/delivery-orders', icon: Truck,
                label: 'أوامر التوصيل', section: 'sales', order: 6,
                roles: ROLES_SALES, requiredPermission: 'SECTION_SALES'
            },
            {
                to: '/dashboard/sales/invoices', icon: FileText,
                label: 'فواتير المبيعات', section: 'sales', order: 7,
                roles: ROLES_SALES, requiredPermission: 'SECTION_SALES'
            },
            {
                to: '/dashboard/sales/receipts', icon: Receipt,
                label: 'إيصالات الدفع', section: 'sales', order: 8,
                roles: ROLES_SALES, requiredPermission: 'SECTION_SALES'
            },

            // CRM
            {
                to: '/dashboard/crm/customers', icon: Users, label: 'العملاء',
                section: 'crm', roles: ROLES_CRM, requiredPermission: 'SECTION_CRM'
            },

            // Finance (SECTION_FINANCE)
            {
                to: '/dashboard/finance/payment-vouchers', icon: Receipt,
                label: 'سندات الدفع', section: 'finance', roles: ROLES_FINANCE,
                requiredPermission: 'SECTION_FINANCE'
            },
            {
                to: '/dashboard/finance/payment-vouchers/new', icon: FileText,
                label: 'سند صرف جديد', section: 'finance', roles: ROLES_FINANCE,
                requiredPermission: 'SECTION_FINANCE'
            },

            // Warehouse
            {
                to: '/dashboard/inventory/sections', icon: Warehouse,
                label: 'أقسام المخزن', section: 'warehouse',
                warehouseGroup: 'management', order: 1, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/warehouses', icon: Building2,
                label: 'المستودعات', section: 'warehouse',
                warehouseGroup: 'management', order: 2, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/stocks', icon: Package,
                label: 'أرصدة المخزون', section: 'warehouse',
                warehouseGroup: 'management', order: 3, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/warehouse/issue', icon: ArrowUpFromLine,
                label: 'إذن صرف', section: 'warehouse', warehouseGroup: 'cycle',
                order: 4, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/warehouse/transfer', icon: ArrowRightLeft,
                label: 'تحويل بين مخازن', section: 'warehouse', warehouseGroup: 'cycle',
                order: 5, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/reports/below-min', icon: AlertTriangle,
                label: 'الأصناف تحت الحد الأدنى', section: 'warehouse',
                warehouseGroup: 'reports', order: 6, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/reports/stagnant', icon: Clock,
                label: 'الأصناف الراكدة', section: 'warehouse',
                warehouseGroup: 'reports', order: 7, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/reports/movement', icon: Activity,
                label: 'حركة الصنف التفصيلية', section: 'warehouse',
                warehouseGroup: 'reports', order: 8, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/count', icon: ClipboardCheck,
                label: 'جرد دوري', section: 'warehouse', warehouseGroup: 'reports',
                order: 9, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/count', icon: AlertTriangle,
                label: 'جرد مفاجئ', section: 'warehouse', warehouseGroup: 'reports',
                search: '?mode=surprise', order: 10, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/reports/periodic-inventory', icon: BarChart2,
                label: 'تقرير المخزون الدوري', section: 'warehouse',
                warehouseGroup: 'reports', order: 11, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },
            {
                to: '/dashboard/inventory/reports/variance', icon: GitCompare,
                label: 'تقرير الفروقات', section: 'warehouse',
                warehouseGroup: 'reports', order: 12, roles: ROLES_WAREHOUSE,
                requiredPermission: 'SECTION_WAREHOUSE'
            },

            // Operations
            {
                to: '/dashboard/procurement/waiting-imports', icon: Truck,
                label: 'الشحنات القادمة', section: 'operations', order: 0.5,
                roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS',
                badge: waitingImports || undefined
            },
            {
                to: '/dashboard/procurement/grn', icon: ArrowDownToLine,
                label: 'إذن استلام / إذن إضافة (GRN)', section: 'operations', order: 0.6,
                roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS'
            },
            {
                to: '/dashboard/inventory/quality-inspection', icon: Microscope,
                label: 'فحص الجودة', section: 'operations',
                badge: pendingInspections || undefined, order: 1,
                roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS'
            },
            {
                to: '/dashboard/inventory/quality-parameters', icon: Microscope,
                label: 'معاملات الجودة', section: 'operations', order: 2,
                roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS'
            },
            {
                to: '/dashboard/inventory/categories', icon: Package,
                label: 'تصنيفات الأصناف', section: 'operations', order: 3,
                roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS'
            },
            {
                to: '/dashboard/inventory/items', icon: Command, label: 'الأصناف',
                section: 'operations', order: 4, roles: ROLES_OPERATIONS,
                requiredPermission: 'SECTION_OPERATIONS'
            },
            {
                to: '/dashboard/inventory/price-lists', icon: DollarSign,
                label: 'قوائم الأسعار', section: 'operations', order: 5,
                roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS'
            },

            // System
            {
                to: '/dashboard/settings/company', icon: Building2,
                label: 'بيانات الشركة', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/units', icon: Ruler,
                label: 'وحدات القياس', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/system', icon: Settings,
                label: 'إعدادات النظام', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/users', icon: User,
                label: 'إدارة المستخدمين', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/roles', icon: Shield,
                label: 'الأدوار والصلاحيات', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/permissions', icon: Lock,
                label: 'سجل الصلاحيات', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/security', icon: Shield,
                label: 'الأمان والخصوصية', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/notifications', icon: Bell,
                label: 'الإشعارات', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
            {
                to: '/dashboard/settings/database', icon: Database,
                label: 'قاعدة البيانات', section: 'system', roles: ROLES_SYSTEM,
                requiredPermission: 'SECTION_SYSTEM'
            },
        ];

    // Page title
    useEffect(() => {
        const path = location.pathname;
        const match = navItems
            .filter(item => path === item.to ||
                (item.to !== '/dashboard' && path.startsWith(item.to)))
            .sort((a, b) => b.to.length - a.to.length)[0];
        document.title = match ? `${match.label} | نظام RasRas` : 'نظام RasRas';
    }, [location.pathname]);

    // Filter by permissions/roles
    const filteredNavItems = navItems.filter(item => {
        const usePerms = userPermissions.length > 0;
        if (usePerms) {
            if (!item.requiredPermission) return true;
            return userPermissions.includes(item.requiredPermission);
        }
        return !item.roles || item.roles.length === 0 ||
            item.roles.includes(userRole.toUpperCase());
    });

    const MANAGER_ROLES = ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM',
        'MANAGER', 'WAREHOUSE_MANAGER', 'WH_MANAGER'];
    const isManagerRole = MANAGER_ROLES.includes(userRole.toUpperCase());

    const sectionIds = ['main', 'hr', 'procurement', 'sales', 'crm', 'finance', 'warehouse',
        'operations', 'system'] as const;

    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
        const path = location.pathname;
        const initial: Record<string, boolean> = {};
        if (isManagerRole) {
            sectionIds.forEach(id => {
                const items = navItems.filter(i => i.section === id);
                initial[id] = items.some(item =>
                    path === item.to ||
                    (item.to !== '/dashboard' && path.startsWith(item.to))
                );
            });
        } else {
            sectionIds.forEach(id => { initial[id] = true; });
        }
        return initial;
    });

    useEffect(() => {
        const path = location.pathname;
        if (isManagerRole) {
            setOpenSections(() => {
                const next: Record<string, boolean> = {};
                for (const id of sectionIds) {
                    const items = navItems.filter(i => i.section === id);
                    next[id] = items.some(item =>
                        path === item.to ||
                        (item.to !== '/dashboard' && path.startsWith(item.to))
                    );
                }
                return next;
            });
        } else {
            setOpenSections(prev => {
                const next = { ...prev };
                for (const id of sectionIds) {
                    const items = navItems.filter(i => i.section === id);
                    if (items.some(item =>
                        path === item.to ||
                        (item.to !== '/dashboard' && path.startsWith(item.to))
                    )) {
                        next[id] = true;
                        break;
                    }
                }
                return next;
            });
        }
    }, [location.pathname, isManagerRole]);

    const toggleSection = (id: string) => {
        if (!isManagerRole) return;
        setOpenSections(prev => {
            const willBeOpen = !prev[id];
            if (willBeOpen) {
                return Object.fromEntries(
                    sectionIds.map(s => [s, s === id])
                ) as Record<string, boolean>;
            }
            return { ...prev, [id]: false };
        });
    };

    const notifications: any[] = [
        /* Mock notifications removed for production optimization */
    ];
    const unreadCount = pendingApprovals;

    return (
        <div className="min-h-screen bg-slate-50/50 flex" dir="rtl">
            <style>{`
                @keyframes blink-red {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05);
                           background-color: #ef4444; }
                }
                .animate-blink-red { animation: blink-red 1s infinite; }
            `}</style>

            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* ═══ Sidebar ═══ */}
            <aside className={`fixed lg:static inset-y-0 right-0 z-50 bg-white 
                border-l border-slate-200 flex flex-col transition-all duration-300 
                ease-in-out
                ${sidebarCollapsed ? 'w-20' : 'w-72'}
                ${mobileMenuOpen
                    ? 'translate-x-0'
                    : 'translate-x-full lg:translate-x-0'}`}>

                {/* Logo */}
                <div className={`h-20 flex items-center border-b border-slate-100 px-6
                    ${sidebarCollapsed ? 'justify-center px-4' : 'justify-between'}`}>
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center 
                                justify-center shadow-lg shadow-slate-200 overflow-hidden 
                                border border-slate-100">
                                <img src="/logo.jpeg" alt="Logo"
                                    className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">رصرص</h1>
                                <p className="text-[10px] text-slate-400">
                                    نظام الإدارة المتكامل
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center 
                            justify-center shadow-lg shadow-slate-200 overflow-hidden 
                            border border-slate-100">
                            <img src="/logo.jpeg" alt="Logo"
                                className="w-full h-full object-cover" />
                        </div>
                    )}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-0">
                    {/* الرئيسية */}
                    <SidebarDropdownSection
                        id="main" title="الرئيسية" icon={LayoutDashboard}
                        collapsed={sidebarCollapsed}
                        isOpen={openSections.main ?? true}
                        onToggle={() => toggleSection('main')}
                        hasActiveChild={filteredNavItems
                            .filter(i => i.section === 'main')
                            .some(item =>
                                location.pathname === item.to ||
                                (item.to !== '/dashboard' &&
                                    location.pathname.startsWith(item.to))
                            )}
                        badge={(pendingApprovals + pendingCustomerRequests) || undefined}
                        blink={(pendingApprovals + pendingCustomerRequests) > 0}
                    >
                        {filteredNavItems.filter(i => i.section === 'main')
                            .map(item => (
                                <SidebarLink key={item.to} to={item.to}
                                    icon={item.icon} label={item.label}
                                    active={location.pathname === item.to ||
                                        (item.to !== '/dashboard' &&
                                            location.pathname.startsWith(item.to))}
                                    collapsed={sidebarCollapsed}
                                    badge={item.badge}
                                    blink={!!item.badge &&
                                        (item.to.includes('approvals') ||
                                            item.to.includes('quality-inspection'))}
                                />
                            ))}
                    </SidebarDropdownSection>

                    {/* الموارد البشرية */}
                    {filteredNavItems.some(i => i.section === 'hr') && (
                        <SidebarDropdownSection
                            id="hr" title="الموارد البشرية" icon={Users}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.hr ?? false}
                            onToggle={() => toggleSection('hr')}
                            hasActiveChild={filteredNavItems
                                .filter(i => i.section === 'hr')
                                .some(item =>
                                    location.pathname.startsWith(item.to))}
                        >
                            {filteredNavItems
                                .filter(i => i.section === 'hr')
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        badge={item.badge}
                                        blink={!!item.badge &&
                                            (item.to.includes('approvals') ||
                                                item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* المشتريات */}
                    {filteredNavItems.some(i => i.section === 'procurement') && (
                        <SidebarDropdownSection
                            id="procurement" title="قسم المشتريات" icon={Truck}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.procurement ?? false}
                            onToggle={() => toggleSection('procurement')}
                            hasActiveChild={filteredNavItems
                                .filter(i => i.section === 'procurement')
                                .some(item =>
                                    location.pathname.startsWith(item.to))}
                        >
                            {filteredNavItems
                                .filter(i => i.section === 'procurement')
                                .sort((a, b) =>
                                    (a.order ?? 99) - (b.order ?? 99))
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        badge={item.badge}
                                        blink={!!item.badge &&
                                            (item.to.includes('approvals') ||
                                                item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* المبيعات */}
                    {filteredNavItems.some(i => i.section === 'sales') && (
                        <SidebarDropdownSection
                            id="sales" title="قسم المبيعات" icon={ShoppingCart}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.sales ?? false}
                            onToggle={() => toggleSection('sales')}
                            hasActiveChild={filteredNavItems
                                .filter(i => i.section === 'sales')
                                .some(item =>
                                    location.pathname.startsWith(item.to))}
                        >
                            {filteredNavItems
                                .filter(i => i.section === 'sales')
                                .sort((a, b) =>
                                    (a.order ?? 99) - (b.order ?? 99))
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        badge={item.badge}
                                        blink={!!item.badge &&
                                            (item.to.includes('approvals') ||
                                                item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* العملاء */}
                    {filteredNavItems.some(i => i.section === 'crm') && (
                        <SidebarDropdownSection
                            id="crm" title="إدارة العملاء" icon={Users}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.crm ?? false}
                            onToggle={() => toggleSection('crm')}
                            hasActiveChild={filteredNavItems
                                .filter(i => i.section === 'crm')
                                .some(item =>
                                    location.pathname.startsWith(item.to))}
                        >
                            {filteredNavItems.filter(i => i.section === 'crm')
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        badge={item.badge}
                                        blink={!!item.badge &&
                                            (item.to.includes('approvals') ||
                                                item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* المالية */}
                    {filteredNavItems.some(i => i.section === 'finance') && (
                        <SidebarDropdownSection
                            id="finance" title="المالية" icon={DollarSign}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.finance ?? false}
                            onToggle={() => toggleSection('finance')}
                            hasActiveChild={filteredNavItems
                                .filter(i => i.section === 'finance')
                                .some(item =>
                                    location.pathname.startsWith(item.to))}
                        >
                            {filteredNavItems.filter(i => i.section === 'finance')
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        badge={item.badge}
                                        blink={!!item.badge &&
                                            (item.to.includes('approvals') ||
                                                item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* المخازن */}
                    {filteredNavItems.some(i => i.section === 'warehouse') && (
                        <SidebarDropdownSection
                            id="warehouse" title="قسم المخازن" icon={ArrowRightLeft}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.warehouse ?? false}
                            onToggle={() => toggleSection('warehouse')}
                            hasActiveChild={filteredNavItems
                                .filter(i => i.section === 'warehouse')
                                .some(item =>
                                    location.pathname.startsWith(item.to))}
                        >
                            <SidebarSubGroupTitle
                                title="وحدة إدارة الأصناف والمخزون"
                                collapsed={sidebarCollapsed} />
                            {filteredNavItems
                                .filter(i => i.section === 'warehouse' &&
                                    i.warehouseGroup === 'management')
                                .sort((a, b) =>
                                    (a.order ?? 99) - (b.order ?? 99))
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed} />
                                ))}

                            <SidebarSubGroupTitle title="قسم المخزن"
                                collapsed={sidebarCollapsed} />
                            {filteredNavItems
                                .filter(i => i.section === 'warehouse' &&
                                    i.warehouseGroup === 'cycle')
                                .sort((a, b) =>
                                    (a.order ?? 99) - (b.order ?? 99))
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed} />
                                ))}

                            <SidebarSubGroupTitle title="التقارير والجرد"
                                collapsed={sidebarCollapsed} />
                            {filteredNavItems
                                .filter(i => i.section === 'warehouse' &&
                                    i.warehouseGroup === 'reports')
                                .sort((a, b) =>
                                    (a.order ?? 99) - (b.order ?? 99))
                                .map(item => (
                                    <SidebarLink
                                        key={item.search
                                            ? `${item.to}${item.search}` : item.to}
                                        to={item.to} icon={item.icon}
                                        label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        search={item.search}
                                        blink={!!item.badge &&
                                            (item.to.includes('approvals') ||
                                                item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* العمليات */}
                    {filteredNavItems.some(i => i.section === 'operations') && (
                        <SidebarDropdownSection
                            id="operations" title="العمليات" icon={Package}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.operations ?? false}
                            onToggle={() => toggleSection('operations')}
                            hasActiveChild={filteredNavItems
                                .filter(i => i.section === 'operations')
                                .some(item =>
                                    location.pathname.startsWith(item.to))}
                            badge={pendingInspections || undefined}
                            blink={pendingInspections > 0}
                        >
                            {filteredNavItems
                                .filter(i => i.section === 'operations')
                                .sort((a, b) =>
                                    (a.order ?? 99) - (b.order ?? 99))
                                .map(item => (
                                    <SidebarLink key={item.to} to={item.to}
                                        icon={item.icon} label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        badge={item.badge}
                                        blink={!!item.badge &&
                                            (item.to.includes('approvals') ||
                                                item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* النظام */}
                    <SidebarDropdownSection
                        id="system" title="النظام" icon={Settings}
                        collapsed={sidebarCollapsed}
                        isOpen={openSections.system ?? false}
                        onToggle={() => toggleSection('system')}
                        hasActiveChild={filteredNavItems
                            .filter(i => i.section === 'system')
                            .some(item =>
                                location.pathname.startsWith(item.to))}
                    >
                        {filteredNavItems.filter(i => i.section === 'system')
                            .map(item => (
                                <SidebarLink key={item.to} to={item.to}
                                    icon={item.icon} label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                    badge={item.badge}
                                    blink={!!item.badge &&
                                        (item.to.includes('approvals') ||
                                            item.to.includes('quality-inspection'))}
                                />
                            ))}
                    </SidebarDropdownSection>
                </nav>

                {/* User profile */}
                <div className={`p-4 border-t border-slate-100 
                    ${sidebarCollapsed
                        ? 'flex flex-col items-center gap-3' : ''}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 
                            rounded-xl mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br 
                                from-brand-primary to-brand-primary/80 flex items-center 
                                justify-center text-white font-bold shadow-md">
                                {getInitials(userName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {userName}
                                </p>
                                <p className="text-xs text-brand-primary font-medium">
                                    {userRole}
                                </p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl 
                            text-rose-500 hover:bg-rose-50 transition-all duration-200 
                            w-full group
                            ${sidebarCollapsed ? 'justify-center px-3' : ''}`}>
                        <LogOut className="w-5 h-5 group-hover:scale-110 
                            transition-transform" />
                        {!sidebarCollapsed &&
                            <span className="font-medium">تسجيل الخروج</span>}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex absolute -left-3 top-24 w-6 h-6 bg-white 
                        border border-slate-200 rounded-full items-center justify-center 
                        shadow-sm hover:shadow-md hover:border-brand-primary/50 
                        transition-all duration-200 group"
                >
                    {sidebarCollapsed
                        ? <ChevronLeft className="w-4 h-4 text-slate-400 
                            group-hover:text-brand-primary" />
                        : <ChevronRight className="w-4 h-4 text-slate-400 
                            group-hover:text-brand-primary" />}
                </button>
            </aside>

            {/* ═══ Main Content ═══ */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b 
                    border-slate-200 px-4 md:px-8 flex items-center justify-between 
                    sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl 
                                transition-colors">
                            <Menu className="w-6 h-6 text-slate-600" />
                        </button>
                        <div className={`relative hidden md:block transition-all 
                            duration-300
                            ${searchFocused ? 'w-96' : 'w-72'}`}>
                            <Search className={`absolute right-4 top-1/2 
                                -translate-y-1/2 w-4 h-4 transition-colors
                                ${searchFocused
                                    ? 'text-brand-primary' : 'text-slate-400'}`} />
                            <input type="text" placeholder="بحث في النظام..."
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={`w-full bg-slate-100 rounded-xl pr-11 pl-4 
                                    py-2.5 text-sm outline-none transition-all 
                                    duration-300 border-2
                                    ${searchFocused
                                        ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                        : 'border-transparent hover:bg-slate-200/70'}`}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 
                                hidden lg:flex items-center gap-1 text-slate-400 text-xs">
                                <Command className="w-3 h-3" /><span>K</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="hidden xl:flex items-center gap-3 px-4 py-2 
                            bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(currentTime,
                                    { weekday: 'long', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="w-px h-4 bg-slate-200" />
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(currentTime)}</span>
                            </div>
                        </div>

                        <button onClick={toggleFullscreen}
                            className="hidden md:flex p-2.5 text-slate-400 
                                hover:text-slate-600 hover:bg-slate-100 rounded-xl 
                                transition-all duration-200">
                            {isFullscreen
                                ? <Minimize2 className="w-5 h-5" />
                                : <Maximize2 className="w-5 h-5" />}
                        </button>

                        <button className="hidden md:flex p-2.5 text-slate-400 
                            hover:text-slate-600 hover:bg-slate-100 rounded-xl 
                            transition-all duration-200">
                            <HelpCircle className="w-5 h-5" />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`p-2.5 rounded-xl transition-all duration-200 
                                    relative
                                    ${notificationsOpen
                                        ? 'bg-brand-primary text-white'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 
                                        bg-rose-500 text-white text-xs font-bold 
                                        rounded-full flex items-center justify-center 
                                        border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40"
                                        onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute left-0 top-full mt-2 w-80 
                                        bg-white rounded-2xl shadow-xl border 
                                        border-slate-100 z-50 overflow-hidden
                                        animate-in fade-in slide-in-from-top-2 
                                        duration-200">
                                        <div className="p-4 border-b border-slate-100 
                                            flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    الإشعارات
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {unreadCount} إشعارات جديدة
                                                </p>
                                            </div>
                                            <button className="text-xs text-brand-primary 
                                                hover:underline">
                                                تحديد الكل كمقروء
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.map((n, i) => (
                                                <NotificationItem
                                                    key={i}
                                                    {...n}
                                                    onNavigate={() => setNotificationsOpen(false)}
                                                />
                                            ))}
                                        </div>
                                        <div className="p-3 border-t border-slate-100">
                                            <button className="w-full py-2 text-sm 
                                                text-brand-primary font-medium 
                                                hover:bg-brand-primary/5 rounded-lg 
                                                transition-colors">
                                                عرض جميع الإشعارات
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden md:block h-8 w-px bg-slate-200" />

                        {/* User menu */}
                        <div className="relative">
                            <button type="button"
                                onClick={() => {
                                    setUserMenuOpen(!userMenuOpen);
                                    setNotificationsOpen(false);
                                }}
                                className="flex items-center gap-3 p-2 hover:bg-slate-50 
                                    rounded-xl transition-colors cursor-pointer group 
                                    w-full md:w-auto">
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-semibold text-slate-900 
                                        group-hover:text-brand-primary transition-colors">
                                        {userName}
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase 
                                        font-semibold tracking-wider">
                                        {userRole}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br 
                                    from-brand-primary to-brand-primary/80 flex 
                                    items-center justify-center text-white font-bold 
                                    shadow-md group-hover:shadow-lg 
                                    group-hover:scale-105 transition-all duration-200 
                                    shrink-0">
                                    {getInitials(userName)}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 
                                    hidden md:block transition-transform
                                    ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                        aria-hidden="true" />
                                    <div className="absolute right-0 top-full mt-2 w-56 
                                        bg-white rounded-2xl shadow-xl border 
                                        border-slate-100 z-50 overflow-hidden
                                        animate-in fade-in slide-in-from-top-2 
                                        duration-200">
                                        <div className="p-2">
                                            <Link
                                                to={user?.employeeId
                                                    ? `/dashboard/employees/${user.employeeId}`
                                                    : '/dashboard/employees'}
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 
                                                    py-3 rounded-xl text-slate-700 
                                                    hover:bg-slate-50 transition-colors">
                                                <User className="w-5 h-5 text-slate-500" />
                                                <span className="font-medium">
                                                    بيانات الموظف
                                                </span>
                                            </Link>
                                            <button type="button"
                                                onClick={() => {
                                                    handleLogout();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="flex items-center gap-3 px-4 
                                                    py-3 rounded-xl text-rose-600 
                                                    hover:bg-rose-50 transition-colors 
                                                    w-full">
                                                <LogOut className="w-5 h-5" />
                                                <span className="font-medium">
                                                    تسجيل خروج
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;