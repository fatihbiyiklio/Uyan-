import { useEffect, useState } from "react";
import { useLocation } from "../hooks/useLocation";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { getNextPrayer, formatTimeLeft } from "../utils/time";
import { PrayerTimeCard } from "./PrayerTimeCard";
import { Loader2, MapPin, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

import { useNotification } from "../hooks/useNotification";
import { useApp } from "../context/AppContext";
import { getSoundUrl } from "./SoundSelector";
import { HadithCard } from "./HadithCard";

export function Dashboard() {
    const { coords, loading: locLoading, error: locError, city } = useLocation();
    const { sound, ramadanMode } = useApp();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Pass selectedDate to hook
    const { timings, date, loading: timesLoading, error: timesError } = usePrayerTimes({
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        date: selectedDate
    });

    const [timeLeft, setTimeLeft] = useState<string>("");
    const [nextPrayerName, setNextPrayerName] = useState<string>("");
    const { sendNotification } = useNotification();

    useEffect(() => {
        if (!timings) return;

        const timer = setInterval(() => {
            // Only calculate countdown for 'today' to avoid confusion, or handle next dat logic.
            // For simplicity, if selectedDate is not today, we might show "vakit geçti" or just static times.
            // But let's keep countdown running based on loaded timings.

            const next = getNextPrayer(timings);
            if (next) {
                setTimeLeft(formatTimeLeft(next.remainingSeconds));
                setNextPrayerName(next.name);

                if (next.remainingSeconds === 0) {
                    sendNotification(`${next.name} Vakti Girdi!`, { body: "Namaz vakti geldi." });
                    const audioUrl = getSoundUrl(sound);
                    new Audio(audioUrl).play().catch(e => console.log(e));
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timings, sendNotification, sound]);

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const isToday = selectedDate.toDateString() === new Date().toDateString();

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
                    Tekrar Dene
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

                <div className="flex items-center space-x-2">
                    <button onClick={() => changeDate(-1)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className={!isToday ? "font-bold text-primary" : ""}>
                        {date?.gregorian.date || "Tarih"}
                    </span>
                    <button onClick={() => changeDate(1)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Countdown Hero */}
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <div className="text-lg font-medium text-muted-foreground">
                    {ramadanMode && nextPrayerName === 'Akşam' ? 'İftara Kalan Süre' : `${nextPrayerName} Vaktine Kalan`}
                </div>
                <div className="text-6xl font-bold tracking-tighter tabular-nums text-foreground">
                    {timeLeft || "--:--:--"}
                </div>
            </div>

            <div className="px-1">
                <HadithCard />
            </div>

            {/* Grid */}
            <div className="grid gap-3">
                {timings && (
                    <>
                        <PrayerTimeCard name="İmsak" time={timings.Fajr.split(' ')[0]} isNext={nextPrayerName === 'İmsak'} />
                        <PrayerTimeCard name="Güneş" time={timings.Sunrise.split(' ')[0]} isNext={nextPrayerName === 'Güneş'} />
                        <PrayerTimeCard name="Öğle" time={timings.Dhuhr.split(' ')[0]} isNext={nextPrayerName === 'Öğle'} />
                        <PrayerTimeCard name="İkindi" time={timings.Asr.split(' ')[0]} isNext={nextPrayerName === 'İkindi'} />
                        <PrayerTimeCard name={ramadanMode ? "İftar" : "Akşam"} time={timings.Maghrib.split(' ')[0]} isNext={nextPrayerName === 'Akşam'} />
                        <PrayerTimeCard name={ramadanMode ? "Teravih" : "Yatsı"} time={timings.Isha.split(' ')[0]} isNext={nextPrayerName === 'Yatsı'} />
                    </>
                )}
            </div>
        </div>
    );
}
