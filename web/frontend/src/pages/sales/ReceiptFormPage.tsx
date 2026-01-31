import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Save } from 'lucide-react';
import { receiptService, type ReceiptDto } from '../../services/receiptService';
import type { ReceiptType, PaymentMethod } from '../../services/receiptService';
import { salesInvoiceService } from '../../services/salesInvoiceService';
import { toast } from 'react-hot-toast';

const RECEIPT_TYPES: { value: ReceiptType; label: string }[] = [
    { value: 'FROM_CUSTOMER', label: 'من عميل' },
    { value: 'FROM_EMPLOYEE', label: 'من موظف' },
    { value: 'GENERAL_INCOME', label: 'إيراد عام' },
    { value: 'OTHER', label: 'أخرى' }
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'CASH', label: 'نقداً' },
    { value: 'CHEQUE', label: 'شيك' },
    { value: 'BANK_TRANSFER', label: 'تحويل بنكي' },
    { value: 'PROMISSORY_NOTE', label: 'كمبيالة' }
];

const ReceiptFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const invoiceIdParam = searchParams.get('invoiceId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [invoices, setInvoices] = useState<any[]>([]);

    const [form, setForm] = useState<ReceiptDto>({
        receiptDate: new Date().toISOString().split('T')[0],
        receiptType: 'FROM_CUSTOMER',
        paymentMethod: 'CASH',
        receivedAmount: 0,
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
                receivedAmount: inv.balanceAmount ?? inv.totalAmount ?? 0
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.receivedAmount || form.receivedAmount <= 0) { toast.error('أدخل المبلغ المقبوض'); return; }
        setSaving(true);
        try {
            await receiptService.create(form);
            toast.success('تم إنشاء إيصال الدفع');
            navigate('/dashboard/sales/receipts');
        } catch (err: any) {
            const msg = err?.response?.status === 404 ? 'واجهة إيصالات الدفع غير مفعّلة في الخادم بعد' : (err?.response?.data?.message || 'فشل الحفظ');
            toast.error(msg);
        } finally { setSaving(false); }
    };

    if (!isNew && !form.receiptNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/sales/receipts')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">{isNew ? 'سند قبض جديد' : `سند قبض ${form.receiptNumber || ''}`}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">بيانات المُودِع والقبض</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">نوع القبض *</label>
                            <select value={form.receiptType || ''} onChange={(e) => setForm((f) => ({ ...f, receiptType: e.target.value as ReceiptType }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required>
                                {RECEIPT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ السند *</label>
                            <input type="date" value={form.receiptDate || ''} onChange={(e) => setForm((f) => ({ ...f, receiptDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">اسم المُودِع</label>
                            <input type="text" value={form.depositorName || ''} onChange={(e) => setForm((f) => ({ ...f, depositorName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">رقم الهاتف</label>
                            <input type="text" value={form.depositorPhone || ''} onChange={(e) => setForm((f) => ({ ...f, depositorPhone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">الفاتورة</label>
                            <select value={form.invoiceId || ''} onChange={(e) => onInvoiceSelect(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none">
                                <option value="">—</option>
                                {invoices.map((inv) => <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.customerNameAr} ({(inv.totalAmount ?? 0).toLocaleString('ar-EG')})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">إجمالي الفاتورة</label>
                            <input type="number" min={0} step={0.01} value={form.invoiceTotal ?? ''} onChange={(e) => setForm((f) => ({ ...f, invoiceTotal: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" readOnly={!!form.invoiceId} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">خصم مبكر</label>
                            <input type="number" min={0} step={0.01} value={form.earlyDiscount ?? ''} onChange={(e) => setForm((f) => ({ ...f, earlyDiscount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">مردودات/مسترجعات</label>
                            <input type="number" min={0} step={0.01} value={form.refundOrReturn ?? ''} onChange={(e) => setForm((f) => ({ ...f, refundOrReturn: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">المبلغ المقبوض *</label>
                            <input type="number" min={0.01} step={0.01} value={form.receivedAmount ?? ''} onChange={(e) => setForm((f) => ({ ...f, receivedAmount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">طريقة الدفع *</label>
                            <select value={form.paymentMethod || ''} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required>
                                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        {form.paymentMethod === 'CHEQUE' && (
                            <>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم الشيك</label><input type="text" value={form.chequeNo || ''} onChange={(e) => setForm((f) => ({ ...f, chequeNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">البنك</label><input type="text" value={form.chequeBank || ''} onChange={(e) => setForm((f) => ({ ...f, chequeBank: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                            </>
                        )}
                        {form.paymentMethod === 'BANK_TRANSFER' && (
                            <>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم الحساب</label><input type="text" value={form.bankAccountNo || ''} onChange={(e) => setForm((f) => ({ ...f, bankAccountNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم التحويل</label><input type="text" value={form.transferRef || ''} onChange={(e) => setForm((f) => ({ ...f, transferRef: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                            </>
                        )}
                        {form.paymentMethod === 'PROMISSORY_NOTE' && (
                            <>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">رقم الكمبيالة</label><input type="text" value={form.promissoryNo || ''} onChange={(e) => setForm((f) => ({ ...f, promissoryNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                                <div><label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ استحقاق الكمبيالة</label><input type="date" value={form.promissoryDueDate || ''} onChange={(e) => setForm((f) => ({ ...f, promissoryDueDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" /></div>
                            </>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ملاحظات</label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-bold disabled:opacity-50"><Save className="w-5 h-5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
                    <button type="button" onClick={() => navigate('/dashboard/sales/receipts')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default ReceiptFormPage;
