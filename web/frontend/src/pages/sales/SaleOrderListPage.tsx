import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    FileText,
    Clock,
    CheckCircle2,
    Truck,
    Lock,
    XCircle,
    DollarSign,
    Package,
    Calendar,
    Users
} from 'lucide-react';
import { saleOrderService, type SaleOrderDto } from '../../services/saleOrderService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatNumber, formatDate } from '../../utils/format';
import { toast } from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: string | number;
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

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, {
        label: string;
        bg: string;
        text: string;
        border: string;
        icon: React.ElementType;
    }> = {
        'Draft': {
            label: 'مسودة',
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            border: 'border-slate-200',
            icon: FileText
        },
        'Pending': {
            label: 'قيد الاعتماد',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: Clock
        },
        'Confirmed': {
            label: 'مؤكد',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Shipped': {
            label: 'تم الشحن',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Truck
        },
        'Closed': {
            label: 'مغلق',
            bg: 'bg-slate-100',
            text: 'text-slate-700',
            border: 'border-slate-300',
            icon: Lock
        }
    };

    const c = config[status] || config['Draft'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
        </span>
    );
};

const SaleOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<SaleOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<SaleOrderDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await saleOrderService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل أوامر البيع');
            setList([]);
        } finally { setLoading(false); }
    };

    const handleDeleteClick = (order: SaleOrderDto) => {
        if (order.status !== 'Draft' && order.status !== 'Pending' && order.status !== 'Rejected') {
            toast.error('لا يمكن حذف هذا الأمر في حالته الحالية');
            return;
        }
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!orderToDelete?.id) return;
        setIsDeleting(true);
        try {
            await saleOrderService.delete(orderToDelete.id);
            toast.success('تم حذف أمر البيع');
            await fetchList();
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'فشل الحذف');
        } finally {
            setIsDeleting(false);
        }
    };

    const filtered = useMemo(() => {
        const f = list.filter((o) => {
            const matchesSearch = !search ||
                (o.soNumber || '').toLowerCase().includes(search.toLowerCase()) ||
                (o.customerNameAr || '').toLowerCase().includes(search.toLowerCase());

            const matchesStatus = statusFilter === 'All' || o.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
        return [...f].sort((a, b) => {
            const dateA = a.soDate ? new Date(a.soDate).getTime() : 0;
            const dateB = b.soDate ? new Date(b.soDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [list, search, statusFilter]);

    const stats = useMemo(() => {
        const total = list.length;
        const totalAmount = list.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
        const confirmed = list.filter(o => o.status === 'Confirmed' || o.status === 'Shipped' || o.status === 'Closed').length;
        const pending = list.filter(o => o.status === 'Pending').length;

        return {
            total,
            totalAmount: formatNumber(totalAmount),
            confirmed,
            pending
        };
    }, [list]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Package className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أوامر البيع</h1>
                            <p className="text-white/80 text-lg">إدارة أوامر البيع ومتابعة حالة الطلبات</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchList}
                            disabled={loading}
                            className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/sales/orders/new')}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl 
                                font-bold shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            <span>أمر بيع جديد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي الأوامر" color="blue" />
                <StatCard icon={Clock} value={stats.pending} label="قيد الاعتماد" color="warning" />
                <StatCard icon={CheckCircle2} value={stats.confirmed} label="تم تأكيدها" color="success" />
                <StatCard icon={DollarSign} value={stats.totalAmount} label="إجمالي القيمة" color="purple" />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث برقم الأمر أو اسم العميل..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-500/10'
                                    : 'border-transparent hover:border-slate-200'}`}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 
                                    rounded-full transition-colors"
                            >
                                <XCircle className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 overflow-x-auto hide-scrollbar">
                        {['All', 'Draft', 'Pending', 'Confirmed', 'Shipped', 'Closed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                                    ${statusFilter === status
                                        ? 'bg-white text-brand-primary shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                                {status === 'All' ? 'الكل' :
                                    status === 'Draft' ? 'مسودة' :
                                        status === 'Pending' ? 'قيد الاعتماد' :
                                            status === 'Confirmed' ? 'مؤكد' :
                                                status === 'Shipped' ? 'تم الشحن' : 'مغلق'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم الأمر</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">العميل</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">تاريخ التسليم</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجمالي</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-7 w-16 bg-slate-200 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-200 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                <FileText className="w-10 h-10 text-blue-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-semibold">لا توجد نتائج</p>
                                                <p className="text-slate-400 text-sm mt-1">جرب تغيير معايير البحث</p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/dashboard/sales/orders/new')}
                                                className="mt-2 text-brand-primary font-medium hover:underline"
                                            >
                                                إنشاء أمر بيع جديد
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((o, index) => (
                                    <tr
                                        key={o.id}
                                        onClick={() => navigate(`/dashboard/sales/orders/${o.id}?mode=view`)}
                                        className="hover:bg-indigo-50/50 transition-all duration-200 group border-b border-slate-100 last:border-0 cursor-pointer"
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                            animation: 'fadeInUp 0.3s ease-out forwards'
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 
                                                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Package className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                    {o.soNumber || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>{o.soDate ? formatDate(o.soDate) : '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <span>{o.customerNameAr || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {o.expectedDeliveryDate ? formatDate(o.expectedDeliveryDate) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-bold text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                                <span>{formatNumber(o.totalAmount ?? 0)} {o.currency || ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <StatusBadge status={o.status || 'Draft'} />
                                                {o.approvalStatus && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${o.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        o.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                            o.approvalStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                'bg-slate-50 text-slate-500 border-slate-200'
                                                        }`}>
                                                        {o.approvalStatus === 'Approved' ? 'معتمد' :
                                                            o.approvalStatus === 'Rejected' ? 'مرفوض' :
                                                                o.approvalStatus === 'Pending' ? 'قيد الاعتماد' : o.approvalStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/orders/${o.id}?mode=view`); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {(o.status === 'Draft' || o.status === 'Rejected') && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/orders/${o.id}`); }}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="تعديل"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(o); }}
                                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {o.status === 'Pending' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(o); }}
                                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filtered.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filtered.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف أمر البيع"
                message={`هل أنت متأكد من حذف أمر البيع ${orderToDelete?.soNumber || ''}؟`}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setOrderToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default SaleOrderListPage;