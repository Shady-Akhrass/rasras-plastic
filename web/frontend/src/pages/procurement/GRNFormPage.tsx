import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Package,
    Warehouse,
    Info,
    Hash,
    Trash2,
    FileText,
    Calendar,
    Truck,
    ClipboardCheck,
    AlertCircle,
    Building2,
    CheckCircle2
} from 'lucide-react';
import { grnService, type GoodsReceiptNoteDto, type GRNItemDto } from '../../services/grnService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService, type UnitDto } from '../../services/unitService';
import warehouseService, { type WarehouseDto } from '../../services/warehouseService';
import toast from 'react-hot-toast';

const GRNFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const queryParams = new URLSearchParams(location.search);
    const poId = queryParams.get('poId');

    // Data State
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<UnitDto[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<GoodsReceiptNoteDto>({
        poId: 0,
        supplierId: 0,
        warehouseId: 1, // Default
        receivedByUserId: 1, // Mock current user
        status: 'Draft',
        items: []
    });

    useEffect(() => {
        loadItems(); loadUnits(); loadWarehouses();
        if (poId) { loadPOData(parseInt(poId)); }
    }, [id, poId]);

    const loadItems = async () => { const d = await itemService.getActiveItems(); setItems(d.data || []); };
    const loadUnits = async () => { const d = await unitService.getAllUnits(); setUnits(d.data || []); };
    const loadWarehouses = async () => { const d = await warehouseService.getActive(); setWarehouses(d.data || []); };

    const loadPOData = async (pId: number) => {
        try {
            const po = await purchaseOrderService.getPOById(pId);
            if (po) {
                setFormData(prev => ({
                    ...prev,
                    poId: po.id!,
                    supplierId: po.supplierId,
                    items: po.items.map(pi => ({
                        poItemId: pi.id!,
                        itemId: pi.itemId,
                        orderedQty: pi.orderedQty,
                        receivedQty: pi.remainingQty || pi.orderedQty, // default to remaining
                        unitId: pi.unitId,
                        unitCost: pi.unitPrice,
                        totalCost: (pi.remainingQty || pi.orderedQty) * pi.unitPrice
                    }))
                }));
            }
        } catch (e) { toast.error('فشل تحميل بيانات أمر الشراء'); }
    };

    const updateItem = (index: number, updates: Partial<GRNItemDto>) => {
        setFormData(prev => {
            const newItems = [...(prev.items || [])];
            const item = { ...newItems[index], ...updates };
            item.totalCost = (item.receivedQty || 0) * (item.unitCost || 0);
            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.poId || formData.items.length === 0) {
            toast.error('يرجى التحقق من أمر الشراء والأصناف');
            return;
        }
        try {
            setSaving(true);
            await grnService.createGRN(formData);
            toast.success('تم تسجيل الاستلام بنجاح');
            navigate('/dashboard/procurement/grn');
        } catch (err) { toast.error('فشل تسجيل الاستلام'); }
        finally { setSaving(false); }
    };

    // Calculate totals
    const totalItems = formData.items.length;
    const totalQuantity = formData.items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);
    const totalCost = formData.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);

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
                            <ClipboardCheck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? 'تعديل إذن استلام' : 'تسجيل إذن استلام (GRN)'}
                            </h1>
                            <p className="text-white/80 text-lg">إثبات استلام البضائع فعلياً في المستودعات وتحديث الأرصدة</p>
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
                        <span>{saving ? 'جاري الحفظ...' : 'إتمام الاستلام'}</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Supply Data */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Warehouse className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">بيانات التوريد</h3>
                                    <p className="text-slate-500 text-sm">تفاصيل الشحنة والمستندات المرجعية</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    مستند التوريد (أمر الشراء)
                                </label>
                                <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-blue-50 to-cyan-50 
                                    rounded-xl border-2 border-blue-200">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Hash className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-blue-600 font-semibold">أمر الشراء المرجعي</div>
                                        <div className="font-bold text-slate-800">
                                            {formData.poId ? `PO #${formData.poId}` : 'لم يتم اختيار أمر شراء'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    رقم بوليصة الشحن / Delivery Note
                                </label>
                                <input
                                    type="text"
                                    value={formData.deliveryNoteNo || ''}
                                    onChange={(e) => setFormData({ ...formData, deliveryNoteNo: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                    placeholder="DN-XXX"
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
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف المستلمة</h3>
                                        <p className="text-slate-500 text-sm">تأكيد الكميات المستلمة فعلياً</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-xl">
                                    <Package className="w-4 h-4 text-brand-primary" />
                                    <span className="text-sm font-bold text-brand-primary">
                                        {totalItems} صنف
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right">الصنف</th>
                                        <th className="py-4 px-4 text-center">الكمية المطلوبة</th>
                                        <th className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                <span>تم استلامه</span>
                                            </div>
                                        </th>
                                        <th className="py-4 px-4 text-center">الوحدة</th>
                                        <th className="py-4 px-4 text-center">التكلفة الإجمالية</th>
                                        <th className="py-4 pl-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.items.map((item, idx) => {
                                        const itemData = items.find(i => i.id === item.itemId);
                                        const unitData = units.find(u => u.id === item.unitId);
                                        const isComplete = item.receivedQty === item.orderedQty;
                                        const isPartial = item.receivedQty > 0 && item.receivedQty < item.orderedQty;

                                        return (
                                            <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 pr-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            isComplete ? 'bg-emerald-500' : 
                                                            isPartial ? 'bg-amber-500' : 'bg-slate-300'
                                                        }`} />
                                                        <span className="font-bold text-slate-800">
                                                            {itemData?.itemNameAr || 'صنف غير معرف'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 font-semibold text-sm">
                                                        {item.orderedQty}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <input
                                                        type="number"
                                                        value={item.receivedQty}
                                                        onChange={(e) => updateItem(idx, { receivedQty: parseFloat(e.target.value) })}
                                                        className="w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                            text-sm text-center font-bold text-emerald-600 outline-none 
                                                            focus:border-brand-primary transition-all"
                                                    />
                                                </td>
                                                <td className="py-4 px-4 text-center text-slate-600 font-semibold">
                                                    {unitData?.unitNameAr}
                                                </td>
                                                <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                    {item.totalCost?.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-4 pl-6 text-left">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ 
                                                            ...p, 
                                                            items: p.items.filter((_, i) => i !== idx) 
                                                        }))}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 
                                                            rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {formData.items.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 font-semibold">لا توجد أصناف للاستلام</p>
                                    <p className="text-slate-400 text-sm mt-1">الرجاء اختيار أمر شراء أولاً</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 
                        rounded-3xl p-6 text-white shadow-2xl animate-slide-in"
                        style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <ClipboardCheck className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-xl">ملخص الاستلام</h3>
                        </div>
                        <div className="space-y-5 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">عدد الأصناف</span>
                                <span className="font-bold text-lg">{totalItems}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">إجمالي الكميات</span>
                                <span className="font-bold text-lg text-emerald-400">{totalQuantity}</span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">إجمالي التكلفة</div>
                                <div className="text-4xl font-black text-emerald-400">
                                    {totalCost.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                                    <span className="text-sm font-bold mr-2">ج.م</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '300ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Info className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-800">معلومات الاستلام</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    تاريخ الاستلام
                                </label>
                                <input
                                    type="date"
                                    value={formData.grnDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, grnDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Building2 className="w-4 h-4 text-brand-primary" />
                                    المستودع المستلم
                                </label>
                                <select
                                    value={formData.warehouseId}
                                    onChange={(e) => setFormData({ ...formData, warehouseId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold"
                                >
                                    <option value="">اختر المستودع...</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 
                        flex gap-4 animate-slide-in shadow-lg"
                        style={{ animationDelay: '400ms' }}>
                        <div className="p-3 bg-emerald-100 rounded-xl h-fit">
                            <AlertCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-emerald-800 mb-2">معلومة هامة</h4>
                            <p className="text-sm leading-relaxed text-emerald-700">
                                سيتم <strong>تحديث أرصدة المخزون</strong> فور اعتماد إذن الاستلام. تأكد من صحة الكميات المستلمة.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GRNFormPage;