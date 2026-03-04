// src/hooks/useNotificationPolling.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { approvalService } from '../services/approvalService';
import { grnService } from '../services/grnService';
import { purchaseOrderService } from '../services/purchaseOrderService';
import purchaseService from '../services/purchaseService';
import { customerRequestService } from '../services/customerRequestService';
import { salesQuotationService } from '../services/salesQuotationService';
import { saleOrderService } from '../services/saleOrderService';
import { stockIssueNoteService } from '../services/stockIssueNoteService';
import toast from 'react-hot-toast';

// ─── Sound & Browser Notification Helpers ───
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.connect(g1); g1.connect(ctx.destination);
        o1.frequency.setValueAtTime(880, ctx.currentTime);
        g1.gain.setValueAtTime(0.15, ctx.currentTime);
        g1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        o1.start(ctx.currentTime); o1.stop(ctx.currentTime + 0.3);

        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
        g2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
        g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        o2.start(ctx.currentTime + 0.15); o2.stop(ctx.currentTime + 0.5);
    } catch { /* silent */ }
};

const sendBrowserNotification = (title: string, body: string, route: string = '/dashboard/approvals') => {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'approval-' + Date.now(),
        });

        // Handle notification click
        notification.onclick = () => {
            window.focus();
            window.location.href = route;
            notification.close();
        };
    }
};

// ─── Global Event Bus for Internal Refreshes ───
export const REFRESH_DATA_EVENT = 'app:refresh_notification_data';
/** Use this to force an immediate refresh from any component */
export const TRIGGER_POLL_EVENT = 'app:trigger_notification_poll';


// ─── Interval Config ───
const INTERVALS = {
    /** When user is on a relevant page (approvals, inspections, etc.) */
    ACTIVE_PAGE: 8_000,       // 8 seconds for "sudden" feel
    /** Normal background polling */
    BACKGROUND: 60_000,      // 1 minute
    /** When tab is hidden — very infrequent */
    HIDDEN_TAB: 300_000,      // 5 minutes
} as const;

// Which paths count as "active" for faster polling
const ACTIVE_PATHS = [
    '/dashboard/approvals',
    '/dashboard/inventory/quality-inspection',
    '/dashboard/procurement/waiting-imports',
    '/dashboard/procurement/grn',
    '/dashboard/sales/customer-requests',
];

export interface Notification {
    id: string | number;
    title: string;
    message: string;
    route: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    module: 'procurement' | 'hr' | 'sales' | 'inventory';
    actionLabel?: string;
}

export interface NotificationCounts {
    pendingApprovals: number;
    pendingInspections: number;
    waitingImports: number;
    pendingCustomerRequests: number;
    waitingDeliveries: number;
    hasDeliveriesToday: boolean;
    actionableNotifications: Notification[];
}

