import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Building2, Tag, Scale, Microscope, DollarSign,
    AlertTriangle, TrendingDown, Activity, ClipboardCheck,
    Zap, ChevronLeft, Warehouse, BarChart3, Calculator,
    FileDown, ArrowRightLeft, LogIn, LogOut
} from 'lucide-react';

// Card for each section
const SectionCard: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
    to: string;
    color?: 'primary' | 'emerald' | 'amber' | 'purple' | 'rose' | 'blue';
}> = ({ icon: Icon, title, description, to, color = 'primary' }) => {
    const nav = useNavigate();
    const colors = {
        primary: 'from-brand-primary/10 to-brand-primary/5 border-brand-primary/20 hover:border-brand-primary/40 text-brand-primary',
        emerald: 'from-emerald-50 to-white border-emerald-200/60 hover:border-emerald-400/60 text-emerald-700',
        amber: 'from-amber-50 to-white border-amber-200/60 hover:border-amber-400/60 text-amber-700',
        purple: 'from-purple-50 to-white border-purple-200/60 hover:border-purple-400/60 text-purple-700',
        rose: 'from-rose-50 to-white border-rose-200/60 hover:border-rose-400/60 text-rose-700',
        blue: 'from-blue-50 to-white border-blue-200/60 hover:border-blue-400/60 text-blue-700'
    };
    return (
        <button
            onClick={() => nav(to)}
            className={`w-full text-right p-6 rounded-2xl border-2 bg-gradient-to-br transition-all duration-300 
                hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] ${colors[color]}`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-white/80 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-400 shrink-0" />
            </div>
        </button>
    );
};

const InventorySectionsPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Warehouse className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">أقسام المخزن</h1>
                            <p className="text-white/80 text-lg">
                                وحدة إدارة الأصناف والمخزون، التقارير، والجرد
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* وحدة إدارة الأصناف والمخزون */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-primary/10">
                            <Package className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">وحدة إدارة الأصناف والمخزون</h2>
                            <p className="text-sm text-slate-500">بطاقة الصنف، المخازن، المواقع، والتقييم المزدوج</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SectionCard
                        icon={Package}
                        title="الأصناف"
                        description="بطاقة الصنف: كود، اسم الخامة والجريد، المواصفات، الوحدة، الحدود، متوسط الاستهلاك"
                        to="/dashboard/inventory/items"
                        color="primary"
                    />
                    <SectionCard
                        icon={Package}
                        title="إضافة صنف جديد"
                        description="كود داخلي، وحدة القياس، فئة الصنف، صور الصنف والعبوة"
                        to="/dashboard/inventory/items/new"
                        color="emerald"
                    />
                    <SectionCard
                        icon={Building2}
                        title="المستودعات"
                        description="مخازن متعددة (رئيسي، فرعي، عبور)، المواقع: صف، رف، وعاء، FIFO"
                        to="/dashboard/inventory/warehouses"
                        color="purple"
                    />
                    <SectionCard
                        icon={Tag}
                        title="تصنيفات الأصناف"
                        description="فئات: بولي بروبيلين، بولي إيثيلين، إلخ"
                        to="/dashboard/inventory/categories"
                        color="amber"
                    />
                    <SectionCard
                        icon={Scale}
                        title="وحدات القياس"
                        description="كجم، طن، وغيرها"
                        to="/dashboard/inventory/units"
                        color="blue"
                    />
                    <SectionCard
                        icon={Microscope}
                        title="معاملات الجودة"
                        description="المواصفات الفنية للأصناف"
                        to="/dashboard/inventory/quality-parameters"
                        color="emerald"
                    />
                    <SectionCard
                        icon={DollarSign}
                        title="قوائم الأسعار"
                        description="أسعار البيع والتكلفة"
                        to="/dashboard/inventory/price-lists"
                        color="primary"
                    />
                    <SectionCard
                        icon={Calculator}
                        title="تقييم المخزون المزدوج"
                        description="التكلفة التاريخية (محاسبة) + سعر الإحلال (قرارات). تنبيه عند فرق كبير"
                        to="/dashboard/inventory/reports/dual-valuation"
                        color="rose"
                    />
                </div>
            </div>

            {/* دورة المخزن: إضافة، صرف، تحويل */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-emerald-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100">
                            <LogIn className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">دورة المخزن</h2>
                            <p className="text-sm text-slate-500">إذن إضافة (GRN)، إذن صرف، وإذن تحويل بين مخازن</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SectionCard
                        icon={LogIn}
                        title="إذن إضافة (GRN)"
                        description="استلام مواد بعد موافقة الجودة وربطها بأمر الشراء"
                        to="/dashboard/inventory/grn"
                        color="emerald"
                    />
                    <SectionCard
                        icon={LogOut}
                        title="إذن صرف"
                        description="صرف مواد لأمر بيع، تشغيل، مشروع أو قسم داخلي"
                        to="/dashboard/inventory/issue"
                        color="amber"
                    />
                    <SectionCard
                        icon={ArrowRightLeft}
                        title="إذن تحويل بين مخازن"
                        description="تحويل صنف من مخزن إلى آخر"
                        to="/dashboard/inventory/transfer"
                        color="purple"
                    />
                </div>
            </div>

            {/* التقارير والجرد */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-100">
                            <BarChart3 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">التقارير والجرد</h2>
                            <p className="text-sm text-slate-500">تقارير الأصناف الراكدة، تحت الحد، حركة الصنف، وجرد دوري/مفاجئ</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SectionCard
                        icon={AlertTriangle}
                        title="الأصناف تحت الحد الأدنى"
                        description="تقارير الأصناف التي تحت الحد الأدنى للمخزون"
                        to="/dashboard/inventory/reports/below-min"
                        color="rose"
                    />
                    <SectionCard
                        icon={TrendingDown}
                        title="الأصناف الراكدة"
                        description="أصناف لم تتحرك منذ فترة (بطء دوران)"
                        to="/dashboard/inventory/reports/stagnant"
                        color="amber"
                    />
                    <SectionCard
                        icon={Activity}
                        title="حركة الصنف التفصيلية"
                        description="تقرير حركة صنف معين (دخول، خروج، رصيد)"
                        to="/dashboard/inventory/reports/movement"
                        color="blue"
                    />
                    <SectionCard
                        icon={ClipboardCheck}
                        title="جرد دوري"
                        description="جرد المخزون الدوري والمخطط"
                        to="/dashboard/inventory/count?type=periodic"
                        color="emerald"
                    />
                    <SectionCard
                        icon={Zap}
                        title="جرد مفاجئ"
                        description="جرد مفاجئ للتحقق من الرصيد الفعلي"
                        to="/dashboard/inventory/count?type=surprise"
                        color="purple"
                    />
                    <SectionCard
                        icon={FileDown}
                        title="تقرير المخزون الدوري"
                        description="رصيد أول/آخر المدة، الإضافات، المصروفات، والأصناف تحت الحد"
                        to="/dashboard/inventory/reports/periodic-inventory"
                        color="blue"
                    />
                    <SectionCard
                        icon={BarChart3}
                        title="تقرير الفروقات"
                        description="فروقات الجرد: الرصيد النظري مقابل الفعلي والأسباب"
                        to="/dashboard/inventory/reports/variance"
                        color="rose"
                    />
                </div>
            </div>
        </div>
    );
};

export default InventorySectionsPage;
