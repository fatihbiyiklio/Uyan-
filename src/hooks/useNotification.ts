import { useState, useEffect, useCallback } from "react";

export function useNotification() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return;
        const result = await Notification.requestPermission();
        setPermission(result);
    }, []);

    const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            try {
                // Try to use Service Worker first (better for mobile)
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    if (registration) {
                        // showNotification requires the service worker to be active
                        await registration.showNotification(title, options);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Service Worker notification failed, falling back to standard API", e);
            }

            // Fallback to standard API
            new Notification(title, options);
        }
    }, [permission]);

    return { permission, requestPermission, sendNotification };
}
