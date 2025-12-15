import { useState, useEffect } from "react";
import { getPrayerTimesByCoordinates } from "../services/api";
import { PrayerTimes, HijriDate, GregorianDate } from "../types/api";

interface UsePrayerTimesProps {
    latitude: number | null;
    longitude: number | null;
}

interface PrayerTimesState {
    timings: PrayerTimes | null;
    date: {
        hijri: HijriDate;
        gregorian: GregorianDate;
    } | null;
    loading: boolean;
    error: string | null;
}

export function usePrayerTimes({ latitude, longitude }: UsePrayerTimesProps) {
    const [state, setState] = useState<PrayerTimesState>({
        timings: null,
        date: null,
        loading: false,
        error: null,
    });

    useEffect(() => {
        if (latitude === null || longitude === null) {
            return;
        }

        const fetchTimes = async () => {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            try {
                const response = await getPrayerTimesByCoordinates(latitude, longitude);
                setState({
                    timings: response.data.timings,
                    date: response.data.date,
                    loading: false,
                    error: null,
                });
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.",
                }));
            }
        };

        fetchTimes();
    }, [latitude, longitude]);

    return state;
}
