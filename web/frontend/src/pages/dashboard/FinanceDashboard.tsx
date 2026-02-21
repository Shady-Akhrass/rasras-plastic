import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    DollarSign, FileText, Banknote, Bell, ChevronLeft, Loader2,
    Calendar, Clock, Activity, Receipt, CreditCard, TrendingUp
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import { paymentVoucherService } from '../../services/paymentVoucherService';
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
    color: 'primary' | 'success' | 'warning' | 'rose';
    onClick?: () => void;
}) => {
    const colors = {
        primary: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary',
        success: 'bg-emerald-100 border-emerald-200 text-emerald-600',
        warning: 'bg-amber-100 border-amber-200 text-amber-600',
        rose: 'bg-rose-100 border-rose-200 text-rose-600'
    };
    const cls = colors[color];
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            onClick={onClick}
            className={`p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer ${onClick ? 'hover:border-brand-primary/30' : ''}`}
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

const FinanceDashboard: React.FC = () => {
    usePageTitle('لوحة التحكم - المالية');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [vouchersCount, setVouchersCount] = useState(0);
    const [pendingVouchersCount, setPendingVouchersCount] = useState(0);
    const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
    const [recentVouchers, setRecentVouchers] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const displayName = user?.fullNameAr || user?.username || 'المالية';

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const [approvals, vouchers, unpaid] = await Promise.all([
                    user?.userId ? approvalService.getPendingCount(user.userId) : 0,
                    paymentVoucherService.getAllVouchers(),
                    paymentVoucherService.getUnpaidInvoices()
                ]);

                setPendingApprovals(typeof approvals === 'number' ? approvals : 0);
                const list = Array.isArray(vouchers) ? vouchers : [];
                setVouchersCount(list.length);
                setPendingVouchersCount(list.filter((v: any) => v.status === 'Draft' || v.approvalStatus === 'Pending').length);
                setUnpaidInvoicesCount(Array.isArray(unpaid) ? unpaid.length : 0);

                const sorted = [...list].sort((a: any, b: any) =>
                    new Date(b.voucherDate || 0).getTime() - new Date(a.voucherDate || 0).getTime()
                );
                setRecentVouchers(sorted.slice(0, 5));
            } catch (e) {
                console.error('Error loading finance dashboard', e);
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

    const formatAmount = (amount: number, currency = 'EGP') => {
        return new Intl.NumberFormat('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' ' + currency;
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
                className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-8 text-white"
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
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {getGreeting()}، {displayName}
                                </h1>
                                <p className="text-white/80">لوحة التحكم الخاصة بقسم المالية</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="طلبات بانتظار الاعتماد"
                            value={pendingApprovals}
                            icon={Bell}
                            color="warning"
                            onClick={() => navigate('/dashboard/approvals')}
                        />
                        <StatCard
                            title="سندات الصرف"
                            value={vouchersCount}
                            icon={Receipt}
                            color="primary"
                            onClick={() => navigate('/dashboard/finance/payment-vouchers')}
                        />
                        <StatCard
                            title="سندات معلقة"
                            value={pendingVouchersCount}
                            icon={FileText}
                            color="rose"
                            onClick={() => navigate('/dashboard/finance/payment-vouchers')}
                        />
                        <StatCard
                            title="فواتير غير مسددة"
                            value={unpaidInvoicesCount}
                            icon={CreditCard}
                            color="success"
                            onClick={() => navigate('/dashboard/finance/payment-vouchers/new')}
                        />
                    </div>

                    {/* Quick Actions + Recent */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
                            </div>
                            <div className="space-y-3">
                                <QuickAction icon={Banknote} label="سند صرف جديد" path="/dashboard/finance/payment-vouchers/new" />
                                <QuickAction icon={Receipt} label="سندات الصرف" path="/dashboard/finance/payment-vouchers" />
                                <QuickAction icon={FileText} label="فواتير الموردين" path="/dashboard/finance/invoices" />
                                <QuickAction icon={TrendingUp} label="صندوق الاعتمادات" path="/dashboard/approvals" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Receipt className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">آخر سندات الصرف</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/finance/payment-vouchers')}
                                    className="text-sm text-brand-primary font-medium hover:underline"
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {recentVouchers.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد سندات صرف حديثة</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {recentVouchers.map((v: any) => (
                                            <div
                                                key={v.paymentVoucherId ?? v.id}
                                                onClick={() => navigate(`/dashboard/finance/payment-vouchers/${v.paymentVoucherId ?? v.id}`)}
                                                className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">#{v.voucherNumber || '-'}</p>
                                                    <p className="text-sm text-slate-500">{v.supplierNameAr || v.payeeName || '-'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {formatAmount(v.amount ?? 0, v.currency || 'EGP')}
                                                    </span>
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        v.approvalStatus === 'Pending' || v.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                                                            v.status === 'Paid' || v.paidDate ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {v.approvalStatus === 'Pending' ? 'بانتظار الاعتماد' :
                                                            v.paidDate ? 'مسدد' : v.status || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default FinanceDashboard;
