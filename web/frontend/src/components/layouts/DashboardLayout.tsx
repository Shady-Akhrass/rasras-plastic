import React, { useState, useEffect } from 'react';
import {
    Users, Package, Bell, Search, Menu, LogOut, LayoutDashboard,
    Settings, User, X, ChevronLeft, ChevronRight,
    HelpCircle, Shield, Sparkles, Building2,
    Calendar, Clock, Command, Maximize2, Minimize2, Microscope, DollarSign, FileText, Tag, Scale, Truck, Warehouse, ShoppingCart, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine
} from 'lucide-react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';

// Sidebar Link Component
const SidebarLink = ({
    to,
    icon: Icon,
    label,
    active,
    collapsed,
    badge
}: {
    to: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    collapsed: boolean;
    badge?: number;
}) => (
    <Link
        to={to}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
            ${active
                ? 'bg-gradient-to-l from-brand-primary to-brand-primary/90 text-white shadow-lg shadow-brand-primary/25'
                : 'text-slate-600 hover:bg-brand-primary/5 hover:text-brand-primary'
            }
            ${collapsed ? 'justify-center px-3' : ''}`}
    >
        <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />

        {!collapsed && (
            <span className="font-medium flex-1">{label}</span>
        )}

        {badge && !collapsed && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full
                ${active ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
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

// Section Header for Sidebar
const SidebarSection = ({ title, collapsed }: { title: string; collapsed: boolean }) => (
    !collapsed ? (
        <div className="px-4 py-2 mt-6 mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        </div>
    ) : (
        <div className="my-4 mx-3 border-t border-slate-200" />
    )
);

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
    const mainContentRef = React.useRef<HTMLDivElement>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userName = user?.fullNameAr || user?.username || 'المستخدم';
    const userRole = user?.roleCode || user?.roleName || 'USER';

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // التمرير لأعلى منطقة المحتوى عند تغيير المسار (السايد بار أو أي تنقل)
    useEffect(() => {
        mainContentRef.current?.scrollTo(0, 0);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
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

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة القيادة', section: 'main' },
        { to: '/dashboard/users', icon: User, label: 'المستخدمين', roles: ['ADMIN', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'], section: 'main' },
        { to: '/dashboard/employees', icon: Users, label: 'الموظفين', roles: ['ADMIN', 'HR', 'MANAGER', 'SYS_ADMIN', 'SYSTEM_ADMIN'], section: 'main' },
        { to: '/dashboard/inventory/sections', icon: Warehouse, label: 'أقسام المخزن', section: 'operations' },
        { to: '/dashboard/inventory/categories', icon: Package, label: 'تصنيفات الأصناف', section: 'operations' },
        { to: '/dashboard/inventory/items', icon: Command, label: 'الأصناف ', section: 'operations' },
        { to: '/dashboard/inventory/warehouses', icon: Building2, label: 'المستودعات', section: 'operations' },
        { to: '/dashboard/inventory/quality-parameters', icon: Microscope, label: 'معاملات الجودة', section: 'operations' },
        { to: '/dashboard/inventory/price-lists', icon: DollarSign, label: 'قوائم الأسعار', section: 'operations' },
        { to: '/dashboard/inventory/units', icon: Shield, label: 'وحدات القياس', section: 'operations' },
        { to: '/dashboard/inventory/warehouse/grn', icon: ArrowDownToLine, label: 'إذن إضافة (GRN)', section: 'warehouse' },
        { to: '/dashboard/inventory/warehouse/issue', icon: ArrowUpFromLine, label: 'إذن صرف', section: 'warehouse' },
        { to: '/dashboard/inventory/warehouse/transfer', icon: ArrowRightLeft, label: 'تحويل بين مخازن', section: 'warehouse' },
        { to: '/dashboard/sales/sections', icon: ShoppingCart, label: 'دورة المبيعات', section: 'sales' },
        { to: '/dashboard/crm/customers', icon: Users, label: 'العملاء', section: 'crm' },
        { to: '/dashboard/procurement/pr', icon: FileText, label: 'طلبات الشراء', section: 'procurement' },
        { to: '/dashboard/procurement/rfq', icon: FileText, label: 'عروض الأسعار (RFQ)', section: 'procurement' },
        { to: '/dashboard/procurement/quotation', icon: Tag, label: 'عروض الموردين', section: 'procurement' },
        { to: '/dashboard/procurement/comparison', icon: Scale, label: 'مقارنة العروض', section: 'procurement' },
        { to: '/dashboard/procurement/suppliers', icon: Truck, label: 'الموردين', section: 'procurement' },
        { to: '/dashboard/procurement/suppliers/outstanding', icon: DollarSign, label: 'الأرصدة المستحقة', section: 'procurement' },
        { to: '/dashboard/procurement/suppliers/items', icon: Package, label: 'أصناف الموردين', section: 'procurement' },
        { to: '/dashboard/settings', icon: Settings, label: 'الإعدادات', section: 'system' },
    ];

    const filteredNavItems = navItems.filter(item =>
        !item.roles || item.roles.includes(userRole.toUpperCase())
    );

    const notifications = [
        { title: 'موظف جديد', message: 'تمت إضافة أحمد محمد للنظام', time: 'منذ 5 دقائق', read: false, type: 'success' as const },
        { title: 'تنبيه النظام', message: 'تم تحديث إعدادات الأمان', time: 'منذ ساعة', read: false, type: 'warning' as const },
        { title: 'تقرير جاهز', message: 'تقرير المبيعات الشهري جاهز للتحميل', time: 'منذ 3 ساعات', read: true, type: 'info' as const },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-slate-50/50 flex" dir="rtl">
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
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary/80 
                                rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/25">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">رصرص</h1>
                                <p className="text-[10px] text-slate-400">نظام الإدارة المتكامل</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary/80 
                            rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/25">
                            <Sparkles className="w-5 h-5 text-white" />
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

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {/* Main Section */}
                    <SidebarSection title="الرئيسية" collapsed={sidebarCollapsed} />
                    {filteredNavItems.filter(i => i.section === 'main').map((item) => (
                        <SidebarLink
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.to ||
                                (item.to !== '/dashboard' && location.pathname.startsWith(item.to))}
                            collapsed={sidebarCollapsed}
                        // badge={item.badge}
                        />
                    ))}

                    {/* Operations Section */}
                    {filteredNavItems.some(i => i.section === 'operations') && (
                        <>
                            <SidebarSection title="العمليات" collapsed={sidebarCollapsed} />
                            {filteredNavItems.filter(i => i.section === 'operations').map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                // badge={item.badge}
                                />
                            ))}
                        </>
                    )}

                    {/* Sales Section */}
                    {filteredNavItems.some(i => i.section === 'sales') && (
                        <>
                            <SidebarSection title="المبيعات" collapsed={sidebarCollapsed} />
                            {filteredNavItems.filter(i => i.section === 'sales').map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                />
                            ))}
                        </>
                    )}

                    {/* CRM Section */}
                    {filteredNavItems.some(i => i.section === 'crm') && (
                        <>
                            <SidebarSection title="إدارة العملاء" collapsed={sidebarCollapsed} />
                            {filteredNavItems.filter(i => i.section === 'crm').map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                />
                            ))}
                        </>
                    )}

                    {/* Warehouse Section */}
                    {filteredNavItems.some(i => i.section === 'warehouse') && (
                        <>
                            <SidebarSection title="دورة المخازن" collapsed={sidebarCollapsed} />
                            {filteredNavItems.filter(i => i.section === 'warehouse').map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                />
                            ))}
                        </>
                    )}

                    {/* Procurement Section */}
                    {filteredNavItems.some(i => i.section === 'procurement') && (
                        <>
                            <SidebarSection title="المشتريات" collapsed={sidebarCollapsed} />
                            {filteredNavItems.filter(i => i.section === 'procurement').map((item) => (
                                <SidebarLink
                                    key={item.to}
                                    to={item.to}
                                    icon={item.icon}
                                    label={item.label}
                                    active={location.pathname.startsWith(item.to)}
                                    collapsed={sidebarCollapsed}
                                />
                            ))}
                        </>
                    )}

                    {/* System Section */}
                    <SidebarSection title="النظام" collapsed={sidebarCollapsed} />
                    {filteredNavItems.filter(i => i.section === 'system').map((item) => (
                        <SidebarLink
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname.startsWith(item.to)}
                            collapsed={sidebarCollapsed}
                        // badge={item.badge}
                        />
                    ))}
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
                                <span>{currentTime.toLocaleDateString('ar-EG', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200" />
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
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

                        {/* User Profile */}
                        <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl 
                            transition-colors cursor-pointer group">
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
                                group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                                {getInitials(userName)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div ref={mainContentRef} className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-8">
                        <Outlet />
                    </div>
                </div>


            </main>
        </div>
    );
};

export default DashboardLayout;