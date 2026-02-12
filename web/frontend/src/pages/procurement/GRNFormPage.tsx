import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save, ArrowRight, Package, Info, Hash, FileText,
    Truck, ClipboardCheck, AlertCircle, Building2, CheckCircle2,
    RefreshCw, Layers, CheckCircle, Eye, XCircle, Archive, Bell, Lock
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import { grnService, type GoodsReceiptNoteDto, type GRNItemDto } from '../../services/grnService';
import { purchaseOrderService, type PurchaseOrderDto, type PurchaseOrderItemDto } from '../../services/purchaseOrderService';
import purchaseService from '../../services/purchaseService';
import warehouseService from '../../services/warehouseService';
import type { WarehouseDto, WarehouseLocationDto } from '../../services/warehouseService';
import { formatNumber, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

const GRNFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = !id || id === 'new';
    const queryParams = new URLSearchParams(location.search);
    const preselectedPoId = queryParams.get('poId');
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    // Determine if form is read-only
    const isReadOnly = isView || !isNew;


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
        shippingCost: 0,
        otherCosts: 0,
        notes: '',
        items: []
    });

    // Allow warehouse edit if in approval mode and not completed
    const canEditWarehouse = !isReadOnly || (isView && !!approvalId && form.status !== 'Completed');

    // Row-level state
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
                const finalWhList = Array.isArray(whList) ? whList : [];
                setPos(poList.filter((p: PurchaseOrderDto) => p.status !== 'Closed'));
                setWarehouses(finalWhList);

                if (finalWhList.length === 1 && isNew) {
                    setForm(prev => ({ ...prev, warehouseId: finalWhList[0].id }));
                }
            } catch (e) {
                toast.error('فشل تحميل البيانات');
            }
        })();
    }, [isNew]);

    // Load existing GRN
    useEffect(() => {
        if (!isNew && id) {
            (async () => {
                try {
                    const g = await grnService.getGRNById(parseInt(id));
                    if (g) {
                        setForm({
                            ...g,
                            items: g.items || [],
                            shippingCost: g.shippingCost || 0,
                            otherCosts: g.otherCosts || 0
                        });
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

    // Load preselected PO
    useEffect(() => {
        if (preselectedPoId && isNew && pos.length > 0) {
            handleSelectPo(parseInt(preselectedPoId));
        }
    }, [preselectedPoId, isNew, pos]);

    // Load warehouse locations
    useEffect(() => {
        if (form.warehouseId) {
            (async () => {
                try {
                    const r = await warehouseService.getById(form.warehouseId!);
                    const dto = (r as any)?.data ?? r;
                    const whLocations = dto?.locations ?? [];
                    setLocations(whLocations);

                    if (whLocations.length > 0 && isNew) {
                        setRows(prev => {
                            const next = { ...prev };
                            Object.keys(next).forEach(key => {
                                if (!next[Number(key)].locationId) {
                                    next[Number(key)].locationId = whLocations[0].id;
                                }
                            });
                            return next;
                        });
                    }
                } catch {
                    setLocations([]);
                }
            })();
        } else {
            setLocations([]);
        }
    }, [form.warehouseId, isNew]);

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
            const r: Record<number, any> = {};
            (po.items || []).forEach((i: PurchaseOrderItemDto) => {
                const rem = (Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0);
                if (rem > 0 && i.id) {
                    r[i.id] = {
                        receivedQty: rem,
                        acceptedQty: rem,
                        locationId: locations.length === 1 ? locations[0].id : undefined
                    };
                }
            });
            setRows(r);

            if (po.quotationId) {
                try {
                    const qh = await purchaseService.getQuotationById(po.quotationId);
                    if (qh) {
                        setForm(f => ({ ...f, supplierInvoiceNo: qh.quotationNumber }));
                    }
                } catch (err) {
                    console.error('Failed to fetch quotation:', err);
                }
            }
        } catch {
            toast.error('فشل تحميل أمر الشراء');
        }
    };

    /** Validate row update */
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

    // Update row data
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

    const buildItems = (): GRNItemDto[] => {
        if (!isNew) {
            return (form.items || []);
        }
        if (!selectedPo?.items) return [];
        return selectedPo.items
            .filter((i) => i.id && ((Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0)) > 0)
            .map((i) => {
                const r = rows[i.id!] || {};
                const receivedQty = Number(r.receivedQty) || 0;
                const unitCost = Number(i.unitPrice) || 0;

                // Calculate cost using PO formula: Gross -> Discount -> Tax
                const grossAmount = receivedQty * unitCost;
                const discountRate = (Number(i.discountPercentage) || 0) / 100;
                const taxRate = (Number(i.taxPercentage) || 0) / 100;
                const discountAmount = grossAmount * discountRate;
                const taxableAmount = grossAmount - discountAmount;
                const taxAmount = taxableAmount * taxRate;
                const totalCost = taxableAmount + taxAmount;

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
                    totalCost,
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
        const totalQty = items.reduce((sum: number, item: GRNItemDto) => sum + (item.receivedQty || 0), 0);
        const subTotal = items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        const grandTotal = subTotal + (form.shippingCost || 0) + (form.otherCosts || 0);

        return {
            itemCount: items.length,
            totalQty: totalQty,
            totalCost: subTotal,
            grandTotal: grandTotal
        };
    }, [rows, selectedPo, form.items, isNew, form.shippingCost, form.otherCosts]);

    // Max remaining quantity
    const maxRem = (i: PurchaseOrderItemDto) => (Number(i.orderedQty) || 0) - (Number(i.receivedQty) || 0);

    const [warehouseChanged, setWarehouseChanged] = useState(false);

    // Handle form submission
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!form.poId || !form.supplierId) {
            toast.error('الرجاء اختيار أمر الشراء');
            return;
        }
        if (!form.warehouseId) {
            toast.error('الرجاء اختيار المستودع');
            return;
        }

        const items = buildItems();
        if (items.length === 0 && isNew) {
            toast.error('يجب إضافة صنف واحد على الأقل بكمية مستلمة');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                const payload: GoodsReceiptNoteDto = {
                    poId: form.poId,
                    supplierId: form.supplierId,
                    warehouseId: form.warehouseId,
                    deliveryNoteNo: form.deliveryNoteNo || undefined,
                    supplierInvoiceNo: form.supplierInvoiceNo || undefined,
                    shippingCost: form.shippingCost || 0,
                    otherCosts: form.otherCosts || 0,
                    receivedByUserId,
                    notes: form.notes || undefined,
                    items
                };
                await grnService.createGRN(payload);
                toast.success('تم إنشاء إذن الإضافة بنجاح وتحديث أرصدة المخزون');
                navigate('/dashboard/procurement/grn');
            } else {
                await grnService.updateGRN(parseInt(id!), form as GoodsReceiptNoteDto);
                toast.success('تم تحديث بيانات إذن الإضافة بنجاح');
                setWarehouseChanged(false);
            }
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

            if (warehouseChanged && id) {
                await grnService.updateGRN(parseInt(id), form as GoodsReceiptNoteDto);
            }

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

    // ─── Shared input class generator ───
    const inputClass = (extra = '', forceReadOnly = isReadOnly) =>
        `w-full px-4 py-3 border-2 rounded-xl outline-none transition-all font-semibold ${forceReadOnly
            ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-default pointer-events-none select-text'
            : 'bg-slate-50 border-transparent focus:border-brand-primary focus:bg-white'
        } ${extra}`;

    const smallInputClass = (extra = '') =>
        `px-3 py-2 border-2 rounded-xl text-sm outline-none transition-all ${isReadOnly
            ? 'bg-slate-50 border-slate-200 cursor-default pointer-events-none select-text'
            : 'bg-white border-slate-200 focus:border-brand-primary'
        } ${extra}`;

    // إشعار: جاهز للإضافة للمخزن بعد اعتماد فحص الجودة (تم الفحص أو إذن معتمد، ولم تتم الإضافة بعد)
    const qualityApprovedReadyForStore = !isNew && form.status && ['Inspected', 'Approved'].includes(form.status) && form.status !== 'Completed';

    const handleFinalizeStoreInFromPage = async () => {
        if (!id) return;
        if (!window.confirm('هل أنت متأكد من إضافة الشحنة للمخازن؟ سيتم تحديث أرصدة المخزون.')) return;
        try {
            setProcessing(true);
            await grnService.finalizeStoreIn(parseInt(id), 1);
            toast.success('تم إضافة الكميات للمخزون بنجاح');
            const updated = await grnService.getGRNById(parseInt(id));
            if (updated) setForm({ ...updated, items: updated.items || [] });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'خطأ أثناء الإضافة للمخزن');
        } finally {
            setProcessing(false);
        }
    };




    // ─── Create Form ────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* إشعار: تم اعتماد فحص الجودة — جاهز للإضافة للمخازن */}
            {qualityApprovedReadyForStore && (
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-l from-emerald-50 to-green-50 shadow-sm animate-slide-in">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-100">
                            <Bell className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-800 text-lg">تم اعتماد فحص الجودة</h3>
                            <p className="text-emerald-700 text-sm mt-0.5">يمكنك الآن إضافة الشحنة للمخازن وتحديث الأرصدة.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleFinalizeStoreInFromPage}
                        disabled={processing}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Archive className="w-5 h-5" />}
                        <span>إضافة للمخزن</span>
                    </button>
                </div>
            )}

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
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isNew ? 'إذن إضافة جديد (GRN)' : `إذن الإضافة ${form.grnNumber || ''}`}
                                </h1>
                                {isReadOnly && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20">
                                        <Lock className="w-3 h-3" />
                                        للعرض فقط
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-lg">
                                {isReadOnly
                                    ? 'عرض تفاصيل إذن الإضافة — البيانات محمية من التعديل'
                                    : 'استلام المواد من المورد وتحديث أرصدة المخزون'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {isReadOnly && (
                            <div className="flex items-center gap-3">
                                {approvalId && (
                                    <>
                                        <button
                                            onClick={() => handleApprovalAction('Approved')}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl 
                                                font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95
                                                disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                        >
                                            {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            <span>اعتماد</span>
                                        </button>
                                        <button
                                            onClick={() => handleApprovalAction('Rejected')}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl 
                                                font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95
                                                disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
                        {!isReadOnly && (
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
                        )}
                    </div>
                </div>
            </div>

            {/* Read-only banner */}
            {isReadOnly && (
                <div className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl animate-slide-in">
                    <div className="p-2.5 bg-amber-100 rounded-xl flex-shrink-0">
                        <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-amber-800 font-bold text-sm">
                            أنت في وضع العرض — جميع الحقول مقفلة ولا يمكن تعديلها
                        </p>
                    </div>
                </div>
            )}


            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (2/3) */}
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
                                {isReadOnly ? (
                                    <div className={inputClass()}>
                                        {pos.find(p => p.id === form.poId)?.poNumber || form.poNumber || '—'}
                                    </div>
                                ) : (
                                    <select
                                        value={form.poId || ''}
                                        onChange={(e) => handleSelectPo(parseInt(e.target.value) || 0)}
                                        className={inputClass()}
                                        required
                                    >
                                        <option value="">اختر أمر الشراء...</option>
                                        {pos.map((p) => (
                                            <option key={p.id} value={p.id}>{p.poNumber} — {p.supplierNameAr}</option>
                                        ))}
                                    </select>
                                )}

                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Building2 className="w-4 h-4 text-brand-primary" />
                                    المستودع المستلم *
                                </label>
                                {!canEditWarehouse ? (
                                    <div className={inputClass()}>
                                        {warehouses.find(w => w.id === form.warehouseId)?.warehouseNameAr || '—'}
                                    </div>
                                ) : (
                                    <select
                                        value={form.warehouseId || ''}
                                        onChange={(e) => {
                                            setForm((f) => ({ ...f, warehouseId: parseInt(e.target.value) || 0 }));
                                            setWarehouseChanged(true);
                                        }}
                                        className={inputClass('', !canEditWarehouse)}
                                        required
                                    >
                                        <option value="">اختر المستودع...</option>
                                        {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                        ))}
                                    </select>
                                )}

                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    رقم بوليصة الشحن
                                </label>
                                <input
                                    type="text"
                                    readOnly={isReadOnly}
                                    value={form.deliveryNoteNo || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, deliveryNoteNo: e.target.value }))}
                                    className={inputClass()}
                                    placeholder={isReadOnly ? '—' : 'DN-XXX'}
                                />

                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    رقم فاتورة المورد
                                </label>
                                <input
                                    type="text"
                                    readOnly={isReadOnly}
                                    value={form.supplierInvoiceNo || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, supplierInvoiceNo: e.target.value }))}
                                    className={inputClass()}
                                    placeholder={isReadOnly ? '—' : 'INV-XXX'}
                                />

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 block">مصاريف الشحن</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={form.shippingCost}
                                            onChange={(e) => setForm({ ...form, shippingCost: parseFloat(e.target.value) || 0 })}
                                            className={inputClass('pl-12')}
                                            readOnly={isReadOnly}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">EGP</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600 block">مصاريف أخرى</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={form.otherCosts}
                                            onChange={(e) => setForm({ ...form, otherCosts: parseFloat(e.target.value) || 0 })}
                                            className={inputClass('pl-12')}
                                            readOnly={isReadOnly}
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">EGP</div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Info className="w-4 h-4 text-brand-primary" />
                                    ملاحظات
                                </label>
                                <textarea
                                    value={form.notes || ''}
                                    readOnly={isReadOnly}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    rows={2}
                                    className={inputClass('resize-none')}
                                    placeholder={isReadOnly ? '—' : 'أي ملاحظات إضافية...'}
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
                                    <p className="font-semibold text-slate-800">{formatNumber(totals.grandTotal, { minimumFractionDigits: 2 })} ج.م</p>
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
                                            {!isNew && isReadOnly && <th className="py-4 px-3 text-center font-bold">التكلفة</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(isNew ? selectedPo?.items?.filter(i => maxRem(i) > 0) : form.items)?.map((i: any) => (

                                            <tr key={i.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 pr-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${(rows[i.id!]?.receivedQty || 0) > 0 ? 'bg-brand-primary' : 'bg-slate-300'}`} />
                                                        <span className="font-bold text-slate-800">{i.itemNameAr}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 mr-5">{i.unitNameAr}</div>
                                                </td>
                                                <td className="py-4 px-3 text-center">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-semibold text-sm">
                                                        {isNew ? maxRem(i) : (i.orderedQty || '—')}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-3">
                                                    <input
                                                        type="number"
                                                        readOnly={isReadOnly}
                                                        min={0}
                                                        max={isNew ? maxRem(i) : undefined}
                                                        step="0.001"
                                                        value={isNew ? (rows[i.id!]?.receivedQty ?? maxRem(i)) : i.receivedQty}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            updateRow(i.id!, { receivedQty: val, acceptedQty: val }, i);
                                                        }}
                                                        className={smallInputClass('w-24 text-center font-bold text-brand-primary')}
                                                    />

                                                </td>
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="number"
                                                        readOnly={isReadOnly}
                                                        min={0}
                                                        max={isNew ? (rows[i.id!]?.receivedQty ?? maxRem(i)) : undefined}
                                                        step="0.001"
                                                        value={isNew ? (rows[i.id!]?.acceptedQty ?? rows[i.id!]?.receivedQty ?? maxRem(i)) : i.acceptedQty}
                                                        onChange={(e) => updateRow(i.id!, { acceptedQty: parseFloat(e.target.value) || 0 }, i)}
                                                        className={smallInputClass('w-24 text-center font-bold')}
                                                    />

                                                </td>
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="text"
                                                        readOnly={isReadOnly}
                                                        value={isNew ? (rows[i.id!]?.lotNumber || '') : (i.lotNumber || '')}
                                                        onChange={(e) => updateRow(i.id!, { lotNumber: e.target.value.trim() || undefined })}
                                                        placeholder={isReadOnly ? '—' : 'LOT-XXX'}
                                                        className={smallInputClass('w-28 text-center')}
                                                    />

                                                </td>
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="date"
                                                        readOnly={isReadOnly}
                                                        value={isNew ? (rows[i.id!]?.manufactureDate || '') : (i.manufactureDate || '')}
                                                        onChange={(e) => updateRow(i.id!, { manufactureDate: e.target.value || undefined })}
                                                        className={smallInputClass('w-36 text-center')}
                                                    />

                                                </td>
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="date"
                                                        readOnly={isReadOnly}
                                                        value={isNew ? (rows[i.id!]?.expiryDate || '') : (i.expiryDate || '')}
                                                        onChange={(e) => updateRow(i.id!, { expiryDate: e.target.value || undefined }, i)}
                                                        className={smallInputClass('w-36 text-center')}
                                                    />

                                                </td>
                                                <td className="py-4 pl-6">
                                                    {isReadOnly ? (
                                                        <div className={smallInputClass('w-32 text-center')}>
                                                            {locations.find(l => l.id === (isNew ? rows[i.id!]?.locationId : i.locationId))?.locationCode || '—'}
                                                        </div>
                                                    ) : (
                                                        <select
                                                            value={rows[i.id!]?.locationId || ''}
                                                            onChange={(e) => updateRow(i.id!, { locationId: e.target.value ? parseInt(e.target.value) : undefined })}
                                                            className={smallInputClass('w-32')}
                                                        >
                                                            <option value="">اختر الموقع</option>
                                                            {locations.map((l) => (
                                                                <option key={l.id} value={l.id}>
                                                                    {l.locationCode} {l.locationName ? `- ${l.locationName}` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                                {!isNew && isReadOnly && (
                                                    <td className="py-4 px-3 text-center font-bold text-slate-800 tabular-nums">
                                                        {formatNumber(i.totalCost || 0)}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No Items Empty State */}
                    {isNew && selectedPo && (!selectedPo.items || selectedPo.items.filter(i => maxRem(i) > 0).length === 0) && (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                <Package className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-400 font-semibold">لا توجد أصناف متبقية للاستلام في أمر الشراء هذا</p>
                        </div>
                    )}

                    {/* Empty State when no PO selected */}
                    {isNew && !selectedPo && (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center animate-slide-in">
                            <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                                <Package className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-600 mb-2">اختر أمر الشراء</h3>
                            <p className="text-slate-400">اختر أمر شراء من القائمة أعلاه لعرض الأصناف المتبقية للاستلام</p>
                        </div>
                    )}
                </div>

                {/* Sidebar (1/3) */}
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
                                <span className="font-bold text-lg text-brand-primary">{formatNumber(totals.totalQty)}</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl space-y-3">
                                <label className="flex items-center gap-2 text-xs text-white/60 font-bold uppercase tracking-wider">
                                    <FileText className="w-3 h-3" />
                                    رقم فاتورة المورد
                                </label>
                                <div className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 font-bold">
                                    {form.supplierInvoiceNo || '—'}
                                </div>
                            </div>
                            {!isNew && (
                                <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <span className="text-emerald-400 text-sm">تاريخ الإذن</span>
                                    <span className="font-bold text-emerald-100">{form.grnDate ? formatDate(form.grnDate) : '—'}</span>
                                </div>
                            )}
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">إجمالي التكلفة</div>
                                <div className="text-3xl font-black text-brand-primary">
                                    {formatNumber(totals.grandTotal, { minimumFractionDigits: 2 })}
                                    <span className="text-sm font-bold opacity-70"> ج.م</span>
                                </div>
                            </div>
                        </div>
                        {totals.itemCount > 0 && isNew && (
                            <div className="mt-6 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-brand-primary">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-semibold">{totals.itemCount} صنف جاهز للحفظ</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Alert */}
                    {isNew && (
                        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 
                            flex gap-4 animate-slide-in shadow-lg"
                            style={{ animationDelay: '300ms' }}>
                            <div className="p-3 bg-emerald-100 rounded-xl h-fit">
                                <AlertCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-emerald-800 mb-2">معلومة هامة</h4>
                                <p className="text-sm leading-relaxed text-emerald-700">
                                    سيتم <strong>تحديث أرصدة المخزون تلقائياً</strong> فور حفظ إذن الإضافة.
                                    تأكد من صحة الكميات والمواقع قبل الحفظ.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Status Alert */}


                    {/* FIFO Info */}
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border-2 border-blue-200 
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