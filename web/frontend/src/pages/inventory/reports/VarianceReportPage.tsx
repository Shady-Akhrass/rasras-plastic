import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ChevronRight, ClipboardCheck, AlertCircle } from 'lucide-react';

/**
 * تقرير الفروقات: الرصيد النظري مقابل الرصيد الفعلي بعد الجرد.
 * يتطلب من الخلفية: جدول جرد (Count) ونتائج الجرد مع الفروقات.
 * عند التفعيل: GET /inventory/counts/:id/variance أو /inventory/variance-report
 */
const VarianceReportPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard/inventory/sections')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="p-4 bg-white/10 rounded-2xl"><BarChart3 className="w-10 h-10" /></div>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">تقرير الفروقات</h1>
                            <p className="text-white/80">فروقات الجرد: الرصيد النظري مقابل الفعلي والأسباب المحتملة</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-rose-800 mb-2">توضيح</p>
                    <p className="text-sm text-rose-700 mb-4">
                        يُعبّر تقرير الفروقات عن الفرق بين الرصيد النظري (من السجلات) والرصيد الفعلي (من الجرد).
                        عند تفعيل عمليات الجرد وتسجيل النتائج في النظام، ستظهر هنا ملخصات الفروقات (زائدة/ناقصة) وأسبابها (خطأ تسجيل، تلف، فقد، إلخ).
                    </p>
                    <p className="text-sm text-rose-600">يمكنك البدء بـ <strong>جرد دوري</strong> أو <strong>جرد مفاجئ</strong> وتسجيل الكميات الفعلية؛ بعد ربط واجهة تخزين نتائج الجرد بالخلفية سيُحدَّث هذا التقرير تلقائياً.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h2 className="font-bold text-slate-800 mb-2">الجرد أولاً</h2>
                <p className="text-slate-500 mb-6">نفّذ جرداً (دورياً أو مفاجئاً) وسجّل النتائج. تقرير الفروقات سيُبنى على بيانات الجرد عند تفعيل الـ API.</p>
                <div className="flex items-center justify-center gap-3">
                    <button onClick={() => navigate('/dashboard/inventory/count?type=periodic')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">
                        جرد دوري
                    </button>
                    <button onClick={() => navigate('/dashboard/inventory/count?type=surprise')} className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700">
                        جرد مفاجئ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VarianceReportPage;
