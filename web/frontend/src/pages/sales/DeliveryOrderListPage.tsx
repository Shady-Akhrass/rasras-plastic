import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryOrderService, type DeliveryOrderDto } from '../../services/deliveryOrderService';
import { stockIssueNoteService, type PendingDeliveryNoteDto } from '../../services/stockIssueNoteService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { TRIGGER_POLL_EVENT } from '../../hooks/useNotificationPolling';
import {
    Search,
    Plus,
    FileText,
    Truck,
    RefreshCw,
    Eye,
    Clock,
    CheckCircle2,
    X,
    Pencil,
    Trash2,
    Calendar,
    AlertTriangle,
    AlertCircle
} from 'lucide-react';


// --- Local Reusable Components ---

const StatCard: React.FC<{
    icon: React.ElementType;
    value: string | number;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-indigo-100 text-brand-primary',
        success: 'bg-emerald-100 text-brand-primary',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-brand-primary',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <div className="w-full p-5 rounded-2xl border transition-all duration-300 group text-right bg-white border-slate-100 hover:shadow-lg hover:border-indigo-500/20">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${colorClasses[color]} group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <div className="text-2xl font-bold text-slate-800">
                        {value}
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
            border: 'border-brand-primary/20',
            icon: Truck
        },
        'Delivered': {
            label: 'تم التوصيل',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Completed': {
            label: 'مكتمل',
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
            icon: X
        },
        'Approved': {
            label: 'معتمد',
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-brand-primary/20',
            icon: CheckCircle2
        },
        'Draft': {
            label: 'مسودة',
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            border: 'border-slate-200',
            icon: FileText
        },
        'Rejected': {
            label: 'مرفوض',
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200',
            icon: AlertCircle
        }
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

const PendingNoteCard: React.FC<{
    note: PendingDeliveryNoteDto;
    index: number;
    onAction: (note: PendingDeliveryNoteDto) => void;
}> = ({ note, index, onAction }) => {
    const isDueToday = note.deliveryDate?.startsWith(new Date().toISOString().split('T')[0]);

    return (
        <div
            className={`bg-white p-6 rounded-2xl border-2 shadow-sm hover:shadow-lg 
                transition-all duration-300 flex flex-col group relative overflow-hidden
                ${isDueToday ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 hover:border-brand-primary/20'}`}
            style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.4s ease-out forwards'
            }}
        >
            {isDueToday && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500 animate-pulse" />
            )}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDueToday ? 'bg-rose-100 text-rose-600' : 'bg-brand-primary/10 text-brand-primary'} group-hover:scale-110 transition-transform duration-300`}>
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-primary transition-colors">
                                {note.issueNoteNumber}
                            </h3>
                            {isDueToday && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse shadow-sm shadow-rose-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    توصيل اليوم
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm">{note.customerNameAr || 'عميل غير محدد'}</p>
                    </div>
                </div>
                <StatusBadge status={note.status} />
            </div>

            <div className="space-y-3 mb-4 flex-1">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">رقم أمر البيع</span>
                    </div>
                    <span className="font-bold text-brand-primary">
                        {note.soNumber || '—'}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 text-brand-primary">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">تاريخ الإذن</span>
                    </div>
                    <span className="font-bold text-blue-700">
                        {formatDate(note.issueDate)}
                    </span>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-xl ${isDueToday ? 'bg-rose-100/50' : 'bg-purple-50'}`}>
                    <div className={`flex items-center gap-2 ${isDueToday ? 'text-rose-600' : 'text-purple-600'}`}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">موعد التوصيل المتوقع</span>
                    </div>
                    <span className={`font-bold ${isDueToday ? 'text-rose-700' : 'text-purple-700'}`}>
                        {formatDate(note.deliveryDate)} {isDueToday && '(اليوم)'}
                    </span>
                </div>

                {note.scheduleId && (
                    <div className="p-3 rounded-xl border-2 bg-amber-50 border-amber-200">
                        <div className="flex items-center gap-2 text-amber-700">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-bold">توصيل مجدول (جزء من أمر بيع)</span>
                        </div>
                    </div>
                )}
            </div>

            <div className={`pt-4 border-t ${isDueToday ? 'border-rose-100' : 'border-slate-100'} flex items-center justify-between`}>
                <div className="text-sm text-slate-500 font-medium">
                    {note.itemsCount} أصناف
                </div>
                <button
                    onClick={() => onAction(note)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-105 active:scale-95
                        ${isDueToday
                            ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700'
                            : 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-primary/90'}`}
                >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء أمر توصيل</span>
                </button>
            </div>
        </div>
    );
};


