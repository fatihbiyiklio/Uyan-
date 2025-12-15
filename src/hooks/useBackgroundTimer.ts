import { useEffect, useRef } from 'react';
import { usePrayerTimes } from './usePrayerTimes';
import { useApp } from '../context/AppContext';
import { getNextPrayer } from '../utils/time';
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

    useEffect(() => {
        if (!backgroundKeepAlive) {
            stopAudio();
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
                artist: `${nextPrayer.remainingSeconds} saniye kaldı`,
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

    // Public method to start the engine
    const enableBackgroundMode = async () => {
        if (!backgroundKeepAlive) return;

        if (isPlayingRef.current) {
            sendNotification("Arka Plan Modu Zaten Aktif", { body: "Sayaç çalışıyor." });
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

            sendNotification("Arka Plan Modu Aktif", {
                body: "Kilit ekranı sayacı başlatıldı."
            });

        } catch (e) {
            console.error("Background audio start failed:", e);
            alert("Arka plan modu başlatılamadı.");
        }
    };

    return { enableBackgroundMode };
}
