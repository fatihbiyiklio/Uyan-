import { useEffect, useRef } from 'react';
import { usePrayerTimes } from './usePrayerTimes';
import { useApp } from '../context/AppContext';
import { getNextPrayer, formatTimeLeft } from '../utils/time';
import { useNotification } from './useNotification';

export function useBackgroundTimer() {
    const { location, backgroundKeepAlive } = useApp();
    const { timings } = usePrayerTimes({
        latitude: location.coords?.latitude ?? null,
        longitude: location.coords?.longitude ?? null
    });

    // Derive next prayer
    const nextPrayer = timings ? getNextPrayer(timings) : null;
    const { sendNotification } = useNotification();

    // Use AudioContext for more robust background execution
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const isPlayingRef = useRef(false);
    const notificationIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (!backgroundKeepAlive) {
            stopAudio();
            clearPersistentNotification();
        }
        return () => {
            // Cleanup on unmount only if we want to stop it when leaving component
            // But we want it persistent. However, if setting changes to false, we stop.
        };
    }, [backgroundKeepAlive]);

    // Initial check for AudioContext support
    useEffect(() => {
        return () => {
            // We don't necessarily want to stop on unmount if it's "background" mode, 
            // but for SPA navigations maybe we do? 
            // Actually, keep it alive unless setting changes.
        };
    }, []);

    // Effect to update Media Session Metadata
    useEffect(() => {
        if (!nextPrayer || !("mediaSession" in navigator)) return;

        const updateMetadata = () => {
            // Update textual information
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `${nextPrayer.name} Vaktine`,
                artist: `${formatTimeLeft(nextPrayer.remainingSeconds)} kaldı`,
                album: "Uyan! Namaz Vakitleri",
                artwork: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                ]
            });

            // Update detailed position state (ProgressBar)
            if (navigator.mediaSession.setPositionState) {
                navigator.mediaSession.setPositionState({
                    duration: 86400,
                    playbackRate: 1,
                    position: 0
                });
            }
        };

        const interval = setInterval(() => {
            updateMetadata();
        }, 1000);

        updateMetadata();

        // Action handlers
        try {
            navigator.mediaSession.setActionHandler('play', () => {
                // Resume context if suspended
                if (audioContextRef.current?.state === 'suspended') {
                    audioContextRef.current.resume();
                }
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                // Do nothing or suspend to save battery, but user wants "permanent"
                // so we might just keep it running.
            });
            navigator.mediaSession.setActionHandler('stop', () => stopAudio());
            navigator.mediaSession.setActionHandler('seekto', () => { });
        } catch (e) { console.error(e); }

        return () => clearInterval(interval);
    }, [nextPrayer]);

    const clearPersistentNotification = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const notifications = await registration.getNotifications({ tag: 'lock-screen-timer' });
                notifications.forEach(notification => notification.close());
            }
        } catch (e) {
            console.error("Failed to clear notification", e);
        }

        if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
            notificationIntervalRef.current = null;
        }
    };

    const stopAudio = () => {
        try {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
                oscillatorRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            isPlayingRef.current = false;
        } catch (e) { console.error("Error stopping audio", e); }
    };

    const updatePersistentNotification = async () => {
        if (!nextPrayer) {
            console.warn("Cannot update notification: no next prayer data");
            return;
        }

        console.log("Attempting to show persistent notification...");
        console.log("Next prayer:", nextPrayer.name, "Remaining:", nextPrayer.remainingSeconds);

        try {
            // Check if Service Workers are supported
            if (!('serviceWorker' in navigator)) {
                console.error("Service Workers not supported");
                return;
            }

            console.log("Waiting for Service Worker to be ready...");
            const registration = await navigator.serviceWorker.ready;

            if (!registration) {
                console.error("Service Worker registration is null");
                return;
            }

            console.log("Service Worker is ready:", registration);

            const timeLeft = formatTimeLeft(nextPrayer.remainingSeconds);

            // Build prayer times list for notification body
            const prayerTimesList = timings ? [
                `İmsak: ${timings.Fajr.split(' ')[0]}`,
                `Güneş: ${timings.Sunrise.split(' ')[0]}`,
                `Öğle: ${timings.Dhuhr.split(' ')[0]}`,
                `İkindi: ${timings.Asr.split(' ')[0]}`,
                `Akşam: ${timings.Maghrib.split(' ')[0]}`,
                `Yatsı: ${timings.Isha.split(' ')[0]}`
            ].join(' | ') : '';

            const notificationOptions: NotificationOptions = {
                body: `${nextPrayer.name}'a ${timeLeft} kaldı\n\n${prayerTimesList}`,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: 'lock-screen-timer',
                requireInteraction: true,
                silent: true,
                data: {
                    prayerName: nextPrayer.name,
                    remainingSeconds: nextPrayer.remainingSeconds,
                    timings: timings
                }
            };

            console.log("Calling showNotification with options:", notificationOptions);

            await registration.showNotification('🕌 Namaz Vakti Sayacı', notificationOptions);

            console.log("Notification shown successfully");

        } catch (e) {
            console.error("CRITICAL: Failed to update persistent notification:", e);
            console.error("Error details:", {
                message: e instanceof Error ? e.message : String(e),
                stack: e instanceof Error ? e.stack : undefined
            });
        }
    };

    // Public method to start the engine
    const enableBackgroundMode = async () => {
        if (!backgroundKeepAlive) return;

        if (isPlayingRef.current) {
            sendNotification("Arka Plan Modu Zaten Aktif", { body: "Sayaç çalışıyor.", silent: true });
            return;
        }

        // CRITICAL: Check notification permission first
        if (!("Notification" in window)) {
            alert("Tarayıcınız bildirimleri desteklemiyor.");
            return;
        }

        if (Notification.permission !== 'granted') {
            alert("Lütfen önce Ayarlar'dan bildirim iznini açın.");
            return;
        }

        try {
            // Create Context
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            const ctx = new AudioContextClass();
            audioContextRef.current = ctx;

            // Create Oscillator (silent but active)
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            // Very low gain, effectively silent but enough to keep hardware active
            gainNode.gain.value = 0.0001;

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillatorRef.current = oscillator;
            isPlayingRef.current = true;

            // Explicitly set playback state
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }

            // Start persistent notification
            await updatePersistentNotification();

            // Update notification every second
            notificationIntervalRef.current = window.setInterval(() => {
                updatePersistentNotification();
            }, 1000);

            sendNotification("Arka Plan Modu Aktif", {
                body: "Kilit ekranı sayacı başlatıldı.",
                silent: true
            });

        } catch (e) {
            console.error("Background audio start failed:", e);
            alert("Arka plan modu başlatılamadı.");
        }
    };

    return { enableBackgroundMode };
}
