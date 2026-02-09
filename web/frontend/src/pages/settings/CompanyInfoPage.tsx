import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Save, Building2, Globe, Mail, Phone, MapPin, FileText,
    Printer, FileImage, CreditCard, Calendar, Edit2, X, Check,
    AlertCircle, Sparkles, Settings, Eye,
    ChevronRight, Camera, Trash2, RefreshCw, Info, CheckCircle2,
    Building, Hash, Landmark, ImageIcon
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { formatDate } from '../../utils/format';
import { toast } from 'react-hot-toast';

interface CompanyInfo {
    id?: number;
    companyNameAr: string;
    companyNameEn: string;
    taxRegistrationNo: string;
    commercialRegNo: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    fax: string;
    email: string;
    website: string;
    logoPath: string;
    headerPath: string;
    footerText: string;
    currency: string;
    fiscalYearStartMonth: number;
}

type TabType = 'basic' | 'contact' | 'system' | 'branding';

// Animated Input Component
const AnimatedInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ReactNode;
    placeholder?: string;
    type?: string;
    required?: boolean;
    dir?: string;
    disabled?: boolean;
}> = ({ label, name, value, onChange, icon, placeholder, type = 'text', required, dir, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;

    return (
        <div className="group relative">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-600'}`}>
                {label}
                {required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <div className="relative">
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300
                    ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`}>
                    {icon}
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    disabled={disabled}
                    dir={dir}
                    className={`w-full pr-12 pl-4 py-3.5 rounded-xl border-2 transition-all duration-300 
                        outline-none bg-white disabled:bg-slate-50 disabled:cursor-not-allowed
                        ${isFocused
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : hasValue
                                ? 'border-brand-primary/30 bg-brand-primary/5'
                                : 'border-slate-200 hover:border-slate-300'
                        }`}
                    placeholder={placeholder}
                />
                {hasValue && !isFocused && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                    </div>
                )}
            </div>
        </div>
    );
};

// Animated Textarea Component
const AnimatedTextarea: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    icon: React.ReactNode;
    placeholder?: string;
    rows?: number;
}> = ({ label, name, value, onChange, icon, placeholder, rows = 3 }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="group relative">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-600'}`}>
                {label}
            </label>
            <div className="relative">
                <div className={`absolute right-4 top-4 transition-all duration-300
                    ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`}>
                    {icon}
                </div>
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    rows={rows}
                    className={`w-full pr-12 pl-4 py-3.5 rounded-xl border-2 transition-all duration-300 
                        outline-none resize-none
                        ${isFocused
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

// Animated Select Component
const AnimatedSelect: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    icon: React.ReactNode;
    options: { value: string | number; label: string }[];
}> = ({ label, name, value, onChange, icon, options }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="group relative">
            <label className={`block text-sm font-medium mb-2 transition-colors duration-200
                ${isFocused ? 'text-brand-primary' : 'text-slate-600'}`}>
                {label}
            </label>
            <div className="relative">
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300
                    ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`}>
                    {icon}
                </div>
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full pr-12 pl-4 py-3.5 rounded-xl border-2 transition-all duration-300 
                        outline-none appearance-none bg-white cursor-pointer
                        ${isFocused
                            ? 'border-brand-primary shadow-lg shadow-brand-primary/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronRight className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400
                    transition-transform duration-300 ${isFocused ? 'rotate-90' : ''}`} />
            </div>
        </div>
    );
};

// File Upload Component with Drag & Drop
const FileUpload: React.FC<{
    label: string;
    value: string;
    onChange: (url: string) => void;
    type: 'logo' | 'header';
}> = ({ label, value, onChange, type }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragOut = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const loadingToast = toast.loading('جاري رفع الملف...');

            const response = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.dismiss(loadingToast);

            console.log('Upload response:', response.data);

            if (response.data.success) {
                const fileUrl = response.data.data;
                // Double check it's not a blob
                if (fileUrl && !fileUrl.startsWith('blob:')) {
                    onChange(fileUrl);
                    toast.success('تم رفع الصورة بنجاح');
                } else {
                    console.error('Server returned invalid URL:', fileUrl);
                    toast.error('خطأ في رابط الصورة من الخادم');
                }
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('فشل رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            uploadFile(file);
        }
    }, [onChange]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    const isLogo = type === 'logo';
    const containerClass = isLogo ? 'aspect-square' : 'aspect-[3/1]';

    // Helper to resolve image URL
    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        // If it's a relative path, prepend API base URL
        const baseUrl = import.meta.env.VITE_API_URL || 'https://api.rasrasplastic.com';
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const displayUrl = getImageUrl(value);

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-600">{label}</label>
            <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => !uploading && inputRef.current?.click()}
                className={`relative ${containerClass} bg-gradient-to-br from-slate-50 to-slate-100 
                    rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden
                    transition-all duration-300 group
                    ${isDragging
                        ? 'border-brand-primary bg-brand-primary/5 scale-[1.02]'
                        : value
                            ? 'border-slate-200 hover:border-brand-primary/50'
                            : 'border-slate-300 hover:border-brand-primary/50'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin mb-2" />
                        <span className="text-sm font-medium text-brand-primary">جاري الرفع...</span>
                    </div>
                ) : value ? (
                    <>
                        <img
                            src={displayUrl}
                            alt={label}
                            className={`w-full h-full transition-all duration-300
                                ${isLogo ? 'object-contain p-4' : 'object-cover'}
                                ${isHovering ? 'scale-105 opacity-50' : ''}`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                            }}
                        />
                        <div className={`absolute inset-0 flex items-center justify-center gap-3
                            transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                                className="px-4 py-2 bg-white rounded-xl shadow-lg flex items-center gap-2
                                    hover:bg-slate-50 transition-colors"
                            >
                                <Camera className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">تغيير</span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg 
                                    flex items-center gap-2 hover:bg-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">حذف</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            transition-all duration-300 ${isDragging
                                ? 'bg-brand-primary text-white scale-110'
                                : 'bg-white shadow-md text-slate-400 group-hover:text-brand-primary group-hover:shadow-lg'
                            }`}>
                            {isLogo ? <ImageIcon className="w-8 h-8" /> : <FileImage className="w-8 h-8" />}
                        </div>
                        <p className={`text-sm font-medium transition-colors duration-300
                            ${isDragging ? 'text-brand-primary' : 'text-slate-600'}`}>
                            {isDragging ? 'أفلت الملف هنا' : 'اسحب الصورة هنا أو اضغط للاختيار'}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">PNG, JPG, WEBP (Max 2MB)</p>
                    </div>
                )}

                {isDragging && (
                    <div className="absolute inset-0 border-2 border-brand-primary rounded-2xl 
                        animate-pulse pointer-events-none" />
                )}
            </div>
        </div>
    );
};

