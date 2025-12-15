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

    const response = await fetch(
        `${BASE_URL}/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${DIYANET_METHOD}`
    );

    if (!response.ok) {
        throw new Error("Konumdan namaz vakitleri alınamadı.");
    }

    return response.json();
}
