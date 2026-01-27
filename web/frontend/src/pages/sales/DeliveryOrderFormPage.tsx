import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Save } from 'lucide-react';
import { deliveryOrderService, type DeliveryOrderDto } from '../../services/deliveryOrderService';
import { saleOrderService } from '../../services/saleOrderService';
import { toast } from 'react-hot-toast';

const DeliveryOrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const saleOrderIdParam = searchParams.get('saleOrderId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saleOrders, setSaleOrders] = useState<any[]>([]);

    const [form, setForm] = useState<DeliveryOrderDto>({
        deliveryDate: new Date().toISOString().split('T')[0],
        saleOrderId: 0,
        customerId: 0,
        deliveryAddress: '',
        deliveryPlace: '',
        driverName: '',
        vehicleNo: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        (async () => {
            try {
                const list = await saleOrderService.getAll();
                setSaleOrders(Array.isArray(list) ? list : []);
            } catch { toast.error('فشل تحميل أوامر البيع'); }
        })();
    }, []);

    const loadFromSaleOrder = async (soId: number) => {
        if (!soId) {
            setForm((f) => ({ ...f, saleOrderId: 0, saleOrderNumber: undefined, customerId: 0, customerNameAr: undefined, items: [] }));
            return;
        }
        try {
            const so = await saleOrderService.getById(soId);
            if (so) {
                setForm((f) => ({
                    ...f,
                    saleOrderId: so.id!,
                    saleOrderNumber: so.orderNumber,
                    customerId: so.customerId,
                    customerNameAr: so.customerNameAr,
                    items: (so.items || []).map((i) => ({
                        itemId: i.itemId,
                        itemNameAr: i.itemNameAr,
                        itemCode: i.itemCode,
                        qty: i.qty,
                        unitId: i.unitId,
                        unitNameAr: i.unitNameAr,
                        notes: ''
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
                    const d = await deliveryOrderService.getById(parseInt(id));
                    if (d) setForm({ ...d, items: d.items || [] });
                    else { toast.error('أمر التوصيل غير موجود'); navigate('/dashboard/sales/delivery-orders'); }
                } catch { toast.error('فشل تحميل أمر التوصيل'); navigate('/dashboard/sales/delivery-orders'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const updateItemQty = (idx: number, qty: number) => {
        setForm((f) => {
            const arr = [...f.items];
            arr[idx] = { ...arr[idx], qty };
            return { ...f, items: arr };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.saleOrderId || !form.customerId) { toast.error('اختر أمر البيع'); return; }
        if (form.items.length === 0) { toast.error('أضف بنداً واحداً على الأقل'); return; }
        setSaving(true);
        try {
            await deliveryOrderService.create(form);
            toast.success('تم إنشاء أمر التوصيل');
            navigate('/dashboard/sales/delivery-orders');
        } catch (err: any) {
            const msg = err?.response?.status === 404 ? 'واجهة أوامر التوصيل غير مفعّلة في الخادم بعد' : (err?.response?.data?.message || 'فشل الحفظ');
            toast.error(msg);
        } finally { setSaving(false); }
    };

    if (!isNew && !form.deliveryOrderNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/sales/delivery-orders')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">{isNew ? 'أمر توصيل جديد' : `أمر توصيل ${form.deliveryOrderNumber || ''}`}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">البيانات الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">أمر البيع *</label>
                            <select
                                value={form.saleOrderId || ''}
                                onChange={(e) => loadFromSaleOrder(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                required
                            >
                                <option value="">اختر أمر البيع...</option>
                                {saleOrders.map((o) => (
                                    <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerNameAr}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">تاريخ التوصيل *</label>
                            <input type="date" value={form.deliveryDate || ''} onChange={(e) => setForm((f) => ({ ...f, deliveryDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">العميل</label>
                            <input type="text" value={form.customerNameAr || '—'} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">مكان التسليم</label>
                            <input type="text" value={form.deliveryPlace || ''} onChange={(e) => setForm((f) => ({ ...f, deliveryPlace: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" placeholder="عنوان أو مكان الاستلام" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">عنوان التوصيل</label>
                            <input type="text" value={form.deliveryAddress || ''} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">السائق</label>
                            <input type="text" value={form.driverName || ''} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">رقم المركبة</label>
                            <input type="text" value={form.vehicleNo || ''} onChange={(e) => setForm((f) => ({ ...f, vehicleNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ملاحظات</label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-800 border-b pb-2 mb-4">البنود (من أمر البيع)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead>
                                <tr className="bg-slate-50 border-b"><th className="px-3 py-2 text-right text-xs font-semibold">المادة</th><th className="px-3 py-2 text-right text-xs font-semibold">الكمية</th><th className="px-3 py-2 text-right text-xs font-semibold">الوحدة</th><th className="px-3 py-2 text-right text-xs font-semibold">ملاحظات</th></tr>
                            </thead>
                            <tbody>
                                {form.items.map((it, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-3 py-2 text-slate-800">{it.itemNameAr || it.itemCode || '—'}</td>
                                        <td className="px-3 py-2">
                                            <input type="number" min={0} value={it.qty || ''} onChange={(e) => updateItemQty(idx, parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 border rounded" />
                                        </td>
                                        <td className="px-3 py-2 text-slate-600">{it.unitNameAr || '—'}</td>
                                        <td className="px-3 py-2">
                                            <input type="text" value={it.notes || ''} onChange={(e) => setForm((f) => { const arr = [...f.items]; arr[idx] = { ...arr[idx], notes: e.target.value }; return { ...f, items: arr }; })} className="w-full max-w-[180px] px-2 py-1 border rounded text-sm" placeholder="اختياري" />
                                        </td>
                                    </tr>
                                ))}
                                {form.items.length === 0 && (
                                    <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">اختر أمر بيع لتحميل البنود</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold disabled:opacity-50"><Save className="w-5 h-5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
                    <button type="button" onClick={() => navigate('/dashboard/sales/delivery-orders')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default DeliveryOrderFormPage;
