// src/hooks/useNotificationPolling.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { approvalService } from '../services/approvalService';
import { grnService } from '../services/grnService';
import { purchaseOrderService } from '../services/purchaseOrderService';
import { customerRequestService } from '../services/customerRequestService';
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

export interface NotificationCounts {
    pendingApprovals: number;
    pendingInspections: number;
    waitingImports: number;
    pendingCustomerRequests: number;
}

export function useNotificationPolling(pathname: string) {
    const [counts, setCounts] = useState<NotificationCounts>({
        pendingApprovals: 0,
        pendingInspections: 0,
        waitingImports: 0,
        pendingCustomerRequests: 0,
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
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        // الصلاحيات من user المحفوظ عند تسجيل الدخول (JWT / API /me) → localStorage.getItem('user')
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        if (!user?.userId) return;

        const permissions: string[] = Array.isArray(user?.permissions) ? user.permissions : [];
        const has = (p: string) => permissions.includes(p);

        const soundEnabled = localStorage.getItem('approvals_sound') !== 'off';
        const currentPath = pathnameRef.current;

        // نستدعي فقط الـ APIs التي يسمح بها دور المستخدم (لتجنب 403 و"فشل تحميل البيانات")
        type TaggedPromise = Promise<{ type: 'approvals' | 'inspections' | 'imports' | 'cr'; value: any }>;
        const tasks: TaggedPromise[] = [];

        tasks.push(
            approvalService.getPendingRequests(user.userId).then(value => ({ type: 'approvals' as const, value }))
        );
        // GRN (فحص شحنات): مطابق للـ backend (WAREHOUSE_SECTION = SECTION_WAREHOUSE or SECTION_OPERATIONS or SECTION_PROCUREMENT or INVENTORY_VIEW)
        if (has('SECTION_PROCUREMENT') || has('SECTION_WAREHOUSE') || has('SECTION_OPERATIONS') || has('INVENTORY_VIEW')) {
            tasks.push(grnService.getAllGRNs().then(value => ({ type: 'inspections' as const, value })));
        }
        // أوامر شراء واردة: فقط لمن لديه صلاحية مشتريات أو مبيعات أو فواتير موردين (مطابق للـ backend)
        if (has('SECTION_PROCUREMENT') || has('SECTION_SALES') || has('SUPPLIER_INVOICE_VIEW')) {
            tasks.push(purchaseOrderService.getWaitingForArrivalPOs().then(value => ({ type: 'imports' as const, value })));
        }
        // طلبات العملاء: فقط لمن لديه قسم المبيعات (مدير مالي لا يملك SECTION_SALES → لا نستدعي)
        if (has('SECTION_SALES')) {
            tasks.push(customerRequestService.getAllRequests().then(value => ({ type: 'cr' as const, value })));
        }

        const results = await Promise.allSettled(tasks);

        for (const settled of results) {
            if (settled.status !== 'fulfilled') continue;
            const { type, value } = settled.value;

            if (type === 'approvals') {
                const requests = value?.data || [];
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
                prevApprovalIds.current = currentIds;
                setCounts(prev =>
                    prev.pendingApprovals === requests.length ? prev : { ...prev, pendingApprovals: requests.length }
                );
            } else if (type === 'inspections') {
                const grns = value || [];
                const currentCount = grns.filter((g: any) => g.status === 'Pending Inspection').length;
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
                setCounts(prev =>
                    prev.pendingInspections === currentCount ? prev : { ...prev, pendingInspections: currentCount }
                );
            } else if (type === 'imports') {
                const waitingPOs = value || [];
                setCounts(prev =>
                    prev.waitingImports === waitingPOs.length ? prev : { ...prev, waitingImports: waitingPOs.length }
                );
            } else if (type === 'cr') {
                const requests = value?.data || [];
                const pendingCount = requests.filter((r: any) => r.status === 'Pending').length;
                setCounts(prev =>
                    prev.pendingCustomerRequests === pendingCount
                        ? prev
                        : { ...prev, pendingCustomerRequests: pendingCount }
                );
            }
        }

        isInitialLoad.current = false;
    }, []);

    // ─── Adaptive scheduling loop ───
    const scheduleNext = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        // If Service Worker is active and polling, we can significantly slow down main-thread polling
        // or stop it entirely for pendingApprovals.
        const interval = getInterval();
        timerRef.current = setTimeout(async () => {
            // Check if SW is active - if so, only fetch things SW doesn't handle (yet)
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
                // Tab came back — fetch immediately & reschedule
                fetchAll();
                scheduleNext();
            } else if (!isTabVisible.current) {
                // Tab went hidden — reschedule with longer interval
                scheduleNext();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () =>
            document.removeEventListener('visibilitychange', handleVisibility);
    }, [fetchAll, scheduleNext]);

    // ─── Service Worker Listener ───
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleMessage = (event: MessageEvent) => {
            const { channel, payload } = event.data;
            if (channel === 'notification_counts') {
                const { pendingApprovals } = payload;
                setCounts(prev => ({
                    ...prev,
                    pendingApprovals
                }));
                // Also trigger internal event bus for synchronized refreshes
                window.dispatchEvent(new CustomEvent(REFRESH_DATA_EVENT, {
                    detail: { type: 'approvals', count: pendingApprovals, source: 'sw' }
                }));
            }
        };

        navigator.serviceWorker.addEventListener('message', handleMessage);
        return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }, []);

    // ─── Re-schedule when path changes (interval may differ) ───
    useEffect(() => {
        scheduleNext();
    }, [pathname, scheduleNext]);

    // ─── Initial fetch + cleanup ───
    useEffect(() => {
        // Request notification permission once
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // First fetch
        fetchAll();
        scheduleNext();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            abortRef.current?.abort();
        };
    }, []); // mount only

    return counts;
}