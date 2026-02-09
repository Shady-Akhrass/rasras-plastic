import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    FileText,
    Scale,
    Trophy,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    RefreshCw,
    X,
    Edit3,
    Trash2
} from 'lucide-react';
import purchaseService, { type QuotationComparison } from '../../services/purchaseService';
import Pagination from '../../components/common/Pagination';
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
        'Pending Finance': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'مراجعة مالية'
        },
        'Pending Management': {
            icon: Clock,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'اعتماد الإدارة'
        },
        'Pending Approval': {
            icon: Clock,
            className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            label: 'بانتظار الاعتماد'
        },
        'Approved': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'معتمد'
        },
        'Rejected': {
            icon: XCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'مرفوض'
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
const ComparisonTableRow: React.FC<{
    comparison: QuotationComparison;
    index: number;
    onView: (id: number) => void;
    onDelete: (comparison: QuotationComparison) => void;
}> = ({ comparison, index, onView, onDelete }) => (
    <tr
        className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Scale className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors block">
                        {comparison.comparisonNumber || 'بدون رقم'}
                    </span>
                    {comparison.prNumber && (
                        <span className="text-xs text-slate-400">طلب شراء #{comparison.prNumber}</span>
                    )}
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <span className="text-sm font-medium text-slate-700">{comparison.itemNameAr || '-'}</span>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-bold">
                {comparison.details?.length || 0}
            </span>
        </td>
        <td className="px-6 py-4">
            {comparison.selectedSupplierNameAr ? (
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">{comparison.selectedSupplierNameAr}</span>
                </div>
            ) : (
                <span className="text-sm text-slate-400">لم يتم الاختيار</span>
            )}
        </td>
        <td className="px-6 py-4">
            <StatusBadge status={comparison.status!} />
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => onView(comparison.id!)}
                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                    title="تعديل"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(comparison)}
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
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg" />
                        <div>
                            <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                            <div className="h-3 w-20 bg-slate-50 rounded" />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-8 bg-slate-100 rounded-full mx-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full" /></td>
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
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <tr>
        <td colSpan={6} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <Scale className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا توجد مقارنات'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على مقارنات تطابق "${searchTerm}"`
                        : 'ابدأ بإنشاء مقارنة جديدة لعروض الأسعار'}
                </p>
            </div>
        </td>
    </tr>
);

const QuotationComparisonPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [comparisons, setComparisons] = useState<QuotationComparison[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [comparisonToDelete, setComparisonToDelete] = useState<QuotationComparison | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchComparisons();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchComparisons = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllComparisons();
            setComparisons(data);
        } catch (error) {
            console.error('Failed to fetch comparisons:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredComparisons = useMemo(() => {
        const filtered = comparisons.filter(comp => {
            return comp.itemNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comp.prNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comp.selectedSupplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comp.comparisonNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        });
        // الأحدث فوق والأقدم تحت
        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [comparisons, searchTerm]);

    const paginatedComparisons = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredComparisons.slice(start, start + pageSize);
    }, [filteredComparisons, currentPage, pageSize]);

    const stats = useMemo(() => ({
        total: comparisons.length,
        draft: comparisons.filter(c => c.status === 'Draft').length,
        pending: comparisons.filter(c => c.status === 'Pending Finance' || c.status === 'Pending Management').length,
        approved: comparisons.filter(c => c.status === 'Approved').length,
    }), [comparisons]);

    const handleView = (id: number) => {
        navigate(`/dashboard/procurement/comparison/${id}`);
    };

    const handleDeleteClick = (comparison: QuotationComparison) => {
        setComparisonToDelete(comparison);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!comparisonToDelete?.id) return;
        setIsDeleting(true);
        try {
            await purchaseService.deleteComparison(comparisonToDelete.id);
            toast.success('تم حذف مقارنة العروض بنجاح');
            fetchComparisons();
            setIsDeleteModalOpen(false);
            setComparisonToDelete(null);
        } catch (error) {
            toast.error('فشل حذف مقارنة العروض');
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
                            <Scale className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">مقارنة عروض الأسعار</h1>
                            <p className="text-white/70 text-lg">تحليل العروض المقدمة واختيار المورد الأفضل</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/comparison/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>مقارنة جديدة</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Scale}
                    value={stats.total}
                    label="إجمالي المقارنات"
                    color="primary"
                />
                <StatCard
                    icon={FileText}
                    value={stats.draft}
                    label="مسودات"
                    color="blue"
                />
                <StatCard
                    icon={Clock}
                    value={stats.pending}
                    label="قيد المراجعة"
                    color="warning"
                />
                <StatCard
                    icon={Trophy}
                    value={stats.approved}
                    label="معتمد"
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
                            placeholder="بحث باسم الصنف، رقم الطلب، المورد، أو رقم المقارنة..."
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

                    <button
                        onClick={fetchComparisons}
                        disabled={loading}
                        className="p-3 rounded-xl border border-slate-200 text-slate-600 
                            hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                            disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredComparisons.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{comparisons.length}</span> مقارنة
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم المقارنة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الصنف</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">عدد العروض</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المورد المختار</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredComparisons.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} />
                            ) : (
                                paginatedComparisons.map((comparison, index) => (
                                    <ComparisonTableRow
                                        key={comparison.id}
                                        comparison={comparison}
                                        index={index}
                                        onView={handleView}
                                        onDelete={handleDeleteClick}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredComparisons.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredComparisons.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف مقارنة العروض"
                message={`هل أنت متأكد من حذف مقارنة العروض رقم ${comparisonToDelete?.comparisonNumber}؟ سيتم حذف جميع البيانات المرتبطة بها ولا يمكن التراجع عن هذه الخطوة.`}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setComparisonToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default QuotationComparisonPage;