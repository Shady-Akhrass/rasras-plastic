import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { systemService } from '../../services/systemService';
import {
    Save,
    ArrowRight,
    Clock,
    Target,
    TrendingUp,
    FileText,
    Star,
    DollarSign,
    CheckCircle2,
    Info,
    AlertCircle,
    Tag,
    Calendar,
    Truck,
    ShoppingCart,
    Eye,
    XCircle,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import { approvalService } from '../../services/approvalService';
import { formatNumber, formatDate } from '../../utils/format';
import purchaseService, {
    type SupplierQuotation,
    type PurchaseRequisition,
    type PurchaseRequisitionItem,
    type QuotationComparison,
    type QuotationComparisonDetail
} from '../../services/purchaseService';
import toast from 'react-hot-toast';

const QuotationComparisonFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isViewParam = queryParams.get('mode') === 'view';
    const approvalId = queryParams.get('approvalId');
    const isEdit = !!id;

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [prs, setPrs] = useState<PurchaseRequisition[]>([]);
    const [selectedPrId, setSelectedPrId] = useState<number | undefined>();
    const [quotations, setQuotations] = useState<SupplierQuotation[]>([]);
    const [requireThreeQuotations, setRequireThreeQuotations] = useState(true);
    const [formData, setFormData] = useState<Partial<QuotationComparison>>({
        comparisonDate: new Date().toISOString(),
        prId: undefined,
        itemId: undefined,
        details: [],
        status: 'Draft',
        selectionReason: ''
    });

    // Computed view mode - true if URL param is 'view' OR if comparison status is 'Approved'
    const isView = useMemo(() => {
        return isViewParam || formData.status === 'Approved';
    }, [isViewParam, formData.status]);

    // Load Initial Data
    useEffect(() => {
        loadPRs();
        loadSettings();
        if (isEdit) {
            loadComparison(parseInt(id));
        } else {
            // Check if prId is passed as query parameter (when creating from rejected comparison)
            const prIdParam = queryParams.get('prId');
            if (prIdParam) {
                setSelectedPrId(parseInt(prIdParam));
                setFormData(prev => ({ ...prev, prId: parseInt(prIdParam) }));
            }
        }
    }, [id]);

    const loadSettings = async () => {
        try {
            const data = await systemService.getAllSettings();
            const setting = data.data.find(s => s.settingKey === 'RequireThreeQuotations');
            if (setting) {
                setRequireThreeQuotations(setting.settingValue === 'true');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const loadPRs = async () => {
        try {
            const data = await purchaseService.getAllPRs();
            setPrs(data.filter(p => p.status === 'Approved'));
        } catch (error) {
            console.error('Failed to load PRs:', error);
        }
    };

    const calculateRatings = (details: QuotationComparisonDetail[]) => {
        if (!details || details.length === 0) return details;

        const validPrices = details.map(d => d.totalPrice || 0).filter(p => p > 0);
        const validDelivery = details.map(d => d.deliveryDays || 0).filter(d => d > 0);

        const minTotalPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
        const minDeliveryDays = validDelivery.length > 0 ? Math.min(...validDelivery) : 0;

        return details.map(d => {
            const priceRate = d.totalPrice && d.totalPrice > 0 && minTotalPrice > 0 ? (minTotalPrice / d.totalPrice) * 10 : 0;
            const deliveryRate = d.deliveryDays && d.deliveryDays > 0 && minDeliveryDays > 0 ? (minDeliveryDays / d.deliveryDays) * 10 : 0;
            const overallScore = (priceRate + deliveryRate) / 2;

            return {
                ...d,
                priceRating: parseFloat(priceRate.toFixed(1)),
                qualityRating: parseFloat(deliveryRate.toFixed(1)),
                overallScore: parseFloat(overallScore.toFixed(1))
            };
        });
    };

    const loadComparison = async (comparisonId: number) => {
        try {
            setLoading(true);
            const data = await purchaseService.getComparisonById(comparisonId);
            setFormData(data);
            if (data.prId) {
                fetchQuotationsForPR(data.prId);
            }
        } catch (error) {
            console.error('Failed to load comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedPr = useMemo(() => prs.find(p => p.id === (selectedPrId || formData.prId)), [prs, selectedPrId, formData.prId]);

    useEffect(() => {
        if (selectedPr && !formData.prId) {
            setFormData(prev => ({ ...prev, prId: selectedPr.id }));
        }
    }, [selectedPr]);

    useEffect(() => {
        const prId = selectedPrId || formData.prId;
        if (prId) {
            fetchQuotationsForPR(prId);
        } else {
            setQuotations([]);
        }
    }, [selectedPrId, formData.prId]);

    const fetchQuotationsForPR = async (prId: number) => {
        try {
            setLoading(true);
            const [allQuotes, allRfqs] = await Promise.all([
                purchaseService.getAllQuotations(),
                purchaseService.getAllRFQs()
            ]);

            const prRfqs = allRfqs.filter(r => r.prId === prId);
            const rfqIds = prRfqs.map(r => r.id);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const relevantQuotes = allQuotes.filter(q => {
                const isForPR = rfqIds.includes(q.rfqId!);
                const isValid = !q.validUntilDate || new Date(q.validUntilDate) >= today;
                return isForPR && isValid;
            });

            setQuotations(relevantQuotes);

            const getFinalCosts = (q: SupplierQuotation) => {
                const delivery = q.deliveryCost !== undefined && q.deliveryCost !== null ? q.deliveryCost : 0;
                const other = q.otherCosts !== undefined && q.otherCosts !== null ? q.otherCosts : 0;
                if (delivery === 0 && other === 0) {
                    const itemsTotal = q.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
                    const diff = q.totalAmount - itemsTotal;
                    return { delivery: diff > 0 ? diff : 0, other: 0 };
                }
                return { delivery, other };
            };

            if (formData.details?.length === 0 && relevantQuotes.length > 0) {
                const initialDetails = relevantQuotes.map(q => {
                    const firstItem = q.items && q.items.length > 0 ? q.items[0] : null;
                    return {
                        quotationId: q.id!,
                        quotationNumber: q.quotationNumber,
                        supplierId: q.supplierId,
                        supplierNameAr: q.supplierNameAr,
                        unitPrice: firstItem ? firstItem.unitPrice : 0,
                        totalPrice: q.totalAmount,
                        deliveryDays: q.deliveryDays,
                        deliveryCost: getFinalCosts(q).delivery,
                        otherCosts: getFinalCosts(q).other,
                        paymentTerms: q.paymentTerms,
                        validUntilDate: q.validUntilDate,
                        qualityRating: 0,
                        priceRating: 0,
                        overallScore: 0,
                        comments: '',
                        polymerGrade: firstItem?.polymerGrade || ''
                    };
                });
                const detailsWithRating = calculateRatings(initialDetails);
                setFormData(prev => ({
                    ...prev,
                    details: detailsWithRating,
                    selectedQuotationId: detailsWithRating.sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))[0]?.quotationId,
                    selectionReason: 'أفضل عرض متكامل (سعر وتوريد)'
                }));
            } else if (formData.details && formData.details.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    details: prev.details?.map(d => {
                        const costs = d.deliveryCost === undefined || d.deliveryCost === null || d.deliveryCost === 0
                            ? (() => {
                                const q = relevantQuotes.find(quote => quote.id === d.quotationId);
                                return q ? getFinalCosts(q) : { delivery: d.deliveryCost || 0, other: d.otherCosts || 0 };
                            })()
                            : { delivery: d.deliveryCost || 0, other: d.otherCosts || 0 };
                        return {
                            ...d,
                            deliveryCost: costs.delivery,
                            otherCosts: costs.other
                        };
                    })
                }));
            }
        } catch (error) {
            console.error('Failed to fetch quotations:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateDetail = (quotationId: number, field: string, value: any) => {
        setFormData(prev => {
            const updatedDetails = prev.details?.map(d => {
                if (d.quotationId === quotationId) {
                    return { ...d, [field]: value };
                }
                return d;
            }) || [];
            const finalDetails = (field === 'deliveryDays' || field === 'unitPrice' || field === 'totalPrice')
                ? calculateRatings(updatedDetails)
                : updatedDetails;
            return {
                ...prev,
                details: finalDetails
            };
        });
    };

    const selectLowestPrice = () => {
        if (!formData.details || formData.details.length === 0) return;
        const sorted = [...formData.details].sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        setFormData(prev => ({
            ...prev,
            selectedQuotationId: sorted[0].quotationId,
            selectionReason: 'أقل سعر متاح'
        }));
        toast.success('تم تحديد العرض صاحب أقل سعر');
    };

    const selectFastestDelivery = () => {
        if (!formData.details || formData.details.length === 0) return;
        const sorted = [...formData.details].sort((a, b) => (a.deliveryDays || 1000) - (b.deliveryDays || 1000));
        setFormData(prev => ({
            ...prev,
            selectedQuotationId: sorted[0].quotationId,
            selectionReason: 'أسرع مدة توريد'
        }));
        toast.success('تم تحديد العرض صاحب أسرع توريد');
    };

    const selectHighestScore = () => {
        if (!formData.details || formData.details.length === 0) return;
        const sorted = [...formData.details].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0));
        setFormData(prev => ({
            ...prev,
            selectedQuotationId: sorted[0].quotationId,
            selectionReason: 'أفضل تقييم فني ومالي'
        }));
        toast.success('تم تحديد العرض صاحب أعلى تقييم');
    };

    const saveComparison = async () => {
        try {
            if (requireThreeQuotations && quotations.length < 3) {
                toast.error('يجب توفر 3 عروض أسعار صالحة على الأقل للمقارنة والترسية حسب إعدادات النظام');
                return null;
            }
            if (!formData.selectedQuotationId) {
                toast.error('يرجى اختيار العرض الأفضل');
                return null;
            }
            if (!formData.selectionReason) {
                toast.error('يرجى ذكر سبب الاختيار');
                return null;
            }
            setSaving(true);
            const dataToSave = {
                ...formData,
                itemId: formData.itemId || (selectedPr?.items[0]?.itemId || 0),
                selectedSupplierId: quotations.find(q => q.id === formData.selectedQuotationId)?.supplierId
            } as QuotationComparison;

            let savedComp;
            if (isEdit) {
                savedComp = await purchaseService.updateComparison(parseInt(id!), dataToSave);
            } else {
                savedComp = await purchaseService.createComparison(dataToSave);
            }
            await purchaseService.submitComparison(savedComp.id!);
            toast.success('تم حفظ المقارنة وإرسالها للاعتماد بنجاح');
            navigate('/dashboard/procurement/comparison');
            return savedComp;
        } catch (error) {
            console.error('Failed to save and submit comparison:', error);
            toast.error('فشل حفظ أو إرسال المقارنة');
            return null;
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => { saveComparison(); };

    const handleSaveAndCreatePO = async () => {
        if (formData.status === 'Approved') {
            const qId = formData.selectedQuotationId;
            const compId = (formData as any).id || undefined;
            if (qId) {
                navigate(`/dashboard/procurement/po/create?quotationId=${qId}${compId ? `&comparisonId=${compId}` : ''}`);
            }
            return;
        }
        const saved = await saveComparison();
        if (!saved) return;
        if (saved.status === 'Approved') {
            const qId = saved.selectedQuotationId || formData.selectedQuotationId;
            navigate(`/dashboard/procurement/po/create?quotationId=${qId}&comparisonId=${saved.id}`);
        } else {
            toast.error('لا يمكن إنشاء أمر شراء قبل اعتماد المقارنة');
        }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
            navigate('/dashboard/procurement/approvals');
        } catch (error) {
            console.error('Failed to take action:', error);
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessing(false);
        }
    };

    const handleCreateNewComparison = () => {
        const prId = formData.prId;
        if (!prId) {
            toast.error('لا يمكن إنشاء مقارنة جديدة بدون تحديد طلب شراء');
            return;
        }
        navigate(`/dashboard/procurement/comparison/new?prId=${prId}`);
        toast.success('تم فتح نموذج مقارنة جديد بنفس طلب الشراء');
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-semibold">جاري تحميل البيانات...</p>
            </div>
        </div>
    );

    const renderHeaderActions = () => {
        if (isView) {
            return (
                <div className="flex items-center gap-3">
                    {approvalId && (
                        <>
                            <button
                                onClick={() => handleApprovalAction('Approved')}
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                <span>اعتماد</span>
                            </button>
                            <button
                                onClick={() => handleApprovalAction('Rejected')}
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                <span>رفض</span>
                            </button>
                        </>
                    )}
                    <div className="flex items-center gap-2 px-6 py-4 bg-amber-500/20 text-white rounded-2xl border border-white/30 backdrop-blur-sm">
                        <Eye className="w-5 h-5" />
                        <span className="font-bold">وضع العرض فقط</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3">
                {isEdit && formData.status === 'Rejected' && (
                    <button
                        onClick={handleCreateNewComparison}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                        title="إنشاء مقارنة جديدة بنفس طلب الشراء"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>إنشاء مقارنة جديدة</span>
                    </button>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ المقارنة'}</span>
                </button>

                {formData.selectedQuotationId && formData.status === 'Approved' && (
                    <button
                        onClick={handleSaveAndCreatePO}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>حفظ وإنشاء أمر شراء</span>
                    </button>
                )}
            </div>
        );
    };

    const renderStatusBadge = () => {
        if (isEdit && formData.status === 'Rejected') {
            return (
                <div className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold flex items-center gap-2 border border-rose-100 italic">
                    <XCircle className="w-5 h-5" />
                    <span>مرفوض</span>
                </div>
            );
        }

        if (isEdit && formData.status !== 'Draft' && formData.status !== 'Approved' && formData.status !== 'Rejected') {
            return (
                <div className="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-bold flex items-center gap-2 border border-amber-100 italic">
                    <Clock className="w-5 h-5" />
                    <span>بانتظار الاعتماد</span>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slide-in {
                    animation: slideInRight 0.4s ease-out;
                }
            `}</style>

            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 
                rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/procurement/comparison')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 
                                hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">
                                {isEdit ? 'تعديل مقارنة عروض الأسعار' : 'مقارنة عروض أسعار جديدة'}
                            </h1>
                            <p className="text-white/80 text-sm font-semibold mt-1">
                                تحليل شامل واختيار العرض الأفضل بناءً على السعر والجودة
                            </p>
                        </div>
                    </div>

                    {renderStatusBadge()}
                    {renderHeaderActions()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selection Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-brand-primary/10 rounded-xl">
                                <Target className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">تحديد موضوع المقارنة</h3>
                                <p className="text-slate-500 text-sm">اختر طلب الشراء المراد ترسيته</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                طلب الشراء (PR)
                            </label>
                            <select
                                value={selectedPrId || formData.prId || ''}
                                onChange={(e) => {
                                    const prId = parseInt(e.target.value);
                                    setSelectedPrId(prId);
                                    setFormData(prev => ({ ...prev, prId: prId, itemId: undefined, details: [] }));
                                }}
                                disabled={isView}
                                className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                    focus:border-brand-primary outline-none transition-all font-semibold
                                    ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                            >
                                <option value="">اختر طلب شراء معتمد...</option>
                                {prs.filter(pr => (!pr.hasActiveOrders && !pr.hasComparison) || pr.id === (selectedPrId || formData.prId)).map(pr => (
                                    <option key={pr.id} value={pr.id}>
                                        {pr.prNumber} - {pr.requestedByUserName} ({pr.requestedByDeptName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedPr && (
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-brand-primary" />
                                    بنود طلب الشراء
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPr.items.map((item: PurchaseRequisitionItem) => (
                                        <div
                                            key={item.itemId}
                                            className="px-3 py-2 bg-gradient-to-l from-blue-50 to-cyan-50 border-2 border-blue-200 
                                                rounded-xl text-xs font-bold text-blue-700 flex items-center gap-2"
                                        >
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            {item.itemNameAr} ({item.requestedQty} {item.unitName})
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedPr && (
                            <div className={`p-5 rounded-2xl border-2 ${quotations.length < 3
                                ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-rose-200'
                                : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                                }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-3 rounded-xl ${quotations.length < 3 ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                                        {quotations.length < 3 ? (
                                            <AlertCircle className="w-6 h-6 text-rose-600" />
                                        ) : (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold mb-1 ${quotations.length < 3 ? 'text-rose-800' : 'text-emerald-800'}`}>
                                            {quotations.length < 3 ? 'عدد العروض غير كافٍ' : 'جاهز للمقارنة'}
                                        </h4>
                                        <p className={`text-sm leading-relaxed ${quotations.length < 3 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            تم العثور على <strong>{quotations.length}</strong> عروض سعر صالحة وغير منتهية
                                            {requireThreeQuotations && quotations.length < 3 && (
                                                <> - يتطلب النظام <strong>3 عروض على الأقل</strong> لبدء الترسية</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Decision Section */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                    style={{ animationDelay: '100ms' }}>
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">قرار الترسية</h3>
                                    <p className="text-slate-500 text-sm">اختر العرض الأفضل وحدد سبب الاختيار</p>
                                </div>
                            </div>
                            {!isView && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectLowestPrice}
                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                        title="اختيار أقل سعر"
                                    >
                                        <DollarSign className="w-3.5 h-3.5 inline ml-1" />
                                        الأرخص
                                    </button>
                                    <button
                                        onClick={selectFastestDelivery}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                                        title="اختيار أسرع توريد"
                                    >
                                        <Clock className="w-3.5 h-3.5 inline ml-1" />
                                        الأسرع
                                    </button>
                                    <button
                                        onClick={selectHighestScore}
                                        className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold border border-purple-100 hover:bg-purple-100 transition-colors"
                                        title="اختيار أعلى تقييم"
                                    >
                                        <Star className="w-3.5 h-3.5 inline ml-1" />
                                        الأفضل تقييماً
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                العرض الأفضل
                            </label>
                            <select
                                value={formData.selectedQuotationId || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, selectedQuotationId: parseInt(e.target.value) }))}
                                disabled={isView}
                                className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                    focus:border-brand-primary outline-none transition-all font-semibold
                                    ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                            >
                                <option value="">حدد العرض الأفضل...</option>
                                {formData.details?.map(d => (
                                    <option key={d.quotationId} value={d.quotationId}>
                                        {d.supplierNameAr} - {formatNumber(d.totalPrice)} ج.م
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                <FileText className="w-4 h-4 text-brand-primary" />
                                سبب الاختيار / ملاحظات الترسية
                            </label>
                            <textarea
                                value={formData.selectionReason || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, selectionReason: e.target.value }))}
                                rows={5}
                                disabled={isView}
                                className={`w-full px-4 py-3 border-2 border-transparent rounded-xl 
                                    focus:border-brand-primary outline-none transition-all text-sm leading-relaxed resize-none
                                    ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'}`}
                                placeholder={isView ? '' : "مثلاً: السعر الأقل، سرعة التوريد، جودة الخامات، الخبرة السابقة مع المورد..."}
                            />
                        </div>

                        {formData.selectedQuotationId && (
                            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800">
                                            تم تحديد العرض الأفضل
                                        </p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            {formData.details?.find(d => d.quotationId === formData.selectedQuotationId)?.supplierNameAr}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            {selectedPr && formData.details && formData.details.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                    style={{ animationDelay: '200ms' }}>
                    <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">مصفوفة مقارنة عروض الأسعار</h2>
                                <p className="text-slate-500 text-sm">تقييم شامل لجميع العروض المقدمة</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-right">
                                        المورد والعرض
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Tag className="w-4 h-4 text-brand-primary" />
                                            سعر الوحدة
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                            إجمالي العرض
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        تحليل الأداء (سعر / توريد / نهائي)
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            صلاحية العرض
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Truck className="w-4 h-4 text-blue-500" />
                                            مصاريف الشحن
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            مصاريف أخرى
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            مدة التوريد
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        درجة البوليمر
                                    </th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-700 border-b-2 border-slate-200 text-center">
                                        الإجراء
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {formData.details?.map((detail) => {
                                    const isWinner = formData.selectedQuotationId === detail.quotationId;
                                    return (
                                        <tr
                                            key={detail.quotationId}
                                            className={`transition-all ${isWinner
                                                ? 'bg-gradient-to-l from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100'
                                                : 'hover:bg-slate-50/80'
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-xl ${isWinner ? 'bg-emerald-100' : 'bg-brand-primary/10'}`}>
                                                        <CheckCircle2 className={`w-5 h-5 ${isWinner ? 'text-emerald-600' : 'text-brand-primary'}`} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">
                                                            {detail.supplierNameAr}
                                                        </div>
                                                        <div className="text-xs font-semibold text-slate-400 mt-0.5">
                                                            #{detail.quotationNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const q = quotations.find(qu => qu.id === detail.quotationId);
                                                    const prices = q?.items?.map(i => i.unitPrice).filter((p): p is number => p != null && p > 0) ?? [];
                                                    const hasMultiple = prices.length > 1;
                                                    return (
                                                        <div className="text-center">
                                                            <div className={`font-bold text-brand-primary ${hasMultiple ? 'text-sm leading-relaxed' : 'text-lg'}`}>
                                                                {hasMultiple
                                                                    ? prices.map((p, i) => (
                                                                        <span key={i}>
                                                                            {formatNumber(p)}{i < prices.length - 1 ? ' ، ' : ''}
                                                                        </span>
                                                                    ))
                                                                    : formatNumber(detail.unitPrice ?? (prices[0] ?? 0))}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 font-semibold">
                                                                {hasMultiple ? 'للوحدة (أصناف متعددة)' : 'للوحدة الواحدة'}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-center">
                                                    <div className="font-black text-emerald-600 text-xl">
                                                        {formatNumber(detail.totalPrice ?? 0)}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-semibold mt-1">
                                                        جنيه مصري
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-2 py-2">
                                                    {/* Price Rating */}
                                                    <div className={`flex items-center justify-between gap-3 w-32 px-3 py-1.5 rounded-lg border-2 ${detail.priceRating! >= 7 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                                                        }`}>
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                                                            <span className="text-[10px] font-bold truncate">السعر</span>
                                                        </div>
                                                        <span className="font-black text-xs">{detail.priceRating?.toFixed(1) || '0.0'}</span>
                                                    </div>

                                                    {/* Delivery Rating */}
                                                    <div className={`flex items-center justify-between gap-3 w-32 px-3 py-1.5 rounded-lg border-2 ${detail.qualityRating! >= 7 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                                                        }`}>
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                            <span className="text-[10px] font-bold truncate">التوريد</span>
                                                        </div>
                                                        <span className="font-black text-xs">{detail.qualityRating?.toFixed(1) || '0.0'}</span>
                                                    </div>

                                                    {/* Final Score */}
                                                    <div className={`flex items-center justify-between gap-3 w-32 px-3 py-1.5 rounded-lg border-2 shadow-sm ${(detail.overallScore || 0) >= 7 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
                                                        (detail.overallScore || 0) >= 5 ? 'bg-amber-50 border-amber-300 text-amber-700' :
                                                            'bg-rose-50 border-rose-300 text-rose-700'
                                                        }`}>
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <Target className="w-3.5 h-3.5 flex-shrink-0" />
                                                            <span className="text-[10px] font-black truncate">الإجمالي</span>
                                                        </div>
                                                        <span className="font-black text-xs">{detail.overallScore?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`flex flex-col items-center gap-1 ${new Date(detail.validUntilDate!) < new Date()
                                                    ? 'text-rose-500'
                                                    : 'text-slate-600'
                                                    }`}>
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs font-bold">
                                                        {detail.validUntilDate
                                                            ? formatDate(detail.validUntilDate)
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-700">
                                                        {formatNumber(detail.deliveryCost ?? 0)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-semibold italic">شحن</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-center">
                                                    <div className="font-bold text-slate-700">
                                                        {formatNumber(detail.otherCosts ?? 0)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-semibold italic">أخرى</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-1 text-slate-600">
                                                    <input
                                                        type="number"
                                                        value={detail.deliveryDays}
                                                        onChange={(e) => updateDetail(detail.quotationId, 'deliveryDays', parseInt(e.target.value))}
                                                        disabled={isView}
                                                        className={`w-16 px-2 py-1.5 border border-slate-200 rounded-lg 
                                                            text-center font-bold text-slate-700 focus:border-brand-primary 
                                                            outline-none transition-all text-sm
                                                            ${isView ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
                                                    />
                                                    <span className="text-[10px] font-bold text-slate-400">يوم</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm font-bold text-slate-700">
                                                    {detail.polymerGrade || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isWinner ? (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 
                                                        text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>الأفضل</span>
                                                    </div>
                                                ) : (
                                                    !isView && (
                                                        <button
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                selectedQuotationId: detail.quotationId
                                                            }))}
                                                            disabled={requireThreeQuotations && quotations.length < 3}
                                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${requireThreeQuotations && quotations.length < 3
                                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                : 'bg-brand-primary text-white hover:bg-brand-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-brand-primary/20'
                                                                }`}
                                                        >
                                                            اختيار
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotationComparisonFormPage;