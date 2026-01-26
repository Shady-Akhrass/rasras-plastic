import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    FileText,
    Scale,
    Trophy,
    Award,
    Zap,
    ShoppingCart,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    RefreshCw,
    X,
    TrendingUp,
    Package
} from 'lucide-react';
import purchaseService, { type QuotationComparison } from '../../services/purchaseService';

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
            icon: Award,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'اعتماد الإدارة'
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

// Comparison Card Component
const ComparisonCard: React.FC<{
    comparison: QuotationComparison;
    index: number;
    onView: (id: number) => void;
    onCreatePO: (compId: number, quotId: number) => void;
    onSubmit: (id: number) => void;
    onFinanceReview: (id: number, userId: number, approved: boolean) => void;
    onManagementApprove: (id: number, userId: number, approved: boolean) => void;
}> = ({ comparison, index, onView, onCreatePO, onSubmit, onFinanceReview, onManagementApprove }) => (
    <div
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 flex flex-col group"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.4s ease-out forwards'
        }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary 
                group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-6 h-6" />
            </div>
            <StatusBadge status={comparison.status!} />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-brand-primary transition-colors">
            {comparison.itemNameAr}
        </h3>
        <p className="text-sm text-slate-500 mb-4">طلب شراء #{comparison.prNumber}</p>

        <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 font-medium">عدد العروض:</span>
                <span className="font-bold text-slate-700">{comparison.details?.length || 0} موردين</span>
            </div>
            {comparison.selectedSupplierNameAr && (
                <div className="flex flex-col gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                            <Trophy className="w-4 h-4" />
                            المورد الفائز:
                        </span>
                        <span className="text-emerald-700 font-bold">{comparison.selectedSupplierNameAr}</span>
                    </div>
                </div>
            )}
        </div>

        <div className="flex flex-col gap-3 mt-auto">
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => onView(comparison.id!)}
                    className="py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 
                        transition-all flex items-center justify-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    التفاصيل
                </button>
                {comparison.status === 'Approved' && comparison.selectedQuotationId && (
                    <button
                        onClick={() => onCreatePO(comparison.id!, comparison.selectedQuotationId!)}
                        className="py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 
                            transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        أمر شراء
                    </button>
                )}
            </div>

            {comparison.status === 'Draft' && (
                <button
                    onClick={() => onSubmit(comparison.id!)}
                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 
                        transition-all shadow-lg shadow-amber-500/20"
                >
                    رفع للمراجعة المالية
                </button>
            )}

            {comparison.status === 'Pending Finance' && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onFinanceReview(comparison.id!, 1, true)}
                        className="py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-bold 
                            shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                    >
                        موافقة مالية
                    </button>
                    <button
                        onClick={() => onFinanceReview(comparison.id!, 1, false)}
                        className="py-2.5 bg-rose-500 text-white rounded-lg text-sm font-bold 
                            shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                    >
                        رفض
                    </button>
                </div>
            )}

            {comparison.status === 'Pending Management' && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onManagementApprove(comparison.id!, 1, true)}
                        className="py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold 
                            shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all"
                    >
                        اعتماد الإدارة
                    </button>
                    <button
                        onClick={() => onManagementApprove(comparison.id!, 1, false)}
                        className="py-2.5 bg-rose-500 text-white rounded-lg text-sm font-bold 
                            shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                    >
                        رفض
                    </button>
                </div>
            )}
        </div>
    </div>
);

// Loading Skeleton
const CardSkeleton: React.FC = () => (
    <>
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="h-6 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
                <div className="space-y-3 mb-6">
                    <div className="h-12 bg-slate-50 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
            </div>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
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
);

const QuotationComparisonPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [comparisons, setComparisons] = useState<QuotationComparison[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchComparisons();
    }, []);

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
        return comparisons.filter(comp => {
            return comp.itemNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comp.prNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comp.selectedSupplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [comparisons, searchTerm]);

    const stats = useMemo(() => ({
        total: comparisons.length,
        draft: comparisons.filter(c => c.status === 'Draft').length,
        pending: comparisons.filter(c => c.status === 'Pending Finance' || c.status === 'Pending Management').length,
        approved: comparisons.filter(c => c.status === 'Approved').length,
    }), [comparisons]);

    const handleSubmitComparison = async (id: number) => {
        try {
            await purchaseService.submitComparison(id);
            fetchComparisons();
        } catch (error) {
            console.error('Error submitting comparison:', error);
        }
    };

    const handleFinanceReview = async (id: number, userId: number, approved: boolean) => {
        try {
            await purchaseService.financeReviewComparison(id, userId, approved);
            fetchComparisons();
        } catch (error) {
            console.error('Error in finance review:', error);
        }
    };

    const handleManagementApprove = async (id: number, userId: number, approved: boolean) => {
        try {
            await purchaseService.managementApproveComparison(id, userId, approved);
            fetchComparisons();
        } catch (error) {
            console.error('Error in management approval:', error);
        }
    };

    const handleCreatePO = (compId: number, quotId: number) => {
        navigate(`/dashboard/procurement/po/new?comparisonId=${compId}&quotationId=${quotId}`);
    };

    const handleViewComparison = (id: number) => {
        navigate(`/dashboard/procurement/comparison/${id}`);
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
                            placeholder="بحث باسم الصنف، رقم الطلب، أو المورد..."
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

            {/* Comparisons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <CardSkeleton />
                ) : filteredComparisons.length === 0 ? (
                    <EmptyState searchTerm={searchTerm} />
                ) : (
                    filteredComparisons.map((comparison, index) => (
                        <ComparisonCard
                            key={comparison.id}
                            comparison={comparison}
                            index={index}
                            onView={handleViewComparison}
                            onCreatePO={handleCreatePO}
                            onSubmit={handleSubmitComparison}
                            onFinanceReview={handleFinanceReview}
                            onManagementApprove={handleManagementApprove}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default QuotationComparisonPage;