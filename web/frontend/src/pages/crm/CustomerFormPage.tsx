import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronRight, Save, Users, DollarSign,
    Settings, RefreshCw,
    Building2, MapPin, Phone, Mail, Globe,
    CreditCard, Percent, FileText, Trash2, Plus, User, Tag
} from 'lucide-react';
import customerService, { type Customer, type CustomerContact } from '../../services/customerService';
import userService from '../../services/userService';
import { priceListService } from '../../services/priceListService';
import { toast } from 'react-hot-toast';

// Reusable Form Components (Local for now to match project style)
const FormInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    placeholder?: string;
    required?: boolean;
    type?: string;
    dir?: string;
    disabled?: boolean;
}> = ({ label, value, onChange, icon: Icon, placeholder, required, type = 'text', dir, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div className="space-y-2">
            <label className={`block text-sm font-semibold transition-colors
                ${isFocused ? 'text-brand-primary' : 'text-slate-700'}`}>
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
                {Icon && <Icon className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all
                    ${isFocused ? 'text-brand-primary scale-110' : 'text-slate-400'}`} />}
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    dir={dir}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none bg-slate-50
                        ${Icon ? 'pr-12' : ''}
                        ${isFocused ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10' : 'border-transparent hover:border-slate-200'}`}
                />
            </div>
        </div>
    );
};

const FormSelect: React.FC<{
    label: string;
    value: number | string;
    onChange: (value: string) => void;
    options: { value: number | string; label: string }[];
    icon?: React.ElementType;
    required?: boolean;
}> = ({ label, value, onChange, options, icon: Icon, required }) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
            {Icon && <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className={`w-full px-4 py-3 rounded-xl border-2 border-transparent bg-slate-50 transition-all outline-none appearance-none cursor-pointer
                    ${Icon ? 'pr-12' : ''} hover:border-slate-200 focus:border-brand-primary focus:bg-white`}
            >
                <option value="">اختر...</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronRight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
        </div>
    </div>
);

const FormSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const CustomerFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id && id !== 'new');

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [salesReps, setSalesReps] = useState<{ value: number; label: string }[]>([]);
    const [priceLists, setPriceLists] = useState<{ value: number; label: string }[]>([]);
    const [activeTab, setActiveTab] = useState<'basic' | 'financial' | 'contacts' | 'notes'>('basic');

    const [formData, setFormData] = useState<Customer>({
        customerCode: '',
        customerNameAr: '',
        customerNameEn: '',
        customerType: 'COMPANY',
        customerClass: 'C',
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
        currentBalance: 0,
        currency: 'EGP',
        salesRepId: undefined,
        priceListId: undefined,
        discountPercentage: 0,
        isActive: true,
        notes: '',
        contacts: []
    });

    useEffect(() => {
        fetchMetadata();
        if (isEdit) fetchCustomer();
        else setInitialLoading(false);
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const [users, plists] = await Promise.all([
                userService.getAll(),
                priceListService.getAllPriceLists()
            ]);
            setSalesReps((users || []).map((u: any) => ({
                value: u.userId,
                label: u.username
            })));
            setPriceLists(plists.data.map((p: any) => ({ value: p.id!, label: p.listNameAr })));
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const fetchCustomer = async () => {
        try {
            const data = await customerService.getCustomerById(Number(id));
            setFormData(data);
        } catch (error) {
            toast.error('فشل في تحميل بيانات العميل');
            navigate('/dashboard/crm/customers');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await customerService.updateCustomer(Number(id), formData);
                toast.success('تم تحديث بيانات العميل بنجاح');
            } else {
                await customerService.createCustomer(formData);
                toast.success('تم إضافة العميل بنجاح');
            }
            navigate('/dashboard/crm/customers');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'فشل في حفظ البيانات');
        } finally {
            setLoading(false);
        }
    };

    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [...(prev.contacts || []), { contactName: '', isPrimary: false, isActive: true }]
        }));
    };

    const removeContact = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts?.filter((_, i) => i !== index)
        }));
    };

    const updateContact = (index: number, field: keyof CustomerContact, value: any) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts?.map((c, i) => i === index ? { ...c, [field]: value } : c)
        }));
    };

    if (initialLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">جاري تحميل البيانات...</p>
        </div>
    );

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate('/dashboard/crm/customers')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'}</h1>
                        <p className="text-sm text-slate-500">{formData.customerNameAr || 'بيانات العميل'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate('/dashboard/crm/customers')} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all">إلغاء</button>
                    <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isEdit ? 'حفظ التغييرات' : 'إضافة العميل'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                {[
                    { id: 'basic', label: 'البيانات الأساسية', icon: Building2 },
                    { id: 'financial', label: 'البيانات المالية', icon: CreditCard },
                    { id: 'contacts', label: 'مسؤولي التواصل', icon: Users },
                    { id: 'notes', label: 'ملاحظات إضافية', icon: FileText },
                ].map(tab => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                        ${activeTab === tab.id ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Secret Content */}
            <div className="space-y-6">
                {activeTab === 'basic' && (
                    <FormSection title="المعلومات التنظيمية" icon={Building2}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="كود العميل" value={formData.customerCode} onChange={v => setFormData({ ...formData, customerCode: v })} required icon={FileText} />
                            <FormInput label="الاسم بالعربية" value={formData.customerNameAr} onChange={v => setFormData({ ...formData, customerNameAr: v })} required icon={Building2} />
                            <FormInput label="الاسم بالإنجليزية" value={formData.customerNameEn || ''} onChange={v => setFormData({ ...formData, customerNameEn: v })} icon={Globe} dir="ltr" />
                            <FormSelect label="نوع العميل" value={formData.customerType || ''} onChange={v => setFormData({ ...formData, customerType: v })} options={[{ value: 'COMPANY', label: 'شركة' }, { value: 'INDIVIDUAL', label: 'فرد' }]} icon={Users} />
                            <FormSelect label="فئة العميل" value={formData.customerClass || ''} onChange={v => setFormData({ ...formData, customerClass: v })} options={[{ value: 'A', label: 'فئة A' }, { value: 'B', label: 'فئة B' }, { value: 'C', label: 'فئة C' }]} icon={Tag} />
                            <FormInput label="الرقم الضريبي" value={formData.taxRegistrationNo || ''} onChange={v => setFormData({ ...formData, taxRegistrationNo: v })} icon={FileText} />
                            <FormInput label="السجل التجاري" value={formData.commercialRegNo || ''} onChange={v => setFormData({ ...formData, commercialRegNo: v })} icon={FileText} />
                            <FormInput label="المدينة" value={formData.city || ''} onChange={v => setFormData({ ...formData, city: v })} icon={MapPin} />
                            <FormInput label="العنوان" value={formData.address || ''} onChange={v => setFormData({ ...formData, address: v })} icon={MapPin} />
                            <FormInput label="الهاتف" value={formData.phone || ''} onChange={v => setFormData({ ...formData, phone: v })} icon={Phone} />
                            <FormInput label="البريد الإلكتروني" value={formData.email || ''} onChange={v => setFormData({ ...formData, email: v })} icon={Mail} />
                            <FormInput label="الموقع الإلكتروني" value={formData.website || ''} onChange={v => setFormData({ ...formData, website: v })} icon={Globe} />
                        </div>
                    </FormSection>
                )}

                {activeTab === 'financial' && (
                    <FormSection title="الإعدادات المالية" icon={CreditCard}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="حد الائتمان" type="number" value={formData.creditLimit || 0} onChange={v => setFormData({ ...formData, creditLimit: Number(v) })} icon={DollarSign} />
                            <FormInput label="فترة السداد (أيام)" type="number" value={formData.paymentTermDays || 0} onChange={v => setFormData({ ...formData, paymentTermDays: Number(v) })} icon={Settings} />
                            <FormSelect label="العملة" value={formData.currency || 'EGP'} onChange={v => setFormData({ ...formData, currency: v })} options={[{ value: 'EGP', label: 'جنيه مصري' }, { value: 'USD', label: 'دولار أمريكي' }, { value: 'EUR', label: 'يورو' }]} icon={DollarSign} />
                            <FormSelect label="قائمة الأسعار" value={formData.priceListId || ''} onChange={v => setFormData({ ...formData, priceListId: Number(v) })} options={priceLists} icon={FileText} />
                            <FormSelect label="مسؤول المبيعات" value={formData.salesRepId || ''} onChange={v => setFormData({ ...formData, salesRepId: Number(v) })} options={salesReps} icon={User} />
                            <FormInput label="نسبة الخصم تعاقدي (%)" type="number" value={formData.discountPercentage || 0} onChange={v => setFormData({ ...formData, discountPercentage: Number(v) })} icon={Percent} />
                        </div>
                    </FormSection>
                )}

                {activeTab === 'contacts' && (
                    <FormSection title="مسؤولي التواصل" icon={Users}>
                        <div className="space-y-4">
                            {(formData.contacts || []).map((contact, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 relative group">
                                    <FormInput label="الاسم الكامل" value={contact.contactName} onChange={v => updateContact(idx, 'contactName', v)} required />
                                    <FormInput label="المسمى الوظيفي" value={contact.jobTitle || ''} onChange={v => updateContact(idx, 'jobTitle', v)} />
                                    <FormInput label="الهاتف / موبايل" value={contact.mobile || ''} onChange={v => updateContact(idx, 'mobile', v)} />
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <FormInput label="البريد الإلكتروني" value={contact.email || ''} onChange={v => updateContact(idx, 'email', v)} />
                                        </div>
                                        <button type="button" onClick={() => removeContact(idx)} className="p-3 text-rose-500 bg-white border border-slate-200 rounded-xl hover:bg-rose-50 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="md:col-span-4 flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={contact.isPrimary} onChange={e => updateContact(idx, 'isPrimary', e.target.checked)} className="w-4 h-4 text-brand-primary" />
                                            <span className="text-sm font-medium text-slate-700 font-bold">جهة الاتصال الرئيسية</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addContact} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2 font-bold group">
                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                إضافة مسؤول تواصل جديد
                            </button>
                        </div>
                    </FormSection>
                )}

                {activeTab === 'notes' && (
                    <FormSection title="ملاحظات إضافية" icon={FileText}>
                        <textarea value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="اكتب أي ملاحظات إضافية عن العميل هنا..." className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-xl focus:border-brand-primary focus:bg-white outline-none min-h-[200px] transition-all" />
                    </FormSection>
                )}
            </div>
        </form>
    );
};

export default CustomerFormPage;
