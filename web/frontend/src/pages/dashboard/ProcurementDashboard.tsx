import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ShoppingCart, FileText, Tag, Scale, Truck, ArrowDownToLine,
    Bell, ChevronLeft, Loader2, Package, DollarSign, Undo2,
    Calendar, Clock, Activity
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import { grnService } from '../../services/grnService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import purchaseService from '../../services/purchaseService';
import { approvalService } from '../../services/approvalService';

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

const ProcurementDashboard: React.FC = () => {
    usePageTitle('لوحة التحكم - المشتريات');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [waitingImports, setWaitingImports] = useState(0);
    const [pendingPRs, setPendingPRs] = useState(0);
    const [suppliersCount, setSuppliersCount] = useState(0);
    const [recentPOs, setRecentPOs] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const displayName = user?.fullNameAr || user?.username || 'مدير المشتريات';

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const [approvals, waiting, prs, suppliers, pos] = await Promise.all([
                    user?.userId ? approvalService.getPendingCount(user.userId) : 0,
                    purchaseOrderService.getWaitingForArrivalPOs(),
                    purchaseService.getAllPRs(),
                    purchaseService.getAllSuppliers(),
                    purchaseOrderService.getAllPOs()
                ]);

                setPendingApprovals(typeof approvals === 'number' ? approvals : 0);
                setWaitingImports(Array.isArray(waiting) ? waiting.length : 0);
                setPendingPRs(Array.isArray(prs) ? prs.filter((p: any) => p.status === 'Pending' || p.status === 'Draft').length : 0);
                setSuppliersCount(Array.isArray(suppliers) ? suppliers.length : 0);

                const posList = Array.isArray(pos) ? pos : [];
                const sorted = [...posList].sort((a: any, b: any) =>
                    new Date(b.poDate || 0).getTime() - new Date(a.poDate || 0).getTime()
                );
                setRecentPOs(sorted.slice(0, 5));
            } catch (e) {
                console.error('Error loading procurement dashboard', e);
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
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <ShoppingCart className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {getGreeting()}، {displayName}
                                </h1>
                                <p className="text-white/80">لوحة التحكم الخاصة بالمشتريات</p>
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
                            title="الشحنات القادمة"
                            value={waitingImports}
                            icon={Truck}
                            color="primary"
                            onClick={() => navigate('/dashboard/procurement/waiting-imports')}
                        />
                        <StatCard
                            title="طلبات شراء معلقة"
                            value={pendingPRs}
                            icon={FileText}
                            color="rose"
                            onClick={() => navigate('/dashboard/procurement/pr')}
                        />
                        <StatCard
                            title="الموردين"
                            value={suppliersCount}
                            icon={Package}
                            color="success"
                            onClick={() => navigate('/dashboard/procurement/suppliers')}
                        />
                    </div>

                    {/* Quick Actions + Recent */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
                            </div>
                            <div className="space-y-3">
                                <QuickAction icon={FileText} label="طلبات الشراء (PR)" path="/dashboard/procurement/pr" />
                                <QuickAction icon={FileText} label="طلبات عروض الأسعار (RFQ)" path="/dashboard/procurement/rfq" />
                                <QuickAction icon={Tag} label="عروض الموردين" path="/dashboard/procurement/quotation" />
                                <QuickAction icon={Scale} label="مقارنة العروض (QCS)" path="/dashboard/procurement/comparison" />
                                <QuickAction icon={ShoppingCart} label="أوامر الشراء (PO)" path="/dashboard/procurement/po" />
                                <QuickAction icon={ArrowDownToLine} label="إذونات الاستلام (GRN)" path="/dashboard/procurement/grn" />
                                <QuickAction icon={FileText} label="فواتير الموردين" path="/dashboard/procurement/invoices" />
                                <QuickAction icon={DollarSign} label="الأرصدة المستحقة" path="/dashboard/procurement/suppliers/outstanding" />
                                <QuickAction icon={Undo2} label="مرتجعات الشراء" path="/dashboard/procurement/returns" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                                        <ShoppingCart className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">آخر أوامر الشراء</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/procurement/po')}
                                    className="text-sm text-brand-primary font-medium hover:underline"
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {recentPOs.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد أوامر شراء حديثة</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {recentPOs.map((po: any) => (
                                            <div
                                                key={po.id}
                                                onClick={() => navigate(`/dashboard/procurement/po/${po.id}`)}
                                                className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">#{po.poNumber}</p>
                                                    <p className="text-sm text-slate-500">{po.supplierNameAr || '-'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${po.status === 'Pending Approval' || po.approvalStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                            po.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {po.approvalStatus === 'Pending' ? 'بانتظار الاعتماد' :
                                                            po.status === 'Completed' ? 'مكتمل' : po.status || '-'}
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

export default ProcurementDashboard;
