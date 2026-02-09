import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save, ArrowRight, Building2, DollarSign, MapPin, Phone, Mail,
    FileText, Globe, CreditCard, ShieldCheck, Package, Trash2, Plus,
    X, RefreshCw, CheckCircle2, User, Clock, Star, Tag, Layers,
    ChevronRight, Send, Hash, Calendar, Landmark,
    BadgeCheck, XCircle, Info
} from 'lucide-react';
import { supplierService, type SupplierDto, type SupplierItemDto, type SupplierBankDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { formatNumber } from '../../utils/format';
import { toast } from 'react-hot-toast';

type Tab = 'basic' | 'financial' | 'contact' | 'items';

// Form Input Component
const FormInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    type?: string;
    dir?: string;
    hint?: string;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, type = 'text', dir, hint }) => {
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
            {hint && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {hint}
                </p>
            )}
        </div>
    );
};

// Form Select Component
const FormSelect: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    options: { value: string | number; label: string }[];
    required?: boolean;
}> = ({ label, value, onChange, icon: Icon, options, required }) => {
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
                <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90" />
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

// Toggle Card Component
const ToggleCard: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon: React.ElementType;
    activeColor?: 'emerald' | 'blue' | 'amber';
}> = ({ label, description, checked, onChange, icon: Icon, activeColor = 'emerald' }) => {
    const colors = {
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', activeBg: 'bg-emerald-500' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', activeBg: 'bg-blue-500' },
        amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', activeBg: 'bg-amber-500' },
    };
    const c = colors[activeColor];

    return (
        <div
            onClick={() => onChange(!checked)}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer
                transition-all duration-300 group
                ${checked ? `${c.bg} ${c.border}` : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${checked ? `${c.bg} ${c.text}` : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className={`font-bold transition-colors ${checked ? c.text : 'text-slate-700'}`}>
                        {label}
                    </div>
                    {description && <div className="text-xs text-slate-500">{description}</div>}
                </div>
            </div>
            <div className={`relative w-14 h-7 rounded-full transition-colors duration-300
                ${checked ? c.activeBg : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300
                    ${checked ? 'right-1' : 'left-1'}`} />
            </div>
        </div>
    );
};

// Tab Button Component
const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    badge?: number;
}> = ({ active, onClick, icon: Icon, label, badge }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold transition-all duration-300
            ${active
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-primary/30 hover:bg-brand-primary/5'
            }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
                {badge}
            </span>
        )}
    </button>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
        DRAFT: { label: 'مسودة', bg: 'bg-slate-100', text: 'text-slate-600', icon: FileText },
        PENDING: { label: 'قيد المراجعة', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
        APPROVED: { label: 'معتمد', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
        REJECTED: { label: 'مرفوض', bg: 'bg-rose-100', text: 'text-rose-700', icon: XCircle }
    };

    const c = config[status] || config.DRAFT;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}>
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
        </span>
    );
};

