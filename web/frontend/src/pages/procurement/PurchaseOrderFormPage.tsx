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
    Info,
    FileText,
    AlertCircle
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
            console.log('Fetching Quotation:', qId);
            const quotation = await purchaseService.getQuotationById(qId);
            console.log('Quotation Data:', quotation);

            if (quotation) {
                setFormData(prev => ({
                    ...prev,
                    supplierId: quotation.supplierId,
                    quotationId: quotation.id,
                    currency: quotation.currency || 'EGP',
                    exchangeRate: quotation.exchangeRate || 1,
                    subTotal: quotation.totalAmount,
                    totalAmount: quotation.totalAmount,
                    notes: `تم الإنشاء بناءً على عرض السعر: ${quotation.quotationNumber}\n${quotation.notes || ''}`,
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
                toast.success(`تم تحميل بيانات عرض السعر رقم ${quotation.quotationNumber}`);
            }
        } catch (e) {
            console.error('Error loading quotation:', e);
            toast.error('فشل تحميل بيانات عرض السعر');
        }
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
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? 'تعديل أمر شراء' : 'إنشاء أمر شراء'}
                            </h1>
                            <p className="text-white/80 text-lg">إصدار طلب توريد رسمي للمورد بناءً على المواصفات والأسعار المعتمدة</p>
                        </div>
                    </div>
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
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ الطلب'}</span>
                    </button>
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
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    المورد
                                </label>
                                <select
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                    required
                                >
                                    <option value="0">اختر المورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierNameAr}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    تاريخ التسليم المتوقع
                                </label>
                                <input
                                    type="date"
                                    value={formData.expectedDeliveryDate || ''}
                                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                />
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
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف المطلوبة</h3>
                                        <p className="text-slate-500 text-sm">قائمة المواد والكميات المطلوب توريدها</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl 
                                        font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20
                                        hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة صنف
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right">الصنف</th>
                                        <th className="py-4 px-4 text-center">الكمية</th>
                                        <th className="py-4 px-4 text-center">الوحدة</th>
                                        <th className="py-4 px-4 text-center">سعر الوحدة</th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        <th className="py-4 pl-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(formData.items || []).map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-6">
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) })}
                                                    className="w-full min-w-[200px] px-3 py-2 bg-white border-2 border-slate-200 
                                                        rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all"
                                                >
                                                    <option value="0">اختر صنف...</option>
                                                    {items.map(i => <option key={i.id} value={i.id}>{i.itemNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.orderedQty}
                                                    onChange={(e) => updateItem(idx, { orderedQty: parseFloat(e.target.value) })}
                                                    className="w-24 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-brand-primary outline-none 
                                                        focus:border-brand-primary transition-all"
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <select
                                                    value={item.unitId}
                                                    onChange={(e) => updateItem(idx, { unitId: parseInt(e.target.value) })}
                                                    className="w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                        text-sm font-semibold outline-none focus:border-brand-primary transition-all"
                                                >
                                                    <option value="0">الوحدة...</option>
                                                    {units.map(u => <option key={u.id} value={u.id}>{u.unitNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) })}
                                                    className="w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-emerald-600 outline-none 
                                                        focus:border-brand-primary transition-all"
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                {(item.totalPrice || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 pl-6 text-left">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 
                                                        rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
                                    <p className="text-slate-400 font-semibold">لا توجد أصناف مضافة</p>
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
                                <span className="text-white/60">الإجمالي الفرعي</span>
                                <span className="font-bold text-lg">
                                    {formData.subTotal.toLocaleString()} {formData.currency}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <span className="text-emerald-400 font-semibold">الضريبة (VAT)</span>
                                <input
                                    type="number"
                                    value={formData.taxAmount}
                                    onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })}
                                    className="w-28 px-3 py-2 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-lg 
                                        text-emerald-400 font-bold text-right outline-none focus:border-emerald-500/50 transition-all"
                                />
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">الإجمالي النهائي</div>
                                <div className="text-4xl font-black text-emerald-400">
                                    {formData.totalAmount.toLocaleString()}
                                    <span className="text-sm font-bold mr-2">{formData.currency}</span>
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
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl 
                                    focus:border-brand-primary focus:bg-white outline-none transition-all 
                                    text-sm leading-relaxed h-40 resize-none"
                                placeholder="اكتب أي ملاحظات أو تعليمات خاصة للمورد..."
                            />
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 
                        flex gap-4 animate-slide-in shadow-lg"
                        style={{ animationDelay: '400ms' }}>
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
                </div>
            </form>
        </div>
    );
};

export default PurchaseOrderFormPage;