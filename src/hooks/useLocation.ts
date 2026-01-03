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
    const { location, setLocation } = useApp();
    const [state, setState] = useState<LocationState>({
        coords: location.coords,
        error: null,
        loading: location.mode === 'auto' && !location.coords,
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

        // IMPORTANT: If we already have coords in auto mode, don't fetch again
        if (location.mode === 'auto' && location.coords) {
            setState({
                coords: location.coords,
                city: location.city || "Konum Algılandı",
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

                // 1. Update Global State
                setLocation({
                    mode: 'auto',
                    coords: newCoords,
                    city: "Konum Belirleniyor..."
                });

                // 2. Update Local State
                setState(prev => ({
                    ...prev,
                    coords: newCoords,
                    error: null,
                    loading: false,
                    city: "Konum Belirleniyor..."
                }));

                // Fetch city name asynchronously
                try {
                    const { getCityFromCoordinates } = await import("../services/geocoding");
                    const cityName = await getCityFromCoordinates(newCoords.latitude, newCoords.longitude);

                    // 3. Update Global State with City
                    setLocation({
                        mode: 'auto',
                        coords: newCoords,
                        city: cityName
                    });

                    setState(prev => ({
                        ...prev,
                        city: cityName
                    }));
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
    }, [location.mode, location.coords, setLocation]);

    return state;
}
