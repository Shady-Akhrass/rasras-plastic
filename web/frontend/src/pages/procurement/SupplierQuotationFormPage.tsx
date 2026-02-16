import React, { useState, useEffect, useOptimistic, useTransition, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    Trash2,
    ShoppingCart,
    ArrowRight,
    Sparkles,
    FileText,
    Building2,
    DollarSign,
    Package,
    Truck,
    Clock,
    AlertCircle,
    CheckCircle2,
    Eye,
    XCircle,
    RefreshCw,
    Lock,
    Users,
    Copy,
    Check,
    ChevronDown,
    Search,
    X
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import purchaseService, { type SupplierQuotation, type SupplierQuotationItem, type Supplier, type RFQ } from '../../services/purchaseService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { formatNumber } from '../../utils/format';
import { itemService, type ItemDto } from '../../services/itemService';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import toast from 'react-hot-toast';

// Multi Select Dropdown for Additional Suppliers
const MultiSelectDropdown: React.FC<{
    options: { value: number; label: string; code?: string }[];
    selectedValues: number[];
    onChange: (values: number[]) => void;
    placeholder?: string;
    disabled?: boolean;
}> = ({ options, selectedValues, onChange, placeholder, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (opt.code && opt.code.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [options, searchTerm]);

    const toggleOption = (value: number) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const selectAll = () => onChange(filteredOptions.map(opt => opt.value));
    const deselectAll = () => onChange([]);

    const selectedLabels = options
        .filter(opt => selectedValues.includes(opt.value))
        .map(opt => opt.label);

    if (disabled) {
        return (
            <div className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl 
                text-slate-400 text-sm cursor-not-allowed opacity-70">
                {placeholder || 'غير متاح'}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                        text-right bg-white flex items-center justify-between
                        ${isOpen
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-transparent bg-slate-50 hover:border-slate-300'
                        }`}
                >
                    <div className="flex-1 truncate">
                        {selectedValues.length === 0 ? (
                            <span className="text-slate-400 text-sm">{placeholder || 'اختر...'}</span>
                        ) : selectedValues.length === 1 ? (
                            <span className="text-slate-800 font-medium text-sm">{selectedLabels[0]}</span>
                        ) : (
                            <span className="text-slate-800 font-medium text-sm">
                                تم اختيار {formatNumber(selectedValues.length)} مورد
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedValues.length > 0 && (
                            <span className="px-2.5 py-1 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-sm">
                                {formatNumber(selectedValues.length)}
                            </span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200
                            ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 
                            shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-3 border-b border-slate-100">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="بحث في الموردين..."
                                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 
                                            focus:border-brand-primary outline-none text-sm bg-slate-50 focus:bg-white transition-all"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-xs text-slate-500 font-medium">
                                    {formatNumber(filteredOptions.length)} مورد متاح
                                </span>
                                <div className="flex gap-1">
                                    <button type="button" onClick={selectAll}
                                        className="px-3 py-1.5 text-xs font-bold text-brand-primary 
                                            hover:bg-brand-primary/10 rounded-lg transition-colors">
                                        تحديد الكل
                                    </button>
                                    <button type="button" onClick={deselectAll}
                                        className="px-3 py-1.5 text-xs font-bold text-slate-500 
                                            hover:bg-slate-100 rounded-lg transition-colors">
                                        إلغاء الكل
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map(opt => {
                                        const isSelected = selectedValues.includes(opt.value);
                                        return (
                                            <div key={opt.value} onClick={() => toggleOption(opt.value)}
                                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                                                    ${isSelected
                                                        ? 'bg-brand-primary/5 border-r-4 border-brand-primary'
                                                        : 'hover:bg-slate-50 border-r-4 border-transparent'}`}>
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center
                                                    transition-all duration-200
                                                    ${isSelected
                                                        ? 'bg-brand-primary border-brand-primary text-white scale-110'
                                                        : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-medium text-sm ${isSelected ? 'text-brand-primary' : 'text-slate-800'}`}>
                                                        {opt.label}
                                                    </div>
                                                    {opt.code && <div className="text-xs text-slate-400 font-mono">{opt.code}</div>}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-8 text-center text-slate-400 text-sm">لا توجد نتائج</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {options
                        .filter(opt => selectedValues.includes(opt.value))
                        .slice(0, 3)
                        .map(opt => (
                            <span
                                key={opt.value}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 
                                    text-brand-primary text-xs font-bold rounded-xl border border-brand-primary/10"
                            >
                                {opt.label}
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleOption(opt.value); }}
                                    className="hover:bg-brand-primary/20 rounded-full p-0.5 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    {selectedValues.length > 3 && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                            +{selectedValues.length - 3} آخرين
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

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
    const { defaultCurrency, getCurrencyLabel, convertAmount } = useSystemSettings();
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
    const [isLocked, setIsLocked] = useState(false);
    
    // Additional suppliers for copying quotation
    const [additionalSupplierIds, setAdditionalSupplierIds] = useState<number[]>([]);

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
        otherCosts: 0,
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

            setFormData({
                ...data,
                deliveryCost: data.deliveryCost || 0,
                otherCosts: data.otherCosts || 0,
                totalAmount: data.totalAmount || 0
            });

            if (data.rfqId) {
                purchaseService.getRFQById(data.rfqId).then(rfq => {
                    setRfqItems(rfq.items);
                }).catch(err => console.error('Failed to load linked RFQ:', err));
            }

            // Check if this quotation is part of a comparison
            checkIfQuotationIsLocked(qId);
        } catch (error) {
            console.error('Failed to load quotation:', error);
            navigate('/dashboard/procurement/quotation');
        } finally {
            setLoading(false);
        }
    };

    const checkIfQuotationIsLocked = async (quotationId: number) => {
        try {
            const comparisons = await purchaseService.getAllComparisons();
            const isLocked = comparisons.some(comp =>
                comp.details && comp.details.some(detail => detail.quotationId === quotationId)
            );
            setIsLocked(isLocked);
        } catch (error) {
            console.error('Failed to check if quotation is locked:', error);
            setIsLocked(false);
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
    const calculateGrandTotal = (items: SupplierQuotationItem[], deliveryCost: number = 0, otherCosts: number = 0) => {
        const itemsTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        return itemsTotal + deliveryCost + otherCosts;
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
            totalAmount: calculateGrandTotal(newItems, prev.deliveryCost, prev.otherCosts)
        }));
    };

    // RFQ Linkage - Auto populate items
    const handleRFQLink = async (rfqId: number) => {
        if (rfqId === 0) return;
        try {
            const rfq = await purchaseService.getRFQById(rfqId);
            
            // Check for existing quotation for this RFQ from the SAME supplier
            // This allows multiple quotations from different suppliers for the same RFQ
            if (!isEdit) {
                const allQuotations = await purchaseService.getAllQuotations();
                const existing = allQuotations.find(q => q.rfqId === rfqId && q.supplierId === rfq.supplierId);

                if (existing) {
                    toast.error(`عذراً، يوجد بالفعل عرض سعر من المورد ${rfq.supplierNameAr} لطلب السعر هذا`, { 
                        duration: 4000, 
                        icon: '⚠️' 
                    });
                    setFormData(prev => ({ ...prev, rfqId: undefined }));
                    return;
                }
            }
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
                const currentOtherCosts = prev.otherCosts || 0;
                return {
                    ...prev,
                    rfqId: rfqId,
                    supplierId: rfq.supplierId,
                    items: rfqItems,
                    totalAmount: updatedItemsTotal + currentDeliveryCost + currentOtherCosts
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
            let successCount = 0;
            let failCount = 0;

            // 1. Save the main quotation (create or update)
            if (isEdit && id) {
                await purchaseService.updateQuotation(parseInt(id), formData);
                successCount = 1;
            } else {
                // Create main quotation
                await purchaseService.createQuotation(formData);
                successCount = 1;

                // 3. Create quotations for additional suppliers if any
                if (additionalSupplierIds.length > 0) {
                    const toastId = toast.loading(`جاري نسخ العرض (0/${additionalSupplierIds.length})...`);
                    
                    for (let i = 0; i < additionalSupplierIds.length; i++) {
                        const supplierId = additionalSupplierIds[i];
                        
                        try {
                            // Check if quotation already exists for this supplier
                            const allQuotations = await purchaseService.getAllQuotations();
                            const existing = allQuotations.find(q => q.rfqId === formData.rfqId && q.supplierId === supplierId);
                            
                            if (existing) {
                                failCount++;
                                toast.error(`يوجد عرض سعر من ${suppliers.find(s => s.id === supplierId)?.supplierNameAr} مسبقاً`, {
                                    duration: 2000
                                });
                                continue;
                            }

                            // Create quotation for additional supplier with same data
                            const additionalQuotation: SupplierQuotation = {
                                ...formData,
                                supplierId: supplierId,
                                notes: formData.notes ? `${formData.notes}\n(نسخة من عرض ${formData.quotationNumber})` : `نسخة من عرض ${formData.quotationNumber}`
                            };

                            await purchaseService.createQuotation(additionalQuotation);
                            successCount++;
                            
                            toast.loading(`جاري نسخ العرض (${successCount - 1}/${additionalSupplierIds.length})...`, { id: toastId });
                            
                            // Small delay between requests
                            if (i < additionalSupplierIds.length - 1) {
                                await new Promise(resolve => setTimeout(resolve, 100));
                            }
                        } catch (error) {
                            failCount++;
                            console.error(`Failed to create quotation for supplier ${supplierId}:`, error);
                        }
                    }
                    
                    toast.dismiss(toastId);
                }
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

            if (isEdit) {
                toast.success('تم تحديث عرض السعر بنجاح');
            } else if (additionalSupplierIds.length > 0) {
                toast.success(
                    `تم حفظ ${formatNumber(successCount)} عرض سعر بنجاح${failCount > 0 ? ` (فشل ${formatNumber(failCount)})` : ''}`,
                    { icon: '🎉', duration: 4000 }
                );
            } else {
                toast.success('تم حفظ عرض السعر وتحديث أسعار المورد');
            }
            
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
                    {!isView && !isLocked && (
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
                            <span>
                                {saving 
                                    ? 'جاري الحفظ...' 
                                    : !isEdit && additionalSupplierIds.length > 0
                                        ? `حفظ ${formatNumber(additionalSupplierIds.length + 1)} عروض سعر`
                                        : 'حفظ عرض السعر'
                                }
                            </span>
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
                {/* Locked Banner */}
                {isLocked && (
                    <div className="lg:col-span-3 mb-6 bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 bg-rose-100 rounded-xl">
                            <Lock className="w-6 h-6 text-rose-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-rose-800">عرض السعر مغلق للتعديل</h4>
                            <p className="text-sm text-rose-700">تم استخدام هذا العرض في مقارنة عروض الأسعار، ولا يمكن تعديله الآن</p>
                        </div>
                    </div>
                )}

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
                                    disabled={isView || isLocked}
                                    required
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
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
                                            ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
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

                            {/* Additional Suppliers for Copying */}
                            {!isEdit && formData.rfqId && formData.supplierId > 0 && (
                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Copy className="w-4 h-4 text-emerald-600" />
                                        نسخ لموردين إضافيين (اختياري)
                                    </label>
                                    <MultiSelectDropdown
                                        options={suppliers
                                            .filter(s => s.id !== formData.supplierId)
                                            .map(s => ({ value: s.id!, label: s.supplierNameAr, code: s.supplierCode }))}
                                        selectedValues={additionalSupplierIds}
                                        onChange={setAdditionalSupplierIds}
                                        placeholder="اختر موردين آخرين لإنشاء عروض سعر منفصلة لهم..."
                                        disabled={isView || isLocked}
                                    />
                                    {additionalSupplierIds.length > 0 && (
                                        <div className="bg-gradient-to-l from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-xl p-3
                                            flex items-center gap-3 animate-in fade-in duration-200">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <Users className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 text-sm">
                                                <span className="text-emerald-700 font-semibold">سيتم إنشاء </span>
                                                <span className="text-emerald-800 font-black">{formatNumber(additionalSupplierIds.length + 1)}</span>
                                                <span className="text-emerald-700 font-semibold"> عرض سعر — واحد لكل مورد</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

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
                                    disabled={isView || isLocked}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                    placeholder={isView || isLocked ? '' : "INV-XXX"}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    تاريخ العرض <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.quotationDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quotationDate: e.target.value }))}
                                    required
                                    disabled={false} // Changed from true to false
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${false ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    صالح حتى <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.validUntilDate || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, validUntilDate: e.target.value }))}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    disabled={isView || isLocked}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
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
                                    disabled={isView || isLocked}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
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
                                    disabled={isView || isLocked}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
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
                                                    disabled={isView || isLocked}
                                                    className={`w-full min-w-[200px] px-3 py-2 border-2 border-slate-200 
                                                        rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
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
                                                    disabled={isView || isLocked}
                                                    className={`w-24 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-brand-primary outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
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
                                                    disabled={isView || isLocked}
                                                    className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-emerald-600 outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="text"
                                                    value={item.polymerGrade || ''}
                                                    onChange={(e) => updateItem(index, 'polymerGrade', e.target.value)}
                                                    disabled={isView || isLocked}
                                                    className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-semibold outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
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
                                                    disabled={isView || isLocked}
                                                    className={`w-20 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
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
                                                    disabled={isView || isLocked}
                                                    className={`w-20 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                {formatNumber(item.totalPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 pl-6 text-left">
                                                {!isView && !isLocked && (
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
                                        <h4 className="font-bold text-slate-800 tracking-tight">مصاريف الشحن</h4>
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
                                                totalAmount: calculateGrandTotal(optimisticData.items, val, optimisticData.otherCosts)
                                            };
                                            addOptimisticData(updates);
                                            startTransition(() => {
                                                setFormData(prev => ({ ...prev, ...updates }));
                                            });
                                        }}
                                        disabled={isView || isLocked}
                                        className={`w-full px-5 py-3 border-2 border-slate-200 rounded-2xl 
                                            text-xl text-center font-black text-brand-primary outline-none focus:border-brand-primary 
                                            transition-all shadow-sm
                                            ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                        placeholder="0.00"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none">
                                        {optimisticData.currency}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-500/10 rounded-xl">
                                        <Sparkles className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 tracking-tight">مصاريف أخرى</h4>
                                        <p className="text-slate-500 text-xs font-medium">أي تكاليف إضافية أخرى</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-56">
                                    <input
                                        type="number"
                                        value={optimisticData.otherCosts || 0}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const updates = {
                                                otherCosts: val,
                                                totalAmount: calculateGrandTotal(optimisticData.items, optimisticData.deliveryCost, val)
                                            };
                                            addOptimisticData(updates);
                                            startTransition(() => {
                                                setFormData(prev => ({ ...prev, ...updates }));
                                            });
                                        }}
                                        disabled={isView || isLocked}
                                        className={`w-full px-5 py-3 border-2 border-slate-200 rounded-2xl 
                                            text-xl text-center font-black text-brand-primary outline-none focus:border-brand-primary 
                                            transition-all shadow-sm
                                            ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
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
                                <span className="text-white/60 text-sm">مصاريف الشحن</span>
                                <span className="font-bold text-lg text-white">
                                    {formatNumber(optimisticData.deliveryCost ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">مصاريف أخرى</span>
                                <span className="font-bold text-lg text-white">
                                    {formatNumber(optimisticData.otherCosts ?? 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/10">
                            <div className="text-xs text-white/40 mb-2">الإجمالي النهائي</div>
                            <div className="flex items-center justify-between">
                                <div className="text-4xl font-black text-emerald-400">
                                    {formatNumber(optimisticData.totalAmount)} <span className="text-xl font-bold">{getCurrencyLabel(optimisticData.currency || defaultCurrency)}</span>
                                    {(optimisticData.currency && optimisticData.currency !== defaultCurrency) && (
                                        <div className="text-sm font-bold text-white/60 mt-1 font-sans">
                                            (≈ {formatNumber(convertAmount(optimisticData.totalAmount, optimisticData.currency))} {getCurrencyLabel(defaultCurrency)})
                                        </div>
                                    )}
                                </div>
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
                                disabled={isView || isLocked}
                                className={`w-full p-4 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all 
                                        text-sm leading-relaxed h-40 resize-none
                                        ${isView || isLocked ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
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