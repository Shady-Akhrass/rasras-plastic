import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, Package, Plus, Trash2, RefreshCw } from 'lucide-react';
import transferNoteService, { type TransferNoteDto, type TransferItemDto, type TransferReason } from '../../../services/transferNoteService';
import warehouseService from '../../../services/warehouseService';
import type { WarehouseDto } from '../../../services/warehouseService';
import { itemService } from '../../../services/itemService';
import type { ItemDto } from '../../../services/itemService';
import { toast } from 'react-hot-toast';

const TransferNoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [form, setForm] = useState<TransferNoteDto>({
        fromWarehouseId: 0,
        toWarehouseId: 0,
        reason: 'REDISTRIBUTION',
        reasonOther: '',
        notes: '',
        items: []
    });

    useEffect(() => {
        (async () => {
            try {
                const [wh, it] = await Promise.all([warehouseService.getAll(), itemService.getAllItems()]);
                setWarehouses((wh as any)?.data ?? []);
                setItems((it as any)?.data ?? []);
            } catch { /* ignore */ }
        })();
    }, []);

    useEffect(() => {
        if (!isNew && id) {
            transferNoteService.getById(parseInt(id)).then((d) => d && setForm(d)).catch(() => toast.error('فشل التحميل'));
        }
    }, [id, isNew]);

    const addItem = () => {
        setForm((f) => ({ ...f, items: [...f.items, { itemId: 0, quantity: 0, unitId: 0 }] }));
    };
    const removeItem = (idx: number) => {
        setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    };
    const updateItem = (idx: number, upd: Partial<TransferItemDto>) => {
        setForm((f) => {
            const arr = [...f.items];
            const it = items.find((i) => i.id === (upd.itemId ?? arr[idx]?.itemId));
            arr[idx] = { ...arr[idx], ...upd, unitId: upd.unitId ?? it?.unitId ?? 0, unitNameAr: it?.unitName, itemNameAr: it?.itemNameAr };
            return { ...f, items: arr };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.fromWarehouseId || !form.toWarehouseId || form.fromWarehouseId === form.toWarehouseId) {
            toast.error('اختر مخزناً مصدراً ومخزناً هدفاً مختلفين');
            return;
        }
        if (form.items.length === 0 || form.items.some((i) => !i.itemId || i.quantity <= 0)) {
            toast.error('أضف صنفاً واحداً على الأقل بكمية');
            return;
        }
        setLoading(true);
        try {
            await transferNoteService.create(form);
            toast.success('تم إنشاء إذن التحويل');
            navigate('/dashboard/inventory/transfer');
        } catch (err: any) {
            if (err?.response?.status === 404) {
                toast.error('واجهة التحويل غير مفعّلة بعد. سيتم ربطها عند إضافة الـ API في الخلفية.');
            } else {
                toast.error(err?.response?.data?.message || 'فشل الحفظ');
            }
        } finally {
            setLoading(false);
        }
    };

    const reasons: { v: TransferReason; l: string }[] = [
        { v: 'REDISTRIBUTION', l: 'إعادة توزيع' },
        { v: 'BRANCH_TRANSFER', l: 'نقل لفرع' },
        { v: 'REORGANIZATION', l: 'تنظيم المخزون' },
        { v: 'OTHER', l: 'أخرى' }
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/inventory/transfer')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">إذن تحويل بين مخازن {isNew ? 'جديد' : `#${id}`}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">من / إلى / السبب</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">من المخزن *</label>
                            <select value={form.fromWarehouseId || ''} onChange={(e) => setForm((f) => ({ ...f, fromWarehouseId: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required>
                                <option value="">اختر...</option>
                                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">إلى المخزن *</label>
                            <select value={form.toWarehouseId || ''} onChange={(e) => setForm((f) => ({ ...f, toWarehouseId: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" required>
                                <option value="">اختر...</option>
                                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">سبب التحويل</label>
                            <select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value as TransferReason }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none">
                                {reasons.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
                            </select>
                        </div>
                        {form.reason === 'OTHER' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">تفاصيل السبب</label>
                                <input type="text" value={form.reasonOther || ''} onChange={(e) => setForm((f) => ({ ...f, reasonOther: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">ملاحظات</label>
                        <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="font-bold text-slate-800">البيان المحوّل</h2>
                        <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-xl font-medium hover:bg-violet-200"><Plus className="w-4 h-4" /> إضافة صنف</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead><tr className="bg-slate-50 border-b"><th className="px-3 py-2 text-right text-xs font-semibold">الصنف</th><th className="px-3 py-2 text-right text-xs font-semibold">الكمية *</th><th className="px-3 py-2 text-right text-xs font-semibold">اللوت</th><th /></tr></thead>
                            <tbody>
                                {form.items.map((it, idx) => (
                                    <tr key={idx} className="border-b">
                                        <td className="px-3 py-2">
                                            <select value={it.itemId || ''} onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) || 0 })} className="w-full min-w-[180px] px-2 py-1.5 border rounded" required>
                                                <option value="">اختر...</option>
                                                {items.map((i) => <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>)}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2"><input type="number" min={0} value={it.quantity || ''} onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} className="w-20 px-2 py-1 border rounded" required /></td>
                                        <td className="px-3 py-2"><input type="text" value={it.lotNumber || ''} onChange={(e) => updateItem(idx, { lotNumber: e.target.value || undefined })} placeholder="لوت" className="w-24 px-2 py-1 border rounded text-sm" /></td>
                                        <td className="px-3 py-2"><button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50">
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} حفظ إذن التحويل
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard/inventory/transfer')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default TransferNoteFormPage;
