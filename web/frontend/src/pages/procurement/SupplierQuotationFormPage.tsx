import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    Trash2,
    ShoppingCart,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import purchaseService, { type SupplierQuotation, type SupplierQuotationItem, type Supplier, type RFQ } from '../../services/purchaseService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import toast from 'react-hot-toast';

const SupplierQuotationFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;

    // Get rfqId from URL
    const queryParams = new URLSearchParams(location.search);
    const rfqIdFromUrl = queryParams.get('rfqId');

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [loadingSupplierItems, setLoadingSupplierItems] = useState(false);

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
        totalAmount: 0,
        notes: '',
        items: []
    });

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
            setFormData(data);
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
    const calculateGrandTotal = (items: SupplierQuotationItem[]) => {
        return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    // Item Management
    const addItem = () => {
        const newItem: SupplierQuotationItem = {
            itemId: 0,
            offeredQty: 1,
            unitId: 0,
            unitPrice: 0,
            discountPercentage: 0,
            taxPercentage: 14,
            totalPrice: 0
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount: calculateGrandTotal(newItems)
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

        updatedItem.totalPrice = calculateItemTotal(updatedItem);
        newItems[index] = updatedItem;

        setFormData(prev => ({
            ...prev,
            items: newItems,
            totalAmount: calculateGrandTotal(newItems)
        }));
    };

    // RFQ Linkage - Auto populate items
    const handleRFQLink = async (rfqId: number) => {
        if (rfqId === 0) return;
        try {
            const rfq = await purchaseService.getRFQById(rfqId);

            // Load supplier items to get catalog prices
            const result = await supplierService.getSupplierItems(rfq.supplierId);
            const fetchedItems = result.data || [];
            setSupplierItems(fetchedItems);

            const rfqItems = rfq.items.map(ri => {
                // Check if this item has a catalog price
                const catalogPrice = fetchedItems.find(si => si.itemId === ri.itemId)?.lastPrice || 0;
                const qty = ri.requestedQty;
                const gross = qty * catalogPrice;
                const taxAmount = gross * 0.14;
                return {
                    itemId: ri.itemId,
                    offeredQty: qty,
                    unitId: ri.unitId,
                    unitPrice: catalogPrice,
                    discountPercentage: 0,
                    taxPercentage: 14,
                    totalPrice: gross + taxAmount
                };
            });
            const total = rfqItems.reduce((sum, item) => sum + item.totalPrice, 0);
            setFormData(prev => ({
                ...prev,
                rfqId: rfqId,
                supplierId: rfq.supplierId,
                items: rfqItems,
                totalAmount: total
            }));
        } catch (error) {
            console.error('Failed to link RFQ:', error);
        }
    };

    // Save quotation and update supplier item prices
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.supplierId === 0) {
            toast.error('يرجى اختيار المورد');
            return;
        }

        if (formData.items.length === 0) {
            toast.error('يرجى إضافة بند واحد على الأقل');
            return;
        }

        try {
            setSaving(true);

            // 1. Save the quotation
            await purchaseService.createQuotation(formData);

            // 2. Update supplier item prices in the catalog
            for (const item of formData.items) {
                if (item.itemId && item.unitPrice > 0) {
                    try {
                        // Check if this item exists in supplier catalog
                        const existingItem = supplierItems.find(si => si.itemId === item.itemId);
                        if (existingItem) {
                            // Update existing item with new price
                            await supplierService.linkItem({
                                ...existingItem,
                                lastPrice: item.unitPrice,
                                lastPriceDate: new Date().toISOString().split('T')[0]
                            });
                        } else {
                            // Add new item to supplier catalog
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

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/procurement/quotation')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? `تعديل عرض سعر #${formData.quotationNumber}` : 'تسجيل عرض سعر جديد'}
                        </h1>
                        <p className="text-slate-500">أدخل تفاصيل عرض السعر المستلم من المورد</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl 
                            font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ عرض السعر'}</span>
                    </button>
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">رابط بطلب سعر (اختياري)</label>
                        <select
                            value={formData.rfqId || 0}
                            onChange={(e) => handleRFQLink(parseInt(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all"
                        >
                            <option value={0}>لا يوجد...</option>
                            {rfqs.map(r => (
                                <option key={r.id} value={r.id}>{r.rfqNumber} - {r.supplierNameAr}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">المورد</label>
                        <div className="relative">
                            <select
                                value={formData.supplierId}
                                onChange={(e) => handleSupplierChange(parseInt(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all"
                            >
                                <option value={0}>اختر المورد...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.supplierNameAr} ({s.supplierCode})</option>
                                ))}
                            </select>
                            {loadingSupplierItems && (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        {supplierItems.length > 0 && (
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                تم تحميل {supplierItems.length} صنف من كتالوج المورد - الأسعار ستُحفظ تلقائياً
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">رقم عرض السعر (عند المورد)</label>
                        <input
                            type="text"
                            value={formData.quotationNumber || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, quotationNumber: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all"
                            placeholder="INV-XXX"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">تاريخ العرض</label>
                        <input
                            type="date"
                            value={formData.quotationDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, quotationDate: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">صالح حتى</label>
                        <input
                            type="date"
                            value={formData.validUntilDate || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, validUntilDate: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">مدة التوريد (أيام)</label>
                        <input
                            type="number"
                            value={formData.deliveryDays}
                            onChange={(e) => setFormData(prev => ({ ...prev, deliveryDays: parseInt(e.target.value) }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-600 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-indigo-600" />
                            الأصناف المسعرة
                        </h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all"
                        >
                            + إضافة صنف
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-slate-500 text-xs border-b border-slate-100">
                                    <th className="pb-3 pr-2">الصنف</th>
                                    <th className="pb-3">الكمية</th>
                                    <th className="pb-3">السعر</th>
                                    <th className="pb-3">خصم %</th>
                                    <th className="pb-3">الضريبة %</th>
                                    <th className="pb-3 text-left pl-2">الإجمالي</th>
                                    <th className="pb-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {formData.items.map((item, index) => (
                                    <tr key={index} className="group">
                                        <td className="py-3 pr-2">
                                            <select
                                                value={item.itemId}
                                                onChange={(e) => updateItem(index, 'itemId', parseInt(e.target.value))}
                                                className="w-48 px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 outline-none text-sm"
                                            >
                                                <option value={0}>اختر...</option>
                                                {items.map(i => (
                                                    <option key={i.id} value={i.id}>{i.itemNameAr}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                value={item.offeredQty}
                                                onChange={(e) => updateItem(index, 'offeredQty', parseFloat(e.target.value))}
                                                className="w-20 px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 outline-none text-sm"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                                className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 outline-none text-sm"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                value={item.discountPercentage}
                                                onChange={(e) => updateItem(index, 'discountPercentage', parseFloat(e.target.value))}
                                                className="w-16 px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 outline-none text-sm"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                value={item.taxPercentage}
                                                onChange={(e) => updateItem(index, 'taxPercentage', parseFloat(e.target.value))}
                                                className="w-16 px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-600 outline-none text-sm"
                                            />
                                        </td>
                                        <td className="py-3 text-left pl-2 font-bold text-slate-700">
                                            {item.totalPrice.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between items-center text-slate-500">
                                <span>الإجمالي قبل الضريبة:</span>
                                <span>{formData.items.reduce((sum, i) => sum + (i.offeredQty * i.unitPrice * (1 - (i.discountPercentage || 0) / 100)), 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span>ضريبة القيمة المضافة:</span>
                                <span>{formData.items.reduce((sum, i) => sum + (calculateItemTotal(i) - (i.offeredQty * i.unitPrice * (1 - (i.discountPercentage || 0) / 100))), 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-indigo-600 pt-2 border-t border-slate-50">
                                <span>الإجمالي النهائي:</span>
                                <span>{formData.totalAmount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SupplierQuotationFormPage;
