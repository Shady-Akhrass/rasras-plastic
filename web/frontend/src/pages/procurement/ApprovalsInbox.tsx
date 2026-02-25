import React, { useState, useEffect, useMemo, useOptimistic, useTransition, useCallback, useRef } from 'react';
import {
    Bell,
    Clock,
    FileText,
    User,
    Calendar,
    DollarSign,
    AlertCircle,
    Package,
    ShoppingCart,
    Tag,
    Scale,
    Eye,
    Search,
    RefreshCw,
    XCircle,
    CheckCircle2,
    RotateCcw,
    Warehouse,
    Archive,
    Inbox,
    X,
    ChevronDown,
    Loader2,
    SlidersHorizontal,
    WifiOff,
    Volume2,
    VolumeX,
    BellRing,
    Radio,
    MessageSquare,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { approvalService, type ApprovalRequestDto } from '../../services/approvalService';
import { customerRequestService } from '../../services/customerRequestService';
import type { CustomerRequest } from '../../types/sales';
import { REFRESH_DATA_EVENT } from '../../hooks/useNotificationPolling';
import { formatNumber, formatDate } from '../../utils/format';
import { grnService } from '../../services/grnService';
import warehouseService from '../../services/warehouseService';
import { paymentVoucherService } from '../../services/paymentVoucherService';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════
// ─── Arabic Translations ───
// ════════════════════════════════════════════
const WORKFLOW_NAME_AR: Record<string, string> = {
    'Purchase Requisition Approval': 'اعتماد طلب الشراء',
    'Purchase Order Approval': 'اعتماد أمر الشراء',
    'Supplier Approval': 'اعتماد المورد',
    'Goods Receipt Note Approval': 'اعتماد إذن الاستلام',
    'Purchase Return Approval': 'اعتماد مرتجع المشتريات',
    'Quotation Comparison Approval': 'اعتماد مقارنة العروض',
    'Payment Voucher Approval': 'اعتماد سند صرف',
    'Sales Quotation Approval': 'اعتماد عرض سعر مبيعات',
    'Stock Issue Note Approval': 'اعتماد إذن صرف',
};
const STEP_NAME_AR: Record<string, string> = {
    'Procurement Manager Approval': 'اعتماد مدير المشتريات',
    'Finance Manager Approval': 'اعتماد المدير المالي',
    'General Manager Approval': 'اعتماد المدير العام',
    'Quality Controller Approval': 'اعتماد مراقب الجودة',
    'Sales Manager Approval': 'اعتماد مدير المبيعات',
    'Payment Disbursement': 'صرف الدفعة',
};
const tr = (en: string | undefined, map: Record<string, string>) =>
    en && map[en] ? map[en] : en || '';

// ════════════════════════════════════════════
// ─── Document Type Config ───
// ════════════════════════════════════════════
const DOC_TYPE_CONFIGS: Record<string, {
    label: string; bg: string; text: string; icon: React.ElementType; gradient: string;
}> = {
    PurchaseRequisition: { label: 'طلب شراء', bg: 'bg-violet-50', text: 'text-violet-600', icon: FileText, gradient: 'from-violet-500 to-purple-600' },
    PR: { label: 'طلب شراء', bg: 'bg-violet-50', text: 'text-violet-600', icon: FileText, gradient: 'from-violet-500 to-purple-600' },
    RFQ: { label: 'طلب عروض أسعار', bg: 'bg-amber-50', text: 'text-amber-600', icon: FileText, gradient: 'from-amber-500 to-orange-600' },
    SupplierQuotation: { label: 'عرض مورد', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Tag, gradient: 'from-emerald-500 to-teal-600' },
    SQ: { label: 'عرض مورد', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Tag, gradient: 'from-emerald-500 to-teal-600' },
    QuotationComparison: { label: 'مقارنة عروض', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Scale, gradient: 'from-indigo-500 to-blue-600' },
    QC: { label: 'مقارنة عروض', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Scale, gradient: 'from-indigo-500 to-blue-600' },
    PurchaseOrder: { label: 'أمر شراء', bg: 'bg-blue-50', text: 'text-blue-600', icon: ShoppingCart, gradient: 'from-blue-500 to-cyan-600' },
    PO: { label: 'أمر شراء', bg: 'bg-blue-50', text: 'text-blue-600', icon: ShoppingCart, gradient: 'from-blue-500 to-cyan-600' },
    PurchaseReturn: { label: 'مرتجع مشتريات', bg: 'bg-rose-50', text: 'text-rose-600', icon: RotateCcw, gradient: 'from-rose-500 to-pink-600' },
    GoodsReceiptNote: { label: 'إذن إضافة', bg: 'bg-cyan-50', text: 'text-cyan-600', icon: Package, gradient: 'from-cyan-500 to-teal-600' },
    GRN: { label: 'إذن إضافة', bg: 'bg-cyan-50', text: 'text-cyan-600', icon: Package, gradient: 'from-cyan-500 to-teal-600' },
    SupplierInvoice: { label: 'فاتورة مورد', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign, gradient: 'from-rose-500 to-red-600' },
    SINV: { label: 'فاتورة مورد', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign, gradient: 'from-rose-500 to-red-600' },
    SalesOrder: { label: 'أمر بيع', bg: 'bg-sky-50', text: 'text-sky-600', icon: ShoppingCart, gradient: 'from-sky-500 to-blue-600' },
    SO: { label: 'أمر بيع', bg: 'bg-sky-50', text: 'text-sky-600', icon: ShoppingCart, gradient: 'from-sky-500 to-blue-600' },
    PaymentVoucher: { label: 'سند صرف', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign, gradient: 'from-rose-500 to-red-600' },
    PV: { label: 'سند صرف', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign, gradient: 'from-rose-500 to-red-600' },
    ReceiptVoucher: { label: 'سند قبض', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: DollarSign, gradient: 'from-emerald-500 to-green-600' },
    RV: { label: 'سند قبض', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: DollarSign, gradient: 'from-emerald-500 to-green-600' },
    Supplier: { label: 'مورد', bg: 'bg-slate-50', text: 'text-slate-600', icon: Package, gradient: 'from-slate-500 to-gray-600' },
    CustomerRequest: { label: 'طلب عميل', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', icon: MessageSquare, gradient: 'from-fuchsia-500 to-pink-600' },
    CR: { label: 'طلب عميل', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', icon: MessageSquare, gradient: 'from-fuchsia-500 to-pink-600' },
    SalesQuotation: { label: 'عرض سعر مبيعات', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Tag, gradient: 'from-indigo-500 to-blue-600' },
    StockIssueNote: { label: 'إذن صرف', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Package, gradient: 'from-emerald-500 to-teal-600' },
};

const getDocTypeConfig = (type: string) =>
    DOC_TYPE_CONFIGS[type] || { label: type || 'طلب', bg: 'bg-slate-50', text: 'text-slate-600', icon: FileText, gradient: 'from-slate-500 to-gray-600' };

const TYPE_ROUTES: Record<string, string> = {
    PR: '/dashboard/procurement/pr', PurchaseRequisition: '/dashboard/procurement/pr',
    RFQ: '/dashboard/procurement/rfq',
    SQ: '/dashboard/procurement/quotation', SupplierQuotation: '/dashboard/procurement/quotation',
    QC: '/dashboard/procurement/comparison', QuotationComparison: '/dashboard/procurement/comparison',
    PO: '/dashboard/procurement/po', PurchaseOrder: '/dashboard/procurement/po',
    GRN: '/dashboard/procurement/grn', GoodsReceiptNote: '/dashboard/procurement/grn',
    SINV: '/dashboard/finance/invoices', SupplierInvoice: '/dashboard/finance/invoices',
    PurchaseReturn: '/dashboard/procurement/returns',
    PaymentVoucher: '/dashboard/finance/payment-vouchers',
    PV: '/dashboard/finance/payment-vouchers',
    Supplier: '/dashboard/procurement/suppliers',
    CustomerRequest: '/dashboard/sales/customer-requests',
    CR: '/dashboard/sales/customer-requests',
    SalesQuotation: '/dashboard/sales/quotations',
    StockIssueNote: '/dashboard/sales/issue-notes',
};

const isGRNType = (t: string) => t === 'GoodsReceiptNote' || t === 'GRN';

type OptimisticAction = { type: 'remove'; id: number };

const FILTER_OPTIONS = [
    { value: 'All', label: 'الكل', icon: SlidersHorizontal },
    { value: 'PR', label: 'طلبات شراء', icon: FileText },
    { value: 'PurchaseOrder', label: 'أوامر شراء', icon: ShoppingCart },
    { value: 'GoodsReceiptNote', label: 'أذونات إضافة', icon: Package },
    { value: 'QuotationComparison', label: 'مقارنة عروض', icon: Scale },
    { value: 'PurchaseReturn', label: 'مرتجعات', icon: RotateCcw },
    { value: 'Supplier', label: 'موردين', icon: Tag },
    { value: 'PaymentVoucher', label: 'سندات صرف', icon: DollarSign },
    { value: 'CustomerRequest', label: 'طلبات عملاء', icon: MessageSquare },
    { value: 'SalesQuotation', label: 'عروض أسعار مبيعات', icon: Tag },
    { value: 'StockIssueNote', label: 'إذونات صرف', icon: Package },
] as const;

// ════════════════════════════════════════════
// ─── Notification Helpers ───
// ════════════════════════════════════════════
const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
};

// ════════════════════════════════════════════
// ─── useAutoRefresh Hook ───
// Smart polling with adaptive intervals
// ════════════════════════════════════════════
const useAutoRefresh = (
    fetchFn: (silent: boolean) => Promise<void>,
    options: {
        activeInterval?: number;   // When tab is active (ms)
        inactiveInterval?: number; // When tab is hidden (ms)
        enabled?: boolean;
    } = {}
) => {
    const {
        activeInterval = 15_000,   // 15 seconds when active
        inactiveInterval = 60_000, // 60 seconds when hidden
        enabled = true,
    } = options;

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);
    const isVisibleRef = useRef(!document.hidden);
    const lastFetchRef = useRef(0);

    const scheduleNext = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!mountedRef.current || !enabled) return;

        const interval = isVisibleRef.current ? activeInterval : inactiveInterval;
        timerRef.current = setTimeout(async () => {
            if (!mountedRef.current) return;
            lastFetchRef.current = Date.now();
            await fetchFn(true);
            scheduleNext();
        }, interval);
    }, [fetchFn, activeInterval, inactiveInterval, enabled]);

    useEffect(() => {
        mountedRef.current = true;

        const handleVisibility = () => {
            isVisibleRef.current = !document.hidden;
            if (!document.hidden) {
                // Tab became visible — immediate refresh if stale (>10s)
                const stale = Date.now() - lastFetchRef.current > 10_000;
                if (stale && mountedRef.current) {
                    fetchFn(true);
                    lastFetchRef.current = Date.now();
                }
                scheduleNext(); // Reset to active interval
            }
        };

        const handleOnline = () => {
            if (mountedRef.current) {
                toast.success('تم استعادة الاتصال');
                fetchFn(true);
                lastFetchRef.current = Date.now();
                scheduleNext();
            }
        };

        const handleFocus = () => {
            // Also refresh on window focus (e.g., alt-tab back)
            const stale = Date.now() - lastFetchRef.current > 10_000;
            if (stale && mountedRef.current) {
                fetchFn(true);
                lastFetchRef.current = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('online', handleOnline);
        window.addEventListener('focus', handleFocus);

        if (enabled) scheduleNext();

        return () => {
            mountedRef.current = false;
            if (timerRef.current) clearTimeout(timerRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('focus', handleFocus);
        };
    }, [scheduleNext, fetchFn, enabled]);

    const stop = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return { stop };
};

// ════════════════════════════════════════════
// ─── Connection Status Badge ───
// ════════════════════════════════════════════
const ConnectionBadge: React.FC<{ isOnline: boolean; isPolling: boolean; lastRefresh: number }> = ({
    isOnline, isPolling, lastRefresh,
}) => {
    const [, forceUpdate] = useState(0);
    useEffect(() => {
        const t = setInterval(() => forceUpdate(v => v + 1), 10_000);
        return () => clearInterval(t);
    }, []);

    const secondsAgo = lastRefresh ? Math.floor((Date.now() - lastRefresh) / 1000) : 0;
    const timeLabel = secondsAgo < 5 ? 'الآن' : secondsAgo < 60 ? `منذ ${secondsAgo} ث` : `منذ ${Math.floor(secondsAgo / 60)} د`;

    if (!isOnline) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-xs font-medium text-white/90 border border-rose-400/20">
                <WifiOff className="w-3 h-3" />
                <span>غير متصل</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium text-white/80 border border-white/10">
            <span className="relative flex h-2 w-2">
                {isPolling && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPolling ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
            </span>
            <Radio className="w-3 h-3" />
            <span>تحديث تلقائي · {timeLabel}</span>
        </div>
    );
};

// ════════════════════════════════════════════
// ─── New Requests Banner ───
// ════════════════════════════════════════════
const NewRequestsBanner: React.FC<{ count: number; onDismiss: () => void }> = ({ count, onDismiss }) => {
    if (count <= 0) return null;
    return (
        <div
            className="bg-gradient-to-l from-brand-primary to-brand-primary/90 text-white 
                rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-brand-primary/20 
                border border-brand-primary/20"
            style={{ animation: 'slideDown 0.4s ease-out forwards' }}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                    <BellRing className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                    <span className="font-bold">
                        {count === 1 ? 'طلب اعتماد جديد!' : count === 2 ? 'طلبا اعتماد جديدان!' : `${count} طلبات اعتماد جديدة!`}
                    </span>
                    <p className="text-white/60 text-xs mt-0.5">تم إضافتها تلقائياً للقائمة</p>
                </div>
            </div>
            <button onClick={onDismiss} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// ════════════════════════════════════════════
// ─── Stat Card ───
// ════════════════════════════════════════════
const StatCard: React.FC<{
    icon: React.ElementType; value: number; label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose' | 'cyan';
    highlight?: boolean;
}> = ({ icon: Icon, value, label, color, highlight }) => {
    const palettes: Record<string, { iconBg: string; iconText: string }> = {
        primary: { iconBg: 'bg-brand-primary/10', iconText: 'text-brand-primary' },
        success: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
        warning: { iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
        purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
        blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
        rose: { iconBg: 'bg-rose-100', iconText: 'text-rose-600' },
        cyan: { iconBg: 'bg-cyan-100', iconText: 'text-cyan-600' },
    };
    const p = palettes[color];

    return (
        <div className={`bg-white p-5 rounded-2xl border-2 transition-all duration-300 group 
            hover:shadow-md ${highlight ? 'border-brand-primary/30 ring-2 ring-brand-primary/10 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${p.iconBg} ${p.iconText} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className={`text-2xl font-black tabular-nums ${highlight ? 'text-brand-primary' : 'text-slate-800'}`}>
                        {value}
                    </div>
                    <div className="text-xs text-slate-500 font-medium truncate">{label}</div>
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════
// ─── Request Card ───
// ════════════════════════════════════════════
const RequestCard: React.FC<{
    request: ApprovalRequestDto; index: number;
    onApprove: (r: ApprovalRequestDto) => void;
    onReject: (id: number) => void;
    processingId: number | null;
    isRemoving?: boolean;
    isNew?: boolean;
}> = ({ request, index, onApprove, onReject, processingId, isRemoving, isNew }) => {
    const config = getDocTypeConfig(request.documentType);
    const DocIcon = config.icon;
    const navigate = useNavigate();
    const isProcessing = processingId === request.id;

    const handleViewDocument = () => {
        const route = TYPE_ROUTES[request.documentType];
        if (route) {
            navigate(`${route}/${request.documentId}?mode=view&approvalId=${request.id}`);
        } else {
            toast.error('لم يتم تحديد مسار لهذا المستند');
        }
    };

    const daysSinceRequest = useMemo(() => {
        if (!request.requestedDate) return 0;
        return Math.floor((Date.now() - new Date(request.requestedDate).getTime()) / 86400000);
    }, [request.requestedDate]);

    return (
        <div
            className={`group relative bg-white rounded-2xl border overflow-hidden
                transition-all duration-500
                ${isNew
                    ? 'border-brand-primary/40 shadow-lg shadow-brand-primary/10 ring-2 ring-brand-primary/20'
                    : 'border-slate-100 hover:border-slate-200'}
                hover:shadow-xl hover:shadow-slate-200/50
                ${isRemoving ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'}`}
            style={{
                animationDelay: `${index * 60}ms`,
                animation: isNew ? 'newItemGlow 0.6s ease-out forwards' : 'fadeSlideIn 0.5s ease-out forwards',
            }}
        >
            {/* Top accent */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-l ${config.gradient} 
                ${isNew ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`} />

            {/* New badge */}
            {isNew && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary text-white text-[10px] font-bold rounded-lg shadow-lg shadow-brand-primary/30">
                        <BellRing className="w-3 h-3 animate-bounce" />
                        جديد
                    </span>
                </div>
            )}

            {/* Priority corner */}
            {request.priority === 'High' && (
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[36px] border-l-rose-500 border-b-[36px] border-b-transparent z-10">
                    <AlertCircle className="absolute -top-[2px] -left-[30px] w-3.5 h-3.5 text-white" />
                </div>
            )}

            <div className="p-5 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Document Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`relative p-3.5 rounded-2xl ${config.bg} ${config.text} 
                            group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                            <DocIcon className="w-6 h-6" />
                            {daysSinceRequest > 3 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </div>
                        <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-1 ${config.bg} ${config.text} rounded-lg text-xs font-bold`}>
                                    {config.label}
                                </span>
                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                                    #{request.documentNumber}
                                </span>
                                {request.priority === 'High' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold border border-rose-200">
                                        <AlertCircle className="w-3 h-3" />عاجل
                                    </span>
                                )}
                                {daysSinceRequest > 0 && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                                        ${daysSinceRequest > 3 ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                                        منذ {daysSinceRequest} {daysSinceRequest === 1 ? 'يوم' : 'أيام'}
                                    </span>
                                )}
                            </div>

                            <h3 className="font-bold text-slate-800 text-base lg:text-lg group-hover:text-brand-primary transition-colors truncate">
                                {tr(request.workflowName, WORKFLOW_NAME_AR)}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium">{request.requestedByName || 'غير محدد'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{formatDate(request.requestedDate)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-brand-primary font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs">{tr(request.currentStepName, STEP_NAME_AR)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amount */}
                    {(request.totalAmount ?? 0) > 0 && (
                        <div className="flex flex-row lg:flex-col justify-center items-center lg:items-end 
                            px-5 lg:border-x border-slate-100/80 min-w-[140px] gap-2 lg:gap-0">
                            <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">إجمالي</div>
                            <div className="text-xl lg:text-2xl font-black text-slate-800 tabular-nums">
                                {formatNumber(request.totalAmount ?? 0)}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">ج.م</div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col justify-center gap-2 min-w-[140px]">
                        <button
                            onClick={handleViewDocument}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 
                                bg-slate-50 text-slate-600 rounded-xl font-bold text-sm
                                hover:bg-slate-100 hover:text-slate-800
                                transition-all duration-200 active:scale-95"
                        >
                            <Eye className="w-4 h-4" /><span>عرض</span>
                        </button>
                        <button
                            onClick={() => onApprove(request)}
                            disabled={isProcessing}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 
                                bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-sm
                                hover:from-emerald-600 hover:to-emerald-700
                                shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
                                transition-all duration-200 active:scale-95
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>اعتماد</span>
                        </button>
                        <button
                            onClick={() => onReject(request.id)}
                            disabled={isProcessing}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 
                                bg-white text-rose-500 border-2 border-rose-200 rounded-xl font-bold text-sm
                                hover:bg-rose-50 hover:border-rose-300
                                transition-all duration-200 active:scale-95
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <XCircle className="w-4 h-4" /><span>رفض</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ════════════════════════════════════════════
// ─── Skeleton ───
// ════════════════════════════════════════════
const RequestSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex-shrink-0" />
                        <div className="space-y-3 flex-1">
                            <div className="flex gap-2">
                                <div className="h-6 w-24 bg-slate-100 rounded-lg" />
                                <div className="h-5 w-16 bg-slate-50 rounded" />
                            </div>
                            <div className="h-5 w-3/4 bg-slate-100 rounded" />
                            <div className="flex gap-4">
                                <div className="h-4 w-28 bg-slate-50 rounded" />
                                <div className="h-4 w-20 bg-slate-50 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 min-w-[130px]">
                        <div className="h-3 w-12 bg-slate-50 rounded" />
                        <div className="h-7 w-24 bg-slate-100 rounded" />
                    </div>
                    <div className="flex flex-col gap-2 min-w-[130px]">
                        <div className="h-10 w-full bg-slate-50 rounded-xl" />
                        <div className="h-10 w-full bg-slate-100 rounded-xl" />
                        <div className="h-10 w-full bg-slate-50 rounded-xl" />
                    </div>
                </div>
            </div>
        ))}
    </>
);

// ════════════════════════════════════════════
// ─── Empty State ───
// ════════════════════════════════════════════
const EmptyState: React.FC<{ searchTerm: string; hasFilters: boolean; onClearFilters: () => void }> = ({
    searchTerm, hasFilters, onClearFilters,
}) => (
    <div className="bg-gradient-to-b from-white to-slate-50/50 py-20 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="text-center">
            <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl flex items-center justify-center shadow-inner">
                {searchTerm || hasFilters
                    ? <Search className="w-14 h-14 text-slate-300" />
                    : <Inbox className="w-14 h-14 text-slate-300" />}
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
                {searchTerm ? 'لا توجد نتائج مطابقة' : hasFilters ? 'لا توجد طلبات بهذا الفلتر' : 'لا توجد طلبات معلقة'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
                {searchTerm ? `لم يتم العثور على طلبات تطابق "${searchTerm}"` : hasFilters ? 'جرّب تغيير الفلتر أو إزالته' : 'أحسنت! لا توجد طلبات تحتاج لاعتمادك حالياً 🎉'}
            </p>
            {(searchTerm || hasFilters) && (
                <button onClick={onClearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors">
                    <RotateCcw className="w-4 h-4" />مسح الفلاتر
                </button>
            )}
        </div>
    </div>
);

// ════════════════════════════════════════════════════
// ─── MAIN COMPONENT ───
// ════════════════════════════════════════════════════
const ApprovalsInbox: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialType = new URLSearchParams(location.search).get('type') || 'All';

    // ─── Core State ───
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>(initialType);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

    // ─── Real-time State ───
    const [newRequestIds, setNewRequestIds] = useState<Set<number>>(new Set());
    const [newRequestsCount, setNewRequestsCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(() => {
        try { return localStorage.getItem('approvals_sound') !== 'off'; } catch { return true; }
    });
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastRefresh, setLastRefresh] = useState(0);

    // ─── Refs ───
    const previousIdsRef = useRef<Set<number>>(new Set());
    const isInitialLoadRef = useRef(true);
    const mountedRef = useRef(true);

    // ─── Optimistic ───
    const [optimisticRequests, addOptimistic] = useOptimistic(
        requests,
        (state: ApprovalRequestDto[], action: OptimisticAction) => {
            if (action.type === 'remove') return state.filter(r => r.id !== action.id);
            return state;
        }
    );
    const [isPending, startTransition] = useTransition();

    // ─── Warehouse Modal ───
    const [warehouseModal, setWarehouseModal] = useState<{
        show: boolean; request: ApprovalRequestDto | null;
        warehouses: { id: number; warehouseNameAr: string }[];
        selectedWarehouseId: number; loading: boolean;
    }>({ show: false, request: null, warehouses: [], selectedWarehouseId: 0, loading: false });

    // ─── Get Current User ───
    // طلبات الاعتماد تُفلتر حسب المستخدم الحالي؛ استخدام userId خاطئ يعرض طلبات مستخدم آخر.
    // مصدر الحقيقة: تسجيل الدخول و /auth/me يخزنان userId في localStorage (محدّث عبر refreshUserPermissions).
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const currentUserId = user?.userId ?? user?.id ?? 1;

    // ─── Sound toggle persist ───
    useEffect(() => {
        try { localStorage.setItem('approvals_sound', soundEnabled ? 'on' : 'off'); } catch { /* */ }
    }, [soundEnabled]);

    // ─── Online/Offline ───
    useEffect(() => {
        const on = () => setIsOnline(true);
        const off = () => { setIsOnline(false); toast.error('انقطع الاتصال بالإنترنت'); };
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
    }, []);

    // ─── Fetch Function ───
    const fetchRequests = useCallback(async (silent = false) => {
        if (!mountedRef.current) return;
        try {
            if (!silent) setLoading(true);

            const currentUserJson = localStorage.getItem('user');
            const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
            const uid = currentUser?.userId ?? currentUser?.id ?? currentUserId;
            const permissions: string[] = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
            // طلبات العملاء يسمح بها الـ API فقط لـ SECTION_SALES (لا SECTION_OPERATIONS) → تجنب 403
            const canFetchCustomerRequests = permissions.includes('SECTION_SALES');

            const promises: Promise<any>[] = [
                approvalService.getPendingRequests(uid),
            ];
            if (canFetchCustomerRequests) {
                promises.push(customerRequestService.getAllRequests());
            }

            const results = await Promise.all(promises);
            const approvalsData = results[0];
            const crsData = results.length > 1 ? results[1] : { data: [] };

            const approvals: ApprovalRequestDto[] = approvalsData.data || [];

            // Map pending CRs to ApprovalRequestDto format (only if we fetched them)
            const crs: ApprovalRequestDto[] = (crsData?.data || [])
                .filter((cr: CustomerRequest) => cr.status === 'Pending')
                .map((cr: CustomerRequest) => ({
                    id: cr.requestId || 0,
                    documentType: 'CustomerRequest',
                    documentId: cr.requestId || 0,
                    documentNumber: cr.requestNumber || `CR-${cr.requestId}`,
                    requesterId: cr.customerId,
                    requestedByName: 'Customer', // Or fetch customer name if available
                    requestedDate: cr.requestDate ? new Date(cr.requestDate).toISOString() : new Date().toISOString(),
                    status: 'Pending',
                    currentStepName: 'Sales Manager Approval', // Hardcoded for now
                    workflowName: 'Customer Request Approval',
                    priority: 'Normal',
                    totalAmount: 0 // CRs don't have amount yet
                }));

            const fetched = [...approvals, ...crs];

            if (!mountedRef.current) return;
            setLastRefresh(Date.now());

            // ─── Detect NEW requests (skip on first load) ───
            if (!isInitialLoadRef.current) {
                const fetchedIds = new Set(fetched.map(r => r.id));
                const brandNew = new Set<number>();
                fetchedIds.forEach(id => {
                    if (!previousIdsRef.current.has(id)) brandNew.add(id);
                });

                if (brandNew.size > 0) {
                    setNewRequestIds(prev => new Set([...prev, ...brandNew]));
                    setNewRequestsCount(prev => prev + brandNew.size);

                    const count = brandNew.size;
                    toast(`${count === 1 ? 'طلب اعتماد جديد' : `${count} طلبات اعتماد جديدة`}`, {
                        icon: '🔔',
                        duration: 5000,
                        style: { fontWeight: 'bold' },
                    });

                    // Auto-clear "new" badges after 20 seconds
                    const idsToExpire = new Set(brandNew);
                    setTimeout(() => {
                        if (mountedRef.current) {
                            setNewRequestIds(prev => {
                                const next = new Set(prev);
                                idsToExpire.forEach(id => next.delete(id));
                                return next;
                            });
                        }
                    }, 20_000);
                }
            }

            previousIdsRef.current = new Set(fetched.map(r => r.id));
            isInitialLoadRef.current = false;
            setRequests(fetched);
        } catch (error) {
            console.error('Failed to fetch approvals:', error);
            if (!silent) toast.error('فشل تحميل طلبات الاعتماد');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [soundEnabled]);

    // ─── Initial Load ───
    useEffect(() => {
        mountedRef.current = true;
        requestNotificationPermission();
        fetchRequests(false);
        return () => { mountedRef.current = false; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Auto Refresh (Smart Polling) ───
    useAutoRefresh(fetchRequests, {
        activeInterval: 20_000,   // every 20s fallback
        inactiveInterval: 60_000,
        enabled: isOnline,
    });

    // ─── Instant Reactive Updates ───
    useEffect(() => {
        const handleRefresh = (e: any) => {
            // If we're already on the page and get a notification, update immediately
            if (e.detail?.type === 'approvals' && mountedRef.current) {
                fetchRequests(true);
            }
        };
        window.addEventListener(REFRESH_DATA_EVENT, handleRefresh);
        return () => window.removeEventListener(REFRESH_DATA_EVENT, handleRefresh);
    }, [fetchRequests]);

    // ─── Actions ───
    const handleAction = useCallback(async (requestId: number, action: 'Approved' | 'Rejected', warehouseId?: number) => {
        setProcessingId(requestId);
        setRemovingIds(prev => new Set(prev).add(requestId));

        // Wait for exit animation
        await new Promise(r => setTimeout(r, 400));

        startTransition(async () => {
            addOptimistic({ type: 'remove', id: requestId });
            try {
                const request = requests.find(r => r.id === requestId);
                if (request?.documentType === 'CustomerRequest' || request?.documentType === 'CR') {
                    if (action === 'Approved') {
                        await customerRequestService.approveRequest(requestId);
                    } else {
                        await customerRequestService.rejectRequest(requestId, 'Rejected via Inbox');
                    }
                } else {
                    await approvalService.takeAction(requestId, currentUserId, action, undefined, warehouseId);
                }

                const req = requests.find(r => r.id === requestId);
                setRequests(prev => prev.filter(r => r.id !== requestId));
                previousIdsRef.current.delete(requestId);

                if (action === 'Approved' && (req?.documentType === 'PaymentVoucher' || req?.documentType === 'PV')) {
                    // Trigger automatic download ONLY after Payment Disbursement (صرف الدفعة)
                    if (req.currentStepName === 'Payment Disbursement') {
                        paymentVoucherService.downloadVoucherPdf(req.documentId, req.documentNumber)
                            .catch(err => console.error('Auto-download failed:', err));
                    }

                    toast.success((t) => (
                        <div className="flex flex-col gap-2">
                            <span className="font-bold">تم الاعتماد بنجاح ✅</span>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    navigate(`/dashboard/finance/payment-vouchers/${req.documentId}`);
                                }}
                                className="text-xs text-brand-primary font-bold hover:underline text-right"
                            >
                                الانتقال للسند في انتظار الصرف ←
                            </button>
                        </div>
                    ), { duration: 6000 });
                } else {
                    toast.success(
                        action === 'Approved' ? 'تم الاعتماد بنجاح ✅' : 'تم رفض الطلب ❌',
                        { duration: 3000 }
                    );
                }
            } catch (err: any) {
                const apiMessage = err?.response?.data?.message;
                const displayMessage = apiMessage && typeof apiMessage === 'string'
                    ? apiMessage
                    : 'فشل تنفيذ الإجراء، جاري إعادة التحميل...';
                toast.error(displayMessage, { duration: apiMessage ? 6000 : 3000, style: apiMessage ? { whiteSpace: 'pre-line' } : undefined });
                await fetchRequests(false);
            } finally {
                setProcessingId(null);
                setRemovingIds(prev => { const n = new Set(prev); n.delete(requestId); return n; });
            }
        });
    }, [addOptimistic, fetchRequests, requests, currentUserId, navigate]);

    const handleApproveClick = useCallback(async (request: ApprovalRequestDto) => {
        if (isGRNType(request.documentType)) {
            setWarehouseModal(p => ({ ...p, show: true, request, loading: true }));
            try {
                const [whRes, grn] = await Promise.all([
                    warehouseService.getActive().catch(() => warehouseService.getAll()),
                    grnService.getGRNById(request.documentId),
                ]);

                // ⚠️ CRITICAL: Check if GRN has been inspected by Quality
                if (grn?.status === 'Pending Inspection') {
                    toast.error(
                        `❌ لا يمكن اعتماد إذن الإضافة (${grn.grnNumber})\n\n` +
                        `الحالة الحالية: بانتظار الفحص\n\n` +
                        `⚠️ يجب إتمام الخطوات التالية أولاً:\n` +
                        `1. الذهاب لصفحة فحص الجودة\n` +
                        `2. فحص الشحنة وإدخال الكميات المقبولة/المرفوضة\n` +
                        `3. الضغط على "إرسال للاعتماد" (الزر الأخضر)\n` +
                        `4. بعدها سيظهر هنا في قائمة الاعتمادات`,
                        { duration: 8000, style: { whiteSpace: 'pre-line' } }
                    );
                    setWarehouseModal(p => ({ ...p, show: false, loading: false }));
                    return;
                }

                const whList = (whRes as any)?.data ?? whRes ?? [];
                const arr = Array.isArray(whList) ? whList : [];
                const currentWhId = grn?.warehouseId ?? (arr[0]?.id ?? 0);
                setWarehouseModal(p => ({
                    ...p,
                    warehouses: arr.map((w: any) => ({ id: w.id, warehouseNameAr: w.warehouseNameAr || w.warehouseNameEn || '' })),
                    selectedWarehouseId: currentWhId || (arr[0]?.id ?? 0),
                    loading: false,
                }));
            } catch {
                toast.error('فشل تحميل قائمة المخازن');
                setWarehouseModal(p => ({ ...p, show: false, loading: false }));
            }
        } else {
            handleAction(request.id, 'Approved');
        }
    }, [handleAction]);

    const handleWarehouseModalConfirm = useCallback(() => {
        const { request, selectedWarehouseId } = warehouseModal;
        if (!request || !selectedWarehouseId) { toast.error('الرجاء اختيار المخزن'); return; }
        setWarehouseModal(p => ({ ...p, show: false, request: null }));
        handleAction(request.id, 'Approved', selectedWarehouseId);
    }, [warehouseModal, handleAction]);

    const clearFilters = useCallback(() => { setSearchTerm(''); setTypeFilter('All'); }, []);

    // ─── Filtering & Sorting ───
    const filteredRequests = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return optimisticRequests
            .filter(req => {
                const matchesSearch = !term
                    || req.documentNumber?.toLowerCase().includes(term)
                    || req.workflowName?.toLowerCase().includes(term)
                    || req.requestedByName?.toLowerCase().includes(term)
                    || tr(req.workflowName, WORKFLOW_NAME_AR).includes(searchTerm);
                const matchesType = typeFilter === 'All' || req.documentType === typeFilter;
                return matchesSearch && matchesType;
            })
            .sort((a, b) => {
                // New items first
                const aNew = newRequestIds.has(a.id) ? 1 : 0;
                const bNew = newRequestIds.has(b.id) ? 1 : 0;
                if (bNew !== aNew) return bNew - aNew;
                // Then by date
                const da = a.requestedDate ? new Date(a.requestedDate).getTime() : 0;
                const db = b.requestedDate ? new Date(b.requestedDate).getTime() : 0;
                return db !== da ? db - da : (b.id ?? 0) - (a.id ?? 0);
            });
    }, [optimisticRequests, searchTerm, typeFilter, newRequestIds]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const paginatedRequests = useMemo(() => {
        const s = (currentPage - 1) * pageSize;
        return filteredRequests.slice(s, s + pageSize);
    }, [filteredRequests, currentPage, pageSize]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, typeFilter]);

    const stats = useMemo(() => ({
        total: optimisticRequests.length,
        high: optimisticRequests.filter(r => r.priority === 'High').length,
        purchaseOrders: optimisticRequests.filter(r => r.documentType === 'PurchaseOrder' || r.documentType === 'PO').length,
        goodsReceiptNotes: optimisticRequests.filter(r => isGRNType(r.documentType)).length,
        purchaseRequisitions: optimisticRequests.filter(r => r.documentType === 'PurchaseRequisition' || r.documentType === 'PR').length,
    }), [optimisticRequests]);

    const hasActiveFilters = typeFilter !== 'All' || searchTerm.length > 0;

    // ════════════════════════════════════════════
    // ─── RENDER ───
    // ════════════════════════════════════════════
    return (
        <div className="space-y-5 pb-8">
            <style>{`
                @keyframes blink-red {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); background-color: #ef4444; }
                }
                .animate-blink-red { animation: blink-red 1s infinite; }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes newItemGlow {
                    0% { opacity: 0; transform: translateY(-8px) scale(0.98); box-shadow: 0 0 0 0 rgba(var(--brand-rgb, 59 130 246), 0.4); }
                    50% { box-shadow: 0 0 20px 4px rgba(var(--brand-rgb, 59 130 246), 0.15); }
                    100% { opacity: 1; transform: translateY(0) scale(1); box-shadow: 0 4px 20px rgba(var(--brand-rgb, 59 130 246), 0.1); }
                }
            `}</style>

            {/* ═══ HEADER ═══ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary/85 rounded-3xl p-7 lg:p-9 text-white">
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/[0.06] rounded-full blur-2xl" />
                <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-white/[0.04] rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-ping" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl shadow-black/10">
                            <Bell className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tight">بريد الاعتمادات</h1>
                                {optimisticRequests.length > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold border border-white/10">
                                        {optimisticRequests.length}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/60 text-base lg:text-lg">
                                {optimisticRequests.length === 0 && 'لا توجد طلبات تنتظر مراجعتك'}
                                {optimisticRequests.length === 1 && 'لديك طلب واحد ينتظر مراجعتك'}
                                {optimisticRequests.length === 2 && 'لديك طلبان ينتظران مراجعتك'}
                                {optimisticRequests.length > 2 && (
                                    <>لديك <span className="text-white font-bold">{optimisticRequests.length}</span> طلبات تنتظر مراجعتك</>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        <ConnectionBadge isOnline={isOnline} isPolling={!loading} lastRefresh={lastRefresh} />

                        <button
                            onClick={() => setSoundEnabled(p => !p)}
                            className={`p-2.5 rounded-xl border border-white/10 transition-all
                                ${soundEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-white/5 hover:bg-white/10 opacity-60'}`}
                            title={soundEnabled ? 'كتم صوت الإشعارات' : 'تفعيل صوت الإشعارات'}
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={() => fetchRequests(false)}
                            disabled={loading}
                            className="p-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 
                                border border-white/10 transition-all disabled:opacity-50 active:scale-95"
                            title="تحديث يدوي"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ NEW REQUESTS BANNER ═══ */}
            <NewRequestsBanner count={newRequestsCount} onDismiss={() => setNewRequestsCount(0)} />

            {/* ═══ STATS ═══ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard icon={Bell} value={stats.total} label="إجمالي الطلبات" color="primary" highlight={newRequestsCount > 0} />
                <StatCard icon={AlertCircle} value={stats.high} label="طلبات عاجلة" color="rose" />
                <StatCard icon={FileText} value={stats.purchaseRequisitions} label="طلبات شراء" color="purple" />
                <StatCard icon={ShoppingCart} value={stats.purchaseOrders} label="أوامر شراء" color="blue" />
                <StatCard icon={Package} value={stats.goodsReceiptNotes} label="أذونات إضافة" color="cyan" />
            </div>

            {/* ═══ FILTERS ═══ */}
            <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 
                        ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="بحث برقم المستند، اسم المسار، أو اسم الطالب..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className={`w-full pr-12 pl-10 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-sm
                            ${isSearchFocused
                                ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/5'
                                : 'border-slate-100 bg-slate-50/80 hover:border-slate-200 hover:bg-slate-50'}`}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {FILTER_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        const isActive = typeFilter === opt.value;
                        const count = opt.value === 'All'
                            ? optimisticRequests.length
                            : optimisticRequests.filter(r => r.documentType === opt.value).length;

                        if (opt.value !== 'All' && count === 0) return null;

                        return (
                            <button
                                key={opt.value}
                                onClick={() => setTypeFilter(opt.value)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold 
                                    whitespace-nowrap transition-all duration-200 border-2 flex-shrink-0
                                    ${isActive
                                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
                                        : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{opt.label}</span>
                                {count > 0 && (
                                    <span className={`min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-[10px] font-black
                                        transition-all duration-300 border border-white/20
                                        ${count > 0 ? 'animate-blink-red bg-rose-500 text-white shadow-sm' :
                                            isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══ RESULTS INFO ═══ */}
            {!loading && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-5 bg-brand-primary rounded-full" />
                        <span className="text-sm text-slate-500">
                            عرض <span className="font-bold text-slate-700">{filteredRequests.length}</span> من{' '}
                            <span className="font-bold text-slate-700">{optimisticRequests.length}</span> طلب
                        </span>
                        {isPending && (
                            <span className="inline-flex items-center gap-1 text-xs text-brand-primary font-medium">
                                <Loader2 className="w-3 h-3 animate-spin" />جاري التحديث...
                            </span>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button onClick={clearFilters}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <X className="w-3.5 h-3.5" />مسح الفلاتر
                        </button>
                    )}
                </div>
            )}

            {/* ═══ REQUESTS LIST ═══ */}
            <div className="space-y-3">
                {loading ? (
                    <RequestSkeleton />
                ) : filteredRequests.length === 0 ? (
                    <EmptyState searchTerm={searchTerm} hasFilters={hasActiveFilters} onClearFilters={clearFilters} />
                ) : (
                    paginatedRequests.map((req, index) => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            index={index}
                            onApprove={handleApproveClick}
                            onReject={id => handleAction(id, 'Rejected')}
                            processingId={processingId}
                            isRemoving={removingIds.has(req.id)}
                            isNew={newRequestIds.has(req.id)}
                        />
                    ))
                )}
            </div>

            {/* ═══ PAGINATION ═══ */}
            {!loading && filteredRequests.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredRequests.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
                />
            )}

            {warehouseModal.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setWarehouseModal(p => ({ ...p, show: false, request: null }))} />

                    <div className="relative bg-white rounded-[2rem] shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden 
                        animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        {/* Header - Premium Gradient */}
                        <div className="bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 p-8 text-white relative">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
                                        <Warehouse className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">توجيه الشحنة للمخزن</h3>
                                        <p className="text-white/70 text-sm mt-0.5">حدد المستودع المستهدف لإتمام عملية الإضافة</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setWarehouseModal(p => ({ ...p, show: false, request: null }))}
                                    className="p-2.5 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 duration-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            {warehouseModal.loading ? (
                                <div className="py-20 text-center">
                                    <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">جاري جلب قائمة المستودعات المتاحة...</p>
                                </div>
                            ) : (
                                <>
                                    {warehouseModal.request && (
                                        <div className="bg-gradient-to-l from-slate-50 to-slate-100/50 rounded-2xl p-5 mb-8 border border-slate-200/60 shadow-inner">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-brand-primary" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-0.5">مستند إذن إضافة</div>
                                                    <div className="text-lg font-black text-slate-800">
                                                        #{warehouseModal.request.documentNumber}
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-500 mt-0.5">
                                                        القيمة الإجمالية: <span className="text-slate-700">{formatNumber(warehouseModal.request.totalAmount ?? 0)} ج.م</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3 mb-8">
                                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 px-1">
                                            <Archive className="w-4 h-4 text-brand-primary" />
                                            اختر المستودع المستلم *
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-lg 
                                                flex items-center justify-center transition-colors group-focus-within:bg-brand-primary/10">
                                                <Warehouse className="w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                                            </div>
                                            <select
                                                value={warehouseModal.selectedWarehouseId}
                                                onChange={e => setWarehouseModal(p => ({ ...p, selectedWarehouseId: parseInt(e.target.value, 10) }))}
                                                className="w-full pr-16 pl-12 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 
                                                    focus:border-brand-primary focus:bg-white outline-none transition-all duration-300 
                                                    text-base font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                                            >
                                                <option value={0}>-- اختر المخزن من القائمة --</option>
                                                {warehouseModal.warehouses.map(w => (
                                                    <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                                ))}
                                            </select>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 pr-1">* سيتم ربط الأصناف الواردة بهذا المستودع فور الاعتماد</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setWarehouseModal(p => ({ ...p, show: false, request: null }))}
                                            className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 
                                                font-black text-sm hover:bg-slate-50 hover:border-slate-200 transition-all 
                                                active:scale-[0.98]"
                                        >
                                            إلغاء العملية
                                        </button>
                                        <button
                                            onClick={handleWarehouseModalConfirm}
                                            disabled={!warehouseModal.selectedWarehouseId}
                                            className="flex-[1.5] px-6 py-4 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 
                                                text-white font-black text-sm hover:from-emerald-600 hover:to-emerald-700 
                                                shadow-xl shadow-emerald-500/20 disabled:opacity-40 disabled:grayscale 
                                                disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-[0.98]"
                                        >
                                            <span className="flex items-center justify-center gap-3">
                                                <CheckCircle2 className="w-5 h-5" />
                                                اعتماد وتوجيه للمخزن
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalsInbox;