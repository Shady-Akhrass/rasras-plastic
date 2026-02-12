import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Warehouse, Package, ArrowRightLeft, ArrowUpFromLine, ArrowDownToLine,
    ClipboardCheck, AlertTriangle, Building2, ChevronLeft, Loader2,
    Calendar, Clock, Activity
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import { grnService } from '../../services/grnService';
import stockBalanceService from '../../services/stockBalanceService';
import warehouseService from '../../services/warehouseService';
import { transferNoteService } from '../../services/transferNoteService';

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

const WarehouseDashboard: React.FC = () => {
    usePageTitle('لوحة التحكم - المخازن');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingInspections, setPendingInspections] = useState(0);
    const [belowMinCount, setBelowMinCount] = useState(0);
    const [warehousesCount, setWarehousesCount] = useState(0);
    const [pendingTransfers, setPendingTransfers] = useState(0);
    const [recentGrns, setRecentGrns] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const displayName = user?.fullNameAr || user?.username || 'أمين المخزن';

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const [grns, belowMinRes, whRes, transfers] = await Promise.all([
                    grnService.getAllGRNs(),
                    stockBalanceService.getItemsBelowMin(),
                    warehouseService.getActive(),
                    transferNoteService.getAll()
                ]);

                const pending = grns.filter((g: any) => g.status === 'Pending Inspection').length;
                setPendingInspections(pending);

                const belowMinList = Array.isArray(belowMinRes) ? belowMinRes : [];
                setBelowMinCount(belowMinList.length);

                const whList = (whRes as any)?.data ?? whRes ?? [];
                setWarehousesCount(Array.isArray(whList) ? whList.length : 0);

                const pendingT = Array.isArray(transfers) ? transfers.filter((t: any) => t.status === 'Draft').length : 0;
                setPendingTransfers(pendingT);

                const sorted = [...grns].sort((a: any, b: any) =>
                    new Date(b.grnDate || 0).getTime() - new Date(a.grnDate || 0).getTime()
                );
                setRecentGrns(sorted.slice(0, 5));
            } catch (e) {
                console.error('Error loading warehouse dashboard', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
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
                                <Warehouse className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {getGreeting()}، {displayName}
                                </h1>
                                <p className="text-white/80">لوحة التحكم الخاصة بالمخازن</p>
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
                            value={pendingInspections}
                            icon={Activity}
                            color="warning"
                            onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                        />
                        <StatCard
                            title="أصناف تحت الحد الأدنى"
                            value={belowMinCount}
                            icon={AlertTriangle}
                            color="rose"
                            onClick={() => navigate('/dashboard/inventory/reports/below-min')}
                        />
                        <StatCard
                            title="المستودعات"
                            value={warehousesCount}
                            icon={Building2}
                            color="primary"
                            onClick={() => navigate('/dashboard/inventory/warehouses')}
                        />
                        <StatCard
                            title="تحويلات قيد الإعداد"
                            value={pendingTransfers}
                            icon={ArrowRightLeft}
                            color="success"
                            onClick={() => navigate('/dashboard/inventory/warehouse/transfer')}
                        />
                    </div>

                    {/* Quick Actions + Recent */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Package className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">إجراءات سريعة</h3>
                            </div>
                            <div className="space-y-3">
                                <QuickAction icon={ArrowUpFromLine} label="إذن صرف" path="/dashboard/inventory/warehouse/issue" />
                                <QuickAction icon={ArrowRightLeft} label="تحويل بين مخازن" path="/dashboard/inventory/warehouse/transfer" />
                                <QuickAction icon={ClipboardCheck} label="جرد دوري" path="/dashboard/inventory/count" />
                                <QuickAction icon={AlertTriangle} label="الأصناف تحت الحد الأدنى" path="/dashboard/inventory/reports/below-min" />
                                <QuickAction icon={Warehouse} label="أرصدة المخزون" path="/dashboard/inventory/stocks" />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                                        <ArrowDownToLine className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">آخر إذونات الاستلام</h3>
                                </div>
                                <button
                                    onClick={() => navigate('/dashboard/procurement/grn')}
                                    className="text-sm text-brand-primary font-medium hover:underline"
                                >
                                    عرض الكل
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                {recentGrns.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <ArrowDownToLine className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد إذونات استلام حديثة</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {recentGrns.map((grn: any) => (
                                            <div
                                                key={grn.id}
                                                onClick={() => navigate(`/dashboard/procurement/grn/${grn.id}`)}
                                                className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-900">#{grn.grnNumber}</p>
                                                    <p className="text-sm text-slate-500">{grn.supplierNameAr || '-'}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        grn.status === 'Pending Inspection' ? 'bg-amber-100 text-amber-700' :
                                                        grn.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {grn.status === 'Pending Inspection' ? 'بانتظار الفحص' :
                                                         grn.status === 'Completed' ? 'مكتمل' : grn.status || '-'}
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

export default WarehouseDashboard;
