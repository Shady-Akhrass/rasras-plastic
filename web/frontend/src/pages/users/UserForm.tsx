import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle, Key } from 'lucide-react';
import type { User, Role } from '../../services/userService';
import userService from '../../services/userService';
import type { Employee } from '../../services/employeeService';
import employeeService from '../../services/employeeService';

interface UserFormProps {
    user?: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState<any>({
        username: '',
        password: '',
        employeeId: '',
        roleId: '',
        isActive: true,
        isLocked: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
        if (user) {
            setFormData({
                ...user,
                roleId: user.roleId.toString(),
                employeeId: user.employeeId.toString(),
            });
        }
    }, [user]);

    const loadData = async () => {
        try {
            // جلب جميع الموظفين وجميع المستخدمين
            const [empData, usersData, roleData] = await Promise.all([
                employeeService.getAll(0, 200), // جلب عدد كبير من الموظفين
                userService.getAll(0, 200), // جلب جميع المستخدمين
                userService.getRoles()
            ]);

            let employeesData = empData.content;

            // عند إنشاء مستخدم جديد، نستبعد الموظفين الذين لديهم حسابات مسبقة
            if (!user) {
                // إنشاء Set من employeeIds المرتبطة بحسابات مستخدمين
                const employeesWithUsers = new Set(
                    usersData.content.map((u: User) => u.employeeId)
                );
                
                // تصفية الموظفين: نعرض فقط الذين ليس لديهم حسابات
                employeesData = employeesData.filter(
                    (emp: Employee) => !employeesWithUsers.has(emp.employeeId)
                );
            }
            // عند التعديل، نعرض جميع الموظفين (لا تصفية)
            
            setEmployees(employeesData);
            setRoles(roleData);
        } catch (err) {
            console.error('Error loading data:', err);
        }
    };

    const validate = () => {
        if (!formData.username) return 'اسم المستخدم مطلوب';
        if (formData.username.length < 3) return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
        if (!user && (!formData.password || formData.password.length < 6)) {
            return 'كلمة المرور مطلوبة ويجب أن تكون 6 أحرف على الأقل';
        }
        if (!formData.employeeId) return 'يجب اختيار موظف مرتبط';
        if (!formData.roleId) return 'يجب اختيار دور للمستخدم';
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
            if (user) {
                await userService.update(user.userId, formData);
            } else {
                await userService.create(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'اسم المستخدم موجود مسبقاً أو حدث خطأ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {user ? 'تعديل حساب مستخدم' : 'إنشاء حساب مستخدم جديد'}
                        </h2>
                        <p className="text-sm text-slate-500 font-readex">ربط الموظف بصلاحيات النظام</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">اسم المستخدم *</label>
                        <input
                            type="text"
                            required
                            disabled={!!user}
                            className="input-field"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    {!user && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">كلمة المرور *</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">الموظف المرتبط *</label>
                        <select
                            required
                            className="input-field"
                            value={formData.employeeId}
                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                        >
                            <option value="">اختر الموظف</option>
                            {employees.map(emp => (
                                <option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.fullNameAr} ({emp.employeeCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">الدور / الصلاحيات *</label>
                        <select
                            required
                            className="input-field"
                            value={formData.roleId}
                            onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                        >
                            <option value="">اختر الدور</option>
                            {roles.map(role => (
                                <option key={role.roleId} value={role.roleId}>
                                    {role.roleNameAr} ({role.roleCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="userActive"
                                className="w-5 h-5 accent-brand-primary"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <label htmlFor="userActive" className="text-sm font-bold text-slate-700">نشط</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="userLocked"
                                className="w-5 h-5 accent-amber-500"
                                checked={formData.isLocked}
                                onChange={e => setFormData({ ...formData, isLocked: e.target.checked })}
                            />
                            <label htmlFor="userLocked" className="text-sm font-bold text-slate-700">مقفل</label>
                        </div>
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
                        className="btn-primary flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{user ? 'حفظ التغييرات' : 'إنشاء الحساب'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserForm;
