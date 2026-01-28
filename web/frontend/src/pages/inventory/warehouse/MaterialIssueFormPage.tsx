import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import materialIssueService, { type MaterialIssueDto, type MaterialIssueItemDto, type IssueType } from '../../../services/materialIssueService';
import warehouseService from '../../../services/warehouseService';
import type { WarehouseDto } from '../../../services/warehouseService';
import { itemService } from '../../../services/itemService';
import type { ItemDto } from '../../../services/itemService';
import { saleOrderService } from '../../../services/saleOrderService';
import { toast } from 'react-hot-toast';

const MaterialIssueFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [saleOrders, setSaleOrders] = useState<any[]>([]);
    const [form, setForm] = useState<MaterialIssueDto>({
        issueType: 'SALE_ORDER',
        referenceNo: '',
        warehouseId: 0,
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        deliveryMethod: 'PICKUP',
        notes: '',
        items: []
    });

    useEffect(() => {
        (async () => {
            try {
                const [wh, it, so] = await Promise.all([
                    warehouseService.getAll(),
                    itemService.getAllItems(),
                    saleOrderService.getAll().catch(() => [])
                ]);
                setWarehouses((wh as any)?.data ?? []);
                setItems((it as any)?.data ?? []);
                setSaleOrders(Array.isArray(so) ? so : []);
            } catch { /* ignore */ }
        })();
    }, []);

    const onSaleOrderSelect = async (soId: number) => {
        if (!soId) { setForm((f) => ({ ...f, referenceNo: '', items: [] })); return; }
        const so = saleOrders.find((o) => o.id === soId);
        if (!so) return;
        const refNo = so.orderNumber || `SO-${so.id}`;
        try {
            const full = await saleOrderService.getById(soId);
            const newItems = (full?.items || []).map((i: any) => ({
                itemId: i.itemId,
                itemNameAr: i.itemNameAr,
                itemCode: i.itemCode,
                requestedQty: i.qty || 0,
                issuedQty: i.qty || 0,
                unitId: i.unitId,
                unitNameAr: i.unitNameAr
            }));
            setForm((f) => ({ ...f, referenceNo: refNo, items: newItems.length ? newItems : f.items }));
        } catch {
            setForm((f) => ({ ...f, referenceNo: refNo }));
        }
    };

    useEffect(() => {
        if (!isNew && id) {
            materialIssueService.getById(parseInt(id)).then((d) => d && setForm(d)).catch(() => toast.error('فشل التحميل'));
        }
    }, [id, isNew]);

    const addItem = () => {
        setForm((f) => ({ ...f, items: [...f.items, { itemId: 0, requestedQty: 0, issuedQty: 0, unitId: 0 }] }));
    };
    const removeItem = (idx: number) => {
        setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    };
    const updateItem = (idx: number, upd: Partial<MaterialIssueItemDto>) => {
        setForm((f) => {
            const arr = [...f.items];
            const it = items.find((i) => i.id === (upd.itemId ?? arr[idx]?.itemId));
            arr[idx] = { ...arr[idx], ...upd, unitId: upd.unitId ?? it?.unitId ?? 0, unitNameAr: it?.unitName, itemNameAr: it?.itemNameAr };
            return { ...f, items: arr };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.warehouseId || form.items.length === 0 || form.items.some((i) => !i.itemId || i.issuedQty <= 0)) {
            toast.error('أدخل المستودع وبنوداً بكميات مصروفة');
            return;
        }
        setLoading(true);
        try {
            await materialIssueService.create(form);
            toast.success('تم إنشاء إذن الصرف');
            navigate('/dashboard/inventory/issue');
        } catch (err: any) {
            if (err?.response?.status === 404 || err?.message?.includes('404')) {
                toast.error('واجهة إذن الصرف غير مفعّلة بعد. سيتم ربطها عند إضافة الـ API في الخلفية.');
            } else {
                toast.error(err?.response?.data?.message || 'فشل الحفظ');
            }
        } finally {
            setLoading(false);
        }
    };

    const types: { v: IssueType; l: string }[] = [
        { v: 'SALE_ORDER', l: 'صرف لأمر بيع' },
        { v: 'PRODUCTION', l: 'صرف لأمر تشغيل' },
        { v: 'PROJECT', l: 'صرف لمشروع' },
        { v: 'INTERNAL', l: 'صرف لقسم داخلي' }
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/inventory/issue')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">إذن صرف {isNew ? 'جديد' : `#${id}`}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">نوع الصرف والمرجع</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">نوع الصرف *</label>
                            <select value={form.issueType} onChange={(e) => setForm((f) => ({ ...f, issueType: e.target.value as IssueType }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required>
                                {types.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">رقم الأمر/المرجع</label>
                            <input type="text" value={form.referenceNo || ''} onChange={(e) => setForm((f) => ({ ...f, referenceNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" placeholder="أو اختر أمر بيع أدناه" />
                        </div>
                        {form.issueType === 'SALE_ORDER' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">أمر البيع (تحميل المرجع والبنود)</label>
                                <select value={form.referenceNo ? saleOrders.find((o) => (o.orderNumber || `SO-${o.id}`) === form.referenceNo)?.id ?? '' : ''} onChange={(e) => onSaleOrderSelect(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none">
                                    <option value="">— اختر أمر بيع لتعبئة المرجع والبنود...</option>
                                    {saleOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerNameAr}</option>)}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">يمنع الصرف دون أمر بيع معتمد. اختيار أمر البيع يملأ رقم المرجع وبنود الصرف.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">المستودع والمستلم</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">المستودع *</label>
                            <select value={form.warehouseId || ''} onChange={(e) => setForm((f) => ({ ...f, warehouseId: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required>
                                <option value="">اختر المستودع...</option>
                                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">الاسم/الجهة المستلمة</label>
                            <input type="text" value={form.receiverName || ''} onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">طريقة التسليم</label>
                            <select value={form.deliveryMethod || 'PICKUP'} onChange={(e) => setForm((f) => ({ ...f, deliveryMethod: e.target.value as any }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none">
                                <option value="PICKUP">استلام من المخزن</option>
                                <option value="COMPANY_DELIVERY">توصيل بواسطة الشركة</option>
                                <option value="EXTERNAL_SHIPPING">شحن خارجي</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="font-bold text-slate-800">البيان المصروف</h2>
                        <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200"><Plus className="w-4 h-4" /> إضافة صنف</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead><tr className="bg-slate-50 border-b"><th className="px-3 py-2 text-right text-xs font-semibold">الصنف</th><th className="px-3 py-2 text-right text-xs font-semibold">المطلوب</th><th className="px-3 py-2 text-right text-xs font-semibold">المصروف *</th><th className="px-3 py-2 text-right text-xs font-semibold">اللوت</th><th /></tr></thead>
                            <tbody>
                                {form.items.map((it, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-3 py-2">
                                            <select value={it.itemId || ''} onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) || 0 })} className="w-full min-w-[180px] px-2 py-1.5 border rounded" required>
                                                <option value="">اختر...</option>
                                                {items.map((i) => <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>)}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2"><input type="number" min={0} value={it.requestedQty || ''} onChange={(e) => updateItem(idx, { requestedQty: parseFloat(e.target.value) || 0 })} className="w-20 px-2 py-1 border rounded" /></td>
                                        <td className="px-3 py-2"><input type="number" min={0} value={it.issuedQty || ''} onChange={(e) => updateItem(idx, { issuedQty: parseFloat(e.target.value) || 0 })} className="w-20 px-2 py-1 border rounded" required /></td>
                                        <td className="px-3 py-2"><input type="text" value={it.lotNumber || ''} onChange={(e) => updateItem(idx, { lotNumber: e.target.value || undefined })} placeholder="لوت" className="w-24 px-2 py-1 border rounded text-sm" /></td>
                                        <td className="px-3 py-2"><button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50">
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} حفظ إذن الصرف
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard/inventory/issue')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default MaterialIssueFormPage;
