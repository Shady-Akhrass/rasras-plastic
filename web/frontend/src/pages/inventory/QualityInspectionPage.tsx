import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2,
    Search,
    Package,
    ClipboardCheck,
    Save,
    RotateCcw,
    Clock,
    X
} from 'lucide-react';
import { grnService, type GoodsReceiptNoteDto } from '../../services/grnService';
import { qualityService } from '../../services/qualityService';
import toast from 'react-hot-toast';

// Stat Card Component
const StatCard: React.FC<{
    icon: React.ElementType;
    value: string | number;
    label: string;
    color: 'primary' | 'success' | 'warning' | 'purple' | 'blue' | 'rose';
}> = ({ icon: Icon, value, label, color }) => {
    const colorClasses = {
        primary: 'bg-brand-primary/10 text-brand-primary',
        success: 'bg-emerald-100 text-emerald-600',
        warning: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
        blue: 'bg-blue-100 text-blue-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]} 
                    group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </div>
        </div>
    );
};

// GRN Card Component
const GRNCard: React.FC<{
    grn: GoodsReceiptNoteDto;
    index: number;
    onInspect: (grn: GoodsReceiptNoteDto) => void;
}> = ({ grn, index, onInspect }) => (
    <div
        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg 
            hover:border-brand-primary/20 transition-all duration-300 flex flex-col group"
        style={{
            animationDelay: `${index * 50}ms`,
            animation: 'fadeInUp 0.4s ease-out forwards'
        }}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary 
                group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6" />
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
                ${grn.status === 'Inspected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {grn.status === 'Inspected' ? (
                    <>
                        <CheckCircle2 className="w-3 h-3" />
                        تم الفحص
                    </>
                ) : (
                    <>
                        <Clock className="w-3 h-3" />
                        بانتظار الفحص
                    </>
                )}
            </span>
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-brand-primary transition-colors">
            {grn.grnNumber}
        </h3>
        <p className="text-slate-500 text-sm mb-4">{grn.supplierNameAr}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-400">
                {new Date(grn.grnDate!).toLocaleDateString('ar-EG')}
            </div>
            <button
                onClick={() => onInspect(grn)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg 
                    text-sm font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
            >
                <ClipboardCheck className="w-4 h-4" />
                إجراء الفحص
            </button>
        </div>
    </div>
);

// Loading Skeleton
const CardSkeleton: React.FC = () => (
    <>
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div className="h-6 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div className="h-4 w-20 bg-slate-100 rounded" />
                    <div className="h-10 w-32 bg-slate-100 rounded-lg" />
                </div>
            </div>
        ))}
    </>
);

// Empty State
const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-2xl flex items-center justify-center">
            {searchTerm ? (
                <Search className="w-12 h-12 text-slate-400" />
            ) : (
                <ClipboardCheck className="w-12 h-12 text-slate-400" />
            )}
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchTerm ? 'لا توجد نتائج' : 'لا توجد شحنات للفحص'}
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
            {searchTerm
                ? `لم يتم العثور على شحنات تطابق "${searchTerm}"`
                : 'لا توجد أذونات إضافة بانتظار الفحص حالياً'}
        </p>
    </div>
);

const QualityInspectionPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [grns, setGrns] = useState<GoodsReceiptNoteDto[]>([]);
    const [selectedGrn, setSelectedGrn] = useState<GoodsReceiptNoteDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPendingGRNs();
    }, []);

    const fetchPendingGRNs = async () => {
        try {
            setLoading(true);
            const allGrns = await grnService.getAllGRNs();
            setGrns(allGrns.filter(g => g.status === 'Pending Inspection' || g.status === 'Inspected'));
        } catch (error) {
            console.error('Error fetching GRNs:', error);
            toast.error('فشل تحميل الشحنات');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordInspection = (grn: GoodsReceiptNoteDto) => {
        const grnWithDetails = {
            ...grn,
            items: grn.items.map(item => ({
                ...item,
                acceptedQty: item.acceptedQty || item.receivedQty,
                rejectedQty: item.rejectedQty || 0,
                result: 'Accepted'
            }))
        };
        setSelectedGrn(grnWithDetails);
    };

    const handleSaveInspection = async () => {
        if (!selectedGrn) return;

        try {
            setSaving(true);
            const inspectionData = {
                inspectedByUserId: 1,
                overallResult: selectedGrn.items.every(i => i.rejectedQty === 0) ? 'Passed' : 'Failed',
                items: selectedGrn.items.map(item => ({
                    itemId: item.itemId,
                    acceptedQty: item.acceptedQty,
                    rejectedQty: item.rejectedQty,
                    overallResult: item.acceptedQty === item.receivedQty ? 'Passed' : 'Failed',
                    notes: ''
                }))
            };

            await qualityService.recordInspection(selectedGrn.id!, inspectionData);
            toast.success('تم حفظ تقرير الفحص بنجاح');
            setSelectedGrn(null);
            fetchPendingGRNs();
        } catch (error) {
            console.error('Error saving inspection:', error);
            toast.error('فشل حفظ تقرير الفحص');
        } finally {
            setSaving(false);
        }
    };

    const filteredGRNs = useMemo(() => {
        return grns.filter(grn =>
            grn.grnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            grn.supplierNameAr?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [grns, searchTerm]);

    const stats = useMemo(() => ({
        total: grns.length,
        pending: grns.filter(g => g.status === 'Pending Inspection').length,
        inspected: grns.filter(g => g.status === 'Inspected').length,
    }), [grns]);

    return (
        <div className="space-y-6">
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
                <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex items-center gap-5">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                        <ClipboardCheck className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">فحص الجودة</h1>
                        <p className="text-white/70 text-lg">مراجعة وفحص الشحنات الواردة قبل الإضافة للمخزون</p>
                    </div>
                </div>
            </div>

            {!selectedGrn ? (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={Package}
                            value={stats.total}
                            label="إجمالي الشحنات"
                            color="primary"
                        />
                        <StatCard
                            icon={Clock}
                            value={stats.pending}
                            label="بانتظار الفحص"
                            color="warning"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            value={stats.inspected}
                            label="تم الفحص"
                            color="success"
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="relative">
                            <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 
                                transition-colors duration-200
                                ${isSearchFocused ? 'text-brand-primary' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="البحث برقم الإذن أو المورد..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className={`w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-200 
                                    outline-none bg-slate-50
                                    ${isSearchFocused
                                        ? 'border-brand-primary bg-white shadow-lg shadow-brand-primary/10'
                                        : 'border-transparent hover:border-slate-200'}`}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 
                                        rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Count */}
                    {!loading && (
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                            <span className="text-slate-600">
                                عرض <span className="font-bold text-slate-800">{filteredGRNs.length}</span> من{' '}
                                <span className="font-bold text-slate-800">{grns.length}</span> شحنة
                            </span>
                        </div>
                    )}

                    {/* GRN Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <CardSkeleton />
                        ) : filteredGRNs.length === 0 ? (
                            <EmptyState searchTerm={searchTerm} />
                        ) : (
                            filteredGRNs.map((grn, index) => (
                                <GRNCard
                                    key={grn.id}
                                    grn={grn}
                                    index={index}
                                    onInspect={handleRecordInspection}
                                />
                            ))
                        )}
                    </div>
                </>
            ) : (
                /* Inspection Form */
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-slate-50 to-white">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                تفاصيل الفحص: {selectedGrn.grnNumber}
                            </h2>
                            <p className="text-slate-500">{selectedGrn.supplierNameAr}</p>
                        </div>
                        <button
                            onClick={() => setSelectedGrn(null)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-6 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-slate-500 text-sm border-b border-slate-200">
                                    <th className="pb-4 pr-4 font-bold text-right">الصنف</th>
                                    <th className="pb-4 px-4 font-bold text-center">الكمية المستلمة</th>
                                    <th className="pb-4 px-4 font-bold text-center text-emerald-600">الكمية المقبولة</th>
                                    <th className="pb-4 px-4 font-bold text-center text-rose-600">الكمية المرفوضة</th>
                                    <th className="pb-4 pl-4 font-bold text-right">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedGrn.items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 pr-4 font-bold text-slate-800">{item.itemNameAr}</td>
                                        <td className="py-4 px-4 text-center font-semibold text-slate-600">
                                            {item.receivedQty}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <input
                                                type="number"
                                                value={item.acceptedQty}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    const newItems = [...selectedGrn.items];
                                                    newItems[idx].acceptedQty = val;
                                                    newItems[idx].rejectedQty = item.receivedQty - val;
                                                    setSelectedGrn({ ...selectedGrn, items: newItems });
                                                }}
                                                className="w-28 px-3 py-2 rounded-lg border-2 border-emerald-200 
                                                    focus:border-emerald-500 outline-none text-emerald-600 font-bold text-center
                                                    bg-emerald-50"
                                            />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <input
                                                type="number"
                                                value={item.rejectedQty}
                                                readOnly
                                                className="w-28 px-3 py-2 rounded-lg bg-rose-50 border-2 border-rose-200 
                                                    text-rose-600 font-bold outline-none text-center"
                                            />
                                        </td>
                                        <td className="py-4 pl-4">
                                            <input
                                                type="text"
                                                placeholder="ملاحظات الجودة..."
                                                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 
                                                    focus:border-brand-primary outline-none transition-colors"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            onClick={() => setSelectedGrn(null)}
                            disabled={saving}
                            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 
                                transition-all disabled:opacity-50"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleSaveInspection}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-brand-primary text-brand-primary 
                                rounded-xl font-bold hover:bg-brand-primary/5 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'جاري الحفظ...' : 'حفظ مسودة'}</span>
                        </button>
                        <button
                            onClick={async () => {
                                await handleSaveInspection();
                                if (selectedGrn?.id) {
                                    if (window.confirm('هل أنت متأكد من إرسال نتيجة الفحص للاعتماد؟')) {
                                        try {
                                            setSaving(true);
                                            await grnService.submitGRN(selectedGrn.id, 1);
                                            toast.success('تم إرسال الفحص للاعتماد');
                                            setSelectedGrn(null);
                                            fetchPendingGRNs();
                                        } catch (e) {
                                            toast.error('فشل الإرسال للاعتماد');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }
                                }
                            }}
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl 
                                font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-700 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ClipboardCheck className="w-5 h-5" />
                            <span>إرسال للاعتماد</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QualityInspectionPage;