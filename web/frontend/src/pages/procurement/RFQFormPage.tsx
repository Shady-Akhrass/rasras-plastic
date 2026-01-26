import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Plus,
    Save,
    Trash2,
    Package,
    Truck,
    Calendar,
    FileText,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import purchaseService, { type RFQ, type RFQItem, type Supplier } from '../../services/purchaseService';
import { supplierService, type SupplierItemDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import toast from 'react-hot-toast';

const RFQFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;

    // Get prId from URL
    const queryParams = new URLSearchParams(location.search);
    const prIdFromUrl = queryParams.get('prId');

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [loadingSupplierItems, setLoadingSupplierItems] = useState(false);

    const [formData, setFormData] = useState<RFQ>({
        supplierId: 0,
        rfqDate: new Date().toISOString().split('T')[0],
        responseDueDate: '',
        notes: '',
        items: []
    });

    // Load Data
    useEffect(() => {
        loadDependencies();
        if (isEdit) {
            loadRFQ(parseInt(id));
        } else if (prIdFromUrl) {
            loadPRData(parseInt(prIdFromUrl));
        }
    }, [id, prIdFromUrl]);

    const loadDependencies = async () => {
        try {
            const [suppliersData, itemsData, unitsData] = await Promise.all([
                purchaseService.getAllSuppliers(),
                itemService.getAllItems(),
                unitService.getAllUnits()
            ]);
            setSuppliers(suppliersData);
            setItems(itemsData.data || []);
            setUnits(unitsData.data || []);
        } catch (error) {
            console.error('Failed to load dependencies:', error);
            toast.error('فشل تحميل البيانات الأساسية');
        }
    };

    const loadPRData = async (prId: number) => {
        try {
            setLoading(true);
            const pr = await purchaseService.getPRById(prId);
            if (pr) {
                setFormData(prev => ({
                    ...prev,
                    prId: pr.id,
                    prNumber: pr.prNumber,
                    notes: `تم الإنشاء بناءً على طلب شراء: ${pr.prNumber}`,
                    items: pr.items.map(pi => ({
                        itemId: pi.itemId,
                        requestedQty: pi.requestedQty,
                        unitId: pi.unitId,
                        specifications: pi.specifications || ''
                    }))
                }));
                toast.success('تم تحميل بيانات طلب الشراء');
            }
        } catch (error) {
            console.error('Failed to load PR data:', error);
            toast.error('فشل تحميل بيانات طلب الشراء');
        } finally {
            setLoading(false);
        }
    };

    const loadRFQ = async (rfqId: number) => {
        try {
            setLoading(true);
            const data = await purchaseService.getRFQById(rfqId);
            setFormData(data);
        } catch (error) {
            console.error('Failed to load RFQ:', error);
            navigate('/dashboard/procurement/rfq');
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

            // Auto-populate form items with supplier's registered products
            if (fetchedItems.length > 0 && formData.items.length === 0) {
                const autoItems: RFQItem[] = fetchedItems.map(si => {
                    const itemData = items.find(i => i.id === si.itemId);
                    return {
                        itemId: si.itemId,
                        requestedQty: si.minOrderQty || 1,
                        unitId: itemData?.unitId || 0,
                        specifications: si.supplierItemCode ? `كود المورد: ${si.supplierItemCode}` : '',
                        estimatedPrice: si.lastPrice
                    };
                });
                setFormData(prev => ({ ...prev, items: autoItems }));
                toast.success(`تم تحميل ${fetchedItems.length} صنف من كتالوج المورد`, { icon: '📦' });
            }
        } catch (error) {
            console.error('Failed to load supplier items:', error);
        } finally {
            setLoadingSupplierItems(false);
        }
    };

    // Item Management
    const addItem = () => {
        const newItem: RFQItem = {
            itemId: 0,
            requestedQty: 1,
            unitId: 0,
            specifications: ''
        };
        setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: keyof RFQItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-select unit and price if item changes
        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) {
                newItems[index].unitId = selectedItem.unitId;
            }
            // Check if this item has a supplier price
            const supplierItem = supplierItems.find(si => si.itemId === value);
            if (supplierItem?.lastPrice) {
                newItems[index].estimatedPrice = supplierItem.lastPrice;
            }
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    // Get supplier price for an item
    const getSupplierPrice = (itemId: number): number | undefined => {
        return supplierItems.find(si => si.itemId === itemId)?.lastPrice;
    };

    // Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.supplierId === 0) {
            alert('يرجى اختيار مورد');
            return;
        }

        if (formData.items.length === 0) {
            alert('يرجى إضافة بند واحد على الأقل');
            return;
        }

        try {
            setSaving(true);
            if (isEdit) {
                // Update logic if needed
            } else {
                await purchaseService.createRFQ(formData);
            }
            navigate('/dashboard/procurement/rfq');
        } catch (error) {
            console.error('Failed to save RFQ:', error);
            alert('حدث خطأ أثناء حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/procurement/rfq')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? `تعديل طلب عرض سعر #${formData.rfqNumber}` : 'إنشاء طلب عرض سعر جديد'}
                        </h1>
                        <p className="text-slate-500">أدخل تفاصيل الطلب والمورد والبنود المطلوبة</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/procurement/rfq')}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white rounded-xl 
                            font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ الطلب'}</span>
                    </button>
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">المورد</label>
                        <div className="relative">
                            <Truck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={formData.supplierId}
                                onChange={(e) => handleSupplierChange(parseInt(e.target.value))}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all appearance-none"
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
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                هذا المورد لديه {supplierItems.length} صنف مسجل في الكتالوج
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">تاريخ الطلب</label>
                        <div className="relative">
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="date"
                                value={formData.rfqDate?.split('T')[0]}
                                onChange={(e) => setFormData(prev => ({ ...prev, rfqDate: e.target.value }))}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">تاريخ استحقاق الرد</label>
                        <div className="relative">
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="date"
                                value={formData.responseDueDate || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, responseDueDate: e.target.value }))}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">ملاحظات</label>
                        <div className="relative">
                            <FileText className="absolute right-4 top-4 w-5 h-5 text-slate-400" />
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={1}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                placeholder="..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-lg">
                                <Package className="w-6 h-6 text-brand-primary" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">الأصناف والبنود</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 text-brand-primary font-bold hover:bg-brand-primary/5 px-4 py-2 rounded-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>إضافة صنف</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group transition-all hover:bg-white hover:shadow-md hover:border-brand-primary/20">
                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="absolute -left-3 -top-3 p-2 bg-rose-100 text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-4 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 block">الصنف</label>
                                        <select
                                            value={item.itemId}
                                            onChange={(e) => updateItem(index, 'itemId', parseInt(e.target.value))}
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none bg-white font-medium"
                                        >
                                            <option value={0}>اختر صنف...</option>
                                            {items.map(i => (
                                                <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 block">الكمية</label>
                                        <input
                                            type="number"
                                            value={item.requestedQty}
                                            onChange={(e) => updateItem(index, 'requestedQty', parseFloat(e.target.value))}
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none bg-white font-medium"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 block">الوحدة</label>
                                        <select
                                            value={item.unitId}
                                            onChange={(e) => updateItem(index, 'unitId', parseInt(e.target.value))}
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none bg-white font-medium"
                                        >
                                            <option value={0}>الوحدة...</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 block flex items-center gap-1">
                                            السعر المتوقع
                                            {getSupplierPrice(item.itemId) && (
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">كتالوج</span>
                                            )}
                                        </label>
                                        <input
                                            type="number"
                                            value={item.estimatedPrice || ''}
                                            onChange={(e) => updateItem(index, 'estimatedPrice', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none font-medium transition-all ${getSupplierPrice(item.itemId)
                                                ? 'border-emerald-200 bg-emerald-50/50'
                                                : 'border-slate-100 bg-white'
                                                } focus:border-brand-primary`}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 block">مواصفات</label>
                                        <input
                                            type="text"
                                            value={item.specifications || ''}
                                            onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                                            placeholder="اختياري..."
                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none bg-white font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.items.length === 0 && (
                            <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Package className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="font-bold text-slate-800">لا توجد بنود مضافة</h3>
                                <p className="text-slate-500 text-sm mb-6">ابدأ بالضغط على زر إضافة صنف لإضافة بنود العرض</p>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="px-6 py-2.5 bg-white text-brand-primary border border-brand-primary/20 
                                        rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                >
                                    إضافة صنف الآن
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RFQFormPage;
