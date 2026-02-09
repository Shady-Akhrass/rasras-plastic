import React, { useState, useEffect, useOptimistic, startTransition } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Truck,
    Package,
    Calendar,
    DollarSign,
    Plus,
    Trash2,
    ShoppingCart,
    Info,
    FileText,
    AlertCircle,
    CheckCircle2,
    Eye,
    XCircle,
    RefreshCw,
    Clock
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import { purchaseOrderService, type PurchaseOrderDto, type PurchaseOrderItemDto } from '../../services/purchaseOrderService';
import purchaseService from '../../services/purchaseService';
import { supplierService, type SupplierDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import { formatNumber } from '../../utils/format';
import toast from 'react-hot-toast';

// --- Logic: Centralized Calculation Helper ---
const calculateOrderTotals = (po: PurchaseOrderDto): PurchaseOrderDto => {
    let subTotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;

    const updatedItems = (po.items || []).map(item => {
        const qty = Number(item.orderedQty) || 0;
        const price = Number(item.unitPrice) || 0;
        const discountRate = (Number(item.discountPercentage) || 0) / 100;
        const taxRate = (Number(item.taxPercentage) || 0) / 100;

        // Math: Gross -> Discount -> Tax on Taxable Amount
        const grossAmount = qty * price;
        const discountAmount = grossAmount * discountRate;
        const taxableAmount = grossAmount - discountAmount;
        const taxAmount = taxableAmount * taxRate;
        const totalPrice = taxableAmount + taxAmount;

        // Accumulate Global Totals
        subTotal += grossAmount;
        totalDiscountAmount += discountAmount;
        totalTaxAmount += taxAmount;

        return {
            ...item,
            discountAmount,
            taxAmount,
            totalPrice
        };
    });

    const shipping = Number(po.shippingCost) || 0;
    const other = Number(po.otherCosts) || 0;

    // Final Calculation: (Subtotal - Discount) + Tax + Shipping + Other
    const grandTotal = (subTotal - totalDiscountAmount) + totalTaxAmount + shipping + other;

    return {
        ...po,
        items: updatedItems,
        subTotal,
        discountAmount: totalDiscountAmount,
        taxAmount: totalTaxAmount,
        totalAmount: grandTotal
    };
};

const PurchaseOrderFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const queryParams = new URLSearchParams(location.search);
    const quotationId = queryParams.get('quotationId');
    const comparisonId = queryParams.get('comparisonId');
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    // Data State
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Initial Form State
    const [formData, setFormData] = useState<PurchaseOrderDto>({
        supplierId: 0,
        currency: 'EGP',
        exchangeRate: 1,
        subTotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        shippingCost: 0,
        otherCosts: 0,
        totalAmount: 0,
        status: 'Pending',
        approvalStatus: 'Pending',
        items: []
    });

    // --- Optimistic Logic Definition ---
    type POAction =
        | { type: 'SET_DATA', payload: PurchaseOrderDto }
        | { type: 'UPDATE_FIELD', field: keyof PurchaseOrderDto, value: any }
        | { type: 'UPDATE_ITEM', index: number, item: Partial<PurchaseOrderItemDto> }
        | { type: 'ADD_ITEM' }
        | { type: 'REMOVE_ITEM', index: number };

    const poReducer = (state: PurchaseOrderDto, action: POAction): PurchaseOrderDto => {
        let newState = { ...state };
        switch (action.type) {
            case 'SET_DATA':
                newState = { ...action.payload };
                // Derivation on load: if saved total > items total and shipping is 0, assign diff to shipping
                const savedTotal = Number(newState.totalAmount) || 0;
                const itemsT = (newState.items || []).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
                const other = Number(newState.otherCosts) || 0;

                if (savedTotal > itemsT + other && (!newState.shippingCost || newState.shippingCost === 0)) {
                    const diff = savedTotal - (itemsT + other);
                    newState.shippingCost = Math.round(diff * 100) / 100;
                }
                break;
            case 'UPDATE_FIELD':
                if (action.field === 'totalAmount') {
                    const newTotal = parseFloat(action.value) || 0;
                    // Derivation: Total - (Net Items + Tax)
                    const subT = Number(newState.subTotal) || 0;
                    const disc = Number(newState.discountAmount) || 0;
                    const tax = Number(newState.taxAmount) || 0;
                    const otherCosts = Number(newState.otherCosts) || 0;

                    const itemsTotal = (subT - disc) + tax;
                    const derivedShipping = newTotal - itemsTotal - otherCosts;
                    newState.shippingCost = Math.round(derivedShipping * 100) / 100;
                    newState.totalAmount = newTotal;
                } else {
                    newState = { ...newState, [action.field]: action.value };
                }
                break;
            case 'UPDATE_ITEM':
                const newItems = [...(newState.items || [])];
                newItems[action.index] = { ...newItems[action.index], ...action.item };
                newState.items = newItems;
                break;
            case 'ADD_ITEM':
                const newItem: PurchaseOrderItemDto = {
                    itemId: 0, unitId: 0, orderedQty: 1, unitPrice: 0,
                    totalPrice: 0, discountPercentage: 0, taxPercentage: 0, polymerGrade: ''
                };
                newState.items = [...(newState.items || []), newItem];
                break;
            case 'REMOVE_ITEM':
                newState.items = (newState.items || []).filter((_, i) => i !== action.index);
                break;
        }
        return calculateOrderTotals(newState);
    };

    const [optimisticPO, updateOptimistic] = useOptimistic(formData, poReducer);

    const handleUpdate = (action: POAction) => {
        startTransition(() => {
            updateOptimistic(action);
            setFormData(prev => poReducer(prev, action));
        });
    };

    // --- Loading & Handlers ---
    useEffect(() => {
        loadSuppliers(); loadItems(); loadUnits();
        if (isEdit) { loadPO(); }
        else if (quotationId) { loadQuotationData(parseInt(quotationId)); }
    }, [id, quotationId]);

    const loadPO = async () => {
        try {
            setLoading(true);
            const data = await purchaseOrderService.getPOById(parseInt(id!));
            handleUpdate({ type: 'SET_DATA', payload: data });
        } catch (error) { toast.error('فشل تحميل بيانات أمر الشراء'); }
        finally { setLoading(false); }
    };

    const loadSuppliers = async () => { const d = await supplierService.getAllSuppliers(); setSuppliers(d.data || []); };
    const loadItems = async () => { const d = await itemService.getActiveItems(); setItems(d.data || []); };
    const loadUnits = async () => { const d = await unitService.getAllUnits(); setUnits(d.data || []); };

    const loadQuotationData = async (qId: number) => {
        try {
            const quotation = await purchaseService.getQuotationById(qId);
            if (quotation) {
                // Find associated comparison to get precise winner details (days and cost)
                let comparisonDetail: any = null;
                try {
                    const allComparisons = await purchaseService.getAllComparisons();
                    for (const comp of allComparisons) {
                        const detail = comp.details?.find(d => d.quotationId === qId);
                        if (detail) {
                            comparisonDetail = detail;
                            break;
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch comparison details:', err);
                }

                // Get delivery cost (direct or derived) 
                const getFinalDeliveryCost = (q: any) => {
                    const explicit = q.deliveryCost;
                    if (explicit !== undefined && explicit !== null && Number(explicit) > 0) {
                        return Number(explicit);
                    }
                    const itemsTotal = q.items?.reduce((sum: number, item: any) => sum + (Number(item.totalPrice) || 0), 0) || 0;
                    const derived = Number(q.totalAmount) - itemsTotal;
                    return derived > 0.01 ? Math.round(derived * 100) / 100 : 0;
                };

                const finalShippingCost = (comparisonDetail && comparisonDetail.deliveryCost > 0)
                    ? comparisonDetail.deliveryCost
                    : getFinalDeliveryCost(quotation);

                const mappedPO: PurchaseOrderDto = {
                    ...formData,
                    supplierId: quotation.supplierId,
                    quotationId: quotation.id,
                    comparisonId: comparisonId ? parseInt(comparisonId) : undefined,
                    currency: quotation.currency || 'EGP',
                    shippingCost: finalShippingCost,
                    deliveryDays: comparisonDetail?.deliveryDays || quotation.deliveryDays || 0,
                    paymentTerms: quotation.paymentTerms || '',
                    notes: `تم الإنشاء بناءً على عرض السعر: ${quotation.quotationNumber}\n${quotation.notes || ''}`,
                    items: (quotation.items || []).map(qi => ({
                        itemId: qi.itemId,
                        unitId: qi.unitId,
                        orderedQty: qi.offeredQty,
                        unitPrice: qi.unitPrice,
                        polymerGrade: qi.polymerGrade || '',
                        discountPercentage: qi.discountPercentage || 0,
                        taxPercentage: qi.taxPercentage || 0,
                        totalPrice: qi.totalPrice,
                    }))
                };
                handleUpdate({ type: 'SET_DATA', payload: calculateOrderTotals(mappedPO) });
                toast.success(`تم تحميل بيانات عرض السعر`);
            }
        } catch (e) {
            console.error('Failed to load quotation data:', e);
            toast.error('فشل تحميل بيانات عرض السعر');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (optimisticPO.approvalStatus === 'Approved') return;
        if (!optimisticPO.supplierId || !optimisticPO.items?.length) {
            toast.error('يرجى التحقق من المورد والأصناف');
            return;
        }
        try {
            setSaving(true);
            const savedPO = await purchaseOrderService.createPO(optimisticPO);
            toast.success(isEdit ? 'تم تحديث أمر الشراء بنجاح' : 'تم حفظ أمر الشراء وإرساله للااعتماد بنجاح');

            // If caller requested chaining to invoice or outstanding creation, navigate accordingly
            const createInvoice = queryParams.get('createInvoice') === 'true';
            const createOutstanding = queryParams.get('createOutstanding') === 'true';

            const poId = savedPO?.id || undefined;
            const qId = savedPO?.quotationId || optimisticPO.quotationId;
            const compId = savedPO?.comparisonId || optimisticPO.comparisonId;

            if (createInvoice && poId) {
                navigate(`/dashboard/procurement/invoice/create?poId=${poId}${qId ? `&quotationId=${qId}` : ''}${compId ? `&comparisonId=${compId}` : ''}`);
                return;
            }

            if (createOutstanding && poId) {
                navigate(`/dashboard/procurement/outstanding/create?poId=${poId}${qId ? `&quotationId=${qId}` : ''}${compId ? `&comparisonId=${compId}` : ''}`);
                return;
            }

            navigate('/dashboard/procurement/po');
        } catch (err) { toast.error('فشل حفظ أمر الشراء'); }
        finally { setSaving(false); }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
            navigate('/dashboard/procurement/approvals');
        } catch (error) { toast.error('فشل تنفيذ الإجراء'); }
        finally { setProcessing(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Header Section (Same Exact Design) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate(-1)} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? `أمر شراء رقم: ${optimisticPO.poNumber || ''}` : 'إنشاء أمر شراء جديد'}
                            </h1>
                            <p className="text-white/80 text-lg">إصدار طلب توريد رسمي للمورد بناءً على المواصفات والأسعار المعتمدة</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {isEdit && optimisticPO.approvalStatus !== 'Draft' && optimisticPO.approvalStatus !== 'Approved' && !isView && (
                            <div className="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-bold flex items-center gap-2 border border-amber-100 italic">
                                <Clock className="w-5 h-5" />
                                <span>بانتظار الاعتماد</span>
                            </div>
                        )}
                        {optimisticPO.approvalStatus !== 'Approved' && !isView && (
                            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                                {saving ? <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                                <span>{saving ? 'جاري الحفظ...' : 'حفظ وإرسال للاعتماد'}</span>
                            </button>
                        )}
                        {optimisticPO.approvalStatus === 'Approved' && (
                            <div className="flex items-center gap-2 px-6 py-4 bg-emerald-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold">طلب معتمد ومؤكد</span>
                            </div>
                        )}
                        {isView && (
                            <div className="flex items-center gap-3">
                                {approvalId && (
                                    <>
                                        <button onClick={() => handleApprovalAction('Approved')} disabled={processing} className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                                            {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            <span>اعتماد</span>
                                        </button>
                                        <button onClick={() => handleApprovalAction('Rejected')} disabled={processing} className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                                            {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                            <span>رفض</span>
                                        </button>
                                    </>
                                )}
                                <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-bold">وضع العرض فقط</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Info className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">معلومات المورد وتفاصيل الطلب</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" /> المورد
                                </label>
                                <select
                                    disabled={isView}
                                    value={optimisticPO.supplierId}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'supplierId', value: parseInt(e.target.value) })}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all font-semibold ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                >
                                    <option value="0">اختر المورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierNameAr}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" /> تاريخ التسليم المتوقع
                                </label>
                                <input
                                    type="date"
                                    disabled={isView}
                                    value={optimisticPO.expectedDeliveryDate || ''}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'expectedDeliveryDate', value: e.target.value })}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all font-semibold ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Clock className="w-4 h-4 text-brand-primary" /> مدة التوصيل (أيام)
                                </label>
                                <input
                                    type="number"
                                    disabled={isView}
                                    value={optimisticPO.deliveryDays || 0}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'deliveryDays', value: parseInt(e.target.value) || 0 })}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all font-semibold ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in" style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف المسعرة</h3>
                                        <p className="text-slate-500 text-sm">قائمة المواد والكميات المطلوب توريدها</p>
                                    </div>
                                </div>
                                {!isView && (
                                    <button
                                        type="button"
                                        onClick={() => handleUpdate({ type: 'ADD_ITEM' })}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> إضافة صنف
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right">الصنف</th>
                                        <th className="py-4 px-4 text-center">الكمية</th>
                                        <th className="py-4 px-4 text-center">الوحدة</th>
                                        <th className="py-4 px-4 text-center">السعر</th>
                                        <th className="py-4 px-4 text-center">درجة البوليمر</th>
                                        <th className="py-4 px-4 text-center">خصم %</th>
                                        <th className="py-4 px-4 text-center">الضريبة %</th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        <th className="py-4 pl-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(optimisticPO.items || []).map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-6">
                                                <select
                                                    disabled={isView}
                                                    value={item.itemId}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { itemId: parseInt(e.target.value) } })}
                                                    className={`w-full min-w-[200px] px-3 py-2 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all ${isView ? 'bg-slate-100 opacity-70 cursor-not-allowed' : 'bg-white'}`}
                                                >
                                                    <option value="0">اختر صنف...</option>
                                                    {items.map(i => <option key={i.id} value={i.id}>{i.itemNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    disabled={isView}
                                                    value={item.orderedQty}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { orderedQty: parseFloat(e.target.value) || 0 } })}
                                                    className={`w-20 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm text-center font-bold text-brand-primary outline-none focus:border-brand-primary transition-all ${isView ? 'bg-slate-100 opacity-70 cursor-not-allowed text-brand-primary/60' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <select
                                                    disabled={isView}
                                                    value={item.unitId}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { unitId: parseInt(e.target.value) } })}
                                                    className={`w-24 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all ${isView ? 'bg-slate-100 opacity-70 cursor-not-allowed' : 'bg-white'}`}
                                                >
                                                    <option value="0">الوحدة...</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.unitNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    disabled={isView}
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { unitPrice: parseFloat(e.target.value) || 0 } })}
                                                    className={`w-24 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm text-center font-bold text-emerald-600 outline-none focus:border-brand-primary transition-all ${isView ? 'bg-slate-100 opacity-70 cursor-not-allowed text-emerald-600/60' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="text"
                                                    disabled={isView}
                                                    value={item.polymerGrade || ''}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { polymerGrade: e.target.value } })}
                                                    className={`w-32 px-3 py-2 border-2 border-slate-200 rounded-xl text-sm text-center font-medium outline-none focus:border-brand-primary transition-all text-slate-700 ${isView ? 'bg-slate-100 opacity-70 cursor-not-allowed' : 'bg-white'}`}
                                                    placeholder="مثلاً: Grade A"
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    disabled={isView}
                                                    value={item.discountPercentage}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { discountPercentage: parseFloat(e.target.value) || 0 } })}
                                                    className={`w-16 px-3 py-2 border-2 border-rose-100 rounded-xl text-sm text-center font-bold text-rose-600 outline-none focus:border-rose-400 transition-all ${isView ? 'bg-slate-100 border-slate-200 opacity-70 cursor-not-allowed text-rose-600/60' : 'bg-rose-50'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    disabled={isView}
                                                    value={item.taxPercentage}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { taxPercentage: parseFloat(e.target.value) || 0 } })}
                                                    className={`w-16 px-3 py-2 border-2 border-amber-100 rounded-xl text-sm text-center font-bold text-amber-600 outline-none focus:border-amber-400 transition-all ${isView ? 'bg-slate-100 border-slate-200 opacity-70 cursor-not-allowed text-amber-600/60' : 'bg-amber-50'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                {formatNumber(item.totalPrice ?? 0)}
                                            </td>
                                            <td className="py-4 pl-6 text-left">
                                                {!isView && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdate({ type: 'REMOVE_ITEM', index: idx })}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!optimisticPO.items || optimisticPO.items.length === 0) && (
                                        <tr>
                                            <td colSpan={9} className="py-20 text-center">
                                                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                                    <Package className="w-10 h-10 text-slate-400" />
                                                </div>
                                                <p className="text-slate-400 font-semibold">لا توجد أصناف مضافة</p>
                                                <p className="text-slate-400 text-sm mt-1">انقر على "إضافة صنف" لبدء الإضافة</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 
                        rounded-3xl p-6 text-white shadow-2xl animate-slide-in" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-xl">الملخص المالي</h3>
                        </div>

                        {/* --- Added Date Display Here (Requested) --- */}
                        <div className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-white/60 text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> تاريخ التسليم
                            </span>
                            <span className="font-bold text-sm text-white/90">
                                {optimisticPO.expectedDeliveryDate ? optimisticPO.expectedDeliveryDate : 'غير محدد'}
                            </span>
                        </div>

                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white/60">إجمالي الأصناف (صافي)</span>
                                <span className="font-bold text-lg text-white/90">
                                    {formatNumber(optimisticPO.totalAmount - (optimisticPO.shippingCost || 0))} {optimisticPO.currency}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                                <span className="text-brand-primary-light font-semibold">مصاريف الشحن</span>
                                <input
                                    type="number"
                                    disabled={isView}
                                    value={optimisticPO.shippingCost}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'shippingCost', value: parseFloat(e.target.value) || 0 })}
                                    className={`w-28 px-3 py-2 border-2 border-brand-primary/30 rounded-lg 
                                        text-white font-bold text-right outline-none focus:border-brand-primary/50 transition-all
                                        ${isView ? 'bg-white/5 cursor-not-allowed opacity-70' : 'bg-brand-primary/10'}`}
                                />
                            </div>

                            <div className="pt-4 mt-2 border-t border-white/10">
                                <div className="flex justify-between items-center p-5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <span className="font-bold text-white uppercase tracking-wider">الإجمالي النهائي</span>
                                    <input
                                        type="number"
                                        disabled={isView}
                                        value={optimisticPO.totalAmount}
                                        onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'totalAmount', value: e.target.value })}
                                        className={`w-36 px-3 py-2 bg-white/10 border-2 border-white/20 rounded-xl 
                                            text-white font-black text-xl text-right outline-none focus:border-white/50 transition-all
                                            ${isView ? 'cursor-not-allowed opacity-70' : 'hover:bg-white/20'}`}
                                    />
                                    <span className="mr-2 font-bold">{optimisticPO.currency}</span>
                                </div>
                            </div>

                            {/* Detailed Breakdown (Collapsed/Secondary) */}
                            <div className="mt-4 p-4 border border-white/5 rounded-2xl bg-white/5 space-y-3">
                                <div className="flex justify-between text-xs text-white/40">
                                    <span>المجموع (قبل الخصم)</span>
                                    <span>{formatNumber(optimisticPO.subTotal ?? 0)} {optimisticPO.currency}</span>
                                </div>
                                <div className="flex justify-between text-xs text-rose-400/60">
                                    <span>إجمالي الخصم</span>
                                    <span>- {formatNumber(optimisticPO.discountAmount ?? 0)} {optimisticPO.currency}</span>
                                </div>
                                <div className="flex justify-between text-xs text-emerald-400/60">
                                    <span>إجمالي الضريبة</span>
                                    <span>{formatNumber(optimisticPO.taxAmount ?? 0)} {optimisticPO.currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in" style={{ animationDelay: '300ms' }}>
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-800">ملاحظات إضافية</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <textarea
                            value={optimisticPO.notes || ''}
                            disabled={isView}
                            onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'notes', value: e.target.value })}
                            className={`w-full p-4 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all text-sm leading-relaxed h-40 resize-none ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                            placeholder={isView ? '' : "اكتب أي ملاحظات أو تعليمات خاصة للمورد..."}
                        />
                    </div>
                </div>

                {/* Info Alert */}
                <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 flex gap-4 animate-slide-in shadow-lg" style={{ animationDelay: '400ms' }}>
                    <div className="p-3 bg-blue-100 rounded-xl h-fit">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-800 mb-2">معلومة هامة</h4>
                        <p className="text-sm leading-relaxed text-blue-700">
                            سيتم إرسال أمر الشراء للمورد فور الاعتماد. تأكد من مراجعة
                            <strong> الكميات والأسعار</strong> قبل الحفظ.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};


export default PurchaseOrderFormPage;