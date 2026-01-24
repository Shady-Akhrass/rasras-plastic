import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    FileText,
    Scale,
    Trophy,
    Award,
    Zap,
    ShoppingCart
} from 'lucide-react';
import purchaseService, { type QuotationComparison } from '../../services/purchaseService';

const QuotationComparisonPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [comparisons, setComparisons] = useState<QuotationComparison[]>([]);

    useEffect(() => {
        fetchComparisons();
    }, []);

    const fetchComparisons = async () => {
        try {
            setLoading(true);
            const data = await purchaseService.getAllComparisons();
            setComparisons(data);
        } catch (error) {
            console.error('Failed to fetch comparisons:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>

            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 
                rounded-3xl p-8 text-white">
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                            <Scale className="w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">مقارنة عروض الأسعار</h1>
                            <p className="text-white/70 text-lg">تحليل العروض المقدمة واختيار المورد الأفضل</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard/procurement/comparison/new')}
                        className="flex items-center gap-3 px-6 py-3 bg-white text-orange-600 rounded-xl 
                            hover:bg-white/90 transition-all duration-200 font-bold shadow-lg 
                            hover:shadow-xl hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>مقارنة جديدة</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400">جاري التحميل...</div>
                ) : comparisons.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100">
                        <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800">لا توجد مقارنات حالياً</h3>
                        <p className="text-slate-500">ابدأ بإنشاء مقارنة جديدة لعروض الأسعار</p>
                    </div>
                ) : comparisons.map((comp, idx) => (
                    <div
                        key={comp.id}
                        className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group"
                        style={{ animation: 'slideIn 0.4s ease-out forwards', animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                                <Award className="w-6 h-6" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${comp.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                                }`}>
                                {comp.status === 'Approved' ? 'معتمد' : 'مسودة'}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-1">{comp.itemNameAr}</h3>
                        <p className="text-sm text-slate-500 mb-4">طلب شراء #{comp.prNumber}</p>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">عدد العروض:</span>
                                <span className="font-bold text-slate-700">{comp.details.length} موردين</span>
                            </div>
                            {comp.selectedSupplierNameAr && (
                                <div className="flex flex-col gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                                            <Trophy className="w-4 h-4" /> الفائز:
                                        </span>
                                        <span className="text-emerald-700 font-bold">{comp.selectedSupplierNameAr}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-emerald-100">
                                        <span className="text-emerald-600/70 font-medium">الدرجة الكلية:</span>
                                        <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md font-black">
                                            {(comp.details.find(d => d.quotationId === comp.selectedQuotationId)?.overallScore || 0).toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <button
                                onClick={() => navigate(`/dashboard/procurement/comparison/${comp.id}`)}
                                className="py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                التفاصيل
                            </button>
                            {comp.status === 'Approved' && comp.selectedQuotationId && (
                                <button
                                    onClick={() => navigate(`/dashboard/procurement/po/new?comparisonId=${comp.id}&quotationId=${comp.selectedQuotationId}`)}
                                    className="py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    أمر شراء
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuotationComparisonPage;
