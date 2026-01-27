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
    Eye,
    AlertCircle
} from 'lucide-react';
import purchaseService, { type SupplierQuotation } from '../../services/purchaseService';

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
    onCreatePO: (id: number) => void;
    onCreateInvoice: (id: number) => void;
}> = ({ quotation, index, onView, onCreatePO, onCreateInvoice }) => (
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
                    <Tag className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors block">
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
                <span>{new Date(quotation.quotationDate).toLocaleDateString('ar-EG')}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>{quotation.supplierNameAr}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-right">
            <span className="font-bold text-emerald-600">
                {quotation.totalAmount?.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {quotation.currency}
            </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600 text-center">
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
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => onView(quotation.id!)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="عرض التفاصيل"
                >
                    <Eye className="w-4 h-4" />
                </button>
                {quotation.status === 'Selected' && (
                    <>
                        <button
                            onClick={() => onCreatePO(quotation.id!)}
                            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                            title="إصدار أمر شراء"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onCreateInvoice(quotation.id!)}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                            title="إصدار فاتورة"
                        >
                            <DollarSign className="w-4 h-4" />
                        </button>
                    </>
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
                        <div>
                            <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
                            <div className="h-3 w-20 bg-slate-50 rounded" />
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded ml-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded mx-auto" /></td>
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
const EmptyState: React.FC<{ searchTerm: string; statusFilter: string }> = ({ searchTerm, statusFilter }) => (
    <tr>
        <td colSpan={7} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm || statusFilter !== 'All' ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <Tag className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm || statusFilter !== 'All' ? 'لا توجد نتائج' : 'لا توجد عروض أسعار'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'All'
                        ? 'لم يتم العثور على عروض تطابق معايير البحث'
                        : 'لم يتم تسجيل أي عروض أسعار من الموردين بعد'}
                </p>
            </div>
        </td>
    </tr>
);

const SupplierQuotationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showExpired, setShowExpired] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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

    const filteredQuotations = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return quotations.filter(q => {
            const isExpired = q.validUntilDate && new Date(q.validUntilDate) < today;
            if (!showExpired && isExpired) return false;

            const matchesSearch =
                q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [quotations, searchTerm, statusFilter, showExpired]);

    const stats = useMemo(() => {
        const total = quotations.length;
        const avgAmount = total > 0
            ? quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0) / total
            : 0;
        return {
            total,
            received: quotations.filter(q => q.status === 'Received').length,
            selected: quotations.filter(q => q.status === 'Selected').length,
            avgAmount: avgAmount.toLocaleString('ar-EG', { maximumFractionDigits: 0 })
        };
    }, [quotations]);

    const handleViewQuotation = (id: number) => {
        navigate(`/dashboard/procurement/quotation/${id}`);
    };

    const handleCreatePO = (id: number) => {
        navigate(`/dashboard/procurement/po/new?quotationId=${id}`);
    };

    const handleCreateInvoice = (id: number) => {
        navigate(`/dashboard/procurement/invoices/new?quotationId=${id}`);
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
                            <Tag className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">عروض أسعار الموردين</h1>
                            <p className="text-white/70 text-lg">متابعة عروض الأسعار المستلمة من الموردين</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/quotation/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>تسجيل عرض سعر</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    value={stats.total}
                    label="إجمالي العروض"
                    color="primary"
                />
                <StatCard
                    icon={Clock}
                    value={stats.received}
                    label="مستلم"
                    color="blue"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.selected}
                    label="مقبول"
                    color="success"
                />
                <StatCard
                    icon={DollarSign}
                    value={`${stats.avgAmount} ج.م`}
                    label="متوسط القيمة"
                    color="purple"
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
                            placeholder="بحث برقم العرض، اسم المورد، أو رقم طلب السعر..."
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
                                <option value="Rejected">مرفوض</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent hover:border-slate-200 transition-all duration-200">
                            <input
                                type="checkbox"
                                id="showExpired"
                                checked={showExpired}
                                onChange={(e) => setShowExpired(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                            />
                            <label htmlFor="showExpired" className="text-sm font-bold text-slate-600 cursor-pointer">
                                إظهار العروض المنتهية
                            </label>
                        </div>

                        <button
                            onClick={fetchQuotations}
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
                        عرض <span className="font-bold text-slate-800">{filteredQuotations.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{quotations.length}</span> عرض سعر
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم عرض السعر</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المورد</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الإجمالي</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">مدة التوريد</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredQuotations.length === 0 ? (
                                <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
                            ) : (
                                filteredQuotations.map((quotation, index) => (
                                    <QuotationTableRow
                                        key={quotation.id}
                                        quotation={quotation}
                                        index={index}
                                        onView={handleViewQuotation}
                                        onCreatePO={handleCreatePO}
                                        onCreateInvoice={handleCreateInvoice}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupplierQuotationsPage;