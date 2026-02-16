import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    FileText,
    Calendar,
    Truck,
    CheckCircle2,
    Clock,
    RefreshCw,
    DollarSign,
    Tag,
    ShoppingCart,
    X,
    XCircle,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/format';
import purchaseService, { type SupplierQuotation } from '../../services/purchaseService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';
import { useSystemSettings } from '../../hooks/useSystemSettings';


// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: string | number;
    label: string;
    color: 'indigo' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        indigo: 'bg-indigo-100 text-indigo-600',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-indigo-200 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { icon: React.ElementType; className: string; label: string }> = {
        'Selected': {
            icon: CheckCircle2,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'مقبول'
        },
        'Rejected': {
            icon: XCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'مرفوض'
        },
        'Received': {
            icon: Clock,
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            label: 'مستلم'
        }
    };

    const { icon: Icon, className, label } = config[status] || config['Received'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Table Row Component
const QuotationTableRow: React.FC<{
    quotation: SupplierQuotation;
    index: number;
    onView: (id: number) => void;
    onDelete: (quotation: SupplierQuotation) => void;
    navigate: ReturnType<typeof useNavigate>;
    isSelected: boolean;
    onToggleSelect: (id: number) => void;
    getCurrencyLabel: (currency: string) => string;
    defaultCurrency: string;
    convertAmount: (amount: number, from: string) => number;
}> = ({ quotation, index, onView, onDelete, navigate, isSelected, onToggleSelect, getCurrencyLabel, defaultCurrency, convertAmount }) => (

    <tr
        className="hover:bg-indigo-50/50 transition-all duration-200 group border-b border-slate-100 last:border-0 cursor-pointer"
        onClick={() => onView(quotation.id!)}
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
            <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={isSelected}
                onChange={() => quotation.id && onToggleSelect(quotation.id)}
            />
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-50 
                    rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tag className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                        #{quotation.quotationNumber || 'بدون رقم'}
                    </span>
                    {quotation.rfqNumber && (
                        <span className="text-xs text-slate-400">طلب سعر #{quotation.rfqNumber}</span>
                    )}
                </div>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(quotation.quotationDate)}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600 font-bold">
            <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>{quotation.supplierNameAr}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-800 font-bold text-left">
            <div className="flex items-center justify-end gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>{formatNumber(convertAmount(quotation.totalAmount || 0, quotation.currency || 'EGP'), { minimumFractionDigits: 2 })} {getCurrencyLabel(defaultCurrency)}</span>
            </div>
        </td>

        <td className="px-6 py-4 text-sm text-slate-600">
            {quotation.deliveryDays ? `${quotation.deliveryDays} يوم` : '-'}
        </td>
        <td className="px-6 py-4">
            <div className="flex flex-col gap-1">
                <StatusBadge status={quotation.status || 'Received'} />
                {quotation.validUntilDate && new Date(quotation.validUntilDate) < new Date() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
                        <AlertCircle className="w-3 h-3" />
                        منتهي
                    </span>
                )}
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex justify-end gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onView(quotation.id!); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="عرض التفاصيل"
                >
                    <FileText className="w-4 h-4" />
                </button>
                {quotation.status === 'Selected' && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/procurement/po/new?quotationId=${quotation.id}`);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="إصدار أمر شراء"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/procurement/invoices/new?quotationId=${quotation.id}`);
                            }}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إصدار فاتورة"
                        >
                            <DollarSign className="w-4 h-4" />
                        </button>
                    </>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(quotation); }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    title="حذف"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
);

const SupplierQuotationsPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showExpired, setShowExpired] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [quotationToDelete, setQuotationToDelete] = useState<SupplierQuotation | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllQuotations();
            setQuotations(data);
        } catch (error) {
            console.error('Failed to fetch quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (quotation: SupplierQuotation) => {
        setQuotationToDelete(quotation);
        setIsDeleteModalOpen(true);
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleToggleSelectAllPage = () => {
        const pageIds = paginatedQuotations.map(q => q.id!).filter(Boolean);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('يرجى اختيار عروض أسعار أولاً');
            return;
        }
        setQuotationToDelete(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const idsToDelete = quotationToDelete?.id ? [quotationToDelete.id] : selectedIds;
        if (!idsToDelete.length) return;
        setIsDeleting(true);
        try {
            for (const id of idsToDelete) {
                await purchaseService.deleteQuotation(id);
            }
            toast.success(idsToDelete.length === 1 ? 'تم حذف عرض السعر بنجاح' : 'تم حذف عروض الأسعار بنجاح');
            fetchQuotations();
            setIsDeleteModalOpen(false);
            setQuotationToDelete(null);
            setSelectedIds([]);
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message as string | undefined;
            toast.error(apiMessage || 'فشل حذف عرض السعر');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredQuotations = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filtered = quotations.filter(q => {
            const isExpired = q.validUntilDate && new Date(q.validUntilDate) < today;
            if (!showExpired && isExpired) return false;

            const matchesSearch =
                q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        // الأحدث في الأعلى (بناءً على لحظة الإنشاء)
        return [...filtered].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [quotations, searchTerm, statusFilter, showExpired]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const paginatedQuotations = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredQuotations.slice(start, start + pageSize);
    }, [filteredQuotations, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, showExpired]);

    const stats = useMemo(() => {
        const total = quotations.length;
        const avgAmount = total > 0
            ? quotations.reduce((sum, q) => sum + convertAmount(q.totalAmount || 0, q.currency || 'EGP'), 0) / total
            : 0;
        return {
            total,
            received: quotations.filter(q => q.status === 'Received').length,
            selected: quotations.filter(q => q.status === 'Selected').length,
            avgAmount: formatNumber(avgAmount, { maximumFractionDigits: 0 })
        };
    }, [quotations, defaultCurrency, convertAmount]);


    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Tag className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">عروض أسعار الموردين</h1>
                            <p className="text-white/70 text-lg">متابعة عروض الأسعار المستلمة من الموردين</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/quotation/new')}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl 
                            font-bold shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>تسجيل عرض سعر جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={FileText} value={stats.total} label="إجمالي العروض" color="indigo" />
                <StatCard icon={Clock} value={stats.received} label="مستلم" color="blue" />
                <StatCard icon={CheckCircle2} value={stats.selected} label="مقبول" color="success" />
                <StatCard icon={DollarSign} value={`${stats.avgAmount} ${getCurrencyLabel(defaultCurrency)}`} label="متوسط القيمة" color="purple" />
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
                            placeholder="بحث برقم العرض، اسم المورد، أو رقم طلب السعر..."
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
                                <option value="Received">مستلم</option>
                                <option value="Selected">مقبول</option>
                                <option value="Rejected">مرفوض</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent 
                            hover:border-slate-200 transition-all duration-200">
                            <input
                                type="checkbox"
                                id="showExpired"
                                checked={showExpired}
                                onChange={(e) => setShowExpired(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="showExpired" className="text-sm font-bold text-slate-600 cursor-pointer">
                                إظهار العروض المنتهية
                            </label>
                        </div>

                        <button
                            onClick={fetchQuotations}
                            disabled={loading}
                            className="p-3 rounded-xl border border-slate-200 text-slate-600 
                                hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 
                                transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={
                                            paginatedQuotations.length > 0 &&
                                            paginatedQuotations.every(q => q.id && selectedIds.includes(q.id))
                                        }
                                        onChange={handleToggleSelectAllPage}
                                    />
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم عرض السعر</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">المورد</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجمالي</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">مدة التوريد</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                            <span className="text-slate-500 font-medium">جاري التحميل...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                                <FileText className="w-10 h-10 text-indigo-300" />
                                            </div>
                                            <div>
                                                <p className="text-slate-500 font-semibold">لا توجد نتائج</p>
                                                <p className="text-slate-400 text-sm mt-1">جرب تغيير معايير البحث</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedQuotations.map((q, index) => (
                                    <QuotationTableRow
                                        key={q.id}
                                        quotation={q}
                                        index={index}
                                        onView={(id) => navigate(`/dashboard/procurement/quotation/${id}`)}
                                        onDelete={handleDeleteClick}
                                        navigate={navigate}
                                        isSelected={!!q.id && selectedIds.includes(q.id)}
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
                {!loading && filteredQuotations.length > 0 && (
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
                            totalItems={filteredQuotations.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                        />
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف عرض السعر"
                message={
                    quotationToDelete
                        ? `هل أنت متأكد من حذف عرض السعر رقم ${quotationToDelete.quotationNumber}؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن التراجع عن هذه الخطوة.`
                        : `هل أنت متأكد من حذف عدد ${selectedIds.length} من عروض الأسعار؟ سيتم حذف جميع البيانات المرتبطة بها ولا يمكن التراجع عن هذه الخطوة.`
                }
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setQuotationToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default SupplierQuotationsPage;