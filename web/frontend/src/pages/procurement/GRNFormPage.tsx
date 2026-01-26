import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Package,
    Warehouse,
    Info,
    Hash,
    Trash2
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

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-white text-slate-400 rounded-2xl border border-slate-100 shadow-sm hover:text-brand-primary">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'تعديل إذن استلام' : 'تسجيل إذن استلام (GRN)'}</h1>
                        <p className="text-slate-500 text-sm">إثبات استلام البضائع فعلياً في المستودعات وتحديث الأرصدة</p>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>إتمام الاستلام</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                            <Warehouse className="w-5 h-5 text-emerald-600" />
                            <span>بيانات التوريد</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">مستند التوريد (أمر الشراء)</label>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <Hash className="w-4 h-4 text-slate-400" />
                                    <span className="font-bold text-slate-700">{formData.poId ? `أمر شراء رقم ${formData.poId}` : 'لم يتم اختيار أمر شراء'}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">رقم بوليصة الشحن / Delivery Note</label>
                                <input type="text" value={formData.deliveryNoteNo || ''} onChange={(e) => setFormData({ ...formData, deliveryNoteNo: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-emerald-600 outline-none transition-all" placeholder="DN-XXX" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                <Package className="w-5 h-5 text-amber-500" />
                                <span>الأصناف المستلمة</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="text-slate-400 text-xs font-bold">
                                        <th className="pb-4 pr-2">الصنف</th>
                                        <th className="pb-4 text-center">مطلوب</th>
                                        <th className="pb-4 text-center">تم استلامه الآن</th>
                                        <th className="pb-4 text-center">الوحدة</th>
                                        <th className="pb-4 text-center">التكلفة</th>
                                        <th className="pb-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {formData.items.map((item, idx) => (
                                        <tr key={idx} className="group">
                                            <td className="py-4 pr-2">
                                                <div className="font-bold text-slate-800">{items.find(i => i.id === item.itemId)?.itemNameAr || 'صنف غير معرف'}</div>
                                            </td>
                                            <td className="py-4 px-2 text-center text-slate-400">{item.orderedQty}</td>
                                            <td className="py-4 px-2">
                                                <input type="number" value={item.receivedQty} onChange={(e) => updateItem(idx, { receivedQty: parseFloat(e.target.value) })} className="w-24 bg-slate-50 border-none rounded-lg text-sm p-2 text-center font-bold text-emerald-600" />
                                            </td>
                                            <td className="py-4 px-2 text-center">{units.find(u => u.id === item.unitId)?.unitNameAr}</td>
                                            <td className="py-4 px-2 text-center font-black text-slate-700">{item.totalCost?.toLocaleString()}</td>
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
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-50 pb-4">
                            <Info className="w-4 h-4 text-brand-primary" /> معلومات الاستلام
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400">تاريخ الاستلام</label>
                                <input type="date" value={formData.grnDate?.split('T')[0] || new Date().toISOString().split('T')[0]} onChange={(e) => setFormData({ ...formData, grnDate: e.target.value })} className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400">المستودع</label>
                                <select value={formData.warehouseId} onChange={(e) => setFormData({ ...formData, warehouseId: parseInt(e.target.value) })} className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-none">
                                    <option value="">اختر المستودع...</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GRNFormPage;
