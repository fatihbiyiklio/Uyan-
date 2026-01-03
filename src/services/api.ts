import { APIResponse } from "../types/api";

const BASE_URL = "https://api.aladhan.com/v1";

// Method 13 is Diyanet İşleri Başkanlığı, Turkey
const DIYANET_METHOD = 13;

export async function getPrayerTimesByCity(city: string, country: string = "Turkey"): Promise<APIResponse> {
    const response = await fetch(
        `${BASE_URL}/timingsByCity?city=${city}&country=${country}&method=${DIYANET_METHOD}`
    );

    if (!response.ok) {
        throw new Error("Namaz vakitleri alınamadı.");
    }

    return response.json();
}

export async function getPrayerTimesByCoordinates(lat: number, lng: number, dateObj: Date = new Date()): Promise<APIResponse> {
    // Aladhan API accepts Unix timestamp for specific dates
    const timestamp = Math.floor(dateObj.getTime() / 1000);

    // --- Caching Logic ---
    // Key format: prayer_times_{lat}_{lng}_{YYYY-MM-DD}
    // Round lat/lng to 4 decimals to allow slight GPS variance without breaking cache
    const dateKey = dateObj.toISOString().split('T')[0];
    const cacheKey = `prayer_times_${lat.toFixed(4)}_${lng.toFixed(4)}_${dateKey}`;

    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Cache parse error", e);
                localStorage.removeItem(cacheKey);
            }
        }
    }
    // ---------------------

    const response = await fetch(
        `${BASE_URL}/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${DIYANET_METHOD}`
    );

    if (!response.ok) {
        throw new Error("Konumdan namaz vakitleri alınamadı.");
    }

    const data = await response.json();

    // Save to cache
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
            // Quota exceeded or other storage error
            console.warn("Could not cache prayer times", e);
        }
    }

    return data;
}
