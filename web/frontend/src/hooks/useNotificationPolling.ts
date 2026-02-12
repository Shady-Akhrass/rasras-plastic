// src/hooks/useNotificationPolling.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { approvalService } from '../services/approvalService';
import { grnService } from '../services/grnService';
import { purchaseOrderService } from '../services/purchaseOrderService';
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

// ─── Interval Config ───
const INTERVALS = {
    /** When user is on a relevant page (approvals, inspections, etc.) */
    ACTIVE_PAGE: 30_000,      // 30 seconds
    /** Normal background polling */
    BACKGROUND: 120_000,      // 2 minutes
    /** When tab is hidden — very infrequent */
    HIDDEN_TAB: 300_000,      // 5 minutes
} as const;

// Which paths count as "active" for faster polling
const ACTIVE_PATHS = [
    '/dashboard/approvals',
    '/dashboard/inventory/quality-inspection',
    '/dashboard/procurement/waiting-imports',
    '/dashboard/procurement/grn',
];

export interface NotificationCounts {
    pendingApprovals: number;
    pendingInspections: number;
    waitingImports: number;
}

export function useNotificationPolling(pathname: string) {
    const [counts, setCounts] = useState<NotificationCounts>({
        pendingApprovals: 0,
        pendingInspections: 0,
        waitingImports: 0,
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

    // ─── Single consolidated fetch ───
    const fetchAll = useCallback(async () => {
        // Cancel any in-flight request
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        if (!user?.userId) return;

        const soundEnabled = localStorage.getItem('approvals_sound') !== 'off';
        const currentPath = pathnameRef.current;

        // Run all 3 fetches concurrently with Promise.allSettled
        // so one failure doesn't block the others
        const [approvalsResult, inspectionsResult, importsResult] =
            await Promise.allSettled([
                approvalService.getPendingRequests(user.userId),
                grnService.getAllGRNs(),
                purchaseOrderService.getWaitingForArrivalPOs(),
            ]);

        // ── 1) Approvals ──
        if (approvalsResult.status === 'fulfilled') {
            const requests = approvalsResult.value.data || [];
            const currentIds = new Set(requests.map((r: any) => r.id));

            // Detect NEW approvals (skip initial load)
            if (!isInitialLoad.current) {
                const newRequests = requests.filter(
                    (r: any) => !prevApprovalIds.current.has(r.id)
                );
                if (newRequests.length > 0) {
                    if (soundEnabled) playNotificationSound();

                    const count = newRequests.length;
                    if (!currentPath.startsWith('/dashboard/approvals')) {
                        sendBrowserNotification(
                            'طلبات اعتماد جديدة',
                            count === 1
                                ? 'لديك طلب اعتماد جديد ينتظر مراجعتك'
                                : `لديك ${count} طلبات اعتماد جديدة`
                        );
                        toast(
                            count === 1
                                ? 'طلب اعتماد جديد'
                                : `${count} طلبات اعتماد جديدة`,
                            { icon: '🔔', duration: 5000, style: { fontWeight: 'bold' } }
                        );
                    }
                }
            }
            prevApprovalIds.current = currentIds;

            setCounts(prev => {
                if (prev.pendingApprovals === requests.length) return prev;
                return { ...prev, pendingApprovals: requests.length };
            });
        }

        // ── 2) Inspections ──
        if (inspectionsResult.status === 'fulfilled') {
            const grns = inspectionsResult.value;
            const currentCount = grns.filter(
                (g: any) => g.status === 'Pending Inspection'
            ).length;

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

            setCounts(prev => {
                if (prev.pendingInspections === currentCount) return prev;
                return { ...prev, pendingInspections: currentCount };
            });
        }

        // ── 3) Waiting Imports ──
        if (importsResult.status === 'fulfilled') {
            const waitingPOs = importsResult.value;
            setCounts(prev => {
                if (prev.waitingImports === waitingPOs.length) return prev;
                return { ...prev, waitingImports: waitingPOs.length };
            });
        }

        isInitialLoad.current = false;
    }, []);

    // ─── Adaptive scheduling loop ───
    const scheduleNext = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const interval = getInterval();
        timerRef.current = setTimeout(async () => {
            await fetchAll();
            scheduleNext(); // chain next tick
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