// Service Worker for handling notifications and background polling
let config = {
    accessToken: null,
    userId: null,
    apiUrl: null
};
let pollInterval = null;

// Helper to broadcast to all clients
const broadcast = async (channel, payload) => {
    const clientsList = await self.clients.matchAll();
    clientsList.forEach(client => {
        client.postMessage({ channel, payload });
    });
};

// Fetch logic moved to SW
const fetchCounts = async () => {
    if (!config.accessToken || !config.userId) return;
    const url = `${config.apiUrl}/approvals/pending?userId=${config.userId}`;
    if (!url.startsWith('http')) return;

    try {
        const response = await fetch(url, {
            mode: 'cors',
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            broadcast('auth_status', { authenticated: false });
            stopPolling();
            return;
        }
        if (!response.ok) return;

        const data = await response.json();
        const count = data.data?.length || 0;

        broadcast('notification_counts', {
            pendingApprovals: count,
            timestamp: Date.now()
        });
    } catch (_err) {
        // Failed to fetch — غالباً CORS أو عدم وصول الشبكة. تجاهل بصمت لتجنّب إزعاج المستخدم.
    }
};

const startPolling = (intervalMs = 30000) => {
    stopPolling();
    fetchCounts();
    pollInterval = setInterval(fetchCounts, intervalMs);
};

const stopPolling = () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
};

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('message', (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case 'INIT_AUTH':
        case 'UPDATE_AUTH':
            config = { ...config, ...payload };
            if (config.accessToken && config.userId) {
                startPolling(30000);
            } else {
                stopPolling();
            }
            break;
        case 'REQUEST_IMMEDIATE_FETCH':
            fetchCounts();
            break;
    }
});

self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};
    const options = {
        body: data.body || 'إشعار جديد',
        icon: '/logo.jpeg',
        badge: '/logo.jpeg',
        tag: data.tag || 'notification',
        data: {
            route: data.route || '/dashboard/approvals',
        },
    };
    event.waitUntil(
        self.registration.showNotification(data.title || 'نظام الإدارة', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const route = event.notification.data?.route || '/dashboard/approvals';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' || client.url.includes('/dashboard')) {
                        return client.focus().then(() => {
                            return client.navigate(route);
                        });
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(route);
                }
            })
    );
});
