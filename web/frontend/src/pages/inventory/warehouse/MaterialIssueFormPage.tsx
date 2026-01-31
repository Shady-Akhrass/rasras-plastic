import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle, Info, Package, Truck } from 'lucide-react';
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
    const [finalizing, setFinalizing] = useState(false);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [saleOrders, setSaleOrders] = useState<any[]>([]);
    const [stockLevels, setStockLevels] = useState<Record<number, number>>({});
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
        if (!soId) {
            setForm((f) => ({ ...f, salesOrderId: undefined, customerId: undefined, referenceNo: '', items: [] }));
            return;
        }
        const so = saleOrders.find((o) => o.id === soId);
        if (!so) return;
        const refNo = so.orderNumber || so.soNumber || `SO-${so.id}`;
        try {
            const full = await saleOrderService.getById(soId);
            const soDto = full as any;
            const orderItems = soDto?.items || [];
            const newItems = orderItems.map((i: any) => {
                const ordered = Number(i.orderedQty ?? i.qty ?? 0);
                const delivered = Number(i.deliveredQty ?? 0);
                const remaining = Math.max(0, ordered - delivered);
                return {
                    itemId: i.itemId,
                    itemNameAr: i.itemNameAr,
                    itemCode: i.itemCode,
                    soItemId: i.id,
                    requestedQty: remaining,
                    issuedQty: remaining,
                    unitId: i.unitId,
                    unitNameAr: i.unitNameAr,
                };
            });
            setForm((f) => ({
                ...f,
                salesOrderId: soId,
                customerId: soDto?.customerId ?? so.customerId,
                referenceNo: refNo,
                items: newItems.length ? newItems : f.items,
            }));
        } catch {
            setForm((f) => ({ ...f, referenceNo: refNo, salesOrderId: soId }));
        }
    };

    useEffect(() => {
        if (!isNew && id) {
            materialIssueService.getById(parseInt(id)).then((d) => {
                if (!d) return;
                setForm({
                    ...d,
                    issueNumber: (d as any).issueNoteNumber ?? d.issueNumber,
                    referenceNo: (d as any).soNumber ?? d.referenceNo,
                    issueType: (d as any).salesOrderId ? 'SALE_ORDER' : (d.issueType ?? 'SALE_ORDER'),
                    salesOrderId: (d as any).salesOrderId,
                    customerId: (d as any).customerId,
                    warehouseId: d.warehouseId,
                    items: (d.items || []).map((i: any) => ({
                        ...i,
                        soItemId: i.soItemId,
                        requestedQty: i.requestedQty ?? 0,
                        issuedQty: i.issuedQty ?? i.requestedQty ?? 0,
                    })),
                });
            }).catch(() => toast.error('فشل التحميل'));
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

            // Check stock availability when item or warehouse changes
            if ((upd.itemId || arr[idx]?.itemId) && f.warehouseId) {
                checkStockAvailability(arr[idx].itemId, f.warehouseId);
            }

            return { ...f, items: arr };
        });
    };

    const checkStockAvailability = async (itemId: number, warehouseId: number) => {
        if (!itemId || !warehouseId) return;
        try {
            // This would call an API to get stock levels
            // For now, we'll use the item's currentStock as a fallback
            const item = items.find(i => i.id === itemId);
            if (item) {
                setStockLevels(prev => ({ ...prev, [itemId]: item.currentStock || 0 }));
            }
        } catch (error) {
            console.error('Error checking stock:', error);
        }
    };

    useEffect(() => {
        if (form.warehouseId && form.items.length > 0) {
            form.items.forEach(item => {
                if (item.itemId) {
                    checkStockAvailability(item.itemId, form.warehouseId);
                }
            });
        }
    }, [form.warehouseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!form.warehouseId) {
            toast.error('الرجاء اختيار المستودع');
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
            if (item.issuedQty <= 0) {
                toast.error(`الكمية المصروفة للصنف ${item.itemNameAr || ''} يجب أن تكون أكبر من صفر`);
                return;
            }

            // Check stock availability
            const availableStock = stockLevels[item.itemId] || 0;
            if (item.issuedQty > availableStock) {
                toast.error(`الكمية المصروفة للصنف ${item.itemNameAr || ''} (${item.issuedQty}) تتجاوز المخزون المتاح (${availableStock})`);
                return;
            }
        }

        if (form.issueType === 'SALE_ORDER' && (!form.referenceNo || !form.salesOrderId || !form.customerId)) {
            toast.error('يجب اختيار أمر بيع لتحميل المرجع والبنود عند نوع الصرف "صرف لأمر بيع"');
            return;
        }

        setLoading(true);
        try {
            const payload =
                form.issueType === 'SALE_ORDER' && form.salesOrderId && form.customerId
                    ? {
                        salesOrderId: form.salesOrderId,
                        customerId: form.customerId,
                        warehouseId: form.warehouseId,
                        issuedByUserId: 1,
                        receivedByName: form.receiverName,
                        receivedById: form.receiverPhone,
                        vehicleNo: form.vehicleNo,
                        driverName: form.driverName,
                        notes: form.notes,
                        items: form.items.map((i) => ({
                            soItemId: i.soItemId,
                            itemId: i.itemId,
                            requestedQty: i.requestedQty,
                            issuedQty: i.issuedQty,
                            unitId: i.unitId,
                        })),
                    }
                    : form;

            if (isNew) {
                await materialIssueService.create(payload as any);
            } else {
                await materialIssueService.update(parseInt(id!), payload as any);
            }
            toast.success(isNew ? 'تم إنشاء إذن الصرف بنجاح' : 'تم تحديث إذن الصرف بنجاح');
            navigate('/dashboard/inventory/warehouse/issue');
        } catch (err: any) {
            if (err?.response?.status === 404 || err?.message?.includes('404')) {
                toast.error('واجهة إذن الصرف غير مفعّلة بعد. سيتم ربطها عند إضافة الـ API في الخلفية.');
            } else {
                toast.error(err?.response?.data?.message || 'فشل حفظ إذن الصرف');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (!id || id === 'new') return;
        setFinalizing(true);
        try {
            await materialIssueService.finalize(parseInt(id));
            toast.success('تم إتمام الصرف وتحديث المخزون');
            navigate('/dashboard/inventory/warehouse/issue');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إتمام الصرف');
        } finally {
            setFinalizing(false);
        }
    };

    const types: { v: IssueType; l: string }[] = [
        { v: 'SALE_ORDER', l: 'صرف لأمر بيع' },
        { v: 'PRODUCTION', l: 'صرف لأمر تشغيل' },
        { v: 'PROJECT', l: 'صرف لمشروع' },
        { v: 'INTERNAL', l: 'صرف لقسم داخلي' }
    ];

    const getStockStatus = (itemId: number, requestedQty: number) => {
        const available = stockLevels[itemId] || 0;
        if (available === 0) return { status: 'none', text: 'غير متوفر', color: 'text-rose-600 bg-rose-50' };
        if (available < requestedQty) return { status: 'low', text: `متوفر: ${available}`, color: 'text-amber-600 bg-amber-50' };
        return { status: 'ok', text: `متوفر: ${available}`, color: 'text-emerald-600 bg-emerald-50' };
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/inventory/warehouse/issue')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">إذن صرف {isNew ? 'جديد' : `#${id}`}</h1>
                    <p className="text-sm text-slate-500 mt-1">صرف مواد بناءً على أمر بيع أو أمر تشغيل معتمد</p>
                </div>
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
                                <select
                                    value={form.referenceNo ? saleOrders.find((o) => (o.orderNumber || `SO-${o.id}`) === form.referenceNo)?.id ?? '' : ''}
                                    onChange={(e) => onSaleOrderSelect(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                >
                                    <option value="">— اختر أمر بيع لتعبئة المرجع والبنود...</option>
                                    {saleOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerNameAr}</option>)}
                                </select>
                                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-amber-800">يمنع الصرف دون أمر بيع معتمد. اختيار أمر البيع يملأ رقم المرجع وبنود الصرف تلقائياً.</p>
                                    </div>
                                </div>
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
                        <div>
                            <h2 className="font-bold text-slate-800">البيان المصروف</h2>
                            <p className="text-xs text-slate-500 mt-1">يتم تطبيق نظام FIFO (الأقدم أولاً) تلقائياً عند الصرف</p>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> إضافة صنف
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="px-3 py-2 text-right text-xs font-semibold">الصنف</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">المطلوب</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">المصروف *</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">المخزون</th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold">اللوت</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {form.items.map((it, idx) => {
                                    const stockStatus = it.itemId ? getStockStatus(it.itemId, it.issuedQty) : null;
                                    return (
                                        <tr key={idx} className="border-b hover:bg-amber-50/30">
                                            <td className="px-3 py-2">
                                                <select
                                                    value={it.itemId || ''}
                                                    onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) || 0 })}
                                                    className="w-full min-w-[200px] px-2 py-1.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                                    required
                                                >
                                                    <option value="">اختر الصنف...</option>
                                                    {items.map((i) => <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>)}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step="0.001"
                                                    value={it.requestedQty || ''}
                                                    onChange={(e) => updateItem(idx, { requestedQty: parseFloat(e.target.value) || 0 })}
                                                    className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={stockLevels[it.itemId] || undefined}
                                                    step="0.001"
                                                    value={it.issuedQty || ''}
                                                    onChange={(e) => updateItem(idx, { issuedQty: parseFloat(e.target.value) || 0 })}
                                                    className={`w-24 px-2 py-1.5 border rounded-lg focus:ring-1 outline-none ${stockStatus?.status === 'none' || (it.issuedQty > (stockLevels[it.itemId] || 0))
                                                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                                                            : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500'
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
                                                    className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-sm"
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
                                <p>لا توجد أصناف. اضغط على "إضافة صنف" لإضافة صنف للصرف.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            type="submit"
                            disabled={loading || form.items.length === 0}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-500/25"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isNew ? 'حفظ إذن الصرف' : 'تحديث إذن الصرف'}
                        </button>
                        {!isNew && (form.status === 'Draft' || !form.status) && (
                            <button
                                type="button"
                                onClick={handleFinalize}
                                disabled={finalizing}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                {finalizing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                إتمام الصرف وتحديث المخزون
                            </button>
                        )}
                        {form.items.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-amber-600" />
                                <span>{form.items.length} صنف</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/inventory/warehouse/issue')}
                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaterialIssueFormPage;
