import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    CreditCard
} from 'lucide-react';
import { paymentVoucherService, type PaymentVoucherDto } from '../../services/paymentVoucherService';
import { supplierService, type SupplierDto, type SupplierBankDto } from '../../services/supplierService';
import InvoiceMatchingValidation from '../../components/finance/InvoiceMatchingValidation';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

const PaymentVoucherDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [voucher, setVoucher] = useState<PaymentVoucherDto | null>(null);
    const [supplier, setSupplier] = useState<SupplierDto | null>(null);
    const [bankDetails, setBankDetails] = useState<SupplierBankDto[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

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
                status: 'completed', // Assumes matching is done at creation
                icon: ShieldCheck
            },
            {
                id: 'finance_approval',
                label: 'اعتماد المالي',
                subLabel: (voucher.approvedByFinanceManager || ['FinanceApproved', 'GMApproved', 'Paid'].includes(voucher.approvalStatus || '')) ? 'تم الاعتماد' : 'قيد الانتظار',
                status: (voucher.approvedByFinanceManager || ['FinanceApproved', 'GMApproved', 'Paid'].includes(voucher.approvalStatus || ''))
                    ? 'completed'
                    : voucher.status === 'Cancelled' || voucher.approvalStatus === 'Rejected'
                        ? 'rejected'
                        : 'current',
                icon: CheckCircle2
            },
            {
                id: 'general_approval',
                label: 'اعتماد المدير العام',
                subLabel: (voucher.approvedByGeneralManager || ['GMApproved', 'Paid'].includes(voucher.approvalStatus || '')) ? 'تم الاعتماد' : 'قيد الانتظار',
                status: (voucher.approvedByGeneralManager || ['GMApproved', 'Paid'].includes(voucher.approvalStatus || ''))
                    ? 'completed'
                    : voucher.approvalStatus === 'FinanceApproved'
                        ? 'current'
                        : 'pending',
                icon: CheckCircle2
            },
            {
                id: 'payment',
                label: 'صرف الدفعة',
                subLabel: voucher.status === 'Paid' ? `تم الصرف: ${voucher.paymentMethod}` : 'قيد الانتظار',
                status: voucher.status === 'Paid'
                    ? 'completed'
                    : voucher.approvalStatus === 'GMApproved'
                        ? 'current'
                        : 'pending',
                icon: DollarSign
            },
            {
                id: 'archived',
                label: 'الأرشفة',
                subLabel: voucher.status === 'Paid' ? 'مؤرشف' : '-',
                status: voucher.status === 'Paid' ? 'completed' : 'pending',
                icon: Wallet
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
            const currentUser = 'User'; // In real app, get from auth context

            switch (action) {
                case 'approveFinance':
                    await paymentVoucherService.approveFinanceManager(voucher.paymentVoucherId, currentUser);
                    toast.success('تم اعتماد المدير المالي بنجاح');
                    break;
                case 'approveGeneral':
                    await paymentVoucherService.approveGeneralManager(voucher.paymentVoucherId, currentUser);
                    toast.success('تم اعتماد المدير العام بنجاح');
                    break;
                case 'pay':
                    await paymentVoucherService.processPayment(voucher.paymentVoucherId, currentUser);
                    toast.success('تم صرف الدفعة بنجاح');
                    break;
                case 'reject':
                    await paymentVoucherService.rejectVoucher(voucher.paymentVoucherId, currentUser, reason!);
                    toast.success('تم رفض السند');
                    break;
                case 'cancel':
                    await paymentVoucherService.cancelVoucher(voucher.paymentVoucherId, currentUser, reason!);
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/finance/payment-vouchers')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-6 h-6 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            سند صرف #{voucher.voucherNumber}
                        </h1>
                        <p className="text-slate-500">
                            عرض التفاصيل وحالة الاعتماد
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium transition-colors">
                        <Printer className="w-4 h-4" />
                        <span>طباعة</span>
                    </button>
                </div>
            </div>

            {/* Workflow Timeline */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <h3 className="font-bold text-lg mb-6 text-slate-800 border-b pb-4">مراحل الاعتماد</h3>
                <div className="flex items-center justify-between min-w-[800px]">
                    {steps.map((step, index) => {
                        const isLast = index === steps.length - 1;
                        const StepIcon = step.icon;
                        let statusColor = 'bg-slate-100 text-slate-400 border-slate-200';
                        let lineColor = 'bg-slate-200';

                        if (step.status === 'completed') {
                            statusColor = 'bg-emerald-100 text-emerald-600 border-emerald-200';
                            lineColor = 'bg-emerald-500';
                        } else if (step.status === 'current') {
                            statusColor = 'bg-blue-100 text-blue-600 border-blue-200 ring-2 ring-blue-100';
                            lineColor = 'bg-slate-200';
                        } else if (step.status === 'rejected') {
                            statusColor = 'bg-rose-100 text-rose-600 border-rose-200';
                            lineColor = 'bg-rose-200';
                        }

                        return (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center relative z-10 w-32">
                                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-300 ${statusColor}`}>
                                        <StepIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-sm text-slate-800 mb-1">{step.label}</div>
                                        <div className="text-xs text-slate-500">{step.subLabel}</div>
                                    </div>
                                </div>
                                {!isLast && (
                                    <div className="flex-1 h-1 mx-2 relative top-[-30px] -z-0 rounded-full overflow-hidden bg-slate-100">
                                        <div className={`h-full transition-all duration-500 ${lineColor}`} style={{ width: step.status === 'completed' ? '100%' : '0%' }} />
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
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-primary" />
                            بيانات السند
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">رقم السند</label>
                                <div className="font-bold text-slate-800">{voucher.voucherNumber}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">تاريخ السند</label>
                                <div className="font-bold text-slate-800">{formatDate(voucher.voucherDate)}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">المبلغ</label>
                                <div className="font-bold text-emerald-600 text-lg">
                                    {formatNumber(voucher.amount)} {voucher.currency}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">طريقة الدفع</label>
                                <div className="font-bold text-slate-800">{voucher.paymentMethod === 'cash' ? 'نقداً' : voucher.paymentMethod === 'bank' ? 'تحويل بنكي' : 'شيك'}</div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-slate-500 mb-1">المورد</label>
                                <div className="font-bold text-slate-800">{voucher.supplierNameAr} {voucher.supplierNameEn && `(${voucher.supplierNameEn})`}</div>
                            </div>
                            {voucher.description && (
                                <div className="col-span-3 bg-slate-50 p-3 rounded-xl">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">ملاحظات / وصف</label>
                                    <div className="text-sm text-slate-700">{voucher.description}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Supplier Bank Details */}
                    {voucher.paymentMethod === 'bank' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-brand-primary" />
                                بيانات الحساب البنكي للمورد
                            </h3>
                            {bankDetails.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bankDetails.map((bank) => (
                                        <div key={bank.id} className={`p-4 rounded-xl border-2 transition-all ${bank.isDefault ? 'border-brand-primary bg-emerald-50/20' : 'border-slate-100 bg-slate-50'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold text-slate-800">{bank.bankName}</div>
                                                {bank.isDefault && <span className="text-[10px] bg-brand-primary text-white px-2 py-0.5 rounded-full">افتراضي</span>}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="font-mono">{bank.bankAccountNo}</span>
                                                </div>
                                                {bank.iban && (
                                                    <div className="text-xs text-slate-500 font-mono mt-1 break-all">
                                                        IBAN: {bank.iban}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : supplier?.bankName ? (
                                <div className="p-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-xl">
                                    <div className="font-bold text-slate-800 mb-1">{supplier.bankName}</div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700 font-mono">
                                        <CreditCard className="w-4 h-4" />
                                        {supplier.bankAccountNo}
                                    </div>
                                    {supplier.iban && <div className="text-xs text-slate-500 mt-1 font-mono break-all">IBAN: {supplier.iban}</div>}
                                </div>
                            ) : (
                                <div className="p-4 bg-rose-50 border-2 border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 font-medium">
                                    <AlertTriangle className="w-5 h-5" />
                                    لا توجد بيانات بنكية مسجلة لهذا المورد
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3-Way Matching Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-brand-primary" />
                            مطابقة الوثائق (3-Way Match)
                        </h3>

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
                                items={[]} // Enhanced data mapping here if allocations had items
                                message={currentAllocation.isValid ? "المطابقة صحيحة ومكتملة البيانات" : "يوجد تفاوت في البيانات يتطلب المراجعة"}
                            />
                        ) : (
                            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                لا توجد تفاصيل مطابقة لهذا السند
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions (1/3) */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">إجراءات الاعتماد</h3>

                        <div className="space-y-3">
                            {/* Finance Manager Actions */}
                            {voucher.approvalStatus === 'Pending' && voucher.status !== 'Cancelled' && (
                                <>
                                    <button
                                        onClick={() => handleAction('approveFinance')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        اعتماد المدير المالي
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-white text-rose-600 border-2 border-rose-100 rounded-xl font-bold hover:bg-rose-50 transition-all disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        رفض السند
                                    </button>
                                </>
                            )}

                            {/* General Manager Actions */}
                            {voucher.approvalStatus === 'FinanceApproved' && (
                                <>
                                    <button
                                        onClick={() => handleAction('approveGeneral')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        <ShieldCheck className="w-5 h-5" />
                                        اعتماد المدير العام
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={actionLoading}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-white text-rose-600 border-2 border-rose-100 rounded-xl font-bold hover:bg-rose-50 transition-all disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        رفض
                                    </button>
                                </>
                            )}

                            {/* Disbursement Stage Wait Message */}
                            {voucher.approvalStatus === 'GMApproved' && (
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                                    <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                                        <AlertTriangle className="w-4 h-4" />
                                        بانتظار صرف الدفعة
                                    </div>
                                    <p className="text-xs text-blue-600">
                                        تم اعتماد السند من المدير العام. بانتظار تأكيد الصرف من المحاسب.
                                    </p>
                                </div>
                            )}

                            {/* Payment Action */}
                            {(voucher.approvalStatus === 'GMApproved' || voucher.approvalStatus === 'Approved') && voucher.status !== 'Paid' && (
                                <button
                                    onClick={() => handleAction('pay')}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 shadow-md transition-all disabled:opacity-50 active:scale-[0.98]"
                                >
                                    <DollarSign className="w-5 h-5" />
                                    تأكيد صرف الدفعة
                                </button>
                            )}

                            {/* Cancel Action */}
                            {voucher.status !== 'Paid' && voucher.status !== 'Cancelled' && (
                                <button
                                    onClick={() => handleAction('cancel')}
                                    disabled={actionLoading}
                                    className="w-full py-3 text-slate-500 hover:text-rose-600 text-sm font-medium transition-colors mt-4"
                                >
                                    إلغاء السند بالكامل
                                </button>
                            )}

                            {/* Status Messages */}
                            {voucher.status === 'Paid' && (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 shadow-sm">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    <div>
                                        <div className="font-bold text-emerald-800">تم الدفع بنجاح</div>
                                        <div className="text-xs text-emerald-600">بواسطة {voucher.paidBy || 'System'}</div>
                                    </div>
                                </div>
                            )}

                            {voucher.approvalStatus === 'Rejected' && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 shadow-sm">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                    <div>
                                        <div className="font-bold text-rose-800">تم رفض السند</div>
                                        <div className="text-xs text-rose-600">{voucher.notes}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentVoucherDetailPage;
