import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    TrendingDown,
    TrendingUp,
    DollarSign,
    Download,
    Eye,
    RefreshCw,
    Wallet,
    CreditCard,
    ShoppingCart,
    CheckCircle2,
    Package,
    Building2,
    FileText,
    X,
    AlertCircle,
    Ban,
    Clock,
    Truck
} from 'lucide-react';
import { supplierService, type SupplierOutstandingDto } from '../../services/supplierService';
import { purchaseOrderService, type PurchaseOrderDto } from '../../services/purchaseOrderService';
import { supplierInvoiceService, type SupplierInvoiceDto } from '../../services/supplierInvoiceService';
import { formatNumber, formatDate } from '../../utils/format';

// --- Calculation Helpers (matching PurchaseOrderFormPage) ---
const calculateInvoiceTotals = (invoice: SupplierInvoiceDto): SupplierInvoiceDto => {
    let subTotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;

    const updatedItems = (invoice.items || []).map(item => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const discountRate = (Number(item.discountPercentage) || 0) / 100;
        const taxRate = (Number(item.taxPercentage) || 0) / 100;

        const grossAmount = qty * price;
        const discountAmount = grossAmount * discountRate;
        const taxableAmount = grossAmount - discountAmount;
        const taxAmount = taxableAmount * taxRate;
        const totalPrice = taxableAmount + taxAmount;

        subTotal += grossAmount;
        totalDiscountAmount += discountAmount;
        totalTaxAmount += taxAmount;

        return {
            ...item,
            discountAmount,
            taxAmount,
            totalPrice
        };
    });

    const deliveryCost = Number(invoice.deliveryCost) || 0;
    const otherCosts = Number(invoice.otherCosts) || 0;

    const grandTotal = (subTotal - totalDiscountAmount) + totalTaxAmount + deliveryCost + otherCosts;

    return {
        ...invoice,
        items: updatedItems,
        subTotal,
        discountAmount: totalDiscountAmount,
        taxAmount: totalTaxAmount,
        deliveryCost,
        otherCosts,
        totalAmount: grandTotal
    };
};

