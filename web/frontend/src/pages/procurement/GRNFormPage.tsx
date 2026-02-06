import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save, ArrowRight, Package, Info, Hash, FileText,
    Truck, ClipboardCheck, AlertCircle, Building2, CheckCircle2,
    RefreshCw, Layers, CheckCircle, Eye, XCircle
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import { grnService, type GoodsReceiptNoteDto, type GRNItemDto } from '../../services/grnService';
import { purchaseOrderService, type PurchaseOrderDto, type PurchaseOrderItemDto } from '../../services/purchaseOrderService';
import warehouseService from '../../services/warehouseService';
import type { WarehouseDto, WarehouseLocationDto } from '../../services/warehouseService';
import toast from 'react-hot-toast';

/**
 * واجهة موحدة لإذن الإضافة (GRN) - Goods Receipt Note
 * تجمع بين دورة المشتريات ودورة المخزن
 * - اختيار أمر الشراء (PO)
 * - تحديد المخزن والموقع
 * - تسجيل اللوت وتاريخ الإنتاج/الصلاحية
 * - تحديث الأرصدة تلقائياً عند الاعتماد
 */

const GRNFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = !id || id === 'new';
    const queryParams = new URLSearchParams(location.search);
    const preselectedPoId = queryParams.get('poId');
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    // Data State
    const [saving, setSaving] = useState(false);
    const [pos, setPos] = useState<PurchaseOrderDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [locations, setLocations] = useState<WarehouseLocationDto[]>([]);
    const [processing, setProcessing] = useState(false);
    const [selectedPo, setSelectedPo] = useState<PurchaseOrderDto | null>(null);

    // Form State
    const [form, setForm] = useState<Partial<GoodsReceiptNoteDto> & { items: GRNItemDto[] }>({
        poId: 0,
        supplierId: 0,
        warehouseId: 0,
        deliveryNoteNo: '',
        supplierInvoiceNo: '',
        notes: '',
        items: []
    });

    // Row-level state for each item (lot, dates, location, quantities)
    const [rows, setRows] = useState<Record<number, {
        receivedQty: number;
        acceptedQty?: number;
        lotNumber?: string;
        manufactureDate?: string;
        expiryDate?: string;
        locationId?: number;
        notes?: string;
    }>>({});

    // Get current user
    const user = useMemo(() => {
        try {
            const s = localStorage.getItem('user');
            return s ? JSON.parse(s) : null;
        } catch { return null; }
    }, []);
    const receivedByUserId = user?.id ?? user?.userId ?? 1;

    // Load initial data
    useEffect(() => {
        (async () => {
            try {
                const [poRes, whRes] = await Promise.all([
                    purchaseOrderService.getAllPOs(),
                    warehouseService.getAll()
                ]);
                const poList = Array.isArray(poRes) ? poRes : (poRes as any)?.data ?? [];
                const whList = (whRes as any)?.data ?? (whRes as any) ?? [];
                // Show only POs that are not closed
                setPos(poList.filter((p: PurchaseOrderDto) => p.status !== 'Closed'));
                setWarehouses(Array.isArray(whList) ? whList : []);
            } catch (e) {
                toast.error('فشل تحميل البيانات');
            }
        })();
    }, []);

    // Load existing GRN for view/edit mode
    useEffect(() => {
        if (!isNew && id) {
            (async () => {
                try {
                    const g = await grnService.getGRNById(parseInt(id));
                    if (g) {
                        setForm({ ...g, items: g.items || [] });
                        // Use a partial PO structure for display purposes
                        setSelectedPo({
                            supplierId: g.supplierId!,
                            supplierNameAr: g.supplierNameAr,
                            items: (g.items || []).map(item => ({
                                ...item,
                                unitPrice: item.unitCost || 0,
                                totalPrice: item.totalCost || 0
                            })),
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

    // Load preselected PO from query param
    useEffect(() => {
        if (preselectedPoId && isNew && pos.length > 0) {
            handleSelectPo(parseInt(preselectedPoId));
        }
    }, [preselectedPoId, isNew, pos]);

    // Load warehouse locations when warehouse changes
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

    // Handle PO selection
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
            // Initialize row state
            const r: Record<number, any> = {};
            (po.items || []).forEach((i: PurchaseOrderItemDto) => {
                const rem = (Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0);
                if (rem > 0 && i.id) r[i.id] = { receivedQty: rem, acceptedQty: rem };
            });
            setRows(r);
        } catch {
            toast.error('فشل تحميل أمر الشراء');
        }
    };

    /** فحص المدخلات قبل التحديث */
    const validateRowUpdate = (
        poItemId: number,
        upd: Partial<typeof rows[0]>,
        item: PurchaseOrderItemDto
    ): { valid: boolean; error?: string } => {
        const max = maxRem(item);
        const current = rows[poItemId] || { receivedQty: max, acceptedQty: max };

        if (upd.receivedQty !== undefined) {
            const val = Number(upd.receivedQty);
            if (isNaN(val) || val < 0) return { valid: false, error: 'الكمية المستلمة يجب أن تكون صفر أو أكبر' };
            if (val > max) return { valid: false, error: `الكمية المستلمة لا تتجاوز ${max} (المتبقي في أمر الشراء)` };
        }

        if (upd.acceptedQty !== undefined) {
            const received = upd.receivedQty ?? current.receivedQty ?? max;
            const accepted = Number(upd.acceptedQty);
            if (isNaN(accepted) || accepted < 0) return { valid: false, error: 'الكمية المقبولة يجب أن تكون صفر أو أكبر' };
            if (accepted > received) return { valid: false, error: 'الكمية المقبولة لا تتجاوز الكمية المستلمة' };
        }

        const currentRow = rows[poItemId] || {};
        const mDate = upd.manufactureDate ?? currentRow.manufactureDate;
        const eDate = upd.expiryDate ?? currentRow.expiryDate;
        if (mDate && eDate) {
            const m = new Date(mDate).getTime();
            const e = new Date(eDate).getTime();
            if (!isNaN(m) && !isNaN(e) && m > e) return { valid: false, error: 'تاريخ الإنتاج يجب أن يكون قبل تاريخ الصلاحية' };
        }

        return { valid: true };
    };

    // Update row data (مع فحص المدخلات)
    const updateRow = (poItemId: number, upd: Partial<typeof rows[0]>, item?: PurchaseOrderItemDto) => {
        const poItem = item ?? selectedPo?.items?.find((i) => i.id === poItemId);
        if (poItem) {
            const { valid, error } = validateRowUpdate(poItemId, upd, poItem);
            if (!valid) {
                toast.error(error || 'خطأ في التحقق من المدخلات');
                return;
            }
        }
        setRows((r) => ({ ...r, [poItemId]: { ...r[poItemId], ...upd } }));
    };

    // Build items array for submission
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

    // Calculate totals
    const totals = useMemo(() => {
        const items = buildItems();
        const totalQty = items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);
        const totalCost = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        return { totalQty, totalCost, itemCount: items.length };
    }, [rows, selectedPo]);

    // Max remaining quantity for a PO item
    const maxRem = (i: PurchaseOrderItemDto) => (Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!form.poId || !form.supplierId) {
            toast.error('الرجاء اختيار أمر الشراء');
            return;
        }
        if (!form.warehouseId) {
            toast.error('الرجاء اختيار المستودع');
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

        setSaving(true);
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
            toast.success('تم إنشاء إذن الإضافة بنجاح وتحديث أرصدة المخزون');
            navigate('/dashboard/procurement/grn');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل حفظ إذن الإضافة');
        } finally {
            setSaving(false);
        }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
            navigate('/dashboard/procurement/approvals');
        } catch (error) {
            console.error('Failed to take action:', error);
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessing(false);
        }
    };

    // View mode for existing GRN
    if (!isNew && id) {
        const g = form as GoodsReceiptNoteDto;
        return (
            <div className="space-y-6 pb-20" dir="rtl">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="relative flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/procurement/grn')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <ClipboardCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إذن الإضافة {g.grnNumber}</h1>
                            <p className="text-white/80 text-lg">عرض تفاصيل إذن الإضافة</p>
                        </div>
                    </div>
                    {isView && (
                        <div className="flex items-center gap-3">
                            {approvalId && (
                                <>
                                    <button
                                        onClick={() => handleApprovalAction('Approved')}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl 
                                            font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        <span>اعتماد</span>
                                    </button>
                                    <button
                                        onClick={() => handleApprovalAction('Rejected')}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl 
                                            font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                        <span>رفض</span>
                                    </button>
                                </>
                            )}
                            <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm whitespace-nowrap">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold">وضع العرض فقط</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs text-slate-500 mb-1">رقم الإذن</p>
                            <p className="font-bold text-lg">{g.grnNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">التاريخ</p>
                            <p className="font-semibold">{g.grnDate ? new Date(g.grnDate).toLocaleDateString('ar-EG') : '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">أمر الشراء</p>
                            <p className="font-semibold">{g.poNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">المورد</p>
                            <p className="font-semibold">{g.supplierNameAr}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">رقم بوليصة الشحن</p>
                            <p className="font-semibold">{g.deliveryNoteNo || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 mb-1">رقم فاتورة المورد</p>
                            <p className="font-semibold">{g.supplierInvoiceNo || '—'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-slate-500 mb-1">ملاحظات</p>
                            <p className="font-semibold">{g.notes || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg">البنود المستلمة</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="text-right py-3 px-4">الصنف</th>
                                    <th className="text-right py-3 px-4">المطلوب</th>
                                    <th className="text-right py-3 px-4">المستلم</th>
                                    <th className="text-right py-3 px-4">المقبول</th>
                                    <th className="text-right py-3 px-4">الوحدة</th>
                                    <th className="text-right py-3 px-4">اللوت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(g.items || []).map((it) => (
                                    <tr key={it.poItemId} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4 font-semibold">{it.itemNameAr}</td>
                                        <td className="py-3 px-4">{it.orderedQty}</td>
                                        <td className="py-3 px-4 text-brand-primary font-bold">{it.receivedQty}</td>
                                        <td className="py-3 px-4">{it.acceptedQty || it.receivedQty}</td>
                                        <td className="py-3 px-4">{it.unitNameAr}</td>
                                        <td className="py-3 px-4 text-slate-500">{it.lotNumber || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Create/Edit form
    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/procurement/grn')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <ClipboardCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">إذن إضافة جديد (GRN)</h1>
                            <p className="text-white/80 text-lg">استلام المواد من المورد وتحديث أرصدة المخزون</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || totals.itemCount === 0}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl 
                            font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                            disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {saving ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ إذن الإضافة'}</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Data Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">أمر الشراء والمستودع والمستندات المرجعية</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Hash className="w-4 h-4 text-brand-primary" />
                                    أمر الشراء *
                                </label>
                                <select
                                    value={form.poId || ''}
                                    onChange={(e) => handleSelectPo(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                    required
                                >
                                    <option value="">اختر أمر الشراء...</option>
                                    {pos.map((p) => (
                                        <option key={p.id} value={p.id}>{p.poNumber} — {p.supplierNameAr}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Building2 className="w-4 h-4 text-brand-primary" />
                                    المستودع المستلم *
                                </label>
                                <select
                                    value={form.warehouseId || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, warehouseId: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                    required
                                >
                                    <option value="">اختر المستودع...</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    رقم بوليصة الشحن
                                </label>
                                <input
                                    type="text"
                                    value={form.deliveryNoteNo || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, deliveryNoteNo: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                    placeholder="DN-XXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    رقم فاتورة المورد
                                </label>
                                <input
                                    type="text"
                                    value={form.supplierInvoiceNo || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, supplierInvoiceNo: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                    placeholder="INV-XXX"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Info className="w-4 h-4 text-brand-primary" />
                                    ملاحظات
                                </label>
                                <textarea
                                    value={form.notes || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold resize-none"
                                    placeholder="أي ملاحظات إضافية..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Supplier Info Banner */}
                    {selectedPo && (
                        <div className="bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 rounded-2xl border-2 border-brand-primary/20 p-5 animate-slide-in"
                            style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Truck className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h3 className="font-bold text-slate-900">معلومات المورد وأمر الشراء</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-brand-primary mb-1">اسم المورد</p>
                                    <p className="font-semibold text-slate-800">{form.supplierNameAr || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-brand-primary mb-1">رقم أمر الشراء</p>
                                    <p className="font-semibold text-slate-800">{form.poNumber || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-brand-primary mb-1">عدد الأصناف المتبقية</p>
                                    <p className="font-semibold text-slate-800">{selectedPo.items?.filter(i => maxRem(i) > 0).length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-brand-primary mb-1">إجمالي التكلفة</p>
                                    <p className="font-semibold text-slate-800">{totals.totalCost.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Items Table */}
                    {selectedPo && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                            style={{ animationDelay: '150ms' }}>
                            <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 rounded-xl">
                                            <Package className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">البنود المستلمة</h3>
                                            <p className="text-slate-500 text-sm">الكميات، اللوت، تاريخ الإنتاج، الموقع داخل المخزن</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-xl">
                                        <Layers className="w-4 h-4 text-brand-primary" />
                                        <span className="text-sm font-bold text-brand-primary">نظام FIFO مفعّل</span>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
                                            <th className="py-4 pr-6 text-right">الصنف</th>
                                            <th className="py-4 px-3 text-center">المتبقي</th>
                                            <th className="py-4 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                                                    المستلم *
                                                </div>
                                            </th>
                                            <th className="py-4 px-3 text-center">المقبول</th>
                                            <th className="py-4 px-3 text-center">اللوت</th>
                                            <th className="py-4 px-3 text-center">تاريخ الإنتاج</th>
                                            <th className="py-4 px-3 text-center">الصلاحية</th>
                                            <th className="py-4 pl-6 text-center">الموقع</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedPo.items
                                            ?.filter((i) => maxRem(i) > 0)
                                            .map((i) => (
                                                <tr key={i.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4 pr-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${(rows[i.id!]?.receivedQty || 0) > 0 ? 'bg-brand-primary' : 'bg-slate-300'
                                                                }`} />
                                                            <span className="font-bold text-slate-800">{i.itemNameAr}</span>
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1 mr-5">{i.unitNameAr}</div>
                                                    </td>
                                                    <td className="py-4 px-3 text-center">
                                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-semibold text-sm">
                                                            {maxRem(i)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={maxRem(i)}
                                                            step="0.001"
                                                            value={rows[i.id!]?.receivedQty ?? maxRem(i)}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                updateRow(i.id!, { receivedQty: val, acceptedQty: val }, i);
                                                            }}
                                                            className="w-24 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                                text-sm text-center font-bold text-brand-primary outline-none 
                                                                focus:border-brand-primary transition-all"
                                                        />
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={rows[i.id!]?.receivedQty ?? maxRem(i)}
                                                            step="0.001"
                                                            value={rows[i.id!]?.acceptedQty ?? rows[i.id!]?.receivedQty ?? maxRem(i)}
                                                            onChange={(e) => updateRow(i.id!, { acceptedQty: parseFloat(e.target.value) || 0 }, i)}
                                                            disabled={isView}
                                                            className={`w-24 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                                text-sm text-center font-bold outline-none 
                                                                focus:border-brand-primary transition-all"
                                                        />
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <input
                                                            type="text"
                                                            value={rows[i.id!]?.lotNumber || ''}
                                                            onChange={(e) => updateRow(i.id!, { lotNumber: e.target.value.trim() || undefined })}
                                                            placeholder="LOT-XXX"
                                                            className="w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                                text-sm text-center outline-none focus:border-brand-primary transition-all"
                                                        />
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <input
                                                            type="date"
                                                            value={rows[i.id!]?.manufactureDate || ''}
                                                            onChange={(e) => updateRow(i.id!, { manufactureDate: e.target.value || undefined })}
                                                            className="w-36 px-2 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                                text-sm outline-none focus:border-brand-primary transition-all"
                                                        />
                                                    </td>
                                                    <td className="py-4 px-3">
                                                        <input
                                                            type="date"
                                                            value={rows[i.id!]?.expiryDate || ''}
                                                            onChange={(e) => updateRow(i.id!, { expiryDate: e.target.value || undefined }, i)}
                                                            className="w-36 px-2 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                                text-sm outline-none focus:border-brand-primary transition-all"
                                                        />
                                                    </td>
                                                    <td className="py-4 pl-6">
                                                        <select
                                                            value={rows[i.id!]?.locationId || ''}
                                                            onChange={(e) => updateRow(i.id!, { locationId: e.target.value ? parseInt(e.target.value) : undefined })}
                                                            className="w-32 px-2 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                                text-sm outline-none focus:border-brand-primary transition-all"
                                                        >
                                                            <option value="">اختر الموقع</option>
                                                            {locations.map((l) => (
                                                                <option key={l.id} value={l.id}>
                                                                    {l.locationCode} {l.locationName ? `- ${l.locationName}` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            {(!selectedPo.items || selectedPo.items.filter(i => maxRem(i) > 0).length === 0) && (
                                <div className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 font-semibold">لا توجد أصناف متبقية للاستلام في أمر الشراء هذا</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {!selectedPo && (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center animate-slide-in">
                            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                                <Package className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-600 mb-2">اختر أمر الشراء</h3>
                            <p className="text-slate-400">اختر أمر شراء من القائمة أعلاه لعرض الأصناف المتبقية للاستلام</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 
                        rounded-3xl p-6 text-white shadow-2xl animate-slide-in sticky top-6"
                        style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <ClipboardCheck className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h3 className="font-bold text-xl">ملخص الاستلام</h3>
                        </div>
                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">عدد الأصناف</span>
                                <span className="font-bold text-lg">{totals.itemCount}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">إجمالي الكميات</span>
                                <span className="font-bold text-lg text-brand-primary">{totals.totalQty.toLocaleString()}</span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">إجمالي التكلفة</div>
                                <div className="text-3xl font-black text-brand-primary">
                                    {totals.totalCost.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                    <span className="text-sm font-bold mr-2">ج.م</span>
                                </div>
                            </div>
                        </div>
                        {totals.itemCount > 0 && (
                            <div className="mt-6 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-brand-primary">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-semibold">{totals.itemCount} صنف جاهز للحفظ</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Alert */}
                    <div className="p-5 bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 rounded-2xl border-2 border-brand-primary/20 
                        flex gap-4 animate-slide-in shadow-lg"
                        style={{ animationDelay: '300ms' }}>
                        <div className="p-3 bg-brand-primary/10 rounded-xl h-fit">
                            <AlertCircle className="w-6 h-6 text-brand-primary" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">معلومة هامة</h4>
                            <p className="text-sm leading-relaxed text-brand-primary">
                                سيتم <strong>تحديث أرصدة المخزون تلقائياً</strong> فور حفظ إذن الإضافة.
                                تأكد من صحة الكميات والمواقع قبل الحفظ.
                            </p>
                        </div>
                    </div>

                    {/* FIFO Info */}
                    <div className="p-5 bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 rounded-2xl border-2 border-brand-primary/20 
                        flex gap-4 animate-slide-in"
                        style={{ animationDelay: '350ms' }}>
                        <div className="p-3 bg-blue-100 rounded-xl h-fit">
                            <Layers className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-800 mb-2">نظام FIFO</h4>
                            <p className="text-sm leading-relaxed text-blue-700">
                                يتم تسجيل اللوت وتاريخ الإنتاج لتطبيق نظام <strong>FIFO</strong> (الأقدم يُصرف أولاً) عند الصرف.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GRNFormPage;
