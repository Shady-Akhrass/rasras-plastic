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
    Wallet,
    X,
    Eye,
    RefreshCw,
    DollarSign,
    XCircle,
    ShieldCheck,
    Printer,
} from 'lucide-react';
import { paymentVoucherService, type PaymentVoucherDto } from '../../services/paymentVoucherService';
import { supplierInvoiceService, type SupplierInvoiceDto } from '../../services/supplierInvoiceService';
import Pagination from '../../components/common/Pagination';
import { formatNumber, formatDate } from '../../utils/format';
import { toast } from 'react-hot-toast';
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
        'Pending': {
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            label: 'قيد الانتظار'
        },
        'Approved': {
            icon: CheckCircle2,
            className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            label: 'معتمد'
        },
        'Paid': {
            icon: DollarSign,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            label: 'مدفوع'
        },
        'Cancelled': {
            icon: XCircle,
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            label: 'ملغي'
        }
    };

    const { icon: Icon, className, label } = config[status] || config['Pending'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Approval Badge Component
const ApprovalBadge: React.FC<{ status: string }> = ({ status }) => {
    if (!status) return null;

    const config: Record<string, { label: string; className: string }> = {
        'Pending': {
            label: 'قيد الاعتماد',
            className: 'bg-amber-50 text-amber-600 border-amber-100'
        },
        'FinanceApproved': {
            label: 'معتمد مالياً',
            className: 'bg-blue-50 text-blue-600 border-blue-100'
        },
        'Approved': {
            label: 'معتمد نهائياً',
            className: 'bg-emerald-50 text-emerald-600 border-emerald-100'
        },
        'Rejected': {
            label: 'مرفوض',
            className: 'bg-rose-50 text-rose-600 border-rose-100'
        }
    };

    const c = config[status] || config['Pending'];

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.className}`}>
            {c.label}
        </span>
    );
};

// Table Row Component
const VoucherTableRow: React.FC<{
    voucher: PaymentVoucherDto;
    index: number;
    onView: (id: number) => void;
    onPrint: (id: number, voucherNumber: string) => void;
    getCurrencyLabel: (currency: string) => string;
    defaultCurrency: string;
    convertAmount: (amount: number, from: string) => number;
}> = ({ voucher, index, onView, onPrint, getCurrencyLabel, defaultCurrency, convertAmount }) => (

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
                    <Wallet className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                    {voucher.voucherNumber || '—'}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-slate-700">
            {voucher.supplierNameAr || '—'}
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formatDate(voucher.voucherDate)}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-right">
            <div className="flex flex-col items-end gap-1">
                <span className="font-bold text-emerald-600">
                    {formatNumber(convertAmount(voucher.amount || 0, voucher.currency || 'EGP'))} {getCurrencyLabel(defaultCurrency)}
                </span>

                {voucher.isSplitPayment && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">
                        دفع مجزأ
                    </span>
                )}
            </div>
        </td>

        <td className="px-6 py-4">
            <StatusBadge status={voucher.status || 'Pending'} />
        </td>
        <td className="px-6 py-4">
            <ApprovalBadge status={voucher.status || 'Pending'} />
        </td>
        <td className="px-6 py-4">
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => onView(voucher.paymentVoucherId!)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="عرض التفاصيل"
                >
                    <Eye className="w-4 h-4" />
                </button>
                {(voucher.status === 'Paid' || voucher.status === 'Approved') && (
                    <button
                        onClick={() => onPrint(voucher.paymentVoucherId!, voucher.voucherNumber)}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                        title="طباعة سند الصرف"
                    >
                        <Printer className="w-4 h-4" />
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
                <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-slate-100 rounded ml-auto" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </td>
                <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </td>
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
const EmptyState: React.FC<{ searchTerm: string; statusFilter: string }> = ({ searchTerm, statusFilter }) => (
    <tr>
        <td colSpan={7} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm || statusFilter !== 'All' ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <Wallet className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm || statusFilter !== 'All' ? 'لا توجد نتائج' : 'لا توجد سندات صرف'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'All'
                        ? 'لم يتم العثور على سندات تطابق معايير البحث'
                        : 'لم يتم إنشاء أي سندات صرف بعد'}
                </p>
            </div>
        </td>
    </tr>
);

const PaymentVouchersPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [vouchers, setVouchers] = useState<PaymentVoucherDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    // Unpaid Invoices Tab
    const [activeTab, setActiveTab] = useState<'vouchers' | 'unpaid-invoices'>('vouchers');
    const [unpaidInvoices, setUnpaidInvoices] = useState<SupplierInvoiceDto[]>([]);
    const [unpaidInvoicesLoading, setUnpaidInvoicesLoading] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchVouchers();
    }, []);

    useEffect(() => {
        if (activeTab === 'unpaid-invoices' && unpaidInvoices.length === 0) {
            fetchUnpaidInvoices();
        }
    }, [activeTab]);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const data = await paymentVoucherService.getAllVouchers();
            setVouchers(data || []);
        } catch (error) {
            console.error('Failed to fetch vouchers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnpaidInvoices = async () => {
        try {
            setUnpaidInvoicesLoading(true);
            const response = await supplierInvoiceService.getAllInvoices();
            const allInvoices = response.data || [];

            // Filter for approved but unpaid/partial invoices
            const unpaid = allInvoices.filter(
                inv => (inv.status === 'Unpaid' || inv.status === 'Partial') && inv.approvalStatus === 'Approved'
            );


            setUnpaidInvoices(unpaid);
        } catch (error) {
            console.error('Failed to fetch unpaid invoices:', error);
            toast.error('فشل تحميل الفواتير غير المدفوعة');
        } finally {
            setUnpaidInvoicesLoading(false);
        }
    };

    const handleInvoiceToggle = (invoiceId: number) => {
        setSelectedInvoices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(invoiceId)) {
                newSet.delete(invoiceId);
            } else {
                newSet.add(invoiceId);
            }
            return newSet;
        });
    };

    const handleCreateVoucherFromInvoices = () => {
        const selected = unpaidInvoices.filter(inv => selectedInvoices.has(inv.id!));
        if (selected.length === 0) {
            return;
        }
        navigate('/dashboard/finance/payment-vouchers/new', {
            state: { preSelectedInvoices: selected }
        });
    };

    const filteredVouchers = useMemo(() => {
        const filtered = vouchers.filter(v => {
            const matchesSearch =
                v.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => {
            const dateA = a.voucherDate ? new Date(a.voucherDate).getTime() : 0;
            const dateB = b.voucherDate ? new Date(b.voucherDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.paymentVoucherId ?? 0) - (a.paymentVoucherId ?? 0);
        });
    }, [vouchers, searchTerm, statusFilter]);

    const paginatedVouchers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredVouchers.slice(start, start + pageSize);
    }, [filteredVouchers, currentPage, pageSize]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: vouchers.length,
        pending: vouchers.filter(v => v.status === 'Pending').length,
        approved: vouchers.filter(v => v.status === 'Approved' || v.status === 'Paid').length,
        totalValue: formatNumber(vouchers.reduce((sum, v) => sum + convertAmount(v.amount || 0, v.currency || 'EGP'), 0))
    }), [vouchers, defaultCurrency, convertAmount]);


    const handleViewVoucher = (id: number) => {
        navigate(`/dashboard/finance/payment-vouchers/${id}`);
    };

    const handleDownloadPdf = async (id: number, voucherNumber: string) => {
        try {
            await paymentVoucherService.downloadVoucherPdf(id, voucherNumber);
        } catch (error) {
            console.error('Print failed:', error);
            // Optional: add a toast notice here if one is available in the scope
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
                            <Wallet className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">سندات الصرف</h1>
                            <p className="text-white/70 text-lg">إدارة سندات الصرف واعتماد المدفوعات</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/finance/payment-vouchers/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-brand-primary rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>سند صرف جديد</span>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('vouchers')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'vouchers'
                            ? 'bg-brand-primary text-white shadow-lg'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Wallet className="w-5 h-5" />
                        <span>سندات الصرف</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'vouchers'
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                            }`}>
                            {vouchers.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('unpaid-invoices')}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'unpaid-invoices'
                            ? 'bg-brand-primary text-white shadow-lg'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        <span>الفواتير غير المدفوعة</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'unpaid-invoices'
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                            }`}>
                            {unpaidInvoices.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    value={stats.total}
                    label="إجمالي السندات"
                    color="primary"
                />
                <StatCard
                    icon={Clock}
                    value={stats.pending}
                    label="قيد الانتظار"
                    color="warning"
                />
                <StatCard
                    icon={ShieldCheck}
                    value={stats.approved}
                    label="معتمد / مدفوع"
                    color="blue"
                />
                <StatCard
                    icon={DollarSign}
                    value={`${stats.totalValue} ${getCurrencyLabel(defaultCurrency)}`}
                    label="إجمالي المدفوعات"
                    color="success"
                />

            </div>

            {/* Filters - Only for Vouchers Tab */}
            {activeTab === 'vouchers' && (
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                                transition-colors duration-200
                                ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="بحث برقم السند أو اسم المورد..."
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
                                    <option value="Pending">قيد الانتظار</option>
                                    <option value="Approved">معتمد</option>
                                    <option value="Paid">مدفوع</option>
                                    <option value="Cancelled">ملغي</option>
                                </select>
                            </div>

                            <button
                                onClick={fetchVouchers}
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
            )}

            {/* Results Count - Only for Vouchers Tab */}
            {activeTab === 'vouchers' && !loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredVouchers.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{vouchers.length}</span> سند صرف
                    </span>
                </div>
            )}

            {/* Unpaid Invoices Table */}
            {activeTab === 'unpaid-invoices' && (
                <>
                    {/* Action Bar */}
                    {selectedInvoices.size > 0 && (
                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-bold text-emerald-800">
                                        {selectedInvoices.size} فاتورة محددة
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedInvoices(new Set())}
                                        className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg transition-colors font-semibold"
                                    >
                                        إلغاء التحديد
                                    </button>
                                    <button
                                        onClick={handleCreateVoucherFromInvoices}
                                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg 
                                            hover:bg-emerald-700 transition-colors font-bold shadow-lg"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>إنشاء سند صرف</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={unpaidInvoices.length > 0 && selectedInvoices.size === unpaidInvoices.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedInvoices(new Set(unpaidInvoices.map(inv => inv.id!)));
                                                    } else {
                                                        setSelectedInvoices(new Set());
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-slate-300"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم الفاتورة</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">التاريخ</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المبلغ</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">أمر الشراء</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">إذن الاستلام</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unpaidInvoicesLoading ? (
                                        <TableSkeleton />
                                    ) : unpaidInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16">
                                                <div className="text-center">
                                                    <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                                                        <FileText className="w-12 h-12 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                                                        لا توجد فواتير غير مدفوعة
                                                    </h3>
                                                    <p className="text-slate-500 max-w-md mx-auto">
                                                        جميع الفواتير المعتمدة تم دفعها
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        unpaidInvoices.map((invoice, index) => {
                                            const isSelected = selectedInvoices.has(invoice.id!);

                                            return (
                                                <tr
                                                    key={invoice.id}
                                                    className={`hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0 ${isSelected ? 'bg-emerald-50' : ''
                                                        }`}
                                                    style={{
                                                        animationDelay: `${index * 30}ms`,
                                                        animation: 'fadeInUp 0.3s ease-out forwards'
                                                    }}
                                                >
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleInvoiceToggle(invoice.id!)}
                                                            className="w-4 h-4 rounded border-slate-300"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-violet-500/10 
                                                                rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                <FileText className="w-5 h-5 text-violet-600" />
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                                                                {invoice.invoiceNumber || '—'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-slate-400" />
                                                            <span>{formatDate(invoice.invoiceDate)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-emerald-600">
                                                            {formatNumber(convertAmount(invoice.totalAmount || 0, invoice.currency || 'EGP'))} {getCurrencyLabel(defaultCurrency)}
                                                        </span>
                                                    </td>


                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">—</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">—</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            معتمدة
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Vouchers Table - Only for Vouchers Tab */}
            {activeTab === 'vouchers' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">رقم السند</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المورد</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">التاريخ</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">المبلغ</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">حالة السند</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">حالة الاعتماد</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <TableSkeleton />
                                ) : filteredVouchers.length === 0 ? (
                                    <EmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
                                ) : (
                                    paginatedVouchers.map((voucher, index) => (
                                        <VoucherTableRow
                                            key={voucher.paymentVoucherId}
                                            voucher={voucher}
                                            index={index}
                                            onView={handleViewVoucher}
                                            onPrint={handleDownloadPdf}
                                            getCurrencyLabel={getCurrencyLabel}
                                            defaultCurrency={defaultCurrency}
                                            convertAmount={convertAmount}
                                        />

                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && filteredVouchers.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredVouchers.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentVouchersPage;
