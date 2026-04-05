import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Plus,
    Trash2,
    AlertCircle,
    FileText,
    Package,
    User,
    ClipboardList,
    Eye,
} from 'lucide-react';
import { customerRequestService } from '../../services/customerRequestService';
import customerService, { type Customer } from '../../services/customerService';
import { priceListService, type PriceListItemDto } from '../../services/priceListService';
import type { CustomerRequest, CustomerRequestItem } from '../../types/sales';
import toast from 'react-hot-toast';
import { formatNumber } from '../../utils/format';
import { TRIGGER_POLL_EVENT } from '../../hooks/useNotificationPolling';


interface MergedLine {
    productId: number;
    productName: string;
    unitId?: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    deliveryDate: string;
    notes: string;
}

const CustomerRequestFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id;
    const queryParams = new URLSearchParams(location.search);
    const [loading, setLoading] = useState(false);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sellablePrices, setSellablePrices] = useState<PriceListItemDto[]>([]);

    const [lines, setLines] = useState<MergedLine[]>([]);

    const [formData, setFormData] = useState<Partial<CustomerRequest>>({
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Draft',
        customerId: 0,
        priceListId: 0,
        notes: '',
    });

    const isViewMode = queryParams.get('mode') === 'view' || formData.status === 'Approved';

    const deriveFromLines = (currentLines: MergedLine[]) => {
        const itemMap = new Map<number, CustomerRequestItem & { unitPrice: number; totalPrice: number }>();

        currentLines.forEach(line => {
            if (!line.productId) return;
            const existing = itemMap.get(line.productId);
            if (existing) {
                existing.quantity += line.quantity;
                existing.totalPrice += line.totalPrice;
            } else {
                itemMap.set(line.productId, {
                    itemId: 0,
                    productId: line.productId,
                    productName: line.productName,
                    unitId: line.unitId,
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    totalPrice: line.totalPrice,
                    notes: '',
                } as any);
            }
        });

        const derivedItems = Array.from(itemMap.values());
        const derivedSchedules = currentLines.map(line => ({
            productId: line.productId,
            deliveryDate: line.deliveryDate,
            quantity: line.quantity,
            notes: line.notes,
        }));

        return { items: derivedItems, schedules: derivedSchedules };
    };

    const addLine = () => {
        setLines(prev => [
            ...prev,
            {
                productId: 0,
                productName: '',
                unitId: undefined,
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
                deliveryDate: new Date().toISOString().split('T')[0],
                notes: '',
            },
        ]);
    };

    const updateLine = (index: number, field: keyof MergedLine, value: any) => {
        setLines(prev => {
            const updated = [...prev];
            const line = { ...updated[index], [field]: value };

            if (field === 'productId') {
                const pli = sellablePrices.find(p => p.itemId === value);
                if (pli) {
                    line.productName = pli.itemNameAr || '';
                    line.unitId = pli.unitId;
                    line.unitPrice = pli.unitPrice || 0;
                    if (!formData.priceListId) {
                        setFormData(f => ({ ...f, priceListId: pli.priceListId }));
                    }
                } else {
                    line.productName = '';
                    line.unitId = undefined;
                    line.unitPrice = 0;
                }
            }

            line.totalPrice = (line.quantity || 0) * (line.unitPrice || 0);
            updated[index] = line;
            return updated;
        });
    };

    const removeLine = (index: number) => {
        setLines(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    useEffect(() => {
        if (isEditMode) {
            // Load master data first, then load the request using it
            loadMasterDataThenRequest(Number(id));
        } else {
            loadMasterData();
        }
    }, [id]);

    const loadMasterData = async () => {
        try {
            const [customersData, priceListsRes] = await Promise.all([
                customerService.getAllCustomers(),
                priceListService.getAllPriceLists(),
            ]);

            setCustomers(Array.isArray(customersData) ? customersData : []);

            const plData = 'data' in priceListsRes ? (priceListsRes as any).data : priceListsRes;
            const sellingLists = Array.isArray(plData) ? plData.filter((pl: any) => pl.listType === 'SELLING' && pl.isActive) : [];

            const allSellablePrices: PriceListItemDto[] = [];
            sellingLists.forEach((list: any) => {
                if (list.items) {
                    allSellablePrices.push(...list.items);
                }
            });
            setSellablePrices(allSellablePrices);
        } catch (error) {
            console.error('Failed to load master data', error);
            toast.error('فشل تحميل البيانات الأساسية');
        }
    };

    /**
     * Used in edit/view mode: loads master data first so we have the items catalog
     * available for enriching the request lines with unitId and unitPrice.
     */
    const loadMasterDataThenRequest = async (reqId: number) => {
        try {
            setLoading(true);
            const [customersData, priceListsRes] = await Promise.all([
                customerService.getAllCustomers(),
                priceListService.getAllPriceLists(),
            ]);

            setCustomers(Array.isArray(customersData) ? customersData : []);

            const plData = 'data' in priceListsRes ? (priceListsRes as any).data : priceListsRes;
            const sellingLists = Array.isArray(plData) ? plData.filter((pl: any) => pl.listType === 'SELLING' && pl.isActive) : [];

            const allSellablePrices: PriceListItemDto[] = [];
            sellingLists.forEach((list: any) => {
                if (list.items) allSellablePrices.push(...list.items);
            });
            setSellablePrices(allSellablePrices);

            // Now load the request — master data is ready
            await loadRequest(reqId, allSellablePrices);
        } catch (error) {
            console.error('Failed to load master data', error);
            toast.error('فشل تحميل البيانات الأساسية');
            setLoading(false);
        }
    };

    const loadRequest = async (reqId: number, masterPrices?: PriceListItemDto[]) => {
        try {
            setLoading(true);
            const response = await customerRequestService.getRequestById(reqId);
            if (response.success && response.data) {
                const data = response.data;
                setFormData({
                    requestDate: data.requestDate,
                    status: data.status,
                    customerId: data.customerId,
                    priceListId: data.priceListId,
                    notes: data.notes,
                    requestNumber: data.requestNumber,
                });

                // Use provided master data when available (edit/view mode),
                // fall back to component state (should already be loaded).
                const resolvedPrices = masterPrices ?? sellablePrices;

                const lookupPriceListItem = (productId: number): PriceListItemDto | undefined =>
                    resolvedPrices.find(p => p.itemId === productId);

                const lookupUnitId = (productId: number): number | undefined =>
                    lookupPriceListItem(productId)?.unitId;

                const lookupUnitPrice = (productId: number): number =>
                    lookupPriceListItem(productId)?.unitPrice || 0;

                const lookupProductName = (productId: number, fallback: string): string =>
                    lookupPriceListItem(productId)?.itemNameAr || fallback || '';

                if (data.schedules && data.schedules.length > 0) {
                    const reconstructed: MergedLine[] = data.schedules.map((s: any) => {
                        const productId = s.productId || 0;
                        const matchingItem = data.items?.find((it: any) => it.productId === productId);
                        const unitPrice = lookupUnitPrice(productId);
                        const qty = Number(s.quantity) || 0;
                        return {
                            productId,
                            productName: lookupProductName(productId, matchingItem?.productName || ''),
                            unitId: lookupUnitId(productId),
                            quantity: qty,
                            unitPrice,
                            totalPrice: qty * unitPrice,
                            deliveryDate: s.deliveryDate || new Date().toISOString().split('T')[0],
                            notes: s.notes || '',
                        };
                    });
                    setLines(reconstructed);
                } else if (data.items && data.items.length > 0) {
                    const reconstructed: MergedLine[] = data.items.map((it: any) => {
                        const productId = it.productId || 0;
                        const unitPrice = lookupUnitPrice(productId);
                        const qty = Number(it.quantity) || 0;
                        return {
                            productId,
                            productName: lookupProductName(productId, it.productName || ''),
                            unitId: lookupUnitId(productId),
                            quantity: qty,
                            unitPrice,
                            totalPrice: qty * unitPrice,
                            deliveryDate: new Date().toISOString().split('T')[0],
                            notes: it.notes || '',
                        };
                    });
                    setLines(reconstructed);
                }
            }
        } catch (error) {
            console.error('Failed to load request', error);
            toast.error('فشل تحميل بيانات الطلب');
            navigate('/dashboard/sales/customer-requests');
        } finally {
            setLoading(false);
        }
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerId) {
            toast.error('الرجاء اختيار العميل');
            return;
        }

        if (lines.length === 0) {
            toast.error('يجب إضافة سطر واحد على الأقل');
            return;
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.productId) {
                toast.error(`الرجاء اختيار الصنف في السطر ${i + 1}`);
                return;
            }
            if (!line.quantity || line.quantity <= 0) {
                toast.error(`الكمية يجب أن تكون أكبر من صفر في السطر ${i + 1}`);
                return;
            }
            if (!line.deliveryDate) {
                toast.error(`الرجاء تحديد تاريخ التوصيل في السطر ${i + 1}`);
                return;
            }
        }

        try {
            setLoading(true);
            const { items: derivedItems, schedules: derivedSchedules } = deriveFromLines(lines);
            const submissionData = {
                ...formData,
                items: derivedItems,
                schedules: derivedSchedules,
            };

            if (isEditMode) {
                await customerRequestService.updateRequest(Number(id), submissionData);
                toast.success('تم تحديث الطلب بنجاح');
            } else {
                await customerRequestService.createRequest(submissionData);
                toast.success('تم إنشاء الطلب بنجاح');
            }
            window.dispatchEvent(new CustomEvent(TRIGGER_POLL_EVENT));
            navigate('/dashboard/sales/customer-requests', {
                state: { success: true, message: 'تم حفظ الطلب بنجاح' },
            });
        } catch (error) {
            console.error('Failed to save request', error);
            toast.error('حدث خطأ أثناء حفظ الطلب');
        } finally {
            setLoading(false);
        }
    };

    const uniqueProducts = new Set(lines.filter(l => l.productId).map(l => l.productId)).size;
    const totalQuantity = lines.reduce((sum, l) => sum + (l.quantity || 0), 0);
    const totalEstimatedAmount = lines.reduce((sum, l) => sum + (l.totalPrice || 0), 0);
    const totalDeliveries = lines.length;

    const productSummary = lines.reduce((acc: Record<number, { name: string; qty: number; total: number; deliveries: number }>, l) => {
        if (!l.productId) return acc;
        if (!acc[l.productId]) {
            acc[l.productId] = { name: l.productName, qty: 0, total: 0, deliveries: 0 };
        }
        acc[l.productId].qty += l.quantity || 0;
        acc[l.productId].total += l.totalPrice || 0;
        acc[l.productId].deliveries += 1;
        return acc;
    }, {});

    if (loading && isEditMode) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in { animation: slideInRight 0.4s ease-out; }
            `}</style>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/sales/customer-requests')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <ClipboardList className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isEditMode ? 'تعديل طلب عميل' : 'طلب عميل جديد'}
                            </h1>
                            <p className="text-white/80 text-lg">
                                {isEditMode
                                    ? `تعديل الطلب رقم ${(formData as any).requestNumber}`
                                    : 'إدخال بيانات الطلب - الأصناف ومواعيد التوصيل والكميات'}
                            </p>
                        </div>
                    </div>
                    {!isViewMode && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl 
                                font-bold shadow-xl hover:scale-105 active:scale-95 transition-all 
                                disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{loading ? 'جاري الحفظ...' : 'حفظ الطلب'}</span>
                        </button>
                    )}
                    {isViewMode && (
                        <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                            <Eye className="w-5 h-5" />
                            <span className="font-bold">وضع العرض فقط</span>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">معلومات الطلب والعميل</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    تاريخ الطلب
                                </label>
                                <input
                                    type="date"
                                    name="requestDate"
                                    disabled
                                    value={formData.requestDate ? new Date(formData.requestDate).toISOString().split('T')[0] : ''}
                                    className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl 
                                        text-slate-500 font-semibold outline-none cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <User className="w-4 h-4 text-brand-primary" />
                                    العميل <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="customerId"
                                    value={formData.customerId || ''}
                                    disabled={isViewMode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerId: parseInt(e.target.value) }))}
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold
                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">اختر العميل...</option>
                                    {customers.map(cust => (
                                        <option key={cust.id} value={cust.id}>
                                            {cust.customerNameAr} - {cust.customerCode}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Merged Items + Delivery Schedule */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف وجدولة التوصيل</h3>
                                        <p className="text-slate-500 text-sm">حدد المنتجات والكميات ومواعيد التسليم لكل دفعة</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-xl">
                                        <Package className="w-4 h-4 text-brand-primary" />
                                        <span className="text-sm font-bold text-brand-primary">
                                            <span dir="ltr">{totalDeliveries}</span> سطر
                                        </span>
                                    </div>
                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={addLine}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl 
                                                font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20
                                                hover:scale-105 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" />
                                            إضافة سطر
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right w-12">#</th>
                                        <th className="py-4 px-3 text-right">
                                            الصنف <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-3 text-center">
                                            تاريخ التوصيل <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-3 text-center">
                                            الكمية <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-3 text-center">الوحدة</th>
                                        <th className="py-4 px-3 text-center">سعر الوحدة</th>
                                        <th className="py-4 px-3 text-center">الإجمالي</th>
                                        <th className="py-4 px-3 text-right">ملاحظات</th>
                                        {!isViewMode && <th className="py-4 pl-6 text-center w-14">حذف</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lines.map((line, index) => {
                                        const pli = sellablePrices.find(p => p.itemId === line.productId);
                                        const unitName = pli?.unitName || '-';

                                        return (
                                            <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 pr-6 text-sm text-slate-500 font-semibold">
                                                    {index + 1}
                                                </td>

                                                {/* Product */}
                                                <td className="py-4 px-3">
                                                    <select
                                                        value={line.productId || ''}
                                                        disabled={isViewMode}
                                                        onChange={(e) => updateLine(index, 'productId', parseInt(e.target.value))}
                                                        required
                                                        className={`w-full min-w-[180px] px-3 py-2 bg-white border-2 border-slate-200 
                                                            rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                            ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    >
                                                        <option value={0}>اختر الصنف...</option>
                                                        {sellablePrices
                                                            .map(p => (
                                                                <option key={`${p.priceListId}-${p.itemId}`} value={p.itemId}>
                                                                    {p.itemNameAr} ({p.grade || p.itemCode}) - {formatNumber(p.unitPrice)}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </td>

                                                {/* Delivery Date */}
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="date"
                                                        disabled={isViewMode}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        value={line.deliveryDate}
                                                        onChange={(e) => updateLine(index, 'deliveryDate', e.target.value)}
                                                        required
                                                        className={`w-full min-w-[150px] px-3 py-2 bg-white border-2 border-slate-200 
                                                            rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                            ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    />
                                                </td>

                                                {/* Quantity */}
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="number"
                                                        min="0.001"
                                                        step="0.001"
                                                        disabled={isViewMode}
                                                        value={line.quantity}
                                                        onChange={(e) => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        required
                                                        className={`w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                            text-sm text-center font-bold text-brand-primary outline-none 
                                                            focus:border-brand-primary transition-all
                                                            ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    />
                                                </td>

                                                {/* Unit */}
                                                <td className="py-4 px-3 text-center">
                                                    <span className="text-sm font-semibold text-slate-600">{unitName}</span>
                                                </td>

                                                {/* Unit Price */}
                                                <td className="py-4 px-3 text-center">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {formatNumber(line.unitPrice || 0)}
                                                    </span>
                                                </td>

                                                {/* Line Total */}
                                                <td className="py-4 px-3 text-center">
                                                    <span className="text-sm font-bold text-emerald-600">
                                                        {formatNumber(line.totalPrice || 0)}
                                                    </span>
                                                </td>

                                                {/* Notes */}
                                                <td className="py-4 px-3">
                                                    <input
                                                        type="text"
                                                        disabled={isViewMode}
                                                        value={line.notes || ''}
                                                        onChange={(e) => updateLine(index, 'notes', e.target.value)}
                                                        placeholder={isViewMode ? '' : 'ملاحظات / عنوان التوصيل...'}
                                                        className={`w-full min-w-[140px] px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                            text-sm outline-none focus:border-brand-primary transition-all
                                                            ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    />
                                                </td>

                                                {/* Delete */}
                                                {!isViewMode && (
                                                    <td className="py-4 pl-6 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLine(index)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 
                                                                rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                {lines.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-slate-50 border-t-2 border-slate-200">
                                            <td colSpan={3} className="py-4 pr-6 text-sm font-bold text-slate-600 text-right">
                                                الإجمالي
                                            </td>
                                            <td className="py-4 px-3 text-center">
                                                <span className="text-sm font-bold text-brand-primary">
                                                    {formatNumber(totalQuantity, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td colSpan={2} />
                                            <td className="py-4 px-3 text-center">
                                                <span className="text-sm font-extrabold text-emerald-600">
                                                    {formatNumber(totalEstimatedAmount, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td colSpan={isViewMode ? 1 : 2} />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>

                            {lines.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 font-semibold">لم يتم إضافة أصناف بعد</p>
                                    <p className="text-slate-400 text-sm mt-1">
                                        انقر على "إضافة سطر" لإضافة صنف مع موعد التوصيل
                                    </p>
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
                                <ClipboardList className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="font-bold text-xl">ملخص الطلب</h3>
                        </div>
                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">عدد الأصناف</span>
                                <span className="font-bold text-lg" dir="ltr">{uniqueProducts}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">عدد دفعات التوصيل</span>
                                <span className="font-bold text-lg text-brand-primary" dir="ltr">{totalDeliveries}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">إجمالي الكميات</span>
                                <span className="font-bold text-lg text-white/80" dir="ltr">
                                    {formatNumber(totalQuantity, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <span className="text-white/60 text-sm">إجمالي القيمة التقديرية</span>
                                <span className="font-bold text-lg text-emerald-400" dir="ltr">
                                    {formatNumber(totalEstimatedAmount, { minimumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Product Breakdown */}
                            {Object.keys(productSummary).length > 0 && (
                                <div className="pt-4 border-t border-white/10">
                                    <div className="text-xs text-white/40 mb-3 font-bold">تفصيل الأصناف</div>
                                    <div className="space-y-2">
                                        {Object.entries(productSummary).map(([pid, info]) => (
                                            <div key={pid} className="flex justify-between items-center p-3 bg-white/5 rounded-lg text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                                    <span className="text-white/70 font-medium truncate max-w-[120px]">{info.name}</span>
                                                    <span className="text-white/30 text-xs">({info.deliveries} دفعة)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white/50 text-xs">{formatNumber(info.qty)}</span>
                                                    <span className="text-emerald-400 font-bold">{formatNumber(info.total)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">حالة الطلب</div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 
                                    rounded-xl text-amber-300 font-bold text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {isEditMode ? formData.status : 'مسودة'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '300ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-slate-800">ملاحظات عامة</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <textarea
                                name="notes"
                                value={formData.notes || ''}
                                disabled={isViewMode}
                                onChange={handleInputChange}
                                className={`w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl 
                                    focus:border-brand-primary focus:bg-white outline-none transition-all 
                                    text-sm leading-relaxed h-40 resize-none
                                    ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                placeholder={isViewMode ? '' : 'أي ملاحظات إضافية حول الطلب...'}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CustomerRequestFormPage;