import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

interface Coords {
    latitude: number;
    longitude: number;
}

interface LocationState {
    coords: Coords | null;
    error: string | null;
    loading: boolean;
    city?: string;
}

export function useLocation() {
    const { location } = useApp();
    const [state, setState] = useState<LocationState>({
        coords: location.coords,
        error: null,
        loading: location.mode === 'auto',
        city: location.city
    });

    useEffect(() => {
        // If manual mode, use stored data
        if (location.mode === 'manual') {
            setState({
                coords: location.coords,
                city: location.city,
                error: null,
                loading: false
            });
            return;
        }

        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: "Tarayıcınız konum özelliğini desteklemiyor.",
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const newCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                // Initial state with coords
                setState(prev => ({
                    ...prev,
                    coords: newCoords,
                    error: null,
                    loading: false,
                    city: prev.city || "Konum Belirleniyor..."
                }));

                // Fetch city name asynchronously
                try {
                    const { getCityFromCoordinates } = await import("../services/geocoding");
                    const cityName = await getCityFromCoordinates(newCoords.latitude, newCoords.longitude);
                    setState(prev => ({
                        ...prev,
                        city: cityName
                    }));

                    // Allow parent to see this city name in context if we wanted to persist it in auto mode,
                    // but usually we just keep it in local state for auto.
                    // Although the dashboard reads from hook state mixed with context?
                    // Wait, useLocation hook reads initial state from context but maintains its own state for active location.
                    // Dashboard uses `useLocation().city`.
                    // So updating state here is enough for Dashboard.
                } catch (e) {
                    // Ignore error, keep placeholder
                }
            },
            (error) => {
                let errorMessage = "Konum alınamadı.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Konum izni reddedildi.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Konum bilgisi mevcut değil.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Konum isteği zaman aşımına uğradı.";
                        break;
                }
                setState({
                    coords: null,
                    error: errorMessage,
                    loading: false,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    }, [location.mode, location.coords]);

    return state;
}
