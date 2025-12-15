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

export async function getPrayerTimesByCoordinates(lat: number, lng: number): Promise<APIResponse> {
    // Get today's timestamp to avoid caching issues or ensuring we get for 'today'
    // Actually timings endpoint takes timestamp or defaults to today. 'timings' endpoint is simpler.
    // We use `timings/<date>` or just `timings` (which is current date)
    // Let's use `timings` endpoint with lat/lng

    // Get current date string DD-MM-YYYY if needed, but the endpoint handles 'current' if we use `timings`
    // Wait, there is `/timings/:date` endpoint.
    const date = Math.floor(Date.now() / 1000); // Unix timestamp

    const response = await fetch(
        `${BASE_URL}/timings/${date}?latitude=${lat}&longitude=${lng}&method=${DIYANET_METHOD}`
    );

    if (!response.ok) {
        throw new Error("Konumdan namaz vakitleri alınamadı.");
    }

    return response.json();
}
