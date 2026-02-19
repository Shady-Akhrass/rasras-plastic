import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    Trash2,
    FileText,
    Truck,
    Hash,
    Calendar,
    User,
    Phone,
    X
} from 'lucide-react';
import { vehicleService, type VehicleDto } from '../../services/vehicleService';
import toast from 'react-hot-toast';

const VehicleFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<VehicleDto>({
        vehicleCode: '',
        plateNumber: '',
        vehicleType: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        capacity: 0,
        ownershipType: 'Owned',
        driverId: undefined,
        driverName: '',
        driverPhone: '',
        licenseExpiry: '',
        insuranceExpiry: '',
        isActive: true,
        notes: ''
    });

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const v = await vehicleService.getById(parseInt(id));
                    if (v) setForm(v);
                    else { toast.error('المركبة غير موجودة'); navigate('/dashboard/sales/vehicles'); }
                } catch { toast.error('فشل تحميل المركبة'); navigate('/dashboard/sales/vehicles'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.vehicleCode || !form.plateNumber) {
            toast.error('يرجى ملء الحقول المطلوبة');
            return;
        }
        setSaving(true);
        try {
            let result: VehicleDto | null = null;
            if (isNew) {
                result = await vehicleService.create(form);
                if (result) {
                    toast.success('تم إضافة المركبة بنجاح');
                    navigate(`/dashboard/sales/vehicles/${result.id}`);
                } else {
                    toast.error('فشل الإضافة');
                }
            } else {
                result = await vehicleService.update(parseInt(id!), form);
                if (result) {
                    toast.success('تم تحديث المركبة بنجاح');
                    setForm(result);
                } else {
                    toast.error('فشل التحديث');
                }
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !window.confirm('حذف هذه المركبة؟')) return;
        try {
            const ok = await vehicleService.delete(parseInt(id));
            if (ok) { toast.success('تم الحذف'); navigate('/dashboard/sales/vehicles'); }
            else toast.error('فشل الحذف');
        } catch { toast.error('فشل الحذف'); }
    };

    if (!isNew && !form.vehicleCode && loading) return <div className="p-8 text-center">جاري التحميل...</div>;

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
                            onClick={() => navigate('/dashboard/sales/vehicles')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Truck className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {isNew ? 'إضافة مركبة جديدة' : 'تعديل المركبة'}
                            </h1>
                            <p className="text-white/70 text-lg">أدخل تفاصيل المركبة والسائق</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isNew && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-3 bg-rose-500/20 backdrop-blur-sm text-rose-200 rounded-2xl border border-rose-500/30 
                                    hover:bg-rose-500/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-primary/10 rounded-xl">
                                <FileText className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                <p className="text-slate-500 text-sm">معلومات المركبة</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Hash className="w-4 h-4 text-brand-primary" />
                                كود المركبة <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.vehicleCode || ''}
                                onChange={(e) => setForm({ ...form, vehicleCode: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Hash className="w-4 h-4 text-brand-primary" />
                                رقم اللوحة <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.plateNumber || ''}
                                onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Truck className="w-4 h-4 text-brand-primary" />
                                نوع المركبة
                            </label>
                            <input
                                type="text"
                                value={form.vehicleType || ''}
                                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                                placeholder="مثال: شاحنة، بيك أب"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                الماركة
                            </label>
                            <input
                                type="text"
                                value={form.brand || ''}
                                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                الموديل
                            </label>
                            <input
                                type="text"
                                value={form.model || ''}
                                onChange={(e) => setForm({ ...form, model: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Calendar className="w-4 h-4 text-brand-primary" />
                                سنة الصنع
                            </label>
                            <input
                                type="number"
                                value={form.year || ''}
                                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                السعة (طن)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.capacity || ''}
                                onChange={(e) => setForm({ ...form, capacity: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                نوع الملكية
                            </label>
                            <select
                                value={form.ownershipType || ''}
                                onChange={(e) => setForm({ ...form, ownershipType: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            >
                                <option value="Owned">ملك</option>
                                <option value="Rented">مستأجرة</option>
                                <option value="Contracted">تعاقد</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                الحالة
                            </label>
                            <select
                                value={form.isActive ? 'true' : 'false'}
                                onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            >
                                <option value="true">نشط</option>
                                <option value="false">غير نشط</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Calendar className="w-4 h-4 text-brand-primary" />
                                تاريخ انتهاء الترخيص
                            </label>
                            <input
                                type="date"
                                value={form.licenseExpiry || ''}
                                onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Calendar className="w-4 h-4 text-brand-primary" />
                                تاريخ انتهاء التأمين
                            </label>
                            <input
                                type="date"
                                value={form.insuranceExpiry || ''}
                                onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                ملاحظات
                            </label>
                            <textarea
                                value={form.notes || ''}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold resize-none bg-slate-50 hover:bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Driver Assignment */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-primary/10 rounded-xl">
                                <User className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">تعيين السائق</h3>
                                <p className="text-slate-500 text-sm">بيانات السائق لهذه المركبة</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <User className="w-4 h-4 text-brand-primary" />
                                اسم السائق
                            </label>
                            <input
                                type="text"
                                value={form.driverName || ''}
                                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <Phone className="w-4 h-4 text-brand-primary" />
                                هاتف السائق
                            </label>
                            <input
                                type="text"
                                value={form.driverPhone || ''}
                                onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all font-semibold bg-slate-50 hover:bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/sales/vehicles')}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold 
                            hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <span>إلغاء</span>
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold 
                            shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>{saving ? 'جاري الحفظ...' : isNew ? 'إضافة' : 'حفظ'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VehicleFormPage;
