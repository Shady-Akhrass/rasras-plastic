import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Save,
    ArrowRight,
    Trash2,
    FileText,
    Truck,
    Send,
    Phone,
    Clock,
    CheckCircle2,
    Eye,
    XCircle,
    RefreshCw,
    Lock,
    Calendar,
    Edit3,
    Info,
    ClipboardList,
    User,
    Package,
    DollarSign,
} from 'lucide-react';
import { deliveryOrderService, type DeliveryOrderDto, type DeliveryOrderItemDto } from '../../services/deliveryOrderService';
import { stockIssueNoteService, type StockIssueNoteDto } from '../../services/stockIssueNoteService';
import { saleOrderService } from '../../services/saleOrderService';
import { salesQuotationService } from '../../services/salesQuotationService';
import { customerRequestService } from '../../services/customerRequestService';
import { approvalService } from '../../services/approvalService';
import { toast } from 'react-hot-toast';
import { vehicleService, type VehicleDto } from '../../services/vehicleService';
import { formatDate } from '../../utils/format';
import type { CustomerRequest } from '../../types/sales';

const inputClass = (isReadOnly: boolean, extra = '') =>
    `w-full px-4 py-3 border-2 border-transparent rounded-xl 
    focus:border-brand-primary outline-none transition-all font-semibold
    ${isReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-slate-50 focus:bg-white'} ${extra}`;

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
        'Pending': { label: 'قيد الانتظار', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
        'InTransit': { label: 'في الطريق', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Truck },
        'Delivered': { label: 'تم التوصيل', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
        'Cancelled': { label: 'ملغي', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
    };
    const c = config[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: FileText };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
            <c.icon className="w-3.5 h-3.5" />
            {c.label}
        </span>
    );
};

const DeliveryOrderFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const issueNoteIdParam = searchParams.get('issueNoteId');
    const scheduleIdParam = searchParams.get('scheduleId');
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [issueNotes, setIssueNotes] = useState<StockIssueNoteDto[]>([]);
    const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
    const [customerRequest, setCustomerRequest] = useState<CustomerRequest | null>(null);
    const [loadingCR, setLoadingCR] = useState(false);
    const [selectedSchedules, setSelectedSchedules] = useState<Set<number>>(new Set());
    const [allSINItems, setAllSINItems] = useState<DeliveryOrderItemDto[]>([]);
    const [usedScheduleIds, setUsedScheduleIds] = useState<Set<number>>(new Set());

    const approvalId = searchParams.get('approvalId');
    const isView = searchParams.get('mode') === 'view';
    const isEdit = !!id && !isNew;

    const [form, setForm] = useState<DeliveryOrderDto>({
        issueNoteId: 0,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryAddress: '',
        driverName: '',
        driverPhone: '',
        vehicleNo: '',
        status: 'Draft',
        notes: ''
    });

    useEffect(() => {
        (async () => {
            try {
                const [list, dos] = await Promise.all([
                    stockIssueNoteService.getAll(),
                    deliveryOrderService.getAll()
                ]);

                // Filter out SINs that already have a delivery order
                // (except for the current DO's SIN if we're editing)
                const usedSINIds = (Array.isArray(dos) ? dos : [])
                    .filter(d => d.id !== Number(id))
                    .map(d => d.issueNoteId)
                    .filter(sid => sid);

                const approved = (Array.isArray(list) ? list : [])
                    .filter((n) => n.status === 'Approved' && !usedSINIds.includes(n.id!));

                setIssueNotes(approved);
                const vehicleList = await vehicleService.getActive();
                setVehicles(vehicleList);
            } catch { toast.error('فشل تحميل البيانات'); }
        })();
    }, [id]);

    // ─── Map selected Issue Note data into the form ───
    const populateFromIssueNote = async (sin: StockIssueNoteDto) => {
        // Fetch SaleOrder to get cost, address, and item prices
        let deliveryCostVal = 0;
        let otherCostsVal = 0;
        let addressVal = '';
        let soDetails: any = null;

        if (sin.salesOrderId) {
            try {
                soDetails = await saleOrderService.getById(sin.salesOrderId);
                if (soDetails) {
                    deliveryCostVal = soDetails.deliveryCost ?? 0;
                    otherCostsVal = soDetails.otherCosts ?? 0;
                    addressVal = soDetails.shippingAddress || '';
                }
            } catch (err) {
                console.error('Failed to fetch SaleOrder for costs:', err);
            }
        }

        const mappedItems: DeliveryOrderItemDto[] = (sin.items || []).map(item => {
            const soItem = soDetails?.items?.find((si: any) => si.itemId === item.itemId);
            const qty = item.issuedQty || item.requestedQty || 0;
            const unitPrice = soItem?.unitPrice || item.unitCost || 0;
            const discPerc = soItem?.discountPercentage || 0;
            const subtotal = qty * unitPrice;
            const discAmt = subtotal * (discPerc / 100);

            return {
                itemId: item.itemId,
                itemNameAr: item.itemNameAr,
                itemCode: item.itemCode,
                qty: qty,
                unitId: item.unitId,
                unitNameAr: item.unitNameAr,
                unitPrice: unitPrice,
                discountPercentage: discPerc,
                totalPrice: subtotal - discAmt,
                notes: item.notes || '',
            };
        });

        const subTotal = mappedItems.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
        const taxAmount = soDetails?.taxAmount ?? 0;
        const totalAmount = subTotal + taxAmount + deliveryCostVal + otherCostsVal;

        // Try to match vehicleNo to a vehicleId if vehicles are loaded
        const matchedVehicle = vehicles.find(v => v.plateNumber === sin.vehicleNo);

        setAllSINItems(mappedItems);

        setForm(f => ({
            ...f,
            issueNoteId: sin.id || 0,
            issueNoteNumber: sin.issueNoteNumber,
            customerNameAr: sin.customerNameAr,
            customerId: sin.customerId,
            customerCode: sin.customerCode,
            driverName: sin.driverName || f.driverName || '',
            driverPhone: '',
            vehicleNo: sin.vehicleNo || f.vehicleNo || '',
            vehicleId: matchedVehicle?.id || f.vehicleId,
            deliveryAddress: addressVal || f.deliveryAddress || '',
            saleOrderId: sin.salesOrderId,
            saleOrderNumber: sin.soNumber,
            subTotal: subTotal,
            taxAmount: taxAmount,
            deliveryCost: deliveryCostVal,
            otherCosts: otherCostsVal,
            totalAmount: totalAmount,
            notes: sin.notes || f.notes || '',
            items: mappedItems,
        }));

        // Fetch used schedules for this issue note
        if (sin.id) {
            try {
                const existing = await deliveryOrderService.getByIssueNoteId(sin.id);
                const used = new Set<number>();
                existing.forEach(doOrder => {
                    if (doOrder.scheduleId) used.add(doOrder.scheduleId);
                    if (doOrder.selectedScheduleIds) {
                        doOrder.selectedScheduleIds.forEach(sid => used.add(sid));
                    }
                });

                // If editing, don't hide the current order's schedules
                if (id) {
                    const orderIdNum = Number(id);
                    const currentOrder = existing.find(o => o.id === orderIdNum);
                    if (currentOrder?.scheduleId) used.delete(currentOrder.scheduleId);
                    if (currentOrder?.selectedScheduleIds) {
                        currentOrder.selectedScheduleIds.forEach(sid => used.delete(sid));
                    }
                }

                setUsedScheduleIds(used);
            } catch (err) {
                console.error('Failed to fetch used schedules:', err);
            }
        }
    };

    useEffect(() => {
        if (issueNoteIdParam) {
            const sid = parseInt(issueNoteIdParam);
            // Try to populate from already-loaded list, or fetch directly
            const found = issueNotes.find(n => n.id === sid);
            if (found) {
                populateFromIssueNote(found);
            } else {
                // Fetch full data for this issue note
                (async () => {
                    const sin = await stockIssueNoteService.getById(sid);
                    if (sin) await populateFromIssueNote(sin);
                    else setForm((f) => ({ ...f, issueNoteId: sid || 0 }));
                })();
            }
            if (sid) fetchFullCRTrail(sid);
        }
    }, [issueNoteIdParam, issueNotes, vehicles]); // Added vehicles to dependency to allow matching

    useEffect(() => {
        if (!isNew && id) {
            setLoading(true);
            (async () => {
                try {
                    const d = await deliveryOrderService.getById(parseInt(id));
                    if (d) {
                        setForm({ ...d, issueNoteId: d.issueNoteId ?? 0 });
                        if (d.issueNoteId) fetchFullCRTrail(d.issueNoteId);

                        // If it has selectedScheduleIds, pre-select them in the UI state
                        if (d.selectedScheduleIds && d.selectedScheduleIds.length > 0) {
                            // We need customerRequest to be loaded to find indices
                            // fetchFullCRTrail will handle it via setCustomerRequest
                        }
                    }
                    else { toast.error('أمر التوصيل غير موجود'); navigate('/dashboard/sales/delivery-orders'); }
                } catch { toast.error('فشل تحميل أمر التوصيل'); navigate('/dashboard/sales/delivery-orders'); }
                finally { setLoading(false); }
            })();
        }
    }, [id, isNew, navigate]);

    // ─── Auto-fill delivery details and items from selected schedules ───
    useEffect(() => {
        if (!customerRequest?.schedules) return;

        if (selectedSchedules.size === 0) {
            // Revert to all items if nothing selected
            // But don't overwrite if it was already populated from SIN unless it's a manual deselect
            setForm(f => {
                // If we already have items and they match allSINItems, do nothing
                // This prevents infinite loops if populateFromIssueNote just set them
                if (f.items === allSINItems && f.scheduleId === undefined) return f;

                return {
                    ...f,
                    items: allSINItems,
                    scheduleId: undefined,
                    scheduledDate: undefined,
                    // If we are in "new" mode and have no selection, we might want to keep the SIN default
                    // but for schedules, it's safer to let the user choose.
                    // However, we shouldn't wipe it if it came from SIN.
                };
            });
            return;
        }

        const schedules = customerRequest.schedules;
        const selected = Array.from(selectedSchedules).sort().map(i => schedules[i]).filter(Boolean);
        if (selected.length === 0) return;

        // Sync items: only include items in the selected schedules
        const scheduleItemMap = new Map<number, number>(); // productId -> qty
        selected.forEach(s => {
            if (s.productId && s.quantity) {
                scheduleItemMap.set(s.productId, (scheduleItemMap.get(s.productId) || 0) + s.quantity);
            }
        });

        const filteredItems = allSINItems.filter(item => scheduleItemMap.has(item.itemId)).map(item => ({
            ...item,
            qty: scheduleItemMap.get(item.itemId) || 0
        }));

        const firstScheduleId = selected[0].scheduleId;

        if (selected.length === 1) {
            const s = selected[0];
            setForm(f => ({
                ...f,
                items: filteredItems,
                scheduleId: s.scheduleId,
                scheduledDate: s.deliveryDate,
                deliveryDate: s.deliveryDate,
                notes: s.notes || f.notes || '',
            }));
        } else {
            const earliest = selected.reduce((min, s) => s.deliveryDate < min ? s.deliveryDate : min, selected[0].deliveryDate);
            const datesSummary = selected.map(s => `${formatDate(s.deliveryDate)} (${s.quantity} قطعة)`).join(' | ');
            setForm(f => ({
                ...f,
                items: filteredItems,
                scheduleId: firstScheduleId, // Link to first one even if multiple
                selectedScheduleIds: Array.from(selectedSchedules).map(idx => schedules[idx]?.scheduleId).filter(Boolean) as number[],
                scheduledDate: earliest,
                deliveryDate: earliest,
                notes: `مواعيد مجدولة: ${datesSummary}`,
            }));
        }
    }, [selectedSchedules, customerRequest, allSINItems]);

    // Trace back to CustomerRequest for schedules
    const fetchFullCRTrail = async (issueNoteId: number) => {
        try {
            setLoadingCR(true);
            const sin = await stockIssueNoteService.getById(issueNoteId);
            if (!sin?.salesOrderId) return;

            const so = await saleOrderService.getById(sin.salesOrderId);
            if (!so?.salesQuotationId) return;

            const sq = await salesQuotationService.getById(so.salesQuotationId);
            if (!sq?.requestId) return;

            const crResponse = await customerRequestService.getRequestById(sq.requestId);
            if (crResponse.success && crResponse.data) {
                setCustomerRequest(crResponse.data);

                const currentSchedules = crResponse.data.schedules || [];

                // 1. Check for scheduleIdParam (new link from SIN list)
                if (scheduleIdParam) {
                    const sid = parseInt(scheduleIdParam);
                    const idx = currentSchedules.findIndex((s: any) => s.scheduleId === sid);
                    if (idx !== -1) {
                        setSelectedSchedules(new Set([idx]));
                    }
                }
                // 2. Or check for existing selectedScheduleIds (edit mode)
                else if (form.selectedScheduleIds && form.selectedScheduleIds.length > 0) {
                    const newSelection = new Set<number>();
                    form.selectedScheduleIds.forEach((sid: number) => {
                        const idx = currentSchedules.findIndex((s: any) => s.scheduleId === sid);
                        if (idx !== -1) newSelection.add(idx);
                    });
                    if (newSelection.size > 0) {
                        setSelectedSchedules(newSelection);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch CR trail:', err);
        } finally {
            setLoadingCR(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (isReadOnly) return;
        if (isNew) {
            if (!form.issueNoteId) { toast.error('اختر إذن الصرف'); return; }
            setSaving(true);
            try {
                const created = await deliveryOrderService.createFromIssueNote(
                    form.issueNoteId,
                    scheduleIdParam ? parseInt(scheduleIdParam) : undefined
                );
                if (created?.id) {
                    // Update the newly created DO with actual form data (Driver Phone, Costs, etc.)
                    try {
                        await deliveryOrderService.update(created.id, {
                            ...created,
                            ...form,
                            id: created.id,
                            deliveryOrderNumber: created.deliveryOrderNumber
                        });
                    } catch (updateErr) {
                        console.error('Failed to update DO with form data:', updateErr);
                        toast.error('حدث خطأ أثناء حفظ تفاصيل أمر التوصيل');
                    }

                    toast.success('تم إنشاء أمر التوصيل');
                    // Automatically submit for approval
                    try {
                        const submitted = await deliveryOrderService.submitForApproval(created.id);
                        if (submitted) {
                            toast.success('تم إرسال أمر التوصيل للاعتماد تلقائياً');
                        }
                    } catch (err: any) {
                        console.error('Auto-submission failed:', err);
                        toast.error('فشل الإرسال التلقائي للاعتماد، يرجى الإرسال يدوياً');
                    }
                    navigate('/dashboard/sales/delivery-orders');
                } else {
                    toast.error('فشل الإنشاء');
                }
            } catch (err: any) {
                toast.error(err?.response?.data?.message || 'فشل الإنشاء');
            } finally { setSaving(false); }
            return;
        }
        if (!form.id) return;
        setSaving(true);
        try {
            const updated = await deliveryOrderService.update(form.id, form);
            if (updated) {
                toast.success('تم تحديث أمر التوصيل');
                navigate('/dashboard/sales/delivery-orders');
            } else {
                toast.error('فشل التحديث');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل الحفظ');
        } finally { setSaving(false); }
    };

    const isReadOnly = isView || (isEdit && form.status !== 'Draft' && form.status !== 'Pending' && form.status !== 'Rejected');

    const handleDelete = async () => {
        if (!form.id || !window.confirm('بعد الحذف لا يمكن استعادة البيانات. هل أنت متأكد؟')) return;
        try {
            const ok = await deliveryOrderService.delete(form.id);
            if (ok) { toast.success('تم الحذف'); navigate('/dashboard/sales/delivery-orders'); }
            else toast.error('فشل الحذف');
        } catch { toast.error('فشل الحذف'); }
    };

    const handleSubmitForApproval = async () => {
        if (!id || isNew) {
            toast.error('يجب حفظ أمر التوصيل أولاً قبل الإرسال للاعتماد');
            return;
        }
        if (form.status !== 'Draft' && form.status !== 'Rejected') {
            toast.error('يمكن إرسال المسودات أو المرفوضة فقط للاعتماد');
            return;
        }
        try {
            setProcessing(true);
            const updated = await deliveryOrderService.submitForApproval(parseInt(id!));
            if (updated) {
                setForm(updated);
                toast.success('تم إرسال أمر التوصيل للاعتماد بنجاح');
                navigate('/dashboard/sales/delivery-orders');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'فشل إرسال أمر التوصيل للاعتماد');
        } finally {
            setProcessing(false);
        }
    };

    const handleApprovalAction = async (action: 'Approved' | 'Rejected') => {
        if (!approvalId) return;
        try {
            setProcessing(true);
            const toastId = toast.loading('جاري تنفيذ الإجراء...');
            await approvalService.takeAction(parseInt(approvalId), 1, action);
            toast.success(action === 'Approved' ? 'تم الاعتماد بنجاح' : 'تم رفض الطلب', { id: toastId });
            navigate('/dashboard/sales/approvals');
        } catch {
            toast.error('فشل تنفيذ الإجراء');
        } finally {
            setProcessing(false);
        }
    };

    if (!isNew && !form.deliveryOrderNumber && loading) return <div className="p-8 text-center bg-white rounded-3xl animate-pulse">جاري التحميل...</div>;

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            {/* ═══ HEADER ═══ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-primary/95 to-brand-primary/90 rounded-3xl p-8 text-white shadow-2xl animate-slide-in">
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-white/15 rounded-full animate-pulse delay-300" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => navigate('/dashboard/sales/delivery-orders')}
                            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-2xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Truck className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">
                                    {isNew ? 'إنشاء أمر توصيل جديد' : `أمر توصيل رقم ${form.deliveryOrderNumber || '—'}`}
                                </h1>
                                {isReadOnly && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-xs font-bold border border-white/20"><Lock className="w-3 h-3" /> للعرض فقط</span>}
                                {form.approvalStatus && (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${form.approvalStatus === 'Approved' ? 'bg-emerald-500/20 text-white border-emerald-300/30' :
                                        form.approvalStatus === 'Rejected' ? 'bg-rose-500/20 text-white border-rose-300/30' :
                                            form.approvalStatus === 'Pending' ? 'bg-amber-500/20 text-white border-amber-300/30' :
                                                'bg-slate-500/20 text-white border-slate-300/30'
                                        }`}>
                                        {form.approvalStatus === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                                        {form.approvalStatus === 'Rejected' && <XCircle className="w-3 h-3" />}
                                        {form.approvalStatus === 'Pending' && <Clock className="w-3 h-3" />}
                                        {form.approvalStatus === 'Approved' ? 'معتمد' : form.approvalStatus === 'Rejected' ? 'مرفوض' : form.approvalStatus === 'Pending' ? 'قيد الانتظار' : form.approvalStatus}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-lg">
                                {isNew ? 'إدارة وتوجيه الشحنات للعملاء بناءً على أوامر البيع' : 'عرض وتعديل تفاصيل أمر التوصيل'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {/* Status badges */}
                        {!isNew && form.approvalStatus !== 'Draft' && form.approvalStatus !== 'Approved' && !isView && (
                            <div className="px-5 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-bold flex items-center gap-2 border border-amber-100 italic">
                                <Clock className="w-5 h-5" />
                                <span>بانتظار الاعتماد</span>
                            </div>
                        )}

                        {!isReadOnly && form.approvalStatus !== 'Approved' && (
                            <>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-8 py-4 bg-white text-brand-primary rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    <span>{saving ? 'جاري الحفظ...' : (isNew ? 'إنشاء' : 'تحديث')}</span>
                                </button>
                                {isEdit && (form.status === 'Draft' || form.status === 'Rejected') && (
                                    <button
                                        onClick={handleSubmitForApproval}
                                        disabled={processing || saving}
                                        className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                        <span>تعميد</span>
                                    </button>
                                )}
                            </>
                        )}
                        {!isNew && !isReadOnly && (form.status === 'Draft' || form.status === 'Pending' || form.status === 'Rejected') && (
                            <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-4 bg-rose-500/20 text-white rounded-2xl border border-rose-500/30 hover:bg-rose-500/40 transition-all hover:scale-105 active:scale-95">
                                <Trash2 className="w-5 h-5" />
                                <span>حذف الأمر</span>
                            </button>
                        )}

                        {isView && (
                            <div className="flex items-center gap-3 flex-wrap">
                                {approvalId && (
                                    <>
                                        <button
                                            onClick={() => handleApprovalAction('Approved')}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                        >
                                            {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                            <span>اعتماد</span>
                                        </button>
                                        <button
                                            onClick={() => handleApprovalAction('Rejected')}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-xl hover:bg-rose-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
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
                        )}
                        {!isNew && form.status !== 'Delivered' && !isReadOnly && (
                            <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-4 bg-rose-500/20 text-rose-200 rounded-2xl border border-rose-500/30 hover:bg-rose-500/40 transition-all hover:scale-105">
                                <Trash2 className="w-5 h-5" /> حذف
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ READ-ONLY BANNER ═══ */}
            {isReadOnly && (
                <div className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl animate-slide-in">
                    <div className="p-2.5 bg-amber-100 rounded-xl flex-shrink-0">
                        <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-amber-800 font-bold text-sm">
                            {isView
                                ? 'أنت في وضع العرض — جميع الحقول مقفلة ولا يمكن تعديلها'
                                : 'هذا الطلب تم إرساله للاعتماد — لا يمكن تعديل البيانات بعد الإرسال'}
                        </p>
                    </div>
                    {!isNew && !isView && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-lg text-amber-700 text-xs font-bold flex-shrink-0">
                            <Edit3 className="w-3 h-3" />
                            التعديل مغلق
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Info className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">البيانات الأساسية</h3>
                                    <p className="text-slate-500 text-sm">تفاصيل الوجهة والسائق وإذن الصرف</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isNew ? (
                                <>
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <ClipboardList className="w-4 h-4 text-brand-primary" />
                                            إذن الصرف <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={form.issueNoteId || ''}
                                            onChange={(e) => {
                                                const sid = parseInt(e.target.value);
                                                const found = issueNotes.find(n => n.id === sid);
                                                if (found) {
                                                    populateFromIssueNote(found);
                                                } else {
                                                    setForm((f) => ({ ...f, issueNoteId: sid || 0 }));
                                                }
                                                if (sid) fetchFullCRTrail(sid);
                                            }}
                                            className={inputClass(isReadOnly)}
                                        >
                                            <option value="">اختر إذن صرف...</option>
                                            {issueNotes.map((n) => <option key={n.id} value={n.id}>{n.issueNoteNumber} — {n.customerNameAr || n.soNumber || ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <Calendar className="w-4 h-4 text-brand-primary" />
                                            تاريخ الأمر
                                        </label>
                                        <input
                                            type="date"
                                            value={form.orderDate || ''}
                                            disabled={true}
                                            className={inputClass(true)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            رقم إذن الصرف
                                        </label>
                                        <input type="text" value={form.issueNoteNumber || '—'} readOnly className={inputClass(true)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <Calendar className="w-4 h-4 text-brand-primary" />
                                            تاريخ الأمر
                                        </label>
                                        <input
                                            type="date"
                                            value={form.orderDate || ''}
                                            disabled={true}
                                            className={inputClass(true)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <User className="w-4 h-4 text-slate-400" />
                                            العميل
                                        </label>
                                        <input type="text" value={form.customerNameAr || '—'} readOnly className={inputClass(true)} />
                                    </div>
                                </>
                            )}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-brand-primary" />
                                    عنوان التسليم <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={form.deliveryAddress || ''}
                                    onChange={(e) => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                                    readOnly={isReadOnly}
                                    className={inputClass(isReadOnly)}
                                    placeholder="حي، شارع، مبنى..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Truck className="w-4 h-4 text-slate-400" />
                                    المركبة المخصصة
                                </label>
                                <select
                                    value={form.vehicleId || ''}
                                    disabled={isReadOnly}
                                    onChange={(e) => {
                                        const vid = e.target.value ? parseInt(e.target.value) : undefined;
                                        const v = vehicles.find(x => x.id === vid);
                                        setForm(f => ({ ...f, vehicleId: vid, driverName: v?.driverName || f.driverName, driverPhone: v?.driverPhone || f.driverPhone }));
                                    }}
                                    className={inputClass(isReadOnly)}
                                >
                                    <option value="">اختر مركبة...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} ({v.brand} {v.model})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <User className="w-4 h-4 text-slate-400" />
                                    اسم السائق
                                </label>
                                <input type="text" value={form.driverName || ''} onChange={(e) => setForm(f => ({ ...f, driverName: e.target.value }))} readOnly={isReadOnly} className={inputClass(isReadOnly)} />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    رقم هاتف السائق
                                </label>
                                <input type="text" value={form.driverPhone || ''} onChange={(e) => setForm(f => ({ ...f, driverPhone: e.target.value }))} readOnly={isReadOnly} className={inputClass(isReadOnly)} />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                    مصاريف التوصيل
                                </label>
                                <input type="number" min={0} step={0.01} value={form.deliveryCost || ''} onChange={(e) => setForm(f => ({ ...f, deliveryCost: parseFloat(e.target.value) || 0 }))} readOnly={isReadOnly} className={inputClass(isReadOnly)} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <DollarSign className="w-4 h-4 text-amber-500" />
                                    مصاريف أخرى
                                </label>
                                <input type="number" min={0} step={0.01} value={form.otherCosts || ''} onChange={(e) => setForm(f => ({ ...f, otherCosts: parseFloat(e.target.value) || 0 }))} readOnly={isReadOnly} className={inputClass(isReadOnly)} placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    حالة التنفيذ
                                </label>
                                <select
                                    value={form.status || 'Pending'}
                                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                                    disabled={isReadOnly || isNew}
                                    className={inputClass(isReadOnly || isNew)}
                                >
                                    <option value="Pending">قيد الانتظار</option>
                                    <option value="InTransit">في الطريق (جاري التوصيل)</option>
                                    <option value="Delivered">تم التسليم بنجاح</option>
                                    <option value="Cancelled">تم الإلغاء</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Visualization from CR */}
                    {(customerRequest || loadingCR) && (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in">
                            <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-brand-primary/10 rounded-xl">
                                            <Calendar className={`w-5 h-5 text-brand-primary ${loadingCR ? 'animate-bounce' : ''}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{loadingCR ? 'جاري تحميل المواعيد...' : 'المواعيد المجدولة (طلب العميل)'}</h3>
                                            <p className="text-slate-500 text-sm">{(customerRequest?.schedules || []).length} موعد مجدول {selectedSchedules.size > 0 && <span className="text-brand-primary font-bold">• {selectedSchedules.size} محدد</span>}</p>
                                        </div>
                                    </div>
                                    {!loadingCR && (customerRequest?.schedules || []).length > 0 && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const totalSchedules = (customerRequest?.schedules || []);
                                                    // Only count visible (not used) schedules
                                                    const availableSchedules = totalSchedules
                                                        .map((s, i) => ({ s, i }))
                                                        .filter(x => !usedScheduleIds.has(x.s.scheduleId!));

                                                    if (selectedSchedules.size === availableSchedules.length) {
                                                        setSelectedSchedules(new Set());
                                                    } else {
                                                        setSelectedSchedules(new Set(availableSchedules.map(x => x.i)));
                                                    }
                                                }}
                                                className="text-xs font-bold text-brand-primary hover:underline"
                                            >
                                                {selectedSchedules.size === (customerRequest?.schedules || []).length ? 'إلغاء الكل' : 'تحديد الكل'}
                                            </button>

                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                {loadingCR ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 animate-pulse">
                                                <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                                                <div className="h-5 w-28 bg-slate-300 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(customerRequest?.schedules || []).map((s, idx) => {
                                            const isUsed = s.scheduleId && usedScheduleIds.has(s.scheduleId);
                                            if (isUsed) return null; // Filter out used schedules

                                            const isSelected = selectedSchedules.has(idx);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedSchedules(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(idx)) next.delete(idx); else next.add(idx);
                                                            return next;
                                                        });
                                                    }}
                                                    className={`relative cursor-pointer rounded-2xl p-4 pt-8 transition-all group border-2 ${isSelected ? 'bg-brand-primary/5 border-brand-primary shadow-md' : 'bg-slate-50 border-slate-100 hover:border-brand-primary/30'
                                                        }`}
                                                >
                                                    <div className={`absolute top-3 left-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-slate-300 group-hover:border-brand-primary/50'
                                                        }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1 h-8 rounded-full transition-colors ${isSelected ? 'bg-brand-primary' : 'bg-slate-300'}`} />
                                                            <div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase">التاريخ المخطط</div>
                                                                <div className="font-bold text-slate-700 text-base">{formatDate(s.deliveryDate)}</div>
                                                            </div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 text-slate-600'}`}>
                                                            {s.quantity} قطعة
                                                        </div>
                                                    </div>
                                                    {s.notes && <div className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-slate-200">"{s.notes}"</div>}
                                                </div>
                                            );
                                        })}
                                        {(!customerRequest?.schedules || customerRequest.schedules.length === 0) && (
                                            <div className="col-span-2 py-10 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl">
                                                لا توجد جدولة زمنية محددة في طلب العميل
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items Table Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '100ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <Package className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">الأصناف المشحونة</h3>
                                    <p className="text-slate-500 text-sm">{form.items?.length || 0} صنف مضاف</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-600">
                                        <th className="px-6 py-4 text-right">المادة / الصنف</th>
                                        <th className="px-6 py-4 text-center">الكمية</th>
                                        <th className="px-6 py-4 text-center">الوحدة</th>
                                        <th className="px-6 py-4 text-right">ملاحظات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(form.items || []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">{item.itemNameAr || '—'}</div>
                                                <div className="text-xs text-slate-400 font-mono mt-0.5">{item.itemCode}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-mono font-bold text-brand-primary">
                                                    {(item.qty || 0).toLocaleString('ar-EG')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-600">{item.unitNameAr || '—'}</td>
                                            <td className="px-6 py-4 text-slate-500 text-sm italic">{item.notes || '—'}</td>
                                        </tr>
                                    ))}
                                    {(!form.items || form.items.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">
                                                لا توجد أصناف مضافة لهذا الأمر
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>

                {/* ═══ SIDEBAR ═══ */}
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div
                        className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl animate-slide-in relative overflow-hidden"
                        style={{ animationDelay: '200ms' }}
                    >
                        <div className="absolute top-0 left-0 w-32 h-32 bg-brand-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl" />

                        <div className="relative space-y-6">
                            <div className="flex items-center gap-3 pb-6 border-b border-white/5">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                    <Truck className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="font-bold text-xl">ملخص الأمر</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
                                    <div className="text-xs text-slate-400">رقم أمر التوصيل</div>
                                    <div className="font-bold text-xl text-emerald-400 font-mono tracking-wider">
                                        {form.deliveryOrderNumber || '—'}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> التاريخ
                                    </span>
                                    <span className="font-bold text-white/90">
                                        {form.orderDate ? formatDate(form.orderDate) : formatDate(new Date().toISOString())}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-slate-400">
                                    <span className="text-sm">إجمالي الوحدات</span>
                                    <span className="font-black text-xl text-white font-mono">
                                        {(form.items || []).reduce((acc, x) => acc + (x.qty || 0), 0).toLocaleString('ar-EG')}
                                    </span>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400 font-bold uppercase">الحالة الحالية</span>
                                            <StatusBadge status={form.status || 'Pending'} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Receiver Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '300ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <User className="w-5 h-5 text-brand-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">بيانات المستلم</h3>
                                    <p className="text-slate-500 text-sm">معلومات الشخص المستلم للشحنة</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <User className="w-4 h-4 text-slate-400" />
                                    اسم المستلم
                                </label>
                                <input type="text" value={form.receiverName || ''} onChange={(e) => setForm(f => ({ ...f, receiverName: e.target.value }))} readOnly={isReadOnly} placeholder="اسم الشخص المستلم..." className={inputClass(isReadOnly)} />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    هاتف المستلم
                                </label>
                                <input type="text" value={form.receiverPhone || ''} onChange={(e) => setForm(f => ({ ...f, receiverPhone: e.target.value }))} readOnly={isReadOnly} placeholder="رقم الموبايل..." className={inputClass(isReadOnly)} />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden animate-slide-in"
                        style={{ animationDelay: '400ms' }}>
                        <div className="p-6 bg-gradient-to-l from-slate-50 to-white border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-brand-primary/10 rounded-xl">
                                    <FileText className="w-5 h-5 text-brand-primary" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">ملاحظات إضافية</h3>
                            </div>
                        </div>
                        <div className="p-8">
                            <textarea
                                value={form.notes || ''}
                                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                readOnly={isReadOnly}
                                placeholder="ملاحظات التسليم أو أي تفاصيل أخرى..."
                                className={`w-full p-4 border-2 rounded-2xl outline-none transition-all text-sm leading-relaxed h-40 resize-none ${isReadOnly
                                    ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-default'
                                    : 'bg-slate-50 border-transparent hover:border-slate-200 focus:border-brand-primary focus:bg-white'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryOrderFormPage;
