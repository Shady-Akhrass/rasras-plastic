import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Trash2,
    AlertTriangle,
    X,
    FileText,
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    Info,
    User,
    XCircle,
    Lock,
    DollarSign
} from 'lucide-react';
import { stockIssueNoteService, type StockIssueNoteDto, type StockAvailabilityWarningDto } from '../../services/stockIssueNoteService';
import { saleOrderService, type SaleOrderDto } from '../../services/saleOrderService';
import warehouseService from '../../services/warehouseService';
import { stockBalanceService, type StockBalanceDto } from '../../services/stockBalanceService';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../../utils/format';

const StockIssueNoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isView = queryParams.get('mode') === 'view';
    const isNew = !id || id === 'new';
    const isEdit = !!id && !isNew;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Data lists
    const [salesOrders, setSalesOrders] = useState<any[]>([]);
    const [issueNotes, setIssueNotes] = useState<StockIssueNoteDto[]>([]);
    const [warehouses, setWarehouses] = useState<{ id: number; warehouseNameAr?: string }[]>([]);

    // Warnings
    const [stockWarnings, setStockWarnings] = useState<StockAvailabilityWarningDto[] | null>(null);

    // Selected Sale Order Details for mapping & financial summary
    const [selectedSaleOrder, setSelectedSaleOrder] = useState<SaleOrderDto | null>(null);
    const [stockBalances, setStockBalances] = useState<StockBalanceDto[]>([]);

    // Form State
    const [form, setForm] = useState<StockIssueNoteDto>({
        issueDate: new Date().toISOString().slice(0, 19),
        salesOrderId: 0,
        warehouseId: 0,
        items: []
    });

    useEffect(() => {
        if (form.warehouseId) {
            stockBalanceService.getBalancesByWarehouse(form.warehouseId)
                .then(balances => setStockBalances(balances))
                .catch(err => console.error('Failed to fetch stock balances:', err));
        } else {
            setStockBalances([]);
        }
    }, [form.warehouseId]);

    // Load initial data (Orders + Warehouses + Existing Issue Notes)
    useEffect(() => {
        (async () => {
            try {
                const [orders, whResp, inResp] = await Promise.all([
                    saleOrderService.getAll(),
                    warehouseService.getAll?.() ?? Promise.resolve([]),
                    stockIssueNoteService.getAll()
                ]);
                setSalesOrders(Array.isArray(orders) ? orders : []);
                setIssueNotes(Array.isArray(inResp) ? inResp : []);

                // Handle different response structures for warehouse service
                const whList = Array.isArray(whResp) ? whResp : (whResp as any)?.data ?? [];
                setWarehouses(Array.isArray(whList) ? whList : []);
            } catch {
                toast.error('فشل تحميل البيانات');
            }
        })();
    }, []);

    // Load selected sale order details
    useEffect(() => {
        if (form.salesOrderId) {
            saleOrderService.getById(form.salesOrderId)
                .then(order => {
                    setSelectedSaleOrder(order);
                    if (isNew) {
                        // Map the right data from the sale order directly into the new issue note form
                        setForm(f => ({
                            ...f,
                            customerNameAr: order?.customerNameAr || ''
                        }));
                    }
                })
                .catch(() => toast.error('فشل تحميل تفاصيل أمر البيع'));
        } else {
            setSelectedSaleOrder(null);
            if (isNew) {
                setForm(f => ({ ...f, customerNameAr: '' }));
            }
        }
    }, [form.salesOrderId, isNew]);

    // Load existing Issue Note if editing
    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const d = await stockIssueNoteService.getById(parseInt(id));
                    if (d) setForm({ ...d, items: d.items || [] });
                    else {
                        toast.error('إذن الصرف غير موجود');
                        navigate('/dashboard/sales/issue-notes');
                    }
                } catch {
                    toast.error('فشل تحميل إذن الصرف');
                    navigate('/dashboard/sales/issue-notes');
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [id, isNew, navigate]);

    // Core Logic: Create
    const doCreateFromOrder = async () => {
        if (!form.salesOrderId || !form.warehouseId) return;
        setSaving(true);
        try {
            const created = await stockIssueNoteService.createFromSalesOrder(
                form.salesOrderId,
                form.warehouseId
            );
            if (created && created.id) {
                // Submit for approval instead of auto-approving
                await stockIssueNoteService.submitForApproval(created.id);
                toast.success('تم إنشاء إذن الصرف وإرساله للاعتماد بنجاح');
                navigate(`/dashboard/sales/issue-notes/${created.id}`);
            } else {
                toast.error('فشل الإنشاء');
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'فشل الإنشاء');
        } finally {
            setSaving(false);
        }
    };

    const createFromOrder = async () => {
        if (!form.salesOrderId || !form.warehouseId) {
            toast.error('يرجى اختيار أمر البيع والمخزن');
            return;
        }

        setSaving(true);
        try {
            // Check stock before creating
            const warnings = await stockIssueNoteService.checkStockAvailability(
                form.salesOrderId,
                form.warehouseId
            );

            if (warnings && warnings.length > 0) {
                setStockWarnings(warnings);
                setSaving(false); // Stop saving to show modal
                return;
            }

            await doCreateFromOrder();
        } catch (e) {
            setSaving(false);
            // Fallback: try creating anyway if check fails
            await doCreateFromOrder();
        }
    };

    const confirmCreateDespiteWarnings = () => {
        setStockWarnings(null);
        doCreateFromOrder();
    };

    const isReadOnly = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Rejected');

    // Handle Submit
    const handleSubmit = async (e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isReadOnly) return;
        if (form.approvalStatus === 'Approved') return;

        if (!form.salesOrderId || !form.warehouseId) {
            toast.error('أمر البيع والمخزن مطلوبان');
            return;
        }

        // Creation Flow
        if (isNew) {
            createFromOrder();
            return;
        }

        // Update Flow
        if (form.items.length === 0) {
            toast.error('أضف بنداً واحداً على الأقل');
            return;
        }

        setSaving(true);
        try {
            const updated = await stockIssueNoteService.update(form.id!, form);
            if (updated) {
                toast.success('تم تحديث إذن الصرف');
                setForm({ ...updated, items: updated.items || [] });
            } else {
                toast.error('فشل التحديث');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!form.id || !window.confirm('هل أنت متأكد من حذف إذن الصرف؟')) return;
        try {
            const ok = await stockIssueNoteService.delete(form.id);
            if (ok) {
                toast.success('تم الحذف');
                navigate('/dashboard/sales/issue-notes');
            } else {
                toast.error('فشل الحذف');
            }
        } catch {
            toast.error('فشل الحذف');
        }
    };

    if (!isNew && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    // Check if there is any stock shortage
    const hasStockShortfall = selectedSaleOrder?.items?.some(item => {
        const requiredQty = item.orderedQty || (item as any).qty || 0;
        const stockBalance = stockBalances.find(b => b.itemId === item.itemId);
        const availableQty = stockBalance?.availableQty || 0;
        return availableQty < requiredQty;
    }) ?? false;

    return (
        <div className="w-full max-w-full space-y-6 pb-12" dir="rtl">
            {/* Stock Availability Warning Modal */}
            {stockWarnings != null && stockWarnings.length > 0 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                        <div className="flex items-center gap-3 p-5 border-b border-amber-200 bg-amber-50">
                            <div className="p-3 rounded-full bg-amber-100">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 text-lg">تنبيه: الكمية المتوفرة أقل من المطلوب</h3>
                                <p className="text-sm text-slate-600">بعض الأصناف غير متوفرة بالكامل في المخزن المحدد.</p>
                            </div>
                            <button type="button" onClick={() => setStockWarnings(null)} className="p-2 hover:bg-amber-100 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-auto p-0">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                                    <tr className="text-xs font-bold text-slate-600">
                                        <th className="px-5 py-3">الصنف</th>
                                        <th className="px-5 py-3">الوحدة</th>
                                        <th className="px-5 py-3">الكمية المطلوبة</th>
                                        <th className="px-5 py-3">الكمية المتوفرة</th>
                                        <th className="px-5 py-3 text-red-600">العجز</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stockWarnings.map((w, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-5 py-3 font-medium text-slate-800">{w.itemNameAr || w.itemCode || '—'}</td>
                                            <td className="px-5 py-3 text-slate-500">{w.unitNameAr || '—'}</td>
                                            <td className="px-5 py-3 text-slate-700 font-mono">{(w.requestedQty ?? 0).toLocaleString('ar-EG')}</td>
                                            <td className="px-5 py-3 text-slate-700 font-mono">{(w.availableQty ?? 0).toLocaleString('ar-EG')}</td>
                                            <td className="px-5 py-3 font-bold text-red-600 font-mono">{(w.shortfall ?? 0).toLocaleString('ar-EG')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 p-5 border-t bg-slate-50">
                            <button type="button" onClick={confirmCreateDespiteWarnings} disabled={saving}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-200">
                                {saving ? 'جاري المعالجة...' : 'متابعة وإنشاء إذن الصرف'}
                            </button>
                            <button type="button" onClick={() => setStockWarnings(null)}
                                className="px-6 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button type="button" onClick={() => navigate('/dashboard/sales/issue-notes')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Package className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isNew ? 'إذن صرف جديد' : `إذن صرف رقم ${form.issueNoteNumber || '—'}`}
                                </h1>
                                {isReadOnly && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20"><Lock className="w-3 h-3" /> للعرض فقط</span>}
                                {form.approvalStatus && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${form.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-white border-emerald-300/30' :
                                        form.approvalStatus === 'Rejected' ? 'bg-rose-500/20 text-white border-rose-300/30' :
                                            form.approvalStatus === 'Pending' ? 'bg-amber-500/20 text-white border-amber-300/30' :
                                                'bg-slate-500/20 text-white border-slate-300/30'
                                        }`}>
                                        {form.approvalStatus === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                                        {form.approvalStatus === 'Rejected' && <XCircle className="w-3 h-3" />}
                                        {form.approvalStatus === 'Pending' && <Clock className="w-3 h-3" />}
                                        {form.approvalStatus === 'Approved' ? 'معتمد' : form.approvalStatus === 'Rejected' ? 'مرفوض' : form.approvalStatus === 'Pending' ? 'قيد الانتظار' : form.approvalStatus}
                                    </span>
                                )}
                            </div>
                            <span className="text-white/80 text-lg">
                                {isNew ? 'إصدار إذن صرف من المخزون بناءً على أمر بيع' : 'عرض وتعديل تفاصيل إذن الصرف'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {!isReadOnly && (
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={saving || (isNew && !!form.warehouseId && hasStockShortfall)}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                <span>{saving ? 'جاري الحفظ...' : isNew ? 'إنشاء' : 'تحديث'}</span>
                            </button>
                        )}
                        {!isNew && !isReadOnly && (form.status === 'Draft' || form.status === 'Pending' || form.status === 'Rejected') && (
                            <button type="button" onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-3 bg-rose-500/20 backdrop-blur-sm text-white rounded-2xl border border-rose-500/30 hover:bg-rose-500/30 transition-all">
                                <Trash2 className="w-5 h-5" />
                                <span>حذف الإذن</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Info className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">تفاصيل أمر البيع والمخزن والسائق</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Order & Warehouse */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    أمر البيع <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.salesOrderId || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, salesOrderId: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all"
                                    required
                                    disabled={!isNew}
                                >
                                    <option value="">اختر أمر البيع...</option>
                                    {salesOrders
                                        .filter(o => o.approvalStatus === 'Approved')
                                        .filter(o => !issueNotes.some(note => note.salesOrderId === o.id))
                                        .map((o) => (
                                            <option key={o.id} value={o.id}>
                                                {o.soNumber || o.orderNumber || `Order #${o.id}`} — {o.customerNameAr}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Package className="w-4 h-4 text-brand-primary" />
                                    المخزن <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.warehouseId || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, warehouseId: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all"
                                    required
                                    disabled={!isNew}
                                >
                                    <option value="">اختر المخزن...</option>
                                    {warehouses.map((w) => (
                                        <option key={w.id} value={w.id}>{w.warehouseNameAr || `مخزن ${w.id}`}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Read-only Info */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    رقم الإذن
                                </label>
                                <input type="text" value={form.issueNoteNumber || 'سيتم إنشاؤه تلقائياً'} readOnly
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium" />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <User className="w-4 h-4 text-slate-400" />
                                    العميل
                                </label>
                                <input type="text" value={form.customerNameAr || '—'} readOnly
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium" />
                            </div>

                        </div>
                    </div>

                    {/* Items Table - Only visible after creation */}
                    {!isNew && form.items && form.items.length > 0 && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                            <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-brand-primary/10 rounded-xl">
                                        <Package className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف المطلوبة</h3>
                                        <p className="text-slate-500 text-sm">{form.items.length} صنف مضاف</p>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-600">
                                            <th className="px-6 py-4 text-right">المادة / الصنف</th>
                                            <th className="px-6 py-4 text-right">الوحدة</th>
                                            <th className="px-6 py-4 text-right">الكمية المطلوبة</th>
                                            <th className="px-6 py-4 text-right">الكمية المصروفة</th>
                                            <th className="px-6 py-4 text-right">المتاح بالمخزن</th>
                                            <th className="px-6 py-4 text-right">حالة الصرف</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {form.items.map((it, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800">{it.itemNameAr || '—'}</div>
                                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{it.itemCode}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{it.unitNameAr || '—'}</td>
                                                <td className="px-6 py-4 font-mono font-medium text-slate-700">{(it.requestedQty ?? 0).toLocaleString('ar-EG')}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-emerald-600">{(it.issuedQty ?? 0).toLocaleString('ar-EG')}</td>
                                                <td className="px-6 py-4">
                                                    {(() => {
                                                        const bal = stockBalances.find(b => b.itemId === it.itemId);
                                                        const available = bal?.availableQty || 0;
                                                        const hasEnoughStock = available >= (it.requestedQty ?? 0);
                                                        return (
                                                            <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold font-mono text-xs ${hasEnoughStock ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                {hasEnoughStock ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                                {available.toLocaleString('ar-EG')}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(it.issuedQty ?? 0) >= (it.requestedQty ?? 0) ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                            <CheckCircle2 className="w-3 h-3" /> مكتمل
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                            <Clock className="w-3 h-3" /> جزئي
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Actions Footer */}
                    <div className="flex gap-4 pt-4">
                        {isNew ? (
                            <button type="submit" disabled={saving || (!!form.warehouseId && hasStockShortfall)}
                                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${(!!form.warehouseId && hasStockShortfall)
                                    ? 'bg-slate-300 text-slate-500 shadow-none'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200'
                                    }`}>
                                {saving ? (
                                    <>
                                        <Clock className="w-5 h-5 animate-spin" />
                                        جاري الإنشاء...
                                    </>
                                ) : (!!form.warehouseId && hasStockShortfall) ? (
                                    <>
                                        <AlertTriangle className="w-5 h-5" />
                                        الكمية غير متوفرة
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        إنشاء إذن الصرف
                                    </>
                                )}
                            </button>
                        ) : form.status === 'Draft' ? (
                            <button type="submit" disabled={saving}
                                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/90 active:scale-95 transition-all shadow-lg disabled:opacity-70">
                                <Save className="w-5 h-5" />
                                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        ) : null}

                        <button type="button" onClick={() => navigate('/dashboard/sales/issue-notes')}
                            className="px-8 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">
                            إلغاء
                        </button>
                    </div>
                </div>

                {/* ═══ SIDEBAR ═══ */}
                <div className="w-full lg:w-[400px] space-y-6 shrink-0">
                    {/* Linked Sale Order Financial Summary */}
                    {selectedSaleOrder && (
                        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl animate-slide-in delay-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />

                            <div className="relative space-y-6">
                                <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                    <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                        <DollarSign className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="font-bold text-xl">الملخص المالي</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                                        <div className="text-xs text-slate-400">رقم الأمر</div>
                                        <div className="font-bold text-lg text-white">
                                            {selectedSaleOrder.soNumber || `رقم ${selectedSaleOrder.id}`}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-slate-400">
                                        <span className="text-sm">المخزن</span>
                                        <span className="font-bold text-white/90">
                                            {warehouses.find(w => w.id === form.warehouseId)?.warehouseNameAr || '—'}
                                        </span>
                                    </div>

                                    {/* Items List */}
                                    {selectedSaleOrder.items && selectedSaleOrder.items.length > 0 && (
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="text-xs text-slate-400 mb-3 font-bold uppercase">الأصناف المطلوبة</div>
                                            <div className="text-xs text-white/70 mb-2">{selectedSaleOrder.items.length} صنف مضاف</div>
                                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                                {selectedSaleOrder.items.map((item, idx) => {
                                                    const requiredQty = item.orderedQty || (item as any).qty || 0;
                                                    const stockBalance = stockBalances.find(b => b.itemId === item.itemId);
                                                    const availableQty = stockBalance?.availableQty || 0;
                                                    const isAvailable = availableQty >= requiredQty;

                                                    return (
                                                        <div key={idx} className="flex justify-between items-start text-sm bg-white/5 p-3 rounded-xl border border-white/10">
                                                            <div className="flex flex-col max-w-[65%]">
                                                                <span className="font-bold text-white/90 truncate" title={item.itemNameAr}>{item.itemNameAr}</span>
                                                                <span className="text-xs text-white/50 font-mono mt-0.5">{item.itemCode}</span>
                                                                {form.warehouseId ? (
                                                                    <div className="mt-2 flex items-center gap-1.5">
                                                                        {isAvailable ? (
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                                                                <CheckCircle2 className="w-3 h-3" /> متوفر ({availableQty.toLocaleString('ar-EG')})
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                                                                <AlertCircle className="w-3 h-3" /> عجز (المتاح: {availableQty.toLocaleString('ar-EG')})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="mt-2 flex items-center gap-1.5">
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                                                            <Info className="w-3 h-3" /> يرجى اختيار مخزن
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="font-mono font-bold text-white whitespace-nowrap">
                                                                    {requiredQty.toLocaleString('ar-EG')}
                                                                </span>
                                                                <span className="text-xs text-white/50">{item.unitNameAr || ''}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="text-sm">إجمالي البنود المعروضة</span>
                                            <span className="font-bold text-white/90">
                                                {formatNumber(selectedSaleOrder.items?.reduce((s, i) => s + ((i.orderedQty || (i as any).qty || 0) * i.unitPrice), 0) ?? 0)} {selectedSaleOrder.currency || ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-y border-white/5 text-slate-300">
                                        <span className="text-sm font-semibold">الإجمالي قبل الضريبة</span>
                                        <span className="font-bold">{formatNumber(selectedSaleOrder.subTotal ?? 0)} {selectedSaleOrder.currency || ''}</span>
                                    </div>

                                    <div className="flex justify-between items-center px-4 py-2 text-white/60">
                                        <span className="text-sm">مصاريف الشحن</span>
                                        <span className="font-bold">{formatNumber(selectedSaleOrder.deliveryCost ?? 0)} {selectedSaleOrder.currency || ''}</span>
                                    </div>

                                    <div className="flex justify-between items-center px-4 py-2 text-white/60">
                                        <span className="text-sm">مصاريف إضافية</span>
                                        <span className="font-bold">{formatNumber(selectedSaleOrder.otherCosts ?? 0)} {selectedSaleOrder.currency || ''}</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mt-2">
                                        <span className="text-emerald-400 font-semibold text-sm">إجمالي الضريبة</span>
                                        <span className="font-bold text-lg text-emerald-400">
                                            {formatNumber(selectedSaleOrder.taxAmount ?? 0)}
                                        </span>
                                    </div>

                                    <div className="pt-6 mt-2 border-t border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">صافي الإذن</div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black text-white">{formatNumber(selectedSaleOrder.totalAmount ?? 0)}</span>
                                                    <span className="text-indigo-400 font-bold">{selectedSaleOrder.currency || ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
                                <h3 className="font-bold text-slate-800">ملاحظات والتوجيهات</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={isReadOnly} className={`w-full p-4 border-2 rounded-xl outline-none transition-all h-32 resize-none ${isReadOnly ? 'bg-slate-50 border-slate-200' : 'focus:border-emerald-500'}`} placeholder="ملاحظات..." />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StockIssueNoteFormPage;