import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Save, Plus, Trash2 } from 'lucide-react';
import { saleOrderService, type SaleOrderDto, type SaleOrderItemDto } from '../../services/saleOrderService';
import { salesQuotationService } from '../../services/salesQuotationService';
import customerService from '../../services/customerService';
import { itemService } from '../../services/itemService';
import { toast } from 'react-hot-toast';

const SaleOrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const quotationId = searchParams.get('quotationId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [quotations, setQuotations] = useState<any[]>([]);

    const [form, setForm] = useState<SaleOrderDto>({
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        customerId: 0,
        quotationId: 0,
        currency: 'EGP',
        exchangeRate: 1,
        paymentTerms: '',
        discountPercent: 0,
        taxPercent: 0,
        notes: '',
        items: []
    });

    useEffect(() => {
        (async () => {
            try {
                const [c, i, q] = await Promise.all([
                    customerService.getActiveCustomers().catch(() => []),
                    (itemService.getActiveItems() as Promise<{ data?: any[] }>).then((r) => Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []).catch(() => []),
                    salesQuotationService.getAll().catch(() => [])
                ]);
                setCustomers(Array.isArray(c) ? c : []);
                setItems(Array.isArray(i) ? i : []);
                setQuotations(Array.isArray(q) ? q : []);
            } catch { toast.error('فشل تحميل البيانات'); }
        })();
    }, []);

    const loadFromQuotation = async (qId: number) => {
        if (!qId) return;
        try {
            const q = await salesQuotationService.getById(qId);
            if (q) {
                setForm((f) => ({
                    ...f,
                    quotationId: q.id!,
                    quotationNumber: q.quotationNumber,
                    customerId: q.customerId,
                    customerNameAr: q.customerNameAr,
                    currency: q.currency,
                    paymentTerms: q.paymentTerms ?? f.paymentTerms,
                    discountPercent: q.discountPercent ?? 0,
                    taxPercent: q.taxPercent ?? 0,
                    items: (q.items || []).map((i) => ({
                        itemId: i.itemId,
                        itemNameAr: i.itemNameAr,
                        itemCode: i.itemCode,
                        qty: i.qty,
                        unitId: i.unitId,
                        unitNameAr: i.unitNameAr,
                        unitPrice: i.unitPrice,
                        discountPercent: i.discountPercent
                    }))
                }));
            }
        } catch { toast.error('فشل تحميل عرض السعر'); }
    };

    useEffect(() => {
        if (quotationId) loadFromQuotation(parseInt(quotationId));
    }, [quotationId]);

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const o = await saleOrderService.getById(parseInt(id));
                    if (o) setForm({ ...o, items: o.items || [] });
                    else { toast.error('أمر البيع غير موجود'); navigate('/dashboard/sales/orders'); }
                } catch { toast.error('فشل تحميل أمر البيع'); navigate('/dashboard/sales/orders'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const addItem = () => { setForm((f) => ({ ...f, items: [...f.items, { itemId: 0, qty: 1, unitId: 0, unitPrice: 0, discountPercent: 0 }] })); };
    const removeItem = (idx: number) => { setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) })); };
    const updateItem = (idx: number, u: Partial<SaleOrderItemDto>) => {
        setForm((f) => {
            const arr = [...f.items];
            arr[idx] = { ...arr[idx], ...u };
            const it = items.find((x) => x.id === (u.itemId ?? arr[idx].itemId));
            if (u.itemId !== undefined && it) arr[idx].unitId = it.unitId;
            return { ...f, items: arr };
        });
    };

    const subtotal = form.items.reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0) * (1 - (i.discountPercent || 0) / 100), 0);
    const disc = subtotal * ((form.discountPercent || 0) / 100);
    const tax = (subtotal - disc) * ((form.taxPercent || 0) / 100);
    const total = subtotal - disc + tax;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.customerId) { toast.error('اختر العميل'); return; }
        if (form.items.length === 0) { toast.error('أضف بنداً واحداً على الأقل'); return; }
        setSaving(true);
        try {
            const payload: SaleOrderDto = { ...form, subTotal: subtotal, discountAmount: disc, taxAmount: tax, totalAmount: total, items: form.items };
            if (isNew) {
                await saleOrderService.create(payload);
                toast.success('تم إنشاء أمر البيع');
            } else {
                await saleOrderService.update(parseInt(id!), payload);
                toast.success('تم التحديث');
            }
            navigate('/dashboard/sales/orders');
        } catch (err: any) {
            const msg = err?.response?.status === 404 ? 'واجهة أوامر البيع غير مفعّلة في الخادم بعد' : (err?.response?.data?.message || 'فشل الحفظ');
            toast.error(msg);
        } finally { setSaving(false); }
    };

    if (!isNew && !form.orderNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/sales/orders')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">{isNew ? 'أمر بيع جديد' : `أمر بيع ${form.orderNumber || ''}`}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">البيانات الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">عرض السعر (تحويل من)</label>
                            <select value={form.quotationId || ''} onChange={(e) => loadFromQuotation(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none">
                                <option value="">—</option>
                                {quotations.map((q) => <option key={q.id} value={q.id}>{q.quotationNumber} — {q.customerNameAr}</option>)}
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
                            <label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ الأمر *</label>
                            <input type="date" value={form.orderDate || ''} onChange={(e) => setForm((f) => ({ ...f, orderDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ التسليم</label>
                            <input type="date" value={form.deliveryDate || ''} onChange={(e) => setForm((f) => ({ ...f, deliveryDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">شروط الدفع</label>
                            <input type="text" value={form.paymentTerms || ''} onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">خصم %</label>
                            <input type="number" min={0} max={100} step={0.01} value={form.discountPercent || ''} onChange={(e) => setForm((f) => ({ ...f, discountPercent: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ضريبة %</label>
                            <input type="number" min={0} step={0.01} value={form.taxPercent || ''} onChange={(e) => setForm((f) => ({ ...f, taxPercent: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
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
                                        <td className="px-2 py-2"><input type="number" min={0.001} value={it.qty || ''} onChange={(e) => updateItem(idx, { qty: parseFloat(e.target.value) || 0 })} className="w-20 px-2 py-1 border rounded" /></td>
                                        <td className="px-2 py-2"><input type="number" min={0} step={0.01} value={it.unitPrice || ''} onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} className="w-24 px-2 py-1 border rounded" /></td>
                                        <td className="px-2 py-2"><input type="number" min={0} max={100} step={0.01} value={it.discountPercent || ''} onChange={(e) => updateItem(idx, { discountPercent: parseFloat(e.target.value) || 0 })} className="w-16 px-2 py-1 border rounded" /></td>
                                        <td className="px-2 py-2"><button type="button" onClick={() => removeItem(idx)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end gap-4 text-slate-700">
                        <span className="font-bold">الإجمالي النهائي: {total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} {form.currency}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50"><Save className="w-5 h-5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
                    <button type="button" onClick={() => navigate('/dashboard/sales/orders')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default SaleOrderFormPage;
