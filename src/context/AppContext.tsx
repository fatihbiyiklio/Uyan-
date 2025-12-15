import React, { createContext, useContext, useState, useEffect } from "react";

interface Coords {
    latitude: number;
    longitude: number;
}

interface LocationData {
    mode: 'auto' | 'manual';
    city?: string;
    country?: string;
    coords: Coords | null;
}

interface AppState {
    location: LocationData;
    themeColor: string;
    sound: string;
    setLocation: (data: LocationData) => void;
    setThemeColor: (color: string) => void;
    setSound: (sound: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [location, setLocationState] = useState<LocationData>(() => {
        // Load from local storage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('uyan_location');
            if (saved) return JSON.parse(saved);
        }
        return { mode: 'auto', coords: null };
    });

    const [themeColor, setThemeColorState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('uyan_theme_color');
            return saved || 'blue';
        }
        return 'blue';
    });

    const [sound, setSoundState] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('uyan_notification_sound') || 'beep';
        }
        return 'beep';
    });

    const setLocation = (data: LocationData) => {
        setLocationState(data);
        localStorage.setItem('uyan_location', JSON.stringify(data));
    };

    const setThemeColor = (color: string) => {
        setThemeColorState(color);
        localStorage.setItem('uyan_theme_color', color);
        // Update CSS variable for primary color
        updateThemeColor(color);
    };

    const setSound = (id: string) => {
        setSoundState(id);
        localStorage.setItem('uyan_notification_sound', id);
    };

    useEffect(() => {
        updateThemeColor(themeColor);
    }, [themeColor]);

    return (
        <AppContext.Provider value={{ location, themeColor, sound, setLocation, setThemeColor, setSound }}>
            {children}
        </AppContext.Provider>
    );
}

function updateThemeColor(color: string) {
    const root = document.documentElement;
    // Map of Friendly Name -> HSL values for --primary
    const colors: Record<string, string> = {
        blue: "221.2 83.2% 53.3%",
        green: "142.1 76.2% 36.3%",
        red: "346.8 77.2% 49.8%",
        violet: "262.1 83.3% 57.8%",
        orange: "24.6 95% 53.1%",
        gray: "220 9% 46%", // Zinc-500 like
    };

    // Also update ring
    const rings: Record<string, string> = {
        blue: "221.2 83.2% 53.3%",
        green: "142.1 76.2% 36.3%",
        red: "346.8 77.2% 49.8%",
        violet: "262.1 83.3% 57.8%",
        orange: "24.6 95% 53.1%",
        gray: "220 9% 46%",
    };

    if (colors[color]) {
        root.style.setProperty('--primary', colors[color]);
        root.style.setProperty('--ring', rings[color]);
    }
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
