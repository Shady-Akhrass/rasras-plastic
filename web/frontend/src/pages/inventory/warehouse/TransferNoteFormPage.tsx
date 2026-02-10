import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, Package, Plus, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import transferNoteService, { type TransferNoteDto, type TransferItemDto, type TransferReason } from '../../../services/transferNoteService';
import warehouseService from '../../../services/warehouseService';
import type { WarehouseDto } from '../../../services/warehouseService';
import { itemService } from '../../../services/itemService';
import type { ItemDto } from '../../../services/itemService';
import { stockBalanceService, type StockBalanceDto } from '../../../services/stockBalanceService';
import { toast } from 'react-hot-toast';

const TransferNoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';
    const [loading, setLoading] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [sourceWarehouseBalances, setSourceWarehouseBalances] = useState<StockBalanceDto[]>([]);
    const [loadingBalances, setLoadingBalances] = useState(false);
    const [stockLevels, setStockLevels] = useState<Record<number, number>>({});
    const [form, setForm] = useState<TransferNoteDto>({
        fromWarehouseId: 0,
        toWarehouseId: 0,
        reason: 'REDISTRIBUTION',
        reasonOther: '',
        notes: '',
        transferCostAmount: undefined,
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
            transferNoteService.getById(parseInt(id)).then((d) => {
                if (!d) return;
                setForm({
                    ...d,
                    items: (d.items || []).map((i) => ({ ...i, quantity: (i as any).requestedQty ?? i.quantity ?? 0 })),
                });
            }).catch(() => toast.error('فشل التحميل'));
        }
    }, [id, isNew]);

    // عند اختيار المخزن المصدر: جلب الأصناف التي لها رصيد فيه فقط
    useEffect(() => {
        if (!form.fromWarehouseId) {
            setSourceWarehouseBalances([]);
            setStockLevels({});
            return;
        }
        setLoadingBalances(true);
        stockBalanceService.getBalancesByWarehouse(form.fromWarehouseId)
            .then((list) => {
                setSourceWarehouseBalances(list);
                const levels: Record<number, number> = {};
                (list || []).forEach((b) => {
                    const qty = b.quantityOnHand != null ? Number(b.quantityOnHand) : 0;
                    if (b.itemId != null) levels[b.itemId] = qty;
                });
                setStockLevels(levels);
            })
            .catch(() => {
                setSourceWarehouseBalances([]);
                setStockLevels({});
            })
            .finally(() => setLoadingBalances(false));
    }, [form.fromWarehouseId]);

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

    // أصناف تظهر في القائمة: الموجودة في المخزن المصدر فقط (+ الصنف المختار حالياً في السطر عند التعديل)
    const getItemOptionsForRow = (rowItemId?: number) => {
        const fromSource = sourceWarehouseBalances.map((b) => ({
            id: b.itemId,
            itemNameAr: b.itemNameAr || '',
            grade: b.grade,
            itemCode: b.itemCode || ''
        }));
        const sourceIds = new Set(sourceWarehouseBalances.map((b) => b.itemId));
        if (rowItemId && !sourceIds.has(rowItemId)) {
            const fromAll = items.find((i) => i.id === rowItemId);
            if (fromAll) fromSource.push({ id: fromAll.id!, itemNameAr: fromAll.itemNameAr, grade: fromAll.grade, itemCode: fromAll.itemCode || '' });
        }
        return fromSource;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!form.fromWarehouseId || !form.toWarehouseId) {
            toast.error('الرجاء اختيار المخزن المصدر والمخزن الهدف');
            return;
        }

        if (form.fromWarehouseId === form.toWarehouseId) {
            toast.error('المخزن المصدر والمخزن الهدف يجب أن يكونا مختلفين');
            return;
        }

        if (form.items.length === 0) {
            toast.error('يجب إضافة صنف واحد على الأقل');
            return;
        }

        // Validate items
        for (const item of form.items) {
            if (!item.itemId) {
                toast.error('الرجاء اختيار الصنف لجميع السطور');
                return;
            }
            if (item.quantity <= 0) {
                toast.error(`الكمية للصنف ${item.itemNameAr || ''} يجب أن تكون أكبر من صفر`);
                return;
            }

            // Check stock availability
            const availableStock = stockLevels[item.itemId] || 0;
            if (item.quantity > availableStock) {
                toast.error(`الكمية للصنف ${item.itemNameAr || ''} (${item.quantity}) تتجاوز المخزون المتاح في المخزن المصدر (${availableStock})`);
                return;
            }
        }

        setLoading(true);
        try {
            // استخدام المستخدم الحالي المسجّل دخوله كـ "من طلب" و "من أنشأ"
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const currentUserId = user?.id ?? user?.userId ?? 1;
            const payload = { ...form, requestedByUserId: currentUserId, createdBy: currentUserId };

            if (isNew) {
                await transferNoteService.create(payload);
                toast.success('تم إنشاء إذن التحويل بنجاح');
            } else {
                await transferNoteService.update(parseInt(id!), payload);
                toast.success('تم تحديث إذن التحويل بنجاح');
            }
            navigate('/dashboard/inventory/warehouse/transfer');
        } catch (err: any) {
            if (err?.response?.status === 404) {
                toast.error('واجهة التحويل غير مفعّلة بعد. سيتم ربطها عند إضافة الـ API في الخلفية.');
            } else {
                toast.error(err?.response?.data?.message || 'فشل حفظ إذن التحويل');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (!id || isNew) return;
        const confirm = window.confirm('هل أنت متأكد من إتمام التحويل وتحديث المخزون؟ لا يمكن التراجع بعد هذه الخطوة.');
        if (!confirm) return;

        setFinalizing(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const resUserId = user?.id || user?.userId;

            await transferNoteService.finalize(parseInt(id), resUserId);
            toast.success('تم إتمام التحويل وتحديث المخزون بنجاح');
            navigate('/dashboard/inventory/warehouse/transfer');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إتمام التحويل');
        } finally {
            setFinalizing(false);
        }
    };

    const getStockStatus = (itemId: number, requestedQty: number) => {
        const available = stockLevels[itemId] || 0;
        if (available === 0) return { status: 'none', text: 'غير متوفر', color: 'text-rose-600 bg-rose-50' };
        if (available < requestedQty) return { status: 'low', text: `متوفر: ${available}`, color: 'text-amber-600 bg-amber-50' };
        return { status: 'ok', text: `متوفر: ${available}`, color: 'text-emerald-600 bg-emerald-50' };
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
                <button onClick={() => navigate('/dashboard/inventory/warehouse/transfer')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">إذن تحويل بين مخازن {isNew ? 'جديد' : `#${id}`}</h1>
                    <p className="text-sm text-slate-500 mt-1">تحويل أصناف من مخزن إلى آخر</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">من / إلى / السبب</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">من المخزن *</label>
                            <select
                                value={form.fromWarehouseId || ''}
                                onChange={(e) => setForm((f) => ({ ...f, fromWarehouseId: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                                required
                            >
                                <option value="">اختر المخزن المصدر...</option>
                                {warehouses.filter(w => w.id !== form.toWarehouseId).map((w) => (
                                    <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">إلى المخزن *</label>
                            <select
                                value={form.toWarehouseId || ''}
                                onChange={(e) => setForm((f) => ({ ...f, toWarehouseId: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                                required
                            >
                                <option value="">اختر المخزن الهدف...</option>
                                {warehouses.filter(w => w.id !== form.fromWarehouseId).map((w) => (
                                    <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                ))}
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
                        <label className="block text-sm font-semibold text-slate-700 mb-2">تكلفة النقل (مصاريف تشغيلية)</label>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.transferCostAmount ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, transferCostAmount: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                            placeholder="0.00"
                            className="w-full max-w-xs px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">اختياري — تُسجّل كمصروف تشغيلي ولا تُضاف إلى تكلفة الصنف</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">ملاحظات</label>
                        <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <div>
                            <h2 className="font-bold text-slate-800">البيان المحوّل</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                {form.fromWarehouseId
                                    ? `الأصناف المعروضة هي الموجودة في المخزن المصدر فقط (${sourceWarehouseBalances.length} صنف)`
                                    : 'اختر المخزن المصدر أولاً لعرض الأصناف المتاحة للتحويل'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            disabled={!form.fromWarehouseId || loadingBalances}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-xl font-medium hover:bg-violet-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" /> إضافة صنف
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="px-3 py-2 text-right text-xs font-semibold">الصنف</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">الكمية *</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">المخزون</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">اللوت</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {form.items.map((it, idx) => {
                                    const stockStatus = it.itemId ? getStockStatus(it.itemId, it.quantity) : null;
                                    return (
                                        <tr key={idx} className="border-b hover:bg-violet-50/30">
                                            <td className="px-3 py-2">
                                                <select
                                                    value={it.itemId || ''}
                                                    onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) || 0 })}
                                                    className="w-full min-w-[200px] px-2 py-1.5 border border-slate-300 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                                    required
                                                    disabled={!form.fromWarehouseId || loadingBalances}
                                                >
                                                    <option value="">
                                                        {!form.fromWarehouseId
                                                            ? 'اختر المخزن المصدر أولاً...'
                                                            : loadingBalances
                                                                ? 'جاري التحميل...'
                                                                : 'اختر الصنف...'}
                                                    </option>
                                                    {getItemOptionsForRow(it.itemId).map((i) => (
                                                        <option key={i.id} value={i.id}>{i.itemNameAr} ({i.grade || i.itemCode || ''})</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={stockLevels[it.itemId] || undefined}
                                                    step="0.001"
                                                    value={it.quantity || ''}
                                                    onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                                                    className={`w-24 px-2 py-1.5 border rounded-lg focus:ring-1 outline-none ${stockStatus?.status === 'none' || (it.quantity > (stockLevels[it.itemId] || 0))
                                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                                        : 'border-slate-300 focus:border-violet-500 focus:ring-violet-500'
                                                        }`}
                                                    required
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                {it.itemId && stockStatus ? (
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${stockStatus.color}`}>
                                                        {stockStatus.text}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={it.lotNumber || ''}
                                                    onChange={(e) => updateItem(idx, { lotNumber: e.target.value || undefined })}
                                                    placeholder="رقم اللوت"
                                                    className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {form.items.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>لا توجد أصناف. اضغط على "إضافة صنف" لإضافة صنف للتحويل.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            type="submit"
                            disabled={loading || form.items.length === 0}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-violet-500/25"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isNew ? 'حفظ إذن التحويل' : 'تحديث إذن التحويل'}
                        </button>
                        {!isNew && (form.status === 'Draft' || !form.status) && (
                            <button
                                type="button"
                                onClick={handleFinalize}
                                disabled={finalizing || form.items.length === 0}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                {finalizing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                إتمام التحويل وتحديث المخزون
                            </button>
                        )}
                        {form.items.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-violet-600" />
                                <span>{form.items.length} صنف</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/inventory/warehouse/transfer')}
                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransferNoteFormPage;
