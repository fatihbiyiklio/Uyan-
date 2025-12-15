import { useEffect, useRef } from 'react';
import { usePrayerTimes } from './usePrayerTimes';
import { useApp } from '../context/AppContext';
import { getNextPrayer } from '../utils/time';

export function useBackgroundTimer() {
    const { location } = useApp();
    const { timings } = usePrayerTimes({
        latitude: location.coords?.latitude ?? null,
        longitude: location.coords?.longitude ?? null
    });

    // Derive next prayer
    const nextPrayer = timings ? getNextPrayer(timings) : null;

    // We use a silent audio element to keep the session alive
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create silent audio loop
        // Tiny base64 silent mp3
        const silentAudio = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTS1UAAAAIAAABTGF2ZjU5LjE2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD//////////////////////////////////////////////////////////////////8AAABMYXZjNTkuMTguMTAwAAAAAAAAAAAAAAJCCQAAAAAASAAAAAAAASAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAJAAAAAAAAAAASAAAAAAAASAAAIABBAAAAAAAAAAAAA";

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
            // navigator.mediaSession.metadata = new MediaMetadata(...) logic below
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `${nextPrayer.name} Vaktine Kalan`,
                artist: `Kalan Süre: ${nextPrayer.remainingSeconds} sn`, // Updated dynamically
                album: "Uyan! Namaz Vakitleri",
                artwork: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
                ]
            });
        };

        const interval = setInterval(() => {
            updateMetadata();
        }, 1000);

        updateMetadata();

        // Action handlers to keep it interactive/alive
        try {
            navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
            navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
        } catch (e) { console.error(e); }

        return () => clearInterval(interval);
    }, [nextPrayer]);

    // Public method to start the engine
    const enableBackgroundMode = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Background audio play failed (interaction needed)", e));
        }
    };

    return { enableBackgroundMode };
}
