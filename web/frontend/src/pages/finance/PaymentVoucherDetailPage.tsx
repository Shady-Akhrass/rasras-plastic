import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    XCircle,
    DollarSign,
    FileText,
    Printer,
    ShieldCheck,
    AlertTriangle,
    Wallet,
    Building2,
    RefreshCw,
    Clock,
    Eye,
    FileDown,
    Loader2
} from 'lucide-react';
import { paymentVoucherService, type PaymentVoucherDto, type InvoiceComparisonData } from '../../services/paymentVoucherService';
import { approvalService } from '../../services/approvalService';
import { supplierService, type SupplierDto, type SupplierBankDto } from '../../services/supplierService';
import InvoiceMatchingValidation from '../../components/finance/InvoiceMatchingValidation';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { useSystemSettings } from '../../hooks/useSystemSettings';


const PaymentVoucherDetailPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();

    const { id } = useParams();

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    const approvalId = queryParams.get('approvalId');
    const isView = mode === 'view';

    const [loading, setLoading] = useState(true);
    const [voucher, setVoucher] = useState<PaymentVoucherDto | null>(null);
    const [supplier, setSupplier] = useState<SupplierDto | null>(null);
    const [bankDetails, setBankDetails] = useState<SupplierBankDto[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState<InvoiceComparisonData | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        if (!voucher || !voucher.paymentVoucherId) return;
        try {
            setIsDownloading(true);
            await paymentVoucherService.downloadVoucherPdf(voucher.paymentVoucherId, voucher.voucherNumber);
        } catch (error) {
            console.error('Failed to download PDF:', error);
            toast.error('فشل تحميل ملف PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    // ... (rest of useEffect and fetchVoucher)

    const handleHeaderApproval = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setActionLoading(true);
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            const currentUserId = user?.userId || 1;

            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), currentUserId, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح ✅' : 'تم رفض الطلب ❌', { id: toastId });
            navigate('/dashboard/procurement/approvals');
        } catch (error) {
            console.error('Approval error:', error);
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchVoucher(Number(id));
        }
    }, [id]);

    const fetchVoucher = async (voucherId: number) => {
        try {
            setLoading(true);
            const data = await paymentVoucherService.getVoucherById(voucherId);
            setVoucher(data);

            if (data.supplierId) {
                const [supplierData, banksData] = await Promise.all([
                    supplierService.getSupplierById(data.supplierId),
                    supplierService.getSupplierBanks(data.supplierId)
                ]);
                setSupplier(supplierData.data);
                setBankDetails(banksData.data || []);
            }

            // Fetch comparison data for the specific invoice in the allocation
            if (data.allocations && data.allocations.length > 0 && data.supplierId) {
                try {
                    const comparisons = await paymentVoucherService.getInvoiceComparison(data.supplierId);
                    const specificComp = comparisons.find(c => c.supplierInvoiceId === data.allocations![0].supplierInvoiceId);
                    if (specificComp) {
                        setComparisonData(specificComp);
                    }
                } catch (e) {
                    console.error('Failed to fetch comparison data:', e);
                }
            }
        } catch (error) {
            console.error('Failed to fetch voucher or supplier details:', error);
            toast.error('فشل تحميل تفاصيل السند أو المورد');
        } finally {
            setLoading(false);
        }
    };

    // Workflow Steps Definition
    const getWorkflowSteps = () => {
        if (!voucher) return [];

        const steps = [
            {
                id: 'creation',
                label: 'إنشاء السند',
                subLabel: formatDate(voucher.voucherDate),
                status: 'completed',
                icon: FileText
            },
            {
                id: 'matching',
                label: 'المطابقة',
                subLabel: 'PO + GRN + Invoice',
                status: (voucher.allocations && voucher.allocations.length > 0) || voucher.status === 'Paid' ? 'completed' : 'pending',
                icon: ShieldCheck
            },
            {
                id: 'finance_approval',
                label: 'اعتماد المالي',
                subLabel: ['FinanceApproved', 'GMApproved', 'Paid'].includes(voucher.approvalStatus || '') || voucher.status === 'Paid'
                    ? `تم الاعتماد: ${voucher.approvedByFinanceManager || 'المدير المالي'}`
                    : 'قيد الانتظار',
                status: ['FinanceApproved', 'GMApproved', 'Paid'].includes(voucher.approvalStatus || '') || voucher.status === 'Paid'
                    ? 'completed'
                    : voucher.approvalStatus === 'Rejected'
                        ? 'rejected'
                        : voucher.approvalStatus === 'Pending' ? 'current' : 'pending',
                icon: CheckCircle2
            },
            {
                id: 'general_approval',
                label: 'اعتماد المدير العام',
                subLabel: ['GMApproved', 'Paid'].includes(voucher.approvalStatus || '') || voucher.status === 'Paid'
                    ? `تم الاعتماد: ${voucher.approvedByGeneralManager || 'المدير العام'}`
                    : 'قيد الانتظار',
                status: ['GMApproved', 'Paid'].includes(voucher.approvalStatus || '') || voucher.status === 'Paid'
                    ? 'completed'
                    : voucher.approvalStatus === 'FinanceApproved'
                        ? 'current'
                        : 'pending',
                icon: ShieldCheck
            },
            {
                id: 'payment',
                label: 'صرف الدفعة',
                subLabel: voucher.status === 'Paid'
                    ? `تم الصرف: ${voucher.paymentMethod === 'cash' ? 'cash' : (voucher.paymentMethod || '')}`
                    : 'قيد الانتظار',
                status: voucher.status === 'Paid'
                    ? 'completed'
                    : voucher.approvalStatus === 'GMApproved'
                        ? 'current'
                        : 'pending',
                icon: DollarSign
            }
        ];

        return steps;
    };

    const handleAction = async (action: 'approveFinance' | 'approveGeneral' | 'pay' | 'reject' | 'cancel') => {
        if (!voucher?.paymentVoucherId) return;

        const reason = action === 'reject' || action === 'cancel'
            ? window.prompt('الرجاء إدخال سبب الإجراء:')
            : null;

        if ((action === 'reject' || action === 'cancel') && !reason) return;

        try {
            setActionLoading(true);
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            const approvedBy = user?.username ?? user?.fullNameAr ?? 'User';

            switch (action) {
                case 'approveFinance':
                    await paymentVoucherService.approveFinanceManager(voucher.paymentVoucherId, approvedBy);
                    toast.success('تم اعتماد المدير المالي بنجاح');
                    break;
                case 'approveGeneral':
                    await paymentVoucherService.approveGeneralManager(voucher.paymentVoucherId, approvedBy);
                    toast.success('تم اعتماد المدير العام بنجاح');
                    break;
                case 'pay':
                    await paymentVoucherService.processPayment(voucher.paymentVoucherId, approvedBy);
                    toast.success('تم صرف الدفعة بنجاح');
                    // Automatically download PDF after disbursement
                    paymentVoucherService.downloadVoucherPdf(voucher.paymentVoucherId, voucher.voucherNumber)
                        .catch(err => console.error('Auto-download failed:', err));
                    break;
                case 'reject':
                    await paymentVoucherService.rejectVoucher(voucher.paymentVoucherId, approvedBy, reason!);
                    toast.success('تم رفض السند');
                    break;
                case 'cancel':
                    await paymentVoucherService.cancelVoucher(voucher.paymentVoucherId, approvedBy, reason!);
                    toast.success('تم إلغاء السند');
                    break;
            }
            fetchVoucher(voucher.paymentVoucherId);
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!voucher) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-bold text-slate-700">لم يتم العثور على السند</h3>
                <button
                    onClick={() => navigate('/dashboard/finance/payment-vouchers')}
                    className="mt-4 text-brand-primary font-bold hover:underline"
                >
                    العودة للقائمة
                </button>
            </div>
        );
    }

    const steps = getWorkflowSteps();
    const currentAllocation = voucher.allocations?.[0];

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Premium Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/finance/payment-vouchers')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Wallet className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    سند صرف رقم: {voucher.voucherNumber}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20">
                                    <ShieldCheck className="w-3 h-3" />
                                    عرض السند
                                </span>
                            </div>
                            <p className="text-white/80 text-lg">
                                تتبع حالة الاعتماد ومطابقة الفواتير مع أوامر الشراء وإذون الاستلام
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap items-center">
                        {approvalId && (
                            <div className="flex gap-3 items-center ml-4 border-l border-white/20 pl-4">
                                <button
                                    onClick={() => handleHeaderApproval('Approved')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    <span>اعتماد السند</span>
                                </button>
                                <button
                                    onClick={() => handleHeaderApproval('Rejected')}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-rose-500 text-white rounded-2xl font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                    <span>رفض</span>
                                </button>
                            </div>
                        )}

                        {isView && (
                            <div className="flex items-center gap-2 px-5 py-3.5 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm mr-2">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold whitespace-nowrap">وضع العرض فقط</span>
                            </div>
                        )}

                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-all active:scale-95 shadow-lg"
                        >
                            <Printer className="w-5 h-5" />
                            <span>طباعة</span>
                        </button>

                        {voucher.status === 'Paid' && (
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="flex items-center gap-3 px-6 py-3.5 bg-emerald-500 text-white rounded-2xl font-bold border border-emerald-400 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FileDown className="w-5 h-5" />
                                )}
                                <span>تحميل PDF</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Read-Only Banner */}
            <div className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl animate-slide-in">
                <div className="p-2.5 bg-amber-100 rounded-xl flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                    <p className="text-amber-800 font-bold text-sm">
                        أنت في وضع العرض — البيانات محمية من التعديل لضمان سلامة الدورة المستندية
                    </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-lg text-amber-700 text-xs font-bold flex-shrink-0">
                    <AlertTriangle className="w-3 h-3" />
                    عرض فقط
                </div>
            </div>

            {/* Workflow Timeline */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg overflow-x-auto animate-slide-in">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">مسار الاعتماد والدورة المستندية</h3>
                </div>
                <div className="flex items-center justify-between min-w-[800px] px-4">
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;
                        const StepIcon = step.icon;
                        let statusColor = 'bg-slate-100 text-slate-400 border-slate-200';
                        let lineColor = 'bg-slate-100';
                        let labelColor = 'text-slate-800';
                        let subLabelColor = 'text-slate-400';

                        if (step.status === 'completed') {
                            statusColor = 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200';
                            lineColor = 'bg-emerald-500';
                            labelColor = 'text-emerald-700';
                            subLabelColor = 'text-emerald-600/80';
                        } else if (step.status === 'current') {
                            statusColor = 'bg-blue-100 text-blue-600 border-blue-200 ring-4 ring-blue-50';
                            lineColor = 'bg-slate-100';
                            labelColor = 'text-blue-700';
                            subLabelColor = 'text-blue-500/80';
                        } else if (step.status === 'rejected') {
                            statusColor = 'bg-rose-100 text-rose-600 border-rose-200';
                            lineColor = 'bg-rose-200';
                            labelColor = 'text-rose-700';
                            subLabelColor = 'text-rose-500/80';
                        }

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center relative z-10 w-32">
                                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-3 transition-all duration-300 ${statusColor} shadow-sm`}>
                                        <StepIcon className="w-7 h-7" />
                                    </div>
                                    <div className="text-center">
                                        <div className={`font-bold text-sm mb-1 transition-colors duration-300 ${labelColor}`}>{step.label}</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-tighter transition-colors duration-300 ${subLabelColor}`}>{step.subLabel}</div>
                                    </div>
                                </div>
                                {!isLast && (
                                    <div className="flex-1 h-1.5 mx-2 relative top-[-34px] -z-0 rounded-full overflow-hidden bg-slate-100">
                                        <div className={`h-full transition-all duration-700 ${lineColor}`} style={{ width: step.status === 'completed' ? '100%' : '0%' }} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Voucher Details Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">بيانات السند المالية</h3>
                                    <p className="text-slate-500 text-sm">التفاصيل الكاملة للمبلغ وطريقة الدفع</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">رقم السند</label>
                                <div className="font-black text-slate-800 text-lg">{voucher.voucherNumber}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">تاريخ السند</label>
                                <div className="font-bold text-slate-800">{formatDate(voucher.voucherDate)}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">المبلغ الإجمالي</label>
                                <div className="font-black text-emerald-600 text-xl">
                                    {formatNumber(convertAmount(voucher.amount, voucher.currency || 'EGP'))} <span className="text-sm font-bold">{getCurrencyLabel(defaultCurrency)}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">طريقة الدفع</label>
                                {voucher.isSplitPayment ? (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {(voucher.cashAmount ?? 0) > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                                                <Wallet className="w-3.5 h-3.5" /> نقداً: {formatNumber(convertAmount(voucher.cashAmount || 0, voucher.currency || 'EGP'))}
                                            </span>
                                        )}
                                        {(voucher.bankTransferAmount ?? 0) > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                                <Building2 className="w-3.5 h-3.5" /> تحويل: {formatNumber(convertAmount(voucher.bankTransferAmount || 0, voucher.currency || 'EGP'))}
                                            </span>
                                        )}
                                        {(voucher.chequeAmount ?? 0) > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                                                <FileText className="w-3.5 h-3.5" /> شيك: {formatNumber(convertAmount(voucher.chequeAmount || 0, voucher.currency || 'EGP'))}
                                            </span>
                                        )}
                                        {(voucher.bankAmount ?? 0) > 0 && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                                <Building2 className="w-3.5 h-3.5" /> بنك: {formatNumber(convertAmount(voucher.bankAmount || 0, voucher.currency || 'EGP'))}
                                            </span>
                                        )}
                                    </div>

                                ) : (
                                    <div className="flex items-center gap-2 font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                                        {voucher.paymentMethod === 'cash' ? <Wallet className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                        {voucher.paymentMethod === 'cash' ? 'نقداً' :
                                            voucher.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                                                voucher.paymentMethod === 'cheque' ? 'شيك' : 'بنك'}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">المورد المستفيد</label>
                                <div className="font-bold text-slate-800 flex items-center gap-2">
                                    {voucher.supplierNameAr}
                                    {voucher.supplierNameEn && (
                                        <span className="text-slate-400 font-medium text-sm">({voucher.supplierNameEn})</span>
                                    )}
                                </div>
                            </div>

                            {voucher.description && (
                                <div className="col-span-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <label className="block text-xs font-bold text-slate-500 mb-2 flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> الوصف والملاحظات
                                    </label>
                                    <div className="text-sm text-slate-700 leading-relaxed font-medium">{voucher.description}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3-Way Matching Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">مطابقة الوثائق (3-Way Match)</h3>
                                    <p className="text-slate-500 text-sm">نظام التحقق الذاتي من مطابقة الأسعار والكميات</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {currentAllocation ? (
                                <InvoiceMatchingValidation
                                    poNumber={currentAllocation.poNumber}
                                    grnNumber={currentAllocation.grnNumber}
                                    invoiceNumber={currentAllocation.invoiceNumber}
                                    poTotal={currentAllocation.poTotal}
                                    poSubTotal={currentAllocation.poSubTotal}
                                    poTaxAmount={currentAllocation.poTaxAmount}
                                    poDiscountAmount={currentAllocation.poDiscountAmount}
                                    poShippingCost={currentAllocation.poShippingCost}
                                    poOtherCosts={currentAllocation.poOtherCosts}
                                    grnTotal={currentAllocation.grnTotal}
                                    grnSubTotal={currentAllocation.grnSubTotal}
                                    grnTaxAmount={currentAllocation.grnTaxAmount}
                                    grnDiscountAmount={currentAllocation.grnDiscountAmount}
                                    grnShippingCost={currentAllocation.grnShippingCost}
                                    grnOtherCosts={currentAllocation.grnOtherCosts}
                                    invoiceTotal={currentAllocation.invoiceTotal}
                                    invoiceSubTotal={currentAllocation.invoiceSubTotal}
                                    invoiceTaxAmount={currentAllocation.invoiceTaxAmount}
                                    invoiceDiscountAmount={currentAllocation.invoiceDiscountAmount}
                                    invoiceDeliveryCost={currentAllocation.invoiceDeliveryCost}
                                    invoiceOtherCosts={currentAllocation.invoiceOtherCosts}
                                    isValid={currentAllocation.isValid}
                                    returnSubTotal={comparisonData?.returnSubTotal}
                                    items={comparisonData?.items || []}
                                    message={currentAllocation.isValid ? "المطابقة صحيحة ومكتملة البيانات" : "يوجد تفاوت في البيانات يتطلب المراجعة"}
                                />
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                        <AlertTriangle className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-bold">لا توجد تفاصيل مطابقة لهذا السند</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions (1/3) */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl sticky top-6 animate-slide-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-brand-primary/10 rounded-xl">
                                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800">إجراءات الاعتماد</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Finance Manager Actions */}
                            {voucher.approvalStatus === 'Pending' && voucher.status !== 'Cancelled' && !isView && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleAction('approveFinance')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        اعتماد المدير المالي
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl font-bold hover:bg-rose-50 transition-all disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        رفض السند
                                    </button>
                                </div>
                            )}

                            {/* General Manager Actions */}
                            {voucher.approvalStatus === 'FinanceApproved' && !isView && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleAction('approveGeneral')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        اعتماد المدير العام
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-white text-rose-600 border-2 border-rose-100 rounded-2xl font-bold hover:bg-rose-50 transition-all disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        رفض الطلب
                                    </button>
                                </div>
                            )}

                            {/* Disbursement Stage Wait Message */}
                            {voucher.approvalStatus === 'GMApproved' && voucher.status !== 'Paid' && (
                                <div className="p-5 bg-blue-50 border-2 border-blue-100 rounded-2xl mb-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-blue-700 font-black mb-2">
                                            <Clock className="w-5 h-5" />
                                            بانتظار صرف الدفعة
                                        </div>
                                        <p className="text-sm text-blue-600 font-medium leading-relaxed">
                                            تم اعتماد السند نهائياً من المدير العام. بانتظار المالية لتأكيد عملية الصرف الفعلي.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Action */}
                            {(voucher.approvalStatus === 'GMApproved' || voucher.approvalStatus === 'Approved') && voucher.status !== 'Paid' && !isView && (
                                <button
                                    onClick={() => handleAction('pay')}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/95 shadow-xl shadow-brand-primary/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                                >
                                    <DollarSign className="w-5 h-5" />
                                    تأكيد صرف الدفعة
                                </button>
                            )}

                            {/* Cancel Action */}
                            {voucher.status !== 'Paid' && voucher.status !== 'Cancelled' && !isView && (
                                <button
                                    onClick={() => handleAction('cancel')}
                                    disabled={actionLoading}
                                    className="w-full py-3 text-slate-400 hover:text-rose-600 text-sm font-bold transition-colors mt-4 border-t border-slate-50 pt-6"
                                >
                                    إلغاء السند بالكامل
                                </button>
                            )}

                            {/* Status Messages */}
                            {voucher.status === 'Paid' && (
                                <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
                                    <div className="p-3 bg-emerald-200 rounded-xl">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                                    </div>
                                    <div>
                                        <div className="font-black text-emerald-900 text-lg">عملية مكتملة</div>
                                        <div className="text-xs text-emerald-600 font-bold">تم الصرف بواسطة: {voucher.paidBy || 'المحاسب'}</div>
                                    </div>
                                </div>
                            )}

                            {voucher.approvalStatus === 'Rejected' && (
                                <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className="p-3 bg-rose-200 rounded-xl">
                                        <XCircle className="w-8 h-8 text-rose-700" />
                                    </div>
                                    <div>
                                        <div className="font-black text-rose-900 text-lg">سند مرفوض</div>
                                        <div className="text-xs text-rose-600 font-bold">{voucher.notes || 'لم يذكر سبب'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bank Sidebar Card */}
                    {voucher.paymentMethod === 'bank' && (
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg animate-slide-in" style={{ animationDelay: '300ms' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-amber-100 rounded-xl">
                                    <Building2 className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-xl text-slate-800">الحساب البنكي</h3>
                            </div>

                            {bankDetails.length > 0 ? (
                                <div className="space-y-4">
                                    {bankDetails.filter(b => b.isDefault).map((bank) => (
                                        <div key={bank.id} className="p-5 rounded-2xl bg-slate-50 border-2 border-brand-primary/20 space-y-3">
                                            <div className="font-black text-slate-800">{bank.bankName}</div>
                                            <div className="relative">
                                                <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest leading-none">Account Number</div>
                                                <div className="font-mono text-sm text-brand-primary font-bold break-all bg-white p-2 rounded-lg border border-slate-100">{bank.bankAccountNo}</div>
                                            </div>
                                            {bank.iban && (
                                                <div className="relative">
                                                    <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest leading-none">IBAN</div>
                                                    <div className="font-mono text-[10px] text-slate-600 break-all p-2 bg-slate-100 rounded-lg">{bank.iban}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : supplier?.bankName ? (
                                <div className="p-5 rounded-2xl bg-slate-50 border-2 border-amber-200 space-y-3">
                                    <div className="font-black text-slate-800">{supplier.bankName}</div>
                                    <div className="font-mono text-sm text-amber-600 font-bold break-all bg-white p-2 rounded-lg border border-slate-100">{supplier.bankAccountNo}</div>
                                    {supplier.iban && <div className="font-mono text-[10px] text-slate-500 break-all">{supplier.iban}</div>}
                                </div>
                            ) : (
                                <div className="p-6 bg-rose-50 border-2 border-dashed border-rose-100 rounded-2xl text-center">
                                    <AlertTriangle className="w-8 h-8 text-rose-300 mx-auto mb-3" />
                                    <p className="text-rose-700 font-bold text-sm">لا توجد بيانات بنكية مسجلة لهذا المورد</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentVoucherDetailPage;
