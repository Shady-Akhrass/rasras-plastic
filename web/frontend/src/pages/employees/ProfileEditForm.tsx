import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Employee } from '../../services/employeeService';
import employeeService from '../../services/employeeService';
import apiClient from '../../services/apiClient';

interface ProfileEditFormProps {
    employee: Employee;
    onClose: () => void;
    onSuccess: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ employee, onClose, onSuccess }) => {
    const [firstNameAr, setFirstNameAr] = useState(employee.firstNameAr || '');
    const [lastNameAr, setLastNameAr] = useState(employee.lastNameAr || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!firstNameAr.trim() || !lastNameAr.trim()) {
            setError('الاسم مطلوب');
            return;
        }

        const changePwd = newPassword.trim().length > 0;
        if (changePwd) {
            if (newPassword.length < 6) {
                setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
                return;
            }
            if (!currentPassword.trim()) {
                setError('أدخل كلمة المرور الحالية لتغيير كلمة المرور');
                return;
            }
        }

        setIsLoading(true);
        try {
            await employeeService.updateMyProfile({ firstNameAr: firstNameAr.trim(), lastNameAr: lastNameAr.trim() });
            if (changePwd) {
                await apiClient.post('/auth/change-password', {
                    currentPassword,
                    newPassword,
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء الحفظ';
            setError(typeof msg === 'string' ? msg : 'حدث خطأ أثناء الحفظ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">تعديل الاسم وكلمة المرور</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">الاسم</label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={firstNameAr}
                                    onChange={(e) => setFirstNameAr(e.target.value)}
                                    placeholder="الاسم الأول"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                />
                                <input
                                    type="text"
                                    value={lastNameAr}
                                    onChange={(e) => setLastNameAr(e.target.value)}
                                    placeholder="الاسم الأخير"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-2">تغيير كلمة المرور (اختياري)</label>
                            <div className="space-y-3">
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="كلمة المرور الحالية"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="كلمة المرور الجديدة"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="تأكيد كلمة المرور الجديدة"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-brand-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    حفظ
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditForm;
