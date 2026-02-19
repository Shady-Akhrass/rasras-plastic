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
    Calendar,
    Clock,
} from 'lucide-react';
import { customerRequestService } from '../../services/customerRequestService';
import customerService, { type Customer } from '../../services/customerService';
import { itemService, type ItemDto } from '../../services/itemService';
import { unitService } from '../../services/unitService';
import { priceListService, type PriceListItemDto } from '../../services/priceListService';
import type { CustomerRequest, CustomerRequestItem } from '../../types/sales';
import toast from 'react-hot-toast';
import { formatNumber } from '../../utils/format';

interface Unit {
    id: number;
    unitNameAr: string;
}

const CustomerRequestFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id;
    const queryParams = new URLSearchParams(location.search);
    const [loading, setLoading] = useState(false);

    // Master Data State
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [sellablePrices, setSellablePrices] = useState<PriceListItemDto[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<CustomerRequest>>({
        requestDate: new Date().toISOString().split('T')[0], // Locked to current date
        status: 'Draft',
        customerId: 0,
        priceListId: 0,
        notes: '',
        items: [],
        schedules: []
    });

    const isViewMode = queryParams.get('mode') === 'view' || formData.status === 'Approved';

    // ──────────────────────────────────────────
    // Synchronization Logic
    // ──────────────────────────────────────────

    const getSyncedItems = (items: CustomerRequestItem[] | undefined, schedules: any[] | undefined) => {
        if (!items || items.length === 0) return items;
        const currentItems = [...items];
        const currentSchedules = schedules || [];

        // Calculate total quantity per productId from schedules
        const qtyMap = currentSchedules.reduce((acc: Record<number, number>, s) => {
            if (s.productId) {
                acc[s.productId] = (acc[s.productId] || 0) + (parseFloat(s.quantity) || 0);
            }
            return acc;
        }, {});

        // Update items with their synced quantities
        const newItems = currentItems.map(item => {
            if (item.productId && qtyMap[item.productId] !== undefined) {
                const newQty = qtyMap[item.productId];

                // Recalculate totalPrice if it exists (it's added dynamically for UI)
                const unitPrice = (item as any).unitPrice || 0;
                return {
                    ...item,
                    quantity: newQty,
                    totalPrice: newQty * unitPrice
                };
            }
            return item;
        });

        return newItems;
    };

    const addSchedule = () => {
        setFormData(prev => {
            const newSchedules = [
                ...(prev.schedules || []),
                {
                    deliveryDate: new Date().toISOString().split('T')[0],
                    productId: 0,
                    quantity: 0,
                    notes: ''
                }
            ];
            return {
                ...prev,
                schedules: newSchedules,
                items: getSyncedItems(prev.items, newSchedules)
            };
        });
    };

    const updateSchedule = (index: number, field: keyof any, value: any) => {
        setFormData(prev => {
            const newSchedules = [...(prev.schedules || [])];
            newSchedules[index] = { ...newSchedules[index], [field]: value };
            return {
                ...prev,
                schedules: newSchedules,
                items: getSyncedItems(prev.items, newSchedules)
            };
        });
    };

    const removeSchedule = (index: number) => {
        setFormData(prev => {
            const newSchedules = [...(prev.schedules || [])];
            newSchedules.splice(index, 1);
            return {
                ...prev,
                schedules: newSchedules,
                items: getSyncedItems(prev.items, newSchedules)
            };
        });
    };

    useEffect(() => {
        loadMasterData();
        if (isEditMode) {
            loadRequest(Number(id));
        }
    }, [id]);

    const loadMasterData = async () => {
        try {
            const [customersData, itemsRes, unitsRes, priceListsRes] = await Promise.all([
                customerService.getAllCustomers(),
                itemService.getAllItems(),
                unitService.getAllUnits(),
                priceListService.getAllPriceLists()
            ]);

            setCustomers(Array.isArray(customersData) ? customersData : []);

            // itemsRes might be { data: [...] } or just [...]
            const itemsData = 'data' in itemsRes ? (itemsRes as any).data : itemsRes;
            setItems(Array.isArray(itemsData) ? itemsData : []);

            const unitsData = 'data' in unitsRes ? (unitsRes as any).data : unitsRes;
            setUnits(Array.isArray(unitsData) ? unitsData : []);

            const plData = 'data' in priceListsRes ? (priceListsRes as any).data : priceListsRes;
            const sellingLists = Array.isArray(plData) ? plData.filter((pl: any) => pl.listType === 'SELLING') : [];
            const allSellablePrices: PriceListItemDto[] = [];
            sellingLists.forEach(list => {
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

    const loadRequest = async (reqId: number) => {
        try {
            setLoading(true);
            const response = await customerRequestService.getRequestById(reqId);
            if (response.success && response.data) {
                setFormData(response.data);
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

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...(prev.items || []),
                {
                    itemId: 0,
                    productId: 0,
                    productName: '',
                    quantity: 1,
                    notes: ''
                }
            ]
        }));
    };

    const updateItem = (index: number, field: keyof CustomerRequestItem, value: any) => {
        setFormData(prev => {
            const newItems = [...(prev.items || [])];
            const item = { ...newItems[index], [field]: value };

            if (field === 'productId') {
                const selectedItem = items.find(i => i.id === value);
                if (selectedItem) {
                    item.productName = selectedItem.itemNameAr;
                    item.unitId = selectedItem.unitId;
                }

                // Automatic Price Lookup
                const pli = sellablePrices.find(p => p.itemId === value);
                if (pli) {
                    (item as any).unitPrice = priceListService.getPriceForItem(value as number, [pli]);
                    // Update form's priceListId if found
                    prev.priceListId = pli.priceListId;
                } else {
                    (item as any).unitPrice = 0;
                }
            }

            // Calculate line total for UI
            const qty = item.quantity || 0;
            const price = (item as any).unitPrice || 0;
            (item as any).totalPrice = qty * price;

            newItems[index] = item;
            return { ...prev, items: newItems };
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerId) {
            toast.error('الرجاء اختيار العميل');
            return;
        }

        if (!formData.items || formData.items.length === 0) {
            toast.error('يجب إضافة صنف واحد على الأقل');
            return;
        }

        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.productId) {
                toast.error(`الرجاء اختيار الصنف في السطر ${i + 1}`);
                return;
            }
            if (!item.quantity || item.quantity <= 0) {
                toast.error(`الكمية يجب أن تكون أكبر من صفر في السطر ${i + 1}`);
                return;
            }
        }

        try {
            setLoading(true);
            // Final safety sync
            const finalItems = getSyncedItems(formData.items, formData.schedules);
            const submissionData = { ...formData, items: finalItems };

            if (isEditMode) {
                await customerRequestService.updateRequest(Number(id), submissionData);
                toast.success('تم تحديث الطلب بنجاح');
            } else {
                await customerRequestService.createRequest(submissionData);
                toast.success('تم إنشاء الطلب بنجاح');
            }
            navigate('/dashboard/sales/customer-requests', { state: { success: true, message: 'تم حفظ الطلب بنجاح' } });
        } catch (error) {
            console.error('Failed to save request', error);
            toast.error('حدث خطأ أثناء حفظ الطلب');
        } finally {
            setLoading(false);
        }
    };

    const totalItems = formData.items?.length || 0;
    const totalQuantity = formData.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const totalEstimatedAmount = formData.items?.reduce((sum, item) => sum + ((item as any).totalPrice || 0), 0) || 0;

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
                                {isEditMode ? `تعديل الطلب رقم ${formData.requestNumber}` : 'إدخال بيانات طلب العميل والمنتجات المطلوبة'}
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

                    {/* Delivery Scheduling */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '50ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-100 rounded-xl">
                                        <Calendar className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">جدولة التوصيل</h3>
                                        <p className="text-slate-500 text-sm">تحديد مواعيد التوصيل والكميات لكل موعد</p>
                                    </div>
                                </div>
                                {!isViewMode && (
                                    <button
                                        type="button"
                                        onClick={addSchedule}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-bold shadow-md shadow-amber-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                        إضافة موعد
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-right">
                                            <th className="pb-4 pr-2 text-sm font-bold text-slate-500">م</th>
                                            <th className="pb-4 px-4 text-sm font-bold text-slate-500">الصنف</th>
                                            <th className="pb-4 px-4 text-sm font-bold text-slate-500">تاريخ التوصيل</th>
                                            <th className="pb-4 px-4 text-sm font-bold text-slate-500 text-center">الكمية</th>
                                            <th className="pb-4 px-4 text-sm font-bold text-slate-500">ملاحظات التوصيل</th>
                                            {!isViewMode && <th className="pb-4 px-4 text-sm font-bold text-slate-500">التحكم</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(formData.schedules || []).map((schedule, index) => (
                                            <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 pr-2 text-sm font-bold text-slate-400">
                                                    {index + 1}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <select
                                                        disabled={isViewMode}
                                                        value={schedule.productId || ''}
                                                        onChange={(e) => updateSchedule(index, 'productId', parseInt(e.target.value))}
                                                        className="w-full min-w-[150px] px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-primary outline-none text-sm font-semibold transition-all"
                                                    >
                                                        <option value={0}>اختر الصنف...</option>
                                                        {formData.items?.map(it => (
                                                            <option key={it.productId} value={it.productId}>
                                                                {it.productName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="relative">
                                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        <input
                                                            type="date"
                                                            disabled={isViewMode}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            value={schedule.deliveryDate}
                                                            onChange={(e) => updateSchedule(index, 'deliveryDate', e.target.value)}
                                                            className="w-full pr-10 pl-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-primary outline-none text-sm font-semibold transition-all disabled:opacity-70"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 flex justify-center">
                                                    <input
                                                        type="number"
                                                        disabled={isViewMode}
                                                        value={schedule.quantity || 0}
                                                        onChange={(e) => updateSchedule(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-primary outline-none text-sm font-bold text-center transition-all disabled:opacity-70"
                                                    />
                                                </td>
                                                <td className="py-4 px-4">
                                                    <input
                                                        type="text"
                                                        placeholder="أضف ملاحظات التوصيل (عنوان أو تفاصيل)..."
                                                        disabled={isViewMode}
                                                        value={schedule.notes || ''}
                                                        onChange={(e) => updateSchedule(index, 'notes', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-brand-primary outline-none text-sm font-medium transition-all disabled:opacity-70"
                                                    />
                                                </td>
                                                {!isViewMode && (
                                                    <td className="py-4 px-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSchedule(index)}
                                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="حذف الموعد"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                        {(formData.schedules || []).length === 0 && (
                                            <tr>
                                                <td colSpan={isViewMode ? 4 : 5} className="py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                                        <Clock className="w-8 h-8 text-slate-400" />
                                                        <p className="text-slate-500 font-medium">لا توجد مواعيد توصيل مجدولة</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">الأصناف المطلوبة</h3>
                                        <p className="text-slate-500 text-sm">قائمة المنتجات والكميات</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-xl">
                                        <Package className="w-4 h-4 text-brand-primary" />
                                        <span className="text-sm font-bold text-brand-primary">
                                            <span dir="ltr">{totalItems}</span> صنف
                                        </span>
                                    </div>
                                    {!isViewMode && (
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
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600 text-sm font-bold border-b border-slate-200">
                                        <th className="py-4 pr-6 text-right w-12">#</th>
                                        <th className="py-4 px-4 text-right">
                                            الصنف <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">
                                            الكمية <span className="text-rose-500">*</span>
                                        </th>
                                        <th className="py-4 px-4 text-center">الوحدة</th>
                                        <th className="py-4 px-4 text-center">سعر الوحدة</th>
                                        <th className="py-4 px-4 text-center">الإجمالي</th>
                                        <th className="py-4 px-4 text-right">ملاحظات</th>
                                        <th className="py-4 pl-6 text-center w-16">حذف</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {formData.items?.map((item, index) => (
                                        <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 pr-6 text-sm text-slate-500 font-semibold">
                                                {index + 1}
                                            </td>
                                            <td className="py-4 px-4">
                                                <select
                                                    value={item.productId || ''}
                                                    disabled={isViewMode}
                                                    onChange={(e) => updateItem(index, 'productId', parseInt(e.target.value))}
                                                    required
                                                    className={`w-full min-w-[200px] px-3 py-2 bg-white border-2 border-slate-200 
                                                        rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    <option value={0}>اختر الصنف...</option>
                                                    {items
                                                        .filter(i => i.isSellable)
                                                        .map(i => (
                                                            <option key={i.id} value={i.id}>
                                                                {i.itemNameAr} ({i.grade || i.itemCode})
                                                            </option>
                                                        ))}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    disabled={isViewMode || formData.schedules?.some(s => s.productId === item.productId)}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    required
                                                    className={`w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-brand-primary outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isViewMode || formData.schedules?.some(s => s.productId === item.productId) ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
                                                    title={formData.schedules?.some(s => s.productId === item.productId) ? 'يتم حساب الكمية تلقائياً من جدول التوصيل' : ''}
                                                />
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-semibold text-slate-600">
                                                    {units.find(u => u.id === item.unitId)?.unitNameAr ||
                                                        items.find(i => i.id === item.productId)?.unitName || '-'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-bold text-slate-700">
                                                    {formatNumber((item as any).unitPrice || 0)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-sm font-bold text-emerald-600">
                                                    {formatNumber((item as any).totalPrice || 0)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="text"
                                                    disabled={isViewMode}
                                                    value={item.notes || ''}
                                                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                    placeholder={isViewMode ? '' : "تفاصيل إضافية..."}
                                                    className={`w-full px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                        text-sm outline-none focus:border-brand-primary transition-all
                                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                />
                                            </td>
                                            <td className="py-4 pl-6 text-center">
                                                {!isViewMode && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 
                                                            rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 font-semibold">لم يتم إضافة أصناف بعد</p>
                                    <p className="text-slate-400 text-sm mt-1">انقر على "إضافة صنف" لبدء الإضافة</p>
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
                        <div className="space-y-5 mt-6">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">عدد الأصناف</span>
                                <span className="font-bold text-lg" dir="ltr">{totalItems}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">إجمالي القيمة التقديرية</span>
                                <span className="font-bold text-lg text-emerald-400" dir="ltr">
                                    {formatNumber(totalEstimatedAmount, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                <span className="text-white/60 text-sm">إجمالي الكميات</span>
                                <span className="font-bold text-lg text-white/80" dir="ltr">
                                    {formatNumber(totalQuantity, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
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
                                placeholder={isViewMode ? '' : "أي ملاحظات إضافية حول الطلب..."}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CustomerRequestFormPage;
