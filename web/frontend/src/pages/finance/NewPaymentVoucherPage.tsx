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

const NewPaymentVoucherPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();

    const navigate = useNavigate();

    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [suppliersLoading, setSuppliersLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<SupplierWithInvoices[]>([]);

    // Wizard State
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



    const totalAmount = selectedInvoices.reduce(
        (sum, inv) => sum + inv.allocatedAmount,
        0
    );

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        loadSuppliers();
    }, []);

    // Handle pre-selected invoices from navigation state (from unpaid invoices tab)
    useEffect(() => {
        const preSelectedInvoices = location.state?.preSelectedInvoices as InvoiceComparisonData[] | undefined;

        if (!suppliersLoading && suppliers.length > 0 && preSelectedInvoices && preSelectedInvoices.length > 0) {
            // All invoices should be from the same supplier, so we can use the first one
            const firstInvoice = preSelectedInvoices[0];

            // Find the supplier - we need to extract supplier ID from the invoice data
            // Since InvoiceComparisonData doesn't have supplierId, we'll find by matching invoice
            const supplier = suppliers.find(s =>
                s.pendingInvoices.some(inv => inv.supplierInvoiceId === firstInvoice.supplierInvoiceId)
            );

            if (supplier) {
                setSelectedSupplier(supplier);
                // Map pre-selected invoices to SelectedInvoice format
                const invoicesToSelect: SelectedInvoice[] = preSelectedInvoices.map(preInv => ({
                    ...preInv,
                    allocatedAmount: preInv.invoiceTotal
                }));
                setSelectedInvoices(invoicesToSelect);
                setIsDirty(true);
            }

            // Clear state so it doesn't re-trigger
            window.history.replaceState({}, document.title);
        }
    }, [suppliersLoading, suppliers, location.state]);

    const loadSuppliers = async () => {
        setSuppliersLoading(true);
        try {
            const data = await paymentVoucherService.getSuppliersWithPendingInvoices();
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
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

            const supplier = suppliers.find(
                (s) => String(s.supplierId) === supplierId
            );

            if (supplier) {
                if (selectedInvoices.length > 0) {
                    const confirmed = window.confirm(
                        'سيتم مسح جميع الفواتير المحددة عند تغيير المورد. هل أنت متأكد؟'
                    );
                    if (!confirmed) return;
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
            const confirmed = window.confirm(
                'سيتم مسح جميع الفواتير المحددة. هل أنت متأكد؟'
            );
            if (!confirmed) return;
        }
        setSelectedSupplier(null);
        setSelectedInvoices([]);
        setIsDirty(false);
    }, [selectedInvoices.length]);

    const handleInvoiceToggle = useCallback((invoice: InvoiceComparisonData) => {
        setSelectedInvoices((prev) => {
            const existingIndex = prev.findIndex(
                (inv) => inv.supplierInvoiceId === invoice.supplierInvoiceId
            );

            if (existingIndex >= 0) {
                return prev.filter(
                    (inv) => inv.supplierInvoiceId !== invoice.supplierInvoiceId
                );
            }

            return [
                ...prev,
                {
                    ...invoice,
                    allocatedAmount: invoice.remainingAmount ?? invoice.invoiceTotal,
                },
            ];

        });
        setIsDirty(true);
    }, []);

    const handleInvoiceAmountChange = useCallback(
        (invoiceId: number, newAmount: number) => {
            setSelectedInvoices((prev) =>
                prev.map((inv) =>
                    inv.supplierInvoiceId === invoiceId
                        ? { ...inv, allocatedAmount: newAmount }
                        : inv
                )
            );
            setIsDirty(true);
        },
        []
    );

    const isInvoiceSelected = useCallback(
        (invoiceId: number): boolean => {
            return selectedInvoices.some(
                (inv) => inv.supplierInvoiceId === invoiceId
            );
        },
        [selectedInvoices]
    );

    const validateStep1 = (): boolean => {
        if (!selectedSupplier) {
            toast.error('يرجى اختيار المورد');
            return false;
        }
        if (selectedInvoices.length === 0) {
            toast.error('يرجى اختيار فاتورة واحدة على الأقل');
            return false;
        }

        // Check if all selected invoices are valid or if user acknowledged variance
        const hasInvalidMatching = selectedInvoices.some(inv => !inv.isValid);
        if (hasInvalidMatching && !validationAcknowledged) {
            toast.error('يرجى تأكيد مراجعة الفروقات في الفواتير المحددة');
            return false;
        }

        if (!validationAcknowledged) {
            toast.error('يرجى تأكيد مراجعة بيانات المطابقة');
            return false;
        }

        return true;
    };

    const validateStep2 = (): string | null => {
        if (formData.isSplitPayment) {
            const totalSplit = (formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0);
            if (totalSplit !== totalAmount) {
                if (totalSplit > totalAmount + 0.01) { // Allow for minor floating point inaccuracies
                    return `مجموع التوزيع (${formatNumber(totalSplit)}) يتجاوز إجمالي الفواتير المختارة (${formatNumber(totalAmount)})`;
                }
                // If lower, it's a partial payment, which is allowed
            }
        } else {
            if (formData.paymentMethod === 'bank' && !formData.bankAccount.trim()) {
                return 'يرجى إدخال رقم الحساب البنكي';
            }
        }

        return null;
    };


    const handleNextStep = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(1, prev - 1) as 1 | 2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateStep2();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        try {
            setLoading(true);

            const totalSplit = (formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0);

            // Core Logic:
            // 1. If isSplitPayment is true, the voucher amount is the sum of split portions.
            // 2. If isSplitPayment is false, the voucher amount is the sum of invoice selections (totalAmount).
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
                preparedByUserId: 1,
                status: 'Closed',
                approvalStatus: 'Pending',
                allocations: selectedInvoices.map(inv => ({
                    supplierInvoiceId: inv.supplierInvoiceId,
                    allocatedAmount: inv.allocatedAmount, // This is the amount intended for this specific invoice
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
                    isValid: inv.isValid
                }))
            };

            await paymentVoucherService.createVoucher(voucher);

            setIsDirty(false);
            toast.success('تم إنشاء سند الصرف بنجاح');
            navigate('/dashboard/finance/payment-vouchers');
        } catch (error) {
            console.error('Failed to create voucher:', error);
            toast.error('فشل إنشاء سند الصرف');
        } finally {
            setLoading(false);
        }
    };


    const handleCancel = () => {
        if (isDirty) {
            const confirmed = window.confirm(
                'لديك تغييرات غير محفوظة. هل أنت متأكد من الإلغاء؟'
            );
            if (!confirmed) return;
        }
        navigate('/dashboard/finance/payment-vouchers');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8" dir="rtl">
            {/* Header with Stepper */}
            <div className="mb-8">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span className="font-semibold">عودة</span>
                </button>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <Wallet className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                سند صرف جديد
                            </h1>
                            <p className="text-slate-600">
                                {currentStep === 1 ? 'خطوة 1: اختيار الفواتير والمطابقة' : 'خطوة 2: تفاصيل الدفع'}
                            </p>
                        </div>
                    </div>

                    {/* Stepper Indicator */}
                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100">
                        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${currentStep >= 1 ? 'bg-emerald-100 border-emerald-600' : 'border-slate-300'}`}>1</div>
                            <span className="font-bold hidden sm:inline">المطابقة</span>
                        </div>
                        <div className={`w-12 h-1 bg-slate-200 rounded-full overflow-hidden`}>
                            <div className={`h-full bg-emerald-500 transition-all duration-500 ease-in-out ${currentStep >= 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${currentStep >= 2 ? 'bg-emerald-100 border-emerald-600' : 'border-slate-300 bg-white'}`}>2</div>
                            <span className="font-bold hidden sm:inline">الدفع</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-7xl">

                {/* Step 1: Matching & Selection */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Supplier Selection */}
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">
                                اختيار المورد
                            </h2>

                            {suppliersLoading ? (
                                <div className="flex items-center justify-center py-8 gap-3">
                                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                                    <span className="text-slate-600 font-semibold">
                                        جاري تحميل الموردين...
                                    </span>
                                </div>
                            ) : suppliers.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-slate-600">
                                        لا يوجد موردين
                                    </h3>
                                    <p className="text-slate-500 mt-1">
                                        لا يوجد موردين لديهم فواتير معلقة
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <select
                                            id="supplierSelect"
                                            value={selectedSupplier ? String(selectedSupplier.supplierId) : ''}
                                            onChange={handleSupplierChange}
                                            className="w-full px-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-semibold text-slate-800 appearance-none cursor-pointer hover:bg-slate-100"
                                        >
                                            <option value="">— اختر المورد —</option>
                                            {suppliers.map((supplier) => (
                                                <option
                                                    key={supplier.supplierId}
                                                    value={String(supplier.supplierId)}
                                                >
                                                    {supplier.nameAr} — {supplier.code} — ({supplier.pendingInvoices.length} فاتورة — {formatNumber(convertAmount(supplier.totalOutstanding || 0, 'EGP'))} {getCurrencyLabel(defaultCurrency)} مستحق)


                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedSupplier && (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-emerald-800">
                                                    {selectedSupplier.nameAr}
                                                    {selectedSupplier.nameEn && (
                                                        <span className="text-emerald-600 font-medium mr-2 text-sm">
                                                            ({selectedSupplier.nameEn})
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-emerald-600 mt-1 flex items-center gap-3 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-lg text-xs font-bold">
                                                        كود: {selectedSupplier.code}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-lg text-xs font-bold">
                                                        {selectedSupplier.pendingInvoices.length} فاتورة معلقة
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-lg text-xs font-bold">
                                                        مستحق: {formatNumber(convertAmount(selectedSupplier.totalOutstanding || 0, 'EGP'))} {getCurrencyLabel(defaultCurrency)}


                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleClearSupplier}
                                                className="p-2 hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
                                                aria-label="إزالة المورد المحدد"
                                            >
                                                <X className="w-5 h-5 text-emerald-600" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Invoice Selection with Comparison */}
                        {selectedSupplier && selectedSupplier.pendingInvoices.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        اختيار الفواتير والمطابقة
                                    </h2>
                                    <span className="text-sm text-slate-500">
                                        {selectedInvoices.length} من{' '}
                                        {selectedSupplier.pendingInvoices.length} محددة
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    {selectedSupplier.pendingInvoices.map((invoice) => {
                                        const selected = isInvoiceSelected(
                                            invoice.supplierInvoiceId
                                        );

                                        return (
                                            <div
                                                key={invoice.supplierInvoiceId}
                                                className={`border-2 rounded-xl p-4 transition-all ${selected
                                                    ? 'border-emerald-500 bg-emerald-50/30'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <div
                                                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selected
                                                                ? 'bg-emerald-600 border-emerald-600'
                                                                : 'border-slate-300 bg-white'
                                                                }`}
                                                            onClick={() =>
                                                                handleInvoiceToggle(invoice)
                                                            }
                                                            role="checkbox"
                                                            aria-checked={selected}
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (
                                                                    e.key === 'Enter' ||
                                                                    e.key === ' '
                                                                ) {
                                                                    e.preventDefault();
                                                                    handleInvoiceToggle(invoice);
                                                                }
                                                            }}
                                                        >
                                                            {selected && (
                                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-lg text-slate-800">
                                                                {invoice.invoiceNumber}
                                                            </div>
                                                            <div className="text-sm text-slate-600">
                                                                {formatDate(invoice.invoiceDate)}
                                                            </div>
                                                        </div>
                                                    </label>

                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xl font-bold text-slate-800">
                                                            {formatNumber(convertAmount(invoice.remainingAmount ?? invoice.invoiceTotal, invoice.currency || 'EGP'))} <span className="text-sm font-normal text-slate-500">{getCurrencyLabel(defaultCurrency)}</span>
                                                        </span>
                                                        {(invoice.paidAmount ?? 0) > 0 && (
                                                            <div className="flex flex-col items-end mt-1">
                                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                                                                    مدفوع جزئياً: {formatNumber(convertAmount(invoice.paidAmount || 0, invoice.currency || 'EGP'))} {getCurrencyLabel(defaultCurrency)}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                                    إجمالي الفاتورة: {formatNumber(convertAmount(invoice.invoiceTotal, invoice.currency || 'EGP'))} {getCurrencyLabel(defaultCurrency)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>


                                                </div>

                                                {/* Detailed Validation Component */}
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
                                                    grnShippingCost={invoice.grnShippingCost}
                                                    grnOtherCosts={invoice.grnOtherCosts}
                                                    invoiceTotal={invoice.invoiceTotal}
                                                    invoiceSubTotal={invoice.invoiceSubTotal}
                                                    invoiceTaxAmount={invoice.invoiceTaxAmount}
                                                    invoiceDiscountAmount={invoice.invoiceDiscountAmount}
                                                    invoiceDeliveryCost={invoice.invoiceDeliveryCost}
                                                    invoiceOtherCosts={invoice.invoiceOtherCosts}
                                                    isValid={invoice.isValid}
                                                    items={invoice.items || []}
                                                />

                                                {selected && (
                                                    <div className="mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-100 p-2 rounded-lg w-fit">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        تم اختيار الفاتورة للدفع
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Validation Acknowledgement Section */}
                                {selectedInvoices.length > 0 && (
                                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${validationAcknowledged ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-800 text-lg mb-1">تأكيد عملية المطابقة</h3>
                                                <p className="text-slate-600 mb-4">
                                                    يرجى مراجعة بيانات المطابقة (PO vs GRN vs Invoice) أعلاه. في حالة وجود فروقات، يرجى التأكد من صحتها قبل المتابعة.
                                                </p>

                                                {selectedInvoices.some(inv => !inv.isValid) && (
                                                    <div className="mb-4 flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                                        <span className="text-sm font-bold">تنبيه: توجد فروقات في مطابقة بعض الفواتير المختارة (أكثر من 10%).</span>
                                                    </div>
                                                )}

                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${validationAcknowledged ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 group-hover:border-slate-400 bg-white'}`}
                                                        onClick={() => setValidationAcknowledged(!validationAcknowledged)}
                                                    >
                                                        {validationAcknowledged && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <span className="font-bold text-slate-700 select-none">لقد قمت بمراجعة بيانات المطابقة وأؤكد صحتها للمتابعة</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Actions for Step 1 */}
                        {selectedSupplier && selectedSupplier.pendingInvoices.length > 0 && (
                            <div className="flex justify-end pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={selectedInvoices.length === 0 || !validationAcknowledged}
                                    className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                >
                                    <span>متابعة لبيانات الدفع</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Payment Details */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-4">
                                تفاصيل السند والدفع
                            </h2>

                            {/* Summary of Selected Invoices */}
                            <div className="mb-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-700">الفواتير المختارة للدفع</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {selectedInvoices.map((inv) => (
                                        <div key={inv.supplierInvoiceId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-lg border border-slate-200">
                                            <div>
                                                <div className="font-bold text-slate-800">{inv.invoiceNumber}</div>
                                                <div className="text-xs text-slate-500">{formatDate(inv.invoiceDate)}</div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-500">قيمة الفاتورة</div>
                                                    <div className="text-sm font-semibold">{formatNumber(inv.invoiceTotal)}</div>
                                                </div>

                                                <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>

                                                <div className="flex flex-col gap-1 w-full sm:w-48">
                                                    <label htmlFor={`amount-${inv.supplierInvoiceId}`} className="text-xs font-bold text-slate-700">المبلغ المراد دفعه</label>
                                                    <div className="relative">
                                                        <input
                                                            id={`amount-${inv.supplierInvoiceId}`}
                                                            type="number"
                                                            className="w-full pl-3 pr-8 py-1.5 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 text-sm"
                                                            value={inv.allocatedAmount || ''}
                                                            onChange={(e) => handleInvoiceAmountChange(inv.supplierInvoiceId!, parseFloat(e.target.value))}
                                                            min={0}
                                                            max={inv.remainingAmount ?? inv.invoiceTotal}
                                                            step="0.01"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">{getCurrencyLabel(formData.currency || defaultCurrency)}</span>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-end items-center gap-4 pt-2 border-t border-slate-200 mt-2">
                                        <span className="font-bold text-slate-700">الإجمالي الكلي:</span>
                                        <span className="text-2xl font-bold text-emerald-600">{formatNumber(totalAmount)} <span className="text-sm">{getCurrencyLabel(formData.currency || defaultCurrency)}</span></span>

                                    </div>


                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">
                                        رقم السند
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.voucherNumber}
                                        placeholder="يتم إنشاؤه تلقائياً"
                                        className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl text-slate-500 font-semibold cursor-not-allowed"
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="voucherDate"
                                        className="block text-sm font-bold text-slate-700"
                                    >
                                        تاريخ السند <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="voucherDate"
                                        type="date"
                                        value={formData.voucherDate}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                voucherDate: e.target.value,
                                            }));
                                            setIsDirty(true);
                                        }}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-semibold"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="paymentMethod"
                                        className="block text-sm font-bold text-slate-700"
                                    >
                                        طريقة الدفع <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                        disabled={formData.isSplitPayment}
                                        className={`w-full px-4 py-3 border-2 border-transparent rounded-xl outline-none transition-all font-semibold ${formData.isSplitPayment ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 focus:border-emerald-500'
                                            }`}
                                    >
                                        <option value="cash">نقداً</option>
                                        <option value="bank_transfer">تحويل بنكي</option>
                                        <option value="cheque">شيك</option>
                                        <option value="bank">بنك (أخر)</option>

                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="currency"
                                        className="block text-sm font-bold text-slate-700"
                                    >
                                        العملة <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="currency"
                                        value={formData.currency || defaultCurrency}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                currency: e.target.value,
                                            }));
                                            setIsDirty(true);
                                        }}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-semibold"
                                        required
                                    >
                                        <option value="EGP">ج.م (EGP)</option>
                                        <option value="SAR">ر.س (SAR)</option>
                                        <option value="USD">$ (USD)</option>
                                    </select>
                                </div>


                                <div className="md:col-span-2 space-y-4 bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">توزيع مبالغ الدفع</h3>
                                                <p className="text-xs text-slate-500">تمكين الدفع بأكثر من طريقة في نفس السند</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isSplitPayment: !prev.isSplitPayment }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isSplitPayment ? 'bg-emerald-600' : 'bg-slate-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isSplitPayment ? '-translate-x-6' : '-translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {formData.isSplitPayment && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 animate-fadeIn">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-600">نقدي</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.cashAmount || ''}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, cashAmount: parseFloat(e.target.value) || 0 }))}
                                                        className="w-full pl-3 pr-8 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">ج.م</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-600">تحويل بنكي</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.bankTransferAmount || ''}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, bankTransferAmount: parseFloat(e.target.value) || 0 }))}
                                                        className="w-full pl-3 pr-8 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">ج.م</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-600">شيك</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.chequeAmount || ''}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, chequeAmount: parseFloat(e.target.value) || 0 }))}
                                                        className="w-full pl-3 pr-8 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">ج.م</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-600">بنك (أخر)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={formData.bankAmount || ''}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, bankAmount: parseFloat(e.target.value) || 0 }))}
                                                        className="w-full pl-3 pr-8 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">ج.م</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formData.isSplitPayment && (
                                        <div className={`mt-2 p-2 rounded-lg text-sm flex items-center justify-between ${((formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0)) <= totalAmount + 0.01
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-red-50 text-red-700'
                                            }`}>
                                            <span className="font-bold">مجموع التوزيع: {formatNumber((formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0))} {getCurrencyLabel(formData.currency || defaultCurrency)}</span>
                                            <span className="text-xs">المطلوب (كحد أقصى): {formatNumber(totalAmount)} {getCurrencyLabel(formData.currency || defaultCurrency)}</span>

                                        </div>
                                    )}
                                </div>

                                {formData.paymentMethod === 'bank' && !formData.isSplitPayment && (

                                    <div className="space-y-2">
                                        <label htmlFor="bankAccount" className="block text-sm font-bold text-slate-700">
                                            رقم الحساب البنكي <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="bankAccount"
                                            type="text"
                                            value={formData.bankAccount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                                            placeholder="أدخل رقم الحساب البنكي"
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-semibold"
                                            required
                                        />
                                    </div>
                                )}

                                {formData.paymentMethod === 'cheque' && !formData.isSplitPayment && (

                                    <div className="space-y-2">
                                        <label htmlFor="referenceNumber" className="block text-sm font-bold text-slate-700">
                                            رقم الشيك
                                        </label>
                                        <input
                                            id="referenceNumber"
                                            type="text"
                                            value={formData.referenceNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                                            placeholder="أدخل رقم الشيك"
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-semibold"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 space-y-2">
                                <label htmlFor="notes" className="block text-sm font-bold text-slate-700">
                                    ملاحظات
                                </label>
                                <textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="أضف ملاحظات هنا..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-500 outline-none transition-all font-semibold resize-none"
                                />
                            </div>
                        </div>

                        {/* Navigation Actions for Step 2 */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="flex items-center gap-2 px-8 py-4 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                            >
                                <ArrowRight className="w-5 h-5" />
                                <span>عودة للمطابقة</span>
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                <span>{loading ? 'جاري الحفظ...' : 'حفظ السند'}</span>
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default NewPaymentVoucherPage;