const DeliveryOrderListPage: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<DeliveryOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'waiting'>('orders');
    const [pendingNotes, setPendingNotes] = useState<PendingDeliveryNoteDto[]>([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<DeliveryOrderDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await deliveryOrderService.getAll();
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل أوامر التوصيل');
            setOrders([]);
        } finally { setLoading(false); }
    };

    const fetchPendingNotes = async () => {
        try {
            setPendingLoading(true);
            const data = await stockIssueNoteService.getPendingDeliveryNotes();
            setPendingNotes(Array.isArray(data) ? data : []);
            window.dispatchEvent(new CustomEvent(TRIGGER_POLL_EVENT));
        } catch (e) {
            toast.error('فشل تحميل أذونات الصرف المعلقة');
            setPendingNotes([]);
        } finally { setPendingLoading(false); }
    };

    useEffect(() => {
        fetchOrders();
        fetchPendingNotes();
    }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleDeleteClick = (order: DeliveryOrderDto) => {
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
            await deliveryOrderService.delete(orderToDelete.id);
            toast.success('تم حذف أمر التوصيل');
            await fetchOrders();
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'فشل الحذف');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredOrders = useMemo(() => {
        const f = orders.filter((d) =>
            !searchTerm ||
            (d.deliveryOrderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.customerNameAr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (d.driverName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        return [...f].sort((a, b) => {
            const dateA = (a.orderDate || a.createdAt) ? new Date(a.orderDate || a.createdAt!).getTime() : 0;
            const dateB = (b.orderDate || b.createdAt) ? new Date(b.orderDate || b.createdAt!).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [orders, searchTerm]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, currentPage, pageSize]);

    const stats = useMemo(() => {
        const total = orders.length;
        const pending = orders.filter(d => d.status === 'Pending').length;
        const inTransit = orders.filter(d => d.status === 'InTransit').length;
        const delivered = orders.filter(d => d.status === 'Delivered').length;
        return { total, pending, inTransit, delivered };
    }, [orders]);

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
                            <Truck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أوامر التوصيل</h1>
                            <p className="text-white/80 text-lg">إدارة أوامر التوصيل المرتبطة بإذن الصرف</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={activeTab === 'orders' ? fetchOrders : fetchPendingNotes}
                            disabled={loading || pendingLoading}
                            className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-xl transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading || pendingLoading ? 'animate-spin' : ''}`} />
                        </button>
                        {activeTab === 'orders' && (
                            <button
                                onClick={() => navigate('/dashboard/sales/delivery-orders/new')}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl
                                font-bold shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                <span>أمر توصيل جديد</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white w-fit rounded-2xl border border-slate-100 shadow-sm">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'orders'
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Truck className="w-4 h-4" />
                    <span>أوامر التوصيل</span>
                    {orders.length > 0 && (
                        <span className={`mr-2 px-2 py-0.5 text-xs rounded-full ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {orders.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('waiting')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'waiting'
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    <span>في انتظار التوصيل</span>
                    {pendingNotes.length > 0 && (
                        <span className={`mr-2 px-2 py-0.5 text-xs rounded-full ${activeTab === 'waiting' ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
                            {pendingNotes.length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'orders' ? (
                <>
                    {/* Warning Banner for Today's Deliveries (also shown on this tab for awareness) */}
                    {pendingNotes.some(note => note.deliveryDate?.startsWith(new Date().toISOString().split('T')[0])) && (
                        <div className="mb-6 bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 animate-pulse shadow-sm cursor-pointer"
                            onClick={() => setActiveTab('waiting')}>
                            <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div className="flex-1 text-center md:text-right">
                                <h3 className="text-xl font-bold text-rose-800 mb-1">تنبيه: يوجد توصيلات مجدولة لليوم!</h3>
                                <p className="text-rose-600">يوجد أذنات صرف موعد توصيلها المتوقع هو اليوم بانتظار إنشاء أوامر التوصيل الخاصة بها.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl font-bold border border-rose-200">
                                {pendingNotes.filter(note => note.deliveryDate?.startsWith(new Date().toISOString().split('T')[0])).length} توصيلات
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard icon={FileText} value={stats.total} label="إجمالي الأوامر" color="blue" />
                        <StatCard icon={Clock} value={stats.pending} label="قيد الانتظار" color="warning" />
                        <StatCard icon={Truck} value={stats.inTransit} label="في الطريق" color="primary" />
                        <StatCard icon={CheckCircle2} value={stats.delivered} label="تم تسليمها" color="success" />
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5
                                    transition-colors duration-200
                                    ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                                <input
                                    type="text"
                                    placeholder="بحث برقم الأمر أو اسم السائق..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200
                                        outline-none bg-slate-50
                                        ${isSearchFocused
                                            ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-500/10'
                                            : 'border-transparent hover:border-slate-200'}`}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100
                                            rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                )}
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
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">السائق</th>
                                        <th className="px-6 py-4 text-sm font-bold text-slate-700">المركبة</th>
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
                                                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                                                <td className="px-6 py-4"><div className="h-7 w-16 bg-slate-200 rounded-full" /></td>
                                                <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-200 rounded-lg ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-20">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                        <Truck className="w-10 h-10 text-blue-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500 font-semibold">لا توجد نتائج</p>
                                                        <p className="text-slate-400 text-sm mt-1">جرب تغيير معايير البحث</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedOrders.map((o, index) => (
                                            <tr
                                                key={o.id}
                                                onClick={() => navigate(`/dashboard/sales/delivery-orders/${o.id}?mode=view`)}
                                                className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0 cursor-pointer"
                                                style={{
                                                    animationDelay: `${index * 30}ms`,
                                                    animation: 'fadeInUp 0.3s ease-out forwards'
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10
                                                            rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Truck className="w-5 h-5 text-brand-primary" />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                                                            {o.deliveryOrderNumber || '—'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {o.orderDate ? formatDate(o.orderDate) : (o.createdAt ? formatDate(o.createdAt) : '—')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-800 font-bold">
                                                    {o.customerNameAr || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {o.driverName || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {o.vehicleNo || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={o.status || 'Pending'} />
                                                </td>
                                                <td className="px-6 py-4 text-left">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/delivery-orders/${o.id}?mode=view`); }}
                                                            className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                            title="عرض التفاصيل"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        {(o.status === 'Draft' || o.status === 'Pending' || o.status === 'Rejected') && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/delivery-orders/${o.id}`); }}
                                                                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-emerald-50 rounded-lg transition-all"
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
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {!loading && filteredOrders.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredOrders.length}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                            />
                        )}
                    </div>
                </>
            ) : (
                /* Waiting for Delivery Content */
                <div className="space-y-6">
                    {/* Warning Banner for Today's Deliveries */}
                    {pendingNotes.some(note => note.deliveryDate?.startsWith(new Date().toISOString().split('T')[0])) && (
                        <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 animate-pulse shadow-sm">
                            <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-200">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div className="flex-1 text-center md:text-right">
                                <h3 className="text-xl font-bold text-rose-800 mb-1">تنبيه: يوجد توصيلات مجدولة لليوم!</h3>
                                <p className="text-rose-600">يوجد أذنات صرف موعد توصيلها المتوقع هو اليوم بانتظار إنشاء أوامر التوصيل الخاصة بها.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl font-bold border border-rose-200">
                                {pendingNotes.filter(note => note.deliveryDate?.startsWith(new Date().toISOString().split('T')[0])).length} توصيلات
                            </div>
                        </div>
                    )}

                    {/* Filters & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="بحث برقم الإذن، العميل، أو رقم أمر البيع..."
                                className="block w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchPendingNotes}
                            className="p-2 text-gray-500 hover:text-brand-primary dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                            title="تحديث"
                        >
                            <RefreshCw className={`w-6 h-6 ${pendingLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {pendingLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                                    <div className="space-y-3">
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : pendingNotes.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">لا توجد أذونات صرف في انتظار التوصيل حالياً</h3>
                            <p className="text-gray-500 dark:text-gray-400">تظهر هنا أذونات الصرف المعتمدة التي لم يتم إنشاء أمر توصيل لها بعد.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingNotes
                                .filter(note =>
                                    note.issueNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (note.customerNameAr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (note.soNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((note, idx) => (
                                    <PendingNoteCard
                                        key={note.scheduleId ? `note-${note.issueNoteId}-sch-${note.scheduleId}` : `note-${note.issueNoteId}`}
                                        note={note}
                                        index={idx}
                                        onAction={(n) => navigate(`/dashboard/sales/delivery-orders/new?issueNoteId=${n.issueNoteId}${n.scheduleId ? `&scheduleId=${n.scheduleId}` : ''}`)}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف أمر التوصيل"
                message={`هل أنت متأكد من حذف أمر التوصيل ${orderToDelete?.deliveryOrderNumber || ''}؟`}
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

export default DeliveryOrderListPage;
