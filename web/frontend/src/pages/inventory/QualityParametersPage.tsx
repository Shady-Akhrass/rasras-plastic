import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, Microscope, X,
    RefreshCw, CheckCircle2, XCircle, Hash, Type,
    ToggleLeft, FileText, Tag, Activity, Save,
    ChevronRight, AlertCircle, Beaker, Gauge
} from 'lucide-react';
import { qualityService, type QualityParameterDto } from '../../services/qualityService';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: number;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// Data Type Badge Component
const DataTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
        'NUMERIC': {
            label: 'رقمي',
            icon: Hash,
            className: 'bg-blue-50 text-blue-700 border-blue-200'
        },
        'TEXT': {
            label: 'نصي',
            icon: Type,
            className: 'bg-purple-50 text-purple-700 border-purple-200'
        },
        'BOOLEAN': {
            label: 'منطقي',
            icon: ToggleLeft,
            className: 'bg-amber-50 text-amber-700 border-amber-200'
        },
    };

    const { label, icon: Icon, className } = config[type] || config['TEXT'];

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};

// Parameter Row Component
const ParameterRow: React.FC<{
    param: QualityParameterDto;
    onEdit: () => void;
    onDelete: () => void;
    index: number;
}> = ({ param, onEdit, onDelete, index }) => (
    <tr
        className="group hover:bg-brand-primary/5 transition-colors duration-200 border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        {/* Code */}
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Beaker className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="font-mono font-bold text-brand-primary text-sm">
                    {param.parameterCode || <span className="text-rose-400">مفقود</span>}
                </span>
            </div>
        </td>

        {/* Arabic Name */}
        <td className="px-6 py-4">
            <span className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
                {param.parameterNameAr}
            </span>
        </td>

        {/* English Name */}
        <td className="px-6 py-4">
            <span className="text-slate-600" dir="ltr">
                {param.parameterNameEn || <span className="text-slate-300">---</span>}
            </span>
        </td>

        {/* Unit */}
        <td className="px-6 py-4">
            {param.unit ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 
                    text-slate-600 text-sm rounded-lg font-mono">
                    <Gauge className="w-3.5 h-3.5" />
                    {param.unit}
                </span>
            ) : (
                <span className="text-slate-300">---</span>
            )}
        </td>

        {/* Data Type */}
        <td className="px-6 py-4">
            <DataTypeBadge type={param.dataType || 'TEXT'} />
        </td>

        {/* Status */}
        <td className="px-6 py-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
                ${param.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {param.isActive ? (
                    <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        نشط
                    </>
                ) : (
                    <>
                        <XCircle className="w-3.5 h-3.5" />
                        معطل
                    </>
                )}
            </span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-1">
                <button
                    onClick={onEdit}
                    className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 
                        rounded-lg transition-all duration-200"
                    title="تعديل"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                        rounded-lg transition-all duration-200"
                    title="حذف"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </td>
    </tr>
);

// Loading Skeleton
const TableSkeleton: React.FC = () => (
    <>
        {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="animate-pulse border-b border-slate-100">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                    </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-7 w-20 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4"><div className="h-7 w-16 bg-slate-100 rounded-lg" /></td>
                <td className="px-6 py-4">
                    <div className="flex gap-1 justify-center">
                        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                        <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                    </div>
                </td>
            </tr>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string; onAdd: () => void }> = ({ searchTerm, onAdd }) => (
    <tr>
        <td colSpan={7} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <Microscope className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا توجد معاملات جودة'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على معاملات تطابق "${searchTerm}"`
                        : 'ابدأ بإضافة معاملات جودة لتعريف خصائص القياسات الفنية'}
                </p>
                {!searchTerm && (
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                            rounded-xl font-medium hover:bg-brand-primary/90 transition-colors
                            shadow-lg shadow-brand-primary/30"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة معامل جديد
                    </button>
                )}
            </div>
        </td>
    </tr>
);

// Form Input Component
const FormInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    dir?: string;
    type?: string;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, dir, type = 'text' }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
                {required && <span className="text-rose-500 mr-1">*</span>}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    required={required}
                    dir={dir}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
            </div>
        </div>
    );
};

