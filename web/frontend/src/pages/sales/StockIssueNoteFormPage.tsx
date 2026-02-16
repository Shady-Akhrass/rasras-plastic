import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Trash2,
    AlertTriangle,
    X,
    FileText,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    AlertCircle,
    Info,
    User,
    Send,
    XCircle,
    RefreshCw,
    Eye,
    Lock
} from 'lucide-react';
import { stockIssueNoteService, type StockIssueNoteDto, type StockAvailabilityWarningDto } from '../../services/stockIssueNoteService';
import { saleOrderService } from '../../services/saleOrderService';
import warehouseService from '../../services/warehouseService';
import { approvalService } from '../../services/approvalService';
import { toast } from 'react-hot-toast';

const StockIssueNoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const approvalId = queryParams.get('approvalId');
    const isView = queryParams.get('mode') === 'view';
    const isNew = !id || id === 'new';
    const isEdit = !!id && !isNew;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    // Data lists
    const [salesOrders, setSalesOrders] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<{ id: number; warehouseNameAr?: string }[]>([]);
    
    // Warnings
    const [stockWarnings, setStockWarnings] = useState<StockAvailabilityWarningDto[] | null>(null);

    // Form State
    const [form, setForm] = useState<StockIssueNoteDto>({
        issueDate: new Date().toISOString().slice(0, 19),
        salesOrderId: 0,
        warehouseId: 0,
        items: []
    });

    // Load initial data (Orders + Warehouses)
    useEffect(() => {
        (async () => {
            try {
                const [orders, whResp] = await Promise.all([
                    saleOrderService.getAll(),
                    warehouseService.getAll?.() ?? Promise.resolve([])
                ]);
                setSalesOrders(Array.isArray(orders) ? orders : []);
                
                // Handle different response structures for warehouse service
                const whList = Array.isArray(whResp) ? whResp : (whResp as any)?.data ?? [];
                setWarehouses(Array.isArray(whList) ? whList : []);
            } catch { 
                toast.error('فشل تحميل البيانات'); 
            }
        })();
    }, []);

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
            if (created) {
                toast.success('تم إنشاء إذن الصرف بنجاح');
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleSubmitForApproval = async () => {
        if (!id || isNew) {
            toast.error('يجب حفظ إذن الصرف أولاً قبل الإرسال للاعتماد');
            return;
        }
        if (form.items.length === 0) {
            toast.error('أضف بنداً واحداً على الأقل');
            return;
        }
        if (form.status !== 'Draft' && form.status !== 'Rejected') {
            toast.error('يمكن إرسال المسودات أو المرفوضة فقط للاعتماد');
            return;
        }
        try {
            setProcessing(true);
            const updated = await stockIssueNoteService.submitForApproval(parseInt(id));
            if (updated) {
                setForm(updated);
                toast.success('تم إرسال إذن الصرف للاعتماد بنجاح');
                navigate('/dashboard/sales/issue-notes');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إرسال إذن الصرف للاعتماد');
        } finally {
            setProcessing(false);
        }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
            navigate('/dashboard/sales/approvals');
        } catch {
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessing(false);
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
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                                        form.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-white border-emerald-300/30' :
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
                        {isView && approvalId && (
                            <>
                                <button
                                    onClick={() => handleApprovalAction('Approved')}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    <span>اعتماد</span>
                                </button>
                                <button
                                    onClick={() => handleApprovalAction('Rejected')}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                    <span>رفض</span>
                                </button>
                                <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-bold">عرض من صندوق الاعتماد</span>
                                </div>
                            </>
                        )}
                        {!isReadOnly && (
                            <>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{saving ? 'جاري الحفظ...' : isNew ? 'إنشاء' : 'تحديث'}</span>
                                </button>
                                {isEdit && (form.status === 'Draft' || form.status === 'Rejected') && (
                                    <button
                                        onClick={handleSubmitForApproval}
                                        disabled={processing || saving}
                                        className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        <span>إرسال للاعتماد</span>
                                    </button>
                                )}
                            </>
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                                {salesOrders.map((o) => (
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

                        {/* Driver & Logistics Info */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <User className="w-4 h-4 text-brand-primary" />
                                اسم السائق
                            </label>
                            <input type="text" value={form.driverName || ''} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} 
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all" 
                                placeholder="اسم السائق" />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Truck className="w-4 h-4 text-brand-primary" />
                                رقم المركبة
                            </label>
                            <input type="text" value={form.vehicleNo || ''} onChange={(e) => setForm((f) => ({ ...f, vehicleNo: e.target.value }))} 
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all" 
                                placeholder="رقم اللوحة" />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <User className="w-4 h-4 text-brand-primary" />
                                اسم المستلم
                            </label>
                            <input type="text" value={form.receivedByName || ''} onChange={(e) => setForm((f) => ({ ...f, receivedByName: e.target.value }))} 
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none transition-all" 
                                placeholder="الشخص الذي استلم البضاعة" />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                ملاحظات
                            </label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} 
                                rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none transition-all" 
                                placeholder="أي ملاحظات إضافية..." />
                        </div>
                    </div>
                </div>

                {/* Items Table - Only visible after creation */}
                {!isNew && form.items && form.items.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-brand-primary" />
                                بنود الصرف
                            </h2>
                            <span className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-lg border border-slate-200">
                                عدد البنود: {form.items.length}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-600">
                                        <th className="px-6 py-4 text-right">المادة / الصنف</th>
                                        <th className="px-6 py-4 text-right">الوحدة</th>
                                        <th className="px-6 py-4 text-right">الكمية المطلوبة</th>
                                        <th className="px-6 py-4 text-right">الكمية المصروفة</th>
                                        <th className="px-6 py-4 text-right">حالة التوفر</th>
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
                                                {(it.issuedQty ?? 0) >= (it.requestedQty ?? 0) ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                        <CheckCircle2 className="w-3 h-3" /> متوفر
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                                        <AlertCircle className="w-3 h-3" /> عجز
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
                        <button type="submit" disabled={saving} 
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-lg hover:shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed">
                            {saving ? (
                                <>
                                    <Clock className="w-5 h-5 animate-spin" />
                                    جاري الإنشاء...
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
            </form>
        </div>
    );
};

export default StockIssueNoteFormPage;