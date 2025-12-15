import { useRef, useCallback } from "react";

export function useAudio(src: string) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const play = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(src);
        }
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }, [src]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    return { play, stop };
}
