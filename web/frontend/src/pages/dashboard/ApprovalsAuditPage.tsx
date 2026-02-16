import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, User, Calendar, DollarSign, Filter } from 'lucide-react';
import { approvalService, type ApprovalAuditDto } from '../../services/approvalService';
import { formatDate, formatNumber } from '../../utils/format';

const DOC_TYPE_LABELS: Record<string, string> = {
    PurchaseRequisition: 'طلب شراء',
    PurchaseOrder: 'أمر شراء',
    Supplier: 'مورد',
    GoodsReceiptNote: 'إذن إضافة',
    PurchaseReturn: 'مرتجع مشتريات',
    QuotationComparison: 'مقارنة عروض',
    PaymentVoucher: 'سند صرف',
    SalesOrder: 'أمر بيع',
    SalesDiscount: 'خصم مبيعات',
};

const ACTION_LABELS: Record<string, string> = {
    Approved: 'اعتماد',
    Rejected: 'رفض',
};

export default function ApprovalsAuditPage() {
    const [items, setItems] = useState<ApprovalAuditDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [docTypeFilter, setDocTypeFilter] = useState<string>('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        approvalService.getRecentAudit(100)
            .then((data) => { if (!cancelled) setItems(data); })
            .catch(() => { if (!cancelled) setItems([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filtered = docTypeFilter
        ? items.filter((i) => i.documentType === docTypeFilter)
        : items;
    const docTypes = Array.from(new Set(items.map((i) => i.documentType))).sort();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-7 h-7 text-brand-primary" />
                        سجل الاعتمادات
                    </h1>
                    <p className="text-slate-500 mt-1">
                        آخر الإجراءات — من اعتمد ومتى (شفافية ومراجعة)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white"
                    >
                        <option value="">كل الأنواع</option>
                        {docTypes.map((dt) => (
                            <option key={dt} value={dt}>
                                {DOC_TYPE_LABELS[dt] ?? dt}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            approvalService.getRecentAudit(100)
                                .then(setItems)
                                .finally(() => setLoading(false));
                        }}
                        disabled={loading}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                        <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading && items.length === 0 ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                    لا توجد سجلات اعتماد لعرضها.
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">النوع</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">رقم المستند</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">سير العمل</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">الخطوة</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">الإجراء</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">المُعتمد</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">التاريخ</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((row) => (
                                    <tr key={row.actionId} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {DOC_TYPE_LABELS[row.documentType] ?? row.documentType}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                            {row.documentNumber || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.workflowName}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{row.stepName}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                                    row.actionType === 'Approved'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700'
                                                }`}
                                            >
                                                {ACTION_LABELS[row.actionType] ?? row.actionType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{row.actionByUser}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {row.actionDate ? formatDate(row.actionDate) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {row.totalAmount != null ? formatNumber(row.totalAmount) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
