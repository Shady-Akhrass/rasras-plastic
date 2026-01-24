import React, { useState, useEffect } from 'react';
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
    Info
} from 'lucide-react';
import { purchaseOrderService, type PurchaseOrderDto, type PurchaseOrderItemDto } from '../../services/purchaseOrderService';
import purchaseService from '../../services/purchaseService'; // For Quotation lookup
import { supplierService, type SupplierDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import toast from 'react-hot-toast';

const PurchaseOrderFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const queryParams = new URLSearchParams(location.search);
    const quotationId = queryParams.get('quotationId');

    // Data State
    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [saving, setSaving] = useState(false);

    // Form State
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
        status: 'Draft',
        items: []
    });

    useEffect(() => {
        loadSuppliers(); loadItems(); loadUnits();
        if (isEdit) { /* loadPO() */ }
        else if (quotationId) { loadQuotationData(parseInt(quotationId)); }
    }, [id, quotationId]);

    const loadSuppliers = async () => { const d = await supplierService.getAllSuppliers(); setSuppliers(d.data || []); };
    const loadItems = async () => { const d = await itemService.getActiveItems(); setItems(d.data || []); };
    const loadUnits = async () => { const d = await unitService.getAllUnits(); setUnits(d.data || []); };

    const loadQuotationData = async (qId: number) => {
        try {
            const quotation = await purchaseService.getQuotationById(qId);
            if (quotation) {
                setFormData(prev => ({
                    ...prev,
                    supplierId: quotation.supplierId,
                    quotationId: quotation.id,
                    currency: quotation.currency || 'EGP',
                    exchangeRate: quotation.exchangeRate || 1,
                    subTotal: quotation.totalAmount,
                    totalAmount: quotation.totalAmount,
                    notes: `تم الإنشاء بناءً على عرض السعر: ${quotation.quotationNumber}`,
                    items: quotation.items.map(qi => ({
                        itemId: qi.itemId,
                        unitId: qi.unitId,
                        orderedQty: qi.offeredQty,
                        unitPrice: qi.unitPrice,
                        discountPercentage: qi.discountPercentage || 0,
                        discountAmount: qi.discountAmount || 0,
                        taxPercentage: qi.taxPercentage || 0,
                        taxAmount: qi.taxAmount || 0,
                        totalPrice: qi.totalPrice,
                        status: 'Pending'
                    }))
                }));
            }
        } catch (e) { toast.error('فشل تحميل بيانات عرض السعر'); }
    };

    useEffect(() => { calculateTotals(); }, [formData.items, formData.discountAmount, formData.taxAmount, formData.shippingCost, formData.otherCosts]);

    const calculateTotals = () => {
        const subTotal = formData.items?.reduce((acc, item) => acc + (item.totalPrice || 0), 0) || 0;
        const totalAmount = subTotal - (formData.discountAmount || 0) + (formData.taxAmount || 0) + (formData.shippingCost || 0) + (formData.otherCosts || 0);
        setFormData(prev => ({ ...prev, subTotal, totalAmount }));
    };

    const addItem = () => {
        const newItem: PurchaseOrderItemDto = { itemId: 0, unitId: 0, orderedQty: 1, unitPrice: 0, totalPrice: 0 };
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const updateItem = (index: number, updates: Partial<PurchaseOrderItemDto>) => {
        setFormData(prev => {
            const newItems = [...(prev.items || [])];
            const item = { ...newItems[index], ...updates };
            item.totalPrice = (item.orderedQty || 0) * (item.unitPrice || 0);
            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.supplierId || formData.items.length === 0) {
            toast.error('يرجى التحقق من المورد والأصناف');
            return;
        }
        try {
            setSaving(true);
            await purchaseOrderService.createPO(formData);
            toast.success('تم حفظ أمر الشراء بنجاح');
            navigate('/dashboard/procurement/po');
        } catch (err) { toast.error('فشل حفظ أمر الشراء'); }
        finally { setSaving(false); }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white text-slate-400 rounded-2xl border border-slate-100 shadow-sm hover:text-brand-primary">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'تعديل أمر شراء' : 'إنشاء أمر شراء'}</h1>
                        <p className="text-slate-500 text-sm">إصدار طلب توريد رسمي للمورد بناءً على المواصفات والأسعار المعتمدة</p>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>حفظ الطلب</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                            <Info className="w-5 h-5 text-brand-primary" />
                            <span>البيانات الأساسية</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><Truck className="w-3 h-3" /> المورد</label>
                                <select value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all" required>
                                    <option value="0">اختر المورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierNameAr}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">تاريخ التسليم المتوقع</label>
                                <input type="date" value={formData.expectedDeliveryDate || ''} onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-brand-primary outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                <Package className="w-5 h-5 text-brand-primary" />
                                <span>الأصناف المطلوبة</span>
                            </div>
                            <button type="button" onClick={addItem} className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 px-3 py-1.5 rounded-lg transition-all">
                                <Plus className="w-4 h-4" /> إضافة صنف
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="text-slate-400 text-xs font-bold">
                                        <th className="pb-4 pr-2">الصنف</th>
                                        <th className="pb-4 text-center">الكمية</th>
                                        <th className="pb-4 text-center">الوحدة</th>
                                        <th className="pb-4 text-center">سعر الوحدة</th>
                                        <th className="pb-4 text-center">الإجمالي</th>
                                        <th className="pb-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(formData.items || []).map((item, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="py-4 pr-2 min-w-[200px]">
                                                <select value={item.itemId} onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) })} className="w-full bg-slate-50 border-none rounded-lg text-sm p-2 outline-none font-bold">
                                                    <option value="0">اختر صنف...</option>
                                                    {items.map(i => <option key={i.id} value={i.id}>{i.itemNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-2">
                                                <input type="number" value={item.orderedQty} onChange={(e) => updateItem(idx, { orderedQty: parseFloat(e.target.value) })} className="w-20 bg-slate-50 border-none rounded-lg text-sm p-2 text-center font-bold" />
                                            </td>
                                            <td className="py-4 px-2">
                                                <select value={item.unitId} onChange={(e) => updateItem(idx, { unitId: parseInt(e.target.value) })} className="w-24 bg-slate-50 border-none rounded-lg text-sm p-2 outline-none">
                                                    <option value="0">الوحدة...</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.unitNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-2">
                                                <input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) })} className="w-24 bg-slate-50 border-none rounded-lg text-sm p-2 text-center font-bold text-emerald-600" />
                                            </td>
                                            <td className="py-4 px-2 text-center font-black text-slate-700">{(item.totalPrice || 0).toLocaleString()}</td>
                                            <td className="py-4 text-left">
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-6">
                        <div className="flex items-center gap-2 font-bold text-lg border-b border-white/10 pb-4 text-brand-secondary">
                            <DollarSign className="w-5 h-5" /> الملخص المالي
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="opacity-60 text-slate-400">الإجمالي الفرعي</span>
                                <span className="font-bold">{formData.subTotal.toLocaleString()} {formData.currency}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-emerald-300">
                                <span>الضريبة (VAT)</span>
                                <input type="number" value={formData.taxAmount} onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })} className="w-20 bg-white/10 border-none rounded-md px-1 text-left text-white outline-none" />
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <div className="text-xs opacity-50">الإجمالي النهائي</div>
                                <div className="text-3xl font-black text-brand-secondary">{formData.totalAmount.toLocaleString()} <span className="text-xs font-bold mr-1">{formData.currency}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <Calendar className="w-4 h-4 text-brand-primary" /> ملاحظات إضافية
                        </div>
                        <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm outline-none focus:ring-2 ring-brand-primary/10 h-32" placeholder="اكتب أي ملاحظات أو تعليمات خاصة للمورد..." />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PurchaseOrderFormPage;
