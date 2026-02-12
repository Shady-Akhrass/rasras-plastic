import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    CheckCircle2,
    Clock,
    Filter,
    ShoppingCart,
    X,
    Eye,
    TrendingUp,
    RefreshCw,
    DollarSign,
    Trash2
} from 'lucide-react';
import { purchaseOrderService, type PurchaseOrderDto } from '../../services/purchaseOrderService';
import Pagination from '../../components/common/Pagination';
import { formatNumber, formatDate } from '../../utils/format';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

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
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
        'Draft': {
            icon: FileText,
            className: 'bg-slate-50 text-slate-700 border-slate-200',
            label: 'مسودة'
        },
        'Pending': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'قيد الاعتماد'
        },
        'PartiallyReceived': {
            icon: TrendingUp,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'استلام جزئي'
        },
        'Received': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'تم الاستلام'
        },
        'Closed': {
            icon: CheckCircle2,
            className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
            label: 'مغلق'
        },
        'Approved': {
            icon: CheckCircle2,
            className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            label: 'معتمد'
        },
        'Confirmed': {
            icon: CheckCircle2,
            className: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
            label: 'مؤكد'
        }
    };

    const { icon: Icon, className, label } = config[status] || config['Draft'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Table Row Component
const POTableRow: React.FC<{
    order: PurchaseOrderDto;
    index: number;
    onView: (id: number) => void;
    onDelete: (order: PurchaseOrderDto) => void;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
}> = ({ order, index, onView, onDelete, isSelected, onToggleSelect }) => (
    <tr
        className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-4 py-4 text-center">
            <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                checked={isSelected}
                onChange={() => order.id && onToggleSelect(order.id)}
            />
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                    {order.poNumber}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(order.poDate!)}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-slate-700">
            {order.supplierNameAr}
        </td>
        <td className="px-6 py-4 text-right">
            <span className="font-bold text-emerald-600">
                {formatNumber(order.totalAmount)} {order.currency}
            </span>
        </td>
        <td className="px-6 py-4 text-center font-bold text-blue-600">
            {(order.shippingCost || 0).toLocaleString()}
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={order.status!} />
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => onView(order.id!)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="عرض التفاصيل"
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(order)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="حذف"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
);

// Loading Skeleton
const TableSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                <td className="px-4 py-4 text-center">
                    <div className="w-4 h-4 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div className="h-4 w-20 bg-slate-100 rounded" />
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-slate-100 rounded ml-auto" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </td>
                <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string; statusFilter: string }> = ({ searchTerm, statusFilter }) => (
    <tr>
        <td colSpan={8} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm || statusFilter !== 'All' ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <ShoppingCart className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm || statusFilter !== 'All' ? 'لا توجد نتائج' : 'لا توجد أوامر شراء'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'All'
                        ? 'لم يتم العثور على أوامر تطابق معايير البحث'
                        : 'لم يتم إنشاء أي أوامر شراء بعد'}
                </p>
            </div>
        </td>
    </tr>
);

const PurchaseOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<PurchaseOrderDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const prIdFilter = queryParams.get('prId');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await purchaseOrderService.getAllPOs();
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = useMemo(() => {
        const filtered = orders.filter(o => {
            const matchesSearch =
                o.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
            const matchesPR = !prIdFilter || o.prId === parseInt(prIdFilter);
            return matchesSearch && matchesStatus && matchesPR;
        });
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => {
            const dateA = a.poDate ? new Date(a.poDate).getTime() : 0;
            const dateB = b.poDate ? new Date(b.poDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [orders, searchTerm, statusFilter, prIdFilter]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, prIdFilter]);

    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => o.status === 'Draft' || o.status === 'Pending').length,
        active: orders.filter(o => o.status === 'PartiallyReceived').length,
        totalValue: formatNumber(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))
    }), [orders]);

    const handleViewOrder = (id: number) => {
        navigate(`/dashboard/procurement/po/${id}`);
    };

    const handleDeleteClick = (order: PurchaseOrderDto) => {
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAllPage = () => {
        const pageIds = paginatedOrders.map(o => o.id!).filter(Boolean);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('يرجى اختيار أوامر شراء أولاً');
            return;
        }
        setOrderToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const idsToDelete = orderToDelete?.id ? [orderToDelete.id] : selectedIds;
        if (!idsToDelete.length) return;
        setIsDeleting(true);
        try {
            for (const id of idsToDelete) {
                await purchaseOrderService.deletePO(id);
            }
            toast.success(idsToDelete.length === 1 ? "تم حذف أمر الشراء بنجاح" : "تم حذف أوامر الشراء بنجاح");
            await fetchOrders();
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
            setSelectedIds([]);
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message as string | undefined;
            toast.error(apiMessage || 'فشل حذف أمر الشراء');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Custom Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            {/* Header Section */}
            {prIdFilter && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <Filter className="w-4 h-4" />
                        <span>عرض أوامر الشراء المرتبطة بطلب الشراء رقم: {orders.find(o => o.prId === parseInt(prIdFilter))?.prId || prIdFilter}</span>
                    </div>
                    <button onClick={() => navigate('/dashboard/procurement/po')} className="p-1 hover:bg-amber-100 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أوامر الشراء</h1>
                            <p className="text-white/70 text-lg">إدارة وتتبع طلبات التوريد الرسمية للموردين</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/po/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إنشاء أمر شراء</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    value={stats.total}
                    label="إجمالي الأوامر"
                    color="primary"
                />
                <StatCard
                    icon={Clock}
                    value={stats.pending}
                    label="قيد المعالجة"
                    color="warning"
                />
                <StatCard
                    icon={RefreshCw}
                    value={stats.active}
                    label="استلامات جارية"
                    color="blue"
                />
                <StatCard
                    icon={DollarSign}
                    value={`${stats.totalValue} ج.م`}
                    label="قيمة المشتريات"
                    color="success"
                />
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
                            placeholder="بحث برقم الأمر أو المورد..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
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

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent
                            hover:border-slate-200 transition-all duration-200">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                            >
                                <option value="All">جميع الحالات</option>
                                <option value="Draft">مسودة</option>
                                <option value="Pending">قيد الاعتماد</option>
                                <option value="PartiallyReceived">استلام جزئي</option>
                                <option value="Received">تم الاستلام</option>
                                <option value="Approved">معتمد</option>
                                <option value="Confirmed">مؤكد</option>
                                <option value="Closed">مغلق</option>
                            </select>
                        </div>

                        <button
                            onClick={fetchOrders}
                            disabled={loading}
                            className="p-3 rounded-xl border border-slate-200 text-slate-600 
                                hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                                disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredOrders.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{orders.length}</span> أمر شراء
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                        checked={
                                            paginatedOrders.length > 0 &&
                                            paginatedOrders.every(o => o.id && selectedIds.includes(o.id))
                                        }
                                        onChange={handleToggleSelectAllPage}
                                    />
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم الأمر</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المورد</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الإجمالي</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">مصاريف الشحن</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredOrders.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
                            ) : (
                                paginatedOrders.map((order, index) => (
                                    <POTableRow
                                        key={order.id}
                                        order={order}
                                        index={index}
                                        onView={handleViewOrder}
                                        onDelete={handleDeleteClick}
                                        isSelected={!!order.id && selectedIds.includes(order.id)}
                                        onToggleSelect={handleToggleSelect}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredOrders.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBulkDeleteClick}
                                disabled={selectedIds.length === 0 || isDeleting}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                                    border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                حذف المحدد ({selectedIds.length})
                            </button>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredOrders.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف أمر الشراء"
                message={
                    orderToDelete
                        ? `هل أنت متأكد من حذف أمر الشراء رقم ${orderToDelete.poNumber}؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن التراجع عن هذه الخطوة.`
                        : `هل أنت متأكد من حذف عدد ${selectedIds.length} من أوامر الشراء؟ سيتم حذف جميع البيانات المرتبطة بها ولا يمكن التراجع عن هذه الخطوة.`
                }
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

export default PurchaseOrdersPage;