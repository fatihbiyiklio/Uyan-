export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
}

export interface HijriDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
}

export interface GregorianDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
}

export interface APIResponse {
    code: number;
    status: string;
    data: {
        timings: PrayerTimes;
        date: {
            readable: string;
            timestamp: string;
            hijri: HijriDate;
            gregorian: GregorianDate;
        };
        meta: {
            latitude: number;
            longitude: number;
            timezone: string;
            method: {
                id: number;
                name: string;
                params: { Fajr: number; Isha: number };
            };
            latitudeAdjustmentMethod: string;
            midnightMode: string;
            school: string;
            offset: { [key: string]: number };
        };
    };
}