// Info Display Card for View Mode
const InfoCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
}> = ({ icon, label, value }) => (
    <div className="group relative bg-white p-5 rounded-2xl border border-slate-100 
        hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-primary/5 rounded-bl-full 
            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-brand-primary 
                group-hover:bg-brand-primary/10 group-hover:scale-110 transition-all duration-300">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="font-semibold text-slate-800 truncate" dir={label.includes('إنجليزي') ? 'ltr' : 'rtl'}>
                    {value || <span className="text-slate-300">غير محدد</span>}
                </p>
            </div>
        </div>
    </div>
);

// Tab Button Component
const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}> = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300
            ${active
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
    >
        <span className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
            {icon}
        </span>
        <span className="font-medium">{label}</span>
    </button>
);

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-100"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-brand-primary transition-all duration-500"
                    style={{ strokeDasharray: circumference, strokeDashoffset }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-700">{progress}%</span>
            </div>
        </div>
    );
};

const CompanyInfoPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [hasChanges, setHasChanges] = useState(false);
    const [originalData, setOriginalData] = useState<CompanyInfo | null>(null);

    const [formData, setFormData] = useState<CompanyInfo>({
        companyNameAr: '',
        companyNameEn: '',
        taxRegistrationNo: '',
        commercialRegNo: '',
        address: '',
        city: '',
        country: 'Egypt',
        phone: '',
        fax: '',
        email: '',
        website: '',
        logoPath: '',
        headerPath: '',
        footerText: '',
        currency: 'EGP',
        fiscalYearStartMonth: 1
    });

    // Calculate completion percentage
    const calculateCompletion = (): number => {
        const fields = [
            formData.companyNameAr, formData.companyNameEn,
            formData.phone, formData.email, formData.logoPath
        ];
        const filled = fields.filter(f => f && f.toString().trim() !== '').length;
        return Math.round((filled / fields.length) * 100);
    };

    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    useEffect(() => {
        if (originalData) {
            const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
            setHasChanges(changed);
        }
    }, [formData, originalData]);

    const fetchCompanyInfo = async () => {
        try {
            setInitialLoading(true);
            const response = await apiClient.get('/company');
            if (response.data.data) {
                setFormData(response.data.data);
                setOriginalData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching company info:', error);
            toast.error('فشل تحميل بيانات الشركة');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        try {
            setLoading(true);
            const response = await apiClient.put('/company', formData);
            if (response.data.success) {
                toast.success('تم حفظ البيانات بنجاح', {
                    icon: '🎉',
                    duration: 3000
                });
                setFormData(response.data.data);
                setOriginalData(response.data.data);
                setIsEditing(false);
                setHasChanges(false);
            }
        } catch (error) {
            console.error('Error updating company info:', error);
            toast.error('فشل تحديث البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (window.confirm('هل أنت متأكد من إلغاء التغييرات؟')) {
                setFormData(originalData!);
                setIsEditing(false);
                setHasChanges(false);
            }
        } else {
            setIsEditing(false);
        }
    };

    const currencyOptions = [
        { value: 'EGP', label: '🇪🇬 جنيه مصري (EGP)' },
        { value: 'USD', label: '🇺🇸 دولار أمريكي (USD)' },
        { value: 'EUR', label: '🇪🇺 يورو (EUR)' },
        { value: 'SAR', label: '🇸🇦 ريال سعودي (SAR)' },
        { value: 'AED', label: '🇦🇪 درهم إماراتي (AED)' },
        { value: 'KWD', label: '🇰🇼 دينار كويتي (KWD)' },
    ];

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: formatDate(new Date(2024, i), { month: 'long' })
    }));

    // Loading Skeleton
    if (initialLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
                        <div className="h-4 w-64 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="h-12 w-36 bg-slate-200 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
                        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
                    </div>
                    <div className="space-y-6">
                        <div className="h-48 bg-white rounded-2xl border border-slate-200" />
                        <div className="h-48 bg-white rounded-2xl border border-slate-200" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-brand-primary to-brand-primary/80 
                        rounded-2xl shadow-lg shadow-brand-primary/20">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">بيانات الشركة</h1>
                        <p className="text-slate-500 mt-1">إدارة المعلومات الرسمية للمؤسسة</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Completion Progress - Only in View Mode */}
                    {!isEditing && (
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl">
                            <div className="text-left">
                                <p className="text-xs text-slate-500">اكتمال البيانات</p>
                                <p className="text-sm font-bold text-slate-700">{calculateCompletion()}%</p>
                            </div>
                            <div className="w-12 h-12 relative">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                                    <circle
                                        cx="24" cy="24" r="20"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeLinecap="round"
                                        className="text-brand-primary"
                                        style={{
                                            strokeDasharray: 2 * Math.PI * 20,
                                            strokeDashoffset: 2 * Math.PI * 20 * (1 - calculateCompletion() / 100)
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Edit Button - Only in View Mode */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
                                font-medium shadow-lg bg-brand-primary hover:bg-brand-primary/90 text-white 
                                shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 hover:-translate-y-0.5"
                        >
                            <Edit2 className="w-5 h-5" />
                            <span>تعديل البيانات</span>
                        </button>
                    )}
                </div>
            </div>

            {!isEditing ? (
                /* ============ VIEW MODE ============ */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Header Card */}
                        <div className="bg-gradient-to-br from-brand-primary to-brand-primary/90 
                            rounded-3xl p-8 text-white relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full 
                                -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full 
                                translate-x-1/4 translate-y-1/4" />

                            <div className="relative flex items-center gap-6">
                                {formData.logoPath ? (
                                    <div className="w-24 h-24 bg-white rounded-2xl p-3 shadow-xl">
                                        <img
                                            src={formData.logoPath}
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl 
                                        flex items-center justify-center">
                                        <Building2 className="w-12 h-12 text-white/50" />
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">
                                        {formData.companyNameAr || 'اسم الشركة'}
                                    </h2>
                                    <p className="text-white/70 text-lg" dir="ltr">
                                        {formData.companyNameEn || 'Company Name'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-4">
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                            {formData.city}, {formData.country}
                                        </span>
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                            {formData.currency}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm 
                            hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                المعلومات الأساسية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard
                                    icon={<Hash className="w-5 h-5" />}
                                    label="رقم التسجيل الضريبي"
                                    value={formData.taxRegistrationNo}
                                />
                                <InfoCard
                                    icon={<Landmark className="w-5 h-5" />}
                                    label="رقم السجل التجاري"
                                    value={formData.commercialRegNo}
                                />
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm 
                            hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Phone className="w-5 h-5 text-brand-primary" />
                                </div>
                                معلومات التواصل
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard icon={<MapPin className="w-5 h-5" />} label="العنوان" value={formData.address} />
                                <InfoCard icon={<MapPin className="w-5 h-5" />} label="المدينة / الدولة" value={`${formData.city} - ${formData.country}`} />
                                <InfoCard icon={<Phone className="w-5 h-5" />} label="الهاتف" value={formData.phone} />
                                <InfoCard icon={<Printer className="w-5 h-5" />} label="الفاكس" value={formData.fax} />
                                <InfoCard icon={<Mail className="w-5 h-5" />} label="البريد الإلكتروني" value={formData.email} />
                                <InfoCard icon={<Globe className="w-5 h-5" />} label="الموقع الإلكتروني" value={formData.website} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Completion Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">اكتمال الملف</h3>
                            <div className="flex flex-col items-center">
                                <ProgressRing progress={calculateCompletion()} />
                                <p className="text-sm text-slate-500 mt-4 text-center">
                                    {calculateCompletion() === 100
                                        ? '🎉 ممتاز! جميع البيانات مكتملة'
                                        : 'أكمل بياناتك للحصول على ملف شركة متكامل'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* System Settings Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm 
                            hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                    <Settings className="w-5 h-5 text-brand-primary" />
                                </div>
                                إعدادات النظام
                            </h3>
                            <div className="space-y-4">
                                <InfoCard
                                    icon={<CreditCard className="w-5 h-5" />}
                                    label="العملة الافتراضية"
                                    value={formData.currency}
                                />
                                <InfoCard
                                    icon={<Calendar className="w-5 h-5" />}
                                    label="بداية السنة المالية"
                                    value={formatDate(new Date(2024, formData.fiscalYearStartMonth - 1), { month: 'long' })}
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                إجراءات سريعة
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl
                                        text-right flex items-center gap-3 transition-colors duration-200"
                                >
                                    <Edit2 className="w-5 h-5" />
                                    <span>تعديل البيانات</span>
                                </button>
                                <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl
                                    text-right flex items-center gap-3 transition-colors duration-200">
                                    <Eye className="w-5 h-5" />
                                    <span>معاينة الصفحة العامة</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ============ EDIT MODE ============ */
                <div className="space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap gap-3 p-2 bg-slate-50 rounded-2xl">
                        <TabButton
                            active={activeTab === 'basic'}
                            onClick={() => setActiveTab('basic')}
                            icon={<Building2 className="w-5 h-5" />}
                            label="المعلومات الأساسية"
                        />
                        <TabButton
                            active={activeTab === 'contact'}
                            onClick={() => setActiveTab('contact')}
                            icon={<Phone className="w-5 h-5" />}
                            label="التواصل"
                        />
                        <TabButton
                            active={activeTab === 'branding'}
                            onClick={() => setActiveTab('branding')}
                            icon={<ImageIcon className="w-5 h-5" />}
                            label="الهوية البصرية"
                        />
                        <TabButton
                            active={activeTab === 'system'}
                            onClick={() => setActiveTab('system')}
                            icon={<Settings className="w-5 h-5" />}
                            label="إعدادات النظام"
                        />
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            {/* Basic Info Tab */}
                            {activeTab === 'basic' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                        <div className="p-3 bg-brand-primary/10 rounded-xl">
                                            <Building2 className="w-6 h-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">المعلومات الأساسية</h3>
                                            <p className="text-sm text-slate-500">بيانات الشركة الرسمية</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AnimatedInput
                                            label="اسم الشركة (عربي)"
                                            name="companyNameAr"
                                            value={formData.companyNameAr}
                                            onChange={handleChange}
                                            icon={<Building className="w-5 h-5" />}
                                            placeholder="أدخل اسم الشركة بالعربية"
                                            required
                                        />
                                        <AnimatedInput
                                            label="اسم الشركة (إنجليزي)"
                                            name="companyNameEn"
                                            value={formData.companyNameEn}
                                            onChange={handleChange}
                                            icon={<Globe className="w-5 h-5" />}
                                            placeholder="Enter company name in English"
                                            dir="ltr"
                                        />
                                        <AnimatedInput
                                            label="رقم التسجيل الضريبي"
                                            name="taxRegistrationNo"
                                            value={formData.taxRegistrationNo}
                                            onChange={handleChange}
                                            icon={<Hash className="w-5 h-5" />}
                                            placeholder="أدخل رقم التسجيل الضريبي"
                                        />
                                        <AnimatedInput
                                            label="رقم السجل التجاري"
                                            name="commercialRegNo"
                                            value={formData.commercialRegNo}
                                            onChange={handleChange}
                                            icon={<Landmark className="w-5 h-5" />}
                                            placeholder="أدخل رقم السجل التجاري"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Contact Tab */}
                            {activeTab === 'contact' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                        <div className="p-3 bg-brand-primary/10 rounded-xl">
                                            <Phone className="w-6 h-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">معلومات التواصل</h3>
                                            <p className="text-sm text-slate-500">العنوان وبيانات الاتصال</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <AnimatedTextarea
                                                label="العنوان التفصيلي"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                icon={<MapPin className="w-5 h-5" />}
                                                placeholder="أدخل العنوان التفصيلي للشركة"
                                                rows={2}
                                            />
                                        </div>
                                        <AnimatedInput
                                            label="المدينة"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            icon={<Building className="w-5 h-5" />}
                                            placeholder="المدينة"
                                        />
                                        <AnimatedInput
                                            label="الدولة"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            icon={<Globe className="w-5 h-5" />}
                                            placeholder="الدولة"
                                        />
                                        <AnimatedInput
                                            label="رقم الهاتف"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            icon={<Phone className="w-5 h-5" />}
                                            placeholder="+20 xxx xxx xxxx"
                                            dir="ltr"
                                        />
                                        <AnimatedInput
                                            label="رقم الفاكس"
                                            name="fax"
                                            value={formData.fax}
                                            onChange={handleChange}
                                            icon={<Printer className="w-5 h-5" />}
                                            placeholder="+20 xxx xxx xxxx"
                                            dir="ltr"
                                        />
                                        <AnimatedInput
                                            label="البريد الإلكتروني"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            icon={<Mail className="w-5 h-5" />}
                                            placeholder="info@company.com"
                                            type="email"
                                            dir="ltr"
                                        />
                                        <AnimatedInput
                                            label="الموقع الإلكتروني"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            icon={<Globe className="w-5 h-5" />}
                                            placeholder="www.company.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Branding Tab */}
                            {activeTab === 'branding' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                        <div className="p-3 bg-brand-primary/10 rounded-xl">
                                            <ImageIcon className="w-6 h-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">الهوية البصرية</h3>
                                            <p className="text-sm text-slate-500">الشعار وصور الهوية</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FileUpload
                                            label="شعار الشركة"
                                            value={formData.logoPath}
                                            onChange={(url) => setFormData(prev => ({ ...prev, logoPath: url }))}
                                            type="logo"
                                        />
                                        <FileUpload
                                            label="صورة الهيدر"
                                            value={formData.headerPath}
                                            onChange={(url) => setFormData(prev => ({ ...prev, headerPath: url }))}
                                            type="header"
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <AnimatedTextarea
                                            label="نص الفوتر"
                                            name="footerText"
                                            value={formData.footerText}
                                            onChange={handleChange}
                                            icon={<FileText className="w-5 h-5" />}
                                            placeholder="النص الذي سيظهر في ذيل الصفحات"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* System Tab */}
                            {activeTab === 'system' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                        <div className="p-3 bg-brand-primary/10 rounded-xl">
                                            <Settings className="w-6 h-6 text-brand-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">إعدادات النظام</h3>
                                            <p className="text-sm text-slate-500">العملة والسنة المالية</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AnimatedSelect
                                            label="العملة الافتراضية"
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleChange}
                                            icon={<CreditCard className="w-5 h-5" />}
                                            options={currencyOptions}
                                        />
                                        <AnimatedSelect
                                            label="بداية السنة المالية"
                                            name="fiscalYearStartMonth"
                                            value={formData.fiscalYearStartMonth}
                                            onChange={handleChange}
                                            icon={<Calendar className="w-5 h-5" />}
                                            options={monthOptions}
                                        />
                                    </div>

                                    {/* Info Box */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">ملاحظة هامة</p>
                                            <p className="text-sm text-blue-700 mt-1">
                                                تغيير العملة أو بداية السنة المالية قد يؤثر على التقارير المالية.
                                                يرجى التأكد قبل الحفظ.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form Actions - Single Save Button */}
                        <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                {hasChanges ? (
                                    <>
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                        <span>لديك تغييرات غير محفوظة</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 text-brand-primary" />
                                        <span>جميع التغييرات محفوظة</span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 
                                        font-medium transition-colors flex items-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !hasChanges}
                                    className="px-8 py-2.5 bg-brand-primary text-white rounded-xl 
                                        hover:bg-brand-primary/90 transition-all font-bold 
                                        shadow-lg shadow-brand-primary/20 disabled:opacity-50 
                                        disabled:cursor-not-allowed flex items-center gap-2
                                        hover:shadow-xl hover:shadow-brand-primary/30"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    حفظ التغييرات
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Unsaved Changes Warning - Floating Notification */}
            {hasChanges && isEditing && (
                <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 
                    bg-brand-primary text-white p-4 rounded-xl shadow-xl shadow-brand-primary/30 
                    flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300 z-50">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <div className="flex-1">
                        <p className="font-medium">تغييرات غير محفوظة</p>
                        <p className="text-sm text-white/80">لا تنسَ حفظ التغييرات قبل المغادرة</p>
                    </div>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        className="px-4 py-2 bg-white text-brand-primary rounded-lg font-medium 
                            hover:bg-white/90 transition-colors"
                    >
                        حفظ
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompanyInfoPage;