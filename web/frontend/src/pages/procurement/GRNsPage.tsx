import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Plus,
    Search,
    FileText,
    Calendar,
    CheckCircle2,
    Clock,
    Package,
    Warehouse,
    ClipboardCheck,
    RefreshCw,
    X,
    Eye,
    Archive
} from 'lucide-react';
import { grnService, type GoodsReceiptNoteDto } from '../../services/grnService';
import Pagination from '../../components/common/Pagination';

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
        'Pending Inspection': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'بانتظار الفحص'
        },
        'Inspected': {
            icon: ClipboardCheck,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'تم الفحص'
        },
        'Pending Approval': {
            icon: Clock,
            className: 'bg-violet-50 text-violet-700 border-violet-200',
            label: 'بانتظار الاعتماد'
        },
        'Approved': {
            icon: CheckCircle2,
            className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            label: 'إذن معتمد - جاهز للتخزين'
        },
        'Completed': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'تمت الإضافة'
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

// Table Row Component
const GRNTableRow: React.FC<{
    receipt: GoodsReceiptNoteDto;
    index: number;
    onView: (id: number) => void;
    onFinalize: (id: number, type?: number) => void;
}> = ({ receipt, index, onView, onFinalize }) => (
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
                    <Warehouse className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                    #{receipt.grnNumber}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-brand-primary">
            #{receipt.poNumber}
        </td>
        <td className="px-6 py-4 text-sm font-medium text-slate-700">
            {receipt.supplierNameAr}
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{new Date(receipt.grnDate!).toLocaleDateString('ar-EG')}</span>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex flex-col gap-1">
                <StatusBadge status={receipt.status!} />
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${receipt.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    receipt.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                    {receipt.approvalStatus === 'Approved' ? 'معتمد' :
                        receipt.approvalStatus === 'Rejected' ? 'مرفوض' : 'قيد الاعتماد'}
                </span>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
                {(receipt.status === 'Draft' || receipt.status === 'Pending Inspection') && (
                    <button
                        onClick={() => onFinalize(receipt.id!, 2)} // Using '2' as a marker for submit vs finalize
                        className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                        title="إرسال للاعتماد"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={() => onView(receipt.id!)}
                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                    title="عرض التفاصيل"
                >
                    <Eye className="w-4 h-4" />
                </button>
                {receipt.status === 'Approved' && receipt.approvalStatus === 'Approved' && (
                    <button
                        onClick={() => onFinalize(receipt.id!, 1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white 
                            rounded-lg text-xs font-bold hover:bg-brand-primary/90 hover:scale-105 transition-all"
                        title="إضافة للمخزن"
                    >
                        <Archive className="w-3.5 h-3.5" />
                        <span>إضافة للمخزن</span>
                    </button>
                )}
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
                        <div className="h-4 w-20 bg-slate-100 rounded" />
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-24 bg-slate-100 rounded-full" /></td>
                <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
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
                        <Warehouse className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا يوجد أذونات إضافة'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على إشعارات تطابق "${searchTerm}"`
                        : 'لم يتم تسجيل أي أذونات إضافة بعد'}
                </p>
            </div>
        </td>
    </tr>
);

const GRNsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState<GoodsReceiptNoteDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const data = await grnService.getAllGRNs();
            setReceipts(data);
        } catch (error) {
            console.error('Failed to fetch receipts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReceipts = useMemo(() => {
        const filtered = receipts.filter(r => {
            const matchesSearch = r.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.poNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const isNotReturned = r.status?.toLowerCase() !== 'returned';
            return matchesSearch && isNotReturned;
        });
        // الأحدث فوق والأقدم تحت
        return [...filtered].sort((a, b) => {
            const dateA = a.grnDate ? new Date(a.grnDate).getTime() : 0;
            const dateB = b.grnDate ? new Date(b.grnDate).getTime() : 0;
            return dateB - dateA;
        });
    }, [receipts, searchTerm]);

    const paginatedReceipts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredReceipts.slice(start, start + pageSize);
    }, [filteredReceipts, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const stats = useMemo(() => {
        const activeReceipts = receipts.filter(r => r.status?.toLowerCase() !== 'returned');
        return {
            total: activeReceipts.length,
            today: activeReceipts.filter(r => new Date(r.grnDate!).toDateString() === new Date().toDateString()).length,
            totalQty: activeReceipts.reduce((sum, r) => sum + (r.totalReceivedQty || 0), 0).toLocaleString()
        };
    }, [receipts]);

    const handleFinalizeStoreIn = async (id: number, type: number = 1) => {
        const confirmMsg = type === 2 ? 'هل أنت متأكد من إرسال إذن الإضافة للاعتماد؟' : 'هل أنت متأكد من إصدار إذن الإضافة؟';
        if (!window.confirm(confirmMsg)) return;

        try {
            setLoading(true);
            if (type === 2) {
                await grnService.submitGRN(id, 1);
                toast.success('تم إرسال إذن الإضافة للاعتماد');
            } else {
                await grnService.finalizeStoreIn(id, 1);
                toast.success('تم إضافة الكميات للمخزون بنجاح');
            }
            fetchReceipts();
        } catch (error) {
            console.error('Error:', error);
            toast.error(type === 2 ? 'فشل إرسال الطلب' : 'خطأ أثناء الإضافة للمخزن');
        } finally {
            setLoading(false);
        }
    };

    const handleViewGRN = (id: number) => {
        navigate(`/dashboard/procurement/grn/${id}`);
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
                            <Warehouse className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إذن إضافة (GRN)</h1>
                            <p className="text-white/70 text-lg">متابعة توريدات المخازن بناءً على أوامر الشراء</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard/inventory/quality-inspection')}
                            className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white 
                                rounded-xl font-bold hover:bg-white/20 transition-all duration-200"
                        >
                            <ClipboardCheck className="w-5 h-5" />
                            <span className="hidden sm:inline">فحص الجودة</span>
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/procurement/grn/new')}
                            className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                                hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                                hover:shadow-xl hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span>تسجيل إذن إضافة</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={FileText}
                    value={stats.total}
                    label="إجمالي أذونات الإضافة"
                    color="primary"
                />
                <StatCard
                    icon={Calendar}
                    value={stats.today}
                    label="أذونات اليوم"
                    color="warning"
                />
                <StatCard
                    icon={Package}
                    value={stats.totalQty}
                    label="إجمالي الكميات المستلمة"
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
                            placeholder="بحث برقم إذن الإضافة، المورد، أو أمر الشراء..."
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
                        onClick={fetchReceipts}
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
                        عرض <span className="font-bold text-slate-800">{filteredReceipts.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{receipts.length}</span> إذن إضافة
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم إذن الإضافة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">أمر الشراء</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المورد</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredReceipts.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} />
                            ) : (
                                paginatedReceipts.map((receipt, index) => (
                                    <GRNTableRow
                                        key={receipt.id}
                                        receipt={receipt}
                                        index={index}
                                        onView={handleViewGRN}
                                        onFinalize={handleFinalizeStoreIn}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredReceipts.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredReceipts.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                )}
            </div>
        </div>
    );
};

export default GRNsPage;