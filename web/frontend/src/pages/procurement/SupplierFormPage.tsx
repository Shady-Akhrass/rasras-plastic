import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Building2,
    DollarSign,
    MapPin,
    Phone,
    Mail,
    FileText,
    Globe,
    CreditCard,
    ShieldCheck,
    Package,
    Trash2,
    Plus,
    X,
    RefreshCw,        // أضف هذا السطر
    CheckCircle2      // كان موجودًا أصلًا
} from 'lucide-react';
import { supplierService, type SupplierDto, type SupplierItemDto, type SupplierBankDto } from '../../services/supplierService';
import { itemService, type ItemDto } from '../../services/itemService';
import { toast } from 'react-hot-toast';

type Tab = 'basic' | 'financial' | 'contact' | 'items';

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
                toast.success('تمت تحديث بيانات المورد بنجاح');
            } else {
                await supplierService.createSupplier(formData);
                toast.success('تمت إضافة المورد بنجاح');
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
            toast.success('تم ربط الصنف بنجاح');
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
            toast.success('تمت إضافة الحساب البنكي');
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
            toast.success('تم إرسال طلب الاعتماد بنجاح');
            loadSupplier(parseInt(id!));
        } catch (error) {
            console.error('Failed to submit for approval:', error);
            toast.error('فشل في إرسال طلب الاعتماد');
        } finally {
            setSaving(false);
        }
    };

    const TabButton: React.FC<{ tab: Tab; label: string; icon: React.ElementType }> = ({ tab, label, icon: Icon }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200
                ${activeTab === tab
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 scale-105'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    if (loading) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

    const statusConfig = {
        DRAFT: { label: 'مسودة', class: 'bg-slate-100 text-slate-600', icon: FileText },
        PENDING: { label: 'قيد المراجعة', class: 'bg-amber-100 text-amber-700', icon: RefreshCw },
        APPROVED: { label: 'معتمد', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
        REJECTED: { label: 'مرفوض', class: 'bg-rose-100 text-rose-700', icon: X }
    };
    const currentStatus = statusConfig[formData.status] || statusConfig.DRAFT;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Approval Banner */}
            {formData.status === 'REJECTED' && (
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl text-rose-600">
                        <X className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-rose-800">تم رفض طلب اعتماد المورد</h4>
                        <p className="text-rose-600 text-sm mt-1">{formData.approvalNotes || 'لم يتم ذكر أسباب للرفض'}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/procurement/suppliers')}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-800">
                                {isEdit ? `تعديل المورد: ${formData.supplierNameAr}` : 'إضافة مورد جديد'}
                            </h1>
                            {isEdit && (
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${currentStatus.class}`}>
                                    <currentStatus.icon className="w-3 h-3" />
                                    {currentStatus.label}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm">أدخل البيانات الأساسية والمالية للمورد</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEdit && formData.status === 'DRAFT' && (
                        <button
                            type="button"
                            onClick={handleSubmitForApproval}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                        >
                            إرسال للاعتماد
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/procurement/suppliers')}
                        className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white rounded-xl 
                            font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ البيانات'}</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4">
                <TabButton tab="basic" label="البيانات الأساسية" icon={Building2} />
                <TabButton tab="contact" label="التواصل والعناوين" icon={MapPin} />
                <TabButton tab="financial" label="البيانات المالية" icon={DollarSign} />
                {isEdit && <TabButton tab="items" label="المنتجات الموردة" icon={Package} />}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                {activeTab === 'basic' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">اسم المورد (بالعربي) *</label>
                            <div className="relative">
                                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.supplierNameAr}
                                    onChange={(e) => handleChange('supplierNameAr', e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                    placeholder="شركة المثال للصناعة"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">اسم المورد (English)</label>
                            <div className="relative">
                                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.supplierNameEn || ''}
                                    onChange={(e) => handleChange('supplierNameEn', e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                    placeholder="Example Industry Co."
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">نوع المورد</label>
                            <select
                                value={formData.supplierType}
                                onChange={(e) => handleChange('supplierType', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            >
                                <option value="Local">محلـي</option>
                                <option value="International">دولـي</option>
                                <option value="Service">خدمي</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">السجل التجاري</label>
                            <div className="relative">
                                <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.commercialRegNo || ''}
                                    onChange={(e) => handleChange('commercialRegNo', e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                    placeholder="123456"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">رقم التسجيل الضريبي</label>
                            <div className="relative">
                                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.taxRegistrationNo || ''}
                                    onChange={(e) => handleChange('taxRegistrationNo', e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                    placeholder="987-654-321"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 flex items-end pb-2">
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100 w-full hover:bg-slate-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                    className="w-5 h-5 accent-brand-primary"
                                />
                                <span className="font-bold text-slate-700">المورد نشط في النظام</span>
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">مسئول الاتصال</label>
                            <input
                                type="text"
                                value={formData.contactPerson || ''}
                                onChange={(e) => handleChange('contactPerson', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                placeholder="الاسم الكامل"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">هاتف المسئول</label>
                            <div className="relative" dir="ltr">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.contactPhone || ''}
                                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                                    className="w-full pr-4 pl-12 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all text-right"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                    placeholder="info@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">الهاتف الأرضي / الفاكس</label>
                            <input
                                type="text"
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">العنوان الكامل</label>
                            <textarea
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">المدينة</label>
                            <input
                                type="text"
                                value={formData.city || ''}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 block">الدولة</label>
                            <input
                                type="text"
                                value={formData.country || ''}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 block">العملة الافتراضية</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => handleChange('currency', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                >
                                    <option value="EGP">EGP - جنيـه مصـري</option>
                                    <option value="USD">USD - دولار أمريكي</option>
                                    <option value="EUR">EUR - يورو</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 block">شروط الدفع (أيام)</label>
                                <input
                                    type="number"
                                    value={formData.paymentTermDays}
                                    onChange={(e) => handleChange('paymentTermDays', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 block">حد الائتمان</label>
                                <div className="relative">
                                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="number"
                                        value={formData.creditLimit}
                                        onChange={(e) => handleChange('creditLimit', parseFloat(e.target.value))}
                                        className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 block">تصنيف المورد</label>
                                <select
                                    value={formData.rating}
                                    onChange={(e) => handleChange('rating', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                >
                                    <option value="A">Class A (ممتاز)</option>
                                    <option value="B">Class B (جيد)</option>
                                    <option value="C">Class C (متوسط)</option>
                                    <option value="D">Class D (خطورة)</option>
                                </select>
                            </div>
                        </div>

                        {/* Banks Section */}
                        {isEdit && (
                            <div className="pt-8 border-t border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">الحسابات البنكية للمورد</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsBankModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>إضافة حساب</span>
                                    </button>
                                </div>

                                {loadingBanks ? (
                                    <div className="text-center py-4 text-slate-400 italic">جاري تحميل الحسابات...</div>
                                ) : supplierBanks.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-400">لا يوجد حسابات بنكية مسجلة</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {supplierBanks.map(bank => (
                                            <div key={bank.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                                            {bank.bankName}
                                                            {bank.isDefault && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 rounded">افتراضي</span>}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-mono italic">{bank.bankAccountNo}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBank(bank.id!)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-8 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer p-4 bg-blue-50 rounded-xl border border-blue-100 w-fit hover:bg-blue-100 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.isApproved}
                                    onChange={(e) => handleChange('isApproved', e.target.checked)}
                                    className="w-5 h-5 accent-blue-600"
                                />
                                <span className="font-bold text-blue-700">مورد معتمد رسمياً</span>
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">قائمة الأصناف الموردة</h3>
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>إضافة صنف</span>
                            </button>
                        </div>

                        {loadingItems ? (
                            <div className="py-10 text-center text-slate-500 italic">جاري تحميل الأصناف...</div>
                        ) : supplierItems.length === 0 ? (
                            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold text-lg">لا توجد أصناف مرتبطة بهذا المورد حالياً</p>
                                <p className="text-slate-400 text-sm">اربط المورد بالأصناف التي يوفرها لتسهيل عمليات الشراء</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden border border-slate-100 rounded-2xl">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="p-4 font-bold text-slate-600 border-b border-slate-100">الصنف</th>
                                            <th className="p-4 font-bold text-slate-600 border-b border-slate-100">كود المورد</th>
                                            <th className="p-4 font-bold text-slate-600 border-b border-slate-100">آخر سعر</th>
                                            <th className="p-4 font-bold text-slate-600 border-b border-slate-100">فترة التوريد</th>
                                            <th className="p-4 font-bold text-slate-600 border-b border-slate-100">مفضل</th>
                                            <th className="p-4 font-bold text-slate-600 border-b border-slate-100 italic">-</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {supplierItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-800">{item.itemNameAr}</div>
                                                    <div className="text-xs text-slate-400 font-mono italic">{item.itemCode}</div>
                                                </td>
                                                <td className="p-4 text-slate-600 font-mono">{item.supplierItemCode || '-'}</td>
                                                <td className="p-4 font-bold text-slate-700">{item.lastPrice?.toLocaleString()} {formData.currency}</td>
                                                <td className="p-4 text-slate-600">{item.leadTimeDays} يوم</td>
                                                <td className="p-4">
                                                    {item.isPreferred && (
                                                        <span className="p-1 px-2.5 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-bold">مفضل</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUnlinkItem(item.id!)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="إلغاء الربط"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-slate-50">
                    <label className="text-sm font-bold text-slate-700 block mb-3">ملاحظات إضافية</label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                        rows={3}
                        placeholder="..."
                    />
                </div>
            </form>

            {/* Link Item Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">ربط صنف جديد بالمورد</h3>
                            <button onClick={() => setIsLinkModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">اختر الصنف *</label>
                                <select
                                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none font-bold"
                                    value={linkData.itemId}
                                    onChange={(e) => setLinkData({ ...linkData, itemId: parseInt(e.target.value) })}
                                >
                                    <option value={0}>إختر من القائمة...</option>
                                    {availableItems.map(i => (
                                        <option key={i.id} value={i.id}>{i.itemNameAr} ({i.itemCode})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">كود الصنف عند المورد</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none font-mono"
                                        value={linkData.supplierItemCode}
                                        onChange={(e) => setLinkData({ ...linkData, supplierItemCode: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">السعر المعروض</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none"
                                        value={linkData.lastPrice}
                                        onChange={(e) => setLinkData({ ...linkData, lastPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">فترة التوريد المتوقعة (أيام)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none"
                                        value={linkData.leadTimeDays}
                                        onChange={(e) => setLinkData({ ...linkData, leadTimeDays: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-brand-primary rounded"
                                            checked={linkData.isPreferred}
                                            onChange={(e) => setLinkData({ ...linkData, isPreferred: e.target.checked })}
                                        />
                                        <span className="font-bold text-slate-700">صنف مفضل من هذا المورد</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                            <button
                                onClick={() => setIsLinkModalOpen(false)}
                                className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleLinkItem}
                                className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                            >
                                ربط الآن
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Modal */}
            {isBankModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50">
                            <h3 className="text-xl font-bold text-slate-800">إضافة حساب بنكي جديد</h3>
                            <button onClick={() => setIsBankModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">اسم البنك *</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none"
                                        value={bankData.bankName}
                                        onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                                        placeholder="مثال: البنك الأهلي المصري"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">رقم الحساب *</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none font-mono"
                                        value={bankData.bankAccountNo}
                                        onChange={(e) => setBankData({ ...bankData, bankAccountNo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">IBAN</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none font-mono"
                                        value={bankData.iban}
                                        onChange={(e) => setBankData({ ...bankData, iban: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">SWIFT Code</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none font-mono"
                                        value={bankData.swift}
                                        onChange={(e) => setBankData({ ...bankData, swift: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-600">العملة</label>
                                    <select
                                        className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none"
                                        value={bankData.currency}
                                        onChange={(e) => setBankData({ ...bankData, currency: e.target.value })}
                                    >
                                        <option value="EGP">EGP</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-blue-600 rounded"
                                            checked={bankData.isDefault}
                                            onChange={(e) => setBankData({ ...bankData, isDefault: e.target.checked })}
                                        />
                                        <span className="font-bold text-slate-700">حساب افتراضي</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                            <button
                                onClick={() => setIsBankModalOpen(false)}
                                className="flex-1 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAddBank}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"
                            >
                                حفظ الحساب
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierFormPage;

