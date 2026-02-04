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
    Plus,
    FileText,
    TrendingDown,
    Building2,
    User,
    Eye,
    CheckCircle2,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import { purchaseReturnService, type PurchaseReturnDto, type PurchaseReturnItemDto } from '../../services/purchaseReturnService';
import { grnService } from '../../services/grnService';
import { supplierService, type SupplierDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import warehouseService, { type WarehouseDto } from '../../services/warehouseService';
import toast from 'react-hot-toast';

const PurchaseReturnFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const queryParams = new URLSearchParams(location.search);
    const grnId = queryParams.get('grnId');
    const isView = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    const [suppliers, setSuppliers] = useState<SupplierDto[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [grns, setGrns] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState<PurchaseReturnDto>({
        returnNumber: `RET-${Date.now().toString().slice(-6)}`,
        returnDate: new Date().toISOString(),
        supplierId: 0,
        warehouseId: 1,
        returnReason: '',
        subTotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        status: 'Draft',
        items: []
    });

    useEffect(() => {
        loadSuppliers();
        loadItems();
        loadGrns();
        loadWarehouses();
        if (grnId) {
            loadGRNData(parseInt(grnId));
        }
    }, [id, grnId]);

    const loadSuppliers = async () => {
        try {
            const d = await supplierService.getAllSuppliers();
            setSuppliers(d.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadItems = async () => {
        try {
            const d = await itemService.getActiveItems();
            setItems(d.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadGrns = async () => {
        try {
            const d = await grnService.getAllGRNs();
            // Filter out GRNs that are already returned OR already finalized in warehouse (Completed)
            setGrns(d?.filter((g: any) =>
                g.status?.toLowerCase() !== 'returned' &&
                g.status?.toLowerCase() !== 'completed'
            ) || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadWarehouses = async () => {
        try {
            const data = await warehouseService.getAll();
            setWarehouses(data.data || []);
        } catch (error) {
            console.error('Failed to load warehouses');
        }
    };

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
                        taxPercentage: 14,
                        taxAmount: (gi.receivedQty * (gi.unitCost || 0)) * 0.14,
                        totalPrice: (gi.receivedQty * (gi.unitCost || 0)) * 1.14,
                        returnReason: 'Defective'
                    }))
                }));
            }
        } catch (e) {
            toast.error('فشل تحميل بيانات إذن الاستلام');
        }
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
            // Submit as Approved to trigger backend effects (Stock & Balance)
            const payload = { ...formData, status: 'Approved' };
            await purchaseReturnService.createReturn(payload);
            toast.success('تم تسجيل المرتجع وتعديل الأرصدة بنجاح');
            navigate('/dashboard/procurement/returns');
        } catch (err) {
            toast.error('فشل تسجيل المرتجع');
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

            {/* Enhanced Header with Brand Colors */}
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
                            <TrendingDown className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEdit ? 'تعديل مرتجع مشتريات' : 'مرتجع مشتريات جديد'}
                            </h1>
                            <p className="text-white/80 text-lg">تسجيل رد بضاعة للمورد وتعديل أرصدة المخزون</p>
                        </div>
                    </div>
                    {!isView && (
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
                            <span>{saving ? 'جاري الحفظ...' : 'اعتماد المرتجع'}</span>
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
                            <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm whitespace-nowrap">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold">وضع العرض فقط</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Supplier & GRN Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Truck className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">معلومات المورد والإذن</h3>
                                    <p className="text-slate-500 text-sm">حدد المورد وإذن الاستلام المرجعي</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <User className="w-4 h-4 text-brand-primary" />
                                    المورد
                                </label>
                                <select
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })}
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                >
                                    <option value="0">اختر مورد...</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.supplierNameAr}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    مرجع الاستلام (GRN)
                                </label>
                                <select
                                    value={formData.grnId || 0}
                                    onChange={(e) => loadGRNData(parseInt(e.target.value))}
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-mono font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                >
                                    <option value="0">اختياري: اختر إذن استلام...</option>
                                    {grns.map(g => (
                                        <option key={g.id} value={g.id}>
                                            #{g.grnNumber} - {g.supplierNameAr}
                                        </option>
                                    ))}
                                </select>
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
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف المعادة</h3>
                                        <p className="text-slate-500 text-sm">حدد الأصناف والكميات المرتجعة</p>
                                    </div>
                                </div>
                                {!isView && (
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
                                )}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right">الصنف</th>
                                        <th className="py-4 px-4 text-center">الكمية</th>
                                        <th className="py-4 px-4 text-center">السعر</th>
                                        <th className="py-4 px-4 text-center">الضريبة</th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        <th className="py-4 pr-4 text-right">السبب</th>
                                        <th className="py-4 pl-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.items.map((item, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-6">
                                                <select
                                                    value={item.itemId}
                                                    onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) })}
                                                    disabled={isView}
                                                    className={`w-full min-w-[200px] px-3 py-2 border-2 border-slate-200 
                                                        rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                >
                                                    <option value="0">اختر صنف...</option>
                                                    {items.map(i => (
                                                        <option key={i.id} value={i.id}>{i.itemNameAr}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.returnedQty}
                                                    onChange={(e) => updateItem(idx, { returnedQty: parseFloat(e.target.value) })}
                                                    disabled={isView}
                                                    className={`w-24 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-brand-primary outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70 text-brand-primary/50' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) })}
                                                    disabled={isView}
                                                    className={`w-28 px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center font-semibold text-slate-600 text-sm">
                                                {item.taxAmount.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                                                {item.totalPrice.toLocaleString()}
                                            </td>
                                            <td className="py-4 pr-4">
                                                <input
                                                    type="text"
                                                    value={item.returnReason || ''}
                                                    onChange={(e) => updateItem(idx, { returnReason: e.target.value })}
                                                    disabled={isView}
                                                    className={`w-full px-3 py-2 border-2 border-slate-200 rounded-xl 
                                                        text-xs outline-none focus:border-brand-primary transition-all
                                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                    placeholder={isView ? '' : "سبب الإرجاع..."}
                                                />
                                            </td>
                                            <td className="py-4 pl-6 text-left">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({
                                                        ...p,
                                                        items: p.items.filter((_, i) => i !== idx)
                                                    }))}
                                                    className={`p-2 hover:bg-rose-50 rounded-lg transition-all ${isView ? 'hidden' : 'text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100'}`}
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
                    {/* Totals Card */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 
                        rounded-3xl p-6 text-white shadow-2xl animate-slide-in"
                        style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-xl">ملخص المرتجع</h3>
                        </div>
                        <div className="space-y-5 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60">قيمة البضاعة</span>
                                <span className="font-bold text-lg">{formData.subTotal.toLocaleString()} ج.م</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <span className="text-emerald-400 font-semibold">الضريبة المستردة</span>
                                <span className="font-bold text-lg text-emerald-400">
                                    {formData.taxAmount.toLocaleString()} ج.م
                                </span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">إجمالي قيمة المرتجع</div>
                                <div className="text-4xl font-black text-emerald-400">
                                    {formData.totalAmount.toLocaleString()}
                                    <span className="text-sm font-bold mr-2">ج.م</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '300ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-800">التفاصيل الإضافية</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    تاريخ المرتجع
                                </label>
                                <input
                                    type="date"
                                    value={formData.returnDate.split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Building2 className="w-4 h-4 text-brand-primary" />
                                    المستودع
                                </label>
                                <select
                                    value={formData.warehouseId}
                                    onChange={(e) => setFormData({ ...formData, warehouseId: parseInt(e.target.value) })}
                                    disabled={isView}
                                    className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary outline-none transition-all font-semibold
                                        ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                >
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.warehouseNameAr}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Warning Card */}
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 
                        flex gap-4 animate-slide-in shadow-lg"
                        style={{ animationDelay: '400ms' }}>
                        <div className="p-3 bg-amber-100 rounded-xl h-fit">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-800 mb-2">تنبيه هام</h4>
                            <p className="text-sm leading-relaxed text-amber-700">
                                سيؤدي حفظ هذا المرتجع إلى <strong>إنقاص الكميات المتوفرة</strong> في المستودع المختار
                                وتعديل حسابات المورد تلقائياً.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PurchaseReturnFormPage;