import React, { useState } from 'react';
import {
    Building2, Settings, Ruler, FileText,
    Sparkles, Shield, Bell, Database, Users, Lock,
    Palette, Globe, CreditCard, Layers, ArrowRight,
    CheckCircle2, Clock, TrendingUp, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsModule {
    title: string;
    description: string;
    icon: React.ElementType;
    path: string;
    badge?: string;
    status?: 'complete' | 'pending' | 'new';
}

// Animated Card Component
const SettingsCard: React.FC<{
    module: SettingsModule;
    index: number;
    onClick: () => void;
}> = ({ module, index, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getStatusBadge = () => {
        switch (module.status) {
            case 'complete':
                return (
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-emerald-100 text-emerald-700 
                        text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        مكتمل
                    </span>
                );
            case 'pending':
                return (
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-amber-100 text-amber-700 
                        text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        قيد الإعداد
                    </span>
                );
            case 'new':
                return (
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-brand-primary text-white 
                        text-xs font-medium rounded-full flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        جديد
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-white p-6 rounded-2xl border border-slate-200 
                hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/10 
                transition-all duration-300 text-right overflow-hidden
                hover:-translate-y-1"
            style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
            }}
        >
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent 
                transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

            {/* Decorative Corner */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 bg-brand-primary/5 rounded-full 
                transition-all duration-500 ${isHovered ? 'scale-150' : 'scale-100'}`} />

            {/* Status Badge */}
            {getStatusBadge()}

            {/* Content */}
            <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 
                    flex items-center justify-center mb-5 transition-all duration-300
                    ${isHovered ? 'scale-110 rotate-3 shadow-lg shadow-brand-primary/20' : ''}`}>
                    <module.icon className={`w-7 h-7 text-brand-primary transition-transform duration-300
                        ${isHovered ? 'scale-110' : ''}`} />
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-primary 
                    transition-colors duration-300">
                    {module.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    {module.description}
                </p>

                {/* Action Indicator */}
                <div className={`flex items-center gap-2 text-brand-primary text-sm font-medium
                    transition-all duration-300 ${isHovered ? 'translate-x-2' : ''}`}>
                    <span>فتح الإعدادات</span>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 rotate-180
                        ${isHovered ? '-translate-x-1' : ''}`} />
                </div>
            </div>

            {/* Bottom Border Animation */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
                from-brand-primary to-brand-primary/50 transition-transform duration-300 origin-right
                ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
        </button>
    );
};

// Quick Stat Card
const QuickStat: React.FC<{
    icon: React.ElementType;
    value: string;
    label: string;
    trend?: string;
}> = ({ icon: Icon, value, label, trend }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4
        hover:shadow-md transition-shadow duration-300">
        <div className="p-3 bg-brand-primary/10 rounded-xl">
            <Icon className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-800">{value}</span>
                {trend && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {trend}
                    </span>
                )}
            </div>
            <span className="text-sm text-slate-500">{label}</span>
        </div>
    </div>
);

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    const settingsModules: SettingsModule[] = [
        {
            title: 'بيانات الشركة',
            description: 'إدارة البيانات الأساسية للشركة، الشعار، ومعلومات التواصل',
            icon: Building2,
            path: '/dashboard/settings/company',
            status: 'complete'
        },
        {
            title: 'وحدات القياس',
            description: 'تعريف وإدارة وحدات القياس ومعاملات التحويل بينها',
            icon: Ruler,
            path: '/dashboard/settings/units',
            status: 'complete'
        },
        {
            title: 'إعدادات النظام',
            description: 'الإعدادات العامة، الخيارات المالية، وإعدادات المخزون',
            icon: Settings,
            path: '/dashboard/settings/system',
            status: 'pending'
        },
        {
            title: 'إدارة المستخدمين',
            description: 'إضافة المستخدمين وتجميد الحسابات',
            icon: Users,
            path: '/dashboard/settings/users',
            status: 'complete'
        },
        {
            title: 'الأدوار والصلاحيات',
            description: 'إدارة الأدوار الوظيفية وصلاحيات المستخدمين',
            icon: Shield,
            path: '/dashboard/settings/roles',
            status: 'new'
        },
        {
            title: 'سجل الصلاحيات',
            description: 'عرض كافة صلاحيات النظام وتفاصيلها',
            icon: Lock,
            path: '/dashboard/settings/permissions',
            status: 'complete'
        },
        {
            title: 'الأمان والخصوصية',
            description: 'إعدادات الأمان، كلمات المرور، والتحقق الثنائي',
            icon: Shield,
            path: '/dashboard/settings/security',
        },
        {
            title: 'الإشعارات',
            description: 'تخصيص الإشعارات والتنبيهات حسب احتياجاتك',
            icon: Bell,
            path: '/dashboard/settings/notifications',
        },
    ];

    return (
        <div className="space-y-8">
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
                <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Settings className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">الإعدادات</h1>
                            <p className="text-white/70 text-lg">تكوين وإدارة إعدادات النظام والشركة</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4">
                        <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl">
                            <div className="text-2xl font-bold">6</div>
                            <div className="text-sm text-white/70">أقسام</div>
                        </div>
                        <div className="text-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-xl">
                            <div className="text-2xl font-bold flex items-center gap-1">
                                85%
                                <TrendingUp className="w-4 h-4 text-emerald-300" />
                            </div>
                            <div className="text-sm text-white/70">مكتمل</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStat
                    icon={Building2}
                    value="1"
                    label="شركة نشطة"
                />
                <QuickStat
                    icon={Users}
                    value="5"
                    label="مستخدم"
                    trend="+2"
                />
                <QuickStat
                    icon={Ruler}
                    value="12"
                    label="وحدة قياس"
                />
                <QuickStat
                    icon={Shield}
                    value="عالي"
                    label="مستوى الأمان"
                />
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-brand-primary rounded-full" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">أقسام الإعدادات</h2>
                        <p className="text-sm text-slate-500">اختر القسم الذي تريد تعديله</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>نصيحة: أكمل إعدادات الشركة أولاً</span>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsModules.map((module, index) => (
                    <SettingsCard
                        key={module.path}
                        module={module}
                        index={index}
                        onClick={() => navigate(module.path)}
                    />
                ))}
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-white">
                        <h3 className="font-bold text-lg mb-1">هل تحتاج مساعدة؟</h3>
                        <p className="text-slate-400 text-sm">فريق الدعم متاح على مدار الساعة لمساعدتك</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl 
                        font-medium transition-colors duration-200 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        دليل الاستخدام
                    </button>
                    <button className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white 
                        rounded-xl font-medium transition-colors duration-200 shadow-lg shadow-brand-primary/30
                        flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        تواصل معنا
                    </button>
                </div>
            </div>

            {/* Additional Settings (Collapsed) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-primary" />
                    إعدادات متقدمة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Database, label: 'النسخ الاحتياطي', desc: 'إدارة النسخ الاحتياطية' },
                        { icon: Palette, label: 'المظهر', desc: 'تخصيص الألوان والثيم' },
                        { icon: Globe, label: 'اللغة والمنطقة', desc: 'إعدادات اللغة والتوقيت' },
                        { icon: CreditCard, label: 'الفوترة', desc: 'خطط الاشتراك والدفع' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className="p-4 rounded-xl border border-slate-100 hover:border-brand-primary/30 
                                hover:bg-brand-primary/5 transition-all duration-200 text-right group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-primary/10 
                                    transition-colors duration-200">
                                    <item.icon className="w-4 h-4 text-slate-600 group-hover:text-brand-primary 
                                        transition-colors duration-200" />
                                </div>
                                <span className="font-medium text-slate-700 group-hover:text-brand-primary 
                                    transition-colors duration-200">
                                    {item.label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 pr-11">{item.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;