import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Microscope, Package, ClipboardCheck, ChevronLeft, Loader2,
    Calendar, Clock, CheckCircle2, AlertCircle, Command, DollarSign,
    ArrowDownToLine, Activity
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import { grnService, type GoodsReceiptNoteDto } from '../../services/grnService';
import { formatDate } from '../../utils/format';

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
        success: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary',
        warning: 'bg-brand-primary/15 border-brand-primary/25 text-brand-primary',
        rose: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
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

const QualityControlDashboard: React.FC = () => {
    usePageTitle('لوحة التحكم - مراقبة الجودة');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [inspectedCount, setInspectedCount] = useState(0);
    const [recentPending, setRecentPending] = useState<GoodsReceiptNoteDto[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const displayName = user?.fullNameAr || user?.username || 'مراقب الجودة';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const grns = await grnService.getAllGRNs();
                const list = Array.isArray(grns) ? grns : [];
                const pending = list.filter(g => g.status === 'Pending Inspection');
                const inspected = list.filter(g => g.status === 'Inspected');
                setPendingCount(pending.length);
                setInspectedCount(inspected.length);
                const sorted = [...pending].sort((a, b) =>
                    new Date(b.grnDate || 0).getTime() - new Date(a.grnDate || 0).getTime()
                );
                setRecentPending(sorted.slice(0, 5));
            } catch (e) {
                console.error('Error loading quality dashboard', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    const formatDateDisplay = () => {
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
                                {formatDateDisplay()}
                            </span>
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <Microscope className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {getGreeting()}، {displayName}
                                </h1>
                                <p className="text-white/90">لوحة التحكم الخاصة بمراقبة الجودة</p>
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
                            title="إذونات بانتظار فحص الجودة"
                            value={pendingCount}
                            icon={Activity}
                            color="warning"
                            onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                        />
                        <StatCard
                            title="إذونات تم فحصها (بانتظار الاعتماد)"
                            value={inspectedCount}
                            icon={CheckCircle2}
                            color="success"
                            onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                        />
                        <StatCard
                            title="فحص الجودة"
                            value="—"
                            icon={Microscope}
                            color="primary"
                            onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                        />
                        <StatCard
                            title="معاملات الجودة"
                            value="—"
                            icon={ClipboardCheck}
                            color="primary"
                            onClick={() => navigate('/dashboard/inventory/quality-parameters')}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Microscope className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
                            </div>
                            <div className="space-y-3">
                                <QuickAction icon={ClipboardCheck} label="فحص الجودة" path="/dashboard/inventory/quality-inspection" />
                                <QuickAction icon={AlertCircle} label="معاملات الجودة" path="/dashboard/inventory/quality-parameters" />
                                <QuickAction icon={Package} label="تصنيفات الأصناف" path="/dashboard/inventory/categories" />
                                <QuickAction icon={Command} label="الأصناف" path="/dashboard/inventory/items" />
                                <QuickAction icon={DollarSign} label="قوائم الأسعار" path="/dashboard/inventory/price-lists" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                                        <ArrowDownToLine className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">إذونات بانتظار الفحص</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                                    className="text-sm text-brand-primary font-medium hover:underline"
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {recentPending.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-brand-primary/40" />
                                        <p>لا توجد إذونات بانتظار الفحص حالياً</p>
                                        <button
                                            onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                                            className="mt-3 text-sm text-brand-primary font-medium hover:underline"
                                        >
                                            الذهاب لفحص الجودة
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {recentPending.map((grn) => (
                                            <div
                                                key={grn.id}
                                                onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                                                className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">#{grn.grnNumber}</p>
                                                    <p className="text-sm text-slate-500">{grn.supplierNameAr || '-'} · {grn.grnDate ? formatDate(grn.grnDate) : '-'}</p>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
                                                    بانتظار الفحص
                                                </span>
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

export default QualityControlDashboard;
