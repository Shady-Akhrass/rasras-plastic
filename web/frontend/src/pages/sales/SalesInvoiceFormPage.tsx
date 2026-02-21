import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Plus,
    Trash2,
    Receipt,
    Clock,
    CheckCircle2,
    Lock,
    Info,
    Calendar,
    DollarSign,
    Package,
    FileText,
    Send,
    XCircle,
    RefreshCw,
    Eye
} from 'lucide-react';
import { salesInvoiceService, type SalesInvoiceDto, type SalesInvoiceItemDto } from '../../services/salesInvoiceService';
import { saleOrderService } from '../../services/saleOrderService';
import customerService from '../../services/customerService';
import { itemService } from '../../services/itemService';
import { approvalService } from '../../services/approvalService';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../../utils/format';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, {
        label: string;
        bg: string;
        text: string;
        border: string;
        icon: React.ElementType;
    }> = {
        'Draft': {
            label: 'مسودة',
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-200',
            icon: FileText
        },
        'Pending': {
            label: 'قيد الاعتماد',
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: Clock
        },
        'Approved': {
            label: 'معتمد',
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: CheckCircle2
        },
        'Paid': {
            label: 'مدفوع',
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            border: 'border-purple-200',
            icon: CheckCircle2
        },
        'Partial': {
            label: 'مدفوع جزئياً',
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: Clock
        }
    };

    const c = config[status] || config['Draft'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
        </span>
    );
};

const SalesInvoiceFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const saleOrderIdParam = searchParams.get('saleOrderId');
    const isNew = !id || id === 'new';
    const isView = searchParams.get('mode') === 'view';
    const isEdit = !!id && !isNew;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [saleOrders, setSaleOrders] = useState<any[]>([]);
    const approvalId = searchParams.get('approvalId');

    const [form, setForm] = useState<SalesInvoiceDto>({
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        customerId: 0,
        salesOrderId: 0,
        currency: 'EGP',
        exchangeRate: 1,
        paymentTerms: '',
        discountPercentage: 0,
        taxAmount: 0,
        paidAmount: 0,
        notes: '',
        status: 'Draft',
        items: []
    });

    const isReadOnly = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Rejected');

    useEffect(() => {
        (async () => {
            try {
                const [c, i, so] = await Promise.all([
                    customerService.getActiveCustomers().catch(() => []),
                    (itemService.getActiveItems() as Promise<{ data?: any[] }>).then((r) => Array.isArray(r?.data) ? r.data : Array.isArray(r) ? r : []).catch(() => []),
                    saleOrderService.getAll().catch(() => [])
                ]);
                setCustomers(Array.isArray(c) ? c : []);
                setItems(Array.isArray(i) ? i : []);
                setSaleOrders(Array.isArray(so) ? so : []);
            } catch { toast.error('فشل تحميل البيانات'); }
        })();
    }, []);

    const loadFromSaleOrder = async (soId: number) => {
        if (!soId) {
            setForm((f) => ({ ...f, salesOrderId: 0, soNumber: undefined, customerId: 0, customerNameAr: undefined, items: [] }));
            return;
        }
        try {
            const so = await saleOrderService.getById(soId);
            if (so) {
                setForm((f) => ({
                    ...f,
                    salesOrderId: so.id!,
                    soNumber: so.soNumber,
                    customerId: so.customerId,
                    customerNameAr: so.customerNameAr,
                    paymentTerms: so.paymentTerms ?? f.paymentTerms,
                    discountPercentage: 0,
                    taxAmount: so.taxAmount ?? 0,
                    items: (so.items || []).map((i) => ({
                        itemId: i.itemId,
                        itemNameAr: i.itemNameAr,
                        itemCode: i.itemCode,
                        quantity: i.orderedQty,
                        unitId: i.unitId,
                        unitNameAr: i.unitNameAr,
                        unitPrice: i.unitPrice,
                        discountPercentage: i.discountPercentage,
                        totalPrice: i.totalPrice
                    }))
                }));
            }
        } catch { toast.error('فشل تحميل أمر البيع'); }
    };

    useEffect(() => {
        if (saleOrderIdParam) loadFromSaleOrder(parseInt(saleOrderIdParam));
    }, [saleOrderIdParam]);

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const inv = await salesInvoiceService.getById(parseInt(id));
                    if (inv) setForm({ ...inv, items: inv.items || [] });
                    else { toast.error('الفاتورة غير موجودة'); navigate('/dashboard/sales/invoices'); }
                } catch { toast.error('فشل تحميل الفاتورة'); navigate('/dashboard/sales/invoices'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const addItem = () => { setForm((f) => ({ ...f, items: [...f.items, { itemId: 0, quantity: 1, unitId: 0, unitPrice: 0, discountPercentage: 0, totalPrice: 0 }] })); };
    const removeItem = (idx: number) => { setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) })); };
    const updateItem = (idx: number, u: Partial<SalesInvoiceItemDto>) => {
        setForm((f) => {
            const arr = [...f.items];
            arr[idx] = { ...arr[idx], ...u };
            const it = items.find((x) => x.id === (u.itemId ?? arr[idx].itemId));
            if (u.itemId !== undefined && it) arr[idx].unitId = it.unitId;
            return { ...f, items: arr };
        });
    };

    const subtotal = form.items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0) * (1 - (i.discountPercentage || 0) / 100), 0);
    const disc = subtotal * ((form.discountPercentage || 0) / 100);
    const afterDisc = subtotal - disc;
    const tax = form.taxAmount || 0;
    const total = afterDisc + tax;
    const paid = form.paidAmount ?? 0;
    const balance = total - paid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;
        if (form.approvalStatus === 'Approved') return;
        if (!form.customerId) { toast.error('اختر العميل'); return; }
        if (form.items.length === 0) { toast.error('أضف بنداً واحداً على الأقل'); return; }
        setSaving(true);
        try {
            const payload: SalesInvoiceDto = { ...form, subTotal: subtotal, discountAmount: disc, taxAmount: tax, totalAmount: total, remainingAmount: balance, items: form.items };
            if (isNew) {
                await salesInvoiceService.create(payload);
                toast.success('تم إنشاء الفاتورة');
            } else {
                await salesInvoiceService.update(parseInt(id!), payload);
                toast.success('تم التحديث');
            }
            navigate('/dashboard/sales/invoices');
        } catch (err: any) {
            const msg = err?.response?.status === 404 ? 'واجهة فواتير المبيعات غير مفعّلة في الخادم بعد' : (err?.response?.data?.message || 'فشل الحفظ');
            toast.error(msg);
        } finally { setSaving(false); }
    };

    const handleSubmitForApproval = async () => {
        if (!id || isNew) {
            toast.error('يجب حفظ الفاتورة أولاً قبل الإرسال للاعتماد');
            return;
        }
        if (!form.customerId) {
            toast.error('اختر العميل');
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
            const updated = await salesInvoiceService.submitForApproval(parseInt(id));
            if (updated) {
                setForm(updated);
                toast.success('تم إرسال الفاتورة للاعتماد بنجاح');
                navigate('/dashboard/sales/invoices');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إرسال الفاتورة للاعتماد');
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

    const inputClass = (extra = '') =>
        `w-full px-4 py-3 border-2 border-transparent rounded-xl 
        focus:border-purple-600 outline-none transition-all font-semibold
        ${isReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'} ${extra}`;

    const smallInputClass = (extra = '') =>
        `px-3 py-2 border-2 border-transparent rounded-xl text-sm outline-none transition-all font-semibold
        ${isReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white focus:border-purple-600'} ${extra}`;

    if (!isNew && !form.invoiceNumber && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>
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
                        <button onClick={() => navigate('/dashboard/sales/invoices')} className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Receipt className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{isNew ? 'فاتورة مبيعات جديدة' : `فاتورة ${form.invoiceNumber || ''}`}</h1>
                                {!isNew && <StatusBadge status={form.status || 'Draft'} />}
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
                            <p className="text-white/80 text-lg">إصدار ومتابعة فواتير العملاء</p>
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
                                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                                    <Save className="w-5 h-5" />
                                    <span>{saving ? 'جاري الحفظ...' : isNew ? 'حفظ الفاتورة' : 'تحديث'}</span>
                                </button>
                                {isEdit && (form.status === 'Draft' || form.status === 'Rejected') && (
                                    <button onClick={handleSubmitForApproval} disabled={processing || saving} className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50">
                                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        <span>إرسال للاعتماد</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Info className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">بيانات العميل والفاتورة</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">أمر البيع (تحميل منه)</label>
                                <select disabled={isReadOnly} value={form.salesOrderId || ''} onChange={(e) => loadFromSaleOrder(parseInt(e.target.value) || 0)} className={inputClass()}>
                                    <option value="">—</option>
                                    {saleOrders.map((o) => <option key={o.id} value={o.id}>{o.soNumber} — {o.customerNameAr}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">العميل *</label>
                                <select disabled={isReadOnly} value={form.customerId || ''} onChange={(e) => setForm((f) => ({ ...f, customerId: parseInt(e.target.value) || 0 }))} className={inputClass()} required>
                                    <option value="">اختر العميل...</option>
                                    {customers.map((c) => <option key={c.id} value={c.id}>{c.customerNameAr}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    تاريخ الفاتورة <span className="text-rose-500">*</span>
                                </label>
                                <input disabled={isReadOnly} type="date" value={form.invoiceDate || ''} onChange={(e) => setForm((f) => ({ ...f, invoiceDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} className={inputClass()} required />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">تاريخ الاستحقاق</label>
                                <input disabled={isReadOnly} type="date" value={form.dueDate || ''} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} className={inputClass()} />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">شروط الدفع</label>
                                <input disabled={isReadOnly} type="text" value={form.paymentTerms || ''} onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))} className={inputClass()} />
                            </div>
                        </div>
                    </div>

                    {/* ═══ ITEMS TABLE ═══ */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in" style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100/50 rounded-xl"><Package className="w-5 h-5 text-purple-600" /></div>
                                    <div><h3 className="font-bold text-slate-800 text-lg">الأصناف</h3><p className="text-slate-500 text-sm">{form.items.length} صنف مضاف</p></div>
                                </div>
                                {!isReadOnly && <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg"><Plus className="w-4 h-4" /> إضافة صنف</button>}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right">الصنف</th>
                                        <th className="py-4 px-4 text-center">الكمية</th>
                                        <th className="py-4 px-4 text-center">السعر</th>
                                        <th className="py-4 px-4 text-center">خصم %</th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        {!isReadOnly && <th className="py-4 pl-6"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {form.items.map((it, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-6">
                                                <select disabled={isReadOnly} value={it.itemId || ''} onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) || 0 })} className={smallInputClass('min-w-[200px]')}>
                                                    <option value="">اختر الصنف...</option>
                                                    {items.map((i) => <option key={i.id} value={i.id}>{i.itemNameAr || i.itemCode}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4"><input disabled={isReadOnly} type="number" min={0.001} value={it.quantity || ''} onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} className={smallInputClass('w-20 text-center font-bold text-purple-600')} /></td>
                                            <td className="py-4 px-4"><input disabled={isReadOnly} type="number" min={0} step={0.01} value={it.unitPrice || ''} onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} className={smallInputClass('w-24 text-center font-bold')} /></td>
                                            <td className="py-4 px-4"><input disabled={isReadOnly} type="number" min={0} max={100} step={0.01} value={it.discountPercentage || ''} onChange={(e) => updateItem(idx, { discountPercentage: parseFloat(e.target.value) || 0 })} className={smallInputClass('w-20 text-center font-medium text-rose-600')} /></td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-800 tabular-nums">
                                                {formatNumber(((it.quantity || 0) * (it.unitPrice || 0) * (1 - (it.discountPercentage || 0) / 100)))}
                                            </td>
                                            {!isReadOnly && (
                                                <td className="py-4 pl-6 text-left">
                                                    <button type="button" onClick={() => removeItem(idx)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ═══ SIDEBAR ═══ */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-2xl animate-slide-in" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-3 pb-6 border-b border-white/10">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl"><DollarSign className="w-6 h-6 text-purple-400" /></div>
                            <h3 className="font-bold text-xl">الملخص المالي</h3>
                            {isReadOnly && <Lock className="w-4 h-4 text-white/30 mr-auto" />}
                        </div>
                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white/60">المجموع الفرعي</span>
                                <span className="font-bold text-lg text-white/90 tabular-nums">{formatNumber(subtotal)} {form.currency}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white/60">الخصم الإضافي %</span>
                                {isReadOnly ? <span className="font-bold">{form.discountPercentage || 0}%</span> : <input type="number" value={form.discountPercentage || ''} onChange={(e) => setForm({ ...form, discountPercentage: parseFloat(e.target.value) || 0 })} className="w-20 bg-transparent text-right font-bold text-white border-b border-white/20 focus:border-purple-500 outline-none" />}
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-white/60">الضريبة</span>
                                {isReadOnly ? <span className="font-bold">{formatNumber(form.taxAmount || 0)}</span> : <input type="number" value={form.taxAmount || ''} onChange={(e) => setForm({ ...form, taxAmount: parseFloat(e.target.value) || 0 })} className="w-24 bg-transparent text-right font-bold text-white border-b border-white/20 focus:border-purple-500 outline-none" />}
                            </div>
                            <div className="pt-4 mt-2 border-t border-white/10">
                                <div className="flex justify-between items-center p-5 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20">
                                    <span className="font-bold text-white uppercase tracking-wider">الإجمالي النهائي</span>
                                    <div className="text-3xl font-black text-white">{formatNumber(total)} <span className="text-lg font-bold">{form.currency}</span></div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 border border-white/5 rounded-2xl bg-white/5 space-y-3">
                                <div className="flex justify-between text-xs text-white/40">
                                    <span>المدفوع</span>
                                    {isReadOnly ? <span className="tabular-nums">{formatNumber(paid)}</span> : <input type="number" value={form.paidAmount ?? ''} onChange={(e) => setForm({ ...form, paidAmount: parseFloat(e.target.value) || 0 })} className="w-20 bg-transparent text-right font-bold text-white border-b border-white/20 focus:border-emerald-500 outline-none" />}
                                </div>
                                <div className="flex justify-between text-xs text-amber-400 font-bold">
                                    <span>المتبقي</span>
                                    <span className="tabular-nums">{formatNumber(balance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ NOTES ═══ */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in" style={{ animationDelay: '300ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
                                <h3 className="font-bold text-slate-800">ملاحظات</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={isReadOnly} className={`w-full p-4 border-2 rounded-xl outline-none transition-all h-40 resize-none ${isReadOnly ? 'bg-slate-50 border-slate-200' : 'focus:border-purple-500'}`} placeholder="ملاحظات..." />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SalesInvoiceFormPage;
