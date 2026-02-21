import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import WarehouseDashboard from './WarehouseDashboard';
import ManagementDashboard from './ManagementDashboard';
import ProcurementDashboard from './ProcurementDashboard';
import QualityControlDashboard from './QualityControlDashboard';
import FinanceDashboard from './FinanceDashboard';
import {
    Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, User,
    Loader2, FileText, DollarSign, Calendar, Clock,
    CheckCircle2, XCircle, ArrowRight, BarChart3,
    Activity, Zap, Target, Award, RefreshCw, Download, Bell,
    ChevronLeft, Sparkles, Building2, PieChart,
    MoreHorizontal, ExternalLink, UserPlus, ShoppingCart
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import apiClient from '../../services/apiClient';
import { formatDate as formatDateEn } from '../../utils/format';
import ExchangeRateWidget from '../../components/ExchangeRate/ExchangeRateWidget';
import ExchangeRateCompact from '../../components/ExchangeRate/ExchangeRateCompact';

interface DashboardStats {
    totalEmployees?: number;
    activeEmployees?: number;
    totalDepartments?: number;
    employeeGrowthRate?: number;
}

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

// Stat Card Component
const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'primary',
    subtitle
}: {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
    subtitle?: string;
}) => {
    const colorClasses = {
        primary: {
            bg: 'bg-brand-primary/10',
            border: 'border-brand-primary/20',
            text: 'text-brand-primary',
            gradient: 'from-brand-primary/20 to-brand-primary/5'
        },
        success: {
            bg: 'bg-emerald-100',
            border: 'border-emerald-200',
            text: 'text-emerald-600',
            gradient: 'from-emerald-100 to-emerald-50'
        },
        warning: {
            bg: 'bg-amber-100',
            border: 'border-amber-200',
            text: 'text-amber-600',
            gradient: 'from-amber-100 to-amber-50'
        },
        danger: {
            bg: 'bg-rose-100',
            border: 'border-rose-200',
            text: 'text-rose-600',
            gradient: 'from-rose-100 to-rose-50'
        },
        purple: {
            bg: 'bg-purple-100',
            border: 'border-purple-200',
            text: 'text-purple-600',
            gradient: 'from-purple-100 to-purple-50'
        }
    };

    const colors = colorClasses[color];

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden
                hover:shadow-xl hover:shadow-slate-100 hover:border-slate-200 transition-all duration-300 group"
        >
            <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-br ${colors.gradient} 
                opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="relative">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}
                        group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    {trend && trendValue && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                            ${trend === 'up'
                                ? 'bg-emerald-50 text-emerald-600'
                                : trend === 'down'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-slate-100 text-slate-600'
                            }`}>
                            {trend === 'up' ? (
                                <ArrowUpRight className="w-3 h-3" />
                            ) : trend === 'down' ? (
                                <ArrowDownRight className="w-3 h-3" />
                            ) : (
                                <Activity className="w-3 h-3" />
                            )}
                            {trendValue}
                        </div>
                    )}
                </div>

                <h3 className="text-slate-500 text-sm mb-1">{title}</h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
                {subtitle && (
                    <p className="text-xs text-slate-400">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
};

// Quick Action Button
const QuickAction = ({
    icon: Icon,
    label,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
}) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 
            hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 
            transition-all duration-300 text-right w-full group"
    >
        <div className="p-2.5 bg-brand-primary/10 rounded-xl group-hover:bg-brand-primary 
            group-hover:scale-110 transition-all duration-300">
            <Icon className="w-5 h-5 text-brand-primary group-hover:text-white transition-colors" />
        </div>
        <span className="font-medium text-slate-700 group-hover:text-brand-primary transition-colors">
            {label}
        </span>
        <ChevronLeft className="w-4 h-4 text-slate-300 mr-auto group-hover:text-brand-primary 
            group-hover:-translate-x-1 transition-all" />
    </motion.button>
);

// Activity Item Component
const ActivityItem = ({
    title,
    subtitle,
    time,
    status,
    icon: Icon = FileText
}: {
    title: string;
    subtitle?: string;
    time: string;
    status: 'success' | 'pending' | 'failed';
    icon?: React.ElementType;
}) => {
    const statusConfig = {
        success: {
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            label: 'مكتمل',
            icon: CheckCircle2
        },
        pending: {
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            label: 'قيد التنفيذ',
            icon: Clock
        },
        failed: {
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            label: 'ملغي',
            icon: XCircle
        }
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 
                transition-colors duration-200 group cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                    <p className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-slate-400">{subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-xs text-slate-400">{time}</span>
                    </div>
                </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                ${config.bg} ${config.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {config.label}
            </div>
        </motion.div>
    );
};

// Progress Bar Component
const ProgressBar = ({
    label,
    value,
    max,
    color = 'primary'
}: {
    label: string;
    value: number;
    max: number;
    color?: 'primary' | 'success' | 'warning' | 'danger';
}) => {
    const percentage = Math.round((value / max) * 100);
    const colorClasses = {
        primary: 'bg-brand-primary',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500'
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-800">{percentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colorClasses[color]}`}
                />
            </div>
        </div>
    );
};

