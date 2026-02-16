import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    CheckCircle2,
    Search,
    ShoppingCart,
    PackageCheck,
    ShieldCheck,
    Clock,
    ChevronRight,
    FileText,
    Plus
} from 'lucide-react';
import { type PRLifecycle } from '../../services/purchaseService';

interface PRStep {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    status: 'Pending' | 'Completed' | 'Current' | 'None' | 'Rejected';
    details?: string;
}

interface PRLifecycleTrackerProps {
    lifecycle: PRLifecycle;
    prId?: number;
}

const PRLifecycleTracker: React.FC<PRLifecycleTrackerProps> = ({ lifecycle, prId }) => {
    const navigate = useNavigate();
    const receiving = lifecycle.receiving;
    const hasGrns = (receiving.grnNumbers?.length ?? 0) > 0;
    const grnIds = receiving.grnIds ?? [];
    const orderingApproved = lifecycle.ordering?.status === 'Approved';
    const sourcingCompleted = lifecycle.sourcing?.status === 'Completed';
    const needsCreatePO = sourcingCompleted && !orderingApproved;

    const steps: PRStep[] = [
        {
            id: 'requisition',
            label: 'الطلب',
            description: lifecycle.requisition.status === 'Draft' ? 'مسودة' : 'تم الإرسال',
            icon: ClipboardList,
            status: lifecycle.requisition.status === 'Draft' ? 'Current' : 'Completed',
            details: lifecycle.requisition.prNumber
        },
        {
            id: 'approval',
            label: 'الاعتماد',
            description: lifecycle.approval.currentStep || 'قيد الانتظار',
            icon: CheckCircle2,
            status: lifecycle.approval.status === 'Approved' ? 'Completed' :
                lifecycle.approval.status === 'Rejected' ? 'Rejected' :
                    lifecycle.requisition.status !== 'Draft' ? 'Current' : 'None',
            details: lifecycle.approval.status
        },
        {
            id: 'sourcing',
            label: 'التوريد',
            description: `${lifecycle.sourcing.rfqCount} عروض أسعار`,
            icon: Search,
            status: lifecycle.sourcing.status === 'Completed' ? 'Completed' :
                lifecycle.sourcing.status === 'In Progress' ? 'Current' : 'None',
            details: lifecycle.sourcing.comparisonStatus
        },
        {
            id: 'ordering',
            label: 'أمر الشراء',
            description: lifecycle.ordering.poNumbers.length > 0 ? `${lifecycle.ordering.poNumbers.length} أمر شراء` : 'لم يتم إنشاء أمر شراء',
            icon: ShoppingCart,
            status: lifecycle.ordering.status === 'Approved' ? 'Completed' :
                lifecycle.ordering.status === 'Pending' ? 'Current' : 'None',
            details: lifecycle.ordering.poNumbers.join(', ')
        },
        {
            id: 'receiving',
            label: 'الاستلام',
            description: hasGrns ? `تم استلام ${receiving.grnNumbers!.length} إذن إضافة` : 'بانتظار الاستلام',
            icon: PackageCheck,
            status: receiving.status === 'Completed' ? 'Completed' :
                receiving.status === 'In Progress' ? 'Current' : 'None',
            details: hasGrns ? (receiving.grnNumbers?.join(', ') ?? '') : ''
        },
        {
            id: 'quality',
            label: 'الفحص',
            description: lifecycle.quality.result === 'Passed' ? 'مطابق للمواصفات' :
                lifecycle.quality.result === 'Failed' ? 'غير مطابق' : 'بانتظار الفحص',
            icon: ShieldCheck,
            status: lifecycle.quality.status === 'Completed' ? 'Completed' :
                lifecycle.quality.status === 'Partial' ? 'Current' : 'None',
            details: lifecycle.quality.result
        }
    ];

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">تتبع دورة حياة الطلب</h3>
                    <p className="text-slate-500">متابعة حالة الطلب عبر جميع المراحل من الإنشاء حتى الفحص</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-bold">
                    <Clock className="w-4 h-4" />
                    <span>آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</span>
                </div>
            </div>

            <div className="relative flex flex-col md:flex-row justify-between gap-4">
                {/* Connecting Lines (Desktop) */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden md:block z-0" />

                {steps.map((step, index) => (
                    <div key={step.id} className="relative flex-1 z-10 group">
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                                ${step.status === 'Completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110' :
                                    step.status === 'Current' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110 animate-pulse' :
                                        step.status === 'Rejected' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' :
                                            'bg-slate-100 text-slate-400'}
                                group-hover:scale-110
                            `}>
                                <step.icon className="w-8 h-8" />
                            </div>

                            <div>
                                <h4 className={`font-bold transition-colors ${step.status === 'Completed' ? 'text-emerald-600' :
                                    step.status === 'Current' ? 'text-brand-primary' :
                                        step.status === 'Rejected' ? 'text-rose-600' :
                                            'text-slate-500'
                                    }`}>
                                    {step.label}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-[120px] mx-auto line-clamp-2">
                                    {step.description}
                                </p>
                            </div>

                            {/* أمر الشراء: زر إنشاء أمر شراء عند اعتماد المقارنة */}
                            {step.id === 'ordering' && needsCreatePO && (
                                <div className="mt-2 w-full max-w-[140px] mx-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const qId = lifecycle.sourcing?.selectedQuotationId;
                                            const params = new URLSearchParams();
                                            if (qId) params.set('quotationId', String(qId));
                                            if (prId) params.set('prId', String(prId));
                                            const qs = params.toString();
                                            navigate(`/dashboard/procurement/po/new${qs ? '?' + qs : ''}`);
                                        }}
                                        className="w-full flex items-center justify-center gap-1.5 text-xs text-brand-primary hover:bg-brand-primary/10 rounded-xl px-3 py-2 font-bold border border-brand-primary/30"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>إنشاء أمر شراء</span>
                                    </button>
                                </div>
                            )}

                            {/* إشعار الاستلام: روابط لأذونات الإضافة أو إنشاء إذن جديد */}
                            {step.id === 'receiving' && (
                                <div className="mt-2 w-full max-w-[140px] mx-auto">
                                    {hasGrns ? (
                                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-2 space-y-1">
                                            <p className="text-[10px] font-bold text-slate-500 mb-1">إشعار الاستلام</p>
                                            {(receiving.grnNumbers ?? []).map((num, i) => {
                                                const grnId = grnIds[i];
                                                return grnId != null ? (
                                                    <button
                                                        key={grnId}
                                                        type="button"
                                                        onClick={() => navigate(`/dashboard/procurement/grn/${grnId}`)}
                                                        className="w-full flex items-center gap-1 text-xs text-brand-primary hover:bg-brand-primary/10 rounded-lg px-2 py-1 text-right font-medium"
                                                    >
                                                        <FileText className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{num}</span>
                                                    </button>
                                                ) : (
                                                    <span key={i} className="block text-xs text-slate-500 truncate px-2">{num}</span>
                                                );
                                            })}
                                        </div>
                                    ) : orderingApproved ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const poIds = lifecycle.ordering?.poIds ?? [];
                                                const firstPoId = poIds.length > 0 ? poIds[0] : null;
                                                navigate(firstPoId != null
                                                    ? `/dashboard/procurement/grn/new?poId=${firstPoId}`
                                                    : '/dashboard/procurement/grn');
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 text-xs text-brand-primary hover:bg-brand-primary/10 rounded-xl px-3 py-2 font-bold border border-brand-primary/30"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>إنشاء إذن إضافة</span>
                                        </button>
                                    ) : null}
                                </div>
                            )}

                            {/* Tooltip-like detail */}
                            {step.details && step.details !== 'None' && step.details !== 'Draft' && (
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none">
                                    {step.details}
                                </div>
                            )}
                        </div>

                        {/* Mobile Connector */}
                        {index < steps.length - 1 && (
                            <div className="flex md:hidden justify-center my-2 text-slate-200">
                                <ChevronRight className="w-6 h-6 rotate-90" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PRLifecycleTracker;
