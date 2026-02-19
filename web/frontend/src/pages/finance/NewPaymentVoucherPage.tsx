import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowRight,
    Save,
    X,
    Wallet,
    CheckCircle2,
    FileText,
    Loader2,
    ArrowLeft,
    ShieldCheck,
    AlertTriangle,
    Sparkles,
    CreditCard,
    Building2,
    Banknote,
    Receipt,
    CalendarDays,
    Hash,
    StickyNote,
    ChevronDown,
    CircleDot,
    BadgeCheck,
} from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { useSystemSettings } from '../../hooks/useSystemSettings';

import {
    paymentVoucherService,
    type SupplierWithInvoices,
    type InvoiceComparisonData,
    type PaymentVoucherDto,
} from '../../services/paymentVoucherService';
import InvoiceMatchingValidation from '../../components/finance/InvoiceMatchingValidation';

interface SelectedInvoice extends InvoiceComparisonData {
    allocatedAmount: number;
}

/* ───────── Step Indicator ───────── */
const StepIndicator: React.FC<{ currentStep: 1 | 2 }> = ({ currentStep }) => {
    const steps = [
        { num: 1, label: 'المطابقة والاختيار', icon: ShieldCheck },
        { num: 2, label: 'تفاصيل الدفع', icon: CreditCard },
    ];

    return (
        <div className="flex items-center gap-3">
            {steps.map((step, idx) => {
                const isActive = currentStep >= step.num;
                const isCurrent = currentStep === step.num;
                const Icon = step.icon;
                return (
                    <React.Fragment key={step.num}>
                        {idx > 0 && (
                            <div className="w-16 h-1 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: isActive ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                        <div
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300
                                ${isCurrent
                                    ? 'bg-emerald-50 border-2 border-emerald-200 shadow-sm shadow-emerald-100'
                                    : isActive
                                        ? 'bg-emerald-50/50 border-2 border-emerald-100'
                                        : 'bg-slate-50 border-2 border-slate-100'
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                                    ${isActive
                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                                        : 'bg-slate-200 text-slate-400'
                                    }`}
                            >
                                {isActive && step.num < currentStep ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <Icon className="w-4 h-4" />
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <div className={`text-[10px] font-bold uppercase tracking-wider
                                    ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    خطوة {step.num}
                                </div>
                                <div className={`text-xs font-bold
                                    ${isCurrent ? 'text-slate-800' : isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                                    {step.label}
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/* ───────── Payment Method Card ───────── */
const PaymentMethodCard: React.FC<{
    value: string;
    label: string;
    icon: React.ElementType;
    selected: boolean;
    disabled?: boolean;
    onClick: () => void;
}> = ({ value, label, icon: Icon, selected, disabled, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
            ${disabled
                ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50'
                : selected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
    >
        <div className={`p-2.5 rounded-xl transition-colors
            ${selected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-bold ${selected ? 'text-emerald-700' : 'text-slate-600'}`}>
            {label}
        </span>
        {selected && (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        )}
    </button>
);

const NewPaymentVoucherPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [suppliersLoading, setSuppliersLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<SupplierWithInvoices[]>([]);

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [validationAcknowledged, setValidationAcknowledged] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithInvoices | null>(null);
    const [selectedInvoices, setSelectedInvoices] = useState<SelectedInvoice[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    const [formData, setFormData] = useState({
        voucherNumber: '',
        voucherDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash' as 'cash' | 'bank' | 'cheque' | 'bank_transfer',
        bankAccount: '',
        notes: '',
        referenceNumber: '',
        isSplitPayment: false,
        cashAmount: 0,
        bankAmount: 0,
        chequeAmount: 0,
        bankTransferAmount: 0,
        currency: defaultCurrency,
    });

    const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.allocatedAmount, 0);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => { loadSuppliers(); }, []);

    useEffect(() => {
        const preSelectedInvoices = location.state?.preSelectedInvoices as InvoiceComparisonData[] | undefined;
        if (!suppliersLoading && suppliers.length > 0 && preSelectedInvoices && preSelectedInvoices.length > 0) {
            const firstInvoice = preSelectedInvoices[0];
            const supplier = suppliers.find(s =>
                s.pendingInvoices.some(inv => inv.supplierInvoiceId === firstInvoice.supplierInvoiceId)
            );
            if (supplier) {
                setSelectedSupplier(supplier);
                const invoicesToSelect: SelectedInvoice[] = preSelectedInvoices.map(preInv => ({
                    ...preInv,
                    allocatedAmount: preInv.invoiceTotal
                }));
                setSelectedInvoices(invoicesToSelect);
                setIsDirty(true);
            }
            window.history.replaceState({}, document.title);
        }
    }, [suppliersLoading, suppliers, location.state]);

    const loadSuppliers = async () => {
        setSuppliersLoading(true);
        try {
            const data = await paymentVoucherService.getSuppliersWithPendingInvoices();
            setSuppliers(data);
        } catch {
            toast.error('فشل تحميل الموردين');
        } finally {
            setSuppliersLoading(false);
        }
    };

    const handleSupplierChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const supplierId = e.target.value;
            if (!supplierId) {
                setSelectedSupplier(null);
                setSelectedInvoices([]);
                setIsDirty(false);
                return;
            }
            const supplier = suppliers.find((s) => String(s.supplierId) === supplierId);
            if (supplier) {
                if (selectedInvoices.length > 0) {
                    if (!window.confirm('سيتم مسح جميع الفواتير المحددة عند تغيير المورد. هل أنت متأكد؟')) return;
                }
                setSelectedSupplier(supplier);
                setSelectedInvoices([]);
                setIsDirty(true);
            }
        },
        [suppliers, selectedInvoices.length]
    );

    const handleClearSupplier = useCallback(() => {
        if (selectedInvoices.length > 0) {
            if (!window.confirm('سيتم مسح جميع الفواتير المحددة. هل أنت متأكد؟')) return;
        }
        setSelectedSupplier(null);
        setSelectedInvoices([]);
        setIsDirty(false);
    }, [selectedInvoices.length]);

    const handleInvoiceToggle = useCallback((invoice: InvoiceComparisonData) => {
        setSelectedInvoices((prev) => {
            const exists = prev.findIndex((inv) => inv.supplierInvoiceId === invoice.supplierInvoiceId);
            if (exists >= 0) return prev.filter((inv) => inv.supplierInvoiceId !== invoice.supplierInvoiceId);
            return [...prev, { ...invoice, allocatedAmount: invoice.remainingAmount ?? invoice.invoiceTotal }];
        });
        setIsDirty(true);
    }, []);

    const handleInvoiceAmountChange = useCallback((invoiceId: number, newAmount: number) => {
        setSelectedInvoices((prev) =>
            prev.map((inv) =>
                inv.supplierInvoiceId === invoiceId ? { ...inv, allocatedAmount: newAmount } : inv
            )
        );
        setIsDirty(true);
    }, []);

    const isInvoiceSelected = useCallback(
        (invoiceId: number): boolean => selectedInvoices.some((inv) => inv.supplierInvoiceId === invoiceId),
        [selectedInvoices]
    );

    const validateStep1 = (): boolean => {
        if (!selectedSupplier) { toast.error('يرجى اختيار المورد'); return false; }
        if (selectedInvoices.length === 0) { toast.error('يرجى اختيار فاتورة واحدة على الأقل'); return false; }
        const hasInvalidMatching = selectedInvoices.some(inv => !inv.isValid);
        if (hasInvalidMatching && !validationAcknowledged) {
            toast.error('يرجى تأكيد مراجعة الفروقات في الفواتير المحددة');
            return false;
        }
        if (!validationAcknowledged) { toast.error('يرجى تأكيد مراجعة بيانات المطابقة'); return false; }
        return true;
    };

    const validateStep2 = (): string | null => {
        if (formData.isSplitPayment) {
            const totalSplit = (formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0);
            if (totalSplit > totalAmount + 0.01) {
                return `مجموع التوزيع (${formatNumber(totalSplit)}) يتجاوز إجمالي الفواتير المختارة (${formatNumber(totalAmount)})`;
            }
        } else {
            if (formData.paymentMethod === 'bank' && !formData.bankAccount.trim()) {
                return 'يرجى إدخال رقم الحساب البنكي';
            }
        }
        return null;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(1, prev - 1) as 1 | 2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateStep2();
        if (validationError) { toast.error(validationError); return; }
        try {
            setLoading(true);
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            const currentUserId = user?.userId || 1;

            const totalSplit = (formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0);
            const voucherAmount = formData.isSplitPayment ? totalSplit : totalAmount;
            const voucher: PaymentVoucherDto = {
                voucherNumber: formData.voucherNumber,
                voucherDate: formData.voucherDate,
                supplierId: selectedSupplier!.supplierId,
                paymentMethod: formData.paymentMethod,
                amount: voucherAmount,
                cashAmount: formData.isSplitPayment ? formData.cashAmount : (formData.paymentMethod === 'cash' ? totalAmount : 0),
                bankAmount: formData.isSplitPayment ? formData.bankAmount : (formData.paymentMethod === 'bank' ? totalAmount : 0),
                chequeAmount: formData.isSplitPayment ? formData.chequeAmount : (formData.paymentMethod === 'cheque' ? totalAmount : 0),
                bankTransferAmount: formData.isSplitPayment ? formData.bankTransferAmount : (formData.paymentMethod === 'bank_transfer' ? totalAmount : 0),
                isSplitPayment: formData.isSplitPayment,
                currency: formData.currency || defaultCurrency,
                exchangeRate: 1.0,
                description: selectedInvoices.length > 1
                    ? `دفعة مجمعة لعدد ${selectedInvoices.length} فواتير`
                    : `دفعة للفاتورة رقم ${selectedInvoices[0].invoiceNumber}`,
                notes: formData.notes,
                preparedByUserId: currentUserId,
                status: 'Closed',
                approvalStatus: 'Pending',
                allocations: selectedInvoices.map(inv => ({
                    supplierInvoiceId: inv.supplierInvoiceId,
                    allocatedAmount: inv.allocatedAmount,
                    invoiceNumber: inv.invoiceNumber,
                    invoiceDate: inv.invoiceDate,
                    invoiceTotal: inv.invoiceTotal,
                    invoiceSubTotal: inv.invoiceSubTotal,
                    invoiceTaxAmount: inv.invoiceTaxAmount,
                    invoiceDiscountAmount: inv.invoiceDiscountAmount,
                    invoiceDeliveryCost: inv.invoiceDeliveryCost,
                    invoiceOtherCosts: inv.invoiceOtherCosts,
                    poNumber: inv.poNumber,
                    poTotal: inv.poTotal,
                    poSubTotal: inv.poSubTotal,
                    poTaxAmount: inv.poTaxAmount,
                    poDiscountAmount: inv.poDiscountAmount,
                    poShippingCost: inv.poShippingCost,
                    poOtherCosts: inv.poOtherCosts,
                    grnNumber: inv.grnNumber,
                    grnTotal: inv.grnTotal,
                    grnSubTotal: inv.grnSubTotal,
                    grnTaxAmount: inv.grnTaxAmount,
                    grnDiscountAmount: inv.grnDiscountAmount,
                    grnShippingCost: inv.grnShippingCost,
                    grnOtherCosts: inv.grnOtherCosts,
                    variancePercentage: inv.variancePercentage,
                    isValid: inv.isValid,
                }))
            };
            await paymentVoucherService.createVoucher(voucher);
            setIsDirty(false);
            toast.success('تم إنشاء سند الصرف بنجاح');
            navigate('/dashboard/finance/payment-vouchers');
        } catch {
            toast.error('فشل إنشاء سند الصرف');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (isDirty && !window.confirm('لديك تغييرات غير محفوظة. هل أنت متأكد من الإلغاء؟')) return;
        navigate('/dashboard/finance/payment-vouchers');
    };

    const splitTotal = (formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50" dir="rtl">
            {/* Keyframes */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeInUp 0.4s ease-out;
                }
            `}</style>

            {/* ────────── Header ────────── */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 
                                    rounded-xl transition-all"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <div className="w-px h-8 bg-slate-200" />
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 
                                    rounded-xl shadow-sm shadow-emerald-200">
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                                        سند صرف جديد
                                    </h1>
                                    <p className="text-xs text-slate-400 font-medium">
                                        إنشاء سند صرف واعتماد المدفوعات
                                    </p>
                                </div>
                            </div>
                        </div>

                        <StepIndicator currentStep={currentStep} />
                    </div>
                </div>
            </div>

            {/* ────────── Content ────────── */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <form onSubmit={handleSubmit}>

                    {/* ═══════ STEP 1: Matching & Selection ═══════ */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fadeIn">

                            {/* Supplier Selection */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <Building2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800">اختيار المورد</h2>
                                            <p className="text-xs text-slate-400 mt-0.5">حدد المورد الذي تريد إنشاء سند صرف له</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {suppliersLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
                                                <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">
                                                جاري تحميل الموردين...
                                            </span>
                                        </div>
                                    ) : suppliers.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="relative w-20 h-20 mx-auto mb-4">
                                                <div className="absolute inset-0 bg-slate-100 rounded-2xl rotate-6" />
                                                <div className="absolute inset-0 bg-slate-50 rounded-2xl -rotate-3" />
                                                <div className="relative w-full h-full bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-slate-300" />
                                                </div>
                                            </div>
                                            <h3 className="text-base font-bold text-slate-600">لا يوجد موردين</h3>
                                            <p className="text-sm text-slate-400 mt-1">لا يوجد موردين لديهم فواتير معلقة</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <select
                                                    id="supplierSelect"
                                                    value={selectedSupplier ? String(selectedSupplier.supplierId) : ''}
                                                    onChange={handleSupplierChange}
                                                    className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl 
                                                        focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                                                        outline-none transition-all font-semibold text-slate-800 
                                                        appearance-none cursor-pointer hover:border-slate-300"
                                                >
                                                    <option value="">— اختر المورد —</option>
                                                    {suppliers.map((supplier) => (
                                                        <option key={supplier.supplierId} value={String(supplier.supplierId)}>
                                                            {supplier.nameAr} — {supplier.code} — ({supplier.pendingInvoices.length} فاتورة — {formatNumber(convertAmount(supplier.totalOutstanding || 0, 'EGP'))} {getCurrencyLabel(defaultCurrency)} مستحق)
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>

                                            {selectedSupplier && (
                                                <div className="flex items-center gap-4 p-4 bg-gradient-to-l from-emerald-50 to-emerald-50/30 
                                                    border border-emerald-200/60 rounded-xl"
                                                    style={{ animation: 'fadeInUp 0.3s ease-out' }}
                                                >
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <BadgeCheck className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-800 text-sm">
                                                            {selectedSupplier.nameAr}
                                                            {selectedSupplier.nameEn && (
                                                                <span className="text-slate-500 font-medium mr-2 text-xs">
                                                                    ({selectedSupplier.nameEn})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            {[
                                                                `كود: ${selectedSupplier.code}`,
                                                                `${selectedSupplier.pendingInvoices.length} فاتورة معلقة`,
                                                                `مستحق: ${formatNumber(convertAmount(selectedSupplier.totalOutstanding || 0, 'EGP'))} ${getCurrencyLabel(defaultCurrency)}`,
                                                            ].map((tag, i) => (
                                                                <span key={i} className="text-[10px] font-bold px-2 py-0.5 
                                                                    bg-emerald-100/80 text-emerald-700 rounded-md border border-emerald-200/40">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleClearSupplier}
                                                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
                                                        aria-label="إزالة المورد المحدد"
                                                    >
                                                        <X className="w-4 h-4 text-emerald-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Selection with Comparison */}
                            {selectedSupplier && selectedSupplier.pendingInvoices.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-violet-100 rounded-lg">
                                                    <Receipt className="w-4 h-4 text-violet-600" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-bold text-slate-800">اختيار الفواتير والمطابقة</h2>
                                                    <p className="text-xs text-slate-400 mt-0.5">راجع بيانات المطابقة وحدد الفواتير المراد دفعها</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400">محدد</span>
                                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-extrabold min-w-[2rem] text-center">
                                                    {selectedInvoices.length}/{selectedSupplier.pendingInvoices.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {selectedSupplier.pendingInvoices.map((invoice, idx) => {
                                            const selected = isInvoiceSelected(invoice.supplierInvoiceId);
                                            return (
                                                <div
                                                    key={invoice.supplierInvoiceId}
                                                    className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
                                                        ${selected
                                                            ? 'border-emerald-400 bg-emerald-50/20 shadow-sm shadow-emerald-100'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                        }`}
                                                    style={{ animationDelay: `${idx * 60}ms`, animation: 'fadeInUp 0.4s ease-out forwards' }}
                                                >
                                                    {/* Selection bar */}
                                                    <div className={`absolute top-0 right-0 w-1 h-full rounded-r-full transition-all duration-300
                                                        ${selected ? 'bg-emerald-500' : 'bg-transparent'}`} />

                                                    <div className="p-5">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <label className="flex items-center gap-3 cursor-pointer">
                                                                <div
                                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                                                                        ${selected
                                                                            ? 'bg-emerald-600 border-emerald-600 shadow-sm shadow-emerald-200'
                                                                            : 'border-slate-300 bg-white hover:border-slate-400'
                                                                        }`}
                                                                    onClick={() => handleInvoiceToggle(invoice)}
                                                                    role="checkbox"
                                                                    aria-checked={selected}
                                                                    tabIndex={0}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault();
                                                                            handleInvoiceToggle(invoice);
                                                                        }
                                                                    }}
                                                                >
                                                                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-slate-800">
                                                                            {invoice.invoiceNumber}
                                                                        </span>
                                                                        {!invoice.isValid && (
                                                                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold border border-amber-200/60">
                                                                                فروقات
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                                        <CalendarDays className="w-3 h-3" />
                                                                        {formatDate(invoice.invoiceDate)}
                                                                    </div>
                                                                </div>
                                                            </label>

                                                            <div className="flex flex-col items-end">
                                                                <span className="text-lg font-extrabold text-slate-800 tabular-nums">
                                                                    {formatNumber(convertAmount(invoice.remainingAmount ?? invoice.invoiceTotal, invoice.currency || 'EGP'))}
                                                                    <span className="text-xs font-semibold text-slate-400 mr-1">
                                                                        {getCurrencyLabel(defaultCurrency)}
                                                                    </span>
                                                                </span>
                                                                {(invoice.paidAmount ?? 0) > 0 && (
                                                                    <div className="flex flex-col items-end mt-1.5 gap-0.5">
                                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 
                                                                            px-1.5 py-0.5 rounded border border-emerald-100">
                                                                            مدفوع جزئياً: {formatNumber(convertAmount(invoice.paidAmount || 0, invoice.currency || 'EGP'))} {getCurrencyLabel(defaultCurrency)}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                                            إجمالي الفاتورة: {formatNumber(convertAmount(invoice.invoiceTotal, invoice.currency || 'EGP'))} {getCurrencyLabel(defaultCurrency)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Validation Component */}
                                                        <InvoiceMatchingValidation
                                                            poNumber={invoice.poNumber}
                                                            grnNumber={invoice.grnNumber}
                                                            invoiceNumber={invoice.invoiceNumber}
                                                            poTotal={invoice.poTotal}
                                                            poSubTotal={invoice.poSubTotal}
                                                            poTaxAmount={invoice.poTaxAmount}
                                                            poDiscountAmount={invoice.poDiscountAmount}
                                                            poShippingCost={invoice.poShippingCost}
                                                            poOtherCosts={invoice.poOtherCosts}
                                                            grnTotal={invoice.grnTotal}
                                                            grnSubTotal={invoice.grnSubTotal}
                                                            grnTaxAmount={invoice.grnTaxAmount}
                                                            grnDiscountAmount={invoice.grnDiscountAmount}
                                                            grnTaxPercentage={invoice.grnTaxPercentage}
                                                            grnDiscountPercentage={invoice.grnDiscountPercentage}
                                                            grnShippingCost={invoice.grnShippingCost}
                                                            grnOtherCosts={invoice.grnOtherCosts}
                                                            invoiceTotal={invoice.invoiceTotal}
                                                            invoiceSubTotal={invoice.invoiceSubTotal}
                                                            invoiceTaxAmount={invoice.invoiceTaxAmount}
                                                            invoiceDiscountAmount={invoice.invoiceDiscountAmount}
                                                            invoiceTaxPercentage={invoice.invoiceTaxPercentage}
                                                            invoiceDiscountPercentage={invoice.invoiceDiscountPercentage}
                                                            invoiceDeliveryCost={invoice.invoiceDeliveryCost}
                                                            invoiceOtherCosts={invoice.invoiceOtherCosts}
                                                            isValid={invoice.isValid}
                                                            returnSubTotal={invoice.returnSubTotal}
                                                            items={invoice.items || []}

                                                        />

                                                        {selected && (
                                                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700 
                                                                bg-emerald-100 p-2.5 rounded-lg w-fit border border-emerald-200/40"
                                                                style={{ animation: 'fadeInUp 0.2s ease-out' }}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                تم اختيار الفاتورة للدفع
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Validation Acknowledgement */}
                                    {selectedInvoices.length > 0 && (
                                        <div className="mx-6 mb-6">
                                            <div className={`p-5 rounded-2xl border-2 border-dashed transition-all duration-300
                                                ${validationAcknowledged
                                                    ? 'border-emerald-300 bg-emerald-50/30'
                                                    : 'border-slate-300 bg-slate-50/50'
                                                }`}>
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2.5 rounded-xl transition-colors duration-300
                                                        ${validationAcknowledged
                                                            ? 'bg-emerald-100 text-emerald-600'
                                                            : 'bg-amber-100 text-amber-600'
                                                        }`}>
                                                        <ShieldCheck className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-slate-800 mb-1">تأكيد عملية المطابقة</h3>
                                                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                                                            يرجى مراجعة بيانات المطابقة (PO vs GRN vs Invoice) أعلاه. في حالة وجود فروقات، يرجى التأكد من صحتها قبل المتابعة.
                                                        </p>

                                                        {selectedInvoices.some(inv => !inv.isValid) && (
                                                            <div className="mb-4 flex items-center gap-2.5 text-amber-700 bg-amber-50 
                                                                p-3 rounded-xl border border-amber-200/60"
                                                                style={{ animation: 'fadeInUp 0.3s ease-out' }}
                                                            >
                                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                                <span className="text-xs font-bold">
                                                                    تنبيه: توجد فروقات في مطابقة بعض الفواتير المختارة (أكثر من 10%).
                                                                </span>
                                                            </div>
                                                        )}

                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <div
                                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                                                    ${validationAcknowledged
                                                                        ? 'bg-emerald-600 border-emerald-600'
                                                                        : 'border-slate-300 group-hover:border-slate-400 bg-white'
                                                                    }`}
                                                                onClick={() => setValidationAcknowledged(!validationAcknowledged)}
                                                            >
                                                                {validationAcknowledged && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700 select-none">
                                                                لقد قمت بمراجعة بيانات المطابقة وأؤكد صحتها للمتابعة
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 1 Actions */}
                            {selectedSupplier && selectedSupplier.pendingInvoices.length > 0 && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={selectedInvoices.length === 0 || !validationAcknowledged}
                                        className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 text-white rounded-xl 
                                            font-bold shadow-lg shadow-emerald-200/50
                                            hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200/60
                                            active:scale-[0.97] transition-all duration-200 
                                            disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        <span>متابعة لبيانات الدفع</span>
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════ STEP 2: Payment Details ═══════ */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-fadeIn">

                            {/* Selected Invoices Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800">الفواتير المختارة للدفع</h2>
                                            <p className="text-xs text-slate-400 mt-0.5">حدد المبلغ المراد دفعه لكل فاتورة</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3">
                                    {selectedInvoices.map((inv, idx) => (
                                        <div
                                            key={inv.supplierInvoiceId}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 
                                                p-4 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200/60 
                                                transition-all duration-200"
                                            style={{ animationDelay: `${idx * 60}ms`, animation: 'fadeInUp 0.3s ease-out forwards' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500/15 to-blue-500/5 
                                                    rounded-lg flex items-center justify-center">
                                                    <Receipt className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800">{inv.invoiceNumber}</div>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {formatDate(inv.invoiceDate)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">قيمة الفاتورة</div>
                                                    <div className="text-sm font-bold text-slate-600 tabular-nums">
                                                        {formatNumber(inv.invoiceTotal)}
                                                    </div>
                                                </div>

                                                <div className="w-px h-10 bg-slate-200 hidden sm:block" />

                                                <div className="flex flex-col gap-1 w-full sm:w-48">
                                                    <label htmlFor={`amount-${inv.supplierInvoiceId}`}
                                                        className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                        المبلغ المراد دفعه
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id={`amount-${inv.supplierInvoiceId}`}
                                                            type="number"
                                                            className="w-full pl-3 pr-12 py-2 border-2 border-slate-200 rounded-lg 
                                                                focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                                                                outline-none transition-all font-bold text-slate-800 text-sm bg-white"
                                                            value={inv.allocatedAmount || ''}
                                                            onChange={(e) => handleInvoiceAmountChange(inv.supplierInvoiceId!, parseFloat(e.target.value))}
                                                            min={0}
                                                            max={inv.remainingAmount ?? inv.invoiceTotal}
                                                            step="0.01"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                                                            {getCurrencyLabel(formData.currency || defaultCurrency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Total */}
                                    <div className="flex justify-end items-center gap-4 pt-4 mt-2 border-t border-slate-200">
                                        <span className="text-sm font-bold text-slate-500">الإجمالي الكلي:</span>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                                                {formatNumber(totalAmount)}
                                            </span>
                                            <span className="text-sm font-bold text-emerald-400">
                                                {getCurrencyLabel(formData.currency || defaultCurrency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details Form */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg">
                                            <CreditCard className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800">تفاصيل الدفع</h2>
                                            <p className="text-xs text-slate-400 mt-0.5">بيانات السند وطريقة الدفع</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Voucher Number */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <Hash className="w-3.5 h-3.5" />
                                                رقم السند
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.voucherNumber}
                                                placeholder="يتم إنشاؤه تلقائياً"
                                                className="w-full px-4 py-3 bg-slate-100/80 border-2 border-slate-100 rounded-xl 
                                                    text-slate-400 font-semibold cursor-not-allowed text-sm"
                                                disabled
                                            />
                                        </div>

                                        {/* Voucher Date */}
                                        <div className="space-y-2">
                                            <label htmlFor="voucherDate"
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                تاريخ السند <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                id="voucherDate"
                                                type="date"
                                                value={formData.voucherDate}
                                                onChange={(e) => { setFormData(prev => ({ ...prev, voucherDate: e.target.value })); setIsDirty(true); }}
                                                className="w-full px-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-xl 
                                                    focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                                                    outline-none transition-all font-semibold text-sm"
                                                required
                                            />
                                        </div>

                                        {/* Payment Method */}
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <Wallet className="w-3.5 h-3.5" />
                                                طريقة الدفع <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <PaymentMethodCard
                                                    value="cash" label="نقداً" icon={Banknote}
                                                    selected={formData.paymentMethod === 'cash'}
                                                    disabled={formData.isSplitPayment}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                                                />
                                                <PaymentMethodCard
                                                    value="bank_transfer" label="تحويل بنكي" icon={Building2}
                                                    selected={formData.paymentMethod === 'bank_transfer'}
                                                    disabled={formData.isSplitPayment}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank_transfer' }))}
                                                />
                                                <PaymentMethodCard
                                                    value="cheque" label="شيك" icon={FileText}
                                                    selected={formData.paymentMethod === 'cheque'}
                                                    disabled={formData.isSplitPayment}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cheque' }))}
                                                />
                                                <PaymentMethodCard
                                                    value="bank" label="بنك (أخر)" icon={CreditCard}
                                                    selected={formData.paymentMethod === 'bank'}
                                                    disabled={formData.isSplitPayment}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Currency */}
                                        <div className="space-y-2">
                                            <label htmlFor="currency"
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <CircleDot className="w-3.5 h-3.5" />
                                                العملة <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="currency"
                                                    value={formData.currency || defaultCurrency}
                                                    onChange={(e) => { setFormData(prev => ({ ...prev, currency: e.target.value })); setIsDirty(true); }}
                                                    className="w-full px-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-xl 
                                                        focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                                                        outline-none transition-all font-semibold text-sm appearance-none cursor-pointer"
                                                    required
                                                >
                                                    <option value="EGP">ج.م (EGP)</option>
                                                    <option value="SAR">ر.س (SAR)</option>
                                                    <option value="USD">$ (USD)</option>
                                                </select>
                                                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Split Payment Toggle */}
                                    <div className="mt-6 bg-gradient-to-l from-slate-50/80 to-slate-50/30 p-5 rounded-2xl border border-slate-200/60">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-100 rounded-lg">
                                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-800">توزيع مبالغ الدفع</h3>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">الدفع بأكثر من طريقة في نفس السند</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, isSplitPayment: !prev.isSplitPayment }))}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 
                                                    focus:outline-none focus:ring-4 focus:ring-emerald-500/20
                                                    ${formData.isSplitPayment ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300
                                                    ${formData.isSplitPayment ? '-translate-x-6' : '-translate-x-1'}`} />
                                            </button>
                                        </div>

                                        {formData.isSplitPayment && (
                                            <div className="mt-5 space-y-4" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                    {[
                                                        { key: 'cashAmount' as const, label: 'نقدي', icon: Banknote },
                                                        { key: 'bankTransferAmount' as const, label: 'تحويل بنكي', icon: Building2 },
                                                        { key: 'chequeAmount' as const, label: 'شيك', icon: FileText },
                                                        { key: 'bankAmount' as const, label: 'بنك (أخر)', icon: CreditCard },
                                                    ].map(({ key, label, icon: Icon }) => (
                                                        <div key={key} className="space-y-1.5">
                                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                <Icon className="w-3 h-3" />
                                                                {label}
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={formData[key] || ''}
                                                                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                                                                    className="w-full pl-3 pr-10 py-2.5 border-2 border-slate-200 rounded-xl 
                                                                        focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                                                                        outline-none transition-all font-bold text-slate-800 text-sm bg-white"
                                                                    placeholder="0.00"
                                                                />
                                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">
                                                                    {getCurrencyLabel(formData.currency || defaultCurrency)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Split total indicator */}
                                                <div className={`flex items-center justify-between p-3 rounded-xl text-sm border
                                                    ${splitTotal <= totalAmount + 0.01
                                                        ? 'bg-emerald-50/50 text-emerald-700 border-emerald-200/60'
                                                        : 'bg-rose-50/50 text-rose-700 border-rose-200/60'
                                                    }`}>
                                                    <span className="font-bold flex items-center gap-1.5">
                                                        {splitTotal <= totalAmount + 0.01
                                                            ? <CheckCircle2 className="w-4 h-4" />
                                                            : <AlertTriangle className="w-4 h-4" />
                                                        }
                                                        مجموع التوزيع: {formatNumber(splitTotal)} {getCurrencyLabel(formData.currency || defaultCurrency)}
                                                    </span>
                                                    <span className="text-xs font-medium opacity-70">
                                                        الحد الأقصى: {formatNumber(totalAmount)} {getCurrencyLabel(formData.currency || defaultCurrency)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Conditional fields */}
                                    {formData.paymentMethod === 'bank' && !formData.isSplitPayment && (
                                        <div className="mt-6 space-y-2" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                            <label htmlFor="bankAccount"
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <Building2 className="w-3.5 h-3.5" />
                                                رقم الحساب البنكي <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                id="bankAccount"
                                                type="text"
                                                value={formData.bankAccount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                                                placeholder="أدخل رقم الحساب البنكي"
                                                className="w-full px-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-xl 
                                                    focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                                                    outline-none transition-all font-semibold text-sm"
                                                required
                                            />
                                        </div>
                                    )}

                                    {formData.paymentMethod === 'cheque' && !formData.isSplitPayment && (
                                        <div className="mt-6 space-y-2" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                            <label htmlFor="referenceNumber"
                                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <Hash className="w-3.5 h-3.5" />
                                                رقم الشيك
                                            </label>
                                            <input
                                                id="referenceNumber"
                                                type="text"
                                                value={formData.referenceNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                                                placeholder="أدخل رقم الشيك"
                                                className="w-full px-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-xl 
                                                    focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                                                    outline-none transition-all font-semibold text-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Notes */}
                                    <div className="mt-6 space-y-2">
                                        <label htmlFor="notes"
                                            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <StickyNote className="w-3.5 h-3.5" />
                                            ملاحظات
                                        </label>
                                        <textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="أضف ملاحظات هنا..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-xl 
                                                focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10
                                                outline-none transition-all font-semibold text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 Actions */}
                            <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl 
                                        font-bold hover:bg-slate-200 active:scale-[0.97] transition-all text-sm"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    <span>عودة للمطابقة</span>
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 text-white rounded-xl 
                                        font-bold shadow-lg shadow-emerald-200/50
                                        hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200/60
                                        active:scale-[0.97] transition-all duration-200 text-sm
                                        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    <span>{loading ? 'جاري الحفظ...' : 'حفظ السند'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NewPaymentVoucherPage;