import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    Plus,
    Trash2,
    Tag,
    Calendar,
    Users,
    DollarSign,
    FileText,
    CreditCard,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
    Package,
    Layers,
    RefreshCw,
    Eye,
    Send,
    XCircle,
    Lock
} from 'lucide-react';
import { salesQuotationService, type SalesQuotationDto, type SalesQuotationItemDto } from '../../services/salesQuotationService';
import { customerRequestService } from '../../services/customerRequestService';
import type { CustomerRequest } from '../../types/sales';
import customerService, { type Customer } from '../../services/customerService';
import { itemService, type ItemDto } from '../../services/itemService';
import { priceListService, type PriceListDto, type PriceListItemDto } from '../../services/priceListService';
import { approvalService } from '../../services/approvalService';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../../utils/format';
import { useSystemSettings } from '../../hooks/useSystemSettings';

const QuotationFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isView = queryParams.get('mode') === 'view';
    const isNew = !id || id === 'new';
    const isEdit = !isNew;
    const { defaultCurrency } = useSystemSettings();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [priceLists, setPriceLists] = useState<PriceListDto[]>([]);
    const [priceListItems, setPriceListItems] = useState<PriceListItemDto[]>([]);
    const [approvedRequests, setApprovedRequests] = useState<CustomerRequest[]>([]);
    const [selectedRequestId, setSelectedRequestId] = useState<number | ''>('');
    const approvalId = queryParams.get('approvalId');

    const [form, setForm] = useState<SalesQuotationDto>({
        quotationDate: new Date().toISOString().split('T')[0],
        validUntilDate: '',
        customerId: 0,
        priceListId: 0,
        currency: defaultCurrency || 'EGP',
        exchangeRate: 1,
        paymentTerms: '',
        discountPercentage: 0,
        taxAmount: 0,
        notes: '',
        status: 'Draft',
        items: []
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [c, i, p] = await Promise.all([
                    customerService.getActiveCustomers().catch(() => []),
                    (itemService.getActiveItems() as Promise<{ data?: ItemDto[] }>).then((r) => r?.data || []).catch(() => []),
                    (priceListService.getAllPriceLists() as Promise<{ data?: { data: PriceListDto[] } | PriceListDto[] }>).then((r: any) => {
                        const data = r?.data?.data || r?.data || r;
                        return Array.isArray(data) ? data : [];
                    }).catch(() => [])
                ]);
                setCustomers(c);
                setItems(i);
                setPriceLists(p.filter((pl: PriceListDto) => pl.listType === 'SELLING' && pl.isActive));

                // Fetch Approved Customer Requests
                try {
                    const reqs = await customerRequestService.getAllRequests();
                    const approved = (reqs.data || []).filter(r => r.status === 'Approved');
                    setApprovedRequests(approved);
                } catch {
                    console.error('Failed to load customer requests');
                }
            } catch {
                toast.error('فشل تحميل البيانات الأساسية');
            }
        };
        loadInitialData();
    }, []);

    const handleRequestSelection = async (requestId: number) => {
        setSelectedRequestId(requestId);
        if (!requestId) return;

        const request = approvedRequests.find(r => r.requestId === requestId);
        if (!request) return;

        // Auto-select Customer
        if (request.customerId) {
            setForm(f => ({
                ...f,
                customerId: request.customerId,
                priceListId: request.priceListId || f.priceListId
            }));
        }

        // Populate Items
        if (request.items && request.items.length > 0) {
            const quotationItems: SalesQuotationItemDto[] = request.items.map(reqItem => {
                const productId = reqItem.productId || 0;
                const itemDef = items.find(i => i.id === productId);
                let price = 0;
                let unitId = 0;

                if (itemDef) {
                    unitId = itemDef.unitId || 0;
                    // Try to get price from currently selected price list if any
                    if (form.priceListId) {
                        price = getPriceFromList(productId);
                    }
                    if (!price) {
                        price = itemDef.lastSalePrice || 0;
                    }
                }

                return {
                    itemId: productId,
                    quantity: reqItem.quantity || 0,
                    unitId: unitId,
                    unitPrice: price,
                    discountPercentage: 0,
                    totalPrice: (reqItem.quantity || 0) * price
                };
            });

            setForm(f => ({ ...f, items: quotationItems }));
            toast.success('تم استيراد البيانات من طلب العميل');
        }
    };

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            const loadQuotation = async () => {
                try {
                    const q = await salesQuotationService.getById(parseInt(id));
                    if (q) {
                        setForm({ ...q, items: q.items || [] });
                        if (q.priceListId) {
                            loadPriceListItems(q.priceListId);
                        }
                    } else {
                        toast.error('العرض غير موجود');
                        navigate('/dashboard/sales/quotations');
                    }
                } catch {
                    toast.error('فشل تحميل بيانات العرض');
                    navigate('/dashboard/sales/quotations');
                } finally {
                    setLoading(false);
                }
            };
            loadQuotation();
        }
    }, [id, isNew, navigate]);

    const loadPriceListItems = async (priceListId: number) => {
        if (!priceListId) {
            setPriceListItems([]);
            return;
        }
        try {
            const pl = await (priceListService.getPriceListById(priceListId) as Promise<any>);
            const data = pl?.data?.data || pl?.data || pl;
            setPriceListItems(data?.items || []);
        } catch {
            console.error('Failed to load price list items');
        }
    };

    const onPriceListChange = async (priceListId: number) => {
        setForm((f) => ({ ...f, priceListId }));
        await loadPriceListItems(priceListId);

        // Optionally update existing items based on the new price list
        if (form.items.length > 0) {
            toast.promise(
                new Promise((resolve) => {
                    setTimeout(() => {
                        // We'll update the prices in the next render cycle or using the newly fetched items
                        resolve(true);
                    }, 500);
                }),
                {
                    loading: 'جاري تحديث الأسعار حسب القائمة الجديدة...',
                    success: 'تم تحديث الأسعار',
                    error: 'فشل تحديث الأسعار'
                }
            );
        }
    };

    const getPriceFromList = (itemId: number) => {
        const pli = priceListItems.find(p => p.itemId === itemId);
        return pli?.unitPrice || 0;
    };

    const addItem = () => {
        setForm((f) => ({
            ...f,
            items: [...f.items, {
                itemId: 0,
                quantity: 1,
                unitId: 0,
                unitPrice: 0,
                discountPercentage: 0,
                totalPrice: 0
            }]
        }));
    };

    const removeItem = (idx: number) => {
        setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    };

    const updateItem = (idx: number, updates: Partial<SalesQuotationItemDto>) => {
        setForm((f) => {
            const newItems = [...f.items];
            const item = { ...newItems[idx], ...updates };

            // Auto-fill price if itemId changed and price list is active
            if (updates.itemId !== undefined) {
                const selectedItem = items.find(i => i.id === updates.itemId);
                if (selectedItem) {
                    item.unitId = selectedItem.unitId;
                    item.unitPrice = getPriceFromList(updates.itemId) || selectedItem.lastSalePrice || 0;
                }
            }

            // Recalculate total price for this item
            const qty = item.quantity || 0;
            const price = item.unitPrice || 0;
            const disc = item.discountPercentage || 0;
            item.totalPrice = qty * price * (1 - disc / 100);

            newItems[idx] = item;
            return { ...f, items: newItems };
        });
    };

    const subtotal = useMemo(() =>
        form.items.reduce((s, i) => s + (i.totalPrice || 0), 0)
        , [form.items]);

    const discAmount = subtotal * ((form.discountPercentage || 0) / 100);
    const afterDisc = subtotal - discAmount;
    const tax = form.taxAmount || 0;
    const grandTotal = afterDisc + tax;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) return;
        if (form.approvalStatus === 'Approved') return;
        if (!form.customerId) { toast.error('يرجى اختيار العميل'); return; }
        if (form.items.length === 0) { toast.error('يرجى إضافة بند واحد على الأقل'); return; }

        setSaving(true);
        try {
            const payload: SalesQuotationDto = {
                ...form,
                subTotal: subtotal,
                discountAmount: discAmount,
                taxAmount: tax,
                totalAmount: grandTotal
            };

            if (isNew) {
                await salesQuotationService.create(payload);
                toast.success('تم إنشاء عرض السعر بنجاح');
            } else {
                await salesQuotationService.update(parseInt(id!), payload);
                toast.success('تم تحديث عرض السعر بنجاح');
            }
            navigate('/dashboard/sales/quotations');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل حفظ عرض السعر');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForApproval = async () => {
        if (!id || isNew) {
            toast.error('يجب حفظ العرض أولاً قبل الإرسال للاعتماد');
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
            const updated = await salesQuotationService.submitForApproval(parseInt(id));
            if (updated) {
                setForm(updated);
                toast.success('تم إرسال العرض للاعتماد بنجاح');
                navigate('/dashboard/sales/quotations');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إرسال العرض للاعتماد');
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

    if (loading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

    const isLocked = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Rejected');

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Premium Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/sales/quotations')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Tag className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isView ? `عرض سعر #${form.quotationNumber}` : isNew ? 'تسجيل عرض سعر جديد' : `تعديل عرض سعر #${form.quotationNumber}`}
                                </h1>
                                {isLocked && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20"><Lock className="w-3 h-3" /> للعرض فقط</span>}
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
                            <p className="text-white/80 text-lg">أدخل تفاصيل عرض السعر والخصومات والضرائب</p>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
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
                        {isView && !approvalId && (
                            <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold">وضع العرض فقط</span>
                            </div>
                        )}
                        {form.status === 'Approved' && form.approvalStatus === 'Approved' && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('هل أنت متأكد من تحويل هذا العرض إلى طلب مبيعات؟')) {
                                        try {
                                            setSaving(true);
                                            await salesQuotationService.convertToSalesOrder(parseInt(id!));
                                            toast.success('تم تحويل العرض إلى طلب مبيعات بنجاح');
                                            navigate('/dashboard/sales/orders');
                                        } catch {
                                            toast.error('فشل تحويل العرض');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }
                                }}
                                disabled={saving}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl 
                                    font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                    disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>تحويل لطلب مبيعات</span>
                            </button>
                        )}
                        {!isLocked && (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-emerald-600 rounded-2xl 
                                        font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                        disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {saving ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    <span>{saving ? 'جاري الحفظ...' : 'حفظ عرض السعر'}</span>
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
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">المعلومات الأساسية لعرض السعر</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Request Selection */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <FileText className="w-4 h-4 text-fuchsia-500" />
                                        استيراد من طلب عميل (اختياري)
                                    </label>
                                    <select
                                        value={selectedRequestId}
                                        onChange={(e) => handleRequestSelection(parseInt(e.target.value) || 0)}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        disabled={isLocked || !isNew}
                                    >
                                        <option value="">-- اختر طلب عميل معتمد --</option>
                                        {approvedRequests.map((r) => (
                                            <option key={r.requestId} value={r.requestId}>
                                                CR-{r.requestId} - {customers.find(c => c.id === r.customerId)?.customerNameAr || 'عميل غير معروف'} ({new Date(r.requestDate).toLocaleDateString('ar-EG')})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Users className="w-4 h-4 text-brand-primary" />
                                        العميل <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={form.customerId || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, customerId: parseInt(e.target.value) || 0 }))}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        required
                                        disabled={isLocked}
                                    >
                                        <option value="">اختر العميل...</option>
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.id}>{c.customerNameAr} ({c.customerCode})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-indigo-500" />
                                        قائمة الأسعار
                                    </label>
                                    <select
                                        value={form.priceListId || ''}
                                        onChange={(e) => onPriceListChange(parseInt(e.target.value) || 0)}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-medium'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        disabled={isLocked}
                                    >
                                        <option value="">— اختر قائمة أسعار —</option>
                                        {priceLists.map((p) => (
                                            <option key={p.id} value={p.id}>{p.priceListName} ({p.currency})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-brand-primary" />
                                        تاريخ العرض <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.quotationDate || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, quotationDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        required
                                        disabled={isLocked}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Clock className="w-4 h-4 text-rose-500" />
                                        صلاحية العرض
                                    </label>
                                    <input
                                        type="date"
                                        value={form.validUntilDate || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, validUntilDate: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-bold'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        disabled={isLocked}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-indigo-500" />
                                        شروط الدفع
                                    </label>
                                    <input
                                        type="text"
                                        value={form.paymentTerms || ''}
                                        onChange={(e) => setForm((f) => ({ ...f, paymentTerms: e.target.value }))}
                                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-right
                                        ${isLocked
                                                ? 'bg-slate-100 border-transparent cursor-not-allowed opacity-70 text-slate-500 font-medium'
                                                : 'border-slate-100 focus:border-indigo-500 bg-slate-50/50'}`}
                                        placeholder="مثال: آجل 30 يوم"
                                        disabled={isLocked}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <DollarSign className="w-4 h-4 text-emerald-500" />
                                        العملة
                                    </label>
                                    <input
                                        type="text"
                                        value={form.currency || ''}
                                        readOnly
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-100 text-slate-500 font-bold outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Info className="w-4 h-4 text-slate-500" />
                                    ملاحظات
                                </label>
                                <textarea
                                    value={form.notes || ''}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 text-right resize-none"
                                    placeholder="أي ملاحظات إضافية لعرض السعر..."
                                    disabled={isLocked}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all animate-slide-in delay-100">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-brand-primary/10 rounded-xl">
                                        <Package className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">بنود عرض السعر</h3>
                                        <p className="text-slate-500 text-sm">قائمة الأصناف وأسعارها في العرض</p>
                                    </div>
                                </div>
                                {!isLocked && (
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                        إضافة صنف
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-8">

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-right">
                                    <thead className="text-slate-500 text-sm border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-4 font-bold">الصنف</th>
                                            <th className="px-4 py-4 font-bold">الكمية</th>
                                            <th className="px-4 py-4 font-bold">الوحدة</th>
                                            <th className="px-4 py-4 font-bold">سعر الوحدة</th>
                                            <th className="px-4 py-4 font-bold">خصم %</th>
                                            <th className="px-4 py-4 font-bold text-left">الإجمالي</th>
                                            {!isLocked && <th className="px-4 py-4"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {form.items.map((it, idx) => {
                                            const selectedItem = items.find(i => i.id === it.itemId);
                                            return (
                                                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-2 py-4">
                                                        <select
                                                            value={it.itemId || ''}
                                                            onChange={(e) => updateItem(idx, { itemId: parseInt(e.target.value) || 0 })}
                                                            className={`w-full max-w-[250px] px-3 py-2 border-2 rounded-xl outline-none transition-all text-sm font-medium
                                                            ${isLocked
                                                                    ? 'bg-slate-50 border-transparent cursor-not-allowed opacity-80'
                                                                    : 'border-slate-100 bg-white focus:border-indigo-500 shadow-sm hover:border-slate-200'}`}
                                                            disabled={isLocked}
                                                        >
                                                            <option value="">اختر الصنف...</option>
                                                            {items.map((i) => (
                                                                <option key={i.id} value={i.id}>{i.itemNameAr} ({i.grade || i.itemCode})</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-2 py-4">
                                                        <input
                                                            type="number"
                                                            min={0.001}
                                                            value={it.quantity || ''}
                                                            onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                                                            className={`w-24 px-3 py-2 border-2 rounded-xl outline-none transition-all text-center font-bold
                                                            ${isLocked
                                                                    ? 'bg-slate-50 border-transparent cursor-not-allowed opacity-80 shadow-none'
                                                                    : 'border-slate-100 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'}`}
                                                            disabled={isLocked}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                                                        {selectedItem?.unitName || '—'}
                                                    </td>
                                                    <td className="px-2 py-4">
                                                        <div className="relative">
                                                            <DollarSign className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step={0.01}
                                                                value={it.unitPrice || ''}
                                                                onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                                                                className={`w-32 pr-8 pl-3 py-2 border-2 rounded-xl outline-none transition-all text-left font-bold
                                                                ${isLocked
                                                                        ? 'bg-slate-50 border-transparent cursor-not-allowed opacity-80 shadow-none'
                                                                        : 'border-slate-100 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5'}`}
                                                                disabled={isLocked}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-4">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            step={0.01}
                                                            value={it.discountPercentage || ''}
                                                            onChange={(e) => updateItem(idx, { discountPercentage: parseFloat(e.target.value) || 0 })}
                                                            className={`w-20 px-3 py-2 border-2 rounded-xl outline-none transition-all text-center font-medium
                                                            ${isLocked
                                                                    ? 'bg-slate-50 border-transparent cursor-not-allowed opacity-80'
                                                                    : 'border-slate-100 bg-white focus:border-indigo-500'}`}
                                                            disabled={isLocked}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-left">
                                                            <span className="text-sm font-bold text-slate-800">
                                                                {formatNumber(it.totalPrice || 0, { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <span className="text-xs text-slate-400 mr-1">{form.currency}</span>
                                                        </div>
                                                    </td>
                                                    {!isLocked && (
                                                        <td className="px-2 py-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(idx)}
                                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Totals Summary Card */}
                <div className="space-y-6">
                    {/* Financial Summary card with dark theme like Procurement */}
                    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl animate-slide-in delay-200 relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />

                        <div className="relative space-y-6">
                            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                <div className="p-2.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20 backdrop-blur-md">
                                    <DollarSign className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h3 className="font-bold text-xl tracking-tight">الملخص المالي</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm">الإجمالي قبل الخصم</span>
                                    <span className="font-bold text-white">{formatNumber(subtotal)} {form.currency}</span>
                                </div>

                                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-rose-400 font-semibold text-sm">خصم إضافي %</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                step={0.01}
                                                value={form.discountPercentage || ''}
                                                onChange={(e) => setForm((f) => ({ ...f, discountPercentage: parseFloat(e.target.value) || 0 }))}
                                                className="w-16 bg-transparent text-center font-bold text-rose-400 outline-none border-b border-rose-400/30 focus:border-rose-400"
                                                disabled={isLocked}
                                            />
                                            <span className="text-xs text-rose-400/60 font-medium">-{formatNumber(discAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <span className="text-emerald-400 font-semibold text-sm">ضريبة القيمة المضافة</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={form.taxAmount || ''}
                                            onChange={(e) => setForm((f) => ({ ...f, taxAmount: parseFloat(e.target.value) || 0 }))}
                                            className="w-20 bg-transparent text-left font-bold text-emerald-400 outline-none border-b border-emerald-400/30 focus:border-emerald-400"
                                            disabled={isLocked}
                                        />
                                        <span className="text-xs text-emerald-400/60 font-medium">{form.currency}</span>
                                    </div>
                                </div>

                                <div className="pt-6 mt-2 border-t border-white/10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">الإجمالي النهائي</div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white">{formatNumber(grandTotal)}</span>
                                                <span className="text-indigo-400 font-bold">{form.currency}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                                            <CreditCard className="w-8 h-8 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information alert like Procurement */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm animate-slide-in delay-300">
                        <div className="flex gap-4">
                            <div className="p-3 bg-indigo-50 rounded-2xl h-fit">
                                <Info className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-800">معلومات هامة</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    هذا العرض صالح لمدة محددة. بمجرد قبول العميل للعرض، يمكنك تحويله مباشرة إلى طلب مبيعات لمتابعة دورة الطلب والتوريد.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Info Card */}
                    {!isNew && (
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-slide-in delay-300">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl shadow-sm ${form.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' :
                                    form.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                        'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    {form.status === 'Accepted' ? <CheckCircle2 className="w-8 h-8" /> :
                                        form.status === 'Rejected' ? <AlertCircle className="w-8 h-8" /> :
                                            <Clock className="w-8 h-8" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">حالة العرض</div>
                                    <div className="text-lg font-black text-slate-800">
                                        {form.status === 'Accepted' ? 'تم القبول' :
                                            form.status === 'Rejected' ? 'مرفوض' :
                                                form.status === 'Sent' ? 'تم الإرسال' : 'مسودة'}
                                    </div>
                                </div>
                            </div>
                            {form.status === 'Rejected' && form.rejectedReason && (
                                <div className="mt-4 p-3 bg-rose-50 rounded-xl text-xs text-rose-700 border border-rose-100 italic">
                                    سبب الرفض: {form.rejectedReason}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default QuotationFormPage;
