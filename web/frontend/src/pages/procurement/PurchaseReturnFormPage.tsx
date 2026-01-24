import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Package,
    Trash2,
    Truck,
    Calendar,
    AlertTriangle,
    DollarSign,
    Plus
} from 'lucide-react';
import { purchaseReturnService, type PurchaseReturnDto, type PurchaseReturnItemDto } from '../../services/purchaseReturnService';
import { grnService } from '../../services/grnService';
import { supplierService, type SupplierDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import toast from 'react-hot-toast';

const PurchaseReturnFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const queryParams = new URLSearchParams(location.search);
    const grnId = queryParams.get('grnId');

    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [grns, setGrns] = useState<any[]>([]); // simplified
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<PurchaseReturnDto>({
        returnNumber: `RET-${Date.now().toString().slice(-6)}`,
        returnDate: new Date().toISOString(),
        supplierId: 0,
        warehouseId: 1, // Default
        returnReason: '',
        subTotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        status: 'Draft',
        items: []
    });

    useEffect(() => {
        loadSuppliers(); loadItems(); loadGrns();
        if (grnId) { loadGRNData(parseInt(grnId)); }
    }, [id, grnId]);

    const loadSuppliers = async () => { const d = await supplierService.getAllSuppliers(); setSuppliers(d.data || []); };
    const loadItems = async () => { const d = await itemService.getActiveItems(); setItems(d.data || []); };
    const loadGrns = async () => { const d = await grnService.getAllGRNs(); setGrns(d || []); };

    const loadGRNData = async (gId: number) => {
        try {
            const grn = await grnService.getGRNById(gId);
            if (grn) {
                setFormData(prev => ({
                    ...prev,
                    grnId: grn.id,
                    grnNumber: grn.grnNumber,
                    supplierId: grn.supplierId,
                    warehouseId: grn.warehouseId,
                    items: grn.items.map(gi => ({
                        grnItemId: gi.id,
                        itemId: gi.itemId,
                        returnedQty: gi.receivedQty,
                        unitId: gi.unitId,
                        unitPrice: gi.unitCost || 0,
                        taxPercentage: 14, // Default VAT
                        taxAmount: (gi.receivedQty * (gi.unitCost || 0)) * 0.14,
                        totalPrice: (gi.receivedQty * (gi.unitCost || 0)) * 1.14,
                        returnReason: 'Defective'
                    }))
                }));
            }
        } catch (e) { toast.error('فشل تحميل بيانات إذن الاستلام'); }
    };

    useEffect(() => {
        calculateTotals();
    }, [formData.items]);

    const calculateTotals = () => {
        const subTotal = formData.items?.reduce((acc, item) => acc + (item.unitPrice * item.returnedQty), 0) || 0;
        const taxAmount = formData.items?.reduce((acc, item) => acc + (item.taxAmount || 0), 0) || 0;
        const totalAmount = subTotal + taxAmount;
        setFormData(prev => ({ ...prev, subTotal, taxAmount, totalAmount }));
    };

    const updateItem = (index: number, updates: Partial<PurchaseReturnItemDto>) => {
        setFormData(prev => {
            const newItems = [...(prev.items || [])];
            const item = { ...newItems[index], ...updates };
            const base = (item.returnedQty || 0) * (item.unitPrice || 0);
            item.taxAmount = base * ((item.taxPercentage || 0) / 100);
            item.totalPrice = base + item.taxAmount;
            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const addItem = () => {
        const newItem: PurchaseReturnItemDto = {
            itemId: 0,
            unitId: 0,
            returnedQty: 1,
            unitPrice: 0,
            taxPercentage: 14,
            taxAmount: 0,
            totalPrice: 0
        };
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.supplierId || formData.items.length === 0) {
            toast.error('يرجى اختيار المورد وإضافة صنف واحد على الأقل');
            return;
        }
        try {
            setSaving(true);
            await purchaseReturnService.createReturn(formData);
            toast.success('تم تسجيل المرتجع بنجاح');
            navigate('/dashboard/procurement/returns');
        } catch (err) { toast.error('فشل تسجيل المرتجع'); }
        finally { setSaving(false); }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 text-right" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-right">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white text-slate-400 rounded-2xl border border-slate-100 shadow-sm hover:text-brand-primary">
                        <ArrowRight className="w-5 h-5 flip-rtl" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'تعديل مرتجع' : 'إنشاء مرتجع مشتريات'}</h1>
                        <p className="text-slate-500 text-sm">تسجيل رد بضاعة لمورد وتعديل أرصدة المخازن</p>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>اعتماد المرتجع</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                            <Truck className="w-5 h-5 text-rose-600" />
                            <span>بيانات المورد والمستند</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">المورد</label>
                                <select
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-rose-600 outline-none transition-all"
                                >
                                    <option value="0">اختر مورد...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierNameAr}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">مرجع الاستلام (GRN)</label>
                                <select
                                    value={formData.grnId || 0}
                                    onChange={(e) => loadGRNData(parseInt(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-rose-600 outline-none transition-all font-mono"
                                >
                                    <option value="0">اختياري: اختر إذن استلام...</option>
                                    {grns.map(g => <option key={g.id} value={g.id}>#{g.grnNumber} - {g.supplierNameAr}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                <Package className="w-5 h-5 text-amber-500" />
                                <span>الأصناف المعادة</span>
                            </div>
                            <button type="button" onClick={addItem} className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all">
                                <Plus className="w-4 h-4" /> إضافة صنف
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="text-slate-400 text-xs font-bold border-b border-slate-50">
                                        <th className="pb-4 pr-2">الصنف</th>
                                        <th className="pb-4 text-center">الكمية</th>
                                        <th className="pb-4 text-center">السعر</th>
                                        <th className="pb-4 text-center">الإجمالي</th>
                                        <th className="pb-4">السبب</th>
                                        <th className="pb-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {formData.items.map((item, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="py-4 pr-2">
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 border-none rounded-lg text-sm p-2 outline-none font-bold"
                                                >
                                                    <option value="0">اختر صنف...</option>
                                                    {items.map(i => <option key={i.id} value={i.id}>{i.itemNameAr}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-2">
                                                <input type="number" value={item.returnedQty} onChange={(e) => updateItem(idx, { returnedQty: parseFloat(e.target.value) })} className="w-20 bg-slate-50 border-none rounded-lg text-sm p-2 text-center font-bold text-rose-600" />
                                            </td>
                                            <td className="py-4 px-2">
                                                <input type="number" value={item.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) })} className="w-24 bg-slate-50 border-none rounded-lg text-sm p-2 text-center font-bold" />
                                            </td>
                                            <td className="py-4 px-2 text-center font-black text-slate-700">{(item.totalPrice).toLocaleString()}</td>
                                            <td className="py-4 px-2">
                                                <input type="text" value={item.returnReason || ''} onChange={(e) => updateItem(idx, { returnReason: e.target.value })} className="w-full bg-slate-50 border-none rounded-lg text-[10px] p-2" placeholder="السبب..." />
                                            </td>
                                            <td className="py-4 text-left">
                                                <button type="button" onClick={() => setFormData(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {formData.items.length === 0 && <div className="py-12 text-center text-slate-400 italic text-sm">لا توجد أصناف مضافة</div>}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Totals */}
                    <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-6">
                        <div className="flex items-center gap-2 font-bold text-lg border-b border-white/10 pb-4 text-rose-400">
                            <DollarSign className="w-5 h-5" />
                            ملخص التسوية
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="opacity-60">قيمة البضاعة</span>
                                <span className="font-bold">{formData.subTotal.toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="opacity-60 text-emerald-400">إجمالي الضريبة المستردة</span>
                                <span className="font-bold text-emerald-400">{formData.taxAmount.toLocaleString()} ج.م</span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <div className="text-xs opacity-50">إجمالي المرتجع</div>
                                <div className="text-3xl font-black text-rose-400">
                                    {formData.totalAmount.toLocaleString()}
                                    <span className="text-xs font-bold mr-1">ج.م</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-50 pb-4">
                            <Calendar className="w-4 h-4 text-brand-primary" /> التاريخ والمستودع
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400">تاريخ المرتجع</label>
                                <input type="date" value={formData.returnDate.split('T')[0]} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400">سحب من مستودع</label>
                                <select value={formData.warehouseId} onChange={(e) => setFormData({ ...formData, warehouseId: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-none">
                                    <option value="1">المخزن الرئيسي</option>
                                    <option value="2">مخزن المواد الخام</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                        <p className="text-[10px] leading-relaxed text-amber-700 font-medium">سيؤدي حفظ هذا المرتجع إلى إنقاص الكميات المتوفرة في المستودع المختار فور الاعتماد.</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PurchaseReturnFormPage;
