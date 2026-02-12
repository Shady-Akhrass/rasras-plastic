import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield, Bell, Users, User, Building2, Settings, ChevronLeft,
    BarChart3, TrendingUp, FileText, Target, Loader2,
    Calendar, Clock, Award, Zap
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import apiClient from '../../services/apiClient';
import { approvalService } from '../../services/approvalService';
import ExchangeRateCompact from '../../components/ExchangeRate/ExchangeRateCompact';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StatCard = ({
    title, value, icon: Icon, color, onClick
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: 'primary' | 'success' | 'warning' | 'purple';
    onClick?: () => void;
}) => {
    const colors = {
        primary: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary',
        success: 'bg-emerald-100 border-emerald-200 text-emerald-600',
        warning: 'bg-amber-100 border-amber-200 text-amber-600',
        purple: 'bg-purple-100 border-purple-200 text-purple-600'
    };
    const cls = colors[color];
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className={`p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:border-brand-primary/30' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-500 text-sm mb-1">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${cls}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    );
};

const QuickAction = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => {
    const navigate = useNavigate();
    return (
        <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(path)}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 hover:border-brand-primary/30 
                hover:shadow-lg hover:shadow-brand-primary/5 transition-all text-right w-full group"
        >
            <div className="p-2.5 bg-brand-primary/10 rounded-xl group-hover:bg-brand-primary group-hover:scale-110 transition-all">
                <Icon className="w-5 h-5 text-brand-primary group-hover:text-white transition-colors" />
            </div>
            <span className="font-medium text-slate-700 group-hover:text-brand-primary transition-colors">{label}</span>
            <ChevronLeft className="w-4 h-4 text-slate-300 mr-auto group-hover:text-brand-primary group-hover:-translate-x-1 transition-all" />
        </motion.button>
    );
};

const ManagementDashboard: React.FC = () => {
    usePageTitle('لوحة التحكم - الإدارة');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [stats, setStats] = useState<{ totalEmployees?: number; activeEmployees?: number; totalDepartments?: number } | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const displayName = user?.fullNameAr || user?.username || 'المدير';

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const [approvalsCount, statsRes] = await Promise.all([
                    user?.userId ? approvalService.getPendingCount(user.userId) : 0,
                    apiClient.get('/dashboard/stats').then(r => r.data?.data ?? null)
                ]);
                setPendingApprovals(typeof approvalsCount === 'number' ? approvalsCount : 0);
                setStats(statsRes);
            } catch (e) {
                console.error('Error loading management dashboard', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [user?.userId]);

    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(t);
    }, []);

    const getGreeting = () => {
        const h = currentTime.getHours();
        if (h < 12) return 'صباح الخير';
        if (h < 18) return 'مساء الخير';
        return 'مساء الخير';
    };

    const formatDate = () => {
        return currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white"
            >
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
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
                            <ExchangeRateCompact />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {getGreeting()}، {displayName}
                                </h1>
                                <p className="text-white/80">لوحة التحكم الخاصة بالإدارة</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="طلبات بانتظار الاعتماد"
                            value={pendingApprovals}
                            icon={Bell}
                            color="warning"
                            onClick={() => navigate('/dashboard/approvals')}
                        />
                        <StatCard
                            title="إجمالي الموظفين"
                            value={stats?.totalEmployees ?? 0}
                            icon={Users}
                            color="primary"
                            onClick={() => navigate('/dashboard/employees')}
                        />
                        <StatCard
                            title="الموظفين النشطين"
                            value={stats?.activeEmployees ?? 0}
                            icon={User}
                            color="success"
                        />
                        <StatCard
                            title="الأقسام"
                            value={stats?.totalDepartments ?? 0}
                            icon={Building2}
                            color="purple"
                        />
                    </div>

                    {/* Quick Actions + Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Zap className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
                            </div>
                            <div className="space-y-3">
                                <QuickAction icon={Bell} label="الطلبات والاعتمادات" path="/dashboard/approvals" />
                                <QuickAction icon={Shield} label="الأدوار والصلاحيات" path="/dashboard/settings/roles" />
                                <QuickAction icon={User} label="إدارة المستخدمين" path="/dashboard/settings/users" />
                                <QuickAction icon={Users} label="الموظفين" path="/dashboard/employees" />
                                <QuickAction icon={Settings} label="إعدادات النظام" path="/dashboard/settings/system" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">نظرة عامة</h3>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                                        <div className="p-3 bg-brand-primary/10 rounded-xl">
                                            <Target className="w-6 h-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-sm">القوى العاملة</p>
                                            <p className="text-xl font-bold text-slate-900">{stats?.totalEmployees ?? 0} موظف</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                                        <div className="p-3 bg-emerald-100 rounded-xl">
                                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-sm">النشطين</p>
                                            <p className="text-xl font-bold text-slate-900">{stats?.activeEmployees ?? 0} موظف</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50/50">
                                        <Award className="w-8 h-8 text-amber-600" />
                                        <div>
                                            <p className="font-medium text-slate-800">الطلبات والاعتمادات</p>
                                            <p className="text-sm text-slate-500">لديك {pendingApprovals} طلب بانتظار المراجعة والاعتماد</p>
                                            <button
                                                onClick={() => navigate('/dashboard/approvals')}
                                                className="mt-2 text-sm text-brand-primary font-medium hover:underline"
                                            >
                                                عرض الطلبات
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default ManagementDashboard;
