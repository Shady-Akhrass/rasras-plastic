import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Plus,
    Trash2,
    AlertCircle,
    Calendar,
    FileText,
    Package,
    Building2,
    Flag,
    ClipboardList,
    Eye,
    XCircle,
    RefreshCw,
    CheckCircle2
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import purchaseService, { type PurchaseRequisition, type PurchaseRequisitionItem } from '../../services/purchaseService';
import { itemService } from '../../services/itemService';
import { unitService } from '../../services/unitService';
import employeeService, { type Department } from '../../services/employeeService';
import toast from 'react-hot-toast';
import PRLifecycleTracker from '../../components/procurement/PRLifecycleTracker';
import { type PRLifecycle } from '../../services/purchaseService';

interface Item {
    id: number;
    itemNameAr: string;
    itemCode: string;
    grade?: string;
    unitId?: number;
}

interface Unit {
    id: number;
    unitNameAr: string;
}

const PurchaseRequisitionFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEditMode = !!id;
    const queryParams = new URLSearchParams(location.search);
    const isViewMode = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [processing, setProcessing] = useState(false);
    const [lifecycle, setLifecycle] = useState<PRLifecycle | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<PurchaseRequisition>>({
        prDate: new Date().toISOString().split('T')[0],
        requiredDate: '',
        priority: 'Normal',
        justification: '',
        notes: '',
        status: 'Draft',
        requestedByDeptId: 0,
        requestedByUserId: 0,
        items: []
    });

    useEffect(() => {
        // Get user from local storage
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                setFormData(prev => ({
                    ...prev,
                    requestedByUserId: user.userId || user.id || 0
                }));
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
            }
        }

        loadMasterData();
        if (isEditMode) {
            loadPR(parseInt(id));
            if (isViewMode) {
                loadLifecycle(parseInt(id));
            }
        }
    }, [id]);

    const loadLifecycle = async (prId: number) => {
        try {
            const data = await purchaseService.getPRLifecycle(prId);
            setLifecycle(data);
        } catch (error) {
            console.error('Failed to load PR lifecycle', error);
        }
    };

    const loadMasterData = async () => {
        try {
            const [itemsResponse, unitsResponse, deptsData] = await Promise.all([
                itemService.getAllItems(),
                unitService.getAllUnits(),
                employeeService.getDepartments()
            ]);

            setItems('data' in itemsResponse ? (itemsResponse as any).data : itemsResponse);
            setUnits('data' in unitsResponse ? (unitsResponse as any).data : unitsResponse);
            setDepartments(deptsData);

            // Default department if not set
            if (!isEditMode && deptsData.length > 0) {
                setFormData(prev => ({ ...prev, requestedByDeptId: deptsData[0].departmentId }));
            }
        } catch (error) {
            console.error('Failed to load master data', error);
            toast.error('فشل تحميل البيانات الأساسية');
        }
    };

    const loadPR = async (prId: number) => {
        try {
            setLoading(true);
            const data = await purchaseService.getPRById(prId);
            setFormData(data);
        } catch (error) {
            console.error('Failed to load PR', error);
            toast.error('فشل تحميل بيانات الطلب');
            navigate('/dashboard/procurement/pr');
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
                    requestedQty: 1,
                    unitId: units.length > 0 ? units[0].id : 0,
                    notes: ''
                }
            ]
        }));
    };

    const updateItem = (index: number, field: keyof PurchaseRequisitionItem, value: any) => {
        const newItems = [...(formData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-select unit when item is selected
        if (field === 'itemId') {
            const selectedItem = items.find(i => i.id === value);
            if (selectedItem && selectedItem.unitId) {
                newItems[index].unitId = selectedItem.unitId;
            }
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const removeItem = (index: number) => {
        const newItems = [...(formData.items || [])];
        newItems.splice(index, 1);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.requestedByDeptId) {
            toast.error('الرجاء اختيار القسم');
            return;
        }

        if (!formData.requiredDate) {
            toast.error('الرجاء تحديد تاريخ الاحتياج');
            return;
        }

        // Validate items
        if (!formData.items || formData.items.length === 0) {
            toast.error('يجب إضافة صنف واحد على الأقل');
            return;
        }

        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.itemId) {
                toast.error(`الرجاء اختيار الصنف في السطر ${i + 1}`);
                return;
            }
            if (!item.requestedQty || item.requestedQty <= 0) {
                toast.error(`الكمية يجب أن تكون أكبر من صفر في السطر ${i + 1}`);
                return;
            }
        }

        try {
            setLoading(true);

            const submissionData = { ...formData };
            if (submissionData.prDate && !submissionData.prDate.includes('T')) {
                submissionData.prDate = `${submissionData.prDate}T00:00:00`;
            }

            if (isEditMode) {
                await purchaseService.updatePR(parseInt(id), submissionData as PurchaseRequisition);
                await purchaseService.submitPR(parseInt(id));
                toast.success('تم تحديث طلب الشراء وإرساله للاعتماد بنجاح');
            } else {
                const createdPr = await purchaseService.createPR(submissionData as PurchaseRequisition);
                if (createdPr && createdPr.id) {
                    await purchaseService.submitPR(createdPr.id);
                }
                toast.success('تم إنشاء طلب الشراء وإرساله للاعتماد بنجاح');
            }
            navigate('/dashboard/procurement/pr');
        } catch (error) {
            console.error('Failed to save PR', error);
            toast.error('حدث خطأ أثناء حفظ الطلب');
        } finally {
            setLoading(false);
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

    const totalItems = formData.items?.length || 0;
    const totalQuantity = formData.items?.reduce((sum, item) => sum + (item.requestedQty || 0), 0) || 0;

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

            {/* Enhanced Header */}
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
                            onClick={() => navigate('/dashboard/procurement/pr')}
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
                                {isEditMode ? 'تعديل طلب شراء' : 'طلب شراء جديد'}
                            </h1>
                            <p className="text-white/80 text-lg">
                                {isEditMode ? `تعديل الطلب رقم ${formData.prNumber}` : 'إدخال بيانات طلب الشراء والمواد المطلوبة'}
                            </p>
                        </div>
                    </div>
                    {!isViewMode && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || totalItems === 0}
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
                            <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                                <Eye className="w-5 h-5" />
                                <span className="font-bold">وضع العرض فقط</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isViewMode && lifecycle && (
                <PRLifecycleTracker lifecycle={lifecycle} />
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">معلومات الطلب والقسم الطالب</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    تاريخ الطلب
                                </label>
                                <input
                                    type="date"
                                    name="prDate"
                                    disabled
                                    value={formData.prDate ? new Date(formData.prDate).toISOString().split('T')[0] : ''}
                                    className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl 
                                        text-slate-500 font-semibold outline-none cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-brand-primary" />
                                    تاريخ الاحتياج <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="requiredDate"
                                    required
                                    disabled={isViewMode}
                                    value={formData.requiredDate ? new Date(formData.requiredDate).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold
                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Building2 className="w-4 h-4 text-brand-primary" />
                                    القسم الطالب <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    name="requestedByDeptId"
                                    value={formData.requestedByDeptId}
                                    disabled={isViewMode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, requestedByDeptId: parseInt(e.target.value) }))}
                                    required
                                    className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold
                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">اختر القسم...</option>
                                    {departments.map(dept => (
                                        <option key={dept.departmentId} value={dept.departmentId}>
                                            {dept.departmentNameAr}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Flag className="w-4 h-4 text-brand-primary" />
                                    الأولوية
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    disabled={isViewMode}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold
                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <option value="Normal">عادية</option>
                                    <option value="High">عالية</option>
                                    <option value="Low">منخفضة</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <FileText className="w-4 h-4 text-brand-primary" />
                                    مبررات الطلب
                                </label>
                                <input
                                    type="text"
                                    name="justification"
                                    disabled={isViewMode}
                                    value={formData.justification || ''}
                                    onChange={handleInputChange}
                                    placeholder={isViewMode ? '' : "لماذا يتم طلب هذه المواد؟"}
                                    className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl 
                                        focus:border-brand-primary focus:bg-white outline-none transition-all font-semibold
                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
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
                                        <p className="text-slate-500 text-sm">قائمة المواد والكميات المحتاجة</p>
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
                                        <th className="py-4 px-4 text-right">ملاحظات / مواصفات</th>
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
                                                    value={item.itemId}
                                                    disabled={isViewMode}
                                                    onChange={(e) => updateItem(index, 'itemId', parseInt(e.target.value))}
                                                    required
                                                    className={`w-full min-w-[200px] px-3 py-2 bg-white border-2 border-slate-200 
                                                        rounded-xl text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    <option value={0}>اختر الصنف...</option>
                                                    {items
                                                        .filter(i => !formData.items?.some((added, idx) => added.itemId === i.id && idx !== index))
                                                        .map(i => (
                                                            <option key={i.id} value={i.id}>
                                                                {i.itemNameAr} ({i.grade || i.itemCode || ''})
                                                            </option>
                                                        ))}
                                                </select>
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    disabled={isViewMode}
                                                    value={item.requestedQty}
                                                    onChange={(e) => updateItem(index, 'requestedQty', parseFloat(e.target.value) || 0)}
                                                    required
                                                    className={`w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                        text-sm text-center font-bold text-brand-primary outline-none 
                                                        focus:border-brand-primary transition-all
                                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <select
                                                    value={item.unitId}
                                                    disabled={isViewMode}
                                                    onChange={(e) => updateItem(index, 'unitId', parseInt(e.target.value))}
                                                    className={`w-28 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl 
                                                        text-sm font-semibold outline-none focus:border-brand-primary transition-all
                                                        ${isViewMode ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    {units.map(u => (
                                                        <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                                                    ))}
                                                </select>
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
                                <span className="text-white/60 text-sm">إجمالي الكميات</span>
                                <span className="font-bold text-lg text-emerald-400" dir="ltr">
                                    {totalQuantity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-xs text-white/40 mb-2">حالة الطلب</div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 
                                    rounded-xl text-amber-300 font-bold text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    مسودة
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

                    {/* Info Alert */}
                    <div className="p-5 bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 rounded-2xl border-2 border-brand-primary/20 
                        flex gap-4 animate-slide-in shadow-lg"
                        style={{ animationDelay: '400ms' }}>
                        <div className="p-3 bg-blue-100 rounded-xl h-fit">
                            <AlertCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-800 mb-2">معلومة هامة</h4>
                            <p className="text-sm leading-relaxed text-blue-700">
                                سيتم إرسال الطلب للاعتماد فور الحفظ. تأكد من <strong>مراجعة جميع البيانات</strong> قبل الإرسال.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PurchaseRequisitionFormPage;