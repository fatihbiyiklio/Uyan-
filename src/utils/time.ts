import { parse, isAfter, differenceInSeconds, addDays } from 'date-fns';
import { PrayerTimes } from '../types/api';

export function getNextPrayer(timings: PrayerTimes): { name: string; time: string; remainingSeconds: number } | null {
    const now = new Date();
    const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
    const displayNames: Record<string, string> = {
        Fajr: 'İmsak',
        Sunrise: 'Güneş',
        Dhuhr: 'Öğle',
        Asr: 'İkindi',
        Maghrib: 'Akşam',
        Isha: 'Yatsı'
    };

    // Convert prayer times to Date objects
    const prayerDates = prayerNames.map(name => {
        // API returns HH:mm (24h)
        const timeString = timings[name as keyof PrayerTimes];
        // Remove (EEST) etc if present
        const cleanTime = timeString.split(' ')[0];
        const date = parse(cleanTime, 'HH:mm', now);
        return { name, displayName: displayNames[name], date, timeString: cleanTime };
    });

    // Find next prayer
    for (const prayer of prayerDates) {
        if (isAfter(prayer.date, now)) {
            return {
                name: prayer.displayName,
                time: prayer.timeString,
                remainingSeconds: differenceInSeconds(prayer.date, now)
            };
        }
    }

    // If no prayer left today, next is Fajr tomorrow
    // Fetching tomorrow's time is tricky without tomorrow's data. 
    // We can approximate or just point to 'İmsak' and calculate diff adding 1 day.
    // Ideally we should use tomorrow's data but for now let's assume similiar time.
    const fajr = prayerDates[0];
    const tomorrowFajr = addDays(fajr.date, 1);
    return {
        name: fajr.displayName,
        time: fajr.timeString,
        remainingSeconds: differenceInSeconds(tomorrowFajr, now)
    };
}

export function formatTimeLeft(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
