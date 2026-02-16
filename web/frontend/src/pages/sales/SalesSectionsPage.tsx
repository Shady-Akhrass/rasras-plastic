import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, ShoppingCart, Truck, Receipt, Banknote,
    ChevronLeft, Tag, Percent, Package
} from 'lucide-react';

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
                <div className="p-3 rounded-xl bg-white/80 shadow-sm">
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

const SalesSectionsPage: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">دورة المبيعات</h1>
                            <p className="text-white/80 text-lg">
                                عرض السعر → أمر البيع → التوصيل → الفاتورة → التحصيل
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* دورة المبيعات */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-primary/10">
                            <Tag className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">دورة المبيعات</h2>
                            <p className="text-sm text-slate-500">عروض الأسعار، أوامر البيع، أوامر التوصيل، فواتير المبيعات، وإيصالات الدفع</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SectionCard
                        icon={Tag}
                        title="عروض الأسعار"
                        description="عرض سعر للعميل حسب لائحة الأسعار، صلاحية، شروط دفع"
                        to="/dashboard/sales/quotations"
                        color="blue"
                    />
                    <SectionCard
                        icon={FileText}
                        title="أوامر البيع"
                        description="أمر بيع (SO) من عرض السعر، عميل، بنود، خصم، ضريبة، تاريخ تسليم"
                        to="/dashboard/sales/orders"
                        color="emerald"
                    />
                    <SectionCard
                        icon={Package}
                        title="إذونات الصرف"
                        description="إذن صرف من المخزن بناءً على أمر البيع (SO)، اعتماد وتحديث المخزون"
                        to="/dashboard/sales/issue-notes"
                        color="amber"
                    />
                    <SectionCard
                        icon={Truck}
                        title="أوامر التوصيل"
                        description="أمر توصيل مرتبط بإذن الصرف، السائق والمركبة والتاريخ"
                        to="/dashboard/sales/delivery-orders"
                        color="amber"
                    />
                    <SectionCard
                        icon={Receipt}
                        title="فواتير المبيعات"
                        description="فاتورة من إذن صرف أو أمر بيع، ضرائب، مستحق ومدفوع"
                        to="/dashboard/sales/invoices"
                        color="purple"
                    />
                    <SectionCard
                        icon={Banknote}
                        title="إيصالات الدفع"
                        description="سند قبض: عميل، فاتورة، مبلغ، طريقة دفع (نقداً/شيك/تحويل/كمبيالة)"
                        to="/dashboard/sales/receipts"
                        color="rose"
                    />
                    <SectionCard
                        icon={Percent}
                        title="تقارير المبيعات"
                        description="تقرير المبيعات الشهري، التحصيل، الديون، التحصيل"
                        to="/dashboard/sales/reports"
                        color="primary"
                    />
                </div>
            </div>
        </div>
    );
};

export default SalesSectionsPage;
