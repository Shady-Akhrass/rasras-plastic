import React, { useState, useEffect } from 'react';
import {
    Users, Package, Bell, Search, Menu, LogOut, LayoutDashboard,
    Settings, User, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
    HelpCircle, Shield, Sparkles, Building2, Lock, Ruler,
    Calendar, Clock, Command, Maximize2, Minimize2, Microscope, DollarSign, FileText, Tag, Scale, Truck, Warehouse, ShoppingCart,
    ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine,
    Receipt, ClipboardList, BarChart2, AlertTriangle, Activity, ClipboardCheck, GitCompare,
    Undo2
} from 'lucide-react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
import { clearSession, getSessionRemainingMs } from '../../services/authUtils';
import { grnService } from '../../services/grnService';
import { canAccessPath } from '../../utils/permissionUtils';
import { formatDate, formatTime } from '../../utils/format';

// Sidebar Link Component
const SidebarLink = ({
    to,
    icon: Icon,
    label,
    active,
    collapsed,
    badge,
    blink,
    search
}: {
    to: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    collapsed: boolean;
    badge?: number;
    blink?: boolean;
    search?: string;
}) => (
    <Link
        to={search ? { pathname: to, search } : to}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
            ${active
                ? 'bg-gradient-to-l from-brand-primary to-brand-primary/90 text-white shadow-lg shadow-brand-primary/25'
                : 'text-slate-600 hover:bg-brand-primary/5 hover:text-brand-primary'
            }
            ${collapsed ? 'justify-center px-3' : ''}`}
    >
        <div className="relative">
            <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
            {badge && collapsed && (
                <span className={`absolute -top-2 -right-2 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center
                    border border-white animate-blink-red bg-rose-500 text-white shadow-sm`}>
                    {badge}
                </span>
            )}
        </div>

        {!collapsed && (
            <span className="font-medium flex-1">{label}</span>
        )}

        {badge && !collapsed && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300
                ${active ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}
                ${blink ? 'animate-blink-red !bg-rose-500 !text-white shadow-sm' : ''}`}>
                {badge}
            </span>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
            <div className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg
                opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
                whitespace-nowrap z-50 shadow-xl">
                {label}
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
        )}

        {/* Active Indicator */}
        {active && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full 
                opacity-50" />
        )}
    </Link>
);

// Sub-group title inside a dropdown (e.g. وحدة إدارة الأصناف والمخزون)
const SidebarSubGroupTitle = ({ title, collapsed }: { title: string; collapsed: boolean }) => (
    !collapsed && (
        <div className="px-3 py-2 mt-3 mb-1 first:mt-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        </div>
    )
);

