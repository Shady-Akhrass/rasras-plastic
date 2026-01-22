import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Plus,
    Trash2,
    AlertCircle,
    Calendar,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import purchaseService, { type PurchaseRequisition, type PurchaseRequisitionItem } from '../../services/purchaseService';
import { itemService } from '../../services/itemService';
import { unitService } from '../../services/unitService';
import employeeService, { type Department } from '../../services/employeeService';
import toast from 'react-hot-toast';

interface Item {
    id: number;
    itemNameAr: string;
    itemCode: string;
}

interface Unit {
    id: number;
    unitNameAr: string;
}

const PurchaseRequisitionFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

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
        }
    }, [id]);

    const loadMasterData = async () => {
        try {
            const [itemsResponse, unitsResponse, deptsData] = await Promise.all([
                itemService.getAllItems(),
                unitService.getAllUnits(),
                employeeService.getDepartments()
            ]);
            // Extract the array from the response object wrapper
            // Assuming itemService.getAllItems returns { data: Item[] } or similar structure based on error C2417...
            // Checking the previous error: Argument of type '{ data: ItemDto[]; }' is not assignable to parameter of type 'SetStateAction<Item[]>'.
            // This suggests itemService returns { data: ... } but setItems expects Item[].
            // I need to check itemService or just safely access .data if it exists, or cast it.
            // Let's assume standard API response wrapper.

            // However, looking at previous code: setItems(itemsData);
            // If itemsData is { data: ... }, I should use itemsData.data.
            // Let's safe guard it.

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

        // Validate items
        if (!formData.items || formData.items.length === 0) {
            toast.error('يجب إضافة صنف واحد على الأقل');
            return;
        }

        for (const item of formData.items) {
            if (!item.itemId) {
                toast.error('الرجاء اختيار الصنف لجميع السطور');
                return;
            }
            if (!item.requestedQty || item.requestedQty <= 0) {
                toast.error('الكمية يجب أن تكون أكبر من صفر');
                return;
            }
        }

        try {
            setLoading(true);

            // Prepare payload
            const submissionData = { ...formData };
            // Ensure prDate has time component for LocalDateTime backend field
            if (submissionData.prDate && !submissionData.prDate.includes('T')) {
                submissionData.prDate = `${submissionData.prDate}T00:00:00`;
            }

            if (isEditMode) {
                await purchaseService.updatePR(parseInt(id), submissionData as PurchaseRequisition);
                toast.success('تم تحديث طلب الشراء بنجاح');
            } else {
                await purchaseService.createPR(submissionData as PurchaseRequisition);
                toast.success('تم إنشاء طلب الشراء بنجاح');
            }
            navigate('/dashboard/procurement/pr');
        } catch (error) {
            console.error('Failed to save PR', error);
            toast.error('حدث خطأ أثناء حفظ الطلب');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/dashboard/procurement/pr')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {isEditMode ? 'تعديل طلب شراء' : 'طلب شراء جديد'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isEditMode ? `#${formData.prNumber}` : 'إدخال بيانات طلب الشراء والمواد المطلوبة'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-primary" />
                        البيانات الأساسية
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">تاريخ الطلب</label>
                            <div className="relative">
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="date"
                                    name="prDate"
                                    disabled
                                    value={formData.prDate ? new Date(formData.prDate).toISOString().split('T')[0] : ''}
                                    className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">تاريخ الاحتياج <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="requiredDate"
                                required
                                value={formData.requiredDate ? new Date(formData.requiredDate).toISOString().split('T')[0] : ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">القسم الطالب <span className="text-red-500">*</span></label>
                            <select
                                name="requestedByDeptId"
                                value={formData.requestedByDeptId}
                                onChange={(e) => setFormData(prev => ({ ...prev, requestedByDeptId: parseInt(e.target.value) }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                            >
                                <option value="">اختر القسم...</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>{dept.departmentNameAr}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">الأولوية</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                            >
                                <option value="Normal">عادية</option>
                                <option value="High">عالية</option>
                                <option value="Low">منخفضة</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-700">مبررات الطلب</label>
                            <input
                                type="text"
                                name="justification"
                                value={formData.justification || ''}
                                onChange={handleInputChange}
                                placeholder="لماذا يتم طلب هذه المواد؟"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-brand-primary" />
                            الأصناف المطلوبة
                        </h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary/20 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            إضافة صنف
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 w-12">#</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 w-1/3">الصنف</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 w-32">الكمية</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600 w-32">الوحدة</th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">ملاحظات / مواصفات</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-600 w-16">حذف</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {formData.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 text-sm text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={item.itemId}
                                                onChange={(e) => updateItem(index, 'itemId', parseInt(e.target.value))}
                                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-brand-primary text-sm"
                                            >
                                                <option value={0}>اختر الصنف...</option>
                                                {items.map(i => (
                                                    <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0.001"
                                                step="0.001"
                                                value={item.requestedQty}
                                                onChange={(e) => updateItem(index, 'requestedQty', parseFloat(e.target.value))}
                                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-brand-primary text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={item.unitId}
                                                onChange={(e) => updateItem(index, 'unitId', parseInt(e.target.value))}
                                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-brand-primary text-sm"
                                            >
                                                {units.map(u => (
                                                    <option key={u.id} value={u.id}>{u.unitNameAr}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                value={item.notes || ''}
                                                onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                placeholder="تفاصيل إضافية..."
                                                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-brand-primary text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!formData.items || formData.items.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                                            لم يتم إضافة أصناف بعد
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/procurement/pr')}
                        className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'جاري الحفظ...' : 'حفظ الطلب'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PurchaseRequisitionFormPage;
