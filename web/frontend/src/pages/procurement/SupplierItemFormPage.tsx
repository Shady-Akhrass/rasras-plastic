import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Package,
    Truck,
    AlertCircle,
    Info,
    Calendar,
    DollarSign,
    Hash
} from 'lucide-react';
import { supplierService, type SupplierItemDto, type SupplierDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import toast from 'react-hot-toast';

const SupplierItemFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [formData, setFormData] = useState<SupplierItemDto>({
        supplierId: 0,
        itemId: 0,
        supplierItemCode: '',
        lastPrice: 0,
        lastPriceDate: new Date().toISOString().split('T')[0],
        leadTimeDays: 0,
        minOrderQty: 0,
        isPreferred: false,
        isActive: true
    });

    // Load Data
    useEffect(() => {
        loadSuppliers();
        loadItems();
        if (isEdit) {
            // Logic to load specific supplier item would go here if we had getById
            // For now we'll assume creation as the primary request
        }
    }, [id]);

    const loadSuppliers = async () => {
        try {
            const data = await supplierService.getAllSuppliers();
            setSuppliers(data.data || []);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        }
    };

    const loadItems = async () => {
        try {
            const data = await itemService.getActiveItems();
            setItems(data.data || []);
        } catch (error) {
            console.error('Failed to load items:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplierId || !formData.itemId) {
            toast.error('يرجى اختيار المورد والصنف');
            return;
        }

        try {
            setSaving(true);
            await supplierService.linkItem(formData);
            toast.success('تم حفظ ارتباط الصنف بنجاح');
            navigate('/dashboard/procurement/suppliers/items');
        } catch (error: any) {
            console.error('Failed to save supplier item:', error);
            toast.error(error.response?.data?.message || 'فشل حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white text-slate-400 rounded-2xl border border-slate-100 hover:text-brand-primary transition-all shadow-sm"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? 'تعديل ارتباط صنف' : 'ربط صنف جديد بمورد'}
                        </h1>
                        <p className="text-slate-500 text-sm">تحديد الأسعار وشروط التوريد الخاصة بالمورد</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>حفظ البيانات</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selection Section */}
                <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                        <Info className="w-5 h-5 text-brand-primary" />
                        <span>بيانات الربط الأساسية</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Truck className="w-4 h-4" /> المورد
                            </label>
                            <select
                                value={formData.supplierId}
                                onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                required
                            >
                                <option value="0">اختر مورد...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.supplierNameAr} ({s.supplierCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                <Package className="w-4 h-4" /> الصنف
                            </label>
                            <select
                                value={formData.itemId}
                                onChange={(e) => setFormData({ ...formData, itemId: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                required
                            >
                                <option value="0">اختر صنف من المخزن...</option>
                                {items.map(i => (
                                    <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Financial Details */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        <span>الأسعار والكميات</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">آخر سعر توريد</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={formData.lastPrice}
                                onChange={(e) => setFormData({ ...formData, lastPrice: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                placeholder="0.0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">تاريخ آخر سعر</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={formData.lastPriceDate}
                                    onChange={(e) => setFormData({ ...formData, lastPriceDate: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all text-right"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">أقل كمية طلب (Min Order Qty)</label>
                            <input
                                type="number"
                                step="0.001"
                                value={formData.minOrderQty}
                                onChange={(e) => setFormData({ ...formData, minOrderQty: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                placeholder="0.000"
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics Details */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                        <Hash className="w-5 h-5 text-amber-500" />
                        <span>بيانات إضافية</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">كود الصنف عند المورد</label>
                            <input
                                type="text"
                                value={formData.supplierItemCode}
                                onChange={(e) => setFormData({ ...formData, supplierItemCode: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                placeholder="مثلاً: SUP-XP123"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">مدة التوريد (بالأيام)</label>
                            <input
                                type="number"
                                value={formData.leadTimeDays}
                                onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                placeholder="0"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.isPreferred ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">مورد مفضل لهذا الصنف</span>
                                    <span className="text-[10px] text-slate-500">سيظهر هذا المورد كخيار أول في نظام عروض الأسعار</span>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.isPreferred}
                                onChange={(e) => setFormData({ ...formData, isPreferred: e.target.checked })}
                                className="w-6 h-6 rounded-lg border-2 border-slate-300 text-brand-primary focus:ring-brand-primary"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SupplierItemFormPage;
