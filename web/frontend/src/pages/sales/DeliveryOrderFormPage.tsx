import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Trash2,
    FileText,
    Truck,
    MapPin,
    Phone,
    Hash,
    Clock,
    Send,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Eye,
    Lock
} from 'lucide-react';
import { deliveryOrderService, type DeliveryOrderDto } from '../../services/deliveryOrderService';
import { stockIssueNoteService } from '../../services/stockIssueNoteService';
import { approvalService } from '../../services/approvalService';
import { toast } from 'react-hot-toast';

const DeliveryOrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const issueNoteIdParam = searchParams.get('issueNoteId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [issueNotes, setIssueNotes] = useState<{ id?: number; issueNoteNumber?: string; soNumber?: string; customerNameAr?: string; status?: string }[]>([]);
    const approvalId = searchParams.get('approvalId');
    const isView = searchParams.get('mode') === 'view';
    const isEdit = !!id && !isNew;

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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isReadOnly) return;
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

    const isReadOnly = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Pending' && form.status !== 'Rejected');

    const handleDelete = async () => {
        if (!form.id || !window.confirm('حذف أمر التوصيل؟')) return;
        try {
            const ok = await deliveryOrderService.delete(form.id);
            if (ok) { toast.success('تم الحذف'); navigate('/dashboard/sales/delivery-orders'); }
            else toast.error('فشل الحذف');
        } catch { toast.error('فشل الحذف'); }
    };

    const handleSubmitForApproval = async () => {
        if (!id || isNew) {
            toast.error('يجب حفظ أمر التوصيل أولاً قبل الإرسال للاعتماد');
            return;
        }
        if (form.status !== 'Draft' && form.status !== 'Rejected') {
            toast.error('يمكن إرسال المسودات أو المرفوضة فقط للاعتماد');
            return;
        }
        try {
            setProcessing(true);
            const updated = await deliveryOrderService.submitForApproval(parseInt(id));
            if (updated) {
                setForm(updated);
                toast.success('تم إرسال أمر التوصيل للاعتماد بنجاح');
                navigate('/dashboard/sales/delivery-orders');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إرسال أمر التوصيل للاعتماد');
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

    if (!isNew && !form.deliveryOrderNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex items-center justify-between gap-5">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/sales/delivery-orders')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Truck className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isNew ? 'أمر توصيل جديد' : `تعديل أمر التوصيل ${form.deliveryOrderNumber || ''}`}
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
                            <p className="text-white/80 text-lg">أدخل تفاصيل أمر التوصيل</p>
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
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    <span>{saving ? 'جاري الحفظ...' : isNew ? 'حفظ' : 'تحديث'}</span>
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
                        {!isNew && !isReadOnly && form.status !== 'Delivered' && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-3 bg-rose-500/20 backdrop-blur-sm text-rose-200 rounded-2xl border border-rose-500/30 
                                    hover:bg-rose-500/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{saving ? 'جاري الحفظ...' : isNew ? 'إنشاء أمر التوصيل' : 'حفظ'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-primary/10 rounded-xl">
                                <FileText className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                <p className="text-slate-500 text-sm">معلومات أمر التوصيل</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isNew ? (
                            <div className="md:col-span-2 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    إذن الصرف (معتمد) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.issueNoteId || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, issueNoteId: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold"
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
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Hash className="w-4 h-4 text-brand-primary" />
                                        رقم أمر التوصيل
                                    </label>
                                    <input type="text" value={form.deliveryOrderNumber || ''} readOnly className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <FileText className="w-4 h-4 text-brand-primary" />
                                        إذن الصرف
                                    </label>
                                    <input type="text" value={form.issueNoteNumber || '—'} readOnly className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Truck className="w-4 h-4 text-brand-primary" />
                                        العميل
                                    </label>
                                    <input type="text" value={form.customerNameAr || '—'} readOnly className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold" />
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <MapPin className="w-4 h-4 text-brand-primary" />
                                عنوان التوصيل
                            </label>
                            <input type="text" value={form.deliveryAddress || ''} onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" placeholder="عنوان الاستلام" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Truck className="w-4 h-4 text-brand-primary" />
                                السائق
                            </label>
                            <input type="text" value={form.driverName || ''} onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Phone className="w-4 h-4 text-brand-primary" />
                                هاتف السائق
                            </label>
                            <input type="text" value={form.driverPhone || ''} onChange={(e) => setForm((f) => ({ ...f, driverPhone: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Clock className="w-4 h-4 text-brand-primary" />
                                الحالة
                            </label>
                            <select value={form.status || 'Pending'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" disabled={isNew}>
                                <option value="Pending">قيد الانتظار</option>
                                <option value="InTransit">في الطريق</option>
                                <option value="Delivered">تم التوصيل</option>
                                <option value="Cancelled">ملغي</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                اسم المستلم
                            </label>
                            <input type="text" value={form.receiverName || ''} onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Phone className="w-4 h-4 text-brand-primary" />
                                هاتف المستلم
                            </label>
                            <input type="text" value={form.receiverPhone || ''} onChange={(e) => setForm((f) => ({ ...f, receiverPhone: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                ملاحظات
                            </label>
                            <textarea value={form.notes || ''} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold resize-none" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DeliveryOrderFormPage;
