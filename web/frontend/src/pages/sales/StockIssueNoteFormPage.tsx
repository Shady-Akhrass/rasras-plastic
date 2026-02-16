import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Save, Trash2, AlertTriangle, X } from 'lucide-react';
import { stockIssueNoteService, type StockIssueNoteDto, type StockAvailabilityWarningDto } from '../../services/stockIssueNoteService';
import { saleOrderService } from '../../services/saleOrderService';
import warehouseService from '../../services/warehouseService';
import { toast } from 'react-hot-toast';

const StockIssueNoteFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [salesOrders, setSalesOrders] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<{ id: number; warehouseNameAr?: string }[]>([]);
    /** تحذير توفر المخزون: عند وجود عناصر يُعرض نافذة تحذير قبل الإنشاء */
    const [stockWarnings, setStockWarnings] = useState<StockAvailabilityWarningDto[] | null>(null);

    const [form, setForm] = useState<StockIssueNoteDto>({
        issueDate: new Date().toISOString().slice(0, 19),
        salesOrderId: 0,
        warehouseId: 0,
        items: []
    });

    useEffect(() => {
        (async () => {
            try {
                const [orders, whResp] = await Promise.all([
                    saleOrderService.getAll(),
                    warehouseService.getAll?.() ?? Promise.resolve([])
                ]);
                setSalesOrders(Array.isArray(orders) ? orders : []);
                const whList = Array.isArray(whResp) ? whResp : (whResp as any)?.data ?? [];
                setWarehouses(Array.isArray(whList) ? whList : []);
            } catch { toast.error('فشل تحميل البيانات'); }
        })();
    }, []);

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const d = await stockIssueNoteService.getById(parseInt(id));
                    if (d) setForm({ ...d, items: d.items || [] });
                    else { toast.error('إذن الصرف غير موجود'); navigate('/dashboard/sales/issue-notes'); }
                } catch { toast.error('فشل تحميل إذن الصرف'); navigate('/dashboard/sales/issue-notes'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const doCreateFromOrder = async () => {
        if (!form.salesOrderId || !form.warehouseId) return;
        setSaving(true);
        try {
            const created = await stockIssueNoteService.createFromSalesOrder(
                form.salesOrderId,
                form.warehouseId
            );
            if (created) {
                toast.success('تم إنشاء إذن الصرف من أمر البيع');
                navigate(`/dashboard/sales/issue-notes/${created.id}`);
            } else {
                toast.error('فشل الإنشاء');
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'فشل الإنشاء');
        } finally { setSaving(false); }
    };

    const createFromOrder = async () => {
        if (!form.salesOrderId || !form.warehouseId) {
            toast.error('اختر أمر البيع والمخزن');
            return;
        }
        const warnings = await stockIssueNoteService.checkStockAvailability(
            form.salesOrderId,
            form.warehouseId
        );
        if (warnings.length > 0) {
            setStockWarnings(warnings);
            return;
        }
        await doCreateFromOrder();
    };

    const confirmCreateDespiteWarnings = () => {
        setStockWarnings(null);
        doCreateFromOrder();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.salesOrderId || !form.warehouseId) { toast.error('أمر البيع والمخزن مطلوبان'); return; }
        if (form.items.length === 0 && isNew) {
            createFromOrder();
            return;
        }
        if (!isNew && form.items.length === 0) { toast.error('أضف بنداً واحداً على الأقل'); return; }
        setSaving(true);
        try {
            if (isNew) {
                createFromOrder();
                return;
            }
            const updated = await stockIssueNoteService.update(form.id!, form);
            if (updated) {
                toast.success('تم تحديث إذن الصرف');
                setForm({ ...updated, items: updated.items || [] });
            } else {
                toast.error('فشل التحديث');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل الحفظ');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!form.id || !window.confirm('حذف إذن الصرف؟')) return;
        try {
            const ok = await stockIssueNoteService.delete(form.id);
            if (ok) { toast.success('تم الحذف'); navigate('/dashboard/sales/issue-notes'); }
            else toast.error('فشل الحذف');
        } catch { toast.error('فشل الحذف'); }
    };

    if (!isNew && !form.issueNoteNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* نافذة تحذير توفر المخزون (تحذير فقط — يمكن متابعة الإنشاء) */}
            {stockWarnings != null && stockWarnings.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center gap-3 p-4 border-b border-amber-200 bg-amber-50">
                            <div className="p-2 rounded-xl bg-amber-100">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800">تنبيه: الكمية المتوفرة أقل من المطلوب</h3>
                                <p className="text-sm text-slate-600">الأصناف التالية لا يتوفر منها الكمية الكافية في المخزن المحدد. يمكنك المتابعة لإنشاء إذن الصرف رغم ذلك.</p>
                            </div>
                            <button type="button" onClick={() => setStockWarnings(null)} className="p-2 hover:bg-amber-100 rounded-xl text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-auto p-4">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-600">
                                        <th className="px-3 py-2">الصنف</th>
                                        <th className="px-3 py-2">مطلوب</th>
                                        <th className="px-3 py-2">متوفر</th>
                                        <th className="px-3 py-2 text-red-600">نقص</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockWarnings.map((w, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="px-3 py-2 text-slate-800">{w.itemNameAr || w.itemCode || '—'}</td>
                                            <td className="px-3 py-2">{(w.requestedQty ?? 0).toLocaleString('ar-EG')} {w.unitNameAr || ''}</td>
                                            <td className="px-3 py-2">{(w.availableQty ?? 0).toLocaleString('ar-EG')}</td>
                                            <td className="px-3 py-2 font-medium text-red-600">{(w.shortfall ?? 0).toLocaleString('ar-EG')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-3 p-4 border-t bg-slate-50">
                            <button type="button" onClick={confirmCreateDespiteWarnings} disabled={saving}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-bold disabled:opacity-50">
                                متابعة رغم ذلك وإنشاء إذن الصرف
                            </button>
                            <button type="button" onClick={() => setStockWarnings(null)}
                                className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-100">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/sales/issue-notes')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">
                    {isNew ? 'إذن صرف جديد' : `إذن صرف ${form.issueNoteNumber || ''}`}
                </h1>
                {!isNew && form.status === 'Draft' && (
                    <button type="button" onClick={handleDelete} className="mr-auto p-2 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">البيانات الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">أمر البيع *</label>
                            <select
                                value={form.salesOrderId || ''}
                                onChange={(e) => setForm((f) => ({ ...f, salesOrderId: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                required
                                disabled={!isNew}
                            >
                                <option value="">اختر أمر البيع...</option>
                                {salesOrders.map((o) => (
                                    <option key={o.id} value={o.id}>{o.soNumber || o.orderNumber} — {o.customerNameAr}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">المخزن *</label>
                            <select
                                value={form.warehouseId || ''}
                                onChange={(e) => setForm((f) => ({ ...f, warehouseId: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                required
                                disabled={!isNew}
                            >
                                <option value="">اختر المخزن...</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>{w.warehouseNameAr || w.id}</option>
                                ))}
                            </select>
                        </div>
                        {!isNew && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">رقم الإذن</label>
                                    <input type="text" value={form.issueNoteNumber || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">العميل</label>
                                    <input type="text" value={form.customerNameAr || '—'} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">السائق</label>
                                    <input type="text" value={form.driverName || ''} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">رقم المركبة</label>
                                    <input type="text" value={form.vehicleNo || ''} onChange={(e) => setForm((f) => ({ ...f, vehicleNo: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">اسم المستلم</label>
                                    <input type="text" value={form.receivedByName || ''} onChange={(e) => setForm((f) => ({ ...f, receivedByName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                                </div>
                            </>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ملاحظات</label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none" />
                        </div>
                    </div>
                </div>

                {!isNew && form.items && form.items.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-6">
                        <h2 className="font-bold text-slate-800 border-b pb-2 mb-4">بنود الصرف</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b">
                                        <th className="px-3 py-2 text-right text-xs font-semibold">المادة</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">الكمية المطلوبة</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">الكمية المصروفة</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold">الوحدة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {form.items.map((it, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="px-3 py-2 text-slate-800">{it.itemNameAr || it.itemCode || '—'}</td>
                                            <td className="px-3 py-2 text-slate-600">{(it.requestedQty ?? 0).toLocaleString('ar-EG')}</td>
                                            <td className="px-3 py-2 text-slate-600">{(it.issuedQty ?? 0).toLocaleString('ar-EG')}</td>
                                            <td className="px-3 py-2 text-slate-600">{it.unitNameAr || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    {isNew ? (
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold disabled:opacity-50">
                            <Save className="w-5 h-5" />{saving ? 'جاري الإنشاء...' : 'إنشاء إذن الصرف من أمر البيع'}
                        </button>
                    ) : form.status === 'Draft' ? (
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold disabled:opacity-50"><Save className="w-5 h-5" />{saving ? 'جاري الحفظ...' : 'حفظ'}</button>
                    ) : null}
                    <button type="button" onClick={() => navigate('/dashboard/sales/issue-notes')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default StockIssueNoteFormPage;
