import React, { useState, useEffect } from 'react';
import {
    Bell,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    User,
    Calendar,
    DollarSign,
    RefreshCw,
    MessageSquare,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { approvalService, type ApprovalRequestDto } from '../../services/approvalService';
import toast from 'react-hot-toast';

const ApprovalsInbox: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Mock User ID for now (usually from auth context)
    const currentUserId = 1;

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await approvalService.getPendingRequests(currentUserId);
            // Temporary mapping if BE entity isn't fully DTO-ified
            setRequests(data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل طلبات الاعتماد');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId: number, action: 'Approved' | 'Rejected') => {
        try {
            setProcessingId(requestId);
            await approvalService.takeAction(requestId, currentUserId, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب');
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl shadow-sm">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">بريد الاعتمادات</h1>
                        <p className="text-slate-500 text-sm">لديك {requests.length} طلبات تنتظر مراجعتك</p>
                    </div>
                </div>
                <button
                    onClick={fetchRequests}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-slate-200"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 animate-pulse">جاري تحميل الطلبات...</div>
                ) : requests.length === 0 ? (
                    <div className="bg-white py-20 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-800">صندوق البريد فارغ</h3>
                            <p className="text-slate-500 text-sm">لا توجد طلبات تحتاج لاعتمادك حالياً</p>
                        </div>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                {/* Doc Icon & Type */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`p-4 rounded-2xl ${req.documentType === 'PurchaseOrder' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
                                                {req.documentType}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400">#{req.documentNumber}</span>
                                        </div>
                                        <h3 className="font-black text-slate-800 text-lg uppercase">{req.workflowName}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {req.requestedByName || 'Requester'}</div>
                                            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {req.requestedDate}</div>
                                            <div className="flex items-center gap-1.5 text-brand-primary font-bold"><Clock className="w-3.5 h-3.5" /> {req.currentStepName}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Financials & Priority */}
                                <div className="flex flex-col justify-center items-end gap-1 px-6 border-x border-slate-50">
                                    <div className="text-sm text-slate-400 font-bold">إجمالي القيمة</div>
                                    <div className="text-2xl font-black text-slate-900">
                                        {req.totalAmount.toLocaleString()}
                                        <span className="text-xs text-slate-400 ml-1">EGP</span>
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${req.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        أولوية: {req.priority}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col justify-center gap-3">
                                    <button
                                        onClick={() => handleAction(req.id, 'Approved')}
                                        disabled={processingId === req.id}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        اعتماد
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'Rejected')}
                                        disabled={processingId === req.id}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-rose-500 border-2 border-rose-100 rounded-xl font-bold hover:bg-rose-50 transition-all disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        رفض
                                    </button>
                                </div>
                            </div>

                            {/* Mobile visual link */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ApprovalsInbox;
