import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Save, Trash2 } from 'lucide-react';
import { deliveryOrderService, type DeliveryOrderDto } from '../../services/deliveryOrderService';
import { stockIssueNoteService } from '../../services/stockIssueNoteService';
import { toast } from 'react-hot-toast';

const DeliveryOrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const issueNoteIdParam = searchParams.get('issueNoteId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [issueNotes, setIssueNotes] = useState<{ id?: number; issueNoteNumber?: string; soNumber?: string; customerNameAr?: string; status?: string }[]>([]);

    const [form, setForm] = useState<DeliveryOrderDto>({
        issueNoteId: 0,
        deliveryAddress: '',
        driverName: '',
        driverPhone: '',
        vehicleNo: '',
        status: 'Pending',
        notes: ''
    });

    useEffect(() => {
        (async () => {
            try {
                const list = await stockIssueNoteService.getAll();
                const approved = (Array.isArray(list) ? list : []).filter((n) => n.status === 'Approved');
                setIssueNotes(approved);
            } catch { toast.error('فشل تحميل إذونات الصرف'); }
        })();
    }, []);

    useEffect(() => {
        if (issueNoteIdParam) {
            setForm((f) => ({ ...f, issueNoteId: parseInt(issueNoteIdParam) || 0 }));
        }
    }, [issueNoteIdParam]);

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const d = await deliveryOrderService.getById(parseInt(id));
                    if (d) setForm({ ...d, issueNoteId: d.issueNoteId ?? 0 });
                    else { toast.error('أمر التوصيل غير موجود'); navigate('/dashboard/sales/delivery-orders'); }
                } catch { toast.error('فشل تحميل أمر التوصيل'); navigate('/dashboard/sales/delivery-orders'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNew) {
            if (!form.issueNoteId) { toast.error('اختر إذن الصرف'); return; }
            setSaving(true);
            try {
                const created = await deliveryOrderService.createFromIssueNote(form.issueNoteId);
                if (created) {
                    toast.success('تم إنشاء أمر التوصيل');
                    navigate(`/dashboard/sales/delivery-orders/${created.id}`);
                } else {
                    toast.error('فشل الإنشاء');
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'فشل الإنشاء');
            } finally { setSaving(false); }
            return;
        }
        if (!form.id) return;
        setSaving(true);
        try {
            const updated = await deliveryOrderService.update(form.id, form);
            if (updated) {
                toast.success('تم تحديث أمر التوصيل');
                setForm({ ...updated, issueNoteId: updated.issueNoteId ?? 0 });
            } else {
                toast.error('فشل التحديث');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل الحفظ');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!form.id || !window.confirm('حذف أمر التوصيل؟')) return;
        try {
            const ok = await deliveryOrderService.delete(form.id);
            if (ok) { toast.success('تم الحذف'); navigate('/dashboard/sales/delivery-orders'); }
            else toast.error('فشل الحذف');
        } catch { toast.error('فشل الحذف'); }
    };

    if (!isNew && !form.deliveryOrderNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/dashboard/sales/delivery-orders')} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight className="w-6 h-6" /></button>
                <h1 className="text-xl font-bold text-slate-800">{isNew ? 'أمر توصيل جديد' : `أمر توصيل ${form.deliveryOrderNumber || ''}`}</h1>
                {!isNew && form.status !== 'Delivered' && (
                    <button type="button" onClick={handleDelete} className="mr-auto p-2 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-5 h-5" /></button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                    <h2 className="font-bold text-slate-800 border-b pb-2">البيانات الأساسية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isNew ? (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">إذن الصرف (معتمد) *</label>
                                <select
                                    value={form.issueNoteId || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, issueNoteId: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                    required
                                >
                                    <option value="">اختر إذن صرف معتمد...</option>
                                    {issueNotes.map((n) => (
                                        <option key={n.id} value={n.id}>{n.issueNoteNumber} — {n.soNumber} — {n.customerNameAr}</option>
                                    ))}
                                    {issueNotes.length === 0 && <option value="" disabled>لا يوجد إذن صرف معتمد</option>}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">رقم أمر التوصيل</label>
                                    <input type="text" value={form.deliveryOrderNumber || ''} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">إذن الصرف</label>
                                    <input type="text" value={form.issueNoteNumber || '—'} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">العميل</label>
                                    <input type="text" value={form.customerNameAr || '—'} readOnly className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600" />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">عنوان التوصيل</label>
                            <input type="text" value={form.deliveryAddress || ''} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" placeholder="عنوان الاستلام" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">السائق</label>
                            <input type="text" value={form.driverName || ''} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">هاتف السائق</label>
                            <input type="text" value={form.driverPhone || ''} onChange={(e) => setForm((f) => ({ ...f, driverPhone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">الحالة</label>
                            <select value={form.status || 'Pending'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" disabled={isNew}>
                                <option value="Pending">قيد الانتظار</option>
                                <option value="InTransit">في الطريق</option>
                                <option value="Delivered">تم التوصيل</option>
                                <option value="Cancelled">ملغي</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">اسم المستلم</label>
                            <input type="text" value={form.receiverName || ''} onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">هاتف المستلم</label>
                            <input type="text" value={form.receiverPhone || ''} onChange={(e) => setForm((f) => ({ ...f, receiverPhone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">ملاحظات</label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none resize-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold disabled:opacity-50"><Save className="w-5 h-5" />{saving ? 'جاري الحفظ...' : isNew ? 'إنشاء أمر التوصيل' : 'حفظ'}</button>
                    <button type="button" onClick={() => navigate('/dashboard/sales/delivery-orders')} className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">إلغاء</button>
                </div>
            </form>
        </div>
    );
};

export default DeliveryOrderFormPage;