// --- Reusable Components ---

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
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div
                    className={`p-3 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}
                >
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

// --- Balance Table Row ---

const BalanceTableRow: React.FC<{
    summary: SupplierOutstandingDto;
    index: number;
    onView: (id: number) => void;
    isExpanded: boolean;
    onToggleExpand: (id: number) => void;
    invoices: SupplierInvoiceDto[];
}> = ({ summary, index, onView, isExpanded, onToggleExpand, invoices }) => {
    const [expandedInvoiceId, setExpandedInvoiceId] = React.useState<number | null>(null);

    return (
        <>
            <tr
                className={`hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0 cursor-pointer ${
                    isExpanded ? 'bg-brand-primary/5' : ''
                }`}
                onClick={() => onToggleExpand(summary.id)}
                style={{
                    animationDelay: `${index * 30}ms`,
                    animation: 'fadeInUp 0.3s ease-out forwards'
                }}
            >
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Building2 className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                                {summary.supplierNameAr}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                                #{summary.supplierCode}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="font-medium text-slate-600">
                        {formatNumber(summary.totalInvoiced ?? 0)} {summary.currency || 'EGP'}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="font-medium text-amber-600">
                        {formatNumber(summary.totalReturned ?? 0)} {summary.currency || 'EGP'}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className="font-medium text-emerald-600">
                        {formatNumber(summary.totalPaid ?? 0)} {summary.currency || 'EGP'}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span
                        className={`font-bold ${
                            (summary.currentBalance || 0) > 0
                                ? 'text-rose-600'
                                : 'text-emerald-600'
                        }`}
                    >
                        {formatNumber(Math.abs(summary.currentBalance ?? 0))}{' '}
                        {summary.currency || 'EGP'}
                        {(summary.currentBalance || 0) > 0
                            ? ' (لم يسدد)'
                            : (summary.currentBalance || 0) < 0
                              ? ' (له رصيد)'
                              : ''}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        <CreditCard className="w-3 h-3" />
                        {formatNumber(summary.creditLimit ?? 0)}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onView(summary.id);
                            }}
                            className="p-2 text-brand-primary bg-brand-primary/5 rounded-lg hover:bg-brand-primary hover:text-white transition-all"
                            title="عرض الملف"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-all ${
                                isExpanded
                                    ? 'bg-slate-200 text-slate-600'
                                    : 'hover:bg-slate-100 text-slate-400'
                            }`}
                        >
                            {isExpanded ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-slate-50/50">
                    <td colSpan={7} className="px-6 py-4">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="font-bold text-slate-700 text-sm">
                                    تفاصيل الفواتير ({invoices.length})
                                </span>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500">
                                        <th className="px-4 py-2 text-right">رقم الفاتورة</th>
                                        <th className="px-4 py-2 text-right">التاريخ</th>
                                        <th className="px-4 py-2 text-right">المبلغ الكلي</th>
                                        <th className="px-4 py-2 text-right">المدفوع</th>
                                        <th className="px-4 py-2 text-right">المتبقي</th>
                                        <th className="px-4 py-2 text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-slate-400"
                                            >
                                                لا توجد فواتير مسجلة
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map(inv => (
                                            <React.Fragment key={inv.id}>
                                                <tr
                                                    className="hover:bg-slate-50 cursor-pointer"
                                                    onClick={() =>
                                                        setExpandedInvoiceId(prev =>
                                                            prev === inv.id
                                                                ? null
                                                                : inv.id || null
                                                        )
                                                    }
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button className="text-slate-400 hover:text-brand-primary transition-colors">
                                                                {expandedInvoiceId === inv.id ? (
                                                                    <TrendingUp className="w-4 h-4" />
                                                                ) : (
                                                                    <TrendingDown className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <span className="font-mono text-brand-primary">
                                                                {inv.invoiceNumber}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatDate(inv.invoiceDate)}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {formatNumber(inv.totalAmount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-emerald-600">
                                                        {formatNumber(inv.paidAmount ?? 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-rose-600">
                                                        {formatNumber(inv.remainingAmount ?? 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                                inv.status === 'Paid'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : inv.status === 'Partial'
                                                                      ? 'bg-amber-100 text-amber-700'
                                                                      : 'bg-rose-100 text-rose-700'
                                                            }`}
                                                        >
                                                            {inv.status === 'Paid'
                                                                ? 'مدفوعة'
                                                                : inv.status === 'Partial'
                                                                  ? 'جزئي'
                                                                  : 'غير مدفوعة'}
                                                        </span>
                                                    </td>
                                                </tr>

                                                {expandedInvoiceId === inv.id &&
                                                    inv.items &&
                                                    inv.items.length > 0 && (
                                                        <tr>
                                                            <td
                                                                colSpan={6}
                                                                className="px-4 py-2 bg-slate-50/50"
                                                            >
                                                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                                                    <div className="px-3 py-2 bg-slate-100 border-b border-slate-200">
                                                                        <span className="text-xs font-bold text-slate-600">
                                                                            أصناف الفاتورة
                                                                        </span>
                                                                    </div>
                                                                    <table className="w-full text-xs">
                                                                        <thead>
                                                                            <tr className="bg-slate-50 text-slate-500">
                                                                                <th className="px-3 py-2 text-right">
                                                                                    الصنف
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    الكمية
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    الوحدة
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    السعر
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    خصم %
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    الضريبة %
                                                                                </th>
                                                                                <th className="px-3 py-2 text-center">
                                                                                    الإجمالي
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-100">
                                                                            {inv.items.map(
                                                                                (item, idx) => (
                                                                                    <tr
                                                                                        key={idx}
                                                                                        className="hover:bg-slate-50"
                                                                                    >
                                                                                        <td className="px-3 py-2 text-slate-700">
                                                                                            {item.itemNameAr}
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-center font-medium text-brand-primary">
                                                                                            {item.quantity}
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-center text-slate-600">
                                                                                            {item.unitNameAr}
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-center font-medium text-emerald-600">
                                                                                            {formatNumber(
                                                                                                item.unitPrice
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-center text-rose-600">
                                                                                            {item.discountPercentage ||
                                                                                                0}
                                                                                            %
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-center text-amber-600">
                                                                                            {item.taxPercentage ||
                                                                                                0}
                                                                                            %
                                                                                        </td>
                                                                                        <td className="px-3 py-2 text-center font-bold text-slate-800">
                                                                                            {formatNumber(
                                                                                                item.totalPrice
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                            </React.Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// --- Order Table Row ---

const OrderTableRow: React.FC<{
    order: PurchaseOrderDto;
    index: number;
    onView: (id: number) => void;
}> = ({ order, index, onView }) => (
    <tr
        className="hover:bg-brand-primary/5 transition-all duration-200 group border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                    #{order.poNumber}
                </span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
            {formatDate(order.poDate!)}
        </td>
        <td className="px-6 py-4 text-sm font-medium text-slate-700">
            {order.supplierNameAr}
        </td>
        <td className="px-6 py-4 text-right">
            <span className="font-bold text-emerald-600">
                {formatNumber(order.totalAmount)} {order.currency}
            </span>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                مغلق
            </span>
        </td>
        <td className="px-6 py-4 text-right">
            <button
                onClick={() => onView(order.id!)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                title="عرض التفاصيل"
            >
                <FileText className="w-4 h-4" />
            </button>
        </td>
    </tr>
);

// --- Loading Skeleton ---

const TableSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                <td colSpan={columns} className="px-6 py-6">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                </td>
            </tr>
        ))}
    </>
);

// --- Empty State ---

const EmptyState: React.FC<{
    icon: React.ElementType;
    message: string;
    columns: number;
}> = ({ icon: Icon, message, columns }) => (
    <tr>
        <td colSpan={columns} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Icon className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد بيانات</h3>
                <p className="text-slate-500 max-w-md mx-auto">{message}</p>
            </div>
        </td>
    </tr>
);

// --- Main Page Component ---

type FilterType = 'All' | 'Debit' | 'Credit';

const SupplierOutstandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'balances' | 'orders'>('balances');
    const [summaries, setSummaries] = useState<SupplierOutstandingDto[]>([]);
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [allInvoices, setAllInvoices] = useState<SupplierInvoiceDto[]>([]);
    const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterType>('All');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [suppliersRes, posRes, invoicesRes] = await Promise.all([
                supplierService.getOutstandingSummary(),
                purchaseOrderService.getAllPOs(),
                supplierInvoiceService.getAllInvoices()
            ]);
            setSummaries(suppliersRes.data || []);
            setOrders(posRes || []);
            setAllInvoices(invoicesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSummaries = useMemo(() => {
        const filtered = summaries.filter(s => {
            const matchesSearch =
                s.supplierNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter =
                filter === 'All' ||
                (filter === 'Debit' && (s.currentBalance || 0) > 0) ||
                (filter === 'Credit' && (s.currentBalance || 0) < 0);

            return matchesSearch && matchesFilter;
        });

        return [...filtered].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    }, [summaries, searchTerm, filter]);

    const filteredOrders = useMemo(() => {
        const filtered = orders.filter(o => {
            const isClosed = o.status === 'Closed';
            const matchesSearch =
                o.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase());
            return isClosed && matchesSearch;
        });

        return [...filtered].sort((a, b) => {
            const dateA = a.poDate ? new Date(a.poDate).getTime() : 0;
            const dateB = b.poDate ? new Date(b.poDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [orders, searchTerm]);

    const stats = useMemo(() => {
        const totalOutstanding = summaries.reduce(
            (acc, curr) => acc + (curr.currentBalance || 0),
            0
        );
        const totalPaid = summaries.reduce(
            (acc, curr) => acc + (curr.totalPaid || 0),
            0
        );
        const totalInvoiced = summaries.reduce(
            (acc, curr) => acc + (curr.totalInvoiced || 0),
            0
        );
        const totalReturned = summaries.reduce(
            (acc, curr) => acc + (curr.totalReturned || 0),
            0
        );
        const providersWithBalance = summaries.filter(
            s => (s.currentBalance || 0) > 0
        ).length;

        const calculatedInvoices = allInvoices.map(inv => calculateInvoiceTotals(inv));
        const totalTax = calculatedInvoices.reduce(
            (sum, inv) => sum + (inv.taxAmount || 0),
            0
        );
        const totalDiscount = calculatedInvoices.reduce(
            (sum, inv) => sum + (inv.discountAmount || 0),
            0
        );
        const totalDelivery = calculatedInvoices.reduce(
            (sum, inv) => sum + (inv.deliveryCost || 0),
            0
        );

        return {
            totalOutstanding: formatNumber(totalOutstanding),
            totalPaid: formatNumber(totalPaid),
            totalInvoiced: formatNumber(totalInvoiced),
            totalReturned: formatNumber(totalReturned),
            totalTax: formatNumber(totalTax),
            totalDiscount: formatNumber(totalDiscount),
            totalDelivery: formatNumber(totalDelivery),
            providersWithBalance
        };
    }, [summaries, allInvoices]);

    const handleViewSupplier = (id: number) => {
        navigate(`/dashboard/procurement/suppliers/${id}`);
    };

    const handleViewOrder = (id: number) => {
        navigate(`/dashboard/procurement/po/${id}`);
    };

    const handleToggleExpand = (id: number) => {
        setExpandedSupplierId(prev => (prev === id ? null : id));
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

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
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
                            <h1 className="text-3xl font-bold mb-2">
                                الأرصدة المستحقة للموردين
                            </h1>
                            <p className="text-white/70 text-lg">
                                متابعة المديونيات، الفواتير، والمدفوعات لكل مورد
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-200">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">تصدير</span>
                        </button>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard
                    icon={Wallet}
                    value={stats.totalOutstanding}
                    label="إجمالي المستحقات"
                    color="rose"
                />
                <StatCard
                    icon={TrendingUp}
                    value={stats.totalInvoiced}
                    label="إجمالي الفواتير"
                    color="blue"
                />
                <StatCard
                    icon={Ban}
                    value={stats.totalDiscount}
                    label="إجمالي الخصومات"
                    color="rose"
                />
                <StatCard
                    icon={Clock}
                    value={stats.totalTax}
                    label="إجمالي الضريبة"
                    color="warning"
                />
                <StatCard
                    icon={Truck}
                    value={stats.totalDelivery}
                    label="إجمالي مصاريف الشحن"
                    color="blue"
                />
                <StatCard
                    icon={TrendingDown}
                    value={stats.totalPaid}
                    label="إجمالي المدفوعات"
                    color="success"
                />
                <StatCard
                    icon={AlertCircle}
                    value={stats.providersWithBalance}
                    label="موردين بمديونية"
                    color="warning"
                />
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 text-blue-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-medium">
                    المعادلة الحسابية: الرصيد الحالي = إجمالي الفواتير - إجمالي المرتجعات -
                    إجمالي المدفوعات
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white w-fit rounded-2xl border border-slate-100 shadow-sm">
                <button
                    onClick={() => setActiveTab('balances')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                        activeTab === 'balances'
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Wallet className="w-4 h-4" />
                    <span>أرصدة الموردين</span>
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                        activeTab === 'orders'
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <ShoppingCart className="w-4 h-4" />
                    <span>أوامر مغلقة</span>
                    {filteredOrders.length > 0 && (
                        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {filteredOrders.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search
                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                isSearchFocused
                                    ? 'text-brand-primary'
                                    : 'text-slate-400'
                            }`}
                        />
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'balances'
                                    ? 'بحث باسم المورد أو كود المورد...'
                                    : 'بحث برقم الأمر أو المورد...'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none bg-slate-50 ${
                                isSearchFocused
                                    ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                    : 'border-transparent hover:border-slate-200'
                            }`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    {activeTab === 'balances' && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent hover:border-slate-200 transition-all duration-200">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                value={filter}
                                onChange={(e) =>
                                    setFilter(e.target.value as FilterType)
                                }
                                className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                            >
                                <option value="All">جميع الأرصدة</option>
                                <option value="Debit">مدين (لهم مستحقات)</option>
                                <option value="Credit">دائن (رصيد مقدم)</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض{' '}
                        <span className="font-bold text-slate-800">
                            {activeTab === 'balances'
                                ? filteredSummaries.length
                                : filteredOrders.length}
                        </span>{' '}
                        من{' '}
                        <span className="font-bold text-slate-800">
                            {activeTab === 'balances'
                                ? summaries.length
                                : orders.filter(o => o.status === 'Closed').length}
                        </span>{' '}
                        {activeTab === 'balances' ? 'مورد' : 'أمر'}
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'balances' ? (
                        <table className="w-full">
                            <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                        المورد
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                                        إجمالي الفواتير
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                                        إجمالي المرتجعات
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                                        إجمالي المدفوعات
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                                        الرصيد الحالي
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                                        حد الائتمان
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                        إجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <TableSkeleton columns={7} />
                                ) : filteredSummaries.length === 0 ? (
                                    <EmptyState
                                        icon={DollarSign}
                                        message="لم يتم العثور على موردين مطابقين للبحث"
                                        columns={7}
                                    />
                                ) : (
                                    filteredSummaries.map((summary, index) => (
                                        <BalanceTableRow
                                            key={summary.id}
                                            summary={summary}
                                            index={index}
                                            onView={handleViewSupplier}
                                            isExpanded={
                                                expandedSupplierId === summary.id
                                            }
                                            onToggleExpand={handleToggleExpand}
                                            invoices={allInvoices.filter(
                                                inv => inv.supplierId === summary.id
                                            )}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gradient-to-l from-slate-50 to-white border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                        رقم الأمر
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                        التاريخ
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                        المورد
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                        الإجمالي
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">
                                        إجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <TableSkeleton columns={6} />
                                ) : filteredOrders.length === 0 ? (
                                    <EmptyState
                                        icon={Package}
                                        message="لا توجد أوامر شراء مغلقة حالياً"
                                        columns={6}
                                    />
                                ) : (
                                    filteredOrders.map((order, index) => (
                                        <OrderTableRow
                                            key={order.id}
                                            order={order}
                                            index={index}
                                            onView={handleViewOrder}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierOutstandingPage;