import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowRight,
    Save,
    X,
    Wallet,
    CheckCircle2,
    FileText,
    ArrowLeft,
    Users,
    CreditCard,
    CalendarDays,
    BadgeCheck,
    Banknote,
    Receipt
} from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { useSystemSettings } from '../../hooks/useSystemSettings';

import { receiptService, type PaymentReceiptDto, type PaymentMethod } from '../../services/receiptService';
import { salesInvoiceService, type SalesInvoiceDto } from '../../services/salesInvoiceService';

interface CustomerWithInvoices {
    customerId: number;
    nameAr: string;
    code: string;
    totalOutstanding: number;
    pendingInvoices: SalesInvoiceDto[];
}

interface SelectedInvoice extends SalesInvoiceDto {
    allocatedAmount: number;
}

/* ───────── Step Indicator ───────── */
const StepIndicator: React.FC<{ currentStep: 1 | 2 }> = ({ currentStep }) => {
    const steps = [
        { num: 1, label: 'اختيار العميل والفواتير', icon: FileText },
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
                                    className="h-full bg-brand-primary/80 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: isActive ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                        <div
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300
                                ${isCurrent
                                    ? 'bg-brand-primary/5 border-2 border-brand-primary/20 shadow-sm shadow-brand-primary/10'
                                    : isActive
                                        ? 'bg-brand-primary/5/50 border-2 border-brand-primary/10'
                                        : 'bg-slate-50 border-2 border-slate-100'
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                                    ${isActive
                                        ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
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
                                    ${isActive ? 'text-brand-primary' : 'text-slate-400'}`}>
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
    value: PaymentMethod;
    label: string;
    icon: React.ElementType;
    selected: boolean;
    disabled?: boolean;
    onClick: () => void;
}> = ({ label, icon: Icon, selected, disabled, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
            ${disabled
                ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50'
                : selected
                    ? 'border-brand-primary/80 bg-brand-primary/5 shadow-sm shadow-brand-primary/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
    >
        <div className={`p-2.5 rounded-xl transition-colors
            ${selected ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 text-slate-400'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-bold ${selected ? 'text-brand-primary' : 'text-slate-600'}`}>
            {label}
        </span>
        {selected && (
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/80 animate-pulse" />
        )}
    </button>
);

const ReceiptFormPage: React.FC = () => {
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [customersLoading, setCustomersLoading] = useState(true);
    const [customers, setCustomers] = useState<CustomerWithInvoices[]>([]);

    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithInvoices | null>(null);
    const [selectedInvoices, setSelectedInvoices] = useState<SelectedInvoice[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    const [formData, setFormData] = useState({
        voucherNumber: '',
        voucherDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash' as PaymentMethod,
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

    useEffect(() => { loadCustomers(); }, []);

    useEffect(() => {
        const preSelectedInvoices = location.state?.preSelectedInvoices as SalesInvoiceDto[] | undefined;
        if (!customersLoading && customers.length > 0 && preSelectedInvoices && preSelectedInvoices.length > 0) {
            const firstInvoice = preSelectedInvoices[0];
            const customer = customers.find(c =>
                c.pendingInvoices.some(inv => inv.id === firstInvoice.id)
            );
            if (customer) {
                setSelectedCustomer(customer);
                const invoicesToSelect: SelectedInvoice[] = preSelectedInvoices.map(preInv => ({
                    ...preInv,
                    allocatedAmount: preInv.remainingAmount ?? preInv.totalAmount ?? 0
                }));
                setSelectedInvoices(invoicesToSelect);
                setIsDirty(true);
            }
            window.history.replaceState({}, document.title);
        }
    }, [customersLoading, customers, location.state]);

    const loadCustomers = async () => {
        setCustomersLoading(true);
        try {
            const data = await salesInvoiceService.getAll();
            const allInvoices = data || [];

            // Filter unpaid/partial
            const unpaid = allInvoices.filter(
                inv => (inv.status === 'Unpaid' || inv.status === 'Partial' || inv.status === 'Approved') && (inv.approvalStatus === 'Approved' || !inv.approvalStatus)
            );

            // Group by customer
            const grouped = unpaid.reduce((acc, inv) => {
                if (!inv.customerId) return acc;
                if (!acc[inv.customerId]) {
                    acc[inv.customerId] = {
                        customerId: inv.customerId,
                        nameAr: inv.customerNameAr || 'غير معروف',
                        code: inv.customerId.toString(),
                        totalOutstanding: 0,
                        pendingInvoices: []
                    };
                }
                const remaining = inv.remainingAmount ?? inv.totalAmount ?? 0;
                acc[inv.customerId].pendingInvoices.push(inv);
                acc[inv.customerId].totalOutstanding += convertAmount(remaining, inv.currency || defaultCurrency);
                return acc;
            }, {} as Record<number, CustomerWithInvoices>);

            setCustomers(Object.values(grouped));
        } catch {
            toast.error('فشل تحميل العملاء وفواتيرهم');
        } finally {
            setCustomersLoading(false);
        }
    };

    const handleCustomerChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const customerId = e.target.value;
            if (!customerId) {
                setSelectedCustomer(null);
                setSelectedInvoices([]);
                setIsDirty(false);
                return;
            }
            const customer = customers.find((c) => String(c.customerId) === customerId);
            if (customer) {
                if (selectedInvoices.length > 0) {
                    if (!window.confirm('سيتم مسح جميع الفواتير المحددة عند تغيير العميل. هل أنت متأكد؟')) return;
                }
                setSelectedCustomer(customer);
                setSelectedInvoices([]);
                setIsDirty(true);
            }
        },
        [customers, selectedInvoices.length]
    );

    const handleClearCustomer = useCallback(() => {
        if (selectedInvoices.length > 0) {
            if (!window.confirm('سيتم مسح جميع الفواتير المحددة. هل أنت متأكد؟')) return;
        }
        setSelectedCustomer(null);
        setSelectedInvoices([]);
        setIsDirty(false);
    }, [selectedInvoices.length]);

    const handleInvoiceToggle = useCallback((invoice: SalesInvoiceDto) => {
        setSelectedInvoices((prev) => {
            const exists = prev.findIndex((inv) => inv.id === invoice.id);
            if (exists >= 0) return prev.filter((inv) => inv.id !== invoice.id);
            return [...prev, { ...invoice, allocatedAmount: invoice.remainingAmount ?? invoice.totalAmount ?? 0 }];
        });
        setIsDirty(true);
    }, []);

    const handleInvoiceAmountChange = useCallback((invoiceId: number, newAmount: number) => {
        setSelectedInvoices((prev) =>
            prev.map((inv) =>
                inv.id === invoiceId ? { ...inv, allocatedAmount: newAmount } : inv
            )
        );
        setIsDirty(true);
    }, []);

    const isInvoiceSelected = useCallback(
        (invoiceId: number): boolean => selectedInvoices.some((inv) => inv.id === invoiceId),
        [selectedInvoices]
    );

    const validateStep1 = (): boolean => {
        if (!selectedCustomer) { toast.error('يرجى اختيار العميل'); return false; }
        if (selectedInvoices.length === 0) { toast.error('يرجى اختيار فاتورة واحدة على الأقل'); return false; }

        // Ensure no allocated amount exceeds the remaining invoice amount
        for (const inv of selectedInvoices) {
            const maxAmount = inv.remainingAmount ?? inv.totalAmount ?? 0;
            if (inv.allocatedAmount <= 0) {
                toast.error(`المبلغ المخصص للفاتورة ${inv.invoiceNumber} يجب أن يكون أكبر من صفر`);
                return false;
            }
            if (inv.allocatedAmount > maxAmount + 0.01) {
                toast.error(`المبلغ المخصص للفاتورة ${inv.invoiceNumber} يتجاوز الرصيد المتبقي`);
                return false;
            }
        }

        return true;
    };

    const validateStep2 = (): string | null => {
        if (formData.isSplitPayment) {
            const totalSplit = (formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0);
            if (Math.abs(totalSplit - totalAmount) > 0.01) {
                return `مجموع التوزيع (${formatNumber(totalSplit)}) لا يساوي إجمالي المدفوعات (${formatNumber(totalAmount)})`;
            }
        } else {
            if (formData.paymentMethod === 'BankTransfer' && !formData.bankAccount.trim()) {
                return 'يرجى إدخال رقم الحساب البنكي أو التفاصيل';
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
            const currentUserName = user?.username || 'System User';

            const totalSplit = (formData.cashAmount || 0) + (formData.bankAmount || 0) + (formData.chequeAmount || 0) + (formData.bankTransferAmount || 0);
            const receiptAmount = formData.isSplitPayment ? totalSplit : totalAmount;

            const receipt: PaymentReceiptDto = {
                voucherNumber: formData.voucherNumber,
                voucherDate: formData.voucherDate,
                customerId: selectedCustomer!.customerId,
                customerNameAr: selectedCustomer!.nameAr,
                paymentMethod: formData.paymentMethod,
                amount: receiptAmount,
                currency: formData.currency || defaultCurrency,
                exchangeRate: 1.0,
                description: selectedInvoices.length > 1
                    ? `مقبوضات مجمعة لعدد ${selectedInvoices.length} فواتير`
                    : `مقبوضات للفاتورة رقم ${selectedInvoices[0].invoiceNumber}`,
                notes: formData.notes,
                receivedByUserId: currentUserId,
                receivedByUserName: currentUserName,
                status: 'Posted',
                approvalStatus: 'Approved',
                allocations: selectedInvoices.map(inv => ({
                    salesInvoiceId: inv.id!,
                    allocatedAmount: inv.allocatedAmount,
                    invoiceNumber: inv.invoiceNumber,
                    allocationDate: formData.voucherDate,
                }))
            };

            await receiptService.create(receipt);
            setIsDirty(false);
            toast.success('تم إنشاء إيصال الدفع بنجاح');
            navigate('/dashboard/sales/receipts');
        } catch {
            toast.error('فشل إنشاء إيصال الدفع');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (isDirty && !window.confirm('لديك تغييرات غير محفوظة. هل أنت متأكد من الإلغاء؟')) return;
        navigate('/dashboard/sales/receipts');
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
                                <div className="p-2.5 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                                    rounded-xl shadow-sm shadow-brand-primary/20">
                                    <Wallet className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                                        إيصال دفع جديد
                                    </h1>
                                    <p className="text-xs text-slate-400 font-medium">
                                        إنشاء إيصال استلام نقدية من العملاء
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

                    {/* ═══════ STEP 1: Selection ═══════ */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fadeIn">

                            {/* Customer Selection */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                                            <Users className="w-4 h-4 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800">اختيار العميل</h2>
                                            <p className="text-xs text-slate-400 mt-0.5">حدد العميل الذي تريد إنشاء إيصال دقع له</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {customersLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full border-4 border-slate-100" />
                                                <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-brand-primary/80 animate-spin" />
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">
                                                جاري تحميل العملاء...
                                            </span>
                                        </div>
                                    ) : customers.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="relative w-20 h-20 mx-auto mb-4">
                                                <div className="absolute inset-0 bg-slate-100 rounded-2xl rotate-6" />
                                                <div className="absolute inset-0 bg-slate-50 rounded-2xl -rotate-3" />
                                                <div className="relative w-full h-full bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-slate-300" />
                                                </div>
                                            </div>
                                            <h3 className="text-base font-bold text-slate-600">لا يوجد عملاء</h3>
                                            <p className="text-sm text-slate-400 mt-1">لا يوجد عملاء لديهم فواتير معلقة</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <select
                                                id="customerSelect"
                                                value={selectedCustomer ? String(selectedCustomer.customerId) : ''}
                                                onChange={handleCustomerChange}
                                                className="w-full px-4 py-3.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl 
                                                    focus:border-brand-primary/80 focus:bg-white focus:ring-4 focus:ring-brand-primary/80/10
                                                    outline-none transition-all font-semibold text-slate-800 hover:border-slate-300"
                                            >
                                                <option value="">— اختر العميل —</option>
                                                {customers.map((customer) => (
                                                    <option key={customer.customerId} value={String(customer.customerId)}>
                                                        {customer.nameAr} — ({customer.pendingInvoices.length} فاتورة — {formatNumber(customer.totalOutstanding)} {getCurrencyLabel(defaultCurrency)} مستحق)
                                                    </option>
                                                ))}
                                            </select>

                                            {selectedCustomer && (
                                                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90/30 
                                                    border border-brand-primary/20/60 rounded-xl"
                                                    style={{ animation: 'fadeInUp 0.3s ease-out' }}
                                                >
                                                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                                        <BadgeCheck className="w-5 h-5 text-brand-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-800 text-sm">
                                                            {selectedCustomer.nameAr}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            {[
                                                                `${selectedCustomer.pendingInvoices.length} فاتورة معلقة`,
                                                                `مستحق: ${formatNumber(selectedCustomer.totalOutstanding)} ${getCurrencyLabel(defaultCurrency)}`,
                                                            ].map((tag, i) => (
                                                                <span key={i} className="text-[10px] font-bold px-2 py-0.5 
                                                                    bg-brand-primary/10/80 text-brand-primary rounded-md border border-brand-primary/20/40">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleClearCustomer}
                                                        className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors shrink-0"
                                                    >
                                                        <X className="w-4 h-4 text-brand-primary" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Selection */}
                            {selectedCustomer && selectedCustomer.pendingInvoices.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                                    <FileText className="w-4 h-4 text-brand-primary" />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-bold text-slate-800">اختيار الفواتير</h2>
                                                    <p className="text-xs text-slate-400 mt-0.5">حدد الفواتير المراد دفعها</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400">محدد</span>
                                                <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-extrabold min-w-[2rem] text-center">
                                                    {selectedInvoices.length}/{selectedCustomer.pendingInvoices.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {selectedCustomer.pendingInvoices.map((invoice, idx) => {
                                            const selected = isInvoiceSelected(invoice.id!);
                                            const remaining = convertAmount(invoice.remainingAmount ?? invoice.totalAmount ?? 0, invoice.currency || defaultCurrency);

                                            return (
                                                <div
                                                    key={invoice.id}
                                                    className={`relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
                                                        ${selected
                                                            ? 'border-brand-primary/60 bg-brand-primary/5/20 shadow-sm shadow-brand-primary/10'
                                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                                        }`}
                                                    style={{ animationDelay: `${idx * 60}ms`, animation: 'fadeInUp 0.4s ease-out forwards' }}
                                                >
                                                    <div className={`absolute top-0 right-0 w-1 h-full rounded-r-full transition-all duration-300
                                                        ${selected ? 'bg-brand-primary/80' : 'bg-transparent'}`} />

                                                    <div className="p-5">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <label className="flex items-center gap-3 cursor-pointer">
                                                                <div
                                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                                                                        ${selected
                                                                            ? 'bg-brand-primary border-brand-primary shadow-sm shadow-brand-primary/20'
                                                                            : 'border-slate-300 bg-white hover:border-slate-400'
                                                                        }`}
                                                                    onClick={() => handleInvoiceToggle(invoice)}
                                                                >
                                                                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-800">
                                                                        {invoice.invoiceNumber || '—'}
                                                                    </div>
                                                                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                                        <CalendarDays className="w-3 h-3" />
                                                                        {formatDate(invoice.invoiceDate)}
                                                                    </div>
                                                                </div>
                                                            </label>

                                                            <div className="flex flex-col items-end">
                                                                <span className="text-lg font-extrabold text-slate-800 tabular-nums">
                                                                    {formatNumber(remaining)}
                                                                    <span className="text-xs font-semibold text-slate-400 mr-1">
                                                                        {getCurrencyLabel(defaultCurrency)}
                                                                    </span>
                                                                </span>
                                                                {invoice.paidAmount! > 0 && (
                                                                    <div className="flex flex-col items-end mt-1.5 gap-0.5">
                                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 
                                                                            px-1.5 py-0.5 rounded border border-emerald-100">
                                                                            مدفوع مسبقاً: {formatNumber(convertAmount(invoice.paidAmount || 0, invoice.currency || defaultCurrency))} {getCurrencyLabel(defaultCurrency)}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                                            إجمالي الفاتورة: {formatNumber(convertAmount(invoice.totalAmount || 0, invoice.currency || defaultCurrency))} {getCurrencyLabel(defaultCurrency)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {selected && (
                                                            <div className="mt-4 pt-4 border-t border-slate-100" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                                                <div className="flex items-center gap-3 w-full sm:w-1/2">
                                                                    <label className="text-xs font-bold text-slate-600 shrink-0">تخصيص مبلغ:</label>
                                                                    <div className="relative flex-1">
                                                                        <input
                                                                            type="number"
                                                                            value={selectedInvoices.find(inv => inv.id === invoice.id)?.allocatedAmount || 0}
                                                                            onChange={(e) => handleInvoiceAmountChange(invoice.id!, parseFloat(e.target.value) || 0)}
                                                                            className="w-full pl-10 pr-3 py-2 bg-white border-2 border-brand-primary/20 rounded-lg focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/80 outline-none transition-all font-bold text-brand-primary"
                                                                            min="0"
                                                                            step="any"
                                                                            max={remaining}
                                                                        />
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-primary/60">
                                                                            {getCurrencyLabel(defaultCurrency)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 1 Actions */}
                            {selectedCustomer && selectedCustomer.pendingInvoices.length > 0 && (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={selectedInvoices.length === 0}
                                        className="flex items-center gap-2.5 px-8 py-3.5 bg-brand-primary text-white rounded-xl 
                                            font-bold shadow-lg shadow-brand-primary/20/50
                                            hover:bg-brand-primary hover:shadow-xl hover:shadow-brand-primary/20/60
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
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden p-6 relative">
                                <div className="absolute top-0 right-0 w-2 h-full bg-brand-primary/80" />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-1">إجمالي المبلغ المطلوب دفعه</h3>
                                        <p className="text-xs text-slate-500">تم تحديد {selectedInvoices.length} فواتير للدفع</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                        <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div className="text-left font-extrabold text-brand-primary text-xl tracking-tight">
                                            {formatNumber(totalAmount)}
                                            <span className="text-sm font-bold ml-1 text-brand-primary/80">
                                                {getCurrencyLabel(defaultCurrency)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-l from-slate-50/50 to-white">
                                    <h2 className="text-base font-bold text-slate-800">معلومات الإيصال</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">أدخل تفاصيل الدفع الخاصة بالإيصال</p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">رقم الإيصال <span className="text-slate-400 font-normal text-xs">(اختياري)</span></label>
                                            <input
                                                type="text"
                                                value={formData.voucherNumber}
                                                onChange={e => { setFormData({ ...formData, voucherNumber: e.target.value }); setIsDirty(true); }}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/80 outline-none transition-all"
                                                placeholder="تلقائي"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الإيصال <span className="text-rose-500">*</span></label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.voucherDate}
                                                onChange={e => { setFormData({ ...formData, voucherDate: e.target.value }); setIsDirty(true); }}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/80 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-bold text-slate-700">طريقة الدفع <span className="text-rose-500">*</span></label>
                                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isSplitPayment}
                                                    onChange={e => {
                                                        const isSplit = e.target.checked;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            isSplitPayment: isSplit,
                                                            cashAmount: isSplit && prev.paymentMethod === 'Cash' ? totalAmount : 0,
                                                            bankAmount: isSplit && prev.paymentMethod === 'BankTransfer' ? totalAmount : 0,
                                                            chequeAmount: isSplit && prev.paymentMethod === 'Cheque' ? totalAmount : 0,
                                                        }));
                                                        setIsDirty(true);
                                                    }}
                                                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary/80 border-slate-300"
                                                />
                                                <span className="text-xs font-bold text-slate-600">دفع مجزأ متعدد الطرق</span>
                                            </label>
                                        </div>

                                        {!formData.isSplitPayment ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                <PaymentMethodCard
                                                    label="نقداً"
                                                    value="Cash"
                                                    icon={Banknote}
                                                    selected={formData.paymentMethod === 'Cash'}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Cash' }))}
                                                />
                                                <PaymentMethodCard
                                                    label="تحويل بنكي"
                                                    value="BankTransfer"
                                                    icon={CreditCard}
                                                    selected={formData.paymentMethod === 'BankTransfer'}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'BankTransfer' }))}
                                                />
                                                <PaymentMethodCard
                                                    label="شيك"
                                                    value="Cheque"
                                                    icon={Receipt}
                                                    selected={formData.paymentMethod === 'Cheque'}
                                                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Cheque' }))}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-4 p-5 rounded-2xl bg-brand-primary/5/50 border border-brand-primary/10" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                                <h4 className="text-sm font-bold text-brand-primary flex items-center gap-2 mb-4">
                                                    <Wallet className="w-4 h-4" />
                                                    توزيع المبالغ المدفوعة
                                                </h4>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">نقداً</label>
                                                        <input
                                                            type="number"
                                                            value={formData.cashAmount || ''}
                                                            onChange={e => setFormData({ ...formData, cashAmount: parseFloat(e.target.value) || 0 })}
                                                            className="w-full px-3 py-2 bg-white border border-brand-primary/20 rounded-lg focus:ring-2 focus:ring-brand-primary/10 outline-none"
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">تحويل بنكي</label>
                                                        <input
                                                            type="number"
                                                            value={formData.bankAmount || ''}
                                                            onChange={e => setFormData({ ...formData, bankAmount: parseFloat(e.target.value) || 0 })}
                                                            className="w-full px-3 py-2 bg-white border border-brand-primary/20 rounded-lg focus:ring-2 focus:ring-brand-primary/10 outline-none"
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">شيك</label>
                                                        <input
                                                            type="number"
                                                            value={formData.chequeAmount || ''}
                                                            onChange={e => setFormData({ ...formData, chequeAmount: parseFloat(e.target.value) || 0 })}
                                                            className="w-full px-3 py-2 bg-white border border-brand-primary/20 rounded-lg focus:ring-2 focus:ring-brand-primary/10 outline-none"
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-4 mt-4 border-t border-brand-primary/20/50 flex items-center justify-between">
                                                    <span className="text-sm font-bold text-slate-600">المجموع الموزع:</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-lg font-extrabold ${Math.abs(splitTotal - totalAmount) < 0.01 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {formatNumber(splitTotal)} <span className="text-xs ml-1">{getCurrencyLabel(defaultCurrency)}</span>
                                                        </span>
                                                        <span className="text-sm text-slate-400">/</span>
                                                        <span className="text-sm font-bold text-slate-500">
                                                            {formatNumber(totalAmount)} <span className="text-xs ml-1">{getCurrencyLabel(defaultCurrency)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {(formData.paymentMethod === 'BankTransfer' || formData.paymentMethod === 'Cheque') && !formData.isSplitPayment && (
                                        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">رقم الحساب البنكي / رقم الشيك <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.bankAccount}
                                                onChange={e => { setFormData({ ...formData, bankAccount: e.target.value }); setIsDirty(true); }}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/80 outline-none"
                                                placeholder="أدخل البيانات البنكية..."
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-3">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">البيان / ملاحظات</label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={e => { setFormData({ ...formData, notes: e.target.value }); setIsDirty(true); }}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/80 outline-none transition-all resize-none min-h-[100px]"
                                                placeholder="أدخل أي ملاحظات إضافية هنا..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-6 py-3 text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl font-bold transition-colors flex items-center gap-2"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                    <span>السابق</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || (formData.isSplitPayment && Math.abs(splitTotal - totalAmount) > 0.01)}
                                        className="flex items-center gap-2.5 px-8 py-3.5 bg-brand-primary text-white rounded-xl 
                                            font-bold shadow-lg shadow-brand-primary/20/50
                                            hover:bg-brand-primary hover:shadow-xl hover:shadow-brand-primary/20/60
                                            active:scale-[0.97] transition-all duration-200 
                                            disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:shadow-none"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                        <span>حفظ إيصال الدفع</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ReceiptFormPage;
