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

    const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            new Notification(title, options);
        }
    }, [permission]);

    return { permission, requestPermission, sendNotification };
}
