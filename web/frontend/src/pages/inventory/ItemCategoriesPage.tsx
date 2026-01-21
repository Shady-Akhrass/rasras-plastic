import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, RefreshCw, CheckCircle2, XCircle,
    FolderOpen, FolderTree, Tag, Type, Save, ChevronRight, Layers,
    FileText, GitBranch
} from 'lucide-react';
import { itemCategoryService, type ItemCategoryDto } from '../../services/itemCategoryService';
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

// Category Type Badge Component
const CategoryTypeBadge: React.FC<{ isMain: boolean }> = ({ isMain }) => {
    if (isMain) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                <FolderOpen className="w-3.5 h-3.5" />
                تصنيف رئيسي
            </span>
        );
    }
    return null;
};

// Category Row Component
const CategoryRow: React.FC<{
    category: ItemCategoryDto;
    onEdit: () => void;
    onDelete: () => void;
    index: number;
}> = ({ category, onEdit, onDelete, index }) => (
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
                    <FolderTree className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="font-mono font-bold text-brand-primary text-sm">
                    {category.categoryCode || <span className="text-rose-400">مفقود</span>}
                </span>
            </div>
        </td>

        {/* Arabic Name */}
        <td className="px-6 py-4">
            <span className="font-semibold text-slate-900 group-hover:text-brand-primary transition-colors">
                {category.categoryNameAr}
            </span>
        </td>

        {/* English Name */}
        <td className="px-6 py-4">
            <span className="text-slate-600" dir="ltr">
                {category.categoryNameEn || <span className="text-slate-300">---</span>}
            </span>
        </td>

        {/* Parent Category */}
        <td className="px-6 py-4">
            {category.parentCategoryName ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 
                    text-slate-600 text-sm rounded-lg">
                    <GitBranch className="w-3.5 h-3.5" />
                    {category.parentCategoryName}
                </span>
            ) : (
                <CategoryTypeBadge isMain={true} />
            )}
        </td>

        {/* Status */}
        <td className="px-6 py-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border
                ${category.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {category.isActive ? (
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
                <td className="px-6 py-4"><div className="h-7 w-24 bg-slate-100 rounded-lg" /></td>
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
        <td colSpan={6} className="px-6 py-16">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
                    {searchTerm ? (
                        <Search className="w-12 h-12 text-slate-400" />
                    ) : (
                        <FolderTree className="w-12 h-12 text-slate-400" />
                    )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {searchTerm ? 'لا توجد نتائج' : 'لا توجد تصنيفات'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {searchTerm
                        ? `لم يتم العثور على تصنيفات تطابق "${searchTerm}"`
                        : 'ابدأ بإضافة تصنيفات لتنظيم المنتجات والمواد الخام'}
                </p>
                {!searchTerm && (
                    <button
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                            rounded-xl font-medium hover:bg-brand-primary/90 transition-colors
                            shadow-lg shadow-brand-primary/30"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة تصنيف جديد
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
    value: string | number | undefined;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    options: { value: string | number; label: string }[];
    placeholder?: string;
}> = ({ label, value, onChange, icon: Icon, options, placeholder }) => {
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
                    value={value || ''}
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
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400
                    transition-transform duration-200 rotate-90" />
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
                                <FolderTree className="w-5 h-5 text-brand-primary" />
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

const ItemCategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<ItemCategoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ItemCategoryDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState<ItemCategoryDto>({
        categoryCode: '',
        categoryNameAr: '',
        categoryNameEn: '',
        parentCategoryId: undefined,
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await itemCategoryService.getAllCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('فشل في تحميل التصنيفات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (editingCategory?.id) {
                await itemCategoryService.updateCategory(editingCategory.id, formData);
                toast.success('تم تحديث التصنيف بنجاح', { icon: '🎉' });
            } else {
                await itemCategoryService.createCategory(formData);
                toast.success('تم إضافة التصنيف بنجاح', { icon: '🎉' });
            }
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error: any) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'فشل حفظ التصنيف');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setCategoryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        try {
            await itemCategoryService.deleteCategory(categoryToDelete);
            toast.success('تم حذف التصنيف بنجاح', { icon: '🗑️' });
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast.error(error.response?.data?.message || 'فشل حذف التصنيف');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (category: ItemCategoryDto) => {
        setEditingCategory(category);
        setFormData(category);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({
            categoryCode: '',
            categoryNameAr: '',
            categoryNameEn: '',
            parentCategoryId: undefined,
            description: '',
            isActive: true
        });
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(category =>
            category.categoryNameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.categoryNameEn && category.categoryNameEn.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [categories, searchTerm]);

    const stats = useMemo(() => ({
        total: categories.length,
        active: categories.filter(c => c.isActive).length,
        main: categories.filter(c => !c.parentCategoryId).length,
        sub: categories.filter(c => c.parentCategoryId).length,
    }), [categories]);

    const parentCategoryOptions = useMemo(() => {
        return categories
            .filter(c => c.id !== editingCategory?.id)
            .map(c => ({ value: c.id!, label: c.categoryNameAr }));
    }, [categories, editingCategory]);

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
                            <FolderTree className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">تصنيفات المنتجات</h1>
                            <p className="text-white/70 text-lg">إدارة فئات وتصنيفات المنتجات والمواد الخام</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-primary 
                            rounded-xl font-bold hover:bg-white/90 transition-all duration-300
                            shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        <span>إضافة تصنيف</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={FolderTree}
                    value={stats.total}
                    label="إجمالي التصنيفات"
                    color="primary"
                />
                <StatCard
                    icon={CheckCircle2}
                    value={stats.active}
                    label="تصنيف نشط"
                    color="success"
                />
                <StatCard
                    icon={FolderOpen}
                    value={stats.main}
                    label="تصنيف رئيسي"
                    color="warning"
                />
                <StatCard
                    icon={Layers}
                    value={stats.sub}
                    label="تصنيف فرعي"
                    color="purple"
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
                        onClick={fetchCategories}
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
                        عرض <span className="font-bold text-slate-800">{filteredCategories.length}</span> من{' '}
                        <span className="font-bold text-slate-800">{categories.length}</span> تصنيف
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
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">التصنيف الأب</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((category, index) => (
                                    <CategoryRow
                                        key={category.id}
                                        category={category}
                                        onEdit={() => openEditModal(category)}
                                        onDelete={() => category.id && handleDeleteClick(category.id)}
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
                title={editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="الكود"
                            value={formData.categoryCode}
                            onChange={(v) => setFormData({ ...formData, categoryCode: v })}
                            icon={Tag}
                            placeholder="RAW-001"
                            required
                        />
                        <FormSelect
                            label="التصنيف الأب"
                            value={formData.parentCategoryId}
                            onChange={(v) => setFormData({ ...formData, parentCategoryId: v ? parseInt(v) : undefined })}
                            icon={GitBranch}
                            options={parentCategoryOptions}
                            placeholder="تصنيف رئيسي"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="الاسم العربي"
                            value={formData.categoryNameAr}
                            onChange={(v) => setFormData({ ...formData, categoryNameAr: v })}
                            icon={Type}
                            placeholder="خامات بلاستيك"
                            required
                        />
                        <FormInput
                            label="الاسم الإنجليزي"
                            value={formData.categoryNameEn || ''}
                            onChange={(v) => setFormData({ ...formData, categoryNameEn: v })}
                            icon={Type}
                            placeholder="Plastic Materials"
                            dir="ltr"
                        />
                    </div>

                    <FormTextarea
                        label="الوصف"
                        value={formData.description || ''}
                        onChange={(v) => setFormData({ ...formData, description: v })}
                        icon={FileText}
                        placeholder="وصف إضافي للتصنيف..."
                        rows={3}
                    />

                    <ToggleSwitch
                        label="تصنيف نشط"
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
                            {editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="حذف تصنيف"
                message="هل أنت متأكد من حذف هذا التصنيف؟ سيتم إخفاؤه من القوائم النشطة."
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

export default ItemCategoriesPage;