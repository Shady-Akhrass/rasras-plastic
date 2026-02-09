import React, { useState, useEffect, useMemo } from 'react';
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
    Filter,
    RefreshCw,
    XCircle, CheckCircle2,
    RotateCcw,
    Warehouse
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { approvalService, type ApprovalRequestDto } from '../../services/approvalService';
import { formatNumber, formatDate } from '../../utils/format';
import { grnService } from '../../services/grnService';
import warehouseService from '../../services/warehouseService';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

// تعريب أسماء مسارات الاعتماد والخطوات (قادمة من الباكند بالإنجليزي)
const WORKFLOW_NAME_AR: Record<string, string> = {
    'Purchase Requisition Approval': 'اعتماد طلب الشراء',
    'Purchase Order Approval': 'اعتماد أمر الشراء',
    'Supplier Approval': 'اعتماد المورد',
    'Goods Receipt Note Approval': 'اعتماد إذن الاستلام',
    'Purchase Return Approval': 'اعتماد مرتجع المشتريات',
    'Quotation Comparison Approval': 'اعتماد مقارنة العروض',
};
const STEP_NAME_AR: Record<string, string> = {
    'Procurement Manager Approval': 'اعتماد مدير المشتريات',
    'Finance Manager Approval': 'اعتماد المدير المالي',
    'General Manager Approval': 'اعتماد المدير العام',
};
const tr = (en: string | undefined, map: Record<string, string>) =>
    (en && map[en]) ? map[en] : (en || '');

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
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



