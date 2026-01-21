import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Employee, Department } from '../../services/employeeService';
import employeeService from '../../services/employeeService';

interface EmployeeFormProps {
    employee?: Employee | null;
    onClose: () => void;
    onSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSuccess }) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState<any>({
        employeeCode: '',
        firstNameAr: '',
        lastNameAr: '',
        firstNameEn: '',
        lastNameEn: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        departmentId: '',
        jobTitle: '',
        hireDate: new Date().toISOString().split('T')[0],
        basicSalary: 0,
        isActive: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDepartments();
        if (employee) {
            setFormData({
                ...employee,
                departmentId: employee.departmentId.toString(),
            });
        }
    }, [employee]);

    const loadDepartments = async () => {
        try {
            const data = await employeeService.getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error('Error loading departments:', err);
        }
    };

    const validate = () => {
        if (!formData.employeeCode) return 'كود الموظف مطلوب';
        if (!formData.firstNameAr || !formData.lastNameAr) return 'الاسم بالعربي مطلوب';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'البريد الإلكتروني غير صحيح';
        if (!formData.departmentId) return 'يجب اختيار القسم';
        if (!formData.hireDate) return 'تاريخ التعيين مطلوب';
        if (formData.basicSalary < 0) return 'الراتب لا يمكن أن يكون سالباً';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (employee) {
                await employeeService.update(employee.employeeId, formData);
            } else {
                await employeeService.create(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {employee ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
                        </h2>
                        <p className="text-sm text-slate-500 font-readex">أدخل البيانات المطلوبة بدقة</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Employee Code */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">كود الموظف *</label>
                            <input
                                type="text"
                                required
                                disabled={!!employee}
                                className="input-field"
                                value={formData.employeeCode}
                                onChange={e => setFormData({ ...formData, employeeCode: e.target.value })}
                            />
                        </div>

                        {/* Names Arabic */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">الاسم الأول (عربي) *</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={formData.firstNameAr}
                                onChange={e => setFormData({ ...formData, firstNameAr: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">الاسم الأخير (عربي) *</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={formData.lastNameAr}
                                onChange={e => setFormData({ ...formData, lastNameAr: e.target.value })}
                            />
                        </div>

                        {/* Names English */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">الاسم الأول (انجليزي)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.firstNameEn}
                                onChange={e => setFormData({ ...formData, firstNameEn: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">الاسم الأخير (انجليزي)</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.lastNameEn}
                                onChange={e => setFormData({ ...formData, lastNameEn: e.target.value })}
                            />
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="input-field"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">رقم الموبايل</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>

                        {/* Job Info */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">القسم *</label>
                            <select
                                required
                                className="input-field"
                                value={formData.departmentId}
                                onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                            >
                                <option value="">اختر القسم</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>
                                        {dept.departmentNameAr}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">المسمى الوظيفي</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.jobTitle}
                                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">تاريخ التعيين *</label>
                            <input
                                type="date"
                                required
                                className="input-field"
                                value={formData.hireDate}
                                onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">الراتب الأساسي</label>
                            <input
                                type="number"
                                className="input-field"
                                value={formData.basicSalary}
                                onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-8">
                            <input
                                type="checkbox"
                                id="isActive"
                                className="w-5 h-5 accent-brand-primary"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <label htmlFor="isActive" className="text-sm font-bold text-slate-700">موظف نشط</label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">العنوان</label>
                        <textarea
                            className="input-field min-h-[100px]"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>حفظ البيانات</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeForm;
