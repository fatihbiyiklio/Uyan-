import { useEffect, useState } from "react";
import { useLocation } from "../hooks/useLocation";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { getNextPrayer, formatTimeLeft } from "../utils/time";
import { PrayerTimeCard } from "./PrayerTimeCard";
import { Loader2, MapPin, AlertCircle } from "lucide-react";

import { useNotification } from "../hooks/useNotification";
import { useApp } from "../context/AppContext";
import { getSoundUrl } from "./SoundSelector";

export function Dashboard() {
    const { coords, loading: locLoading, error: locError, city } = useLocation();
    const { sound } = useApp();
    const { timings, date, loading: timesLoading, error: timesError } = usePrayerTimes({
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
    });

    const [timeLeft, setTimeLeft] = useState<string>("");
    const [nextPrayerName, setNextPrayerName] = useState<string>("");
    const { sendNotification } = useNotification();

    useEffect(() => {
        if (!timings) return;

        const timer = setInterval(() => {
            const next = getNextPrayer(timings);
            if (next) {
                setTimeLeft(formatTimeLeft(next.remainingSeconds));
                setNextPrayerName(next.name);

                // Exact moment trigger (0 seconds remaining)
                // We might miss exact 0 depending on interval drift, so checking <= 0 would trigger constantly.
                // Better: check if we just crossed 0? Or just checking == 0 is usually fine for 1s interval.
                if (next.remainingSeconds === 0) {
                    sendNotification(`${next.name} Vakti Girdi!`, { body: "Namaz vakti geldi." });
                    const audioUrl = getSoundUrl(sound);
                    new Audio(audioUrl).play().catch(e => console.log(e));
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timings, sendNotification, sound]);

    if (locLoading || timesLoading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Vakitler yükleniyor...</p>
            </div>
        );
    }

    if (locError || timesError) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center p-4">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-destructive font-medium">{locError || timesError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                    Tekrar De
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{city || "Konum Bekleniyor..."}</span>
                </div>
                <div>
                    {date?.gregorian.date} ({date?.hijri.day} {date?.hijri.month.en} {date?.hijri.year})
                </div>
            </div>

            {/* Countdown Hero */}
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <div className="text-lg font-medium text-muted-foreground">
                    {nextPrayerName} Vaktine Kalan
                </div>
                <div className="text-6xl font-bold tracking-tighter tabular-nums text-foreground">
                    {timeLeft || "--:--:--"}
                </div>
            </div>

            {/* Grid */}
            <div className="grid gap-3">
                {timings && (
                    <>
                        <PrayerTimeCard name="İmsak" time={timings.Fajr.split(' ')[0]} isNext={nextPrayerName === 'İmsak'} />
                        <PrayerTimeCard name="Güneş" time={timings.Sunrise.split(' ')[0]} isNext={nextPrayerName === 'Güneş'} />
                        <PrayerTimeCard name="Öğle" time={timings.Dhuhr.split(' ')[0]} isNext={nextPrayerName === 'Öğle'} />
                        <PrayerTimeCard name="İkindi" time={timings.Asr.split(' ')[0]} isNext={nextPrayerName === 'İkindi'} />
                        <PrayerTimeCard name="Akşam" time={timings.Maghrib.split(' ')[0]} isNext={nextPrayerName === 'Akşam'} />
                        <PrayerTimeCard name="Yatsı" time={timings.Isha.split(' ')[0]} isNext={nextPrayerName === 'Yatsı'} />
                    </>
                )}
            </div>
        </div>
    );
}
