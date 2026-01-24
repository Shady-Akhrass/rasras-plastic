import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    FileText,
    CheckCircle2,
    AlertCircle,
    Info,
    Trophy
} from 'lucide-react';
import purchaseService, {
    type QuotationComparison,
    type SupplierQuotation,
    type RFQ
} from '../../services/purchaseService';
import toast from 'react-hot-toast';

const QuotationComparisonFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [selectedRfqId, setSelectedRfqId] = useState<number | undefined>();
    const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);

    const [formData, setFormData] = useState<Partial<QuotationComparison>>({
        comparisonDate: new Date().toISOString(),
        prId: undefined,
        itemId: undefined,
        details: [],
        status: 'Draft',
        selectionReason: ''
    });

    // Load Initial Data
    useEffect(() => {
        loadRFQs();
        if (isEdit) {
            loadComparison(parseInt(id));
        }
    }, [id]);

    const loadRFQs = async () => {
        try {
            const data = await purchaseService.getAllRFQs();
            setRfqs(data);
        } catch (error) {
            console.error('Failed to load RFQs:', error);
        }
    };

    const loadComparison = async (compId: number) => {
        try {
            setLoading(true);
            const data = await purchaseService.getComparisonById(compId);
            setFormData(data);
            // After loading comparison, we might need to load quotations for that item
            if (data.itemId) {
                fetchQuotationsForItem(data.itemId);
            }
        } catch (error) {
            console.error('Failed to load comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    // Dependencies Loading
    const selectedRfq = useMemo(() => rfqs.find(r => r.id === selectedRfqId), [rfqs, selectedRfqId]);

    useEffect(() => {
        if (selectedRfq) {
            setFormData(prev => ({ ...prev, prId: selectedRfq.prId }));
        }
    }, [selectedRfq]);

    useEffect(() => {
        if (formData.itemId) {
            fetchQuotationsForItem(formData.itemId);
        } else {
            setQuotations([]);
        }
    }, [formData.itemId]);

    const fetchQuotationsForItem = async (itemId: number) => {
        try {
            setLoading(true);
            // Fetch all quotations and filter by item
            const allQuotes = await purchaseService.getAllQuotations();
            const relevantQuotes = allQuotes.filter(q =>
                q.items.some(item => item.itemId === itemId)
            );
            setQuotations(relevantQuotes);

            // Initialize details if empty
            if (formData.details?.length === 0) {
                const initialDetails = relevantQuotes.map(q => {
                    const item = q.items.find(i => i.itemId === itemId)!;
                    return {
                        quotationId: q.id!,
                        quotationNumber: q.quotationNumber,
                        supplierId: q.supplierId,
                        supplierNameAr: q.supplierNameAr,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        deliveryDays: q.deliveryDays,
                        paymentTerms: q.paymentTerms,
                        qualityRating: 0,
                        priceRating: 0,
                        overallScore: 0,
                        comments: ''
                    };
                });
                setFormData(prev => ({ ...prev, details: initialDetails }));
            }
        } catch (error) {
            console.error('Failed to fetch quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateDetail = (quotationId: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details?.map(d => {
                if (d.quotationId === quotationId) {
                    const updated = { ...d, [field]: value };
                    // Recalculate score if ratings change
                    if (field === 'qualityRating' || field === 'priceRating') {
                        const q = field === 'qualityRating' ? value : (d.qualityRating || 0);
                        const p = field === 'priceRating' ? value : (d.priceRating || 0);
                        updated.overallScore = (parseInt(q) + parseInt(p)) / 2;
                    }
                    return updated;
                }
                return d;
            })
        }));
    };

    const handleSave = async () => {
        try {
            if (!formData.selectedQuotationId) {
                toast.error('يرجى اختيار العرض الأفضل');
                return;
            }
            if (!formData.selectionReason) {
                toast.error('يرجى ذكر سبب الاختيار');
                return;
            }

            setSaving(true);
            const dataToSave = {
                ...formData,
                selectedSupplierId: quotations.find(q => q.id === formData.selectedQuotationId)?.supplierId
            } as QuotationComparison;

            if (isEdit) {
                await purchaseService.updateComparison(parseInt(id!), dataToSave);
            } else {
                await purchaseService.createComparison(dataToSave);
            }
            toast.success('تم حفظ المقارنة بنجاح');
            navigate('/dashboard/procurement/comparison');
        } catch (error) {
            console.error('Failed to save comparison:', error);
            toast.error('فشل حفظ المقارنة');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل البيانات...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/procurement/comparison')} className="p-2 hover:bg-slate-100 rounded-lg">
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEdit ? `تعديل مقارنة: ${formData.comparisonNumber}` : 'مقارنة عروض أسعار جديدة'}
                        </h1>
                        <p className="text-slate-500 text-sm">حدد طلب عرض السعر، الصنف، ثم قارن العروض المتاحة</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
                        <Save className="w-5 h-5" />
                        <span>{saving ? 'جاري الحفظ...' : 'حفظ المقارنة'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selection Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                        <Info className="w-5 h-5 text-brand-primary" />
                        <span>تحديد موضوع المقارنة</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">طلب عرض السعر (RFQ)</label>
                            <select
                                value={selectedRfqId || ''}
                                onChange={(e) => {
                                    const rfqId = parseInt(e.target.value);
                                    setSelectedRfqId(rfqId);
                                    setFormData(prev => ({ ...prev, itemId: undefined }));
                                }}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            >
                                <option value="">اختر طلب عرض سعر...</option>
                                {rfqs.map(rfq => (
                                    <option key={rfq.id} value={rfq.id}>{rfq.rfqNumber} - {rfq.supplierNameAr}</option>
                                ))}
                            </select>
                        </div>

                        {selectedRfq && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600">الصنف المراد مقارنته</label>
                                <select
                                    value={formData.itemId || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, itemId: parseInt(e.target.value) }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                >
                                    <option value="">اختر صنف...</option>
                                    {selectedRfq.items.map(item => (
                                        <option key={item.itemId} value={item.itemId}>{item.itemNameAr}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {formData.itemId && (
                        <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                            <div className="flex items-center gap-3 text-brand-primary">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-bold">تم العثور على ({quotations.length}) عروض سعر لهذا الصنف</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Final Decision Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-50 pb-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>قرار الترسية (العرض الأفضل)</span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">العرض المختار</label>
                            <select
                                value={formData.selectedQuotationId || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, selectedQuotationId: parseInt(e.target.value) }))}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                            >
                                <option value="">حدد العرض الفائز...</option>
                                {formData.details?.map(d => (
                                    <option key={d.quotationId} value={d.quotationId}>
                                        {d.supplierNameAr} - ({d.totalPrice} EGP)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">سبب الاختيار / ملاحظات الترسية</label>
                            <textarea
                                value={formData.selectionReason || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, selectionReason: e.target.value }))}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-primary outline-none transition-all"
                                placeholder="مثلاً: السعر الأقل، سرعة التوريد، جودة الخامات..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            {formData.itemId && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-slate-400" />
                            <h2 className="text-lg font-bold text-slate-800">مصفوفة مقارنة العروض</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-100">المورد</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-100">سعر الوحدة</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-100">تقييم السعر (1-10)</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-100">تقييم الجودة (1-10)</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-100 text-center">الدرجة</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-100">مدة التوريد</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-100">القرار</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {formData.details?.map((detail) => (
                                    <tr
                                        key={detail.quotationId}
                                        className={`hover:bg-slate-50/80 transition-colors ${formData.selectedQuotationId === detail.quotationId ? 'bg-emerald-50/30' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{detail.supplierNameAr}</div>
                                            <div className="text-xs text-slate-400">#{detail.quotationNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-700">{detail.unitPrice?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={detail.priceRating || 0}
                                                onChange={(e) => updateDetail(detail.quotationId, 'priceRating', e.target.value)}
                                                className="w-16 px-2 py-1 border rounded-lg text-center focus:border-brand-primary outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={detail.qualityRating || 0}
                                                onChange={(e) => updateDetail(detail.quotationId, 'qualityRating', e.target.value)}
                                                className="w-16 px-2 py-1 border rounded-lg text-center focus:border-brand-primary outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full font-bold ${(detail.overallScore || 0) >= 7 ? 'bg-emerald-50 text-emerald-600' :
                                                (detail.overallScore || 0) >= 5 ? 'bg-amber-50 text-amber-600' :
                                                    'bg-rose-50 text-rose-600'
                                                }`}>
                                                {detail.overallScore?.toFixed(1) || '0.0'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{detail.deliveryDays} يوم</td>
                                        <td className="px-6 py-4">
                                            {formData.selectedQuotationId === detail.quotationId ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                                                    <Trophy className="w-4 h-4" />
                                                    <span>تم الاختيار</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setFormData(prev => ({ ...prev, selectedQuotationId: detail.quotationId }))}
                                                    className="text-slate-400 hover:text-brand-primary text-sm font-bold"
                                                >
                                                    اختيار
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotationComparisonFormPage;
