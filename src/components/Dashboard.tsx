import { useEffect, useState, useRef } from "react";
import { useLocation } from "../hooks/useLocation";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { getNextPrayer, formatTimeLeft } from "../utils/time";
import { PrayerTimeCard } from "./PrayerTimeCard";
import { Loader2, MapPin, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNotification } from "../hooks/useNotification";
import { useApp } from "../context/AppContext";
import { getSoundUrl } from "./SoundSelector";
import { HadithCard } from "./HadithCard";
import { useBackgroundTimer } from "../hooks/useBackgroundTimer";

export function Dashboard() {
    const { coords, loading: locLoading, error: locError, city } = useLocation();
    const { sound, ramadanMode, enabledNotifications } = useApp();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Background Timer Hook
    const { enableBackgroundMode } = useBackgroundTimer();

    // Pass selectedDate to hook
    const { timings, date, loading: timesLoading, error: timesError } = usePrayerTimes({
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        date: selectedDate
    });

    const [timeLeft, setTimeLeft] = useState<string>("");
    const [nextPrayerName, setNextPrayerName] = useState<string>("");
    const { sendNotification } = useNotification();

    // Store the next prayer name to detect changes (which means a prayer time has entered)
    // Initialize with null to avoid triggering on first load
    const previousNextPrayerRef = useRef<string | null>(null);

    useEffect(() => {
        if (!timings) return;

        const timer = setInterval(() => {
            const now = new Date();
            // Verify if we are looking at today's prayer times
            const isTargetDateToday = selectedDate.toDateString() === now.toDateString();

            const next = getNextPrayer(timings);
            if (next) {
                setTimeLeft(formatTimeLeft(next.remainingSeconds));
                setNextPrayerName(next.name);

                // Check if the "next prayer" has changed. 
                // If it changed from "A" to "B", it means time "A" has just entered.
                if (isTargetDateToday && previousNextPrayerRef.current && previousNextPrayerRef.current !== next.name) {
                    const enteredPrayer = previousNextPrayerRef.current;
                    if (enabledNotifications[enteredPrayer]) {
                        sendNotification(`${enteredPrayer} Vakti Girdi!`, { body: "Namaz vakti geldi." });
                        const audioUrl = getSoundUrl(sound);
                        new Audio(audioUrl).play().catch(e => console.log(e));
                    }
                }

                previousNextPrayerRef.current = next.name;
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timings, sendNotification, sound, enabledNotifications, selectedDate]);

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
            <div className="flex flex-col items-center justify-center py-8 space-y-2 relative group"
                onClick={() => {
                    // Only navigate to settings if disabled, logic handled inside hook or wrapper 
                    // actually let's handle it here for better UX
                    if (!useApp().backgroundKeepAlive) {
                        alert("Bu özelliği kullanmak için lütfen Ayarlar'dan 'Kilit Ekranı Sayacı'nı açın.");
                        // Optional: could navigate to settings
                    } else {
                        enableBackgroundMode();
                    }
                }}>
                <div className="text-lg font-medium text-muted-foreground">
                    {ramadanMode && nextPrayerName === 'Akşam' ? 'İftara Kalan Süre' : `${nextPrayerName} Vaktine Kalan`}
                </div>
                <div className="text-6xl font-bold tracking-tighter tabular-nums text-foreground cursor-pointer select-none" title="Arka plan modunu aktifleştirmek için dokunun">
                    {timeLeft || "--:--:--"}
                </div>
                <p className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Kilit ekranında görmek için dokunun</p>
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
