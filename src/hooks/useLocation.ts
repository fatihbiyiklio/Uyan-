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
        const fetchCityName = async (coords: Coords) => {
            try {
                console.log("Fetching city name for:", coords);
                const { getCityFromCoordinates } = await import("../services/geocoding");
                const cityName = await getCityFromCoordinates(coords.latitude, coords.longitude);
                console.log("City name fetched:", cityName);

                // Update Global State with City
                setLocation({
                    mode: 'auto',
                    coords,
                    city: cityName
                });

                setState(prev => ({
                    ...prev,
                    city: cityName,
                    loading: false
                }));
            } catch (e) {
                console.error("Failed to fetch city name:", e);
                setState(prev => ({
                    ...prev,
                    city: prev.city === "Konum Belirleniyor..." ? "Konum Algılandı" : prev.city,
                    loading: false
                }));
            }
        };

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

        // AUTO MODE LOGIC
        if (location.mode === 'auto' && location.coords) {
            // Already have coords? Check if we still have the placeholder city
            if (location.city === "Konum Belirleniyor..." || !location.city) {
                setState(prev => ({ ...prev, coords: location.coords, loading: true }));
                fetchCityName(location.coords);
            } else {
                setState({
                    coords: location.coords,
                    city: location.city,
                    error: null,
                    loading: false
                });
            }
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

        console.log("Requesting current position...");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const newCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                console.log("Current position received:", newCoords);

                // 1. Update Global State with placeholder
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
                    loading: true,
                    city: "Konum Belirleniyor..."
                }));

                // 3. Fetch city name
                fetchCityName(newCoords);
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
