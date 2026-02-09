import React, { useState, useEffect, useOptimistic, useTransition } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    Trash2,
    ShoppingCart,
    ArrowRight,
    Sparkles,
    FileText,
    Building2,
    Calendar,
    DollarSign,
    Package,
    Truck,
    Clock,
    AlertCircle,
    CheckCircle2,
    Eye,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import purchaseService, { type SupplierQuotation, type SupplierQuotationItem, type Supplier, type RFQ } from '../../services/purchaseService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { formatNumber } from '../../utils/format';
import toast from 'react-hot-toast';

const SupplierQuotationFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;

    // Get rfqId from URL
    const queryParams = new URLSearchParams(location.search);
    const rfqIdFromUrl = queryParams.get('rfqId');
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    // State
    const [loading, setLoading] = useState(false);
    const [, startTransition] = useTransition();
    const [saving, setSaving] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [rfqItems, setRfqItems] = useState<any[]>([]);
    const [loadingSupplierItems, setLoadingSupplierItems] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState<SupplierQuotation>({
        quotationNumber: '',
        supplierId: 0,
        quotationDate: new Date().toISOString().split('T')[0],
        validUntilDate: '',
        currency: 'EGP',
        exchangeRate: 1,
        paymentTerms: '',
        deliveryTerms: '',
        deliveryDays: 0,
        deliveryCost: 0,
        totalAmount: 0,
        notes: '',
        items: []
    });

    const [optimisticData, addOptimisticData] = useOptimistic(
        formData,
        (current, updatedField: Partial<SupplierQuotation>) => ({ ...current, ...updatedField })
    );

    // Load Data
    useEffect(() => {
        loadDependencies();
        if (isEdit) {
            loadQuotation(parseInt(id));
        } else if (rfqIdFromUrl) {
            handleRFQLink(parseInt(rfqIdFromUrl));
        }
    }, [id, rfqIdFromUrl]);

    const loadDependencies = async () => {
        try {
            const [suppliersData, rfqsData, itemsData] = await Promise.all([
                purchaseService.getAllSuppliers(),
                purchaseService.getAllRFQs(),
                itemService.getAllItems()
            ]);
            setSuppliers(suppliersData);
            setRfqs(rfqsData);
            setItems(itemsData.data || []);
        } catch (error) {
            console.error('Failed to load dependencies:', error);
            toast.error('فشل تحميل البيانات الأساسية');
        }
    };

    const loadQuotation = async (qId: number) => {
        try {
            setLoading(true);
            const data = await purchaseService.getQuotationById(qId);

            const itemsGrandTotal = calculateGrandTotal(data.items, 0);
            const derivedDeliveryCost = data.totalAmount - itemsGrandTotal;

            setFormData({
                ...data,
                deliveryCost: data.deliveryCost || derivedDeliveryCost
            });

            if (data.rfqId) {
                purchaseService.getRFQById(data.rfqId).then(rfq => {
                    setRfqItems(rfq.items);
                }).catch(err => console.error('Failed to load linked RFQ:', err));
            }
        } catch (error) {
            console.error('Failed to load quotation:', error);
            navigate('/dashboard/procurement/quotation');
        } finally {
            setLoading(false);
        }
    };

    // Handle supplier change - auto-load supplier items
    const handleSupplierChange = async (supplierId: number) => {
        setFormData(prev => ({ ...prev, supplierId }));

        if (supplierId === 0) {
            setSupplierItems([]);
            return;
        }

        try {
            setLoadingSupplierItems(true);
            const result = await supplierService.getSupplierItems(supplierId);
            const fetchedItems = result.data || [];
            setSupplierItems(fetchedItems);

            // Auto-populate form items with supplier's registered products (only if empty)
            if (fetchedItems.length > 0 && formData.items.length === 0) {
                const autoItems: SupplierQuotationItem[] = fetchedItems.map(si => {
                    const itemData = items.find(i => i.id === si.itemId);
                    return {
                        itemId: si.itemId,
                        offeredQty: si.minOrderQty || 1,
                        unitId: itemData?.unitId || 0,
                        unitPrice: si.lastPrice || 0,
                        discountPercentage: 0,
                        taxPercentage: 14,
                        totalPrice: ((si.lastPrice || 0) * (si.minOrderQty || 1)) * 1.14
                    };
                });
                const total = autoItems.reduce((sum, item) => sum + item.totalPrice, 0);
                setFormData(prev => ({ ...prev, items: autoItems, totalAmount: total }));
                toast.success(`تم تحميل ${fetchedItems.length} صنف من كتالوج المورد`, { icon: '📦' });
            }
        } catch (error) {
            console.error('Failed to load supplier items:', error);
        } finally {
            setLoadingSupplierItems(false);
        }
    };

    // Get supplier price for an item
    const getSupplierPrice = (itemId: number): number | undefined => {
        return supplierItems.find(si => si.itemId === itemId)?.lastPrice;
    };

    // Calculate item total
    const calculateItemTotal = (item: SupplierQuotationItem) => {
        const gross = item.offeredQty * item.unitPrice;
        const discountAmount = (gross * (item.discountPercentage || 0)) / 100;
        const taxAmount = ((gross - discountAmount) * (item.taxPercentage || 0)) / 100;
        return gross - discountAmount + taxAmount;
    };

    // Calculate grand total
    const calculateGrandTotal = (items: SupplierQuotationItem[], deliveryCost: number = 0) => {
        const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        return itemsTotal + deliveryCost;
    };

    // Item Management - Remove item only (no add)
    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount: calculateGrandTotal(newItems, prev.deliveryCost)
        }));
    };

    const updateItem = (index: number, field: keyof SupplierQuotationItem, value: any) => {
        const newItems = [...formData.items];
        const updatedItem = { ...newItems[index], [field]: value };

        // Auto-select unit and price from catalog
        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) updatedItem.unitId = selectedItem.unitId;

            // Auto-fill price from supplier catalog
            const catalogPrice = getSupplierPrice(value);
            if (catalogPrice) updatedItem.unitPrice = catalogPrice;
        }

        // Quantity Validation against RFQ
        if (field === 'offeredQty' && formData.rfqId) {
            const rfqItem = rfqItems.find(ri => ri.itemId === updatedItem.itemId);
            if (rfqItem && value > rfqItem.requestedQty) {
                toast.error(`الكمية المطلوبة لهذا الصنف في طلب السعر هي ${rfqItem.requestedQty}. لا يمكن تجاوزها.`, {
                    icon: '⚠️',
                    duration: 4000
                });
                return;
            }
        }

        updatedItem.totalPrice = calculateItemTotal(updatedItem);
        newItems[index] = updatedItem;

        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount: calculateGrandTotal(newItems, prev.deliveryCost)
        }));
    };

    // RFQ Linkage - Auto populate items
    const handleRFQLink = async (rfqId: number) => {
        if (rfqId === 0) return;
        try {
            // Check for existing quotation for this RFQ
            // Note: Ideally this should be a backend check endpoint, but for now filtering all quotations
            // or relying on backend constraint on save. Better UX to check here.

            // Only perform this check if we are creating a New quotation (not editing)
            if (!isEdit) {
                const allQuotations = await purchaseService.getAllQuotations();
                const existing = allQuotations.find(q => q.rfqId === rfqId);

                if (existing) {
                    toast.error('عذراً، يوجد بالفعل عرض سعر مسجل لطلب السعر هذا', { duration: 4000, icon: '⚠️' });
                    // Reset selection if needed, or just warn
                    // To strictly prevent, we could set rfqId back to 0 or null, but let's just warn and clear
                    setFormData(prev => ({ ...prev, rfqId: undefined })); // Clear RFQ link
                    return;
                }
            }

            const rfq = await purchaseService.getRFQById(rfqId);
            setRfqItems(rfq.items);

            // Load supplier items to get catalog prices
            const result = await supplierService.getSupplierItems(rfq.supplierId);
            const fetchedItems = result.data || [];
            setSupplierItems(fetchedItems);

            const rfqItems = rfq.items.map(ri => {
                const catalogPrice = fetchedItems.find(si => si.itemId === ri.itemId)?.lastPrice || 0;
                const estimatedPrice = ri.estimatedPrice || 0;
                const unitPrice = estimatedPrice > 0 ? estimatedPrice : catalogPrice;
                const qty = ri.requestedQty;
                const gross = qty * unitPrice;
                const taxAmount = gross * 0.14;
                return {
                    itemId: ri.itemId,
                    offeredQty: qty,
                    unitId: ri.unitId,
                    unitPrice,
                    discountPercentage: 0,
                    taxPercentage: 14,
                    totalPrice: gross + taxAmount,
                    polymerGrade: ''
                };
            });
            setFormData(prev => {
                const updatedItemsTotal = rfqItems.reduce((sum, item) => sum + item.totalPrice, 0);
                const currentDeliveryCost = prev.deliveryCost || 0;
                return {
                    ...prev,
                    rfqId: rfqId,
                    supplierId: rfq.supplierId,
                    items: rfqItems,
                    totalAmount: updatedItemsTotal + currentDeliveryCost
                };
            });
        } catch (error) {
            console.error('Failed to link RFQ:', error);
            toast.error('حدث خطأ أثناء فحص أو تحميل بيانات طلب السعر');
        }
    };

    // Save quotation and update supplier item prices
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.rfqId) {
            toast.error('يرجى اختيار طلب السعر');
            return;
        }

        if (formData.supplierId === 0) {
            toast.error('سيتم تحديد المورد تلقائياً عند اختيار طلب السعر');
            return;
        }

        if (!formData.quotationNumber?.trim()) {
            toast.error('يرجى إدخال رقم عرض السعر');
            return;
        }

        if (!formData.validUntilDate) {
            toast.error('يرجى تحديد تاريخ انتهاء الصلاحية');
            return;
        }

        if (!formData.deliveryDays || formData.deliveryDays <= 0) {
            toast.error('يرجى إدخال مدة التوريد أكبر من صفر');
            return;
        }

        if (formData.items.length === 0) {
            toast.error('يرجى إضافة صنف واحد على الأقل');
            return;
        }

        // Validate all items
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (item.itemId === 0) {
                toast.error(`يرجى اختيار الصنف في السطر ${i + 1}`);
                return;
            }
            if (item.offeredQty <= 0) {
                toast.error(`يرجى إدخال كمية صحيحة في السطر ${i + 1}`);
                return;
            }
            if (item.unitPrice <= 0) {
                toast.error(`يرجى إدخال سعر صحيح في السطر ${i + 1}`);
                return;
            }

            // Final check for RFQ quantity
            if (formData.rfqId) {
                const rfqItem = rfqItems.find(ri => ri.itemId === item.itemId);
                if (rfqItem && item.offeredQty > rfqItem.requestedQty) {
                    toast.error(`الكمية في السطر ${i + 1} تتجاوز الكمية المطلوبة في طلب السعر (${rfqItem.requestedQty})`);
                    return;
                }
            }
        }

        try {
            setSaving(true);

            // 1. Save the quotation (create or update)
            if (isEdit && id) {
                await purchaseService.updateQuotation(parseInt(id), formData);
            } else {
                await purchaseService.createQuotation(formData);
            }

            // 2. Update supplier item prices in the catalog
            for (const item of formData.items) {
                if (item.itemId && item.unitPrice > 0) {
                    try {
                        const existingItem = supplierItems.find(si => si.itemId === item.itemId);
                        if (existingItem) {
                            await supplierService.linkItem({
                                ...existingItem,
                                lastPrice: item.unitPrice,
                                lastPriceDate: new Date().toISOString().split('T')[0]
                            });
                        } else {
                            await supplierService.linkItem({
                                supplierId: formData.supplierId,
                                itemId: item.itemId,
                                lastPrice: item.unitPrice,
                                lastPriceDate: new Date().toISOString().split('T')[0],
                                isActive: true
                            });
                        }
                    } catch (priceError) {
                        console.error('Failed to update item price:', priceError);
                    }
                }
            }

            toast.success('تم حفظ عرض السعر وتحديث أسعار المورد');
            navigate('/dashboard/procurement/quotation');
        } catch (error) {
            console.error('Failed to save quotation:', error);
            toast.error('حدث خطأ أثناء حفظ العرض');
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

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

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
                            onClick={() => navigate('/dashboard/procurement/quotation')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <FileText className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? `تعديل عرض سعر #${formData.quotationNumber}` : 'تسجيل عرض سعر جديد'}
                            </h1>
                            <p className="text-white/80 text-lg">أدخل تفاصيل عرض السعر المستلم من المورد</p>
                        </div>
                    </div>
                    {!isView && (
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl 
                                font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ عرض السعر'}</span>
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
                            <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold">وضع العرض فقط</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Building2 className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">معلومات المورد والعرض</h3>
                                    <p className="text-slate-500 text-sm">البيانات الأساسية لعرض السعر</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    طلب السعر <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.rfqId || 0}
                                    onChange={(e) => handleRFQLink(parseInt(e.target.value))}
                                    disabled={isView}
                                    required
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                >
                                    <option value={0}>اختر طلب السعر...</option>
                                    {rfqs.filter(r => ((!r.hasActiveOrders && !r.hasQuotation && r.prId) || r.id === formData.rfqId)).map(r => (
                                        <option key={r.id} value={r.id}>{r.rfqNumber} - {r.supplierNameAr}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    المورد <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.supplierId}
                                        onChange={(e) => handleSupplierChange(parseInt(e.target.value))}
                                        required
                                        disabled={true} // Auto-assigned from RFQ
                                        className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                            focus:border-brand-primary outline-none transition-all font-semibold
                                            ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                    >
                                        <option value={0}>اختر المورد...</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.supplierNameAr} ({s.supplierCode})</option>
                                        ))}
                                    </select>
                                    {loadingSupplierItems && (
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {supplierItems.length > 0 && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-lg">
                                        <Sparkles className="w-3 h-3" />
                                        تم تحميل {supplierItems.length} صنف من كتالوج المورد - الأسعار ستُحفظ تلقائياً
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    رقم عرض السعر (عند المورد) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.quotationNumber || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quotationNumber: e.target.value }))}
                                    required
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                    placeholder={isView ? '' : "INV-XXX"}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    تاريخ العرض <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.quotationDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quotationDate: e.target.value }))}
                                    required
                                    disabled={true}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${true ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-rose-500" />
                                    صالح حتى <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.validUntilDate || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, validUntilDate: e.target.value }))}
                                    required
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Clock className="w-4 h-4 text-brand-primary" />
                                    مدة التوريد (أيام) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.deliveryDays}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: parseInt(e.target.value) || 0 }))}
                                    required
                                    min="1"
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <DollarSign className="w-4 h-4 text-brand-primary" />
                                    طريقة الدفع
                                </label>
                                <input
                                    type="text"
                                    value={formData.paymentTerms || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                    placeholder={isView ? '' : "مثلاً: كاش، 50% مقدم، ..."}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Table - Button Removed */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <ShoppingCart className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">الأصناف المسعرة</h3>
                                    <p className="text-slate-500 text-sm">قائمة الأصناف وأسعارها حسب عرض المورد</p>
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
                                        <th className="py-4 px-4 text-center">
                                            السعر <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">درجة البوليمر</th>
                                        <th className="py-4 px-4 text-center">خصم %</th>
                                        <th className="py-4 px-4 text-center">الضريبة %</th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        <th className="py-4 pl-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-6">
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => updateItem(index, 'itemId', parseInt(e.target.value))}
                                                    required
                                                    disabled={isView}
                                                    className={`w-full min-w-[200px] px-3 py-2 border-2 border-slate-200 
                                                        rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                >
                                                    <option value={0}>اختر صنف...</option>
                                                    {items.map(i => (
                                                        <option key={i.id} value={i.id}>{i.itemNameAr}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.offeredQty}
                                                    onChange={(e) => updateItem(index, 'offeredQty', parseFloat(e.target.value))}
                                                    required
                                                    min="0.01"
                                                    step="0.01"
                                                    disabled={isView}
                                                    className={`w-24 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-brand-primary outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                                    required
                                                    min="0.01"
                                                    step="0.01"
                                                    disabled={isView}
                                                    className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-emerald-600 outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="text"
                                                    value={item.polymerGrade || ''}
                                                    onChange={(e) => updateItem(index, 'polymerGrade', e.target.value)}
                                                    disabled={isView}
                                                    className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-semibold outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                    placeholder={isView ? '' : "Grade"}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.discountPercentage}
                                                    onChange={(e) => updateItem(index, 'discountPercentage', parseFloat(e.target.value))}
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    disabled={isView}
                                                    className={`w-20 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.taxPercentage}
                                                    onChange={(e) => updateItem(index, 'taxPercentage', parseFloat(e.target.value))}
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    disabled={isView}
                                                    className={`w-20 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                {formatNumber(item.totalPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 pl-6 text-left">
                                                {!isView && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 
                                                            rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {formData.items.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 font-semibold">لا توجد أصناف</p>
                                    <p className="text-slate-400 text-sm mt-1">اختر مورد أو طلب سعر لتحميل الأصناف تلقائياً</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-brand-primary/10 rounded-xl">
                                        <Truck className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 tracking-tight">اسعار التوصيل</h4>
                                        <p className="text-slate-500 text-xs font-medium">تكلفة الشحن والتوصيل لهذا العرض</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-56">
                                    <input
                                        type="number"
                                        value={optimisticData.deliveryCost || 0}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const updates = {
                                                deliveryCost: val,
                                                totalAmount: calculateGrandTotal(optimisticData.items, val)
                                            };
                                            addOptimisticData(updates);
                                            startTransition(() => {
                                                setFormData(prev => ({ ...prev, ...updates }));
                                            });
                                        }}
                                        disabled={isView}
                                        className={`w-full px-5 py-3 border-2 border-slate-200 rounded-2xl 
                                            text-xl text-center font-black text-brand-primary outline-none focus:border-brand-primary 
                                            transition-all shadow-sm
                                            ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                                        {optimisticData.currency}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (1/3) */}
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
                                <span className="text-white/60 text-sm">الإجمالي قبل الضريبة</span>
                                <span className="font-bold text-lg">
                                    {formatNumber(optimisticData.items.reduce((sum, i) => sum + (i.offeredQty * i.unitPrice * (1 - (i.discountPercentage || 0) / 100)), 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <span className="text-emerald-400 font-semibold text-sm">ضريبة القيمة المضافة</span>
                                <span className="font-bold text-lg text-emerald-400">
                                    {formatNumber(optimisticData.items.reduce((sum, i) => {
                                        const beforeTax = i.offeredQty * i.unitPrice * (1 - (i.discountPercentage || 0) / 100);
                                        const taxAmount = beforeTax * ((i.taxPercentage || 0) / 100);
                                        return sum + taxAmount;
                                    }, 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">اسعار التوصيل</span>
                                <span className="font-bold text-lg text-white">
                                    {formatNumber(optimisticData.deliveryCost ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <div className="text-xs text-white/40 mb-2">الإجمالي النهائي</div>
                            <div className="flex items-center justify-between">
                                <div className="relative flex-1 max-w-[200px]">
                                    <input
                                        type="number"
                                        value={optimisticData.totalAmount || 0}
                                        onChange={(e) => {
                                            const totalVal = parseFloat(e.target.value) || 0;
                                            // Calculate items total + tax (without delivery)
                                            const itemsGrandTotal = calculateGrandTotal(optimisticData.items, 0); 
                                            const derivedDeliveryCost = totalVal - itemsGrandTotal;

                                            const updates = {
                                                totalAmount: totalVal,
                                                deliveryCost: derivedDeliveryCost
                                            };

                                            startTransition(() => {
                                                addOptimisticData(updates);
                                                setFormData(prev => ({ ...prev, ...updates }));
                                            });
                                        }}
                                        disabled={isView}
                                        className={`w-full border rounded-xl px-4 py-2 text-2xl font-black outline-none transition-all text-right
                                            ${isView
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/70 cursor-not-allowed'
                                                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 focus:border-emerald-400'}`}
                                    />
                                </div>
                                <span className="text-sm font-bold mr-2 text-emerald-400/60">{optimisticData.currency || 'EGP'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '300ms' }}>
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
                                value={optimisticData.notes || ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    startTransition(() => {
                                        addOptimisticData({ notes: val });
                                        setFormData(prev => ({ ...prev, notes: val }));
                                    });
                                }}
                                disabled={isView}
                                className={`w-full p-4 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all 
                                        text-sm leading-relaxed h-40 resize-none
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                placeholder={isView ? '' : "أي ملاحظات حول العرض أو شروط خاصة..."}
                            />
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="p-5 bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 rounded-2xl border-2 border-brand-primary/20 
                        flex gap-4 animate-slide-in shadow-lg"
                        style={{ animationDelay: '400ms' }}>
                        <div className="p-3 bg-blue-100 rounded-xl h-fit">
                            <AlertCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-800 mb-2">معلومة هامة</h4>
                            <p className="text-sm leading-relaxed text-blue-700">
                                سيتم حفظ أسعار الأصناف تلقائياً في <strong>كتالوج المورد</strong> لاستخدامها في الطلبات المستقبلية.
                            </p>
                        </div>
                    </div>
                </div> {/* End of Sidebar */}
            </form>
        </div>
    );
};

export default SupplierQuotationFormPage;