// Modal Component
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ElementType;
    headerColor?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}> = ({ isOpen, onClose, title, icon: Icon, headerColor = 'bg-brand-primary', children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl 
                    transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className={`p-6 ${headerColor} text-white flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            {Icon && (
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Icon className="w-5 h-5" />
                                </div>
                            )}
                            <h3 className="text-xl font-bold">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                    {footer && (
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Section Card Component
const SectionCard: React.FC<{
    title?: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    action?: React.ReactNode;
}> = ({ title, icon: Icon, children, action }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6
        animate-in fade-in slide-in-from-bottom-2 duration-300">
        {title && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 bg-brand-primary/10 rounded-xl">
                            <Icon className="w-5 h-5 text-brand-primary" />
                        </div>
                    )}
                    <h3 className="font-bold text-slate-800">{title}</h3>
                </div>
                {action}
            </div>
        )}
        {children}
    </div>
);

// Loading Skeleton
const FormSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-3xl" />
        <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 w-40 bg-slate-100 rounded-xl" />
            ))}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="h-12 bg-slate-100 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// Item Row Component
const ItemRow: React.FC<{
    item: SupplierItemDto;
    currency: string;
    onUnlink: () => void;
    index: number;
}> = ({ item, currency, onUnlink, index }) => (
    <tr
        className="group hover:bg-brand-primary/5 transition-colors border-b border-slate-100 last:border-0"
        style={{
            animationDelay: `${index * 30}ms`,
            animation: 'fadeInUp 0.3s ease-out forwards'
        }}
    >
        <td className="p-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 
                    rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                    <div className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">
                        {item.itemNameAr}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{item.itemCode}</div>
                </div>
            </div>
        </td>
        <td className="p-4">
            <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                {item.supplierItemCode || '---'}
            </span>
        </td>
        <td className="p-4">
            <span className="font-bold text-slate-800">
                {formatNumber(item.lastPrice)} {currency}
            </span>
        </td>
        <td className="p-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                {item.leadTimeDays} يوم
            </span>
        </td>
        <td className="p-4">
            {item.isPreferred && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 
                    rounded-lg text-xs font-bold border border-amber-200">
                    <Star className="w-3.5 h-3.5" />
                    مفضل
                </span>
            )}
        </td>
        <td className="p-4">
            <button
                type="button"
                onClick={onUnlink}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                    rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </td>
    </tr>
);

// Bank Card Component
const BankCard: React.FC<{
    bank: SupplierBankDto;
    onRemove: () => void;
}> = ({ bank, onRemove }) => (
    <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-between 
        hover:border-blue-200 hover:shadow-md transition-all group">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center
                group-hover:scale-110 transition-transform">
                <Landmark className="w-6 h-6 text-blue-600" />
            </div>
            <div>
                <div className="font-bold text-slate-800 flex items-center gap-2">
                    {bank.bankName}
                    {bank.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                            افتراضي
                        </span>
                    )}
                </div>
                <div className="text-sm text-slate-500 font-mono">{bank.bankAccountNo}</div>
                {bank.iban && (
                    <div className="text-xs text-slate-400 font-mono mt-1">IBAN: {bank.iban}</div>
                )}
            </div>
        </div>
        <button
            type="button"
            onClick={onRemove}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 
                rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    </div>
);

const SupplierFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [activeTab, setActiveTab] = useState<Tab>('basic');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [supplierItems, setSupplierItems] = useState<SupplierItemDto[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [availableItems, setAvailableItems] = useState<ItemDto[]>([]);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState<Partial<SupplierItemDto>>({
        itemId: 0,
        supplierItemCode: '',
        lastPrice: 0,
        leadTimeDays: 0,
        isPreferred: false
    });

    const [supplierBanks, setSupplierBanks] = useState<SupplierBankDto[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [bankData, setBankData] = useState<Partial<SupplierBankDto>>({
        bankName: '',
        bankAccountNo: '',
        iban: '',
        swift: '',
        currency: 'EGP',
        isDefault: false
    });

    const [formData, setFormData] = useState<SupplierDto>({
        supplierNameAr: '',
        supplierNameEn: '',
        supplierType: 'Local',
        taxRegistrationNo: '',
        commercialRegNo: '',
        address: '',
        city: '',
        country: 'Egypt',
        phone: '',
        fax: '',
        email: '',
        website: '',
        contactPerson: '',
        contactPhone: '',
        paymentTermDays: 0,
        creditLimit: 0,
        currency: 'EGP',
        bankName: '',
        bankAccountNo: '',
        iban: '',
        rating: 'B',
        isApproved: false,
        isActive: true,
        notes: '',
        status: 'DRAFT'
    });

    useEffect(() => {
        if (isEdit) {
            const sId = parseInt(id);
            loadSupplier(sId);
            loadSupplierItems(sId);
            loadSupplierBanks(sId);
            loadAvailableItems();
        }
    }, [id]);

    const loadSupplier = async (sId: number) => {
        try {
            setLoading(true);
            const response = await supplierService.getSupplierById(sId);
            setFormData(response.data);
        } catch (error) {
            console.error('Failed to load supplier:', error);
            toast.error('فشل في تحميل بيانات المورد');
            navigate('/dashboard/procurement/suppliers');
        } finally {
            setLoading(false);
        }
    };

    const loadSupplierBanks = async (sId: number) => {
        try {
            setLoadingBanks(true);
            const response = await supplierService.getSupplierBanks(sId);
            setSupplierBanks(response.data);
        } catch (error) {
            console.error('Failed to load supplier banks:', error);
        } finally {
            setLoadingBanks(false);
        }
    };

    const loadSupplierItems = async (sId: number) => {
        try {
            setLoadingItems(true);
            const response = await supplierService.getSupplierItems(sId);
            setSupplierItems(response.data);
        } catch (error) {
            console.error('Failed to load supplier items:', error);
        } finally {
            setLoadingItems(false);
        }
    };

    const loadAvailableItems = async () => {
        try {
            const data = await itemService.getAllItems();
            setAvailableItems(data.data || []);
        } catch (error) {
            console.error('Failed to load available items:', error);
        }
    };

    const handleChange = (field: keyof SupplierDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.supplierNameAr) {
            toast.error('يرجى إدخال اسم المورد');
            return;
        }

        try {
            setSaving(true);
            if (isEdit) {
                await supplierService.updateSupplier(parseInt(id), formData);
                toast.success('تمت تحديث بيانات المورد بنجاح', { icon: '🎉' });
            } else {
                await supplierService.createSupplier(formData);
                toast.success('تمت إضافة المورد بنجاح', { icon: '🎉' });
            }
            navigate('/dashboard/procurement/suppliers');
        } catch (error: any) {
            console.error('Failed to save supplier:', error);
            toast.error(error.response?.data?.message || 'فشل في حفظ البيانات');
        } finally {
            setSaving(false);
        }
    };

    const handleLinkItem = async () => {
        if (!linkData.itemId) {
            toast.error('يرجى اختيار الصنف');
            return;
        }

        try {
            await supplierService.linkItem({
                ...linkData as SupplierItemDto,
                supplierId: parseInt(id!)
            });
            toast.success('تم ربط الصنف بنجاح', { icon: '🔗' });
            setIsLinkModalOpen(false);
            setLinkData({
                itemId: 0,
                supplierItemCode: '',
                lastPrice: 0,
                leadTimeDays: 0,
                isPreferred: false
            });
            loadSupplierItems(parseInt(id!));
        } catch (error) {
            console.error('Failed to link item:', error);
            toast.error('فشل في ربط الصنف');
        }
    };

    const handleUnlinkItem = async (supplierItemId: number) => {
        if (!window.confirm('هل أنت متأكد من إلغاء ربط هذا الصنف؟')) return;

        try {
            await supplierService.unlinkItem(supplierItemId);
            toast.success('تم إلغاء ربط الصنف');
            loadSupplierItems(parseInt(id!));
        } catch (error) {
            console.error('Failed to unlink item:', error);
            toast.error('فشل في إلغاء ربط الصنف');
        }
    };

    const handleAddBank = async () => {
        if (!bankData.bankName || !bankData.bankAccountNo) {
            toast.error('يرجى إدخال اسم البنك ورقم الحساب');
            return;
        }

        try {
            await supplierService.addBank({
                ...bankData as SupplierBankDto,
                supplierId: parseInt(id!)
            });
            toast.success('تمت إضافة الحساب البنكي', { icon: '🏦' });
            setIsBankModalOpen(false);
            setBankData({
                bankName: '',
                bankAccountNo: '',
                iban: '',
                swift: '',
                currency: 'EGP',
                isDefault: false
            });
            loadSupplierBanks(parseInt(id!));
        } catch (error) {
            console.error('Failed to add bank:', error);
            toast.error('فشل في إضافة الحساب البنكي');
        }
    };

    const handleRemoveBank = async (bankId: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الحساب البنكي؟')) return;

        try {
            await supplierService.removeBank(bankId);
            toast.success('تم حذف الحساب البنكي');
            loadSupplierBanks(parseInt(id!));
        } catch (error) {
            console.error('Failed to remove bank:', error);
            toast.error('فشل في حذف الحساب البنكي');
        }
    };

    const handleSubmitForApproval = async () => {
        if (!isEdit) return;
        try {
            setSaving(true);
            await supplierService.submitForApproval(parseInt(id!));
            toast.success('تم إرسال طلب الاعتماد بنجاح', { icon: '📤' });
            loadSupplier(parseInt(id!));
        } catch (error) {
            console.error('Failed to submit for approval:', error);
            toast.error('فشل في إرسال طلب الاعتماد');
        } finally {
            setSaving(false);
        }
    };

    const supplierTypeOptions = [
        { value: 'Local', label: 'محلـي' },
        { value: 'International', label: 'دولـي' },
    ];

    const currencyOptions = [
        { value: 'EGP', label: 'EGP - جنيه مصري' },
        { value: 'USD', label: 'USD - دولار أمريكي' },
        { value: 'EUR', label: 'EUR - ريال سعودي ' },
    ];

    const ratingOptions = [
        { value: 'A', label: 'Class A (ممتاز)' },
        { value: 'B', label: 'Class B (جيد)' },
        { value: 'C', label: 'Class C (متوسط)' },
        { value: 'D', label: 'Class D (خطورة)' },
    ];

    const itemOptions = availableItems.map(i => ({
        value: i.id!,
        label: `${i.itemNameAr} (${i.grade || i.itemCode || ''})`
    }));

    if (loading) return <FormSkeleton />;

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

            {/* Rejection Banner */}
            {formData.status === 'REJECTED' && (
                <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex items-start gap-4
                    animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-3 bg-rose-100 rounded-xl">
                        <XCircle className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-rose-800">تم رفض طلب اعتماد المورد</h4>
                        <p className="text-rose-600 text-sm mt-1">
                            {formData.approvalNotes || 'لم يتم ذكر أسباب للرفض'}
                        </p>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/procurement/suppliers')}
                            className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Building2 className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isEdit ? formData.supplierNameAr : 'إضافة مورد جديد'}
                                </h1>
                                {isEdit && <StatusBadge status={formData.status || 'DRAFT'} />}
                            </div>
                            <p className="text-white/70 text-lg">
                                {isEdit ? 'تعديل بيانات المورد' : 'أدخل البيانات الأساسية والمالية للمورد'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {isEdit && formData.status === 'DRAFT' && (
                            <button
                                type="button"
                                onClick={handleSubmitForApproval}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white 
                                    rounded-xl font-bold hover:bg-amber-600 transition-all
                                    shadow-lg shadow-amber-500/30 disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                                إرسال للاعتماد
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/procurement/suppliers')}
                            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl 
                                font-bold hover:bg-white/20 transition-all border border-white/20"
                        >
                            <X className="w-5 h-5 inline-block ml-2" />
                            إلغاء
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-brand-primary 
                                rounded-xl font-bold hover:bg-white/90 transition-all
                                shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {saving ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3">
                <TabButton
                    active={activeTab === 'basic'}
                    onClick={() => setActiveTab('basic')}
                    icon={Building2}
                    label="البيانات الأساسية"
                />
                <TabButton
                    active={activeTab === 'contact'}
                    onClick={() => setActiveTab('contact')}
                    icon={MapPin}
                    label="التواصل والعناوين"
                />
                <TabButton
                    active={activeTab === 'financial'}
                    onClick={() => setActiveTab('financial')}
                    icon={DollarSign}
                    label="البيانات المالية"
                    badge={supplierBanks.length}
                />
                {isEdit && (
                    <TabButton
                        active={activeTab === 'items'}
                        onClick={() => setActiveTab('items')}
                        icon={Package}
                        label="المنتجات الموردة"
                        badge={supplierItems.length}
                    />
                )}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
                {activeTab === 'basic' && (
                    <SectionCard title="البيانات الأساسية" icon={Info}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="اسم المورد (بالعربي)"
                                value={formData.supplierNameAr}
                                onChange={(v) => handleChange('supplierNameAr', v)}
                                icon={Building2}
                                placeholder="شركة المثال للصناعة"
                                required
                            />
                            <FormInput
                                label="اسم المورد (English)"
                                value={formData.supplierNameEn || ''}
                                onChange={(v) => handleChange('supplierNameEn', v)}
                                icon={Globe}
                                placeholder="Example Industry Co."
                                dir="ltr"
                            />
                            <FormSelect
                                label="نوع المورد"
                                value={formData.supplierType || 'Local'}
                                onChange={(v) => handleChange('supplierType', v)}
                                icon={Layers}
                                options={supplierTypeOptions}
                            />
                            <FormInput
                                label="السجل التجاري"
                                value={formData.commercialRegNo || ''}
                                onChange={(v) => handleChange('commercialRegNo', v)}
                                icon={FileText}
                                placeholder="123456"
                            />
                            <FormInput
                                label="رقم التسجيل الضريبي"
                                value={formData.taxRegistrationNo || ''}
                                onChange={(v) => handleChange('taxRegistrationNo', v)}
                                icon={ShieldCheck}
                                placeholder="987-654-321"
                            />
                            <div className="flex items-end">
                                <ToggleCard
                                    label="المورد نشط في النظام"
                                    checked={formData.isActive || false}
                                    onChange={(v) => handleChange('isActive', v)}
                                    icon={CheckCircle2}
                                    activeColor="emerald"
                                />
                            </div>
                        </div>
                    </SectionCard>
                )}

                {activeTab === 'contact' && (
                    <SectionCard title="معلومات التواصل" icon={Phone}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="مسئول الاتصال"
                                value={formData.contactPerson || ''}
                                onChange={(v) => handleChange('contactPerson', v)}
                                icon={User}
                                placeholder="الاسم الكامل"
                            />
                            <FormInput
                                label="هاتف المسئول"
                                value={formData.contactPhone || ''}
                                onChange={(v) => handleChange('contactPhone', v)}
                                icon={Phone}
                                placeholder="+20 xxx xxx xxxx"
                            />
                            <FormInput
                                label="البريد الإلكتروني"
                                value={formData.email || ''}
                                onChange={(v) => handleChange('email', v)}
                                icon={Mail}
                                placeholder="info@company.com"
                                type="email"
                            />
                            <FormInput
                                label="الهاتف الأرضي / الفاكس"
                                value={formData.phone || ''}
                                onChange={(v) => handleChange('phone', v)}
                                icon={Phone}
                            />
                            <div className="md:col-span-2">
                                <FormTextarea
                                    label="العنوان الكامل"
                                    value={formData.address || ''}
                                    onChange={(v) => handleChange('address', v)}
                                    icon={MapPin}
                                    rows={3}
                                />
                            </div>
                            <FormInput
                                label="المدينة"
                                value={formData.city || ''}
                                onChange={(v) => handleChange('city', v)}
                                icon={MapPin}
                            />
                            <FormInput
                                label="الدولة"
                                value={formData.country || ''}
                                onChange={(v) => handleChange('country', v)}
                                icon={Globe}
                            />
                        </div>
                    </SectionCard>
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-6">
                        <SectionCard title="الشروط المالية" icon={DollarSign}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormSelect
                                    label="العملة الافتراضية"
                                    value={formData.currency || 'EGP'}
                                    onChange={(v) => handleChange('currency', v)}
                                    icon={DollarSign}
                                    options={currencyOptions}
                                />
                                <FormInput
                                    label="شروط الدفع (أيام)"
                                    value={formData.paymentTermDays || 0}
                                    onChange={(v) => handleChange('paymentTermDays', parseInt(v) || 0)}
                                    icon={Calendar}
                                    type="number"
                                    hint="عدد أيام السماح للدفع"
                                />
                                <FormSelect
                                    label="تصنيف المورد"
                                    value={formData.rating || 'B'}
                                    onChange={(v) => handleChange('rating', v)}
                                    icon={Star}
                                    options={ratingOptions}
                                />
                            </div>

                            <div className="pt-4">
                                <ToggleCard
                                    label="مورد معتمد رسمياً"
                                    description="تم التحقق من بيانات المورد واعتماده"
                                    checked={formData.isApproved || false}
                                    onChange={(v) => handleChange('isApproved', v)}
                                    icon={BadgeCheck}
                                    activeColor="blue"
                                />
                            </div>
                        </SectionCard>

                        {/* Banks Section */}
                        {isEdit && (
                            <SectionCard
                                title="الحسابات البنكية"
                                icon={Landmark}
                                action={
                                    <button
                                        type="button"
                                        onClick={() => setIsBankModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                                            rounded-xl font-bold hover:bg-blue-700 transition-all 
                                            shadow-lg shadow-blue-600/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        إضافة حساب
                                    </button>
                                }
                            >
                                {loadingBanks ? (
                                    <div className="text-center py-8 text-slate-400">
                                        <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                                        جاري تحميل الحسابات...
                                    </div>
                                ) : supplierBanks.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <Landmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">لا يوجد حسابات بنكية مسجلة</p>
                                        <p className="text-slate-400 text-sm mt-1">أضف حسابات بنكية لتسهيل عمليات الدفع</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {supplierBanks.map(bank => (
                                            <BankCard
                                                key={bank.id}
                                                bank={bank}
                                                onRemove={() => handleRemoveBank(bank.id!)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        )}
                    </div>
                )}

                {activeTab === 'items' && (
                    <SectionCard
                        title="قائمة الأصناف الموردة"
                        icon={Package}
                        action={
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary 
                                    rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                إضافة صنف
                            </button>
                        }
                    >
                        {loadingItems ? (
                            <div className="text-center py-8 text-slate-400">
                                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                                جاري تحميل الأصناف...
                            </div>
                        ) : supplierItems.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 font-bold text-lg">لا توجد أصناف مرتبطة</p>
                                <p className="text-slate-400 text-sm mt-1 mb-6">
                                    اربط المورد بالأصناف التي يوفرها لتسهيل عمليات الشراء
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white 
                                        rounded-xl font-bold hover:bg-brand-primary/90 transition-all
                                        shadow-lg shadow-brand-primary/30"
                                >
                                    <Plus className="w-5 h-5" />
                                    ربط صنف الآن
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-hidden border border-slate-100 rounded-2xl">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-4 text-right text-sm font-semibold text-slate-700">الصنف</th>
                                            <th className="p-4 text-right text-sm font-semibold text-slate-700">كود المورد</th>
                                            <th className="p-4 text-right text-sm font-semibold text-slate-700">آخر سعر</th>
                                            <th className="p-4 text-right text-sm font-semibold text-slate-700">فترة التوريد</th>
                                            <th className="p-4 text-right text-sm font-semibold text-slate-700">مفضل</th>
                                            <th className="p-4 text-center text-sm font-semibold text-slate-700">-</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supplierItems.map((item, index) => (
                                            <ItemRow
                                                key={item.id}
                                                item={item}
                                                currency={formData.currency || 'EGP'}
                                                onUnlink={() => handleUnlinkItem(item.id!)}
                                                index={index}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>
                )}

                {/* Notes Section */}
                <div className="mt-6">
                    <SectionCard title="ملاحظات إضافية" icon={FileText}>
                        <FormTextarea
                            label=""
                            value={formData.notes || ''}
                            onChange={(v) => handleChange('notes', v)}
                            placeholder="أي ملاحظات أو معلومات إضافية عن المورد..."
                            rows={3}
                        />
                    </SectionCard>
                </div>
            </form>

            {/* Link Item Modal */}
            <Modal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                title="ربط صنف جديد بالمورد"
                icon={Package}
                footer={
                    <>
                        <button
                            onClick={() => setIsLinkModalOpen(false)}
                            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleLinkItem}
                            className="flex-[2] py-3 bg-brand-primary text-white rounded-xl font-bold 
                                shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all"
                        >
                            ربط الآن
                        </button>
                    </>
                }
            >
                <div className="space-y-5">
                    <FormSelect
                        label="اختر الصنف"
                        value={linkData.itemId || 0}
                        onChange={(v) => setLinkData({ ...linkData, itemId: parseInt(v) })}
                        icon={Package}
                        options={[{ value: 0, label: 'اختر من القائمة...' }, ...itemOptions]}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="كود الصنف عند المورد"
                            value={linkData.supplierItemCode || ''}
                            onChange={(v) => setLinkData({ ...linkData, supplierItemCode: v })}
                            icon={Tag}
                        />
                        <FormInput
                            label="السعر المعروض"
                            value={linkData.lastPrice || ''}
                            onChange={(v) => setLinkData({ ...linkData, lastPrice: parseFloat(v) || 0 })}
                            icon={DollarSign}
                            type="number"
                        />
                        <FormInput
                            label="فترة التوريد (أيام)"
                            value={linkData.leadTimeDays || ''}
                            onChange={(v) => setLinkData({ ...linkData, leadTimeDays: parseInt(v) || 0 })}
                            icon={Clock}
                            type="number"
                        />
                        <div className="flex items-end">
                            <ToggleCard
                                label="صنف مفضل"
                                checked={linkData.isPreferred || false}
                                onChange={(v) => setLinkData({ ...linkData, isPreferred: v })}
                                icon={Star}
                                activeColor="amber"
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Bank Modal */}
            <Modal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                title="إضافة حساب بنكي جديد"
                icon={Landmark}
                headerColor="bg-blue-600"
                footer={
                    <>
                        <button
                            onClick={() => setIsBankModalOpen(false)}
                            className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleAddBank}
                            className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold 
                                shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                        >
                            حفظ الحساب
                        </button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="اسم البنك"
                            value={bankData.bankName || ''}
                            onChange={(v) => setBankData({ ...bankData, bankName: v })}
                            icon={Landmark}
                            placeholder="البنك الأهلي المصري"
                            required
                        />
                        <FormInput
                            label="رقم الحساب"
                            value={bankData.bankAccountNo || ''}
                            onChange={(v) => setBankData({ ...bankData, bankAccountNo: v })}
                            icon={Hash}
                            required
                        />
                        <FormInput
                            label="IBAN"
                            value={bankData.iban || ''}
                            onChange={(v) => setBankData({ ...bankData, iban: v })}
                            icon={CreditCard}
                        />
                        <FormInput
                            label="SWIFT Code"
                            value={bankData.swift || ''}
                            onChange={(v) => setBankData({ ...bankData, swift: v })}
                            icon={Globe}
                        />
                        <FormSelect
                            label="العملة"
                            value={bankData.currency || 'EGP'}
                            onChange={(v) => setBankData({ ...bankData, currency: v })}
                            icon={DollarSign}
                            options={currencyOptions}
                        />
                        <div className="flex items-end">
                            <ToggleCard
                                label="حساب افتراضي"
                                checked={bankData.isDefault || false}
                                onChange={(v) => setBankData({ ...bankData, isDefault: v })}
                                icon={CheckCircle2}
                                activeColor="blue"
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupplierFormPage;