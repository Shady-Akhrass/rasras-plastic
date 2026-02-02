import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Save, Plus, Trash2 } from 'lucide-react';
import { salesInvoiceService, type SalesInvoiceDto, type SalesInvoiceItemDto } from '../../services/salesInvoiceService';
import { saleOrderService } from '../../services/saleOrderService';
import customerService from '../../services/customerService';
import { itemService } from '../../services/itemService';
import { toast } from 'react-hot-toast';

const SalesInvoiceFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const saleOrderIdParam = searchParams.get('saleOrderId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [saleOrders, setSaleOrders] = useState<any[]>([]);

    const [form, setForm] = useState<SalesInvoiceDto>({
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        customerId: 0,
        salesOrderId: 0,
        currency: 'EGP',
        exchangeRate: 1,
        paymentTerms: '',
        discountPercentage: 0,
        taxAmount: 0,
        paidAmount: 0,
        notes: '',
        items: []
    });

    useEffect(() => {
        (async () => {
            try {
                const [c, i, so] = await Promise.all([
                    customerService.getActiveCustomers().catch(() => []),
                    (itemService.getActiveItems() as Promise<{ data?: any[] }>).then((r) => Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []).catch(() => []),
                    saleOrderService.getAll().catch(() => [])
                ]);
                setCustomers(Array.isArray(c) ? c : []);
                setItems(Array.isArray(i) ? i : []);
                setSaleOrders(Array.isArray(so) ? so : []);
            } catch { toast.error('فشل تحميل البيانات'); }
        })();
    }, []);

    const loadFromSaleOrder = async (soId: number) => {
        if (!soId) {
            setForm((f) => ({ ...f, salesOrderId: 0, soNumber: undefined, customerId: 0, customerNameAr: undefined, items: [] }));
            return;
        }
        try {
            const so = await saleOrderService.getById(soId);
            if (so) {
                setForm((f) => ({
                    ...f,
                    salesOrderId: so.id!,
                    soNumber: so.soNumber,
                    customerId: so.customerId,
                    customerNameAr: so.customerNameAr,
                    paymentTerms: so.paymentTerms ?? f.paymentTerms,
                    discountPercentage: so.discountPercentage ?? 0,
                    taxAmount: so.taxAmount ?? 0,
                    items: (so.items || []).map((i) => ({
                        itemId: i.itemId,
                        itemNameAr: i.itemNameAr,
                        itemCode: i.itemCode,
                        quantity: i.orderedQty,
                        unitId: i.unitId,
                        unitNameAr: i.unitNameAr,
                        unitPrice: i.unitPrice,
                        discountPercentage: i.discountPercentage,
                        totalPrice: i.totalPrice
                    }))
                }));
            }
        } catch { toast.error('فشل تحميل أمر البيع'); }
    };

    useEffect(() => {
        if (saleOrderIdParam) loadFromSaleOrder(parseInt(saleOrderIdParam));
    }, [saleOrderIdParam]);

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const inv = await salesInvoiceService.getById(parseInt(id));
                    if (inv) setForm({ ...inv, items: inv.items || [] });
                    else { toast.error('الفاتورة غير موجودة'); navigate('/dashboard/sales/invoices'); }
                } catch { toast.error('فشل تحميل الفاتورة'); navigate('/dashboard/sales/invoices'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const addItem = () => { setForm((f) => ({ ...f, items: [...f.items, { itemId: 0, quantity: 1, unitId: 0, unitPrice: 0, discountPercentage: 0, totalPrice: 0 }] })); };
    const removeItem = (idx: number) => { setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) })); };
    const updateItem = (idx: number, u: Partial<SalesInvoiceItemDto>) => {
        setForm((f) => {
            const arr = [...f.items];
            arr[idx] = { ...arr[idx], ...u };
            const it = items.find((x) => x.id === (u.itemId ?? arr[idx].itemId));
            if (u.itemId !== undefined && it) arr[idx].unitId = it.unitId;
            return { ...f, items: arr };
        });
    };

    const subtotal = form.items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0) * (1 - (i.discountPercentage || 0) / 100), 0);
    const disc = subtotal * ((form.discountPercentage || 0) / 100);
    const afterDisc = subtotal - disc;
    const tax = form.taxAmount || 0;
    const total = afterDisc + tax;
    const paid = form.paidAmount ?? 0;
    const balance = total - paid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customerId) { toast.error('اختر العميل'); return; }
        if (form.items.length === 0) { toast.error('أضف بنداً واحداً على الأقل'); return; }
        setSaving(true);
        try {
            const payload: SalesInvoiceDto = { ...form, subTotal: subtotal, discountAmount: disc, taxAmount: tax, totalAmount: total, remainingAmount: balance, items: form.items };
            await salesInvoiceService.create(payload);
            toast.success('تم إنشاء الفاتورة');
            navigate('/dashboard/sales/invoices');
        } catch (err: any) {
            const msg = err?.response?.status === 404 ? 'واجهة فواتير المبيعات غير مفعّلة في الخادم بعد' : (err?.response?.data?.message || 'فشل الحفظ');
            toast.error(msg);
        } finally { setSaving(false); }
    };

    if (!isNew && !form.invoiceNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/sales/invoices')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">{isNew ? 'فاتورة مبيعات جديدة' : `فاتورة ${form.invoiceNumber || ''}`}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">البيانات الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">أمر البيع (تحميل منه)</label>
                            <select value={form.salesOrderId || ''} onChange={(e) => loadFromSaleOrder(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none">
                                <option value="">—</option>
                                {saleOrders.map((o) => <option key={o.id} value={o.id}>{o.soNumber} — {o.customerNameAr}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">العميل *</label>
                            <select value={form.customerId || ''} onChange={(e) => setForm((f) => ({ ...f, customerId: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required>
                                <option value="">اختر العميل...</option>
                                {customers.map((c) => <option key={c.id} value={c.id}>{c.customerNameAr}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ الفاتورة *</label>
                            <input type="date" value={form.invoiceDate || ''} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ الاستحقاق</label>
                            <input type="date" value={form.dueDate || ''} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">شروط الدفع</label>
                            <input type="text" value={form.paymentTerms || ''} onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">خصم %</label>
                            <input type="number" min={0} max={100} step={0.01} value={form.discountPercentage || ''} onChange={(e) => setForm((f) => ({ ...f, discountPercentage: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ضريبة القيمة</label>
                            <input type="number" min={0} step={0.01} value={form.taxAmount || ''} onChange={(e) => setForm((f) => ({ ...f, taxAmount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">المدفوع مسبقاً</label>
                            <input type="number" min={0} step={0.01} value={form.paidAmount ?? ''} onChange={(e) => setForm((f) => ({ ...f, paidAmount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ملاحظات</label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="font-bold text-slate-800">البنود</h2>
                        <button type="button" onClick={addItem} className="inline-flex items-center gap-1 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-medium"><Plus className="w-4 h-4" />إضافة بند</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead>
                                <tr className="bg-slate-50 border-b"><th className="px-2 py-2 text-right text-xs font-semibold">الصنف</th><th className="px-2 py-2 text-right text-xs font-semibold">الكمية</th><th className="px-2 py-2 text-right text-xs font-semibold">السعر</th><th className="px-2 py-2 text-right text-xs font-semibold">خصم %</th><th></th></tr>
                            </thead>
                            <tbody>
                                {form.items.map((it, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-2 py-2">
                                            <select value={it.itemId || ''} onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) || 0 })} className="w-full max-w-[200px] px-2 py-1.5 border rounded text-sm">
                                                <option value="">اختر الصنف...</option>
                                                {items.map((i) => <option key={i.id} value={i.id}>{i.itemNameAr || i.itemCode}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-2 py-2"><input type="number" min={0.001} value={it.quantity || ''} onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} className="w-20 px-2 py-1 border rounded" /></td>
                                        <td className="px-2 py-2"><input type="number" min={0} step={0.01} value={it.unitPrice || ''} onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded" /></td>
                                        <td className="px-2 py-2"><input type="number" min={0} max={100} step={0.01} value={it.discountPercentage || ''} onChange={(e) => updateItem(idx, { discountPercentage: parseFloat(e.target.value) || 0 })} className="w-16 px-2 py-1 border rounded" /></td>
                                        <td className="px-2 py-2"><button type="button" onClick={() => removeItem(idx)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-4 text-slate-700">
                        <span>الإجمالي: {subtotal.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                        <span>الخصم: {disc.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                        <span>الضريبة: {tax.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                        <span className="font-bold">الإجمالي النهائي: {total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {form.currency}</span>
                        <span>المدفوع: {paid.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                        <span className="font-bold text-amber-600">الرصيد: {balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50"><Save className="w-5 h-5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
                    <button type="button" onClick={() => navigate('/dashboard/sales/invoices')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default SalesInvoiceFormPage;
