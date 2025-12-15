import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Play, Check } from "lucide-react";

const SOUNDS = [
    { id: 'beep', name: 'Bip Sesi', url: '/sounds/beep.mp3' },
    { id: 'chime', name: 'Zil Sesi', url: '/sounds/chime.mp3' },
    { id: 'bird', name: 'Kuş Sesi', url: '/sounds/bird.mp3' },
    { id: 'water', name: 'Su Sesi', url: '/sounds/water.mp3' },
    { id: 'adhan_makkah', name: 'Ezan (Mekke)', url: '/sounds/adhan_makkah.mp3' },
    { id: 'adhan_sabah', name: 'Sabah Ezanı', url: '/sounds/adhan_madina.mp3' }, // Using Madina as softer/Sabah alternative
];

export function SoundSelector() {
    const { sound, setSound } = useApp();
    const [playing, setPlaying] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playPreview = (url: string, id: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        setPlaying(id);

        audio.play().catch(e => console.error("Audio play failed", e));

        audio.onended = () => {
            setPlaying(null);
        };
    };

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-medium">Bildirim Sesi</h3>
            <div className="grid grid-cols-1 gap-2">
                {SOUNDS.map((s) => (
                    <div
                        key={s.id}
                        className={`flex items-center justify-between p-3 rounded-md border transition-colors cursor-pointer ${sound === s.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                        onClick={() => setSound(s.id)}
                    >
                        <div className="flex items-center space-x-3">
                            <span className="font-medium">{s.name}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playPreview(s.url, s.id);
                                }}
                                className="p-2 rounded-full hover:bg-primary/10 text-primary"
                                title="Önizle"
                            >
                                <Play className={`h-4 w-4 ${playing === s.id ? "fill-current animate-pulse" : ""}`} />
                            </button>

                            {sound === s.id && (
                                <Check className="h-5 w-5 text-primary" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const getSoundUrl = (id: string) => {
    return SOUNDS.find(s => s.id === id)?.url || SOUNDS[0].url;
}