// Request Card Component
const RequestCard: React.FC<{
    request: ApprovalRequestDto;
    index: number;
    onApprove: (request: ApprovalRequestDto) => void;
    onReject: (id: number) => void;
    processing: boolean;
}> = ({ request, index, onApprove, onReject, processing }) => {
    const getDocTypeConfig = (type: string) => {
        const configs: Record<string, { label: string; shortLabel?: string; bg: string; text: string; border?: string; icon: React.ElementType }> = {
            'PurchaseRequisition': { label: 'طلب شراء', bg: 'bg-purple-50', text: 'text-purple-600', icon: FileText },
            'PR': { label: 'طلب شراء', bg: 'bg-purple-50', text: 'text-purple-600', icon: FileText },
            'RFQ': { label: 'طلب عروض أسعار', bg: 'bg-amber-50', text: 'text-amber-600', icon: FileText },
            'SupplierQuotation': { label: 'عرض مورد', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Tag },
            'SQ': { label: 'عرض مورد', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Tag },
            'QuotationComparison': { label: 'مقارنة عروض', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Scale },
            'QC': { label: 'مقارنة عروض', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: Scale },
            'PurchaseOrder': {
                label: 'أمر شراء',
                shortLabel: 'PO',
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                border: 'border-blue-200',
                icon: ShoppingCart,
            },
            'PO': { label: 'أمر شراء', bg: 'bg-blue-50', text: 'text-blue-600', icon: ShoppingCart },
            'PurchaseReturn': {
                label: 'مرتجع مشتريات',
                shortLabel: 'PRN',
                bg: 'bg-rose-50',
                text: 'text-rose-600',
                border: 'border-rose-100',
                icon: RotateCcw,
            },
            'GoodsReceiptNote': { label: 'إذن إضافة', bg: 'bg-cyan-50', text: 'text-cyan-600', icon: Package },
            'GRN': { label: 'إذن إضافة', bg: 'bg-cyan-50', text: 'text-cyan-600', icon: Package },
            'SupplierInvoice': { label: 'فاتورة مورد', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign },
            'SINV': { label: 'فاتورة مورد', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign },
            'SalesOrder': { label: 'أمر بيع', bg: 'bg-sky-50', text: 'text-sky-600', icon: ShoppingCart },
            'SO': { label: 'أمر بيع', bg: 'bg-sky-50', text: 'text-sky-600', icon: ShoppingCart },
            'PaymentVoucher': { label: 'سند صرف', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign },
            'PV': { label: 'سند صرف', bg: 'bg-rose-50', text: 'text-rose-600', icon: DollarSign },
            'ReceiptVoucher': { label: 'سند قبض', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: DollarSign },
            'RV': { label: 'سند قبض', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: DollarSign },
            'Supplier': { label: 'مورد', bg: 'bg-slate-50', text: 'text-slate-600', icon: Package },
        };
        return configs[type] || { label: type || 'طلب', bg: 'bg-slate-50', text: 'text-slate-600', icon: FileText };
    };

    const config = getDocTypeConfig(request.documentType);
    const DocIcon = config.icon;
    const navigate = useNavigate();

    const handleViewDocument = () => {
        const typeRoutes: Record<string, string> = {
            'PR': '/dashboard/procurement/pr',
            'PurchaseRequisition': '/dashboard/procurement/pr',
            'RFQ': '/dashboard/procurement/rfq',
            'SQ': '/dashboard/procurement/quotation',
            'SupplierQuotation': '/dashboard/procurement/quotation',
            'QC': '/dashboard/procurement/comparison',
            'QuotationComparison': '/dashboard/procurement/comparison',
            'PO': '/dashboard/procurement/po',
            'PurchaseOrder': '/dashboard/procurement/po',
            'GRN': '/dashboard/procurement/grn',
            'GoodsReceiptNote': '/dashboard/procurement/grn',
            'SINV': '/dashboard/procurement/invoices',
            'SupplierInvoice': '/dashboard/procurement/invoices',
            'PurchaseReturn': '/dashboard/procurement/returns'
        };

        const route = typeRoutes[request.documentType];
        if (route) {
            navigate(`${route}/${request.documentId}?mode=view&approvalId=${request.id}`);
        } else {
            toast.error('لم يتم تحديد مسار لهذا المستند');
        }
    };

    return (
        <div
            className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg 
                hover:border-brand-primary/20 transition-all duration-300 group"
            style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.4s ease-out forwards'
            }}
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Document Info */}
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${config.bg} ${config.text} 
                        group-hover:scale-110 transition-transform duration-300`}>
                        <DocIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 
                                rounded-lg text-xs font-bold">
                                {config.label}
                            </span>
                            <span className="text-xs font-mono text-slate-400">#{request.documentNumber}</span>
                            {request.priority === 'High' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 
                                    text-rose-600 rounded-lg text-xs font-bold border border-rose-200">
                                    <AlertCircle className="w-3 h-3" />
                                    عاجل
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand-primary transition-colors">
                                {tr(request.workflowName, WORKFLOW_NAME_AR)}
                            </h3>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold">
                                {request.documentNumber}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span>{request.requestedByName || 'غير محدد'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>{formatDate(request.requestedDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-brand-primary font-bold">
                                <Clock className="w-4 h-4" />
                                <span>{tr(request.currentStepName, STEP_NAME_AR)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Amount */}
                <div className="flex flex-col justify-center items-center lg:items-end px-6 
                    lg:border-x border-slate-100 min-w-[140px]">
                    <div className="text-xs text-slate-400 font-medium mb-1">إجمالي القيمة</div>
                    <div className="text-2xl font-bold text-slate-800">
                        {formatNumber(request.totalAmount ?? 0)}
                    </div>
                    <div className="text-xs text-slate-400">ج.م</div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row lg:flex-col justify-center gap-3 min-w-[140px]">
                    <button
                        onClick={handleViewDocument}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 
                            bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 
                            transition-all hover:scale-105"
                    >
                        <Eye className="w-4 h-4" />
                        <span>عرض</span>
                    </button>
                    <button
                        onClick={() => onApprove(request)}
                        disabled={processing}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 
                            bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 
                            transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>اعتماد</span>
                    </button>
                    <button
                        onClick={() => onReject(request.id)}
                        disabled={processing}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 
                            bg-white text-rose-500 border-2 border-rose-200 rounded-xl font-bold 
                            hover:bg-rose-50 transition-all hover:scale-105
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// View Modal Component


// Loading Skeleton
const RequestSkeleton: React.FC = () => (
    <>
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                <div className="flex gap-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-24 bg-slate-100 rounded-lg" />
                                <div className="h-4 w-16 bg-slate-50 rounded" />
                            </div>
                            <div className="h-5 w-48 bg-slate-200 rounded" />
                            <div className="flex gap-4">
                                <div className="h-4 w-32 bg-slate-100 rounded" />
                                <div className="h-4 w-24 bg-slate-100 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-slate-100 rounded" />
                        <div className="h-8 w-32 bg-slate-200 rounded" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="h-10 w-32 bg-slate-100 rounded-xl" />
                        <div className="h-10 w-32 bg-slate-50 rounded-xl" />
                    </div>
                </div>
            </div>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <div className="bg-white py-20 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                {searchTerm ? (
                    <Search className="w-12 h-12 text-slate-400" />
                ) : (
                    <CheckCircle2 className="w-12 h-12 text-slate-400" />
                )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
                {searchTerm ? 'لا توجد نتائج' : 'صندوق البريد فارغ'}
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
                {searchTerm
                    ? `لم يتم العثور على طلبات تطابق "${searchTerm}"`
                    : 'لا توجد طلبات تحتاج لاعتمادك حالياً'}
            </p>
        </div>
    </div>
);

const isGRNType = (t: string) => t === 'GoodsReceiptNote' || t === 'GRN';

const ApprovalsInbox: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get('type') || 'All';

    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>(initialType);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // نافذة اختيار المخزن عند اعتماد إذن الإضافة
    const [warehouseModal, setWarehouseModal] = useState<{
        show: boolean;
        request: ApprovalRequestDto | null;
        warehouses: { id: number; warehouseNameAr: string }[];
        selectedWarehouseId: number;
        loading: boolean;
    }>({ show: false, request: null, warehouses: [], selectedWarehouseId: 0, loading: false });

    // Mock User ID (from auth context in production)
    const currentUserId = 1;

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await approvalService.getPendingRequests(currentUserId);
            setRequests(data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل طلبات الاعتماد');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: number, action: 'Approved' | 'Rejected', warehouseId?: number) => {
        const originalRequests = [...requests];
        setRequests(prev => prev.filter(r => r.id !== requestId));
        const toastId = toast.loading('جاري تنفيذ الإجراء...');

        try {
            await approvalService.takeAction(requestId, currentUserId, action, undefined, warehouseId);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح ✅' : 'تم رفض الطلب', { id: toastId });
        } catch (error) {
            setRequests(originalRequests);
            toast.error('فشل تنفيذ الإجراء', { id: toastId });
        }
    };

    const handleApproveClick = async (request: ApprovalRequestDto) => {
        if (isGRNType(request.documentType)) {
            setWarehouseModal(prev => ({ ...prev, show: true, request, loading: true }));
            try {
                const [whRes, grn] = await Promise.all([
                    warehouseService.getActive().catch(() => warehouseService.getAll()),
                    grnService.getGRNById(request.documentId)
                ]);
                const whList = (whRes as any)?.data ?? whRes ?? [];
                const arr = Array.isArray(whList) ? whList : [];
                const currentWhId = grn?.warehouseId ?? (arr[0]?.id ?? 0);
                setWarehouseModal(prev => ({
                    ...prev,
                    warehouses: arr.map((w: any) => ({ id: w.id, warehouseNameAr: w.warehouseNameAr || w.warehouseNameEn || '' })),
                    selectedWarehouseId: currentWhId || (arr[0]?.id ?? 0),
                    loading: false
                }));
            } catch (e) {
                toast.error('فشل تحميل قائمة المخازن');
                setWarehouseModal(prev => ({ ...prev, show: false, loading: false }));
            }
        } else {
            handleAction(request.id, 'Approved');
        }
    };

    const handleWarehouseModalConfirm = () => {
        const { request, selectedWarehouseId } = warehouseModal;
        if (!request || !selectedWarehouseId) {
            toast.error('الرجاء اختيار المخزن');
            return;
        }
        setWarehouseModal(prev => ({ ...prev, show: false, request: null }));
        handleAction(request.id, 'Approved', selectedWarehouseId);
    };

    const filteredRequests = useMemo(() => {
        const filtered = requests.filter(req => {
            const matchesSearch =
                req.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.workflowName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'All' || req.documentType === typeFilter;
            return matchesSearch && matchesType;
        });
        // الأحدث في الأعلى
        return [...filtered].sort((a, b) => {
            const dateA = a.requestedDate ? new Date(a.requestedDate).getTime() : 0;
            const dateB = b.requestedDate ? new Date(b.requestedDate).getTime() : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (b.id ?? 0) - (a.id ?? 0);
        });
    }, [requests, searchTerm, typeFilter]);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredRequests.slice(start, start + pageSize);
    }, [filteredRequests, currentPage, pageSize]);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter]);

    const stats = useMemo(() => {
        return {
            total: requests.length,
            high: requests.filter(r => r.priority === 'High').length,
            purchaseOrders: requests.filter(r => r.documentType === 'PurchaseOrder').length,
            suppliers: requests.filter(r => r.documentType === 'Supplier').length,
            goodsReceiptNotes: requests.filter(r => r.documentType === 'GoodsReceiptNote').length,
        };
    }, [requests]);

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
                            <Bell className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">بريد الاعتمادات</h1>
                            <p className="text-white/70 text-lg">
                                {requests.length === 0 && 'لا توجد طلبات تنتظر مراجعتك'}
                                {requests.length === 1 && 'لديك طلب واحد ينتظر مراجعتك'}
                                {requests.length === 2 && 'لديك طلبان ينتظران مراجعتك'}
                                {requests.length > 2 && `لديك ${requests.length} طلبات تنتظر مراجعتك`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchRequests}
                        disabled={loading}
                        className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 
                            transition-all duration-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Bell}
                    value={stats.total}
                    label="إجمالي الطلبات"
                    color="primary"
                />
                <StatCard
                    icon={AlertCircle}
                    value={stats.high}
                    label="عاجل"
                    color="rose"
                />
                <StatCard
                    icon={ShoppingCart}
                    value={stats.purchaseOrders}
                    label="أوامر شراء"
                    color="blue"
                />
                <StatCard
                    icon={Package}
                    value={stats.suppliers}
                    label="موردين"
                    color="warning"
                />
                <StatCard
                    icon={Package}
                    value={stats.goodsReceiptNotes}
                    label="أذونات إضافة"
                    color="blue"
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
                            placeholder="بحث برقم المستند، اسم المسار، أو الطالب..."
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
                                <XCircle className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent
                            hover:border-slate-200 transition-all duration-200">
                            <Filter className="text-slate-400 w-5 h-5" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="bg-transparent outline-none text-slate-700 font-medium cursor-pointer"
                            >
                                <option value="All">كل الطلبات</option>
                                <option value="PR">طلبات شراء</option>
                                <option value="RFQ">طلبات عروض أسعار</option>
                                <option value="SQ">عروض موردين</option>
                                <option value="PO">أوامر شراء</option>
                                <option value="GRN">أذونات إضافة</option>
                                <option value="QC">مقارنة عروض</option>
                                <option value="SINV">فواتير موردين</option>
                                <option value="SO">أوامر بيع</option>
                                <option value="PV">سندات صرف</option>
                                <option value="RV">سندات قبض</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredRequests.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{requests.length}</span> طلب
                    </span>
                </div>
            )}

            {/* Requests List */}
            <div className="space-y-4">
                {loading ? (
                    <RequestSkeleton />
                ) : filteredRequests.length === 0 ? (
                    <EmptyState searchTerm={searchTerm} />
                ) : (
                    paginatedRequests.map((req, index) => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            index={index}
                            onApprove={handleApproveClick}
                            onReject={(id) => handleAction(id, 'Rejected')}
                            processing={false}
                        />
                    ))
                )}
            </div>
            {!loading && filteredRequests.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredRequests.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                />
            )}

            {/* نافذة اختيار المخزن عند اعتماد إذن الإضافة */}
            {warehouseModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-cyan-50 rounded-xl">
                                <Warehouse className="w-6 h-6 text-cyan-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">اختيار المخزن للتخزين</h3>
                                <p className="text-sm text-slate-500">حدد المخزن الذي سيتم تخزين الأصناف فيه</p>
                            </div>
                        </div>
                        {warehouseModal.loading ? (
                            <div className="py-8 text-center text-slate-500">جاري تحميل المخازن...</div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">المخزن</label>
                                    <select
                                        value={warehouseModal.selectedWarehouseId}
                                        onChange={(e) => setWarehouseModal(prev => ({
                                            ...prev,
                                            selectedWarehouseId: parseInt(e.target.value, 10)
                                        }))}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 
                                            focus:border-brand-primary outline-none transition-colors"
                                    >
                                        <option value={0}>-- اختر المخزن --</option>
                                        {warehouseModal.warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setWarehouseModal(prev => ({ ...prev, show: false, request: null }))}
                                        className="px-4 py-2.5 rounded-xl border-2 border-slate-200 
                                            text-slate-600 font-bold hover:bg-slate-50"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleWarehouseModalConfirm}
                                        disabled={!warehouseModal.selectedWarehouseId}
                                        className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold 
                                            hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        اعتماد وتحديد المخزن
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalsInbox;