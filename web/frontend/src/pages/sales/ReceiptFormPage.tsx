import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    FileText,
    DollarSign,
    Calendar,
    User,
    Phone,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Send,
    XCircle,
    Clock,
    RefreshCw,
    Eye,
    Lock
} from 'lucide-react';
import { receiptService, type ReceiptDto } from '../../services/receiptService';
import type { ReceiptType, PaymentMethod } from '../../services/receiptService';
import { salesInvoiceService } from '../../services/salesInvoiceService';
import { approvalService } from '../../services/approvalService';
import { toast } from 'react-hot-toast';

const RECEIPT_TYPES: { value: ReceiptType; label: string }[] = [
    { value: 'FROM_CUSTOMER', label: 'من عميل' },
    { value: 'FROM_EMPLOYEE', label: 'من موظف' },
    { value: 'GENERAL_INCOME', label: 'إيراد عام' },
    { value: 'OTHER', label: 'أخرى' }
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'Cash', label: 'نقداً' },
    { value: 'Cheque', label: 'شيك' },
    { value: 'BankTransfer', label: 'تحويل بنكي' },
    { value: 'PromissoryNote', label: 'كمبيالة' }
];

const ReceiptFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const invoiceIdParam = searchParams.get('invoiceId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [invoices, setInvoices] = useState<any[]>([]);
    const approvalId = searchParams.get('approvalId');
    const isView = searchParams.get('mode') === 'view';
    const isEdit = !!id && !isNew;

    const [form, setForm] = useState<ReceiptDto>({
        voucherDate: new Date().toISOString().split('T')[0],
        receiptType: 'FROM_CUSTOMER',
        paymentMethod: 'Cash',
        amount: 0,
        invoiceTotal: 0,
        earlyDiscount: 0,
        refundOrReturn: 0,
        currency: 'EGP',
        notes: ''
    });

    useEffect(() => {
        (async () => {
            try {
                const list = await salesInvoiceService.getAll();
                setInvoices(Array.isArray(list) ? list : []);
            } catch { toast.error('فشل تحميل الفواتير'); }
        })();
    }, []);

    const onInvoiceSelect = (invId: number) => {
        setForm((f) => ({ ...f, invoiceId: invId || undefined, invoiceNumber: undefined, invoiceDate: undefined, invoiceTotal: undefined }));
        if (!invId) return;
        const inv = invoices.find((i) => i.id === invId);
        if (inv) {
            setForm((f) => ({
                ...f,
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                invoiceDate: inv.invoiceDate,
                invoiceTotal: inv.totalAmount,
                saleOrderNumber: inv.saleOrderNumber,
                amount: inv.balanceAmount ?? inv.totalAmount ?? 0
            }));
        }
    };

    useEffect(() => {
        if (invoiceIdParam) onInvoiceSelect(parseInt(invoiceIdParam));
    }, [invoiceIdParam, invoices]);

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const r = await receiptService.getById(parseInt(id));
                    if (r) setForm(r);
                    else { toast.error('الإيصال غير موجود'); navigate('/dashboard/sales/receipts'); }
                } catch { toast.error('فشل تحميل الإيصال'); navigate('/dashboard/sales/receipts'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const isReadOnly = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Rejected');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (form.approvalStatus === 'Approved') return;
        if (!form.amount || form.amount <= 0) { toast.error('أدخل المبلغ المقبوض'); return; }
        setSaving(true);
        try {
            if (isNew) {
                await receiptService.create(form);
                toast.success('تم إنشاء إيصال الدفع');
            } else {
                await receiptService.update(parseInt(id!), form);
                toast.success('تم التحديث');
            }
            navigate('/dashboard/sales/receipts');
        } catch (err: any) {
            const msg = err?.response?.status === 404 ? 'واجهة إيصالات الدفع غير مفعّلة في الخادم بعد' : (err?.response?.data?.message || 'فشل الحفظ');
            toast.error(msg);
        } finally { setSaving(false); }
    };

    const handleSubmitForApproval = async () => {
        if (!id || isNew) {
            toast.error('يجب حفظ الإيصال أولاً قبل الإرسال للاعتماد');
            return;
        }
        if (!form.amount || form.amount <= 0) {
            toast.error('أدخل المبلغ المقبوض');
            return;
        }
        if (form.status !== 'Draft' && form.status !== 'Rejected') {
            toast.error('يمكن إرسال المسودات أو المرفوضة فقط للاعتماد');
            return;
        }
        try {
            setProcessing(true);
            const updated = await receiptService.submitForApproval(parseInt(id));
            if (updated) {
                setForm(updated);
                toast.success('تم إرسال الإيصال للاعتماد بنجاح');
                navigate('/dashboard/sales/receipts');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إرسال الإيصال للاعتماد');
        } finally {
            setProcessing(false);
        }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
            navigate('/dashboard/sales/approvals');
        } catch {
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessing(false);
        }
    };

    if (!isNew && !form.voucherNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/sales/receipts')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <DollarSign className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isNew ? 'سند قبض جديد' : `تعديل سند قبض ${form.voucherNumber || ''}`}
                                </h1>
                                {isReadOnly && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20"><Lock className="w-3 h-3" /> للعرض فقط</span>}
                                {form.approvalStatus && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                                        form.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-white border-emerald-300/30' :
                                        form.approvalStatus === 'Rejected' ? 'bg-rose-500/20 text-white border-rose-300/30' :
                                        form.approvalStatus === 'Pending' ? 'bg-amber-500/20 text-white border-amber-300/30' :
                                        'bg-slate-500/20 text-white border-slate-300/30'
                                    }`}>
                                        {form.approvalStatus === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                                        {form.approvalStatus === 'Rejected' && <XCircle className="w-3 h-3" />}
                                        {form.approvalStatus === 'Pending' && <Clock className="w-3 h-3" />}
                                        {form.approvalStatus === 'Approved' ? 'معتمد' : form.approvalStatus === 'Rejected' ? 'مرفوض' : form.approvalStatus === 'Pending' ? 'قيد الانتظار' : form.approvalStatus}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-lg">أدخل تفاصيل سند القبض</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {isView && approvalId && (
                            <>
                                <button
                                    onClick={() => handleApprovalAction('Approved')}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    <span>اعتماد</span>
                                </button>
                                <button
                                    onClick={() => handleApprovalAction('Rejected')}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                    <span>رفض</span>
                                </button>
                                <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-bold">عرض من صندوق الاعتماد</span>
                                </div>
                            </>
                        )}
                        {!isReadOnly && (
                            <>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl 
                                        font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                        disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {saving ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    <span>{saving ? 'جاري الحفظ...' : isNew ? 'إنشاء سند القبض' : 'تحديث'}</span>
                                </button>
                                {isEdit && (form.status === 'Draft' || form.status === 'Rejected') && (
                                    <button
                                        onClick={handleSubmitForApproval}
                                        disabled={processing || saving}
                                        className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        <span>إرسال للاعتماد</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-primary/10 rounded-xl">
                                <FileText className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">بيانات المُودِع والقبض</h3>
                                <p className="text-slate-500 text-sm">معلومات سند القبض</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                نوع القبض <span className="text-rose-500">*</span>
                            </label>
                            <select value={form.receiptType || ''} onChange={(e) => setForm((f) => ({ ...f, receiptType: e.target.value as ReceiptType }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" required>
                                {RECEIPT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Calendar className="w-4 h-4 text-brand-primary" />
                                تاريخ السند <span className="text-rose-500">*</span>
                            </label>
                            <input type="date" value={form.voucherDate || ''} onChange={(e) => setForm((f) => ({ ...f, voucherDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" required />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <User className="w-4 h-4 text-brand-primary" />
                                اسم المُودِع
                            </label>
                            <input type="text" value={form.depositorName || ''} onChange={(e) => setForm((f) => ({ ...f, depositorName: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Phone className="w-4 h-4 text-brand-primary" />
                                رقم الهاتف
                            </label>
                            <input type="text" value={form.depositorPhone || ''} onChange={(e) => setForm((f) => ({ ...f, depositorPhone: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                الفاتورة
                            </label>
                            <select value={form.invoiceId || ''} onChange={(e) => onInvoiceSelect(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold">
                                <option value="">—</option>
                                {invoices.map((inv) => <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.customerNameAr} ({(inv.totalAmount ?? 0).toLocaleString('ar-EG')})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <DollarSign className="w-4 h-4 text-brand-primary" />
                                إجمالي الفاتورة
                            </label>
                            <input type="number" min={0} step={0.01} value={form.invoiceTotal ?? ''} onChange={(e) => setForm((f) => ({ ...f, invoiceTotal: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" readOnly={!!form.invoiceId} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                خصم مبكر
                            </label>
                            <input type="number" min={0} step={0.01} value={form.earlyDiscount ?? ''} onChange={(e) => setForm((f) => ({ ...f, earlyDiscount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                مردودات/مسترجعات
                            </label>
                            <input type="number" min={0} step={0.01} value={form.refundOrReturn ?? ''} onChange={(e) => setForm((f) => ({ ...f, refundOrReturn: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                المبلغ المقبوض <span className="text-rose-500">*</span>
                            </label>
                            <input type="number" min={0.01} step={0.01} value={form.amount ?? ''} onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" required />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <CreditCard className="w-4 h-4 text-brand-primary" />
                                طريقة الدفع <span className="text-rose-500">*</span>
                            </label>
                            <select value={form.paymentMethod || ''} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" required>
                                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        {form.paymentMethod === 'Cheque' && (
                            <>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم الشيك</label><input type="text" value={form.chequeNo || ''} onChange={(e) => setForm((f) => ({ ...f, chequeNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">البنك</label><input type="text" value={form.chequeBank || ''} onChange={(e) => setForm((f) => ({ ...f, chequeBank: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                            </>
                        )}
                        {form.paymentMethod === 'BankTransfer' && (
                            <>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم الحساب</label><input type="text" value={form.bankAccountNo || ''} onChange={(e) => setForm((f) => ({ ...f, bankAccountNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم التحويل</label><input type="text" value={form.transferRef || ''} onChange={(e) => setForm((f) => ({ ...f, transferRef: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                            </>
                        )}
                        {form.paymentMethod === 'PromissoryNote' && (
                            <>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم الكمبيالة</label><input type="text" value={form.promissoryNo || ''} onChange={(e) => setForm((f) => ({ ...f, promissoryNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ استحقاق الكمبيالة</label><input type="date" value={form.promissoryDueDate || ''} onChange={(e) => setForm((f) => ({ ...f, promissoryDueDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                            </>
                        )}
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                ملاحظات
                            </label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold resize-none" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReceiptFormPage;
