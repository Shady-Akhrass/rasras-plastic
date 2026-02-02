import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronRight, Save, Truck,
    RefreshCw, CheckCircle, Info, DollarSign
} from 'lucide-react';
import { grnService, type GoodsReceiptNoteDto, type GRNItemDto } from '../../../services/grnService';
import { purchaseOrderService, type PurchaseOrderDto, type PurchaseOrderItemDto } from '../../../services/purchaseOrderService';
import warehouseService from '../../../services/warehouseService';
import type { WarehouseDto, WarehouseLocationDto } from '../../../services/warehouseService';
import { toast } from 'react-hot-toast';

/**
 * تم دمج هذه الصفحة مع صفحة GRN الموحدة في قسم المشتريات
 * يتم إعادة التوجيه تلقائياً إلى /dashboard/procurement/grn
 */
const GRNFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [pos, setPos] = useState<PurchaseOrderDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [selectedPo, setSelectedPo] = useState<PurchaseOrderDto | null>(null);
    const [locations, setLocations] = useState<WarehouseLocationDto[]>([]);

    const [form, setForm] = useState<Partial<GoodsReceiptNoteDto> & { items: GRNItemDto[] }>({
        poId: 0,
        supplierId: 0,
        warehouseId: 0,
        deliveryNoteNo: '',
        supplierInvoiceNo: '',
        notes: '',
        items: []
    });

    const [rows, setRows] = useState<Record<number, { receivedQty: number; acceptedQty?: number; lotNumber?: string; manufactureDate?: string; expiryDate?: string; locationId?: number; notes?: string }>>({});

    const user = (() => {
        try {
            const s = localStorage.getItem('user');
            return s ? JSON.parse(s) : null;
        } catch { return null; }
    })();
    const receivedByUserId = user?.id ?? user?.userId ?? 1;

    useEffect(() => {
        (async () => {
            try {
                const [poRes, whRes] = await Promise.all([
                    purchaseOrderService.getAllPOs(),
                    warehouseService.getAll()
                ]);
                const poList = Array.isArray(poRes) ? poRes : (poRes as any)?.data ?? [];
                const whList = (whRes as any)?.data ?? (whRes as any) ?? [];
                setPos(poList.filter((p: PurchaseOrderDto) => p.status !== 'Closed'));
                setWarehouses(Array.isArray(whList) ? whList : []);
            } catch (e) {
                toast.error('فشل تحميل البيانات');
            }
        })();
    }, []);

    useEffect(() => {
        if (!isNew && id) {
            (async () => {
                try {
                    const g = await grnService.getGRNById(parseInt(id));
                    if (g) {
                        setForm({ ...g, items: g.items || [] });
                        setSelectedPo({
                            supplierId: g.supplierId!,
                            supplierNameAr: g.supplierNameAr,
                            items: g.items || [],
                            subTotal: 0,
                            totalAmount: 0
                        } as unknown as PurchaseOrderDto);
                    }
                } catch {
                    toast.error('فشل تحميل إذن الإضافة');
                }
            })();
        }
    }, [id, isNew]);

    useEffect(() => {
        if (form.warehouseId) {
            (async () => {
                try {
                    const r = await warehouseService.getById(form.warehouseId!);
                    const dto = (r as any)?.data ?? r;
                    setLocations(dto?.locations ?? []);
                } catch {
                    setLocations([]);
                }
            })();
        } else {
            setLocations([]);
        }
    }, [form.warehouseId]);

    const handleSelectPo = async (poId: number) => {
        if (!poId) {
            setSelectedPo(null);
            setForm((f) => ({ ...f, poId: 0, supplierId: 0, supplierNameAr: undefined, items: [] }));
            setRows({});
            return;
        }
        try {
            const po = await purchaseOrderService.getPOById(poId);
            setSelectedPo(po);
            setForm((f) => ({
                ...f,
                poId: po.id!,
                poNumber: po.poNumber,
                supplierId: po.supplierId,
                supplierNameAr: po.supplierNameAr,
                items: (po.items || []).map((i: PurchaseOrderItemDto) => {
                    const rem = (Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0);
                    if (rem <= 0) return null;
                    return {
                        poItemId: i.id!,
                        itemId: i.itemId,
                        itemNameAr: i.itemNameAr,
                        orderedQty: Number(i.orderedQty) || 0,
                        receivedQty: rem,
                        unitId: i.unitId,
                        unitNameAr: i.unitNameAr,
                        unitCost: Number(i.unitPrice) || 0
                    } as GRNItemDto;
                }).filter(Boolean) as GRNItemDto[]
            }));
            const r: Record<number, { receivedQty: number; acceptedQty?: number; lotNumber?: string; manufactureDate?: string; expiryDate?: string; locationId?: number; notes?: string }> = {};
            (po.items || []).forEach((i: PurchaseOrderItemDto) => {
                const rem = (Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0);
                if (rem > 0 && i.id) r[i.id] = { receivedQty: rem, acceptedQty: rem };
            });
            setRows(r);
        } catch {
            toast.error('فشل تحميل أمر الشراء');
        }
    };

    const updateRow = (poItemId: number, upd: Partial<typeof rows[0]>) => {
        setRows((r) => ({ ...r, [poItemId]: { ...r[poItemId], ...upd } }));
    };

    const buildItems = (): GRNItemDto[] => {
        if (!selectedPo?.items) return [];
        return selectedPo.items
            .filter((i) => i.id && ((Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0)) > 0)
            .map((i) => {
                const r = rows[i.id!] || {};
                const receivedQty = Number(r.receivedQty) || 0;
                const unitCost = Number(i.unitPrice) || 0;
                return {
                    poItemId: i.id!,
                    itemId: i.itemId,
                    itemNameAr: i.itemNameAr,
                    orderedQty: Number(i.orderedQty) || 0,
                    receivedQty,
                    acceptedQty: r.acceptedQty ?? receivedQty,
                    unitId: i.unitId,
                    unitNameAr: i.unitNameAr,
                    unitCost,
                    totalCost: receivedQty * unitCost,
                    lotNumber: r.lotNumber || undefined,
                    manufactureDate: r.manufactureDate || undefined,
                    expiryDate: r.expiryDate || undefined,
                    locationId: r.locationId || undefined,
                    notes: r.notes || undefined
                } as GRNItemDto;
            })
            .filter((it) => it.receivedQty > 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!form.poId || !form.supplierId || !form.warehouseId) {
            toast.error('الرجاء اختيار أمر الشراء والمستودع');
            return;
        }

        const items = buildItems();
        if (items.length === 0) {
            toast.error('يجب إضافة صنف واحد على الأقل بكمية مستلمة');
            return;
        }

        // Validate items
        for (const item of items) {
            if (item.receivedQty <= 0) {
                toast.error(`الكمية المستلمة للصنف ${item.itemNameAr} يجب أن تكون أكبر من صفر`);
                return;
            }
            if (item.receivedQty > item.orderedQty) {
                toast.error(`الكمية المستلمة للصنف ${item.itemNameAr} لا يمكن أن تتجاوز الكمية المطلوبة`);
                return;
            }
            if (item.acceptedQty && item.acceptedQty > item.receivedQty) {
                toast.error(`الكمية المقبولة للصنف ${item.itemNameAr} لا يمكن أن تتجاوز الكمية المستلمة`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload: GoodsReceiptNoteDto = {
                poId: form.poId,
                supplierId: form.supplierId,
                warehouseId: form.warehouseId,
                deliveryNoteNo: form.deliveryNoteNo || undefined,
                supplierInvoiceNo: form.supplierInvoiceNo || undefined,
                receivedByUserId,
                notes: form.notes || undefined,
                items
            };
            await grnService.createGRN(payload);
            toast.success('تم إنشاء إذن الإضافة بنجاح');
            navigate('/dashboard/inventory/warehouse/grn');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل حفظ إذن الإضافة');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totals = React.useMemo(() => {
        const items = buildItems();
        const totalQty = items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);
        const totalCost = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        return { totalQty, totalCost, itemCount: items.length };
    }, [rows, selectedPo]);

    if (!isNew && id) {
        const g = form as GoodsReceiptNoteDto;
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard/inventory/warehouse/grn')} className="p-2 hover:bg-slate-100 rounded-xl">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">عرض إذن الإضافة {g.grnNumber}</h1>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-xs text-slate-500">رقم الإذن</p><p className="font-bold">{g.grnNumber}</p></div>
                        <div><p className="text-xs text-slate-500">التاريخ</p><p>{g.grnDate ? new Date(g.grnDate).toLocaleDateString('ar-EG') : '—'}</p></div>
                        <div><p className="text-xs text-slate-500">أمر الشراء</p><p>{g.poNumber}</p></div>
                        <div><p className="text-xs text-slate-500">المورد</p><p>{g.supplierNameAr}</p></div>
                    </div>
                    <div className="border-t pt-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">البنود</p>
                        <table className="w-full text-sm">
                            <thead><tr className="border-b"><th className="text-right py-2">الصنف</th><th className="text-right py-2">المطلوب</th><th className="text-right py-2">المستلم</th><th className="text-right py-2">الوحدة</th></tr></thead>
                            <tbody>
                                {(g.items || []).map((it) => (
                                    <tr key={it.poItemId} className="border-b">
                                        <td className="py-2">{it.itemNameAr}</td>
                                        <td className="py-2">{it.orderedQty}</td>
                                        <td className="py-2">{it.receivedQty}</td>
                                        <td className="py-2">{it.unitNameAr}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    const maxRem = (i: PurchaseOrderItemDto) => (Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0);

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/inventory/warehouse/grn')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronRight className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">إذن إضافة جديد (GRN)</h1>
                    <p className="text-sm text-slate-500 mt-1">استلام المواد بعد موافقة الجودة وربطها بأمر الشراء</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">البيانات الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">أمر الشراء *</label>
                            <select
                                value={form.poId || ''}
                                onChange={(e) => handleSelectPo(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                required
                            >
                                <option value="">اختر أمر الشراء...</option>
                                {pos.map((p) => (
                                    <option key={p.id} value={p.id}>{p.poNumber} — {p.supplierNameAr}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">المستودع *</label>
                            <select
                                value={form.warehouseId || ''}
                                onChange={(e) => setForm((f) => ({ ...f, warehouseId: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                required
                            >
                                <option value="">اختر المستودع...</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">رقم بوليصة الشحن</label>
                            <input
                                type="text"
                                value={form.deliveryNoteNo || ''}
                                onChange={(e) => setForm((f) => ({ ...f, deliveryNoteNo: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">رقم الفاتورة (المورد)</label>
                            <input
                                type="text"
                                value={form.supplierInvoiceNo || ''}
                                onChange={(e) => setForm((f) => ({ ...f, supplierInvoiceNo: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">ملاحظات</label>
                        <textarea
                            value={form.notes || ''}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none"
                        />
                    </div>
                </div>

                {selectedPo && (
                    <>
                        {/* Supplier Info Card */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Truck className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-emerald-900">معلومات المورد</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-emerald-600 mb-1">اسم المورد</p>
                                    <p className="font-semibold text-slate-800">{form.supplierNameAr || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-600 mb-1">رقم أمر الشراء</p>
                                    <p className="font-semibold text-slate-800">{form.poNumber || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-600 mb-1">عدد الأصناف</p>
                                    <p className="font-semibold text-slate-800">{selectedPo.items?.filter(i => maxRem(i) > 0).length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-emerald-600 mb-1">إجمالي الكمية</p>
                                    <p className="font-semibold text-slate-800">{totals.totalQty.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6 overflow-x-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800">البنود — الكمية المستلمة، اللوت، التاريخ، الموقع</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Info className="w-4 h-4" />
                                    <span>يتم تطبيق نظام FIFO تلقائياً عند التخزين</span>
                                </div>
                            </div>
                            <table className="w-full min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b">
                                        <th className="px-3 py-2 text-right text-xs font-semibold">الصنف</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">المتبقي</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">المستلم *</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">مقبول</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">اللوت</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">تاريخ الإنتاج</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">الصلاحية</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">الموقع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPo.items
                                        ?.filter((i) => maxRem(i) > 0)
                                        .map((i) => (
                                            <tr key={i.id} className="border-b">
                                                <td className="px-3 py-2">{i.itemNameAr}</td>
                                                <td className="px-3 py-2">{maxRem(i)}</td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={maxRem(i)}
                                                        step="0.001"
                                                        value={rows[i.id!]?.receivedQty ?? maxRem(i)}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            updateRow(i.id!, {
                                                                receivedQty: val,
                                                                acceptedQty: val
                                                            });
                                                        }}
                                                        className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={rows[i.id!]?.receivedQty ?? maxRem(i)}
                                                        step="0.001"
                                                        value={rows[i.id!]?.acceptedQty ?? rows[i.id!]?.receivedQty ?? maxRem(i)}
                                                        onChange={(e) => updateRow(i.id!, { acceptedQty: parseFloat(e.target.value) || 0 })}
                                                        className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={rows[i.id!]?.lotNumber || ''}
                                                        onChange={(e) => updateRow(i.id!, { lotNumber: e.target.value || undefined })}
                                                        placeholder="رقم اللوت"
                                                        className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="date"
                                                        value={rows[i.id!]?.manufactureDate || ''}
                                                        onChange={(e) => updateRow(i.id!, { manufactureDate: e.target.value || undefined })}
                                                        className="w-36 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="date"
                                                        value={rows[i.id!]?.expiryDate || ''}
                                                        onChange={(e) => updateRow(i.id!, { expiryDate: e.target.value || undefined })}
                                                        className="w-36 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={rows[i.id!]?.locationId || ''}
                                                        onChange={(e) => updateRow(i.id!, { locationId: e.target.value ? parseInt(e.target.value) : undefined })}
                                                        className="w-32 px-2 py-1.5 border border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                                                    >
                                                        <option value="">اختر الموقع</option>
                                                        {locations.map((l) => (
                                                            <option key={l.id} value={l.id}>{l.locationCode} {l.locationNameAr ? `- ${l.locationNameAr}` : ''}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Card */}
                        <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">عدد الأصناف</p>
                                    <p className="text-lg font-bold text-slate-800">{totals.itemCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">إجمالي الكمية</p>
                                    <p className="text-lg font-bold text-emerald-600">{totals.totalQty.toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">إجمالي التكلفة</p>
                                    <p className="text-lg font-bold text-slate-800 flex items-center justify-center gap-1">
                                        <DollarSign className="w-4 h-4" />
                                        {totals.totalCost.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500 mb-1">متوسط التكلفة</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {totals.totalQty > 0
                                            ? (totals.totalCost / totals.totalQty).toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                            : '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={loading || totals.itemCount === 0}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/25"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            حفظ إذن الإضافة
                        </button>
                        {totals.itemCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>{totals.itemCount} صنف جاهز للحفظ</span>
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/inventory/warehouse/grn')}
                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GRNFormPage;
