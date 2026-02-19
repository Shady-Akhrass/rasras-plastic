import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History,
    Search,
    RefreshCw,
    FileText,
    User,
    Calendar,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Loader2,
    Filter,
} from 'lucide-react';
import { approvalService, type ApprovalAuditDto } from '../../services/approvalService';
import { formatDate, formatTime, formatNumber } from '../../utils/format';
import toast from 'react-hot-toast';

const DOC_TYPE_LABELS: Record<string, string> = {
    PurchaseRequisition: 'طلب شراء',
    PR: 'طلب شراء',
    PurchaseOrder: 'أمر شراء',
    PO: 'أمر شراء',
    GoodsReceiptNote: 'إذن إضافة',
    GRN: 'إذن إضافة',
    QuotationComparison: 'مقارنة عروض',
    QC: 'مقارنة عروض',
    PurchaseReturn: 'مرتجع مشتريات',
    Supplier: 'مورد',
    PaymentVoucher: 'سند صرف',
    PV: 'سند صرف',
    SalesOrder: 'أمر بيع',
    SO: 'أمر بيع',
    SalesQuotation: 'عرض أسعار مبيعات',
    SalesInvoice: 'فاتورة مبيعات',
    DeliveryOrder: 'أمر تسليم',
    StockIssueNote: 'إذن صرف',
    PaymentReceipt: 'سند قبض',
    CustomerRequest: 'طلب عميل',
    CR: 'طلب عميل',
};

const ACTION_LABELS: Record<string, string> = {
    Approved: 'اعتماد',
    Rejected: 'رفض',
    Submitted: 'إرسال',
    Delegated: 'تفويض',
};

const STATUS_LABELS: Record<string, string> = {
    Approved: 'معتمد',
    Rejected: 'مرفوض',
    Pending: 'قيد الانتظار',
    Completed: 'مكتمل',
    Cancelled: 'ملغى',
};

const TYPE_ROUTES: Record<string, string> = {
    PR: '/dashboard/procurement/pr',
    PurchaseRequisition: '/dashboard/procurement/pr',
    RFQ: '/dashboard/procurement/rfq',
    SQ: '/dashboard/procurement/quotation',
    SupplierQuotation: '/dashboard/procurement/quotation',
    QC: '/dashboard/procurement/comparison',
    QuotationComparison: '/dashboard/procurement/comparison',
    PO: '/dashboard/procurement/po',
    PurchaseOrder: '/dashboard/procurement/po',
    GRN: '/dashboard/procurement/grn',
    GoodsReceiptNote: '/dashboard/procurement/grn',
    SINV: '/dashboard/procurement/invoices',
    SupplierInvoice: '/dashboard/procurement/invoices',
    PurchaseReturn: '/dashboard/procurement/returns',
    PaymentVoucher: '/dashboard/finance/payment-vouchers',
    PV: '/dashboard/finance/payment-vouchers',
    Supplier: '/dashboard/procurement/suppliers',
    SO: '/dashboard/sales/orders',
    SalesOrder: '/dashboard/sales/orders',
    SalesQuotation: '/dashboard/sales/quotations',
    SalesInvoice: '/dashboard/sales/invoices',
    DeliveryOrder: '/dashboard/sales/delivery-orders',
    StockIssueNote: '/dashboard/sales/issue-notes',
    PaymentReceipt: '/dashboard/sales/receipts',
    CustomerRequest: '/dashboard/sales/customer-requests',
    CR: '/dashboard/sales/customer-requests',
};

const ApprovalAuditPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [audit, setAudit] = useState<ApprovalAuditDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('All');
    const [docTypeFilter, setDocTypeFilter] = useState<string>('All');

    const fetchAudit = useCallback(async () => {
        try {
            setLoading(true);
            const data = await approvalService.getRecentAudit(500);
            setAudit(data);
        } catch (err) {
            console.error('Failed to fetch approval audit:', err);
            toast.error('فشل تحميل سجل الاعتماد');
            setAudit([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAudit();
    }, [fetchAudit]);

    const filtered = React.useMemo(() => {
        const term = searchTerm.toLowerCase();
        return audit.filter((row) => {
            const matchesSearch =
                !term ||
                row.documentNumber?.toLowerCase().includes(term) ||
                row.actionByUser?.toLowerCase().includes(term) ||
                row.workflowName?.toLowerCase().includes(term) ||
                row.comments?.toLowerCase().includes(term);
            const matchesAction = actionFilter === 'All' || row.actionType === actionFilter;
            const matchesType = docTypeFilter === 'All' || row.documentType === docTypeFilter;
            return matchesSearch && matchesAction && matchesType;
        });
    }, [audit, searchTerm, actionFilter, docTypeFilter]);

    const docTypes = React.useMemo(
        () => Array.from(new Set(audit.map((r) => r.documentType))).sort(),
        [audit]
    );
    const actionTypes = React.useMemo(
        () => Array.from(new Set(audit.map((r) => r.actionType))).sort(),
        [audit]
    );

    const getDocLabel = (type: string) => DOC_TYPE_LABELS[type] || type || '—';
    const getActionLabel = (type: string) => ACTION_LABELS[type] || type || '—';
    const getStatusLabel = (status: string | undefined) =>
        status ? (STATUS_LABELS[status] || status) : '—';

    const handleViewDocument = (row: ApprovalAuditDto) => {
        const route = TYPE_ROUTES[row.documentType];
        if (route) {
            navigate(`${route}/${row.documentId}`);
        } else {
            toast.error('لا يوجد مسار لهذا المستند');
        }
    };

    return (
        <div className="space-y-5 pb-8">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl p-7 lg:p-9 text-white">
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/[0.04] rounded-full blur-2xl" />
                <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <History className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black tracking-tight">سجل الاعتماد</h1>
                            <p className="text-white/60 text-base mt-1">
                                تاريخ إجراءات الاعتماد والرفض على المستندات
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={fetchAudit}
                        disabled={loading}
                        className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 border border-white/10 disabled:opacity-50"
                        title="تحديث"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <Filter className="w-4 h-4" />
                    فلاتر
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="بحث برقم المستند أو اسم المعتمد..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
                        />
                    </div>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-brand-primary outline-none"
                    >
                        <option value="All">كل الإجراءات</option>
                        {actionTypes.map((t) => (
                            <option key={t} value={t}>
                                {getActionLabel(t)}
                            </option>
                        ))}
                    </select>
                    <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-brand-primary outline-none"
                    >
                        <option value="All">كل المستندات</option>
                        {docTypes.map((t) => (
                            <option key={t} value={t}>
                                {getDocLabel(t)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-slate-500">
                        <History className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="font-bold">لا توجد سجلات</p>
                        <p className="text-sm mt-1">
                            {audit.length === 0
                                ? 'لم يُسجّل أي إجراء اعتماد حتى الآن'
                                : 'لا توجد نتائج مطابقة للفلاتر'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">نوع المستند</th>
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">رقم المستند</th>
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">الإجراء</th>
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">من اعتمد</th>
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">التاريخ والوقت</th>
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">الحالة</th>
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">المبلغ</th>
                                    <th className="text-right py-4 px-4 font-bold text-slate-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, idx) => (
                                    <tr
                                        key={row.actionId ?? idx}
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="inline-flex px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                                                {getDocLabel(row.documentType)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 font-mono text-slate-700">
                                            #{row.documentNumber || '—'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium
                                                    ${row.actionType === 'Approved'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : row.actionType === 'Rejected'
                                                        ? 'bg-rose-50 text-rose-700'
                                                        : 'bg-slate-100 text-slate-600'}`}
                                            >
                                                {row.actionType === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                {row.actionType === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                                                {getActionLabel(row.actionType)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            {row.actionByUser || '—'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {row.actionDate
                                                    ? `${formatDate(row.actionDate)} ${formatTime(row.actionDate)}`
                                                    : '—'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`px-2 py-1 rounded-lg text-xs font-medium
                                                    ${row.requestStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' : ''}
                                                    ${row.requestStatus === 'Rejected' ? 'bg-rose-50 text-rose-700' : ''}
                                                    ${row.requestStatus === 'Pending' ? 'bg-amber-50 text-amber-700' : ''}
                                                    ${!['Approved','Rejected','Pending'].includes(row.requestStatus || '') ? 'bg-slate-100 text-slate-600' : ''}`}
                                            >
                                                {getStatusLabel(row.requestStatus)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 font-bold text-slate-700 tabular-nums">
                                            {(row.totalAmount ?? 0) > 0 ? formatNumber(row.totalAmount) : '—'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => handleViewDocument(row)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 font-medium transition-colors"
                                            >
                                                <ArrowRight className="w-3.5 h-3.5" />
                                                عرض
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>
                        عرض <span className="font-bold text-slate-700">{filtered.length}</span> سجل
                    </span>
                </div>
            )}
        </div>
    );
};

export default ApprovalAuditPage;
