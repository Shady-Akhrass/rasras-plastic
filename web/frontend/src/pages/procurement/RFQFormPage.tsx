import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Plus,
    Save,
    Trash2,
    Package,
    Truck,
    Calendar,
    FileText,
    ArrowRight
} from 'lucide-react';
import purchaseService, { type RFQ, type RFQItem, type Supplier } from '../../services/purchaseService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';

const RFQFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);

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
        }
    }, [id]);

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

        // Auto-select unit if item changes
        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem) {
                newItems[index].unitId = selectedItem.unitId;
            }
        }

        setFormData(prev => ({ ...prev, items: newItems }));
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
                                onChange={(e) => setFormData(prev => ({ ...prev, supplierId: parseInt(e.target.value) }))}
                                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all appearance-none"
                            >
                                <option value={0}>اختر المورد...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.supplierNameAr} ({s.supplierCode})</option>
                                ))}
                            </select>
                        </div>
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
                                    <div className="md:col-span-5 space-y-2">
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

                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 block">مواصفات خاصة</label>
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