export function useNotificationPolling(pathname: string) {
    const [counts, setCounts] = useState<NotificationCounts>({
        pendingApprovals: 0,
        pendingInspections: 0,
        waitingImports: 0,
        pendingCustomerRequests: 0,
        waitingDeliveries: 0,
        hasDeliveriesToday: false,
        actionableNotifications: [],
    });

    // ─── Refs to track previous state (no re-renders) ───
    const prevApprovalIds = useRef<Set<number>>(new Set());
    const prevInspectionCount = useRef<number | null>(null);
    const isInitialLoad = useRef(true);
    const abortRef = useRef<AbortController | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTabVisible = useRef(true);
    const pathnameRef = useRef(pathname);

    // Keep pathname in sync without causing effect re-runs
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // ─── Determine the right interval ───
    const getInterval = useCallback(() => {
        if (!isTabVisible.current) return INTERVALS.HIDDEN_TAB;
        if (ACTIVE_PATHS.some(p => pathnameRef.current.startsWith(p))) {
            return INTERVALS.ACTIVE_PAGE;
        }
        return INTERVALS.BACKGROUND;
    }, []);

    // ─── Single consolidated fetch (only calls APIs the user has permission for) ───
    const fetchAll = useCallback(async () => {
        // Cancel any in-flight request
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        // الصلاحيات من user المحفوظ عند تسجيل الدخول (JWT / API /me) → localStorage.getItem('user')
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        if (!user?.userId) return;

        const permissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
        const has = (p: string) => permissions.includes(p);

        const soundEnabled = localStorage.getItem('approvals_sound') !== 'off';
        const currentPath = pathnameRef.current;

        // Build only the fetches the user is allowed to call (avoid 403)
        type TaggedPromise = Promise<{ type: 'approvals' | 'inspections' | 'imports' | 'cr' | 'deliveries' | 'prs' | 'rfqs' | 'comparisons' | 'grns' | 'quotations' | 'sales_quotations' | 'sales_orders' | 'sales_invoices' | 'stock_issue_notes'; value: any }>;
        const tasks: TaggedPromise[] = [];

        tasks.push(
            approvalService.getPendingRequests(user.userId).then(value => ({ type: 'approvals' as const, value }))
        );
        // GRN (فحص شحنات): مطابق للـ backend
        if (has('SECTION_PROCUREMENT') || has('SECTION_WAREHOUSE') || has('SECTION_OPERATIONS') || has('INVENTORY_VIEW')) {
            tasks.push(grnService.getAllGRNs().then(value => ({ type: 'inspections' as const, value })));
        }
        // أوامر شراء واردة
        if (has('SECTION_PROCUREMENT') || has('SECTION_SALES') || has('SUPPLIER_INVOICE_VIEW')) {
            tasks.push(purchaseOrderService.getWaitingForArrivalPOs().then(value => ({ type: 'imports' as const, value })));
        }
        // طلبات العملاء
        if (has('SECTION_SALES')) {
            tasks.push(customerRequestService.getAllRequests().then(value => ({ type: 'cr' as const, value })));
            tasks.push(salesQuotationService.getAll().then(value => ({ type: 'sales_quotations' as const, value })));
            tasks.push(saleOrderService.getAll().then(value => ({ type: 'sales_orders' as const, value })));
            // tasks.push(salesInvoiceService.getAll().then(value => ({ type: 'sales_invoices' as const, value })));
            tasks.push(stockIssueNoteService.getAll().then(value => ({ type: 'stock_issue_notes' as const, value })));
            tasks.push(stockIssueNoteService.getPendingDeliveryNotes().then(value => ({ type: 'deliveries' as const, value })));
        }

        // Actionable Procurement Tasks
        if (has('SECTION_PROCUREMENT')) {
            tasks.push(purchaseService.getAllPRs().then(value => ({ type: 'prs' as const, value })));
            tasks.push(purchaseService.getAllRFQs().then(value => ({ type: 'rfqs' as const, value })));
            tasks.push(purchaseService.getAllQuotations().then(value => ({ type: 'quotations' as const, value })));
            // Comparison -> PO notification is removed, so we don't need to fetch all comparisons here anymore
            // tasks.push(purchaseService.getAllComparisons().then(value => ({ type: 'comparisons' as const, value })));
        }

        const results = await Promise.allSettled(tasks);
        const newActionable: Notification[] = [];

        let currentPendingApprovals = 0;
        let currentPendingInspections = 0;
        let currentWaitingImports = 0;
        let currentPendingCustomerRequests = 0;
        let currentWaitingDeliveries = 0;
        let currentHasDeliveriesToday = false;

        // Process fixed values
        for (const settled of results) {
            if (settled.status !== 'fulfilled') continue;
            const { type, value } = settled.value;

            if (type === 'approvals') {
                const requests = value?.data || [];
                currentPendingApprovals = requests.length;
                const currentIds = new Set<number>(requests.map((r: any) => Number(r.id)));

                if (!isInitialLoad.current) {
                    const newRequests = requests.filter(
                        (r: any) => !prevApprovalIds.current.has(r.id)
                    );
                    if (newRequests.length > 0) {
                        if (soundEnabled) playNotificationSound();
                        window.dispatchEvent(new CustomEvent(REFRESH_DATA_EVENT, {
                            detail: { type: 'approvals', count: newRequests.length }
                        }));
                        const count = newRequests.length;
                        if (!currentPath.startsWith('/dashboard/approvals')) {
                            sendBrowserNotification(
                                'طلبات اعتماد جديدة',
                                count === 1
                                    ? 'لديك طلب اعتماد جديد ينتظر مراجعتك'
                                    : `لديك ${count} طلبات اعتماد جديدة`
                            );
                            toast(
                                count === 1 ? 'طلب اعتماد جديد' : `${count} طلبات اعتماد جديدة`,
                                { icon: '🔔', duration: 5000, style: { fontWeight: 'bold' } }
                            );
                        }
                    }
                }

                // Add to actionable list
                requests.forEach((req: any) => {
                    const isCR = req.documentType === 'CustomerRequest' || req.workflowName?.includes('Customer');
                    newActionable.push({
                        id: `appr-${req.id}`,
                        title: isCR ? 'اعتماد طلب عميل' : 'طلب اعتماد جديد',
                        message: isCR
                            ? `العميل: ${req.requestedByName || '...'} - ${req.documentNumber}`
                            : `بانتظار مراجعتك: ${req.requestDetails || req.moduleAr || 'طلب اعتماد'}`,
                        route: `/dashboard/approvals`,
                        type: 'warning',
                        timestamp: new Date(req.createdAt || Date.now()),
                        module: isCR ? 'sales' : 'procurement',
                        actionLabel: isCR ? 'اعتماد مدير المبيعات' : 'مراجعة'
                    });
                });
                prevApprovalIds.current = currentIds;
            } else if (type === 'inspections') {
                const grns = value || [];
                const currentCount = grns.filter((g: any) => g.status === 'Pending Inspection').length;
                currentPendingInspections = currentCount;
                if (
                    !isInitialLoad.current &&
                    prevInspectionCount.current !== null &&
                    currentCount > prevInspectionCount.current
                ) {
                    if (soundEnabled) playNotificationSound();
                    toast.success('شحنة جديدة وصلت وبانتظار الفحص', {
                        icon: '🔍',
                        duration: 5000,
                        style: { fontWeight: 'bold' },
                    });
                }
                prevInspectionCount.current = currentCount;
            } else if (type === 'imports') {
                const waitingPOs = value || [];
                currentWaitingImports = waitingPOs.length;
            } else if (type === 'cr') {
                const requests = value?.data || [];
                currentPendingCustomerRequests = requests.filter((r: any) => r.status === 'Pending').length;
            } else if (type === 'deliveries') {
                const deliveries = value || [];
                currentWaitingDeliveries = deliveries.length;
                const todayStr = new Date().toISOString().split('T')[0];
                currentHasDeliveriesToday = deliveries.some((d: any) => d.deliveryDate?.startsWith(todayStr));
            }
        }

        // Process procurement relational logic
        const prs = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'prs')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'prs') as any).value.value : [];
        const rfqs = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'rfqs')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'rfqs') as any).value.value : [];
        const quotations = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'quotations')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'quotations') as any).value.value : [];
        const inspections = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'inspections')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'inspections') as any).value.value : [];
        const imports = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'imports')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'imports') as any).value.value : [];

        // Sales Data
        const crs = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'cr')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'cr') as any).value.value?.data || [] : [];
        const sQuotes = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'sales_quotations')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'sales_quotations') as any).value.value || [] : [];
        const sOrders = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'sales_orders')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'sales_orders') as any).value.value || [] : [];
        // const sInvoices = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'sales_invoices')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'sales_invoices') as any).value.value || [] : [];
        const sIssueNotes = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'stock_issue_notes')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'stock_issue_notes') as any).value.value || [] : [];
        const deliveries = results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'deliveries')?.status === 'fulfilled' ? (results.find(r => r.status === 'fulfilled' && (r.value as any).type === 'deliveries') as any).value.value : [];

        // 1. PR -> RFQ
        prs.filter((pr: any) => {
            const isApproved = pr.status === 'Approved';
            const hasRfqs = rfqs.some((r: any) => r.prId === pr.id);
            const hasQuots = quotations.some((q: any) =>
                rfqs.filter((r: any) => r.prId === pr.id).some((r: any) => r.id === q.rfqId)
            );
            return isApproved && !hasRfqs && !hasQuots && !pr.hasComparison && !pr.hasActiveOrders;
        })
            .forEach((pr: any) => {
                newActionable.push({
                    id: `pr-rfq-${pr.id}`,
                    title: 'طلب شراء معتمد',
                    message: `طلب الشراء ${pr.prNumber} معتمد وبانتظار طلب عروض أسعار`,
                    route: `/dashboard/procurement/rfq/new?prId=${pr.id}`,
                    type: 'info',
                    timestamp: new Date(pr.approvedDate || pr.updatedAt || Date.now()),
                    module: 'procurement',
                    actionLabel: 'إنشاء طلب عرض سعر'
                });
            });

        // 2. RFQ -> Quotation
        rfqs.filter((rfq: any) => {
            const isOpen = rfq.status === 'Open' || rfq.status === 'Sent';
            const hasQuots = quotations.some((q: any) => q.rfqId === rfq.id);
            return isOpen && !hasQuots;
        })
            .forEach((rfq: any) => {
                newActionable.push({
                    id: `rfq-quo-${rfq.id}`,
                    title: 'طلب عرض سعر مرسل',
                    message: `طلب عرض السعر ${rfq.rfqNumber} مرسل وبانتظار تسجيل عرض المورد`,
                    route: `/dashboard/procurement/quotation/new?rfqId=${rfq.id}`,
                    type: 'info',
                    timestamp: new Date(rfq.rfqDate || Date.now()),
                    module: 'procurement',
                    actionLabel: 'تسجيل عرض المورد'
                });
            });

        // 3. PR -> QCS (Comparison)
        prs.filter((pr: any) => pr.status === 'Approved' && !pr.hasComparison)
            .forEach((pr: any) => {
                const prRfqs = rfqs.filter((r: any) => r.prId === pr.id);
                const hasQuots = quotations.some((q: any) => prRfqs.some((r: any) => r.id === q.rfqId));
                if (hasQuots) {
                    newActionable.push({
                        id: `pr-qcs-${pr.id}`,
                        title: 'عروض أسعار جاهزة للمقارنة',
                        message: `طلب الشراء ${pr.prNumber} لديه عروض أسعار مستلمة وبانتظار عمل مقارنة العروض`,
                        route: `/dashboard/procurement/comparison/new?prId=${pr.id}`,
                        type: 'warning',
                        timestamp: new Date(),
                        module: 'procurement',
                        actionLabel: 'إنشاء مقارنة عروض'
                    });
                }
            });

        // 4. Comparison -> PO (Removed as per user request — this approach is done automatically/manually on page)
        /*
        comparisons.filter((c: any) => c.status === 'Approved' && c.approvalStatus === 'Approved')
            .forEach((c: any) => {
                newActionable.push({
                    id: `qcs-po-${c.id}`,
                    title: 'مقارنة عروض معتمدة',
                    message: `مقارنة العروض ${c.comparisonNumber} معتمدة وبانتظار إنشاء أمر الشراء`,
                    route: `/dashboard/procurement/po/new?comparisonId=${c.id}`,
                    type: 'success',
                    timestamp: new Date(c.comparisonDate || Date.now()),
                    module: 'procurement',
                    actionLabel: 'إنشاء أمر شراء'
                });
            });
        */

        // 5. PO -> Waiting Imports
        imports.forEach((po: any) => {
            newActionable.push({
                id: `po-import-${po.id}`,
                title: 'شحنة متوقع وصولها',
                message: `أمر الشراء ${po.poNumber} من ${po.supplierNameAr} متوقع وصوله قريباً`,
                route: `/dashboard/procurement/waiting-imports?poId=${po.id}`,
                type: 'info',
                timestamp: new Date(po.expectedDeliveryDate || Date.now()),
                module: 'procurement',
                actionLabel: 'تسجيل وصول'
            });
        });

        // 6. GRN -> Quality Inspection
        inspections.filter((grn: any) => grn.status === 'Pending Inspection')
            .forEach((grn: any) => {
                newActionable.push({
                    id: `grn-insp-${grn.id}`,
                    title: 'فحص جودة مطلوب',
                    message: `إذن الإضافة ${grn.grnNumber} بانتظار فحص الجودة`,
                    route: `/dashboard/inventory/quality-inspection?grnId=${grn.id}`,
                    type: 'warning',
                    timestamp: new Date(grn.grnDate || Date.now()),
                    module: 'inventory',
                    actionLabel: 'بدء الفحص'
                });
            });

        // ─── Sales Flow Relational Logic ───

        // 1. Pending Customer Request -> Create Quotation
        crs.filter((cr: any) => {
            const hasQuote = sQuotes.some((q: any) => q.requestId === cr.requestId);
            const hasOrder = sOrders.some((o: any) => o.salesQuotationId && sQuotes.filter((q: any) => q.requestId === cr.requestId).some((q: any) => q.id === o.salesQuotationId));
            return cr.status === 'Pending' && !hasQuote && !hasOrder;
        })
            .forEach((cr: any) => {
                newActionable.push({
                    id: `cr-new-${cr.id}`,
                    title: 'طلب عميل',
                    message: `${cr.requestNumber} - العميل: ${cr.customerNameAr || 'عميل'}`,
                    route: `/dashboard/sales/customer-requests`,
                    type: 'info',
                    timestamp: new Date(cr.requestDate || cr.createdAt || Date.now()),
                    module: 'sales',
                    actionLabel: 'مراجعة'
                });
            });

        // 2. Approved Request -> Quotation (If not already handled by "Pending")
        crs.filter((cr: any) => {
            const isApproved = cr.status === 'Approved' || cr.status === 'Accepted';
            const hasQuote = sQuotes.some((q: any) => q.requestId === cr.requestId);
            return isApproved && !hasQuote;
        })
            .forEach((cr: any) => {
                newActionable.push({
                    id: `cr-quote-${cr.id}`,
                    title: 'طلب عميل مقبول',
                    message: `طلب العميل ${cr.requestNumber} مقبول وبانتظار إنشاء عرض سعر`,
                    route: `/dashboard/sales/quotations/new?requestId=${cr.id}`,
                    type: 'warning',
                    timestamp: new Date(cr.updatedAt || Date.now()),
                    module: 'sales',
                    actionLabel: 'إنشاء عرض سعر'
                });
            });

        // 3. Approved Quotation -> Sales Order
        sQuotes.filter((q: any) => {
            const isApproved = q.status === 'Approved' || q.status === 'Accepted';
            const hasOrder = sOrders.some((o: any) => o.salesQuotationId === q.id);
            return isApproved && !hasOrder;
        })
            .forEach((q: any) => {
                newActionable.push({
                    id: `q-so-${q.id}`,
                    title: 'عرض سعر معتمد',
                    message: `عرض السعر ${q.quotationNumber} معتمد وبانتظار تحويله لأمر بيع`,
                    route: `/dashboard/sales/orders/new?quotationId=${q.id}`,
                    type: 'success',
                    timestamp: new Date(q.updatedAt || q.quotationDate || Date.now()),
                    module: 'sales',
                    actionLabel: 'إنشاء أمر بيع'
                });
            });

        // 4. Approved Sales Order -> Stock Issue Note
        sOrders.filter((o: any) => {
            const isApproved = o.status === 'Approved' || o.status === 'Confirmed';
            const hasSIN = sIssueNotes.some((sn: any) => sn.salesOrderId === o.id);
            return isApproved && !hasSIN;
        })
            .forEach((o: any) => {
                newActionable.push({
                    id: `so-sin-${o.id}`,
                    title: 'أمر بيع معتمد',
                    message: `أمر البيع ${o.soNumber} معتمد وبانتظار إذن الصرف`,
                    route: `/dashboard/sales/issue-notes/new?orderId=${o.id}`,
                    type: 'warning',
                    timestamp: new Date(o.updatedAt || o.soDate || Date.now()),
                    module: 'sales',
                    actionLabel: 'إصدار إذن صرف'
                });
            });

        // 5. Approved SIN -> Delivery Order (using Pending Delivery Notes for schedule mapping)
        deliveries.forEach((d: any) => {
            newActionable.push({
                id: `sin-do-${d.issueNoteId}-${d.scheduleId || '0'}`,
                title: 'في انتظار التوصيل',
                message: `إذن الصرف ${d.issueNoteNumber} معتمد وجاهز للتوصيل`,
                route: `/dashboard/sales/delivery-orders/new?issueNoteId=${d.issueNoteId}${d.scheduleId ? `&scheduleId=${d.scheduleId}` : ''}`,
                type: 'success',
                timestamp: new Date(d.issueDate || d.updatedAt || Date.now()),
                module: 'sales',
                actionLabel: 'إنشاء أمر توصيل'
            });
        });


        // 7. GRN Inspected -> Store In
        inspections.filter((grn: any) => grn.status === 'Inspected')
            .forEach((grn: any) => {
                newActionable.push({
                    id: `grn-store-${grn.id}`,
                    title: 'جاهز للإضافة للمخزن',
                    message: `إذن الإضافة ${grn.grnNumber} تم فحصه وبانتظار الإدخال النهائي للمخزن`,
                    route: `/dashboard/procurement/grn`,
                    type: 'success',
                    timestamp: new Date(grn.updatedAt || grn.grnDate || Date.now()),
                    module: 'inventory',
                    actionLabel: 'إتمام الإضافة'
                });
            });

        setCounts({
            pendingApprovals: currentPendingApprovals,
            pendingInspections: currentPendingInspections,
            waitingImports: currentWaitingImports,
            pendingCustomerRequests: currentPendingCustomerRequests,
            waitingDeliveries: currentWaitingDeliveries,
            hasDeliveriesToday: currentHasDeliveriesToday,
            actionableNotifications: newActionable.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        });

        isInitialLoad.current = false;
    }, [pathnameRef]);

    // ─── Adaptive scheduling loop ───
    const scheduleNext = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const interval = getInterval();
        timerRef.current = setTimeout(async () => {
            const hasSW = !!navigator.serviceWorker?.controller;
            if (!hasSW) {
                await fetchAll();
            }
            scheduleNext();
        }, interval);
    }, [fetchAll, getInterval]);

    // ─── Visibility change handler ───
    useEffect(() => {
        const handleVisibility = () => {
            const wasHidden = !isTabVisible.current;
            isTabVisible.current = !document.hidden;
            if (isTabVisible.current && wasHidden) {
                fetchAll();
                scheduleNext();
            } else if (!isTabVisible.current) {
                scheduleNext();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [fetchAll, scheduleNext]);

    // ─── External Trigger Listener ───
    useEffect(() => {
        const handleTrigger = () => {
            fetchAll();
        };
        window.addEventListener(TRIGGER_POLL_EVENT, handleTrigger);
        return () => window.removeEventListener(TRIGGER_POLL_EVENT, handleTrigger);
    }, [fetchAll]);

    // ─── Service Worker Listener ───
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        const handleMessage = (event: MessageEvent) => {
            const { channel, payload } = event.data;
            if (channel === 'notification_counts') {
                const { pendingApprovals } = payload;
                setCounts(prev => ({ ...prev, pendingApprovals }));
                window.dispatchEvent(new CustomEvent(REFRESH_DATA_EVENT, {
                    detail: { type: 'approvals', count: pendingApprovals, source: 'sw' }
                }));
            }
        };
        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }, []);

    // ─── Re-schedule when path changes ───
    useEffect(() => {
        scheduleNext();
    }, [pathname, scheduleNext]);

    // ─── Initial fetch + cleanup ───
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        fetchAll();
        scheduleNext();
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, []);

    return counts;
}