// Collapsible Dropdown Section for Sidebar
const SidebarDropdownSection = ({
    id: _id,
    title,
    icon: Icon,
    collapsed,
    isOpen,
    onToggle,
    hasActiveChild,
    badge,
    blink,
    children
}: {
    id: string;
    title: string;
    icon: React.ElementType;
    collapsed: boolean;
    isOpen: boolean;
    onToggle: () => void;
    hasActiveChild: boolean;
    badge?: number;
    blink?: boolean;
    children: React.ReactNode;
}) => {
    if (collapsed) {
        return (
            <div className="mt-2">
                <div className="mx-3 border-t border-slate-200" />
                <div className="mt-1 space-y-0.5">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 mb-1">
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl transition-all duration-200
                    ${hasActiveChild
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {badge && !isOpen && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-300
                            ${hasActiveChild ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}
                            ${blink ? 'animate-blink-red !bg-rose-500 !text-white shadow-sm' : ''}`}>
                            {badge}
                        </span>
                    )}
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
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

// Notification Item
const NotificationItem = ({
    title,
    message,
    time,
    read,
    type = 'info'
}: {
    title: string;
    message: string;
    time: string;
    read: boolean;
    type?: 'info' | 'success' | 'warning';
}) => {
    const typeColors = {
        info: 'bg-brand-primary',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500'
    };

    return (
        <div className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0
            ${!read ? 'bg-brand-primary/5' : ''}`}>
            <div className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[type]} ${read ? 'opacity-0' : ''}`} />
                <div className="flex-1">
                    <p className={`text-sm ${read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>
                        {title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{message}</p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {time}
                    </p>
                </div>
            </div>
        </div>
    );
};

const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
    const [pendingInspectionsCount, setPendingInspectionsCount] = useState(0);
    const [waitingImportsCount, setWaitingImportsCount] = useState(0);


    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userName = user?.fullNameAr || user?.username || 'المستخدم';
    const userRole = user?.roleCode || user?.roleName || 'USER';
    /** صلاحيات المستخدم من تسجيل الدخول (ديناميكية من لوحة التحكم) */
    const userPermissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Fetch pending approvals count
    useEffect(() => {
        const fetchPendingCount = async () => {
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            if (user?.userId) {
                const count = await approvalService.getPendingCount(user.userId);
                setPendingApprovalsCount(count);
            }
        };
        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 10000); // Faster refresh (10s)
        return () => clearInterval(interval);
    }, []);

    // Fetch pending inspections count (فحص الجودة)
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const grns = await grnService.getAllGRNs();
                const inspections = grns.filter(g => g.status === 'Pending Inspection').length;
                setPendingInspectionsCount(inspections);
            } catch (error) {
                console.error('Failed to fetch pending inspections count', error);
            }
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 10000);
        return () => clearInterval(interval);
    }, []);

    // Fetch waiting imports count
    useEffect(() => {
        const fetchWaitingImports = async () => {
            try {
                const { purchaseOrderService } = await import('../../services/purchaseOrderService');
                const waitingPOs = await purchaseOrderService.getWaitingForArrivalPOs();
                setWaitingImportsCount(waitingPOs.length);
            } catch (error) {
                console.error('Failed to fetch waiting imports count', error);
            }
        };
        fetchWaitingImports();
        const interval = setInterval(fetchWaitingImports, 10000);
        return () => clearInterval(interval);
    }, []);

    // Auto logout when session (JWT) expires
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const remainingMs = getSessionRemainingMs(token);
        if (remainingMs <= 0) {
            clearSession();
            return;
        }
        const timeoutId = setTimeout(() => clearSession(), remainingMs);
        return () => clearTimeout(timeoutId);
    }, []);

    // حماية المسارات حسب الصلاحيات (ديناميكية بالصلاحيات أو بالأدوار احتياطياً)
    useEffect(() => {
        if (!canAccessPath(location.pathname, userRole, userPermissions)) {
            navigate('/dashboard', { replace: true });
        }
    }, [location.pathname, userRole, userPermissions, navigate]);

    const handleLogout = () => {
        clearSession();
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2);
    };

    // أدوار الأقسام (احتياطي عند عدم وجود صلاحيات من الخادم)
    const ROLES_PROCUREMENT = ['PM', 'BUYER', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'];
    const ROLES_SALES = ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'];
    const ROLES_WAREHOUSE = ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM', 'WAREHOUSE_MANAGER', 'WH_MANAGER'];
    const ROLES_OPERATIONS = ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM', 'SM'];
    const ROLES_CRM = ['SM', 'ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM'];
    const ROLES_SYSTEM = ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN'];

    // ترتيب العناصر حسب الدورات المستندية
    const navItems: Array<{
        to: string; icon: React.ElementType; label: string; section: string;
        roles?: readonly string[]; requiredPermission?: string;
        warehouseGroup?: string; search?: string; badge?: number; order?: number;
    }> = [
            // الرئيسية
            { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة القيادة', section: 'main' },
            { to: '/dashboard/approvals', icon: Bell, label: 'الطلبات والاعتمادات', section: 'main', badge: pendingApprovalsCount || undefined },
            { to: '/dashboard/users', icon: User, label: 'المستخدمين', roles: ['ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'], section: 'main', requiredPermission: 'SECTION_USERS' },
            { to: '/dashboard/employees', icon: Users, label: 'الموظفين', roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'], section: 'main', requiredPermission: 'SECTION_EMPLOYEES' },
            // قسم المشتريات: PR → RFQ → عروض → مقارنة → PO → إذن استلام GRN → فاتورة مورد → إشعار دفع
            { to: '/dashboard/procurement/pr', icon: FileText, label: 'طلبات الشراء (PR)', section: 'procurement', order: 1, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/rfq', icon: FileText, label: 'طلبات عروض الأسعار (RFQ)', section: 'procurement', order: 2, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/quotation', icon: Tag, label: 'عروض الموردين', section: 'procurement', order: 3, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/comparison', icon: Scale, label: 'مقارنة العروض (QCS)', section: 'procurement', order: 4, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/po', icon: ShoppingCart, label: 'أوامر الشراء (PO)', section: 'procurement', order: 5, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/waiting-imports', icon: Truck, label: 'الشحنات القادمة', section: 'procurement', order: 5.5, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT', badge: waitingImportsCount || undefined },
            { to: '/dashboard/procurement/grn', icon: ArrowDownToLine, label: 'إذن استلام / إذن إضافة (GRN)', section: 'procurement', order: 6, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/invoices', icon: FileText, label: 'فواتير الموردين', section: 'procurement', order: 7, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/suppliers/outstanding', icon: DollarSign, label: 'الأرصدة المستحقة', section: 'procurement', order: 8, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/returns', icon: Undo2, label: 'مرتجعات الشراء', section: 'procurement', order: 9, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/suppliers', icon: Truck, label: 'الموردين', section: 'procurement', order: 10, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            { to: '/dashboard/procurement/suppliers/items', icon: Package, label: 'أصناف الموردين', section: 'procurement', order: 11, roles: ROLES_PROCUREMENT, requiredPermission: 'SECTION_PROCUREMENT' },
            // قسم المبيعات: طلب عميل → عرض سعر → أمر بيع → إذن صرف → فاتورة → تحصيل
            { to: '/dashboard/sales/sections', icon: ShoppingCart, label: 'قسم  المبيعات', section: 'sales', order: 1, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            { to: '/dashboard/sales/quotations', icon: Tag, label: 'عروض الأسعار', section: 'sales', order: 2, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            { to: '/dashboard/sales/orders', icon: ClipboardList, label: 'أوامر البيع (SO)', section: 'sales', order: 3, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            { to: '/dashboard/sales/issue-notes', icon: Package, label: 'إذونات الصرف', section: 'sales', order: 4, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            { to: '/dashboard/sales/delivery-orders', icon: Truck, label: 'أوامر التوصيل', section: 'sales', order: 5, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            { to: '/dashboard/sales/invoices', icon: FileText, label: 'فواتير المبيعات', section: 'sales', order: 6, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            { to: '/dashboard/sales/receipts', icon: Receipt, label: 'إيصالات الدفع', section: 'sales', order: 7, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            { to: '/dashboard/sales/reports', icon: BarChart2, label: 'تقارير المبيعات', section: 'sales', order: 8, roles: ROLES_SALES, requiredPermission: 'SECTION_SALES' },
            // إدارة العملاء (طلب عميل)
            { to: '/dashboard/crm/customers', icon: Users, label: 'العملاء', section: 'crm', roles: ROLES_CRM, requiredPermission: 'SECTION_CRM' },
            // قسم المخازن: إذن إضافة + إذن صرف + تقارير
            { to: '/dashboard/inventory/sections', icon: Warehouse, label: 'أقسام المخزن', section: 'warehouse', warehouseGroup: 'management', order: 1, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/warehouses', icon: Building2, label: 'المستودعات', section: 'warehouse', warehouseGroup: 'management', order: 2, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/stocks', icon: Package, label: 'أرصدة المخزون', section: 'warehouse', warehouseGroup: 'management', order: 3, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/warehouse/issue', icon: ArrowUpFromLine, label: 'إذن صرف', section: 'warehouse', warehouseGroup: 'cycle', order: 4, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/warehouse/transfer', icon: ArrowRightLeft, label: 'تحويل بين مخازن', section: 'warehouse', warehouseGroup: 'cycle', order: 5, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/reports/below-min', icon: AlertTriangle, label: 'الأصناف تحت الحد الأدنى', section: 'warehouse', warehouseGroup: 'reports', order: 6, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/reports/stagnant', icon: Clock, label: 'الأصناف الراكدة', section: 'warehouse', warehouseGroup: 'reports', order: 7, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/reports/movement', icon: Activity, label: 'حركة الصنف التفصيلية', section: 'warehouse', warehouseGroup: 'reports', order: 8, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/count', icon: ClipboardCheck, label: 'جرد دوري', section: 'warehouse', warehouseGroup: 'reports', order: 9, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/count', icon: AlertTriangle, label: 'جرد مفاجئ', section: 'warehouse', warehouseGroup: 'reports', search: '?mode=surprise', order: 10, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/reports/periodic-inventory', icon: BarChart2, label: 'تقرير المخزون الدوري', section: 'warehouse', warehouseGroup: 'reports', order: 11, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            { to: '/dashboard/inventory/reports/variance', icon: GitCompare, label: 'تقرير الفروقات', section: 'warehouse', warehouseGroup: 'reports', order: 12, roles: ROLES_WAREHOUSE, requiredPermission: 'SECTION_WAREHOUSE' },
            // العمليات (الجودة + بيانات أساسية)
            { to: '/dashboard/inventory/quality-inspection', icon: Microscope, label: 'فحص الجودة', section: 'operations', badge: pendingInspectionsCount || undefined, order: 1, roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS' },
            { to: '/dashboard/inventory/quality-parameters', icon: Microscope, label: 'معاملات الجودة', section: 'operations', order: 2, roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS' },
            { to: '/dashboard/inventory/categories', icon: Package, label: 'تصنيفات الأصناف', section: 'operations', order: 3, roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS' },
            { to: '/dashboard/inventory/items', icon: Command, label: 'الأصناف', section: 'operations', order: 4, roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS' },
            { to: '/dashboard/inventory/price-lists', icon: DollarSign, label: 'قوائم الأسعار', section: 'operations', order: 5, roles: ROLES_OPERATIONS, requiredPermission: 'SECTION_OPERATIONS' },
            // النظام
            { to: '/dashboard/settings/company', icon: Building2, label: 'بيانات الشركة', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
            { to: '/dashboard/settings/units', icon: Ruler, label: 'وحدات القياس', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
            { to: '/dashboard/settings/system', icon: Settings, label: 'إعدادات النظام', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
            { to: '/dashboard/settings/users', icon: User, label: 'إدارة المستخدمين', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
            { to: '/dashboard/settings/roles', icon: Shield, label: 'الأدوار والصلاحيات', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
            { to: '/dashboard/settings/permissions', icon: Lock, label: 'سجل الصلاحيات', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
            { to: '/dashboard/settings/security', icon: Shield, label: 'الأمان والخصوصية', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
            { to: '/dashboard/settings/notifications', icon: Bell, label: 'الإشعارات', section: 'system', roles: ROLES_SYSTEM, requiredPermission: 'SECTION_SYSTEM' },
        ];

    // تحديث عنوان التبويب حسب الصفحة الحالية
    useEffect(() => {
        const path = location.pathname;
        const match = navItems
            .filter(item => path === item.to || (item.to !== '/dashboard' && path.startsWith(item.to)))
            .sort((a, b) => b.to.length - a.to.length)[0];
        document.title = match ? `${match.label} | نظام RasRas` : 'نظام RasRas';
    }, [location.pathname]);

    // عرض العناصر: إن وُجدت صلاحيات المستخدم نعتمد عليها (ديناميكي)، وإلا نعتمد على الأدوار (احتياطي)
    const filteredNavItems = navItems.filter(item => {
        const usePerms = userPermissions.length > 0;
        if (usePerms) {
            if (!item.requiredPermission) return true;
            return userPermissions.includes(item.requiredPermission);
        }
        return !item.roles || item.roles.length === 0 || item.roles.includes(userRole.toUpperCase());
    });

    // أدوار المدير: عندهم قائمة منسدلة (ينقرون لفتح كل قسم). غير المدير: القوائم الفرعية تظهر مباشرة
    const MANAGER_ROLES = ['ADMIN', 'SYS_ADMIN', 'SYSTEM_ADMIN', 'GM', 'MANAGER', 'WAREHOUSE_MANAGER', 'WH_MANAGER'];
    const isManagerRole = MANAGER_ROLES.includes(userRole.toUpperCase());

    const sectionIds = ['main', 'procurement', 'sales', 'crm', 'warehouse', 'operations', 'system'] as const;
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
        const path = location.pathname;
        const initial: Record<string, boolean> = {};
        if (isManagerRole) {
            sectionIds.forEach(id => {
                const itemsInSection = navItems.filter(i => i.section === id);
                initial[id] = itemsInSection.some(item =>
                    path === item.to || (item.to !== '/dashboard' && path.startsWith(item.to))
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
                    const itemsInSection = navItems.filter(i => i.section === id);
                    next[id] = itemsInSection.some(item =>
                        path === item.to || (item.to !== '/dashboard' && path.startsWith(item.to))
                    );
                }
                return next;
            });
        } else {
            setOpenSections(prev => {
                const next = { ...prev };
                for (const id of sectionIds) {
                    const itemsInSection = navItems.filter(i => i.section === id);
                    if (itemsInSection.some(item =>
                        path === item.to || (item.to !== '/dashboard' && path.startsWith(item.to))
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
        if (!isManagerRole) return; // غير المدير: لا إغلاق للأقسام
        setOpenSections(prev => {
            const willBeOpen = !prev[id];
            if (willBeOpen) {
                return Object.fromEntries(sectionIds.map(s => [s, s === id])) as Record<string, boolean>;
            }
            return { ...prev, [id]: false };
        });
    };

    const notifications = [
        { title: 'موظف جديد', message: 'تمت إضافة أحمد محمد للنظام', time: 'منذ 5 دقائق', read: false, type: 'success' as const },
        { title: 'تنبيه النظام', message: 'تم تحديث إعدادات الأمان', time: 'منذ ساعة', read: false, type: 'warning' as const },
        { title: 'تقرير جاهز', message: 'تقرير المبيعات الشهري جاهز للتحميل', time: 'منذ 3 ساعات', read: true, type: 'info' as const },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-slate-50/50 flex" dir="rtl">
            <style>{`
                @keyframes blink-red {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); background-color: #ef4444; }
                }
                .animate-blink-red {
                    animation: blink-red 1s infinite;
                }
            `}</style>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 right-0 z-50 bg-white border-l border-slate-200 
                flex flex-col transition-all duration-300 ease-in-out
                ${sidebarCollapsed ? 'w-20' : 'w-72'}
                ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>

                {/* Logo Section */}
                <div className={`h-20 flex items-center border-b border-slate-100 px-6
                    ${sidebarCollapsed ? 'justify-center px-4' : 'justify-between'}`}>
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 overflow-hidden border border-slate-100">
                                <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">رصرص</h1>
                                <p className="text-[10px] text-slate-400">نظام الإدارة المتكامل</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 overflow-hidden border border-slate-100">
                            <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Navigation - قوائم منسدلة */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-0">
                    {/* الرئيسية */}
                    <SidebarDropdownSection
                        id="main"
                        title="الرئيسية"
                        icon={LayoutDashboard}
                        collapsed={sidebarCollapsed}
                        isOpen={openSections.main ?? true}
                        onToggle={() => toggleSection('main')}
                        hasActiveChild={filteredNavItems.filter(i => i.section === 'main').some(item =>
                            location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))
                        )}
                        badge={pendingApprovalsCount || undefined}
                        blink={pendingApprovalsCount > 0}
                    >
                        {filteredNavItems.filter(i => i.section === 'main').map((item) => (
                            <SidebarLink
                                key={item.to}
                                to={item.to}
                                icon={item.icon}
                                label={item.label}
                                active={location.pathname === item.to ||
                                    (item.to !== '/dashboard' && location.pathname.startsWith(item.to))}
                                collapsed={sidebarCollapsed}
                                badge={(item as { badge?: number }).badge}
                                blink={!!(item as { badge?: number }).badge && (item.to.includes('approvals') || item.to.includes('quality-inspection'))}
                            />
                        ))}
                    </SidebarDropdownSection>
                    {/* قسم المشتريات */}
                    {filteredNavItems.some(i => i.section === 'procurement') && (
                        <SidebarDropdownSection
                            id="procurement"
                            title="قسم المشتريات"
                            icon={Truck}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.procurement ?? false}
                            onToggle={() => toggleSection('procurement')}
                            hasActiveChild={filteredNavItems.filter(i => i.section === 'procurement').some(item =>
                                location.pathname.startsWith(item.to)
                            )}
                        >
                            {filteredNavItems.filter(i => i.section === 'procurement').sort((a, b) => ((a as { order?: number }).order ?? 99) - ((b as { order?: number }).order ?? 99)).map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                    badge={(item as { badge?: number }).badge}
                                    blink={!!(item as { badge?: number }).badge && (item.to.includes('approvals') || item.to.includes('quality-inspection'))}
                                />
                            ))}
                        </SidebarDropdownSection>
                    )}
                    {/* قسم المبيعات */}
                    {filteredNavItems.some(i => i.section === 'sales') && (
                        <SidebarDropdownSection
                            id="sales"
                            title="قسم المبيعات"
                            icon={ShoppingCart}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.sales ?? false}
                            onToggle={() => toggleSection('sales')}
                            hasActiveChild={filteredNavItems.filter(i => i.section === 'sales').some(item =>
                                location.pathname.startsWith(item.to)
                            )}
                        >
                            {filteredNavItems.filter(i => i.section === 'sales').sort((a, b) => ((a as { order?: number }).order ?? 99) - ((b as { order?: number }).order ?? 99)).map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                    badge={(item as { badge?: number }).badge}
                                    blink={!!(item as { badge?: number }).badge && (item.to.includes('approvals') || item.to.includes('quality-inspection'))}
                                />
                            ))}
                        </SidebarDropdownSection>
                    )}
                    {/* إدارة العملاء */}
                    {filteredNavItems.some(i => i.section === 'crm') && (
                        <SidebarDropdownSection
                            id="crm"
                            title="إدارة العملاء"
                            icon={Users}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.crm ?? false}
                            onToggle={() => toggleSection('crm')}
                            hasActiveChild={filteredNavItems.filter(i => i.section === 'crm').some(item =>
                                location.pathname.startsWith(item.to)
                            )}
                        >
                            {filteredNavItems.filter(i => i.section === 'crm').map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                    badge={(item as { badge?: number }).badge}
                                    blink={!!(item as { badge?: number }).badge && (item.to.includes('approvals') || item.to.includes('quality-inspection'))}
                                />
                            ))}
                        </SidebarDropdownSection>
                    )}
                    {/* قسم المخازن */}
                    {filteredNavItems.some(i => i.section === 'warehouse') && (
                        <SidebarDropdownSection
                            id="warehouse"
                            title="قسم المخازن"
                            icon={ArrowRightLeft}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.warehouse ?? false}
                            onToggle={() => toggleSection('warehouse')}
                            hasActiveChild={filteredNavItems.filter(i => i.section === 'warehouse').some(item =>
                                location.pathname.startsWith(item.to)
                            )}
                        >
                            {/* وحدة إدارة الأصناف والمخزون */}
                            <SidebarSubGroupTitle title="وحدة إدارة الأصناف والمخزون" collapsed={sidebarCollapsed} />
                            {filteredNavItems
                                .filter(i => i.section === 'warehouse' && (i as { warehouseGroup?: string }).warehouseGroup === 'management')
                                .sort((a, b) => ((a as { order?: number }).order ?? 99) - ((b as { order?: number }).order ?? 99))
                                .map((item) => (
                                    <SidebarLink
                                        key={item.to}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                    />
                                ))}
                            {/* قسم المخزن */}
                            <SidebarSubGroupTitle title="قسم المخزن" collapsed={sidebarCollapsed} />
                            {filteredNavItems
                                .filter(i => i.section === 'warehouse' && (i as { warehouseGroup?: string }).warehouseGroup === 'cycle')
                                .sort((a, b) => ((a as { order?: number }).order ?? 99) - ((b as { order?: number }).order ?? 99))
                                .map((item) => (
                                    <SidebarLink
                                        key={item.to}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                    />
                                ))}
                            {/* التقارير والجرد */}
                            <SidebarSubGroupTitle title="التقارير والجرد" collapsed={sidebarCollapsed} />
                            {filteredNavItems
                                .filter(i => i.section === 'warehouse' && (i as { warehouseGroup?: string }).warehouseGroup === 'reports')
                                .sort((a, b) => ((a as { order?: number }).order ?? 99) - ((b as { order?: number }).order ?? 99))
                                .map((item) => (
                                    <SidebarLink
                                        key={(item as { search?: string }).search ? `${item.to}${(item as { search?: string }).search}` : item.to}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        active={location.pathname.startsWith(item.to)}
                                        collapsed={sidebarCollapsed}
                                        search={(item as { search?: string }).search}
                                        blink={!!(item as { badge?: number }).badge && (item.to.includes('approvals') || item.to.includes('quality-inspection'))}
                                    />
                                ))}
                        </SidebarDropdownSection>
                    )}

                    {/* العمليات */}
                    {filteredNavItems.some(i => i.section === 'operations') && (
                        <SidebarDropdownSection
                            id="operations"
                            title="العمليات"
                            icon={Package}
                            collapsed={sidebarCollapsed}
                            isOpen={openSections.operations ?? false}
                            onToggle={() => toggleSection('operations')}
                            hasActiveChild={filteredNavItems.filter(i => i.section === 'operations').some(item =>
                                location.pathname.startsWith(item.to)
                            )}
                            badge={pendingInspectionsCount || undefined}
                            blink={pendingInspectionsCount > 0}
                        >
                            {filteredNavItems.filter(i => i.section === 'operations').sort((a, b) => ((a as { order?: number }).order ?? 99) - ((b as { order?: number }).order ?? 99)).map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                    badge={(item as { badge?: number }).badge}
                                    blink={!!(item as { badge?: number }).badge && (item.to.includes('approvals') || item.to.includes('quality-inspection'))}
                                />
                            ))}
                        </SidebarDropdownSection>
                    )}

                    {/* النظام */}
                    <SidebarDropdownSection
                        id="system"
                        title="النظام"
                        icon={Settings}
                        collapsed={sidebarCollapsed}
                        isOpen={openSections.system ?? false}
                        onToggle={() => toggleSection('system')}
                        hasActiveChild={filteredNavItems.filter(i => i.section === 'system').some(item =>
                            location.pathname.startsWith(item.to)
                        )}
                    >
                        {filteredNavItems.filter(i => i.section === 'system').map((item) => (
                            <SidebarLink
                                key={item.to}
                                to={item.to}
                                icon={item.icon}
                                label={item.label}
                                active={location.pathname.startsWith(item.to)}
                                collapsed={sidebarCollapsed}
                                badge={(item as { badge?: number }).badge}
                                blink={!!(item as { badge?: number }).badge && (item.to.includes('approvals') || item.to.includes('quality-inspection'))}
                            />
                        ))}
                    </SidebarDropdownSection>
                </nav>

                {/* User Profile Section */}
                <div className={`p-4 border-t border-slate-100 ${sidebarCollapsed ? 'flex flex-col items-center gap-3' : ''}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary/80 
                                flex items-center justify-center text-white font-bold shadow-md">
                                {getInitials(userName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                                <p className="text-xs text-brand-primary font-medium">{userRole}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 
                            hover:bg-rose-50 transition-all duration-200 w-full group
                            ${sidebarCollapsed ? 'justify-center px-3' : ''}`}
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {!sidebarCollapsed && <span className="font-medium">تسجيل الخروج</span>}
                    </button>
                </div>

                {/* Collapse Toggle - Desktop Only */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:flex absolute -left-3 top-24 w-6 h-6 bg-white border border-slate-200 
                        rounded-full items-center justify-center shadow-sm hover:shadow-md 
                        hover:border-brand-primary/50 transition-all duration-200 group"
                >
                    {sidebarCollapsed ? (
                        <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-brand-primary" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary" />
                    )}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 
                    flex items-center justify-between sticky top-0 z-30">

                    {/* Left Side - Menu & Search */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Menu className="w-6 h-6 text-slate-600" />
                        </button>

                        {/* Search */}
                        <div className={`relative hidden md:block transition-all duration-300
                            ${searchFocused ? 'w-96' : 'w-72'}`}>
                            <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
                                ${searchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="بحث في النظام..."
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={`w-full bg-slate-100 rounded-xl pr-11 pl-4 py-2.5 text-sm 
                                    outline-none transition-all duration-300 border-2
                                    ${searchFocused
                                        ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                        : 'border-transparent hover:bg-slate-200/70'}`}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 
                                text-slate-400 text-xs">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Actions & Profile */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Date & Time */}
                        <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(currentTime, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200" />
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(currentTime)}</span>
                            </div>
                        </div>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="hidden md:flex p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                rounded-xl transition-all duration-200"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-5 h-5" />
                            ) : (
                                <Maximize2 className="w-5 h-5" />
                            )}
                        </button>

                        {/* Help */}
                        <button className="hidden md:flex p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                            rounded-xl transition-all duration-200">
                            <HelpCircle className="w-5 h-5" />
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`p-2.5 rounded-xl transition-all duration-200 relative
                                    ${notificationsOpen
                                        ? 'bg-brand-primary text-white'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white 
                                        text-xs font-bold rounded-full flex items-center justify-center
                                        border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setNotificationsOpen(false)}
                                    />
                                    <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl 
                                        shadow-xl border border-slate-100 z-50 overflow-hidden
                                        animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-slate-900">الإشعارات</h3>
                                                <p className="text-xs text-slate-500">{unreadCount} إشعارات جديدة</p>
                                            </div>
                                            <button className="text-xs text-brand-primary hover:underline">
                                                تحديد الكل كمقروء
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.map((notification, i) => (
                                                <NotificationItem key={i} {...notification} />
                                            ))}
                                        </div>
                                        <div className="p-3 border-t border-slate-100">
                                            <button className="w-full py-2 text-sm text-brand-primary font-medium
                                                hover:bg-brand-primary/5 rounded-lg transition-colors">
                                                عرض جميع الإشعارات
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block h-8 w-px bg-slate-200" />

                        {/* User Profile - قائمة عند النقر */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }}
                                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl 
                                    transition-colors cursor-pointer group w-full md:w-auto"
                            >
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-primary 
                                        transition-colors">
                                        {userName}
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                                        {userRole}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary/80 
                                    flex items-center justify-center text-white font-bold shadow-md 
                                    group-hover:shadow-lg group-hover:scale-105 transition-all duration-200 shrink-0">
                                    {getInitials(userName)}
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 hidden md:block transition-transform
                                    ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* قائمة المستخدم */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                        aria-hidden="true"
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl 
                                        shadow-xl border border-slate-100 z-50 overflow-hidden
                                        animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-2">
                                            <Link
                                                to={user?.employeeId ? `/dashboard/employees/${user.employeeId}` : '/dashboard/employees'}
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 
                                                    hover:bg-slate-50 transition-colors"
                                            >
                                                <User className="w-5 h-5 text-slate-500" />
                                                <span className="font-medium">بيانات الموظف</span>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 
                                                    hover:bg-rose-50 transition-colors w-full"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                <span className="font-medium">تسجيل خروج</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
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