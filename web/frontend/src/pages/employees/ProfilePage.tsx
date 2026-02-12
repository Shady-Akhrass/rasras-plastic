import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight, Edit2, Building2, Mail, Phone, Briefcase,
    Calendar, DollarSign, User, Loader2, CheckCircle2, XCircle, Users
} from 'lucide-react';
import type { Employee } from '../../services/employeeService';
import employeeService from '../../services/employeeService';
import usePageTitle from '../../hooks/usePageTitle';
import { formatDate, formatNumber } from '../../utils/format';
import ProfileEditForm from './ProfileEditForm';

const DataRow = ({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon?: React.ElementType }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        {Icon && <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Icon className="w-4 h-4" /></div>}
        <div className="flex-1">
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-slate-900 font-medium mt-0.5">{value || '—'}</p>
        </div>
    </div>
);

const ProfilePage: React.FC = () => {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    usePageTitle(employee ? `بيانات الموظف - ${employee.fullNameAr}` : 'بيانات الموظف');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await employeeService.getMyEmployee();
                setEmployee(data);
            } catch (e) {
                console.error('Error loading employee', e);
                setEmployee(null);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleEditSuccess = () => {
        employeeService.getMyEmployee().then(setEmployee);
        setIsEditOpen(false);
    };

    const getAvatarColor = (name: string) => {
        const colors = ['from-brand-primary to-blue-400', 'from-emerald-500 to-teal-400', 'from-purple-500 to-indigo-400'];
        return colors[name?.charCodeAt(0) % colors.length] || colors[0];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="text-center py-24">
                <p className="text-slate-500 mb-4">لم يتم العثور على بيانات الموظف</p>
                <Link to="/dashboard" className="text-brand-primary font-medium hover:underline">العودة للوحة التحكم</Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <Link to="/dashboard" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                                <ChevronRight className="w-6 h-6" />
                            </Link>
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(employee.fullNameAr)} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                                {employee.fullNameAr?.slice(0, 2) || '—'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{employee.fullNameAr}</h1>
                                <p className="text-white/80">{employee.employeeCode} • {employee.departmentNameAr || '—'}</p>
                                <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-medium ${employee.isActive ? 'bg-white/20' : 'bg-slate-500/30'}`}>
                                    {employee.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {employee.isActive ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary rounded-xl font-bold hover:bg-white/90 transition-all"
                        >
                            <Edit2 className="w-5 h-5" />
                            تعديل الاسم وكلمة المرور
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-lg"><User className="w-5 h-5 text-brand-primary" /></div>
                            <h3 className="font-bold text-slate-800">البيانات الأساسية</h3>
                        </div>
                        <div className="p-6">
                            <DataRow label="كود الموظف" value={employee.employeeCode} icon={Users} />
                            <DataRow label="الاسم بالعربي" value={employee.fullNameAr} icon={User} />
                            <DataRow label="الاسم بالإنجليزي" value={employee.fullNameEn} />
                            <DataRow label="البريد الإلكتروني" value={employee.email} icon={Mail} />
                            <DataRow label="الهاتف" value={employee.phone} icon={Phone} />
                            <DataRow label="الموبايل" value={employee.mobile} icon={Phone} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-lg"><Briefcase className="w-5 h-5 text-brand-primary" /></div>
                            <h3 className="font-bold text-slate-800">البيانات الوظيفية</h3>
                        </div>
                        <div className="p-6">
                            <DataRow label="القسم" value={employee.departmentNameAr} icon={Building2} />
                            <DataRow label="المسمى الوظيفي" value={employee.jobTitle} icon={Briefcase} />
                            <DataRow label="تاريخ التعيين" value={employee.hireDate ? formatDate(employee.hireDate) : null} icon={Calendar} />
                            <DataRow label="الراتب الأساسي" value={employee.basicSalary != null ? `${formatNumber(employee.basicSalary)} ج.م` : null} icon={DollarSign} />
                        </div>
                    </div>
                </div>
            </div>

            {isEditOpen && (
                <ProfileEditForm employee={employee} onClose={() => setIsEditOpen(false)} onSuccess={handleEditSuccess} />
            )}
        </>
    );
};

export default ProfilePage;
