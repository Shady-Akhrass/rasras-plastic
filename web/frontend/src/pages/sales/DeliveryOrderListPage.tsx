import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Truck, RefreshCw, Eye, Clock, CheckCircle2, XCircle, DollarSign, Calendar } from 'lucide-react';
import { deliveryOrderService, type DeliveryOrderDto } from '../../services/deliveryOrderService';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatNumber } from '../../utils/format';
import toast from 'react-hot-toast';

// --- Reusable Components ---

// Animation styles
const animationStyles = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const StatCard: React.FC<{
    icon: React.ElementType;
    value: number | string;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <div className="w-full p-5 rounded-2xl border transition-all duration-300 group text-right bg-white border-slate-100 hover:shadow-lg hover:border-brand-primary/20">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${colorClasses[color]} group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-bold text-slate-800">
                        {typeof value === 'number' ? formatNumber(value) : value}
                    </div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, {
        label: string;
        bg: string;
        text: string;
        border: string;
        icon: React.ElementType;
    }> = {
        'Pending': {
            label: 'قيد الانتظار',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: Clock
        },
        'InTransit': {
            label: 'في الطريق',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Truck
        },
        'Delivered': {
            label: 'تم التوصيل',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Cancelled': {
            label: 'ملغي',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            icon: XCircle
        },
    };

    const c = config[status] || {
        label: status,
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        icon: FileText
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
        </span>
    );
};

const DeliveryOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<DeliveryOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await deliveryOrderService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل أوامر التوصيل');
            setList([]);
        } finally { setLoading(false); }
    };

    const filtered = useMemo(() => {
        const f = list.filter((d) =>
            !search ||
            (d.deliveryOrderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (d.issueNoteNumber || d.saleOrderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (d.customerNameAr || '').toLowerCase().includes(search.toLowerCase())
        );
        // الأحدث في الأعلى
        return [...f].sort((a, b) => {
            const dateA = (a.orderDate || a.deliveryDate) ? new Date(a.orderDate || a.deliveryDate!).getTime() : 0;
            const dateB = (b.orderDate || b.deliveryDate) ? new Date(b.orderDate || b.deliveryDate!).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [list, search]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const stats = useMemo(() => {
        const total = list.length;
        const pending = list.filter(d => d.status === 'Pending').length;
        const inTransit = list.filter(d => d.status === 'InTransit').length;
        const delivered = list.filter(d => d.status === 'Delivered').length;
        return { total, pending, inTransit, delivered };
    }, [list]);

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{animationStyles}</style>
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Truck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أوامر التوصيل</h1>
                            <p className="text-white/80 text-lg">إدارة أوامر التوصيل المرتبطة بإذن الصرف</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchList} disabled={loading} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/dashboard/sales/delivery-orders/new')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-5 h-5" />
                            <span>أمر توصيل جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="الإجمالي" color="primary" />
                <StatCard icon={Clock} value={stats.pending} label="قيد الانتظار" color="warning" />
                <StatCard icon={Truck} value={stats.inTransit} label="في الطريق" color="blue" />
                <StatCard icon={CheckCircle2} value={stats.delivered} label="تم التوصيل" color="success" />
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث برقم أمر التوصيل، أمر البيع، أو العميل..." className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">رقم أمر التوصيل</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">التاريخ</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">إذن الصرف</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">العميل</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الحالة</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-14 bg-slate-200 rounded" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>لا توجد أوامر توصيل</p>
                                        <button onClick={() => navigate('/dashboard/sales/delivery-orders/new')} className="mt-4 text-brand-primary font-medium">إنشاء أمر توصيل</button>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((d, index) => (
                                    <tr
                                        key={d.id}
                                        className={`group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0 cursor-pointer`}
                                        onClick={() => navigate(`/dashboard/sales/delivery-orders/${d.id}`)}
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                            animation: 'fadeInUp 0.3s ease-out forwards',
                                            opacity: 0
                                        }}
                                    >
                                        <td className="px-6 py-4 font-mono font-bold text-brand-primary">{d.deliveryOrderNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-600">{d.orderDate ? formatDate(d.orderDate) : (d.deliveryDate ? formatDate(d.deliveryDate) : '—')}</td>
                                        <td className="px-6 py-4 text-slate-700">{d.issueNoteNumber || d.saleOrderNumber || '—'}</td>
                                        <td className="px-6 py-4 text-slate-700">{d.customerNameAr || '—'}</td>
                                        <td className="px-6 py-4"><StatusBadge status={d.status || 'Pending'} /></td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => navigate(`/dashboard/sales/delivery-orders/${d.id}`)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"><Eye className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filtered.length > 0 && (
                    <Pagination currentPage={currentPage} totalItems={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
                )}
            </div>
        </div>
    );
};

export default DeliveryOrderListPage;
