// Service Worker for handling notifications
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
                // Try to find an existing window
                for (const client of clientList) {
                    if (client.url === '/' || client.url.includes('/dashboard')) {
                        return client.focus().then(() => {
                            return client.navigate(route);
                        });
                    }
                }
                // If no window found, open a new one
                if (clients.openWindow) {
                    return clients.openWindow(route);
                }
            })
    );
});
