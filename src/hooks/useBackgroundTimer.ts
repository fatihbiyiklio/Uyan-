import { useEffect, useRef } from 'react';
import { usePrayerTimes } from './usePrayerTimes';
import { useApp } from '../context/AppContext';
import { getNextPrayer } from '../utils/time';
import { useNotification } from './useNotification';

export function useBackgroundTimer() {
    const { location } = useApp();
    const { timings } = usePrayerTimes({
        latitude: location.coords?.latitude ?? null,
        longitude: location.coords?.longitude ?? null
    });

    // Derive next prayer
    const nextPrayer = timings ? getNextPrayer(timings) : null;
    const { sendNotification } = useNotification();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initial setup of silent audio
    useEffect(() => {
        // Slightly longer silent audio to prevent rapid looping issues
        // 5 seconds of silence
        const silentAudio = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTS1UAAAAIAAABTGF2ZjU5LjE2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////8AAABMYXZjNTkuMTguMTAwAAAAAAAAAAAAAAJCCQAAAAAASAAAAAAAASAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA";

        const audio = new Audio(silentAudio);
        audio.loop = true;
        audioRef.current = audio;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
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

            // Update detailed position state (ProgressBar support for Android 13+ / iOS 16+)
            if (navigator.mediaSession.setPositionState) {
                navigator.mediaSession.setPositionState({
                    duration: 86400, // Arbitrary long duration
                    playbackRate: 1,
                    position: 0
                });
            }
        };

        const interval = setInterval(() => {
            // Forcing title update every second is the only way to "tick" on some lock screens
            // without seeking. 
            updateMetadata();
        }, 1000);

        updateMetadata();

        // Action handlers are required for controls to appear
        try {
            navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
            navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
            navigator.mediaSession.setActionHandler('stop', () => audioRef.current?.pause());
            navigator.mediaSession.setActionHandler('seekto', () => { }); // No-op but required for some UI
        } catch (e) { console.error(e); }

        return () => clearInterval(interval);
    }, [nextPrayer]);

    // Public method to start the engine
    const enableBackgroundMode = async () => {
        if (audioRef.current) {
            try {
                await audioRef.current.play();

                // Explicitly set playback state
                if ("mediaSession" in navigator) {
                    navigator.mediaSession.playbackState = "playing";
                }

                sendNotification("Arka Plan Modu Aktif", {
                    body: "Sayaç kilit ekranında çalışıyor."
                });

            } catch (e) {
                console.error("Background audio play failed:", e);
                alert("Arka plan modu için lütfen sayfaya dokunun.");
            }
        }
    };

    return { enableBackgroundMode };
}