// Circular Progress Component
const CircularProgress = ({
    value,
    label,
    color = 'primary'
}: {
    value: number;
    label: string;
    color?: 'primary' | 'success' | 'warning';
}) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const colorClasses = {
        primary: 'text-brand-primary',
        success: 'text-emerald-500',
        warning: 'text-amber-500'
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-slate-100"
                    />
                    <motion.circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={colorClasses[color]}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{ strokeDasharray: circumference }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">{value}%</span>
                </div>
            </div>
            <span className="text-sm text-slate-500 mt-2">{label}</span>
        </div>
    );
};

const DashboardHome: React.FC = () => {
    usePageTitle('لوحة التحكم');
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userPermissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];

    const isQualityController =
        userPermissions.includes('SECTION_OPERATIONS') &&
        !userPermissions.includes('SECTION_PROCUREMENT') &&
        !userPermissions.includes('SECTION_WAREHOUSE') &&
        !userPermissions.includes('SECTION_SALES');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/dashboard/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Dashboard selection by permissions only — no roleCode checks.
    // Users with all SECTION_* (ADMIN/GM) get Management; others get their section dashboard.
    const hasAll = ['SECTION_PROCUREMENT', 'SECTION_FINANCE', 'SECTION_WAREHOUSE', 'SECTION_SALES']
        .every(s => userPermissions.includes(s));
    if (hasAll) return <ManagementDashboard />;
    if (isQualityController) return <QualityControlDashboard />;
    if (userPermissions.includes('SECTION_WAREHOUSE') && !userPermissions.includes('SECTION_PROCUREMENT') && !userPermissions.includes('SECTION_FINANCE')) return <WarehouseDashboard />;
    if (userPermissions.includes('SECTION_PROCUREMENT') && !userPermissions.includes('SECTION_FINANCE')) return <ProcurementDashboard />;
    if (userPermissions.includes('SECTION_FINANCE') && !userPermissions.includes('SECTION_PROCUREMENT')) return <FinanceDashboard />;

    const employeeDisplayName = user?.fullNameAr || user?.username || 'المستخدم';

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مساء الخير';
    };

    const formatDate = () => {
        return formatDateEn(currentTime, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const activities = [
        { title: 'أمر بيع #SO-1025', subtitle: 'محمد أحمد', time: 'منذ 5 دقائق', status: 'success' as const, icon: ShoppingCart },
        { title: 'فاتورة #INV-2048', subtitle: 'شركة النور', time: 'منذ 15 دقيقة', status: 'pending' as const, icon: FileText },
        { title: 'أمر شراء #PO-512', subtitle: 'مورد المستقبل', time: 'منذ 30 دقيقة', status: 'success' as const, icon: Package },
        { title: 'طلب إرجاع #RET-89', subtitle: 'عميل VIP', time: 'منذ ساعة', status: 'failed' as const, icon: ArrowDownRight },
        { title: 'تحويل مخزني #TR-156', subtitle: 'المستودع الرئيسي', time: 'منذ ساعتين', status: 'success' as const, icon: ArrowRight },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header Section */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                    rounded-3xl p-8 text-white"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Floating Icons */}
                <div className="absolute top-10 left-20 opacity-10">
                    <BarChart3 className="w-16 h-16" />
                </div>
                <div className="absolute bottom-10 right-40 opacity-10">
                    <TrendingUp className="w-20 h-20" />
                </div>

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate()}
                            </span>
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {/* Exchange Rate Compact Widget */}
                            <ExchangeRateCompact />
                        </div>

                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            {getGreeting()}، {employeeDisplayName}
                            <motion.span
                                animate={{ rotate: [0, 20, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                                👋
                            </motion.span>
                        </h1>
                        <p className="text-white/70 text-lg">إليك ملخص ما يحدث في نظامك اليوم</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
                            transition-colors duration-200">
                            <Bell className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl 
                            transition-colors duration-200">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button className="inline-flex items-center gap-2 px-5 py-3 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300 shadow-lg">
                            <Download className="w-5 h-5" />
                            تصدير التقارير
                        </button>
                    </div>
                </div>

                {/* Quick Stats in Header */}
                <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                    {[
                        { label: 'المبيعات اليوم', value: '12,500 ج.م', icon: DollarSign },
                        { label: 'الطلبات الجديدة', value: '24', icon: ShoppingCart },
                        { label: 'العملاء الجدد', value: '8', icon: Users },
                        { label: 'المهام المعلقة', value: '5', icon: Target },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl">
                            <stat.icon className="w-6 h-6 mx-auto mb-2 opacity-70" />
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-sm text-white/60">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Stats Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-brand-primary mx-auto mb-4" />
                        <p className="text-slate-500">جاري تحميل البيانات...</p>
                    </div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <StatCard
                        title="إجمالي الموظفين"
                        value={stats?.totalEmployees?.toString() || '0'}
                        icon={Users}
                        trend="up"
                        trendValue="+12%"
                        color="primary"
                        subtitle="من إجمالي القوى العاملة"
                    />
                    <StatCard
                        title="الموظفين النشطين"
                        value={stats?.activeEmployees?.toString() || '0'}
                        icon={User}
                        trend="up"
                        trendValue="+5%"
                        color="success"
                        subtitle="يعملون حالياً"
                    />
                    <StatCard
                        title="إجمالي الأقسام"
                        value={stats?.totalDepartments?.toString() || '0'}
                        icon={Building2}
                        trend="neutral"
                        trendValue="ثابت"
                        color="purple"
                        subtitle="قسم عامل"
                    />
                    <StatCard
                        title="نسبة النمو"
                        value={`${stats?.employeeGrowthRate || 0}%`}
                        icon={TrendingUp}
                        trend={(stats?.employeeGrowthRate ?? 0) >= 0 ? 'up' : 'down'}
                        trendValue={`${stats?.employeeGrowthRate ?? 0}%`}
                        color={(stats?.employeeGrowthRate ?? 0) >= 0 ? 'success' : 'danger'}
                        subtitle="مقارنة بالشهر الماضي"
                    />
                </motion.div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">إحصائيات الأداء</h3>
                            <p className="text-sm text-slate-500">تحليل البيانات خلال الأشهر الماضية</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-primary/10 
                                rounded-lg hover:bg-brand-primary/20 transition-colors">
                                شهري
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 
                                rounded-lg transition-colors">
                                أسبوعي
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 
                                rounded-lg transition-colors">
                                يومي
                            </button>
                        </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="relative h-[300px] bg-gradient-to-br from-slate-50 to-white rounded-xl 
                        border border-slate-100 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-30">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute left-0 right-0 border-b border-slate-200"
                                    style={{ top: `${(i + 1) * 16.66}%` }}
                                />
                            ))}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-8 pb-4">
                            {[65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95, 80].map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="w-6 bg-gradient-to-t from-brand-primary to-brand-primary/60 rounded-t-lg"
                                    style={{ maxHeight: '200px' }}
                                />
                            ))}
                        </div>

                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-brand-primary/10 rounded-2xl 
                                flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 text-brand-primary" />
                            </div>
                            <p className="text-slate-600 font-medium">الرسم البياني التفاعلي</p>
                            <p className="text-sm text-slate-400">قيد التطوير</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-brand-primary" />
                            <span className="text-sm text-slate-600">المبيعات</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-sm text-slate-600">الأرباح</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-sm text-slate-600">المصروفات</span>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Activities */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">أحدث العمليات</h3>
                            <p className="text-sm text-slate-500">آخر 5 عمليات في النظام</p>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {activities.map((activity, i) => (
                            <ActivityItem key={i} {...activity} />
                        ))}
                    </div>

                    <button className="w-full mt-4 py-3 text-brand-primary font-medium hover:bg-brand-primary/5 
                        rounded-xl transition-colors flex items-center justify-center gap-2">
                        عرض جميع العمليات
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <Zap className="w-5 h-5 text-brand-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
                    </div>

                    <div className="space-y-3">
                        <QuickAction
                            icon={UserPlus}
                            label="إضافة موظف جديد"
                            onClick={() => navigate('/dashboard/employees')}
                        />
                        <QuickAction
                            icon={FileText}
                            label="إنشاء فاتورة"
                            onClick={() => navigate('/dashboard/procurement/invoices/new')}
                        />
                        <QuickAction
                            icon={ShoppingCart}
                            label="أمر بيع جديد"
                            onClick={() => alert('ميزة أوامر البيع ستتوفر قريباً')}
                        />
                        <QuickAction
                            icon={Package}
                            label="إضافة منتج"
                            onClick={() => navigate('/dashboard/inventory')}
                        />
                    </div>
                </motion.div>

                {/* Exchange Rate Widget */}
                <motion.div variants={itemVariants}>
                    <ExchangeRateWidget />
                </motion.div>

                {/* Performance Metrics */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <PieChart className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">مؤشرات الأداء</h3>
                    </div>

                    <div className="flex items-center justify-around mb-6">
                        <CircularProgress value={78} label="المبيعات" color="primary" />
                        <CircularProgress value={92} label="رضا العملاء" color="success" />
                        <CircularProgress value={65} label="الإنتاجية" color="warning" />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <ProgressBar label="الهدف الشهري" value={75} max={100} color="primary" />
                        <ProgressBar label="معدل التحصيل" value={88} max={100} color="success" />
                    </div>
                </motion.div>
            </div>

            {/* Top Performers / Departments */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold">الأقسام الأكثر نشاطاً</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { name: 'قسم المبيعات', value: 45, change: '+12%' },
                        { name: 'قسم المشتريات', value: 38, change: '+8%' },
                        { name: 'قسم المخازن', value: 32, change: '+5%' },
                        { name: 'قسم المحاسبة', value: 28, change: '+3%' },
                    ].map((dept, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl
                            hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center 
                                    text-lg font-bold">
                                    {i + 1}
                                </div>
                                <span className="font-medium">{dept.name}</span>
                            </div>
                            <div className="text-left">
                                <p className="font-bold">{dept.value} عملية</p>
                                <p className="text-xs text-emerald-400">{dept.change}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl 
                    font-medium transition-colors flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    عرض التقرير الكامل
                </button>
            </motion.div>
        </motion.div>
    );
};

export default DashboardHome;