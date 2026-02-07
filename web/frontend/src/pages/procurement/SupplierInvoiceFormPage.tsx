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
    FileText,
    Hash,
    Info,
    AlertCircle,
    Receipt,
    CheckCircle2,
    Eye,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import { supplierInvoiceService, type SupplierInvoiceDto, type SupplierInvoiceItemDto } from '../../services/supplierInvoiceService';
import { supplierService, type SupplierDto } from '../../services/supplierService';
import { grnService } from '../../services/grnService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import purchaseService from '../../services/purchaseService';
import toast from 'react-hot-toast';

const SupplierInvoiceFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const queryParams = new URLSearchParams(location.search);
    const quotationId = queryParams.get('quotationId');
    const grnId = queryParams.get('grnId');
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    // Data State
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Form State
    const [formData, setFormData] = useState<SupplierInvoiceDto>({
        invoiceNumber: '',
        supplierInvoiceNo: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        supplierId: 0,
        currency: 'EGP',
        exchangeRate: 1,
        subTotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        deliveryCost: 0,
        totalAmount: 0,
        status: 'Unpaid',
        items: []
    });

    // --- Logic: Centralized Calculation Helper ---
    const calculateInvoiceTotals = (invoice: SupplierInvoiceDto): SupplierInvoiceDto => {
        let subTotalSum = 0;
        let totalDiscountSum = 0;
        let totalTaxSum = 0;

        const updatedItems = (invoice.items || []).map(item => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            const discountRate = (Number(item.discountPercentage) || 0) / 100;
            const taxRate = (Number(item.taxPercentage) || 0) / 100;

            // Math: Gross -> Discount -> Tax
            const grossAmount = qty * price;
            const discountAmount = grossAmount * discountRate;
            const taxableAmount = grossAmount - discountAmount;
            const taxAmount = taxableAmount * taxRate;
            const totalPrice = taxableAmount + taxAmount;

            // Accumulate Global Totals
            subTotalSum += grossAmount;
            totalDiscountSum += discountAmount;
            totalTaxSum += taxAmount;

            return {
                ...item,
                discountAmount,
                taxAmount,
                totalPrice
            };
        });

        const delivery = Number(invoice.deliveryCost) || 0;

        // Final Calculation
        const finalTotal = (subTotalSum - totalDiscountSum) + totalTaxSum + delivery;

        return {
            ...invoice,
            items: updatedItems,
            subTotal: subTotalSum,
            discountAmount: totalDiscountSum,
            taxAmount: totalTaxSum,
            totalAmount: finalTotal
        };
    };

    // --- Optimistic Logic ---
    type InvoiceAction =
        | { type: 'SET_DATA', payload: SupplierInvoiceDto }
        | { type: 'UPDATE_FIELD', field: keyof SupplierInvoiceDto, value: any }
        | { type: 'UPDATE_ITEM', index: number, item: Partial<SupplierInvoiceItemDto> }
        | { type: 'ADD_ITEM' }
        | { type: 'REMOVE_ITEM', index: number };

    const invoiceReducer = (state: SupplierInvoiceDto, action: InvoiceAction): SupplierInvoiceDto => {
        let newState = { ...state };
        switch (action.type) {
            case 'SET_DATA':
                newState = action.payload;
                break;
            case 'UPDATE_FIELD':
                newState = { ...newState, [action.field]: action.value };
                break;
            case 'UPDATE_ITEM':
                const newItems = [...(newState.items || [])];
                newItems[action.index] = { ...newItems[action.index], ...action.item };
                newState.items = newItems;
                break;
            case 'ADD_ITEM':
                const newItem: SupplierInvoiceItemDto = {
                    itemId: 0, unitId: 0, quantity: 1, unitPrice: 0,
                    totalPrice: 0, discountPercentage: 0, taxPercentage: 14
                };
                newState.items = [...(newState.items || []), newItem];
                break;
            case 'REMOVE_ITEM':
                newState.items = (newState.items || []).filter((_, i) => i !== action.index);
                break;
        }
        return calculateInvoiceTotals(newState);
    };

    const [optimisticData, updateOptimistic] = useOptimistic(formData, invoiceReducer);

    const handleUpdate = (action: InvoiceAction) => {
        startTransition(() => {
            updateOptimistic(action);
            setFormData(prev => invoiceReducer(prev, action));
        });
    };

    useEffect(() => {
        loadSuppliers();
        loadItems();
        loadUnits();
        if (isEdit) {
            loadInvoice();
        } else if (grnId) {
            loadGRNData(parseInt(grnId));
        } else if (quotationId) {
            loadQuotationData(parseInt(quotationId));
        }
    }, [id, quotationId, grnId]);

    const loadGRNData = async (gId: number) => {
        try {
            setLoading(true);
            const grn = await grnService.getGRNById(gId);
            if (grn) {
                const mappedData: SupplierInvoiceDto = {
                    ...formData,
                    grnId: gId,
                    grnNumber: grn.grnNumber,
                    supplierId: grn.supplierId,
                    notes: `تم الإنشاء من إذن إضافة رقم: ${grn.grnNumber}`,
                    items: grn.items.map(gItem => {
                        const price = gItem.unitCost || 0;
                        const qty = gItem.acceptedQty || gItem.receivedQty;
                        return {
                            itemId: gItem.itemId,
                            unitId: gItem.unitId,
                            quantity: qty,
                            unitPrice: price,
                            discountPercentage: 0,
                            taxPercentage: 14,
                            totalPrice: 0,
                            grnItemId: gItem.id
                        };
                    })
                };
                handleUpdate({ type: 'SET_DATA', payload: calculateInvoiceTotals(mappedData) });
                toast.success(`تم تحميل ${grn.items.length} صنف من إذن الإضافة`);
            }
        } catch (error) {
            console.error('Failed to load GRN data:', error);
            toast.error('فشل تحميل بيانات إذن الإضافة');
        } finally {
            setLoading(false);
        }
    };

    const loadQuotationData = async (qId: number) => {
        try {
            setLoading(true);
            const quotation = await purchaseService.getQuotationById(qId);
            if (quotation) {
                const mappedData: SupplierInvoiceDto = {
                    ...formData,
                    supplierId: quotation.supplierId,
                    currency: quotation.currency || 'EGP',
                    exchangeRate: quotation.exchangeRate || 1,
                    deliveryCost: quotation.deliveryCost || 0,
                    notes: `تم الإنشاء من عرض سعر رقم: ${quotation.quotationNumber}. ${quotation.notes || ''}`,
                    items: quotation.items.map(qItem => ({
                        itemId: qItem.itemId,
                        unitId: qItem.unitId,
                        quantity: qItem.offeredQty,
                        unitPrice: qItem.unitPrice,
                        discountPercentage: qItem.discountPercentage || 0,
                        taxPercentage: qItem.taxPercentage || 0,
                        totalPrice: 0,
                    }))
                };
                handleUpdate({ type: 'SET_DATA', payload: calculateInvoiceTotals(mappedData) });
                toast.success(`تم تحميل ${quotation.items.length} صنف من عرض السعر`);
            }
        } catch (error) {
            console.error('Failed to load quotation data:', error);
            toast.error('فشل تحميل بيانات عرض السعر');
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const data = await supplierService.getAllSuppliers();
            setSuppliers(data.data || []);
        } catch (error) { console.error(error); }
    };

    const loadItems = async () => {
        try {
            const data = await itemService.getActiveItems();
            setItems(data.data || []);
        } catch (error) { console.error(error); }
    };

    const loadUnits = async () => {
        try {
            const data = await unitService.getAllUnits();
            setUnits(data.data || []);
        } catch (error) { console.error(error); }
    };

    const loadInvoice = async () => {
        try {
            setLoading(true);
            const response = await supplierInvoiceService.getInvoiceById(parseInt(id!));
            handleUpdate({ type: 'SET_DATA', payload: calculateInvoiceTotals(response.data) });
        } catch (error) {
            toast.error('فشل تحميل الفاتورة');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplierId) {
            toast.error('يرجى اختيار المورد');
            return;
        }

        if (!formData.supplierInvoiceNo?.trim()) {
            toast.error('يرجى إدخال رقم فاتورة المورد (الورقي)');
            return;
        }

        if (!formData.items || formData.items.length === 0) {
            toast.error('يرجى إضافة صنف واحد على الأقل');
            return;
        }

        // Validate items using optimisticData
        const itemsToValidate = optimisticData.items || [];
        for (let i = 0; i < itemsToValidate.length; i++) {
            const item = itemsToValidate[i];
            if (!item.itemId) {
                toast.error(`يرجى اختيار الصنف في السطر ${i + 1}`);
                return;
            }
            if (!item.quantity || item.quantity <= 0) {
                toast.error(`يرجى إدخال كمية صحيحة في السطر ${i + 1}`);
                return;
            }
            if (!item.unitPrice || item.unitPrice <= 0) {
                toast.error(`يرجى إدخال سعر صحيح في السطر ${i + 1}`);
                return;
            }
        }

        try {
            setSaving(true);
            await supplierInvoiceService.createInvoice(optimisticData);
            toast.success('تم حفظ الفاتورة بنجاح');
            navigate('/dashboard/procurement/invoices');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل حفظ الفاتورة');
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

    const totalItems = optimisticData.items?.length || 0;

    if (loading && (grnId || quotationId)) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slide-in {
                    animation: slideInRight 0.4s ease-out;
                }
            `}</style>

            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Receipt className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? 'تعديل فاتورة' : 'تسجيل فاتورة مورد'}
                            </h1>
                            <p className="text-white/80 text-lg">تسجيل المطالبة المالية بناءً على المستندات الورقية من المورد</p>
                        </div>
                    </div>
                    {!isView && (
                        <button
                            onClick={handleSubmit}
                            disabled={saving || totalItems === 0}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl 
                                font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ واعتماد'}</span>
                        </button>
                    )}
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
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Info className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">بيانات الفاتورة الأساسية</h3>
                                    <p className="text-slate-500 text-sm">معلومات المورد والفاتورة</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(grnId || quotationId) && (
                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Hash className="w-4 h-4 text-brand-primary" />
                                        المستند المرجعي
                                    </label>
                                    <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-brand-primary/5 to-brand-primary/10 
                                        rounded-xl border-2 border-brand-primary/20">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                                            <FileText className="w-5 h-5 text-brand-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-brand-primary font-semibold">
                                                {grnId ? 'إذن إضافة' : 'عرض سعر'}
                                            </div>
                                            <div className="font-bold text-slate-800">
                                                {grnId ? `GRN #${optimisticData.grnNumber || grnId}` : `Quotation #${quotationId}`}
                                            </div>
                                        </div>
                                        {!loading && (formData.items || []).length > 0 && (
                                            <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Hash className="w-4 h-4 text-slate-400" />
                                    رقم الفاتورة (النظام)
                                </label>
                                <input
                                    type="text"
                                    value={optimisticData.invoiceNumber}
                                    disabled
                                    className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl 
                                        text-slate-500 font-semibold outline-none cursor-not-allowed"
                                    placeholder="سيتم إنشاؤه تلقائياً"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    رقم فاتورة المورد (الورقية) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={optimisticData.supplierInvoiceNo}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'supplierInvoiceNo', value: e.target.value })}
                                    required
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-mono font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                    placeholder={isView ? '' : "Supplier Inv #"}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    المورد <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={optimisticData.supplierId}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'supplierId', value: parseInt(e.target.value) })}
                                    required
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                >
                                    <option value="0">اختر المورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierNameAr}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف والأسعار</h3>
                                        <p className="text-slate-500 text-sm">تفاصيل البنود المشتراة</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-xl">
                                        <Package className="w-4 h-4 text-brand-primary" />
                                        <span className="text-sm font-bold text-brand-primary">
                                            {totalItems} صنف
                                        </span>
                                    </div>
                                    {!isView && (
                                        <button
                                            type="button"
                                            onClick={() => handleUpdate({ type: 'ADD_ITEM', })}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl 
                                                font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20
                                                hover:scale-105 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة صنف
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right">
                                            الصنف <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">
                                            الكمية <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">الوحدة</th>
                                        <th className="py-4 px-4 text-center">
                                            سعر الوحدة <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        <th className="py-4 pl-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(optimisticData.items || []).map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-6">
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        const updates: Partial<SupplierInvoiceItemDto> = { itemId: val };
                                                        const selectedItem = items.find(i => i.id === val);
                                                        if (selectedItem) updates.unitId = selectedItem.unitId;
                                                        handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: updates });
                                                    }}
                                                    required
                                                    disabled={isView}
                                                    className={`w-full min-w-[200px] px-3 py-2 border-2 border-slate-200 
                                                        rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                >
                                                    <option value="0">اختر صنف...</option>
                                                    {items.map(i => <option key={i.id} value={i.id}>{i.itemNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { quantity: parseFloat(e.target.value) || 0 } })}
                                                    required
                                                    disabled={isView}
                                                    min="0.001"
                                                    step="0.001"
                                                    className={`w-24 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-brand-primary outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70 text-brand-primary/50' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <select
                                                    value={item.unitId}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { unitId: parseInt(e.target.value) } })}
                                                    disabled={isView}
                                                    className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                >
                                                    <option value="0">الوحدة...</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.unitNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleUpdate({ type: 'UPDATE_ITEM', index: idx, item: { unitPrice: parseFloat(e.target.value) || 0 } })}
                                                    required
                                                    disabled={isView}
                                                    min="0.01"
                                                    step="0.01"
                                                    className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70 text-emerald-600/50' : 'bg-white text-emerald-600'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                {(item.totalPrice || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 pl-6 text-left">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdate({ type: 'REMOVE_ITEM', index: idx })}
                                                    className={`p-2 hover:bg-rose-50 rounded-lg transition-all ${isView ? 'hidden' : 'text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100'}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!optimisticData.items || optimisticData.items.length === 0) && (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 font-semibold">لم يتم إضافة أي أصناف بعد</p>
                                    <p className="text-slate-400 text-sm mt-1">انقر على "إضافة صنف" لبدء الإضافة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 
                        rounded-3xl p-6 text-white shadow-2xl animate-slide-in"
                        style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-xl">الملخص المالي</h3>
                        </div>
                        <div className="space-y-5 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">الإجمالي قبل الضريبة (الصافي)</span>
                                <span className="font-bold text-lg">
                                    {(optimisticData.totalAmount - (optimisticData.taxAmount || 0) - (optimisticData.deliveryCost || 0)).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                                <span className="text-rose-400 font-semibold text-sm">إجمالي الخصم</span>
                                <span className="font-bold text-lg text-rose-400">
                                    {optimisticData.discountAmount?.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <span className="text-emerald-400 font-semibold text-sm">ضريبة القيمة المضافة</span>
                                <span className="font-bold text-lg text-emerald-400">
                                    {optimisticData.taxAmount?.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <span className="text-blue-400 font-semibold text-sm">اسعار التوصيل</span>
                                <input
                                    type="number"
                                    value={optimisticData.deliveryCost || 0}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'deliveryCost', value: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="0.01"
                                    disabled={isView}
                                    className={`w-28 px-3 py-2 border-2 rounded-lg 
                                        font-bold text-right outline-none transition-all
                                        ${isView ? 'bg-slate-700/50 border-transparent text-slate-400 cursor-not-allowed' : 'bg-blue-500/10 border-blue-500/30 text-blue-400 focus:border-blue-500/50'}`}
                                />
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">إجمالي الفاتورة النهائي</div>
                                <div className="text-4xl font-black text-emerald-400">
                                    {optimisticData.totalAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                    <span className="text-sm font-bold mr-2">{optimisticData.currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '300ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-800">التواريخ والمواعيد</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    تاريخ الفاتورة <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={optimisticData.invoiceDate}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'invoiceDate', value: e.target.value })}
                                    required
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-rose-500" />
                                    تاريخ الاستحقاق <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={optimisticData.dueDate}
                                    onChange={(e) => handleUpdate({ type: 'UPDATE_FIELD', field: 'dueDate', value: e.target.value })}
                                    required
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70 border-rose-200' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 
                        flex gap-4 animate-slide-in shadow-lg"
                        style={{ animationDelay: '400ms' }}>
                        <div className="p-3 bg-amber-100 rounded-xl h-fit">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-800 mb-2">تنبيه هام</h4>
                            <p className="text-sm leading-relaxed text-amber-700">
                                سيتم تسجيل هذه الفاتورة كـ <strong>مطالبة مستحقة</strong> على الشركة للمورد فور الاعتماد.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SupplierInvoiceFormPage;