// Form Select Component
const FormSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    options: { value: string; label: string }[];
}> = ({ label, value, onChange, icon: Icon, options }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none 
                        appearance-none bg-white cursor-pointer
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 hover:border-slate-300'}`}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronRight className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400
                    transition-transform duration-200 rotate-90`} />
            </div>
        </div>
    );
};

// Form Textarea Component
const FormTextarea: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    rows?: number;
}> = ({ label, value, onChange, icon: Icon, placeholder, rows = 3 }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute right-4 top-4 w-5 h-5 transition-all duration-200
                        ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />
                )}
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none resize-none
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused
                            ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
            </div>
        </div>
    );
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200
        cursor-pointer hover:bg-slate-100 transition-colors group">
        <span className={`font-semibold transition-colors ${checked ? 'text-brand-primary' : 'text-slate-600'}`}>
            {label}
        </span>
        <div
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200
                ${checked ? 'bg-brand-primary' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200
                ${checked ? 'right-1' : 'left-1'}`} />
        </div>
    </label>
);

// Modal Component
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg 
                    transform transition-all animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-xl">
                                <Beaker className="w-5 h-5 text-brand-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 
                                rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const QualityParametersPage: React.FC = () => {
    const [parameters, setParameters] = useState<QualityParameterDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingParam, setEditingParam] = useState<QualityParameterDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paramToDelete, setParamToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState<QualityParameterDto>({
        parameterCode: '',
        parameterNameAr: '',
        parameterNameEn: '',
        unit: '',
        dataType: 'NUMERIC',
        description: '',
        standardValue: 0,
        minValue: 0,
        maxValue: 0,
        isActive: true
    });

    useEffect(() => {
        fetchParameters();
    }, []);

    const fetchParameters = async () => {
        try {
            setLoading(true);
            const response = await qualityService.getAllParameters();
            setParameters(response.data);
        } catch (error) {
            console.error('Error fetching quality parameters:', error);
            toast.error('فشل في تحميل معاملات الجودة');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (editingParam?.id) {
                await qualityService.updateParameter(editingParam.id, formData);
                toast.success('تم تحديث معامل الجودة بنجاح', { icon: '🎉' });
            } else {
                await qualityService.createParameter(formData);
                toast.success('تم إضافة معامل الجودة بنجاح', { icon: '🎉' });
            }
            setShowModal(false);
            resetForm();
            fetchParameters();
        } catch (error: any) {
            console.error('Error saving quality parameter:', error);
            toast.error(error.response?.data?.message || 'فشل حفظ معامل الجودة');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setParamToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!paramToDelete) return;
        setIsDeleting(true);
        try {
            await qualityService.deleteParameter(paramToDelete);
            toast.success('تم حذف معامل الجودة بنجاح', { icon: '🗑️' });
            setIsDeleteModalOpen(false);
            setParamToDelete(null);
            fetchParameters();
        } catch (error: any) {
            console.error('Error deleting parameter:', error);
            toast.error(error.response?.data?.message || 'فشل حذف معامل الجودة');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (param: QualityParameterDto) => {
        setEditingParam(param);
        setFormData(param);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingParam(null);
        setFormData({
            parameterCode: '',
            parameterNameAr: '',
            parameterNameEn: '',
            unit: '',
            dataType: 'NUMERIC',
            description: '',
            standardValue: 0,
            minValue: 0,
            maxValue: 0,
            isActive: true
        });
    };

    const filteredParameters = useMemo(() => {
        return parameters.filter(param =>
            param.parameterNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (param.parameterNameEn && param.parameterNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (param.parameterCode && param.parameterCode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [parameters, searchTerm]);

    const stats = useMemo(() => ({
        total: parameters.length,
        active: parameters.filter(p => p.isActive).length,
        numeric: parameters.filter(p => p.dataType === 'NUMERIC').length,
        text: parameters.filter(p => p.dataType === 'TEXT').length,
    }), [parameters]);

    const dataTypeOptions = [
        { value: 'NUMERIC', label: 'رقمي (Numeric)' },
        { value: 'TEXT', label: 'نصي (Text)' },
        { value: 'BOOLEAN', label: 'منطقي (Yes/No)' },
    ];

    return (
        <div className="space-y-6">
            {/* Custom Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Microscope className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">معاملات الجودة</h1>
                            <p className="text-white/70 text-lg">تعريف خصائص الجودة والقياسات الفنية للمواصفات</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                            shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة معامل</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={Microscope}
                    value={stats.total}
                    label="إجمالي المعاملات"
                    color="primary"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.active}
                    label="معامل نشط"
                    color="success"
                />
                <StatCard
                    icon={Hash}
                    value={stats.numeric}
                    label="معامل رقمي"
                    color="purple"
                />
                <StatCard
                    icon={Type}
                    value={stats.text}
                    label="معامل نصي"
                    color="warning"
                />
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                            transition-colors duration-200
                            ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="بحث بالكود أو الاسم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                outline-none bg-slate-50
                                ${isSearchFocused
                                    ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                    : 'border-transparent hover:border-slate-200'}`}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 
                                    rounded-full transition-colors"
                            >
                                <XCircle className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={fetchParameters}
                        disabled={loading}
                        className="p-3 rounded-xl border border-slate-200 text-slate-600 
                            hover:bg-slate-50 hover:border-slate-300 transition-all duration-200
                            disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            {!loading && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                    <span className="text-slate-600">
                        عرض <span className="font-bold text-slate-800">{filteredParameters.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{parameters.length}</span> معامل
                    </span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الكود</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الاسم العربي</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الاسم الإنجليزي</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الوحدة</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">نوع البيانات</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredParameters.length > 0 ? (
                                filteredParameters.map((param, index) => (
                                    <ParameterRow
                                        key={param.id}
                                        param={param}
                                        onEdit={() => openEditModal(param)}
                                        onDelete={() => param.id && handleDeleteClick(param.id)}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <EmptyState
                                    searchTerm={searchTerm}
                                    onAdd={() => { resetForm(); setShowModal(true); }}
                                />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingParam ? 'تعديل معامل جودة' : 'إضافة معامل جديد'}
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <FormInput
                        label="الكود"
                        value={formData.parameterCode || ''}
                        onChange={(v) => setFormData({ ...formData, parameterCode: v })}
                        icon={Tag}
                        placeholder="DEN-001"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="الاسم العربي"
                            value={formData.parameterNameAr}
                            onChange={(v) => setFormData({ ...formData, parameterNameAr: v })}
                            icon={Type}
                            placeholder="كثافة المادة"
                            required
                        />
                        <FormInput
                            label="الاسم الإنجليزي"
                            value={formData.parameterNameEn || ''}
                            onChange={(v) => setFormData({ ...formData, parameterNameEn: v })}
                            icon={Type}
                            placeholder="Material Density"
                            dir="ltr"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="الوحدة"
                            value={formData.unit || ''}
                            onChange={(v) => setFormData({ ...formData, unit: v })}
                            icon={Gauge}
                            placeholder="g/cm³"
                        />
                        <FormInput
                            label="القيمة القياسية"
                            value={formData.standardValue?.toString() || ''}
                            onChange={(v) => setFormData({ ...formData, standardValue: v ? parseFloat(v) : undefined })}
                            icon={Activity}
                            type="number"
                            placeholder="مثال: 100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="الحد الأدنى"
                            value={formData.minValue?.toString() || ''}
                            onChange={(v) => setFormData({ ...formData, minValue: v ? parseFloat(v) : undefined })}
                            icon={Gauge}
                            type="number"
                            placeholder="Min"
                        />
                        <FormInput
                            label="الحد الأقصى"
                            value={formData.maxValue?.toString() || ''}
                            onChange={(v) => setFormData({ ...formData, maxValue: v ? parseFloat(v) : undefined })}
                            icon={Gauge}
                            type="number"
                            placeholder="Max"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="نوع البيانات"
                            value={formData.dataType || 'NUMERIC'}
                            onChange={(v) => setFormData({ ...formData, dataType: v })}
                            icon={Activity}
                            options={dataTypeOptions}
                        />
                    </div>

                    <FormTextarea
                        label="الوصف"
                        value={formData.description || ''}
                        onChange={(v) => setFormData({ ...formData, description: v })}
                        icon={FileText}
                        placeholder="شرح إضافي لمعامل الجودة..."
                        rows={3}
                    />

                    <ToggleSwitch
                        label="معامل نشط"
                        checked={formData.isActive || false}
                        onChange={(v) => setFormData({ ...formData, isActive: v })}
                    />

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 
                                rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <X className="w-5 h-5" />
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-3 bg-brand-primary text-white hover:bg-brand-primary/90 
                                rounded-xl transition-colors font-bold flex items-center justify-center gap-2 
                                shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {editingParam ? 'حفظ التعديلات' : 'إضافة المعامل'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف معامل جودة"
                message="هل أنت متأكد من حذف هذا المعامل؟ سيؤدي ذلك لإزالته من كافة المواصفات المرتبطة."
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default QualityParametersPage;