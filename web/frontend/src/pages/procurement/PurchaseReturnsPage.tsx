import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    CheckCircle2,
    Clock,
    RefreshCw,
    DollarSign,
    Undo2,
    AlertCircle,
    Eye,
    Truck,
    X,
    Filter,
    Trash2
} from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/format';
import { purchaseReturnService, type PurchaseReturnDto } from '../../services/purchaseReturnService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { useSystemSettings } from '../../hooks/useSystemSettings';


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
        'Approved': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'معتمد'
        },
        'Rejected': {
            icon: AlertCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'مرفوض'
        },
        'SentToSupplier': {
            icon: Truck,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'أرسل للمورد'
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
const ReturnTableRow: React.FC<{
    returnItem: PurchaseReturnDto;
    index: number;
    onView: (id: number) => void;
    onDelete: (returnItem: PurchaseReturnDto) => void;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    getCurrencyLabel: (currency: string) => string;
    defaultCurrency: string;
    convertAmount: (amount: number, from: string) => number;
}> = ({ returnItem, index, onView, onDelete, isSelected, onToggleSelect, getCurrencyLabel, defaultCurrency, convertAmount }) => (

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
                onChange={() => returnItem.id && onToggleSelect(returnItem.id)}
            />
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Undo2 className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                    #{returnItem.returnNumber}
                </span>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{returnItem.supplierNameAr}</span>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className="text-sm font-mono text-slate-500">
                #{returnItem.grnNumber || 'N/A'}
            </span>
        </td>
        <td className="px-6 py-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(returnItem.returnDate)}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-right">
            <span className="font-bold text-rose-600">
                {formatNumber(convertAmount(returnItem.totalAmount || 0, returnItem.currency || 'EGP'))} {getCurrencyLabel(defaultCurrency)}
            </span>
        </td>

        <td className="px-6 py-4 text-center">
            <StatusBadge status={returnItem.status!} />
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={() => onView(returnItem.id!)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="عرض التفاصيل"
                >
                    <Eye className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(returnItem)}
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
                <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded ml-auto" /></td>
                <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-full mx-auto" /></td>
                <td className="px-6 py-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg" />
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
                        <Undo2 className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm || statusFilter !== 'All' ? 'لا توجد نتائج' : 'لا توجد مرتجعات شراء'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'All'
                        ? 'لم يتم العثور على مرتجعات تطابق معايير البحث'
                        : 'لا توجد مرتجعات مشتريات حالياً'}
                </p>
            </div>
        </td>
    </tr>
);

const PurchaseReturnsPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [returns, setReturns] = useState<PurchaseReturnDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [returnToDelete, setReturnToDelete] = useState<PurchaseReturnDto | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const data = await purchaseReturnService.getAllReturns();
            setReturns(data.data || []);
        } catch (error) {
            console.error('Failed to fetch returns:', error);
            toast.error('فشل تحميل مرتجعات الشراء');
        } finally {
            setLoading(false);
        }
    };

    const filteredReturns = useMemo(() => {
        const filtered = returns.filter(r => {
            const matchesSearch =
                r.returnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => {
            const dateA = a.returnDate ? new Date(a.returnDate).getTime() : 0;
            const dateB = b.returnDate ? new Date(b.returnDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [returns, searchTerm, statusFilter]);

    const paginatedReturns = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredReturns.slice(start, start + pageSize);
    }, [filteredReturns, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: returns.length,
        pending: returns.filter(r => r.status === 'Draft' || r.status === 'Pending').length,
        approved: returns.filter(r => r.status === 'Approved').length,
        totalValue: formatNumber(returns.reduce((sum, r) => sum + convertAmount(r.totalAmount || 0, r.currency || 'EGP'), 0))
    }), [returns, defaultCurrency, convertAmount]);


    const handleViewReturn = (id: number) => {
        navigate(`/dashboard/procurement/returns/${id}`);
    };

    const handleDeleteClick = (returnItem: PurchaseReturnDto) => {
        setReturnToDelete(returnItem);
        setIsDeleteModalOpen(true);
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAllPage = () => {
        const pageIds = paginatedReturns.map(r => r.id!).filter(Boolean);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('يرجى اختيار مرتجعات شراء أولاً');
            return;
        }
        setReturnToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const idsToDelete = returnToDelete?.id ? [returnToDelete.id] : selectedIds;
        if (!idsToDelete.length) return;
        setIsDeleting(true);
        try {
            for (const id of idsToDelete) {
                await purchaseReturnService.deleteReturn(id);
            }
            toast.success(idsToDelete.length === 1 ? 'تم حذف مرتجع الشراء بنجاح' : 'تم حذف مرتجعات الشراء بنجاح');
            fetchReturns();
            setIsDeleteModalOpen(false);
            setReturnToDelete(null);
            setSelectedIds([]);
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message as string | undefined;
            toast.error(apiMessage || 'فشل حذف مرتجع الشراء');
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
                            <Undo2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">مرتجعات الشراء</h1>
                            <p className="text-white/70 text-lg">إدارة عمليات رد البضائع للموردين وتسوية الأرصدة</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/returns/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إنشاء طلب مرتجع</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    value={stats.total}
                    label="إجمالي المرتجعات"
                    color="primary"
                />
                <StatCard
                    icon={Clock}
                    value={stats.pending}
                    label="قيد المعالجة"
                    color="warning"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.approved}
                    label="مرتجعات معتمدة"
                    color="success"
                />
                <StatCard
                    icon={DollarSign}
                    value={`${stats.totalValue} ${getCurrencyLabel(defaultCurrency)}`}
                    label="إجمالي القيمة"
                    color="rose"
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
                            placeholder="بحث برقم المرتجع، المورد، أو رقم الإذن..."
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
                                <option value="Approved">معتمد</option>
                                <option value="Rejected">مرفوض</option>
                                <option value="SentToSupplier">أرسل للمورد</option>
                            </select>
                        </div>

                        <button
                            onClick={fetchReturns}
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

            {/* Results Count & Primary Table Container */}
            <div className="space-y-4">
                {!loading && returns.length > 0 && (
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                        <span className="text-slate-600">
                            عرض <span className="font-bold text-slate-800">{filteredReturns.length}</span> من{' '}
                            <span className="font-bold text-slate-800">{returns.length}</span> مرتجع شراء
                        </span>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                                    <th className="px-4 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                            checked={
                                                paginatedReturns.length > 0 &&
                                                paginatedReturns.every(r => r.id && selectedIds.includes(r.id))
                                            }
                                            onChange={handleToggleSelectAllPage}
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">رقم المرتجع</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">المورد</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">المستند المرجعي</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest">تاريخ المرتجع</th>
                                    <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي القيمة</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest">الحالة</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-slate-400 uppercase tracking-widest">التحكم</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <TableSkeleton />
                                ) : filteredReturns.length === 0 ? (
                                    <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
                                ) : (
                                    paginatedReturns.map((returnItem, index) => (
                                        <ReturnTableRow
                                            key={returnItem.id || index}
                                            returnItem={returnItem}
                                            index={index}
                                            onView={handleViewReturn}
                                            onDelete={handleDeleteClick}
                                            isSelected={!!returnItem.id && selectedIds.includes(returnItem.id)}
                                            onToggleSelect={handleToggleSelect}
                                            getCurrencyLabel={getCurrencyLabel}
                                            defaultCurrency={defaultCurrency}
                                            convertAmount={convertAmount}
                                        />

                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && filteredReturns.length > 0 && (
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
                                totalItems={filteredReturns.length}
                                pageSize={pageSize}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف مرتجع الشراء"
                message={
                    returnToDelete
                        ? `هل أنت متأكد من حذف مرتجع الشراء رقم ${returnToDelete.returnNumber}؟ سيتم حذف البيانات المرتبطة به. لا يمكن حذف مرتجع معتمد.`
                        : `هل أنت متأكد من حذف عدد ${selectedIds.length} من مرتجعات الشراء؟ سيتم حذف البيانات المرتبطة بها.`
                }
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setReturnToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default PurchaseReturnsPage;