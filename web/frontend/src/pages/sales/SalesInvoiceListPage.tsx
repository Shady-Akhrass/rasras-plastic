import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, FileText, Calendar, ArrowLeft, RefreshCw,
    Eye, CheckCircle2, Clock, DollarSign, XCircle,
    Receipt, Trash2, Pencil, Users, Layers
} from 'lucide-react';
import { salesInvoiceService, type SalesInvoiceDto } from '../../services/salesInvoiceService';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatNumber, formatDate } from '../../utils/format';
import { toast } from 'react-hot-toast';
import { useSystemSettings } from '../../hooks/useSystemSettings';

// --- Stat Card Component ---
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number | string;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
    suffix?: string;
    onClick?: () => void;
    active?: boolean;
    getCurrencyLabel: (currency: string) => string;
    defaultCurrency: string;
}> = ({ icon: Icon, value, label, color, suffix, onClick, active, getCurrencyLabel, defaultCurrency }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`w-full p-5 rounded-2xl border transition-all duration-300 group text-right
                ${active
                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/30'
                    : 'bg-white border-slate-100 hover:shadow-lg hover:border-brand-primary/20'
                }
                ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-300
                    ${active ? 'bg-white/20' : `${colorClasses[color]} group-hover:scale-110`}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                </div>
                <div className="flex-1">
                    <div className={`text-2xl font-bold ${active ? 'text-white' : 'text-slate-800'}`}>
                        {typeof value === 'number' ? formatNumber(value) : value}
                        {suffix && (
                            <span className="text-sm font-medium mr-1 opacity-70">
                                {suffix === 'ج.م' ? getCurrencyLabel(defaultCurrency) : suffix}
                            </span>
                        )}
                    </div>
                    <div className={`text-sm ${active ? 'text-white/80' : 'text-slate-500'}`}>
                        {label}
                    </div>
                </div>
            </div>
        </button>
    );
};

// --- Status Badge Component ---
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
            text: 'text-slate-700',
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
        'Approved': {
            label: 'معتمد',
            bg: 'bg-brand-primary/5',
            text: 'text-brand-primary',
            border: 'border-brand-primary/20',
            icon: CheckCircle2
        },
        'Paid': {
            label: 'مدفوع',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: DollarSign
        },
        'Partial': {
            label: 'مدفوع جزئياً',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Clock
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

// --- Empty State Component ---
const EmptyState: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    colSpan?: number;
    action?: React.ReactNode;
}> = ({ icon: Icon, title, description, colSpan = 7, action }) => (
    <tr>
        <td colSpan={colSpan} className="px-6 py-20">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Icon className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">{description}</p>
                {action}
            </div>
        </td>
    </tr>
);

// --- Skeleton Loader Component ---
const TableSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-slate-200 rounded" />
                            <div className="h-3 w-20 bg-slate-100 rounded" />
                        </div>
                    </div>
                </td>
                {Array.from({ length: columns - 2 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                        <div className="h-6 bg-slate-100 rounded-lg" />
                    </td>
                ))}
                <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
                        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

// --- Invoice Row Component ---
const InvoiceRow: React.FC<{
    inv: SalesInvoiceDto;
    index: number;
    navigate: any;
    handleDeleteClick: (inv: SalesInvoiceDto) => void;
    getCurrencyLabel: (currency: string) => string;
    defaultCurrency: string;
    convertAmount: (amount: number, from: string) => number;
}> = ({ inv, index, navigate, handleDeleteClick, getCurrencyLabel, defaultCurrency, convertAmount }) => (
    <tr
        onClick={() => navigate(`/dashboard/sales/invoices/${inv.id}?mode=view`)}
        className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0 cursor-pointer"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                        {inv.invoiceNumber || '—'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                        طلب: {inv.soNumber || '—'}
                    </div>
                </div>
            </div>
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Users className="w-4 h-4 text-slate-500" />
                </div>
                <span className="font-medium text-slate-700">
                    {inv.customerNameAr || '—'}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                {inv.invoiceDate ? formatDate(inv.invoiceDate) : '—'}
            </span>
        </td>
        <td className="px-6 py-4 text-center font-bold">
            <div className="text-lg text-brand-primary">
                {formatNumber(convertAmount(inv.totalAmount ?? 0, inv.currency || 'EGP'))}
                <span className="text-xs font-medium text-slate-400 mr-1">
                    {getCurrencyLabel(defaultCurrency)}
                </span>
            </div>
            {(inv.paidAmount ?? 0) > 0 && (
                <div className="text-xs text-emerald-600 font-bold mt-0.5">
                    مسدد: {formatNumber(convertAmount(inv.paidAmount ?? 0, inv.currency || 'EGP'))}
                </div>
            )}
        </td>
        <td className="px-6 py-4 text-center">
            <div className="font-bold text-slate-700">
                {formatNumber(convertAmount(inv.remainingAmount ?? 0, inv.currency || 'EGP'))}
                <span className="text-[10px] font-medium text-slate-400 mr-1">
                    {getCurrencyLabel(defaultCurrency)}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-center">
            <StatusBadge status={inv.status || 'Draft'} />
        </td>
        <td className="px-6 py-4">
            <div className="flex justify-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/invoices/${inv.id}?mode=view`); }} className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all duration-200" title="عرض"><Eye className="w-4 h-4" /></button>
                {(!inv.status || inv.status === 'Draft') && (
                    <>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sales/invoices/${inv.id}`); }} className="p-2.5 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all duration-200" title="تعديل"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(inv); }} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200" title="حذف"><Trash2 className="w-4 h-4" /></button>
                    </>
                )}
            </div>
        </td>
    </tr>
);

// --- Main Page Component ---
const SalesInvoiceListPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const navigate = useNavigate();

    const [list, setList] = useState<SalesInvoiceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<SalesInvoiceDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchList(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const data = await salesInvoiceService.getAll();
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            toast.error('فشل تحميل فواتير المبيعات');
            setList([]);
        } finally { setLoading(false); }
    };

    const handleDeleteClick = (invoice: SalesInvoiceDto) => {
        setInvoiceToDelete(invoice);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!invoiceToDelete?.id) return;
        setIsDeleting(true);
        try {
            await salesInvoiceService.delete(invoiceToDelete.id);
            toast.success('تم حذف الفاتورة بنجاح', { icon: '✅' });
            await fetchList();
            setIsDeleteModalOpen(false);
            setInvoiceToDelete(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'فشل حذف الفاتورة');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredInvoices = useMemo(() => {
        const filtered = list.filter((inv) => {
            const matchesSearch =
                (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (inv.customerNameAr || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (inv.soNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => {
            const dateA = a.invoiceDate ? new Date(a.invoiceDate).getTime() : 0;
            const dateB = b.invoiceDate ? new Date(b.invoiceDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [list, searchTerm, statusFilter]);

    const paginatedInvoices = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredInvoices.slice(start, start + pageSize);
    }, [filteredInvoices, currentPage, pageSize]);

    const stats = useMemo(
        () => ({
            total: list.length,
            draft: list.filter(i => i.status === 'Draft').length,
            paid: list.filter(i => i.status === 'Paid').length,
            totalAmount: list.reduce((sum, i) => sum + convertAmount(i.totalAmount || 0, i.currency || 'EGP'), 0),
            totalPaidAmount: list.reduce((sum, i) => sum + convertAmount(i.paidAmount || 0, i.currency || 'EGP'), 0),
            totalUnpaidAmount: list.reduce((sum, i) => sum + convertAmount(i.remainingAmount || 0, i.currency || 'EGP'), 0),
        }),
        [list, defaultCurrency, convertAmount]
    );

    const statusOptions = [
        { value: 'All', label: 'جميع الحالات' },
        { value: 'Draft', label: 'مسودة' },
        { value: 'Pending', label: 'قيد الاعتماد' },
        { value: 'Approved', label: 'معتمد' },
        { value: 'Partial', label: 'مدفوع جزئياً' },
        { value: 'Paid', label: 'مدفوع' },
    ];

    return (
        <div className="space-y-6 pb-20">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Receipt className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">فواتير المبيعات</h1>
                            <p className="text-white/70 text-lg">
                                إدارة وإصدار فواتير العملاء
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard/sales/invoices/new')}
                            className="flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary rounded-xl font-bold hover:bg-white/90 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            <span>فاتورة جديدة</span>
                        </button>
                        <button
                            onClick={fetchList}
                            disabled={loading}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    value={stats.total}
                    label="إجمالي الفواتير"
                    color="primary"
                    active={statusFilter === 'All'}
                    onClick={() => setStatusFilter('All')}
                    getCurrencyLabel={getCurrencyLabel}
                    defaultCurrency={defaultCurrency}
                />
                <StatCard
                    icon={DollarSign}
                    value={stats.totalUnpaidAmount}
                    label="مستحقات غير مدفوعة"
                    suffix={getCurrencyLabel(defaultCurrency)}
                    color="rose"
                    getCurrencyLabel={getCurrencyLabel}
                    defaultCurrency={defaultCurrency}
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.totalPaidAmount}
                    label="إجمالي المحصل"
                    suffix={getCurrencyLabel(defaultCurrency)}
                    color="success"
                    active={statusFilter === 'Paid'}
                    onClick={() => setStatusFilter('Paid')}
                    getCurrencyLabel={getCurrencyLabel}
                    defaultCurrency={defaultCurrency}
                />
                <StatCard
                    icon={Receipt}
                    value={stats.totalAmount}
                    label="إجمالي قيمة الفواتير"
                    suffix={getCurrencyLabel(defaultCurrency)}
                    color="blue"
                    getCurrencyLabel={getCurrencyLabel}
                    defaultCurrency={defaultCurrency}
                />
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث برقم الفاتورة، الطلب، أو اسم العميل..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50 ${isSearchFocused ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10' : 'border-transparent hover:border-slate-200'}`}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors">
                                <XCircle className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border-2 border-transparent hover:border-slate-200 transition-all">
                        <Layers className="w-5 h-5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredInvoices.length}</span> من أصل <span className="font-bold text-slate-800">{list.length}</span> فاتورة
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">رقم الفاتورة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">العميل</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">التاريخ</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الإجمالي النهائي</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الرصيد المتبقي</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton columns={7} />
                            ) : filteredInvoices.length === 0 ? (
                                <EmptyState
                                    colSpan={7}
                                    icon={Receipt}
                                    title="لا توجد فواتير"
                                    description="ابدأ بإصدار أول فاتورة مبيعات بالنظام"
                                    action={
                                        <button onClick={() => navigate('/dashboard/sales/invoices/new')} className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/30">
                                            <Plus className="w-5 h-5" />
                                            <span>فاتورة جديدة</span>
                                        </button>
                                    }
                                />
                            ) : (
                                paginatedInvoices.map((inv, index) => (
                                    <InvoiceRow
                                        key={inv.id}
                                        inv={inv}
                                        index={index}
                                        navigate={navigate}
                                        handleDeleteClick={handleDeleteClick}
                                        getCurrencyLabel={getCurrencyLabel}
                                        defaultCurrency={defaultCurrency}
                                        convertAmount={convertAmount}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredInvoices.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <div />
                        <Pagination currentPage={currentPage} totalItems={filteredInvoices.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }} />
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف فاتورة مبيعات"
                message={`هل أنت متأكد من حذف الفاتورة ${invoiceToDelete?.invoiceNumber || ''}؟ قد لا يمكن الحذف إذا كانت مرتبطة بإيصالات.`}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => { setIsDeleteModalOpen(false); setInvoiceToDelete(null); }}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default SalesInvoiceListPage;
