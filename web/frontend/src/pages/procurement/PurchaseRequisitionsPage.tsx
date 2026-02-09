import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    User,
    Building2,
    Edit3,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    ShoppingCart,
    Package,
    Trash2,
    ChevronDown,
    ChevronUp,
    Send
} from 'lucide-react';
import purchaseService, { type PurchaseRequisition, type PRLifecycle } from '../../services/purchaseService';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/format';
import ConfirmModal from '../../components/common/ConfirmModal';
import PRLifecycleTracker from '../../components/procurement/PRLifecycleTracker';
import toast from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
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
        'Approved': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'معتمد'
        },
        'Rejected': {
            icon: XCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'مرفوض'
        },
        'Pending': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'قيد الانتظار'
        },
        'Draft': {
            icon: FileText,
            className: 'bg-slate-50 text-slate-700 border-slate-200',
            label: 'مسودة'
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

// Priority Badge Component
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    const config: Record<string, { className: string; label: string }> = {
        'High': {
            className: 'bg-rose-100 text-rose-800 border-rose-200',
            label: 'عالية'
        },
        'Normal': {
            className: 'bg-slate-100 text-slate-700 border-slate-200',
            label: 'عادية'
        },
        'Low': {
            className: 'bg-blue-100 text-blue-700 border-blue-200',
            label: 'منخفضة'
        }
    };

    const { className, label } = config[priority] || config['Normal'];

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${className}`}>
            {label}
        </span>
    );
};

// Table Row Component
const PRTableRow: React.FC<{
    pr: PurchaseRequisition;
    index: number;
    onView: (id: number) => void;
    onSubmit: (id: number) => void;
    onDelete: (pr: PurchaseRequisition) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    lifecycle: PRLifecycle | null;
    loadingLifecycle: boolean;
}> = ({ pr, index, onView, onSubmit, onDelete, isExpanded, onToggleExpand, lifecycle, loadingLifecycle }) => (
    <>
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
                        <FileText className="w-5 h-5 text-brand-primary" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                        #{pr.prNumber}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{formatDate(pr.prDate || '')}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{pr.requestedByUserName}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{pr.requestedByDeptName}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <PriorityBadge priority={pr.priority || 'Normal'} />
            </td>
            <td className="px-6 py-4">
                <StatusBadge status={pr.status || 'Draft'} />
            </td>
            {/* Added Missing Column for "Current Stage" matching header */}
            <td className="px-6 py-4">
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                   {pr.status === 'Approved' ? 'مكتمل' : 'قيد المراجعة'}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleExpand}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold 
                            bg-slate-50 text-slate-700 border border-slate-200 hover:bg-brand-primary/10 
                            hover:text-brand-primary hover:border-brand-primary/20 transition-all"
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isExpanded ? 'إخفاء' : 'تتبع'}</span>
                    </button>
                    
                    {/* Actions Container */}
                    <div className="flex items-center gap-1">
                        {pr.status === 'Draft' && (
                            <button
                                onClick={() => onSubmit(pr.id!)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 
                                    rounded-lg transition-all duration-200"
                                title="إرسال للاعتماد"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        )}
                        
                        {(pr.status === 'Draft' || pr.status === 'Pending' || pr.status === 'Rejected') && (
                            <button
                                onClick={() => onView(pr.id!)}
                                className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                                    rounded-lg transition-all duration-200"
                                title="تعديل"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        )}

                        {(pr.status === 'Draft' || pr.status === 'Rejected') && (
                            <button
                                onClick={() => onDelete(pr)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                                    rounded-lg transition-all duration-200"
                                title="حذف"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </td>
        </tr>
        {isExpanded && (
            <tr>
                <td colSpan={8} className="px-6 py-4 bg-slate-50/50">
                    {loadingLifecycle ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="w-6 h-6 text-brand-primary animate-spin" />
                            <span className="mr-3 text-slate-600">جاري تحميل بيانات التتبع...</span>
                        </div>
                    ) : lifecycle ? (
                        <PRLifecycleTracker lifecycle={lifecycle} prId={pr.id} />
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            لا توجد بيانات تتبع متاحة
                        </div>
                    )}
                </td>
            </tr>
        )}
    </>
);

// Loading Skeleton
const TableSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
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
                    <div className="h-4 w-28 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 w-16 bg-slate-100 rounded-full" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 w-24 bg-slate-100 rounded-full" />
                </td>
                <td className="px-6 py-4 text-left">
                    <div className="flex justify-end gap-2">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg" />
                        <div className="w-9 h-9 bg-slate-100 rounded-lg" />
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
                    {searchTerm || statusFilter !== 'All' ? 'لا توجد نتائج' : 'لا توجد طلبات شراء'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'All'
                        ? 'لم يتم العثور على طلبات تطابق معايير البحث'
                        : 'لم يتم إنشاء أي طلبات شراء بعد'}
                </p>
            </div>
        </td>
    </tr>
);

const PurchaseRequisitionsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [prs, setPrs] = useState<PurchaseRequisition[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [prToDelete, setPrToDelete] = useState<{ id: number; prNumber: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lifecycle tracking state
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [lifecycleData, setLifecycleData] = useState<Map<number, PRLifecycle>>(new Map());
    const [loadingLifecycle, setLoadingLifecycle] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchPRs();

        // Check if coming back from edit with success state
        if (location.state?.success) {
            setSuccessMessage(location.state.message || 'تم تحديث طلب الشراء بنجاح');
            setTimeout(() => setSuccessMessage(''), 4000);

            // Clear the state so message doesn't show on subsequent visits
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const fetchPRs = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllPRs();
            setPrs(data);
        } catch (error) {
            console.error('Failed to fetch PRs:', error);
            toast.error('فشل تحميل قائمة الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (id: number) => {
        try {
            await purchaseService.submitPR(id);
            toast.success('تم إرسال الطلب للاعتماد');
            fetchPRs();
        } catch (error) {
            toast.error('فشل إرسال الطلب');
        }
    };

    const handleToggleExpand = async (prId: number) => {
        const newExpandedRows = new Set(expandedRows);

        if (expandedRows.has(prId)) {
            // Collapse
            newExpandedRows.delete(prId);
            setExpandedRows(newExpandedRows);
        } else {
            // Expand
            newExpandedRows.add(prId);
            setExpandedRows(newExpandedRows);

            if (!lifecycleData.has(prId)) {
                // Fetch lifecycle data
                const newLoadingLifecycle = new Set(loadingLifecycle);
                newLoadingLifecycle.add(prId);
                setLoadingLifecycle(newLoadingLifecycle);

                try {
                    const lifecycle = await purchaseService.getPRLifecycle(prId);
                    const newLifecycleData = new Map(lifecycleData);
                    newLifecycleData.set(prId, lifecycle);
                    setLifecycleData(newLifecycleData);
                } catch (error) {
                    console.error('Failed to fetch lifecycle:', error);
                    toast.error('فشل تحميل بيانات التتبع');
                } finally {
                    const newLoadingLifecycle = new Set(loadingLifecycle);
                    newLoadingLifecycle.delete(prId);
                    setLoadingLifecycle(newLoadingLifecycle);
                }
            }
        }
    };

    const filteredPRs = useMemo(() => {
        const filtered = prs.filter(pr => {
            const matchesSearch =
                (pr.prNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (pr.requestedByUserName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (pr.requestedByDeptName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || pr.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => {
            const dateA = a.prDate ? new Date(a.prDate).getTime() : 0;
            const dateB = b.prDate ? new Date(b.prDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [prs, searchTerm, statusFilter]);

    const paginatedPRs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredPRs.slice(start, start + pageSize);
    }, [filteredPRs, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: prs.length,
        draft: prs.filter(p => p.status === 'Draft').length,
        pending: prs.filter(p => p.status === 'Pending').length,
        approved: prs.filter(p => p.status === 'Approved').length,
        rejected: prs.filter(p => p.status === 'Rejected').length,
        highPriority: prs.filter(p => p.priority === 'High').length,
    }), [prs]);

    const handleViewPR = (id: number) => {
        navigate(`/dashboard/procurement/pr/${id}`);
    };

    const handleDeleteClick = (pr: PurchaseRequisition) => {
        if (!pr.id) return;
        setPrToDelete({ id: pr.id, prNumber: pr.prNumber || '' });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!prToDelete) return;
        const idToDelete = prToDelete.id;
        setIsDeleting(true);
        try {
            await purchaseService.deletePR(idToDelete);
            setPrs(prev => prev.filter(p => p.id !== idToDelete));
            setIsDeleteModalOpen(false);
            setPrToDelete(null);
            toast.success('تم حذف عرض الشراء');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل حذف عرض الشراء');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
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
                            <h1 className="text-3xl font-bold mb-2">طلبات الشراء</h1>
                            <p className="text-white/70 text-lg">إدارة ومتابعة طلبات الشراء الداخلية</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/pr/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>طلب شراء جديد</span>
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 
                    px-6 py-4 rounded-2xl flex justify-between items-center 
                    animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <span className="font-bold block">{successMessage}</span>
                            <span className="text-sm text-emerald-600">تم التحديث بنجاح</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSuccessMessage('')}
                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Package} value={stats.total} label="إجمالي الطلبات" color="primary" />
                <StatCard icon={FileText} value={stats.draft} label="مسودة" color="blue" />
                <StatCard icon={Clock} value={stats.pending} label="قيد الانتظار" color="warning" />
                <StatCard icon={CheckCircle2} value={stats.approved} label="معتمد" color="success" />
                <StatCard icon={XCircle} value={stats.rejected} label="مرفوض" color="rose" />
                <StatCard icon={AlertCircle} value={stats.highPriority} label="أولوية عالية" color="purple" />
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
                            placeholder="بحث برقم الطلب، اسم الطالب، أو القسم..."
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
                                <XCircle className="w-4 h-4 text-slate-400" />
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
                                <option value="Pending">قيد الانتظار</option>
                                <option value="Approved">معتمد</option>
                                <option value="Rejected">مرفوض</option>
                            </select>
                        </div>

                        <button
                            onClick={fetchPRs}
                            disabled={loading}
                            className="p-3 rounded-xl border border-slate-200 text-slate-600 
                                hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                                disabled:opacity-50"
                            title="تحديث البيانات"
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
                        عرض <span className="font-bold text-slate-800">{filteredPRs.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{prs.length}</span> طلب شراء
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم الطلب</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">تاريخ الطلب</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الطالب</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">القسم</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الأولوية</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المرحلة الحالية</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredPRs.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
                            ) : (
                                paginatedPRs.map((pr, index) => (
                                    <PRTableRow
                                        key={pr.id}
                                        pr={pr}
                                        index={index}
                                        onView={handleViewPR}
                                        onSubmit={handleSubmit}
                                        onDelete={handleDeleteClick}
                                        isExpanded={expandedRows.has(pr.id!)}
                                        onToggleExpand={() => handleToggleExpand(pr.id!)}
                                        lifecycle={lifecycleData.get(pr.id!) || null}
                                        loadingLifecycle={loadingLifecycle.has(pr.id!)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredPRs.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredPRs.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                )}
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف طلب الشراء"
                message={prToDelete
                    ? `هل أنت متأكد من حذف طلب الشراء رقم ${prToDelete.prNumber}؟ سيتم حذفه نهائياً.`
                    : ''}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setPrToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default PurchaseRequisitionsPage;